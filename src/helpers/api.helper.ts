import type { User } from "../hooks/AuthContext";
import type { CartItem } from "../hooks/CartContext";
import { apiClient, resolveApiUrl } from "./api.client";

const ensureTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value : `${value}/`;

const toAbsoluteUrl = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }
  const resolved = resolveApiUrl(path);
  return resolved || path;
};

const BLOG_ASSETS_BASE_URL = ensureTrailingSlash(
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_BLOG_ASSETS_BASE_URL?.trim()) ||
    "https://level-up-gamer.s3.amazonaws.com/"
);

export interface ProductSeller {
  id: number;
  name: string;
  email: string;
  corporate: boolean;
}

export interface Product {
  id: number;
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

export interface CreateProductPayload {
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  stockCritical?: number;
  pointsLevelUp?: number;
  active?: boolean;
}

export interface ProductReview {
  id: number;
  productId: number;
  rating: number;
  text: string;
  userName: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: number;
  text: string;
  rating: number;
}

export interface OrderDetail {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  number?: string;
  issuedAt?: string;
  total: number;
  details: OrderDetail[];
}

export interface CreateOrderDetailPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  clientId: number;
  total: number;
  details: CreateOrderDetailPayload[];
  couponId?: number;
  couponCode?: string;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  stockCritical?: number;
  category?: string;
  image?: string;
  pointsLevelUp?: number;
  active?: boolean;
  sellerId?: number | null;
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

interface CartItemDTO {
  productId: number;
  productCode?: string;
  productName: string;
  price: number;
  quantity: number;
  productImageUrl?: string;
}

interface CartDTO {
  id: number;
  items: CartItemDTO[];
  total: number;
}

interface ReviewDTO {
  id: number;
  productoId?: number;
  productId?: number;
  texto?: string;
  text?: string;
  calificacion?: number;
  rating?: number;
  nombreUsuario?: string;
  userName?: string;
  createdAt?: string;
  fechaCreacion?: string;
}

interface BoletaDetalleDTO {
  productoId?: number;
  productId?: number;
  productoNombre?: string;
  productName?: string;
  producto?: { id?: number; nombre?: string };
  cantidad?: number;
  quantity?: number;
  unidades?: number;
  precioUnitario?: number;
  unitPrice?: number;
  precio?: number;
}

interface BoletaDTO {
  id: number;
  numero?: string;
  number?: string;
  codigo?: string;
  fechaEmision?: string;
  fecha?: string;
  createdAt?: string;
  total?: number;
  montoTotal?: number;
  detalles?: BoletaDetalleDTO[];
  details?: BoletaDetalleDTO[];
}

interface UserDTO {
  id?: number;
  usuarioId?: number;
  nombre?: string;
  name?: string;
  apellidos?: string;
  lastName?: string;
  correo?: string;
  email?: string;
  rol?: string;
  role?: string;
}

interface LoginResponseDTO {
  accessToken: string;
  refreshToken?: string;
  usuarioId: number;
}

interface UserProfileDTO {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  run: string;
  fechaNacimiento: string;
  direccion: string;
  region: string;
  comuna: string;
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
    sanitized.split("/").filter(Boolean).pop() || `blog${blogId}.png`;

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

const mapReviewDTOToReview = (dto: ReviewDTO): ProductReview => ({
  id: dto.id,
  productId: dto.productId ?? dto.productoId ?? 0,
  rating: dto.rating ?? dto.calificacion ?? 0,
  text: dto.text ?? dto.texto ?? "",
  userName: dto.userName ?? dto.nombreUsuario ?? "Usuario",
  createdAt: dto.createdAt ?? dto.fechaCreacion ?? new Date().toISOString(),
});

const mapOrderDetailDTO = (dto: BoletaDetalleDTO): OrderDetail => ({
  productId: dto.productId ?? dto.productoId ?? dto.producto?.id ?? 0,
  productName:
    dto.productName ?? dto.productoNombre ?? dto.producto?.nombre ?? "Producto",
  quantity: dto.quantity ?? dto.cantidad ?? dto.unidades ?? 0,
  unitPrice: dto.unitPrice ?? dto.precioUnitario ?? dto.precio ?? 0,
});

const mapBoletaDTOToOrder = (dto: BoletaDTO): Order => ({
  id: dto.id,
  number: dto.numero ?? dto.number ?? dto.codigo,
  issuedAt: dto.fechaEmision ?? dto.fecha ?? dto.createdAt,
  total: dto.total ?? dto.montoTotal ?? 0,
  details: (dto.detalles ?? dto.details ?? []).map(mapOrderDetailDTO),
});

const buildFullName = (nombre?: string, apellidos?: string): string => {
  const parts = [nombre ?? "", apellidos ?? ""]
    .map((value) => value?.trim())
    .filter(Boolean);
  return parts.join(" ") || nombre || apellidos || "Usuario";
};

const mapUserDTOToSummary = (dto: UserDTO): UserSummary => ({
  id: Number(dto.id ?? dto.usuarioId ?? 0),
  fullName: buildFullName(
    dto.nombre ?? dto.name,
    dto.apellidos ?? dto.lastName
  ),
  email: dto.correo ?? dto.email ?? "",
  role: (dto.rol ?? dto.role ?? "CLIENTE").toUpperCase(),
});

const serializeProductUpdatePayload = (
  payload: ProductUpdatePayload
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    body.nombre = payload.name;
  }

