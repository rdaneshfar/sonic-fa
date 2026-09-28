/**
 * Sound Director SFX Engine - 12 Procedurally Synthesized Sound Effects.
 * 100% royalty-free, completely local offline, zero API, instant playback.
 */

import { AudioEngine } from './audioEngine';

export interface SoundEffectItem {
  id: string;
  nameFa: string;
  nameEn: string;
  category: 'سینمایی' | 'طبیعت' | 'ساز و ریتم' | 'افکت و انیمیشن';
  descriptionFa: string;
  keyboardShortcut: string;
  color: string;
}

export const SFX_CATALOG: SoundEffectItem[] = [
  {
    id: 'cinema_impact',
    nameFa: 'ضربه سینمایی عمیق',
    nameEn: 'Cinematic Sub Boom',
    category: 'سینمایی',
    descriptionFa: 'ضربه فرکانس بم قدرتمند مناسب شروع جملات مهم و اوج داستان',
    keyboardShortcut: '1',
    color: '#E11D48',
  },
  {
    id: 'riser',
    nameFa: 'رایزر و اوج هیجان',
    nameEn: 'Dramatic Riser',
    category: 'سینمایی',
    descriptionFa: 'افزایش تدریجی زیروبمی و تنش قبل از نقطه عطف کلام',
    keyboardShortcut: '2',
    color: '#F59E0B',
  },
  {
    id: 'daf_hit',
    nameFa: 'ضربه دف و تنبک',
    nameEn: 'Persian Daf / Tombak Hit',
    category: 'ساز و ریتم',
    descriptionFa: 'پژواک کوبه‌ای اصیل ایرانی با طنین پوست و بدنه چوبی',
    keyboardShortcut: '3',
    color: '#D97706',
  },
  {
    id: 'chime_bell',
    nameFa: 'زنگ بلورین و فرشته',
    nameEn: 'Crystal Bell Chime',
    category: 'سینمایی',
    descriptionFa: 'طنین درخشان و زلال شیشه‌ای برای مفاهیم عرفانی، امید و الهام',
    keyboardShortcut: '4',
    color: '#06B6D4',
  },
  {
    id: 'page_turn',
    nameFa: 'ورق زدن کتاب',
    nameEn: 'Paper Page Turn',
    category: 'افکت و انیمیشن',
    descriptionFa: 'صدای لطیف کاغذ مناسب کتاب‌های صوتی و اشعار',
    keyboardShortcut: '5',
    color: '#10B981',
  },
  {
    id: 'whoosh',
    nameFa: 'گذر باد و انتقال',
    nameEn: 'Whoosh Transition',
    category: 'افکت و انیمیشن',
    descriptionFa: 'حرکت سریع استریو برای تغییر صحنه و تعویض پاراگراف',
    keyboardShortcut: '6',
    color: '#8B5CF6',
  },
  {
    id: 'rain_thunder',
    nameFa: 'باران و غرش ملایم رعد',
    nameEn: 'Rain & Distant Thunder',
    category: 'طبیعت',
    descriptionFa: 'فضای ملایم بارانی و بمِ آرام رعد برای متن‌های احساسی و رمانتیک',
    keyboardShortcut: '7',
    color: '#3B82F6',
  },
  {
    id: 'morning_birds',
    nameFa: 'آواز پرندگان صبحگاهی',
    nameEn: 'Forest Songbirds',
    category: 'طبیعت',
    descriptionFa: 'چهچهه دلنشین پرندگان مناسب روایت طبیعت و روز نو',
    keyboardShortcut: '8',
    color: '#84CC16',
  },
  {
    id: 'heartbeat',
    nameFa: 'تپش قلب دراماتیک',
    nameEn: 'Dramatic Heartbeat',
    category: 'سینمایی',
    descriptionFa: 'دو ضربه ضربان قلب با فرکانس پایین برای لحظات پرهیجان و حساس',
    keyboardShortcut: '9',
    color: '#EF4444',
  },
  {
    id: 'tape_stop',
    nameFa: 'توقف نوار کاست',
    nameEn: 'Vintage Tape Stop',
    category: 'افکت و انیمیشن',
    descriptionFa: 'کاهش ناگهانی سرعت موتور برای ایجاد شوک و طنز یا تغییر مسیر',
    keyboardShortcut: '0',
    color: '#EC4899',
  },
  {
    id: 'applause',
    nameFa: 'تشویق و تحسین حضار',
    nameEn: 'Warm Applause',
    category: 'افکت و انیمیشن',
    descriptionFa: 'دست زدن گرم جمعیت برای پایان انگیزشی یا ارائه',
    keyboardShortcut: '-',
    color: '#F97316',
  },
  {
    id: 'typewriter_click',
    nameFa: 'کلیک ماشین‌تحریر مکانیکی',
    nameEn: 'Mechanical Typing Click',
    category: 'افکت و انیمیشن',
    descriptionFa: 'ضربه کلیک فلزی نوستالژیک برای نوشتن و شروع تفکر',
    keyboardShortcut: '=',
    color: '#A855F7',
  },
];

