import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../hooks/CartContext';
import { NotificationProvider } from '../../hooks/NotificationProvider';

const mockProduct = {
  id: 99,
  code: '1',
  name: 'Test Product',
  category: 'Test Category',
  image: 'test.jpg',
  description: 'Test Description',
  price: 1000,
  stock: 10,
};

describe('ProductCard', () => {
  const mockCartContext = {
    cart: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    increaseQuantity: vi.fn(),
    decreaseQuantity: vi.fn(),
    clearCart: vi.fn(),
    totalItems: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar el nombre y el precio del producto', () => {
    render(
      <MemoryRouter>
        <NotificationProvider>
          <CartContext.Provider value={mockCartContext}>
            <ProductCard product={mockProduct} />
          </CartContext.Provider>
        </NotificationProvider>
      </MemoryRouter>
    );

    const nameElement = screen.getByText(/Test Product/i);
    expect(nameElement).toBeDefined();

    const priceElement = screen.getByText(/\$1.000/i);
    expect(priceElement).toBeDefined();
  });

  it('debería llamar a addToCart cuando se hace clic en el botón', async () => {
    window.alert = vi.fn();
    render(
      <MemoryRouter>
        <NotificationProvider>
          <CartContext.Provider value={mockCartContext}>
            <ProductCard product={mockProduct} />
          </CartContext.Provider>
        </NotificationProvider>
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: /agregar al carrito/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(mockCartContext.addToCart).toHaveBeenCalled();
  });
});
