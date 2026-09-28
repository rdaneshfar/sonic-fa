/**
 * Sound Director Background Music Engine.
 * 100% royalty-free, copyright-free procedural music generated locally via Web Audio API.
 * Zero external APIs, zero audio asset downloads, full offline capability.
 */

import { AudioEngine } from './audioEngine';

export interface BGMTrackInfo {
  id: string;
  nameFa: string;
  nameEn: string;
  genreFa: string;
  mood: string;
  defaultBpm: number;
  descriptionFa: string;
}

export const BGM_TRACKS: BGMTrackInfo[] = [
  {
    id: 'persian_modal',
    nameFa: 'نوای سنتور و نغمه اصفهان',
    nameEn: 'Persian Santur & Modal Dastgah',
    genreFa: 'موسیقی سنتی و اصیل ایرانی',
    mood: 'عرفانی، عمیق، دلنشین',
    defaultBpm: 76,
    descriptionFa: 'ساز سنتور همراه با مضراب‌های متوالی و پرطنین در دستگاه اصفهان و شور، با همراهی دمِ تنبک و پد عرفانی.',
  },
  {
    id: 'cinematic_ambient',
    nameFa: 'سینمایی و حماسی اتمسفریک',
    nameEn: 'Cinematic Ambient Strings & Drone',
    genreFa: 'موسیقی متن سینمایی',
    mood: 'باشکوه، هیجان‌انگیز، جدی',
    defaultBpm: 68,
    descriptionFa: 'پدهای زهی گسترده با ساب‌بیس گرم سینمایی و هارمونی‌های عمیق، مناسب نریشن‌های پرکشش و احساسی.',
  },
  {
    id: 'warm_piano',
    nameFa: 'پیانوی آرامش‌بخش و گرم',
    nameEn: 'Peaceful Warm Piano & Lo-Fi',
    genreFa: 'آرامش‌بخش و نئوکلاسیک',
    mood: 'امیدبخش، احساسی، دلگرم‌کننده',
    defaultBpm: 72,
    descriptionFa: 'آکوردهای گرم پیانو با هارمونی‌های ماژور۷ و رزونانس لطیف، عالی برای داستان‌های الهام‌بخش و اشعار.',
  },
  {
    id: 'ethereal_ambient',
    nameFa: 'مستند کیهان و طبیعت ژرف',
    nameEn: 'Ethereal Documentary & Cosmos',
    genreFa: 'مستند و علمی',
    mood: 'تفکربرانگیز، رازآلود، گسترده',
    defaultBpm: 60,
    descriptionFa: 'فضاسازی کریستالی با نوسان ملایم فرکانس‌ها و بلورهای شناور، مناسب مستندهای علمی و محیط‌زیست.',
  },
  {
    id: 'modern_podcast',
    nameFa: 'پادکست و روایت مدرن',
    nameEn: 'Modern Narrative & Tech Podcast',
    genreFa: 'پادکست، تکنولوژی و بیزینس',
    mood: 'پویا، نوآورانه، جذاب',
    defaultBpm: 94,
    descriptionFa: 'آرپژهای ریتمیک مدرن با بیس‌لاین منسجم و پالس ملایم، مناسب ارائه‌های تجاری، آموزشی و اینتروی پادکست.',
  },
  {
    id: 'meditation_432',
    nameFa: 'مدیتیشن و تنفس ذهن ۴۳۲ هرتز',
    nameEn: 'Deep Meditation & Sound Bowl',
    genreFa: 'مدیتیشن و ذهن‌آگاهی',
    mood: 'آرامش مطلق، رهایی، سکوت درونی',
    defaultBpm: 50,
    descriptionFa: 'کاسه تبتی با نوسان رزونانس ۴۳۲ هرتز و هارمونیک‌های زنگ‌مانند برای تمرکز عمیق و آرامش روان.',
  },
];

export class MusicDirector {
  private static instance: MusicDirector | null = null;
  private engine: AudioEngine;

  public currentTrackId: string = 'persian_modal';
  public isPlaying: boolean = false;
  public bpm: number = 76;

  private timerId: number | null = null;
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private lookaheadMs: number = 25;
  private scheduleAheadTimeSec: number = 0.1;

  // Active continuous drone nodes to stop cleanly
  private activeDrones: OscillatorNode[] = [];

  private constructor() {
    this.engine = AudioEngine.getInstance();
  }

