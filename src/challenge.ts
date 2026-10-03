export const DIFFICULTIES = {
  sprout: { title: 'Sprout', capacity: 1, gap: 1700, factor: 1, min: .9, max: 1.3 },
  slicer: { title: 'Slicer', capacity: 2, gap: 2500, factor: .9, min: .75, max: 1.3 },
  chef: { title: 'Chef', capacity: 3, gap: 2200, factor: .8, min: .65, max: 1.25 },
  master: { title: 'Master', capacity: 4, gap: 1900, factor: .7, min: .55, max: 1.2 },
} as const;
export type Difficulty = keyof typeof DIFFICULTIES;
export const THEMES = {
  midnight: { title: 'Midnight kitchen', unlock: 0 },
  watermelon: { title: 'Watermelon pop', unlock: 10 },
  citrus: { title: 'Citrus rush', unlock: 25 },
} as const;
export type Theme = keyof typeof THEMES;
export const completedFoods = (sessions: readonly {mode:string;completed:number}[]) => sessions.reduce((sum,session)=>sum+(session.mode==='arcade'?session.completed:0),0);
export const unlockedThemes = (completed: number) => (Object.keys(THEMES) as Theme[]).filter(theme=>completed>=THEMES[theme].unlock);
export class ChallengeDirector {
  pressure = 0;
  resolved = 0;
  successes = 0;
  attempts = 0;
  correct = 0;
  constructor(public difficulty: Difficulty, public adaptive = true) {}
  budget(base: number) {
    const p=DIFFICULTIES[this.difficulty];
    return Math.round(base*Math.max(p.min,Math.min(p.max,p.factor-this.pressure*.05)));
  }
  key(correct: boolean) {this.attempts++;if(correct)this.correct++;}
  resolve(success: boolean): 'harder' | 'easier' | undefined {
    this.resolved++;if(success)this.successes++;
    if(this.resolved<10)return;
    const accuracy=this.attempts?this.correct/this.attempts:0;
    const previous=this.pressure;
    if(this.adaptive) {
      if(this.successes>=9 && accuracy>=.95)this.pressure=Math.min(3,this.pressure+1);
      else if(this.successes<=7 || accuracy<.85)this.pressure=Math.max(-4,this.pressure-1);
    }
    this.resolved=0;this.successes=0;this.attempts=0;this.correct=0;
    return this.pressure>previous?'harder':this.pressure<previous?'easier':undefined;
  }
}
export function chooseWord<T extends {name:string}>(catalog: readonly T[], occupied: string[], start: number): T | undefined {
  for(let i=0;i<catalog.length;i++) {const candidate=catalog[(start+i)%catalog.length];if(!occupied.some(word=>word[0]===candidate.name[0]))return candidate;}
}
export function selectTarget<T>(targets: T[], locked: T | undefined, key: string, name: (target: T)=>string) {
  return locked && targets.includes(locked) ? locked : targets.find(target=>name(target)[0]===key);
}
