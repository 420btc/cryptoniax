'use client';

// ─── Web Audio API Sound Effects (no files needed) ──────────
// Pure oscillator-based sounds — procedural, lightweight, unique

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.12, ramp = true) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail — audio is optional
  }
}

// ─── Public API ─────────────────────────────────────────────

export const sfx = {
  /** Trade opened — rising chirp */
  tradeOpen: (isLong = true) => {
    playTone(isLong ? 520 : 440, 0.15, 'sine', 0.08);
    setTimeout(() => playTone(isLong ? 780 : 660, 0.1, 'sine', 0.06), 50);
  },

  /** Trade won — triumphant chord */
  tradeWin: () => {
    playTone(523, 0.2, 'triangle', 0.1);
    setTimeout(() => playTone(659, 0.2, 'triangle', 0.08), 80);
    setTimeout(() => playTone(784, 0.3, 'triangle', 0.1), 160);
  },

  /** Trade lost — low thud */
  tradeLose: () => {
    playTone(200, 0.3, 'sawtooth', 0.06);
    playTone(150, 0.35, 'sine', 0.08);
  },

  /** Coins claimed — coin jingle */
  coinClaim: () => {
    [0, 60, 120, 180].forEach((delay, i) => {
      setTimeout(() => playTone(880 + i * 110, 0.1, 'sine', 0.07), delay);
    });
  },

  /** Level up — ascending arpeggio */
  levelUp: () => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'triangle', 0.09), i * 100);
    });
  },

  /** Button click — subtle tick */
  click: () => {
    playTone(1200, 0.04, 'sine', 0.04, false);
  },

  /** Achievement — celebratory fanfare */
  achievement: () => {
    playTone(523, 0.15, 'triangle', 0.1);
    setTimeout(() => playTone(659, 0.15, 'triangle', 0.1), 100);
    setTimeout(() => playTone(784, 0.15, 'triangle', 0.1), 200);
    setTimeout(() => playTone(1047, 0.4, 'triangle', 0.12), 300);
  },

  /** Notification — gentle ping */
  notify: () => {
    playTone(660, 0.08, 'sine', 0.06);
    setTimeout(() => playTone(880, 0.12, 'sine', 0.06), 60);
  },

  /** Error — buzz */
  error: () => {
    playTone(150, 0.2, 'square', 0.04);
    playTone(100, 0.25, 'sawtooth', 0.03);
  },
};
