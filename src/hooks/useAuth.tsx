import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ADMIN_SESSION_KEY, isAdminUser, passwordMatchesAdmin } from '@/lib/admin';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ensureAdminProfile = async (userId: string) => {
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) {
    console.error('Error reading admin profile:', readError);
    return;
  }

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      user_id: userId,
      full_name: 'Richard Hubbert',
      company_name: 'TablePilot',
      role: 'admin',
    });
    if (error) {
      console.error('Error creating admin profile:', error);
    }
    return;
  }

  if (existing.role !== 'admin') {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating admin role:', error);
    }
  }
};

const readLocalAdmin = () => {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [localAdmin, setLocalAdmin] = useState(readLocalAdmin);
  const [loading, setLoading] = useState(true);
  const isAdmin = localAdmin || isAdminUser(user?.email);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim();
    if (isAdminUser(normalizedEmail) && await passwordMatchesAdmin(password)) {
      localStorage.setItem(ADMIN_SESSION_KEY, '1');
      setLocalAdmin(true);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!isAdminUser(data.user?.email)) {
      await supabase.auth.signOut();
      throw new Error('This sign-in is only for the administrator.');
    }

    if (data.user) {
      await ensureAdminProfile(data.user.id);
    }
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setLocalAdmin(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