  public static getInstance(): MusicDirector {
    if (!MusicDirector.instance) {
      MusicDirector.instance = new MusicDirector();
    }
    return MusicDirector.instance;
  }

  public async start(trackId?: string) {
    if (trackId) {
      this.currentTrackId = trackId;
      const track = BGM_TRACKS.find((t) => t.id === trackId);
      if (track) this.bpm = track.defaultBpm;
    }

    const ctx = await this.engine.init();
    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    this.startContinuousDrone(ctx);
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    // Stop and clear continuous drones
    this.activeDrones.forEach((d) => {
      try {
        d.stop();
        d.disconnect();
      } catch (_) {
        // already stopped
      }
    });
    this.activeDrones = [];
  }

  public setBpm(val: number) {
    this.bpm = Math.max(40, Math.min(180, val));
  }

  /**
   * Sound engine lookahead clock scheduler for precise Web Audio playback
   */
  private scheduler = () => {
    if (!this.isPlaying || !this.engine.ctx) return;

    while (this.nextNoteTime < this.engine.ctx.currentTime + this.scheduleAheadTimeSec) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerId = window.setTimeout(this.scheduler, this.lookaheadMs);
  };

  private advanceStep() {
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = 0.25 * secondsPerBeat; // 16th notes
    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 64; // 4 bars loop
  }

  private scheduleStep(step: number, time: number) {
    const ctx = this.engine.ctx;
    const dest = this.engine.bgmGain;
    if (!ctx || !dest) return;

    switch (this.currentTrackId) {
      case 'persian_modal':
        this.stepPersianModal(ctx, dest, step, time);
        break;
      case 'cinematic_ambient':
        this.stepCinematic(ctx, dest, step, time);
        break;
      case 'warm_piano':
        this.stepWarmPiano(ctx, dest, step, time);
        break;
      case 'ethereal_ambient':
        this.stepEthereal(ctx, dest, step, time);
        break;
      case 'modern_podcast':
        this.stepPodcast(ctx, dest, step, time);
        break;
      case 'meditation_432':
        this.stepMeditation(ctx, dest, step, time);
        break;
    }
  }

  /**
   * 1. Persian Modal & Santur:
   * Authentic Isfahan / Shur modal scale notes: D4 (293.66), Eb4 (311.13), F#4 (369.99), G4 (392.00), A4 (440.00), Bb4 (466.16), C5 (523.25), D5 (587.33)
   */
  private stepPersianModal(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    const scale = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33];

    // Santur melodic plucks on specific 16th note steps
    const santurPattern: Record<number, number> = {
      0: 0, // D4
      2: 2, // F#4
      4: 3, // G4
      6: 4, // A4
      8: 3, // G4
      10: 2, // F#4
      12: 1, // Eb4
      14: 0, // D4
      16: 4, // A4
      18: 5, // Bb4
      20: 7, // D5
      22: 6, // C5
      24: 5, // Bb4
      26: 4, // A4
      28: 3, // G4
      30: 2, // F#4
      32: 0,
      34: 3,
      36: 4,
      38: 7,
      40: 6,
      42: 5,
      44: 4,
      46: 2,
      48: 1,
      50: 2,
      52: 0,
      56: 0,
      60: 4,
    };

    if (santurPattern[step] !== undefined) {
      const noteFreq = scale[santurPattern[step]];
      this.playSanturNote(ctx, dest, noteFreq, time);
    }

