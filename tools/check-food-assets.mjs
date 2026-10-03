import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const bytes = fs.readFileSync(new URL('../public/assets/typeslasher-food-pack.glb', import.meta.url));
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
const names = ['apple','banana','carrot','cookie','corn','grape','kiwi','pear'];
for (const name of names) {
  let wholeTriangles = 0;
  let wholeWidth = 0;
  for (const part of ['', '_left', '_right']) {
    const model = gltf.scene.getObjectByName(`food_${name}${part}`);
    assert(model, `Missing ${name}${part}`);
    let triangles = 0, paintedVertices = 0, cutSurfaces = 0;
    model.traverse(node => {
      if (!node.isMesh) return;
      const geometry = node.geometry;
      assert([...geometry.attributes.position.array].every(Number.isFinite));
      triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3;
      if (/Painted|Golden baked/.test(node.material.name)) {
        const colors = geometry.attributes.color;
        assert(colors, `${name}${part} is missing painted colors`);
        if (Array.from({ length: colors.count }, (_, i) => Math.min(colors.getX(i), colors.getY(i), colors.getZ(i))).some(value => value < .8)) paintedVertices += colors.count;
      }
      if (/flesh|interior|crumb/i.test(node.material.name)) cutSurfaces++;
    });
    assert(triangles > 0 && triangles < 40000, `Triangle budget exceeded: ${name}${part} ${triangles}`);
    assert(paintedVertices > 0, `${name}${part} lost its colors during export`);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    assert(size.length() < 5, `${name}${part} scale is wrong`);
    if (part === '') {wholeTriangles = triangles;wholeWidth=size.x;}
    else {
      // Detailed interiors may add triangles. Check the actual cut partition.
      assert(size.x < wholeWidth*.75, `${name}${part} looks like a duplicate whole object`);
      assert(part==='_left'?bounds.max.x<.05:bounds.min.x>-.05, `${name}${part} crosses its cut plane`);
      assert(cutSurfaces > 0, `${name}${part} has no interior material`);
    }
  }
  console.log(`${name}: whole + two cut pieces, ${wholeTriangles} whole triangles`);
}
// Regression: corn had white kernels in GLB despite looking yellow in Blender.
const corn = gltf.scene.getObjectByName('food_corn');
corn.traverse(node => {
  if (node.isMesh && node.material.name === 'Painted fruit skin') {
    const c = node.geometry.attributes.color;
    assert(c && c.getX(0) > c.getZ(0) * 2, 'Corn kernels lost their golden vertex colors');
  }
});
const kiwi = gltf.scene.getObjectByName('food_kiwi');
const kiwiSize=new Box3().setFromObject(kiwi).getSize(new Vector3());
assert.ok(kiwiSize.z>1.3 && kiwiSize.x>kiwiSize.y*1.3, 'Whole kiwi must be a solid oval, not a thin cross-section');
kiwi.traverse(node=>{if(node.isMesh)assert.ok(!/flesh|interior|seed/i.test(node.material.name),'Whole kiwi exposes its flesh or seeds');});
for(const side of ['_left','_right']) {
  let seed=false, flesh=false;
  gltf.scene.getObjectByName('food_kiwi'+side).traverse(node=>{if(node.isMesh){
    seed ||= node.material.name==='Kiwi seeds';
    if(node.material.name==='Painted kiwi flesh'){
      flesh=true;
      const normals=node.geometry.attributes.normal;
      const outward=side==='_left'?1:-1;
      for(let i=0;i<normals.count;i++){
        const n=new Vector3().fromBufferAttribute(normals,i).transformDirection(node.matrixWorld);
        assert.ok(n.x*outward>.99, `Kiwi ${side} flesh faces inward and would disappear`);
      }
    }
  }});
  assert.ok(seed && flesh, `Kiwi ${side} needs flesh and seeds`);
}
// The photo reference calls for ruby skin and lighter blush flesh, with real
// transmission retained by GLB export rather than whole-object alpha fading.
const grapeLuminance={skin:[],flesh:[]};
for(const part of ['', '_left', '_right']){
  let skin=false,flesh=false;
  gltf.scene.getObjectByName('food_grape'+part).traverse(node=>{
    if(!node.isMesh || !/translucent grape/.test(node.material.name))return;
    const material=node.material;
    assert.ok(material.isMeshPhysicalMaterial && material.transmission>=.1 && material.transmission<=.4,'Grape transmission lost during export');
    assert.equal(material.opacity,1,'Grapes should transmit light, not fade away');
    const isFlesh=material.name.includes('flesh');
    if(isFlesh)flesh=true;else skin=true;
    const colors=node.geometry.attributes.color;
    const samples=grapeLuminance[isFlesh?'flesh':'skin'];
    for(let i=0;i<colors.count;i++){
      const r=colors.getX(i),g=colors.getY(i),b=colors.getZ(i);
      assert.ok(r>g*1.3 && r>b*1.1,'Grapes must retain their red/pink color family');
      samples.push(.2126*r+.7152*g+.0722*b);
    }
  });
  assert.ok(skin && (part===''?!flesh:flesh),`Wrong whole/cut grape anatomy: ${part}`);
}
const mean=values=>values.reduce((sum,value)=>sum+value,0)/values.length;
assert.ok(mean(grapeLuminance.flesh)>mean(grapeLuminance.skin)*1.5,'Grape flesh should be lighter than the skin');
console.log('All 24 asset roots passed.');
