import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, Plus, CreditCard, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPaymentConfigured } from '../lib/payment';
import PaymentModal from '../components/PaymentModal';

const PRICES = { 'احوال شخصية': 300, 'تجارية': 750, 'عامة': 500, 'التوثيق': 750, 'عمالية': 500 };

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
  pending: { label: 'قيد المراجعة', cls: 'bg-gold-100 text-gold-700' },
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

// أشهر السنة بالعربية لاختيار التاريخ
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

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
  const [paying, setPaying] = useState(null); // الحجز الجاري دفعه (يفتح نافذة الدفع)

  const clientName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'عميلنا';
  const today = new Date().toISOString().split('T')[0];

  // أجزاء التاريخ المختار (سنة/شهر/يوم) عبر قوائم منسدلة بالعربي
  const [dp, setDp] = useState({ y: '', m: '', d: '' });
  const thisYear = new Date().getFullYear();
  const YEARS = [thisYear, thisYear + 1];
  const daysInMonth = dp.y && dp.m ? new Date(Number(dp.y), Number(dp.m), 0).getDate() : 31;

  const onDatePart = (key, value) => {
    const parts = { ...dp, [key]: value };
    // تصحيح اليوم إن تجاوز عدد أيام الشهر الجديد
    if ((key === 'm' || key === 'y') && parts.d) {
      const maxD = parts.y && parts.m ? new Date(Number(parts.y), Number(parts.m), 0).getDate() : 31;
      if (Number(parts.d) > maxD) parts.d = '';
    }
    setDp(parts);
    if (parts.y && parts.m && parts.d) {
      const dateStr = `${parts.y}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`;
      validate(dateStr, form.type);
    } else {
      setForm((f) => ({ ...f, date: '', time: '' }));
      setBookedTimes([]);
      setDateError('');
    }
  };

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

    // العودة من بوابة Moyasar: التحقق من الدفع وتحديث الحالة
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('id');
    if (pid) {
      window.history.replaceState({}, '', '/dashboard');
      setMsg('⏳ جارٍ التحقق من الدفع...');
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: pid }),
      })
        .then((r) => r.json())
        .then((res) => {
          setMsg(res.paid ? '✅ تم الدفع بنجاح! شكراً لك.' : '⚠️ لم يكتمل الدفع، يرجى المحاولة مرة أخرى.');
          load();
        })
        .catch(() => setMsg('تعذّر التحقق من الدفع، يرجى التواصل معنا.'));
    }
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
    if (value < today) {
      setDateError('لا يمكن اختيار تاريخ ماضٍ.');
      setBookedTimes([]);
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

  // إلغاء حجز العميل — يحرّر الموعد ليصبح متاحاً من جديد
  const cancelBooking = async (a) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', a.id);
    if (error) {
      alert('تعذّر الإلغاء: ' + error.message);
      return;
    }
    setAppointments((prev) => prev.filter((x) => x.id !== a.id));
    if (form.date === a.date) fetchBooked(a.date);
  };

  // فتح نافذة الدفع لحجزٍ تمت الموافقة عليه
  const payNow = (a) => {
    if (!isPaymentConfigured) {
      alert('💳 الدفع الإلكتروني قيد الإعداد النهائي وسيتوفّر قريباً.\nيمكنك حالياً الدفع في المكتب أو عبر التحويل.');
      return;
    }
    setPaying(a);
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
    setDp({ y: '', m: '', d: '' });
    setBookedTimes([]);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.jpeg" alt="مكتب ساير بن فارس المطيري" className="h-11 w-auto" />
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
              <Plus size={22} className="text-brand-600" /> حجز استشارة جديدة
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {isDoc(form.type)
                ? '🕗 التوثيق: متاح كل أيام الأسبوع، 8 صباحاً – 12 منتصف الليل'
                : '🕘 أوقات العمل: الأحد – الخميس، 9 صباحاً – 5 مساءً'}
            </p>
            {msg && <div className="bg-brand-50 border border-brand-200 text-brand-800 px-4 py-3 rounded-lg mb-4 text-sm">{msg}</div>}
            <form onSubmit={book} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">نوع الاستشارة</label>
                <select
                  value={form.type}
                  onChange={(e) => validate(form.date, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  <option value="احوال شخصية">احوال شخصية - 300 ر.س</option>
                  <option value="تجارية">تجارية - 750 ر.س</option>
                  <option value="عامة">عامة - 500 ر.س</option>
                  <option value="عمالية">عمالية - 500 ر.س</option>
                  <option value="التوثيق">التوثيق - 750 ر.س</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">رقم الجوال</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500"
                  placeholder="05xxxxxxxx" required />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">التاريخ</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={dp.y} onChange={(e) => onDatePart('y', e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-3 py-3 rounded-xl focus:outline-none focus:border-brand-500">
                    <option value="">السنة</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={dp.m} onChange={(e) => onDatePart('m', e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-3 py-3 rounded-xl focus:outline-none focus:border-brand-500">
                    <option value="">الشهر</option>
                    {MONTHS.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
                  </select>
                  <select value={dp.d} onChange={(e) => onDatePart('d', e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-3 py-3 rounded-xl focus:outline-none focus:border-brand-500">
                    <option value="">اليوم</option>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      let closed = false;
                      if (dp.y && dp.m && !isDoc(form.type)) {
                        const wd = new Date(Number(dp.y), Number(dp.m) - 1, d).getDay();
                        closed = wd === 5 || wd === 6; // الجمعة / السبت
                      }
                      return <option key={d} value={d} disabled={closed}>{d}{closed ? ' (مغلق)' : ''}</option>;
                    })}
                  </select>
                </div>
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
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-brand-400'
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
                  className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 h-20 resize-none"
                  placeholder="وصف موجز للموضوع..." />
              </div>
              <button type="submit" disabled={!form.time || !!dateError}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition">
                إرسال طلب الحجز
              </button>
            </form>
          </section>

          {/* My appointments */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={22} className="text-brand-600" /> حجوزاتي
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
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        {a.payment_status === 'paid' ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">مدفوع ✓</span>
                        ) : a.status === 'approved' ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gold-100 text-gold-700">بانتظار الدفع</span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">غير مدفوع</span>
                        )}
                        <div className="flex gap-2">
                          {a.payment_status !== 'paid' && a.status === 'approved' && (
                            <button onClick={() => payNow(a)}
                              className="bg-slate-900 hover:bg-black text-white text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2">
                              <CreditCard size={16} /> ادفع الآن
                            </button>
                          )}
                          {a.payment_status !== 'paid' && a.status === 'pending' && (
                            <span className="text-xs text-slate-400 self-center">الدفع يُتاح بعد الموافقة</span>
                          )}
                          <button onClick={() => cancelBooking(a)}
                            className="bg-slate-100 hover:bg-red-100 text-red-600 text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1">
                            <Trash2 size={16} /> إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {paying && <PaymentModal appointment={paying} onClose={() => setPaying(null)} />}
    </div>
  );
}
