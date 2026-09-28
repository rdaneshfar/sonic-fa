import React from 'react';
import {
  PERSIAN_VOICE_TALENTS,
  PersianVoiceTalent,
} from '../audio/persianPhonetics';
import { TTSVoiceOption } from '../audio/persianTTS';
import { toPersianDigits } from '../audio/persianUtils';
import { Mic2, Play, CheckCircle2, User, Sparkles, ShieldCheck } from 'lucide-react';

interface PersianTalentSelectorProps {
  voices: TTSVoiceOption[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onTestTalent: (talent: PersianVoiceTalent) => void;
  onTestNativeVoice: (voice: TTSVoiceOption) => void;
  lang: 'fa' | 'en';
}

export const PersianTalentSelector: React.FC<PersianTalentSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onTestTalent,
  onTestNativeVoice,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Native Persian OS voices (fa-IR / Google فارسی / Dilara)
  const nativeSystemPersianVoices = voices.filter((v) => !v.talentProfile && v.rawVoice);

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'ویترین گویندگان مستقل زبان فارسی (اکسنت و لهجه اصیل)' : 'Dedicated Persian Voice Talents'}</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFa
              ? 'صداهای اختصاصی زبان فارسی با قواعد تکیه کلمات (Word Stress)، مصوت‌های استاندارد و بدون تداخل با زبان‌های دیگر'
              : 'Dedicated Persian voice profiles with authentic Tehrani & epic accents, final-syllable stress, and Persian prosody.'}
          </p>
        </div>

        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isFa ? '۱۰۰٪ زبان فارسی مستقل' : '100% Persian Language Only'}</span>
        </span>
      </div>

      {/* 6 Dedicated Persian Voice Talents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {PERSIAN_VOICE_TALENTS.map((talent: PersianVoiceTalent) => {
          const isSelected = selectedVoiceId === talent.id;

          return (
            <div
              key={talent.id}
              onClick={() => onSelectVoice(talent.id)}
              className={`p-4 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-neutral-950/60 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-950'
              }`}
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        talent.gender === 'زن'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                        <span>{talent.nameFa.split(' ')[0]}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">
                          ({talent.gender})
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400/90 font-medium">
                        {talent.accentStyle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFa ? 'گوینده فعال' : 'Active'}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-neutral-200 mt-2">
                  {talent.titleFa}
                </div>

                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  {talent.descriptionFa}
                </p>

                <div className="text-[10px] text-neutral-500 mt-1.5 bg-neutral-900/60 p-1.5 rounded border border-neutral-800/50">
                  <strong className="text-neutral-400">{isFa ? 'کاربرد:' : 'Best for:'}</strong>{' '}
                  {talent.styleFa}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                {/* Test Voice Sample Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestTalent(talent);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isFa ? 'تست صدای این گوینده' : 'Test Sample'}</span>
                </button>

                <button
                  onClick={() => onSelectVoice(talent.id)}
                  className={`text-[11px] font-semibold transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isSelected ? (isFa ? 'انتخاب شده ✓' : 'Selected') : (isFa ? 'انتخاب این گوینده' : 'Select Voice')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Native Operating System Persian Voices (if detected on user's machine) */}
      {nativeSystemPersianVoices.length > 0 && (
        <div className="mt-2 pt-4 border-t border-neutral-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'صداهای بومی فارسی سیستم‌عامل شما:' : 'Installed System Persian Voices:'}</span>
            </span>
            <span className="text-[11px] text-neutral-500">
              {isFa
                ? `${toPersianDigits(nativeSystemPersianVoices.length)} صدای بومی یافت شد`
                : `${nativeSystemPersianVoices.length} native voices found`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {nativeSystemPersianVoices.map((v) => {
              const isSelected = selectedVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVoice(v.id)}
                  className={`p-3 rounded-lg border text-right cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 text-neutral-100'
                      : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{v.name}</div>
                    <div className="text-[10px] text-neutral-500">{v.lang}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestNativeVoice(v);
                    }}
                    className="p-1 text-amber-400 hover:text-amber-300 shrink-0"
                    title="تست صدا"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
