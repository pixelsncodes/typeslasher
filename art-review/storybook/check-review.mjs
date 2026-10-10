import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const library=JSON.parse(await readFile(path.join(root,'library.json'),'utf8'));
const source=await readFile(path.join(root,'../../src/story-choices.ts'),'utf8');
const restaurant=await readFile(path.join(root,'../../src/restaurant-orders.ts'),'utf8');
assert.equal(library.length,6);
assert.equal(new Set(library.map(s=>s.id)).size,6);
let count=0;
for(const story of library){
  const expected=story.id==='restaurant'?[...restaurant.matchAll(/sentence:'([^']+)'/g)].map(m=>m[1]).join(' '):source.match(new RegExp(`id:'${story.id}'[^\\n]*?text:'([^']+)'`))[1];
  assert.equal(story.pages.map(p=>p.text).join(' '),expected,`Review matches the current game story: ${story.id}`);
  assert.equal(new Set(story.pages.map(p=>p.image)).size,story.pages.length);
  for(const page of story.pages){await access(path.join(root,page.image));assert(page.text&&page.beat&&page.alt);count++;}
  await access(path.join(root,story.id,'storyboard.html'));
}
assert.equal(count,30);
assert(library.find(s=>s.id==='funny-day').pages[1].image.endsWith('-v2.webp'));
assert(library.find(s=>s.id==='restaurant').pages[6].image.endsWith('-v2.webp'));
assert(library.find(s=>s.id==='little-kindness').pages[4].image.endsWith('-v2.webp'));
console.log('Review checks passed: six complete stories, 30 unique pages, matching game sentences, available selected assets and continuity fixes.');
