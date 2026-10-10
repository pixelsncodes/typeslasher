import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STORY_PAGES,getStoryPages} from '../src/story-pages.ts';
import {preparePassage,SentenceSession} from '../src/sentence-core.ts';
import {SentenceKitchen} from '../src/sentence-game.ts';
import ts from 'typescript';

// Resolve the app's extensionless imports with the same test harness as recipe orders.
const transpile=async name=>ts.transpileModule(await readFile(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const moduleUrl=source=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const recipeUrl=moduleUrl(await transpile('kitchen-recipes'));
const orderUrl=moduleUrl((await transpile('restaurant-orders')).replace("'./kitchen-recipes'",JSON.stringify(recipeUrl)));
const {STORY_CHOICES}=await import(moduleUrl((await transpile('story-choices')).replace("'./restaurant-orders'",JSON.stringify(orderUrl))));

// Check the boundary where prepared typing sentences bind to their artwork.
let count=0;
for(const [id,pages] of Object.entries(STORY_PAGES)){
  const sentences=preparePassage(pages.map(p=>p.text).join(' '),'gentle').sentences;
  const choice=STORY_CHOICES.find(story=>story.id===id);
  assert.ok(choice,`Illustrated story must be available in the menu: ${id}`);
  assert.deepEqual(preparePassage(choice.text,'gentle').sentences,sentences,`Menu sentences must select the matching pictures: ${id}`);
  assert.equal(getStoryPages(id,sentences),pages);
  assert.equal(getStoryPages(id,[...sentences,'A new ending.']),undefined);
  assert.equal(getStoryPages(id,sentences.map((s,i)=>i? s:'Edited opening.')),undefined);
  const session=new SentenceSession(sentences,'gentle');
  const kitchen=new SentenceKitchen(sentences,'relaxed');
  let now=1000;
  for(const [index,page] of pages.entries()){
    assert.equal(session.index,index);assert.equal(session.current,page.text);
    const source=await readFile(new URL(`../public/assets/${page.image}`,import.meta.url));
    assert.equal(source.toString('ascii',0,4),'RIFF');assert.equal(source.toString('ascii',8,12),'WEBP');
    assert.ok(page.image.startsWith(`storybooks/${id}/`));
    session.input('~',++now);kitchen.consume(session.drain(),session.elapsed(now));
    assert.equal(session.cursor,0,'A mistake must not reveal the picture');
    session.input('Backspace',++now);
    for(const key of page.text){session.input(key,++now);kitchen.consume(session.drain(),session.elapsed(now));}
    assert.equal(kitchen.served,index+1,'Serving progresses exactly one illustrated page');count++;
  }
  assert.equal(session.completed,true);
}
assert.equal(count,30);
assert.equal(getStoryPages(undefined,['Custom story.']),undefined);
assert.equal(getStoryPages('missing',['Unknown story.']),undefined);
const expired=new SentenceSession(STORY_PAGES['little-kindness'].map(p=>p.text));
expired.input('R',1000);expired.skip(2000);
assert.equal(expired.index,1);assert.equal(expired.cursor,0);
assert.equal(STORY_PAGES['little-kindness'][expired.index].text,expired.current);
console.log('Passed: 30 storybook pages, prepared-text binding, edits/custom fallback, mistake gating, sentence serving and expiry alignment.');
