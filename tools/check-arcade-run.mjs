import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compiled=(file)=>`data:text/javascript;base64,${Buffer.from(ts.transpileModule(readFileSync(new URL('../src/'+file,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace("'./challenge.ts'",JSON.stringify(challengeUrl))).toString('base64')}`;
let challengeUrl='';challengeUrl=compiled('challenge.ts');
const {DIFFICULTIES}=await import(challengeUrl);
const {arcadeRound,ROUND_SECONDS,validRoundSeconds}=await import(compiled('arcade-run.ts'));
const {validBestKey,addSession,emptyProgress,parseProgress}=await import(compiled('learning.ts'));
const {RECIPES}=await import(compiled('kitchen-recipes.ts'));
const {FOOD_CATALOG}=await import(compiled('food-catalog.ts'));
assert.deepEqual(ROUND_SECONDS,[30,60,90]);
for(const seconds of ROUND_SECONDS)assert.ok(validRoundSeconds(seconds));
for(const seconds of [0,20,45,120,NaN])assert.equal(validRoundSeconds(seconds),false);
for(const start of Object.keys(DIFFICULTIES)){
  let previousBudget=Infinity,capacity=0;
  for(let round=1;round<=50;round++){
    const stage=arcadeRound(round,start),config=DIFFICULTIES[stage.difficulty];
    const budget=config.factor*stage.factor;
    assert.ok(budget<=previousBudget,'new rounds never increase typing windows');
    assert.ok(config.capacity>=capacity&&config.capacity<=4);
    assert.ok(stage.gap>=1200);previousBudget=budget;capacity=config.capacity;
  }
}
assert.equal(arcadeRound(1).difficulty,'sprout');
assert.equal(arcadeRound(4).difficulty,'slicer');
assert.equal(arcadeRound(7).difficulty,'chef');
assert.equal(arcadeRound(10).difficulty,'master');
const label='run-sprout-relaxed-fixed-mixed-30s';assert.ok(validBestKey(label));
let p=addSession(emptyProgress(),{mode:'arcade',label,attempts:10,correct:10,score:100,completed:2,activeMs:30000},{});
assert.equal(parseProgress(JSON.stringify(p)).best[label],100);
assert.ok(validBestKey('sprout-relaxed-fixed-30s'));
assert.ok(validBestKey('sprout-relaxed-fixed-90s'));
assert.equal(validBestKey('sprout-relaxed-fixed-45s'),false);
for(const recipe of Object.values(RECIPES))for(const kind of recipe.items){
  assert.ok(FOOD_CATALOG.some(food=>food.kind===kind));
  assert.ok(!['cookie','donut','pie','muffin','waffle','pretzel','popcorn','sandwich'].includes(kind),'recipe ingredients fit a produce bowl');
}
assert.ok(RECIPES.fruit.items.length>=12);
console.log('Passed: round durations, gradual arcade progression, separate records, and coherent recipe pools.');
