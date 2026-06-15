import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PRICES = { 'احوال شخصية': 300, 'تجارية': 750, 'عامة': 500 };

const STATUS = {
  pending: { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'تمت الموافقة ✓', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
};

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    type: 'احوال شخصية',
    phone: user?.user_metadata?.phone || '',
    date: '',
    time: '',
    description: '',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'عميلنا';

  const load = async () => {
    setLoading(true);
    const [{ data: appts }, { data: avail }] = await Promise.all([
      supabase.from('appointments').select('*').order('date', { ascending: true }),
      supabase.from('available_slots').select('*').order('date', { ascending: true }),
    ]);
    setAppointments(appts || []);
    setSlots(avail || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const book = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.date || !form.time) {
      setMsg('⚠️ الرجاء اختيار التاريخ والوقت.');
      return;
    }
    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      client_name: clientName,
      client_email: user.email,
      client_phone: form.phone,
      consultation_type: form.type,
      price: PRICES[form.type],
      date: form.date,
      time: form.time,
      description: form.description,
      status: 'pending',
    });
    if (error) {
      setMsg('حدث خطأ: ' + error.message);
      return;
    }
    setMsg('✅ تم إرسال طلب الحجز! سيصلك إشعار بالموافقة قريباً.');
    setForm({ type: 'احوال شخصية', phone: form.phone, date: '', time: '', description: '' });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            <span className="font-bold text-slate-800">مكتب الفارس</span>
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold">
            <LogOut size={20} /> خروج
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">أهلاً، {clientName} 👋</h1>
        <p className="text-slate-500 mb-8">من هنا تحجز استشاراتك وتتابع حالتها.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking form */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={22} className="text-blue-600" /> حجز استشارة جديدة
            </h2>
            {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm">{msg}</div>}
            <form onSubmit={book} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">نوع الاستشارة</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="احوال شخصية">احوال شخصية - 300 ر.س</option>
                  <option value="تجارية">تجارية - 750 ر.س</option>
                  <option value="عامة">عامة - 500 ر.س</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رقم الجوال</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="05xxxxxxxx" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">التاريخ</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">الوقت</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">تفاصيل (اختياري)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="وصف موجز للموضوع..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
                إرسال طلب الحجز
              </button>
            </form>

            {slots.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="font-semibold text-slate-700 mb-3">📋 مواعيد متاحة مقترحة (اضغط لاختيارها):</p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button key={s.id} onClick={() => setForm({ ...form, date: s.date, time: s.time?.slice(0, 5) })}
                      className="text-sm bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                      {s.date} • {s.time?.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* My appointments */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={22} className="text-blue-600" /> حجوزاتي
            </h2>
            {loading ? (
              <p className="text-slate-400">جارٍ التحميل...</p>
            ) : appointments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">لا توجد حجوزات بعد.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => {
                  const st = STATUS[a.status] || STATUS.pending;
                  return (
                    <div key={a.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800">{a.consultation_type}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={15} /> {a.date}</span>
                        <span className="flex items-center gap-1"><Clock size={15} /> {a.time?.slice(0, 5)}</span>
                        <span>{a.price} ر.س</span>
                      </div>
                      {a.description && <p className="text-sm text-slate-500 mt-2">{a.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
