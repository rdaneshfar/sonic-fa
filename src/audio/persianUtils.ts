/**
 * Persian text processing, harakat diacritics, and normalization utilities.
 * 100% offline, client-side, zero external API.
 */

// Mapping for standardizing Persian characters
export const PERSIAN_CHAR_MAP: Record<string, string> = {
  'ي': 'ی',
  'ى': 'ی',
  'ئ': 'ی',
  'ك': 'ک',
  'ة': 'ه',
  'ؤ': 'و',
  'إ': 'ا',
  'أ': 'ا',
  'آ': 'آ',
  '٠': '۰',
  '١': '۱',
  '٢': '۲',
  '٣': '۳',
  '٤': '۴',
  '٥': '۵',
  '٦': '۶',
  '٧': '۷',
  '٨': '۸',
  '٩': '۹',
};

// Persian diacritics (Harakat)
export const PERSIAN_HARAKAT = [
  { label: 'فَتْحَه (ـَ)', symbol: '\u064E', name: 'fatha', sound: 'a' },
  { label: 'کَسْرَه (ـِ)', symbol: '\u0650', name: 'kasra', sound: 'e' },
  { label: 'ضَمَّه (ـُ)', symbol: '\u064F', name: 'damma', sound: 'o' },
  { label: 'تَشْدِید (ـّ)', symbol: '\u0651', name: 'tashdid', sound: 'double' },
  { label: 'سُکُون (ـْ)', symbol: '\u0652', name: 'sukun', sound: 'mute' },
  { label: 'تَنْوِین نَصْب (ـاً)', symbol: '\u064B', name: 'tanwin_fath', sound: 'an' },
  { label: 'تَنْوِین جَرّ (ـٍ)', symbol: '\u064D', name: 'tanwin_kasr', sound: 'en' },
  { label: 'تَنْوِین رَفْع (ـٌ)', symbol: '\u064C', name: 'tanwin_damm', sound: 'on' },
  { label: 'نيم‌فاصله (ZWNJ)', symbol: '\u200C', name: 'zwnj', sound: 'break' },
];

/**
 * Normalizes Persian text:
 * - Fixes Arabic Kaf & Yeh to Persian ک & ی
 * - Standardizes spaces around ZWNJ and punctuation
 * - Preserves diacritics for pronunciation
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  let res = text;

  // Replace Arabic characters with Persian equivalents
  res = res.replace(/[يكىةؤإأ]/g, (match) => PERSIAN_CHAR_MAP[match] || match);

  // Fix multiple spaces
  res = res.replace(/[ \t]+/g, ' ');

  // Standardize multiple line breaks (max 2)
  res = res.replace(/\n{3,}/g, '\n\n');

  // Fix spacing before/after Persian punctuation
  res = res.replace(/\s+([،؛؟.!])/g, '$1');
  res = res.replace(/([،؛؟])(?=[^\s\n])/g, '$1 ');

  return res.trim();
}

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(num: number | string): string {
  const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => pDigits[parseInt(d, 10)]);
}

/**
 * Estimates reading duration in Persian (roughly ~130 words per minute at 1.0x rate)
 */
export function estimateReadingTimeSeconds(text: string, rate: number = 1.0): number {
  if (!text.trim()) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wpm = 130 * Math.max(0.2, rate);
  const seconds = (words.length / wpm) * 60;
  return Math.ceil(seconds);
}

/**
 * Preset Persian scripts for sound design and voiceover testing
 */
export interface PersianScriptPreset {
  id: string;
  title: string;
  category: 'شعر کلاسیک' | 'شعر معاصر' | 'پادکست و گویندگی' | 'تیزر تبلیغاتی' | 'مستند و آرامش' | 'داستان انگیزشی';
  author: string;
  suggestedMusic: string;
  text: string;
  suggestedSfx: string[];
}

