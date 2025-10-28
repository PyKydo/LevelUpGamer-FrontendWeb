import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthProviderProps, AuthContextType, User } from './AuthContext';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '../helpers/storage.helper';
import usersData from '../data/users.json';

const CURRENT_USER_STORAGE_KEY = 'currentUser';
const USERS_STORAGE_KEY = 'users';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() =>
    getLocalStorageItem<User>(CURRENT_USER_STORAGE_KEY),
  );

  useEffect(() => {
    const usersInStorage = getLocalStorageItem<User[]>(USERS_STORAGE_KEY);
    if (!usersInStorage || usersInStorage.length === 0) {
      setLocalStorageItem(USERS_STORAGE_KEY, usersData);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLocalStorageItem(CURRENT_USER_STORAGE_KEY, user);
    } else {
      removeLocalStorageItem(CURRENT_USER_STORAGE_KEY);
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