export const BEAT_MS = 500;
export const BEAT_WINDOW_MS = 90;
export const BEAT_BONUS = 25;
/** Positive offset moves the visible/scored beat later to match heard audio. */
export function beatError(elapsed: number, offset = 0) {
  const shifted = elapsed - offset;
  return shifted - Math.round(shifted / BEAT_MS) * BEAT_MS;
}
export function beatBonus(elapsed: number, offset = 0) {
  return Math.abs(beatError(elapsed, offset)) <= BEAT_WINDOW_MS ? BEAT_BONUS : 0;
}
export function calibrationOffset(samples: number[]): number | undefined {
  if (samples.length < 8 || samples.some(n => !Number.isFinite(n) || Math.abs(n) > 200)) return;
  const sorted = [...samples].sort((a, b) => a - b);
  // Reject scattered taps rather than save a misleading correction.
  if (sorted[6] - sorted[1] > 100) return;
  return Math.round((sorted[3] + sorted[4]) / 2);
}
export class BeatLauncher {
  private previous = -1;
  private next = 0;
  reset() { this.previous = -1; this.next = 0; }
  due(elapsed: number, gap: number, hasRoom: boolean) {
    const beat = Math.floor(elapsed / BEAT_MS);
    if (beat === this.previous) return false;
    this.previous = beat;
    // A delayed browser frame must not launch a whole backlog off the beat.
    if (!hasRoom || beat < this.next || elapsed % BEAT_MS > 80) return false;
    this.next = beat + Math.ceil(gap / BEAT_MS);
    return true;
  }
}
