import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Restaurant } from '@/components/RestaurantSelector';

interface RestaurantContextType {
  selectedRestaurant: Restaurant | undefined;
  setSelectedRestaurant: (restaurant: Restaurant | undefined) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  children: ReactNode;
}

// Default Amici Coffee restaurant data
const defaultRestaurant: Restaurant = {
  id: '24e2799f-60d5-4e3b-bb30-b8049c9ae56d',
  name: 'Amici Coffee',
  address: '123 Fine Dining Street, Downtown District',
  cuisine: 'Coffee & Dining',
  rating: 4.8,
  imageUrl: '/amicicoffee.jpg'
};

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>(defaultRestaurant);

  return (
    <RestaurantContext.Provider value={{ selectedRestaurant, setSelectedRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}; 