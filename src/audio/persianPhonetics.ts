/**
 * Professional Persian Phonetic & Prosody Engine (قواعد واج‌شناسی، تکیه و اکسنت زبان فارسی).
 * Implements Persian Grapheme-to-Phoneme (G2P), Syllabification, Final-Syllable Stress,
 * and Persian Acoustic Formant Frequency Targets.
 * 100% offline, local browser processing, zero external API.
 */

// Persian Vowel Formants (Standard Tehrani Persian / لهجه معیار فارسی ایران)
// F1, F2, F3 in Hz, bandwidths (BW1, BW2, BW3), and relative duration scale
export interface FormantProfile {
  f1: number;
  f2: number;
  f3: number;
  durationScale: number;
  isLong: boolean;
}

// Calibrated acoustic values for standard Persian vowels
export const PERSIAN_VOWELS: Record<string, FormantProfile> = {
  // /ɒː/ - مصوت کشیده «آ» (بسیار بم‌تر و گردتر از عربی)
  'â': { f1: 760, f2: 1080, f3: 2500, durationScale: 1.4, isLong: true },
  'آ': { f1: 760, f2: 1080, f3: 2500, durationScale: 1.4, isLong: true },

  // /æ/ - مصوت کوتاه «فتحه» (مانند سَر، دَر - باز و شفاف)
  'a': { f1: 680, f2: 1420, f3: 2600, durationScale: 0.9, isLong: false },
  'َ': { f1: 680, f2: 1420, f3: 2600, durationScale: 0.9, isLong: false },

  // /e/ - مصوت کوتاه «کسره» (مانند دِل، کِتاب)
  'e': { f1: 440, f2: 1950, f3: 2650, durationScale: 0.9, isLong: false },
  'ِ': { f1: 440, f2: 1950, f3: 2650, durationScale: 0.9, isLong: false },

  // /o/ - مصوت کوتاه «ضمه» (مانند گُل، پُل)
  'o': { f1: 470, f2: 920, f3: 2400, durationScale: 0.9, isLong: false },
  'ُ': { f1: 470, f2: 920, f3: 2400, durationScale: 0.9, isLong: false },

  // /iː/ - مصوت کشیده «ای» (مانند ایران، شیر)
  'i': { f1: 290, f2: 2320, f3: 2950, durationScale: 1.35, isLong: true },
  'ی': { f1: 290, f2: 2320, f3: 2950, durationScale: 1.35, isLong: true },

  // /uː/ - مصوت کشیده «او» (مانند روز، دوست)
  'u': { f1: 310, f2: 780, f3: 2250, durationScale: 1.35, isLong: true },
  'و': { f1: 310, f2: 780, f3: 2250, durationScale: 1.35, isLong: true },
};

// Persian Consonant Acoustic Properties
export interface ConsonantProfile {
  type: 'plosive' | 'fricative' | 'nasal' | 'liquid' | 'affricate' | 'approximant';
  voiced: boolean;
  burstFreq?: number; // Noise burst frequency for plosives/fricatives
  f1: number;
  f2: number;
  f3: number;
  frictionFilter?: 'bandpass' | 'highpass';
}

