import type { User } from "../hooks/AuthContext";
import { apiClient, resolveApiUrl } from "./api.client";

const ensureTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value : `${value}/`;

const BLOG_ASSETS_BASE_URL = ensureTrailingSlash(
  (
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_BLOG_ASSETS_BASE_URL?.trim()) ||
    "https://level-up-gamer.s3.amazonaws.com/"
  )
);

export interface ProductSeller {
  id: number;
  name: string;
  email: string;
  corporate: boolean;
}

export interface Product {
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  stockCritical?: number;
  category: string;
  image: string;
  images?: string[];
  pointsLevelUp?: number;
  active?: boolean;
  seller?: ProductSeller;
}

export interface Blog {
  id: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
  author: string;
  date: string;
  content_path: string;
}

export interface Region {
  codigo: string;
  nombre: string;
}

export interface Commune {
  codigo: string;
  nombre: string;
}

interface CategoryDTO {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface SellerDTO {
  id: number;
  nombre: string;
  correo: string;
  corporativo: boolean;
}

// Product DTO from Backend
interface ProductDTO {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockCritico?: number;
  categoria: string | CategoryDTO;
  imagenes: string[];
  puntosLevelUp?: number;
  activo: boolean;
  vendedor?: SellerDTO;
}

// Blog DTO from Backend
interface BlogDTO {
  id: number;
  titulo: string;
  autor: string;
  fechaPublicacion: string;
  descripcionCorta: string;
  contenidoUrl: string;
  imagenUrl: string;
  altImagen: string;
}

const stripProtocolAndLeadingSlash = (path: string): string =>
  path
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^\/+/g, "")
    .trim();

const normalizeBlogAssetPath = (
  rawPath: string,
  blogId?: number,
  type: "content" | "image" = "image"
): string => {
  if (!rawPath) {
    return "";
  }

  const sanitized = stripProtocolAndLeadingSlash(rawPath);

  if (!blogId) {
    return sanitized;
  }

  const blogFolder = `blogs/${blogId}/`;

  if (sanitized.startsWith(blogFolder)) {
    return sanitized;
  }

  if (type === "content") {
    const extensionMatch = sanitized.match(/\.[a-z0-9]+$/i);
    const extension = extensionMatch ? extensionMatch[0] : ".md";
    return `${blogFolder}blog${extension}`;
  }

  const fileName =
    sanitized
      .split("/")
      .filter(Boolean)
      .pop() || `blog${blogId}.png`;

  return `${blogFolder}${fileName}`;
};

const resolveBlogAssetUrl = (
  rawPath: string,
  blogId: number,
  type: "content" | "image"
): string => {
  if (!rawPath) {
    return "";
  }

  try {
    return new URL(rawPath).toString();
  } catch {
    const normalizedPath = normalizeBlogAssetPath(rawPath, blogId, type);
    if (!normalizedPath) {
      return "";
    }
    return new URL(normalizedPath, BLOG_ASSETS_BASE_URL).toString();
  }
};

// Mappers
const mapProductDTOtoProduct = (dto: ProductDTO): Product => {
  const images = dto.imagenes ?? [];
  const categoryName =
    typeof dto.categoria === "string"
      ? dto.categoria
      : dto.categoria?.nombre ?? "Sin categoría";

  return {
    code: dto.codigo,
    name: dto.nombre,
    description: dto.descripcion,
    price: dto.precio,
    stock: dto.stock,
    stockCritical: dto.stockCritico,
    category: categoryName,
    image: images[0] ?? "placeholder.jpg",
    images,
    originalPrice: undefined,
    pointsLevelUp: dto.puntosLevelUp,
    active: dto.activo,
    seller: dto.vendedor
      ? {
          id: dto.vendedor.id,
          name: dto.vendedor.nombre,
          email: dto.vendedor.correo,
          corporate: dto.vendedor.corporativo ?? false,
        }
      : undefined,
  };
};

const mapBlogDTOtoBlog = (dto: BlogDTO): Blog => {
  const imageUrl = resolveBlogAssetUrl(dto.imagenUrl, dto.id, "image");
  const contentUrl = resolveBlogAssetUrl(dto.contenidoUrl, dto.id, "content");

  return {
    id: dto.id.toString(),
    title: dto.titulo,
    image: imageUrl || "https://placehold.co/1200x600?text=Blog",
    alt: dto.altImagen,
    summary: dto.descripcionCorta,
    author: dto.autor,
    date: dto.fechaPublicacion,
    content_path: contentUrl,
  };
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<ProductDTO[]>("products");
    return response.data.map(mapProductDTOtoProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  try {
    const products = await getProducts();
    return products.find((p) => p.code === id);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return undefined;
  }
};

export const getBlogPosts = async (): Promise<Blog[]> => {
  try {
    const response = await apiClient.get<BlogDTO[]>("blog-posts");
    return response.data.map(mapBlogDTOtoBlog);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

export const getBlogPostById = async (
  id: string
): Promise<Blog | undefined> => {
  try {
    const blogs = await getBlogPosts();
    return blogs.find((b) => b.id === id);
  } catch (error) {
    console.error("Error fetching blog post by id:", error);
    return undefined;
  }
};

export const authenticateUser = async (
  email: string,
  password: string,
  role: string
): Promise<User> => {
  try {
    const loginPayload = {
      correo: email,
      contrasena: password,
      rol: role,
    };
    const loginResponse = await apiClient.post<any>("auth/login", loginPayload);
    const { accessToken, usuarioId } = loginResponse.data;

    const userResponse = await apiClient.get<any>(`users/${usuarioId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = userResponse.data;

    const user: User = {
      id: usuarioId.toString(),
      name: userData.nombre,
      lastName: userData.apellidos,
      email: userData.correo,
      run: userData.run,
      birthdate: userData.fechaNacimiento,
      address: userData.direccion,
      region: userData.region,
      commune: userData.comuna,
      role: role,
      token: accessToken,
    };

    return user;
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.response) {
      console.error("Server Error Data:", error.response.data);
      console.error("Server Error Status:", error.response.status);
    }
    throw error;
  }
};

export const getBlogContent = async (path: string): Promise<string> => {
  if (!path) {
    throw new Error("No blog content path provided");
  }
  const resolvedPath = resolveApiUrl(path);
  if (!resolvedPath) {
    throw new Error("Unable to resolve blog content path");
  }
  const response = await fetch(resolvedPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch blog content from ${resolvedPath}`);
  }
  return await response.text();
};

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export const loadJSONP = <T>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
    const script = document.createElement("script");

    window[callbackName] = (data: T) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error(`JSONP request to ${url} failed`));
    };

    script.src = `${url}${
      url.includes("?") ? "&" : "?"
    }callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

export const getRegions = (): Promise<Region[]> => {
  return loadJSONP<Region[]>("https://apis.digital.gob.cl/dpa/regiones");
};

export const getCommunesByRegion = (regionCode: string): Promise<Commune[]> => {
  return loadJSONP<Commune[]>(
    `https://apis.digital.gob.cl/dpa/regiones/${regionCode}/comunas`
  );
};
