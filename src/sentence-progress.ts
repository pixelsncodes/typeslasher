import type { TypingStyle } from './sentence-core';

export type SentenceRecord = { style: TypingStyle; attempts: number; correct: number; characters: number; sentences: number; total: number; activeMs: number; complete: boolean; mode?: 'relaxed'|'rush'; pace?:number; score?:number; bestStreak?:number; cleanSentences?:number; freshOrders?:number; lostOrders?:number };
export function createSentenceProgress(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
  const key = 'typeslasher-sentences-v1';
  let records: SentenceRecord[] = [];
  try {
    const raw = JSON.parse(storage?.getItem(key) ?? 'null');
    if ([1,2].includes(raw?.version) && Array.isArray(raw.records)) records = raw.records.filter((r: SentenceRecord) =>
      r && ['gentle','exact'].includes(r.style) && [r.attempts,r.correct,r.characters,r.sentences,r.total,r.activeMs].every(n => Number.isFinite(n) && n >= 0 && n <= 1e9) && r.correct <= r.attempts && r.sentences <= r.total && typeof r.complete === 'boolean' && (r.mode===undefined||['relaxed','rush'].includes(r.mode)) && [r.pace,r.score,r.bestStreak,r.cleanSentences,r.freshOrders,r.lostOrders].every(n=>n===undefined||Number.isFinite(n)&&n>=0&&n<=1e9)).slice(-12).map(cleanRecord);
  } catch { /* Damaged or unavailable storage does not block practice. */ }
  return {
    records: () => records.slice(),
    add(record: SentenceRecord) { records = [...records, cleanRecord(record)].slice(-12); try { storage?.setItem(key, JSON.stringify({ version: 2, records })); } catch { /* Keep session in memory. */ } },
    reset() { records = []; try { storage?.setItem(key, JSON.stringify({ version: 2, records })); } catch { /* Optional persistence. */ } },
  };
}
function cleanRecord(r:SentenceRecord):SentenceRecord {
  const {style,attempts,correct,characters,sentences,total,activeMs,complete,mode,pace,score,bestStreak,cleanSentences,freshOrders,lostOrders}=r;
  return {style,attempts,correct,characters,sentences,total,activeMs,complete,mode,pace,score,bestStreak,cleanSentences,freshOrders,lostOrders};
}
