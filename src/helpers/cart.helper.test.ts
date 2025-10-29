import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTotal } from './cart.helper';
import type { CartItem } from '../hooks/CartContext';

const mockCartItems: CartItem[] = [
  { id: '1', name: 'Producto 1', price: 1000, quantity: 2, image: '' },
  { id: '2', name: 'Producto 2', price: 500, quantity: 3, image: '' },
  { id: '3', name: 'Producto 3', price: 250, quantity: 1, image: '' },
];

describe('Ayudantes de Carrito', () => {
  describe('calcular Subtotal', () => {
    it('debería calcular el subtotal correctamente', () => {
      expect(calculateSubtotal(mockCartItems)).toBe(3750);
      expect(calculateSubtotal([])).toBe(0);
    });
  });

  describe('calcular Total', () => {
    it('debería calcular el total con descuentos correctamente', () => {
      expect(calculateTotal(5000, 500)).toBe(4500);
      expect(calculateTotal(5000)).toBe(5000);
      expect(calculateTotal(5000, 6000)).toBe(0);
    });
  });
});