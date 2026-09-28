import React, { useState } from 'react';
import { SFX_CATALOG, SoundEffectItem } from '../audio/sfxBoard';
import { toPersianDigits } from '../audio/persianUtils';
import { Radio, Volume2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface SFXSoundboardProps {
  onPlaySfx: (id: string) => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  lang: 'fa' | 'en';
}

export const SFXSoundboard: React.FC<SFXSoundboardProps> = ({
  onPlaySfx,
  sfxVolume,
  setSfxVolume,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);

  const categories = [
    { id: 'all', nameFa: 'همه افکت‌ها', nameEn: 'All SFX' },
    { id: 'سینمایی', nameFa: 'سینمایی و هیجان', nameEn: 'Cinematic' },
    { id: 'طبیعت', nameFa: 'طبیعت و اتمسفر', nameEn: 'Nature' },
    { id: 'ساز و ریتم', nameFa: 'ساز و کوبه‌ای', nameEn: 'Instruments' },
    { id: 'افکت و انیمیشن', nameFa: 'انتقال و افکت', nameEn: 'Transitions' },
  ];

  const filtered =
    activeCategory === 'all'
      ? SFX_CATALOG
      : SFX_CATALOG.filter((s) => s.category === activeCategory);

  const handleTrigger = (id: string) => {
    setLastTriggeredId(id);
    onPlaySfx(id);
    setTimeout(() => {
      setLastTriggeredId(null);
    }, 350);
  };

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'میز صداگذاری و جلوه‌های صوتی استودیو (SFX Soundboard)' : 'SFX Soundboard Console'}</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFa
              ? '۱۲ افکت صوتی باکیفیت و بدون کپی‌رایت ساخته‌شده با موتور وب‌آدیو (کلیدهای ۱ تا = کیبورد)'
              : '12 Copyright-free sound effects synthesized locally. Use keyboard keys 1 to =.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* SFX Volume */}
          <div className="flex items-center gap-2 bg-neutral-950/60 px-3 py-1.5 rounded-lg border border-neutral-800">
            <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400">{isFa ? 'ولوم افکت:' : 'SFX Vol:'}</span>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <span className="text-[11px] font-mono text-amber-400 w-8 text-left">
              {isFa ? toPersianDigits(Math.round(sfxVolume * 100)) : Math.round(sfxVolume * 100)}%
            </span>
          </div>

          <span className="text-xs text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isFa ? 'کاملاً آفلاین' : 'Offline'}</span>
          </span>
        </div>
      </div>

      {/* Category Filter Tabs (Zero-pill compliant segmented control) */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-950/60 rounded-lg border border-neutral-800/80 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeCategory === c.id
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? c.nameFa : c.nameEn}
          </button>
        ))}
      </div>

      {/* SFX Pad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((item: SoundEffectItem) => {
          const isFired = lastTriggeredId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTrigger(item.id)}
              className={`group relative p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-3 text-neutral-100 ${
                isFired
                  ? 'scale-98 shadow-lg ring-2 ring-amber-400 border-amber-400 bg-amber-500/20'
                  : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 group-hover:text-amber-300">
                  [{item.keyboardShortcut}]
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-100 group-hover:text-amber-300 transition-colors">
                  {isFa ? item.nameFa : item.nameEn}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {isFa ? item.descriptionFa : item.nameEn}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>{isFa ? 'پخش فوری' : 'Trigger'}</span>
                </span>
                <span className="text-neutral-400">{item.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
