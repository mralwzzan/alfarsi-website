import { Globe } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

// زر تبديل اللغة (عربي/إنجليزي)
export default function LanguageToggle({ className = '' }) {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`inline-flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-lg border transition ${className}`}
    >
      <Globe size={16} />
      {lang === 'ar' ? 'EN' : 'ع'}
    </button>
  );
}
