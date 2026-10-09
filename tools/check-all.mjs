import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
for(const file of ['check-round-timing.mjs','check-arcade-run.mjs','check-learning.mjs','check-challenge.mjs','check-polish.mjs','check-rhythm.mjs','check-sentence.mjs','check-sentence-game.mjs','check-restaurant-orders.mjs','check-kitchen.mjs','check-serving-dishes.mjs','check-food-assets.mjs','check-food-proportions.mjs','check-catalog.mjs','check-fresh-assets.mjs','check-extra-assets.mjs','check-expansion-assets.mjs']){
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url))],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status??1);
}
