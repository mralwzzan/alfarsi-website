import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, OWNER_EMAIL } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isOwner =
    !!user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const signOut = () => supabase?.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, isOwner, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
