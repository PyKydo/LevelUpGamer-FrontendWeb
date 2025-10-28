import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthProviderProps, AuthContextType, User } from './AuthContext';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '../helpers/storage.helper';

const STORAGE_KEY = 'currentUser';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() =>
    getLocalStorageItem<User>(STORAGE_KEY),
  );

  useEffect(() => {
    if (user) {
      setLocalStorageItem(STORAGE_KEY, user);
    } else {
      removeLocalStorageItem(STORAGE_KEY);
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