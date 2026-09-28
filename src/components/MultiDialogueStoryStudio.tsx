import React, { useState } from 'react';
import {
  DialogueCharacter,
  DialogueLine,
  DEFAULT_CHARACTERS,
  MULTI_DIALOGUE_STORIES,
  autoDetectStoryDialogues,
  formatDialogueScript,
  StoryPreset,
} from '../audio/storyDialogueEngine';
import { SFX_CATALOG } from '../audio/sfxBoard';
import { BGM_TRACKS } from '../audio/musicDirector';
import { toPersianDigits } from '../audio/persianUtils';
import { PlaybackState } from '../audio/persianTTS';
import {
  Users,
  Play,
  Pause,
  Square,
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  Volume2,
  Music,
  Bell,
  Wand2,
  BookOpen,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Download,
  Upload,
  FileText,
  Loader2,
} from 'lucide-react';

interface MultiDialogueStoryStudioProps {
  lines: DialogueLine[];
  setLines: React.Dispatch<React.SetStateAction<DialogueLine[]>>;
  characters: DialogueCharacter[];
  setCharacters: React.Dispatch<React.SetStateAction<DialogueCharacter[]>>;
  currentLineIndex: number;
  playbackState: PlaybackState;
  onPlaySequence: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSelectTrack: (trackId: string) => void;
  onPlaySfx: (sfxId: string) => void;
  onOpenExportModal: () => void;
  onDownloadMasterMix: () => void;
  onDownloadRawVoice: () => void;
  onOpenStorySearchModal?: () => void;
  lang: 'fa' | 'en';
}

