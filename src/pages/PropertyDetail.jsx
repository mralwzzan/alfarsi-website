import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, BedDouble, Bath, Maximize, ArrowRight, Phone, Check, Tag, Building2, TrendingUp,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFab from '../components/WhatsAppFab';
import { loadProperties, findProperty } from '../lib/data';
import { formatPrice, priceSuffix, STATUSES, TYPE_EMOJI } from '../data/properties';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SITE, waLink } from '../lib/site';

export default function PropertyDetail() {
  const { id } = useParams();
  const [p, setP] = useState(undefined); // undefined=تحميل، null=غير موجود
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadProperties().then(({ items }) => setP(findProperty(items, id) || null));
    window.scrollTo(0, 0);
  }, [id]);

  const inquiryText = (prop) =>
    `📩 استفسار عن عقار من موقع ${SITE.name}\n\n` +
    `🏠 العقار: ${prop.title}\n` +
    `📍 ${prop.city}${prop.district ? ' — ' + prop.district : ''}\n` +
    `💰 ${formatPrice(prop.price)} ${priceSuffix(prop.purpose)}\n` +
    `🔖 رقم العقار: ${prop.id}\n\n` +
    `👤 الاسم: ${form.name}\n📞 الجوال: ${form.phone}\n📝 ${form.message}`;

  const submit = async (e) => {
    e.preventDefault();
    // حفظ الاستفسار في قاعدة البيانات إن كانت مهيّأة (بدون إيقاف التواصل عند الفشل)
    if (isSupabaseConfigured) {
      try {
        await supabase.from('property_inquiries').insert({
          property_id: String(p.id),
          property_title: p.title,
          name: form.name,
          phone: form.phone,
          message: form.message,
        });
      } catch { /* تجاهل — نكمل عبر واتساب */ }
    }
    window.open(waLink(inquiryText(p)), '_blank');
    setSent(true);
  };

  if (p === undefined) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-40 text-center text-slate-500">جارٍ التحميل...</div>
      </div>
    );
  }

  if (p === null) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-40 text-center">
          <p className="text-slate-600 mb-4">عذراً، هذا العقار غير متوفّر.</p>
          <Link to="/properties" className="text-brand-600 font-bold hover:underline">العودة لقائمة العقارات</Link>
        </div>
      </div>
    );
  }

  const st = STATUSES[p.status] || STATUSES.available;
  const specs = [
    p.area ? { icon: Maximize, label: 'المساحة', value: `${p.area} م²` } : null,
    p.units ? { icon: Building2, label: 'عدد الوحدات', value: `${p.units} وحدة` } : null,
    p.annual_income ? { icon: TrendingUp, label: 'الدخل السنوي', value: `${formatPrice(p.annual_income)} ر.س` } : null,
    p.bedrooms ? { icon: BedDouble, label: 'غرف النوم', value: p.bedrooms } : null,
    p.bathrooms ? { icon: Bath, label: 'دورات المياه', value: p.bathrooms } : null,
    { icon: Tag, label: 'النوع', value: p.type },
  ].filter(Boolean);

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <Link to="/properties" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold mb-5">
          <ArrowRight size={18} /> رجوع للعقارات
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* المحتوى */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden bg-slate-200 h-72 md:h-[420px] mb-6">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">{TYPE_EMOJI[p.type] || '🏠'}</div>
              )}
              <span className="absolute top-4 right-4 bg-brand-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">{p.purpose}</span>
              <span className={`absolute top-4 left-4 text-sm font-bold px-4 py-1.5 rounded-full ${st.cls}`}>{st.label}</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{p.title}</h1>
              <p className="flex items-center gap-1 text-slate-500 mb-5">
                <MapPin size={18} /> {p.city}{p.district ? ` — ${p.district}` : ''}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {specs.map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <s.icon className="mx-auto mb-1.5 text-brand-600" size={22} />
                    <div className="font-bold text-slate-800">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-3">الوصف</h2>
              <p className="text-slate-700 leading-loose whitespace-pre-line">{p.description || 'لا يوجد وصف تفصيلي. تواصل معنا لمزيد من المعلومات.'}</p>
            </div>
          </div>

          {/* بطاقة السعر والتواصل */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="text-sm text-slate-500 mb-1">السعر</div>
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-brand-700">{formatPrice(p.price)}</span>
                <span className="text-slate-400 text-sm mr-1">{priceSuffix(p.purpose)}</span>
              </div>

              {sent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm flex items-start gap-2">
                  <Check size={18} className="mt-0.5 shrink-0" />
                  تم استلام استفسارك! سنتواصل معك قريباً عبر واتساب.
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <p className="font-bold text-slate-800">استفسر عن هذا العقار</p>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="الاسم" required />
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500" placeholder="رقم الجوال" required />
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500 h-20 resize-none"
                    placeholder="رسالتك (اختياري)" />
                  <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                    إرسال عبر واتساب
                  </button>
                </form>
              )}

              <div className="border-t border-slate-100 mt-5 pt-5 space-y-2 text-sm">
                <a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-2 text-brand-700 font-semibold hover:underline">
                  <Phone size={16} /> <span dir="ltr">{SITE.phoneDisplay}</span>
                </a>
                <p className="flex items-center gap-2 text-slate-500">
                  <Building2 size={16} /> {SITE.name}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <WhatsAppFab text={`استفسار عن عقار: ${p.title} (رقم ${p.id})`} />
    </div>
  );
}
