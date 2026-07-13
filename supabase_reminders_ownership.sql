-- ============================================================
--  ملكية التذكيرات: من يضيف التذكير هو الوحيد الذي يحذفه (أو المالك/الأدمن)
--  نفّذه مرة واحدة في Supabase → SQL Editor → Run
-- ============================================================

-- 1) أعمدة المُنشئ
alter table public.reminders add column if not exists created_by uuid;
alter table public.reminders add column if not exists created_by_email text;

-- 2) سياسات مفصّلة بدل السياسة الشاملة السابقة
drop policy if exists "staff reminders" on public.reminders;
drop policy if exists "reminders_select" on public.reminders;
drop policy if exists "reminders_insert" on public.reminders;
drop policy if exists "reminders_update" on public.reminders;
drop policy if exists "reminders_delete" on public.reminders;

-- شرط الطاقم = مالك أو موظف مُصرّح
-- العرض: كل الطاقم يرى كل التذكيرات
create policy "reminders_select" on public.reminders for select using (
  auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com'
  or exists (select 1 from public.staff s where lower(s.email) = lower(auth.jwt() ->> 'email'))
);

-- الإضافة: الطاقم فقط، ويجب أن يكون created_by = نفس المستخدم
create policy "reminders_insert" on public.reminders for insert with check (
  (
    auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com'
    or exists (select 1 from public.staff s where lower(s.email) = lower(auth.jwt() ->> 'email'))
  )
  and created_by = auth.uid()
);

-- التعديل: المالك أو صاحب الإضافة فقط
create policy "reminders_update" on public.reminders for update using (
  auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com' or created_by = auth.uid()
);

-- الحذف: المالك أو صاحب الإضافة فقط
create policy "reminders_delete" on public.reminders for delete using (
  auth.jwt() ->> 'email' = 'mr.alwzzan@gmail.com' or created_by = auth.uid()
);