  if (payload.description !== undefined) {
    body.descripcion = payload.description;
  }

  if (payload.price !== undefined) {
    body.precio = payload.price;
  }

  if (payload.stock !== undefined) {
    body.stock = payload.stock;
  }

  if (payload.stockCritical !== undefined) {
    body.stockCritico = payload.stockCritical;
  }

  if (payload.category !== undefined) {
    body.categoria = payload.category;
  }

  if (payload.image !== undefined) {
    body.imagenPrincipal = payload.image;
  }

  if (payload.pointsLevelUp !== undefined) {
    body.puntosLevelUp = payload.pointsLevelUp;
  }

  if (payload.active !== undefined) {
    body.activo = payload.active;
  }

  if (payload.sellerId !== undefined) {
    body.vendedorId = payload.sellerId;
  }

  return body;
};

// Mappers
const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x600?text=Producto";

const mapProductDTOtoProduct = (dto: ProductDTO): Product => {
  const images = dto.imagenes ?? [];
  const resolvedImages = images
    .map((img) => toAbsoluteUrl(img))
    .filter((img): img is string => Boolean(img));
  const categoryName =
    typeof dto.categoria === "string"
      ? dto.categoria
      : dto.categoria?.nombre ?? "Sin categoría";

  return {
    id: dto.id,
    code: dto.codigo,
    name: dto.nombre,
    description: dto.descripcion,
    price: dto.precio,
    stock: dto.stock,
    stockCritical: dto.stockCritico,
    category: categoryName,
    image: resolvedImages[0] ?? DEFAULT_PRODUCT_IMAGE,
    images: resolvedImages,
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

const productNameCollator = new Intl.Collator("es", { sensitivity: "base" });

export const sortProductsByIdAndName = (list: Product[]): Product[] =>
  list.sort((a, b) => {
    const idDiff = (a.id ?? 0) - (b.id ?? 0);
    if (idDiff !== 0) {
      return idDiff;
    }

    const nameA = a.name ?? "";
    const nameB = b.name ?? "";
    return productNameCollator.compare(nameA, nameB);
  });

const mapCreateProductPayloadToRequest = (
  payload: CreateProductPayload
): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    codigo: payload.code,
    nombre: payload.name,
    descripcion: payload.description,
    categoria: payload.category,
    precio: payload.price,
    stock: payload.stock,
    activo: payload.active ?? true,
  };

  if (payload.stockCritical !== undefined) {
    body.stockCritico = payload.stockCritical;
  }

  if (payload.pointsLevelUp !== undefined) {
    body.puntosLevelUp = payload.pointsLevelUp;
  }

  return body;
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

type CartImageOverrides = Record<number, string>;

const mapCartItemDTOToCartItem = (
  dto: CartItemDTO,
  overrides: CartImageOverrides = {}
): CartItem => ({
  id: dto.productCode ?? dto.productId.toString(),
  productId: dto.productId,
  name: dto.productName,
  price: dto.price,
  quantity: dto.quantity,
  image: dto.productImageUrl
    ? resolveApiUrl(dto.productImageUrl)
    : overrides[dto.productId] ?? DEFAULT_PRODUCT_IMAGE,
});

const mapCartDTOToCartItems = (
  dto: CartDTO,
  overrides: CartImageOverrides = {}
): CartItem[] =>
  dto.items?.map((item) => mapCartItemDTOToCartItem(item, overrides)) ?? [];

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get<ProductDTO[]>("products");
    const mapped = response.data.map(mapProductDTOtoProduct);
    return sortProductsByIdAndName(mapped);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const createProduct = async (
  payload: CreateProductPayload,
  imageFile?: File
): Promise<Product> => {
  try {
    const formData = new FormData();
    const productBody = mapCreateProductPayloadToRequest(payload);
    const productBlob = new Blob([JSON.stringify(productBody)], {
      type: "application/json",
    });

    formData.append("producto", productBlob);

    if (imageFile) {
      formData.append("imagen", imageFile);
    }

    const response = await apiClient.post<ProductDTO>("products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return mapProductDTOtoProduct(response.data);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  try {
    if (!id) {
      return undefined;
    }

    if (/^\d+$/.test(id)) {
      return getProductByBackendId(Number(id));
    }

    const products = await getProducts();
    return products.find((p) => p.code === id);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return undefined;
  }
};

export const getProductByBackendId = async (
  backendId: number
): Promise<Product | undefined> => {
  if (!backendId && backendId !== 0) {
    return undefined;
  }

  try {
    const response = await apiClient.get<ProductDTO>(`products/${backendId}`);
    return mapProductDTOtoProduct(response.data);
  } catch (error) {
    console.error("Error fetching product by backend id:", error);
    return undefined;
  }
};

export const getProductReviews = async (
  productId: number
): Promise<ProductReview[]> => {
  if (!productId) {
    return [];
  }

  try {
    const response = await apiClient.get<ReviewDTO[]>(
      `products/${productId}/reviews`
    );
    return response.data?.map(mapReviewDTOToReview) ?? [];
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }
};

export const createProductReview = async (
  payload: CreateReviewPayload
): Promise<ProductReview> => {
  try {
    const requestBody = {
      productoId: payload.productId,
      texto: payload.text?.trim(),
      calificacion: payload.rating,
    };
    const response = await apiClient.post<ReviewDTO>("reviews", requestBody);
    return mapReviewDTOToReview(response.data);
  } catch (error) {
    console.error("Error creating product review:", error);
    throw error;
  }
};

export const updateProduct = async (
  productId: number,
  payload: ProductUpdatePayload
): Promise<Product | undefined> => {
  if (!productId) {
    return undefined;
  }

  const body = serializeProductUpdatePayload(payload);
  if (!Object.keys(body).length) {
    console.warn("No se proporcionaron campos para actualizar el producto");
    return undefined;
  }

  try {
    const response = await apiClient.put<ProductDTO>(
      `products/${productId}`,
      body
    );
    return mapProductDTOtoProduct(response.data);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId: number): Promise<void> => {
  if (!productId) {
    return;
  }

  try {
    await apiClient.delete(`products/${productId}`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const fetchUserCart = async (
  userId: string,
  overrides?: CartImageOverrides
): Promise<CartItem[]> => {
  if (!userId) {
    return [];
  }

  try {
    const response = await apiClient.get<CartDTO>(`cart/${userId}`);
    return mapCartDTOToCartItems(response.data, overrides);
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return [];
  }
};

export const addProductToCartApi = async (
  userId: string,
  productId: number,
  quantity = 1,
  overrides?: CartImageOverrides
): Promise<CartItem[]> => {
  if (!userId || !productId) {
    return [];
  }

  try {
    const response = await apiClient.post<CartDTO>(`cart/${userId}/add`, null, {
      params: { productId, quantity },
    });
    return mapCartDTOToCartItems(response.data, overrides);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    throw error;
  }
};

export const removeProductFromCartApi = async (
  userId: string,
  productId: number,
  overrides?: CartImageOverrides
): Promise<CartItem[]> => {
  if (!userId || !productId) {
    return [];
  }

  try {
    const response = await apiClient.delete<CartDTO>(`cart/${userId}/remove`, {
      params: { productId },
    });
    return mapCartDTOToCartItems(response.data, overrides);
  } catch (error) {
    console.error("Error removing product from cart:", error);
    throw error;
  }
};

export const setCartItemQuantityApi = async (
  userId: string,
  productId: number,
  quantity: number,
  overrides?: CartImageOverrides
): Promise<CartItem[]> => {
  if (!userId || !productId) {
    return [];
  }

  if (quantity <= 0) {
    return removeProductFromCartApi(userId, productId, overrides);
  }

  await removeProductFromCartApi(userId, productId, overrides);
  return addProductToCartApi(userId, productId, quantity, overrides);
};

export const clearUserCartApi = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }

  try {
    await apiClient.delete(`cart/${userId}`);
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) {
    return [];
  }

  try {
    const response = await apiClient.get<BoletaDTO[]>(`boletas/user/${userId}`);
    return response.data?.map(mapBoletaDTOToOrder) ?? [];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

const serializeBoletaPayload = (payload: CreateOrderPayload) => {
  const body: Record<string, unknown> = {
    cliente: payload.clientId,
    total: Number(payload.total.toFixed(2)),
    detalles: payload.details.map((detail) => ({
      productoId: detail.productId,
      cantidad: detail.quantity,
    })),
  };

  if (payload.couponId !== undefined) {
    body.cuponId = payload.couponId;
  }

  if (payload.couponCode) {
    body.codigoCupon = payload.couponCode;
  }

  return body;
};

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<Order> => {
  if (!payload.clientId) {
    throw new Error("Debe indicar un cliente para generar la boleta");
  }

  if (!payload.details?.length) {
    throw new Error("No se puede crear una boleta sin productos");
  }

  try {
    const response = await apiClient.post<BoletaDTO>(
      "boletas",
      serializeBoletaPayload(payload)
    );
    return mapBoletaDTOToOrder(response.data);
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getUsers = async (): Promise<UserSummary[]> => {
  try {
    const response = await apiClient.get<UserDTO[]>("users");
    return response.data?.map(mapUserDTOToSummary) ?? [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getSellers = async (): Promise<UserSummary[]> => {
  const users = await getUsers();
  return users.filter((user) => user.role === "VENDEDOR");
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
  if (!id) {
    return undefined;
  }
  try {
    const response = await apiClient.get<BlogDTO>(`blog-posts/${id}`);
    return mapBlogDTOtoBlog(response.data);
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
    const loginResponse = await apiClient.post<LoginResponseDTO>(
      "auth/login",
      loginPayload
    );
    const { accessToken, usuarioId } = loginResponse.data;

    const userResponse = await apiClient.get<UserProfileDTO>(
      `users/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
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
  } catch (error: unknown) {
    console.error("Login error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object"
    ) {
      const response = (
        error as { response?: { data?: unknown; status?: unknown } }
      ).response;
      if (response) {
        console.error("Server Error Data:", response.data);
        console.error("Server Error Status:", response.status);
      }
    }
    throw error;
  }
};

const fetchBlogContentFromEndpoint = async (
  blogId: string
): Promise<string | null> => {
  if (!blogId) {
    return null;
  }

  try {
    const response = await apiClient.get<string>(
      `blog-posts/${blogId}/content`,
      {
        responseType: "text",
        transformResponse: (data) => data,
        headers: {
          Accept: "text/markdown, text/plain, text/html, */*",
        },
      }
    );
    return typeof response.data === "string"
      ? response.data
      : response.data != null
      ? String(response.data)
      : "";
  } catch (error) {
    console.error("Error fetching blog content via endpoint:", error);
    return null;
  }
};

const fetchBlogContentFromPath = async (path: string): Promise<string> => {
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

export const getBlogContent = async (
  blogId: string,
  fallbackPath?: string
): Promise<string> => {
  const contentFromApi = await fetchBlogContentFromEndpoint(blogId);
  if (contentFromApi !== null) {
    return contentFromApi;
  }

  if (!fallbackPath) {
    throw new Error("Unable to obtain blog content without a fallback path");
  }

  return fetchBlogContentFromPath(fallbackPath);
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
