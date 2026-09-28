/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header, StudioTab } from './components/Header';
import { PersianEditor } from './components/PersianEditor';
import { VoiceController, AudioMixMode } from './components/VoiceController';
import { PersianTalentSelector } from './components/PersianTalentSelector';
import { MultiDialogueStoryStudio } from './components/MultiDialogueStoryStudio';
import { SoundDirectorConsole } from './components/SoundDirectorConsole';
import { SFXSoundboard } from './components/SFXSoundboard';
import { StudioMixerBar } from './components/StudioMixerBar';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { GuideTab } from './components/GuideTab';
import { AudioExportModal } from './components/AudioExportModal';
import { StorySearchModal } from './components/StorySearchModal';

import { AudioEngine, ReverbRoomType } from './audio/audioEngine';
import { MusicDirector, BGM_TRACKS } from './audio/musicDirector';
import { SFXBoard, SFX_CATALOG } from './audio/sfxBoard';
import { PersianTTSEngine, TTSVoiceOption, PlaybackState, CueMarker } from './audio/persianTTS';
import { PERSIAN_PRESETS, PersianScriptPreset } from './audio/persianUtils';
import { triggerFileDownload, exportMasterWavAudio } from './audio/audioDownloader';
import {
  DEFAULT_CHARACTERS,
  MULTI_DIALOGUE_STORIES,
  DialogueCharacter,
  DialogueLine,
} from './audio/storyDialogueEngine';
import { PersianVoiceTalent } from './audio/persianPhonetics';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [activeTab, setActiveTab] = useState<StudioTab>('studio');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isStorySearchModalOpen, setIsStorySearchModalOpen] = useState<boolean>(false);

  // Single Narrator Script: Default Hafez
  const defaultPreset = PERSIAN_PRESETS[0];
  const [text, setText] = useState<string>(defaultPreset.text);
  const [cueMarkers, setCueMarkers] = useState<CueMarker[]>([
    { id: '0-daf_hit', wordIndex: 0, sfxId: 'daf_hit' },
    { id: '11-chime_bell', wordIndex: 11, sfxId: 'chime_bell' },
  ]);

  // Multi-Dialogue Story Engine State
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>(
    MULTI_DIALOGUE_STORIES[0].lines
  );
  const [characters, setCharacters] = useState<DialogueCharacter[]>(DEFAULT_CHARACTERS);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);

  // Audio Mix Mode: 'master' (Speech + Music + SFX + Reverb) vs 'raw' (Clean dry speech only)
  const [mixMode, setMixMode] = useState<AudioMixMode>('master');

  // Engines Singletons
  const audioEngine = useRef<AudioEngine>(AudioEngine.getInstance()).current;
  const musicDirector = useRef<MusicDirector>(MusicDirector.getInstance()).current;
  const sfxBoard = useRef<SFXBoard>(SFXBoard.getInstance()).current;
  const ttsEngine = useRef<PersianTTSEngine>(PersianTTSEngine.getInstance()).current;

  // TTS State
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('arash_radio');
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);

  // Background Music State
  const [currentTrackId, setCurrentTrackId] = useState<string>(defaultPreset.suggestedMusic);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.45);
  const [autoDucking, setAutoDuckingState] = useState<boolean>(true);
  const [duckingDepth, setDuckingDepthState] = useState<number>(0.25);
  const [bpm, setBpmState] = useState<number>(76);

  // Acoustics & EQ
  const [reverbRoom, setReverbRoomState] = useState<ReverbRoomType>('studio');
  const [reverbWet, setReverbWetState] = useState<number>(0.25);
  const [lowEq, setLowEq] = useState<number>(0);
  const [midEq, setMidEq] = useState<number>(0);
  const [highEq, setHighEq] = useState<number>(0);

  // Sound Effects & Master Mixer
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.85);
  const [masterVolume, setMasterVolumeState] = useState<number>(0.9);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Sync TTS Callbacks and Voice loading
  useEffect(() => {
    const refreshVoices = () => {
      const list = ttsEngine.loadVoices();
      setVoices(list);
      setSelectedVoiceId(ttsEngine.selectedVoiceId);
    };

    refreshVoices();

    // Listen to voice change events from browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }

    ttsEngine.setCallbacks(
      (state) => {
        setPlaybackState(state);
      },
      (_charIdx, wordIdx) => {
        setCurrentWordIndex(wordIdx);
      },
      (lineIdx) => {
        setCurrentLineIndex(lineIdx);
      }
    );
  }, [ttsEngine]);

  // Sync TTS parameters to engine
  useEffect(() => {
    ttsEngine.rate = rate;
    ttsEngine.pitch = pitch;
    ttsEngine.volume = voiceVolume;
    ttsEngine.selectedVoiceId = selectedVoiceId;
  }, [rate, pitch, voiceVolume, selectedVoiceId, ttsEngine]);

  // Sync BGM parameters to engine
  useEffect(() => {
    audioEngine.setBgmVolume(bgmVolume);
  }, [bgmVolume, audioEngine]);

  useEffect(() => {
    audioEngine.autoDuckingEnabled = autoDucking;
    audioEngine.duckingDepth = duckingDepth;
  }, [autoDucking, duckingDepth, audioEngine]);

  useEffect(() => {
    musicDirector.setBpm(bpm);
  }, [bpm, musicDirector]);

  // Sync Mix Mode to Audio Engine
  useEffect(() => {
    audioEngine.setMixMode(mixMode);
    if (mixMode === 'raw' && isBgmPlaying) {
      musicDirector.stop();
      setIsBgmPlaying(false);
    }
  }, [mixMode, audioEngine, musicDirector, isBgmPlaying]);

  // Sync SFX parameters to engine
  useEffect(() => {
    audioEngine.setSfxVolume(sfxVolume);
  }, [sfxVolume, audioEngine]);

  // Sync Master Volume
  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume, audioEngine]);

  // Sync EQ
  useEffect(() => {
    audioEngine.setEq(lowEq, midEq, highEq);
  }, [lowEq, midEq, highEq, audioEngine]);

  // Sync Reverb
  useEffect(() => {
    audioEngine.loadSyntheticImpulseResponse(reverbRoom);
    audioEngine.setReverbWet(reverbWet);
  }, [reverbRoom, reverbWet, audioEngine]);

  // Recording timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Spacebar: Play/Pause speech
      if (e.code === 'Space') {
        e.preventDefault();
        if (playbackState === 'playing') {
          handlePause();
        } else if (playbackState === 'paused') {
          handleResume();
        } else {
          if (activeTab === 'story') {
            handlePlayStorySequence();
          } else {
            handlePlaySpeech();
          }
        }
      }

      // Escape: Stop speech and BGM
      if (e.code === 'Escape') {
        e.preventDefault();
        handleStopSpeech();
        musicDirector.stop();
        setIsBgmPlaying(false);
      }

      // Keys 1 to =: Trigger SFX
      const matchingSfx = SFX_CATALOG.find((s) => s.keyboardShortcut === e.key);
      if (matchingSfx) {
        e.preventDefault();
        handlePlaySfx(matchingSfx.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState, text, cueMarkers, activeTab, dialogueLines, characters]);

  // ================= Speech Handlers =================
  const handlePlaySpeech = async () => {
    if (!text.trim()) return;

    await audioEngine.init();

    // In master mode, guarantee accompaniment soundtrack plays and ducks smoothly!
    if (mixMode === 'master') {
      audioEngine.setMixMode('master');
      if (!isBgmPlaying) {
        await musicDirector.start(currentTrackId);
        setIsBgmPlaying(true);
      }
    } else {
      // In raw mode, ensure clean dry speech without music or SFX
      audioEngine.setMixMode('raw');
      if (isBgmPlaying) {
        musicDirector.stop();
        setIsBgmPlaying(false);
      }
    }

    await ttsEngine.speak(text, mixMode === 'master' ? cueMarkers : []);
  };

  const handleTestVoice = async () => {
    await audioEngine.init();
    const selected = voices.find((v) => v.id === selectedVoiceId);
    if (selected && selected.talentProfile) {
      handleTestTalent(selected.talentProfile);
    } else {
      await ttsEngine.speak('سلام، این صدای گوینده با اکسنت فارسی و تنظیمات فعلی است.');
    }
  };

  const handleTestTalent = async (talent: PersianVoiceTalent) => {
    await audioEngine.init();
    setSelectedVoiceId(talent.id);

    const testPhrases: Record<string, string> = {
      arash_radio: 'درود بر شما، من آرش هستم، راوی ارشد رادیو و کتاب‌های صوتی با لهجه معیار فارسی.',
      niloufar_audiobook: 'سلام، من نیلوفر هستم، گوینده متون داستانی، رمان و شعر با بیانی شفاف و دلنشین.',
      sohrab_epic: 'من سهرابم! راوی آوردگاه‌های حماسی، نبردهای کهن و شاهنامه فردوسی بزرگ.',
      farzaneh_poetic: 'درود، من فرزانه هستم، همدم ابیات عرفانی، غزلیات حافظ و اشعار ماندگار ایران.',
      ostad_pirnia: 'فرزندم، من پیرنیا هستم، با سال‌ها تجربه در روایت تاریخ، حکمت و داستان‌های پندآموز.',
      pouyan_podcast: 'سلام رفقا! من پویان هستم، صدای جوان و پرانرژی برای پادکست‌ها و رسانه‌های دیجیتال.',
    };

    const phrase = testPhrases[talent.id] || 'سلام، این صدای گوینده فارسی با اکسنت استاندارد است.';
    // Speaks with natural human speech model configured with talent parameters
    await ttsEngine.speak(phrase, []);
  };

  const handleTestNativeVoice = async (voice: TTSVoiceOption) => {
    await audioEngine.init();
    setSelectedVoiceId(voice.id);
    await ttsEngine.speak('سلام، این صدای بومی فارسی سیستم‌عامل شماست.', []);
  };

  const handlePlayStorySequence = async () => {
    if (!dialogueLines.length) return;

    await audioEngine.init();

    if (mixMode === 'master') {
      audioEngine.setMixMode('master');
      if (!isBgmPlaying) {
        await musicDirector.start(currentTrackId);
        setIsBgmPlaying(true);
      }
    } else {
      audioEngine.setMixMode('raw');
      if (isBgmPlaying) {
        musicDirector.stop();
        setIsBgmPlaying(false);
      }
    }

    await ttsEngine.speakDialogueSequence(dialogueLines, characters, (newBgm) => {
      if (mixMode === 'master') {
        handleSelectTrack(newBgm);
      }
    });
  };

  const handlePause = () => {
    ttsEngine.pause();
  };

  const handleResume = () => {
    ttsEngine.resume();
  };

  const handleStopSpeech = () => {
    ttsEngine.stop();
    setCurrentLineIndex(-1);
    if (mixMode === 'master' && isBgmPlaying) {
      audioEngine.triggerDucking(false);
    }
  };

  // ================= Music Handlers =================
  const handleSelectTrack = async (trackId: string) => {
    setCurrentTrackId(trackId);
    const track = BGM_TRACKS.find((t) => t.id === trackId);
    if (track) setBpmState(track.defaultBpm);

    if (isBgmPlaying) {
      await musicDirector.start(trackId);
    }
  };

  const handleToggleBgm = async () => {
    if (isBgmPlaying) {
      musicDirector.stop();
      setIsBgmPlaying(false);
    } else {
      await musicDirector.start(currentTrackId);
      setIsBgmPlaying(true);
    }
  };

  // ================= SFX Handler =================
  const handlePlaySfx = (id: string) => {
    sfxBoard.play(id);
  };

  // ================= Recording & Direct Download Handlers =================
  const handleToggleRecording = async () => {
    if (isRecording) {
      const result = await audioEngine.stopRecording();
      setIsRecording(false);
      if (result) {
        setRecordedAudioUrl(result.url);
      }
    } else {
      await audioEngine.init();
      const started = audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordedAudioUrl(null);
      }
    }
  };

  const handleDownloadAudio = () => {
    if (!recordedAudioUrl) return;
    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `خوانش_فارسی_آواگردان_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Start Record & Auto-Download Execution
  const handleStartRecordAndExport = async (includeMusic: boolean) => {
    await audioEngine.init();
    setRecordedAudioUrl(null);

    // If includeMusic, start BGM with ducking. If not, stop BGM
    if (includeMusic) {
      if (!isBgmPlaying) {
        await musicDirector.start(currentTrackId);
        setIsBgmPlaying(true);
      }
    } else {
      if (isBgmPlaying) {
        musicDirector.stop();
        setIsBgmPlaying(false);
      }
    }

    // Start audio recorder
    const started = audioEngine.startRecording();
    if (!started) return;
    setIsRecording(true);

    // Speak text or story sequence
    if (activeTab === 'story') {
      await ttsEngine.speakDialogueSequence(dialogueLines, characters, (newBgm) => {
        if (includeMusic) handleSelectTrack(newBgm);
      });
    } else {
      await ttsEngine.speak(text, cueMarkers);
    }

    // Finished speaking: stop recording and trigger automatic download!
    const result = await audioEngine.stopRecording();
    setIsRecording(false);

    if (result) {
      setRecordedAudioUrl(result.url);
      triggerFileDownload(result.blob, `خوانش_فارسی_آواگردان_${Date.now()}.webm`);
    }
  };

  const handleFastExportWav = async (includeMusic: boolean) => {
    await audioEngine.init();
    const ctx = audioEngine.getContext() || new (window.AudioContext || (window as any).webkitAudioContext)();

    let speechBuffer: AudioBuffer;
    if (activeTab === 'story') {
      speechBuffer = await ttsEngine.renderStoryToAudioBuffer(dialogueLines, characters, ctx);
    } else {
      speechBuffer = await ttsEngine.renderToAudioBuffer(
        text,
        selectedVoiceId,
        pitch,
        rate,
        voiceVolume,
        ctx
      );
    }

    const filename =
      activeTab === 'story'
        ? `داستان_چند_دیالوگه_فارسی_${Date.now()}.wav`
        : `خوانش_فارسی_آواگردان_${Date.now()}.wav`;

    const res = await exportMasterWavAudio(speechBuffer, {
      includeMusic,
      musicTrackId: currentTrackId,
      bgmVolume,
      duckingDepth,
      sfxCues: includeMusic ? ttsEngine.lastRenderedSfxCues : undefined,
      filename,
    });

    setRecordedAudioUrl(res.url);
  };

  const handleDownloadMasterMix = async () => {
    await handleFastExportWav(true);
  };

  const handleDownloadRawVoice = async () => {
    await handleFastExportWav(false);
  };

  const handleStopAndSaveNow = async () => {
    ttsEngine.stop();
    const result = await audioEngine.stopRecording();
    setIsRecording(false);

    if (result) {
      setRecordedAudioUrl(result.url);
      triggerFileDownload(result.blob, `خوانش_فارسی_آواگردان_${Date.now()}.webm`);
    }
  };

  // Preset Selection
  const handleSelectPreset = (preset: PersianScriptPreset) => {
    setText(preset.text);
    setCurrentTrackId(preset.suggestedMusic);
    const track = BGM_TRACKS.find((t) => t.id === preset.suggestedMusic);
    if (track) setBpmState(track.defaultBpm);

    const words = preset.text.trim().split(/\s+/);
    const newCues: CueMarker[] = [];
    if (preset.suggestedSfx[0] && words.length > 0) {
      newCues.push({
        id: `0-${preset.suggestedSfx[0]}`,
        wordIndex: 0,
        sfxId: preset.suggestedSfx[0],
      });
    }
    if (preset.suggestedSfx[1] && words.length > 8) {
      const midPoint = Math.floor(words.length / 2);
      newCues.push({
        id: `${midPoint}-${preset.suggestedSfx[1]}`,
        wordIndex: midPoint,
        sfxId: preset.suggestedSfx[1],
      });
    }
    setCueMarkers(newCues);
    setActiveTab('studio');
  };

  // Story Selection from Mythic Story Explorer
  const handleSelectStoryForNarrator = (storyText: string, suggestedMusic: string, suggestedSfx: string[]) => {
    setText(storyText);
    if (suggestedMusic) {
      handleSelectTrack(suggestedMusic);
    }
    if (suggestedSfx && suggestedSfx.length > 0) {
      const newCues: CueMarker[] = [
        { id: `0-${suggestedSfx[0]}`, wordIndex: 0, sfxId: suggestedSfx[0] },
      ];
      if (suggestedSfx[1]) {
        const words = storyText.trim().split(/\s+/);
        const mid = Math.floor(words.length / 2);
        newCues.push({ id: `${mid}-${suggestedSfx[1]}`, wordIndex: mid, sfxId: suggestedSfx[1] });
      }
      setCueMarkers(newCues);
    }
    setActiveTab('studio');
  };

  const handleSelectStoryForDialogue = async (storyText: string) => {
    setActiveTab('story');
    try {
      const resp = await fetch('/api/direct-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.characters && Array.isArray(data.characters) && data.characters.length > 0) {
          setCharacters(data.characters);
        }
        if (data.dialogueLines && Array.isArray(data.dialogueLines) && data.dialogueLines.length > 0) {
          setDialogueLines(data.dialogueLines);
        }
        if (data.recommendedBgm) {
          handleSelectTrack(data.recommendedBgm);
        }
      }
    } catch (err) {
      console.error('Failed to auto-direct story:', err);
    }
  };

  const isFa = lang === 'fa';

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200"
      dir={isFa ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif" }}
    >
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        recordedAudioUrl={recordedAudioUrl}
        onDownloadAudio={() => setIsExportModalOpen(true)}
        onOpenStorySearchModal={() => setIsStorySearchModalOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Sub-navigation bar on mobile */}
        <div className="flex lg:hidden items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? 'خوانش تک‌گوینده' : 'Single Narration'}
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'story'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? 'روایت چند دیالوگه' : 'Story Dialogues'}
          </button>
          <button
            onClick={() => setActiveTab('director')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'director'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? 'موسیقی متن' : 'Music Director'}
          </button>
          <button
            onClick={() => setActiveTab('sfx')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'sfx'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? 'افکت‌های صوتی' : 'SFX Board'}
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isFa ? 'راهنما و اشعار' : 'Guide & Presets'}
          </button>
        </div>

        {/* Tab 1: Single Narrator Studio */}
        {activeTab === 'studio' && (
          <div className="flex flex-col gap-6">
            {/* Dedicated Persian Voice Talents Gallery */}
            <PersianTalentSelector
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={(id) => setSelectedVoiceId(id)}
              onTestTalent={handleTestTalent}
              onTestNativeVoice={handleTestNativeVoice}
              lang={lang}
            />

            {/* Persian Text Editor & Karaoke Tracker with Download Button */}
            <PersianEditor
              text={text}
              setText={setText}
              lang={lang}
              playbackState={playbackState}
              currentWordIndex={currentWordIndex}
              cueMarkers={cueMarkers}
              setCueMarkers={setCueMarkers}
              rate={rate}
              onOpenPresets={() => setIsPresetModalOpen(true)}
              onQuickPlay={handlePlaySpeech}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            {/* Voice & Speech Controls with Download Button */}
            <VoiceController
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              setSelectedVoiceId={setSelectedVoiceId}
              rate={rate}
              setRate={setRate}
              pitch={pitch}
              setPitch={setPitch}
              volume={voiceVolume}
              setVolume={setVoiceVolume}
              playbackState={playbackState}
              onPlay={handlePlaySpeech}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStopSpeech}
              onTestVoice={handleTestVoice}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onDownloadMasterMix={handleDownloadMasterMix}
              onDownloadRawVoice={handleDownloadRawVoice}
              mixMode={mixMode}
              setMixMode={setMixMode}
              lang={lang}
            />

            {/* Quick SFX Trigger Row */}
            <div className="bg-neutral-900/40 rounded-xl border border-neutral-800/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-200">
                  {isFa ? 'کلیدهای سریع صداگذاری هنگام پخش (کلیدهای ۱ تا ۸ کیبورد):' : 'Live SFX Triggers (Keys 1-8):'}
                </span>
                <button
                  onClick={() => setActiveTab('sfx')}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  {isFa ? 'مشاهده همه ۱۲ افکت صوتی ←' : 'View Full SFX Board →'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {SFX_CATALOG.slice(0, 8).map((sfx) => (
                  <button
                    key={sfx.id}
                    onClick={() => handlePlaySfx(sfx.id)}
                    className="p-2 bg-neutral-950/70 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs text-neutral-200 flex flex-col items-center gap-1 transition-all group"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sfx.color }}
                    />
                    <span className="truncate w-full text-center group-hover:text-amber-300">
                      {isFa ? sfx.nameFa.split(' ')[0] : sfx.nameEn.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      [{sfx.keyboardShortcut}]
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Dialogue Story Studio */}
        {activeTab === 'story' && (
          <MultiDialogueStoryStudio
            lines={dialogueLines}
            setLines={setDialogueLines}
            characters={characters}
            setCharacters={setCharacters}
            currentLineIndex={currentLineIndex}
            playbackState={playbackState}
            onPlaySequence={handlePlayStorySequence}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStopSpeech}
            onSelectTrack={handleSelectTrack}
            onPlaySfx={handlePlaySfx}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onDownloadMasterMix={handleDownloadMasterMix}
            onDownloadRawVoice={handleDownloadRawVoice}
            onOpenStorySearchModal={() => setIsStorySearchModalOpen(true)}
            lang={lang}
          />
        )}

        {/* Tab 3: Music Director Console */}
        {activeTab === 'director' && (
          <SoundDirectorConsole
            currentTrackId={currentTrackId}
            onSelectTrack={handleSelectTrack}
            isBgmPlaying={isBgmPlaying}
            onToggleBgm={handleToggleBgm}
            bgmVolume={bgmVolume}
            setBgmVolume={setBgmVolumeState}
            autoDucking={autoDucking}
            setAutoDucking={setAutoDuckingState}
            duckingDepth={duckingDepth}
            setDuckingDepth={setDuckingDepthState}
            bpm={bpm}
            setBpm={setBpmState}
            reverbRoom={reverbRoom}
            setReverbRoom={setReverbRoomState}
            reverbWet={reverbWet}
            setReverbWet={setReverbWetState}
            lowEq={lowEq}
            midEq={midEq}
            highEq={highEq}
            setEq={(l, m, h) => {
              setLowEq(l);
              setMidEq(m);
              setHighEq(h);
            }}
            lang={lang}
          />
        )}

        {/* Tab 4: SFX Soundboard */}
        {activeTab === 'sfx' && (
          <SFXSoundboard
            onPlaySfx={handlePlaySfx}
            sfxVolume={sfxVolume}
            setSfxVolume={setSfxVolumeState}
            lang={lang}
          />
        )}

        {/* Tab 5: Presets & Guide */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-6">
            <GuideTab lang={lang} />
            <div className="pt-2">
              <button
                onClick={() => setIsPresetModalOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl transition-colors shadow-md"
              >
                {isFa ? 'باز کردن ویترین اشعار، متون و نریشن‌های تک‌گوینده' : 'Open Script & Poetry Library'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Studio Mixer & Live Spectrum Visualizer */}
      <StudioMixerBar
        engine={audioEngine}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolumeState}
        voiceVolume={voiceVolume}
        setVoiceVolume={setVoiceVolume}
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolumeState}
        sfxVolume={sfxVolume}
        setSfxVolume={setSfxVolumeState}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        onStopRecording={handleToggleRecording}
        recordedAudioUrl={recordedAudioUrl}
        onDownloadAudio={() => setIsExportModalOpen(true)}
        lang={lang}
      />

      {/* Presets Library Modal */}
      <PresetLibraryModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        lang={lang}
      />

      {/* Audio Export & Download Modal */}
      <AudioExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        onFastExportWav={handleFastExportWav}
        onStartRecordAndExport={handleStartRecordAndExport}
        onStopAndSaveNow={handleStopAndSaveNow}
        recordedAudioUrl={recordedAudioUrl}
        onDownloadExisting={handleDownloadAudio}
        initialMixMode={mixMode}
        lang={lang}
      />

      {/* Mythological & Literary Story Explorer & Search Modal */}
      <StorySearchModal
        isOpen={isStorySearchModalOpen}
        onClose={() => setIsStorySearchModalOpen(false)}
        onSelectForNarrator={handleSelectStoryForNarrator}
        onSelectForDialogue={handleSelectStoryForDialogue}
        lang={lang}
      />
    </div>
  );
}
