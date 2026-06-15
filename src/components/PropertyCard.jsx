import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Building2, ArrowLeft, TrendingUp } from 'lucide-react';
import { formatPrice, priceSuffix, STATUSES, TYPE_EMOJI } from '../data/properties';

export default function PropertyCard({ p }) {
  const st = STATUSES[p.status] || STATUSES.available;
  return (
    <Link
      to={`/property/${p.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
    >
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">{TYPE_EMOJI[p.type] || '🏠'}</div>
        )}
        <span className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">{p.purpose}</span>
        <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${st.cls}`}>{st.label}</span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600">{TYPE_EMOJI[p.type]} {p.type}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1">{p.title}</h3>
        <p className="flex items-center gap-1 text-slate-500 text-sm mb-3">
          <MapPin size={15} /> {p.city}{p.district ? ` — ${p.district}` : ''}
        </p>

        <div className="flex items-center gap-4 text-slate-600 text-sm mb-3 flex-wrap">
          {p.area ? <span className="flex items-center gap-1"><Maximize size={15} /> {p.area} م²</span> : null}
          {p.units ? <span className="flex items-center gap-1"><Building2 size={15} /> {p.units} وحدة</span> : null}
          {p.bedrooms ? <span className="flex items-center gap-1"><BedDouble size={15} /> {p.bedrooms}</span> : null}
          {p.bathrooms ? <span className="flex items-center gap-1"><Bath size={15} /> {p.bathrooms}</span> : null}
        </div>

        {p.annual_income ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg mb-4 w-fit">
            <TrendingUp size={14} /> دخل سنوي {formatPrice(p.annual_income)} ر.س
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xl font-extrabold text-brand-700">{formatPrice(p.price)}</span>
            <span className="text-slate-400 text-xs mr-1">{priceSuffix(p.purpose)}</span>
          </div>
          <span className="flex items-center gap-1 text-brand-600 font-semibold text-sm group-hover:gap-2 transition-all">
            التفاصيل <ArrowLeft size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
