import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CartItemRow } from './CartItemRow';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartContext } from '../../hooks/CartContext';

const mockItem = {
  id: '1',
  productId: 101,
  name: 'Test Product',
  price: 1000,
  image: 'https://example.com/product.png',
  quantity: 2,
};

describe('CartItemRow', () => {
  const mockCartContext = {
    cart: [],
    loading: false,
    totalItems: 0,
    addToCart: vi.fn().mockResolvedValue(undefined),
    removeFromCart: vi.fn().mockResolvedValue(undefined),
    increaseQuantity: vi.fn().mockResolvedValue(undefined),
    decreaseQuantity: vi.fn().mockResolvedValue(undefined),
    clearCart: vi.fn().mockResolvedValue(undefined),
    refreshCart: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar la información del producto', () => {
    render(
      <CartContext.Provider value={mockCartContext}>
        <CartItemRow item={mockItem} />
      </CartContext.Provider>
    );

    const nameElement = screen.getByText(/Test Product/i);
    expect(nameElement).toBeDefined();

    const priceElement = screen.getByText(/Precio Unitario: \$1.000/i);
    expect(priceElement).toBeDefined();

    const quantityElement = screen.getByTestId('quantity');
    expect(quantityElement).toBeDefined();
  });

  it('debería llamar a las funciones del carrito al hacer clic en los botones', () => {
    render(
      <CartContext.Provider value={mockCartContext}>
        <CartItemRow item={mockItem} />
      </CartContext.Provider>
    );

    const increaseButton = screen.getByLabelText('Aumentar cantidad');
    fireEvent.click(increaseButton);
    expect(mockCartContext.increaseQuantity).toHaveBeenCalledWith(101);

    const decreaseButton = screen.getByLabelText('Disminuir cantidad');
    fireEvent.click(decreaseButton);
    expect(mockCartContext.decreaseQuantity).toHaveBeenCalledWith(101);

    const removeButton = screen.getByRole('button', { name: /Eliminar item/i });
    fireEvent.click(removeButton);
    expect(mockCartContext.removeFromCart).toHaveBeenCalledWith(101);
  });
});
