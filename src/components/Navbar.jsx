import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SITE } from '../lib/site';

// شريط تنقّل مشترك. عند تمرير home=true تكون روابط الأقسام داخل الصفحة الرئيسية
export default function Navbar({ home = false }) {
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const [open, setOpen] = useState(false);

  const accountPath = user ? (isOwner ? '/admin' : '/') : '/login';
  const sectionHref = (id) => (home ? `#${id}` : `/#${id}`);

  const links = [
    { label: 'العقارات', to: '/properties' },
    { label: 'خدماتنا', href: sectionHref('services') },
    { label: 'من نحن', href: sectionHref('about') },
    { label: 'تواصل', href: sectionHref('contact') },
  ];

  return (
    <nav className="fixed w-full top-0 bg-white/95 backdrop-blur shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt={SITE.name} className="h-11 md:h-12 w-auto" />
        </Link>

        <div className="hidden md:flex gap-7 items-center">
          {links.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to} className="text-slate-700 hover:text-brand-600 font-semibold transition">{l.label}</Link>
            ) : (
              <a key={l.label} href={l.href} className="text-slate-700 hover:text-brand-600 font-semibold transition">{l.label}</a>
            )
          )}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          <a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-2 text-brand-700 font-semibold">
            <Phone size={18} /> <span dir="ltr">{SITE.phoneDisplay}</span>
          </a>
          <button onClick={() => navigate(accountPath)} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg font-semibold transition">
            {user && isOwner ? <LayoutDashboard size={18} /> : <LogIn size={18} />}
            {user && isOwner ? 'لوحة الإدارة' : 'دخول الإدارة'}
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-brand-800">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-2">
          {links.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{l.label}</Link>
            ) : (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-slate-700 hover:text-brand-600 font-semibold py-2">{l.label}</a>
            )
          )}
          <button onClick={() => { setOpen(false); navigate(accountPath); }} className="w-full bg-brand-600 text-white px-4 py-3 rounded-lg font-semibold mt-2">
            {user && isOwner ? 'لوحة الإدارة' : 'دخول الإدارة'}
          </button>
        </div>
      )}
    </nav>
  );
}
