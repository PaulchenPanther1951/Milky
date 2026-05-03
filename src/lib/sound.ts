/**
 * Lightweight, dependency-free chimes via WebAudio.
 * Defaults are quiet; we never play if the user hasn't opted in.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function ensureRunning(c: AudioContext) {
  if (c.state === "suspended") {
    c.resume().catch(() => undefined);
  }
}

interface ToneOptions {
  freq: number;
  start: number;
  duration: number;
  peak: number;
  type?: OscillatorType;
}

function playTone(c: AudioContext, opts: ToneOptions) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, opts.start);
  gain.gain.setValueAtTime(0, opts.start);
  gain.gain.linearRampToValueAtTime(opts.peak, opts.start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, opts.start + opts.duration);
  osc.connect(gain).connect(c.destination);
  osc.start(opts.start);
  osc.stop(opts.start + opts.duration + 0.05);
}

export function playStarLight(enabled: boolean) {
  if (!enabled) return;
  const c = getContext();
  if (!c) return;
  ensureRunning(c);
  const t = c.currentTime;
  // Soft two-note chime — A5 → E6
  playTone(c, { freq: 880, start: t, duration: 0.55, peak: 0.07 });
  playTone(c, { freq: 1318.5, start: t + 0.05, duration: 0.55, peak: 0.05 });
}

export function playMilestone(enabled: boolean) {
  if (!enabled) return;
  const c = getContext();
  if (!c) return;
  ensureRunning(c);
  const t = c.currentTime;
  // Major arpeggio C5 E5 G5 C6
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(c, { freq, start: t + i * 0.13, duration: 0.55, peak: 0.07 });
  });
  // Sparkle: brief shimmer at the top
  playTone(c, { freq: 2093, start: t + 0.55, duration: 0.7, peak: 0.04 });
}
