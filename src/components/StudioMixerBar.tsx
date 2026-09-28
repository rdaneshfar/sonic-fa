import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../audio/audioEngine';
import { toPersianDigits } from '../audio/persianUtils';
import {
  Volume2,
  VolumeX,
  SlidersVertical,
  Activity,
  Download,
  Square,
  Sparkles,
} from 'lucide-react';

interface StudioMixerBarProps {
  engine: AudioEngine;
  masterVolume: number;
  setMasterVolume: (vol: number) => void;
  voiceVolume: number;
  setVoiceVolume: (vol: number) => void;
  bgmVolume: number;
  setBgmVolume: (vol: number) => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  isRecording: boolean;
  recordingSeconds: number;
  onStopRecording: () => void;
  recordedAudioUrl: string | null;
  onDownloadAudio: () => void;
  lang: 'fa' | 'en';
}

export const StudioMixerBar: React.FC<StudioMixerBarProps> = ({
  engine,
  masterVolume,
  setMasterVolume,
  voiceVolume,
  setVoiceVolume,
  bgmVolume,
  setBgmVolume,
  sfxVolume,
  setSfxVolume,
  isRecording,
  recordingSeconds,
  onStopRecording,
  recordedAudioUrl,
  onDownloadAudio,
  lang,
}) => {
  const isFa = lang === 'fa';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const prevVolRef = useRef<number>(masterVolume);

  // Toggle Mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setMasterVolume(prevVolRef.current || 0.85);
    } else {
      prevVolRef.current = masterVolume;
      setIsMuted(true);
      setMasterVolume(0);
    }
  };

  // Real-time Canvas Visualizer loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const analyser = engine.analyser;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyser) {
        // Draw resting baseline
        ctx.fillStyle = '#171717';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#262626';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Gradient background
      ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw spectral bars
      const barWidth = (width / (bufferLength * 0.65)) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength * 0.65; i++) {
        const barHeight = (dataArray[i] / 255) * (height - 4);

        // Warm amber gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#D97706');
        gradient.addColorStop(0.6, '#F59E0B');
        gradient.addColorStop(1, '#FDE68A');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine]);

  return (
    <div className="bg-neutral-900 border-t border-neutral-800 p-4 sticky bottom-0 z-30 shadow-2xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Real-time Audio Spectrum & Level */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-56">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-medium">{isFa ? 'طیف‌نگار زنده مستر' : 'Master Spectrum'}</span>
              <span className="font-mono text-neutral-500">20Hz - 20kHz</span>
            </div>
            <div className="h-8 w-full bg-neutral-950 rounded-md border border-neutral-800/80 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={224}
                height={32}
                className="w-full h-full block"
              />
            </div>
          </div>
        </div>

        {/* Center: 4-Channel Mixer Faders */}
        <div className="grid grid-cols-4 gap-4 w-full md:w-auto items-center">
          {/* Voice Fader */}
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-neutral-400 truncate">{isFa ? 'گوینده' : 'Voice'}</span>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg mx-auto"
            />
            <span className="text-[10px] font-mono text-neutral-400">
              {isFa ? toPersianDigits(Math.round(voiceVolume * 100)) : Math.round(voiceVolume * 100)}%
            </span>
          </div>

          {/* BGM Fader */}
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-neutral-400 truncate">{isFa ? 'موسیقی' : 'BGM'}</span>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg mx-auto"
            />
            <span className="text-[10px] font-mono text-neutral-400">
              {isFa ? toPersianDigits(Math.round(bgmVolume * 100)) : Math.round(bgmVolume * 100)}%
            </span>
          </div>

          {/* SFX Fader */}
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-neutral-400 truncate">{isFa ? 'افکت‌ها' : 'SFX'}</span>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded-lg mx-auto"
            />
            <span className="text-[10px] font-mono text-neutral-400">
              {isFa ? toPersianDigits(Math.round(sfxVolume * 100)) : Math.round(sfxVolume * 100)}%
            </span>
          </div>

          {/* Master Output Fader */}
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-amber-400 font-semibold truncate">
              {isFa ? 'خروجی کل' : 'Master'}
            </span>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={masterVolume}
              onChange={(e) => {
                setIsMuted(false);
                setMasterVolume(parseFloat(e.target.value));
              }}
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer h-1 bg-neutral-800 rounded-lg mx-auto"
            />
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {isFa ? toPersianDigits(Math.round(masterVolume * 100)) : Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Right: Master Output Actions & Recording Counter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
            title={isMuted ? 'صدادار' : 'بی‌صدا'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Recording active state */}
          {isRecording && (
            <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-600/50 px-3 py-1.5 rounded-lg text-rose-200 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono font-bold">
                {isFa
                  ? `${toPersianDigits(Math.floor(recordingSeconds / 60))}:${toPersianDigits(
                      String(recordingSeconds % 60).padStart(2, '0')
                    )}`
                  : `${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}`}
              </span>
              <button
                onClick={onStopRecording}
                className="ml-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded font-medium transition-colors"
              >
                {isFa ? 'اتمام ضبط' : 'Stop'}
              </button>
            </div>
          )}

          {/* Download button */}
          {recordedAudioUrl && !isRecording && (
            <button
              onClick={onDownloadAudio}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-200 bg-emerald-950 border border-emerald-600/50 rounded-lg hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-sm animate-bounce"
            >
              <Download className="w-4 h-4" />
              <span>{isFa ? 'دریافت فایل صوتی نهایی' : 'Download Master Mix'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
