import { useContext } from 'react';
import { SearchContext } from './SearchContext';

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe ser usado con un SearchProvider');
  }
  return context;
};
