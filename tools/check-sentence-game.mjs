import assert from 'node:assert/strict';
import {SentenceSession,preparePassage} from '../src/sentence-core.ts';
import {SentenceKitchen} from '../src/sentence-game.ts';
import {createSentenceProgress} from '../src/sentence-progress.ts';

function run(sentences,mode='relaxed',pace=30,style='exact'){
  const session=new SentenceSession(sentences,style),kitchen=new SentenceKitchen(sentences,mode,pace);
  let now=1000;
  const input=(key,delay=100)=>{now+=delay;const result=session.input(key,now);const events=session.drain();const effects=kitchen.consume(events,session.elapsed(now));return {result,events,effects};};
  const type=text=>[...text].flatMap(key=>input(key).effects);
  return {session,kitchen,input,type,time:()=>now};
}
const one=run(['Hi!']);
assert.equal(one.type('Hi!').filter(e=>e.type==='cut').length,1);
assert.equal(one.kitchen.served,1);assert.equal(one.kitchen.score,130);
assert.equal(one.input('!').effects.length,0);assert.equal(one.kitchen.score,130);
const combo=run(['a b c d e f']);combo.type('a b c d e');
assert.equal(combo.kitchen.multiplier,2);combo.type(' f');assert.equal(combo.kitchen.score,170);
assert.equal(combo.kitchen.bestStreak,6);
const error=run(['cat dog']);error.type('c');error.input('x');error.input('a');
assert.equal(error.session.cursor,1);error.input('Backspace');error.input('Backspace');error.type('at dog');
assert.equal(error.kitchen.score,60);assert.equal(error.kitchen.cleanSentences,0);assert.equal(error.kitchen.bestStreak,1);
assert.equal(error.session.attempts,9);assert.equal(error.session.correct,7);
const space=run(['a b']);space.type('a');space.input('x');space.input('Backspace');space.type(' b');
assert.equal(space.kitchen.streak,0);assert.equal(space.kitchen.score,20);
const exact=run(['Don\'t stop.','Go!']);const effects=exact.type("Don't stop.Go!");
assert.equal(effects.filter(e=>e.type==='cut').length,3);assert.equal(exact.kitchen.served,2);
assert.equal(exact.kitchen.score,330);
const gentle=run(preparePassage("I've seen it. Don't stop!",'gentle').sentences,'relaxed',30,'gentle');
gentle.type("i've seen it.don't stop!");assert.equal(gentle.session.completed,true);assert.equal(gentle.kitchen.served,2);
const punctuation=run(['...']);punctuation.type('...');assert.equal(punctuation.kitchen.streak,0);assert.equal(punctuation.kitchen.cuts,1);
const rush=run(['a','bb'],'rush');rush.type('a');assert.equal(rush.kitchen.freshOrders,1);
assert.equal(rush.kitchen.freshness(1,900_000),1,'next order has not started');
rush.input('b');rush.input('b',20_000);assert.equal(rush.kitchen.freshOrders,1);assert.equal(rush.kitchen.served,2);
const paused=run(['ab'],'rush');paused.input('a');const before=paused.session.elapsed(paused.time());
paused.session.pause(paused.time());paused.session.resume(paused.time()+100_000);
assert.equal(paused.session.elapsed(paused.time()+100_000),before);
const finalEvents=paused.input('b',100_001).events;paused.kitchen.consume(finalEvents,paused.session.elapsed(paused.time()));
assert.equal(paused.kitchen.served,1);assert.equal(paused.kitchen.cuts,1);assert.equal(paused.kitchen.freshOrders,1);
const earlyPause=new SentenceSession(['ab']);earlyPause.pause(1000);earlyPause.resume(9000);earlyPause.input('a',10000);assert.equal(earlyPause.elapsed(11000),1000);
const samples=new SentenceKitchen(['abc']);samples.sample(3000,15);samples.sample(6000,30);assert.deepEqual(samples.samples.map(s=>s.wpm),[60,60]);
samples.sample(6000,30,true);assert.equal(samples.samples.length,2);
for(let t=9000;t<900000;t+=3000)samples.sample(t,t/200);assert.ok(samples.samples.length<=180);
for(const wpm of [15,30,60,100])for(const style of ['gentle','exact']){
  const text=style==='exact'?"Careful keys, clean cuts! "+'Practice '.repeat(20).trim():"Careful keys clean cuts "+'practice '.repeat(20).trim();
  const sim=run([text],'rush',30,style);let i=0;
  for(const key of text){if(++i%19===0){sim.input('~',12000/wpm);sim.input('Backspace',12000/wpm);}sim.input(key,12000/wpm);}
  assert.equal(sim.session.completed,true);assert.equal(sim.kitchen.served,1);assert.equal(sim.kitchen.cuts,text.split(' ').length);
  assert.equal(sim.kitchen.cleanSentences,0);assert.ok(sim.session.correct<sim.session.attempts);
}
const record={style:'gentle',attempts:2,correct:2,characters:2,sentences:1,total:1,activeMs:100,complete:true};
let raw=JSON.stringify({version:1,records:[record]});const storage={getItem:()=>raw,setItem:(_key,value)=>raw=value};
const history=createSentenceProgress(storage);assert.equal(history.records().length,1);
history.add({...record,mode:'rush',pace:30,score:120,bestStreak:1,source:'private passage'});
assert.equal(JSON.parse(raw).version,2);assert.ok(!raw.includes('private passage'));assert.equal(createSentenceProgress(storage).records()[1].mode,'rush');
const invalid=JSON.stringify({version:2,records:[{...record,score:-1},{...record,mode:'invented'}]});
assert.equal(createSentenceProgress({getItem:()=>invalid,setItem:()=>{}}).records().length,0);
console.log('Passed: word/space/punctuation boundaries, combos, correction, duplicate completion, Rush expiry, paused clocks, speed samples, 15–100 WPM simulations, and history migration.');
