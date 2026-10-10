import './sentence-ui.css';
import './pause-menu.css';
import './restaurant-orders.css';
import './storybook.css';
import { planOrders, type KitchenOrder } from './restaurant-orders';
import { extractClipboardHtml, preparePassage, SentenceSession, type TypingStyle, type PreparedPassage } from './sentence-core';
import { createSentenceProgress } from './sentence-progress';
import { SentenceKitchen, type ServiceMode } from './sentence-game';
import { createSentenceScene } from './sentence-scene';
import { fingerFor } from './learning';
import { RECIPES, type RecipeId } from './kitchen-recipes';
import { createGameConfirm } from './game-confirm';
import { STORY_CHOICES, type StoryChoice } from './story-choices';
import { getStoryPages, type StoryPage } from './story-pages';
import { createStorybook } from './storybook';

export function createSentenceUI(options: { home: () => void; reduced: () => boolean; sound: () => void; progress: ReturnType<typeof createSentenceProgress>; settings:()=>void; quality?:()=>string; theme?:()=>string; muted?:()=>boolean; toggleMute?:()=>void; setReduced?:(value:boolean)=>void; letter?:(index:number)=>void; serve?:()=>void; stopSound?:()=>void }) {
  const progress = options.progress;
  const root = document.createElement('section'); root.id = 'sentence-game'; root.hidden = true;
  document.body.append(root);
  root.innerHTML = `<div class="sentence-cabinet">
    <header class="sentence-nav"><button id="sentence-home" type="button">← TYPESLASHER</button><strong>SENTENCE <span>SLASH</span></strong><span id="sentence-step"></span></header>
    <section class="sentence-page" data-page="editor"><div class="sentence-intro"><p class="sentence-kicker">BRING YOUR OWN WORDS</p><h1 id="sentence-setup-heading" tabindex="-1" aria-label="Are you hungry for a good story?"><span class="headline-stack" aria-hidden="true"><span class="headline-row"><span class="headline-word">Are</span> <span class="headline-word">you</span></span><span class="headline-row headline-gold"><span class="headline-word">hungry</span></span><span class="headline-row"><span class="headline-word">for</span> <span class="headline-word">a</span> <span class="headline-word">good</span></span><span class="headline-row headline-gold"><span class="headline-word">story?</span></span></span></h1><p>Type to guide the blade. Finish words to slice ingredients. Serve a fresh dish with every sentence. Choose a story, paste a passage, or write your own. Your text stays in this browser.</p></div>
      <div class="sentence-editor"><div class="story-tabs" role="tablist" aria-label="Choose your story"><button id="stories-tab" role="tab" aria-selected="true" aria-controls="stories-panel" tabindex="0">Story menu</button><button id="custom-story-tab" role="tab" aria-selected="false" aria-controls="custom-story-panel" tabindex="-1">+ Add your story</button></div>
        <div id="stories-panel" role="tabpanel" aria-labelledby="stories-tab"><p class="story-menu-hint">Pick a story. We’ll bring the ingredients.</p><div class="story-tiles">${STORY_CHOICES.map(choice=>`<button class="story-tile" data-story="${choice.id}" aria-label="${choice.title}" aria-pressed="false"><img src="${import.meta.env.BASE_URL}assets/${choice.image}" alt="" width="384" height="256" loading="lazy"><span class="story-tile-copy"><b>${choice.title}</b><small>${preparePassage(choice.text,'gentle').sentences.length} orders</small></span><span class="story-check" aria-hidden="true">✓</span></button>`).join('')}</div></div>
        <div id="custom-story-panel" role="tabpanel" aria-labelledby="custom-story-tab" hidden><label for="passage-text">What’s your story?</label><textarea id="passage-text" spellcheck="false" placeholder="Write a story or paste your text here…" aria-describedby="custom-story-hint"></textarea><p id="custom-story-hint">Every sentence becomes an order. Up to 10,000 characters. Your draft stays here when you choose another story.</p></div>
        <details class="sentence-options"><summary>Game options</summary><div class="sentence-style"><span>Typing style</span><label><input type="radio" name="sentence-style" value="gentle" checked> Gentle · letter case optional</label><label><input type="radio" name="sentence-style" value="exact"> Exact · case and punctuation</label></div></details><p class="sentence-start-hint" id="story-selection" role="status">Pick something tasty to play.</p><p id="sentence-error" role="alert"></p><button class="sentence-primary" id="start-sentences" disabled>START ▶</button></div>
    </section>
    <section class="sentence-page sentence-stage" data-page="stage" hidden>
      <div class="sentence-stage-top"><div><p class="sentence-kicker">KITCHEN SERVICE</p><span id="sentence-progress"></span></div><div class="service-stats"><div><b id="service-score">0</b><small>POINTS</small></div><div><b id="service-wpm">—</b><small>WPM</small></div><div><b id="service-accuracy">—</b><small>ACCURACY</small></div><div class="service-combo"><b id="service-combo">×1</b><small id="service-streak">0 / 5 CLEAN WORDS</small><span id="service-marks" aria-hidden="true">▱ ▱ ▱ ▱ ▱</span></div></div><div class="service-tools"><button id="sentence-mute" aria-pressed="false">Sound on</button><button id="sentence-pause">Ⅱ Pause</button></div></div>
      <div class="service-progress-row"><div id="service-progress" class="service-progress" role="progressbar" aria-label="Passage completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><span id="service-percent">0%</span></div>
      <p id="order-alert" role="status" aria-live="polite"></p>
      <div id="sentence-kitchen" aria-hidden="true"></div>
      <div class="sentence-book"><div class="story-art" hidden><img alt="" width="1200" height="800"><canvas width="900" height="600" aria-hidden="true"></canvas><span class="story-page-number"></span><span class="story-art-status" role="status"></span></div><div class="sentence-reading"><div id="sentence-fx" aria-hidden="true"></div><div class="reading-heading"><p class="sentence-kicker">TYPE THIS SENTENCE</p><span id="service-mode-label">RELAXED · GENTLE</span></div><h2 class="story-reading-title" hidden></h2><div class="sentence-text-window"><div id="active-sentence" aria-live="off"></div></div><p id="sentence-feedback" role="status">Start with the glowing character.</p><p class="story-paint-label" hidden>Words bring this picture to life.</p><div class="up-next"><span>UP NEXT</span><p id="next-sentence"></p></div></div></div>
      <div class="order-rail" aria-label="Restaurant orders"></div>
      <div class="sentence-stage-bottom"><span id="sentence-hint">Find your home row. Type the highlighted character.</span><label><input id="service-finger-hints" type="checkbox"> Finger hints</label><button id="sentence-finish">Finish early</button></div><input id="sentence-input" aria-label="Type the highlighted sentence here" autocomplete="off" autocapitalize="off" spellcheck="false"></section>
    <section class="sentence-page sentence-result" data-page="result" hidden><p class="sentence-kicker" id="sentence-result-kicker">PASSAGE COMPLETE</p><h1 id="sentence-result-title" tabindex="-1">Words well sliced!</h1><div class="sentence-result-grid"><div><b id="sentence-accuracy">—</b><small>ACCURACY</small></div><div><b id="sentence-count">0</b><small>SENTENCES</small></div><div><b id="sentence-wpm">—</b><small>WPM</small></div></div><p id="sentence-result-copy"></p><div class="sentence-actions"><button class="sentence-primary" id="sentence-replay">PLAY AGAIN ↻</button><button id="sentence-edit">Edit story</button><button id="sentence-new">New passage</button><button id="sentence-result-home">Home</button></div><p class="sentence-privacy">Only your typing results are saved. Your passage stays in this visit.</p></section>
    <div class="sentence-countdown" hidden aria-live="assertive">3</div>
    <div class="sentence-pause-cover" hidden role="dialog" aria-modal="true" aria-label="Sentence Slash paused"><div class="pause-card"><p class="pause-kicker">THE KITCHEN CAN WAIT</p><h2>Game paused</h2><button id="sentence-resume" class="pause-action primary">Continue<span aria-hidden="true">↵</span></button><button id="sentence-retry" class="pause-action">Retry<span aria-hidden="true">↻</span></button><button id="sentence-settings" class="pause-action">Settings<span aria-hidden="true">⚙</span></button><button id="sentence-pause-home" class="pause-action exit">Exit<span aria-hidden="true">←</span></button></div></div>
  </div>`;
  const $ = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const editor = $<HTMLTextAreaElement>('#passage-text');
  const input = $<HTMLInputElement>('#sentence-input');
  const error = $('#sentence-error');
  const confirmation = createGameConfirm(options.reduced);
  let storyTab:'stories'|'custom'='stories';
  let selectedStory:StoryChoice|undefined;
  function refreshStart(){
    const ready=storyTab==='custom'?!!editor.value.trim():!!selectedStory;
    $<HTMLButtonElement>('#start-sentences').disabled=!ready;
    $('#story-selection').textContent=storyTab==='custom'?'Your words. Your next kitchen adventure.':selectedStory?`${selectedStory.title} · ready for service`:'Pick something tasty to play.';
  }
  function selectTab(tab:'stories'|'custom'){
    storyTab=tab;
    for(const [id,value] of [['stories','stories'],['custom-story','custom']] as const){
      const button=$<HTMLButtonElement>(`#${id}-tab`),selected=tab===value;
      button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      $(`#${id}-panel`).hidden=!selected;
    }
    showError('');refreshStart();
  }
  $('#stories-tab').addEventListener('click',()=>selectTab('stories'));
  $('#custom-story-tab').addEventListener('click',()=>selectTab('custom'));
  $('.story-tabs').addEventListener('keydown',event=>{
    const key=(event as KeyboardEvent).key;
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;
    event.preventDefault();const tab=key==='Home'?'stories':key==='End'?'custom':storyTab==='stories'?'custom':'stories';
    selectTab(tab);$(tab==='stories'?'#stories-tab':'#custom-story-tab').focus();
  });
  editor.addEventListener('input',()=>{showError('');refreshStart();});
  let recipe:RecipeId='fruit';
  const recipeControl=document.createElement('label');recipeControl.className='recipe-choice';
  recipeControl.innerHTML=`First order<select id="kitchen-recipe">${Object.entries(RECIPES).map(([id,value])=>`<option value="${id}">${value.title}</option>`).join('')}</select><small id="recipe-ingredients"></small><small>Different dishes follow. The full menu is served before a recipe repeats.</small>`;
  $('.sentence-style').insertAdjacentHTML('afterend',`<fieldset class="service-setup"><legend>Kitchen pace</legend><label><input type="radio" name="service-mode" value="relaxed"><span><b>Relaxed service</b><small>Take your time. Build a clean-word combo.</small></span></label><label><input type="radio" name="service-mode" value="rush" checked><span><b>Rush service</b><small>Finish before the timer runs out. Expired orders leave the kitchen.</small></span></label><label class="service-pace">Target pace <select id="service-pace"><option value="20">20 WPM · Easygoing</option><option value="30" selected>30 WPM · Steady</option><option value="45">45 WPM · Lively</option><option value="60">60 WPM · Brisk</option></select></label></fieldset>`);
  $('.service-setup').append(recipeControl);
  function updateRecipe(){ $('#recipe-ingredients').textContent=(recipe==='fruit'?RECIPES[recipe].items.slice(0,6):RECIPES[recipe].items).join(', '); }
  updateRecipe();
  $('#kitchen-recipe').addEventListener('change',()=>{recipe=$<HTMLSelectElement>('#kitchen-recipe').value as RecipeId;updateRecipe();});
  root.querySelectorAll<HTMLButtonElement>('[data-story]').forEach(button=>button.addEventListener('click',()=>{
    selectedStory=STORY_CHOICES.find(choice=>choice.id===button.dataset.story)!;
    recipe=selectedStory.recipe;$<HTMLSelectElement>('#kitchen-recipe').value=recipe;updateRecipe();
    if(selectedStory.rush){mode='rush';$<HTMLInputElement>('input[name=service-mode][value=rush]').checked=true;$('.service-pace').hidden=false;}
    root.querySelectorAll<HTMLButtonElement>('[data-story]').forEach(tile=>tile.setAttribute('aria-pressed',String(tile===button)));
    showError('');refreshStart();
  }));
  $('.sentence-options').insertAdjacentHTML('beforeend','<p class="service-instructions">Type spaces normally. Backspace fixes mistakes; accepted letters stay in place.</p>');
  $('.sentence-result-grid').insertAdjacentHTML('afterend','<div class="service-result-extras"></div><div class="service-chart"></div>');
  $('.sentence-result-grid').querySelectorAll('small')[1].textContent='ORDERS SERVED';
  let prepared: PreparedPassage | null = null;
  let session: SentenceSession | null = null;
  let style: TypingStyle = 'gentle';
  let timer = 0; let epoch = 0; let shownPage = 'editor'; let savedRun = false;
  let cutting = false; let cutReady = false; let cutFinal = false; let cutTimer = 0;
  let awaitingFinalCut=false;
  let queuedKeys: string[] = [];
  let kitchen: SentenceKitchen | null = null;
  let scene: ReturnType<typeof createSentenceScene> | undefined;
  let mode:ServiceMode='rush', pace=30, localReduced=false, hudTimer=0, lastSound=0;
  let cutDue=0, cutRemaining=0, renderedIndex=-1;
  let orders:KitchenOrder[]=[],activeOrder=0,orderLost=false;
  let characterSpans:HTMLElement[]=[];
  const errorSpan=document.createElement('span');errorSpan.className='error';
  const comparisons=new Map<string,number>();
  const isReduced=()=>localReduced||options.reduced();
  const book=createStorybook($('.story-art'),isReduced);
  let storyPages:readonly StoryPage[]|undefined;
  const headlineMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let headlineAnimations:Animation[]=[];
  function stopHeadline(){headlineAnimations.forEach(animation=>animation.cancel());headlineAnimations=[];}
  function dropHeadline(){
    stopHeadline();
    if(isReduced()||headlineMotion.matches)return;
    headlineAnimations=Array.from(root.querySelectorAll<HTMLElement>('.headline-word'),(word,index)=>{
      const startY=-(word.getBoundingClientRect().bottom+50);
      const tilt=index%2===0?-4:4;
      return word.animate([
        {transform:`translateY(${startY}px) rotate(${tilt}deg)`,offset:0,easing:'cubic-bezier(.55,0,.85,.5)'},
        {transform:'translateY(7px) rotate(0deg) scaleY(.96)',offset:.72,easing:'ease-out'},
        {transform:'translateY(-4px) rotate(0deg)',offset:.88,easing:'ease-in-out'},
        {transform:'none',offset:1},
      ],{duration:760,delay:80+index*110,fill:'backwards'});
    });
  }
  headlineMotion.addEventListener('change',()=>{if(headlineMotion.matches)stopHeadline();});
  const show = (page: string) => { stopHeadline(); shownPage = page; root.querySelectorAll<HTMLElement>('[data-page]').forEach(el => { el.hidden = el.dataset.page !== page; }); root.querySelector('.sentence-cabinet')!.setAttribute('data-view',page); $('#sentence-step').textContent = page === 'stage' ? 'PAY WITH A STORY' : page === 'editor' ? 'READY TO PLAY' : page.toUpperCase(); if(page==='editor'){root.scrollTop=0;dropHeadline();} if(page!=='stage'){window.clearInterval(hudTimer);scene?.setActive(false);book.setPaused(true);options.stopSound?.();} };
  const showError = (message: string) => { error.textContent = message; };
  function startPassage() {
    try { prepared = preparePassage(storyTab==='custom'?editor.value:selectedStory?.text??'', style); showError(''); }
    catch (e) { showError((e as Error).message); if(storyTab==='custom')editor.focus();else $('[data-story]').focus(); return; }
    void begin();
  }
  const screen = root.querySelector<HTMLElement>('.sentence-reading')!;
  function render() {
    if (!session) return;
    if(storyPages){
      const page=storyPages[activeOrder];
      book.show(page,activeOrder,storyPages.length,storyPages[activeOrder+1]);
      book.setProgress(session.cursor/page.text.length);
      $('.story-reading-title').textContent=page.beat;
      $('.story-paint-label').textContent=session.cursor?'Every word adds a little color.':'Words bring this picture to life.';
    }
    $('#sentence-progress').textContent = `SENTENCE ${session.index + 1} / ${session.sentences.length}`;
    const active = $('#active-sentence');
    const text = session.current;
    active.setAttribute('role','text'); active.setAttribute('aria-label',`${text}. ${session.cursor} characters typed${session.error ? ', correction needed' : ''}.`);
    if(renderedIndex!==session.index){
      renderedIndex=session.index;active.replaceChildren();characterSpans=[];
      let word=document.createElement('span');word.className='sentence-word';
      for(const character of text){
        if(character===' '){if(word.childNodes.length)active.append(word);word=document.createElement('span');word.className='sentence-word';}
        const span=document.createElement('span');span.textContent=character;characterSpans.push(span);(character===' '?active:word).append(span);
      }
      if(word.childNodes.length)active.append(word);
      $('.sentence-text-window').scrollTop=0;
    }
    errorSpan.remove();
    characterSpans.forEach((span,i)=>{span.className=i<session!.cursor?'done':i===session!.cursor?'current':'';if(text[i]===' '&&i===session!.cursor)span.classList.add('space');});
    const caret=characterSpans[session.cursor];
    if(session.error&&caret){errorSpan.textContent=session.error;caret.before(errorSpan);}
    active.querySelectorAll('.sentence-word').forEach(word=>word.classList.toggle('active-word',word.contains(caret)));
    const textWindow=$('.sentence-text-window');
    if(caret){const c=caret.getBoundingClientRect(),w=textWindow.getBoundingClientRect();if(c.bottom>w.bottom-12||c.top<w.top+8)textWindow.scrollTop+=c.top-w.top-textWindow.clientHeight*.35;}
    $('#next-sentence').textContent = session.next ?? 'Last sentence — bring it home.';
    const key=session.current[session.cursor]??'';
    const zone=fingerFor(key.toLowerCase());
    const help=$<HTMLInputElement>('#service-finger-hints').checked && zone?` · ${zone.label}${style==='exact'&&/[A-Z]/.test(key)?' + Shift':''}`:'';
    $('#sentence-hint').textContent = session.error ? 'Backspace to correct the marked character.' : key === ' ' ? 'SPACE · either thumb' : `NEXT KEY · ${key.toUpperCase() || '—'}${help}`;
    const token=kitchen?.tokenAt(session.index,session.cursor);
    if(token)scene?.update({ordinal:token.ordinal,progress:Math.max(0,Math.min(1,(session.cursor-token.start)/(token.end-token.start))),sentenceProgress:session.cursor/text.length,served:kitchen!.served,total:session.sentences.length,multiplier:kitchen!.multiplier,error:!!session.error});
    updateHud();
  }
  function updateHud(){
    if(!session||!kitchen)return;
    const snap=session.snapshot();kitchen.sample(snap.elapsed,snap.correct);
    $('#service-score').textContent=kitchen.score.toLocaleString();
    $('#service-wpm').textContent=snap.elapsed>=15_000?String(Math.round(snap.correct*12_000/snap.elapsed)):'—';
    $('#service-accuracy').textContent=snap.attempts?`${Math.round(snap.correct/snap.attempts*100)}%`:'—';
    $('#service-combo').textContent=`×${kitchen.multiplier}`;
    $('#service-streak').textContent=kitchen.multiplier===5?'MAX COMBO':`${kitchen.streak%5} / 5 CLEAN WORDS`;
    $('#service-marks').textContent=Array.from({length:5},(_,i)=>kitchen!.multiplier===5||i<kitchen!.streak%5?'▰':'▱').join(' ');
    const percent=Math.round(session.resolvedCharacters/kitchen.totalCharacters*100);
    $('#service-progress').setAttribute('aria-valuenow',String(percent));$('#service-progress i').style.width=`${percent}%`;$('#service-percent').textContent=`${percent}%`;
    const freshness=kitchen.freshness(activeOrder,snap.elapsed);
    const current=$<HTMLElement>('.order-card.current');
    if(current){
      const fraction=mode==='rush'?freshness:1;
      current.querySelector<HTMLElement>('.order-timer i')!.style.width=`${fraction*100}%`;
      current.querySelector('.order-timer')!.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
      current.classList.toggle('urgent',mode==='rush'&&freshness<.25);
      current.querySelector('.order-time')!.textContent=orderLost?'Order lost':cutting?'Serving…':mode==='rush'?`${Math.ceil(freshness*kitchen.allowance(activeOrder)/1000)}s left`:'No time limit';
    }
  }
  function renderOrders(){
    const rail=$('.order-rail');rail.replaceChildren();
    orders.slice(activeOrder,activeOrder+3).forEach((order,i)=>{
      const card=document.createElement('article');card.className=`order-card ${i?'queued':'current'}`;
      card.innerHTML=`<img src="${import.meta.env.BASE_URL}assets/recipes/${order.recipe}.webp" alt="" width="112" height="112"><div class="order-card-copy"><span class="order-label">${i?'IN QUEUE':'NOW COOKING'} · #${String(order.index+1).padStart(2,'0')}</span><h2></h2><p class="order-ingredients"></p></div><div class="order-card-footer"><div class="order-timer" role="progressbar" aria-label="${i?'Queued order waits for its turn':'Time remaining for current order'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><i></i></div><small class="order-time">${i?(mode==='rush'?'Timer starts in the kitchen':'Waiting for its turn'):mode==='rush'?`${Math.ceil(kitchen!.allowance(order.index)/1000)}s left`:'No time limit'}</small></div>`;
      card.querySelector('h2')!.textContent=order.title;
      card.querySelector('.order-ingredients')!.textContent=`${order.ingredients.length} ingredients · ${order.ingredients.join(' · ')}`;
      card.querySelector('img')!.addEventListener('error',()=>card.classList.add('art-unavailable'));
      rail.append(card);
    });
  }
  function expireOrder(){
    if(!session||!kitchen||cutting||!$('.sentence-countdown').hidden||!pauseCover.hidden||session.completed)return false;
    if(!kitchen.expire(activeOrder,session.active))return false;
    orderLost=true;queuedKeys=[];scene?.abort();
    book.setPaused(true);
    const result=session.skip();session.pause();cutting=true;cutReady=false;cutFinal=result==='finished';
    $('#order-alert').textContent=`Order lost · ${orders[activeOrder].title} expired. Clearing the kitchen.`;
    $('.order-card.current').classList.add('expired');
    root.classList.remove('order-shake');if(!isReduced()){void root.clientWidth;root.classList.add('order-shake');}
    $('#sentence-feedback').textContent='ORDER LOST · Time ran out. The next order is coming.';
    $('#sentence-hint').textContent='Kitchen cleared';$<HTMLButtonElement>('#sentence-finish').disabled=true;
    updateHud();scheduleCut(isReduced()?600:1100);return true;
  }
  function resultChart(){
    const holder=$('.service-chart');holder.replaceChildren();
    if(!session||!kitchen||session.active<15_000||kitchen.samples.length<2)return;
    const samples=kitchen.samples,max=Math.max(20,...samples.map(s=>s.wpm)),last=samples.at(-1)!.seconds;
    const path=samples.map((s,i)=>`${i?'L':'M'}${40+s.seconds/last*640},${110-s.wpm/max*80}`).join(' ');
    holder.innerHTML=`<div><span>SPEED THROUGH YOUR SERVICE</span><small>WPM · active typing time</small></div><svg viewBox="0 0 720 150" role="img" aria-label="Typing speed over ${Math.round(last)} seconds. Peak ${max} words per minute."><path d="M40 30V110H680" fill="none" stroke="#80647e"/><path d="${path}" fill="none" stroke="#9ce2bf" stroke-width="3" stroke-linejoin="round"/><text x="5" y="35">${max}</text><text x="17" y="114">0</text><text x="40" y="137">0s</text><text x="650" y="137">${Math.round(last)}s</text></svg>`;
  }
  function slash(final: boolean) {
    const layer = $('#sentence-fx'); layer.replaceChildren();
    const top = document.createElement('div'); top.className = 'sentence-fragment top';
    const bottom = document.createElement('div'); bottom.className = 'sentence-fragment bottom';
    // Clone the rendered words so the two cut faces wrap exactly like the sentence.
    for (const fragment of [top,bottom]) for (const node of Array.from($('#active-sentence').childNodes)) fragment.append(node.cloneNode(true));
    const blade = document.createElement('div'); blade.className = 'sentence-blade';
    const y = $('#active-sentence').offsetTop;
    top.style.top = `${y}px`; bottom.style.top = `${y}px`; blade.style.top = `${y + 35}px`;
    layer.append(top,bottom,blade);
    if(!isReduced()) for(let i=0;i<9;i++){
      const spark=document.createElement('i');spark.className='sentence-spark';
      spark.style.left=`${24 + (i%5)*13}%`;spark.style.top=`${y+25+(i%3)*19}px`;
      spark.style.setProperty('--dx',`${(i%2?-1:1)*(20+(i*13)%65)}px`);
      spark.style.setProperty('--dy',`${(i%3-1)*(25+(i*9)%55)}px`);
      layer.append(spark);
    }
    layer.classList.remove('animate','calm');
    if (isReduced()) layer.classList.add('calm');
    void layer.clientWidth; layer.classList.add('animate');
    window.clearTimeout(timer);
    const myEpoch = epoch;
    timer = window.setTimeout(() => { if (epoch === myEpoch && !cutting) layer.replaceChildren(); }, isReduced() ? 260 : final ? 760 : 620);
  }
  function finish(partial: boolean) {
    if (!session || !kitchen || savedRun) return;
    partial = partial && !session.completed;
    savedRun = true; session.pause(); const snap = session.snapshot(); kitchen.sample(snap.elapsed,snap.correct,true);
    window.clearTimeout(timer);$('.sentence-countdown').hidden=true;
    pauseCover.hidden=true;setPausedInert(false);
    progress.add({ style, attempts: snap.attempts, correct: snap.correct, characters: snap.correct, sentences: session.completedSentences, total: session.sentences.length, activeMs: snap.elapsed, complete: !partial, mode, pace:mode==='rush'?pace:0, score:kitchen.score, bestStreak:kitchen.bestStreak, cleanSentences:kitchen.cleanSentences, freshOrders:kitchen.freshOrders, lostOrders:kitchen.lostOrders });
    $('#sentence-result-kicker').textContent=partial?'PARTIAL PRACTICE':'PASSAGE COMPLETE';
    $('#sentence-accuracy').textContent = snap.attempts ? `${Math.round(snap.correct / snap.attempts * 100)}%` : '—';
    $('#sentence-count').textContent = `${session.completedSentences} / ${session.sentences.length}`;
    $('#sentence-wpm').textContent = snap.elapsed >= 15_000 ? String(Math.round(snap.correct / 5 / (snap.elapsed / 60000))) : '—';
    $('#sentence-result-title').textContent=partial?'A good start.':'Service complete!';
    $('.service-result-extras').innerHTML=`<div><b>${kitchen.score.toLocaleString()}</b><small>POINTS</small></div><div><b>${kitchen.bestStreak}</b><small>BEST CLEAN STREAK</small></div><div><b>${kitchen.cleanSentences}</b><small>PERFECT DISHES</small></div><div><b>${mode==='rush'?(kitchen.served?`${kitchen.freshOrders}/${kitchen.served}`:'—'):`${Math.round(snap.elapsed/1000)}s`}</b><small>${mode==='rush'?'SERVED FRESH':'ACTIVE TIME'}</small></div><div><b>${kitchen.lostOrders}</b><small>ORDERS LOST</small></div>`;
    const weakest=[...kitchen.mistakes.entries()].sort((a,b)=>b[1]-a[1])[0];
    const comparisonKey=JSON.stringify([session.sentences,style,mode,pace]);const previousScore=comparisons.get(comparisonKey);
    const comparison=!partial&&previousScore!==undefined?` ${kitchen.score>=previousScore?'+':''}${kitchen.score-previousScore} points against your last complete service.`:'';
    if(!partial)comparisons.set(comparisonKey,kitchen.score);
    $('#sentence-result-copy').textContent=`${mode==='rush'?'Rush':'Relaxed'} · ${style==='exact'?'Exact':'Gentle'} · ${kitchen.served} of ${session.sentences.length} orders served · ${kitchen.lostOrders} lost. ${weakest?`Give ${weakest[0]===' '?'spaces':`“${weakest[0]}”`} a little extra attention next time.`:'Careful keys make clean cuts.'}${comparison}`;
    resultChart();
    show('result'); $('#sentence-result-title').focus();
  }
  async function begin() {
    if (!prepared) return;
    epoch++; resetCut(); savedRun = false; renderedIndex=-1; session = new SentenceSession(prepared.sentences,style);kitchen=new SentenceKitchen(prepared.sentences,mode,pace);
    orders=planOrders(prepared.sentences,recipe);activeOrder=0;orderLost=false;$('#order-alert').textContent='';
    storyPages=getStoryPages(storyTab==='stories'?selectedStory?.id:undefined,prepared.sentences);
    root.classList.toggle('storybook-mode',!!storyPages);
    $('.story-art').hidden=!storyPages;$('.story-reading-title').hidden=!storyPages;$('.story-paint-label').hidden=!storyPages;
    book.clear();book.setPaused(false);
    $('.sentence-stage-top .sentence-kicker').textContent=storyPages?'TYPE A STORY. DINNER’S ON US.':'KITCHEN SERVICE';
    scene??=createSentenceScene($('#sentence-kitchen'),{reduced:isReduced,quality:options.quality??(()=> 'auto'),frameKitchen:()=>!!storyPages});scene.reset();
    pauseCover.hidden=true;setPausedInert(false);
    root.dataset.theme=options.theme?.()??'midnight';root.classList.toggle('service-reduced',isReduced());
    $('#service-mode-label').textContent=`${mode.toUpperCase()} · ${style.toUpperCase()}`;
    $<HTMLButtonElement>('#sentence-finish').disabled=true;
    show('stage'); root.scrollTop=0; renderOrders();render(); scene.setActive(true);$('#sentence-feedback').textContent='Start with the glowing character.'; input.value = ''; input.focus({preventScroll:true});
    updateMute();window.clearInterval(hudTimer);hudTimer=window.setInterval(()=>{if(pauseCover.hidden&&shownPage==='stage'&&!cutting){if(!expireOrder())updateHud();}},200);
    const countdown = $('.sentence-countdown'); countdown.hidden = false; countdown.textContent = 'SETTING THE TABLE…';
    window.clearTimeout(timer); const myEpoch = epoch;
    await scene.prepare(orders);if(epoch!==myEpoch||savedRun||shownPage!=='stage')return;scene.beginOrder(orders[0]);countdown.textContent='READY?';
    timer = window.setTimeout(() => { if (epoch === myEpoch && !savedRun) { countdown.hidden = true; $<HTMLButtonElement>('#sentence-finish').disabled=false;session!.resume();session!.start();kitchen!.startOrder(0,session!.active);if(!pauseCover.hidden)session!.pause();else input.focus({preventScroll:true}); } }, 700);
  }
  const pauseCover = $('.sentence-pause-cover');
  function pause() { if (!session || shownPage !== 'stage' || !pauseCover.hidden) return; session.pause();book.setPaused(true);if(cutting&&!cutReady){cutRemaining=Math.max(0,cutDue-performance.now());window.clearTimeout(cutTimer);} pauseCover.hidden = false; setPausedInert(true);scene?.setActive(false);root.classList.add('service-paused');options.stopSound?.(); input.blur(); $('#sentence-resume').focus(); }
  function resume() { if (!session) return; pauseCover.hidden = true; if (!cutting) session.resume();book.setPaused(false);setPausedInert(false);root.classList.remove('service-paused');scene?.setActive(true); input.focus({preventScroll:true}); if(cutReady) completeCut();else if(cutting)scheduleCut(cutRemaining); }
  function setPausedInert(paused:boolean){for(const selector of ['.sentence-nav','.sentence-stage']) $<HTMLElement>(selector).inert=paused;}
  function home() { epoch++; resetCut(); stopHeadline(); window.clearTimeout(timer);window.clearInterval(hudTimer);scene?.setActive(false);book.setPaused(true);book.clear();options.stopSound?.(); $('#sentence-fx').replaceChildren(); pauseCover.hidden = true; setPausedInert(false); root.hidden = true; document.querySelector<HTMLElement>('#app')!.inert = true; options.home(); }
  function scheduleCut(duration:number){cutRemaining=duration;cutDue=performance.now()+duration;const cutEpoch=epoch;cutTimer=window.setTimeout(()=>{if(epoch!==cutEpoch)return;if(awaitingFinalCut){startCompletedCut();return;}cutReady=true;completeCut();},duration);}
  function startCompletedCut(){
    if(!pauseCover.hidden)return;
    if(scene&&!scene.finalCutReached){scheduleCut(16);return;}
    awaitingFinalCut=false;slash(cutFinal);scheduleCut(isReduced()?220:620);
  }
  function resetCut() { window.clearTimeout(cutTimer); cutting=false; cutReady=false; awaitingFinalCut=false; queuedKeys=[]; screen.classList.remove('cutting');root.classList.remove('service-paused','order-shake'); }
  function completeCut() {
    if(!cutting || !cutReady || !pauseCover.hidden) return;
    // Keep the kitchen visible until the last pieces land and the bowl is served.
    if(scene?.busy){cutReady=false;scheduleCut(50);return;}
    const final=cutFinal; cutting=false; cutReady=false;
    $('#sentence-fx').replaceChildren(); screen.classList.remove('cutting');
    if(final) { queuedKeys=[]; finish(false); return; }
    const wasLost=orderLost;orderLost=false;root.classList.remove('order-shake');
    activeOrder=session!.index;scene?.beginOrder(orders[activeOrder]);session!.resume();book.setPaused(false);kitchen!.startOrder(activeOrder,session!.active);renderOrders();render(); $<HTMLButtonElement>('#sentence-finish').disabled=false; $('#sentence-feedback').textContent=wasLost?'New order · fresh start.':'Order served! Next recipe — keep going.';
    const pending=queuedKeys; queuedKeys=[];
    for(const key of pending) { if(cutting) queuedKeys.push(key); else acceptKey(key); }
  }
  function acceptKey(key:string) {
    if(!session||!kitchen) return;
    if(expireOrder())return;
    const previousToken=kitchen.tokenAt(session.index,session.cursor);
    const result=session.input(key);
    const effects=kitchen.consume(session.drain(),session.active);
    const serving=effects.some(effect=>effect.type==='serve');
    for(const effect of effects)if(effect.type==='serve'||orders[activeOrder].cutOrdinals.includes(effect.ordinal))scene?.effect(effect);
    const now=performance.now();
    if(serving){(options.serve??options.sound)();lastSound=now;}
    else if(effects.length&&now-lastSound>65){options.sound();lastSound=now;}
    else if(result==='correct'&&now-lastSound>45){options.letter?.(session.correct);lastSound=now;}
    if(result==='slash' || result==='finished') {
      book.setProgress(1);
      if(storyPages)$('.story-paint-label').textContent='Picture complete. Supper is served!';
      if(previousToken)scene?.update({ordinal:previousToken.ordinal,progress:1,sentenceProgress:1,served:kitchen.served,total:session.sentences.length,multiplier:kitchen.multiplier,error:false});
      // The animated cut faces replace the original text until service settles.
      characterSpans.forEach(span=>span.className='done');
      cutting=true; cutReady=false; cutFinal=result==='finished'; session.pause();
      screen.classList.add('cutting');awaitingFinalCut=true;
      $('#sentence-feedback').textContent=cutFinal?'Passage complete!':'Clean cut!';
      $('#sentence-hint').textContent='✦ SLICE!';
      $<HTMLButtonElement>('#sentence-finish').disabled=true;
      updateHud();startCompletedCut();
    } else { $('#sentence-feedback').textContent=result==='wrong'?'Not quite. Backspace to fix it.':''; render(); }
  }
  $('#sentence-home').addEventListener('click',home); $('#sentence-result-home').addEventListener('click',home); $('#sentence-pause-home').addEventListener('click',home);
  $('#sentence-edit').addEventListener('click',async() => {
    if(storyTab==='stories'&&selectedStory){
      if(editor.value.trim()&&editor.value!==selectedStory.text&&!await confirmation.ask({title:'Edit this story?',message:'This will replace your custom draft with the selected story. Keep your draft if you’re still working on it.',accept:'Edit story'}))return;
      editor.value=selectedStory.text;
    }
    show('editor');selectTab('custom');editor.focus();
  });
  $('#sentence-new').textContent='Choose a story';
  $('#sentence-new').addEventListener('click',() => { prepared = null; show('editor'); selectTab('stories'); $('#stories-tab').focus(); });
  $('#sentence-replay').addEventListener('click',begin);
  $('#start-sentences').addEventListener('click',startPassage);
  function updateMute(){const muted=options.muted?.()??false;$('#sentence-mute').textContent=muted?'Sound off':'Sound on';$('#sentence-mute').setAttribute('aria-pressed',String(muted));$<HTMLButtonElement>('#sentence-mute').disabled=!options.toggleMute;}
  $('#sentence-mute').addEventListener('click',()=>{options.toggleMute?.();updateMute();input.focus({preventScroll:true});});
  $('#service-finger-hints').addEventListener('change',()=>{render();input.focus({preventScroll:true});});
  root.querySelectorAll<HTMLInputElement>('input[name="service-mode"]').forEach(radio=>radio.addEventListener('change',()=>{mode=radio.value as ServiceMode;$('.service-pace').hidden=mode!=='rush';}));
  $('#service-pace').addEventListener('change',()=>{pace=Number($<HTMLSelectElement>('#service-pace').value);});
  $('#sentence-retry').addEventListener('click',begin);
  $('#sentence-settings').addEventListener('click',options.settings);
  root.querySelectorAll<HTMLInputElement>('input[name="sentence-style"]').forEach(radio => radio.addEventListener('change',() => { style = radio.value as TypingStyle; }));
  editor.addEventListener('paste',event => {
    const html = event.clipboardData?.getData('text/html'); if (!html) return;
    const blocks = extractClipboardHtml(html); if (!blocks.length) return;
    event.preventDefault();
    const text = blocks.map(block => (block.item ? '- ' : '') + block.text).join('\n');
    editor.setRangeText(text,editor.selectionStart,editor.selectionEnd,'end');refreshStart();
  });
  input.addEventListener('paste',event => { event.preventDefault(); $('#sentence-feedback').textContent = 'Type this passage to practice.'; });
  input.addEventListener('beforeinput',event => event.preventDefault());
  input.addEventListener('keydown',event => {
    if (!session || shownPage!=='stage' || savedRun || pauseCover.hidden === false || $('.sentence-countdown').hidden === false) return;
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); pause(); return; }
    if (event.key !== 'Backspace' && (event.key.length !== 1 || event.key < ' ' || event.key > '~')) return;
    event.preventDefault(); event.stopPropagation();
    if(cutting) { if(!cutFinal&&!orderLost) queuedKeys.push(event.key); return; }
    acceptKey(event.key);
  });
  $('#sentence-pause').addEventListener('click',pause); $('#sentence-resume').addEventListener('click',resume);
  $('.sentence-stage').addEventListener('click',event=>{if((event.target as HTMLElement).closest('button,input'))return;if(pauseCover.hidden)input.focus({preventScroll:true});});
  $('#sentence-finish').addEventListener('click',() => finish(true));
  window.addEventListener('keydown',event => { if (root.hidden || shownPage !== 'stage' || document.querySelector('dialog[open]')) return; if (event.key === 'Escape' && pauseCover.hidden) { event.preventDefault(); pause(); } else if (event.key === 'Enter' && !pauseCover.hidden && !(event.target as HTMLElement).closest('button')) { event.preventDefault(); resume(); } });
  pauseCover.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=Array.from(pauseCover.querySelectorAll<HTMLElement>('button,input'));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  document.addEventListener('visibilitychange',() => { if (document.hidden && !root.hidden) pause(); });
  window.addEventListener('blur',() => { if (!root.hidden) pause(); });
  return { open() { document.querySelector<HTMLElement>('#app')!.inert = true; root.hidden = false; show('editor'); $('#sentence-setup-heading').focus({preventScroll:true}); }, active: () => !root.hidden, hasPassage: () => !!selectedStory||!!editor.value.trim(), records: progress.records, resetProgress: progress.reset };
}
