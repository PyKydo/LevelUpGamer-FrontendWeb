import { render, screen } from '@testing-library/react';
import { CartPage } from './CartPage';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../hooks/CartContext';
import type { CartItem } from '../hooks/CartContext';
import { AuthContext } from '../hooks/AuthContext';
import type { User } from '../hooks/AuthContext';
import { NotificationProvider } from '../hooks/NotificationProvider';

vi.mock('../components/common/CartItemRow', () => ({
  CartItemRow: ({ item }: { item: CartItem }) => <div data-testid="cart-item-row">{item.name}</div>,
}));

describe('CartPage Component', () => {
  it('debería mostrar un mensaje cuando el carrito está vacío', () => {
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

    const mockAuthContext = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <NotificationProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <CartContext.Provider value={mockCartContext}>
              <CartPage />
            </CartContext.Provider>
          </AuthContext.Provider>
        </NotificationProvider>
      </MemoryRouter>
    );

    const emptyCartMessage = screen.getByText(/El carrito está vacío/i);
    expect(emptyCartMessage).toBeDefined();
  });

  it('debería mostrar los productos y el subtotal cuando el carrito tiene productos', () => {
    const mockCartContext = {
      cart: [
        { id: '1', name: 'Product 1', price: 1000, quantity: 2, image: '' },
        { id: '2', name: 'Product 2', price: 500, quantity: 1, image: '' },
      ],
      totalItems: 2,
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      increaseQuantity: vi.fn(),
      decreaseQuantity: vi.fn(),
      clearCart: vi.fn(),
      subtotal: 2500,
    };

    const mockUser: User = {
      id: 'user-1',
      name: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      run: '12345678-9',
      birthdate: '1990-01-01',
      address: '123 Main St',
      region: 'RM',
      commune: 'SCL',
      role: 'customer',
    };

    const mockAuthContext = {
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <NotificationProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <CartContext.Provider value={mockCartContext}>
              <CartPage />
            </CartContext.Provider>
          </AuthContext.Provider>
        </NotificationProvider>
      </MemoryRouter>
    );

    const item1 = screen.getByText(/Product 1/i);
    expect(item1).toBeDefined();

    const item2 = screen.getByText(/Product 2/i);
    expect(item2).toBeDefined();

    const subtotalElements = screen.getAllByText(/\$2.500/i);
    expect(subtotalElements.length).toBeGreaterThan(0);
  });
});
