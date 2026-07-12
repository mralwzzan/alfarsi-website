import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CalendarClock, Wand2, Trash2, CalendarPlus, ClipboardPaste,
  IdCard, Hash, FileText, Clock, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { parseNotice, buildReminder, buildICS } from '../lib/parseNotice';

const STORAGE_KEY = 'appointment_reminders';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
const save = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* تجاهل */ }
};

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const fmtGregorian = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const fmtTime12 = (time, period) => {
  if (!time) return '';
  let [h, m] = time.split(':').map(Number);
  const p = period === 'pm' ? 'مساءً' : 'صباحاً';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${p}`;
};

// حساب الأيام المتبقية للموعد
const daysLeft = (iso) => {
  if (!iso) return null;
  const now = new Date();
  const target = new Date(iso);
  const diff = Math.ceil((target - now) / 86400000);
  return diff;
};

const countdownLabel = (iso) => {
  const d = daysLeft(iso);
  if (d === null) return { text: 'بدون تاريخ', cls: 'bg-slate-100 text-slate-500' };
  if (d < 0) return { text: 'انتهى الموعد', cls: 'bg-slate-100 text-slate-400' };
  if (d === 0) return { text: 'اليوم', cls: 'bg-brand-100 text-brand-700' };
  if (d === 1) return { text: 'غداً', cls: 'bg-gold-100 text-gold-700' };
  if (d <= 7) return { text: `بعد ${d} أيام`, cls: 'bg-gold-100 text-gold-700' };
  return { text: `بعد ${d} يوماً`, cls: 'bg-green-100 text-green-700' };
};

const emptyFields = { identity: '', caseType: '', caseNumber: '', hijri: '', time: '', period: 'am', raw: '' };

const SAMPLE = `صاحب الهوية:
******1838
نبلغكم بتحديد موعد الجلسة المرئية للقضية
إقامة ناظر على وقف
رقم:
4772740237
 بتاريخ:
1448/02/09
الساعة: 11:30 صباحاً
ويمكنكم الاطلاع على كافة التفاصيل عبر ناجز.`;

export default function Reminders() {
  const [text, setText] = useState('');
  const [fields, setFields] = useState(emptyFields);
  const [parsed, setParsed] = useState(false);
  const [reminders, setReminders] = useState(load);
  const [flash, setFlash] = useState('');

  useEffect(() => save(reminders), [reminders]);

  // ترتيب التذكيرات حسب الأقرب زمنياً
  const sorted = useMemo(
    () =>
      [...reminders].sort((a, b) => {
        if (!a.startISO) return 1;
        if (!b.startISO) return -1;
        return new Date(a.startISO) - new Date(b.startISO);
      }),
    [reminders],
  );

  const organize = () => {
    const f = parseNotice(text);
    setFields(f);
    setParsed(true);
  };

  const preview = useMemo(() => (parsed ? buildReminder(fields) : null), [parsed, fields]);

  const addReminder = () => {
    const r = buildReminder({ ...fields, raw: fields.raw || text });
    setReminders((prev) => [...prev, r]);
    setText('');
    setFields(emptyFields);
    setParsed(false);
    setFlash('تمت إضافة التذكير ✅');
    setTimeout(() => setFlash(''), 2500);
  };

  const remove = (id) => setReminders((prev) => prev.filter((r) => r.id !== id));

  const downloadICS = (reminder) => {
    const ics = buildICS(reminder);
    if (!ics) {
      alert('لا يمكن إنشاء ملف التقويم بدون تاريخ ووقت صحيحين.');
      return;
    }
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reminder-${reminder.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setText(t);
    } catch {
      setFlash('تعذّر الوصول للحافظة — الصق يدوياً.');
      setTimeout(() => setFlash(''), 2500);
    }
  };

  const setF = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.jpeg" alt="الفارس" className="h-11 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-brand-700 font-bold">
            <Bell size={20} /> تذكير المواعيد
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <CalendarClock className="text-brand-600" /> مواعيدي وتذكيراتي
          </h1>
          <p className="text-slate-500">
            الصق رسالة التبليغ في الأسفل واضغط «رتّب الموعد تلقائياً» — سنستخرج التفاصيل وننشئ تذكيراً بعدّاد تنازلي وإمكانية إضافته لتقويم جوالك.
          </p>
        </div>

        {flash && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} /> {flash}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* لصق الرسالة + الترتيب التلقائي */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardPaste size={22} className="text-brand-600" /> الصق نص الرسالة
            </h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 h-52 resize-none leading-7"
              placeholder="الصق هنا رسالة التبليغ كاملة..."
              dir="rtl"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={organize}
                disabled={!text.trim()}
                className="flex-1 min-w-[180px] bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Wand2 size={18} /> رتّب الموعد تلقائياً
              </button>
              <button
                onClick={pasteFromClipboard}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:border-brand-400 hover:text-brand-600 font-semibold transition"
              >
                لصق من الحافظة
              </button>
            </div>

            <button
              onClick={() => setText(SAMPLE)}
              className="text-slate-400 hover:text-brand-600 text-sm mt-3 underline decoration-dotted"
            >
              تجربة برسالة مثال
            </button>
          </section>

          {/* الحقول المستخرجة + المعاينة */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={22} className="text-brand-600" /> التفاصيل المستخرجة
            </h2>

            {!parsed ? (
              <div className="text-center text-slate-400 py-12">
                <Wand2 size={40} className="mx-auto mb-3 opacity-40" />
                <p>الصق الرسالة ثم اضغط «رتّب الموعد تلقائياً»</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="موضوع القضية / الموعد" icon={FileText}
                  value={fields.caseType} onChange={(v) => setF('caseType', v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="رقم الهوية" icon={IdCard}
                    value={fields.identity} onChange={(v) => setF('identity', v)} />
                  <Field label="رقم القضية" icon={Hash}
                    value={fields.caseNumber} onChange={(v) => setF('caseNumber', v)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="التاريخ الهجري (سنة/شهر/يوم)" icon={CalendarClock}
                    value={fields.hijri} onChange={(v) => setF('hijri', v)} placeholder="1448/02/09" />
                  <div>
                    <label className="block text-slate-600 text-sm font-semibold mb-1 flex items-center gap-1">
                      <Clock size={14} /> الوقت
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={fields.time}
                        onChange={(e) => setF('time', e.target.value)}
                        placeholder="11:30"
                        className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500"
                      />
                      <select
                        value={fields.period}
                        onChange={(e) => setF('period', e.target.value)}
                        className="bg-slate-50 border border-slate-300 px-2 py-2 rounded-lg focus:outline-none focus:border-brand-500"
                      >
                        <option value="am">صباحاً</option>
                        <option value="pm">مساءً</option>
                      </select>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-800 flex items-center gap-2">
                    <ArrowRight size={16} />
                    {preview.gregorian
                      ? `الموعد الميلادي: ${fmtGregorian(preview.startISO)} — ${fmtTime12(fields.time, fields.period)}`
                      : 'أدخل تاريخاً هجرياً صحيحاً لعرض المقابل الميلادي.'}
                  </div>
                )}

                <button
                  onClick={addReminder}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
                >
                  <Bell size={18} /> احفظ التذكير
                </button>
              </div>
            )}
          </section>
        </div>

        {/* قائمة التذكيرات */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarClock size={22} className="text-brand-600" /> تذكيراتي القادمة
            {reminders.length > 0 && (
              <span className="text-sm font-normal text-slate-400">({reminders.length})</span>
            )}
          </h2>

          {reminders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              لا توجد تذكيرات بعد — أضف موعدك الأول من الأعلى.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sorted.map((r) => {
                const cd = countdownLabel(r.startISO);
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-slate-800 leading-6">{r.caseType || 'موعد'}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cd.cls}`}>
                        {cd.text}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600">
                      {r.gregorian && (
                        <div className="flex items-center gap-2">
                          <CalendarClock size={15} className="text-brand-500" />
                          {fmtGregorian(r.startISO)}
                          {r.time && <span className="text-slate-400">— {fmtTime12(r.time, r.period)}</span>}
                        </div>
                      )}
                      {r.hijri && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="w-[15px]" /> التاريخ الهجري: {r.hijri}
                        </div>
                      )}
                      {r.caseNumber && (
                        <div className="flex items-center gap-2">
                          <Hash size={15} className="text-brand-500" /> رقم القضية: {r.caseNumber}
                        </div>
                      )}
                      {r.identity && (
                        <div className="flex items-center gap-2">
                          <IdCard size={15} className="text-brand-500" /> الهوية: {r.identity}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => downloadICS(r)}
                        disabled={!r.startISO}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <CalendarPlus size={16} /> أضف للتقويم
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="bg-slate-100 hover:bg-red-100 text-red-600 text-sm font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                      >
                        <Trash2 size={16} /> حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-center text-slate-400 text-xs mt-10">
          تُحفظ تذكيراتك محلياً على جهازك فقط. لتصلك تنبيهات في الموعد أضِف الموعد إلى تقويم جوالك عبر زر «أضف للتقويم».
        </p>
      </main>
    </div>
  );
}

// حقل إدخال قابل للتعديل مع أيقونة
function Field({ label, icon: Icon, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-slate-600 text-sm font-semibold mb-1 flex items-center gap-1">
        {Icon && <Icon size={14} />} {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500"
      />
    </div>
  );
}
