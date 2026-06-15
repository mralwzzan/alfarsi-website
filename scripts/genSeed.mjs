// يولّد ملف supabase_setup.sql كاملاً (المخطط + الصلاحيات + بذر 230 عقاراً مؤجّراً بالكامل)
// التشغيل: node scripts/genSeed.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateRentedProperties } from '../src/data/properties.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v == null || v === '' ? 'null' : Number(v));

const props = generateRentedProperties(230);

const values = props
  .map((p) =>
    `(${q(p.title)}, ${q(p.type)}, ${q(p.purpose)}, ${q(p.city)}, ${q(p.district)}, ` +
    `${n(p.price)}, ${n(p.area)}, ${n(p.units)}, ${n(p.annual_income)}, ` +
    `${q(p.description)}, ${q(p.image_url)}, ${p.featured ? 'true' : 'false'}, ${q(p.status)})`
  )
  .join(',\n');

const sql = `-- ===========================================================
--  مؤسسة مارس العقارية — إعداد قاعدة البيانات (Supabase)
--  انسخ هذا الملف بالكامل في: Supabase → SQL Editor → New query → Run
--  ملاحظة: هذا الملف مُولّد آلياً عبر scripts/genSeed.mjs
-- ===========================================================

-- 1) جدول العقارات
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          text not null,            -- شقة / فيلا / دور / أرض / عمارة / محل تجاري / استراحة / مكتب
  purpose       text not null default 'بيع',  -- بيع / إيجار
  city          text not null,
  district      text,
  price         numeric,
  area          numeric,                  -- المساحة بالمتر المربع
  bedrooms      integer,
  bathrooms     integer,
  units         integer,                  -- عدد الوحدات (للعقارات الاستثمارية)
  annual_income numeric,                  -- الدخل السنوي للإيجار
  description   text,
  image_url     text,
  featured      boolean not null default false,
  status        text not null default 'available', -- available / reserved / sold / rented
  created_at    timestamptz not null default now()
);

-- إضافة الأعمدة الجديدة إن كان الجدول موجوداً مسبقاً
alter table public.properties add column if not exists units integer;
alter table public.properties add column if not exists annual_income numeric;

-- 2) جدول الاستفسارات (طلبات الزوّار عن العقارات)
create table if not exists public.property_inquiries (
  id             uuid primary key default gen_random_uuid(),
  property_id    text,
  property_title text,
  name           text not null,
  phone          text,
  message        text,
  created_at     timestamptz not null default now()
);

-- 3) تفعيل أمان الصفوف (RLS)
alter table public.properties enable row level security;
alter table public.property_inquiries enable row level security;

-- بريد المالك صاحب صلاحيات الإدارة (عدّله إن لزم)
create or replace function public.is_owner() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'mr.alwzzan@gmail.com'
$$;

-- 4) سياسات العقارات: القراءة للجميع، والتعديل للمالك فقط
drop policy if exists "properties read" on public.properties;
create policy "properties read" on public.properties for select using (true);

drop policy if exists "properties write" on public.properties;
create policy "properties write" on public.properties
  for all using (public.is_owner()) with check (public.is_owner());

-- 5) سياسات الاستفسارات: الإضافة للجميع، والاطلاع/الحذف للمالك فقط
drop policy if exists "inquiries insert" on public.property_inquiries;
create policy "inquiries insert" on public.property_inquiries for insert with check (true);

drop policy if exists "inquiries owner read" on public.property_inquiries;
create policy "inquiries owner read" on public.property_inquiries for select using (public.is_owner());

drop policy if exists "inquiries owner delete" on public.property_inquiries;
create policy "inquiries owner delete" on public.property_inquiries for delete using (public.is_owner());

-- 6) تفعيل التحديث اللحظي للاستفسارات
alter publication supabase_realtime add table public.property_inquiries;

-- 7) بذر أكثر من 220 عقاراً مؤجّراً بالكامل (بإشغال 100%)
insert into public.properties
  (title, type, purpose, city, district, price, area, units, annual_income, description, image_url, featured, status)
values
${values};
`;

writeFileSync(join(__dirname, '..', 'supabase_setup.sql'), sql, 'utf8');
console.log(`✅ تم توليد supabase_setup.sql مع ${props.length} عقاراً.`);
