import './sentence-ui.css';
import './pause-menu.css';
import { extractClipboardHtml, preparePassage, SentenceSession, type TypingStyle, type PreparedPassage } from './sentence-core';
import { createSentenceProgress } from './sentence-progress';
import { SentenceKitchen, type ServiceMode } from './sentence-game';
import { createSentenceScene } from './sentence-scene';
import { fingerFor } from './learning';
import { RECIPES, RECIPE_STORIES, RECIPE_STORY_CHOICES, type RecipeId } from './kitchen-recipes';

const samples = {
  snacks: 'An apple wore a tiny chef hat. A kiwi joined the kitchen crew. They mixed pears and oranges in a bowl. Sweet mango made the fruit salad complete.',
  space: 'Our spaceship landed beside a purple moon. A friendly robot offered us a map. We followed the glowing stars home.',
  everyday: 'I opened my backpack and found a squeaky rubber duck. It had eaten my homework. The teacher laughed so hard she gave the duck a gold star.',
};

export function createSentenceUI(options: { home: () => void; reduced: () => boolean; sound: () => void; progress: ReturnType<typeof createSentenceProgress>; settings:()=>void; quality?:()=>string; theme?:()=>string; muted?:()=>boolean; toggleMute?:()=>void; setReduced?:(value:boolean)=>void; letter?:(index:number)=>void; serve?:()=>void; stopSound?:()=>void }) {
  const progress = options.progress;
  const root = document.createElement('section'); root.id = 'sentence-game'; root.hidden = true;
  document.body.append(root);
  root.innerHTML = `<div class="sentence-cabinet">
    <header class="sentence-nav"><button id="sentence-home" type="button">← TYPESLASHER</button><strong>SENTENCE <span>SLASH</span></strong><span id="sentence-step"></span></header>
    <section class="sentence-page" data-page="editor"><div class="sentence-intro"><p class="sentence-kicker">BRING YOUR OWN WORDS</p><h1>Every sentence<br><em>gets its moment.</em></h1><p>Paste a paragraph, load a plain text file, or try a tiny story. Links and references are cleaned for you. Your text stays in this browser.</p></div>
      <div class="sentence-editor"><label for="passage-text">Your passage</label><textarea id="passage-text" spellcheck="false" placeholder="Paste a paragraph or list here…"></textarea><div class="sentence-editor-tools"><label class="sentence-file">Choose .txt file<input id="passage-file" type="file" accept=".txt,text/plain"></label><span>Up to 10,000 characters</span></div><div class="sentence-samples"><span>Or try a story:</span><button data-sample="snacks">Fruit adventure</button><button data-sample="space">Space mission</button><button data-sample="everyday">Funny day</button></div><p id="sentence-error" role="alert"></p><button class="sentence-primary" id="prepare-sentences">Preview sentences →</button></div>
    </section>
    <section class="sentence-page" data-page="preview" hidden><p class="sentence-kicker">YOUR WORDS, READY TO PLAY</p><h1>Take a look.</h1><p id="cleanup-summary"></p><div class="sentence-style"><span>Typing style</span><label><input type="radio" name="sentence-style" value="gentle" checked> Gentle · punctuation kept, letter case optional</label><label><input type="radio" name="sentence-style" value="exact"> Exact · case and punctuation</label></div><ol id="sentence-preview"></ol><p class="sentence-preview-hint">Each numbered line becomes one slice. English keyboard for this version. Your text is kept for this visit only.</p><div class="sentence-actions"><button id="edit-passage">← Edit text</button><button class="sentence-primary" id="start-sentences">START SLICING ▶</button></div></section>
    <section class="sentence-page sentence-stage" data-page="stage" hidden>
      <div class="sentence-stage-top"><div><p class="sentence-kicker">MIDNIGHT SERVICE</p><span id="sentence-progress"></span></div><div class="service-stats"><div><b id="service-score">0</b><small>POINTS</small></div><div><b id="service-wpm">—</b><small>WPM</small></div><div><b id="service-accuracy">—</b><small>ACCURACY</small></div><div class="service-combo"><b id="service-combo">×1</b><small id="service-streak">0 / 5 CLEAN WORDS</small><span id="service-marks" aria-hidden="true">▱ ▱ ▱ ▱ ▱</span></div></div><div class="service-tools"><button id="sentence-mute" aria-pressed="false">Sound on</button><button id="sentence-pause">Ⅱ Pause</button></div></div>
      <div class="service-progress-row"><div id="service-progress" class="service-progress" role="progressbar" aria-label="Passage completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><span id="service-percent">0%</span></div>
      <div id="sentence-kitchen" aria-hidden="true"></div>
      <div class="service-freshness" hidden><span>FRESHNESS</span><div role="progressbar" aria-label="Order freshness" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><i></i></div><b id="freshness-copy">Ready when you are</b></div>
      <div class="sentence-reading"><div id="sentence-fx" aria-hidden="true"></div><div class="reading-heading"><p class="sentence-kicker">TYPE THIS SENTENCE</p><span id="service-mode-label">RELAXED · GENTLE</span></div><div class="sentence-text-window"><div id="active-sentence" aria-live="off"></div></div><p id="sentence-feedback" role="status">Start with the glowing character.</p><div class="up-next"><span>UP NEXT</span><p id="next-sentence"></p></div></div>
      <div class="sentence-stage-bottom"><span id="sentence-hint">Find your home row. Type the highlighted character.</span><label><input id="service-finger-hints" type="checkbox"> Finger hints</label><button id="sentence-finish">Finish early</button></div><input id="sentence-input" aria-label="Type the highlighted sentence here" autocomplete="off" autocapitalize="off" spellcheck="false"></section>
    <section class="sentence-page sentence-result" data-page="result" hidden><p class="sentence-kicker" id="sentence-result-kicker">PASSAGE COMPLETE</p><h1 id="sentence-result-title" tabindex="-1">Words well sliced!</h1><div class="sentence-result-grid"><div><b id="sentence-accuracy">—</b><small>ACCURACY</small></div><div><b id="sentence-count">0</b><small>SENTENCES</small></div><div><b id="sentence-wpm">—</b><small>WPM</small></div></div><p id="sentence-result-copy"></p><div class="sentence-actions"><button class="sentence-primary" id="sentence-replay">PLAY AGAIN ↻</button><button id="sentence-edit">Edit text</button><button id="sentence-new">New passage</button><button id="sentence-result-home">Home</button></div><p class="sentence-privacy">Only your typing results are saved. Your passage stays in this visit.</p></section>
    <div class="sentence-countdown" hidden aria-live="assertive">3</div>
    <div class="sentence-pause-cover" hidden role="dialog" aria-modal="true" aria-label="Sentence Slash paused"><div class="pause-card"><p class="pause-kicker">THE KITCHEN CAN WAIT</p><h2>Game paused</h2><button id="sentence-resume" class="pause-action primary">Continue<span aria-hidden="true">↵</span></button><button id="sentence-retry" class="pause-action">Retry<span aria-hidden="true">↻</span></button><button id="sentence-settings" class="pause-action">Settings<span aria-hidden="true">⚙</span></button><button id="sentence-pause-home" class="pause-action exit">Exit<span aria-hidden="true">←</span></button></div></div>
  </div>`;
  const $ = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const editor = $<HTMLTextAreaElement>('#passage-text');
  const input = $<HTMLInputElement>('#sentence-input');
  const error = $('#sentence-error');
  let recipe:RecipeId='fruit';
  const recipeControl=document.createElement('label');recipeControl.className='recipe-choice';
  recipeControl.innerHTML=`Kitchen recipe<select id="kitchen-recipe">${Object.entries(RECIPES).map(([id,value])=>`<option value="${id}">${value.title}</option>`).join('')}</select><small id="recipe-ingredients"></small>`;
  $('.sentence-intro h1').innerHTML='Your words.<br><em>A midnight feast.</em>';
  $('.sentence-intro>p:last-child').textContent='Type to guide the blade. Finish words to slice ingredients. Serve a fresh bowl with every sentence. Bring your own passage, try a story, or pick a recipe. Your text stays in this browser.';
  $('.sentence-style').insertAdjacentHTML('afterend',`<fieldset class="service-setup"><legend>Kitchen pace</legend><label><input type="radio" name="service-mode" value="relaxed" checked><span><b>Relaxed service</b><small>Take your time. Build a clean-word combo.</small></span></label><label><input type="radio" name="service-mode" value="rush"><span><b>Rush service</b><small>Serve while fresh for a bonus. You can always finish.</small></span></label><label class="service-pace" hidden>Target pace <select id="service-pace"><option value="20">20 WPM · Easygoing</option><option value="30" selected>30 WPM · Steady</option><option value="45">45 WPM · Lively</option><option value="60">60 WPM · Brisk</option></select></label></fieldset>`);
  $('.service-setup').append(recipeControl);
  function updateRecipe(){ $('#recipe-ingredients').textContent=RECIPES[recipe].items.join(', '); }
  updateRecipe();
  $('#kitchen-recipe').addEventListener('change',()=>{recipe=$<HTMLSelectElement>('#kitchen-recipe').value as RecipeId;updateRecipe();});
  $('.sentence-samples').insertAdjacentHTML('beforeend',RECIPE_STORY_CHOICES.map(choice=>`<button data-recipe-story="${choice.id}">${choice.title}</button>`).join(''));
  root.querySelectorAll<HTMLButtonElement>('[data-recipe-story]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.recipeStory as keyof typeof RECIPE_STORIES;
    const text=RECIPE_STORIES[id];
    if(editor.value.trim()&&editor.value!==text&&!confirm('Replace the text in your editor with this recipe?'))return;
    recipe=RECIPE_STORY_CHOICES.find(choice=>choice.id===id)!.recipe; $<HTMLSelectElement>('#kitchen-recipe').value=recipe;updateRecipe();
    editor.value=text;showError('');editor.focus();
  }));
  $('#sentence-preview').insertAdjacentHTML('afterend','<p class="service-instructions">Letters guide the blade · words cut ingredients · sentences serve bowls.<br>Type spaces normally. Backspace fixes mistakes; accepted letters stay in place.</p>');
  $('.sentence-result-grid').insertAdjacentHTML('afterend','<div class="service-result-extras"></div><div class="service-chart"></div>');
  $('.sentence-result-grid').querySelectorAll('small')[1].textContent='ORDERS SERVED';
  let prepared: PreparedPassage | null = null;
  let session: SentenceSession | null = null;
  let style: TypingStyle = 'gentle';
  let timer = 0; let epoch = 0; let shownPage = 'editor'; let savedRun = false;
  let cutting = false; let cutReady = false; let cutFinal = false; let cutTimer = 0;
  let queuedKeys: string[] = [];
  let kitchen: SentenceKitchen | null = null;
  let scene: ReturnType<typeof createSentenceScene> | undefined;
  let mode:ServiceMode='relaxed', pace=30, localReduced=false, hudTimer=0, lastSound=0;
  let cutDue=0, cutRemaining=0, renderedIndex=-1;
  let characterSpans:HTMLElement[]=[];
  const errorSpan=document.createElement('span');errorSpan.className='error';
  const comparisons=new Map<string,number>();
  const isReduced=()=>localReduced||options.reduced();
  const show = (page: string) => { shownPage = page; root.querySelectorAll<HTMLElement>('[data-page]').forEach(el => { el.hidden = el.dataset.page !== page; }); root.querySelector('.sentence-cabinet')!.setAttribute('data-view',page); $('#sentence-step').textContent = page === 'stage' ? 'MIDNIGHT SERVICE' : page.toUpperCase(); if(page!=='stage'){window.clearInterval(hudTimer);scene?.setActive(false);options.stopSound?.();} };
  const showError = (message: string) => { error.textContent = message; };
  function preview() {
    try { prepared = preparePassage(editor.value, style); showError(''); }
    catch (e) { showError((e as Error).message); return; }
    show('preview');
    $('#cleanup-summary').textContent = `${prepared.sentences.length} slices ready · ${prepared.references} references removed · ${prepared.listItems} list items prepared`;
    const list = $('#sentence-preview'); list.replaceChildren();
    prepared.sentences.forEach(sentence => { const li = document.createElement('li'); li.textContent = sentence; list.append(li); });
    $('#start-sentences').focus();
  }
  const screen = root.querySelector<HTMLElement>('.sentence-reading')!;
  function render() {
    if (!session) return;
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
    if(token)scene?.update({ordinal:token.ordinal,progress:Math.max(0,Math.min(1,(session.cursor-token.start)/(token.end-token.start))),served:kitchen!.served,total:session.sentences.length,multiplier:kitchen!.multiplier,error:!!session.error});
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
    const percent=Math.round(snap.correct/kitchen.totalCharacters*100);
    $('#service-progress').setAttribute('aria-valuenow',String(percent));$('#service-progress i').style.width=`${percent}%`;$('#service-percent').textContent=`${percent}%`;
    const freshness=kitchen.freshness(session.index,snap.elapsed);
    $('.service-freshness [role=progressbar]').setAttribute('aria-valuenow',String(Math.round(freshness*100)));
    $('.service-freshness i').style.width=`${freshness*100}%`;
    $('.service-freshness').classList.toggle('cooled',freshness===0);
    $('#freshness-copy').textContent=freshness===0?'Cooled · keep typing':freshness===1?'Ready when you are':`${Math.ceil(freshness*kitchen.allowance(session.index)/1000)}s · +150 fresh bonus`;
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
    pauseCover.hidden=true;setPausedInert(false);
    progress.add({ style, attempts: snap.attempts, correct: snap.correct, characters: snap.correct, sentences: session.completedSentences, total: session.sentences.length, activeMs: snap.elapsed, complete: !partial, mode, pace:mode==='rush'?pace:0, score:kitchen.score, bestStreak:kitchen.bestStreak, cleanSentences:kitchen.cleanSentences, freshOrders:kitchen.freshOrders });
    $('#sentence-result-kicker').textContent=partial?'PARTIAL PRACTICE':'PASSAGE COMPLETE';
    $('#sentence-accuracy').textContent = snap.attempts ? `${Math.round(snap.correct / snap.attempts * 100)}%` : '—';
    $('#sentence-count').textContent = `${session.completedSentences} / ${session.sentences.length}`;
    $('#sentence-wpm').textContent = snap.elapsed >= 15_000 ? String(Math.round(snap.correct / 5 / (snap.elapsed / 60000))) : '—';
    $('#sentence-result-title').textContent=partial?'A good start.':'Service complete!';
    $('.service-result-extras').innerHTML=`<div><b>${kitchen.score.toLocaleString()}</b><small>POINTS</small></div><div><b>${kitchen.bestStreak}</b><small>BEST CLEAN STREAK</small></div><div><b>${kitchen.cleanSentences}</b><small>PERFECT BOWLS</small></div><div><b>${mode==='rush'?`${kitchen.freshOrders}/${kitchen.served}`:`${Math.round(snap.elapsed/1000)}s`}</b><small>${mode==='rush'?'SERVED FRESH':'ACTIVE TIME'}</small></div>`;
    const weakest=[...kitchen.mistakes.entries()].sort((a,b)=>b[1]-a[1])[0];
    const comparisonKey=JSON.stringify([session.sentences,style,mode,pace]);const previousScore=comparisons.get(comparisonKey);
    const comparison=!partial&&previousScore!==undefined?` ${kitchen.score>=previousScore?'+':''}${kitchen.score-previousScore} points against your last complete service.`:'';
    if(!partial)comparisons.set(comparisonKey,kitchen.score);
    $('#sentence-result-copy').textContent=`${mode==='rush'?'Rush':'Relaxed'} · ${style==='exact'?'Exact':'Gentle'} · ${kitchen.served} of ${session.sentences.length} orders served. ${weakest?`Give ${weakest[0]===' '?'spaces':`“${weakest[0]}”`} a little extra attention next time.`:'Careful keys make clean cuts.'}${comparison}`;
    resultChart();
    show('result'); $('#sentence-result-title').focus();
  }
  function begin() {
    if (!prepared) return;
    epoch++; resetCut(); savedRun = false; renderedIndex=-1; session = new SentenceSession(prepared.sentences,style);kitchen=new SentenceKitchen(prepared.sentences,mode,pace);
    scene??=createSentenceScene($('#sentence-kitchen'),{reduced:isReduced,quality:options.quality??(()=> 'auto'),recipe:()=>recipe});scene.reset();
    pauseCover.hidden=true;setPausedInert(false);
    root.dataset.theme=options.theme?.()??'midnight';root.classList.toggle('service-reduced',isReduced());
    $('.service-freshness').hidden=mode!=='rush';$('#service-mode-label').textContent=`${mode.toUpperCase()} · ${style.toUpperCase()}`;
    $<HTMLButtonElement>('#sentence-finish').disabled=false;
    show('stage'); root.scrollTop=0; render(); scene.setActive(true);$('#sentence-feedback').textContent='Start with the glowing character.'; input.value = ''; input.focus({preventScroll:true});
    updateMute();window.clearInterval(hudTimer);hudTimer=window.setInterval(()=>{if(pauseCover.hidden&&shownPage==='stage'&&!cutting)updateHud();},200);
    const countdown = $('.sentence-countdown'); countdown.hidden = false; countdown.textContent = 'READY?';
    window.clearTimeout(timer); const myEpoch = epoch;
    timer = window.setTimeout(() => { if (epoch === myEpoch) { countdown.hidden = true; if(pauseCover.hidden)input.focus({preventScroll:true}); } }, 700);
  }
  const pauseCover = $('.sentence-pause-cover');
  function pause() { if (!session || shownPage !== 'stage' || !pauseCover.hidden) return; session.pause();if(cutting&&!cutReady){cutRemaining=Math.max(0,cutDue-performance.now());window.clearTimeout(cutTimer);} pauseCover.hidden = false; setPausedInert(true);scene?.setActive(false);root.classList.add('service-paused');options.stopSound?.(); input.blur(); $('#sentence-resume').focus(); }
  function resume() { if (!session) return; pauseCover.hidden = true; if (!cutting) session.resume(); setPausedInert(false);root.classList.remove('service-paused');scene?.setActive(true); input.focus({preventScroll:true}); if(cutReady) completeCut();else if(cutting)scheduleCut(cutRemaining); }
  function setPausedInert(paused:boolean){for(const selector of ['.sentence-nav','.sentence-stage']) $<HTMLElement>(selector).inert=paused;}
  function home() { epoch++; resetCut(); window.clearTimeout(timer);window.clearInterval(hudTimer);scene?.setActive(false);options.stopSound?.(); $('#sentence-fx').replaceChildren(); pauseCover.hidden = true; setPausedInert(false); root.hidden = true; document.querySelector<HTMLElement>('#app')!.inert = true; options.home(); }
  function scheduleCut(duration:number){cutRemaining=duration;cutDue=performance.now()+duration;const cutEpoch=epoch;cutTimer=window.setTimeout(()=>{if(epoch!==cutEpoch)return;cutReady=true;completeCut();},duration);}
  function resetCut() { window.clearTimeout(cutTimer); cutting=false; cutReady=false; queuedKeys=[]; screen.classList.remove('cutting');root.classList.remove('service-paused'); }
  function completeCut() {
    if(!cutting || !cutReady || !pauseCover.hidden) return;
    // Keep the kitchen visible until the last pieces land and the bowl is served.
    if(scene?.busy){cutReady=false;scheduleCut(50);return;}
    const final=cutFinal; cutting=false; cutReady=false;
    $('#sentence-fx').replaceChildren(); screen.classList.remove('cutting');
    if(final) { queuedKeys=[]; finish(false); return; }
    session!.resume(); render(); $<HTMLButtonElement>('#sentence-finish').disabled=false; $('#sentence-feedback').textContent='Next sentence — keep going!';
    const pending=queuedKeys; queuedKeys=[];
    for(const key of pending) { if(cutting) queuedKeys.push(key); else acceptKey(key); }
  }
  function acceptKey(key:string) {
    if(!session||!kitchen) return;
    const previousToken=kitchen.tokenAt(session.index,session.cursor);
    const result=session.input(key);
    const effects=kitchen.consume(session.drain(),session.active);
    const serving=effects.some(effect=>effect.type==='serve');
    for(const effect of effects)scene?.effect(effect);
    const now=performance.now();
    if(serving){(options.serve??options.sound)();lastSound=now;}
    else if(effects.length&&now-lastSound>65){options.sound();lastSound=now;}
    else if(result==='correct'&&now-lastSound>45){options.letter?.(session.correct);lastSound=now;}
    if(result==='slash' || result==='finished') {
      if(previousToken)scene?.update({ordinal:previousToken.ordinal,progress:1,served:kitchen.served,total:session.sentences.length,multiplier:kitchen.multiplier,error:false});
      // Keep the finished text on screen until the cut has fully left the stage.
      characterSpans.forEach(span=>span.className='done');
      cutting=true; cutReady=false; cutFinal=result==='finished'; session.pause();
      slash(cutFinal); screen.classList.add('cutting');
      $('#sentence-feedback').textContent=cutFinal?'Passage complete!':'Clean cut!';
      $('#sentence-hint').textContent='✦ SLICE!';
      $<HTMLButtonElement>('#sentence-finish').disabled=true;
      updateHud();scheduleCut(isReduced()?220:620);
    } else { $('#sentence-feedback').textContent=result==='wrong'?'Not quite. Backspace to fix it.':''; render(); }
  }
  $('#sentence-home').addEventListener('click',home); $('#sentence-result-home').addEventListener('click',home); $('#sentence-pause-home').addEventListener('click',home);
  $('#prepare-sentences').addEventListener('click',preview);
  $('#edit-passage').addEventListener('click',() => { show('editor'); editor.focus(); });
  $('#sentence-edit').addEventListener('click',() => { show('editor'); editor.focus(); });
  $('#sentence-new').addEventListener('click',() => { editor.value = ''; prepared = null; show('editor'); editor.focus(); });
  $('#sentence-replay').addEventListener('click',begin);
  $('#start-sentences').addEventListener('click',begin);
  function updateMute(){const muted=options.muted?.()??false;$('#sentence-mute').textContent=muted?'Sound off':'Sound on';$('#sentence-mute').setAttribute('aria-pressed',String(muted));$<HTMLButtonElement>('#sentence-mute').disabled=!options.toggleMute;}
  $('#sentence-mute').addEventListener('click',()=>{options.toggleMute?.();updateMute();input.focus({preventScroll:true});});
  $('#service-finger-hints').addEventListener('change',()=>{render();input.focus({preventScroll:true});});
  root.querySelectorAll<HTMLInputElement>('input[name="service-mode"]').forEach(radio=>radio.addEventListener('change',()=>{mode=radio.value as ServiceMode;$('.service-pace').hidden=mode!=='rush';}));
  $('#service-pace').addEventListener('change',()=>{pace=Number($<HTMLSelectElement>('#service-pace').value);});
  $('#sentence-retry').addEventListener('click',begin);
  $('#sentence-settings').addEventListener('click',options.settings);
  root.querySelectorAll<HTMLInputElement>('input[name="sentence-style"]').forEach(radio => radio.addEventListener('change',() => { style = radio.value as TypingStyle; preview(); }));
  root.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach(button => button.addEventListener('click',() => { const text=samples[button.dataset.sample as keyof typeof samples]; if(editor.value.trim()&&editor.value!==text&&!confirm('Replace the text in your editor with this story?'))return; if(button.dataset.sample==='snacks'){recipe='fruit';$<HTMLSelectElement>('#kitchen-recipe').value=recipe;updateRecipe();} editor.value = text; showError(''); editor.focus(); }));
  $<HTMLInputElement>('#passage-file').addEventListener('change',async event => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt') || file.size > 64 * 1024) { showError('Choose a .txt file smaller than 64 KiB.'); return; }
    try { const bytes = await file.arrayBuffer(); const text = new TextDecoder('utf-8',{fatal:true}).decode(bytes); if (text.length > 10_000) throw Error('Keep your text under 10,000 characters.'); if(editor.value.trim()&&!confirm('Replace the text in your editor with this file?'))return; editor.value = text; showError(''); }
    catch (e) { showError((e as Error).message); }
    (event.target as HTMLInputElement).value = '';
  });
  editor.addEventListener('paste',event => {
    const html = event.clipboardData?.getData('text/html'); if (!html) return;
    const blocks = extractClipboardHtml(html); if (!blocks.length) return;
    event.preventDefault();
    const text = blocks.map(block => (block.item ? '- ' : '') + block.text).join('\n');
    editor.setRangeText(text,editor.selectionStart,editor.selectionEnd,'end');
  });
  input.addEventListener('paste',event => { event.preventDefault(); $('#sentence-feedback').textContent = 'Type this passage to practice.'; });
  input.addEventListener('beforeinput',event => event.preventDefault());
  input.addEventListener('keydown',event => {
    if (!session || shownPage!=='stage' || savedRun || pauseCover.hidden === false || $('.sentence-countdown').hidden === false) return;
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); pause(); return; }
    if (event.key !== 'Backspace' && (event.key.length !== 1 || event.key < ' ' || event.key > '~')) return;
    event.preventDefault(); event.stopPropagation();
    if(cutting) { if(!cutFinal) queuedKeys.push(event.key); return; }
    acceptKey(event.key);
  });
  $('#sentence-pause').addEventListener('click',pause); $('#sentence-resume').addEventListener('click',resume);
  $('.sentence-stage').addEventListener('click',event=>{if((event.target as HTMLElement).closest('button,input'))return;if(pauseCover.hidden)input.focus({preventScroll:true});});
  $('#sentence-finish').addEventListener('click',() => finish(true));
  window.addEventListener('keydown',event => { if (root.hidden || shownPage !== 'stage' || document.querySelector('dialog[open]')) return; if (event.key === 'Escape' && pauseCover.hidden) { event.preventDefault(); pause(); } else if (event.key === 'Enter' && !pauseCover.hidden && !(event.target as HTMLElement).closest('button')) { event.preventDefault(); resume(); } });
  pauseCover.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=Array.from(pauseCover.querySelectorAll<HTMLElement>('button,input'));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  document.addEventListener('visibilitychange',() => { if (document.hidden && !root.hidden) pause(); });
  window.addEventListener('blur',() => { if (!root.hidden) pause(); });
  return { open() { document.querySelector<HTMLElement>('#app')!.inert = true; root.hidden = false; show(prepared ? 'preview' : 'editor'); if (prepared) preview(); else editor.focus(); }, active: () => !root.hidden, hasPassage: () => !!prepared, records: progress.records, resetProgress: progress.reset };
}
