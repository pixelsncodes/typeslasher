import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3, Vector3, Raycaster} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const packs={garden:['tomato','cucumber','pepper','radish','beet','mushroom','zucchini','onion'],market:['lemon','raspberry','blueberry','cherry','fig','pomegranate','dragonfruit','apricot'],pantry:['bread','cheese','bagel','croissant','tofu','potato','pumpkin','celery']};
for(const [pack,names] of Object.entries(packs)){
  const bytes=fs.readFileSync(new URL(`../public/assets/typeslasher-${pack}-pack.glb`,import.meta.url));
  assert.ok(bytes.length<6_000_000,`${pack} budget`);
  const size=bytes.readUInt32LE(12),doc=JSON.parse(bytes.toString('utf8',20,20+size));
  assert.equal(doc.nodes.filter(n=>/^food_[a-z]+(?:_left|_right)?$/.test(n.name??'')).length,24);
  assert.equal(doc.images.length,8,`${pack} anatomical textures`);
  assert.ok(doc.images.every(image=>image.bufferView!==undefined&&image.mimeType==='image/png'),'Portable embedded textures');
  for(const name of names){
    const material=doc.materials.find(m=>m.name===`${name} detailed cut flesh`);
    assert.ok(material?.pbrMetallicRoughness?.baseColorTexture,`${name} lost its cut texture`);
  }
  // Geometry-only copy lets Node inspect the actual export without browser image APIs.
  // Original embedded image bytes/material references above are checked separately.
  for(const material of doc.materials){
    delete material.pbrMetallicRoughness.baseColorTexture;
    delete material.pbrMetallicRoughness.metallicRoughnessTexture;
    delete material.normalTexture;delete material.occlusionTexture;delete material.emissiveTexture;
  }
  delete doc.images;delete doc.textures;
  const text=Buffer.from(JSON.stringify(doc)),padded=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(padded);
  const binary=bytes.subarray(20+size);const glb=Buffer.alloc(20+padded.length+binary.length);
  glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(padded.length,12);glb.writeUInt32LE(0x4e4f534a,16);padded.copy(glb,20);binary.copy(glb,20+padded.length);
  const {scene}=await new GLTFLoader().parseAsync(glb.buffer,'');scene.updateMatrixWorld(true);
  for(const name of names){
    const bounds=[];
    for(const part of ['','_left','_right']){
      const model=scene.getObjectByName(`food_${name}${part}`);assert.ok(model);
      let triangles=0,cap=false;
      model.traverse(n=>{
        if(!n.isMesh)return;
        const g=n.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;
        assert.ok([...g.attributes.position.array].every(Number.isFinite));
        if(/Painted/.test(n.material.name))assert.ok(g.attributes.color,`${name}${part} colors`);
        if(n.material.name===`${name} detailed cut flesh`){
          cap=true;assert.ok(g.attributes.uv,'Cut texture UVs');
          const normal=g.attributes.normal;
          for(let i=0;i<normal.count;i++)assert.ok(normal.getX(i)*(part==='_left'?1:-1)>.99,`${name}${part} cap normals`);
        }
      });
      assert.ok(triangles>0&&triangles<40_000,`${name}${part}: ${triangles} triangles`);
      const b=new Box3().setFromObject(model);bounds.push(b);
      assert.ok(b.getSize(new Vector3()).length()<5,`${name} scale`);
      if(part){assert.ok(cap,`${name}${part} has no interior`);assert.ok(part==='_left'?b.max.x<.05:b.min.x>-.05,`${name}${part} crosses cut plane`);}
    }
    const combined=bounds[1].clone().union(bounds[2]);
    assert.ok(combined.min.distanceTo(bounds[0].min)<.045&&combined.max.distanceTo(bounds[0].max)<.045,`${name} complementary bounds`);
  }
  if(pack==='pantry')for(const part of ['','_left','_right'])assert.equal(new Raycaster(new Vector3(0,0,5),new Vector3(0,0,-1)).intersectObject(scene.getObjectByName('food_bagel'+part),true).length,0,'Bagel center must stay open');
  if(pack==='market'){
    for(const name of ['cherry','apricot']){
      let stone=0;scene.getObjectByName(`food_${name}_left`).traverse(n=>{if(n.isMesh&&n.material.name.includes('carved pit'))stone++;});assert.ok(stone);
      scene.getObjectByName(`food_${name}_right`).traverse(n=>{if(n.isMesh)assert.ok(!n.material.name.includes('carved pit'),'Only one half retains the stone');});
    }
  }
  assert.ok(fs.statSync(new URL(`../typeslasher-${pack}.blend`,import.meta.url)).size>100_000,'Saved Blender source');
  console.log(`Passed: ${pack}, 24 roots, eight embedded anatomical textures, complementary cuts, normals, colors, and model budgets.`);
}
