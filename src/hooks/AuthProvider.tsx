import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthProviderProps, AuthContextType, User } from './AuthContext';

const STORAGE_KEY = 'currentUser';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = window.localStorage.getItem(STORAGE_KEY);
      return storedUser ? (JSON.parse(storedUser) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login: AuthContextType['login'] = (userData) => {
    setUser(userData);
  };

  const logout: AuthContextType['logout'] = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
