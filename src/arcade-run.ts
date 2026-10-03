import { DIFFICULTIES, type Difficulty } from './challenge.ts';

export const ROUND_SECONDS = [30, 60, 90] as const;
export type RoundSeconds = typeof ROUND_SECONDS[number];
export const validRoundSeconds = (value: number): value is RoundSeconds => ROUND_SECONDS.includes(value as RoundSeconds);

/** Each round takes a small step; more targets arrive every three rounds. */
export function arcadeRound(round: number, starting: Difficulty = 'sprout') {
  const index = Math.max(0, Math.floor(round) - 1);
  const levels: Difficulty[] = ['sprout', 'slicer', 'chef', 'master'];
  const difficulty = levels[Math.min(3, levels.indexOf(starting) + Math.floor(index / 3))];
  return {
    difficulty,
    factor: Math.max(.75, 1 - (difficulty==='master'?index-(3-levels.indexOf(starting))*3:index%3) * .04),
    gap: Math.max(1200, DIFFICULTIES[difficulty].gap - index * 45),
  };
}
