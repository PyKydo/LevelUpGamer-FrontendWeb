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

const logApiHelperError = (context: string, error: unknown): void => {
  if (
    typeof console === "undefined" ||
    (typeof import.meta !== "undefined" &&
      import.meta.env?.MODE === "production")
  ) {
    return;
  }
  console.error(`[api.helper] ${context}`, error);
};

const logAndReturn = <T>(context: string, error: unknown, fallback: T): T => {
  logApiHelperError(context, error);
  return fallback;
};

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
  categoryId?: number;
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
  category?: string;
  categoryId?: number;
  price: number;
  stock: number;
  stockCritical?: number;
  pointsLevelUp?: number;
  active?: boolean;
}

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface CreateCategoryPayload {
  code: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateCategoryPayload {
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ProductReview {
  id: number;
  productId: number;
  rating: number;
  text: string;
  userName: string;
  createdAt: string;
  productName?: string;
  visible?: boolean;
}

export interface CreateReviewPayload {
  productId: number;
  text: string;
  rating: number;
}

export interface UpdateReviewPayload {
  text?: string;
  rating?: number;
  visible?: boolean;
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
  status?: string;
  clientId?: number;
  clientName?: string;
  clientEmail?: string;
  couponCode?: string;
  pointsAwarded?: number;
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

export interface UserDetail {
  id: number;
  run?: string;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  birthdate?: string;
  address?: string;
  region?: string;
  commune?: string;
  role: string;
}

export interface CreateUserPayload {
  run: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  birthdate: string;
  region: string;
  commune: string;
  address: string;
  role: string;
  referralCode?: string;
}

export interface UpdateUserPayload {
  name?: string;
  lastName?: string;
  region?: string;
  commune?: string;
  address?: string;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  stockCritical?: number;
  category?: string;
  categoryId?: number;
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

export interface AdminBlog {
  id: number;
  title: string;
  author: string;
  summary: string;
  publishedAt: string;
  contentPath: string;
  imagePath?: string;
  altText?: string;
  imageUrl: string;
  contentUrl: string;
}

export interface CreateBlogPayload {
  title: string;
  author: string;
  summary: string;
  publishedAt: string;
  contentPath: string;
  imagePath?: string;
  altText?: string;
}

export interface UpdateBlogPayload {
  title?: string;
  author?: string;
  summary?: string;
  publishedAt?: string;
  contentPath?: string;
  imagePath?: string;
  altText?: string;
}

export interface Region {
  codigo: string;
  nombre: string;
}

export interface Commune {
  codigo: string;
  nombre: string;
}

export interface GetProductsOptions {
  includeInactive?: boolean;
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
  productoNombre?: string;
  productName?: string;
  texto?: string;
  text?: string;
  calificacion?: number;
  rating?: number;
  nombreUsuario?: string;
  userName?: string;
  createdAt?: string;
  fechaCreacion?: string;
  visible?: boolean;
  aprobado?: boolean;
  estado?: string;
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
  subtotal?: number;
  total?: number;
  monto?: number;
}

interface BoletaClientDTO {
  id?: number;
  usuarioId?: number;
  nombre?: string;
  name?: string;
  apellidos?: string;
  lastName?: string;
  fullName?: string;
  nombreCompleto?: string;
  nombreUsuario?: string;
  correo?: string;
  email?: string;
  correoElectronico?: string;
  correoCliente?: string;
  correoUsuario?: string;
  correoPrincipal?: string;
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
  estado?: string;
  status?: string;
  estadoActual?: string;
  estadoBoleta?: string;
  estadoPago?: string;
  historialEstados?: Array<{ estado?: string }>;
  cliente?: BoletaClientDTO | number;
  clienteId?: number;
  usuarioId?: number;
  usuario?: BoletaClientDTO | string;
  user?: BoletaClientDTO | string;
  comprador?: BoletaClientDTO | string;
  clienteNombre?: string;
  usuarioNombre?: string;
  nombreCliente?: string;
  clienteFullName?: string;
  clientName?: string;
  compradorNombre?: string;
  clienteCorreo?: string;
  emailCliente?: string;
  clienteEmail?: string;
  clientEmail?: string;
  correoCliente?: string;
  correoUsuario?: string;
  usuarioCorreo?: string;
  compradorCorreo?: string;
  cuponCodigo?: string;
  couponCode?: string;
  codigoCupon?: string;
  puntosOtorgados?: number;
  pointsAwarded?: number;
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
  rol?: string;
  role?: string;
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
  productName: dto.productName ?? dto.productoNombre,
  visible:
    typeof dto.visible === "boolean"
      ? dto.visible
      : typeof dto.aprobado === "boolean"
      ? dto.aprobado
      : dto.estado
      ? dto.estado.toUpperCase() !== "RECHAZADA"
      : undefined,
});

const mapOrderDetailDTO = (dto: BoletaDetalleDTO): OrderDetail => ({
  productId: dto.productId ?? dto.productoId ?? dto.producto?.id ?? 0,
  productName:
    dto.productName ?? dto.productoNombre ?? dto.producto?.nombre ?? "Producto",
  quantity: dto.quantity ?? dto.cantidad ?? dto.unidades ?? 0,
  unitPrice: dto.unitPrice ?? dto.precioUnitario ?? dto.precio ?? 0,
});

const mapBoletaDTOToOrder = (dto: BoletaDTO): Order => {
  const client = resolveBoletaClient(dto);
  const status = normalizeOrderStatus(
    dto.estado ??
      dto.status ??
      dto.estadoActual ??
      dto.estadoBoleta ??
      dto.estadoPago ??
      (Array.isArray(dto.historialEstados)
        ? dto.historialEstados.at(-1)?.estado
        : undefined)
  );

  return {
    id: dto.id,
    number: dto.numero ?? dto.number ?? dto.codigo,
    issuedAt: dto.fechaEmision ?? dto.fecha ?? dto.createdAt,
    total: dto.total ?? dto.montoTotal ?? 0,
    status,
    clientId: client.id,
    clientName: client.name,
    clientEmail: client.email,
    couponCode: dto.couponCode ?? dto.cuponCodigo ?? dto.codigoCupon,
    pointsAwarded: dto.pointsAwarded ?? dto.puntosOtorgados,
    details: (dto.detalles ?? dto.details ?? []).map(mapOrderDetailDTO),
  };
};

const buildFullName = (nombre?: string, apellidos?: string): string => {
  const parts = [nombre ?? "", apellidos ?? ""]
    .map((value) => value?.trim())
    .filter(Boolean);
  return parts.join(" ") || nombre || apellidos || "Usuario";
};

const normalizeOrderStatus = (status?: string): string | undefined => {
  if (!status) {
    return undefined;
  }

  const normalized = status.replace(/[_-]+/g, " ").trim().toUpperCase();

  if (normalized === "PREPARACIÓN") {
    return "PREPARACION";
  }

  switch (normalized) {
    case "PENDIENTE":
    case "PAGADA":
    case "PREPARACION":
    case "DESPACHADA":
    case "ENTREGADA":
    case "CANCELADA":
    case "EMITIDA":
      return normalized;
    default:
      return normalized;
  }
};

const resolveBoletaClient = (
  dto: BoletaDTO
): { id?: number; name?: string; email?: string } => {
  let clientRecord: BoletaClientDTO | undefined;
  const scalarNames: string[] = [];

  const considerSource = (source: unknown) => {
    if (!source) {
      return;
    }
    if (typeof source === "string") {
      scalarNames.push(source);
      return;
    }
    if (typeof source === "object" && !Array.isArray(source) && !clientRecord) {
      clientRecord = source as BoletaClientDTO;
    }
  };

  considerSource(dto.cliente);
  considerSource(dto.usuario);
  considerSource(dto.user);
  considerSource(dto.comprador);

  const firstValidNumber = (
    ...values: Array<number | undefined>
  ): number | undefined => {
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
    return undefined;
  };

  const firstNonEmptyString = (
    ...values: Array<string | undefined>
  ): string | undefined => {
    for (const value of values) {
      const trimmed = value?.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    return undefined;
  };

  const resolvedClient: BoletaClientDTO | undefined = clientRecord;

  const idCandidate = firstValidNumber(
    typeof dto.cliente === "number" ? dto.cliente : undefined,
    dto.clienteId,
    dto.usuarioId,
    resolvedClient?.id,
    resolvedClient?.usuarioId
  );

  const recordDisplayName = resolvedClient
    ? firstNonEmptyString(
        resolvedClient.nombreCompleto,
        resolvedClient.fullName,
        resolvedClient.nombreUsuario,
        buildFullName(
          resolvedClient.nombre ?? resolvedClient.name,
          resolvedClient.apellidos ?? resolvedClient.lastName
        )
      )
    : undefined;

  const fallbackName = firstNonEmptyString(
    recordDisplayName,
    dto.clienteFullName,
    dto.clientName,
    dto.clienteNombre,
    dto.usuarioNombre,
    dto.nombreCliente,
    dto.compradorNombre,
    scalarNames[0]
  );

  const emailFromRecord = resolvedClient
    ? firstNonEmptyString(
        resolvedClient.correo,
        resolvedClient.email,
        resolvedClient.correoElectronico,
        resolvedClient.correoCliente,
        resolvedClient.correoUsuario,
        resolvedClient.correoPrincipal
      )
    : undefined;

  const fallbackEmail = firstNonEmptyString(
    emailFromRecord,
    dto.clienteCorreo,
    dto.emailCliente,
    dto.clienteEmail,
    dto.clientEmail,
    dto.correoCliente,
    dto.correoUsuario,
    dto.usuarioCorreo,
    dto.compradorCorreo
  );

  return {
    id: idCandidate,
    name: fallbackName,
    email: fallbackEmail,
  };
};

const normalizeRole = (role?: string): string => {
  if (!role) {
    return "CLIENTE";
  }

  const cleaned = role
    .replace(/^ROL(?:E)?[_-]?/i, "")
    .replace(/^ROLE[_-]?/i, "")
    .trim();
  const upper = cleaned.toUpperCase();

  if (upper.includes("ADMIN")) {
    return "ADMINISTRADOR";
  }

  if (upper.includes("VEND")) {
    return "VENDEDOR";
  }

  if (upper.includes("CLIENT")) {
    return "CLIENTE";
  }

  return upper || "CLIENTE";
};

const mapUserDTOToSummary = (dto: UserDTO): UserSummary => ({
  id: Number(dto.id ?? dto.usuarioId ?? 0),
  fullName: buildFullName(
    dto.nombre ?? dto.name,
    dto.apellidos ?? dto.lastName
  ),
  email: dto.correo ?? dto.email ?? "",
  role: normalizeRole(dto.rol ?? dto.role ?? "CLIENTE"),
});

const mapUserProfileDTOToDetail = (
  dto: UserProfileDTO,
  overrides?: Partial<UserDetail>
): UserDetail => ({
  id: dto.id,
  run: dto.run,
  name: dto.nombre ?? "",
  lastName: dto.apellidos ?? "",
  fullName: buildFullName(dto.nombre, dto.apellidos),
  email: dto.correo ?? "",
  birthdate: dto.fechaNacimiento,
  address: dto.direccion,
  region: dto.region,
  commune: dto.comuna,
  role: normalizeRole(overrides?.role ?? dto.rol ?? dto.role ?? "CLIENTE"),
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

  if (payload.categoryId !== undefined) {
    body.categoriaId = payload.categoryId;
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
const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x600?text=Producto";
const DEFAULT_BLOG_IMAGE = "https://placehold.co/1200x600?text=Blog";

const mapProductDTOtoProduct = (dto: ProductDTO): Product => {
  const images = dto.imagenes ?? [];
  const resolvedImages = images
    .map((img) => toAbsoluteUrl(img))
    .filter((img): img is string => Boolean(img));
  const categoryInfo =
    dto.categoria && typeof dto.categoria === "object"
      ? (dto.categoria as CategoryDTO)
      : undefined;
  const categoryName = categoryInfo
    ? categoryInfo.nombre ?? "Sin categoría"
    : typeof dto.categoria === "string"
    ? dto.categoria
    : "Sin categoría";
  const categoryId = categoryInfo?.id;

  return {
    id: dto.id,
    code: dto.codigo,
    name: dto.nombre,
    description: dto.descripcion,
    price: dto.precio,
    stock: dto.stock,
    stockCritical: dto.stockCritico,
    category: categoryName,
    categoryId,
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

const mapCategoryDTOToCategory = (dto: CategoryDTO): ProductCategory => ({
  id: dto.id,
  code: dto.codigo,
  name: dto.nombre,
  description: dto.descripcion ?? "",
  active: dto.activo ?? true,
});

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
    precio: payload.price,
    stock: payload.stock,
    activo: payload.active ?? true,
  };

  if (payload.categoryId !== undefined) {
    body.categoriaId = payload.categoryId;
  }

  if (payload.category !== undefined) {
    body.categoria = payload.category;
  }

  if (payload.stockCritical !== undefined) {
    body.stockCritico = payload.stockCritical;
  }

  if (payload.pointsLevelUp !== undefined) {
    body.puntosLevelUp = payload.pointsLevelUp;
  }

  return body;
};

const mapBlogDTOtoAdminBlog = (dto: BlogDTO): AdminBlog => {
  const imageUrl = resolveBlogAssetUrl(dto.imagenUrl, dto.id, "image");
  const contentUrl = resolveBlogAssetUrl(dto.contenidoUrl, dto.id, "content");

  return {
    id: dto.id,
    title: dto.titulo,
    author: dto.autor,
    summary: dto.descripcionCorta,
    publishedAt: dto.fechaPublicacion,
    contentPath: dto.contenidoUrl,
    imagePath: dto.imagenUrl,
    altText: dto.altImagen,
    imageUrl: imageUrl || DEFAULT_BLOG_IMAGE,
    contentUrl,
  };
};

const mapBlogDTOtoBlog = (dto: BlogDTO): Blog => {
  const adminBlog = mapBlogDTOtoAdminBlog(dto);

  return {
    id: adminBlog.id.toString(),
    title: adminBlog.title,
    image: adminBlog.imageUrl,
    alt: adminBlog.altText ?? "",
    summary: adminBlog.summary,
    author: adminBlog.author,
    date: adminBlog.publishedAt,
    content_path: adminBlog.contentUrl,
  };
};

const parseBlogDate = (value: string): number => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const sortBlogsByPublishedDate = (list: AdminBlog[]): AdminBlog[] =>
  [...list].sort((a, b) => {
    const diff = parseBlogDate(b.publishedAt) - parseBlogDate(a.publishedAt);
    if (diff !== 0) {
      return diff;
    }
    return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
  });

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

export const getProducts = async (
  options?: GetProductsOptions
): Promise<Product[]> => {
  try {
    const response = await apiClient.get<ProductDTO[]>("products");
    const mapped = response.data.map(mapProductDTOtoProduct);
    const includeInactive = options?.includeInactive === true;
    const filtered = includeInactive
      ? mapped
      : mapped.filter((product) => product.active !== false);
    return sortProductsByIdAndName(filtered);
  } catch (error: unknown) {
    return logAndReturn("getProducts", error, []);
  }
};

export const createProduct = async (
  payload: CreateProductPayload,
  imageFile?: File
): Promise<Product> => {
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
  } catch (error: unknown) {
    return logAndReturn("getProductById", error, undefined);
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
  } catch (error: unknown) {
    return logAndReturn("getProductByBackendId", error, undefined);
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
  } catch (error: unknown) {
    return logAndReturn(`getProductReviews:${productId}`, error, []);
  }
};

export const createProductReview = async (
  payload: CreateReviewPayload
): Promise<ProductReview> => {
  const requestBody = {
    productoId: payload.productId,
    texto: payload.text?.trim(),
    calificacion: payload.rating,
  };
  const response = await apiClient.post<ReviewDTO>("reviews", requestBody);
  return mapReviewDTOToReview(response.data);
};

export const getAllProductReviews = async (
  productList?: Product[]
): Promise<ProductReview[]> => {
  try {
    const products =
      productList ?? (await getProducts({ includeInactive: true }));
    if (!products.length) {
      return [];
    }

    const reviewGroups = await Promise.all(
      products.map(async (product) => {
        try {
          const productReviews = await getProductReviews(product.id);
          return productReviews.map((review) => ({
            ...review,
            productName: review.productName ?? product.name,
          }));
        } catch (error: unknown) {
          return logAndReturn(
            `getAllProductReviews:product:${product.id}`,
            error,
            [] as ProductReview[]
          );
        }
      })
    );

    const flattened = reviewGroups.flat();
    return flattened.sort((a, b) => {
      const aDate = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bDate = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
        return 0;
      }
      return bDate - aDate;
    });
  } catch (error: unknown) {
    return logAndReturn("getAllProductReviews", error, []);
  }
};

export const updateAdminReview = async (
  reviewId: number,
  payload: UpdateReviewPayload
): Promise<ProductReview | null> => {
  if (!reviewId) {
    return null;
  }

  const requestBody: Record<string, unknown> = {};

  if (payload.text !== undefined) {
    requestBody.texto = payload.text.trim();
  }

  if (payload.rating !== undefined) {
    requestBody.calificacion = payload.rating;
  }

  if (payload.visible !== undefined) {
    requestBody.visible = payload.visible;
  }

  if (!Object.keys(requestBody).length) {
    return null;
  }

  const response = await apiClient.put<ReviewDTO>(
    `reviews/${reviewId}`,
    requestBody
  );
  return mapReviewDTOToReview(response.data);
};

export const deleteAdminReview = async (reviewId: number): Promise<void> => {
  if (!reviewId) {
    return;
  }

  await apiClient.delete(`reviews/${reviewId}`);
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
    return undefined;
  }

  const response = await apiClient.put<ProductDTO>(
    `products/${productId}`,
    body
  );
  return mapProductDTOtoProduct(response.data);
};

export const deleteProduct = async (productId: number): Promise<void> => {
  if (!productId) {
    return;
  }

  await apiClient.delete(`products/${productId}`);
};

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const response = await apiClient.get<CategoryDTO[]>("categories");
    return response.data?.map(mapCategoryDTOToCategory) ?? [];
  } catch (error: unknown) {
    return logAndReturn("getProductCategories", error, []);
  }
};

export const createProductCategory = async (
  payload: CreateCategoryPayload
): Promise<ProductCategory> => {
  const requestBody = {
    codigo: payload.code.trim(),
    nombre: payload.name.trim(),
    descripcion: payload.description?.trim() ?? "",
    activo: payload.active ?? true,
  };

  const response = await apiClient.post<CategoryDTO>("categories", requestBody);
  return mapCategoryDTOToCategory(response.data);
};

export const updateProductCategory = async (
  categoryId: number,
  payload: UpdateCategoryPayload
): Promise<ProductCategory | null> => {
  if (!categoryId) {
    return null;
  }

  const requestBody: Record<string, unknown> = {};

  if (payload.code !== undefined) {
    requestBody.codigo = payload.code.trim();
  }

  if (payload.name !== undefined) {
    requestBody.nombre = payload.name.trim();
  }

  if (payload.description !== undefined) {
    requestBody.descripcion = payload.description.trim();
  }

  if (payload.active !== undefined) {
    requestBody.activo = payload.active;
  }

  if (!Object.keys(requestBody).length) {
    return null;
  }

  const response = await apiClient.put<CategoryDTO>(
    `categories/${categoryId}`,
    requestBody
  );
  return mapCategoryDTOToCategory(response.data);
};

export const deleteProductCategory = async (
  categoryId: number
): Promise<void> => {
  if (!categoryId) {
    return;
  }

  await apiClient.delete(`categories/${categoryId}`);
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
  } catch (error: unknown) {
    return logAndReturn("fetchUserCart", error, []);
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

  const response = await apiClient.post<CartDTO>(`cart/${userId}/add`, null, {
    params: { productId, quantity },
  });
  return mapCartDTOToCartItems(response.data, overrides);
};

export const removeProductFromCartApi = async (
  userId: string,
  productId: number,
  overrides?: CartImageOverrides
): Promise<CartItem[]> => {
  if (!userId || !productId) {
    return [];
  }

  const response = await apiClient.delete<CartDTO>(`cart/${userId}/remove`, {
    params: { productId },
  });
  return mapCartDTOToCartItems(response.data, overrides);
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

  await apiClient.delete(`cart/${userId}`);
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) {
    return [];
  }

  try {
    const response = await apiClient.get<BoletaDTO[]>(`boletas/user/${userId}`);
    return response.data?.map(mapBoletaDTOToOrder) ?? [];
  } catch (error: unknown) {
    return logAndReturn("getUserOrders", error, []);
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

  const response = await apiClient.post<BoletaDTO>(
    "boletas",
    serializeBoletaPayload(payload)
  );
  return mapBoletaDTOToOrder(response.data);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<BoletaDTO[]>("boletas");
  return response.data?.map(mapBoletaDTOToOrder) ?? [];
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  if (!orderId) {
    return null;
  }

  const response = await apiClient.get<BoletaDTO>(`boletas/${orderId}`);
  return mapBoletaDTOToOrder(response.data);
};

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order | null> => {
  if (!orderId || !status) {
    return null;
  }

  const normalizedStatus = status.toUpperCase();
  const response = await apiClient.put<BoletaDTO>(`boletas/${orderId}/estado`, {
    estado: normalizedStatus,
  });
  return mapBoletaDTOToOrder(response.data);
};

export const deleteOrder = async (orderId: number): Promise<void> => {
  if (!orderId) {
    return;
  }

  await apiClient.delete(`boletas/${orderId}`);
};

export const getUsers = async (): Promise<UserSummary[]> => {
  try {
    const response = await apiClient.get<UserDTO[]>("users");
    return response.data?.map(mapUserDTOToSummary) ?? [];
  } catch (error: unknown) {
    return logAndReturn("getUsers", error, []);
  }
};

export const sortUsersByName = (list: UserSummary[]): UserSummary[] =>
  [...list].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
  );

const serializeCreateUserPayload = (
  payload: CreateUserPayload
): Record<string, unknown> => ({
  run: payload.run,
  nombre: payload.name,
  apellidos: payload.lastName,
  correo: payload.email,
  contrasena: payload.password,
  fechaNacimiento: payload.birthdate,
  region: payload.region,
  comuna: payload.commune,
  direccion: payload.address,
  rol: payload.role,
  codigoReferido: payload.referralCode?.trim() || undefined,
});

const serializeUpdateUserPayload = (
  payload: UpdateUserPayload
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    body.nombre = payload.name;
  }

  if (payload.lastName !== undefined) {
    body.apellidos = payload.lastName;
  }

  if (payload.region !== undefined) {
    body.region = payload.region;
  }

  if (payload.commune !== undefined) {
    body.comuna = payload.commune;
  }

  if (payload.address !== undefined) {
    body.direccion = payload.address;
  }

  return body;
};

