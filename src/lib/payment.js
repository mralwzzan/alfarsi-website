// ⚙️ إعدادات الدفع عبر Moyasar (مُيسِّر)
// المفتاح العام (publishable) آمن للعرض في الواجهة — الحماية الفعلية بالتحقق من جهة الخادم.
// يُضبط من Vercel: Settings → Environment Variables → VITE_MOYASAR_PUBLISHABLE_KEY
// قيمته من لوحة Moyasar: Settings → API Keys (يبدأ بـ pk_test_ للتجربة أو pk_live_ للإنتاج)
export const MOYASAR_PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || '';

// طرق الدفع المعروضة (mada تُعالَج ضمن البطاقات)
export const MOYASAR_METHODS = ['creditcard', 'stcpay', 'applepay'];

export const isPaymentConfigured = MOYASAR_PUBLISHABLE_KEY.startsWith('pk_');
