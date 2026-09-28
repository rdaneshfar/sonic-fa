/**
 * Persian Grapheme-to-Phoneme (G2P) and Acoustic Transliteration Engine.
 * Converts Persian script into phonetic vocalization so any system voice
 * pronounces genuine, intelligible Persian words and sentences without spelling letter names.
 * If a native Persian voice (fa-IR) is present, it uses native Persian script.
 * 100% offline, local browser processing, zero external API.
 */

// Dictionary of high-frequency Persian words for natural pronunciation
export const COMMON_PERSIAN_G2P_DICT: Record<string, string> = {
  // سلام و احوال‌پرسی
  'سلام': 'Salaam',
  'درود': 'Dorood',
  'صبح': 'Sobh',
  'شب': 'Shab',
  'روز': 'Rooz',
  'خوش': 'Khosh',
  'آمدید': 'Aamadeed',
  'خوش‌آمدید': 'Khosh-aamadeed',
  'گرامی': 'Geraamee',
  'همراهان': 'Hamraahaan',
  'دوستان': 'Doostaan',
  'عزیزان': 'Azeezan',

  // ضمایر و حروف اضافه
  'من': 'Man',
  'تو': 'To',
  'او': 'Oo',
  'ما': 'Maa',
  'شما': 'Shomaa',
  'آنها': 'Aanhaa',
  'ایشان': 'Eeshaan',
  'این': 'Een',
  'آن': 'Aan',
  'به': 'Be',
  'با': 'Baa',
  'از': 'Az',
  'در': 'Dar',
  'بر': 'Bar',
  'تا': 'Taa',
  'برای': 'Baraaye',
  'چون': 'Choon',
  'که': 'Ke',
  'اگر': 'Agar',
  'اما': 'Ammaa',
  'ولی': 'Valee',
  'یا': 'Yaa',
  'و': 'Va',
  'نه': 'Na',
  'هم': 'Ham',
  'همچنین': 'Hamcheneen',
  'نیز': 'Neez',

  // افعال پرکاربرد
  'است': 'Ast',
  'هست': 'Hast',
  'نیست': 'Neest',
  'بود': 'Bood',
  'شد': 'Shod',
  'شدند': 'Shodand',
  'گفت': 'Goft',
  'گفتند': 'Goftand',
  'گفتم': 'Goftam',
  'می‌گفتم': 'Mee-goftam',
  'آمد': 'Aamad',
  'رفت': 'Raft',
  'دید': 'Deed',
  'شنید': 'Sheneed',
  'دارد': 'Daarad',
  'دارند': 'Daarand',
  'دارم': 'Daaram',
  'کنید': 'Koneed',
  'کرد': 'Kard',
  'کردند': 'Kardand',
  'می‌کند': 'Mee-konad',
  'می‌شود': 'Mee-shavad',
  'خواهیم': 'Khaaheem',
  'خواهد': 'Khaahad',
  'ساخت': 'Saakht',
  'انداخت': 'Andaakht',
  'راند': 'Raand',

  // کلمات ادبی و شعر
  'سحر': 'Sahar',
  'باد': 'Baad',
  'حدیث': 'Hadees',
  'آرزومندی': 'Aarezoumandee',
  'خطاب': 'Khetaab',
  'واثق': 'Vaasegh',
  'شو': 'Show',
  'الطاف': 'Altaaf',
  'خداوندی': 'Khodaavandee',
  'خدا': 'Khodaa',
  'دعا': 'Doaa',
  'دعای': 'Doaaye',
  'آه': 'Aah',
  'کلید': 'Keleed',
  'گنج': 'Ganj',
  'مقصود': 'Maghsood',
  'بدین': 'Bedeen',
  'راه': 'Raah',
  'روش': 'Ravesh',
  'برو': 'Boro',
  'می‌رو': 'Mee-ro',
  'دلدار': 'Deldaar',
  'دل': 'Del',
  'پیوندی': 'Peyvandee',
  'همای': 'Homaaye',
  'اوج': 'Ouj',
  'سعادت': 'Saaadat',
  'دام': 'Daam',
  'افتد': 'Oftad',
  'مقام': 'Maghaam',
  'قایق': 'Ghaayegh',
  'قایقی': 'Ghaayeghi',
  'آب': 'Aab',
  'خاک': 'Khaak',
  'غریب': 'Ghareeb',
  'عشق': 'Eshgh',
  'بیشه': 'Beesheh',
  'قهرمانان': 'Ghahremaanaan',
  'بیدار': 'Beedaar',
  'تور': 'Toor',
  'تهی': 'Tohee',
  'مروارید': 'Morvaareed',
  'دریاها': 'Daryaahaa',
  'شهر': 'Shahr',
  'شهری': 'Shahree',
  'پنجره': 'Panjareh',
  'پنجره‌ها': 'Panjarehaa',
  'تجلی': 'Tajallee',
  'باز': 'Baaz',

  // اسامی داستان و شاهنامه
  'رستم': 'Rostam',
  'سهراب': 'Sohraab',
  'فردوسی': 'Ferdowsee',
  'شاهنامه': 'Shaah-naameh',
  'ایران': 'Eeraan',
  'ایرانی': 'Eeraanee',
  'پهلوان': 'Pahlevaan',
  'سپاه': 'Sepaah',
  'لشکر': 'Lashkar',
  'دشت': 'Dasht',
  'نبرد': 'Nabard',
  'نیزه': 'Neyzeh',
  'زمین': 'Zameen',
  'خاموش': 'Khaamoosh',
  'پیرمرد': 'Peere-mard',
  'حکیم': 'Hakeem',
  'فرزانه': 'Farzaaneh',
  'کوهستان': 'Koohestaan',
  'طوفان': 'Toofaan',
  'برف': 'Barf',
  'آتش': 'Aatash',
  'کلبه': 'Kolbeh',
  'ستاره': 'Setaareh',
  'ستاره‌ها': 'Setaarehaa',
  'آسمان': 'Aasemaan',
  'تاریک': 'Taareek',
  'نور': 'Noor',
  'پادکست': 'Podcast',
  'علم': 'Elm',
  'دانش': 'Daanesh',
  'جهان': 'Jahaan',
  'انسان': 'Ensaan',
  'طبیعت': 'Tabeeat',
  'کوه': 'Kooh',
  'آفتاب': 'Aaftaab',
  'زندگی': 'Zendegee',
  'آرامش': 'Aaraamesh',
  'امید': 'Omeed',
  'پیروزی': 'Peyroozee',
  'تلاش': 'Talaash',
  'موفقیت': 'Movaffagheeyat',
  'صدا': 'Sedaa',
  'گوینده': 'Gooyandeh',
  'نریشن': 'Narration',
  'خوانش': 'Khaanesh',
};

