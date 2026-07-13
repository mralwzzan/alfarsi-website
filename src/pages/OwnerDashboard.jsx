import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Calendar, Clock, Check, X, Plus, Trash2, User, Mail, Phone, CreditCard, MessageCircle, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { parseReminder } from '../lib/parseReminder';

const STATUS_CLS = {
  pending: 'bg-gold-100 text-gold-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// تنبيه صوتي قصير عند وصول طلب جديد
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    o.stop(ctx.currentTime + 0.45);
  } catch (e) { /* تجاهل */ }
};

export default function OwnerDashboard() {
  const { signOut, isOwner, isEmployee } = useAuth();
  const { t, lang } = useLang();
  const typeLabel = (ar) => t('types')[ar] || ar;
  // اسم اليوم (السبت/الأحد...) من التاريخ الميلادي
  const weekdayName = (g) => {
    if (!g) return '';
    try { return new Date(g + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }); }
    catch (e) { return ''; }
  };
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [reminders, setReminders] = useState([]);
  const [reminderText, setReminderText] = useState('');
  const [remindMsg, setRemindMsg] = useState('');
  const remindNotifiedRef = useRef(false);
  const [staffList, setStaffList] = useState([]);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMsg, setStaffMsg] = useState('');

  const byDate = (a, b) => (a.greg_date || '9999').localeCompare(b.greg_date || '9999');

  const load = async () => {
    setLoading(true);
    const [{ data: appts }, { data: avail }, { data: rem }] = await Promise.all([
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('available_slots').select('*').order('date', { ascending: true }),
      supabase.from('reminders').select('*').order('greg_date', { ascending: true }),
    ]);
    setAppointments(appts || []);
    setSlots(avail || []);
    setReminders((rem || []).sort(byDate));
    setLoading(false);
  };

  // إضافة تذكير من رسالة ملصوقة (استخراج تلقائي للتاريخ/الوقت/رقم القضية)
  const addReminder = async (e) => {
    e.preventDefault();
    if (!reminderText.trim()) return;
    const parsed = parseReminder(reminderText);
    const { data, error } = await supabase.from('reminders').insert(parsed).select();
    if (error) {
      setRemindMsg(error.message);
      return;
    }
    setReminders((prev) => [...(data || []), ...prev].sort(byDate));
    setReminderText('');
    setRemindMsg(parsed.greg_date ? '' : t('owner.remindParseNote'));
  };

  const deleteReminder = async (id) => {
    if (!window.confirm(t('owner.remindDeleteConfirm'))) return;
    await supabase.from('reminders').delete().eq('id', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // إدارة الموظفين (المالك فقط)
  const loadStaff = async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at', { ascending: true });
    setStaffList(data || []);
  };

  const addStaff = async (e) => {
    e.preventDefault();
    const email = staffEmail.trim().toLowerCase();
    if (!email) return;
    const { error } = await supabase.from('staff').insert({ email, role: 'employee' });
    if (error) {
      setStaffMsg(error.message);
      return;
    }
    setStaffEmail('');
    setStaffMsg(t('owner.staffAddedNote'));
    loadStaff();
  };

  const deleteStaff = async (email) => {
    if (!window.confirm(t('owner.staffDeleteConfirm'))) return;
    await supabase.from('staff').delete().eq('email', email);
    setStaffList((prev) => prev.filter((s) => s.email !== email));
  };

  // كم يوماً متبقياً حتى الموعد (بالتوقيت المحلي)
  const daysLeft = (g) => {
    if (!g) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(g + 'T00:00:00');
    return Math.round((target - today) / 86400000);
  };
  const daysLabel = (dl) => {
    if (dl === null || dl === undefined) return '';
    if (dl < 0) return t('owner.remindPassed');
    if (dl === 0) return t('owner.remindToday');
    if (dl === 1) return t('owner.remindTomorrow');
    return t('owner.remindInDays').replace('{n}', dl);
  };

  useEffect(() => {
    load();

    // طلب إذن إشعارات المتصفح (تنبيه على سطح المكتب حتى لو التبويب غير مفتوح)
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // الاشتراك في التحديث اللحظي: ينبّه فور وصول طلب حجز جديد
    const channel = supabase
      .channel('owner-appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        const a = payload.new;
        setAppointments((prev) => (prev.some((x) => x.id === a.id) ? prev : [a, ...prev]));
        const who = a.client_name || t('client.defaultName');
        setToast(`🔔 ${t('owner.toastA')}${who} — ${typeLabel(a.consultation_type)}`);
        playBeep();
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(t('owner.notifTitle'), { body: `${who} — ${typeLabel(a.consultation_type)}` });
          }
        } catch (e) { /* تجاهل */ }
        setTimeout(() => setToast(''), 9000);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحميل قائمة الموظفين (المالك فقط)
  useEffect(() => {
    if (isOwner) loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  // تنبيه المتصفح مرة واحدة بالتذكيرات المستحقّة اليوم/غداً
  useEffect(() => {
    if (remindNotifiedRef.current || reminders.length === 0) return;
    const soon = reminders.filter((r) => { const d = daysLeft(r.greg_date); return d === 0 || d === 1; });
    if (soon.length === 0) return;
    remindNotifiedRef.current = true;
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(t('owner.remindNotifTitle'), { body: `${t('owner.remindNotifA')}${soon.length}${t('owner.remindNotifB')}` });
      }
    } catch (e) { /* تجاهل */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  const setStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // فتح واتساب برسالة تأكيد جاهزة لرقم العميل (يُرسل من رقم المكتب بنقرة)
  const sendWhatsAppConfirm = (a) => {
    const phone = (a.client_phone || '').replace(/[^0-9]/g, '').replace(/^0/, '966');
    if (!phone) {
      alert(t('owner.noPhone'));
      return;
    }
    const text =
      `${t('owner.waHello')}${a.client_name} 👋\n` +
      `${t('owner.waConfirmed')}\n\n` +
      `📋 ${t('owner.waType')}: ${typeLabel(a.consultation_type)}\n` +
      `📅 ${t('owner.waDate')}: ${a.date}\n` +
      `⏰ ${t('owner.waTime')}: ${a.time?.slice(0, 5)}\n` +
      `💳 ${t('owner.waValue')}: ${a.price} ${t('prices.currency')}\n\n` +
      `${t('owner.waThanks')}\n` +
      `${t('owner.waRegards')}`;
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

  // قائمة العملاء (فريدة) مستخرجة من الحجوزات مع أرقام جوالهم
  const clients = Object.values(
    appointments.reduce((acc, a) => {
      const key = a.client_email || a.client_phone || a.client_name;
      if (!acc[key]) {
        acc[key] = { name: a.client_name, email: a.client_email, phone: a.client_phone, count: 0 };
      }
      if (!acc[key].phone && a.client_phone) acc[key].phone = a.client_phone;
      acc[key].count += 1;
      return acc;
    }, {})
  );

  const waLink = (phone) => `https://wa.me/${(phone || '').replace(/[^0-9]/g, '').replace(/^0/, '966')}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* تنبيه فوري عند وصول طلب جديد */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-pulse">
          <Bell size={20} /> {toast}
        </div>
      )}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt={t('hero.logoAlt')} className="h-11 w-auto" />
            <span className="font-bold text-slate-800 hidden sm:inline">{isEmployee ? t('owner.employeePanelTitle') : t('owner.panelTitle')}</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle className="border-slate-300 text-slate-600 hover:border-brand-400 hover:text-brand-600" />
            {isOwner && (
              <button onClick={() => setFilter('pending')} className="relative" title={t('owner.pendingAttr')}>
                <Bell size={24} className="text-slate-600" />
                {counts.pending > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {counts.pending}
                  </span>
                )}
              </button>
            )}
            <button onClick={signOut} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold">
            <LogOut size={20} /> {t('owner.signout')}
          </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* تنبيه الطلبات المعلّقة */}
        {isOwner && counts.pending > 0 && (
          <div className="mb-6 bg-gold-50 border-2 border-gold-300 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="text-gold-600" size={24} />
              <p className="font-bold text-brand-800">{t('owner.bannerA')}{counts.pending}{t('owner.bannerB')}</p>
            </div>
            <button onClick={() => setFilter('pending')} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-lg whitespace-nowrap">
              {t('owner.viewRequests')}
            </button>
          </div>
        )}

        {/* تذكيراتي (الجلسات والمواعيد) — استخراج تلقائي من رسالة ملصوقة */}
        <section className="mb-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Bell size={22} className="text-brand-600" /> {t('owner.remindHeading')}
          </h2>
          <p className="text-slate-400 text-sm mb-3">{t('owner.remindHint')}</p>
          {remindMsg && <div className="bg-gold-50 border border-gold-200 text-brand-800 px-4 py-2.5 rounded-lg mb-3 text-sm">{remindMsg}</div>}
          <form onSubmit={addReminder} className="mb-5">
            <textarea
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 h-24 resize-none text-sm"
              placeholder={t('owner.remindPlaceholder')}
            />
            <button type="submit" disabled={!reminderText.trim()}
              className="mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1">
              <Plus size={18} /> {t('owner.remindAdd')}
            </button>
          </form>

          {reminders.length === 0 ? (
            <p className="text-slate-400 text-center text-sm py-4">{t('owner.remindNone')}</p>
          ) : (
            <div className="space-y-2">
              {reminders.map((r) => {
                const dl = daysLeft(r.greg_date);
                const badgeCls = dl === null ? 'bg-slate-100 text-slate-500'
                  : dl < 0 ? 'bg-slate-100 text-slate-400'
                  : dl === 0 ? 'bg-red-100 text-red-700'
                  : dl === 1 ? 'bg-gold-100 text-gold-700'
                  : 'bg-brand-50 text-brand-700';
                return (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start gap-3">
                    <div className="text-sm space-y-1">
                      {(r.plaintiff || r.defendant) ? (
                        <>
                          {r.plaintiff && <p className="font-bold text-slate-800"><span className="text-slate-400 font-normal">{t('owner.remindPlaintiff')}:</span> {r.plaintiff}</p>}
                          {r.defendant && <p className="text-slate-700"><span className="text-slate-400">{t('owner.remindDefendant')}:</span> {r.defendant}</p>}
                        </>
                      ) : (
                        <p className="font-bold text-slate-800">{r.title || '—'}</p>
                      )}
                      {r.case_number && <p className="text-slate-500">{t('owner.remindCaseNo')}: <span dir="ltr">{r.case_number}</span></p>}
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                        {r.greg_date && <span className="flex items-center gap-1"><Calendar size={14} /> {weekdayName(r.greg_date)} <span dir="ltr">{r.greg_date}</span></span>}
                        {r.hijri_date && <span className="text-slate-400">{t('owner.remindHijri')}: <span dir="ltr">{r.hijri_date}</span></span>}
                        {r.time && <span className="flex items-center gap-1"><Clock size={14} /> {t('owner.remindAt')} {r.time}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeCls}`}>{daysLabel(dl)}</span>
                      <button onClick={() => deleteReminder(r.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {isOwner && (
        <>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-brand-600">{counts.all}</div>
            <p className="text-slate-500 text-sm mt-1">{t('owner.statTotal')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-gold-600">{counts.pending}</div>
            <p className="text-slate-500 text-sm mt-1">{t('owner.statPending')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{counts.approved}</div>
            <p className="text-slate-500 text-sm mt-1">{t('owner.statApproved')}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Appointments */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-slate-800">{t('owner.bookings')}</h2>
              <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
                {[['all', t('owner.filterAll')], ['pending', t('owner.filterPending')], ['approved', t('owner.filterApproved')]].map(([k, l]) => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${filter === k ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-slate-400">{t('owner.loading')}</p>
            ) : shown.length === 0 ? (
              <p className="text-slate-400 text-center py-8">{t('owner.noneInCat')}</p>
            ) : (
              <div className="space-y-3">
                {shown.map((a) => {
                  const cls = STATUS_CLS[a.status] || STATUS_CLS.pending;
                  return (
                    <div key={a.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <span className="font-bold text-slate-800">{typeLabel(a.consultation_type)}</span>
                          <span className="text-slate-400 text-sm mr-2">({a.price} {t('prices.currency')})</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>{t('status.' + a.status)}</span>
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
                              {t('owner.waParen')}
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
                          <span>{a.price} {t('prices.currency')}</span>
                          {a.payment_status === 'paid' ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t('owner.paid')}</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t('owner.unpaid')}</span>
                          )}
                        </p>
                      </div>
                      {a.status !== 'approved' && (
                        <button onClick={() => approveAndNotify(a)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 ml-2">
                          <Check size={16} /> {t('owner.approve')}
                        </button>
                      )}
                      {a.status === 'approved' && a.client_phone && (
                        <button onClick={() => sendWhatsAppConfirm(a)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 ml-2">
                          <MessageCircle size={16} /> {t('owner.resend')}
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button onClick={() => setStatus(a.id, 'rejected')}
                          className="bg-slate-100 hover:bg-red-100 text-red-600 text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1">
                          <X size={16} /> {t('owner.reject')}
                        </button>
                      )}
                      <button onClick={() => togglePaid(a.id, a.payment_status)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1">
                        <CreditCard size={16} /> {a.payment_status === 'paid' ? t('owner.unmarkPaid') : t('owner.markPaid')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Available slots */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('owner.availTitle')}</h2>
            <form onSubmit={addSlot} className="space-y-3 mb-5">
              <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" required />
              <input type="time" value={newSlot.time} onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" required />
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl inline-flex items-center justify-center gap-1">
                <Plus size={18} /> {t('owner.addSlot')}
              </button>
            </form>
            {slots.length === 0 ? (
              <p className="text-slate-400 text-center text-sm py-4">{t('owner.noSlots')}</p>
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

        {/* Clients list */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={22} className="text-brand-600" /> {t('owner.clientsTitle')} ({clients.length})
          </h2>
          {clients.length === 0 ? (
            <p className="text-slate-400 text-center py-6">{t('owner.noClients')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-2 px-2 font-semibold">{t('owner.thName')}</th>
                    <th className="py-2 px-2 font-semibold">{t('owner.thEmail')}</th>
                    <th className="py-2 px-2 font-semibold">{t('owner.thPhone')}</th>
                    <th className="py-2 px-2 font-semibold">{t('owner.thBookings')}</th>
                    <th className="py-2 px-2 font-semibold">{t('owner.thContact')}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-3 px-2 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3 px-2 text-slate-600">{c.email || '-'}</td>
                      <td className="py-3 px-2 text-slate-600" dir="ltr">{c.phone || '-'}</td>
                      <td className="py-3 px-2 text-slate-600">{c.count}</td>
                      <td className="py-3 px-2">
                        {c.phone && (
                          <span className="flex items-center gap-3">
                            <a href={`tel:${c.phone}`} className="text-brand-600 hover:underline">{t('owner.call')}</a>
                            <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{t('owner.whatsapp')}</a>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* الموظفون (صلاحية التذكيرات فقط) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <User size={22} className="text-brand-600" /> {t('owner.staffHeading')}
          </h2>
          <p className="text-slate-400 text-sm mb-3">{t('owner.staffHint')}</p>
          {staffMsg && <div className="bg-gold-50 border border-gold-200 text-brand-800 px-4 py-2.5 rounded-lg mb-3 text-sm">{staffMsg}</div>}
          <form onSubmit={addStaff} className="flex flex-wrap gap-2 mb-4">
            <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)}
              dir="ltr" placeholder={t('owner.staffEmailPh')}
              className="flex-1 min-w-[220px] bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" required />
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1">
              <Plus size={18} /> {t('owner.staffAdd')}
            </button>
          </form>
          {staffList.length === 0 ? (
            <p className="text-slate-400 text-center text-sm py-4">{t('owner.staffNone')}</p>
          ) : (
            <div className="space-y-2">
              {staffList.map((s) => (
                <div key={s.email} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
                  <span className="text-slate-700" dir="ltr">{s.email}</span>
                  <button onClick={() => deleteStaff(s.email)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        </>
        )}
      </main>
    </div>
  );
}
