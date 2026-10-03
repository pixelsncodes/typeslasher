import type { SentenceEvent } from './sentence-core';

export type ServiceMode = 'relaxed' | 'rush';
export type ServiceToken = { start: number; end: number; text: string; ordinal: number; word: boolean };
export type ServiceEffect = { type: 'cut' | 'serve'; ordinal: number; points: number; clean: boolean; fresh?: boolean };
export type SpeedSample = { seconds: number; wpm: number };

export class SentenceKitchen {
  readonly tokens: ServiceToken[][];
  readonly totalCharacters: number;
  readonly mode: ServiceMode;
  readonly pace: number;
  score = 0; streak = 0; bestStreak = 0; cleanSentences = 0; served = 0; freshOrders = 0; cuts = 0;
  samples: SpeedSample[] = [];
  mistakes = new Map<string, number>();
  private dirtyWords = new Set<string>();
  private dirtySentences = new Set<number>();
  private awarded = new Set<string>();
  private servedIds = new Set<number>();
  private tokenMultipliers = new Map<string, number>();
  private starts = new Map<number, number>();
  private lastSample = 0;
  private lastCorrect = 0;
  constructor(sentences: readonly string[], mode: ServiceMode = 'relaxed', pace = 30) {
    this.mode = mode; this.pace = [20,30,45,60].includes(pace) ? pace : 30;
    let ordinal = 0;
    this.tokens = sentences.map(text => Array.from(text.matchAll(/\S+/g), match => ({start:match.index!,end:match.index!+match[0].length,text:match[0],ordinal:ordinal++,word:/[a-z0-9]/i.test(match[0])})));
    this.totalCharacters = sentences.reduce((sum, text) => sum + text.length, 0);
  }
  get multiplier() { return Math.min(5, 1 + Math.floor(this.streak / 5)); }
  allowance(sentence: number) { return Math.max(12_000, 4000 + 60_000 * (this.tokens[sentence]?.at(-1)?.end ?? 0) / (5 * this.pace)); }
  freshness(sentence: number, activeMs: number) {
    const start = this.starts.get(sentence);
    return start === undefined ? 1 : Math.max(0, 1 - (activeMs - start) / this.allowance(sentence));
  }
  tokenAt(sentence: number, cursor: number) {
    const tokens = this.tokens[sentence] ?? [];
    return tokens.find(token => cursor < token.end) ?? tokens.at(-1);
  }
  consume(events: SentenceEvent[], activeMs: number): ServiceEffect[] {
    const effects: ServiceEffect[] = [];
    for (const event of events) {
      if (!this.starts.has(event.sentence)) this.starts.set(event.sentence, activeMs);
      if (event.type === 'sentence') {
        if (this.servedIds.has(event.sentence)) continue;
        this.servedIds.add(event.sentence); this.served++;
        const clean = !this.dirtySentences.has(event.sentence);
        const fresh = this.mode === 'rush' && this.freshness(event.sentence, activeMs) > 0;
        if (clean) this.cleanSentences++;
        if (fresh) this.freshOrders++;
        const points = (clean ? 100 : 0) + (fresh ? 150 : 0);
        this.score += points;
        effects.push({type:'serve',ordinal:this.cuts,points,clean,fresh});
        continue;
      }
      const token = this.tokenAt(event.sentence, event.cursor);
      if (!token) continue;
      const id = `${event.sentence}:${token.ordinal}`;
      if (event.type === 'mistake') {
        this.dirtyWords.add(id); this.dirtySentences.add(event.sentence); this.streak = 0;
        this.mistakes.set(event.expected,(this.mistakes.get(event.expected) ?? 0)+1);
        continue;
      }
      if (!this.tokenMultipliers.has(id)) this.tokenMultipliers.set(id,this.multiplier);
      if (event.cursor + 1 !== token.end || this.awarded.has(id)) continue;
      this.awarded.add(id); this.cuts++;
      const clean = !this.dirtyWords.has(id);
      const points = token.text.length * 10 * (clean ? this.tokenMultipliers.get(id)! : 1);
      this.score += points;
      if (clean && token.word) { this.streak++; this.bestStreak = Math.max(this.bestStreak,this.streak); }
      effects.push({type:'cut',ordinal:token.ordinal,points,clean});
    }
    return effects;
  }
  sample(activeMs: number, correct: number, final = false) {
    if (activeMs - this.lastSample < (final ? 500 : 3000)) return;
    const wpm = Math.round((correct-this.lastCorrect)*12_000/(activeMs-this.lastSample));
    this.samples.push({seconds:activeMs/1000,wpm});
    this.lastSample=activeMs;this.lastCorrect=correct;
    if(this.samples.length>180) this.samples.splice(0,2,{seconds:this.samples[1].seconds,wpm:Math.round((this.samples[0].wpm+this.samples[1].wpm)/2)});
  }
}
