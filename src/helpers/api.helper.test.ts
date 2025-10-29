import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import productsData from '../data/products.json';
import blogsData from '../data/blogs.json';
import * as api from './api.helper';

global.fetch = vi.fn();

describe('Ayudantes de API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('obtener Productos', () => {
    it('debería devolver todos los productos', () => {
      const products = api.getProducts();
      expect(products).toEqual(productsData);
    });
  });

  describe('obtener Producto por ID', () => {
    it('debería devolver el producto correcto si le pasas un ID válido', () => {
      const product = api.getProductById('CQ001');
      expect(product).toBeDefined();
      expect(product?.name).toBe('PlayStation 5');
    });
  });

  describe('obtener Publicaciones del Blog', () => {
    it('debería devolver todas las publicaciones', () => {
      const blogs = api.getBlogPosts();
      expect(blogs).toEqual(blogsData);
    });
  });

  describe('obtener Publicación por ID', () => {
    it('debería devolver la publicación correcta si le pasas un ID válido', () => {
      const blog = api.getBlogPostById('post-1');
      expect(blog).toBeDefined();
      expect(blog?.title).toBe('Los mejores juegos de 2025');
    });
  });

  describe('autenticar Usuario', () => {
    beforeEach(() => {
      const users = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@levelup.cl',
          password: 'admin123',
          role: 'admin',
        },
      ];
      window.localStorage.setItem('users', JSON.stringify(users));
    });

    it('debería devolver un usuario sin la contraseña si todo está bien', () => {
      const user = api.authenticateUser('admin@levelup.cl', 'admin123');
      expect(user).toBeDefined();
      expect(user?.email).toBe('admin@levelup.cl');
      expect(user).not.toHaveProperty('password');
    });

    it('debería devolver nada si la contraseña es incorrecta', () => {
      const user = api.authenticateUser('admin@example.com', 'wrongpassword');
      expect(user).toBeUndefined();
    });

  });

  describe('obtener Contenido del Blog', () => {
    it('debería obtener y devolver el contenido de texto correctamente', async () => {
      const mockContent = '## Título del Blog\n\nEste es el contenido.';
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const content = await api.getBlogContent('/path/to/blog.md');

      expect(fetch).toHaveBeenCalledWith('/path/to/blog.md');
      expect(content).toBe(mockContent);
    });
  });
});
