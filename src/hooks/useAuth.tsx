import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ADMIN_SESSION_KEY, isAdminUser, passwordMatchesAdmin } from '@/lib/admin';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ admin: boolean }>;
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
  const [authLoading, setAuthLoading] = useState(true);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [roleReady, setRoleReady] = useState(true);
  const isAdmin = localAdmin || isAdminUser(user?.email) || profileRole === 'admin';
  const signedIn = localAdmin || !!user;
  const loading = authLoading || (!!user && !localAdmin && !roleReady);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileRole(null);
      setRoleReady(true);
      return;
    }

    let cancelled = false;
    setRoleReady(false);
    supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          console.error('Error reading profile role:', error);
        }
        setProfileRole(data?.role ?? null);
        setRoleReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim();
    if (isAdminUser(normalizedEmail) && await passwordMatchesAdmin(password)) {
      localStorage.setItem(ADMIN_SESSION_KEY, '1');
      setLocalAdmin(true);
      return { admin: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (isAdminUser(data.user?.email)) {
      if (data.user) {
        await ensureAdminProfile(data.user.id);
      }
      return { admin: true };
    }

    let admin = false;
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      admin = profile?.role === 'admin';
      setProfileRole(profile?.role ?? null);
      setRoleReady(true);
    }
    return { admin };
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setLocalAdmin(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signedIn, signIn, signOut }}>
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
