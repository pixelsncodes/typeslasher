import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FRUIT_MIX,cutPose,CUT_CONTACT,CUT_RELEASE,CUT_END,FruitCadence,NEXT_FRUIT_DELAY,ingredientPrepPose,IngredientPrepTimeline} from '../src/sentence-motion.ts';
assert.deepEqual([...FRUIT_MIX],['apple','kiwi','pear','orange','mango']);
assert.equal(cutPose(CUT_CONTACT-.001).split,false);
assert.equal(cutPose(CUT_CONTACT).split,true);
assert.ok(cutPose(CUT_CONTACT).blade<.03,'blade reaches board before separation');
assert.equal(cutPose(CUT_CONTACT).spread,0);
assert.equal(cutPose(CUT_RELEASE).transfer,0,'pieces stay on board until separation completes');
assert.equal(cutPose(CUT_END).transfer,1);
assert.equal(cutPose(CUT_END).settled,true);
const cadence=new FruitCadence();
assert.equal(cadence.ready(0),true);
cadence.finish(CUT_END);
for(const now of [CUT_END,CUT_END+NEXT_FRUIT_DELAY/2,CUT_END+NEXT_FRUIT_DELAY-.001])assert.equal(cadence.ready(now),false,'no replacement fruit during rest');
assert.equal(cadence.ready(CUT_END+NEXT_FRUIT_DELAY),true);
cadence.finish(3);assert.equal(cadence.ready(3.1),false);
assert.equal(cadence.ready(3.1),false,'paused scene time does not consume the delay');
cadence.reset();assert.equal(cadence.ready(0),true,'replay can prepare its first fruit immediately');
for(const count of [1,4,6,8])for(const characters of [1,3,37,86,650]){
  let plated=0;
  for(let cursor=0;cursor<=characters;cursor++){
    const poses=Array.from({length:count},(_,index)=>ingredientPrepPose(cursor/characters,index,count));
    const next=poses.filter(pose=>pose.cut.settled).length;
    assert.ok(next>=plated,'Animation cannot undo a plated ingredient');plated=next;
    assert.ok(poses.filter(pose=>pose.started&&!pose.cut.settled).length<=1,'Only one ingredient is prepared at a time');
    for(const pose of poses){if(pose.cut.split)assert.equal(pose.intake,1,'Ingredient arrives before it is cut');}
  }
  assert.equal(plated,count,'Every ingredient is plated at the end of the preparation timeline');
}
const prep=new IngredientPrepTimeline(6);
assert.equal(prep.advance(10),0,'Idle time cannot take an ingredient from the basket');
prep.unlock(1,10);assert.equal(prep.progress,0,'A milestone starts motion instead of jumping to a cut pose');
const arriving=prep.advance(10.12),cutting=prep.advance(10.65);
assert.ok(arriving>0&&cutting>arriving,'Preparation continues smoothly without another keystroke');
assert.equal(ingredientPrepPose(arriving,0,6).cut.split,false);
assert.equal(ingredientPrepPose(cutting,0,6).cut.split,true);
assert.equal(prep.advance(12),1/6,'Only the unlocked ingredient gets prepared');
assert.equal(prep.advance(18),1/6,'The next ingredient waits for its sentence milestone');
prep.unlock(1,18);assert.equal(prep.busy,false,'Repeating a word effect never duplicates a cut');
prep.unlock(2,18);const moving=prep.advance(18.2);
assert.equal(prep.advance(18.2),moving,'Paused scene time freezes the animation');
for(const count of [1,4,6,8]){
  const fast=new IngredientPrepTimeline(count);fast.unlock(count,0,true);
  let previous=0;
  for(let now=0;now<.7;now+=1/60){const value=fast.advance(now);assert.ok(value>=previous&&value<=1);previous=value;}
  assert.equal(fast.advance(.7),1,'Short/rapidly typed sentences finish in one bounded flourish');
  assert.equal(fast.busy,false);assert.equal(ingredientPrepPose(fast.progress,count-1,count).cut.transfer,1);
  const calm=new IngredientPrepTimeline(count);calm.unlock(count,0,true);
  assert.equal(calm.advance(0,true),1,'Reduced motion settles all unlocked ingredients immediately');
  assert.equal(calm.advance(.1),1,'Re-enabling motion cannot undo settled preparation');
}
const glb=await readFile(new URL('../public/assets/typeslasher-kitchen.glb',import.meta.url));
assert.equal(glb.toString('utf8',0,4),'glTF');
const doc=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
for(const name of ['kitchen_environment','chef_knife','service_bowl'])assert.ok(doc.nodes.some(n=>n.name===name),name);
assert.ok(!doc.nodes.some(n=>/pendant|food_|review camera/i.test(n.name??'')),'no lamps or static review fruit in the runtime kitchen');
assert.ok(doc.images.length>=4,'wood, end grain, stone and cloth textures exported');
assert.ok(doc.images.every(image=>image.bufferView!==undefined),'textures are embedded for portable play');
const clearance=JSON.parse(await readFile(new URL('../art-review/kitchen-v2-clearance.json',import.meta.url),'utf8'));
assert.equal(clearance.pendants.length,0);
assert.equal(clearance.shelf_props.length,10);
for(const prop of clearance.shelf_props){assert.ok(prop.front>=2.15&&prop.back<=3.47);assert.ok(prop.wall_clearance>.18);}
console.log('Passed: smooth milestone preparation, idle/paused clocks, bounded final flourish, reduced motion, blade/split/transfer order, Blender export and shelf clearances.');
