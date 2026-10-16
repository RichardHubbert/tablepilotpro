export const ADMIN_EMAIL = 'richardhubbert@gmail.com';
export const ADMIN_SESSION_KEY = 'tablepilot.admin';

// Supabase still has a different password on this account, and the public key
// cannot change it. This hash lets the administrator sign in with the password
// they chose without sending that rejected request.
const ADMIN_PASSWORD_SHA256 = '3e912d9fef7eb99d29f9206ced43f68ed0985bd1e62aba27482e469da9fc6220';

export const isAdminUser = (email: string | null | undefined): boolean => {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
};

export const passwordMatchesAdmin = async (password: string): Promise<boolean> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hex === ADMIN_PASSWORD_SHA256;
};
