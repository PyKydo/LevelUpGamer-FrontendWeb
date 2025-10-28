import productsData from '../data/products.json';
import blogsData from '../data/blogs.json';
import { getLocalStorageItem } from './storage.helper';
import { simpleHash } from './security.helper';
import type { UserWithPassword } from '../hooks/AuthContext';

export interface Product {
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  image: string;
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

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Region {
  codigo: string;
  nombre: string;
}

export interface Commune {
  codigo: string;
  nombre: string;
}



export interface Region {
  codigo: string;
  nombre: string;
}

export interface Commune {
  codigo: string;
  nombre: string;
}


export const getProducts = (): Product[] => {
  return productsData as Product[];
};

export const getProductById = (id: string): Product | undefined => {
  return productsData.find((p) => p.code === id) as Product | undefined;
};

export const getBlogPosts = (): Blog[] => {
  return blogsData as Blog[];
};

export const getBlogPostById = (id: string): Blog | undefined => {
  return blogsData.find((p) => p.id === id) as Blog | undefined;
};

export const authenticateUser = (email: string, password: string): User | undefined => {
  const users = getLocalStorageItem<UserWithPassword[]>('users') || [];
  const hashedPassword = simpleHash(password);
  const user = users.find(
    (u) => u.email === email && u.password === hashedPassword
  );

  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return undefined;
};

export const getBlogContent = async (path: string): Promise<string> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch blog content from ${path}`);
  }
  return await response.text();
};

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export const loadJSONP = <T,>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
    const script = document.createElement('script');

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

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

export const getRegions = (): Promise<Region[]> => {
  return loadJSONP<Region[]>('https://apis.digital.gob.cl/dpa/regiones');
};

export const getCommunesByRegion = (regionCode: string): Promise<Commune[]> => {
  return loadJSONP<Commune[]>(
    `https://apis.digital.gob.cl/dpa/regiones/${regionCode}/comunas`
  );
};