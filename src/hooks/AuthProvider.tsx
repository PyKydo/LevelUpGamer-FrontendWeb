import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthProviderProps, AuthContextType, User } from './AuthContext';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '../helpers/storage.helper';

const CURRENT_USER_STORAGE_KEY = 'currentUser';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() =>
    getLocalStorageItem<User>(CURRENT_USER_STORAGE_KEY),
  );

  useEffect(() => {
    if (user) {
      setLocalStorageItem(CURRENT_USER_STORAGE_KEY, user);
    } else {
      removeLocalStorageItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [user]);

  const login: AuthContextType['login'] = (userData) => {
    setUser(userData);
    if (userData.token) {
      setLocalStorageItem('token', userData.token);
    }
  };

  const logout: AuthContextType['logout'] = () => {
    setUser(null);
    removeLocalStorageItem('token');
    removeLocalStorageItem(CURRENT_USER_STORAGE_KEY);
  };

  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const isAdmin = roles.includes('ADMINISTRADOR');
  const isSeller = roles.includes('VENDEDOR');
  const isClient = roles.includes('CLIENTE') || (!isAdmin && !isSeller);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isSeller, isClient }}>
      {children}
    </AuthContext.Provider>
  );
};