// Character-by-character phonetic mapping
const CHAR_MAP: Record<string, string> = {
  'ا': 'a',
  'آ': 'aa',
  'ب': 'b',
  'پ': 'p',
  'ت': 't',
  'ط': 't',
  'ث': 's',
  'س': 's',
  'ص': 's',
  'ج': 'j',
  'چ': 'ch',
  'ح': 'h',
  'ه': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'z',
  'ز': 'z',
  'ض': 'z',
  'ظ': 'z',
  'ر': 'r',
  'ژ': 'zh',
  'ش': 'sh',
  'ع': 'a',
  'غ': 'gh',
  'ق': 'gh',
  'ف': 'f',
  'ک': 'k',
  'گ': 'g',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'و': 'oo',
  'ی': 'ee',
  'ئ': 'y',
  'ء': '',
  'َ': 'a',
  'ِ': 'e',
  'ُ': 'o',
  'ّ': '',
  'ْ': '',
  'ً': 'an',
  'ٍ': 'en',
  'ٌ': 'on',
  '‌': ' ', // ZWNJ
};

/**
 * Transliterates a single Persian word into clear phonetic Latin
 */
export function transliteratePersianWord(word: string): string {
  // Strip punctuation
  const clean = word.replace(/[،؛؟!.:«»"()[\]]/g, '').trim();
  if (!clean) return word;

  // 1. Direct dictionary match
  if (COMMON_PERSIAN_G2P_DICT[clean]) {
    return COMMON_PERSIAN_G2P_DICT[clean];
  }

  // 2. Prefixes: می‌- (mee-)
  if (clean.startsWith('می‌') || clean.startsWith('می ')) {
    const rest = clean.replace(/^می[‌ ]/, '');
    return 'mee-' + transliteratePersianWord(rest);
  }

  // 3. Phonetic character translation
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const prev = i > 0 ? clean[i - 1] : '';
    const next = i < clean.length - 1 ? clean[i + 1] : '';

    // Handle initial 'ا' (Alif)
    if (char === 'ا' && i === 0) {
      result += 'A';
      continue;
    }

    // Handle 'و' (v vs oo)
    if (char === 'و') {
      if (i === 0) {
        result += 'va';
      } else if (prev === 'ا' || prev === 'آ') {
        result += 'w';
      } else {
        result += 'oo';
      }
      continue;
    }

    // Handle 'ی' (ee vs y)
    if (char === 'ی') {
      if (i === 0) {
        result += 'Y';
      } else if (i === clean.length - 1) {
        result += 'ee';
      } else {
        result += 'ee';
      }
      continue;
    }

    // Default mapping
    const mapped = CHAR_MAP[char];
    if (mapped !== undefined) {
      result += mapped;
    } else {
      result += char;
    }
  }

  // Capitalize first letter for natural sentence cadence in TTS
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result || word;
}

/**
 * Transliterates entire Persian text to phonetic narration text
 */
export function convertPersianToPhoneticSpeech(persianText: string): string {
  if (!persianText) return '';

  const lines = persianText.split(/\r?\n/);
  const processedLines = lines.map((line) => {
    // Preserve dialogue speaker format "نام:"
    const colonMatch = line.match(/^([^:：«]{2,20})[:：]\s*(.*)$/);
    if (colonMatch) {
      const speaker = colonMatch[1].trim();
      const content = colonMatch[2].trim();
      const phonSpeaker = transliteratePersianWord(speaker);
      const phonContent = content
        .split(/\s+/)
        .map((w) => transliteratePersianWord(w))
        .join(' ');
      return `${phonSpeaker}: ${phonContent}`;
    }

    // Split words and transliterate
    return line
      .split(/\s+/)
      .map((w) => transliteratePersianWord(w))
      .join(' ');
  });

  return processedLines.join('\n');
}
