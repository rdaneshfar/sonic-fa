/**
 * Multi-Character Story & Dialogue Narration Engine.
 * Intelligently parses dramatic stories into multi-speaker dialogues,
 * assigns distinct voice pitches, speeds, and acoustics to each character,
 * and orchestrates character-by-character narration with custom SFX and music transitions.
 * 100% offline, local browser processing, zero API.
 */

export interface DialogueCharacter {
  id: string;
  name: string;
  roleDescription: string;
  gender: 'male' | 'female' | 'narrator' | 'elder' | 'child' | 'mysterious';
  pitch: number; // 0.5 to 1.8
  rate: number;  // 0.6 to 1.8
  volume: number; // 0.0 to 1.0
  color: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  speakerName: string;
  text: string;
  sfxCueId?: string; // Optional SFX triggered at the start of this line
  bgmTrackId?: string; // Optional BGM transition for dramatic shift
  pauseAfterMs: number; // Milliseconds pause before next dialogue
}

export const DEFAULT_CHARACTERS: DialogueCharacter[] = [
  {
    id: 'char_narrator',
    name: 'راوی دانای کل',
    roleDescription: 'صدای متین، شیوا و استاندارد برای روایت صحنه و توصیفات',
    gender: 'narrator',
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
    color: '#3B82F6', // Blue
  },
  {
    id: 'char_male_hero',
    name: 'قهرمان مرد / شخصیت جوان',
    roleDescription: 'صدای پرانرژی و استوار با تنِ بم‌تر و قاطع',
    gender: 'male',
    pitch: 0.82,
    rate: 1.05,
    volume: 1.0,
    color: '#E11D48', // Red
  },
  {
    id: 'char_female_heroine',
    name: 'بانو / شخصیت زن',
    roleDescription: 'لحن شفاف، بیان عاطفی و زیروبمی بالاتر',
    gender: 'female',
    pitch: 1.28,
    rate: 1.0,
    volume: 1.0,
    color: '#EC4899', // Pink
  },
  {
    id: 'char_elder',
    name: 'پیرمرد / حکیم فرزانه',
    roleDescription: 'صدای بسیار بم، باوقار و آرام با مکث‌های حکیمانه',
    gender: 'elder',
    pitch: 0.68,
    rate: 0.82,
    volume: 0.95,
    color: '#D97706', // Amber
  },
  {
    id: 'char_child',
    name: 'کودک / نوجوان کنجکاو',
    roleDescription: 'صدای شاداب، سریع و با فرکانس بالا',
    gender: 'child',
    pitch: 1.52,
    rate: 1.15,
    volume: 1.0,
    color: '#10B981', // Green
  },
  {
    id: 'char_mysterious',
    name: 'صدای رازآلود / سایه',
    roleDescription: 'لحن نجواگونه، تیره و عمیق برای صحنه‌های مبهم',
    gender: 'mysterious',
    pitch: 0.72,
    rate: 0.88,
    volume: 0.9,
    color: '#8B5CF6', // Purple
  },
];

/**
 * Curated Multi-Dialogue Persian Stories
 */
export interface StoryPreset {
  id: string;
  title: string;
  genre: string;
  summary: string;
  suggestedMusic: string;
  characters: DialogueCharacter[];
  lines: DialogueLine[];
}

