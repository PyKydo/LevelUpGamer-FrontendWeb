import { createContext } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  increaseQuantity: (productId: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
}

export interface CartProviderProps {
  children: ReactNode;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