export const MultiDialogueStoryStudio: React.FC<MultiDialogueStoryStudioProps> = ({
  lines,
  setLines,
  characters,
  setCharacters,
  currentLineIndex,
  playbackState,
  onPlaySequence,
  onPause,
  onResume,
  onStop,
  onSelectTrack,
  onPlaySfx,
  onOpenExportModal,
  onDownloadMasterMix,
  onDownloadRawVoice,
  onOpenStorySearchModal,
  lang,
}) => {
  const isFa = lang === 'fa';
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';

  const [activeStoryModal, setActiveStoryModal] = useState<boolean>(false);
  const [activeCharEditorModal, setActiveCharEditorModal] = useState<boolean>(false);
  const [rawTextImportModal, setRawTextImportModal] = useState<boolean>(false);
  const [rawImportText, setRawImportText] = useState<string>('');
  const [isAiDirecting, setIsAiDirecting] = useState<boolean>(false);
  const [aiDirectError, setAiDirectError] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawImportText(content);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // AI Story Director from pasted / uploaded text
  const handleRunAiDirector = async () => {
    if (!rawImportText.trim()) return;
    setIsAiDirecting(true);
    setAiDirectError(null);
    try {
      const resp = await fetch('/api/direct-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText: rawImportText }),
      });

      if (!resp.ok) {
        throw new Error('خطا در تحلیل متن توسط هوش مصنوعی');
      }

      const data = await resp.json();
      if (data.characters && Array.isArray(data.characters) && data.characters.length > 0) {
        setCharacters(data.characters);
      }
      if (data.dialogueLines && Array.isArray(data.dialogueLines) && data.dialogueLines.length > 0) {
        setLines(data.dialogueLines);
      }
      if (data.recommendedBgm) {
        onSelectTrack(data.recommendedBgm);
      }
      setRawTextImportModal(false);
      setRawImportText('');
    } catch (err: any) {
      console.error('AI Directing error:', err);
      // Fallback to local rule-based parsing
      const parsed = autoDetectStoryDialogues(rawImportText, characters);
      if (parsed.length > 0) {
        setLines(parsed);
        setRawTextImportModal(false);
        setRawImportText('');
      } else {
        setAiDirectError(err.message || 'خطا در تحلیل هوشمند متن');
      }
    } finally {
      setIsAiDirecting(false);
    }
  };

  // Handle line text change
  const handleLineTextChange = (index: number, newText: string) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: newText };
      return copy;
    });
  };

  // Handle line speaker change
  const handleLineSpeakerChange = (index: number, charId: string) => {
    const selectedChar = characters.find((c) => c.id === charId);
    if (!selectedChar) return;

    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        characterId: charId,
        speakerName: selectedChar.name.split(' ')[0],
      };
      return copy;
    });
  };

  // Handle SFX assign
  const handleLineSfxChange = (index: number, sfxId: string) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        sfxCueId: sfxId === 'none' ? undefined : sfxId,
      };
      return copy;
    });
  };

  // Handle BGM shift assign
  const handleLineBgmChange = (index: number, bgmId: string) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        bgmTrackId: bgmId === 'none' ? undefined : bgmId,
      };
      return copy;
    });
  };

  // Add new line
  const handleAddLine = () => {
    const defaultChar = characters[0];
    const newLine: DialogueLine = {
      id: `line_${Date.now()}`,
      characterId: defaultChar.id,
      speakerName: defaultChar.name.split(' ')[0],
      text: '',
      pauseAfterMs: 400,
    };
    setLines((prev) => [...prev, newLine]);
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Move line up/down
  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lines.length - 1) return;

    setLines((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Load a preset story
  const handleLoadStory = (preset: StoryPreset) => {
    setLines(preset.lines);
    onSelectTrack(preset.suggestedMusic);
    setActiveStoryModal(false);
  };

  // Intelligent dialogue parsing from raw pasted text
  const handleRunAutoDetection = () => {
    if (!rawImportText.trim()) return;
    const parsed = autoDetectStoryDialogues(rawImportText, characters);
    if (parsed.length > 0) {
      setLines(parsed);
      setRawTextImportModal(false);
      setRawImportText('');
    }
  };

  // Update a character's voice settings (Pitch / Speed / Volume)
  const handleUpdateCharacter = (charId: string, updates: Partial<DialogueCharacter>) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === charId ? { ...c, ...updates } : c))
    );
  };

  return (
    <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-5 flex flex-col gap-5 shadow-sm">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'استودیوی خوانش چندصدایی و دیالوگ‌های داستانی' : 'Multi-Character Story & Dialogue Studio'}</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFa
              ? 'روایت داستان‌ها با تفکیک گویندگان (راوی، زن، مرد، پیرمرد، کودک)، کنترل اکسنت و تنظیمات اختصاصی هر صدا'
              : 'Dramatize stories with distinct character voices, individual pitch/speed control, and synchronized sound design.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenStorySearchModal && (
            <button
              onClick={onOpenStorySearchModal}
              className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'گنجینه داستان‌های اساطیری' : 'Mythic Story Search'}</span>
            </button>
          )}

          <button
            onClick={() => setRawTextImportModal(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-200 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 border border-amber-500/50 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'کارگردانی دیالوگ‌ها (متن/فایل) ✨' : 'AI Script Director ✨'}</span>
          </button>

          <button
            onClick={() => setActiveStoryModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-amber-300/80 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isFa ? 'داستان‌های آماده' : 'Story Presets'}</span>
          </button>

          <button
            onClick={() => setActiveCharEditorModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>{isFa ? 'تنظیم صداهای شخصیت‌ها' : 'Customize Character Voices'}</span>
          </button>
        </div>
      </div>

      {/* Main Transport Control for Story Narration */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
        <div className="flex items-center gap-3">
          {!isPlaying ? (
            <button
              onClick={isPaused ? onResume : onPlaySequence}
              disabled={lines.length === 0}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isPaused
                  ? isFa
                    ? 'ادامه خوانش داستان'
                    : 'Resume Story'
                  : isFa
                  ? 'اجرای خوانش نریشن چند دیالوگه'
                  : 'Play Multi-Character Story'}
              </span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{isFa ? 'مکث خوانش' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={onStop}
            disabled={playbackState === 'idle'}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs rounded-xl border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Square className="w-3 h-3" />
            <span>{isFa ? 'توقف' : 'Stop'}</span>
          </button>

          {/* DOWNLOAD 1: Master Mix (Voice + Music + SFX) */}
          <button
            onClick={onDownloadMasterMix}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-emerald-600/25 flex items-center gap-1.5 border border-emerald-500/40"
            title="دانلود فایل صوتی کامل داستان با موسیقی متن و افکت‌ها در قالب WAV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isFa ? 'دانلود میکس داستان (WAV)' : 'Download Mix (WAV)'}</span>
          </button>

          {/* DOWNLOAD 2: Raw Dialogue Voices */}
          <button
            onClick={onDownloadRawVoice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-blue-600/25 flex items-center gap-1.5 border border-blue-500/40"
            title="دانلود صدای خام کاراکترها بدون ساز یا افکت در قالب WAV"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isFa ? 'دانلود صدای خام (Raw WAV)' : 'Download Raw (WAV)'}</span>
          </button>
        </div>

        {/* Current Speaking Indicator */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{isFa ? 'تعداد بندهای دیالوگ:' : 'Dialogue Lines:'}</span>
          <span className="font-mono text-amber-400 font-bold">
            {isFa ? toPersianDigits(lines.length) : lines.length}
          </span>
          {currentLineIndex >= 0 && (
            <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {isFa
                  ? `در حال اجرای بند ${toPersianDigits(currentLineIndex + 1)} (${lines[currentLineIndex]?.speakerName})`
                  : `Line ${currentLineIndex + 1} (${lines[currentLineIndex]?.speakerName})`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Dialogue Lines List */}
      <div className="flex flex-col gap-3">
        {lines.map((line, idx) => {
          const char = characters.find((c) => c.id === line.characterId) || characters[0];
          const isCurrentActive = currentLineIndex === idx;

          return (
            <div
              key={line.id || idx}
              className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                isCurrentActive
                  ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-neutral-950/50 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {/* Row 1: Character Selector, SFX Selector, Music Shift, Move/Delete */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <div className="flex items-center gap-2">
                  {/* Line index badge */}
                  <span className="text-[11px] font-mono text-neutral-500 w-5">
                    {isFa ? toPersianDigits(idx + 1) : idx + 1}.
                  </span>

                  {/* Character Speaker Select */}
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: char.color }}
                    />
                    <select
                      value={line.characterId}
                      onChange={(e) => handleLineSpeakerChange(idx, e.target.value)}
                      className="bg-transparent text-xs font-semibold text-neutral-100 focus:outline-none cursor-pointer"
                    >
                      {characters.map((c) => (
                        <option key={c.id} value={c.id} className="bg-neutral-900 text-neutral-200">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Character Voice Characteristics Info */}
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    {isFa ? 'زیروبمی:' : 'Pitch:'}{' '}
                    <strong className="text-amber-400 font-mono">
                      {isFa ? toPersianDigits(char.pitch.toFixed(2)) : char.pitch.toFixed(2)}
                    </strong>{' '}
                    · {isFa ? 'سرعت:' : 'Rate:'}{' '}
                    <strong className="text-amber-400 font-mono">
                      {isFa ? toPersianDigits(char.rate.toFixed(2)) : char.rate.toFixed(2)}x
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Effect Cue Trigger */}
                  <div className="flex items-center gap-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-0.5">
                    <Bell className="w-3 h-3 text-neutral-400" />
                    <span className="text-neutral-500">{isFa ? 'افکت:' : 'SFX:'}</span>
                    <select
                      value={line.sfxCueId || 'none'}
                      onChange={(e) => handleLineSfxChange(idx, e.target.value)}
                      className="bg-transparent text-neutral-300 text-[11px] focus:outline-none cursor-pointer"
                    >
                      <option value="none" className="bg-neutral-900 text-neutral-400">
                        {isFa ? 'بدون افکت' : 'None'}
                      </option>
                      {SFX_CATALOG.map((s) => (
                        <option key={s.id} value={s.id} className="bg-neutral-900 text-neutral-200">
                          {isFa ? s.nameFa : s.nameEn}
                        </option>
                      ))}
                    </select>
                    {line.sfxCueId && (
                      <button
                        onClick={() => onPlaySfx(line.sfxCueId!)}
                        className="text-amber-400 hover:text-amber-300 text-[10px] ml-1"
                        title="تست افکت"
                      >
                        ▶
                      </button>
                    )}
                  </div>

                  {/* Background Music Shift */}
                  <div className="flex items-center gap-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-0.5">
                    <Music className="w-3 h-3 text-neutral-400" />
                    <span className="text-neutral-500">{isFa ? 'موسیقی صحنه:' : 'BGM:'}</span>
                    <select
                      value={line.bgmTrackId || 'none'}
                      onChange={(e) => handleLineBgmChange(idx, e.target.value)}
                      className="bg-transparent text-neutral-300 text-[11px] focus:outline-none cursor-pointer"
                    >
                      <option value="none" className="bg-neutral-900 text-neutral-400">
                        {isFa ? 'ادامه آهنگ قبلی' : 'Keep Current'}
                      </option>
                      {BGM_TRACKS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-neutral-900 text-neutral-200">
                          {isFa ? m.nameFa : m.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reorder & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveLine(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-500 hover:text-neutral-300 disabled:opacity-20"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveLine(idx, 'down')}
                      disabled={idx === lines.length - 1}
                      className="p-1 text-neutral-500 hover:text-neutral-300 disabled:opacity-20"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLine(idx)}
                      className="p-1 text-neutral-500 hover:text-rose-400"
                      title="حذف این بند"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Persian Dialogue Text Area */}
              <div className="relative">
                <textarea
                  value={line.text}
                  onChange={(e) => handleLineTextChange(idx, e.target.value)}
                  placeholder={
                    isFa
                      ? `سخنان و نریشن ${char.name}...`
                      : `Dialogue text for ${char.name}...`
                  }
                  dir="rtl"
                  rows={2}
                  className="w-full bg-neutral-950/70 border border-neutral-800/80 focus:border-amber-500/60 rounded-lg p-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none leading-relaxed resize-y font-sans"
                  style={{
                    fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif",
                    lineHeight: '2.0',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Add Line Button */}
        <button
          onClick={handleAddLine}
          className="py-3 bg-neutral-900/60 hover:bg-neutral-800/80 border border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl text-xs font-semibold text-neutral-300 hover:text-amber-300 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isFa ? '+ افزودن بند دیالوگ جدید' : '+ Add Dialogue Line'}</span>
        </button>
      </div>

      {/* Preset Stories Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            dir="rtl"
          >
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{isFa ? 'داستان‌های چندصدایی نمونه' : 'Story Presets'}</span>
              </h3>
              <button
                onClick={() => setActiveStoryModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              {MULTI_DIALOGUE_STORIES.map((story) => (
                <div
                  key={story.id}
                  className="bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-100">{story.title}</span>
                    <span className="text-[11px] text-amber-400">{story.genre}</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{story.summary}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                    <span className="text-neutral-500">
                      {isFa
                        ? `${toPersianDigits(story.lines.length)} دیالوگ با نقش‌های مختلف`
                        : `${story.lines.length} lines with multiple roles`}
                    </span>
                    <button
                      onClick={() => handleLoadStory(story)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isFa ? 'بارگذاری این داستان' : 'Load Story'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Character Voices Customizer Modal */}
      {activeCharEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            dir="rtl"
          >
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>{isFa ? 'شخصی‌سازی صدا و لحن کاراکترها' : 'Customize Character Voice Profiles'}</span>
              </h3>
              <button
                onClick={() => setActiveCharEditorModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isFa
                  ? 'می‌توانید زیروبمی (Pitch)، سرعت و بلندی صدای هر گوینده را به صورت دلخواه تغییر دهید تا کاراکترهای زن، مرد، پیرمرد، کودک یا راوی شخصیت صوتی متمایز و اکسنت طبیعی داشته باشند.'
                  : 'Customize pitch, rate, and timbre for each character to produce distinct, natural vocal acting.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((c) => (
                  <div
                    key={c.id}
                    className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-xs font-bold text-neutral-100">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">{c.gender}</span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-tight">
                      {c.roleDescription}
                    </p>

                    {/* Pitch Slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-300">
                        <span>{isFa ? 'زیروبمی (Pitch):' : 'Voice Pitch:'}</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {isFa ? toPersianDigits(c.pitch.toFixed(2)) : c.pitch.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.05"
                        value={c.pitch}
                        onChange={(e) =>
                          handleUpdateCharacter(c.id, { pitch: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500">
                        <span>{isFa ? 'بم و مردانه' : 'Deep Male'}</span>
                        <span>{isFa ? 'طبیعی (۱.۰)' : 'Natural'}</span>
                        <span>{isFa ? 'زیر و زنانه/کودک' : 'High Female/Child'}</span>
                      </div>
                    </div>

                    {/* Rate Slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-neutral-300">
                        <span>{isFa ? 'سرعت خوانش:' : 'Speech Rate:'}</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {isFa ? toPersianDigits(c.rate.toFixed(2)) : c.rate.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.6"
                        step="0.05"
                        value={c.rate}
                        onChange={(e) =>
                          handleUpdateCharacter(c.id, { rate: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setActiveCharEditorModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors"
              >
                {isFa ? 'تأیید و ذخیره تنظیمات صدا' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Script Ingestion & AI Screenplay Director Modal */}
      {rawTextImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-100 flex items-center gap-2">
                    <span>{isFa ? 'کارگردانی هوشمند داستان و تفکیک خودکار کاراکترها' : 'AI Story Ingestion & Screenplay Director'}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                      {isFa ? 'هوشمند' : 'AI Directed'}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {isFa
                      ? 'کل متن داستان را پیست کنید یا فایل متنی آپلود نمایید. سیستم راوی، شخصیت‌ها، دیالوگ‌ها و افکت‌ها را خودکار کارگردانی می‌کند.'
                      : 'Paste story text or upload text file. The system detects narrator, characters, dialogues, and sound design.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRawTextImportModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {/* File Upload & Preset Ingestion Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700/80 cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'آپلود فایل متن داستان (.txt, .md, .doc)' : 'Upload Text File'}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Sample Story Ingestion Chips */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className="text-[11px] font-medium hidden sm:inline">{isFa ? 'نمونه‌های آماده:' : 'Sample Stories:'}</span>
                  <button
                    onClick={() =>
                      setRawImportText(
                        `راوی: در روزگاری دور، در میان کوه‌های سربه فلک کشیده البرز، نبردی سهمگین در شرف آغاز بود. سپاهیان در دو سوی دشت صف کشیده بودند و باد تندی گرد و خاک به پا می‌کرد.\n\nسهراب: ای پهلوان سالخورده! نام و تبار خود را بازگوی تا مبادا تیغ من بر تن پدری که سال‌ها در حسرت دیدارش بوده‌ام فرود آید!\n\nرستم: خاموش باش ای جوان ناآزموده! رستم فریب این چرب‌زبانی‌ها را نمی‌خورد. شمشیر برکش که امروز میدان نبرد، سرنوشت را رقم خواهد زد!\n\nراوی: صدای چکاچک شمشیرها و غرش اسبان در دره پیچید و آسمان تیره و تار گشت.`
                      )
                    }
                    className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 text-amber-300/90 rounded border border-neutral-700/60 text-[11px] transition-colors"
                  >
                    {isFa ? 'نمونه شاهنامه (رستم و سهراب)' : 'Rostam & Sohrab'}
                  </button>
                  <button
                    onClick={() =>
                      setRawImportText(
                        `راوی: در بیشه‌ای خرم و سرسبز، حیوانات در سایه آرامش روزگار می‌گذراندند، اما شیری درنده هر روز یکی از آنان را شکار می‌کرد. سرانجام خرگوشی باهوش قدم پیش نهاد.\n\nخرگوش: ای یاران، غم مخورید که من با تدبیر، ریشه این ستم را خواهم خشکاند!\n\nشیر: چرا دیر آمدی ای خرگوش ناتوان؟! خشم من گرسنگی مرا دوچندان کرده است!\n\nخرگوش: پادشاها! خرگوشی دیگر برای تو می‌آوردم که شیری دیگر در چاه راه بر ما بست و ادعای شهریاری کرد!\n\nراوی: شیر از فرط غرور به چاه نگریست و عکس خود را دید و در آب جست و غرق شد.`
                      )
                    }
                    className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 text-amber-300/90 rounded border border-neutral-700/60 text-[11px] transition-colors"
                  >
                    {isFa ? 'نمونه کلیله و دمنه (شیر و خرگوش)' : 'Kelileh & Demneh'}
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{isFa ? 'متن کامل داستان یا نمایشنامه:' : 'Story or Screenplay Text:'}</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {rawImportText ? `${rawImportText.split(/\s+/).filter(Boolean).length} کلمه` : ''}
                  </span>
                </div>
                <textarea
                  value={rawImportText}
                  onChange={(e) => setRawImportText(e.target.value)}
                  placeholder={
                    isFa
                      ? 'متن داستان خود را اینجا پیست کنید (حتی یک داستان طولانی یا فصلی از یک کتاب که شامل راوی و چند دیالوگ است)...\n\nسیستم به صورت هوشمند راوی را برای بخش‌های روایی و شخصیت‌ها را برای جملات گفتاری تشخیص می‌دهد.'
                      : 'Paste your story or script here...'
                  }
                  rows={10}
                  className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                  style={{
                    fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif",
                  }}
                />
              </div>

              {/* AI Processing Status or Error Banner */}
              {isAiDirecting && (
                <div className="p-4 bg-amber-950/50 border border-amber-500/40 rounded-xl flex items-center gap-3 text-amber-300 text-xs animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {isFa
                        ? 'هوش مصنوعی در حال تحلیل متن، استخراج شخصیت‌ها، تفکیک راوی و کارگردانی صوتی صحنه است...'
                        : 'AI Director is analyzing characters, dialogue, and dramatic sound cues...'}
                    </span>
                    <span className="text-[11px] text-amber-400/80">
                      {isFa ? 'این فرآیند چند ثانیه زمان می‌برد.' : 'Please wait a moment.'}
                    </span>
                  </div>
                </div>
              )}

              {aiDirectError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  {aiDirectError}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/70">
              <button
                onClick={() => setRawTextImportModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>

              <div className="flex items-center gap-2">
                {/* Fast Local Rule-Based Fallback */}
                <button
                  onClick={handleRunAutoDetection}
                  disabled={!rawImportText.trim() || isAiDirecting}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isFa ? 'تفکیک سریع محلی (آفلاین)' : 'Fast Local Parse'}
                </button>

                {/* Primary AI Director Button */}
                <button
                  onClick={handleRunAiDirector}
                  disabled={!rawImportText.trim() || isAiDirecting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isAiDirecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-neutral-950" />
                  )}
                  <span>
                    {isFa ? 'کارگردانی هوشمند داستان با هوش مصنوعی ✨' : 'Direct Script with AI ✨'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
