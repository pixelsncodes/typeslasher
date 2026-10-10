import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { foodModel, lightFoodScene, loadFoodAssets } from './food-assets';
import type { ServiceEffect } from './sentence-game';
import { cutPose, CUT_END, FruitCadence, ingredientPrepPose, IngredientPrepTimeline } from './sentence-motion';
import { IngredientBatch, type KitchenOrder } from './restaurant-orders';
import type { FoodKind } from './food-catalog';
import { FOOD_CATALOG, type PackId } from './food-catalog';
import { restingFoodModel } from './food-resting';
import { createServingDish, SERVING_DISHES, servingSlot } from './serving-dishes';
import type { RecipeId } from './kitchen-recipes';

export type KitchenView = { ordinal: number; progress: number; sentenceProgress?:number; served: number; total: number; multiplier: number; error: boolean };
const BOARD = new THREE.Vector3(-.65, .19, .4), YAW = -.68;
export function createSentenceScene(host: HTMLElement, settings: {reduced:()=>boolean; quality:()=>string; frameKitchen?:()=>boolean}) {
  host.innerHTML = `<div class="kitchen-sign"><span>PREP KITCHEN</span></div>
    <div class="kitchen-tickets"><span>ORDER <b>01</b></span><span class="served-ticket">SERVED <b>0</b></span></div>
    <div class="kitchen-fallback"><i class="fallback-food"></i><span class="fallback-slices"></span></div>
    <div class="kitchen-caption prep-caption">FRUIT MIX</div><div class="kitchen-caption cut-caption">CHOP · PLATE · SERVE</div><div class="kitchen-caption plate-caption">READY TO SERVE</div>
    <div class="kitchen-callout"></div><div class="kitchen-word-charge"><i></i></div>`;
  let view: KitchenView = {ordinal:0,progress:0,served:0,total:1,multiplier:1,error:false};
  let renderer: THREE.WebGLRenderer | undefined;
  const world = new THREE.Scene();world.background = new THREE.Color('#302335');
  const camera = new THREE.PerspectiveCamera(35,1,.1,80);
  camera.position.set(0,6.3,15.4);camera.lookAt(0,1.0,-.9);
  const center = new THREE.Group(), tray = new THREE.Group();world.add(center,tray);
  center.position.copy(BOARD);center.rotation.y=YAW;
  let knife: THREE.Object3D, bowl: THREE.Object3D;
  const dishes=new Map<RecipeId,THREE.Group>();
  let ready=false, active=false, frame=0, previous=0, time=0, lastDraw=0, currentOrdinal=-1;
  let serveStart=-1, currentCut: {born:number;ordinal:number;released:boolean}|undefined;
  const pending: (ServiceEffect & {ingredient?:number})[]=[];
  const cadence = new FruitCadence();
  const pieces: {group:THREE.Group;born:number;direction:number;slot:number;ordinal:number}[]=[];
  let typingDriven=false,prepProgress=0;
  let prepTimeline:IngredientPrepTimeline|undefined;
  let pieceCount=0, fallbackCount=0;
  let order:KitchenOrder|undefined, batch:IngredientBatch|undefined, intakeStart=-1;
  const basketModels=new Map<number,THREE.Group>();
  const scheduled=new Set<number>();
  const animations = new Set<Animation>();
  const reduced = () => settings.reduced();
  let recipeReady=false;
  async function prepare(orders:readonly KitchenOrder[]){
    recipeReady=false;
    host.dataset.ingredients='loading';
    try {
      const packs=[...new Set(orders.flatMap(order=>order.ingredients.map(kind=>FOOD_CATALOG.find(food=>food.kind===kind)!.pack)))] as PackId[];
      await Promise.all([loadFoodAssets(packs),kitchenReady]);
      recipeReady=true;host.dataset.ingredients='ready';
      if(ready)host.classList.add('has-food-models');
    }catch{host.dataset.ingredients='failed';host.classList.remove('has-food-models');}
  }
  function basketPosition(index:number){const cols=order?.ingredients.length===7?4:3;return new THREE.Vector3(-5.55+(index%cols)*(cols===4?.55:.77),.12,.7-Math.floor(index/cols)*.75);}
  function select(){
    if(typingDriven||!ready||!recipeReady||!batch||!order||currentCut||serveStart>=0||!cadence.ready(time))return;
    if(batch.board!==undefined)return;
    const index=batch.basket[0];
    if(index===undefined||!batch.take(index))return;
    currentOrdinal=index;tray.remove(basketModels.get(index)!);basketModels.delete(index);
    center.clear();center.add(model(order.ingredients[index]));center.visible=true;intakeStart=time;
  }
  function beginOrder(next:KitchenOrder){
    reset();order=next;batch=new IngredientBatch(next.ingredients);prepTimeline=new IngredientPrepTimeline(next.ingredients.length);
    if(ready){
      for(const dish of dishes.values())dish.visible=false;
      let dish=dishes.get(next.recipe);
      if(!dish){dish=createServingDish(next.recipe);dishes.set(next.recipe,dish);world.add(dish);}
      bowl=dish;bowl.visible=true;bowl.position.set(3.9,.01,.25);
    }
    host.dataset.servingDish=next.recipe;
    host.querySelector('.plate-caption')!.textContent=SERVING_DISHES[next.recipe].name.toUpperCase();
    host.classList.remove('order-empty');
    host.querySelector('.prep-caption')!.textContent=next.title.toUpperCase();
    host.querySelector('.kitchen-tickets span b')!.textContent=String(next.index+1).padStart(2,'0');
    if(ready&&recipeReady)for(let index=0;index<next.ingredients.length;index++){
      const fruit=model(next.ingredients[index]);fruit.scale.setScalar(.70);fruit.position.copy(basketPosition(index));fruit.rotation.y=YAW+(index%3-1)*.22+Math.floor(index/3)*.25;
      tray.add(fruit);basketModels.set(index,fruit);
    }
    if(!typingDriven)select();draw();
  }
  function animate(el: Element, frames: Keyframe[], duration: number) {
    if(reduced())return;
    const animation=el.animate(frames,{duration,easing:'ease-out'});
    animations.add(animation);animation.onfinish=()=>animations.delete(animation);
    if(!active)animation.pause();
  }
  function model(kind:FoodKind, part:''|'_left'|'_right'='') {
    const group=restingFoodModel(foodModel(kind,part)!,foodModel(kind)!,kind);
    group.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;}});
    return group;
  }
  function resize() {
    if(!renderer || !host.clientWidth || !host.clientHeight)return;
    const width=host.clientWidth,height=host.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio,settings.quality()==='low'?1:settings.quality()==='high'?2:1.5));
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    // Short storybook viewports retain the whole set, including its shelf.
    // Keep the camera's vertical framing once the viewport becomes very wide.
    const framingAspect=settings.frameKitchen?.()?Math.min(camera.aspect,2.9):camera.aspect;
    // On wide, shallow windows keep the entire prep surface in view.
    camera.lookAt(0,Math.max(.15,Math.min(1,1-(framingAspect-3)*.35)),-.9);
    // Fit the island horizontally. Perspective keeps the rear counter at a natural depth.
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(7.05/(framingAspect*15.4)));
    camera.updateProjectionMatrix();draw();
  }
  function addPieces(ordinal:number,born:number) {
    for(const direction of [-1,1]){
      const group=model(order!.ingredients[ordinal],direction<0?'_left':'_right');world.add(group);
      pieces.push({group,born,direction,slot:pieceCount++%12,ordinal});
      if(pieces.length>16)world.remove(pieces.shift()!.group);
    }
  }
  function clearBowl(){for(const p of pieces)world.remove(p.group);pieces.length=0;pieceCount=0;}
  function prepPose(index:number){
    const pose=ingredientPrepPose(prepProgress,index,order!.ingredients.length);
    if(reduced()){pose.intake=1;pose.cut=cutPose(pose.cut.split?CUT_END:0);}
    if(batch?.bowl.includes(index)){pose.intake=1;pose.cut=cutPose(CUT_END);}
    return pose;
  }
  function syncTypingPrep(){
    if(!batch||!order)return;
    prepProgress=prepTimeline?.advance(time,reduced())??0;
    let current:ReturnType<typeof ingredientPrepPose>|undefined;
    for(let index=0;index<order.ingredients.length;index++){
      const pose=prepPose(index);
      if(!pose.started)break;
      if(batch.basket.includes(index)&&batch.take(index)){
        currentOrdinal=index;tray.remove(basketModels.get(index)!);basketModels.delete(index);
        center.clear();center.add(model(order.ingredients[index]));
      }
      if(pose.cut.split&&!scheduled.has(index)&&batch.cut(index)){
        scheduled.add(index);addPieces(index,time-CUT_END);
      }
      if(pose.cut.settled)batch.settle(index);
      else {current=pose;break;}
    }
    center.visible=batch.board!==undefined&&serveStart<0;
    if(center.visible){
      const arrival=current!.intake,start=basketPosition(batch.board!);
      center.position.lerpVectors(start,BOARD,arrival);center.position.y+=Math.sin(arrival*Math.PI)*.5;
      center.scale.setScalar(.7+arrival*.3);
    }
    knife.position.copy(BOARD);knife.position.y+=current?.cut.blade??1.35;
    knife.rotation.set(0,YAW,0);
    host.dataset.prepProgress=String(prepProgress);
    host.dataset.prepPhase=batch.complete?'ready':current?.cut.split?'cutting':current&&current.intake<1?'arriving':'preparing';
  }
  function startNext(){
    if(!ready || currentCut || serveStart>=0 || !pending.length)return;
    const next=pending[0];
    if(next.type==='serve'){
      if(!batch?.complete||(!typingDriven&&pieces.some(p=>time-p.born<CUT_END)))return;
      pending.shift();serveStart=time;center.visible=false;
    }else{
      if(!cadence.ready(time))return;
      select();
      const index=next.ingredient!;
      if(batch?.board!==index||(!reduced()&&time-intakeStart<.32))return;
      pending.shift();batch.cut(index);currentCut={born:time,ordinal:index,released:false};
    }
  }
  function draw() {
    if(!renderer || !ready || !recipeReady || !host.isConnected)return;
    if(typingDriven)syncTypingPrep();
    startNext();
    if(!typingDriven){
      if(!currentCut&&!pending.length&&serveStart<0&&cadence.ready(time))select();
      if(batch?.board!==undefined){
        const t=reduced()?1:Math.min(1,(time-intakeStart)/.32),start=basketPosition(batch.board);
        center.position.lerpVectors(start,BOARD,t);center.position.y+=Math.sin(t*Math.PI)*.5;center.scale.setScalar(.7+t*.3);
      }else{center.position.copy(BOARD);center.scale.setScalar(1);}
      const age=currentCut?time-currentCut.born:0,pose=cutPose(age);
      knife.position.copy(BOARD);knife.position.y+=currentCut?pose.blade:1.35+view.progress*.13;
      knife.rotation.set(0,YAW,0);
      if(currentCut){
        if((pose.split||reduced()) && !currentCut.released){addPieces(currentCut.ordinal,reduced()?time-CUT_END:currentCut.born);currentCut.released=true;center.visible=false;}
        if(age>=CUT_END||reduced()){
          // If motion was disabled midway through a cut, settle all its pieces first.
          if(reduced())for(const piece of pieces)piece.born=Math.min(piece.born,time-CUT_END);
          batch?.settle(currentCut.ordinal);currentCut=undefined;cadence.finish(time);center.visible=false;
        }
      }
    }
    const serving=serveStart<0?0:reduced()?1:Math.min(1,(time-serveStart)/.55),serveX=reduced()?0:serving*serving*8;
    bowl.position.x=3.9+serveX;
    for(const piece of pieces){
      const p=typingDriven?prepPose(piece.ordinal).cut:reduced()?cutPose(CUT_END):cutPose(time-piece.born);
      const spread=piece.direction*p.spread*.30,sx=BOARD.x+Math.cos(YAW)*spread,sz=BOARD.z-Math.sin(YAW)*spread;
      const target=servingSlot(order!.recipe,piece.slot).add(new THREE.Vector3(3.9,.01,.25));
      piece.group.position.set(THREE.MathUtils.lerp(sx,target.x,p.transfer)+serveX,
        THREE.MathUtils.lerp(BOARD.y,target.y,p.transfer)+(reduced()?0:Math.sin(p.transfer*Math.PI)*1.35),
        THREE.MathUtils.lerp(sz,target.z,p.transfer));
      piece.group.rotation.set(p.transfer*.65,YAW+piece.direction*p.spread*.48,-piece.direction*p.spread*.18);
      piece.group.scale.setScalar(1-p.transfer*.45);
    }
    if(serveStart>=0 && serving>=1){clearBowl();serveStart=-1;bowl.position.x=3.9;}
    host.dataset.basket=JSON.stringify(batch?.basket??[]);host.dataset.bowl=JSON.stringify(batch?.bowl??[]);host.dataset.board=String(batch?.board??'');
    host.dataset.fruitVisible=String(center.visible);
    host.dataset.fruitOrdinal=String(currentOrdinal);
    if(serveStart>=0)host.dataset.prepPhase='serving';
    else if(!typingDriven)host.dataset.prepPhase=currentCut?'cutting':!cadence.ready(time)?'resting':'ready';
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
  const kitchenReady = new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/typeslasher-kitchen.glb?v=2`).then(asset=>{
    try{
      knife=asset.scene.getObjectByName('chef_knife')!;const originalBowl=asset.scene.getObjectByName('service_bowl')!;
      if(!knife||!originalBowl)throw new Error('Kitchen asset is incomplete');
      originalBowl.visible=false;bowl=createServingDish('fruit');dishes.set('fruit',bowl as THREE.Group);world.add(bowl);bowl.position.set(3.9,.01,.25);
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
  function reset(){
    host.classList.add('order-empty');
    animations.forEach(animation=>animation.cancel());animations.clear();clearBowl();pending.length=0;
    batch?.clear();batch=undefined;order=undefined;center.clear();center.visible=false;tray.clear();basketModels.clear();scheduled.clear();
    currentCut=undefined;serveStart=-1;currentOrdinal=-1;intakeStart=-1;fallbackCount=0;cadence.reset();
    prepTimeline=undefined;prepProgress=0;host.dataset.prepProgress='0';
    if(bowl)bowl.position.x=3.9;
    host.querySelector('.kitchen-callout')!.textContent='';host.querySelector('.fallback-slices')!.textContent='';
    host.dataset.basket='[]';host.dataset.bowl='[]';host.dataset.board='';draw();
  }
  return {
    setActive,prepare,beginOrder,reset,
    abort(){reset();host.querySelector('.kitchen-callout')!.textContent='ORDER LOST';},
    get busy(){return ready&&(pending.length>0||serveStart>=0||(typingDriven?!!prepTimeline?.busy:!!currentCut||pieces.some(p=>time-p.born<CUT_END)));},
    get finalCutReached(){return !ready||!recipeReady||!order||scheduled.has(order.ingredients.length-1);},
    update(next:KitchenView){
      view=next;
      if(next.sentenceProgress!==undefined){
        typingDriven=true;
        if(next.sentenceProgress>=1&&order)prepTimeline?.unlock(order.ingredients.length,time,true);
      }
      host.style.setProperty('--word-charge',String(view.progress));
      host.classList.toggle('kitchen-error',view.error);host.classList.toggle('kitchen-calm',reduced());

      host.querySelector('.served-ticket b')!.textContent=String(view.served);
      if(typingDriven||!active||reduced())draw();
    },
    effect(effect:ServiceEffect){
      const callout=host.querySelector<HTMLElement>('.kitchen-callout')!;
      callout.textContent=effect.type==='serve'?`${effect.fresh?'FRESH ORDER!':effect.clean?'PERFECT DISH!':'ORDER READY!'}${effect.points?' +'+effect.points:''}`:`${effect.clean?'CLEAN CUT':'SLICED'} +${effect.points}`;
      callout.classList.toggle('serve-callout',effect.type==='serve');
      animate(callout,[{opacity:1,transform:'translate(-50%,5px)'},{opacity:1,offset:.65},{opacity:0,transform:'translate(-50%,-8px)'}],effect.type==='serve'?650:450);
      if(ready&&recipeReady&&order){
        if(typingDriven&&effect.type==='cut')prepTimeline?.unlock(order.cutOrdinals.filter(ordinal=>ordinal<=effect.ordinal).length,time);
        if(effect.type==='serve'){prepTimeline?.unlock(order.ingredients.length,time,true);pending.push(effect);}
        else if(!typingDriven)order.cutOrdinals.forEach((ordinal,index)=>{
          if(ordinal===effect.ordinal&&!scheduled.has(index)){scheduled.add(index);pending.push({...effect,ingredient:index});}
        });
      }
      fallbackCount=effect.type==='serve'?0:fallbackCount+1;
      host.querySelector('.fallback-slices')!.textContent='◒ '.repeat(Math.min(5,fallbackCount));draw();
    },
  };
}
