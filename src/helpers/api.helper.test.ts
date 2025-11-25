import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, resolveApiUrl } from "./api.client";
import { getProducts, getBlogPosts, getBlogContent } from "./api.helper";

vi.mock("./api.client", async () => {
  const actual = await vi.importActual<typeof import("./api.client")>(
    "./api.client"
  );
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

global.fetch = vi.fn();

describe("Ayudantes de API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("obtener Productos", () => {
    it("mapea correctamente los productos desde la API", async () => {
      (apiClient.get as vi.Mock).mockResolvedValueOnce({
        data: [
          {
            id: 1,
            codigo: "PRD-1",
            nombre: "Producto 1",
            descripcion: "Descripción",
            precio: 9990,
            stock: 5,
            stockCritico: 1,
            categoria: {
              id: 10,
              codigo: "CAT-1",
              nombre: "Accesorios",
              descripcion: "Cat desc",
              activo: true,
            },
            imagenes: ["img/products/prd1.png"],
            puntosLevelUp: 200,
            activo: true,
            vendedor: {
              id: 7,
              nombre: "LevelUp",
              correo: "ventas@levelup.cl",
              corporativo: true,
            },
          },
        ],
      });

      const products = await getProducts();

      expect(apiClient.get).toHaveBeenCalledWith("products");
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        code: "PRD-1",
        category: "Accesorios",
        image: resolveApiUrl("img/products/prd1.png"),
        seller: { id: 7, corporate: true },
      });
    });

    it("devuelve un arreglo vacío cuando la API falla", async () => {
      (apiClient.get as vi.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const products = await getProducts();

      expect(products).toEqual([]);
    });
  });

  describe("obtener Publicaciones del Blog", () => {
    it("retorna las publicaciones devueltas por la API", async () => {
      (apiClient.get as vi.Mock).mockResolvedValueOnce({
        data: [
          {
            id: 42,
            titulo: "Blog 1",
            autor: "Autor",
            fechaPublicacion: "2025-01-01",
            descripcionCorta: "Resumen",
            contenidoUrl: "blogs/blog42.md",
            imagenUrl: "blogs/blog42.png",
            altImagen: "Blog 1",
          },
        ],
      });

      const blogs = await getBlogPosts();

      expect(apiClient.get).toHaveBeenCalledWith("blog-posts");
      expect(blogs).toHaveLength(1);
      expect(blogs[0]).toMatchObject({ id: "42", title: "Blog 1" });
      expect(blogs[0].image).toBe(
        "https://level-up-gamer.s3.amazonaws.com/blogs/42/blog42.png"
      );
      expect(blogs[0].content_path).toBe(
        "https://level-up-gamer.s3.amazonaws.com/blogs/42/blog.md"
      );
    });

    it("retorna un arreglo vacío cuando ocurre un error", async () => {
      (apiClient.get as vi.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const blogs = await getBlogPosts();

      expect(blogs).toEqual([]);
    });
  });

  describe("obtener Contenido del Blog", () => {
    it("prefiere el endpoint del backend cuando está disponible", async () => {
      const mockContent = "## Título del Blog\n\nEste es el contenido.";
      (apiClient.get as vi.Mock).mockResolvedValueOnce({ data: mockContent });

      const content = await getBlogContent("42", "/path/to/blog.md");

      expect(apiClient.get).toHaveBeenCalledWith(
        "blog-posts/42/content",
        expect.objectContaining({ responseType: "text" })
      );
      expect(fetch).not.toHaveBeenCalled();
      expect(content).toBe(mockContent);
    });

    it("usa la ruta de respaldo cuando el endpoint falla", async () => {
      (apiClient.get as vi.Mock).mockRejectedValueOnce(new Error("Network"));
      const fallbackContent = "## Contenido desde fallback";
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fallbackContent),
      });

      const content = await getBlogContent("42", "/path/to/blog.md");

      expect(fetch).toHaveBeenCalledWith(resolveApiUrl("/path/to/blog.md"));
      expect(content).toBe(fallbackContent);
    });

    it("lanza error si no hay ruta de respaldo y falla el endpoint", async () => {
      (apiClient.get as vi.Mock).mockRejectedValueOnce(new Error("Network"));

      await expect(getBlogContent("42")).rejects.toThrow();
    });
  });
});
