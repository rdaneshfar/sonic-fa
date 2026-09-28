import React from 'react';
import { PERSIAN_PRESETS, PersianScriptPreset } from '../audio/persianUtils';
import { BGM_TRACKS } from '../audio/musicDirector';
import { SFX_CATALOG } from '../audio/sfxBoard';
import { X, Sparkles, BookOpen, Music, Bell, ArrowLeft } from 'lucide-react';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PersianScriptPreset) => void;
  lang: 'fa' | 'en';
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  lang,
}) => {
  const isFa = lang === 'fa';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                {isFa ? 'کتابخانه متون، اشعار و سناریوهای نریشن' : 'Script & Poetry Library'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isFa
                  ? 'نمونه‌های آماده همراه با تنظیمات خودکار موسیقی متن و جلوه‌های صوتی متناسب'
                  : 'Curated Persian scripts with pre-configured background music and sound effect cues.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSIAN_PRESETS.map((p) => {
            const music = BGM_TRACKS.find((m) => m.id === p.suggestedMusic);
            const sfxItems = p.suggestedSfx
              .map((id) => SFX_CATALOG.find((s) => s.id === id))
              .filter(Boolean);

            return (
              <div
                key={p.id}
                className="bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-neutral-100">{p.title}</span>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      {p.category}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 mb-2">
                    <span>{isFa ? 'اثر / پدیدآورنده:' : 'Author:'}</span>{' '}
                    <strong className="text-neutral-300 font-medium">{p.author}</strong>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/60 font-sans">
                    {p.text}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/60">
                  {/* Suggested Music & SFX */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 text-amber-300/80">
                      <Music className="w-3 h-3 text-amber-400" />
                      <span>{music?.nameFa || p.suggestedMusic}</span>
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="flex items-center gap-1 text-neutral-300">
                      <Bell className="w-3 h-3 text-neutral-400" />
                      <span>
                        {sfxItems.map((s) => s?.nameFa.split(' ')[0]).join('، ')}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectPreset(p);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isFa ? 'بارگذاری متن و تنظیمات کارگردانی' : 'Load Script & Settings'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