export const MULTI_DIALOGUE_STORIES: StoryPreset[] = [
  {
    id: 'rostam_sohrab',
    title: 'نبرد سرنوشت: سهراب و رستم (شاهنامه)',
    genre: 'حماسی و دراماتیک',
    summary: 'رویارویی تراژیک پدر و پسر در دشت نبرد با سه صدای راوی، سهراب و رستم دستان.',
    suggestedMusic: 'persian_modal',
    characters: DEFAULT_CHARACTERS,
    lines: [
      {
        id: 'rs_1',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'در دشتِ خاموش و غبارآلود، باد بر پرچم‌هایِ دو لشکر تازیانه می‌زد. سهرابِ جوان، مغرور و استوار، نیزه بر زمین کوبید و خروشید.',
        sfxCueId: 'daf_hit',
        pauseAfterMs: 400,
      },
      {
        id: 'rs_2',
        characterId: 'char_male_hero',
        speakerName: 'سهراب',
        text: 'کدام دلاور از میانِ سپاهِ ایران گام پیش می‌نهد تا پنجه در پنجهٔ من درافکند؟! آیا مردی در این خاک نمانده است؟',
        sfxCueId: 'cinema_impact',
        pauseAfterMs: 500,
      },
      {
        id: 'rs_3',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'از میانِ گردوغبار، پهلوانی سپیدموی با گام‌هایی چون کوه پدیدار گشت. رستم، با نگاهی تلخ به جوان نگریست.',
        sfxCueId: 'whoosh',
        pauseAfterMs: 400,
      },
      {
        id: 'rs_4',
        characterId: 'char_elder',
        speakerName: 'رستم',
        text: 'ای جوان! سخن به غرور مران. جهان بسیار چون تو به خود دیده و خاکستر کرده است. بازگرد که دلِ من بر جوانی‌ات می‌سوزد!',
        sfxCueId: 'heartbeat',
        pauseAfterMs: 500,
      },
      {
        id: 'rs_5',
        characterId: 'char_male_hero',
        speakerName: 'سهراب',
        text: 'نامِ خود را بازگوی ای پهلوان! آیا تو همان رستمِ دستان نیستی که نامت لرزه بر اندامِ گیتی می‌اندازد؟',
        sfxCueId: 'riser',
        pauseAfterMs: 400,
      },
      {
        id: 'rs_6',
        characterId: 'char_elder',
        speakerName: 'رستم',
        text: 'من رستم نیستم، که من کمترین بندگانِ این سرزمینم! اکنون سلاح برگیر که تقدیر را گریزی نیست.',
        sfxCueId: 'cinema_impact',
        pauseAfterMs: 600,
      },
    ],
  },
  {
    id: 'wise_old_man',
    title: 'فانوس پیرمرد در مه کوهستان',
    genre: 'رازآلود و پندآموز',
    summary: 'داستان سفر یک مسافر خسته به کلبه پیرمرد خردمند در دل کولاک برف.',
    suggestedMusic: 'cinematic_ambient',
    characters: DEFAULT_CHARACTERS,
    lines: [
      {
        id: 'wo_1',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'بورانِ سهمگین، ردپایِ مسافر را در برف مدفون کرده بود. او در آستانهٔ تسلیم، نوری لرزان از پنجرهٔ کلبه‌ای کهن دید.',
        sfxCueId: 'rain_thunder',
        pauseAfterMs: 400,
      },
      {
        id: 'wo_2',
        characterId: 'char_male_hero',
        speakerName: 'مسافر',
        text: 'کسی در خانه هست؟! نجاتم دهید... پاهایم در سرمایِ کوهستان رمقی ندارد!',
        sfxCueId: 'page_turn',
        pauseAfterMs: 400,
      },
      {
        id: 'wo_3',
        characterId: 'char_elder',
        speakerName: 'پیرمرد خردمند',
        text: 'در گشوده است پسرم، به گرمایِ آتش درآی. هیچ طوفانی تا ابد پایدار نمی‌ماند.',
        sfxCueId: 'chime_bell',
        pauseAfterMs: 500,
      },
      {
        id: 'wo_4',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'دخترک خردسالی فنجانی چایِ داغ پیشِ رویِ مسافر نهاد و با لبخندی معصومانه گفت:',
        sfxCueId: 'whoosh',
        pauseAfterMs: 300,
      },
      {
        id: 'wo_5',
        characterId: 'char_child',
        speakerName: 'دخترک',
        text: 'عمو جان، پدربزرگ همیشه می‌گوید ستاره‌ها تنها زمانی پیدا می‌شوند که آسمان تاریکِ تاریک باشد!',
        sfxCueId: 'chime_bell',
        pauseAfterMs: 450,
      },
      {
        id: 'wo_6',
        characterId: 'char_male_hero',
        speakerName: 'مسافر',
        text: 'حق با شماست... اکنون می‌فهمم گم‌شدن در این مسیر، آغازی برایِ پیدا کردنِ حقیقتِ درونم بود.',
        sfxCueId: 'applause',
        pauseAfterMs: 500,
      },
    ],
  },
  {
    id: 'sci_fi_dialogue',
    title: 'کشف بزرگ در آزمایشگاه زمان',
    genre: 'علمی-تخیلی و مدرن',
    summary: 'مکالمه هیجان‌انگیز بین دو دانشمند در لحظه فعال شدن پورتال کوانتومی.',
    suggestedMusic: 'modern_podcast',
    characters: DEFAULT_CHARACTERS,
    lines: [
      {
        id: 'sc_1',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'در عمقِ سیصد متریِ کوه‌هایِ البرز، رآکتورِ کوانتومی با زوزه‌ای ممتد بیدار شد. نمایشگرها اعدادی فراتر از درک را ثبت می‌کردند.',
        sfxCueId: 'riser',
        pauseAfterMs: 350,
      },
      {
        id: 'sc_2',
        characterId: 'char_female_heroine',
        speakerName: 'دکتر سارا',
        text: 'امیر! به این فرکانس نگاه کن! میدانِ مغناطیسی داره به پایداریِ نود و نه درصد می‌رسه! ما تونستیم!',
        sfxCueId: 'chime_bell',
        pauseAfterMs: 400,
      },
      {
        id: 'sc_3',
        characterId: 'char_male_hero',
        speakerName: 'امیر',
        text: 'سارا، خنک‌کننده‌ها دارن بیش از حد گرم می‌شن! فرآیند رو متوقف کن، ممکنه زنجیره واکنش‌ها غیرقابل کنترل بشه!',
        sfxCueId: 'heartbeat',
        pauseAfterMs: 400,
      },
      {
        id: 'sc_4',
        characterId: 'char_mysterious',
        speakerName: 'صدای ناشناس',
        text: 'تلاشی بیهوده است... درهایِ زمان گشوده شده‌اند و گذشته و آینده به هم پیوسته‌اند.',
        sfxCueId: 'cinema_impact',
        pauseAfterMs: 500,
      },
      {
        id: 'sc_5',
        characterId: 'char_narrator',
        speakerName: 'راوی',
        text: 'با یک درخششِ شدیدِ آبی‌رنگ، اتاق در سکوتی ژرف فرو رفت و تاریخ از نو نگاشته شد.',
        sfxCueId: 'whoosh',
        pauseAfterMs: 600,
      },
    ],
  },
];

