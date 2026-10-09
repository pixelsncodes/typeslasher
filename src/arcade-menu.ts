import './arcade-menu.css';
import { createHomeArtwork } from './home-art';
import { selectionTitle, foodsForPlay, FOOD_PACKS, type FoodSelection, type PackId } from './food-catalog';

export type MenuSetup={basket:FoodSelection;mode:string;level:number;pace:number;adaptive:boolean;reduced:boolean;seconds:number};
export function createArcadeMenu(options:{
 setup:()=>MenuSetup; change:(setup:MenuSetup)=>void; play:()=>void;
 next:()=>void; training:()=>void; settings:()=>void; locker:(dialog:HTMLDialogElement)=>void;
 sentence:()=>void; sentenceReady:()=>boolean;
}) {
const trayFiles=import.meta.glob('../design/ui-v2/trays/*.webp',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const tray=(id:string)=>trayFiles[`../design/ui-v2/trays/${id}.webp`];
const picks:FoodSelection[]=[...Object.keys(FOOD_PACKS) as PackId[],'mixed'];
const levels=['Sprout','Slicer','Chef','Master'];
const paces=['Relaxed','Steady','Brisk'];
const state={screen:'home',...options.setup()};
let playstyle:'food'|'sentence'='food';
let foodBusy=false;
try { if(localStorage.getItem('typeslasher-playstyle')==='sentence') playstyle='sentence'; } catch { /* Optional preference. */ }
const el=document.createElement('div');el.id='arcade-menu';document.body.append(el);
const game=document.querySelector<HTMLElement>('#app')!;game.inert=true;
el.innerHTML=`
  <main class="cabinet" data-view="home">
    <div class="cabinet-grain" aria-hidden="true"></div>
    <header class="game-nav"><button class="small-brand" data-go="home" aria-label="Typeslasher home">TYPE<span>SLASHER</span><i aria-hidden="true"></i></button><div><label class="motion-toggle"><input id="calm-preview" type="checkbox" ${state.reduced?'checked':''}> Less motion</label><button class="utility" data-info="settings">Settings <span aria-hidden="true">⚙</span></button></div></header>
    <section class="screen home-screen" data-screen="home" aria-labelledby="home-heading">
      <div class="hero-art">
        <p class="arcade-sign">THE MIDNIGHT SNACK ARCADE <span aria-hidden="true">✦</span></p>
        <div class="food-stage" id="food-stage">
          <svg class="logo-orbit" viewBox="0 0 1000 893" fill="none" aria-hidden="true"><path d="M860 147C1040 346 602 563 219 615C-17 647 40 455 376 350C564 291 716 254 792 204" stroke="#dd6684" stroke-width="14"/><path d="M860 142C1040 341 602 558 219 610C-17 642 40 450 376 345C564 286 716 249 792 199" stroke="#ffe8ac" stroke-width="7"/></svg>
          <canvas id="hero-food" aria-hidden="true"></canvas>
          <h1 id="home-heading" class="game-logo" data-float="0.5"><span>TYPE</span><strong>SLASHER</strong></h1>
          <svg class="logo-orbit logo-orbit-front" viewBox="0 0 1000 893" fill="none" aria-hidden="true"><path d="M158 631C249 839 782 846 899 658C930 608 902 561 873 548" stroke="#dd6684" stroke-width="13"/><path d="M154 624C245 832 778 839 895 651C926 601 898 554 869 541" stroke="#ffe8ac" stroke-width="6"/></svg>
          <span class="stage-spark spark-one" data-float="1.4" aria-hidden="true">✦</span><span class="stage-spark spark-two" data-float="3.2" aria-hidden="true">✦</span><span class="stage-spark spark-three" data-float="2.1" aria-hidden="true">✦</span><span class="stage-spark spark-four" data-float="4.2" aria-hidden="true">✦</span>
          <span class="floating-key key-f" data-float="2.6" aria-hidden="true">F</span><span class="floating-key key-j" data-float="4.4" aria-hidden="true">J</span><p id="scene-status" role="status">Packing the food…</p>
        </div>
        <p class="hero-motto">Ready. Set. <b>Slice.</b></p>
      </div>
      <nav class="home-actions" aria-label="Main menu"><span class="handwritten">Your next great slice starts here.</span><div class="playstyle-choice" role="group" aria-label="Playstyle"><button data-playstyle="food" aria-pressed="true">🍎 FOOD SLASH</button><button data-playstyle="sentence" aria-pressed="false">✦ SENTENCE SLASH</button></div><button class="play-key" data-play><span class="play-triangle" aria-hidden="true">▶</span><span id="home-play-label">PLAY<small>30 seconds + your final snack</small></span><kbd>↵</kbd></button><div class="current-setup"><p id="home-summary"></p><button class="change-link" data-go="setup">Change setup <span aria-hidden="true">→</span></button></div><button class="secondary-key training-key" data-info="training"><span class="key-icon" aria-hidden="true">F J</span><span>TRAINING<small>A little practice. A lot more confidence.</small></span><span aria-hidden="true">↗</span></button><button class="secondary-key locker-key" data-info="locker"><span class="key-icon" aria-hidden="true">✦</span><span>LOCKER<small>Your foods, looks & personal bests.</small></span><span aria-hidden="true">↗</span></button><p class="home-hint">A keyboard. Two hands. Plenty of time.</p></nav>
    </section>
    <section class="screen setup-screen" data-screen="setup" aria-labelledby="setup-heading" hidden>
      <header class="screen-title"><button class="back-key" data-go="home">← Back</button><div><p class="section-kicker">MAKE IT YOUR ROUND</p><h1 id="setup-heading" tabindex="-1">Pick your <em>flavor.</em></h1></div><span class="corner-stamp" aria-hidden="true">ALL FOODS<br>ON THE HOUSE</span></header>
      <div class="setup-scroll"><div class="setup-top"><fieldset class="mode-field"><legend>01 <span>Choose your groove</span></legend><div class="mode-options"><button data-mode="Free Play" class="mode-choice" aria-pressed="true"><span><b>Free Play</b><small>One round. Your pace.</small></span><span class="choice-check" aria-hidden="true">✓</span></button><button data-mode="Arcade" class="mode-choice" aria-pressed="true"><span class="mode-art arcade-art" aria-hidden="true"><i></i><i></i><b>╱</b></span><span><b>Arcade</b><small>Build a streak of harder rounds.</small></span><span class="choice-check" aria-hidden="true">✓</span></button><button data-mode="Beat Kitchen" class="mode-choice" aria-pressed="false"><span class="mode-art beat-art" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><b>Beat Kitchen</b><small>Finish near the beat for a bonus.</small></span><span class="choice-check" aria-hidden="true">✓</span></button></div><p id="menu-mode-note">No beat to chase. Take each word as it comes.</p></fieldset><fieldset class="challenge-field"><legend>02 <span>How many flying foods?</span></legend><div class="level-options">${levels.map((name,i)=>`<button data-level="${i}" aria-pressed="${i===0}"><span class="food-pips" aria-hidden="true">${'●'.repeat(i+1)}</span><b>${name}</b><small>${i+1} ${i?'foods':'food'}</small></button>`).join('')}</div><p id="level-note">One food at a time. A comfortable place to start.</p></fieldset></div>
      <fieldset class="basket-field"><legend>03 <span>Fill your basket</span><small id="word-note"></small></legend><div class="basket-options">${picks.map((id,i)=>`<button class="basket-choice basket-${id}" data-basket="${id}" aria-pressed="${i===0}"><span class="choice-check" aria-hidden="true">✓</span><img src="${tray(id)}" alt="" width="384" height="240"><b>${selectionTitle(id)}</b><small>${id==='mixed'?'A little of everything':FOOD_PACKS[id].description}</small></button>`).join('')}</div><p class="basket-description" id="basket-description"></p></fieldset>
      <div class="setup-bottom"><fieldset class="pace-field"><legend>Typing time</legend><div>${paces.map((p,i)=>`<button data-pace="${i}" aria-pressed="${i===0}">${p}</button>`).join('')}</div><p id="pace-note">Extra time to find every letter.</p></fieldset><fieldset class="duration-field"><legend>Round length</legend><div>${[30,60,90].map(seconds=>`<button data-seconds="${seconds}" aria-pressed="${state.seconds===seconds}">${seconds}s</button>`).join('')}</div><p>A little time to finish the last food.</p></fieldset><details class="more-options"><summary>More options</summary><label><input id="gentle-adjust" type="checkbox" checked> Gently adjust as I improve</label><p>Only future foods get faster or slower.</p></details></div></div>
      <footer class="setup-footer"><span id="setup-summary"></span><button class="play-key compact" data-play><span>PLAY THIS SETUP</span><span aria-hidden="true">▶</span></button></footer>
    </section>
    <section class="screen results-screen" data-screen="results" aria-labelledby="results-heading" hidden>
      <div class="result-stage"><span class="result-ribbon">ROUND COMPLETE</span><h1 id="results-heading" tabindex="-1">Nicely<br><em>sliced!</em></h1><div class="result-medal" aria-label="Accuracy"><span>ACCURACY</span><b>—</b><span>THOSE KEYS ARE CLICKING.</span></div><img id="menu-result-foods" src="${tray('starter')}" alt="A tray of sculpted food" width="384" height="240"><span class="result-spark" aria-hidden="true">✦</span></div>
      <div class="result-details"><div class="best-stamp">✦ ROUND COMPLETE</div><h2>A tasty round.</h2><p class="result-mode" id="result-summary"></p><div class="score-strip"><div><span>FOODS SLICED</span><strong>0</strong></div><div><span>SCORE</span><strong>0</strong></div></div><div class="unlock-strip"><span class="unlock-symbol" aria-hidden="true">✹</span><div><b>A little closer to Citrus rush</b><span></span><div class="unlock-progress" role="progressbar" aria-label="Kitchen look progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="25"><i></i></div></div><small></small></div><button class="play-key replay-key" id="arcade-next" hidden><span>NEXT ROUND</span><span aria-hidden="true">→</span></button><button class="play-key replay-key" id="replay-preview"><span>PLAY AGAIN</span><span aria-hidden="true">↻</span></button><div class="result-links"><button data-go="setup">Change setup →</button><button data-go="home">Back to home</button></div><p class="coach-note"><b>Next time:</b> keep those careful letters coming.</p></div>
    </section>
    <div class="slash-transition" aria-hidden="true"></div>
  </main>
  <p class="menu-status" role="status" id="preview-status"></p>
  <dialog id="preview-dialog" aria-labelledby="dialog-title"><button class="dialog-close" aria-label="Close Locker">×</button><span class="section-kicker">YOUR LOCKER</span><h2 id="dialog-title"></h2><p id="dialog-copy"></p><div id="dialog-detail"></div><button class="back-key dialog-done">Back to menu</button></dialog>`;

const artwork=createHomeArtwork(el.querySelector<HTMLElement>('#food-stage')!,state.reduced);
const status=el.querySelector<HTMLElement>('#preview-status')!;
function sync(){
  options.change({...state});
  el.classList.toggle('reduced',state.reduced);
  artwork.setReduced(state.reduced);
  el.querySelectorAll<HTMLButtonElement>('[data-playstyle]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.playstyle===playstyle)));
  el.querySelectorAll<HTMLButtonElement>('[data-play],#replay-preview').forEach(b=>{b.disabled=playstyle==='food'&&foodBusy;});
  el.querySelector<HTMLElement>('.current-setup')!.hidden=playstyle==='sentence';
  const ready=options.sentenceReady();
  el.querySelector('#home-play-label')!.innerHTML=playstyle==='sentence'?(ready?'PLAY<small>Your passage is ready</small>':'ADD TEXT<small>Paste a passage or try a story</small>'):`PLAY<small>${state.seconds} seconds + your final snack</small>`;
  el.querySelector<HTMLInputElement>('#gentle-adjust')!.checked=state.adaptive;
  el.querySelector<HTMLInputElement>('#calm-preview')!.checked=state.reduced;
  const summary=`${state.mode} · ${levels[state.level]} · ${selectionTitle(state.basket)} · ${state.seconds}s`;
  for(const id of ['home-summary','setup-summary','result-summary'])el.querySelector('#'+id)!.textContent=summary;
  for(const [attr,key] of [['mode','mode'],['level','level'],['pace','pace'],['basket','basket'],['seconds','seconds']] as const)el.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===String(state[key]))));
  el.querySelector<HTMLInputElement>('#gentle-adjust')!.disabled=state.mode==='Arcade';
  const pool=foodsForPlay(state.basket,state.mode!=='Arcade'&&state.level===0);
  const lengths=pool.map(f=>f.letters);
  el.querySelector('#word-note')!.textContent=`${pool.length} foods · ${Math.min(...lengths)}–${Math.max(...lengths)} letters${state.basket==='mixed'&&state.level===0?' · Short words':''}`;
  el.querySelector('#basket-description')!.textContent=`On the menu: ${pool.slice(0,6).map(f=>f.name).join(', ')}${pool.length>6?' + more':''}.`;
  el.querySelector('#menu-mode-note')!.textContent=state.mode==='Arcade'?'Each round gets a little quicker. Take a breather between rounds.':state.mode==='Free Play'?'One round at your chosen pace. Accuracy comes first.':'Type freely. Finishing near a beat adds a bonus.';
  el.querySelector('#level-note')!.textContent=['One food at a time. A comfortable place to start.','Two foods. Pick one and finish its word.','Three foods. Find a rhythm between slices.','Four foods. More targets and quicker timing.'][state.level];
  el.querySelector('#pace-note')!.textContent=['Extra time to find every letter.','A comfortable challenge for familiar keys.','Quicker slices when your fingers feel ready.'][state.pace];
  (el.querySelector('#menu-result-foods') as HTMLImageElement).src=tray(state.basket+'-cut');
}
function go(screen:string){
  el.hidden=false;
  game.inert=true;
  Object.assign(state,options.setup());
  state.screen=screen;
  el.querySelectorAll<HTMLElement>('[data-screen]').forEach(s=>{s.hidden=s.dataset.screen!==screen;});
  el.querySelectorAll<HTMLButtonElement>('.preview-controls [data-go]').forEach(b=>{if(b.dataset.go===screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  el.querySelector('.cabinet')!.setAttribute('data-view',screen);
  const wipe=el.querySelector<HTMLElement>('.slash-transition')!;wipe.classList.remove('sweep');if(!state.reduced){void wipe.offsetWidth;wipe.classList.add('sweep');}
  sync();
  const focus=el.querySelector<HTMLElement>(`#${screen==='results'?'results':screen==='setup'?'setup':'home'}-heading`)!;focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});
  if(screen==='home')artwork.start();else artwork.stop();
}
el.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go!)));
el.querySelectorAll<HTMLButtonElement>('[data-playstyle]').forEach(b=>b.addEventListener('click',()=>{playstyle=b.dataset.playstyle as 'food'|'sentence';try{localStorage.setItem('typeslasher-playstyle',playstyle);}catch{/* Optional. */}sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode!;sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=Number(b.dataset.level);sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-pace]').forEach(b=>b.addEventListener('click',()=>{state.pace=Number(b.dataset.pace);sync();}));
el.querySelectorAll<HTMLButtonElement>('[data-basket]').forEach(b=>b.addEventListener('click',()=>{state.basket=b.dataset.basket as FoodSelection;sync();}));
el.querySelector('#gentle-adjust')!.addEventListener('change',e=>{state.adaptive=(e.target as HTMLInputElement).checked;sync();});
el.querySelector('#calm-preview')!.addEventListener('change',e=>{state.reduced=(e.target as HTMLInputElement).checked;sync();});
el.querySelectorAll<HTMLButtonElement>('[data-seconds]').forEach(b=>b.addEventListener('click',()=>{state.seconds=Number(b.dataset.seconds);sync();}));
el.querySelector('#arcade-next')!.addEventListener('click',options.next);
const launch=()=>playstyle==='sentence'?options.sentence():options.play();
el.querySelector('#replay-preview')!.addEventListener('click',launch);
el.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',launch));
const dialog=el.querySelector<HTMLDialogElement>('#preview-dialog')!;
el.querySelectorAll<HTMLButtonElement>('[data-info]').forEach(b=>b.addEventListener('click',()=>{
 if(b.dataset.info==='training')options.training();
 else if(b.dataset.info==='settings')options.settings();
 else {options.locker(dialog);dialog.showModal();}
}));
for(const b of dialog.querySelectorAll('button'))b.addEventListener('click',()=>dialog.close());
window.addEventListener('keydown',e=>{
 if(el.hidden||e.repeat||e.ctrlKey||e.altKey||e.metaKey||document.querySelector('dialog[open]'))return;
 if(e.key==='Escape'){go('home');return;}
 if(e.key==='Enter'&&!e.repeat&&!(e.target as HTMLElement).closest('button,input,summary,a,select')){e.preventDefault();launch();}
});
sync();


return {
 refreshPreferences(){Object.assign(state,options.setup());sync();},
 home(){Object.assign(state,options.setup());go('home');},
 hide(){el.hidden=true;game.inert=false;state.screen='game';artwork.stop();},
 visible:()=>!el.hidden,
 loading(label:string,busy:boolean){foodBusy=busy;status.textContent=playstyle==='sentence'?'':label;el.querySelectorAll<HTMLButtonElement>('[data-play],#replay-preview').forEach(b=>{b.disabled=playstyle==='food'&&busy;});},
 results(data:{accuracy:string;score:number;foods:number;best:boolean;message:string;total:number;next?:{title:string;unlock:number};round?:number}){
   go('results');
   el.querySelector('.result-ribbon')!.textContent=data.round?`ROUND ${data.round} COMPLETE`:'ROUND COMPLETE';
   el.querySelector<HTMLElement>('#arcade-next')!.hidden=!data.round;
   el.querySelector<HTMLElement>('#replay-preview')!.hidden=!!data.round;
   if(data.round)el.querySelector('#result-summary')!.textContent=`Round ${data.round} finished · Round ${data.round+1} is a little quicker`;
   const medal=el.querySelector('.result-medal')!;
   medal.setAttribute('aria-label','Accuracy '+data.accuracy);
   medal.querySelector('b')!.textContent=data.accuracy;
   medal.querySelector('span:last-child')!.textContent=data.foods?'ONE WORD AT A TIME.':'YOUR NEXT SLICE IS WAITING.';
   el.querySelector('.best-stamp')!.textContent=data.best?'✦ PERSONAL BEST':'✦ ROUND COMPLETE';
   const scores=el.querySelectorAll('.score-strip strong');scores[0].textContent=String(data.foods);scores[1].textContent=data.score.toLocaleString();
   el.querySelector('.coach-note')!.textContent=data.message;
   const strip=el.querySelector('.unlock-strip')!;
   strip.querySelector('b')!.textContent=data.next?'A little closer to '+data.next.title:'Every kitchen look unlocked!';
   strip.querySelector(':scope > div > span')!.textContent=data.next?(data.next.unlock-data.total)+' more slices to a fresh kitchen look':'Try a new look in your Locker.';
   strip.querySelector(':scope > small')!.textContent=data.next?data.total+' / '+data.next.unlock:String(data.total)+' slices';
   const bar=strip.querySelector<HTMLElement>('[role=progressbar]')!;
   bar.setAttribute('aria-label','Kitchen look progress');bar.setAttribute('aria-valuenow',String(data.total));bar.setAttribute('aria-valuemax',String(data.next?.unlock??Math.max(1,data.total)));
   bar.querySelector<HTMLElement>('i')!.style.width=(data.next?Math.min(100,100*data.total/data.next.unlock):100)+'%';
 }
};
}
