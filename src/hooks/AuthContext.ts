import { createContext } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  run: string;
  birthdate: string;
  address: string;
  region: string;
  commune: string;
  role: string;
  token?: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isSeller: boolean;
  isClient: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
