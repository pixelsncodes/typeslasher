import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3,Raycaster} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
for(const [pack,names] of Object.entries({snacks:['egg','pie','muffin','waffle','pretzel','popcorn'],big:['avocado','broccoli','sandwich','pineapple','strawberry','watermelon']})){
  const bytes=fs.readFileSync(new URL(`../public/assets/typeslasher-${pack}-pack.glb`,import.meta.url));
  assert.ok(bytes.length<6_000_000);
  const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');scene.updateMatrixWorld(true);
  for(const name of names)for(const part of ['','_left','_right']){
    const model=scene.getObjectByName(`food_${name}${part}`);assert.ok(model,`Missing ${name}${part}`);let triangles=0;
    model.traverse(n=>{if(!n.isMesh)return;const g=n.geometry;assert.ok([...g.attributes.position.array].every(Number.isFinite));triangles+=(g.index?.count??g.attributes.position.count)/3;if(/Painted|Golden baked/.test(n.material.name))assert.ok(g.attributes.color,`${name}${part} lost colors`);});
    assert.ok(triangles>0&&triangles<40000,`${name}${part}: ${triangles} triangles`);
    const b=new Box3().setFromObject(model);assert.ok(b.getSize(new Vector3()).length()<5,`${name} scale`);
    if(part)assert.ok(part==='_left'?b.max.x<.05:b.min.x>-.05,`${name}${part} crosses the cut`);
  }
  if(pack==='snacks'){
    const egg=scene.getObjectByName('food_egg');let yolks=0;egg.traverse(n=>{if(n.isMesh&&n.material.name.includes('yolk'))yolks++;});assert.equal(yolks,0);
    const pretzel=scene.getObjectByName('food_pretzel');assert.equal(new Raycaster(new Vector3(-.5,.2,5),new Vector3(0,0,-1)).intersectObject(pretzel,true).length,0,'Pretzel opening was filled');
  } else {
    const pineapple=scene.getObjectByName('food_pineapple');let crown=false,rind=false;
    pineapple.traverse(n=>{if(!n.isMesh)return;if(n.material.name==='Painted pineapple crown')crown=true;if(n.material.name==='Painted pineapple skin'){rind=true;const colors=n.geometry.attributes.color;let lo=1,hi=0;for(let i=0;i<colors.count;i++){lo=Math.min(lo,colors.getX(i));hi=Math.max(hi,colors.getX(i));}assert.ok(hi-lo>.15,'Pineapple eyes lost their color contrast');}});
    assert.ok(crown&&rind,'Pineapple needs its shaped crown and painted rind');
    for(const name of ['watermelon','strawberry','pineapple']){
      for(const side of ['left','right']){
        let flesh=false;scene.getObjectByName(`food_${name}_${side}`).traverse(n=>{if(n.isMesh&&n.material.name===`Painted ${name} flesh`){flesh=true;const normal=n.geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert.ok(normal.getX(i)*(side==='left'?1:-1)>.99,`${name} inside faces away`);}});assert.ok(flesh);
      }
    }
  }
  console.log(`Passed: ${pack} 18 roots, budgets, colors, cut partitions, and anatomy checks.`);
}
