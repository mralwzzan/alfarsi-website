import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const goAfterAuth = (email) => {
    const owner = email.toLowerCase() === 'mr.alwzzan@gmail.com';
    navigate(owner ? '/admin' : '/dashboard', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isSupabaseConfigured) {
      setError('لم يتم ربط قاعدة البيانات بعد. تواصل مع مدير الموقع لإكمال الإعداد.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        });
        if (error) throw error;
        if (data.session) {
          goAfterAuth(form.email);
        } else {
          setInfo('✅ تم إنشاء الحساب! يمكنك الآن تسجيل الدخول.');
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        goAfterAuth(form.email);
      }
    } catch (err) {
      const msg = err?.message || 'حدث خطأ، حاول مرة أخرى.';
      if (msg.includes('Invalid login')) setError('البريد أو كلمة المرور غير صحيحة.');
      else if (msg.includes('already registered')) setError('هذا البريد مسجّل مسبقاً. سجّل الدخول.');
      else if (msg.includes('at least')) setError('كلمة المرور قصيرة (6 أحرف على الأقل).');
      else setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="text-4xl">⚖️</div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">الفارس</h1>
            <p className="text-xs text-slate-500">مكتب محاماة</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${mode === 'login' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-bold transition ${mode === 'signup' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              حساب جديد
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {info && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{info}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="محمد علي"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {busy ? 'جارٍ المعالجة...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
              {!busy && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        <Link to="/" className="block text-center text-slate-500 hover:text-blue-600 mt-6 font-semibold">
          ← العودة للموقع
        </Link>
      </div>
    </div>
  );
}
