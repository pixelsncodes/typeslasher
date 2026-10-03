/** One source of truth for asset IDs, typing words, palettes, and pack metadata. */
export const FOOD_IDS = ['apple','banana','carrot','cookie','corn','grape','kiwi','pear','lime','plum','mango','peach','orange','donut','egg','pie','muffin','waffle','pretzel','popcorn','avocado','broccoli','sandwich','pineapple','strawberry','watermelon','tomato','cucumber','pepper','radish','beet','mushroom','zucchini','onion','lemon','raspberry','blueberry','cherry','fig','pomegranate','dragonfruit','apricot','bread','cheese','bagel','croissant','tofu','potato','pumpkin','celery'] as const;
export type FoodKind = typeof FOOD_IDS[number];
export type PackId = 'starter' | 'fresh' | 'snacks' | 'big' | 'garden' | 'market' | 'pantry';
export type FoodSelection = PackId | 'mixed';
export type FoodDefinition = {name: FoodKind; kind: FoodKind; pack: PackId; category: 'fruit'|'vegetable'|'snack'; color:number; accent:number; letters:number; keys:string; beginner:boolean};
const entries: [FoodKind,PackId,FoodDefinition['category'],number,number][] = [
  ['apple','starter','fruit',0xf04d55,0xffd6b9],['banana','starter','fruit',0xffd34e,0xfff5a5],
  ['carrot','starter','vegetable',0xff884d,0x71b968],['cookie','starter','snack',0xd8955c,0x5d392a],
  ['corn','starter','vegetable',0xffd84c,0x5aa752],['grape','starter','fruit',0xc14361,0xe9a4af],
  ['kiwi','starter','fruit',0x8abb57,0xf6dfa1],['pear','starter','fruit',0xb7d750,0xf0f4a7],
  ['lime','fresh','fruit',0x83b92d,0xd5e494],['plum','fresh','fruit',0x80416f,0xe8bf66],
  ['mango','fresh','fruit',0xf3a52a,0xffd567],['peach','fresh','fruit',0xef9476,0xf8c268],
  ['orange','fresh','fruit',0xff941e,0xffdc88],['donut','fresh','snack',0xf077a3,0xefc580],
  ['egg','snacks','snack',0xffefcd,0xe9aa22],['pie','snacks','snack',0xdca563,0x9c2b45],
  ['muffin','snacks','snack',0xdba669,0xead29a],['waffle','snacks','snack',0xdfab5c,0xf3d99d],
  ['pretzel','snacks','snack',0xc18038,0xedd4a2],['popcorn','snacks','snack',0xffe6a2,0xe6535b],
  ['avocado','big','fruit',0x83a64b,0xe0d797],['broccoli','big','vegetable',0x548c47,0xadd180],
  ['sandwich','big','snack',0xdac390,0xf4c54a],['pineapple','big','fruit',0xdca339,0xf4d274],
  ['strawberry','big','fruit',0xe74253,0xf5b4a3],['watermelon','big','fruit',0xf45c72,0xffadb2],
  ['tomato','garden','vegetable',0xed4e32,0xf3d48b],['cucumber','garden','vegetable',0x507b36,0xedf2c3],
  ['pepper','garden','vegetable',0xffcf37,0x75a34e],['radish','garden','vegetable',0xed5577,0xf5f2df],
  ['beet','garden','vegetable',0x9b294c,0xcb405c],['mushroom','garden','vegetable',0xc5a47b,0xf1e7d3],
  ['zucchini','garden','vegetable',0x568142,0xeff2c5],['onion','garden','vegetable',0xa54d78,0xf8e9e6],
  ['lemon','market','fruit',0xf6da3d,0xf8e9b5],['raspberry','market','fruit',0xed6175,0xf3b7ad],
  ['blueberry','market','fruit',0x7184b0,0xe0e8cc],['cherry','market','fruit',0xb52d46,0xdb5062],
  ['fig','market','fruit',0x76556c,0xee9c8c],['pomegranate','market','fruit',0xd34b57,0xf3deb7],
  ['dragonfruit','market','fruit',0xee6591,0xf5eee6],['apricot','market','fruit',0xf5ae51,0xffd174],
  ['bread','pantry','snack',0xd69e54,0xf0ddaf],['cheese','pantry','snack',0xf3cd6a,0xffe7a6],
  ['bagel','pantry','snack',0xd99c47,0xf0ddaf],['croissant','pantry','snack',0xd99b40,0xf0ddaf],
  ['tofu','pantry','snack',0xf0e9d3,0xd5cdb7],['potato','pantry','vegetable',0xcda46c,0xf2e5b1],
  ['pumpkin','pantry','vegetable',0xf59c24,0xf9bc62],['celery','pantry','vegetable',0xa8c96d,0xd6e5b1],
];
export const FOOD_CATALOG: readonly FoodDefinition[] = entries.map(([name,pack,category,color,accent])=>({name,kind:name,pack,category,color,accent,letters:name.length,keys:[...new Set(name)].sort().join(''),beginner:name.length<=6}));
export const FOOD_PACKS = {
  starter:{title:'Original favorites',file:'typeslasher-food-pack.glb',revision:5,description:'8 familiar foods · 4–6 letters'},
  fresh:{title:'Fresh picks',file:'typeslasher-fresh-pack.glb',revision:1,description:'6 new foods · 4–6 letters'},
  snacks:{title:'Snack break',file:'typeslasher-snacks-pack.glb',revision:1,description:'6 snacks · 3–7 letters'},
  big:{title:'Big bites',file:'typeslasher-big-pack.glb',revision:2,description:'6 longer words · 7–10 letters'},
  garden:{title:'Garden harvest',file:'typeslasher-garden-pack.glb',revision:1,description:'8 garden foods · 4–8 letters'},
  market:{title:'Fruit market',file:'typeslasher-market-pack.glb',revision:1,description:'8 juicy fruits · 3–11 letters'},
  pantry:{title:'Pantry & comfort',file:'typeslasher-pantry-pack.glb',revision:1,description:'8 comforting foods · 4–9 letters'},
} as const;
export const selectionTitle=(selection:FoodSelection)=>selection==='mixed'?'Mixed basket':FOOD_PACKS[selection].title;
export const validSelection=(value:unknown):value is FoodSelection=>value==='mixed'||typeof value==='string'&&Object.hasOwn(FOOD_PACKS,value);
export const packsForSelection=(selection:FoodSelection):PackId[]=>selection==='mixed'?Object.keys(FOOD_PACKS) as PackId[]:[selection];
export const foodsForSelection=(selection:FoodSelection)=>FOOD_CATALOG.filter(food=>selection==='mixed'||food.pack===selection);
export const foodsForPlay=(selection:FoodSelection,sprout:boolean)=>foodsForSelection(selection).filter(food=>selection!=='mixed'||!sprout||food.beginner);
export const packsForPlay=(selection:FoodSelection,sprout:boolean):PackId[]=>[...new Set(foodsForPlay(selection,sprout).map(food=>food.pack))];

/** Least-served eligible foods win; occupied initials never consume a turn. */
export class FoodSampler {
  private counts = new Map<string,number>();
  constructor(private pool:readonly FoodDefinition[],private random= Math.random) {}
  next(occupied:readonly string[]):FoodDefinition|undefined {
    const initials=new Set(occupied.map(word=>word[0]));
    const eligible=this.pool.filter(food=>!initials.has(food.name[0]));
    if(!eligible.length)return;
    const least=Math.min(...eligible.map(food=>this.counts.get(food.name)??0));
    const choices=eligible.filter(food=>(this.counts.get(food.name)??0)===least);
    const picked=choices[Math.min(choices.length-1,Math.floor(this.random()*choices.length))];
    this.counts.set(picked.name,least+1);return picked;
  }
}
