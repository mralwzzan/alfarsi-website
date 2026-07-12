import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, OWNER_EMAIL } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// يحدّد دور المستخدم: owner (الإدارة) | employee (موظف) | client (عميل)
export async function resolveRole(user) {
  if (!user?.email) return 'client';
  if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) return 'owner';
  if (!supabase) return 'client';
  // موظف إن كان بريده مُسجّلاً ومُفعّلاً في جدول staff
  const { data } = await supabase
    .from('staff')
    .select('email, active')
    .ilike('email', user.email)
    .eq('active', true)
    .maybeSingle();
  return data ? 'employee' : 'client';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setRole(await resolveRole(u));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setRole(await resolveRole(u));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isOwner = role === 'owner';
  const isEmployee = role === 'employee';
  const isStaff = isOwner || isEmployee; // من طاقم العمل (له صلاحية التذكيرات)

  const signOut = () => supabase?.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, role, loading, isOwner, isEmployee, isStaff, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
