import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../hooks/CartContext';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  category: 'Test Category',
  image: 'test.jpg',
  description: 'Test Description',
  price: 1000,
};

describe('ProductCard', () => {
  const mockCartContext = {
    cartItems: [],
    totalItems: 0,
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
    subtotal: 0,
  };

  it('debería mostrar el nombre y el precio del producto', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={mockCartContext}>
          <ProductCard {...mockProduct} />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const nameElement = screen.getByText(/Test Product/i);
    expect(nameElement).toBeDefined();

    const priceElement = screen.getByText(/\$1.000/i);
    expect(priceElement).toBeDefined();
  });

  it('debería llamar a addToCart cuando se hace clic en el botón', () => {
    window.alert = vi.fn(); // Mock alert
    render(
      <MemoryRouter>
        <CartContext.Provider value={mockCartContext}>
          <ProductCard {...mockProduct} />
        </CartContext.Provider>
      </MemoryRouter>
    );

    const addButton = screen.getByText(/Agregar/i);
    fireEvent.click(addButton);

    expect(mockCartContext.addToCart).toHaveBeenCalled();
  });
});
