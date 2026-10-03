// Blade contact precedes separation; transfer starts after the blade retracts.
export const FRUIT_MIX = ['apple', 'kiwi', 'pear', 'orange', 'mango'] as const;
export const CUT_CONTACT = .26;
export const CUT_RELEASE = .43;
export const CUT_END = .86;
export const NEXT_FRUIT_DELAY = .25;

// Use the scene's paused clock. Input updates cannot bypass this gap.
export class FruitCadence {
  private nextAt = 0;
  finish(now: number) { this.nextAt = now + NEXT_FRUIT_DELAY; }
  ready(now: number) { return now >= this.nextAt; }
  reset() { this.nextAt = 0; }
}
const smooth = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t); };
export function cutPose(age: number) {
  const down = smooth((age - .08) / .18), up = smooth((age - .29) / .23);
  return {
    blade: age < .29 ? 1.48 - down * 1.46 : .02 + up * 1.46,
    split: age >= CUT_CONTACT,
    spread: smooth((age - CUT_CONTACT) / .17),
    transfer: smooth((age - CUT_RELEASE) / (CUT_END - CUT_RELEASE)),
    settled: age >= CUT_END,
  };
}
