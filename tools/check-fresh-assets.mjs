import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3,Raycaster} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const bytes=fs.readFileSync(new URL('../public/assets/typeslasher-fresh-pack.glb',import.meta.url));
assert.ok(bytes.length<4_000_000,'Fresh pack exceeds its independent download budget');
const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
scene.updateMatrixWorld(true);
for(const food of ['orange','lime','plum','mango','peach','donut']){
  for(const part of ['','_left','_right']){
    const model=scene.getObjectByName(`food_${food}${part}`);assert.ok(model,`Missing ${food}${part}`);
    let triangles=0,painted=0,interior=0;
    model.traverse(node=>{if(!node.isMesh)return;
      const g=node.geometry;assert.ok([...g.attributes.position.array].every(Number.isFinite));
      triangles+=(g.index?.count??g.attributes.position.count)/3;
      if(/Painted|Golden baked/.test(node.material.name)){assert.ok(g.attributes.color);painted++;}
      if(/flesh|crumb|interior/.test(node.material.name))interior++;
    });
    assert.ok(triangles>0&&triangles<40000,`${food}${part} triangles ${triangles}`);assert.ok(painted);
    const bounds=new Box3().setFromObject(model);assert.ok(bounds.getSize(new Vector3()).length()<5);
    if(part){assert.ok(interior>0);assert.ok(part==='_left'?bounds.max.x<.05:bounds.min.x>-.05,`${food}${part} crosses cut`);}
    if((food==='orange'||food==='lime')&&part){
      let segments=0;model.traverse(n=>{if(n.isMesh&&n.material.name===`Painted ${food} flesh`){segments+=n.geometry.attributes.position.count;
        const normal=n.geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert.ok(normal.getX(i)*(part==='_left'?1:-1)>.95,'Citrus flesh faces inward');
      }});assert.ok(segments>1000,'Citrus lost its modeled segments');
    }
  }
}
const donut=scene.getObjectByName('food_donut');
assert.equal(new Raycaster(new Vector3(0,0,5),new Vector3(0,0,-1)).intersectObject(donut,true).length,0,'Donut hole is filled');
assert.ok(new Raycaster(new Vector3(.69,0,5),new Vector3(0,0,-1)).intersectObject(donut,true).length>0,'Donut body missing');
console.log('Passed: 18 Fresh picks roots, cut partitions, citrus normals, painted colors, and real donut hole.');
