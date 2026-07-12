// أدوات تحليل رسائل التبليغ وتحويل التاريخ الهجري وتصدير التقويم (ics)
// تعمل بالكامل في المتصفح دون أي خدمة خارجية.

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
// تحويل الأرقام العربية-الهندية إلى أرقام لاتينية لتسهيل التحليل
export const toLatinDigits = (s = '') =>
  s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

const pad = (n) => String(n).padStart(2, '0');

// يحلّل نص رسالة التبليغ ويستخرج الحقول المهمة تلقائياً.
// يتحمّل اختلاف ترتيب الأسطر ووجود القيمة في نفس السطر أو السطر التالي.
export function parseNotice(raw) {
  const clean = (raw || '').replace(/[‎‏‪-‮]/g, '');
  const norm = toLatinDigits(clean);
  const lines = norm.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const result = {
    identity: '',
    caseType: '',
    caseNumber: '',
    hijri: '',
    time: '',
    period: 'am', // am صباحاً / pm مساءً
    raw: (raw || '').trim(),
  };

  // رقم الهوية (قد يكون مُقنّعاً بنجوم مثل ******1838)
  const idMatch = norm.match(/الهوية[^\dA-Za-z*]*([*\d]{4,})/);
  if (idMatch) result.identity = idMatch[1];

  // نوع/موضوع القضية: عادةً السطر الذي يلي السطر المتضمّن كلمة «القضية» (أو «للقضية»)
  const idxCase = lines.findIndex((l) => /قضية/.test(l));
  if (idxCase !== -1) {
    const inline = lines[idxCase].match(/(?:لل?قضية)[:\s]+(.+)/);
    if (inline && inline[1].trim()) {
      result.caseType = inline[1].trim();
    } else if (lines[idxCase + 1] && !/^(رقم|بتاريخ|الساعة|التاريخ)/.test(lines[idxCase + 1])) {
      result.caseType = lines[idxCase + 1].trim();
    }
  }

  // رقم القضية: رقم طويل يلي كلمة «رقم»
  const numMatch = norm.match(/رقم[:\s\n]*([0-9]{6,})/);
  if (numMatch) result.caseNumber = numMatch[1];

  // التاريخ الهجري بصيغة سنة/شهر/يوم (13xx–15xx)
  const dateMatch = norm.match(/(1[3-5]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (dateMatch) {
    result.hijri = `${dateMatch[1]}/${pad(dateMatch[2])}/${pad(dateMatch[3])}`;
  }

  // الساعة + الفترة (صباحاً/مساءً)
  const timeMatch = norm.match(/الساعة[:\s]*([0-2]?\d)[:.٫]?(\d{2})?\s*(صباح\S*|مساء\S*|ص|م)?/);
  if (timeMatch) {
    const hh = timeMatch[1];
    const mm = timeMatch[2] || '00';
    result.time = `${pad(hh)}:${mm}`;
    const p = timeMatch[3] || '';
    result.period = /مساء|^م$/.test(p) ? 'pm' : 'am';
  }

  return result;
}

// تحويل التاريخ الهجري (أم القرى) إلى ميلادي باستخدام تقويم المتصفح المدمج.
// يقدّر التاريخ الميلادي أولاً ثم يبحث حوله عن التطابق الدقيق.
export function hijriToGregorian(hy, hm, hd) {
  hy = Number(hy); hm = Number(hm); hd = Number(hd);
  if (!hy || !hm || !hd) return null;

  const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC',
  });
  const matches = (date) => {
    const parts = fmt.formatToParts(date);
    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    return get('year') === hy && get('month') === hm && get('day') === hd;
  };

  // تقدير أولي: عدد الأيام منذ بداية التقويم الهجري (1 محرم 1هـ ≈ 622-07-19 م)
  const approxDays = Math.floor((hy - 1) * 354.367) + Math.floor((hm - 1) * 29.5) + hd;
  const epoch = Date.UTC(622, 6, 19);
  const guess = epoch + approxDays * 86400000;

  // بحث موسّع حول التقدير لضمان الدقة (±25 يوماً)
  for (let off = -25; off <= 25; off++) {
    const d = new Date(guess + off * 86400000);
    if (matches(d)) {
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
    }
  }
  return null;
}

// يبني كائن التذكير الكامل من الحقول (مع التاريخ الميلادي ووقت البداية).
export function buildReminder(fields) {
  const [hy, hm, hd] = (fields.hijri || '').split('/');
  const greg = hijriToGregorian(hy, hm, hd);

  let start = null;
  if (greg && fields.time) {
    let [h, min] = fields.time.split(':').map(Number);
    if (fields.period === 'pm' && h < 12) h += 12;
    if (fields.period === 'am' && h === 12) h = 0;
    start = new Date(greg.y, greg.m - 1, greg.d, h, min || 0, 0);
  } else if (greg) {
    start = new Date(greg.y, greg.m - 1, greg.d, 9, 0, 0);
  }

  return {
    id: `${Date.now()}-${Math.floor((start ? start.getTime() : 0) % 100000)}`,
    identity: fields.identity || '',
    caseType: fields.caseType || 'موعد',
    caseNumber: fields.caseNumber || '',
    hijri: fields.hijri || '',
    time: fields.time || '',
    period: fields.period || 'am',
    gregorian: greg ? `${greg.y}-${pad(greg.m)}-${pad(greg.d)}` : '',
    startISO: start ? start.toISOString() : '',
    note: fields.raw || '',
    createdAt: Date.now(),
  };
}

// تنسيق ملف iCalendar لإضافة الموعد إلى تقويم الجوال مع تنبيهات تلقائية.
function icsDate(dt) {
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    'T' +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    '00Z'
  );
}

export function buildICS(reminder) {
  if (!reminder.startISO) return '';
  const start = new Date(reminder.startISO);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // ساعة افتراضية
  const title = `${reminder.caseType}${reminder.caseNumber ? ' — ' + reminder.caseNumber : ''}`;
  const desc = (reminder.note || '').replace(/\r?\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//alfarsi-reminders//AR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${reminder.id}@alfarsi-reminders`,
    `DTSTAMP:${icsDate(new Date(reminder.createdAt))}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    // تنبيه قبل يوم كامل
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    // تنبيه قبل ساعتين
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
