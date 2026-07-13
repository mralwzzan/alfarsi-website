// استخراج تفاصيل الجلسة/الموعد من رسالة نصية (مثل رسائل ناجز) تلقائياً

// تحويل تاريخ هجري (أم القرى) إلى ميلادي عبر Intl (يبحث عن اليوم المطابق)
export function hijriToGregorian(hy, hm, hd) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
    const gyEst = Math.floor(hy * 0.970224 + 621.5);
    const d = new Date(Date.UTC(gyEst - 1, 0, 1));
    for (let i = 0; i < 900; i++) {
      const p = fmt.formatToParts(d).reduce((o, x) => { o[x.type] = x.value; return o; }, {});
      if (Number(p.year) === hy && Number(p.month) === hm && Number(p.day) === hd) {
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      }
      d.setUTCDate(d.getUTCDate() + 1);
    }
  } catch (e) { /* بيئة لا تدعم تقويم أم القرى */ }
  return null;
}

const pad = (n) => String(n).padStart(2, '0');

// يفكّ تاريخاً من نص، ويتعرّف على الترتيب: سنة/شهر/يوم أو يوم/شهر/سنة
function extractDate(seg) {
  if (!seg) return null;
  const m = seg.match(/(\d{1,4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,4})/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
  let y, mo, d;
  if (a >= 1300) { y = a; mo = b; d = c; }        // YYYY/MM/DD
  else if (c >= 1300) { d = a; mo = b; y = c; }   // DD/MM/YYYY
  else return null;
  if (mo > 12 && d <= 12) { const tmp = mo; mo = d; d = tmp; } // أمان: تبديل إن كان الشهر > 12
  return { y, mo, d };
}

const DATE_TOKEN = '([0-9]{1,4}\\s*[/\\-.]\\s*[0-9]{1,2}\\s*[/\\-.]\\s*[0-9]{1,4})';
const afterLabel = (raw, label) => {
  const m = raw.match(new RegExp(label + '[\\s:]*' + DATE_TOKEN));
  return m ? m[1] : null;
};

export function parseReminder(text) {
  const raw = (text || '').trim();

  // التاريخ: نفضّل "إلى تاريخ" (الموعد الجديد) ثم "بتاريخ/المحددة بتاريخ" ثم أي تاريخ
  const seg = afterLabel(raw, 'إلى\\s*تاريخ') || afterLabel(raw, 'بتاريخ');
  const info = extractDate(seg) || extractDate(raw);
  let hijri_date = null, greg_date = null;
  if (info) {
    if (info.y >= 1300 && info.y <= 1600) {
      hijri_date = `${info.y}/${pad(info.mo)}/${pad(info.d)}`;
      greg_date = hijriToGregorian(info.y, info.mo, info.d);
    } else if (info.y >= 2000 && info.y <= 2100) {
      greg_date = `${info.y}-${pad(info.mo)}-${pad(info.d)}`;
    }
  }

  // الوقت (مع صباحاً/مساءً)
  let time = null;
  const timeM = raw.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (timeM) {
    let h = Number(timeM[1]);
    const mi = timeM[2];
    const near = raw.slice(timeM.index, timeM.index + 24);
    if (/مساء|pm|PM/.test(near) && h < 12) h += 12;
    if (/صباح|am|AM/.test(near) && h === 12) h = 0;
    time = `${pad(h)}:${mi}`;
  }

  // رقم القضية
  let case_number = null;
  const caseM = raw.match(/رقم[^0-9]{0,12}(\d{6,})/);
  if (caseM) case_number = caseM[1];
  else {
    const longest = (raw.match(/\d{7,}/g) || []).sort((a, b) => b.length - a.length)[0];
    if (longest) case_number = longest;
  }

  // أطراف القضية
  const pM = raw.match(/المقامة\s*من\s*:?\s*([^\n]+)/);
  let plaintiff = pM ? pM[1].replace(/\s*ضد\s*:.*/, '').trim() : null;
  const dM = raw.match(/ضد\s*:\s*([^\n]+)/);
  let defendant = dM ? dM[1].trim() : null;
  if (plaintiff) plaintiff = plaintiff.slice(0, 120);
  if (defendant) defendant = defendant.slice(0, 120);

  // العنوان: أطراف القضية إن وُجدت، وإلا نوع القضية بعد "للقضية"، وإلا أول سطر ذي معنى
  let title = null;
  if (plaintiff || defendant) {
    title = [plaintiff, defendant].filter(Boolean).join(' / ');
  }
  if (!title) {
    const qM = raw.match(/للقضية[\s:]*([^\n]+)/);
    if (qM) {
      const cand = qM[1].trim();
      if (!/^رقم|^\d/.test(cand)) title = cand;
    }
  }
  if (!title) {
    const skip = /^(صاحب|نبلغكم|رقم|بتاريخ|المحددة|إلى|الساعة|ويمكنكم|كما|https?:)/;
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    title = lines.find((l) => !skip.test(l) && l.length > 4) || lines[0] || 'تذكير';
  }
  title = title.slice(0, 140);

  return { title, case_number, plaintiff, defendant, hijri_date, greg_date, time, raw_text: raw };
}
