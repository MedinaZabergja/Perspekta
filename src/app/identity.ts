const USER_STORAGE_KEY = 'perspekta_user';
const ANON_USER_ID_STORAGE_KEY = 'perspekta_user_id';
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface StoredUser {
  id: string;
  email: string;
  name?: string;
  authenticated: boolean;
}

export const getStoredUser = (): StoredUser | null => {
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  if (!userJson) return null;

  try {
    const parsed = JSON.parse(userJson);
    if (!parsed?.authenticated || !parsed?.id || !parsed?.email) {
      return null;
    }

    return {
      ...parsed,
      email: normalizeEmail(parsed.email),
    };
  } catch {
    return null;
  }
};

export const setStoredUser = (user: StoredUser): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
    ...user,
    email: normalizeEmail(user.email),
  }));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getAnonymousUserId = (): string => {
  let userId = localStorage.getItem(ANON_USER_ID_STORAGE_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(ANON_USER_ID_STORAGE_KEY, userId);
  }
  return userId;
};

export const getAuthenticatedUserId = (userId: string): string => {
  return `auth:${userId}`;
};

export const getCurrentUserId = (): string => {
  const user = getStoredUser();
  if (user?.authenticated && user.id) {
    return getAuthenticatedUserId(user.id);
  }

  return getAnonymousUserId();
};
