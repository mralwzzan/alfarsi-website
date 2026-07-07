import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, Clock, ArrowRight, Check, LogIn, LayoutDashboard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function AlFarsiLawOffice() {
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const { t } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // رقم الواتساب الذي تصل إليه رسائل التواصل (صيغة دولية بدون + أو 00)
  const WHATSAPP_NUMBER = '966551055959';

  // الوجهة المناسبة بحسب حالة المستخدم
  const accountPath = user ? (isOwner ? '/admin' : '/dashboard') : '/login';

  // زر "احجز الآن" يوجّه العميل إلى المنصة (تسجيل دخول ثم لوحة الحجز)
  // عند تمرير نوع الخدمة، يُحفظ ليُحدَّد مسبقاً في نموذج الحجز (المفتاح بالعربية دائماً)
  const openBookingForm = (serviceType) => {
    if (serviceType) sessionStorage.setItem('selectedService', serviceType);
    navigate(accountPath);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const text =
      `${t('contact.waText')}\n\n` +
      `👤 ${t('contact.waName')}: ${formData.name}\n` +
      `📧 ${t('contact.waEmail')}: ${formData.email}\n` +
      `📞 ${t('contact.waPhone')}: ${formData.phone}\n` +
      `📝 ${t('contact.waMsg')}: ${formData.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const accountLabel = user ? (isOwner ? t('nav.ownerPanel') : t('nav.account')) : t('nav.login');

  return (
    <div className="w-full bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center">
            <img src="/logo.jpeg" alt={t('hero.logoAlt')} className="h-12 md:h-14 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <a href="#services" className="text-slate-700 hover:text-brand-600 font-semibold transition">{t('nav.services')}</a>
            <a href="#prices" className="text-slate-700 hover:text-brand-600 font-semibold transition">{t('nav.prices')}</a>
            <a href="#about" className="text-slate-700 hover:text-brand-600 font-semibold transition">{t('nav.about')}</a>
            <a href="#contact" className="text-slate-700 hover:text-brand-600 font-semibold transition">{t('nav.contact')}</a>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <LanguageToggle className="border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-600" />
            <button onClick={() => navigate(accountPath)} className="flex items-center gap-2 text-slate-700 hover:text-brand-600 font-semibold transition">
              {user ? <LayoutDashboard size={20} /> : <LogIn size={20} />}
              {accountLabel}
            </button>
            <button onClick={() => openBookingForm()} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              {t('nav.book')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle className="border-slate-300 text-slate-700" />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-3">
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{t('nav.services')}</a>
            <a href="#prices" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{t('nav.prices')}</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{t('nav.about')}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{t('nav.contact')}</a>
            <button onClick={() => {setIsMenuOpen(false); navigate(accountPath);}} className="w-full border border-brand-600 text-brand-600 px-4 py-3 rounded-lg font-semibold text-center transition">
              {accountLabel}
            </button>
            <button onClick={() => {setIsMenuOpen(false); openBookingForm();}} className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition">{t('nav.book')}</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 hero-animated">
        {/* خلفية برغندي أحمر غامق متحركة: توهّجات + نقاط ضوئية حمراء ناعمة (بدون ذهبي) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-blob" style={{ width: '460px', height: '460px', top: '-100px', right: '-80px', background: 'radial-gradient(circle, rgba(160,45,62,0.5), transparent 70%)' }}></div>
          <div className="hero-blob" style={{ width: '380px', height: '380px', bottom: '-120px', left: '-60px', background: 'radial-gradient(circle, rgba(90,19,31,0.6), transparent 70%)', animationDelay: '5s' }}></div>
          <div className="hero-blob" style={{ width: '320px', height: '320px', top: '36%', left: '40%', background: 'radial-gradient(circle, rgba(200,90,105,0.28), transparent 70%)', animationDelay: '9s' }}></div>

          {/* نقاط ضوئية حمراء/وردية ناعمة تطفو */}
          <span className="bokeh soft" style={{ width: '130px', height: '130px', top: '12%', left: '10%', '--bd': '14s', '--bx': '26px', '--by': '-40px' }}></span>
          <span className="bokeh" style={{ width: '46px', height: '46px', top: '22%', left: '78%', '--bd': '12s', '--bx': '-22px', '--by': '30px', animationDelay: '1.5s' }}></span>
          <span className="bokeh soft" style={{ width: '95px', height: '95px', top: '60%', left: '20%', '--bd': '17s', '--bx': '18px', '--by': '-28px', animationDelay: '3s' }}></span>
          <span className="bokeh" style={{ width: '32px', height: '32px', top: '70%', left: '62%', '--bd': '10s', '--bx': '-16px', '--by': '-24px', animationDelay: '0.8s' }}></span>
          <span className="bokeh" style={{ width: '60px', height: '60px', top: '15%', left: '52%', '--bd': '13s', '--bx': '20px', '--by': '34px', animationDelay: '2.2s' }}></span>
          <span className="bokeh soft" style={{ width: '150px', height: '150px', bottom: '8%', right: '12%', '--bd': '19s', '--bx': '-30px', '--by': '-26px', animationDelay: '4s' }}></span>

          <div className="hero-vignette"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hero-enter inline-block mb-6 px-4 py-2 bg-gold-500/20 border border-gold-500/40 rounded-full">
              <p className="text-gold-300 font-semibold text-sm">{t('hero.badge')}</p>
            </div>
            <h1 className="hero-enter-2 font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-relaxed">
              {t('hero.titleBefore')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">{t('hero.titleName')}</span>{t('hero.titleAfter')}
            </h1>
            <p className="hero-enter-3 text-xl text-brand-100 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="hero-enter-3 flex gap-4 flex-wrap">
              <button
                onClick={() => openBookingForm('احوال شخصية')}
                className="bg-gold-500 hover:bg-gold-600 text-brand-900 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {t('hero.bookBtn')} <ArrowRight size={20} />
              </button>
              <a href="#contact" className="bg-transparent border-2 border-gold-400 text-gold-200 hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-lg transition">
                {t('hero.contactBtn')}
              </a>
            </div>
          </div>

          <div className="hero-enter-card relative">
            <div className="bg-gradient-to-br from-gold-400 to-brand-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-10 text-center">
                <img src="/logo.jpeg" alt={t('hero.logoAlt')} className="w-full max-w-xs mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('hero.cardTitle')}</h3>
                <p className="text-slate-600 mb-8">{t('hero.cardSubtitle')}</p>
                <div className="space-y-3 text-start">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>{t('hero.cardF1')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>{t('hero.cardF2')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>{t('hero.cardF3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Goal Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-gold-100 rounded-full">
            <p className="text-brand-700 font-semibold text-sm">{t('mission.badge')}</p>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-6 leading-relaxed">
            {t('mission.title')}
          </h2>
          <p className="text-xl text-slate-600 leading-loose mb-4">
            {t('mission.p1')}
          </p>
          <p className="text-lg text-slate-500 leading-loose mb-12">
            {t('mission.p2')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-start">
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold text-brand-800 mb-2">{t('mission.c1Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('mission.c1Body')}</p>
            </div>
            <div className="bg-gradient-to-br from-gold-50 to-white rounded-2xl p-6 border border-gold-200 shadow-sm">
              <div className="text-4xl mb-3">⚖️</div>
              <h3 className="text-xl font-bold text-brand-800 mb-2">{t('mission.c2Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('mission.c2Body')}</p>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-bold text-brand-800 mb-2">{t('mission.c3Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('mission.c3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-3d py-24 px-4">
        <span className="glow-orb" style={{ width: '320px', height: '320px', background: '#b03a4c', top: '8%', right: '6%' }}></span>
        <span className="glow-orb" style={{ width: '280px', height: '280px', background: '#7d1f2e', bottom: '10%', left: '4%', animationDelay: '6s' }}></span>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-gold-500/20 border border-gold-500/40 rounded-full">
              <p className="text-gold-300 font-semibold text-sm">{t('services.badge')}</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{t('services.title')}</h2>
            <p className="text-xl text-brand-100">{t('services.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="service-card-3d bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 border border-brand-200 cursor-pointer" onClick={() => openBookingForm('احوال شخصية')}>
              <div className="text-5xl mb-6">⚖️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('services.personalTitle')}</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">{t('services.personalDesc')}</p>
              <button onClick={() => openBookingForm('احوال شخصية')} className="flex items-center text-brand-600 font-semibold hover:gap-3 transition-all gap-2">
                {t('services.book')} <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 2 */}
            <div className="service-card-3d bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 border border-gold-200 cursor-pointer" onClick={() => openBookingForm('تجارية')}>
              <div className="text-5xl mb-6">💼</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('services.commercialTitle')}</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">{t('services.commercialDesc')}</p>
              <button onClick={() => openBookingForm('تجارية')} className="flex items-center text-gold-600 font-semibold hover:gap-3 transition-all gap-2">
                {t('services.book')} <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 3 */}
            <div className="service-card-3d bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 cursor-pointer" onClick={() => openBookingForm('عامة')}>
              <div className="text-5xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('services.generalTitle')}</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">{t('services.generalDesc')}</p>
              <button onClick={() => openBookingForm('عامة')} className="flex items-center text-green-600 font-semibold hover:gap-3 transition-all gap-2">
                {t('services.book')} <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 4 */}
            <div className="service-card-3d bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 cursor-pointer" onClick={() => openBookingForm('التوثيق')}>
              <div className="text-5xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('services.docTitle')}</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">{t('services.docDesc')}</p>
              <button onClick={() => openBookingForm('التوثيق')} className="flex items-center text-purple-600 font-semibold hover:gap-3 transition-all gap-2">
                {t('services.book')} <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 5 */}
            <div className="service-card-3d bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8 border border-teal-200 cursor-pointer" onClick={() => openBookingForm('عمالية')}>
              <div className="text-5xl mb-6">👷</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('services.laborTitle')}</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">{t('services.laborDesc')}</p>
              <button onClick={() => openBookingForm('عمالية')} className="flex items-center text-teal-600 font-semibold hover:gap-3 transition-all gap-2">
                {t('services.book')} <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* ملاحظة خصم قيمة الاستشارة */}
          <div className="mt-10 max-w-3xl mx-auto bg-gradient-to-l from-gold-50 to-white border-2 border-gold-300 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="text-lg font-bold text-brand-800 mb-1">{t('services.discountTitle')}</h4>
              <p className="text-slate-700 leading-relaxed">
                {t('services.discountBody')}
                <span className="block text-sm text-slate-500 mt-1">{t('services.discountNote')}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prices Section */}
      <section id="prices" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-4">{t('prices.title')}</h2>
            <p className="text-xl text-slate-600">{t('prices.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('prices.personalTitle')}</h3>
              <div className="text-4xl font-bold text-brand-600 mb-6">300 <span className="text-lg">{t('prices.currency')}</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                {t('prices.personalF').map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={20} className="text-green-500" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openBookingForm('احوال شخصية')} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold transition">
                {t('prices.book')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gold-500 shadow-lg relative">
              <div className="absolute -top-4 start-8 bg-gold-500 text-white px-4 py-1 rounded-full text-sm font-bold">{t('prices.popular')}</div>
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('prices.commercialTitle')}</h3>
              <div className="text-4xl font-bold text-gold-600 mb-6">750 <span className="text-lg">{t('prices.currency')}</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                {t('prices.commercialF').map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={20} className="text-green-500" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openBookingForm('تجارية')} className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-lg font-bold transition">
                {t('prices.book')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('prices.generalTitle')}</h3>
              <div className="text-4xl font-bold text-green-600 mb-6">500 <span className="text-lg">{t('prices.currency')}</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                {t('prices.generalF').map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={20} className="text-green-500" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openBookingForm('عامة')} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition">
                {t('prices.book')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('prices.docTitle')}</h3>
              <div className="text-4xl font-bold text-purple-600 mb-6">750 <span className="text-lg">{t('prices.currency')}</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                {t('prices.docF').map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={20} className="text-green-500" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openBookingForm('التوثيق')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition">
                {t('prices.book')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">👷</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('prices.laborTitle')}</h3>
              <div className="text-4xl font-bold text-teal-600 mb-6">500 <span className="text-lg">{t('prices.currency')}</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                {t('prices.laborF').map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={20} className="text-green-500" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => openBookingForm('عمالية')} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition">
                {t('prices.book')}
              </button>
            </div>
          </div>

          {/* ملاحظة خصم قيمة الاستشارة */}
          <div className="mt-10 max-w-3xl mx-auto bg-gradient-to-l from-gold-50 to-white border-2 border-gold-300 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="text-lg font-bold text-brand-800 mb-1">{t('services.discountTitle')}</h4>
              <p className="text-slate-700 leading-relaxed">
                {t('services.discountBody')}
                <span className="block text-sm text-slate-500 mt-1">{t('services.discountNote')}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-6">{t('about.title')}</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              {t('about.p1')}
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              {t('about.p2')}
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{t('about.f1Title')}</h4>
                  <p className="text-slate-600">{t('about.f1Body')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{t('about.f2Title')}</h4>
                  <p className="text-slate-600">{t('about.f2Body')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{t('about.f3Title')}</h4>
                  <p className="text-slate-600">{t('about.f3Body')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-brand-100">{t('about.stat1')}</p>
            </div>
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-gold-100">{t('about.stat2')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-green-100">{t('about.stat3')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">{t('about.stat4City')}</div>
              <p className="text-purple-100">{t('about.stat4')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-8">{t('contact.title')}</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <User className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t('contact.gmTitle')}</h4>
                    <p className="text-slate-700 text-lg">{t('contact.gmName')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t('contact.phoneTitle')}</h4>
                    <a href="https://wa.me/966590164400" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-lg block" dir="ltr">
                      0590164400
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t('contact.emailTitle')}</h4>
                    <a href="mailto:mr.alwzzan@gmail.com" className="text-brand-600 hover:underline text-lg">
                      mr.alwzzan@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t('contact.addrTitle')}</h4>
                    <p className="text-slate-700">{t('contact.addr1')}</p>
                    <p className="text-slate-600">{t('contact.addr2')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{t('contact.hoursTitle')}</h4>
                    <p className="text-slate-700">{t('contact.hours1')}</p>
                    <p className="text-slate-700">{t('contact.hours2')}</p>
                  </div>
                </div>
              </div>

              <a href="https://maps.google.com/?q=برج+الشاشة+جدة" target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold transition">
                {t('contact.mapBtn')}
              </a>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('contact.formTitle')}</h3>

              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">{t('contact.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder={t('contact.namePh')}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">{t('contact.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">{t('contact.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="0551234567"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2">{t('contact.message')}</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 h-32 resize-none"
                  placeholder={t('contact.messagePh')}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition"
              >
                {t('contact.send')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* App CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            {t('cta.body')}
          </p>
          <button onClick={() => openBookingForm('احوال شخصية')} className="bg-white text-brand-600 hover:bg-brand-50 px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">
            {t('cta.btn')}
          </button>
          <p className="text-brand-100 mt-6 text-sm">
            {t('cta.note')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 text-brand-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <div className="bg-white rounded-xl p-3 inline-block">
                  <img src="/logo.jpeg" alt={t('hero.logoAlt')} className="h-14 w-auto" />
                </div>
              </div>
              <p className="text-sm mb-3">{t('footer.tagline')}</p>
              <div className="border-t border-brand-700 pt-3 space-y-1">
                <p className="text-xs text-brand-200">{t('footer.gmLabel')}</p>
                <p className="text-white font-bold">{t('footer.gmName')}</p>
                <p className="text-sm">📞 <a href="tel:0551055959" className="hover:text-white transition"><span dir="ltr">0551055959</span></a></p>
                <p className="text-sm">📧 <a href="mailto:mr.alwzzan@gmail.com" className="hover:text-white transition">mr.alwzzan@gmail.com</a></p>
                <a href="https://x.com/lawyeralwazzan" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-white transition pt-1">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span dir="ltr">@lawyeralwazzan</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white transition">{t('nav.services')}</a></li>
                <li><a href="#prices" className="hover:text-white transition">{t('nav.prices')}</a></li>
                <li><a href="#about" className="hover:text-white transition">{t('nav.about')}</a></li>
                <li><a href="#contact" className="hover:text-white transition">{t('nav.contact')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.quickContact')}</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 <span dir="ltr">0590164400</span> {t('footer.office')}</li>
                <li>💬 <a href="https://wa.me/966551055959" target="_blank" rel="noopener noreferrer" className="hover:text-white transition"><span dir="ltr">0551055959</span> {t('footer.whatsapp')}</a></li>
                <li>📧 <a href="mailto:mr.alwzzan@gmail.com" className="hover:text-white transition">mr.alwzzan@gmail.com</a></li>
                <li>{t('footer.addr')}</li>
                <li>{t('footer.hours')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>{t('footer.copyright')}</p>
            <p className="mt-2">{t('footer.built')}</p>
          </div>
        </div>
      </footer>

      {/* زر واتساب عائم للتواصل السريع */}
      <a
        href="https://wa.me/966551055959"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsappAria')}
        className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition hover:scale-110 flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    </div>
  );
}
