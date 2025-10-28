import { createContext } from 'react';

export interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);