const serializeBlogPayload = (
  payload: CreateBlogPayload | UpdateBlogPayload
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (payload.title !== undefined) {
    body.titulo = payload.title;
  }

  if (payload.author !== undefined) {
    body.autor = payload.author;
  }

  if (payload.summary !== undefined) {
    body.descripcionCorta = payload.summary;
  }

  if (payload.publishedAt !== undefined) {
    body.fechaPublicacion = payload.publishedAt;
  }

  if (payload.contentPath !== undefined) {
    body.contenidoUrl = payload.contentPath;
  }

  if (payload.imagePath !== undefined) {
    body.imagenUrl = payload.imagePath;
  }

  if (payload.altText !== undefined) {
    body.altImagen = payload.altText;
  }

  return body;
};

const serializeCreateBlogPayload = (
  payload: CreateBlogPayload
): Record<string, unknown> => serializeBlogPayload(payload);

const serializeUpdateBlogPayload = (
  payload: UpdateBlogPayload
): Record<string, unknown> => serializeBlogPayload(payload);

export const getUserById = async (
  userId: number
): Promise<UserDetail | null> => {
  if (!userId) {
    return null;
  }
  try {
    const response = await apiClient.get<UserProfileDTO>(`users/${userId}`);
    return mapUserProfileDTOToDetail(response.data);
  } catch (error: unknown) {
    return logAndReturn("getUserById", error, null);
  }
};

