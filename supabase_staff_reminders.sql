-- ============================================================
--  إضافة نظام الموظفين + تخزين التذكيرات (مكتب الفارس للمحاماة)
--  انسخ هذا الملف كاملاً والصقه في: Supabase → SQL Editor → New query → Run
--  (يعمل بأمان حتى لو شُغّل أكثر من مرة)
-- ============================================================

-- ---------- دوال مساعدة لتحديد الدور ----------
-- security definer: تتجاوز RLS عند الفحص لتفادي التكرار اللانهائي.

-- المالك: بريد الإدارة الثابت
create or replace function public.is_owner()
  returns boolean language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'mr.alwzzan@gmail.com';
$$;

-- من طاقم العمل: المالك أو موظف مُفعّل مُسجّل في جدول staff
create or replace function public.is_staff()
  returns boolean language sql stable security definer set search_path = public as $$
  select public.is_owner()
    or exists (
      select 1 from public.staff s
      where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and s.active
    );
$$;

-- ---------- جدول الموظفين ----------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'employee', -- employee (قابل للتوسّع لاحقاً)
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.staff enable row level security;

-- الإدارة فقط تضيف/تعدّل/تحذف الموظفين
drop policy if exists "owner manage staff" on public.staff;
create policy "owner manage staff" on public.staff for all
  using (public.is_owner())
  with check (public.is_owner());

-- الموظف يقرأ سجلّه فقط (ليتعرّف النظام على دوره)، والإدارة تقرأ الجميع
drop policy if exists "read own staff row" on public.staff;
create policy "read own staff row" on public.staff for select
  using (
    public.is_owner()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- ---------- جدول التذكيرات ----------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_by_email text,
  created_by_name text,
  identity text,
  case_type text,
  case_number text,
  hijri_date text,
  appt_time text,
  period text default 'am',
  gregorian_date date,
  start_at timestamptz,
  note text,
  created_at timestamptz default now()
);

alter table public.reminders enable row level security;

-- القراءة: كل أعضاء الطاقم (الموظفون + الإدارة) يطّلعون على كل مواعيد الجلسات
drop policy if exists "read reminders" on public.reminders;
create policy "read reminders" on public.reminders for select
  using (public.is_staff());

-- الإنشاء: أعضاء الطاقم فقط، وكلٌّ لنفسه
drop policy if exists "staff insert reminder" on public.reminders;
create policy "staff insert reminder" on public.reminders for insert
  with check (auth.uid() = user_id and public.is_staff());

-- التعديل: صاحب التذكير (من الطاقم) أو الإدارة
drop policy if exists "update own reminder" on public.reminders;
create policy "update own reminder" on public.reminders for update
  using ((auth.uid() = user_id and public.is_staff()) or public.is_owner());

-- الحذف: صاحب التذكير أو الإدارة
drop policy if exists "delete own reminder" on public.reminders;
create policy "delete own reminder" on public.reminders for delete
  using ((auth.uid() = user_id and public.is_staff()) or public.is_owner());

create index if not exists idx_reminders_user on public.reminders (user_id);
create index if not exists idx_reminders_start on public.reminders (start_at);
