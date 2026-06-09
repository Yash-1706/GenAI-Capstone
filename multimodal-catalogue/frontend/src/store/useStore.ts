import { create } from 'zustand';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_urls: string[];
  attributes: Record<string, string>;
  ai_generated: boolean;
}

export interface SearchResult {
  product: Product;
  score: number;
}

interface StoreState {
  searchResults: SearchResult[];
  searchEventId: string | null;
  setSearchResults: (results: SearchResult[], eventId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  searchResults: [],
  searchEventId: null,
  setSearchResults: (results, eventId) => set({ searchResults: results, searchEventId: eventId }),
}));
