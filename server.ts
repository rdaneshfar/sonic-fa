import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Persian Voice Character Mapping
const VOICE_TALENT_CONFIGS: Record<
  string,
  { voiceName: 'Charon' | 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'; stylePrompt: string }
> = {
  arash_radio: {
    voiceName: 'Charon',
    stylePrompt:
      'Narrate in Persian (Farsi) with standard Iranian accent, deep, warm, prestigious radio broadcaster tone with natural human cadence.',
  },
  niloufar_audiobook: {
    voiceName: 'Kore',
    stylePrompt:
      'Speak in Persian (Farsi) with standard Iranian accent, gentle, clear, melodious, and emotionally expressive female audiobook narrator.',
  },
  sohrab_epic: {
    voiceName: 'Fenrir',
    stylePrompt:
      'Speak in Persian (Farsi) with powerful, commanding, heroic epic Shahnameh warrior cadence and rhythmic poetic dignity.',
  },
  farzaneh_poetic: {
    voiceName: 'Kore',
    stylePrompt:
      'Speak in Persian (Farsi) with contemplative, spiritual, serene, and lyrical recitation style for classical Persian poetry.',
  },
  ostad_pirnia: {
    voiceName: 'Charon',
    stylePrompt:
      'Speak in Persian (Farsi) with seasoned, wise elder, deliberate, unhurried, and dignified storytelling tone.',
  },
  pouyan_podcast: {
    voiceName: 'Puck',
    stylePrompt:
      'Speak in Persian (Farsi) with youthful, energetic, articulate, warm, and friendly modern podcast host tone.',
  },
};

// In-Memory Audio Cache to prevent duplicate quota consumption and deliver 0ms instant playback
const ttsCache = new Map<string, Buffer>();

// API: Generate Natural Human Persian Speech via Gemini TTS with multi-model fallback & retry
app.post('/api/tts', async (req, res) => {
  try {
    const { text, talentId } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const trimmedText = text.trim();
    const config = VOICE_TALENT_CONFIGS[talentId] || VOICE_TALENT_CONFIGS.arash_radio;
    const cacheKey = `${talentId || 'arash'}:${trimmedText}`;

    // 1. Check in-memory cache
    const cachedWav = ttsCache.get(cacheKey);
    if (cachedWav) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', cachedWav.length);
      res.setHeader('X-Cache-Hit', 'true');
      res.send(cachedWav);
      return;
    }

    // 2. Initialize Gemini SDK
    const ai = new GoogleGenAI();

    // Models to attempt: prioritize flash-tts, then flash-lite-tts
    const candidateModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];

    let base64Audio: string | undefined;
    let lastError: any = null;

    // Retry loop for transient rate limits
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: trimmedText,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: config.voiceName },
                },
              },
            },
          });

          const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (audio) {
            base64Audio = audio;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} TTS attempt ${attempt + 1} failed:`, err.message || err);
        }
      }

      if (base64Audio) break;
    }

    if (!base64Audio) {
      const isQuota =
        lastError?.message?.includes('RESOURCE_EXHAUSTED') ||
        lastError?.status === 429 ||
        lastError?.code === 429;

      res.status(isQuota ? 429 : 500).json({
        error: lastError?.message || 'Failed to generate speech with available models',
        quotaExceeded: isQuota,
      });
      return;
    }

    // Gemini TTS returns pristine standard 24kHz 16-bit WAV with valid RIFF header
    const wavBuffer = Buffer.from(base64Audio, 'base64');

    // Save in cache (limit to 300 items to avoid RAM bloat)
    if (ttsCache.size > 300) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, wavBuffer);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wavBuffer.length);
    res.send(wavBuffer);
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate speech',
    });
  }
});

// API: Direct Story into Multi-Character Screenplay
app.post('/api/direct-story', async (req, res) => {
  try {
    const { storyText } = req.body;
    if (!storyText || typeof storyText !== 'string' || !storyText.trim()) {
      res.status(400).json({ error: 'Story text is required' });
      return;
    }

    const ai = new GoogleGenAI();
    const systemPrompt = `You are a master Persian audio drama director, scriptwriter, and sound designer (کارگردان و نمایشنامه‌نویس رادیویی).
Your job is to analyze any Persian narrative, novel, fable, or theatrical text, detect all distinct speaking characters, and separate narrative prose from dialogue lines.

