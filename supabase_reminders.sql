-- ============================================================
--  جدول التذكيرات (جلسات ومواعيد المالك) — نفّذه مرة واحدة في Supabase SQL Editor
-- ============================================================

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text,
  case_number text,
  plaintiff text,
  defendant text,
  hijri_date text,
  greg_date date,
  "time" text,
  raw_text text,
  created_at timestamptz default now()
);

-- إن كان الجدول موجوداً مسبقاً، أضف العمودين الجديدين:
alter table public.reminders add column if not exists plaintiff text;
alter table public.reminders add column if not exists defendant text;

alter table public.reminders enable row level security;

-- المالك فقط يضيف/يعرض/يحذف تذكيراته
drop policy if exists "owner reminders" on public.reminders;
create policy "owner reminders" on public.reminders for all
  using (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com');
