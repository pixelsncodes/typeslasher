import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/food-catalog.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {FOOD_CATALOG,FOOD_IDS,FoodSampler,foodsForSelection,foodsForPlay,packsForPlay,packsForSelection,validSelection}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
assert.equal(FOOD_CATALOG.length,50);assert.equal(new Set(FOOD_IDS).size,50);
for(const food of FOOD_CATALOG){assert.equal(food.name,food.kind);assert.equal(food.letters,food.name.length);assert.equal(food.keys,[...new Set(food.name)].sort().join(''));assert.ok(/^[a-z]+$/.test(food.name));}
assert.deepEqual(packsForSelection('fresh'),['fresh']);assert.equal(foodsForSelection('starter').length,8);assert.equal(foodsForSelection('mixed').length,50);
assert.equal(foodsForPlay('mixed',true).length,32);assert.ok(foodsForPlay('mixed',true).every(f=>f.letters<=6));
assert.ok(!packsForPlay('mixed',true).includes('big'));assert.equal(foodsForPlay('big',true).length,6);
assert.equal(foodsForPlay('mixed',false).length,50);
assert.equal(validSelection('garbage'),false);
for(const selection of ['starter','fresh','snacks','big','garden','market','pantry','mixed']){
  const pool=foodsForSelection(selection);const sampler=new FoodSampler(pool,()=>.2);
  // Without occupied initials, every food is served before any repeats.
  for(let round=0;round<4;round++)assert.equal(new Set(Array.from({length:pool.length},()=>sampler.next([]).name)).size,pool.length);
  const active=[];for(let i=0;i<100;i++){
    const next=sampler.next(active.map(food=>food.name));assert.ok(next);
    assert.ok(!active.some(food=>food.name[0]===next.name[0]));active.push(next);if(active.length>=4)active.shift();
  }
}
const sampler=new FoodSampler(foodsForSelection('fresh'),()=>0);
assert.equal(sampler.next(['lime','plum','mango','orange','donut']),undefined);
assert.equal(sampler.next(['plum']).name,'lime');
console.log('Passed: 50-food catalog, beginner pool, per-pack loading choices, fair sampling, and distinct initials across four targets.');
