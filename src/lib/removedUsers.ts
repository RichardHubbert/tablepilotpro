const REMOVED_USERS_KEY = 'tablepilot.removedUsers';

export const readRemovedUserIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(REMOVED_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) as unknown : [];
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
};

export const rememberRemovedUser = (id: string): void => {
  const ids = readRemovedUserIds();
  ids.add(id);
  localStorage.setItem(REMOVED_USERS_KEY, JSON.stringify([...ids]));
};

export const forgetRemovedUser = (id: string): void => {
  const ids = readRemovedUserIds();
  ids.delete(id);
  localStorage.setItem(REMOVED_USERS_KEY, JSON.stringify([...ids]));
};
