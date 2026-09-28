import React from 'react';
import { BGM_TRACKS, BGMTrackInfo } from '../audio/musicDirector';
import { ReverbRoomType } from '../audio/audioEngine';
import { toPersianDigits } from '../audio/persianUtils';
import {
  Music,
  Play,
  Square,
  Volume2,
  Sliders,
  Layers,
  Sparkles,
  ShieldCheck,
  Disc3,
} from 'lucide-react';

interface SoundDirectorConsoleProps {
  currentTrackId: string;
  onSelectTrack: (trackId: string) => void;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  bgmVolume: number;
  setBgmVolume: (vol: number) => void;
  autoDucking: boolean;
  setAutoDucking: (enabled: boolean) => void;
  duckingDepth: number;
  setDuckingDepth: (depth: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  reverbRoom: ReverbRoomType;
  setReverbRoom: (room: ReverbRoomType) => void;
  reverbWet: number;
  setReverbWet: (wet: number) => void;
  lowEq: number;
  midEq: number;
  highEq: number;
  setEq: (low: number, mid: number, high: number) => void;
  lang: 'fa' | 'en';
}

export const SoundDirectorConsole: React.FC<SoundDirectorConsoleProps> = ({
  currentTrackId,
  onSelectTrack,
  isBgmPlaying,
  onToggleBgm,
  bgmVolume,
  setBgmVolume,
  autoDucking,
  setAutoDucking,
  duckingDepth,
  setDuckingDepth,
  bpm,
  setBpm,
  reverbRoom,
  setReverbRoom,
  reverbWet,
  setReverbWet,
  lowEq,
  midEq,
  highEq,
  setEq,
  lang,
}) => {
  const isFa = lang === 'fa';

  const rooms: { id: ReverbRoomType; nameFa: string; nameEn: string; descFa: string }[] = [
    { id: 'studio', nameFa: 'استودیو گویندگی حرفه‌ای', nameEn: 'Pro Studio', descFa: 'بازتاب کنترل‌شده و گرم' },
    { id: 'acoustic_room', nameFa: 'اتاق آکوستیک زنده', nameEn: 'Live Acoustic', descFa: 'طنین طبیعی چوب و فضای بسته' },
    { id: 'concert_hall', nameFa: 'سالن بزرگ ارکستر', nameEn: 'Concert Hall', descFa: 'پژواک باشکوه و عمیق' },
    { id: 'cathedral', nameFa: 'تالار عرفانی و کلیسا', nameEn: 'Cathedral / Grand Space', descFa: 'دم طولانی و احساس معنوی' },
    { id: 'off', nameFa: 'بدون بازتاب (کاملاً خشک)', nameEn: 'Dry / No Reverb', descFa: 'بدون شبیه‌ساز فضا' },
  ];

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-6 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'میز کارگردانی موسیقی متن و فضاسازی صوتی' : 'Sound Director Music & Acoustics'}</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFa
              ? 'موسیقی‌های بدون حق نشر (Copyright-Free) سنتز شده به شکل محلی در مرورگر'
              : '100% Royalty-free Web Audio procedural music synthesis. Offline & API-free.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isFa ? '۱۰۰٪ آزاد و بدون کپی‌رایت' : 'Royalty-Free Guaranteed'}</span>
          </span>
        </div>
      </div>

