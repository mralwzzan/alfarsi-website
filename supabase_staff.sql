-- ============================================================
--  حسابات الموظفين (صلاحية محدودة: تذكيرات الجلسات/المواعيد فقط)
--  نفّذه مرة واحدة في Supabase → SQL Editor → Run
-- ============================================================

-- جدول الموظفين المصرّح لهم (يضيف المالك بريد الموظف، ثم يسجّل الموظف بنفس البريد)
create table if not exists public.staff (
  email text primary key,
  role text not null default 'employee',
  created_at timestamptz default now()
);

alter table public.staff enable row level security;

-- المالك يدير قائمة الموظفين (إضافة/حذف/عرض الكل)
drop policy if exists "owner manage staff" on public.staff;
create policy "owner manage staff" on public.staff for all
  using (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com');

-- كل مستخدم يقرأ صفّه الخاص فقط (ليعرف دوره)
drop policy if exists "read own staff row" on public.staff;
create policy "read own staff row" on public.staff for select
  using (lower(auth.jwt() ->> 'email') = lower(email));

-- ---- صلاحية التذكيرات: المالك + الموظفون ----
drop policy if exists "owner reminders" on public.reminders;
drop policy if exists "staff reminders" on public.reminders;
create policy "staff reminders" on public.reminders for all
  using (
    auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com'
    or exists (select 1 from public.staff s where lower(s.email) = lower(auth.jwt() ->> 'email'))
  )
  with check (
    auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com'
    or exists (select 1 from public.staff s where lower(s.email) = lower(auth.jwt() ->> 'email'))
  );