/**
 * Intelligent Parser:
 * Analyzes raw Persian text with dialogue indicators like:
 * راوی: متن...
 * سهراب: متن...
 * یا علامت نقل‌قول «...»
 */
export function autoDetectStoryDialogues(rawText: string, existingCharacters: DialogueCharacter[]): DialogueLine[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result: DialogueLine[] = [];

  const characterMap = new Map<string, DialogueCharacter>();
  existingCharacters.forEach((c) => {
    characterMap.set(c.name.toLowerCase(), c);
  });

  // Default fallback character
  const defaultNarrator = existingCharacters.find((c) => c.gender === 'narrator') || existingCharacters[0];
  const defaultMale = existingCharacters.find((c) => c.gender === 'male') || existingCharacters[1] || defaultNarrator;
  const defaultFemale = existingCharacters.find((c) => c.gender === 'female') || existingCharacters[2] || defaultNarrator;
  const defaultElder = existingCharacters.find((c) => c.gender === 'elder') || existingCharacters[3] || defaultNarrator;

  lines.forEach((line, idx) => {
    // Check for "Speaker: Dialogue" pattern
    // Examples: "راوی:", "سهراب:", "مرد:", "پیرمرد:", "سارا:"
    const colonMatch = line.match(/^([^:：«]{2,20})[:：]\s*(.*)$/);

    if (colonMatch) {
      const rawSpeaker = colonMatch[1].trim();
      const dialogueText = colonMatch[2].trim();

      if (dialogueText) {
        // Detect matching character or best fit
        let matchedChar = characterMap.get(rawSpeaker.toLowerCase());
        if (!matchedChar) {
          const sLower = rawSpeaker.toLowerCase();
          if (sLower.includes('راوی')) matchedChar = defaultNarrator;
          else if (sLower.includes('پیر') || sLower.includes('حکیم') || sLower.includes('پدر')) matchedChar = defaultElder;
          else if (sLower.includes('زن') || sLower.includes('مادر') || sLower.includes('دختر') || sLower.includes('سارا')) matchedChar = defaultFemale;
          else matchedChar = defaultMale;
        }

        result.push({
          id: `line_${idx}_${Date.now()}`,
          characterId: matchedChar.id,
          speakerName: rawSpeaker,
          text: dialogueText,
          pauseAfterMs: 400,
        });
        return;
      }
    }

    // Check for quoted dialogue: «...» or "..."
    const quoteMatch = line.match(/^[«"]([^»"]+)[»"]$/);
    if (quoteMatch) {
      result.push({
        id: `line_${idx}_${Date.now()}`,
        characterId: defaultMale.id,
        speakerName: 'شخصیت گفتگو',
        text: quoteMatch[1].trim(),
        pauseAfterMs: 400,
      });
      return;
    }

    // Default: treated as narration
    result.push({
      id: `line_${idx}_${Date.now()}`,
      characterId: defaultNarrator.id,
      speakerName: 'راوی',
      text: line,
      pauseAfterMs: 350,
    });
  });

  return result;
}

/**
 * Converts dialogue lines back to formatted script text
 */
export function formatDialogueScript(lines: DialogueLine[]): string {
  return lines.map((l) => `${l.speakerName}: ${l.text}`).join('\n\n');
}
