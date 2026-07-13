import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, OWNER_EMAIL } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // 'owner' | 'employee' | 'client' | null

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

  // تحديد دور المستخدم: مالك / موظف / عميل
  useEffect(() => {
    let active = true;
    const resolve = async () => {
      const email = user?.email?.toLowerCase();
      if (!email) { setRole(null); return; }
      if (email === OWNER_EMAIL.toLowerCase()) { setRole('owner'); return; }
      const { data } = await supabase.from('staff').select('role').eq('email', email).maybeSingle();
      if (!active) return;
      setRole(data ? (data.role || 'employee') : 'client');
    };
    resolve();
    return () => { active = false; };
  }, [user]);

  const isOwner = role === 'owner';
  const isEmployee = role === 'employee';
  const isStaff = role === 'owner' || role === 'employee';
  const roleLoading = !!user && role === null;

  const signOut = () => supabase?.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, role, isOwner, isEmployee, isStaff, roleLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
