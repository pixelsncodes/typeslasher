import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
for(const name of ['index.html','assets.html']){
  const html=await readFile(resolve(root,name),'utf8');
  assert.ok(!/https?:\/\//.test(html),'HTML must not need remote assets');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    assert.ok(!match[1].startsWith('/'),'Release links must work in a subfolder');
    const file=resolve(root,match[1]);await stat(file);
  }
}
const css=await readFile(resolve(root,'fonts/fonts.css'),'utf8');
assert.ok(!/https?:\/\//.test(css));
for(const match of css.matchAll(/url\(([^)]+)\)/g))await stat(resolve(root,'fonts',match[1]));
for(const font of ['dm-mono','outfit'])assert.match(await readFile(resolve(root,`fonts/${font}-OFL.txt`),'utf8'),/SIL OPEN FONT LICENSE/);
let bytes=0;let gzipBytes=0;
async function scan(path){for(const entry of await readdir(path,{withFileTypes:true})){const child=resolve(path,entry.name);if(entry.isDirectory())await scan(child);else{const buffer=await readFile(child);bytes+=buffer.length;gzipBytes+=gzipSync(buffer).length;}}}
await scan(root);
let optionalBytes=0;
for(const pack of ['fresh','snacks','big','garden','market','pantry']){
  const size=(await stat(resolve(root,`assets/typeslasher-${pack}-pack.glb`))).size;
  assert.ok(size<6_000_000,`${pack} exceeds its independent 6 MB budget`);optionalBytes+=size;
}
// The Blender kitchen loads only when a player starts Sentence Slash.
const kitchenBytes=(await stat(resolve(root,'assets/typeslasher-kitchen.glb'))).size;
assert.ok(kitchenBytes<4_500_000,'Keep the optional kitchen under 4.5 MB');
optionalBytes+=kitchenBytes;
// Recipe artwork is requested only by the optional Sentence Slash order rail.
let recipeBytes=0;
for(const name of await readdir(resolve(root,'assets/recipes'))){
  assert.match(name,/\.webp$/);const size=(await stat(resolve(root,'assets/recipes',name))).size;
  assert.ok(size<80_000,'Keep each recipe illustration under 80 KB');recipeBytes+=size;
}
assert.ok(recipeBytes<500_000,'Keep all recipe artwork under 500 KB');optionalBytes+=recipeBytes;
let storyBytes=0;
for(const name of ['fruit-adventure','space-mission','funny-day','restaurant-shift','little-kindness','helping-paws']){
  const size=(await stat(resolve(root,`assets/stories/${name}.webp`))).size;
  assert.ok(size<80_000,'Keep each illustrated story tile under 80 KB');storyBytes+=size;
}
assert.ok(storyBytes<300_000,'Keep story artwork under 300 KB');optionalBytes+=storyBytes;
// Storybook pages are lazy-loaded when entering an illustrated story. Only the
// current and next picture are requested, leaving the starter download intact.
let storybookBytes=0,storybookPages=0;
for(const story of await readdir(resolve(root,'assets/storybooks'))){
  for(const name of await readdir(resolve(root,'assets/storybooks',story))){
    assert.match(name,/\.webp$/);
    const size=(await stat(resolve(root,'assets/storybooks',story,name))).size;
    assert.ok(size<240_000,'Keep each storybook page under 240 KB');storybookBytes+=size;storybookPages++;
  }
}
assert.equal(storybookPages,30,'All six complete storybooks ship their selected pages');
assert.ok(storybookBytes<4_500_000,'Keep all optional storybook pages under 4.5 MB');optionalBytes+=storybookBytes;
assert.ok(bytes-optionalBytes<8_000_000,'Keep the starter game under an 8 MB raw asset budget');
console.log(`Passed: portable release links, local fonts/licenses, ${(bytes/1e6).toFixed(2)} MB raw / ${(gzipBytes/1e6).toFixed(2)} MB with gzip.`);
