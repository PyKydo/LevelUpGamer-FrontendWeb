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

interface UserWithPassword extends User {
  password: string;
}

export interface Region {
  codigo: string;
  nombre: string;
}

export interface Commune {
  codigo: string;
  nombre: string;
}


export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch('/data/products.json');
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const products = await getProducts();
  return products.find(p => p.code === id);
};

export const getBlogPosts = async (): Promise<Blog[]> => {
  const response = await fetch('/data/blogs.json');
  if (!response.ok) throw new Error('Failed to fetch blogs');
  return await response.json();
};

export const getBlogPostById = async (id: string): Promise<Blog | undefined> => {
  const posts = await getBlogPosts();
  return posts.find(p => p.id === id);
};

export const getBlogContent = async (path: string): Promise<string> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch blog content from ${path}`);
  }
  return await response.text();
};

export const authenticateUser = async (email: string, password: string): Promise<User | undefined> => {
  const response = await fetch('/data/users.json');
  if (!response.ok) throw new Error('Failed to fetch users');
  const users: UserWithPassword[] = await response.json();
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
  
  return undefined;
};


declare global {
  interface Window {
    [key: string]: unknown;
  }
}

const loadJSONP = <T,>(url: string): Promise<T> => {
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
  return loadJSONP<Commune[]>(`https://apis.digital.gob.cl/dpa/regiones/${regionCode}/comunas`);
};