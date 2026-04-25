import { createContext, useContext, useState } from 'react';
import { storage } from '../../../utils/storage';

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(storage.getUser()?.city || 'Select City');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const value = {
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    unreadCount,
    setUnreadCount,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
};

export default FilterContext;