export class SFXBoard {
  private static instance: SFXBoard | null = null;
  private engine: AudioEngine;

  private constructor() {
    this.engine = AudioEngine.getInstance();
  }

  public static getInstance(): SFXBoard {
    if (!SFXBoard.instance) {
      SFXBoard.instance = new SFXBoard();
    }
    return SFXBoard.instance;
  }

  public async play(id: string): Promise<void> {
    const ctx = await this.engine.init();
    const dest = this.engine.sfxGain;
    if (!dest) return;
    this.playAtTime(id, ctx.currentTime, ctx, dest);
  }

  public playAtTime(
    id: string,
    time: number,
    customCtx?: BaseAudioContext,
    customDest?: AudioNode
  ): void {
    const ctx = customCtx || this.engine.ctx;
    const dest = customDest || this.engine.sfxGain;
    if (!ctx || !dest) return;

    switch (id) {
      case 'cinema_impact':
        this.playCinemaImpact(ctx, dest, time);
        break;
      case 'riser':
        this.playDramaticRiser(ctx, dest, time);
        break;
      case 'daf_hit':
        this.playPersianDaf(ctx, dest, time);
        break;
      case 'chime_bell':
        this.playChimeBell(ctx, dest, time);
        break;
      case 'page_turn':
        this.playPageTurn(ctx, dest, time);
        break;
      case 'whoosh':
        this.playWhoosh(ctx, dest, time);
        break;
      case 'rain_thunder':
        this.playRainThunder(ctx, dest, time);
        break;
      case 'morning_birds':
        this.playMorningBirds(ctx, dest, time);
        break;
      case 'heartbeat':
        this.playHeartbeat(ctx, dest, time);
        break;
      case 'tape_stop':
        this.playTapeStop(ctx, dest, time);
        break;
      case 'applause':
        this.playApplause(ctx, dest, time);
        break;
      case 'typewriter_click':
        this.playTypewriter(ctx, dest, time);
        break;
      default:
        console.warn('Unknown SFX ID:', id);
    }
  }

  // 1. Cinematic Impact: Rich Sub-Drop + Subtle Punch
  private playCinemaImpact(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    // Click transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(180, now);
    click.frequency.exponentialRampToValueAtTime(50, now + 0.04);
    clickGain.gain.setValueAtTime(0.01, now);
    clickGain.gain.linearRampToValueAtTime(0.3, now + 0.004);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    click.connect(clickGain);
    gain.connect(dest);
    clickGain.connect(dest);

    osc.start(now);
    click.start(now);
    osc.stop(now + 1.8);
    click.stop(now + 0.06);
  }

  // 2. Dramatic Riser: Swept Saw + bandpass resonance
  private playDramaticRiser(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const duration = 2.4;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + duration);

    osc2.frequency.setValueAtTime(82, now);
    osc2.frequency.exponentialRampToValueAtTime(610, now + duration);

    filter.type = 'bandpass';
    filter.Q.value = 2.2;
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.42, now + duration * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // 3. Persian Daf/Tombak: Resonant membrane hit + shell wood tone
  private playPersianDaf(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const skinOsc = ctx.createOscillator();
    const skinGain = ctx.createGain();
    skinOsc.type = 'sine';
    skinOsc.frequency.setValueAtTime(110, now);
    skinOsc.frequency.exponentialRampToValueAtTime(65, now + 0.35);

    skinGain.gain.setValueAtTime(0.9, now);
    skinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1600;
    noiseFilter.Q.value = 2.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    skinOsc.connect(skinGain);
    skinGain.connect(dest);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    skinOsc.start(now);
    noiseSource.start(now);
    skinOsc.stop(now + 0.7);
    noiseSource.stop(now + 0.08);
  }

