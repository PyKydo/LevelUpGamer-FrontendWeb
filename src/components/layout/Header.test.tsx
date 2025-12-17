import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartContext } from '../../hooks/CartContext';
import { AuthContext } from '../../hooks/AuthContext';
import { SearchContext } from '../../hooks/SearchContext';

describe('Header', () => {
  const mockCartContext = {
    cart: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    increaseQuantity: vi.fn(),
    decreaseQuantity: vi.fn(),
    clearCart: vi.fn(),
    totalItems: 0,
  };

  const mockAuthContext = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  };

  const mockSearchContext = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
  };

  it('debería mostrar el logo y los enlaces de navegación', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CartContext.Provider value={mockCartContext}>
            <SearchContext.Provider value={mockSearchContext}>
              <Header />
            </SearchContext.Provider>
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const logoElement = screen.getByAltText(/Logo Level-Up Gamer/i);
    expect(logoElement).toBeDefined();

    const productsLink = screen.getByText(/Productos/i);
    expect(productsLink).toBeDefined();
  });

  it('debería coincidir con el snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CartContext.Provider value={mockCartContext}>
            <SearchContext.Provider value={mockSearchContext}>
              <Header />
            </SearchContext.Provider>
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
