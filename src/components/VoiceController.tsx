import React from 'react';
import { TTSVoiceOption, PlaybackState } from '../audio/persianTTS';
import { toPersianDigits } from '../audio/persianUtils';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  Gauge,
  SlidersHorizontal,
  CheckCircle2,
  Download,
  Sparkles,
  Info,
  Music,
  Mic,
  Sliders,
} from 'lucide-react';

export type AudioMixMode = 'master' | 'raw';

interface VoiceControllerProps {
  voices: TTSVoiceOption[];
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onTestVoice: () => void;
  onOpenExportModal: () => void;
  onDownloadMasterMix: () => void;
  onDownloadRawVoice: () => void;
  mixMode: AudioMixMode;
  setMixMode: (mode: AudioMixMode) => void;
  lang: 'fa' | 'en';
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  voices,
  selectedVoiceId,
  setSelectedVoiceId,
  rate,
  setRate,
  pitch,
  setPitch,
  volume,
  setVolume,
  playbackState,
  onPlay,
  onPause,
  onResume,
  onStop,
  onTestVoice,
  onOpenExportModal,
  onDownloadMasterMix,
  onDownloadRawVoice,
  mixMode,
  setMixMode,
  lang,
}) => {
  const isFa = lang === 'fa';
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];
  const talent = selectedVoice?.talentProfile;

  const studioVoices = voices.filter((v) => v.isAcousticStudio);
  const nativeVoices = voices.filter((v) => !v.isAcousticStudio);

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-5 shadow-sm">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>{isFa ? 'استودیوی گوینده و کارگردانی صدا (TTS)' : 'Voiceover & Sound Director Studio'}</span>
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isFa ? 'صدای طبیعی و زنده انسان' : 'Neural Human Prosody'}</span>
          </span>

          {/* Test Voice Button */}
          <button
            onClick={onTestVoice}
            className="px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            title="پخش فوری یک جمله نمونه با لهجه و تنظیمات فعلی"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'تست صدای این گوینده' : 'Test Voice Audio'}</span>
          </button>
        </div>
      </div>

      {/* Voice Selection & Engine Options */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
          <span>{isFa ? 'انتخاب گوینده فعال:' : 'Active Persian Voice Talent:'}</span>
          <span className="text-[11px] text-amber-400/90 font-mono">
            {isFa
              ? `${toPersianDigits(voices.length)} گوینده مستقل فارسی`
              : `${voices.length} Independent Persian Voices`}
          </span>
        </label>

        <select
          value={selectedVoiceId}
          onChange={(e) => setSelectedVoiceId(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 hover:border-amber-500/50 text-neutral-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
          dir="rtl"
        >
          <optgroup label={isFa ? 'گویندگان استودیویی فارسی (طبیعی و زنده)' : 'Persian Studio Voice Talents'}>
            {studioVoices.map((v) => (
              <option key={v.id} value={v.id} className="bg-neutral-900 py-1.5">
                {v.name}
              </option>
            ))}
          </optgroup>

          {nativeVoices.length > 0 && (
            <optgroup label={isFa ? 'گویندگان بومی ویندوز / اندروید' : 'Native OS Persian Voices'}>
              {nativeVoices.map((v) => (
                <option key={v.id} value={v.id} className="bg-neutral-900 py-1.5">
                  {v.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Selected Talent Profile Card */}
        {talent && (
          <div className="p-3 bg-neutral-950/70 rounded-lg border border-neutral-800 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{talent.nameFa}</span>
              </span>
              <span className="text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                {talent.accentStyle}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              {talent.descriptionFa}
            </p>
          </div>
        )}
      </div>

      {/* PROMINENT STUDIO MIX MODE SELECTOR */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'انتخاب حالت میکس و خروجی استودیو:' : 'Audio Mix Mode Selection:'}</span>
          </span>
          <span className="text-[11px] text-neutral-400">
            {isFa ? 'کنترل ترکیب موسیقی و افکت‌ها با صدا' : 'Music & SFX routing'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Master Studio Mix */}
          <button
            type="button"
            onClick={() => setMixMode('master')}
            className={`p-3.5 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
              mixMode === 'master'
                ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-400" />
                <span>{isFa ? '🎧 میکس کامل استودیویی (پیشنهادی)' : 'Studio Master Mix'}</span>
              </span>
              {mixMode === 'master' && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  {isFa ? 'فعال ✓' : 'ACTIVE'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-300 leading-relaxed">
              {isFa
                ? 'ترکیب صدای گوینده + موسیقی متن همراه با داکینگ خودکار + افکت‌های صوتی و ریورب حرفه‌ای'
                : 'Narration with auto-ducked soundtrack, sound effects, and mastering compressor.'}
            </span>
          </button>

          {/* Option 2: Pure Raw Voice */}
          <button
            type="button"
            onClick={() => setMixMode('raw')}
            className={`p-3.5 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
              mixMode === 'raw'
                ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-blue-400" />
                <span>{isFa ? '🎙️ صدای خام و خالص گوینده' : 'Pure Raw Voice'}</span>
              </span>
              {mixMode === 'raw' && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  {isFa ? 'فعال ✓' : 'ACTIVE'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-300 leading-relaxed">
              {isFa
                ? 'فقط صدای شفاف، تمیز و ناب گوینده بدون هیچ موسیقی پس‌زمینه (مناسب تدوین در پریمیر و پادکست)'
                : 'Clean vocal track without background music or sound effects for video editing.'}
            </span>
          </button>
        </div>
      </div>

      {/* Sliders: Rate, Pitch, Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rate (Speed) */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isFa ? 'سرعت خوانش نریشن:' : 'Narration Rate:'}</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-amber-400">
              <span>{isFa ? toPersianDigits(rate.toFixed(1)) : rate.toFixed(1)}x</span>
              {rate !== 1.0 && (
                <button
                  onClick={() => setRate(1.0)}
                  className="text-neutral-500 hover:text-neutral-300 ml-1"
                  title="بازنشانی"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>{isFa ? 'آرام (۰.۵x)' : 'Slow'}</span>
            <span>{isFa ? 'طبیعی (۱.۰x)' : 'Normal'}</span>
            <span>{isFa ? 'سریع (۲.۰x)' : 'Fast'}</span>
          </div>
        </div>

        {/* Pitch (Tone) */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isFa ? 'زیروبمی صدا (Pitch):' : 'Voice Pitch:'}</span>
            </span>
            <div className="flex items-center gap-1 font-mono text-amber-400">
              <span>{isFa ? toPersianDigits(pitch.toFixed(2)) : pitch.toFixed(2)}</span>
              {pitch !== 1.0 && (
                <button
                  onClick={() => setPitch(1.0)}
                  className="text-neutral-500 hover:text-neutral-300 ml-1"
                  title="بازنشانی"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>{isFa ? 'بم و مردانه' : 'Deep Male'}</span>
            <span>{isFa ? 'طبیعی (۱.۰)' : 'Normal'}</span>
            <span>{isFa ? 'زیر و زنانه' : 'High'}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/40">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isFa ? 'بلندی صدای گوینده:' : 'Voice Volume:'}</span>
            </span>
            <span className="font-mono text-amber-400 text-xs">
              {isFa ? toPersianDigits(Math.round(volume * 100)) : Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>{isFa ? 'بی‌صدا' : 'Mute'}</span>
            <span>۵۰٪</span>
            <span>۱۰۰٪</span>
          </div>
        </div>
      </div>

      {/* Main Transport Control Buttons with DUAL DOWNLOAD BUTTONS (MIX & RAW) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-neutral-800/80">
        {/* Play/Pause Button */}
        {!isPlaying ? (
          <button
            onClick={isPaused ? onResume : onPlay}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-amber-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isPaused
                ? isFa
                  ? 'ادامه خوانش'
                  : 'Resume Speech'
                : isFa
                ? mixMode === 'master'
                  ? 'پخش میکس کامل استودیو'
                  : 'پخش صدای خام گوینده'
                : 'Play Narration'}
            </span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-6 py-2.5 bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>{isFa ? 'مکث' : 'Pause'}</span>
          </button>
        )}

        {/* Stop Button */}
        <button
          onClick={onStop}
          disabled={playbackState === 'idle'}
          className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
            playbackState !== 'idle'
              ? 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border-neutral-700'
              : 'bg-neutral-900/50 text-neutral-600 border-neutral-800/50 cursor-not-allowed'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          <span>{isFa ? 'توقف' : 'Stop'}</span>
        </button>

        {/* DOWNLOAD 1: Master Mix (Voice + Music + SFX) */}
        <button
          onClick={onDownloadMasterMix}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-emerald-600/25 flex items-center gap-1.5 border border-emerald-500/40"
          title="دانلود فایل صوتی کامل با موسیقی متن و افکت‌ها در قالب WAV"
        >
          <Download className="w-4 h-4" />
          <span>{isFa ? 'دانلود میکس کامل (WAV)' : 'Download Master Mix (WAV)'}</span>
        </button>

        {/* DOWNLOAD 2: Raw Pure Voice (Clean vocals only) */}
        <button
          onClick={onDownloadRawVoice}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-blue-600/25 flex items-center gap-1.5 border border-blue-500/40"
          title="دانلود صدای خام و بدون موسیقی گوینده برای تدوین و ادیتورها"
        >
          <Mic className="w-4 h-4" />
          <span>{isFa ? 'دانلود صدای خام (Raw WAV)' : 'Download Raw Voice (WAV)'}</span>
        </button>

        {/* Advanced Export Options Modal Trigger */}
        <button
          onClick={onOpenExportModal}
          className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700 transition-colors"
          title="تنظیمات پیشرفته ضبط و صدور فایل"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
