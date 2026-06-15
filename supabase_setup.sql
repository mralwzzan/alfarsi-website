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
  consultation_type text not null,
  price int,
  date date not null,
  "time" time not null,
  description text,
  status text not null default 'pending', -- pending | approved | rejected
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
