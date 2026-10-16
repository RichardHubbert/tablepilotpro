import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { AppRole, toStoredRole } from '@/lib/roles';
import { findUserIdByEmail } from '@/lib/userEmails';
import type { Session } from '@supabase/supabase-js';

export type User = TablesInsert<'profiles'> & { id: string };
export type UserUpdate = TablesUpdate<'profiles'>;

export type UserRole = AppRole;

// Fetch all users (admin only)
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

// Fetch a single user by ID
export const fetchUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
};

// Create a new user profile
export const createUserProfile = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
};

// Update an existing user
export const updateUser = async (id: string, updates: UserUpdate): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data?.[0] ?? null;
};

// Delete a user (soft delete by setting role to inactive)
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'inactive' })
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Hard delete a user (permanent removal)
export const hardDeleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error hard deleting user:', error);
    throw error;
  }
};

// Restore a deleted user
export const restoreUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error restoring user:', error);
    throw error;
  }

  return data;
};

// Search users by name, email, or role
export const searchUsers = async (query: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,company_name.ilike.%${query}%,role.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching users:', error);
    throw error;
  }

  return data || [];
};

// Get user count by role
export const getUserCountByRole = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role');

  if (error) {
    console.error('Error getting user count by role:', error);
    throw error;
  }

  const counts: Record<string, number> = {};
  data?.forEach(user => {
    counts[user.role] = (counts[user.role] || 0) + 1;
  });

  return counts;
};

export type InviteResult = {
  user: User;
  alreadyExisted: boolean;
};

const restoreSession = async (previous: Session | null) => {
  await supabase.auth.signOut();
  if (previous) {
    await supabase.auth.setSession({
      access_token: previous.access_token,
      refresh_token: previous.refresh_token,
    });
  }
};

const updateProfile = async (
  userId: string,
  profile: { full_name: string; company_name: string; role: string }
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('user_id', userId)
    .select();

  if (error) {
    throw error;
  }
  return data?.[0] ?? null;
};

const insertProfile = async (
  userId: string,
  profile: { full_name: string; company_name: string; role: string }
): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, ...profile })
    .select();

  if (!error && data?.[0]) {
    return data[0];
  }

  if (error?.code === '23505') {
    const updated = await updateProfile(userId, profile);
    if (updated) {
      return updated;
    }
    const { data: existing, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
    if (readError) {
      throw readError;
    }
    if (existing?.[0]) {
      return existing[0];
    }
  }

  throw error ?? new Error('Failed to save user profile');
};

const signInAndSave = async (
  email: string,
  password: string,
  profile: { full_name: string; company_name: string; role: string },
  previous: Session | null
): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error('This email is already registered. Enter the password already on that account.');
  }

  try {
    return await updateProfile(data.user.id, profile) ?? await insertProfile(data.user.id, profile);
  } finally {
    await restoreSession(previous);
  }
};

// Add a user. profiles.user_id must reference auth.users, and the public client
// cannot call the admin create-user API. Public signup creates the auth row,
// then the profile is inserted directly. An email this browser already added is
// updated without calling signup again.
export const inviteUser = async (
  email: string,
  role: UserRole,
  fullName?: string,
  companyName?: string,
  password?: string
): Promise<InviteResult> => {
  const storedRole = toStoredRole(role);
  const signupPassword = password?.trim() ?? '';
  const normalizedEmail = email.trim();
  if (signupPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const profile = {
    full_name: fullName || '',
    company_name: companyName || '',
    role: storedRole,
  };
  const { data: existingSession } = await supabase.auth.getSession();
  const previous = existingSession.session;

  if (findUserIdByEmail(normalizedEmail)) {
    const user = await signInAndSave(normalizedEmail, signupPassword, profile, previous);
    return { user, alreadyExisted: true };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: signupPassword,
    options: { data: profile },
  });

  if (signUpError) {
    if (signUpError.message === 'User already registered') {
      const user = await signInAndSave(normalizedEmail, signupPassword, profile, previous);
      return { user, alreadyExisted: true };
    }
    throw new Error(signUpError.message);
  }

  const authUser = signUpData.user;
  if (!authUser) {
    throw new Error('Failed to create user');
  }

  if (authUser.identities && authUser.identities.length === 0) {
    const user = await signInAndSave(normalizedEmail, signupPassword, profile, previous);
    return { user, alreadyExisted: true };
  }

  try {
    const user = await insertProfile(authUser.id, profile);
    return { user, alreadyExisted: false };
  } finally {
    await restoreSession(previous);
  }
};

// Get all bookings for Amici Coffee (for customer analysis)
export const getAmiciCoffeeBookings = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('restaurant_id', '24e2799f-60d5-4e3b-bb30-b8049c9ae56d')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Amici Coffee bookings:', error);
    throw error;
  }

  return data || [];
};

// Get customer booking history
export const getCustomerHistory = async (customerEmail: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_email', customerEmail)
    .eq('restaurant_id', '24e2799f-60d5-4e3b-bb30-b8049c9ae56d')
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching customer history:', error);
    throw error;
  }

  return data || [];
};

// Get unique customers for Amici Coffee
export const getAmiciCoffeeCustomers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('customer_email, customer_name, customer_phone')
    .eq('restaurant_id', '24e2799f-60d5-4e3b-bb30-b8049c9ae56d')
    .neq('status', 'cancelled');

  if (error) {
    console.error('Error fetching Amici Coffee customers:', error);
    throw error;
  }

  // Remove duplicates and return unique customers
  const uniqueCustomers = data?.filter((customer, index, self) => 
    index === self.findIndex(c => c.customer_email === customer.customer_email)
  ) || [];

  return uniqueCustomers;
}; 