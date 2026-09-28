/**
 * Studio Audio Downloader & WAV Encoder.
 * Allows instant, 100% offline generation and download of audio files (WAV & WebM).
 * Features Broadcast Mastering Limiter with analogue-modeled soft clipping
 * so exported files have pristine clarity, zero digital clicks, and zero harsh crackling.
 * 100% offline, zero external APIs, zero dependencies, client-side browser file export.
 */

import { SFXBoard } from './sfxBoard';

export interface SfxCuePoint {
  sfxId: string;
  time: number; // in seconds relative to speech start
}

export interface MasterExportOptions {
  includeMusic: boolean;
  musicTrackId: string;
  bgmVolume: number;
  duckingDepth: number;
  sfxCues?: SfxCuePoint[];
  filename?: string;
}

/**
 * Converts an AudioBuffer to a standard 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;

  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    // If mono, duplicate to stereo for standard listening
    const mono = buffer.getChannelData(0);
    result = new Float32Array(mono.length * 2);
    for (let i = 0; i < mono.length; i++) {
      result[i * 2] = mono[i];
      result[i * 2 + 1] = mono[i];
    }
  }

  const actualChannels = 2; // Always output stereo WAV for maximum compatibility
  const bytesPerSample = bitDepth / 8;
  const blockAlign = actualChannels * bytesPerSample;
  const dataSize = result.length * bytesPerSample;
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write RIFF Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // Write fmt Chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, actualChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // Write data Chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM Samples with soft-saturation peak protection
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    let sample = result[i];
    // Gentle tanh soft saturation limits peaks safely to [-1, 1] with zero wrap-around
    sample = Math.tanh(sample * 1.02);
    const intSample =
      sample < 0
        ? Math.max(-32768, Math.floor(sample * 32768))
        : Math.min(32767, Math.floor(sample * 32767));
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Initiates an automatic file download in the browser
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Procedural Offline Background Music Buffer Generator.
 * Generates lush, audible, authentic harmonic soundtrack layers.
 */
export function generateOfflineBgmBuffer(
  trackId: string,
  durationSec: number,
  sampleRate: number
): AudioBuffer {
  const totalSamples = Math.ceil(durationSec * sampleRate);
  const buffer = new AudioBuffer({
    numberOfChannels: 2,
    length: totalSamples,
    sampleRate,
  });

  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Base frequencies and harmonic scales
  let baseFreq = 146.83; // D3 (Persian Esfahan / Shur modal)
  let scaleNotes = [146.83, 164.81, 185.0, 196.0, 220.0, 246.94, 293.66, 329.63];

  if (trackId === 'cinematic_ambient') {
    baseFreq = 110.0; // A2
    scaleNotes = [110.0, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66];
  } else if (trackId === 'warm_piano') {
    baseFreq = 130.81; // C3
    scaleNotes = [130.81, 164.81, 196.0, 246.94, 261.63, 329.63, 392.0, 493.88];
  } else if (trackId === 'ethereal_ambient') {
    baseFreq = 220.0; // A3
    scaleNotes = [220.0, 246.94, 277.18, 329.63, 440.0, 554.37, 659.25, 880.0];
  } else if (trackId === 'modern_podcast') {
    baseFreq = 123.47; // B2
    scaleNotes = [123.47, 146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 370.0];
  } else if (trackId === 'meditation_432') {
    baseFreq = 108.0; // 432Hz harmonic base
    scaleNotes = [108.0, 162.0, 216.0, 270.0, 324.0, 432.0, 540.0, 648.0];
  }

  // Synthesize rich musical layers
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sampleL = 0;
    let sampleR = 0;

    // 1. Ambient harmonic pad drone with slow swell
    const swell = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.12 * t);
    sampleL += Math.sin(2 * Math.PI * baseFreq * t) * 0.28 * swell;
    sampleR += Math.sin(2 * Math.PI * (baseFreq * 1.002) * t + 0.5) * 0.28 * swell;

    // Sub octave warmth
    sampleL += Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.20;
    sampleR += Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * 0.20;

    // 2. Melodic arpeggio / pluck notes
    if (trackId === 'persian_modal') {
      // Santur-style melodic plucks every 0.8s
      const noteTime = t % 0.8;
      const noteIndex = Math.floor(t / 0.8) % scaleNotes.length;
      const noteFreq = scaleNotes[noteIndex];
      const pluckEnv = Math.exp(-noteTime * 4.5);
      const santur = (Math.sin(2 * Math.PI * noteFreq * t) + 0.4 * Math.sin(2 * Math.PI * noteFreq * 2 * t)) * pluckEnv * 0.32;
      sampleL += santur;
      sampleR += santur * 0.85;

      // Subtle Daf rhythm pulse on quarter beats (every 0.8s)
      if (noteTime < 0.1) {
        const dafPulse = Math.sin(2 * Math.PI * 75 * noteTime) * Math.exp(-noteTime * 35) * 0.25;
        sampleL += dafPulse;
        sampleR += dafPulse;
      }
    } else if (trackId === 'warm_piano') {
      // Warm chord plucks every 1.5s
      const chordTime = t % 1.5;
      const chordIdx = Math.floor(t / 1.5) % 4;
      const f1 = scaleNotes[chordIdx % scaleNotes.length];
      const f2 = scaleNotes[(chordIdx + 2) % scaleNotes.length];
      const f3 = scaleNotes[(chordIdx + 4) % scaleNotes.length];
      const pianoEnv = Math.exp(-chordTime * 2.2);

      const chord =
        (Math.sin(2 * Math.PI * f1 * t) * 0.4 +
          Math.sin(2 * Math.PI * f2 * t) * 0.35 +
          Math.sin(2 * Math.PI * f3 * t) * 0.25) *
        pianoEnv *
        0.30;
      sampleL += chord;
      sampleR += chord * 1.05;
    } else if (trackId === 'cinematic_ambient') {
      // Deep resonant strings swell
      const chordIdx = Math.floor(t / 4.0) % scaleNotes.length;
      const f = scaleNotes[chordIdx];
      const swellLong = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
      sampleL += Math.sin(2 * Math.PI * f * t) * 0.25 * swellLong;
      sampleR += Math.sin(2 * Math.PI * (f * 1.5) * t) * 0.20 * swellLong;
    } else if (trackId === 'modern_podcast') {
      // Modern rhythmic acoustic texture
      const beat = t % 0.5;
      const bassFreq = scaleNotes[Math.floor(t / 2.0) % 4];
      sampleL += Math.sin(2 * Math.PI * bassFreq * t) * 0.22;
      sampleR += Math.sin(2 * Math.PI * (bassFreq * 1.5) * t) * 0.18;
      if (beat < 0.05) {
        sampleL += Math.sin(2 * Math.PI * 140 * beat) * Math.exp(-beat * 40) * 0.20;
        sampleR += Math.sin(2 * Math.PI * 140 * beat) * Math.exp(-beat * 40) * 0.20;
      }
    } else {
      // General harmonious celestial drone
      sampleL += Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.20 * swell;
      sampleR += Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) * 0.15 * swell;
    }

    left[i] = Math.tanh(sampleL * 0.85);
    right[i] = Math.tanh(sampleR * 0.85);
  }

  return buffer;
}

