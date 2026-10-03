import './ui-prototype.css';
import * as THREE from 'three';
import { foodModel, loadFoodAssets, lightFoodScene } from './food-assets';
import { selectionTitle, foodsForPlay, FOOD_PACKS, type FoodSelection, type FoodKind, type PackId } from './food-catalog';

const trayFiles=import.meta.glob('../design/ui-v2/trays/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const tray=(id:string)=>trayFiles[`../design/ui-v2/trays/${id}.png`];
const picks:FoodSelection[]=['starter','fresh','snacks','big','mixed'];
const levels=['Sprout','Slicer','Chef','Master'];
const paces=['Relaxed','Steady','Brisk'];
const state={screen:'home',basket:'starter' as FoodSelection,mode:'Arcade',level:0,pace:0,adaptive:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
const el=document.querySelector<HTMLDivElement>('#prototype')!;
el.innerHTML=`
  <header class="preview-bar"><span><b>DESIGN PLAYGROUND</b><span class="preview-detail"> UI-1 · Sample results · Progress is not saved</span></span><a href="./">Open current game ↗</a></header>
  <main class="cabinet">
    <div class="cabinet-grain" aria-hidden="true"></div>
    <header class="game-nav"><button class="small-brand" data-go="home" aria-label="Typeslasher preview home">TYPE<span>SLASHER</span><i aria-hidden="true"></i></button><div><label class="motion-toggle"><input id="calm-preview" type="checkbox" ${state.reduced?'checked':''}> Less motion</label><button class="utility" data-info="settings">Settings <span aria-hidden="true">⚙</span></button></div></header>
    <section class="screen home-screen" data-screen="home" aria-labelledby="home-heading">
      <div class="hero-art">
        <p class="arcade-sign">THE MIDNIGHT SNACK ARCADE <span aria-hidden="true">✦</span></p>
        <h1 id="home-heading" class="game-logo"><span>TYPE</span><strong>SLASHER</strong></h1>
        <div class="food-stage" id="food-stage"><div class="orbit-stroke" aria-hidden="true"></div><canvas id="hero-food" aria-label="Sculpted food floating over an arcade counter"></canvas><span class="stage-spark spark-one" aria-hidden="true">✦</span><span class="stage-spark spark-two" aria-hidden="true">✦</span><span class="floating-key key-f" aria-hidden="true">F</span><span class="floating-key key-j" aria-hidden="true">J</span><div class="counter" aria-hidden="true"><span>FRESH WORDS. CLEAN CUTS.</span></div><p id="scene-status" role="status">Packing the food…</p></div>
        <p class="hero-motto">Ready. Set. <b>Slice.</b></p>
      </div>
      <nav class="home-actions" aria-label="Main menu"><span class="handwritten">Your next great slice starts here.</span><button class="play-key" data-go="results"><span class="play-triangle" aria-hidden="true">▶</span><span>PLAY<small>90 seconds of snack slicing</small></span><kbd>↵</kbd></button><div class="current-setup"><p id="home-summary"></p><button class="change-link" data-go="setup">Change setup <span aria-hidden="true">→</span></button></div><button class="secondary-key training-key" data-info="training"><span class="key-icon" aria-hidden="true">F J</span><span>TRAINING<small>A little practice. A lot more confidence.</small></span><span aria-hidden="true">↗</span></button><button class="secondary-key locker-key" data-info="locker"><span class="key-icon" aria-hidden="true">✦</span><span>LOCKER<small>Your foods, looks & personal bests.</small></span><span aria-hidden="true">↗</span></button><p class="home-hint">A keyboard. Two hands. Plenty of time.</p></nav>
    </section>
    <section class="screen setup-screen" data-screen="setup" aria-labelledby="setup-heading" hidden>
      <header class="screen-title"><button class="back-key" data-go="home">← Back</button><div><p class="section-kicker">MAKE IT YOUR ROUND</p><h1 id="setup-heading" tabindex="-1">Pick your <em>flavor.</em></h1></div><span class="corner-stamp" aria-hidden="true">ALL FOODS<br>ON THE HOUSE</span></header>
      <div class="setup-scroll"><div class="setup-top"><fieldset class="mode-field"><legend>01 <span>Choose your groove</span></legend><div class="mode-options"><button data-mode="Arcade" class="mode-choice" aria-pressed="true"><span class="mode-art arcade-art" aria-hidden="true"><i></i><i></i><b>╱</b></span><span><b>Arcade</b><small>Find your flow. Slice at your pace.</small></span><span class="choice-check" aria-hidden="true">✓</span></button><button data-mode="Beat Kitchen" class="mode-choice" aria-pressed="false"><span class="mode-art beat-art" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><b>Beat Kitchen</b><small>Finish near the beat for a bonus.</small></span><span class="choice-check" aria-hidden="true">✓</span></button></div><p id="mode-note">No beat to chase. Take each word as it comes.</p></fieldset><fieldset class="challenge-field"><legend>02 <span>How many flying foods?</span></legend><div class="level-options">${levels.map((name,i)=>`<button data-level="${i}" aria-pressed="${i===0}"><span class="food-pips" aria-hidden="true">${'●'.repeat(i+1)}</span><b>${name}</b><small>${i+1} ${i?'foods':'food'}</small></button>`).join('')}</div><p id="level-note">One food at a time. A comfortable place to start.</p></fieldset></div>
      <fieldset class="basket-field"><legend>03 <span>Fill your basket</span><small id="word-note"></small></legend><div class="basket-options">${picks.map((id,i)=>`<button class="basket-choice basket-${id}" data-basket="${id}" aria-pressed="${i===0}"><span class="choice-check" aria-hidden="true">✓</span><img src="${tray(id)}" alt="" width="384" height="240"><b>${selectionTitle(id)}</b><small>${['The familiar favorites','Bright & juicy','Bakery meets movie night','Longer words, bigger bites','A little of everything'][i]}</small></button>`).join('')}</div><p class="basket-description" id="basket-description"></p></fieldset>
      <div class="setup-bottom"><fieldset class="pace-field"><legend>Typing time</legend><div>${paces.map((p,i)=>`<button data-pace="${i}" aria-pressed="${i===0}">${p}</button>`).join('')}</div><p id="pace-note">Extra time to find every letter.</p></fieldset><details class="more-options"><summary>More options</summary><label><input id="gentle-adjust" type="checkbox" checked> Gently adjust as I improve</label><p>Only future foods get faster or slower.</p></details></div></div>
      <footer class="setup-footer"><span id="setup-summary"></span><button class="play-key compact" data-go="results"><span>PLAY THIS SETUP</span><span aria-hidden="true">▶</span></button></footer>
    </section>
    <section class="screen results-screen" data-screen="results" aria-labelledby="results-heading" hidden>
      <div class="result-stage"><span class="result-ribbon">EXAMPLE SCORECARD</span><h1 id="results-heading" tabindex="-1">Nicely<br><em>sliced!</em></h1><div class="result-medal" aria-label="Sample accuracy 96 percent"><span>ACCURACY</span><b>96<small>%</small></b><span>THOSE KEYS ARE CLICKING.</span></div><img id="result-foods" src="${tray('starter')}" alt="A tray of sculpted food" width="384" height="240"><span class="result-spark" aria-hidden="true">✦</span></div>
      <div class="result-details"><div class="best-stamp">✦ PERSONAL BEST <small>sample result</small></div><h2>A tasty round.</h2><p class="result-mode" id="result-summary"></p><div class="score-strip"><div><span>FOODS SLICED</span><strong>18</strong></div><div><span>SCORE</span><strong>2,400</strong></div></div><div class="unlock-strip"><span class="unlock-symbol" aria-hidden="true">✹</span><div><b>A little closer to Citrus rush</b><span>7 more slices to a fresh kitchen look</span><div class="unlock-progress" role="progressbar" aria-label="Example Citrus rush progress" aria-valuenow="18" aria-valuemin="0" aria-valuemax="25"><i></i></div></div><small>18 / 25</small></div><button class="play-key replay-key" id="replay-preview"><span>PLAY AGAIN</span><span aria-hidden="true">↻</span></button><div class="result-links"><button data-go="setup">Change setup →</button><button data-go="home">Back to home</button></div><p class="coach-note"><b>Next time:</b> keep those careful letters coming.</p></div>
    </section>
    <div class="slash-transition" aria-hidden="true"></div>
  </main>
  <footer class="preview-controls"><span>EXPLORE THE CONCEPT</span><nav aria-label="Prototype screens"><button data-go="home" aria-current="page">01 Home</button><button data-go="setup">02 Setup</button><button data-go="results">03 Results</button></nav><span class="preview-status" role="status" id="preview-status">Choose a screen or try the buttons.</span></footer>
  <dialog id="preview-dialog" aria-labelledby="dialog-title"><button class="dialog-close" aria-label="Close preview panel">×</button><span class="section-kicker">NEXT IN THE REFRESH</span><h2 id="dialog-title"></h2><p id="dialog-copy"></p><div id="dialog-detail"></div><button class="back-key dialog-done">Back to preview</button></dialog>`;

const status=document.querySelector<HTMLElement>('#preview-status')!;
function sync(){
  const summary=`${state.mode} · ${levels[state.level]} · ${selectionTitle(state.basket)}`;
  for(const id of ['home-summary','setup-summary','result-summary'])document.getElementById(id)!.textContent=summary;
  for(const [attr,key] of [['mode','mode'],['level','level'],['pace','pace'],['basket','basket']] as const)el.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===String(state[key]))));
  const pool=foodsForPlay(state.basket,state.level===0);
  const lengths=pool.map(f=>f.letters);
  document.querySelector('#word-note')!.textContent=`${pool.length} foods · ${Math.min(...lengths)}–${Math.max(...lengths)} letters${state.basket==='mixed'&&state.level===0?' · Short words':''}`;
  document.querySelector('#basket-description')!.textContent=`On the menu: ${pool.slice(0,6).map(f=>f.name).join(', ')}${pool.length>6?' + more':''}.`;
  document.querySelector('#mode-note')!.textContent=state.mode==='Arcade'?'No beat to chase. Take each word as it comes.':'Type freely. Finishing near a beat adds a bonus.';
  document.querySelector('#level-note')!.textContent=['One food at a time. A comfortable place to start.','Two foods. Pick one and finish its word.','Three foods. Find a rhythm between slices.','Four foods. More targets and quicker timing.'][state.level];
  document.querySelector('#pace-note')!.textContent=['Extra time to find every letter.','A comfortable challenge for familiar keys.','Quicker slices when your fingers feel ready.'][state.pace];
  (document.querySelector('#result-foods') as HTMLImageElement).src=tray(state.basket+'-cut');
}
function go(screen:string){
  state.screen=screen;
  el.querySelectorAll<HTMLElement>('[data-screen]').forEach(s=>{s.hidden=s.dataset.screen!==screen;});
  el.querySelectorAll<HTMLButtonElement>('.preview-controls [data-go]').forEach(b=>{if(b.dataset.go===screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  document.querySelector('.cabinet')!.setAttribute('data-view',screen);
  const wipe=document.querySelector<HTMLElement>('.slash-transition')!;wipe.classList.remove('sweep');if(!state.reduced){void wipe.offsetWidth;wipe.classList.add('sweep');}
  sync();status.textContent=screen==='results'?'Sample results only. No round was played or saved.':'Choose a screen or try the buttons.';
  const focus=document.getElementById(`${screen==='results'?'results':screen==='setup'?'setup':'home'}-heading`)!;focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});
  if(screen==='home'){void updateScene();}else cancelAnimationFrame(frame);
}
el.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go!)));
el.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode!;sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=Number(b.dataset.level);sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-pace]').forEach(b=>b.addEventListener('click',()=>{state.pace=Number(b.dataset.pace);sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-basket]').forEach(b=>b.addEventListener('click',()=>{state.basket=b.dataset.basket as FoodSelection;sync();}));
document.querySelector('#gentle-adjust')!.addEventListener('change',e=>state.adaptive=(e.target as HTMLInputElement).checked);
document.querySelector('#calm-preview')!.addEventListener('change',e=>{state.reduced=(e.target as HTMLInputElement).checked;el.classList.toggle('reduced',state.reduced);if(state.screen==='home')animateScene();});
document.querySelector('#replay-preview')!.addEventListener('click',()=>{go('home');status.textContent='In the game, Play again will start your next round with this setup.';});
const dialog=document.querySelector<HTMLDialogElement>('#preview-dialog')!;
const info={training:['A little prep. Big slices.','Four short, untimed stations will help your fingers find their home. Training is planned for the next phase.','F + J   /   LEFT HAND   /   RIGHT HAND   /   BOTH HANDS'],locker:['Make yourself at home.','Browse all 26 foods, preview kitchen looks, and find your next practice step. Locker is planned for the next phase.','KITCHEN LOOKS   /   FOOD COLLECTION   /   MY PRACTICE'],settings:['Your kind of comfortable.','Sound, comfort, and display controls will live here. For this preview, Less motion already works in the top bar.','SOUND   /   COMFORT   /   DISPLAY']} as const;
el.querySelectorAll<HTMLButtonElement>('[data-info]').forEach(b=>b.addEventListener('click',()=>{const [title,copy,detail]=info[b.dataset.info as keyof typeof info];document.querySelector('#dialog-title')!.textContent=title;document.querySelector('#dialog-copy')!.textContent=copy;document.querySelector('#dialog-detail')!.textContent=detail;dialog.showModal();}));
for(const b of dialog.querySelectorAll('button'))b.addEventListener('click',()=>dialog.close());
window.addEventListener('keydown',e=>{if(dialog.open)return;if(e.key==='Escape'){go('home');return;}if(e.key==='Enter'&&!(e.target as HTMLElement).closest('button,input,summary,a')){e.preventDefault();go('results');}});
sync();el.classList.toggle('reduced',state.reduced);

