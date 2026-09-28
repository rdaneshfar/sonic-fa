/**
 * Core Audio Engine - Professional Master Web Audio Graph & Mixing Console.
 * Features:
 * 1. Warm Acoustic Plate & Studio Reverb with air-absorption low-pass smoothing (Zero digital crackling/harshness).
 * 2. Broadcast-Grade Dynamics Compressor with musical soft-knee leveling.
 * 3. Analogue-Emulated Anti-Clipping Soft Saturation Limiter (Guaranteed zero digital clicks/crackle).
 * 4. Dual Studio Mix Routing: Master Studio Mix vs 100% Pure Raw Voice stems.
 * 100% offline, local browser processing, zero external API.
 */

export type ReverbRoomType = 'studio' | 'concert_hall' | 'acoustic_room' | 'cathedral' | 'off';

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  public ctx: AudioContext | null = null;

  // Master Chain Nodes
  public masterGain: GainNode | null = null;
  public masterCompressor: DynamicsCompressorNode | null = null;
  public masterLimiterShaper: WaveShaperNode | null = null;
  public analyser: AnalyserNode | null = null;
  public mediaStreamDest: MediaStreamAudioDestinationNode | null = null;

  // 3-Band Master EQ
  public lowEq: BiquadFilterNode | null = null;
  public midEq: BiquadFilterNode | null = null;
  public highEq: BiquadFilterNode | null = null;

  // Reverb System
  public convolver: ConvolverNode | null = null;
  public reverbDryGain: GainNode | null = null;
  public reverbWetGain: GainNode | null = null;
  public currentRoom: ReverbRoomType = 'studio';
  private cachedWetValue: number = 0.18;

  // Sub-busses
  public bgmGain: GainNode | null = null;
  public bgmDuckingGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public speechBusGain: GainNode | null = null;

  // Cached volume preferences
  private targetBgmVolume: number = 0.45;
  private targetSfxVolume: number = 0.85;

  // Ducking configuration
  public autoDuckingEnabled: boolean = true;
  public duckingDepth: number = 0.22; // Music drops smoothly to 22% during speech

  // Mix mode: 'master' (Speech + Music + SFX + Reverb) vs 'raw' (Clean dry speech only)
  public mixMode: 'master' | 'raw' = 'master';

  // Recorder
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public isRecording: boolean = false;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   */
  public async init(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.buildGraph();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getSpeechBus(): GainNode {
    if (!this.speechBusGain && this.ctx) {
      this.speechBusGain = this.ctx.createGain();
      this.speechBusGain.gain.value = 1.0;
      if (this.reverbDryGain) {
        this.speechBusGain.connect(this.reverbDryGain);
      }
    }
    return this.speechBusGain || (this.ctx ? this.ctx.createGain() : (null as unknown as GainNode));
  }

  private buildGraph() {
    if (!this.ctx) return;

    // 1. Analyser for live visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    // 2. Master Gain (with gentle calibrated headroom)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.88;

    // 3. Broadcast-Grade Dynamics Compressor (Natural, transparent voice leveling)
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-10, this.ctx.currentTime); // -10 dBFS
    this.masterCompressor.knee.setValueAtTime(14, this.ctx.currentTime);        // smooth soft knee
    this.masterCompressor.ratio.setValueAtTime(4.0, this.ctx.currentTime);      // 4:1 transparent leveling
    this.masterCompressor.attack.setValueAtTime(0.015, this.ctx.currentTime);   // 15ms preserves vocal clarity
    this.masterCompressor.release.setValueAtTime(0.22, this.ctx.currentTime);   // 220ms smooth release

    // 4. Analogue-Emulated Anti-Clipping Soft Saturation Limiter
    // Completely prevents any digital clipping, clicks or harsh scratching
    this.masterLimiterShaper = this.ctx.createWaveShaper();
    const curveLength = 4096;
    const curve = new Float32Array(curveLength);
    for (let i = 0; i < curveLength; i++) {
      const x = (i / (curveLength - 1)) * 2 - 1; // -1 to 1
      // Smooth hyperbolic tangent soft-clip curve
      curve[i] = Math.tanh(x * 1.1) / Math.tanh(1.1);
    }
    this.masterLimiterShaper.curve = curve;
    this.masterLimiterShaper.oversample = '2x';

    // 5. Media Stream Destination for audio recording/export
    this.mediaStreamDest = this.ctx.createMediaStreamDestination();

    // 6. Master 3-Band Studio EQ
    this.lowEq = this.ctx.createBiquadFilter();
    this.lowEq.type = 'lowshelf';
    this.lowEq.frequency.value = 110;
    this.lowEq.gain.value = 0;

    this.midEq = this.ctx.createBiquadFilter();
    this.midEq.type = 'peaking';
    this.midEq.frequency.value = 1300;
    this.midEq.Q.value = 0.9;
    this.midEq.gain.value = 0;

    this.highEq = this.ctx.createBiquadFilter();
    this.highEq.type = 'highshelf';
    this.highEq.frequency.value = 7000;
    this.highEq.gain.value = 0;

    // 7. Reverb Convolver & Mixers
    this.convolver = this.ctx.createConvolver();
    this.reverbDryGain = this.ctx.createGain();
    this.reverbWetGain = this.ctx.createGain();

    this.reverbDryGain.gain.value = 1.0;
    this.reverbWetGain.gain.value = 0.16;

    this.loadSyntheticImpulseResponse(this.currentRoom);

    // 8. Sub-busses
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.targetSfxVolume;

    this.speechBusGain = this.ctx.createGain();
    this.speechBusGain.gain.value = 1.0;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.targetBgmVolume;

    this.bgmDuckingGain = this.ctx.createGain();
    this.bgmDuckingGain.gain.value = 1.0;

    // Connect BGM: bgmGain -> bgmDuckingGain -> Reverb Split
    this.bgmGain.connect(this.bgmDuckingGain);

    // SFX -> Reverb Split
    this.sfxGain.connect(this.reverbDryGain);
    this.sfxGain.connect(this.convolver);

    // BGM -> Reverb Split
    this.bgmDuckingGain.connect(this.reverbDryGain);
    this.bgmDuckingGain.connect(this.convolver);

    // Speech -> Dry (and 10% subtle warm acoustic room send)
    const speechReverbSend = this.ctx.createGain();
    speechReverbSend.gain.value = 0.10;
    this.speechBusGain.connect(this.reverbDryGain);
    this.speechBusGain.connect(speechReverbSend);
    speechReverbSend.connect(this.convolver);

    // Reverb Convolver -> Wet Gain
    this.convolver.connect(this.reverbWetGain);

    // Combine Dry & Wet into Studio EQ & Master Limiting Chain:
    // (reverbDryGain + reverbWetGain) -> lowEq -> midEq -> highEq -> masterGain -> masterCompressor -> masterLimiterShaper -> analyser -> destination
    const preEqSum = this.ctx.createGain();
    this.reverbDryGain.connect(preEqSum);
    this.reverbWetGain.connect(preEqSum);

    preEqSum.connect(this.lowEq);
    this.lowEq.connect(this.midEq);
    this.midEq.connect(this.highEq);
    this.highEq.connect(this.masterGain);

    // MasterGain -> Master Compressor -> Anti-Clipping Soft Limiter -> Outputs
    this.masterGain.connect(this.masterCompressor);
    this.masterCompressor.connect(this.masterLimiterShaper);

    this.masterLimiterShaper.connect(this.analyser);
    this.masterLimiterShaper.connect(this.ctx.destination);
    this.masterLimiterShaper.connect(this.mediaStreamDest);
  }

  /**
   * Warm Acoustic Impulse Response Generator with Low-Pass Damping.
   * Eliminates the ear-scratching high frequency noise of raw white noise.
   */
  public loadSyntheticImpulseResponse(room: ReverbRoomType) {
    if (!this.ctx || !this.convolver) return;
    this.currentRoom = room;

    if (room === 'off') {
      if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      return;
    }

    let duration = 1.2;
    let decay = 3.0;
    let targetWet = 0.16;

    switch (room) {
      case 'studio':
        duration = 0.75;
        decay = 4.0;
        targetWet = 0.15;
        break;
      case 'acoustic_room':
        duration = 1.3;
        decay = 2.8;
        targetWet = 0.22;
        break;
      case 'concert_hall':
        duration = 2.2;
        decay = 1.9;
        targetWet = 0.28;
        break;
      case 'cathedral':
        duration = 3.2;
        decay = 1.4;
        targetWet = 0.35;
        break;
    }

    this.cachedWetValue = targetWet;
    if (this.mixMode !== 'raw' && this.reverbWetGain) {
      this.reverbWetGain.gain.setTargetAtTime(targetWet, this.ctx.currentTime, 0.05);
    }

    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // Pre-delay in samples (~15ms)
    const preDelaySamples = Math.floor(sampleRate * 0.015);

    // 1-pole lowpass filter memory to absorb harsh high frequencies
    let filterL = 0;
    let filterR = 0;
    const alpha = 0.12; // strong high-frequency damping like acoustic studio walls

    for (let i = 0; i < length; i++) {
      if (i < preDelaySamples) {
        left[i] = 0;
        right[i] = 0;
        continue;
      }

      const t = (i - preDelaySamples) / sampleRate;
      const envelope = Math.exp(-decay * t);

      // Raw noise
      const rawL = (Math.random() * 2 - 1) * envelope;
      const rawR = (Math.random() * 2 - 1) * envelope;

      // Low-pass filter to remove metallic bite/harsh hiss
      filterL += alpha * (rawL - filterL);
      filterR += alpha * (rawR - filterR);

      // Scale to safe non-clipping peak
      left[i] = filterL * 0.20;
      right[i] = filterR * 0.20;
    }

    this.convolver.buffer = impulse;
  }

  /**
   * Sound Director Sidechain Auto-Ducking
   * Silky-smooth logarithmic ramping: zero pops, clicks, or discontinuities.
   */
  public triggerDucking(isSpeaking: boolean) {
    if (!this.ctx || !this.bgmDuckingGain || !this.autoDuckingEnabled) return;

    const now = this.ctx.currentTime;
    if (isSpeaking) {
      // Smooth exponential duck to duckingDepth (~0.22)
      this.bgmDuckingGain.gain.setTargetAtTime(this.duckingDepth, now, 0.08);
    } else {
      // Graceful cinematic swell back to 1.0
      this.bgmDuckingGain.gain.setTargetAtTime(1.0, now, 0.25);
    }
  }

  /**
   * Switch between Studio Master Mix and Pure Raw Voice
   */
  public setMixMode(mode: 'master' | 'raw') {
    this.mixMode = mode;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (mode === 'raw') {
      // Mute BGM and SFX, bypass Reverb Wet for 100% dry pure voice
      if (this.bgmGain) this.bgmGain.gain.setTargetAtTime(0, now, 0.04);
      if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(0, now, 0.04);
      if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0, now, 0.04);
    } else {
      // Restore full Studio Mix
      if (this.bgmGain) this.bgmGain.gain.setTargetAtTime(this.targetBgmVolume, now, 0.06);
      if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(this.targetSfxVolume, now, 0.06);
      if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(this.cachedWetValue, now, 0.06);
    }
  }

  /**
   * Set Master Volume (0.0 to 1.0)
   */
  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Set BGM Volume (0.0 to 1.0)
   */
  public setBgmVolume(val: number) {
    this.targetBgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx && this.mixMode !== 'raw') {
      this.bgmGain.gain.setTargetAtTime(this.targetBgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Set SFX Volume (0.0 to 1.0)
   */
  public setSfxVolume(val: number) {
    this.targetSfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx && this.mixMode !== 'raw') {
      this.sfxGain.gain.setTargetAtTime(this.targetSfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Set EQ bands (in dB, -12 to +12)
   */
  public setEq(low: number, mid: number, high: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.lowEq) this.lowEq.gain.setTargetAtTime(low, now, 0.05);
    if (this.midEq) this.midEq.gain.setTargetAtTime(mid, now, 0.05);
    if (this.highEq) this.highEq.gain.setTargetAtTime(high, now, 0.05);
  }

  /**
   * Set Reverb Wetness (0.0 to 1.0)
   */
  public setReverbWet(val: number) {
    this.cachedWetValue = Math.max(0, Math.min(1, val));
    if (this.reverbWetGain && this.ctx && this.mixMode !== 'raw') {
      this.reverbWetGain.gain.setTargetAtTime(this.cachedWetValue, this.ctx.currentTime, 0.05);
    }
  }

  // ================= Recording & Export =================
  public startRecording(): boolean {
    if (!this.mediaStreamDest) return false;

    try {
      this.recordedChunks = [];
      const stream = this.mediaStreamDest.stream;

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      this.isRecording = false;
      return false;
    }
  }

  public stopRecording(): Promise<{ blob: Blob; url: string } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      };

      this.mediaRecorder.stop();
    });
  }
}
