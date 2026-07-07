import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { MOYASAR_PUBLISHABLE_KEY, MOYASAR_METHODS } from '../lib/payment';
import { useLang } from '../context/LanguageContext';

const MOYASAR_CSS = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.css';
const MOYASAR_JS = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.js';

// تحميل ملف خارجي (CSS/JS) مرة واحدة فقط
const loadAsset = (href, isScript) =>
  new Promise((resolve, reject) => {
    const sel = isScript ? `script[src="${href}"]` : `link[href="${href}"]`;
    if (document.querySelector(sel)) return resolve();
    const el = isScript ? document.createElement('script') : document.createElement('link');
    if (isScript) {
      el.src = href;
      el.async = true;
    } else {
      el.rel = 'stylesheet';
      el.href = href;
    }
    el.onload = resolve;
    el.onerror = reject;
    document.head.appendChild(el);
  });

// نافذة الدفع: تعرض نموذج Moyasar (بطاقة/مدى/STC Pay/Apple Pay)
export default function PaymentModal({ appointment, onClose }) {
  const { t, dir } = useLang();
  const initialized = useRef(false);
  const typeLabel = t('types')[appointment.consultation_type] || appointment.consultation_type;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAsset(MOYASAR_CSS, false);
        await loadAsset(MOYASAR_JS, true);
        if (cancelled || initialized.current || !window.Moyasar) return;
        initialized.current = true;
        window.Moyasar.init({
          element: '.mysr-form',
          amount: Math.round((appointment.price || 0) * 100), // بالهللات
          currency: 'SAR',
          description: `${typeLabel} — ${appointment.consultation_type}`,
          publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
          callback_url: `${window.location.origin}/dashboard`,
          methods: MOYASAR_METHODS,
          metadata: { appointment_id: appointment.id },
          apple_pay: {
            country: 'SA',
            label: 'مكتب ساير المطيري',
            validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
          },
        });
      } catch (e) {
        // في حال فشل تحميل سكربت Moyasar
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appointment]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div dir={dir} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">{t('payment.title')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <p className="text-slate-600">{typeLabel}</p>
        <p className="text-3xl font-bold text-brand-600 mb-5">
          {appointment.price} <span className="text-base">{t('prices.currency')}</span>
        </p>
        <div className="mysr-form" />
        <p className="text-xs text-slate-400 mt-4 text-center">{t('payment.secure')}</p>
      </div>
    </div>
  );
}
