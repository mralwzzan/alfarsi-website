// ثوابت العقارات: الأنواع، الغرض، المدن، والحالة
export const PROPERTY_TYPES = ['شقة', 'فيلا', 'دور', 'أرض', 'عمارة', 'محل تجاري', 'استراحة', 'مكتب'];
export const PURPOSES = ['بيع', 'إيجار'];
export const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'أبها'];
export const STATUSES = {
  available: { label: 'متاح', cls: 'bg-green-100 text-green-700' },
  reserved: { label: 'محجوز', cls: 'bg-gold-100 text-gold-700' },
  sold: { label: 'تم البيع', cls: 'bg-slate-200 text-slate-600' },
  rented: { label: 'مؤجّر', cls: 'bg-slate-200 text-slate-600' },
};

// أيقونة تمثيلية لكل نوع عقار
export const TYPE_EMOJI = {
  'شقة': '🏢', 'فيلا': '🏡', 'دور': '🏠', 'أرض': '🟫',
  'عمارة': '🏬', 'محل تجاري': '🏪', 'استراحة': '🌴', 'مكتب': '🏢',
};

// تنسيق السعر بالريال السعودي
export const formatPrice = (price) => {
  if (price == null || price === '') return '—';
  const n = Number(price);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
};

// لاحقة السعر بحسب الغرض
export const priceSuffix = (purpose) => (purpose === 'إيجار' ? 'ر.س / سنوياً' : 'ر.س');

// بيانات تجريبية تُعرض عند عدم وجود اتصال بقاعدة البيانات أو عند فراغها
// يمكن للمالك استبدالها بعقارات حقيقية من لوحة الإدارة
export const SAMPLE_PROPERTIES = [
  {
    id: 'sample-1',
    title: 'فيلا فاخرة بتشطيب مودرن',
    type: 'فيلا',
    purpose: 'بيع',
    city: 'الرياض',
    district: 'حي الملقا',
    price: 2750000,
    area: 400,
    bedrooms: 6,
    bathrooms: 7,
    description:
      'فيلا حديثة بتصميم عصري وتشطيب راقٍ، مدخلين، صالة استقبال واسعة، مجلس رجال ونساء، مطبخ مجهّز، وملحق خارجي. موقع مميز قريب من الخدمات.',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'available',
  },
  {
    id: 'sample-2',
    title: 'شقة عصرية بإطلالة مفتوحة',
    type: 'شقة',
    purpose: 'إيجار',
    city: 'جدة',
    district: 'حي الشاطئ',
    price: 75000,
    area: 165,
    bedrooms: 3,
    bathrooms: 3,
    description:
      'شقة في برج سكني راقٍ، صالة ومطبخ مفتوح، ثلاث غرف نوم، موقف خاص، خدمات أمن وصيانة على مدار الساعة، قريبة من الكورنيش.',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'available',
  },
  {
    id: 'sample-3',
    title: 'أرض سكنية على شارعين',
    type: 'أرض',
    purpose: 'بيع',
    city: 'الرياض',
    district: 'حي القيروان',
    price: 1850000,
    area: 625,
    bedrooms: null,
    bathrooms: null,
    description:
      'أرض سكنية بمخطط معتمد، على شارعين، مساحة 625م²، جاهزة للبناء، موقع استثماري مميز قرب الطرق الرئيسية.',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'available',
  },
  {
    id: 'sample-4',
    title: 'دور أرضي مستقل مع حديقة',
    type: 'دور',
    purpose: 'بيع',
    city: 'جدة',
    district: 'حي السلامة',
    price: 980000,
    area: 312,
    bedrooms: 4,
    bathrooms: 4,
    description:
      'دور أرضي مستقل بمدخل خاص وحديقة، أربع غرف، صالة واسعة، مطبخ، موقف سيارتين. مناسب للعائلات.',
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'available',
  },
  {
    id: 'sample-5',
    title: 'عمارة استثمارية مؤجّرة بالكامل',
    type: 'عمارة',
    purpose: 'بيع',
    city: 'الدمام',
    district: 'حي الفيصلية',
    price: 4200000,
    area: 600,
    bedrooms: null,
    bathrooms: null,
    description:
      'عمارة سكنية مكوّنة من 12 شقة، مؤجّرة بالكامل بعائد سنوي ممتاز، صيانة دورية، فرصة استثمارية مضمونة الدخل.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'available',
  },
  {
    id: 'sample-6',
    title: 'محل تجاري على شارع رئيسي',
    type: 'محل تجاري',
    purpose: 'إيجار',
    city: 'مكة المكرمة',
    district: 'حي العزيزية',
    price: 120000,
    area: 90,
    bedrooms: null,
    bathrooms: 1,
    description:
      'محل تجاري بواجهة زجاجية على شارع تجاري حيوي، كثافة مرورية عالية، مناسب للأنشطة التجارية والمطاعم.',
    image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'available',
  },
  {
    id: 'sample-7',
    title: 'استراحة عائلية بمسبح',
    type: 'استراحة',
    purpose: 'إيجار',
    city: 'الطائف',
    district: 'طريق الحوية',
    price: 95000,
    area: 1000,
    bedrooms: 3,
    bathrooms: 4,
    description:
      'استراحة بمساحة واسعة، مسبح، مجلس خارجي، ملعب، ومنطقة شواء. مثالية للمناسبات والتجمعات العائلية.',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'available',
  },
  {
    id: 'sample-8',
    title: 'فيلا دوبلكس بحي راقٍ',
    type: 'فيلا',
    purpose: 'بيع',
    city: 'الخبر',
    district: 'حي اللؤلؤ',
    price: 1950000,
    area: 350,
    bedrooms: 5,
    bathrooms: 6,
    description:
      'فيلا دوبلكس بتصميم أنيق، تشطيب سوبر لوكس، خمس غرف نوم ماستر، مصعد داخلي، سطح مجهّز، قرب الواجهة البحرية.',
    image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'available',
  },
];
