import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3,Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import ts from 'typescript';
import {FOOD_SIZE,KITCHEN_FOOD_SCALE} from '../src/food-proportions.ts';
import {foodFrame,applyFoodFrame} from '../src/food-sizing.ts';
import {restingFoodModel} from '../src/food-resting.ts';

const catalog=ts.transpileModule(fs.readFileSync(new URL('../src/food-catalog.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {FOOD_CATALOG,FOOD_PACKS}=await import(`data:text/javascript;base64,${Buffer.from(catalog).toString('base64')}`);

const sizes={};
for(const [pack,definition] of Object.entries(FOOD_PACKS)){
  // Preserve the exported geometry and materials; image anatomy has its own check.
  const bytes=fs.readFileSync(new URL('../public/assets/'+definition.file,import.meta.url));
  const jsonLength=bytes.readUInt32LE(12),doc=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
  for(const m of doc.materials){
    delete m.pbrMetallicRoughness.baseColorTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture;
    delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture;
  }
  delete doc.images;delete doc.textures;
  const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
  const binary=bytes.subarray(20+jsonLength),glb=Buffer.alloc(20+padded.length+binary.length);
  glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);
  glb.writeUInt32LE(padded.length,12);glb.writeUInt32LE(0x4e4f534a,16);padded.copy(glb,20);binary.copy(glb,20+padded.length);
  const {scene}=await new GLTFLoader().parseAsync(glb.buffer,'');
  for(const {kind} of FOOD_CATALOG.filter(food=>food.pack===pack)){
    const original=scene.getObjectByName('food_'+kind);
    const resting=['','_left','_right'].map(part=>new Box3().setFromObject(restingFoodModel(scene.getObjectByName('food_'+kind+part).clone(true),original.clone(true),kind)));
    assert.ok(Math.abs(resting[0].min.y)<1e-5,kind+' floats above or sinks into the prep surface');
    const reunited=resting[1].clone().union(resting[2]);
    assert.ok(reunited.min.distanceTo(resting[0].min)<.06&&reunited.max.distanceTo(resting[0].max)<.06,kind+' resting cut halves no longer line up');
    const flat=resting[0].getSize(new Vector3());
    if(['carrot','corn','pineapple','celery','cucumber','zucchini','banana','cookie','donut','bagel','croissant','waffle','bread','cheese','sandwich'].includes(kind)){
      assert.ok(flat.y<Math.max(flat.x,flat.z)*.8,kind+' still stands vertically in the kitchen');
    }
    for(const grounded of [false,true]){
      const factor=grounded?KITCHEN_FOOD_SCALE:1,frame=foodFrame(original,kind,grounded,factor);
      const bounds=[];
      for(const part of ['','_left','_right']){
        const model=scene.getObjectByName('food_'+kind+part).clone(true);
        applyFoodFrame(model,frame);
        // Runtime motion changes the wrapper, never the calibrated inner scale.
        const moving=new Group();moving.add(model);moving.scale.setScalar(.7);moving.position.set(3,1,2);
        moving.scale.setScalar(1);moving.position.set(0,0,0);
        bounds.push(new Box3().setFromObject(moving));
      }
      const dimensions=bounds[0].getSize(new Vector3()),longest=Math.max(...dimensions);
      assert.ok(Math.abs(longest-FOOD_SIZE[kind]*factor)<1e-5,kind+' lost its shared scale');
      if(!grounded)sizes[kind]=longest;
      assert.ok(Math.abs(grounded?bounds[0].min.y:bounds[0].getCenter(new Vector3()).y)<1e-5,kind+' origin');
      const joined=bounds[1].clone().union(bounds[2]);
      assert.ok(joined.min.distanceTo(bounds[0].min)<.06&&joined.max.distanceTo(bounds[0].max)<.06,kind+' halves resized independently');
    }
  }
}
assert.equal(Object.keys(sizes).length,50);
assert.ok(sizes.watermelon>sizes.strawberry*3&&sizes.watermelon>sizes.raspberry*5&&sizes.watermelon>sizes.blueberry*7);
assert.ok(sizes.blueberry<sizes.raspberry&&sizes.raspberry<sizes.strawberry&&sizes.strawberry<sizes.apple);
assert.ok(sizes.pumpkin>sizes.potato&&sizes.pineapple>sizes.orange&&sizes.broccoli>sizes.mushroom);
console.log('Passed: all 50 food proportions, resting prep poses, grounded placement, and matching whole/cut scales.');
