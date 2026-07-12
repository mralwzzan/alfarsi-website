// استخراج تفاصيل الموعد/الجلسة من رسالة نصية (مثل رسائل ناجز) تلقائياً

// تحويل تاريخ هجري (أم القرى) إلى ميلادي عبر Intl (يبحث عن اليوم المطابق)
export function hijriToGregorian(hy, hm, hd) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
    const gyEst = Math.floor(hy * 0.970224 + 621.5); // تقدير سنة ميلادية قريبة
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

export function parseReminder(text) {
  const raw = (text || '').trim();

  // التاريخ: هجري (13xx/14xx) أو ميلادي (20xx)
  let hijri_date = null, greg_date = null;
  const dateM = raw.match(/(\d{3,4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})/);
  if (dateM) {
    const y = Number(dateM[1]), mo = Number(dateM[2]), da = Number(dateM[3]);
    if (y >= 1300 && y <= 1600) {
      hijri_date = `${y}/${String(mo).padStart(2, '0')}/${String(da).padStart(2, '0')}`;
      greg_date = hijriToGregorian(y, mo, da);
    } else if (y >= 2000 && y <= 2100) {
      greg_date = `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
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
    time = `${String(h).padStart(2, '0')}:${mi}`;
  }

  // رقم القضية (بعد كلمة رقم، أطول سلسلة أرقام)
  let case_number = null;
  const caseM = raw.match(/رقم[^0-9]{0,10}(\d{6,})/);
  if (caseM) case_number = caseM[1];
  else {
    const longest = (raw.match(/\d{7,}/g) || []).sort((a, b) => b.length - a.length)[0];
    if (longest) case_number = longest;
  }

  // العنوان: السطر بعد "للقضية" أو أول سطر ذي معنى
  let title = null;
  const qM = raw.match(/للقضية[\s:]*([^\n]+)/);
  if (qM) title = qM[1].trim();
  if (!title) {
    const skip = /^(صاحب|نبلغكم|رقم|بتاريخ|الساعة|ويمكنكم|كما)/;
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    title = lines.find((l) => !skip.test(l) && l.length > 4) || lines[0] || 'تذكير';
  }
  title = title.slice(0, 120);

  return { title, case_number, hijri_date, greg_date, time, raw_text: raw };
}
