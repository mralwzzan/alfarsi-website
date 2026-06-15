import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, Check, X, Plus, Trash2, User, Mail, Phone, CreditCard, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  pending: { label: 'قيد المراجعة', cls: 'bg-gold-100 text-gold-700' },
  approved: { label: 'تمت الموافقة', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
};

export default function OwnerDashboard() {
  const { signOut } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const [{ data: appts }, { data: avail }] = await Promise.all([
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
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

  const setStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // فتح واتساب برسالة تأكيد جاهزة لرقم العميل (يُرسل من رقم المكتب بنقرة)
  const sendWhatsAppConfirm = (a) => {
    const phone = (a.client_phone || '').replace(/[^0-9]/g, '').replace(/^0/, '966');
    if (!phone) {
      alert('لا يوجد رقم جوال لهذا العميل لإرسال التأكيد.');
      return;
    }
    const text =
      `مرحباً ${a.client_name} 👋\n` +
      `تم تأكيد موعد استشارتك في مكتب ساير بن فارس المطيري للمحاماة والاستشارات الشرعية والقانونية ✅\n\n` +
      `📋 نوع الاستشارة: ${a.consultation_type}\n` +
      `📅 التاريخ: ${a.date}\n` +
      `⏰ الوقت: ${a.time?.slice(0, 5)}\n` +
      `💳 القيمة: ${a.price} ر.س\n\n` +
      `يسعدنا خدمتك ونعتزّ بثقتك بنا. لأي استفسار نحن في خدمتك دائماً.\n` +
      `مع تحيات فريق مكتب ساير بن فارس المطيري ⚖️`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // الموافقة على الحجز + فتح رسالة التأكيد عبر واتساب مباشرة
  const approveAndNotify = (a) => {
    if (a.client_phone) sendWhatsAppConfirm(a); // متزامن للحفاظ على إذن فتح النافذة
    setStatus(a.id, 'approved');
  };

  const togglePaid = async (id, current) => {
    const payment_status = current === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('appointments').update({ payment_status }).eq('id', id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, payment_status } : a)));
  };

  const addSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) return;
    const { data, error } = await supabase.from('available_slots').insert(newSlot).select();
    if (!error && data) {
      setSlots((prev) => [...prev, ...data]);
      setNewSlot({ date: '', time: '' });
    }
  };

  const deleteSlot = async (id) => {
    await supabase.from('available_slots').delete().eq('id', id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    approved: appointments.filter((a) => a.status === 'approved').length,
  };

  const shown = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="مكتب ساير بن فارس المطيري" className="h-11 w-auto" />
            <span className="font-bold text-slate-800 hidden sm:inline">لوحة الإدارة</span>
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold">
            <LogOut size={20} /> خروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-brand-600">{counts.all}</div>
            <p className="text-slate-500 text-sm mt-1">إجمالي الحجوزات</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-gold-600">{counts.pending}</div>
            <p className="text-slate-500 text-sm mt-1">بانتظار الموافقة</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{counts.approved}</div>
            <p className="text-slate-500 text-sm mt-1">مؤكّدة</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Appointments */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-800">الحجوزات</h2>
              <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
                {[['all', 'الكل'], ['pending', 'قيد المراجعة'], ['approved', 'مؤكّدة']].map(([k, l]) => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${filter === k ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-slate-400">جارٍ التحميل...</p>
            ) : shown.length === 0 ? (
              <p className="text-slate-400 text-center py-8">لا توجد حجوزات في هذا التصنيف.</p>
            ) : (
              <div className="space-y-3">
                {shown.map((a) => {
                  const st = STATUS[a.status] || STATUS.pending;
                  return (
                    <div key={a.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <span className="font-bold text-slate-800">{a.consultation_type}</span>
                          <span className="text-slate-400 text-sm mr-2">({a.price} ر.س)</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1 mb-3">
                        <p className="flex items-center gap-2"><User size={15} /> {a.client_name}</p>
                        <p className="flex items-center gap-2"><Mail size={15} /> {a.client_email}</p>
                        {a.client_phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={15} />
                            <a href={`tel:${a.client_phone}`} className="text-brand-600 hover:underline">{a.client_phone}</a>
                            <a href={`https://wa.me/${a.client_phone.replace(/[^0-9]/g, '').replace(/^0/, '966')}`}
                              target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-xs">
                              (واتساب)
                            </a>
                          </p>
                        )}
                        <p className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><Calendar size={15} /> {a.date}</span>
                          <span className="flex items-center gap-1"><Clock size={15} /> {a.time?.slice(0, 5)}</span>
                        </p>
                        {a.description && <p className="text-slate-500 pt-1">📝 {a.description}</p>}
                        <p className="flex items-center gap-2 pt-1">
                          <CreditCard size={15} />
                          <span>{a.price} ر.س</span>
                          {a.payment_status === 'paid' ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">مدفوع ✓</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">غير مدفوع</span>
                          )}
                        </p>
                      </div>
                      {a.status !== 'approved' && (
                        <button onClick={() => approveAndNotify(a)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 ml-2">
                          <Check size={16} /> موافقة وتأكيد واتساب
                        </button>
                      )}
                      {a.status === 'approved' && a.client_phone && (
                        <button onClick={() => sendWhatsAppConfirm(a)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 ml-2">
                          <MessageCircle size={16} /> إعادة إرسال التأكيد
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button onClick={() => setStatus(a.id, 'rejected')}
                          className="bg-slate-100 hover:bg-red-100 text-red-600 text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1">
                          <X size={16} /> رفض
                        </button>
                      )}
                      <button onClick={() => togglePaid(a.id, a.payment_status)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1">
                        <CreditCard size={16} /> {a.payment_status === 'paid' ? 'إلغاء الدفع' : 'تعليم كمدفوع'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Available slots */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-4">المواعيد المتاحة</h2>
            <form onSubmit={addSlot} className="space-y-3 mb-5">
              <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" required />
              <input type="time" value={newSlot.time} onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" required />
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl inline-flex items-center justify-center gap-1">
                <Plus size={18} /> إضافة موعد متاح
              </button>
            </form>
            {slots.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-4">لا توجد مواعيد متاحة مضافة.</p>
            ) : (
              <div className="space-y-2">
                {slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <span className="text-slate-700">{s.date} • {s.time?.slice(0, 5)}</span>
                    <button onClick={() => deleteSlot(s.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
