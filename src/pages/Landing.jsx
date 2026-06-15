import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, Clock, ArrowRight, Check, LogIn, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AlFarsiLawOffice() {
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
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
  // عند تمرير نوع الخدمة، يُحفظ ليُحدَّد مسبقاً في نموذج الحجز
  const openBookingForm = (serviceType) => {
    if (serviceType) sessionStorage.setItem('selectedService', serviceType);
    navigate(accountPath);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const text =
      `📩 رسالة جديدة من موقع المكتب\n\n` +
      `👤 الاسم: ${formData.name}\n` +
      `📧 البريد: ${formData.email}\n` +
      `📞 الهاتف: ${formData.phone}\n` +
      `📝 الرسالة: ${formData.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="w-full bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center">
            <img src="/logo.jpeg" alt="مكتب ساير بن فارس المطيري للمحاماة والاستشارات الشرعية والقانونية" className="h-12 md:h-14 w-auto" />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <a href="#services" className="text-slate-700 hover:text-brand-600 font-semibold transition">الخدمات</a>
            <a href="#prices" className="text-slate-700 hover:text-brand-600 font-semibold transition">الأسعار</a>
            <a href="#about" className="text-slate-700 hover:text-brand-600 font-semibold transition">معلومات</a>
            <a href="#contact" className="text-slate-700 hover:text-brand-600 font-semibold transition">تواصل</a>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            <button onClick={() => navigate(accountPath)} className="flex items-center gap-2 text-slate-700 hover:text-brand-600 font-semibold transition">
              {user ? <LayoutDashboard size={20} /> : <LogIn size={20} />}
              {user ? (isOwner ? 'لوحة الإدارة' : 'حسابي') : 'تسجيل الدخول'}
            </button>
            <button onClick={openBookingForm} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              احجز الآن
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-3">
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">الخدمات</a>
            <a href="#prices" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">الأسعار</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">معلومات</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">تواصل</a>
            <button onClick={() => {setIsMenuOpen(false); navigate(accountPath);}} className="w-full border border-brand-600 text-brand-600 px-4 py-3 rounded-lg font-semibold text-center transition">
              {user ? (isOwner ? 'لوحة الإدارة' : 'حسابي') : 'تسجيل الدخول'}
            </button>
            <button onClick={() => {setIsMenuOpen(false); openBookingForm();}} className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition">احجز الآن</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-4 py-2 bg-gold-500/20 border border-gold-500/40 rounded-full">
              <p className="text-gold-300 font-semibold text-sm">✨ خدماتنا القانونية</p>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-relaxed">
              مكتب <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">ساير بن فارس المطيري</span> للمحاماة والاستشارات الشرعية والقانونية
            </h1>
            <p className="text-xl text-brand-100 mb-8 leading-relaxed">
              نقدم استشارات قانونية متخصصة في المجالات العائلية والتجارية والعامة بخبرة واحترافية عالية. فريقنا مجهز لحماية حقوقك بأفضل الطرق القانونية.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => openBookingForm('احوال شخصية')}
                className="bg-gold-500 hover:bg-gold-600 text-brand-900 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                احجز استشارة <ArrowRight size={20} />
              </button>
              <a href="#contact" className="bg-transparent border-2 border-gold-400 text-gold-200 hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-lg transition">
                تواصل معنا
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-gold-400 to-brand-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-10 text-center">
                <img src="/logo.jpeg" alt="شعار المكتب" className="w-full max-w-xs mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 mb-3">استشارات قانونية احترافية</h3>
                <p className="text-slate-600 mb-8">حماية حقوقك هي أولويتنا الأولى</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>فريق متخصص وذو خبرة</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>استشارات سرية وآمنة</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Check className="text-gold-600" size={20} />
                    <span>متابعة دقيقة لقضاياك</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-4">خدماتنا</h2>
            <p className="text-xl text-slate-600">نقدم مجموعة شاملة من الخدمات القانونية المتخصصة</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 border border-brand-200 hover:shadow-lg transition cursor-pointer" onClick={() => openBookingForm('احوال شخصية')}>
              <div className="text-5xl mb-6">⚖️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">احوال شخصية</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">
                نتعامل مع قضايا الأحوال الشخصية بحساسية واحترافية. من الزواج والطلاق إلى حقوق الحضانة والمواريث.
              </p>
              <button onClick={() => openBookingForm('احوال شخصية')} className="flex items-center text-brand-600 font-semibold hover:gap-3 transition-all gap-2">
                احجز الآن
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-8 border border-gold-200 hover:shadow-lg transition cursor-pointer" onClick={() => openBookingForm('تجارية')}>
              <div className="text-5xl mb-6">💼</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">الاستشارات التجارية</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">
                نساعد الشركات والمتاجر في الأمور التجارية والعقود والشراكات والالتزامات المالية.
              </p>
              <button onClick={() => openBookingForm('تجارية')} className="flex items-center text-gold-600 font-semibold hover:gap-3 transition-all gap-2">
                احجز الآن
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-lg transition cursor-pointer" onClick={() => openBookingForm('عامة')}>
              <div className="text-5xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">الاستشارات العامة</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">
                استشارات عامة في مختلف المجالات القانونية الأخرى. نحن هنا للإجابة على جميع أسئلتك.
              </p>
              <button onClick={() => openBookingForm('عامة')} className="flex items-center text-green-600 font-semibold hover:gap-3 transition-all gap-2">
                احجز الآن
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Service 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-lg transition cursor-pointer" onClick={() => openBookingForm('التوثيق')}>
              <div className="text-5xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">التوثيق</h3>
              <p className="text-slate-700 mb-6 leading-relaxed">
                توثيق العقود والوكالات والإقرارات والمستندات القانونية بشكل نظامي وموثوق.
              </p>
              <button onClick={() => openBookingForm('التوثيق')} className="flex items-center text-purple-600 font-semibold hover:gap-3 transition-all gap-2">
                احجز الآن
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prices Section */}
      <section id="prices" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-4">أسعار الاستشارات</h2>
            <p className="text-xl text-slate-600">أسعار واضحة وشفافة بدون رسوم مخفية</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">احوال شخصية</h3>
              <div className="text-4xl font-bold text-brand-600 mb-6">300 <span className="text-lg">ر.س</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> مدة ساعة كاملة</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> استشارة مباشرة</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> توثيق الموعد</li>
              </ul>
              <button onClick={() => openBookingForm('احوال شخصية')} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold transition">
                احجز الآن
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gold-500 shadow-lg relative">
              <div className="absolute -top-4 left-8 bg-gold-500 text-white px-4 py-1 rounded-full text-sm font-bold">الأكثر طلباً</div>
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">استشارة تجارية</h3>
              <div className="text-4xl font-bold text-gold-600 mb-6">750 <span className="text-lg">ر.س</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> مدة ساعة كاملة</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> متخصصة في العقود</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> نصائح متقدمة</li>
              </ul>
              <button onClick={() => openBookingForm('تجارية')} className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-lg font-bold transition">
                احجز الآن
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">استشارة عامة</h3>
              <div className="text-4xl font-bold text-green-600 mb-6">500 <span className="text-lg">ر.س</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> مدة ساعة كاملة</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> إجابات شاملة</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> توجيهات قانونية</li>
              </ul>
              <button onClick={() => openBookingForm('عامة')} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition">
                احجز الآن
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">التوثيق</h3>
              <div className="text-4xl font-bold text-purple-600 mb-6">750 <span className="text-lg">ر.س</span></div>
              <ul className="space-y-3 mb-8 text-slate-700">
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> توثيق نظامي موثوق</li>
                <li className="flex items-center gap-2"><Check size={20} className="text-green-500" /> عقود ووكالات وإقرارات</li>
              </ul>
              <button onClick={() => openBookingForm('التوثيق')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition">
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-6">عن المكتب</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              مكتب ساير بن فارس المطيري للمحاماة والاستشارات الشرعية والقانونية يتمتع بسمعة عريقة في تقديم الخدمات القانونية الاحترافية والموثوقة. فريقنا المتخصص يعمل بكل جدية لحماية حقوق عملائنا.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              نؤمن أن العدالة حق لكل شخص، ونلتزم بتقديم أفضل الخدمات بأسعار منصفة وشفافة. خبرتنا تمتد لسنوات في المجالات العائلية والتجارية والقانونية العامة.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">خبرة طويلة</h4>
                  <p className="text-slate-600">سنوات من الخبرة في المجال القانوني</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">فريق متخصص</h4>
                  <p className="text-slate-600">محامون ومستشارون قانونيون موثوقون</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Check className="text-green-500 mt-1" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-slate-800">رقمية متطورة</h4>
                  <p className="text-slate-600">تطبيق حديث لحجز المواعيد بسهولة</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-brand-100">قضية منجزة بنجاح</p>
            </div>
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-gold-100">رضا العملاء</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-green-100">متاح للاستشارات</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="text-5xl font-bold mb-2">جدة</div>
              <p className="text-purple-100">موقع موثوق</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-800 mb-8">تواصل معنا</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <Phone className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">الهاتف</h4>
                    <a href="tel:0551055959" className="text-brand-600 hover:underline text-lg">
                      0551055959
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">البريد الإلكتروني</h4>
                    <a href="mailto:mr.alwzzan@gmail.com" className="text-brand-600 hover:underline text-lg">
                      mr.alwzzan@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">العنوان</h4>
                    <p className="text-slate-700">برج الشاشة، الدور 11، مكتب 1108</p>
                    <p className="text-slate-600">جدة، المملكة العربية السعودية</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="text-brand-600 mt-1" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">ساعات العمل</h4>
                    <p className="text-slate-700">الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً</p>
                    <p className="text-slate-700">الجمعة - السبت: مغلق</p>
                  </div>
                </div>
              </div>

              <a href="https://maps.google.com/?q=برج+الشاشة+جدة" target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold transition">
                📍 اعرض الموقع على الخريطة
              </a>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">أرسل لنا رسالة</h3>
              
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">اسمك</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  placeholder="محمد علي"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">بريدك الإلكتروني</label>
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
                <label className="block text-slate-700 font-semibold mb-2">رقم الهاتف</label>
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
                <label className="block text-slate-700 font-semibold mb-2">رسالتك</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 h-32 resize-none"
                  placeholder="اكتب رسالتك هنا..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* App CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">احجز استشارتك الآن</h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            استخدم نموذج الحجز البسيط والسريع. اختر الخدمة التي تحتاجها والوقت المناسب لك.
          </p>
          <button onClick={() => openBookingForm('احوال شخصية')} className="bg-white text-brand-600 hover:bg-brand-50 px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">
            🚀 احجز الآن
          </button>
          <p className="text-brand-100 mt-6 text-sm">
            تنبيهات قبل الموعد بيوم مباشرة على بريدك الإلكتروني.
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
                  <img src="/logo.jpeg" alt="مكتب ساير بن فارس المطيري" className="h-14 w-auto" />
                </div>
              </div>
              <p className="text-sm">نقدم خدمات قانونية احترافية وموثوقة منذ سنوات.</p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white transition">الخدمات</a></li>
                <li><a href="#prices" className="hover:text-white transition">الأسعار</a></li>
                <li><a href="#about" className="hover:text-white transition">معلومات</a></li>
                <li><a href="#contact" className="hover:text-white transition">تواصل</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">تواصل سريع</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 0551055959</li>
                <li>📧 <a href="mailto:mr.alwzzan@gmail.com" className="hover:text-white transition">mr.alwzzan@gmail.com</a></li>
                <li>📍 جدة - برج الشاشة</li>
                <li>🕐 الأحد - الخميس: 9 ص - 6 م</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 مكتب ساير بن فارس المطيري للمحاماة والاستشارات الشرعية والقانونية. جميع الحقوق محفوظة.</p>
            <p className="mt-2">تم بناء الموقع بكل احترافية لتقديم أفضل تجربة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
