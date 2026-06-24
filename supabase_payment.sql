-- ============================================================
--  ربط الدفع (Moyasar): إضافة عمود رقم عملية الدفع
--  نفّذ هذا مرة واحدة في Supabase → SQL Editor → Run
--  (عمود payment_status موجود مسبقاً في supabase_setup.sql)
-- ============================================================

alter table public.appointments
  add column if not exists payment_id text;
