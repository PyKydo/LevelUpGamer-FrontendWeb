import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
  it('debería mostrar el texto de copyright', () => {
    render(<Footer />);
    const copyrightElement = screen.getByText(/© 2025 Level-Up Gamer. Todos los derechos reservados./i);
    expect(copyrightElement).toBeDefined();
  });

  it('debería coincidir con el snapshot', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});
