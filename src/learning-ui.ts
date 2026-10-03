import { LESSONS, FINGER_ZONES, recordKey, weakKeys, practiceTip, type KeyStats, type ProgressStore } from './learning';
import { handDiagram, createFingerGuide } from './finger-guide';
import { selectionTitle, type FoodSelection } from './food-catalog';
import type { createSentenceProgress } from './sentence-progress';

function recordTitle(key: string) {
  const parts = key.split('-');
  const duration=/^(30|60|90)s$/.test(parts.at(-1)??'')?parts.pop():undefined;
  const last = parts[parts.length - 1];
  const basket: FoodSelection = ['fresh', 'snacks', 'big', 'garden', 'market', 'pantry', 'mixed'].includes(last) ? parts.pop() as FoodSelection : 'starter';
  const labels: Record<string, string> = { run: 'Arcade', beat: 'Beat Kitchen', sprout: 'Sprout', slicer: 'Slicer', chef: 'Chef', master: 'Master', relaxed: 'Relaxed', steady: 'Steady', brisk: 'Brisk', adaptive: 'Gentle adjustment', fixed: 'Fixed pace' };
  return `${parts[0]==='beat'||parts[0]==='run'?'':duration?'Free Play · ':'Classic · '}${parts.map(p => labels[p]).filter(Boolean).join(' · ')} · ${selectionTitle(basket)}${duration?' · '+duration:''}`;
}

