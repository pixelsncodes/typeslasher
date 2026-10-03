import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { foodModel, lightFoodScene, loadFoodAssets } from './food-assets';
import type { ServiceEffect } from './sentence-game';
import { FRUIT_MIX, cutPose, CUT_END, FruitCadence } from './sentence-motion';
import { RECIPES, type RecipeId } from './kitchen-recipes';
import { FOOD_CATALOG, type PackId } from './food-catalog';

export type KitchenView = { ordinal: number; progress: number; served: number; total: number; multiplier: number; error: boolean };
const BOARD = new THREE.Vector3(-.65, .19, .4), YAW = -.68;
export function createSentenceScene(host: HTMLElement, settings: {reduced:()=>boolean; quality:()=>string; recipe?:()=>RecipeId}) {
  host.innerHTML = `<div class="kitchen-sign"><span>MIDNIGHT PREP KITCHEN</span></div>
    <div class="kitchen-tickets"><span>ORDER <b>01</b></span><span class="served-ticket">SERVED <b>0</b></span></div>
    <div class="kitchen-fallback"><i class="fallback-food"></i><span class="fallback-slices"></span></div>
    <div class="kitchen-caption prep-caption">FRUIT MIX</div><div class="kitchen-caption cut-caption">ONE WORD · ONE CUT</div><div class="kitchen-caption plate-caption">READY TO SERVE</div>
    <div class="kitchen-callout"></div><div class="kitchen-word-charge"><i></i></div>`;
  let view: KitchenView = {ordinal:0,progress:0,served:0,total:1,multiplier:1,error:false};
  let renderer: THREE.WebGLRenderer | undefined;
  const world = new THREE.Scene();world.background = new THREE.Color('#302335');
  const camera = new THREE.PerspectiveCamera(35,1,.1,80);
  camera.position.set(0,6.3,15.4);camera.lookAt(0,1.0,-.9);
  const center = new THREE.Group(), tray = new THREE.Group();world.add(center,tray);
  center.position.copy(BOARD);center.rotation.y=YAW;
  let knife: THREE.Object3D, bowl: THREE.Object3D;
  let ready=false, active=false, frame=0, previous=0, time=0, lastDraw=0, currentOrdinal=-1;
  let serveStart=-1, currentCut: {born:number;ordinal:number;released:boolean}|undefined;
  const pending: ServiceEffect[]=[];
  const cadence = new FruitCadence();
  const pieces: {group:THREE.Group;born:number;direction:number;slot:number}[]=[];
  let pieceCount=0, fallbackCount=0;
  const animations = new Set<Animation>();
  const reduced = () => settings.reduced();
  let recipeReady=false, loadedRecipe='', recipeEpoch=0;
  function prepareRecipe(){
    const id=settings.recipe?.()??'fruit';
    if(id===loadedRecipe&&recipeReady)return;
    const epoch=++recipeEpoch;loadedRecipe=id;recipeReady=false;center.visible=false;tray.clear();
    host.dataset.ingredients='loading';
    const packs=[...new Set(RECIPES[id].items.map(kind=>FOOD_CATALOG.find(food=>food.kind===kind)!.pack))] as PackId[];
    void loadFoodAssets(packs).then(()=>{
      if(epoch!==recipeEpoch)return;
      recipeReady=true;host.dataset.ingredients='ready';if(ready)host.classList.add('has-food-models');select();draw();
    }).catch(()=>{if(epoch===recipeEpoch){host.dataset.ingredients='failed';host.classList.remove('has-food-models');}});
  }
  function animate(el: Element, frames: Keyframe[], duration: number) {
    if(reduced())return;
    const animation=el.animate(frames,{duration,easing:'ease-out'});
    animations.add(animation);animation.onfinish=()=>animations.delete(animation);
    if(!active)animation.pause();
  }
  function model(ordinal:number, part:''|'_left'|'_right'='') {
    const ingredients=settings.recipe?RECIPES[settings.recipe()].items:FRUIT_MIX;
    const kind=ingredients[ordinal%ingredients.length],food=foodModel(kind,part)!;
    // Both halves use the whole fruit's origin and scale so closed cut faces meet.
    const bounds=new THREE.Box3().setFromObject(foodModel(kind)!);
    const size=bounds.getSize(new THREE.Vector3()),middle=bounds.getCenter(new THREE.Vector3());
    const scale=1.14/Math.max(size.x,size.y,size.z);
    food.scale.setScalar(scale);food.position.set(-middle.x*scale,-bounds.min.y*scale,-middle.z*scale);
    food.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;}});
    const group=new THREE.Group();group.add(food);return group;
  }
  function select(ordinal=view.ordinal) {
    if(!ready || !recipeReady || !cadence.ready(time) || ordinal===currentOrdinal)return;
    currentOrdinal=ordinal;center.clear();center.add(model(ordinal));center.visible=true;tray.clear();
    for(let n=0;n<5;n++){
      const fruit=model(ordinal+n+1);fruit.scale.setScalar(.70);
      fruit.position.set(-5.55+(n%3)*.77,.12,.7-Math.floor(n/3)*.75);
      fruit.rotation.y=n*.65;tray.add(fruit);
    }
  }
  function resize() {
    if(!renderer || !host.clientWidth || !host.clientHeight)return;
    const width=host.clientWidth,height=host.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio,settings.quality()==='low'?1:settings.quality()==='high'?2:1.5));
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    // Fit the island horizontally. Perspective keeps the rear counter at a natural depth.
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(7.05/(camera.aspect*15.4)));
    camera.updateProjectionMatrix();draw();
  }
  function addPieces(ordinal:number,born:number) {
    for(const direction of [-1,1]){
      const group=model(ordinal,direction<0?'_left':'_right');world.add(group);
      pieces.push({group,born,direction,slot:pieceCount++%12});
      if(pieces.length>16)world.remove(pieces.shift()!.group);
    }
  }
  function clearBowl(){for(const p of pieces)world.remove(p.group);pieces.length=0;pieceCount=0;}
  function startNext(){
    if(!ready || currentCut || serveStart>=0 || !pending.length)return;
    const next=pending[0];
    if(next.type==='serve'){
      if(pieces.some(p=>time-p.born<CUT_END))return;
      pending.shift();serveStart=time;center.visible=false;
    }else{
      if(!cadence.ready(time))return;
      pending.shift();select(next.ordinal);currentCut={born:time,ordinal:next.ordinal,released:false};
    }
  }
  function draw() {
    if(!renderer || !ready || !recipeReady || !host.isConnected)return;
    startNext();
    if(!currentCut&&!pending.length&&serveStart<0&&cadence.ready(time))select();
    const age=currentCut?time-currentCut.born:0,pose=cutPose(age);
    knife.position.copy(BOARD);knife.position.y+=currentCut?pose.blade:1.35+view.progress*.13;
    knife.rotation.set(0,YAW,0);
    if(currentCut){
      if((pose.split||reduced()) && !currentCut.released){addPieces(currentCut.ordinal,reduced()?time-CUT_END:currentCut.born);currentCut.released=true;center.visible=false;}
      if(age>=CUT_END||reduced()){
        // If motion was disabled midway through a cut, settle all its pieces first.
        if(reduced())for(const piece of pieces)piece.born=Math.min(piece.born,time-CUT_END);
        currentCut=undefined;cadence.finish(time);center.visible=false;
      }
    }
    const serving=serveStart<0?0:reduced()?1:Math.min(1,(time-serveStart)/.55),serveX=reduced()?0:serving*serving*8;
    bowl.position.x=3.9+serveX;
    for(const piece of pieces){
      const p=reduced()?cutPose(CUT_END):cutPose(time-piece.born);
      const spread=piece.direction*p.spread*.30,sx=BOARD.x+Math.cos(YAW)*spread,sz=BOARD.z-Math.sin(YAW)*spread;
      const angle=piece.slot*2.4;
      const target=new THREE.Vector3(3.9+Math.cos(angle)*.48,.40+Math.floor(piece.slot/4)*.08,.25+Math.sin(angle)*.42);
      piece.group.position.set(THREE.MathUtils.lerp(sx,target.x,p.transfer)+serveX,
        THREE.MathUtils.lerp(BOARD.y,target.y,p.transfer)+(reduced()?0:Math.sin(p.transfer*Math.PI)*1.35),
        THREE.MathUtils.lerp(sz,target.z,p.transfer));
      piece.group.rotation.set(p.transfer*.65,YAW+piece.direction*p.spread*.48,-piece.direction*p.spread*.18);
      piece.group.scale.setScalar(1-p.transfer*.45);
    }
    if(serveStart>=0 && serving>=1){clearBowl();serveStart=-1;bowl.position.x=3.9;}
    host.dataset.fruitVisible=String(center.visible);
    host.dataset.fruitOrdinal=String(currentOrdinal);
    host.dataset.prepPhase=currentCut?'cutting':!cadence.ready(time)?'resting':serveStart>=0?'serving':'ready';
    renderer.render(world,camera);
  }
  function tick(now:number) {
    if(!active)return;
    time+=previous?Math.min(.1,(now-previous)/1000):0;previous=now;
    if(now-lastDraw>=(settings.quality()==='low'?1000/30:1000/60)){
      if(!reduced()||pending.length||currentCut||serveStart>=0||!center.visible)draw();lastDraw=now;
    }
    frame=requestAnimationFrame(tick);
  }
  function setActive(value:boolean) {
    active=value;cancelAnimationFrame(frame);previous=0;host.classList.toggle('kitchen-paused',!value);
    for(const animation of animations)value?animation.play():animation.pause();
    if(value){resize();frame=requestAnimationFrame(tick);}
  }
  new ResizeObserver(resize).observe(host);
  prepareRecipe();
  void new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/typeslasher-kitchen.glb?v=2`).then(asset=>{
    try{
      knife=asset.scene.getObjectByName('chef_knife')!;bowl=asset.scene.getObjectByName('service_bowl')!;
      if(!knife||!bowl)throw new Error('Kitchen asset is incomplete');
      renderer=new THREE.WebGLRenderer({antialias:true});renderer.setClearColor('#302335');
      renderer.domElement.className='kitchen-canvas';renderer.domElement.setAttribute('aria-hidden','true');
      renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;host.classList.remove('has-food-models');});
      renderer.domElement.addEventListener('webglcontextrestored',()=>{ready=true;host.classList.add('has-food-models');resize();});
      lightFoodScene(renderer,world);world.add(asset.scene);
      // Match the Blender review's off-camera daylight, with a soft sky fill.
      for(const child of [...world.children])if(child instanceof THREE.Light)world.remove(child);
      world.add(new THREE.HemisphereLight(0xe2edff,0x746253,.85));
      renderer.shadowMap.enabled=settings.quality()!=='low';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      const light=new THREE.DirectionalLight(0xfff0d9,2.1);light.position.set(-5.8,7,3.5);light.castShadow=true;
      light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-8;light.shadow.camera.right=8;
      light.shadow.camera.top=5;light.shadow.camera.bottom=-5;light.shadow.normalBias=.025;world.add(light);
      asset.scene.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;}});
      host.prepend(renderer.domElement);ready=true;host.classList.add('has-food-models');select();resize();
    }catch{renderer?.dispose();renderer=undefined;host.classList.remove('has-food-models');}
  }).catch(()=>{/* Typing and feedback remain available if graphics cannot load. */});
  return {
    setActive,
    get busy(){return ready&&(pending.length>0||!!currentCut||serveStart>=0||pieces.some(p=>time-p.born<CUT_END));},
    update(next:KitchenView){
      view=next;if(!currentCut&&!pending.length&&serveStart<0)select();
      host.style.setProperty('--word-charge',String(view.progress));
      host.classList.toggle('kitchen-error',view.error);host.classList.toggle('kitchen-calm',reduced());
      host.querySelector('.kitchen-tickets span b')!.textContent=String(Math.min(view.total,view.served+1)).padStart(2,'0');
      host.querySelector('.served-ticket b')!.textContent=String(view.served);
      if(!active||reduced())draw();
    },
    effect(effect:ServiceEffect){
      const callout=host.querySelector<HTMLElement>('.kitchen-callout')!;
      callout.textContent=effect.type==='serve'?`${effect.fresh?'FRESH BOWL!':effect.clean?'PERFECT BOWL!':'BOWL READY!'}${effect.points?' +'+effect.points:''}`:`${effect.clean?'CLEAN CUT':'SLICED'} +${effect.points}`;
      callout.classList.toggle('serve-callout',effect.type==='serve');
      animate(callout,[{opacity:1,transform:'translate(-50%,5px)'},{opacity:1,offset:.65},{opacity:0,transform:'translate(-50%,-8px)'}],effect.type==='serve'?650:450);
      if(ready){
        // Keep feedback near the typing: replace waiting cuts with the latest word.
        // Sentence completion discards waiting cuts and serves after the active cut.
        for(let index=pending.length-1;index>=0;index--){
          if(pending[index].type==='cut')pending.splice(index,1);
        }
        pending.push(effect);
      }
      fallbackCount=effect.type==='serve'?0:fallbackCount+1;
      host.querySelector('.fallback-slices')!.textContent='◒ '.repeat(Math.min(5,fallbackCount));draw();
    },
    reset(){
      animations.forEach(animation=>animation.cancel());animations.clear();clearBowl();pending.length=0;
      currentCut=undefined;serveStart=-1;currentOrdinal=-1;time=0;fallbackCount=0;cadence.reset();
      view={ordinal:0,progress:0,served:0,total:1,multiplier:1,error:false};
      host.querySelector('.prep-caption')!.textContent=settings.recipe?RECIPES[settings.recipe()].title.toUpperCase():'FRUIT MIX';
      host.querySelector('.kitchen-callout')!.textContent='';host.querySelector('.fallback-slices')!.textContent='';prepareRecipe();select();draw();
    },
  };
}
