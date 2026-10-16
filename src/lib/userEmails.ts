const USER_EMAILS_KEY = 'tablepilot.userEmails';

export const readUserEmails = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(USER_EMAILS_KEY);
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

export const rememberUserEmail = (userId: string, email: string): void => {
  const emails = readUserEmails();
  emails[userId] = email.trim().toLowerCase();
  localStorage.setItem(USER_EMAILS_KEY, JSON.stringify(emails));
};

export const findUserIdByEmail = (email: string): string | null => {
  const target = email.trim().toLowerCase();
  const match = Object.entries(readUserEmails()).find(([, stored]) => stored === target);
  return match?.[0] ?? null;
};
