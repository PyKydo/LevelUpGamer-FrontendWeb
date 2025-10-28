import { useState, useMemo } from 'react';
import { SearchContext, type SearchContextType } from './SearchContext';

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const value = useMemo<SearchContextType>(() => ({
    searchTerm,
    setSearchTerm,
  }), [searchTerm]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