export function createLearningUI(store: ProgressStore, changed: () => void = () => {}, sentenceProgress?: ReturnType<typeof createSentenceProgress>) {
  const dialog = document.createElement('dialog'); dialog.className = 'learning-dialog';
  dialog.setAttribute('aria-labelledby','learning-title'); document.body.append(dialog);
  let screen: 'guide' | 'lessons' | 'practice' | 'progress' | 'complete' = 'guide';
  let lesson: typeof LESSONS[number] = LESSONS[0];
  let index = 0; let typed = ''; let keys: KeyStats = {}; let attempts = 0; let correct = 0; let practicePaused = false;
  let highlight: (key?: string) => void = () => {};
  function frame(title: string, content: string) {
    dialog.innerHTML = `<header class="learning-heading"><div><p class="eyebrow">TYPESLASHER / PREP SCHOOL</p><h2 id="learning-title">${title}</h2></div><button class="quiet-button" id="learning-close" aria-label="Close learning panel">✕</button></header>${content}`;
    dialog.scrollTop = 0;
    dialog.querySelector('#learning-close')!.addEventListener('click',()=>dialog.close());
  }
  function markGuideSeen() { try { localStorage.setItem('typeslasher-guide-seen','1'); } catch { /* Optional. */ } }
  function guide() {
    screen='guide'; markGuideSeen();
    frame('Give every finger a home.', `<p class="learning-intro">Rest your fingers lightly on the home row. The colors connect each finger to its keys.</p>
      <div class="setup-hands">${handDiagram()}</div>
      <ol class="setup-steps"><li><b>Find the bumps.</b> Left index on F, right index on J.</li><li><b>Settle the other fingers.</b> Left hand A S D F · right hand J K L ;. Thumbs rest near space.</li><li><b>Reach, then return.</b> Follow the glowing key and finger. Keep shoulders relaxed and wrists comfortable.</li></ol>
      <p class="learning-muted">The guide recommends a finger; the game cannot tell which finger you actually use.</p>
      <div class="learning-actions"><button id="try-warmup" class="play-button">Try a warm-up</button><button id="guide-done" class="quiet-button">Ready to play</button></div>`);
    dialog.querySelector('#try-warmup')!.addEventListener('click',lessons);
    dialog.querySelector('#guide-done')!.addEventListener('click',()=>dialog.close());
  }
  function lessons() {
    screen='lessons';
    frame('A little prep. Better slices.', `<p class="learning-intro">Six tiny patterns per lesson. No timer, no score penalty. Accuracy comes first.</p><div class="lesson-list">${LESSONS.map((l,i)=>`<button class="lesson-choice" data-lesson="${i}"><span class="lesson-number">0${i+1}</span><span><b>${l.title}</b><small>${l.note}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div><p class="learning-muted">All lessons are available. Finish a lesson to save its progress.</p>`);
    const guideButton=document.createElement('button');guideButton.className='quiet-button';guideButton.textContent='Finger positioning guide';guideButton.addEventListener('click',guide);dialog.append(guideButton);
    dialog.querySelectorAll<HTMLButtonElement>('[data-lesson]').forEach(button=>button.addEventListener('click',()=> {
      lesson=LESSONS[Number(button.dataset.lesson)]; index=0; typed=''; keys={}; attempts=0; correct=0; practicePaused=false;
      screen='practice'; renderPractice();
    }));
  }
  function renderPractice() {
    frame(lesson.title, `<p class="learning-intro">${lesson.note}</p><div class="practice-status"><span>Pattern ${index+1} of ${lesson.patterns.length}</span><span id="practice-accuracy">Accuracy —</span></div>
      <progress class="lesson-progress" aria-label="Lesson progress" max="${lesson.patterns.length}" value="${index}"></progress>
      <div class="practice-word" tabindex="-1" aria-label="Pattern to type"></div><p id="practice-feedback" role="status">Type the glowing letter. Take your time.</p>
      <div id="practice-keyboard" class="keyboard">${['qwertyuiop','asdfghjkl;','zxcvbnm'].map(row=>`<div class="key-row">${[...row].map(k=>`<span data-key="${k}">${k}</span>`).join('')}</div>`).join('')}</div>
      <div class="practice-guide"><div id="practice-hands"></div><p id="practice-finger"></p></div>
      ${practicePaused?'<div class="practice-paused"><p>Welcome back. Ready when you are.</p><button id="practice-resume" class="play-button">Continue practice</button></div>':''}
      <div class="learning-actions"><button id="lesson-back" class="quiet-button">Leave lesson</button><small class="learning-muted">Unfinished lessons are not saved.</small></div>`);
    highlight=createFingerGuide(dialog.querySelector('#practice-hands')!,dialog.querySelector('#practice-keyboard')!);
    dialog.querySelector('#lesson-back')!.addEventListener('click',lessons);
    dialog.querySelector('#practice-resume')?.addEventListener('click',()=> {practicePaused=false; renderPractice();});
    updatePractice();
    // Move focus off buttons so Space/Enter cannot accidentally leave a lesson.
    (dialog.querySelector('.practice-word') as HTMLElement).focus();
  }
  function updatePractice() {
    const pattern=lesson.patterns[index]; const key=pattern[typed.length];
    dialog.querySelector('.practice-word')!.innerHTML=[...pattern].map((letter,i)=>`<span class="${i<typed.length?'typed':i===typed.length?'current':''}">${letter}</span>`).join('');
    dialog.querySelector('#practice-accuracy')!.textContent=`Accuracy ${attempts?Math.round(correct/attempts*100)+'%':'—'}`;
    dialog.querySelectorAll<HTMLElement>('#practice-keyboard [data-key]').forEach(el=>el.classList.toggle('active',el.dataset.key===key));
    const zone=FINGER_ZONES.find(z=>z.keys.includes(key));
    dialog.querySelector('#practice-finger')!.textContent=`${key.toUpperCase()} · ${zone?.label}`; highlight(key);
  }
  function completed() {
    screen='complete';
    store.complete({mode:'prep',label:lesson.id,attempts,correct,score:0,completed:lesson.patterns.length,activeMs:0},keys);
    frame('Nicely prepped!', `<div class="practice-reward" aria-hidden="true">✦</div><p class="learning-intro">Six patterns finished. Small, careful repetitions build confidence.</p><div class="learning-stats"><div><strong>${Math.round(correct/attempts*100)}%</strong><span>Accuracy</span></div><div><strong>${correct}</strong><span>Correct letters</span></div></div><p>${weakKeys(keys).length?practiceTip(keys):'Bring these keys into a short food round or a Sentence Slash passage.'}</p><p class="learning-muted">${store.saved()?'Progress saved on this browser.':'Progress is available this visit; browser storage is unavailable.'}</p><div class="learning-actions"><button id="more-practice" class="play-button">Another warm-up</button><button id="back-to-game" class="quiet-button">Back to game</button></div>`);
    dialog.querySelector('#more-practice')!.addEventListener('click',lessons);
    dialog.querySelector('#back-to-game')!.addEventListener('click',()=>dialog.close());
  }
  function progress() {
    screen='progress'; const p=store.get(); const totals=Object.values(p.keys).reduce((a,k)=>({attempts:a.attempts+k.attempts,correct:a.correct+k.correct}),{attempts:0,correct:0});
    const weak=weakKeys(p.keys);
    frame('Your kitchen notebook.', `<p class="learning-intro">Your practice stays on this browser. A few careful rounds matter more than one fast score.</p>
      <div class="learning-stats"><div><strong>${totals.attempts?Math.round(totals.correct/totals.attempts*100)+'%':'—'}</strong><span>Typing accuracy</span></div><div><strong>${p.rounds}</strong><span>Game rounds</span></div><div><strong>${p.lessons}</strong><span>Warm-ups</span></div></div>
      <h3>A good next step</h3><p>${practiceTip(p.keys)}</p><p class="learning-muted">${weak.length?'Keys to revisit: '+weak.map(k=>k.toUpperCase()).join(' · '):'Key suggestions appear after at least five attempts on a key.'} Errors are counted against the key you were trying to type.</p>
      <h3>Personal bests</h3><p class="learning-muted">Separate records for each game mode, food basket, challenge, pace, and adjustment setting. Earlier records are marked classic.</p><div class="best-list">${Object.entries(p.best).map(([key,score])=>`<span>${recordTitle(key)}<b>${score}</b></span>`).join('')||'<span>Finish a round to set a best.</span>'}</div>
      <h3>Keys you have practiced</h3><div class="key-progress">${Object.entries(p.keys).map(([key,s])=>`<span title="${s.correct} correct out of ${s.attempts} attempts"><b>${key.toUpperCase()}</b><small>${Math.round(s.correct/s.attempts*100)}%</small><small>${s.attempts} tries</small></span>`).join('')||'<p class="learning-muted">Your practiced keys will appear here.</p>'}</div>
      <h3>Recent sessions</h3>${p.sessions.length?`<div class="session-list">${p.sessions.slice().reverse().map(s=>`<div><span>${s.mode==='prep'?'Warm-up':s.mode==='beat'?'Beat Kitchen':'Arcade'} · ${s.completed} ${s.mode==='prep'?'patterns':'foods'}</span><b>${s.attempts?Math.round(s.correct/s.attempts*100)+'%':'—'}</b></div>`).join('')}</div>`:'<p class="learning-muted">Finish a round or warm-up to start your notebook.</p>'}
      <h3>Sentence Slash</h3>${sentenceProgress?.records().length ? `<div class="session-list">${sentenceProgress.records().slice().reverse().map(s=>`<div><span>${s.style==='exact'?'Exact':'Gentle'}${s.mode ? ' · '+(s.mode==='rush'?'Rush '+s.pace+' WPM':'Relaxed') : ''} · ${s.sentences}/${s.total} sentences ${s.complete?'complete':'partial'}</span><b>${s.attempts?Math.round(s.correct/s.attempts*100)+'%':'—'}</b></div>`).join('')}</div>` : '<p class="learning-muted">Your sentence practice will appear here, separate from food scores.</p>'}
      <p class="learning-muted">${store.saved()?'Saved on this browser only.':'Storage is unavailable. Progress lasts for this visit only.'}</p><div class="learning-actions"><button id="notebook-practice" class="play-button">Practice</button><button id="reset-progress" class="quiet-button">Reset learning progress</button></div><div id="reset-confirm"></div>`);
    dialog.querySelector('#notebook-practice')!.addEventListener('click',lessons);
    dialog.querySelector('#reset-progress')!.addEventListener('click',()=> {
      dialog.querySelector('#reset-confirm')!.innerHTML='<p>Clear your learning history, personal bests, and earned kitchen looks from this browser?</p><button id="confirm-reset" class="quiet-button">Yes, clear progress</button> <button id="cancel-reset" class="quiet-button">Keep progress</button>';
      dialog.querySelector('#confirm-reset')!.addEventListener('click',()=>{store.reset();sentenceProgress?.reset();changed();progress();});
      dialog.querySelector('#cancel-reset')!.addEventListener('click',()=>{dialog.querySelector('#reset-confirm')!.replaceChildren();});
    });
  }
  window.addEventListener('keydown',event=> {
    if (!dialog.open || screen!=='practice' || practicePaused || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement).closest('button,select,input,a')) return;
    const key=event.key.toLowerCase(); if (!/^[a-z;]$/.test(key)) return;
    event.preventDefault();
    const expected=lesson.patterns[index][typed.length]; attempts++; recordKey(keys,expected,key);
    if (key===expected) {
      correct++; typed+=key;
      if (typed===lesson.patterns[index]) {index++;typed=''; if(index===lesson.patterns.length) {completed();return;} renderPractice();dialog.querySelector('#practice-feedback')!.textContent='Nice! Next little pattern.';}
      else {updatePractice();dialog.querySelector('#practice-feedback')!.textContent='Good. Keep your hands relaxed.';}
    } else {updatePractice();dialog.querySelector('#practice-feedback')!.textContent=`Try ${expected.toUpperCase()} with the highlighted finger. Your letters are safe.`;}
  });
  document.addEventListener('visibilitychange',()=> {if(document.hidden && dialog.open && screen==='practice') {practicePaused=true;renderPractice();}});
  return {
    isOpen:()=>dialog.open,
    open(type: 'guide'|'lessons'|'progress') {if(type==='guide')guide();else if(type==='lessons')lessons();else progress();if(!dialog.open)dialog.showModal();},
    firstVisit() {try {if(localStorage.getItem('typeslasher-guide-seen')==='1')return;}catch {/* Show guide once per visit if storage is blocked. */}guide();dialog.showModal();},
  };
}
