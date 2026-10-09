import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import ts from 'typescript';
import {SentenceSession,preparePassage} from '../src/sentence-core.ts';
import {SentenceKitchen} from '../src/sentence-game.ts';
import {createSentenceProgress} from '../src/sentence-progress.ts';
const transpile=name=>ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const data=source=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const recipeUrl=data(transpile('kitchen-recipes'));
const {planOrders,IngredientBatch,RESTAURANT_MENU}=await import(data(transpile('restaurant-orders').replace("'./kitchen-recipes'",JSON.stringify(recipeUrl))));
const passage=preparePassage(RESTAURANT_MENU.map(item=>item.sentence).join(' '),'gentle');
const orders=planOrders(passage.sentences,'fruit');
assert.deepEqual(orders.map(order=>order.recipe),RESTAURANT_MENU.map(item=>item.recipe));
assert.equal(orders[0].ingredients.length,6);
for(const fallback of Object.keys((await import(recipeUrl)).RECIPES)){
  const custom=planOrders(Array.from({length:23},(_,i)=>`Custom sentence ${i}.`),fallback);
  assert.equal(custom[0].recipe,fallback,'Selected dish starts a custom passage');
  for(let start=0;start<custom.length;start+=10){
    const deck=custom.slice(start,start+10);assert.equal(new Set(deck.map(order=>order.recipe)).size,deck.length,'Recipes repeat before the full menu is used');
  }
  custom.forEach((order,i)=>{if(i)assert.notEqual(order.recipe,custom[i-1].recipe,'Same recipe across menu boundaries');});
}
const repeated=planOrders(Array(4).fill(RESTAURANT_MENU[0].sentence),'fruit');
assert.equal(new Set(repeated.map(order=>order.recipe)).size,4,'Repeated recipe sentences still get different order cards');
assert.deepEqual(repeated.map(order=>order.sentence),Array(4).fill(RESTAURANT_MENU[0].sentence),'Keep the player’s passage unchanged');
for(const order of orders){
  const batch=new IngredientBatch(order.ingredients),slots=batch.basket;
  assert.equal(batch.take(1),false,'Cannot skip the first ingredient');
  for(const index of slots){
    assert.ok(batch.take(index));const remaining=batch.basket;
    assert.equal(batch.take(index+1),false,'Only one ingredient on the board');
    assert.deepEqual(batch.basket,remaining,'Typing cannot replace waiting items');
    assert.ok(batch.cut(index));assert.equal(batch.take(index+1),false,'Wait for the pieces to land');
    assert.ok(batch.settle(index));assert.equal(batch.settle(index),false);
    assert.equal(batch.bowl.length,index+1);
  }
  assert.ok(batch.complete);assert.deepEqual(batch.basket,[]);
  batch.clear();assert.deepEqual(batch.bowl,[]);assert.equal(batch.complete,false);
  assert.equal(batch.take(0),false);assert.equal(batch.settle(0),false);
  assert.ok(statSync(new URL(`../public/assets/recipes/${order.recipe}.webp`,import.meta.url)).size>1000);
}
// A short custom sentence still prepares all six ingredients, even at one checkpoint.
const tiny=planOrders(['Hi!'],'fruit')[0];assert.equal(tiny.cutOrdinals.length,6);assert.ok(tiny.cutOrdinals.every(n=>n===0));
const session=new SentenceSession(['Apple.','Pear.'],'exact'),kitchen=new SentenceKitchen(session.sentences,'rush',30);
session.start(1000);kitchen.startOrder(0,0);
assert.equal(kitchen.freshness(1,1e6),1,'Queued orders do not age');
assert.equal(kitchen.expire(0,11999),false);assert.equal(kitchen.expire(0,12000),true);
assert.equal(kitchen.expire(0,12001),false,'Loss is recorded once');assert.equal(kitchen.lostOrders,1);
assert.deepEqual(kitchen.consume([{type:'sentence',sentence:0,final:false}],12001),[],'Expired order cannot serve');
assert.equal(session.skip(13000),'slash');assert.equal(session.completedSentences,0);
assert.equal(session.resolvedCharacters,6);assert.equal(session.error,'');
kitchen.startOrder(1,12000);session.pause(13000);session.resume(113000);
assert.equal(session.elapsed(114000),13000,'Pause does not consume deadline');
let now=114000;for(const key of 'Pear.'){session.input(key,now++);kitchen.consume(session.drain(),session.elapsed(now));}
assert.equal(kitchen.served,1);assert.equal(session.completedSentences,1);assert.equal(session.resolvedCharacters,11);
assert.equal(session.skip(now),'ignored');
const allLost=new SentenceSession(['A.']);allLost.start(0);allLost.skip(12000);assert.equal(allLost.completed,true);assert.equal(allLost.completedSentences,0);
const relaxed=new SentenceKitchen(['A.'],'relaxed');relaxed.startOrder(0,0);assert.equal(relaxed.expire(0,1e9),false);
const fresh=new SentenceKitchen(['A.'],'rush');fresh.startOrder(0,0);assert.equal(fresh.freshness(0,0),1);assert.equal(fresh.lostOrders,0);
let stored;const storage={getItem:()=>stored,setItem:(_,value)=>stored=value};
const progress=createSentenceProgress(storage);progress.add({style:'exact',attempts:5,correct:5,characters:5,sentences:1,total:2,activeMs:13000,complete:true,lostOrders:1});
assert.equal(createSentenceProgress(storage).records()[0].lostOrders,1);
console.log('Passed: varied recipe decks, fixed inventory, sequential cutting/plating, short sentences, idle deadlines, one-time expiry, queued timers, pause, serving after loss, retry and lost-order history.');