export const createUser = async (
  payload: CreateUserPayload
): Promise<UserDetail> => {
  const response = await apiClient.post<UserProfileDTO>(
    "users/admin",
    serializeCreateUserPayload(payload)
  );
  return mapUserProfileDTOToDetail(response.data, { role: payload.role });
};

export const updateUser = async (
  userId: number,
  payload: UpdateUserPayload
): Promise<UserDetail | null> => {
  if (!userId) {
    return null;
  }
  const response = await apiClient.put<UserProfileDTO>(
    `users/${userId}`,
    serializeUpdateUserPayload(payload)
  );
  return mapUserProfileDTOToDetail(response.data);
};

export const deleteUser = async (userId: number): Promise<void> => {
  if (!userId) {
    return;
  }
  await apiClient.delete(`users/${userId}`);
};

const DEFAULT_USER_ROLES = ["ADMINISTRADOR", "VENDEDOR", "CLIENTE"];

export const getUserRoles = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get<string[]>("users/roles");
    const roles = response.data?.map((role) => role.toUpperCase()) ?? [];
    return roles.length ? roles : DEFAULT_USER_ROLES;
  } catch (error: unknown) {
    return logAndReturn("getUserRoles", error, DEFAULT_USER_ROLES);
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
  } catch (error: unknown) {
    return logAndReturn("getBlogPosts", error, []);
  }
};

