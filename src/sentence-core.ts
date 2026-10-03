export type TypingStyle = 'gentle' | 'exact';
export type PreparedPassage = { sentences: string[]; references: number; listItems: number; source: string };
const MAX_TEXT = 10_000;

function cleanLine(input: string, count: { references: number }): string {
  let text = input;
  text = text.replace(/\[\\\[(\d+(?:\s*[-–]\s*\d+)?)\\\]\]\([^)]*\)/g, () => { count.references++; return ''; });
  text = text.replace(/\[(\d+(?:\s*[-–]\s*\d+)?)\]\([^)]*\)/g, () => { count.references++; return ''; });
  text = text.replace(/\[(?:\d+(?:\s*[-–]\s*\d+)?|citation needed)\]/gi, () => { count.references++; return ''; });
  text = text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, '$1');
  text = text.replace(/<https?:\/\/[^>]+>/gi, ' ').replace(/https?:\/\/\S+/gi, ' ');
  text = text.replace(/[—–]/g, '-').replace(/\u00a0/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  return text.replace(/\s+/g, ' ').trim();
}

function splitProse(text: string): string[] {
  const protectedText = text
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|St)\./gi, '$1\uE000')
    .replace(/(\d)\.(\d)/g, '$1\uE000$2')
    .replace(/\b([A-Z])\.(?=[A-Z]\.?)\b/g, '$1\uE000');
  return (protectedText.match(/.*?[.!?]+(?:["')\]]+)?(?=\s|$)|.+$/g) ?? [])
    .map(piece => piece.replace(/\uE000/g, '.').trim()).filter(Boolean);
}

function plainBlocks(source: string): { text: string; item: boolean }[] {
  const blocks: { text: string; item: boolean }[] = [];
  let current = ''; let item = false;
  const flush = () => { if (current.trim()) blocks.push({ text: current.trim(), item }); current = ''; item = false; };
  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (!raw.trim()) { flush(); continue; }
    const match = raw.match(/^\s*(?:[-*•‣◦]\s+(?:\[[ xX]\]\s*)?|\d{1,3}[.)]\s+|[a-zA-Z][)]\s+)(.+)$/);
    if (match) { flush(); current = match[1]; item = true; continue; }
    current += (current ? ' ' : '') + raw.trim();
  }
  flush(); return blocks;
}

export function preparePassage(source: string, _style: TypingStyle, listBlocks?: { text: string; item: boolean }[]): PreparedPassage {
  if (source.length > MAX_TEXT) throw Error('Keep your text under 10,000 characters.');
  const count = { references: 0 };
  let listItems = 0;
  const sentences: string[] = [];
  for (const block of listBlocks ?? plainBlocks(source)) {
    const cleaned = cleanLine(block.text, count);
    if (!cleaned) continue;
    if (/[^\x20-\x7e]/.test(cleaned)) throw Error('This passage has characters that need editing before play.');
    if (block.item) listItems++;
    const pieces = block.item ? [cleaned] : splitProse(cleaned);
    for (const piece of pieces) {
      if (!piece) continue;
      if (/[^\x20-\x7e]/.test(piece)) throw Error('This passage has characters that need editing before play.');
      sentences.push(piece);
    }
  }
  if (!sentences.length) throw Error('Add some readable sentences to start.');
  if (sentences.some(sentence => sentence.length > 650)) throw Error('One sentence is over 650 characters. Add a full stop or split it into shorter sentences.');
  return { sentences, references: count.references, listItems, source };
}

export function extractClipboardHtml(html: string): { text: string; item: boolean }[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,svg,img,iframe,template,noscript').forEach(node => node.remove());
  doc.querySelectorAll('a').forEach(a => a.replaceWith(doc.createTextNode(a.textContent ?? '')));
  const result: { text: string; item: boolean }[] = [];
  const walk = (node: Element) => {
    if (node.matches('ul,ol')) { for (const child of Array.from(node.children)) walk(child); return; }
    if (node.matches('li')) { const clone = node.cloneNode(true) as Element; clone.querySelectorAll('ul,ol').forEach(el => el.remove()); result.push({ text: clone.textContent ?? '', item: true }); for (const nested of Array.from(node.querySelectorAll(':scope > ul,:scope > ol'))) walk(nested); return; }
    if (node.matches('p,h1,h2,h3,h4,h5,h6,blockquote')) { result.push({ text: node.textContent ?? '', item: false }); return; }
    for (const child of Array.from(node.children)) walk(child);
  };
  walk(doc.body);
  return result.length ? result : [{ text: doc.body.textContent ?? '', item: false }];
}

export type SentenceSnapshot = { index: number; cursor: number; error: string; attempts: number; correct: number; completed: boolean; start: number | null; elapsed: number };
export type SentenceEvent =
  | { type: 'character' | 'mistake'; sentence: number; cursor: number; expected: string }
  | { type: 'sentence'; sentence: number; final: boolean };
export class SentenceSession {
  readonly sentences: string[];
  index = 0; cursor = 0; error = ''; attempts = 0; correct = 0; completed = false;
  private started: number | null = null;
  private pausedAt: number | null = null;
  private finishedAt: number | null = null;
  private pausedMs = 0;
  private style: TypingStyle;
  private events: SentenceEvent[] = [];
  constructor(sentences: string[], style: TypingStyle = 'exact') { if (!sentences.length) throw Error('No sentences'); this.sentences = sentences; this.style = style; }
  get current() { return this.sentences[this.index]; }
  get next() { return this.sentences[this.index + 1]; }
  get completedSentences() { return this.completed ? this.sentences.length : this.index; }
  get active() { return this.elapsed(); }
  elapsed(now = performance.now()) { return this.started === null ? 0 : Math.max(0, (this.finishedAt ?? this.pausedAt ?? now) - this.started - this.pausedMs); }
  pause(now = performance.now()) { if (this.pausedAt === null) this.pausedAt = now; }
  resume(now = performance.now()) { if (this.pausedAt !== null) { this.pausedMs += now - this.pausedAt; this.pausedAt = null; } }
  input(key: string, now = performance.now()): 'wrong' | 'correct' | 'slash' | 'finished' | 'ignored' {
    if (this.completed || this.pausedAt !== null) return 'ignored';
    if (key === 'Backspace') { if (this.error) this.error = this.error.slice(0, -1); return 'ignored'; }
    if (key.length !== 1 || key < ' ' || key > '~') return 'ignored';
    if (this.started === null) { this.started = now; this.pausedMs = 0; }
    this.attempts++;
    const expected = this.current[this.cursor];
    const matches = this.style === 'gentle' ? key.toLowerCase() === expected.toLowerCase() : key === expected;
    if (this.error || !matches) { this.error = (this.error + key).slice(-8); this.events.push({type:'mistake',sentence:this.index,cursor:this.cursor,expected}); return 'wrong'; }
    this.events.push({type:'character',sentence:this.index,cursor:this.cursor,expected});
    this.correct++; this.cursor++;
    if (this.cursor < this.current.length) return 'correct';
    this.events.push({type:'sentence',sentence:this.index,final:this.index + 1 === this.sentences.length});
    if (this.index + 1 === this.sentences.length) { this.completed = true; this.finishedAt = now; return 'finished'; }
    this.index++; this.cursor = 0; this.error = ''; return 'slash';
  }
  drain(): SentenceEvent[] { const events = this.events; this.events = []; return events; }
  snapshot(now = performance.now()): SentenceSnapshot { return { index: this.index, cursor: this.cursor, error: this.error, attempts: this.attempts, correct: this.correct, completed: this.completed, start: this.started, elapsed: this.elapsed(now) }; }
}
