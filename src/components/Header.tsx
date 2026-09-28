import React from 'react';
import { Disc, Radio, Sliders, Volume2, Globe, Sparkles, BookOpen } from 'lucide-react';

export type StudioTab = 'studio' | 'story' | 'director' | 'sfx' | 'presets';

interface HeaderProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  recordedAudioUrl: string | null;
  onDownloadAudio: () => void;
  onOpenStorySearchModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  isRecording,
  onToggleRecording,
  recordedAudioUrl,
  onDownloadAudio,
  onOpenStorySearchModal,
}) => {
  const isFa = lang === 'fa';

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Volume2 className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-neutral-100 flex items-center gap-2">
          {isFa ? 'آواگردان | استودیوی خوانش، گویندگی و کارگردانی صدا' : 'Avagardan | Persian Narration & Voiceover Studio'}
          <span className="text-[11px] font-normal text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {isFa ? '۱۰۰٪ آفلاین و بدون API' : '100% Offline & Free'}
          </span>
        </span>
      </div>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-neutral-400">
        <button
          onClick={() => setActiveTab('studio')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            activeTab === 'studio'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isFa ? 'خوانش تک‌گوینده' : 'Single Narration'}</span>
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            activeTab === 'story'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'hover:text-neutral-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{isFa ? 'روایت چند دیالوگه داستانی' : 'Multi-Character Story'}</span>
        </button>

        <button
          onClick={() => setActiveTab('director')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            activeTab === 'director'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'hover:text-neutral-200'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>{isFa ? 'موسیقی متن و داکینگ' : 'Music Director'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sfx')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            activeTab === 'sfx'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'hover:text-neutral-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isFa ? 'جلوه‌های صوتی SFX' : 'SFX Soundboard'}</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`transition-colors flex items-center gap-1.5 py-1 ${
            activeTab === 'presets'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isFa ? 'راهنما و اشعار' : 'Guide & Presets'}</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        {/* Story Search Modal Button */}
        {onOpenStorySearchModal && (
          <button
            onClick={onOpenStorySearchModal}
            className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="جستجو در گنجینه داستان‌های اساطیری و کهن"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isFa ? 'گنجینه داستان‌ها' : 'Story Library'}</span>
          </button>
        )}

        {/* Language switch */}
        <button
          onClick={() => setLang(isFa ? 'en' : 'fa')}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-1 rounded bg-neutral-800/70 border border-neutral-700/60 transition-colors"
          title="تغییر زبان / Switch Language"
        >
          <Globe className="w-3 h-3 text-neutral-400" />
          <span className="font-mono">{isFa ? 'EN' : 'فا'}</span>
        </button>

        {/* Direct Download Button (Always Visible) */}
        <button
          onClick={onDownloadAudio}
          className="px-3.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          title="دانلود فایل صوتی خروجی"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{isFa ? 'دانلود خروجی (WAV)' : 'Download Audio (WAV)'}</span>
        </button>

        {/* Master Record Toggle */}
        <button
          onClick={onToggleRecording}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-neutral-900'}`} />
          <span>
            {isRecording
              ? isFa
                ? 'در حال ضبط استودیو...'
                : 'Recording Master...'
              : isFa
              ? 'ضبط و خروجی صوتی'
              : 'Record Master Mix'}
          </span>
        </button>
      </div>
    </header>
  );
};
