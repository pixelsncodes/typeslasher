import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {Box3,Vector3,Raycaster,Mesh} from 'three';
const require=createRequire(import.meta.url);
const source=ts.transpileModule(readFileSync(new URL('../src/serving-dishes.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace("'three'",JSON.stringify(pathToFileURL(require.resolve('three')).href));
const {SERVING_DISHES,createServingDish,servingSlot}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal(Object.keys(SERVING_DISHES).length,10);
assert.equal(new Set(Object.values(SERVING_DISHES).map(style=>style.name)).size,10);
for(const [recipe,style] of Object.entries(SERVING_DISHES)){
  const dish=createServingDish(recipe);dish.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(dish),size=bounds.getSize(new Vector3());
  assert.ok(bounds.min.y>=-.00001&&bounds.min.y<.006,recipe+' must rest on the counter');
  assert.ok(size.x<3.5&&size.z<3.1&&size.y<1.2,recipe+' no longer fits the service area');
  const body=dish.getObjectByName('dish_body');
  const hits=new Raycaster(new Vector3(.1,2,.1),new Vector3(0,-1,0)).intersectObject(body);
  assert.ok(hits.length&&hits[0].point.y<.16&&hits[0].point.y>.13,recipe+' has a blocked/open or inverted interior floor');
  assert.ok(hits[0].face.normal.y>.95,recipe+' floor faces away from its food');
  let triangles=0;
  dish.traverse(node=>{
    if(!(node instanceof Mesh))return;
    const positions=node.geometry.getAttribute('position'),normals=node.geometry.getAttribute('normal');
    for(let i=0;i<positions.count;i++)for(const value of [positions.getX(i),positions.getY(i),positions.getZ(i),normals.getX(i),normals.getY(i),normals.getZ(i)])assert.ok(Number.isFinite(value),recipe+' malformed geometry');
    triangles+=(node.geometry.index?.count??positions.count)/3;
  });
  assert.ok(triangles<8000,recipe+' exceeds the serving-dish geometry budget');
  // All transfer endpoints must stay within the usable center of the selected vessel.
  for(let slot=0;slot<16;slot++){
    const position=servingSlot(recipe,slot);
    assert.ok(Math.hypot(position.x,position.z/style.depth)<style.radius*.75,recipe+' food lands on the rim');
    assert.ok(position.y>.15,recipe+' food lands under the serving surface');
  }
  const handles=dish.children.filter(child=>child.name.startsWith('soup_handle_'));
  assert.equal(handles.length,style.handles?2:0);
}
assert.equal(SERVING_DISHES.soup.kind,'bowl');
for(const recipe of ['vegetables','picnic','breakfast'])assert.equal(SERVING_DISHES[recipe].kind,'plate');
console.log('Passed: ten serving dishes, usable open interiors, upward floors, grounded geometry, service-area/budget bounds, soup handles, and food transfer endpoints.');
