import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../hooks/AuthContext';
import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
  it('renders user information when user is authenticated', () => {
    const user = { username: 'testuser', email: 'test@example.com', role: 'user' };

    render(
      <AuthContext.Provider value={{ user, login: () => {}, logout: () => {} }}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('redirects to login page when user is not authenticated', () => {
    render(
      <AuthContext.Provider value={{ user: null, login: () => {}, logout: () => {} }}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(window.location.pathname).toBe('/');
  });
});
