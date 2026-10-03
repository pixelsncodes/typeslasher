export type Pace = 'relaxed' | 'steady' | 'brisk';
export function foodTime(pace: Pace, letters: number) {
  const settings = { relaxed: [6000, 2000], steady: [4000, 1500], brisk: [3000, 1000] };
  const [recognition, perLetter] = settings[pace];
  return recognition + letters * perLetter;
}

/** One active-play clock drives deadlines, motion and scoring. */
export class RoundClock {
  elapsed = 0;
  countdown = 3000;
  paused = false;
  private previous = 0;
  start(now: number) { this.elapsed = 0; this.countdown = 3000; this.paused = false; this.previous = now; }
  pause(now: number) { this.tick(now); this.paused = true; }
  resume(now: number) { this.previous = now; this.paused = false; this.countdown = 3000; }
  tick(now: number) {
    const delta = Math.max(0, now - this.previous); this.previous = now;
    if (this.paused) return 0;
    if (this.countdown > 0) { this.countdown = Math.max(0, this.countdown - delta); return 0; }
    this.elapsed += delta;
    return delta / 1000;
  }
  get ready() { return !this.paused && this.countdown === 0; }
}

// A bounded arc keeps the complete model in the visible play area until expiry.
export function foodArc(progress: number, lane: number, aspect: number) {
  const t = Math.max(0, Math.min(1, progress));
  return { x: lane * Math.max(0, Math.min(4, aspect * 5 - 1.7)), y: -2.3 + Math.sin(Math.PI * t) * 2 };
}
