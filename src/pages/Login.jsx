import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, resolveRole } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState('login'); // login | signup
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  // توجيه المستخدم حسب دوره: الإدارة → لوحة الإدارة، الموظف → التذكيرات، العميل → لوحته
  const goAfterAuth = async () => {
    const { data } = await supabase.auth.getUser();
    const role = await resolveRole(data?.user);
    const dest = role === 'owner' ? '/admin' : role === 'employee' ? '/reminders' : '/dashboard';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isSupabaseConfigured) {
      setError(t('login.notConfigured'));
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name, phone: form.phone } },
        });
        if (error) throw error;
        if (data.session) {
          await goAfterAuth();
        } else {
          setInfo(t('login.signupSuccess'));
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        await goAfterAuth();
      }
    } catch (err) {
      const msg = err?.message || t('login.genericError');
      if (msg.includes('Invalid login')) setError(t('login.invalidLogin'));
      else if (msg.includes('already registered')) setError(t('login.alreadyReg'));
      else if (msg.includes('at least')) setError(t('login.shortPass'));
      else setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <LanguageToggle className="border-slate-300 text-slate-600 hover:border-brand-400 hover:text-brand-600 bg-white" />
        </div>
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logo.jpeg" alt={t('hero.logoAlt')} className="h-20 w-auto" />
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${mode === 'login' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
            >
              {t('login.loginTab')}
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${mode === 'signup' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
            >
              {t('login.signupTab')}
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {info && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{info}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-2">{t('login.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder={t('login.namePh')}
                  required
                />
              </div>
            )}
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-2">{t('login.phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">{t('login.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">{t('login.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {busy ? t('login.processing') : mode === 'login' ? t('login.loginBtn') : t('login.signupBtn')}
              {!busy && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        <Link to="/" className="block text-center text-slate-500 hover:text-brand-600 mt-6 font-semibold">
          {t('login.back')}
        </Link>
      </div>
    </div>
  );
}
