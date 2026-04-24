import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Session, User } from '@supabase/supabase-js';
import { clearStoredUser, getStoredUser, setStoredUser, StoredUser } from './identity';
import { supabase } from './supabase';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-498ba2c0`;
const REQUEST_TIMEOUT_MS = 4500;
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const request = async (path: string, body: Record<string, string>) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const toStoredUser = (user: User | null): StoredUser | null => {
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: normalizeEmail(user.email),
    name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined,
    authenticated: true,
  };
};

const syncStoredUser = (session: Session | null): StoredUser | null => {
  const storedUser = toStoredUser(session?.user ?? null);
  if (storedUser) {
    setStoredUser(storedUser);
    return storedUser;
  }

  clearStoredUser();
  return null;
};

const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data.session ?? null;
};

export const auth = {
  async signUp(email: string, password: string, name: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    await request('/auth/signup', { email: normalizedEmail, password, name });

    await this.signIn(normalizedEmail, password);
  },

  async signIn(email: string, password: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const storedUser = syncStoredUser(data.session);
    if (!storedUser) {
      throw new Error('Could not start a signed-in session');
    }

  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    syncStoredUser(null);
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<StoredUser | null> {
    const session = await getSession();
    return syncStoredUser(session);
  },

  async getAccessToken(): Promise<string | null> {
    const session = await getSession();
    return session?.access_token ?? null;
  },

  onAuthStateChange(callback: (user: StoredUser | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(syncStoredUser(session));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  },

  getCachedUser(): StoredUser | null {
    return getStoredUser();
  },
};
