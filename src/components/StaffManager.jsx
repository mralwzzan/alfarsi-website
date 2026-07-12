import { useEffect, useMemo, useState } from 'react';
import {
  Users, UserPlus, Trash2, ToggleLeft, ToggleRight, CalendarClock,
  ChevronDown, ChevronUp, Hash, IdCard, Mail, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const fmtGregorian = (iso) => {
  if (!iso) return 'بدون تاريخ';
  const d = new Date(iso);
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const fmtTime12 = (time, period) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const p = period === 'pm' ? 'مساءً' : 'صباحاً';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${p}`;
};
const daysLeft = (iso) => (iso ? Math.ceil((new Date(iso) - new Date()) / 86400000) : null);
const cdLabel = (iso) => {
  const d = daysLeft(iso);
  if (d === null) return { t: 'بدون تاريخ', c: 'bg-slate-100 text-slate-500' };
  if (d < 0) return { t: 'منتهٍ', c: 'bg-slate-100 text-slate-400' };
  if (d === 0) return { t: 'اليوم', c: 'bg-brand-100 text-brand-700' };
  if (d === 1) return { t: 'غداً', c: 'bg-gold-100 text-gold-700' };
  if (d <= 7) return { t: `بعد ${d} أيام`, c: 'bg-gold-100 text-gold-700' };
  return { t: `بعد ${d} يوماً`, c: 'bg-green-100 text-green-700' };
};

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', full_name: '' });
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState({}); // مجموعات الموظفين المفتوحة

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from('staff').select('*').order('created_at', { ascending: true }),
      supabase.from('reminders').select('*').order('start_at', { ascending: true }),
    ]);
    setStaff(s || []);
    setReminders(r || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addEmployee = async (e) => {
    e.preventDefault();
    setMsg('');
    const email = form.email.trim().toLowerCase();
    if (!email) return;
    const { error } = await supabase
      .from('staff')
      .insert({ email, full_name: form.full_name.trim() || null });
    if (error) {
      setMsg(error.code === '23505' ? 'هذا البريد مُسجّل مسبقاً.' : 'تعذّرت الإضافة: ' + error.message);
      return;
    }
    setForm({ email: '', full_name: '' });
    setMsg('تمت إضافة الموظف ✅ — يسجّل دخوله بنفس البريد.');
    load();
  };

  const toggleActive = async (m) => {
    await supabase.from('staff').update({ active: !m.active }).eq('id', m.id);
    setStaff((prev) => prev.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)));
  };

  const removeEmployee = async (m) => {
    if (!window.confirm(`حذف الموظف ${m.full_name || m.email}؟ (لن تُحذف مواعيده)`)) return;
    await supabase.from('staff').delete().eq('id', m.id);
    setStaff((prev) => prev.filter((x) => x.id !== m.id));
  };

  const removeReminder = async (id) => {
    await supabase.from('reminders').delete().eq('id', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // تجميع المواعيد باسم/بريد كل موظف
  const groups = useMemo(() => {
    const map = {};
    for (const r of reminders) {
      const key = (r.created_by_email || r.created_by_name || 'غير معروف').toLowerCase();
      if (!map[key]) map[key] = { key, name: r.created_by_name || r.created_by_email || 'غير معروف', email: r.created_by_email || '', items: [] };
      map[key].items.push(r);
    }
    return Object.values(map).sort((a, b) => b.items.length - a.items.length);
  }, [reminders]);

  return (
    <div className="space-y-8 mt-8">
      {/* إدارة الموظفين */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Users size={22} className="text-brand-600" /> الموظفون ({staff.length})
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          أضف بريد الموظف، ثم يسجّل دخوله بنفس البريد ليحصل على صلاحية مواعيد الجلسات فقط.
        </p>

        {msg && <div className="bg-brand-50 border border-brand-200 text-brand-800 px-4 py-2.5 rounded-lg mb-4 text-sm">{msg}</div>}

        <form onSubmit={addEmployee} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 mb-5">
          <input
            type="email" value={form.email} required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="بريد الموظف"
            className="bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500"
          />
          <input
            type="text" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="اسم الموظف (اختياري)"
            className="bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500"
          />
          <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5">
            <UserPlus size={18} /> إضافة
          </button>
        </form>

        {loading ? (
          <p className="text-slate-400">جارٍ التحميل...</p>
        ) : staff.length === 0 ? (
          <p className="text-slate-400 text-center py-6">لا يوجد موظفون بعد.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-gold-600" /> {m.full_name || 'موظف'}
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1.5" dir="ltr">
                    <Mail size={13} /> {m.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(m)}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${m.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    title={m.active ? 'مُفعّل — اضغط للإيقاف' : 'موقوف — اضغط للتفعيل'}
                  >
                    {m.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {m.active ? 'مُفعّل' : 'موقوف'}
                  </button>
                  <button onClick={() => removeEmployee(m)} className="text-slate-400 hover:text-red-600" title="حذف">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* مواعيد الجلسات مجمّعة باسم كل موظف */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <CalendarClock size={22} className="text-brand-600" /> مواعيد الجلسات حسب الموظف
          <span className="text-sm font-normal text-slate-400">(إجمالي {reminders.length})</span>
        </h2>
        <p className="text-slate-400 text-sm mb-4">كل مجموعة تعرض المواعيد التي أضافها الموظف.</p>

        {loading ? (
          <p className="text-slate-400">جارٍ التحميل...</p>
        ) : groups.length === 0 ? (
          <p className="text-slate-400 text-center py-6">لا توجد مواعيد مُسجّلة بعد.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => {
              const open = expanded[g.key];
              return (
                <div key={g.key} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [g.key]: !p[g.key] }))}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-start"
                  >
                    <span className="font-bold text-slate-800">
                      {g.name}
                      {g.email && <span className="text-slate-400 font-normal text-sm mr-2" dir="ltr">({g.email})</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">{g.items.length} موعد</span>
                      {open ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                    </span>
                  </button>

                  {open && (
                    <div className="divide-y divide-slate-100">
                      {g.items.map((r) => {
                        const cd = cdLabel(r.start_at);
                        return (
                          <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                            <div className="min-w-0 text-sm">
                              <p className="font-semibold text-slate-800">{r.case_type || 'موعد جلسة'}</p>
                              <p className="text-slate-500 mt-0.5">
                                {fmtGregorian(r.start_at)}
                                {r.appt_time && ` — ${fmtTime12(r.appt_time, r.period)}`}
                                {r.hijri_date && <span className="text-slate-400"> • هجري {r.hijri_date}</span>}
                              </p>
                              <p className="text-slate-500 mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
                                {r.case_number && <span className="inline-flex items-center gap-1"><Hash size={12} /> {r.case_number}</span>}
                                {r.identity && <span className="inline-flex items-center gap-1"><IdCard size={12} /> {r.identity}</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cd.c}`}>{cd.t}</span>
                              <button onClick={() => removeReminder(r.id)} className="text-slate-400 hover:text-red-600" title="حذف الموعد">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
