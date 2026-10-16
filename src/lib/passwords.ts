import { hashPassword } from '@/lib/admin';

const PASSWORD_HASHES_KEY = 'tablepilot.userPasswordHashes';
const LOCAL_ACCOUNT_KEY = 'tablepilot.account';

export type LocalAccount = {
  email: string;
  userId: string | null;
  role: string;
};

const readHashes = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(PASSWORD_HASHES_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
};

export const hasPasswordOverride = (email: string): boolean => {
  return Boolean(readHashes()[email.trim().toLowerCase()]);
};

export const passwordMatchesUser = async (email: string, password: string): Promise<boolean> => {
  const stored = readHashes()[email.trim().toLowerCase()];
  if (!stored) {
    return false;
  }
  return (await hashPassword(password)) === stored;
};

export const saveUserPassword = async (email: string, password: string): Promise<void> => {
  const hashes = readHashes();
  hashes[email.trim().toLowerCase()] = await hashPassword(password);
  localStorage.setItem(PASSWORD_HASHES_KEY, JSON.stringify(hashes));
};

export const readLocalAccount = (): LocalAccount | null => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as LocalAccount;
    if (!parsed?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveLocalAccount = (account: LocalAccount): void => {
  localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
};

export const clearLocalAccount = (): void => {
  localStorage.removeItem(LOCAL_ACCOUNT_KEY);
};
