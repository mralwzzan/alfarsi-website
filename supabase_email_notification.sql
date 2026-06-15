-- ============================================================
--  إشعار بريد إلكتروني فوري للمالك عند وصول طلب حجز جديد
--  الطريقة: مُشغّل (Trigger) في Supabase يرسل بريداً عبر خدمة Resend المجانية
--
--  الخطوات (مرة واحدة):
--   1) أنشئ حساباً مجانياً في https://resend.com بنفس بريدك mr.alwzzan@gmail.com
--   2) من Resend → API Keys → Create API Key → انسخ المفتاح (يبدأ بـ re_)
--   3) الصق هذا الكود في Supabase → SQL Editor، واستبدل
--      RESEND_API_KEY_HERE بمفتاحك الحقيقي، ثم اضغط Run.
--  (الإرسال من onboarding@resend.dev يصل إلى بريدك مباشرة لأنه بريد حسابك في Resend)
-- ============================================================

create extension if not exists pg_net;

create or replace function public.notify_owner_new_appointment()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer RESEND_API_KEY_HERE'
    ),
    body := jsonb_build_object(
      'from', 'مكتب ساير المطيري <onboarding@resend.dev>',
      'to', 'mr.alwzzan@gmail.com',
      'subject', '📩 طلب حجز جديد — يرجى المباشرة',
      'html',
        '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;color:#3a1216">' ||
        '<h2 style="color:#6a2329">📩 لديك طلب حجز جديد — يرجى مباشرته</h2>' ||
        '<p>👤 <b>الاسم:</b> ' || coalesce(new.client_name, '-') || '</p>' ||
        '<p>📞 <b>الجوال:</b> ' || coalesce(new.client_phone, '-') || '</p>' ||
        '<p>📧 <b>البريد:</b> ' || coalesce(new.client_email, '-') || '</p>' ||
        '<p>⚖️ <b>نوع الاستشارة:</b> ' || coalesce(new.consultation_type, '-') ||
            ' (' || coalesce(new.price::text, '-') || ' ر.س)</p>' ||
        '<p>📅 <b>التاريخ:</b> ' || coalesce(new.date::text, '-') ||
            ' — ⏰ <b>الوقت:</b> ' || coalesce(new."time"::text, '-') || '</p>' ||
        '<p>📝 <b>تفاصيل:</b> ' || coalesce(new.description, '-') || '</p>' ||
        '<hr><p>افتح لوحة الإدارة للموافقة وإرسال التأكيد للعميل.</p>' ||
        '</div>'
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_owner on public.appointments;
create trigger trg_notify_owner
  after insert on public.appointments
  for each row execute function public.notify_owner_new_appointment();
