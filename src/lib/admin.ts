export const ADMIN_EMAIL = 'richardhubbert@gmail.com';

export const isAdminUser = (email: string | null | undefined): boolean => {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
};
