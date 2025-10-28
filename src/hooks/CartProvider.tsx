import { useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';
import type { CartContextType, CartItem, CartProviderProps } from './CartContext';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '../helpers/storage.helper';

const STORAGE_KEY = 'cart';

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>(
    () => getLocalStorageItem<CartItem[]>(STORAGE_KEY, []) || []
  );

  useEffect(() => {
    setLocalStorageItem(STORAGE_KEY, cart);
  }, [cart]);

  const addToCart: CartContextType['addToCart'] = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart: CartContextType['removeFromCart'] = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity: CartContextType['increaseQuantity'] = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity: CartContextType['decreaseQuantity'] = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const clearCart: CartContextType['clearCart'] = () => {
    setCart([]);
  };

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};