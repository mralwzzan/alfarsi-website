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
    let settled = false;
    const finish = () => { if (!settled) { settled = true; setLoading(false); } };
    supabase.auth.getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => {})
      .finally(finish);
    // أمان: لا تُبقِ شاشة التحميل معلّقة أكثر من 8 ثوانٍ (مثلاً عند بطء القاعدة)
    const timer = setTimeout(finish, 8000);
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, []);

  // تحديد دور المستخدم: مالك / موظف / عميل
  useEffect(() => {
    let active = true;
    const resolve = async () => {
      const email = user?.email?.toLowerCase();
      if (!email) { setRole(null); return; }
      if (email === OWNER_EMAIL.toLowerCase()) { setRole('owner'); return; }
      try {
        const { data } = await supabase.from('staff').select('role').eq('email', email).maybeSingle();
        if (!active) return;
        setRole(data ? (data.role || 'employee') : 'client');
      } catch (e) {
        if (active) setRole('client');
      }
    };
    resolve();
    // أمان: لا تُبقِ تحديد الدور معلّقاً
    const timer = setTimeout(() => { if (active) setRole((r) => r ?? 'client'); }, 8000);
    return () => { active = false; clearTimeout(timer); };
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
