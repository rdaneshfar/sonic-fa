import React from 'react';
import { Volume2, Music, Radio, Download, ShieldCheck, Keyboard, HelpCircle } from 'lucide-react';

interface GuideTabProps {
  lang: 'fa' | 'en';
}

export const GuideTab: React.FC<GuideTabProps> = ({ lang }) => {
  const isFa = lang === 'fa';

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-6 flex flex-col gap-6 shadow-sm">
      <div className="border-b border-neutral-800/80 pb-4">
        <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>{isFa ? 'راهنمای جامع کار با استودیو و گویندگی صوتی' : 'User Guide & Production Tips'}</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {isFa
            ? 'نکات طلایی برای گویندگی حرفه‌ای، بهبود تلفظ کلمات فارسی، تنظیم موسیقی و صدابرداری'
            : 'Master local offline text-to-speech, Persian pronunciation diacritics, and sound direction.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: 100% Offline & Free Architecture */}
        <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? '۱. کاملاً آفلاین و بدون هیچ‌گونه API یا هزینه' : '1. 100% Offline & Zero API'}</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isFa
              ? 'این نرم‌افزار بدون وابستگی به سرورهای خارجی یا APIهای پولی کار می‌کند. تبدیل متن‌به‌گفتار از طریق موتور گفتار داخلی سیستم‌عامل شما (SpeechSynthesis) و همچنین موتور آکوستیک وب‌آدیو (Web Audio Formant Synthesizer) به شکل کاملاً محلی انجام می‌پذیرد.'
              : 'Runs entirely in your web browser. Text-to-speech uses native speech synthesis and offline Web Audio formant acoustics. No server calls, no API keys, and no subscriptions.'}
          </p>
        </div>

        {/* Card 2: Improving Pronunciation with Harakat */}
        <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{isFa ? '۲. بهبود و اصلاح تلفظ کلمات با اعراب (حَرَکات)' : '2. Accurate Persian Pronunciation with Harakat'}</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isFa
              ? 'زبان فارسی در خط بدون اعراب گاهی دچار ابهام در خوانش حروف صدادار کوتاه می‌شود. با نوار ابزار حَرَکات بالای ویرایشگر، می‌توانید روی کلمات فتحه (ـَ)، کسره (ـِ)، ضمه (ـُ) یا تشدید (ـّ) بگذارید تا موتور گوینده کلمات را با لهجه و تلفظ کاملاً دقیق و بی‌نقص ادا کند.'
              : 'Add short vowels (Fatha, Kasra, Damma) or Tashdid to eliminate homograph ambiguity and make the voice pronounce tricky Persian terms with natural prosody.'}
          </p>
        </div>

        {/* Card 3: Auto-Ducking Sound Director */}
        <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Music className="w-4 h-4 text-blue-400" />
            <span>{isFa ? '۳. سیستم داکینگ خودکار موسیقی (Auto-Ducking)' : '3. Sidechain Auto-Ducking System'}</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isFa
              ? 'همانند یک کارگردان حرفه‌ای صدا در رادیو و سینما، به محض شروع نریشن گوینده، صدای موسیقی متن به آرامی کاهش می‌یابد (داک می‌شود) تا کلام شفاف شنیده شود؛ به محض پایان یا مکث گوینده، موسیقی با موجی نرم به سطح اول بازمی‌گردد.'
              : 'Just like professional broadcast studios, the background music automatically ducks down in volume when the speaker talks, and smoothly swells back up when speech pauses.'}
          </p>
        </div>

        {/* Card 4: Keyboard Shortcuts & Live SFX Board */}
        <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>{isFa ? '۴. کلیدهای میانبر کارگردانی سریع' : '4. Fast Keyboard Shortcuts'}</span>
          </div>
          <div className="text-xs text-neutral-300 flex flex-col gap-1.5">
            <div className="flex items-center justify-between bg-neutral-900/80 p-1.5 rounded">
              <span>{isFa ? 'کلید Space (فاصله):' : 'Spacebar:'}</span>
              <strong className="text-amber-400 font-mono">{isFa ? 'پخش یا مکث خوانش' : 'Play / Pause Speech'}</strong>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/80 p-1.5 rounded">
              <span>{isFa ? 'کلید Esc:' : 'Escape key:'}</span>
              <strong className="text-amber-400 font-mono">{isFa ? 'توقف کامل صدا' : 'Stop Everything'}</strong>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/80 p-1.5 rounded">
              <span>{isFa ? 'کلیدهای ۱ تا =:' : 'Keys 1 to =:'}</span>
              <strong className="text-amber-400 font-mono">{isFa ? 'پخش آنی ۱۲ افکت صوتی' : 'Trigger 12 SFX Instantly'}</strong>
            </div>
          </div>
        </div>

        {/* Card 5: Recording and Exporting */}
        <div className="bg-neutral-950/60 rounded-xl border border-neutral-800/80 p-4 flex flex-col gap-2.5 md:col-span-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Download className="w-4 h-4 text-rose-400" />
            <span>{isFa ? '۵. ضبط و خروجی فایل صوتی نهایی (Master Audio Export)' : '5. Audio Recording & Master Export'}</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isFa
              ? 'با کلیک بر روی دکمه «ضبط و خروجی صوتی» در هدر یا نوار مستر، کل زنجیره صدا شامل صدای گوینده فارسی، موسیقی متنِ هماهنگ‌شده با داکینگ و افکت‌های صوتی پخش‌شده به صورت زنده با کیفیت بالا ضبط شده و در قالب یک فایل صوتی قابل پخش و اشتراک‌گذاری در دستگاه شما ذخیره می‌شود.'
              : 'Click "Record Master Mix" to capture the full audio stream (Persian voice + ducked background music + triggered SFX) directly to a downloadable master audio file.'}
          </p>
        </div>
      </div>
    </div>
  );
};
