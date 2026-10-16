import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ADMIN_SESSION_KEY, isAdminUser, passwordMatchesAdmin } from '@/lib/admin';
import { findUserIdByEmail } from '@/lib/userEmails';
import { AppRole, isManagerRole, toAppRole } from '@/lib/roles';
import {
  clearLocalAccount,
  hasPasswordOverride,
  passwordMatchesUser,
  readLocalAccount,
  saveLocalAccount,
  type LocalAccount,
} from '@/lib/passwords';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ role: AppRole }>;
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
  const [localAccount, setLocalAccount] = useState<LocalAccount | null>(readLocalAccount);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [roleReady, setRoleReady] = useState(true);
  const isOwner = localAdmin || isAdminUser(user?.email) || isAdminUser(localAccount?.email);
  const isAdmin = isOwner || profileRole === 'admin' || localAccount?.role === 'admin';
  const isManager = isAdmin || isManagerRole(profileRole) || isManagerRole(localAccount?.role);
  const signedIn = localAdmin || !!localAccount || !!user;
  const loading = authLoading || (!!user && !localAdmin && !localAccount && !roleReady);

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

  const signIn = async (email: string, password: string): Promise<{ role: AppRole }> => {
    const normalizedEmail = email.trim();
    if (isAdminUser(normalizedEmail) && await passwordMatchesAdmin(password)) {
      localStorage.setItem(ADMIN_SESSION_KEY, '1');
      setLocalAdmin(true);
      return { role: 'admin' };
    }

    if (hasPasswordOverride(normalizedEmail)) {
      if (!await passwordMatchesUser(normalizedEmail, password)) {
        throw new Error('That email and password do not match.');
      }

      const userId = findUserIdByEmail(normalizedEmail);
      let storedRole = 'user';
      if (userId) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId);
        storedRole = profiles?.[0]?.role || 'user';
      }
      const account: LocalAccount = {
        email: normalizedEmail.toLowerCase(),
        userId,
        role: storedRole,
      };
      saveLocalAccount(account);
      setLocalAccount(account);
      setProfileRole(storedRole);
      setRoleReady(true);
      return { role: toAppRole(storedRole) };
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
      return { role: 'admin' };
    }

    let role: AppRole = 'user';
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      role = toAppRole(profile?.role);
      setProfileRole(profile?.role ?? null);
      setRoleReady(true);
    }
    return { role };
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    clearLocalAccount();
    setLocalAdmin(false);
    setLocalAccount(null);
    setProfileRole(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isOwner, isAdmin, isManager, signedIn, signIn, signOut }}>
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
