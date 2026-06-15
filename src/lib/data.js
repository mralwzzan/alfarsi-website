import { supabase, isSupabaseConfigured } from './supabase';
import { SAMPLE_PROPERTIES } from '../data/properties';

// تحميل العقارات من قاعدة البيانات، مع الرجوع لبيانات تجريبية عند الفراغ أو غياب الاتصال
// تُعيد { items, isSample } ليعرف الواجهة مصدر البيانات
export async function loadProperties() {
  if (!isSupabaseConfigured) {
    return { items: SAMPLE_PROPERTIES, isSample: true };
  }
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      return { items: SAMPLE_PROPERTIES, isSample: true };
    }
    return { items: data, isSample: false };
  } catch {
    // الجدول غير موجود بعد أو تعذّر الاتصال — نعرض البيانات التجريبية
    return { items: SAMPLE_PROPERTIES, isSample: true };
  }
}

// إيجاد عقار واحد ضمن قائمة محمّلة (يدعم المعرّفات النصية والتجريبية)
export const findProperty = (items, id) =>
  items.find((p) => String(p.id) === String(id));
