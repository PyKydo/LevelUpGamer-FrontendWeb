import { useContext } from 'react';
import { CartContext } from './CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado con un CartProvider');
  }
  return context;
};