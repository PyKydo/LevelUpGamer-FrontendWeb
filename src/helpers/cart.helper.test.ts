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
    it('debería calcular el subtotal correcto para una lista de productos', () => {
      const subtotal = calculateSubtotal(mockCartItems);
      expect(subtotal).toBe(3750);
    });

    it('debería devolver 0 para un carrito vacío', () => {
      const subtotal = calculateSubtotal([]);
      expect(subtotal).toBe(0);
    });
  });

  describe('calcular Total', () => {
    it('debería calcular el total correcto restando el descuento', () => {
      const total = calculateTotal(5000, 500);
      expect(total).toBe(4500);
    });

    it('debería devolver el subtotal si no hay descuento', () => {
      const total = calculateTotal(5000);
      expect(total).toBe(5000);
    });

    it('debería devolver 0 si el descuento es mayor que el subtotal o el subtotal es 0', () => {
      expect(calculateTotal(5000, 6000)).toBe(0);
      expect(calculateTotal(0, 100)).toBe(0);
    });
  });
});