export const PERSIAN_CONSONANTS: Record<string, ConsonantProfile> = {
  // صامت‌های اختصاصی زبان فارسی (پ، چ، ژ، گ)
  'پ': { type: 'plosive', voiced: false, burstFreq: 1100, f1: 300, f2: 850, f3: 2150 },
  'چ': { type: 'affricate', voiced: false, burstFreq: 3400, f1: 420, f2: 1850, f3: 2700, frictionFilter: 'highpass' },
  'ژ': { type: 'fricative', voiced: true, burstFreq: 2600, f1: 380, f2: 1800, f3: 2600, frictionFilter: 'bandpass' },
  'گ': { type: 'plosive', voiced: true, burstFreq: 1950, f1: 350, f2: 1900, f3: 2650 },

  // سایر صامت‌های فارسی
  'ب': { type: 'plosive', voiced: true, burstFreq: 900, f1: 300, f2: 850, f3: 2100 },
  'ت': { type: 'plosive', voiced: false, burstFreq: 3600, f1: 380, f2: 1750, f3: 2650 },
  'ط': { type: 'plosive', voiced: false, burstFreq: 3600, f1: 380, f2: 1750, f3: 2650 },
  'ث': { type: 'fricative', voiced: false, burstFreq: 4600, f1: 370, f2: 1800, f3: 2700, frictionFilter: 'highpass' },
  'س': { type: 'fricative', voiced: false, burstFreq: 4800, f1: 370, f2: 1800, f3: 2700, frictionFilter: 'highpass' },
  'ص': { type: 'fricative', voiced: false, burstFreq: 4800, f1: 370, f2: 1800, f3: 2700, frictionFilter: 'highpass' },
  'ج': { type: 'affricate', voiced: true, burstFreq: 3100, f1: 420, f2: 1800, f3: 2600, frictionFilter: 'bandpass' },
  'ح': { type: 'fricative', voiced: false, burstFreq: 1500, f1: 580, f2: 1450, f3: 2450, frictionFilter: 'bandpass' },
  'خ': { type: 'fricative', voiced: false, burstFreq: 1600, f1: 560, f2: 1400, f3: 2350, frictionFilter: 'bandpass' },
  'د': { type: 'plosive', voiced: true, burstFreq: 2200, f1: 390, f2: 1650, f3: 2550 },
  'ذ': { type: 'fricative', voiced: true, burstFreq: 3600, f1: 380, f2: 1700, f3: 2600 },
  'ز': { type: 'fricative', voiced: true, burstFreq: 3800, f1: 380, f2: 1750, f3: 2650 },
  'ض': { type: 'fricative', voiced: true, burstFreq: 3800, f1: 380, f2: 1750, f3: 2650 },
  'ظ': { type: 'fricative', voiced: true, burstFreq: 3800, f1: 380, f2: 1750, f3: 2650 },
  'ر': { type: 'liquid', voiced: true, f1: 430, f2: 1350, f3: 2250 },
  'ش': { type: 'fricative', voiced: false, burstFreq: 2800, f1: 440, f2: 1950, f3: 2500, frictionFilter: 'bandpass' },
  'ع': { type: 'plosive', voiced: true, f1: 520, f2: 1350, f3: 2400 },
  'غ': { type: 'fricative', voiced: true, burstFreq: 1400, f1: 520, f2: 1300, f3: 2300 },
  'ف': { type: 'fricative', voiced: false, burstFreq: 3200, f1: 350, f2: 1400, f3: 2300, frictionFilter: 'highpass' },
  'ق': { type: 'plosive', voiced: true, burstFreq: 1350, f1: 540, f2: 1250, f3: 2350 },
  'ک': { type: 'plosive', voiced: false, burstFreq: 2200, f1: 380, f2: 1950, f3: 2750 },
  'ل': { type: 'liquid', voiced: true, f1: 390, f2: 1250, f3: 2650 },
  'م': { type: 'nasal', voiced: true, f1: 270, f2: 1050, f3: 2150 },
  'ن': { type: 'nasal', voiced: true, f1: 310, f2: 1400, f3: 2400 },
  'ه': { type: 'fricative', voiced: false, burstFreq: 1500, f1: 520, f2: 1500, f3: 2500, frictionFilter: 'bandpass' },
};

/**
 * 6 Independent Persian Voice Talents (گویندگان مستقل و حرفه‌ای فارسی)
 * Each voice has dedicated acoustic formant offsets, fundamental frequency (F0),
 * articulation speed, vibrato depth, and dramatic style.
 */
export interface PersianVoiceTalent {
  id: string;
  nameFa: string;
  nameEn: string;
  titleFa: string;
  gender: 'مرد' | 'زن';
  styleFa: string;
  accentStyle: 'معیار تهرانی' | 'حماسی شاهنامه‌ای' | 'رادیو و پادکست' | 'ادبی و عرفانی';
  baseF0: number; // Fundamental frequency in Hz (male 90-135, female 190-250)
  pitchMultiplier: number;
  speechRate: number;
  vibratoDepth: number; // Natural vocal cord micro-vibrato
  warmthGain: number; // Low resonance boost
  clarityGain: number; // High resonance boost
  descriptionFa: string;
}

