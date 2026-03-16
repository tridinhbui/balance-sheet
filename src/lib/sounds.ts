let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playCorrect() {
  playTone(523, 0.1, 'sine');
  setTimeout(() => playTone(659, 0.1, 'sine'), 80);
  setTimeout(() => playTone(784, 0.15, 'sine'), 160);
}

export function playWrong() {
  playTone(200, 0.2, 'sawtooth', 0.12);
  setTimeout(() => playTone(150, 0.25, 'sawtooth', 0.1), 100);
}

export function playVictory() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.2), i * 120);
  });
}

export function playDefeat() {
  playTone(150, 0.4, 'sawtooth', 0.15);
  setTimeout(() => playTone(120, 0.5, 'sawtooth', 0.12), 200);
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}
