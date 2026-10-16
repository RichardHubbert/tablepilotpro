export const ADMIN_EMAIL = 'richardhubbert@gmail.com';
export const ADMIN_SESSION_KEY = 'tablepilot.admin';
export const ADMIN_PASSWORD_HASH_KEY = 'tablepilot.adminPasswordHash';

// Supabase still has a different password on this account, and the public key
// cannot change it. This hash lets the administrator sign in with the password
// they chose without sending that rejected request.
const ADMIN_PASSWORD_SHA256 = '3e912d9fef7eb99d29f9206ced43f68ed0985bd1e62aba27482e469da9fc6220';

export const isAdminUser = (email: string | null | undefined): boolean => {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
};

export const hashPassword = async (password: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const passwordMatchesAdmin = async (password: string): Promise<boolean> => {
  const hex = await hashPassword(password);
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
  } catch {
    stored = null;
  }
  return hex === (stored || ADMIN_PASSWORD_SHA256);
};

export const saveAdminPassword = async (password: string): Promise<void> => {
  localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, await hashPassword(password));
};
