// ثوابت العقارات: الأنواع، الغرض، المدن، والحالة
export const PROPERTY_TYPES = ['شقة', 'فيلا', 'دور', 'أرض', 'عمارة', 'محل تجاري', 'استراحة', 'مكتب'];
export const PURPOSES = ['بيع', 'إيجار'];
export const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'أبها'];
export const STATUSES = {
  available: { label: 'متاح', cls: 'bg-green-100 text-green-700' },
  reserved: { label: 'محجوز', cls: 'bg-gold-100 text-gold-700' },
  sold: { label: 'تم البيع', cls: 'bg-slate-200 text-slate-600' },
  rented: { label: 'مؤجّر بالكامل', cls: 'bg-emerald-100 text-emerald-700' },
};

// أيقونة تمثيلية لكل نوع عقار
export const TYPE_EMOJI = {
  'شقة': '🏢', 'فيلا': '🏡', 'دور': '🏠', 'أرض': '🟫',
  'عمارة': '🏬', 'محل تجاري': '🏪', 'استراحة': '🌴', 'مكتب': '🏢',
};

// تنسيق السعر بالأرقام الإنجليزية مع فواصل الآلاف
export const formatPrice = (price) => {
  if (price == null || price === '') return '—';
  const n = Number(price);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
};

// لاحقة السعر بحسب الغرض
export const priceSuffix = (purpose) => (purpose === 'إيجار' ? 'ر.س / سنوياً' : 'ر.س');

// ===== مولّد العقارات الاستثمارية المؤجّرة بالكامل =====
const CITY_DISTRICTS = {
  'الرياض': ['الملقا', 'النرجس', 'الياسمين', 'القيروان', 'العارض', 'حطين', 'الصحافة', 'النخيل', 'العليا', 'الربيع'],
  'جدة': ['الشاطئ', 'السلامة', 'الروضة', 'النعيم', 'الصفا', 'المروة', 'الحمراء', 'أبحر الشمالية', 'الزهراء', 'البساتين'],
  'مكة المكرمة': ['العزيزية', 'الشوقية', 'النسيم', 'الزاهر', 'الرصيفة', 'بطحاء قريش'],
  'المدينة المنورة': ['العزيزية', 'قباء', 'الدفاع', 'الخالدية', 'شظاة', 'بني حارثة'],
  'الدمام': ['الفيصلية', 'الشاطئ', 'النور', 'الجامعيين', 'البديع', 'الريان'],
  'الخبر': ['اللؤلؤ', 'الراكة', 'العقربية', 'الثقبة', 'الحزام الذهبي', 'الخزامى'],
  'الطائف': ['الحوية', 'شهار', 'الردف', 'القيم', 'معشي', 'الفيصلية'],
  'أبها': ['المنسك', 'الموظفين', 'السودة', 'النصب', 'الخشع', 'حي الأندلس'],
};

const BUILDING_KINDS = [
  { type: 'عمارة', label: 'عمارة سكنية' },
  { type: 'عمارة', label: 'عمارة تجارية سكنية' },
  { type: 'عمارة', label: 'مجمع سكني' },
  { type: 'عمارة', label: 'برج سكني' },
  { type: 'عمارة', label: 'مجمع فلل' },
  { type: 'عمارة', label: 'عمارة فندقية' },
  { type: 'محل تجاري', label: 'مجمع محلات تجارية' },
  { type: 'مكتب', label: 'مبنى مكتبي' },
];

const QUALITY = ['استثمارية مميّزة', 'راقية', 'حديثة', 'نموذجية بموقع حيوي', 'بعائد ممتاز', 'بموقع استراتيجي'];

const IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
];

const CITY_FACTOR = {
  'الرياض': 1.2, 'جدة': 1.15, 'مكة المكرمة': 1.1, 'المدينة المنورة': 1.0,
  'الدمام': 1.0, 'الخبر': 1.05, 'الطائف': 0.85, 'أبها': 0.8,
};

const round = (n, step) => Math.round(n / step) * step;

// يولّد قائمة عقارات استثمارية مؤجّرة بالكامل (بإشغال 100%) بشكل حتمي قابل للتكرار
export function generateRentedProperties(count = 230) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const kind = BUILDING_KINDS[i % BUILDING_KINDS.length];
    const city = CITIES[i % CITIES.length];
    const districts = CITY_DISTRICTS[city];
    const district = districts[(i * 3) % districts.length];
    const units = 8 + (i % 33);
    const area = round(400 + ((i * 7) % 21) * 100, 50);
    const yieldRate = 0.06 + (i % 7) * 0.005; // 6% – 9%
    const factor = CITY_FACTOR[city] || 1;
    const price = round((units * 220000 + area * 2500) * factor, 50000);
    const annualIncome = round(price * yieldRate, 1000);
    const roi = ((annualIncome / price) * 100).toFixed(1);
    const quality = QUALITY[(i * 5) % QUALITY.length];

    list.push({
      id: `prop-${i + 1}`,
      title: `${kind.label} ${quality} — ${district}`,
      type: kind.type,
      purpose: 'بيع',
      city,
      district,
      price,
      area,
      bedrooms: null,
      bathrooms: null,
      units,
      annual_income: annualIncome,
      description:
        `${kind.label} ${quality} في ${district} بمدينة ${city}، مؤجّرة بالكامل بنسبة إشغال 100%. ` +
        `تتكوّن من ${units} وحدة بمساحة إجمالية ${area} م². ` +
        `الدخل السنوي ${formatPrice(annualIncome)} ر.س بعائد استثماري ${roi}% تقريباً. ` +
        `عقود إيجار سارية وصيانة دورية منتظمة — فرصة استثمارية مضمونة الدخل.`,
      image_url: IMAGES[i % IMAGES.length],
      featured: i % 28 === 0,
      status: 'rented',
    });
  }
  return list;
}

// أكثر من 220 عقاراً مؤجّراً بالكامل — تُعرض تلقائياً قبل ربط قاعدة البيانات
export const SAMPLE_PROPERTIES = generateRentedProperties(230);
