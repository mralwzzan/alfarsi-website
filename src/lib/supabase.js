import { createClient } from '@supabase/supabase-js';

// ⚙️ إعدادات الاتصال بقاعدة البيانات (Supabase)
// تُملأ القيمتان التاليتان من لوحة Supabase: Settings → API
// ملاحظة: المفتاح "anon public" مُصمّم ليكون عاماً، والحماية الفعلية عبر Row Level Security.
const SUPABASE_URL = 'https://gqiwtwcsijmkvcyhyqds.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OKpLwisifSCYp1MDlSO25w_o3FwxUWA';

// بريد المالك — صاحب صلاحيات لوحة الإدارة
export const OWNER_EMAIL = 'mr.alwzzan@gmail.com';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
