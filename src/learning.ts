export const FINGER_ZONES = [
  { id: 'lp', label: 'Left pinky', keys: 'qaz', home: 'A', color: '#ff96b0' },
  { id: 'lr', label: 'Left ring', keys: 'wsx', home: 'S', color: '#eab779' },
  { id: 'lm', label: 'Left middle', keys: 'edc', home: 'D', color: '#e7da85' },
  { id: 'li', label: 'Left index', keys: 'rfvtgb', home: 'F', color: '#83d8b0' },
  { id: 'ri', label: 'Right index', keys: 'yhnujm', home: 'J', color: '#83d8b0' },
  { id: 'rm', label: 'Right middle', keys: 'ik,', home: 'K', color: '#e7da85' },
  { id: 'rr', label: 'Right ring', keys: 'ol.', home: 'L', color: '#eab779' },
  { id: 'rp', label: 'Right pinky', keys: 'p;/', home: ';', color: '#ff96b0' },
] as const;
export const fingerFor = (key: string) => FINGER_ZONES.find(zone => zone.keys.includes(key.toLowerCase()) && key.length === 1);
export const LESSONS = [
  { id: 'anchors', title: 'Find your anchors', note: 'Feel the bumps on F and J with your index fingers.', patterns: ['fjfj', 'jfjf', 'ffjj', 'jjff', 'fjjf', 'jffj'] },
  { id: 'left', title: 'Left-hand ingredients', note: 'Pinky A · ring S · middle D · index F. Return to home row.', patterns: ['asdf', 'fdsa', 'sadd', 'fads', 'dada', 'asdf'] },
  { id: 'right', title: 'Right-hand ingredients', note: 'Index J · middle K · ring L · pinky semicolon.', patterns: ['jkl;', ';lkj', 'jjkk', 'll;;', 'jlk;', ';jkl'] },
  { id: 'mix', title: 'Mix both hands', note: 'Keep your hands relaxed. Let each finger do its own job.', patterns: ['fjdk', 'sla;', 'asdf', 'jkl;', 'a;sl', 'dkfj'] },
] as const;
export type KeyStats = Record<string, { attempts: number; correct: number }>;
export type Session = { mode: 'arcade' | 'beat' | 'prep'; label: string; attempts: number; correct: number; score: number; completed: number; activeMs: number };
export type Progress = { version: 1; keys: KeyStats; sessions: Session[]; rounds: number; lessons: number; foods: number; best: Record<string, number> };
export const emptyProgress = (): Progress => ({ version: 1, keys: {}, sessions: [], rounds: 0, lessons: 0, foods: 0, best: {} });
const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1e9;
export const validBestKey = (key: string) => /^(relaxed|steady|brisk)$|^(beat-|run-)?(sprout|slicer|chef|master)-(relaxed|steady|brisk)-(adaptive|fixed)(-(fresh|snacks|big|garden|market|pantry|mixed))?(-(30|60|90)s)?$/.test(key);
export function parseProgress(raw: string | null): Progress {
  try {
    const p = JSON.parse(raw ?? 'null');
    if (p?.version !== 1 || !p.keys || !Array.isArray(p.sessions) || !finite(p.rounds) || !finite(p.lessons)) return emptyProgress();
    const result = emptyProgress(); result.rounds = p.rounds; result.lessons = p.lessons;
    for (const zone of FINGER_ZONES) for (const key of zone.keys) {
      const stat = p.keys[key];
      if (stat && finite(stat.attempts) && stat.attempts > 0 && finite(stat.correct) && stat.correct <= stat.attempts) result.keys[key] = stat;
    }
    for (const key of Object.keys(p.best??{})) if(validBestKey(key) && finite(p.best[key]))result.best[key]=p.best[key];
    result.sessions = p.sessions.filter((s: Session) => s && ['arcade', 'beat', 'prep'].includes(s.mode) && typeof s.label === 'string' && s.label.length < 50 && finite(s.attempts) && finite(s.correct) && s.correct <= s.attempts && typeof s.score === 'number' && Number.isFinite(s.score) && Math.abs(s.score) <= 1e9 && finite(s.completed) && finite(s.activeMs)).slice(-12);
    result.foods = finite(p.foods) ? p.foods : result.sessions.reduce((sum, session) => sum + (session.mode !== 'prep' ? session.completed : 0), 0);
    return result;
  } catch { return emptyProgress(); }
}
export function recordKey(stats: KeyStats, expected: string, actual: string) {
  if (!fingerFor(expected)) return;
  const stat = stats[expected] ??= { attempts: 0, correct: 0 };
  stat.attempts++; if (actual === expected) stat.correct++;
}
export function addSession(progress: Progress, session: Session, keys: KeyStats) {
  const next: Progress = structuredClone(progress);
  for (const [key, stat] of Object.entries(keys)) {
    const total = next.keys[key] ??= { attempts: 0, correct: 0 };
    total.attempts += stat.attempts; total.correct += stat.correct;
  }
  next.sessions = [...next.sessions, session].slice(-12);
  if (session.mode !== 'prep') { next.rounds++; next.foods += session.completed; if (validBestKey(session.label)) next.best[session.label] = Math.max(next.best[session.label] ?? 0, session.score); }
  else next.lessons++;
  return next;
}
export function weakKeys(stats: KeyStats) {
  return Object.entries(stats).filter(([, s]) => s.attempts >= 5 && s.correct < s.attempts)
    .sort((a,b) => a[1].correct/a[1].attempts - b[1].correct/b[1].attempts || b[1].attempts-a[1].attempts).slice(0,3).map(([key])=>key);
}
export function practiceTip(stats: KeyStats) {
  const key = weakKeys(stats)[0];
  return key ? `Try ${key.toUpperCase()} slowly with your ${fingerFor(key)!.label.toLowerCase()}, then return to home row.` : 'Keep accuracy first. Try a short home-row warm-up before your next round.';
}
export function createProgressStore(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined) {
  let progress = emptyProgress(); let saved = true;
  try { progress = parseProgress(storage?.getItem('typeslasher-learning-v1') ?? null); saved = !!storage; } catch { saved = false; }
  const persist = () => { try { if (!storage) throw new Error('No storage'); storage.setItem('typeslasher-learning-v1', JSON.stringify(progress)); saved = true; } catch { saved = false; } };
  return {
    get: () => progress,
    saved: () => saved,
    complete(session: Session, keys: KeyStats) { progress = addSession(progress, session, keys); persist(); },
    reset() { progress = emptyProgress(); persist(); },
  };
}
export type ProgressStore = ReturnType<typeof createProgressStore>;
