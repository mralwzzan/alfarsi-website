-- ============================================================
--  إعداد قاعدة بيانات منصة مكتب الفارس للمحاماة (Supabase)
--  انسخ هذا الملف كاملاً والصقه في: Supabase → SQL Editor → New query → Run
-- ============================================================

-- جدول المواعيد / الحجوزات
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_name text not null,
  client_email text,
  client_phone text,
  consultation_type text not null,
  price int,
  date date not null,
  "time" time not null,
  description text,
  status text not null default 'pending', -- pending | approved | rejected
  payment_status text not null default 'unpaid', -- unpaid | paid
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;

-- العميل يرى حجوزاته فقط، والمالك يرى الجميع
drop policy if exists "read appointments" on public.appointments;
create policy "read appointments" on public.appointments for select
  using (
    auth.uid() = user_id
    or auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com'
  );

-- العميل ينشئ حجزاً لنفسه فقط
drop policy if exists "insert own appointment" on public.appointments;
create policy "insert own appointment" on public.appointments for insert
  with check (auth.uid() = user_id);

-- المالك فقط يوافق/يرفض (تحديث الحالة)
drop policy if exists "owner update appointments" on public.appointments;
create policy "owner update appointments" on public.appointments for update
  using (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com');


-- جدول المواعيد المتاحة (يضيفها المالك ليختار منها العملاء)
create table if not exists public.available_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  "time" time not null,
  created_at timestamptz default now()
);

alter table public.available_slots enable row level security;

-- أي مستخدم مسجّل يرى المواعيد المتاحة
drop policy if exists "read slots" on public.available_slots;
create policy "read slots" on public.available_slots for select
  using (auth.role() = 'authenticated');

-- المالك فقط يضيف/يحذف المواعيد المتاحة
drop policy if exists "owner manage slots" on public.available_slots;
create policy "owner manage slots" on public.available_slots for all
  using (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com');


-- منع حجز نفس الموعد مرتين (التاريخ + الوقت) ما لم يكن مرفوضاً
create unique index if not exists uniq_active_slot
  on public.appointments (date, "time")
  where status <> 'rejected';

-- عرض يُظهر الأوقات المحجوزة فقط (بدون أي بيانات شخصية) ليتمكّن العملاء من رؤية
-- المواعيد المقفلة دون رؤية بيانات بعضهم. يتجاوز هذا العرض RLS لأنه يكشف عمودين فقط.
create or replace view public.booked_times as
  select date, "time" from public.appointments where status <> 'rejected';

grant select on public.booked_times to authenticated;
