
import type { CartItem } from '../hooks/CartContext';

export const calculateSubtotal = (cartItems: CartItem[]): number => {
  if (!cartItems || cartItems.length === 0) {
    return 0;
  }
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateTotal = (subtotal: number, discount: number = 0): number => {
  const total = subtotal - discount;
  return total < 0 ? 0 : total;
};