/**
 * Fast Master Export: Renders Speech + Audible Background Music + Synchronized SFX
 * through an OfflineAudioContext with Master Dynamics Limiter into high-definition 16-bit WAV.
 */
export async function exportMasterWavAudio(
  speechBuffer: AudioBuffer,
  options: MasterExportOptions
): Promise<{ blob: Blob; url: string; filename: string }> {
  const sampleRate = speechBuffer.sampleRate;
  const numChannels = 2;
  const leadIn = options.includeMusic ? 0.35 : 0.08;
  const tailOut = options.includeMusic ? 1.20 : 0.20;
  const totalDuration = speechBuffer.duration + leadIn + tailOut;
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, totalSamples, sampleRate);

  // Mastering Compressor in Offline Context for transparent broadcast leveling
  const masterComp = offlineCtx.createDynamicsCompressor();
  masterComp.threshold.setValueAtTime(-12, 0);
  masterComp.knee.setValueAtTime(12, 0);
  masterComp.ratio.setValueAtTime(3.5, 0);
  masterComp.attack.setValueAtTime(0.01, 0);
  masterComp.release.setValueAtTime(0.20, 0);
  masterComp.connect(offlineCtx.destination);

  // 1. Speech Track
  const speechSource = offlineCtx.createBufferSource();
  speechSource.buffer = speechBuffer;
  const speechGain = offlineCtx.createGain();
  speechGain.gain.value = 1.0;
  speechSource.connect(speechGain);
  speechGain.connect(masterComp);
  speechSource.start(leadIn);

  // 2. Background Music with Professional Auto-Ducking
  if (options.includeMusic) {
    const bgmGain = offlineCtx.createGain();
    const targetBgmVol = Math.max(0.25, Math.min(1.0, options.bgmVolume || 0.65));
    // During speech, duck to ~40% of full BGM volume so it remains clearly audible
    const duckedVol = targetBgmVol * Math.max(0.32, options.duckingDepth || 0.40);

    const speechStart = leadIn;
    const speechEnd = speechStart + speechBuffer.duration;

    // Pre-speech music intro at full volume
    bgmGain.gain.setValueAtTime(targetBgmVol, 0);
    // Smooth duck down when speech begins
    bgmGain.gain.linearRampToValueAtTime(duckedVol, speechStart + 0.15);
    // Hold ducked level throughout speech
    bgmGain.gain.setValueAtTime(duckedVol, Math.max(speechStart + 0.15, speechEnd - 0.15));
    // Smooth crescendo back to full music volume for outro
    bgmGain.gain.linearRampToValueAtTime(targetBgmVol, speechEnd + 0.45);

    const musicBuffer = generateOfflineBgmBuffer(options.musicTrackId, totalDuration, sampleRate);
    const musicSource = offlineCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.connect(bgmGain);
    bgmGain.connect(masterComp);
    musicSource.start(0);
  }

  // 3. Sound Effects (SFX Cues) placed along the timeline
  if (options.sfxCues && options.sfxCues.length > 0) {
    const sfxGain = offlineCtx.createGain();
    sfxGain.gain.value = 0.85;
    sfxGain.connect(masterComp);

    const sfxBoard = SFXBoard.getInstance();
    for (const cue of options.sfxCues) {
      const cueTime = Math.max(0, leadIn + cue.time);
      if (cueTime < totalDuration) {
        sfxBoard.playAtTime(cue.sfxId, cueTime, offlineCtx, sfxGain);
      }
    }
  }

  // Render in OfflineAudioContext
  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  const downloadUrl = URL.createObjectURL(wavBlob);
  const outFilename =
    options.filename ||
    (options.includeMusic
      ? `میکس_کامل_استودیویی_فارسی_${Date.now()}.wav`
      : `صدای_خام_گوینده_فارسی_${Date.now()}.wav`);

  triggerFileDownload(wavBlob, outFilename);

  return {
    blob: wavBlob,
    url: downloadUrl,
    filename: outFilename,
  };
}
