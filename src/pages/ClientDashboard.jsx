import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const PRICES = { 'احوال شخصية': 300, 'تجارية': 750, 'عامة': 500, 'التوثيق': 750 };

// أوقات العمل العامة: من 9 صباحاً حتى 5 مساءً (كل استشارة ساعة)
const WORK_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

// أوقات خدمة التوثيق: من 8 صباحاً حتى منتصف الليل (كل أيام الأسبوع)
const DOC_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

// التوثيق يستثنى من قيود الأيام/الساعات العامة
const isDoc = (type) => type === 'التوثيق';
const hoursFor = (type) => (isDoc(type) ? DOC_HOURS : WORK_HOURS);
const dayAllowed = (dateStr, type) => {
  if (isDoc(type)) return true; // متاح كل الأيام
  const day = new Date(dateStr + 'T00:00:00').getDay(); // الأحد=0 ... الجمعة=5 السبت=6
  return day !== 5 && day !== 6;
};

const STATUS = {
  pending: { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'تمت الموافقة ✓', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
};

// تنسيق الوقت لعرض ودّي (مثال: 1:00 م)
const fmtTime = (hhmm) => {
  const [h] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${period}`;
};

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]); // الأوقات المحجوزة في التاريخ المختار
  const [dateError, setDateError] = useState('');
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
  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true });
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // إن جاء العميل بعد الضغط على خدمة معيّنة، نحدّدها مسبقاً
    const sel = sessionStorage.getItem('selectedService');
    if (sel && PRICES[sel]) {
      sessionStorage.removeItem('selectedService');
      setForm((f) => ({ ...f, type: sel }));
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // جلب الأوقات المحجوزة في تاريخ معيّن (من جميع العملاء) لإقفالها
  const fetchBooked = async (date) => {
    const { data } = await supabase.from('booked_times').select('time').eq('date', date);
    setBookedTimes((data || []).map((r) => r.time.slice(0, 5)));
  };

  // التحقق من التاريخ بحسب نوع الخدمة (التوثيق له قواعد مختلفة)
  const validate = (value, type) => {
    setForm((f) => ({ ...f, date: value, type, time: '' }));
    setMsg('');
    if (!value) {
      setBookedTimes([]);
      setDateError('');
      return;
    }
    if (!dayAllowed(value, type)) {
      setDateError('عذراً، أوقات العمل لهذه الخدمة من الأحد إلى الخميس فقط.');
      setBookedTimes([]);
      return;
    }
    setDateError('');
    fetchBooked(value);
  };

  const book = async (e) => {
    e.preventDefault();
    setMsg('');
    if (dateError) {
      setMsg('⚠️ ' + dateError);
      return;
    }
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
      if (error.code === '23505') {
        setMsg('⚠️ عذراً، هذا الموعد حُجز للتو. اختر وقتاً آخر.');
        fetchBooked(form.date);
      } else {
        setMsg('حدث خطأ: ' + error.message);
      }
      return;
    }
    setMsg('✅ تم إرسال طلب الحجز! سيصلك إشعار بالموافقة قريباً.');
    fetchBooked(form.date);
    setForm({ type: 'احوال شخصية', phone: form.phone, date: '', time: '', description: '' });
    setBookedTimes([]);
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
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Plus size={22} className="text-blue-600" /> حجز استشارة جديدة
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {isDoc(form.type)
                ? '🕗 التوثيق: متاح كل أيام الأسبوع، 8 صباحاً – 12 منتصف الليل'
                : '🕘 أوقات العمل: الأحد – الخميس، 9 صباحاً – 5 مساءً'}
            </p>
            {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm">{msg}</div>}
            <form onSubmit={book} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">نوع الاستشارة</label>
                <select
                  value={form.type}
                  onChange={(e) => validate(form.date, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="احوال شخصية">احوال شخصية - 300 ر.س</option>
                  <option value="تجارية">تجارية - 750 ر.س</option>
                  <option value="عامة">عامة - 500 ر.س</option>
                  <option value="التوثيق">التوثيق - 750 ر.س</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رقم الجوال</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="05xxxxxxxx" required />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">التاريخ</label>
                <input type="date" value={form.date} min={today} onChange={(e) => validate(e.target.value, form.type)}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500" required />
                {dateError && <p className="text-red-600 text-sm mt-2">{dateError}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">الوقت المتاح</label>
                {!form.date || dateError ? (
                  <p className="text-slate-400 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    اختر تاريخاً (الأحد – الخميس) لعرض الأوقات المتاحة.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {hoursFor(form.type).map((h) => {
                      const taken = bookedTimes.includes(h);
                      const selected = form.time === h;
                      return (
                        <button
                          key={h}
                          type="button"
                          disabled={taken}
                          onClick={() => setForm({ ...form, time: h })}
                          className={`py-2 rounded-lg text-sm font-semibold border transition ${
                            taken
                              ? 'bg-slate-100 text-slate-300 border-slate-200 line-through cursor-not-allowed'
                              : selected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {fmtTime(h)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">تفاصيل (اختياري)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="وصف موجز للموضوع..." />
              </div>
              <button type="submit" disabled={!form.time || !!dateError}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition">
                إرسال طلب الحجز
              </button>
            </form>
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
                        <span className="flex items-center gap-1"><Clock size={15} /> {fmtTime(a.time?.slice(0, 5))}</span>
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