export const getAdminBlogs = async (): Promise<AdminBlog[]> => {
  try {
    const response = await apiClient.get<BlogDTO[]>("blog-posts");
    const mapped = response.data.map(mapBlogDTOtoAdminBlog);
    return sortBlogsByPublishedDate(mapped);
  } catch (error: unknown) {
    return logAndReturn("getAdminBlogs", error, []);
  }
};

export const getAdminBlogById = async (
  blogId: number
): Promise<AdminBlog | null> => {
  if (!blogId) {
    return null;
  }

  try {
    const response = await apiClient.get<BlogDTO>(`blog-posts/${blogId}`);
    return mapBlogDTOtoAdminBlog(response.data);
  } catch (error: unknown) {
    return logAndReturn("getAdminBlogById", error, null);
  }
};

export const createBlogPost = async (
  payload: CreateBlogPayload,
  imageFile?: File
): Promise<AdminBlog> => {
  const formData = new FormData();
  const blogBody = serializeCreateBlogPayload(payload);
  const blogBlob = new Blob([JSON.stringify(blogBody)], {
    type: "application/json",
  });

  formData.append("blog", blogBlob);

  if (imageFile) {
    formData.append("imagen", imageFile);
  }

  const response = await apiClient.post<BlogDTO>("blog-posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapBlogDTOtoAdminBlog(response.data);
};

export const updateBlogPost = async (
  blogId: number,
  payload: UpdateBlogPayload
): Promise<AdminBlog | null> => {
  if (!blogId) {
    return null;
  }

  const body = serializeUpdateBlogPayload(payload);
  if (!Object.keys(body).length) {
    return null;
  }

  const response = await apiClient.put<BlogDTO>(`blog-posts/${blogId}`, body);
  return mapBlogDTOtoAdminBlog(response.data);
};

export const deleteBlogPost = async (blogId: number): Promise<void> => {
  if (!blogId) {
    return;
  }

  await apiClient.delete(`blog-posts/${blogId}`);
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
  } catch (error: unknown) {
    return logAndReturn("getBlogPostById", error, undefined);
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
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object"
    ) {
      const response = (
        error as { response?: { data?: unknown; status?: unknown } }
      ).response;
      const message = (() => {
        if (!response?.data) {
          return undefined;
        }
        if (typeof response.data === "string") {
          return response.data;
        }
        if (
          typeof response.data === "object" &&
          "message" in response.data &&
          typeof (response.data as { message?: unknown }).message === "string"
        ) {
          return (response.data as { message?: string }).message;
        }
        return undefined;
      })();

      if (message?.trim()) {
        logApiHelperError("authenticateUser", error);
        throw new Error(message.trim());
      }
    }

    logApiHelperError("authenticateUser", error);
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
  } catch (error: unknown) {
    return logAndReturn("fetchBlogContentFromEndpoint", error, null);
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
