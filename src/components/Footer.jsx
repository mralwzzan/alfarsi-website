import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { SITE, waLink } from '../lib/site';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="bg-white rounded-xl p-3 inline-block mb-4">
              <img src="/logo.svg" alt={SITE.name} className="h-12 w-auto" />
            </div>
            <p className="text-sm leading-relaxed mb-3 text-brand-200">{SITE.description}</p>
            <div className="border-t border-brand-700 pt-3 space-y-1">
              <p className="text-xs text-brand-300">المدير العام</p>
              <p className="text-white font-bold">{SITE.manager}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-white transition">العقارات</Link></li>
              <li><a href="/#services" className="hover:text-white transition">خدماتنا</a></li>
              <li><a href="/#about" className="hover:text-white transition">من نحن</a></li>
              <li><a href="/#contact" className="hover:text-white transition">تواصل</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone size={16} /> <a href={`tel:${SITE.phoneTel}`} className="hover:text-white transition"><span dir="ltr">{SITE.phoneDisplay}</span></a></li>
              <li className="flex items-center gap-2">💬 <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">واتساب</a></li>
              <li className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${SITE.email}`} className="hover:text-white transition">{SITE.email}</a></li>
              <li className="flex items-center gap-2"><MapPin size={16} /> {SITE.address}</li>
              <li className="flex items-center gap-2"><Clock size={16} /> {SITE.workHours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-700 pt-8 text-center text-sm text-brand-300">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
