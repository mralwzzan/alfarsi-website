import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut, Plus, Trash2, Edit3, X, Bell, MapPin, MessageCircle, Phone, Home, Inbox,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SITE, toWa } from '../lib/site';
import {
  PROPERTY_TYPES, PURPOSES, CITIES, STATUSES, formatPrice, priceSuffix,
} from '../data/properties';

const BLANK = {
  title: '', type: 'شقة', purpose: 'بيع', city: 'الرياض', district: '',
  price: '', area: '', bedrooms: '', bathrooms: '', units: '', annual_income: '',
  description: '', image_url: '', featured: false, status: 'available',
};

// تنبيه صوتي قصير عند وصول استفسار جديد
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    o.stop(ctx.currentTime + 0.45);
  } catch { /* تجاهل */ }
};

export default function OwnerDashboard() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');

  const dbReady = isSupabaseConfigured;

  const load = async () => {
    if (!dbReady) { setLoading(false); return; }
    setLoading(true);
    const [{ data: props }, { data: inq }] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('property_inquiries').select('*').order('created_at', { ascending: false }),
    ]);
    setProperties(props || []);
    setInquiries(inq || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!dbReady) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const channel = supabase
      .channel('owner-inquiries')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_inquiries' }, (payload) => {
        const i = payload.new;
        setInquiries((prev) => (prev.some((x) => x.id === i.id) ? prev : [i, ...prev]));
        setToast(`🔔 استفسار جديد من ${i.name || 'زائر'} — ${i.property_title || ''}`);
        playBeep();
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('🔔 استفسار عقاري جديد', { body: `${i.name || 'زائر'} — ${i.property_title || ''}` });
          }
        } catch { /* تجاهل */ }
        setTimeout(() => setToast(''), 9000);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => { setForm(BLANK); setEditId(null); setMsg(''); };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      title: p.title || '', type: p.type || 'شقة', purpose: p.purpose || 'بيع',
      city: p.city || 'الرياض', district: p.district || '', price: p.price ?? '',
      area: p.area ?? '', bedrooms: p.bedrooms ?? '', bathrooms: p.bathrooms ?? '',
      units: p.units ?? '', annual_income: p.annual_income ?? '',
      description: p.description || '', image_url: p.image_url || '',
      featured: !!p.featured, status: p.status || 'available',
    });
    setTab('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!dbReady) { setMsg('⚠️ قاعدة البيانات غير مهيّأة بعد.'); return; }
    const payload = {
      title: form.title, type: form.type, purpose: form.purpose, city: form.city,
      district: form.district || null,
      price: form.price === '' ? null : Number(form.price),
      area: form.area === '' ? null : Number(form.area),
      bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
      bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
      units: form.units === '' ? null : Number(form.units),
      annual_income: form.annual_income === '' ? null : Number(form.annual_income),
      description: form.description || null,
      image_url: form.image_url || null,
      featured: form.featured, status: form.status,
    };
    if (editId) {
      const { error } = await supabase.from('properties').update(payload).eq('id', editId);
      if (error) { setMsg('خطأ: ' + error.message); return; }
      setProperties((prev) => prev.map((p) => (p.id === editId ? { ...p, ...payload } : p)));
      setMsg('✅ تم تحديث العقار.');
    } else {
      const { data, error } = await supabase.from('properties').insert(payload).select();
      if (error) { setMsg('خطأ: ' + error.message); return; }
      if (data) setProperties((prev) => [...data, ...prev]);
      setMsg('✅ تم إضافة العقار.');
    }
    resetForm();
  };

  const remove = async (id) => {
    if (!window.confirm('حذف هذا العقار نهائياً؟')) return;
    await supabase.from('properties').delete().eq('id', id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteInquiry = async (id) => {
    await supabase.from('property_inquiries').delete().eq('id', id);
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md">
          <p className="text-slate-700 mb-2 font-bold">قاعدة البيانات غير مهيّأة</p>
          <p className="text-slate-500 text-sm mb-4">يرجى ربط Supabase وتشغيل ملف <code>supabase_setup.sql</code> لتفعيل لوحة الإدارة.</p>
          <Link to="/" className="text-brand-600 font-bold hover:underline">العودة للموقع</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-pulse">
          <Bell size={20} /> {toast}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt={SITE.name} className="h-10 w-auto" />
            <span className="font-bold text-slate-800 hidden sm:inline">لوحة الإدارة</span>
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold">
            <LogOut size={20} /> خروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* تبويبات */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('properties')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${tab === 'properties' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Home size={18} /> العقارات ({properties.length})
          </button>
          <button onClick={() => setTab('inquiries')}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${tab === 'inquiries' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Inbox size={18} /> الاستفسارات ({inquiries.length})
          </button>
        </div>

        {tab === 'properties' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* نموذج العقار */}
            <section className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editId ? <Edit3 size={20} className="text-brand-600" /> : <Plus size={20} className="text-brand-600" />}
                  {editId ? 'تعديل عقار' : 'إضافة عقار'}
                </h2>
                {editId && <button onClick={resetForm} className="text-slate-400 hover:text-red-600"><X size={20} /></button>}
              </div>
              {msg && <div className="bg-brand-50 border border-brand-200 text-brand-800 px-3 py-2 rounded-lg mb-3 text-sm">{msg}</div>}
              <form onSubmit={save} className="space-y-3">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="عنوان العقار" required />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500">
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500">
                    {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500">
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="الحي" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="السعر (ر.س)" required />
                  <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="المساحة (م²)" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="غرف النوم" />
                  <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="دورات المياه" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="عدد الوحدات" />
                  <input type="number" value={form.annual_income} onChange={(e) => setForm({ ...form, annual_income: e.target.value })}
                    className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="الدخل السنوي (ر.س)" />
                </div>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="رابط الصورة (URL)" dir="ltr" />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 h-24 resize-none" placeholder="الوصف" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500">
                  {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <label className="flex items-center gap-2 text-slate-700 font-semibold">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-brand-600" />
                  عقار مميّز (يظهر في الصفحة الرئيسية)
                </label>
                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
                  {editId ? 'حفظ التعديلات' : 'إضافة العقار'}
                </button>
              </form>
            </section>

            {/* قائمة العقارات */}
            <section className="lg:col-span-2 space-y-3">
              {loading ? (
                <p className="text-slate-400">جارٍ التحميل...</p>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                  لا توجد عقارات بعد. أضف أول عقار من النموذج.
                </div>
              ) : (
                properties.map((p) => {
                  const st = STATUSES[p.status] || STATUSES.available;
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-4">
                      <div className="w-28 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-800 truncate">{p.title}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {p.city}{p.district ? ` — ${p.district}` : ''}
                          <span className="mx-1">•</span> {p.purpose} • {p.type}
                          {p.featured && <span className="mr-1 text-gold-600 font-bold">★ مميّز</span>}
                        </p>
                        <p className="text-brand-700 font-extrabold mt-1">{formatPrice(p.price)} <span className="text-xs text-slate-400 font-normal">{priceSuffix(p.purpose)}</span></p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => startEdit(p)} className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                            <Edit3 size={15} /> تعديل
                          </button>
                          <button onClick={() => remove(p.id)} className="text-sm font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1">
                            <Trash2 size={15} /> حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        )}

        {tab === 'inquiries' && (
          <section className="space-y-3">
            {loading ? (
              <p className="text-slate-400">جارٍ التحميل...</p>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
                لا توجد استفسارات بعد.
              </div>
            ) : (
              inquiries.map((i) => (
                <div key={i.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{i.name}</h3>
                      {i.property_title && <p className="text-sm text-brand-600">🏠 {i.property_title}</p>}
                    </div>
                    <button onClick={() => deleteInquiry(i.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </div>
                  {i.message && <p className="text-slate-600 text-sm mb-3">📝 {i.message}</p>}
                  <div className="flex items-center gap-4 text-sm">
                    {i.phone && (
                      <>
                        <a href={`tel:${i.phone}`} className="flex items-center gap-1 text-brand-600 hover:underline" dir="ltr">
                          <Phone size={15} /> {i.phone}
                        </a>
                        <a href={`https://wa.me/${toWa(i.phone)}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline">
                          <MessageCircle size={15} /> واتساب
                        </a>
                      </>
                    )}
                    {i.created_at && <span className="text-slate-400 mr-auto">{new Date(i.created_at).toLocaleString('ar-SA')}</span>}
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}