  // 4. Chime Bell: Harmonic overtone synthesis
  private playChimeBell(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const baseFreq = 880; // A5
    const partials = [1, 2.76, 5.4, 8.9];
    const weights = [0.6, 0.3, 0.15, 0.08];

    partials.forEach((mult, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);

      const amp = weights[index];
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 / (index + 1));

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  // 5. Page Turn: Filtered noise rustle
  private playPageTurn(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const dur = 0.45;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.linearRampToValueAtTime(1400, now + dur);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    source.start(now);
    source.stop(now + dur);
  }

  // 6. Whoosh: Stereo pan-modulated noise sweep
  private playWhoosh(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const dur = 0.55;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + dur * 0.45);
    filter.frequency.exponentialRampToValueAtTime(180, now + dur);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.38, now + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    source.start(now);
    source.stop(now + dur);
  }

  // 7. Rain & Thunder: Continuous rain burst + distant thunder boom
  private playRainThunder(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const rainDur = 2.8;
    const bufferSize = Math.floor(ctx.sampleRate * rainDur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1800;

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.01, now);
    rainGain.gain.linearRampToValueAtTime(0.35, now + 0.4);
    rainGain.gain.exponentialRampToValueAtTime(0.001, now + rainDur);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(dest);

    const thunderOsc = ctx.createOscillator();
    const thunderGain = ctx.createGain();
    thunderOsc.type = 'triangle';
    thunderOsc.frequency.setValueAtTime(75, now + 0.5);
    thunderOsc.frequency.exponentialRampToValueAtTime(30, now + 2.0);

    thunderGain.gain.setValueAtTime(0.001, now);
    thunderGain.gain.setValueAtTime(0.001, now + 0.45);
    thunderGain.gain.linearRampToValueAtTime(0.65, now + 0.6);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    thunderOsc.connect(thunderGain);
    thunderGain.connect(dest);

    rainSource.start(now);
    thunderOsc.start(now + 0.5);
    rainSource.stop(now + rainDur);
    thunderOsc.stop(now + 2.6);
  }

  // 8. Morning Birds: FM chirp synthesis
  private playMorningBirds(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const playChirp = (delay: number, pitch: number) => {
      const startTime = now + delay;
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const carrierGain = ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(pitch, startTime);
      carrier.frequency.exponentialRampToValueAtTime(pitch * 1.35, startTime + 0.08);
      carrier.frequency.exponentialRampToValueAtTime(pitch * 0.95, startTime + 0.16);

      modulator.type = 'sine';
      modulator.frequency.value = 45;
      modGain.gain.value = 180;

      modulator.connect(carrier.frequency);

      carrierGain.gain.setValueAtTime(0.01, startTime);
      carrierGain.gain.linearRampToValueAtTime(0.4, startTime + 0.04);
      carrierGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      carrier.connect(carrierGain);
      carrierGain.connect(dest);

      carrier.start(startTime);
      modulator.start(startTime);
      carrier.stop(startTime + 0.22);
      modulator.stop(startTime + 0.22);
    };

    playChirp(0, 2400);
    playChirp(0.18, 2800);
    playChirp(0.38, 2200);
    playChirp(0.55, 3100);
  }

  // 9. Heartbeat: Realistic double thump (lub-dub)
  private playHeartbeat(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const thump = (time: number, freq: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);

      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time);
      osc.stop(time + 0.25);
    };

    thump(now, 75, 0.85); // Lub
    thump(now + 0.28, 65, 0.7); // Dub
  }

  // 10. Vintage Tape Stop: Tone pitch bending to 0
  private playTapeStop(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const dur = 0.7;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + dur);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.4, now + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(100, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 11. Applause: Randomized clapping bursts
  private playApplause(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const clapCount = 28;
    for (let i = 0; i < clapCount; i++) {
      const delay = Math.random() * 1.6;
      const t = now + delay;

      const dur = 0.04 + Math.random() * 0.04;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900 + Math.random() * 1400;
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 + Math.random() * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      src.start(t);
      src.stop(t + dur);
    }
  }

  // 12. Typewriter: Click and carriage release
  private playTypewriter(ctx: BaseAudioContext, dest: AudioNode, now: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}
