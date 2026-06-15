// بيانات المؤسسة ومعلومات التواصل — مكان واحد لتعديلها
export const SITE = {
  name: 'مؤسسة مارس العقارية',
  shortName: 'مارس العقارية',
  tagline: 'عقارك الموثوق في المكان الصحيح',
  description:
    'مؤسسة مارس العقارية — بيع وتأجير وتسويق العقارات السكنية والتجارية والأراضي في مختلف مدن المملكة بخبرة واحترافية ومصداقية.',
  manager: 'محمد بن أمين الوزان',
  // رقم الواتساب بصيغة دولية بدون + أو 00
  whatsapp: '966551055959',
  phoneDisplay: '0590164400',
  phoneTel: '+966590164400',
  email: 'mr.alwzzan@gmail.com',
  city: 'جدة',
  address: 'جدة، المملكة العربية السعودية',
  workHours: 'السبت – الخميس: 9 صباحاً – 9 مساءً',
};

// بناء رابط واتساب مع رسالة جاهزة
export const waLink = (text = '') =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// تحويل رقم جوال محلي (05xxxxxxxx) إلى صيغة واتساب الدولية
export const toWa = (phone = '') =>
  phone.replace(/[^0-9]/g, '').replace(/^00/, '').replace(/^0/, '966');
