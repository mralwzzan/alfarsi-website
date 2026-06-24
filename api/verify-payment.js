// دالة تحقّق الدفع (تعمل على Vercel) — تستخدم مفتاح Moyasar السرّي من جهة الخادم.
// تتحقّق من حالة الدفعة لدى Moyasar ثم تُحدّث الحجز إلى "مدفوع" في Supabase.
//
// متغيّرات البيئة المطلوبة في Vercel (Settings → Environment Variables):
//   MOYASAR_SECRET_KEY          مفتاح Moyasar السرّي (sk_test_... أو sk_live_...)
//   SUPABASE_URL                رابط مشروع Supabase
//   SUPABASE_SERVICE_ROLE_KEY   مفتاح service_role (سرّي — لا يوضع في الواجهة أبداً)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gqiwtwcsijmkvcyhyqds.supabase.co';

export default async function handler(req, res) {
  const paymentId =
    (req.body && req.body.payment_id) ||
    (req.query && (req.query.payment_id || req.query.id));

  if (!paymentId) return res.status(400).json({ error: 'missing payment id' });

  const secret = process.env.MOYASAR_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'payment not configured' });

  try {
    // 1) جلب تفاصيل الدفعة من Moyasar بالمفتاح السرّي
    const auth = Buffer.from(`${secret}:`).toString('base64');
    const r = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const payment = await r.json();
    if (!r.ok) return res.status(400).json({ error: 'payment lookup failed' });

    const appointmentId = payment.metadata && payment.metadata.appointment_id;

    if (payment.status !== 'paid') {
      return res.status(200).json({ paid: false, status: payment.status, appointment_id: appointmentId });
    }

    // 2) تحديث الحجز إلى مدفوع (مع التأكد أن المبلغ مطابق)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey && appointmentId) {
      const supa = createClient(SUPABASE_URL, serviceKey);
      const { data: appt } = await supa
        .from('appointments')
        .select('price')
        .eq('id', appointmentId)
        .single();

      if (appt && Math.round((appt.price || 0) * 100) === payment.amount) {
        await supa
          .from('appointments')
          .update({ payment_status: 'paid', payment_id: paymentId })
          .eq('id', appointmentId);
      } else {
        return res.status(200).json({ paid: false, status: 'amount_mismatch', appointment_id: appointmentId });
      }
    }

    return res.status(200).json({ paid: true, appointment_id: appointmentId });
  } catch (e) {
    return res.status(500).json({ error: 'verification error' });
  }
}
