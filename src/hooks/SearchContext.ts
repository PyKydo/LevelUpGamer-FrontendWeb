import { createContext } from 'react';

export interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined,
);
