import React, { useRef } from 'react';
import {
  PERSIAN_HARAKAT,
  normalizePersianText,
  toPersianDigits,
  estimateReadingTimeSeconds,
} from '../audio/persianUtils';
import { CueMarker, PlaybackState } from '../audio/persianTTS';
import { SFX_CATALOG } from '../audio/sfxBoard';
import { Sparkles, Trash2, Wand2, Bell, X, PlayCircle, Download } from 'lucide-react';

interface PersianEditorProps {
  text: string;
  setText: (text: string) => void;
  lang: 'fa' | 'en';
  playbackState: PlaybackState;
  currentWordIndex: number;
  cueMarkers: CueMarker[];
  setCueMarkers: React.Dispatch<React.SetStateAction<CueMarker[]>>;
  rate: number;
  onOpenPresets: () => void;
  onQuickPlay: () => void;
  onOpenExportModal: () => void;
}

export const PersianEditor: React.FC<PersianEditorProps> = ({
  text,
  setText,
  lang,
  playbackState,
  currentWordIndex,
  cueMarkers,
  setCueMarkers,
  rate,
  onOpenPresets,
  onQuickPlay,
  onOpenExportModal,
}) => {
  const isFa = lang === 'fa';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedWordForCue, setSelectedWordForCue] = React.useState<number | null>(null);

  // Split text into words for boundary tracking and cue placement
  const words = React.useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/) : [];
  }, [text]);

  const wordCount = words.length;
  const charCount = text.length;
  const estSeconds = estimateReadingTimeSeconds(text, rate);

  // Insert diacritic character at cursor
  const insertHarakat = (symbol: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText(text + symbol);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextText = text.substring(0, start) + symbol + text.substring(end);
    setText(nextText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Normalize Persian
  const handleNormalize = () => {
    setText(normalizePersianText(text));
  };

  // Strip Harakat
  const handleStripHarakat = () => {
    const stripped = text.replace(/[\u064B-\u0652\u0670]/g, '');
    setText(stripped);
  };

  // Add/remove cue marker
  const handleAssignCue = (wordIndex: number, sfxId: string) => {
    setCueMarkers((prev) => {
      const filtered = prev.filter((c) => c.wordIndex !== wordIndex);
      return [...filtered, { id: `${wordIndex}-${sfxId}`, wordIndex, sfxId }];
    });
    setSelectedWordForCue(null);
  };

  const handleRemoveCue = (wordIndex: number) => {
    setCueMarkers((prev) => prev.filter((c) => c.wordIndex !== wordIndex));
  };

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-4 shadow-sm">
      {/* Top action bar: Presets, Tools, and Diacritics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPresets}
            className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFa ? 'انتخاب متن از متون آماده و شعر' : 'Load Preset Script'}</span>
          </button>

          <button
            onClick={handleNormalize}
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-neutral-100 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 rounded-lg transition-colors flex items-center gap-1.5"
            title="استانداردسازی ک و ی، فواصل و نشانه‌گذاری"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span>{isFa ? 'اصلاح و استانداردسازی خط' : 'Normalize Persian'}</span>
          </button>

          <button
            onClick={handleStripHarakat}
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-800/40 hover:bg-neutral-800/70 border border-neutral-700/40 rounded-lg transition-colors"
          >
            <span>{isFa ? 'حذف اعراب' : 'Remove Vowels'}</span>
          </button>

          {/* LARGE DIRECT DOWNLOAD BUTTON */}
          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 text-xs font-bold text-emerald-200 bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isFa ? 'دانلود فایل صوتی خروجی' : 'Download Audio'}</span>
          </button>
        </div>

        {/* Clear button */}
        {text.length > 0 && (
          <button
            onClick={() => setText('')}
            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="پاک کردن متن"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Harakat Toolbar (Diacritics for accurate pronunciation) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-neutral-300">
        <span className="text-[11px] text-neutral-500 whitespace-nowrap pl-1">
          {isFa ? 'نشانه‌های آوایی (اعراب):' : 'Pronunciation Harakat:'}
        </span>
        {PERSIAN_HARAKAT.map((item) => (
          <button
            key={item.name}
            onClick={() => insertHarakat(item.symbol)}
            className="px-2 py-1 bg-neutral-800/60 hover:bg-neutral-700/70 text-amber-300 border border-neutral-700/60 rounded-md transition-colors font-medium text-xs whitespace-nowrap"
            title={item.label}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Persian Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isFa
              ? 'متن فارسی دلخواه خود را اینجا بنویسید یا یکی از اشعار و متون نمونه را بارگذاری کنید...'
              : 'Write or paste your Persian text here or choose from preset scripts...'
          }
          dir="rtl"
          rows={7}
          className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl p-4 text-base text-neutral-100 placeholder-neutral-500 font-sans leading-relaxed resize-y focus:outline-none transition-all"
          style={{
            fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif",
            lineHeight: '2.1',
          }}
        />

        {text.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <p className="text-sm text-neutral-500 mb-2">
              {isFa ? 'متنی برای خوانش وجود ندارد' : 'No text entered yet'}
            </p>
            <button
              onClick={onOpenPresets}
              className="pointer-events-auto px-3 py-1.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            >
              {isFa ? 'نمایش اشعار حافظ، سهراب و نریشن‌های نمونه' : 'View Sample Scripts & Poetry'}
            </button>
          </div>
        )}
      </div>

      {/* Karaoke Word Tracker & SFX Cue Attacher (Shown when text is present) */}
      {words.length > 0 && (
        <div className="bg-neutral-950/50 rounded-lg border border-neutral-800/60 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {isFa
                ? 'ردیاب زنده کلمات و کارگردانی جلوه‌های صوتی (روی کلمات کلیک کنید تا افکت صوتی به آن‌ها متصل شود):'
                : 'Live Word Tracker & Cue Attacher (Click any word to assign sound effects):'}
            </span>

            {playbackState !== 'playing' && (
              <button
                onClick={onQuickPlay}
                className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{isFa ? 'شروع خوانش' : 'Play Speech'}</span>
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 text-sm leading-relaxed"
            dir="rtl"
          >
            {words.map((word, idx) => {
              const isCurrent = currentWordIndex === idx;
              const cue = cueMarkers.find((c) => c.wordIndex === idx);
              const cueSfx = cue ? SFX_CATALOG.find((s) => s.id === cue.sfxId) : null;

              return (
                <div key={idx} className="relative inline-flex flex-col items-center">
                  {/* Cue indicator tag */}
                  {cue && (
                    <div
                      className="text-[9px] px-1.5 py-0.2 rounded-full font-mono text-neutral-950 font-bold mb-0.5 shadow-sm flex items-center gap-0.5"
                      style={{ backgroundColor: cueSfx?.color || '#F59E0B' }}
                      title={`${cueSfx?.nameFa} (${cueSfx?.nameEn})`}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      <span>{cueSfx?.nameFa.split(' ')[0]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCue(idx);
                        }}
                        className="hover:opacity-75"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedWordForCue(idx)}
                    className={`px-1.5 py-0.5 rounded transition-all text-xs md:text-sm ${
                      isCurrent
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-md scale-105'
                        : cue
                        ? 'bg-neutral-800 text-amber-200 border border-amber-500/40'
                        : 'hover:bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    {word}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cue Assign Dialog popup */}
          {selectedWordForCue !== null && (
            <div className="mt-2 p-3 bg-neutral-900 border border-neutral-700 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-200 font-medium">
                  {isFa
                    ? `انتخاب جلوه صوتی برای کلمه: «${words[selectedWordForCue]}»`
                    : `Assign Sound Effect to word: "${words[selectedWordForCue]}"`}
                </span>
                <button
                  onClick={() => setSelectedWordForCue(null)}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                {SFX_CATALOG.map((sfx) => (
                  <button
                    key={sfx.id}
                    onClick={() => handleAssignCue(selectedWordForCue, sfx.id)}
                    className="p-1.5 text-right bg-neutral-800 hover:bg-neutral-700/80 rounded border border-neutral-700 text-xs text-neutral-200 flex items-center justify-between gap-1 transition-colors"
                  >
                    <span className="truncate">{sfx.nameFa}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sfx.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unboxed Metadata Footer with subtle separators (Frontend Design Rule A) */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1 border-t border-neutral-800/80">
        <span>
          {isFa ? 'تعداد کلمات:' : 'Words:'}{' '}
          <strong className="text-neutral-200 font-mono">
            {isFa ? toPersianDigits(wordCount) : wordCount}
          </strong>
        </span>
        <span aria-hidden="true" className="text-neutral-600">
          ·
        </span>
        <span>
          {isFa ? 'حروف:' : 'Characters:'}{' '}
          <strong className="text-neutral-200 font-mono">
            {isFa ? toPersianDigits(charCount) : charCount}
          </strong>
        </span>
        <span aria-hidden="true" className="text-neutral-600">
          ·
        </span>
        <span>
          {isFa ? 'زمان تخمینی گویندگی:' : 'Estimated Speech Time:'}{' '}
          <strong className="text-neutral-200 font-mono">
            {isFa
              ? `${toPersianDigits(Math.floor(estSeconds / 60))}:${toPersianDigits(
                  String(estSeconds % 60).padStart(2, '0')
                )}`
              : `${Math.floor(estSeconds / 60)}:${String(estSeconds % 60).padStart(2, '0')}`}
          </strong>
        </span>
        <span aria-hidden="true" className="text-neutral-600">
          ·
        </span>
        <span>
          {isFa ? 'افکت‌های زمان‌بندی‌شده:' : 'SFX Cues:'}{' '}
          <strong className="text-amber-400 font-mono">
            {isFa ? toPersianDigits(cueMarkers.length) : cueMarkers.length}
          </strong>
        </span>
      </div>
    </div>
  );
};
