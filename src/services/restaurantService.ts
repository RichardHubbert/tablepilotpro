import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Restaurant = TablesInsert<'restaurants'> & { id: string; county?: string };
export type RestaurantUpdate = TablesUpdate<'restaurants'>;

// Fetch all active restaurants
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }

  return data || [];
};

// Fetch all restaurants (including inactive) - for admin
export const fetchAllRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching all restaurants:', error);
    throw error;
  }

  return data || [];
};

// Fetch a single restaurant by ID
export const fetchRestaurantById = async (id: string): Promise<Restaurant | null> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }

  return data;
};

// Create a new restaurant
export const createRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();

  if (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }

  return data;
};

// Update an existing restaurant
export const updateRestaurant = async (id: string, updates: RestaurantUpdate): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }

  return data;
};

// Delete a restaurant (soft delete by setting is_active to false)
export const deleteRestaurant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('restaurants')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};

// Hard delete a restaurant (permanent removal)
export const hardDeleteRestaurant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error hard deleting restaurant:', error);
    throw error;
  }
};

// Restore a deleted restaurant
export const restoreRestaurant = async (id: string): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error restoring restaurant:', error);
    throw error;
  }

  return data;
};

// Search restaurants by name, cuisine, or address
export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,address.ilike.%${query}%`)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching restaurants:', error);
    throw error;
  }

  return data || [];
}; 