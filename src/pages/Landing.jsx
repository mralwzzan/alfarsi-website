import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Search, ArrowLeft, Check, MapPin, Phone, Mail, Clock,
  Home, KeyRound, Handshake, TrendingUp, ShieldCheck, BadgeCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFab from '../components/WhatsAppFab';
import PropertyCard from '../components/PropertyCard';
import { PROPERTY_TYPES, PURPOSES, CITIES } from '../data/properties';
import { loadProperties } from '../lib/data';
import { SITE, waLink } from '../lib/site';

export default function Landing() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({ purpose: '', type: '', city: '' });
  const [contact, setContact] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    loadProperties().then(({ items }) => {
      const feat = items.filter((p) => p.featured);
      setFeatured((feat.length ? feat : items).slice(0, 6));
    });
  }, []);

  const runSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => v && params.set(k, v));
    navigate(`/properties?${params.toString()}`);
  };

  const submitContact = (e) => {
    e.preventDefault();
    const text =
      `📩 طلب جديد من موقع ${SITE.name}\n\n` +
      `👤 الاسم: ${contact.name}\n` +
      `📞 الجوال: ${contact.phone}\n` +
      `📝 الطلب: ${contact.message}`;
    window.open(waLink(text), '_blank');
    setContact({ name: '', phone: '', message: '' });
  };

  return (
    <div className="w-full bg-white">
      <Navbar home />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 px-4 hero-animated">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-blob" style={{ width: '420px', height: '420px', top: '-90px', right: '-70px', background: 'radial-gradient(circle, rgba(208,166,78,0.4), transparent 70%)' }} />
          <div className="hero-blob" style={{ width: '360px', height: '360px', bottom: '-110px', left: '-50px', background: 'radial-gradient(circle, rgba(58,86,136,0.7), transparent 70%)', animationDelay: '5s' }} />
          <Building2 className="hero-motif text-gold-400" style={{ width: '420px', height: '420px', top: '6%', left: '-30px' }} />
          <Building2 className="hero-motif text-gold-300" style={{ width: '300px', height: '300px', bottom: '0%', right: '8%', animationDelay: '7s' }} />
          <div className="hero-shine" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-gold-500/20 border border-gold-500/40 rounded-full">
            <p className="text-gold-300 font-semibold text-sm">🏙️ {SITE.name}</p>
          </div>
          <h1 className="font-display text-3xl md:text-6xl font-bold text-white mb-6 leading-tight">
            عقارك الموثوق <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">في المكان الصحيح</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            نساعدك في بيع وشراء وتأجير العقارات السكنية والتجارية والأراضي بخبرة واحترافية ومصداقية في مختلف مدن المملكة.
          </p>

          {/* شريط البحث */}
          <form onSubmit={runSearch} className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 grid md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <select value={search.purpose} onChange={(e) => setSearch({ ...search, purpose: e.target.value })}
              className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">الغرض (الكل)</option>
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={search.type} onChange={(e) => setSearch({ ...search, type: e.target.value })}
              className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">نوع العقار (الكل)</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })}
              className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700">
              <option value="">المدينة (الكل)</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition">
              <Search size={20} /> ابحث
            </button>
          </form>
        </div>
      </section>

      {/* خدماتنا */}
      <section id="services" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-4">خدماتنا العقارية</h2>
            <p className="text-xl text-slate-600">حلول متكاملة تغطّي كل احتياجاتك العقارية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Home, title: 'بيع العقارات', desc: 'تسويق احترافي لعقارك للوصول لأفضل المشترين وأعلى الأسعار.' },
              { icon: KeyRound, title: 'تأجير العقارات', desc: 'إدارة وتأجير وحداتك السكنية والتجارية بكفاءة وسرعة.' },
              { icon: Handshake, title: 'الوساطة العقارية', desc: 'وساطة موثوقة بين البائع والمشتري حتى إتمام الصفقة بأمان.' },
              { icon: TrendingUp, title: 'الاستثمار العقاري', desc: 'استشارات لاختيار الفرص الاستثمارية الأعلى عائداً.' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-lg transition text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* أحدث العقارات */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-3">عقارات مميّزة</h2>
              <p className="text-xl text-slate-600">مختارات من أفضل العروض المتاحة حالياً</p>
            </div>
            <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold">
              عرض الكل <ArrowLeft size={18} />
            </button>
          </div>
          {featured.length === 0 ? (
            <p className="text-slate-400 text-center py-10">لا توجد عقارات للعرض حالياً.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* من نحن / لماذا نحن */}
      <section id="about" className="py-20 px-4 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-6">من نحن</h2>
            <p className="text-lg text-slate-700 mb-4 leading-relaxed">
              {SITE.name} مؤسسة سعودية متخصصة في التسويق والوساطة العقارية، نقدّم خدماتنا بشفافية ومصداقية
              لنكون شريكك الموثوق في كل صفقة عقارية — بيعاً كانت أو شراءً أو تأجيراً.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              نؤمن أن العقار قرار مصيري، لذلك نرافقك خطوة بخطوة بخبرة ميدانية ومعرفة دقيقة بالسوق
              لنحقق لك أفضل قيمة وأكثرها أماناً.
            </p>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, t: 'مصداقية وشفافية', d: 'تعاملات واضحة وموثّقة دون رسوم مخفية.' },
                { icon: BadgeCheck, t: 'خبرة بالسوق', d: 'معرفة دقيقة بالأسعار والأحياء والفرص.' },
                { icon: Handshake, t: 'متابعة حتى الإفراغ', d: 'نرافقك حتى إتمام الصفقة بالكامل.' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                    <f.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{f.t}</h4>
                    <p className="text-slate-600">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { n: '+250', l: 'صفقة ناجحة' },
              { n: '%100', l: 'رضا العملاء' },
              { n: '+8', l: 'مدن نخدمها' },
              { n: SITE.city, l: 'مقرّنا الرئيسي' },
            ].map((s, i) => (
              <div key={i} className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white shadow-lg text-center">
                <div className="text-3xl md:text-4xl font-extrabold mb-2">{s.n}</div>
                <p className="text-brand-100">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* تواصل */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-8">تواصل معنا</h2>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <Building2 className="text-brand-600 mt-1" size={26} />
                <div><h4 className="text-lg font-bold text-slate-800">المدير العام</h4><p className="text-slate-700">{SITE.manager}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-brand-600 mt-1" size={26} />
                <div><h4 className="text-lg font-bold text-slate-800">الهاتف</h4>
                  <a href={`tel:${SITE.phoneTel}`} className="text-brand-600 hover:underline" dir="ltr">{SITE.phoneDisplay}</a></div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="text-brand-600 mt-1" size={26} />
                <div><h4 className="text-lg font-bold text-slate-800">البريد الإلكتروني</h4>
                  <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">{SITE.email}</a></div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-brand-600 mt-1" size={26} />
                <div><h4 className="text-lg font-bold text-slate-800">العنوان</h4><p className="text-slate-700">{SITE.address}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="text-brand-600 mt-1" size={26} />
                <div><h4 className="text-lg font-bold text-slate-800">ساعات العمل</h4><p className="text-slate-700">{SITE.workHours}</p></div>
              </div>
            </div>
          </div>

          <form onSubmit={submitContact} className="bg-slate-50 rounded-2xl p-8 shadow-sm border border-slate-200 h-fit">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">اطلب عقاراً أو اعرض عقارك</h3>
            <p className="text-slate-500 text-sm mb-6">أرسل طلبك وسنعاود التواصل معك عبر واتساب.</p>
            <div className="mb-4">
              <label className="block text-slate-700 font-semibold mb-2">الاسم</label>
              <input type="text" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })}
                className="w-full bg-white border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" placeholder="الاسم الكامل" required />
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 font-semibold mb-2">رقم الجوال</label>
              <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full bg-white border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500" placeholder="05xxxxxxxx" required />
            </div>
            <div className="mb-6">
              <label className="block text-slate-700 font-semibold mb-2">طلبك</label>
              <textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })}
                className="w-full bg-white border border-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-500 h-28 resize-none"
                placeholder="مثال: أبحث عن فيلا للبيع في حي الملقا بميزانية 2.5 مليون..." required />
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
              إرسال عبر واتساب
            </button>
          </form>
        </div>
      </section>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