      {/* Background Music Selector Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-neutral-300">
          <span className="font-medium flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'انتخاب تِم موسیقی متن:' : 'Select Music Theme:'}</span>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleBgm}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isBgmPlaying
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {isBgmPlaying ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>{isFa ? 'توقف پیش‌نمایش موسیقی' : 'Stop Music'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isFa ? 'پخش آزمایشی موسیقی' : 'Preview Music'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BGM_TRACKS.map((t: BGMTrackInfo) => {
            const isSelected = currentTrackId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                    : 'bg-neutral-950/50 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-950/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-neutral-100 flex items-center gap-1.5">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                      <span>{isFa ? t.nameFa : t.nameEn}</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {isFa ? toPersianDigits(t.defaultBpm) : t.defaultBpm} BPM
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 font-medium mb-1">
                    {t.genreFa} · {t.mood}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {t.descriptionFa}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                  <span>{isFa ? 'تولید محلی وب‌آدیو' : 'Web Audio Local Synthesis'}</span>
                  <span className={isSelected ? 'text-amber-400 font-bold' : 'text-neutral-400'}>
                    {isSelected ? (isFa ? 'انتخاب شده ✓' : 'Active ✓') : (isFa ? 'کلیک برای انتخاب' : 'Select')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Music Sliders: Volume, BPM, Ducking */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-neutral-800/80">
        {/* BGM Volume */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isFa ? 'بلندی موسیقی متن:' : 'Music Volume:'}</span>
            </span>
            <span className="font-mono text-amber-400 text-xs">
              {isFa ? toPersianDigits(Math.round(bgmVolume * 100)) : Math.round(bgmVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>{isFa ? 'خاموش' : 'Mute'}</span>
            <span>۵۰٪</span>
            <span>۱۰۰٪</span>
          </div>
        </div>

        {/* BPM Tempo */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isFa ? 'سرعت ریتم موسیقی (BPM):' : 'Music Tempo (BPM):'}</span>
            </span>
            <span className="font-mono text-amber-400 text-xs">
              {isFa ? toPersianDigits(bpm) : bpm}
            </span>
          </div>
          <input
            type="range"
            min="45"
            max="140"
            step="1"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>۴۵ (آرام)</span>
            <span>۸۰ (متعادل)</span>
            <span>۱۴۰ (پرانرژی)</span>
          </div>
        </div>

        {/* Sidechain Auto-Ducking */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'داکینگ خودکار (Ducking):' : 'Auto-Ducking:'}</span>
            </span>
            <button
              onClick={() => setAutoDucking(!autoDucking)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                autoDucking
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              {autoDucking ? (isFa ? 'فعال ✓' : 'ON') : (isFa ? 'غیرفعال' : 'OFF')}
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 leading-tight">
            {isFa
              ? 'کاهش خودکار ولوم موسیقی به محض صحبت گوینده و اوج‌گیری مجدد پس از اتمام جمله.'
              : 'Dips music automatically while the speaker narrates and restores it smoothly.'}
          </p>
          {autoDucking && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span>{isFa ? 'کاهش ولوم حین صحبت:' : 'Ducking Depth:'}</span>
              <span className="font-mono text-amber-400">
                {isFa ? toPersianDigits(Math.round((1 - duckingDepth) * 100)) : Math.round((1 - duckingDepth) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Acoustics / Reverb & Master 3-Band EQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-neutral-800/80">
        {/* Reverb System */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'شبیه‌ساز فضای آکوستیک (ریورب استودیویی):' : 'Acoustic Space Reverb:'}</span>
            </span>
            <span className="font-mono text-xs text-neutral-400">
              {isFa ? toPersianDigits(Math.round(reverbWet * 100)) : Math.round(reverbWet * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setReverbRoom(r.id)}
                className={`p-2 rounded-lg text-right text-xs transition-all border ${
                  reverbRoom === r.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-neutral-950/60 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium truncate">{isFa ? r.nameFa : r.nameEn}</div>
                <div className="text-[10px] text-neutral-500 truncate mt-0.5">{r.descFa}</div>
              </button>
            ))}
          </div>

          {reverbRoom !== 'off' && (
            <div className="mt-1">
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>{isFa ? 'شدت بازتاب فضا (Wet Mix):' : 'Reverb Mix:'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={reverbWet}
                onChange={(e) => setReverbWet(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 3-Band Master Equalizer */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'اکولایزر ۳ بانده مستر استودیو (EQ):' : 'Master 3-Band EQ:'}</span>
            </span>
            <button
              onClick={() => setEq(0, 0, 0)}
              className="text-[11px] text-neutral-500 hover:text-neutral-300"
            >
              {isFa ? 'تراز صفر (Flat)' : 'Reset Flat'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
            {/* Bass */}
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[11px] text-neutral-400">{isFa ? 'بیس (Low 120Hz)' : 'Bass'}</span>
              <span className="font-mono text-xs text-amber-400">
                {lowEq > 0 ? `+${lowEq}` : lowEq} dB
              </span>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={lowEq}
                onChange={(e) => setEq(parseInt(e.target.value, 10), midEq, highEq)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* Mid */}
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[11px] text-neutral-400">{isFa ? 'مید (Mid 1.2kHz)' : 'Mids'}</span>
              <span className="font-mono text-xs text-amber-400">
                {midEq > 0 ? `+${midEq}` : midEq} dB
              </span>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={midEq}
                onChange={(e) => setEq(lowEq, parseInt(e.target.value, 10), highEq)}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* High */}
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[11px] text-neutral-400">{isFa ? 'تریبل (High 7.5kHz)' : 'Treble'}</span>
              <span className="font-mono text-xs text-amber-400">
                {highEq > 0 ? `+${highEq}` : highEq} dB
              </span>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={highEq}
                onChange={(e) => setEq(lowEq, midEq, parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
