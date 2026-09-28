import React, { useState } from 'react';
import {
  Download,
  Check,
  Sparkles,
  Volume2,
  Music,
  Radio,
  X,
  FileAudio,
  Zap,
  Loader2,
} from 'lucide-react';
import { toPersianDigits } from '../audio/persianUtils';

interface AudioExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  onFastExportWav: (includeMusic: boolean) => Promise<void>;
  onStartRecordAndExport: (includeMusic: boolean, format: 'wav' | 'webm') => void;
  onStopAndSaveNow: () => void;
  recordedAudioUrl: string | null;
  onDownloadExisting: () => void;
  initialMixMode?: 'master' | 'raw';
  lang: 'fa' | 'en';
}

export const AudioExportModal: React.FC<AudioExportModalProps> = ({
  isOpen,
  onClose,
  isRecording,
  recordingSeconds,
  onFastExportWav,
  onStartRecordAndExport,
  onStopAndSaveNow,
  recordedAudioUrl,
  onDownloadExisting,
  initialMixMode = 'master',
  lang,
}) => {
  const isFa = lang === 'fa';
  const [includeMusic, setIncludeMusic] = useState<boolean>(initialMixMode !== 'raw');
  const [isFastExporting, setIsFastExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIncludeMusic(initialMixMode !== 'raw');
    }
  }, [isOpen, initialMixMode]);

  if (!isOpen) return null;

  const handleInstantDownload = async () => {
    setIsFastExporting(true);
    setExportSuccess(false);
    try {
      await onFastExportWav(includeMusic);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to export WAV:', err);
    } finally {
      setIsFastExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl flex flex-col overflow-hidden shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>{isFa ? 'دانلود خروجی فایل صوتی استودیو' : 'Download Studio Audio Output'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  WAV 16-bit
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {isFa
                  ? 'رندر و دانلود فوری با کیفیت استودیویی استریو بدون نیاز به اینترنت'
                  : 'Fast offline studio rendering in universal 16-bit WAV format.'}
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-200 text-xs">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">
                  {isFa ? 'فایل با موفقیت رندر شد و در حال دانلود است!' : 'Audio rendered and downloading!'}
                </span>
                <span className="text-[11px] text-emerald-400">
                  {isFa ? 'فایل در پوشه دانلودهای شما ذخیره شد.' : 'Saved directly to your Downloads folder.'}
                </span>
              </div>
            </div>
          )}

          {/* Already recorded audio download */}
          {recordedAudioUrl && !isRecording && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-600/40 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileAudio className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-200">
                    {isFa ? 'فایل ضبط‌شده قبلی آماده دریافت است' : 'Previous recording ready!'}
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    {isFa ? 'برای ذخیره مستقیم فایل کلیک کنید' : 'Click to save directly to your device'}
                  </div>
                </div>
              </div>

              <button
                onClick={onDownloadExisting}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{isFa ? 'دانلود فایل قبلی' : 'Download File'}</span>
              </button>
            </div>
          )}

          {/* Live Recording in progress */}
          {isRecording && (
            <div className="p-5 bg-rose-950/60 border border-rose-600/40 rounded-xl flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span>{isFa ? 'استودیو در حال ضبط زنده است...' : 'Live recording in progress...'}</span>
              </div>
              <div className="font-mono text-3xl font-bold text-neutral-100">
                {isFa
                  ? `${toPersianDigits(Math.floor(recordingSeconds / 60))}:${toPersianDigits(
                      String(recordingSeconds % 60).padStart(2, '0')
                    )}`
                  : `${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}`}
              </div>
              <button
                onClick={onStopAndSaveNow}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isFa ? 'توقف و دانلود فایل تا این لحظه' : 'Stop & Download'}</span>
              </button>
            </div>
          )}

          {!isRecording && (
            <>
              {/* Option 1: Mix Content Selection */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-neutral-200">
                  {isFa ? '۱. انتخاب نوع محتوای میکس صوتی:' : '1. Audio Content Mix:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIncludeMusic(true)}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                      includeMusic
                        ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-amber-400" />
                        <span>{isFa ? 'میکس کامل استودیویی (پیشنهادی)' : 'Full Studio Mix (Recommended)'}</span>
                      </span>
                      {includeMusic && <span className="text-amber-400 font-bold text-xs">✓</span>}
                    </div>
                    <span className="text-[11px] text-neutral-300 leading-tight">
                      {isFa
                        ? 'ترکیب صدای گوینده فارسی + موسیقی متن همراه با داکینگ خودکار + افکت‌های صوتی'
                        : 'Persian narration + auto-ducked background music + SFX'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncludeMusic(false)}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                      !includeMusic
                        ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-blue-400" />
                        <span>{isFa ? 'فقط صدای خالص گوینده' : 'Pure Voice Only'}</span>
                      </span>
                      {!includeMusic && <span className="text-amber-400 font-bold text-xs">✓</span>}
                    </div>
                    <span className="text-[11px] text-neutral-300 leading-tight">
                      {isFa
                        ? 'صدای تمیز و خالص بدون موسیقی پس‌زمینه (مناسب تدوین در پریمیر، افتر افکت و پادکست)'
                        : 'Clean acapella narration track for editing.'}
                    </span>
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION: Fast Instant Download */}
              <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <span>{isFa ? 'دانلود فوری و خودکار (پیشنهادی - ۱ ثانیه)' : 'Fast Instant Export (1-Click)'}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {isFa ? 'فرمت استریو WAV فشرده‌نشده' : '16-bit 44.1kHz WAV'}
                  </span>
                </div>

                <button
                  onClick={handleInstantDownload}
                  disabled={isFastExporting}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  {isFastExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isFa ? 'در حال رندر و ساخت فایل صوتی...' : 'Rendering audio buffer...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>
                        {isFa
                          ? includeMusic
                            ? 'دانلود فایل صوتی کامل (صدا + موزیک + افکت)'
                            : 'دانلود فایل صوتی خالص گوینده (WAV)'
                          : 'Download WAV Audio File Now'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Option: Real-Time Listening & Recording */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-xs text-neutral-400">
                <span>{isFa ? 'همچنین می‌خواهید هنگام گوش دادن ضبط زنده کنید؟' : 'Or record in real-time?'}</span>
                <button
                  type="button"
                  onClick={() => onStartRecordAndExport(includeMusic, 'wav')}
                  className="text-amber-400 hover:text-amber-300 font-medium underline"
                >
                  {isFa ? 'شروع ضبط زنده همزمان با پخش ←' : 'Start live recording →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