    // Gentle Tombak pulse on beat 1 and beat 3 (steps 0, 8, 16, 24, 32, 40, 48, 56)
    if (step % 8 === 0) {
      this.playTombakPulse(ctx, dest, time, step % 16 === 0 ? 1.0 : 0.6);
    }
  }

  // Synthesizes a bright, metallic Santur hammer strike with double-decay resonance
  private playSanturNote(ctx: AudioContext, dest: AudioNode, freq: number, time: number) {
    // 2 detuned oscillators simulating dual strings of a Santur course
    [0.998, 1.002].forEach((detune) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * detune, time);

      // Fast percussive hammer strike attack + metallic ring decay
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.22, time + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.04, time + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

      // Bandpass filter giving Santur wooden soundboard resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.8, time);
      filter.Q.value = 3.5;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 1.3);
    });
  }

  // Synthesizes a soft tombak bass tone
  private playTombakPulse(ctx: AudioContext, dest: AudioNode, time: number, strength: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.exponentialRampToValueAtTime(55, time + 0.25);

    gain.gain.setValueAtTime(0.35 * strength, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.45);
  }

  /**
   * 2. Cinematic Ambient Strings:
   * Slow evolving chord progression (D minor, Bb major, F major, C major)
   */
  private stepCinematic(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    const chordStep = Math.floor(step / 16); // 4 bars
    const chords = [
      [146.83, 220.0, 293.66, 349.23], // Dm (D3, A3, D4, F4)
      [116.54, 233.08, 293.66, 349.23], // Bb (Bb2, Bb3, D4, F4)
      [130.81, 196.0, 261.63, 329.63], // F (F2, G3, C4, E4 / Fadd9)
      [130.81, 196.0, 246.94, 293.66], // C (C3, G3, B3, D4 / Cadd9)
    ];

    if (step % 16 === 0) {
      const currentChord = chords[chordStep % chords.length];
      currentChord.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.linearRampToValueAtTime(1400, time + 2.5);
        filter.frequency.linearRampToValueAtTime(500, time + 5.0);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.08, time + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 5.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + 5.6);
      });
    }
  }

  /**
   * 3. Warm Lo-Fi Piano:
   * Gentle, nostalgic chords played with soft felt piano attack
   */
  private stepWarmPiano(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    // Chords on steps 0, 16, 32, 48
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 261.63, 329.63, 392.0], // Fmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    if (step % 16 === 0) {
      const chordIndex = Math.floor(step / 16) % chords.length;
      const notes = chords[chordIndex];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time + idx * 0.035);

        gain.gain.setValueAtTime(0.001, time + idx * 0.035);
        gain.gain.linearRampToValueAtTime(0.12, time + idx * 0.035 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 3.8);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time + idx * 0.035);
        osc.stop(time + 4.0);
      });
    }

    // Melodic top note sprinkle on steps 6, 12, 22, 28, 38, 44, 54, 60
    const melodySteps: Record<number, number> = {
      6: 523.25, // C5
      12: 493.88, // B4
      22: 440.0, // A4
      28: 392.0, // G4
      38: 523.25,
      44: 587.33, // D5
      54: 493.88,
      60: 440.0,
    };

    if (melodySteps[step]) {
      const freq = melodySteps[step];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.09, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 1.3);
    }
  }

  /**
   * 4. Ethereal Ambient & Cosmos:
   * Floating crystal tones and wide resonant frequencies
   */
  private stepEthereal(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    const bells = [528.0, 660.0, 792.0, 990.0, 1056.0, 1320.0];
    if (step % 8 === 0) {
      const note = bells[(step / 8) % bells.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 4.0);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 4.2);
    }
  }

  /**
   * 5. Modern Podcast & Tech Narrative:
   * Upbeat clean marimba/woodblock pattern + muted bass pulse
   */
  private stepPodcast(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C major pentatonic
    // Arpeggiated rhythmic 16th note pattern
    const pattern = [0, 2, 3, 4, 1, 3, 4, 5, 2, 4, 5, 3, 1, 2, 0, 2];
    const note = scale[pattern[step % pattern.length]];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, time);

    // Short crisp marimba envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.2);

    // Warm sub kick on quarter notes
    if (step % 4 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(105, time);
      kickOsc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

      kickGain.gain.setValueAtTime(0.3, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(dest);

      kickOsc.start(time);
      kickOsc.stop(time + 0.2);
    }
  }

  /**
   * 6. Deep Meditation & 432Hz Sound Bowl:
   * Harmonic singing bowl pulse
   */
  private stepMeditation(ctx: AudioContext, dest: AudioNode, step: number, time: number) {
    if (step % 32 === 0) {
      const fundamental = 216; // 432 / 2
      const partials = [1, 2.76, 5.4];
      const amps = [0.18, 0.08, 0.03];

      partials.forEach((p, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * p, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(amps[idx], time + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 7.5);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + 8.0);
      });
    }
  }

  /**
   * Continuous low warm drone underneath the track
   */
  private startContinuousDrone(ctx: AudioContext) {
    const dest = this.engine.bgmGain;
    if (!dest) return;

    let droneFreq = 73.42; // D2
    if (this.currentTrackId === 'warm_piano' || this.currentTrackId === 'modern_podcast') {
      droneFreq = 65.41; // C2
    } else if (this.currentTrackId === 'meditation_432') {
      droneFreq = 54.0; // 432 / 8
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(droneFreq, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start();
    this.activeDrones.push(osc);
  }
}
