import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useLang } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

// صفحة تعيين كلمة مرور جديدة — يصلها المستخدم عبر رابط الاستعادة في بريده
export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isSupabaseConfigured) {
      setError(t('login.notConfigured'));
      return;
    }
    if (pass.length < 6) {
      setError(t('login.shortPass'));
      return;
    }
    if (pass !== confirm) {
      setError(t('login.passwordMismatch'));
      return;
    }

    setBusy(true);
    try {
      // رابط الاستعادة ينشئ جلسة مؤقتة تلقائياً؛ نحدّث كلمة المرور عليها
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      setInfo(t('login.resetSuccess'));
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('at least')) setError(t('login.shortPass'));
      else if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired')) {
        setError(t('login.resetLinkInvalid'));
      } else setError(msg || t('login.genericError'));
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
          <h2 className="text-xl font-bold text-brand-700 mb-6 text-center">{t('login.resetTitle')}</h2>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {info && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{info}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">{t('login.newPassword')}</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">{t('login.confirmPassword')}</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {busy ? t('login.resetProcessing') : t('login.updatePassword')}
              {!busy && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        <Link to="/login" className="block text-center text-slate-500 hover:text-brand-600 mt-6 font-semibold">
          {t('login.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