export const PERSIAN_PRESETS: PersianScriptPreset[] = [
  {
    id: 'hafez',
    title: 'غزل حافظ شیرازی (سحر با باد می‌گفتم)',
    category: 'شعر کلاسیک',
    author: 'خواجه شمس‌الدین حافظ',
    suggestedMusic: 'persian_modal',
    suggestedSfx: ['daf_hit', 'chime_bell'],
    text: `سَحَر با باد می‌گفتم حدیثِ آرزومندی
خطاب آمد که واثق شو به الطافِ خداوندی

دعایِ صبح و آهِ شب، کلیدِ گنجِ مقصود است
بدین راه و روش می‌رو که با دلدار پیوندی

همایِ اوجِ سعادت به دامِ ما افتد
اگر تو را گذری بر مقامِ ما افتد`
  },
  {
    id: 'sohrab',
    title: 'قایقی خواهم ساخت (سهراب سپهری)',
    category: 'شعر معاصر',
    author: 'سهراب سپهری',
    suggestedMusic: 'warm_piano',
    suggestedSfx: ['rain_thunder', 'whoosh'],
    text: `قایقی خواهم ساخت،
خواهم انداخت به آب.
دور خواهم شد از این خاکِ غریب
که در آن هیچ‌کسی نیست که در بیشهٔ عشق
قهرمانان را بیدار کند.

قایق از تور تهی
و دل از آرزویِ مروارید،
همچنان خواهم راند.
پشتِ دریاها شهری است
که در آن پنجره‌ها رو به تجلی باز است!`
  },
  {
    id: 'podcast_intro',
    title: 'اینترو پادکست رادیویی کاوشگران علم',
    category: 'پادکست و گویندگی',
    author: 'استودیو رادیو آوا',
    suggestedMusic: 'modern_podcast',
    suggestedSfx: ['riser', 'cinema_impact'],
    text: `سلام به همراهانِ گرامی و علاقه‌مندان به جهانِ بی‌پایانِ دانش و اندیشه.
به فصلِ سوم از پادکستِ کاوشگران خوش آمدید.
در اپیزودِ امروز، سفری شگفت‌انگیز خواهیم داشت به اعماقِ کهکشان‌ها و رازهایِ کشف‌نشدهٔ ذهنِ انسان.
هدفون‌هایِ خود را تنظیم کنید، چرا که این داستان، نگرشِ شما را به واقعیت تغییر خواهد داد.`
  },
  {
    id: 'nature_doc',
    title: 'نریشن مستند طبیعت و سکوت کوهستان',
    category: 'مستند و آرامش',
    author: 'مستند حیات وحش ایران',
    suggestedMusic: 'ethereal_ambient',
    suggestedSfx: ['morning_birds', 'whoosh'],
    text: `در دامنه‌هایِ برف‌گیرِ رشته‌کوهِ البرز، با طلوعِ نخستین پرتوهایِ زرینِ آفتاب، زندگی با نغمه‌ای تازه آغاز می‌شود.
نسیمِ ملایم از رویِ صخره‌هایِ هزارساله عبور می‌کند و سکوتِ ژرفِ دره، جایِ خود را به صدایِ زلالِ چشمه‌ساران می‌دهد.
اینجا، زمان معنایِ دیگری دارد؛ نبضِ طبیعت، در آرامشی مطلق می‌تپد.`
  },
  {
    id: 'commercial',
    title: 'تیزر پرانرژی نوآوری و تکنولوژی',
    category: 'تیزر تبلیغاتی',
    author: 'آژانس خلاقیت دیجیتال',
    suggestedMusic: 'modern_podcast',
    suggestedSfx: ['cinema_impact', 'riser', 'tape_stop'],
    text: `آینده، فردا آغاز نمی‌شود؛ آینده همین لحظه‌ای است که شما تصمیم به دگرگونی می‌گیرید!
با سریع‌ترین، پایدارترین و هوشمندانه‌ترین زیرساختِ داده، کسب‌وکارِ خود را به قله‌هایِ جدید هدایت کنید.
قدرتِ بی‌نهایت، طراحیِ بی‌نقص، بدونِ مرز و بدونِ محدودیت.
همین امروز تجربه کنید!`
  },
  {
    id: 'motivational',
    title: 'داستان الهام‌بخش استقامت و باور',
    category: 'داستان انگیزشی',
    author: 'روانشناسی و موفقیت',
    suggestedMusic: 'warm_piano',
    suggestedSfx: ['heartbeat', 'chime_bell', 'applause'],
    text: `بزرگ‌ترین پیروزی‌ها زمانی رخ می‌دهند که تمامِ دنیا به شکستِ شما ایمان آورده‌اند، اما شما هنوز صدایِ آرامی در قلبِ خود می‌شنوید که زمزمه می‌کند: «یک‌بارِ دیگر تلاش کن!»
هر مانعی که امروز پیشِ رویِ شماست، پله‌ای برایِ استحکامِ فردایِ شما خواهد بود.
باور داشته باش که توانایی‌هایت، بسیار فراتر از چالش‌هایِ امروزی است.`
  }
];
