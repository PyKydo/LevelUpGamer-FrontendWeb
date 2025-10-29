import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('Footer', () => {
  it('debería mostrar el texto de copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const copyrightElement = screen.getByText(/© 2025 Level-Up Gamer. Todos los derechos reservados./i);
    expect(copyrightElement).toBeDefined();
  });

});
