import { render, screen, fireEvent } from '@testing-library/react';
import { CartItemRow } from './CartItemRow';
import { describe, it, expect, vi } from 'vitest';
import { CartContext } from '../../hooks/CartContext';

const mockItem = {
  id: '1',
  name: 'Test Product',
  price: 1000,
  image: 'test.jpg',
  quantity: 2,
};

describe('CartItemRow', () => {
  const mockCartContext = {
    cart: [],
    totalItems: 0,
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    increaseQuantity: vi.fn(),
    decreaseQuantity: vi.fn(),
    clearCart: vi.fn(),
    subtotal: 0,
  };

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

    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    expect(mockCartContext.increaseQuantity).toHaveBeenCalledWith('1');

    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);
    expect(mockCartContext.decreaseQuantity).toHaveBeenCalledWith('1');

    const removeButton = screen.getByRole('button', { name: /Eliminar item/i });
    fireEvent.click(removeButton);
    expect(mockCartContext.removeFromCart).toHaveBeenCalledWith('1');
  });
});