// One shared render surface. Basket thumbnails are small pre-rendered images.
const canvas=document.querySelector<HTMLCanvasElement>('#hero-food')!;
const stage=document.querySelector<HTMLElement>('#food-stage')!;
let renderer:THREE.WebGLRenderer|undefined,scene:THREE.Scene,camera:THREE.OrthographicCamera;
let frame=0,epoch=0,start=0;const posed:{model:THREE.Object3D;y:number;ry:number}[]=[];
const heroes:Record<FoodSelection,FoodKind[]>={starter:['apple','banana','cookie','kiwi'],fresh:['orange','donut','lime','peach'],snacks:['popcorn','pretzel','muffin','waffle'],big:['pineapple','watermelon','strawberry','avocado'],garden:['tomato','pepper','radish','mushroom'],market:['lemon','fig','dragonfruit','cherry'],pantry:['bagel','pumpkin','cheese','croissant'],mixed:['grape','cookie','pear','apple']};
function draw(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.left=-4.3;camera.right=4.3;camera.top=4.3*h/w;camera.bottom=-camera.top;camera.updateProjectionMatrix();renderer.render(scene,camera);}
function animateScene(){cancelAnimationFrame(frame);start=performance.now();function tick(t:number){if(document.hidden||state.screen!=='home')return;const progress=state.reduced?1:Math.min(1,(t-start)/650);const eased=1-(1-progress)**3;posed.forEach(({model,y,ry},i)=>{model.position.y=y-(1-eased)*(.5+i*.13);model.rotation.y=ry+(1-eased)*.24;});draw();if(progress<1)frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
async function updateScene(){
  const current=++epoch;const caption=document.querySelector<HTMLElement>('#scene-status')!;
  try{
    if(!renderer){renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,60);camera.position.set(0,0,15);lightFoodScene(renderer,scene);}
    const pack:PackId=state.basket==='mixed'?'starter':state.basket;caption.textContent=`Packing ${FOOD_PACKS[pack].title.toLowerCase()}…`;
    await loadFoodAssets([pack]);if(current!==epoch)return;
    for(const {model} of posed)scene.remove(model);posed.length=0;
    const layout=[[-2.6,.2,.94,-.3],[-.7,-.18,1.04,.2],[1.5,.27,.92,-.16],[2.75,-.65,.70,.34]];
    heroes[state.basket].forEach((food,i)=>{const model=foodModel(food)!;const [x,y,scale,angle]=layout[i];model.position.set(x,y,0);model.scale.setScalar(scale);model.rotation.set(.12,angle,angle);scene.add(model);posed.push({model,y,ry:angle});});
    caption.textContent='';animateScene();
  }catch{caption.innerHTML='Food preview could not load. <button id="retry-scene">Try again</button>';document.querySelector('#retry-scene')!.addEventListener('click',()=>void updateScene());}
}
new ResizeObserver(()=>{if(state.screen==='home')draw();}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else if(state.screen==='home')draw();});
void updateScene();
