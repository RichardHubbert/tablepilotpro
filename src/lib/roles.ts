export type AppRole = 'user' | 'manager' | 'admin';

// The profiles check constraint allows admin, business, user, and inactive.
// Manager is stored as business so the choice can be saved.
export const toStoredRole = (role: AppRole): 'user' | 'business' | 'admin' => {
  return role === 'manager' ? 'business' : role;
};

export const toAppRole = (role: string | null | undefined): AppRole => {
  if (role === 'admin') {
    return 'admin';
  }
  if (role === 'business' || role === 'manager') {
    return 'manager';
  }
  return 'user';
};

export const roleLabel = (role: string | null | undefined): string => {
  if (role === 'inactive') {
    return 'Inactive';
  }
  if (toAppRole(role) === 'admin') {
    return 'Admin';
  }
  if (toAppRole(role) === 'manager') {
    return 'Manager';
  }
  return 'User';
};

export const isManagerRole = (role: string | null | undefined): boolean => {
  return role === 'business' || role === 'manager' || role === 'admin';
};
