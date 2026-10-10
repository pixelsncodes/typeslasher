// Blade contact precedes separation; transfer starts after the blade retracts.
export const FRUIT_MIX = ['apple', 'kiwi', 'pear', 'orange', 'mango'] as const;
export const CUT_CONTACT = .26;
export const CUT_RELEASE = .43;
export const CUT_END = .86;
export const NEXT_FRUIT_DELAY = .25;
export const INGREDIENT_INTAKE = .32;
export const FINAL_PREP_DURATION = 2.1;

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

// Milestones unlock whole preparation cycles. The paused scene clock animates
// between them, so releasing a key never freezes the knife in mid-cut.
export class IngredientPrepTimeline {
  private target=0;
  private value=0;
  private previous=0;
  private finish:{born:number;from:number;leadTo:number;leadDuration:number;tailDuration:number}|undefined;
  readonly count:number;
  constructor(count:number){this.count=count;}
  get progress(){return this.value/this.count;}
  get busy(){return this.value<this.target;}
  advance(now:number,reduced=false){
    const elapsed=Math.max(0,now-this.previous);this.previous=now;
    if(reduced)this.value=this.target;
    else if(this.finish){
      const {born,from,leadTo,leadDuration,tailDuration}=this.finish;
      const age=Math.max(0,now-born);
      // Catch up earlier ingredients separately, so fast typing never squeezes
      // the final arrival, chop and landing into the same short deadline.
      if(age<leadDuration)this.value=Math.max(this.value,from+(leadTo-from)*age/leadDuration);
      else {
        const t=tailDuration?Math.min(1,(age-leadDuration)/tailDuration):1;
        const eased=1-Math.pow(1-t,1.5);
        this.value=Math.max(this.value,leadTo+(this.count-leadTo)*eased);
      }
    }else this.value=Math.min(this.target,this.value+elapsed*Math.max(1,(this.target-this.value)/1.5)/(INGREDIENT_INTAKE+CUT_END+NEXT_FRUIT_DELAY));
    return this.progress;
  }
  unlock(completed:number,now:number,final=false){
    this.advance(now);
    this.target=Math.max(this.target,Math.min(this.count,completed));
    if(final&&!this.finish){
      this.target=this.count;
      const leadTo=Math.max(this.value,this.count-1);
      this.finish={born:now,from:this.value,leadTo,leadDuration:Math.min(1.4,(leadTo-this.value)*.32),tailDuration:(this.count-leadTo)*FINAL_PREP_DURATION};
    }
  }
}

export function ingredientPrepPose(progress:number,index:number,count:number) {
  const sentence=Math.max(0,Math.min(1,progress));
  const interval=sentence*count-index;
  const local=Math.max(0,Math.min(1,interval));
  const intakeTime=INGREDIENT_INTAKE;
  // The final landing ends preparation directly; no extra inter-item rest.
  const age=local*(intakeTime+CUT_END+(index===count-1?0:NEXT_FRUIT_DELAY));
  const cut=cutPose(local===1?CUT_END:Math.max(0,age-intakeTime));
  return {started:interval>0,intake:smooth(age/intakeTime),cut};
}