CRITICAL INSTRUCTIONS:
1. Detect all characters mentioned or speaking in the story.
2. ALWAYS include a "راوی" (Narrator, id: "char_narrator", gender: "narrator") for general descriptions, scene setting, and non-dialogue sentences.
3. If a story is mostly narrative with only a few dialogue moments, assign the narrative moments to "char_narrator" and the spoken quotes to the appropriate characters.
4. Available character genders: "narrator", "male", "female", "elder", "child", "mysterious".
5. Assign suitable pitch (0.6 to 1.6), rate (0.8 to 1.3), volume (0.85 to 1.0), and color hex code to each character.
6. Available SFX cues (optional, use where dramatic): "cinema_impact", "riser", "daf_hit", "chime_bell", "page_turn", "whoosh", "rain_thunder", "morning_birds", "heartbeat", "tape_stop", "applause", "typewriter_click".
7. Recommended BGM track must be one of: "persian_modal", "cinematic_ambient", "warm_piano", "ethereal_ambient", "modern_podcast", "meditation_432".
8. Return ONLY valid JSON matching this structure without Markdown backticks:
{
  "title": "عنوان جذاب داستان",
  "genre": "ژانر داستان (حماسی، عرفانی، رمانتیک، تاریخی، معمایی)",
  "recommendedBgm": "persian_modal",
  "characters": [
    {
      "id": "char_narrator",
      "name": "راوی دانای کل",
      "roleDescription": "روایت صحنه و توصیفات فضاسازی",
      "gender": "narrator",
      "pitch": 1.0,
      "rate": 0.95,
      "volume": 1.0,
      "color": "#3B82F6"
    }
  ],
  "dialogueLines": [
    {
      "id": "line_1",
      "characterId": "char_narrator",
      "speakerName": "راوی دانای کل",
      "text": "متن دیالوگ یا نریشن",
      "pauseAfterMs": 400,
      "sfxCueId": "daf_hit"
    }
  ]
}`;

    const candidateTextModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    let outputText = '';
    let lastErr: any = null;

    for (const model of candidateTextModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `لطفاً متن داستانی زیر را تحلیل کن و به عنوان یک نمایش صوتی تفکیک و کارگردانی کن:\n\n${storyText.trim()}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });
        if (response.text) {
          outputText = response.text.trim();
          break;
        }
      } catch (e: any) {
        lastErr = e;
        console.warn(`Model ${model} direct-story failed, trying fallback:`, e.message || e);
      }
    }

    if (!outputText) {
      throw lastErr || new Error('Failed to analyze story');
    }

    const parsed = JSON.parse(outputText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error directing story:', error);
    res.status(500).json({ error: error?.message || 'Failed to direct story' });
  }
});

// API: Search & Fetch Persian Mythological & Literary Stories
app.post('/api/search-stories', async (req, res) => {
  try {
    const { query, category } = req.body;
    const ai = new GoogleGenAI();

    const systemPrompt = `You are a Persian literature, mythology, and folklore scholar (پژوهشگر ادبیات کهن، شاهنامه و اساطیر ایران).
Your task is to provide authentic, dramatic, and beautifully phrased Persian stories based on user requests, suitable for audio narration and multi-character radio drama.

Categories include:
- شاهنامه فردوسی (حماسه‌ها، پهلوانان، نبردها، داستان‌های عاشقانه زال و رودابه، سیاوش، رستم و سهراب، بیژن و منیژه)
- کلیله و دمنه (حکایات تمثیلی و آموزنده حیوانات و پادشاهان)
- مثنوی معنوی و عطار (داستان‌های عرفانی، تمثیلی و اخلاقی)
- هزار و یک شب و افسانه‌های کهن عامیانه ایرانی
- ادبیات داستانی و معاصر

Return ONLY valid JSON matching this schema:
{
  "results": [
    {
      "id": "unique_id",
      "title": "عنوان داستان",
      "source": "منبع (مثلاً شاهنامه فردوسی، دفتر اول مثنوی)",
      "category": "شاهنامه / عرفانی / تمثیلی",
      "summary": "خلاصه دوخطی ماجرا",
      "fullText": "متن کامل و دراماتیک داستان به زبان فارسی روان، زیبا و گیرا با کلمات اصیل و متناسب برای گویندگی صوتی (بین ۱۵۰ تا ۳۰۰ کلمه)",
      "suggestedMusic": "persian_modal",
      "suggestedSfx": ["daf_hit", "chime_bell"]
    }
  ]
}`;

    const promptText = `جستجوی متون داستانی و اساطیری:
موضوع / کلیدواژه: "${query || 'داستان‌های اساطیری شاهنامه و کهن ایرانی'}"
دسته‌بندی درخواستی: "${category || 'همه‌گیر'}"
لطفاً ۳ تا ۵ داستان جذاب، معتبر و آماده برای اجرا در استودیوی صدا ارائه بده.`;

    const candidateTextModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastErr: any = null;

    for (const model of candidateTextModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });
        if (response.text) {
          outputText = response.text.trim();
          break;
        }
      } catch (e: any) {
        lastErr = e;
        console.warn(`Model ${model} search-stories failed, trying fallback:`, e.message || e);
      }
    }

    if (!outputText) {
      throw lastErr || new Error('Failed to search stories');
    }

    const parsed = JSON.parse(outputText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error searching stories:', error);
    res.status(500).json({ error: error?.message || 'Failed to search stories' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Mount Vite in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Fallback handler for SPA index.html in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (0.0.0.0)`);
  });
}

startServer();
