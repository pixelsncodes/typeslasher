import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
async function module(name) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`, import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { parsePreferences, createPreferences } = await module('preferences');
assert.equal(parsePreferences('broken', true).reduced, true);
const bounded = parsePreferences(JSON.stringify({version:1,music:99,effects:-1,muted:'yes',quality:'ultra',beatOffset:999}));
assert.equal(bounded.music,1);assert.equal(bounded.effects,0);assert.equal(bounded.muted,false);assert.equal(bounded.quality,'auto');assert.equal(bounded.beatOffset,200);
let saved;const storage={getItem:()=>saved,setItem:(_,v)=>saved=v};
createPreferences(storage).update({muted:true,reduced:true,quality:'low'});
assert.equal(createPreferences(storage).get().muted,true);assert.equal(createPreferences(storage).get().quality,'low');
const blocked=createPreferences({getItem(){throw Error();},setItem(){throw Error();}});blocked.update({music:.5});assert.equal(blocked.saved(),false);
class Param { value=0; setTargetAtTime(v){this.value=v;} setValueAtTime(v){this.value=v;} linearRampToValueAtTime(){} exponentialRampToValueAtTime(){} }
class Node { gain=new Param();frequency=new Param();Q=new Param();connect(node){return node;}disconnect(){} }
const sources=[];
class Source extends Node { start(at){this.at=at;sources.push(this);}stop(at){if(at===undefined)this.cancelled=true;} }
let context;
globalThis.AudioContext=class {
  state='suspended';currentTime=0;sampleRate=100;destination=new Node();
  constructor(){context=this;}async resume(){this.state='running';}
  createGain(){return new Node();}createOscillator(){return new Source();}createBiquadFilter(){return new Node();}createBufferSource(){return new Source();}
  createBuffer(){return {getChannelData:()=>new Float32Array(23)};}
};
const {createAudio}=await module('audio');const prefs=parsePreferences(null);const audio=createAudio(prefs);
audio.miss();audio.slice();assert.equal(sources.length,0,'No audio before a user gesture');
assert.equal(await audio.unlock(),true);audio.update(0,true);assert.ok(sources.length>0);
audio.stop();assert.ok(sources.every(s=>s.cancelled),'Pause cancels every scheduled voice');
const count=sources.length;audio.update(0,false);assert.equal(sources.length,count);
context.currentTime=100;audio.update(1000,true);assert.ok(sources.slice(count).every(s=>s.at>=100),'Resume never replays stale beats');
audio.configure({...prefs,muted:true});const mutedCount=sources.length;audio.slice();audio.miss();audio.update(2000,true);assert.equal(sources.length,mutedCount);
globalThis.AudioContext=class{constructor(){throw Error('Unavailable');}};assert.equal(await createAudio(prefs).unlock(),false);
console.log('Passed: settings bounds, storage failure, gesture-only audio, pause cancellation, resume scheduling, mute, and unavailable audio.');
