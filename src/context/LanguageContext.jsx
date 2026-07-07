import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../lib/translations';

const LanguageContext = createContext({});
export const useLang = () => useContext(LanguageContext);

const getInitial = () => {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (e) { /* تجاهل */ }
  return 'ar';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitial);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch (e) { /* تجاهل */ }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'));

  // t('a.b.c') يرجع النص من قاموس اللغة الحالية مع الرجوع للعربية عند غياب المفتاح
  const t = (key) => {
    const read = (root) => {
      let node = root;
      for (const part of key.split('.')) {
        node = node?.[part];
        if (node == null) return undefined;
      }
      return node;
    };
    const val = read(translations[lang]);
    return val !== undefined ? val : read(translations.ar) ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', toggle, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
