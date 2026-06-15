import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFab from '../components/WhatsAppFab';
import PropertyCard from '../components/PropertyCard';
import { PROPERTY_TYPES, PURPOSES, CITIES } from '../data/properties';
import { loadProperties } from '../lib/data';

const EMPTY = { purpose: '', type: '', city: '', q: '', max: '' };

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    purpose: params.get('purpose') || '',
    type: params.get('type') || '',
    city: params.get('city') || '',
    q: params.get('q') || '',
    max: params.get('max') || '',
  };

  useEffect(() => {
    loadProperties().then(({ items }) => {
      setAll(items);
      setLoading(false);
    });
  }, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const shown = useMemo(() => {
    return all.filter((p) => {
      if (filters.purpose && p.purpose !== filters.purpose) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.max && Number(p.price) > Number(filters.max)) return false;
      if (filters.q) {
        const hay = `${p.title} ${p.district || ''} ${p.city} ${p.type}`.toLowerCase();
        if (!hay.includes(filters.q.toLowerCase())) return false;
      }
      return true;
    });
  }, [all, filters.purpose, filters.type, filters.city, filters.max, filters.q]);

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <Navbar />

      <header className="bg-brand-800 text-white pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">العقارات المتاحة</h1>
          <p className="text-brand-100">تصفّح عروضنا واستخدم الفلاتر للوصول إلى عقارك المثالي.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* الفلاتر */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 mb-8">
          <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
            <SlidersHorizontal size={18} /> تصفية النتائج
          </div>
          <div className="grid md:grid-cols-5 gap-3">
            <div className="relative md:col-span-1">
              <Search size={16} className="absolute top-3.5 right-3 text-slate-400" />
              <input value={filters.q} onChange={(e) => update('q', e.target.value)} placeholder="بحث..."
                className="w-full bg-slate-50 border border-slate-300 pr-9 pl-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" />
            </div>
            <select value={filters.purpose} onChange={(e) => update('purpose', e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">الغرض (الكل)</option>
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.type} onChange={(e) => update('type', e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">النوع (الكل)</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.city} onChange={(e) => update('city', e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">المدينة (الكل)</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.max} onChange={(e) => update('max', e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">السعر الأقصى</option>
              <option value="3000000">حتى 3 مليون</option>
              <option value="5000000">حتى 5 مليون</option>
              <option value="8000000">حتى 8 مليون</option>
              <option value="12000000">حتى 12 مليون</option>
              <option value="20000000">حتى 20 مليون</option>
              <option value="40000000">حتى 40 مليون</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="mt-4 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold">
              <X size={15} /> مسح الفلاتر
            </button>
          )}
        </div>

        <p className="text-slate-500 mb-5">{loading ? 'جارٍ التحميل...' : `${shown.length} عقار`}</p>

        {!loading && shown.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            لا توجد عقارات مطابقة لبحثك. جرّب تعديل الفلاتر.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {shown.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