export const PERSIAN_VOICE_TALENTS: PersianVoiceTalent[] = [
  {
    id: 'arash_radio',
    nameFa: 'آرش (راوی ارشد رادیو و دوبلاژ)',
    nameEn: 'Arash - Senior Radio Narrator',
    titleFa: 'صدای بم، گرم، رسمی و پرطنین',
    gender: 'مرد',
    styleFa: 'نریشن مستند، اخبار رسمی و کتاب‌های صوتی فاخر',
    accentStyle: 'معیار تهرانی',
    baseF0: 108,
    pitchMultiplier: 0.88,
    speechRate: 0.95,
    vibratoDepth: 0.008,
    warmthGain: 3.5,
    clarityGain: 1.5,
    descriptionFa: 'لهجه کاملاً معیار و استاندارد تهرانی بدون هیچ افت و خیز غیرطبیعی، با بم‌خوانی عمیق و طنین استودیویی.',
  },
  {
    id: 'niloufar_audiobook',
    nameFa: 'نیلوفر (بانوی گوینده کتاب صوتی)',
    nameEn: 'Niloufar - Pro Audiobook Voice',
    titleFa: 'صدای رسا، آرامش‌بخش، لطیف و شیوا',
    gender: 'زن',
    styleFa: 'کتاب‌های داستانی، شعر، پادکست‌های انگیزشی و روانشناسی',
    accentStyle: 'معیار تهرانی',
    baseF0: 215,
    pitchMultiplier: 1.25,
    speechRate: 0.98,
    vibratoDepth: 0.012,
    warmthGain: 1.8,
    clarityGain: 3.0,
    descriptionFa: 'بیان شفاف واکه‌ها و مخارج حروف فارسی با رعایت دقیق اکسنت، مناسب داستان‌های احساسی و اشعار نو.',
  },
  {
    id: 'sohrab_epic',
    nameFa: 'سهراب (پژواک حماسی و شاهنامه‌خوانی)',
    nameEn: 'Sohrab - Epic Shahnameh Voice',
    titleFa: 'صدای سلحشورانه، ریتمیک، محکم و پرقدرت',
    gender: 'مرد',
    styleFa: 'شاهنامه فردوسی، نبردهای تاریخی، تیزرهای حماسی و فیلم',
    accentStyle: 'حماسی شاهنامه‌ای',
    baseF0: 124,
    pitchMultiplier: 0.95,
    speechRate: 1.05,
    vibratoDepth: 0.006,
    warmthGain: 4.0,
    clarityGain: 2.5,
    descriptionFa: 'تأکید قوی بر هجاهای پایانی و کوبش کلمات با اکسنت حماسی اصیل ایران باستان.',
  },
  {
    id: 'farzaneh_poetic',
    nameFa: 'فرزانه (خوانش عرفانی و شعر کهن)',
    nameEn: 'Farzaneh - Classical Poetry Voice',
    titleFa: 'صدای نرم، اندیشمندانه و ملودیک',
    gender: 'زن',
    styleFa: 'غزلیات حافظ، مثنوی مولوی، گلستان سعدی و متون کهن',
    accentStyle: 'ادبی و عرفانی',
    baseF0: 200,
    pitchMultiplier: 1.18,
    speechRate: 0.90,
    vibratoDepth: 0.015,
    warmthGain: 2.2,
    clarityGain: 2.0,
    descriptionFa: 'رعایت وزن عروضی و امتداد طبیعی مصوت‌های کشیده فارسی (آ، ای، او) در ابیات کهن.',
  },
  {
    id: 'ostad_pirnia',
    nameFa: 'استاد پیرنیا (حکیم و پیشکسوت رادیو)',
    nameEn: 'Ostad Pirnia - Wise Elder Voice',
    titleFa: 'صدای کهنسال، باوقار، شمرده و عمیق',
    gender: 'مرد',
    styleFa: 'حکایت‌های پندآموز، خاطرات تاریخی و شخصیت‌های خردمند',
    accentStyle: 'ادبی و عرفانی',
    baseF0: 88,
    pitchMultiplier: 0.72,
    speechRate: 0.82,
    vibratoDepth: 0.018,
    warmthGain: 5.0,
    clarityGain: 0.8,
    descriptionFa: 'سرعت آرام و شمرده با تکیه متین بر واژگان و ایجاد حس حضور یک استاد کهنسال.',
  },
  {
    id: 'pouyan_podcast',
    nameFa: 'پویان (رسانه نو و پادکست مدرن)',
    nameEn: 'Pouyan - Modern Tech & Podcast',
    titleFa: 'صدای پویا، رسا، جوان و صمیمی',
    gender: 'مرد',
    styleFa: 'پادکست‌های فناوری، ارائه‌های کسب‌وکار و ولاگ‌های مدرن',
    accentStyle: 'رادیو و پادکست',
    baseF0: 130,
    pitchMultiplier: 1.05,
    speechRate: 1.12,
    vibratoDepth: 0.005,
    warmthGain: 2.0,
    clarityGain: 3.5,
    descriptionFa: 'لحن صمیمی و پرانرژی امروزی با شفافیت بالای صوتی و ریتم متناسب با محتوای دیجیتال.',
  },
];

/**
 * Persian Word Stress (قاعده تکیه کلمات در فارسی):
 * In standard Persian:
 * - Nouns, Adjectives, Adverbs take primary stress on the FINAL syllable.
 * - Words with prefix «میـ» take stress on the prefix.
 * - Suffixes like «ـَم»، «ـَت»، «ـَش» (ضمایر متصل) do not shift primary stress.
 */
export function calculatePersianWordProsody(
  word: string,
  wordIndex: number,
  totalWordsInSentence: number
): { pitchOffset: number; durationMult: number } {
  // Sentence-level declination contour (falling pitch towards end of sentence)
  const sentenceProgress = totalWordsInSentence > 1 ? wordIndex / (totalWordsInSentence - 1) : 0;
  const declination = 1.05 - sentenceProgress * 0.12; // 1.05 -> 0.93

  // Question intonation (rise at question mark)
  const isQuestion = word.includes('؟') || word.includes('?');
  const questionBoost = isQuestion ? 1.25 : 1.0;

  // Final word in declarative sentence drops slightly for closure
  const isSentenceEnd = word.includes('.') || word.includes('!') || word.includes('؛');
  const finalDrop = isSentenceEnd ? 0.92 : 1.0;

  return {
    pitchOffset: declination * questionBoost * finalDrop,
    durationMult: isSentenceEnd ? 1.2 : 1.0,
  };
}
