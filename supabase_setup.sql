-- ===========================================================
--  مؤسسة مارس العقارية — إعداد قاعدة البيانات (Supabase)
--  انسخ هذا الملف بالكامل في: Supabase → SQL Editor → New query → Run
-- ===========================================================

-- 1) جدول العقارات
create table if not exists public.properties (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null,            -- شقة / فيلا / دور / أرض / عمارة / محل تجاري / استراحة / مكتب
  purpose     text not null default 'بيع',  -- بيع / إيجار
  city        text not null,
  district    text,
  price       numeric,
  area        numeric,                  -- المساحة بالمتر المربع
  bedrooms    integer,
  bathrooms   integer,
  description text,
  image_url   text,
  featured    boolean not null default false,
  status      text not null default 'available', -- available / reserved / sold / rented
  created_at  timestamptz not null default now()
);

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

-- بريد المالك صاحب صلاحيات الإدارة
--  ⬇️ عدّل البريد هنا إن لزم
create or replace function public.is_owner() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'mr.alwzzan@gmail.com'
$$;

-- 4) سياسات العقارات: القراءة متاحة للجميع، والتعديل للمالك فقط
drop policy if exists "properties read" on public.properties;
create policy "properties read" on public.properties
  for select using (true);

drop policy if exists "properties write" on public.properties;
create policy "properties write" on public.properties
  for all using (public.is_owner()) with check (public.is_owner());

-- 5) سياسات الاستفسارات: الإضافة متاحة للجميع، والاطلاع/الحذف للمالك فقط
drop policy if exists "inquiries insert" on public.property_inquiries;
create policy "inquiries insert" on public.property_inquiries
  for insert with check (true);

drop policy if exists "inquiries owner read" on public.property_inquiries;
create policy "inquiries owner read" on public.property_inquiries
  for select using (public.is_owner());

drop policy if exists "inquiries owner delete" on public.property_inquiries;
create policy "inquiries owner delete" on public.property_inquiries
  for delete using (public.is_owner());

-- 6) تفعيل التحديث اللحظي للاستفسارات (إشعار فوري في لوحة الإدارة)
alter publication supabase_realtime add table public.property_inquiries;

-- 7) (اختياري) عقارات تجريبية للبدء — احذفها أو استبدلها لاحقاً
insert into public.properties (title, type, purpose, city, district, price, area, bedrooms, bathrooms, description, image_url, featured, status) values
('فيلا فاخرة بتشطيب مودرن', 'فيلا', 'بيع', 'الرياض', 'حي الملقا', 2750000, 400, 6, 7,
 'فيلا حديثة بتصميم عصري وتشطيب راقٍ، مدخلين، صالة استقبال واسعة، مجلس رجال ونساء، مطبخ مجهّز، وملحق خارجي.',
 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', true, 'available'),
('شقة عصرية بإطلالة مفتوحة', 'شقة', 'إيجار', 'جدة', 'حي الشاطئ', 75000, 165, 3, 3,
 'شقة في برج سكني راقٍ، صالة ومطبخ مفتوح، ثلاث غرف نوم، موقف خاص، خدمات أمن وصيانة على مدار الساعة.',
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', true, 'available'),
('أرض سكنية على شارعين', 'أرض', 'بيع', 'الرياض', 'حي القيروان', 1850000, 625, null, null,
 'أرض سكنية بمخطط معتمد، على شارعين، جاهزة للبناء، موقع استثماري مميز قرب الطرق الرئيسية.',
 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', true, 'available');
