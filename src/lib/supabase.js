import { createClient } from '@supabase/supabase-js';

// ⚙️ إعدادات الاتصال بقاعدة بيانات مؤسسة مارس العقارية (Supabase) — مشروع مستقل
// 1) أنشئ مشروعاً جديداً خاصاً بمارس العقارية على https://supabase.com
// 2) من Settings → API انسخ Project URL و anon public key، وضعهما أدناه.
// 3) شغّل ملف supabase_setup.sql في SQL Editor لإنشاء الجداول والصلاحيات.
// ملاحظة: المفتاح "anon public" مُصمّم ليكون عاماً، والحماية الفعلية عبر Row Level Security.
const SUPABASE_URL = '';        // مثال: https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = '';   // مفتاح anon public الخاص بمشروع مارس العقارية

// بريد المالك — صاحب صلاحيات لوحة الإدارة (عدّله حسب الحاجة)
export const OWNER_EMAIL = 'mr.alwzzan@gmail.com';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
