import * as THREE from 'three';
import { loadFoodAssets, foodModel, lightFoodScene } from './food-assets';
import './styles.css';
import './pause-menu.css';
import { arcadeRound, validRoundSeconds, type RoundSeconds } from './arcade-run';
import { createArcadeMenu } from './arcade-menu';
import { createSentenceUI } from './sentence-ui';
import { createSentenceProgress } from './sentence-progress';
import { createSliceEffects } from './slice-effects';
import { RoundClock, foodTime, type Pace } from './round-timing';
import { createProgressStore, recordKey, practiceTip, fingerFor, type KeyStats } from './learning';
import { createLearningUI } from './learning-ui';
import { createFingerGuide } from './finger-guide';
import { DIFFICULTIES, THEMES, ChallengeDirector, selectTarget, unlockedThemes, type Difficulty, type Theme } from './challenge';
import { createPreferences } from './preferences';
import { createAudio } from './audio';
import { createSettingsUI } from './settings-ui';
import { addRhythmSettings } from './rhythm-settings';
import { BEAT_MS, BEAT_BONUS, beatError, beatBonus, BeatLauncher } from './rhythm';
import { createRenderMeter } from './render-meter';
import { FOOD_PACKS, foodsForSelection, foodsForPlay, packsForPlay, selectionTitle, validSelection, FoodSampler, type FoodSelection, type FoodDefinition } from './food-catalog';

type Food = {
  definition: FoodDefinition;
  group: THREE.Group;
  lane: number;
  typed: string;
  label: HTMLElement;
  bornAt: number;
  deadline: number;
  selected: boolean;
  sliced: boolean;
  halves?: THREE.Group[];
  sliceAt?: number;
};

let roundSeconds: RoundSeconds = 30;
let roundMs = 30_000;
let runRound = 1;
let runStart: Difficulty = 'sprout';
let runFactor = 1;
let runGap = 1700;
const SPAWN_GAP_MS = 1700;
const MISS_PENALTY = 50;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

app.innerHTML = `
  <section class="game-shell" aria-label="Typeslasher typing game">
    <header class="hud">
      <a class="brand" href="#" aria-label="Typeslasher home">TYPE<span>SLASHER</span></a>
      <div class="hud-stats" aria-live="polite">
        <div><small>Score</small><strong id="score">0000</strong></div>
        <div><small>Combo</small><strong id="combo">×1</strong></div>
        <div><small>Time</small><strong id="timer">0:30</strong></div>
      </div>
      <button id="pause-button" class="icon-button" aria-label="Pause game" disabled>Ⅱ</button>
    </header>
    <section class="arena-wrap">
      <canvas id="arena" aria-label="Flying food arena"></canvas>
      <div id="countdown" class="countdown" aria-live="assertive"></div>
      <div id="word-card" class="target-rack hidden" aria-live="polite"></div>
      <div id="toast" class="toast" aria-live="polite"></div>
    </section>
    <section class="typing-deck" aria-label="Typing guide">
      <div class="guide-copy"><span class="eyebrow">NEXT KEY</span><strong id="next-key">—</strong><span id="finger-name">Choose a food to begin</span></div>
      <div id="keyboard" class="keyboard" aria-label="On-screen keyboard"></div>
      <div class="hands" aria-hidden="true"><span>LEFT HAND</span><i></i><span>RIGHT HAND</span></div>
    </section>
    <section id="start-screen" class="overlay start-screen">
      <div class="start-orbit orbit-a"></div><div class="start-orbit orbit-b"></div>
      <div class="start-content">
        <p class="eyebrow">THE MIDNIGHT SNACK ARCADE</p>
        <h1>Type fast.<br><em>Slice snacks.</em></h1>
        <p class="intro">Food flies. You type its name. Every word becomes a perfect slice.</p>
        <label class="pace-control">Typing pace<select class="pace-select" aria-label="Typing pace"><option value="relaxed">Relaxed · plenty of time</option><option value="steady">Steady · comfortable challenge</option><option value="brisk">Brisk · quicker slices</option></select></label>
        <button id="play-button" class="play-button">Start slicing <span>↵</span></button>
        <p class="start-note">30 seconds + time to finish your last snack · keyboard only</p>
      </div>
      <aside class="home-row"><b>Home row ready?</b><span>Place fingers on <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd> and <kbd>J</kbd><kbd>K</kbd><kbd>L</kbd><kbd>;</kbd></span></aside>
    </section>
    <section id="pause-screen" class="overlay pause-screen hidden"><div><p class="eyebrow">PAUSE</p><h2>Take a breath.</h2><label class="pace-control">Typing pace<select class="pace-select" aria-label="Paused typing pace"><option value="relaxed">Relaxed · plenty of time</option><option value="steady">Steady · comfortable challenge</option><option value="brisk">Brisk · quicker slices</option></select></label><p class="pace-note">Changes apply to the next food. Your current word keeps its time.</p><button id="resume-button" class="play-button">Keep slicing <span>↵</span></button></div></section>
    <section id="results-screen" class="overlay results-screen hidden"><div class="results-card"><p class="eyebrow">ROUND COMPLETE</p><h2>Kitchen scorecard</h2><div class="result-grid"><div><small>Score</small><strong id="result-score">0</strong></div><div><small>Foods sliced</small><strong id="result-foods">0</strong></div><div><small>Accuracy</small><strong id="result-accuracy">0%</strong></div></div><p id="result-message" class="result-message"></p><button id="replay-button" class="play-button">Slice again <span>↵</span></button></div></section>
  </section>`;

const canvas = document.querySelector<HTMLCanvasElement>('#arena')!;
const wordCard = document.querySelector<HTMLDivElement>('#word-card')!;
const countdownEl = document.querySelector<HTMLDivElement>('#countdown')!;
const toastEl = document.querySelector<HTMLDivElement>('#toast')!;
const scoreEl = document.querySelector<HTMLElement>('#score')!;
const comboEl = document.querySelector<HTMLElement>('#combo')!;
const timerEl = document.querySelector<HTMLElement>('#timer')!;
const nextKeyEl = document.querySelector<HTMLElement>('#next-key')!;
const fingerNameEl = document.querySelector<HTMLElement>('#finger-name')!;
const keyboardEl = document.querySelector<HTMLDivElement>('#keyboard')!;
const startScreen = document.querySelector<HTMLElement>('#start-screen')!;
const pauseScreen = document.querySelector<HTMLElement>('#pause-screen')!;
const resultsScreen = document.querySelector<HTMLElement>('#results-screen')!;
const pauseButton = document.querySelector<HTMLButtonElement>('#pause-button')!;
const gameShell = document.querySelector<HTMLElement>('.game-shell')!;

const keyRows = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm'];
for (const row of keyRows) {
  const rowEl = document.createElement('div'); rowEl.className = 'key-row';
  for (const key of row) { const el = document.createElement('span'); el.dataset.key = key; el.textContent = key; rowEl.append(el); }
  keyboardEl.append(rowEl);
}
const handContainer = document.querySelector<HTMLElement>('.hands')!;
handContainer.removeAttribute('aria-hidden');
const highlightFinger = createFingerGuide(handContainer, keyboardEl);
let browserStorage: Storage | undefined;
try { browserStorage = localStorage; } catch { /* Learning works without persistence. */ }
const progressStore = createProgressStore(browserStorage);
const sentenceProgress = createSentenceProgress(browserStorage);
const preferences = createPreferences(browserStorage, matchMedia('(prefers-reduced-motion: reduce)').matches);
let settings = preferences.get();
const audio = createAudio(settings);
const learningUI = createLearningUI(progressStore, () => {refreshThemeUnlocks(progressStore.get().foods);saveChallenge();}, sentenceProgress);
const learningNav = document.createElement('nav'); learningNav.className = 'learning-nav'; learningNav.setAttribute('aria-label','Learning');
learningNav.innerHTML = '<button class="quiet-button" data-learn="lessons">Prep School</button><button class="quiet-button" data-learn="guide">Finger guide</button><button class="quiet-button" data-learn="progress">My progress</button>';
document.querySelector('.start-content')!.append(learningNav);
learningNav.querySelectorAll<HTMLButtonElement>('[data-learn]').forEach(button => button.addEventListener('click',()=>learningUI.open(button.dataset.learn as 'lessons'|'guide'|'progress')));
const resultsExtras = document.createElement('div'); resultsExtras.className = 'results-extras';
resultsExtras.innerHTML = '<p id="learning-result"></p><div class="learning-actions"><button id="results-progress" class="quiet-button">My progress</button><button id="results-home" class="quiet-button">Back to kitchen</button></div>';
resultsScreen.querySelector('.results-card')!.append(resultsExtras);
document.querySelector('#results-progress')!.addEventListener('click',()=>learningUI.open('progress'));
document.querySelector('#results-home')!.addEventListener('click',()=>{resultsScreen.classList.add('hidden');startScreen.classList.remove('hidden');refreshThemeUnlocks(progressStore.get().foods);applyTheme();playButton.focus();});
const pauseCard = pauseScreen.firstElementChild as HTMLElement;
const pausedPace = pauseCard.querySelector('.pace-control')!;
const paceNote = pauseCard.querySelector('.pace-note')!;
pauseCard.className='pause-card';
pauseCard.innerHTML='<p class="pause-kicker">THE KITCHEN CAN WAIT</p><h2>Game paused</h2><button id="resume-button" class="pause-action primary">Continue<span aria-hidden="true">↵</span></button><button id="retry-button" class="pause-action">Retry<span aria-hidden="true">↻</span></button><button id="pause-settings" class="pause-action">Settings<span aria-hidden="true">⚙</span></button><button id="exit-button" class="pause-action exit">Exit<span aria-hidden="true">←</span></button>';
const guideChoice = document.createElement('label'); guideChoice.className='pace-control guide-choice';
guideChoice.innerHTML='Typing guide<select aria-label="Typing guide display"><option value="full">Hands + keyboard</option><option value="compact">Keyboard only</option><option value="hidden">Hide guide</option></select>';
const guideSelect = guideChoice.querySelector('select')!; guideSelect.className='pace-select';
function applyGuideChoice() {
  gameShell.classList.toggle('guide-compact', guideSelect.value==='compact');
  gameShell.classList.toggle('guide-hidden', guideSelect.value==='hidden');
}
try {const saved=browserStorage?.getItem('typeslasher-guide-display');if(saved && ['full','compact','hidden'].includes(saved))guideSelect.value=saved;}catch { /* Optional. */ }
applyGuideChoice();
guideSelect.addEventListener('change',()=>{applyGuideChoice();try{browserStorage?.setItem('typeslasher-guide-display',guideSelect.value);}catch { /* Optional. */ }});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x17283b, 15, 33);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0.5, 17);
lightFoodScene(renderer, scene);
const foodLayer = new THREE.Group(); scene.add(foodLayer);
const sliceEffects = createSliceEffects(scene);
let assetsReady = false;
let menu:ReturnType<typeof createArcadeMenu>|undefined;
let sentenceUI:ReturnType<typeof createSentenceUI>|undefined;
const playButton = document.querySelector<HTMLButtonElement>('#play-button')!;
playButton.disabled = true;
playButton.textContent = 'Preparing snacks…';
let loadEpoch=0;
function prepareAssets() {
  const epoch=++loadEpoch;assetsReady=false;playButton.disabled=true;playButton.textContent='Preparing snacks…';
  menu?.loading('Preparing your snacks…',true);
  loadFoodAssets(packsForPlay(selectedFoods(),selectedMode()!=='arcade'&&difficultySelect.value==='sprout')).then(() => {
    if(epoch!==loadEpoch)return;
    assetsReady=true;playButton.disabled=false;playButton.innerHTML='Start slicing <span>↵</span>';
    menu?.loading('',false);
  }).catch((error: unknown) => {
    if(epoch!==loadEpoch)return;
    console.error('Food pack failed to load', error);
    playButton.disabled=false;playButton.textContent='Retry preparing snacks';
    menu?.loading('Snacks could not load. Press Play to retry.',false);
  });
}

let food: Food | null = null;
const foods: Food[] = [];
let difficulty: Difficulty = 'sprout';
let director = new ChallengeDirector(difficulty);
const challengeControls = document.createElement('div'); challengeControls.className='challenge-controls';
challengeControls.innerHTML='<label>Challenge<select id="difficulty"><option value="sprout">Sprout · 1 food</option><option value="slicer">Slicer · 2 foods</option><option value="chef">Chef · 3 foods</option><option value="master">Master · 4 foods</option></select></label><label>Kitchen look<select id="theme"></select></label><label class="adapt-option"><input id="adaptive" type="checkbox" checked> Adjust gently as I improve</label><p id="challenge-note">Higher challenges shorten typing windows. Each word has a different first letter.</p>';
document.querySelector('.start-content')!.insertBefore(challengeControls,playButton);
const packControl=document.createElement('label');packControl.className='pack-control';
packControl.innerHTML='<span id="food-pack-label">Food basket</span><select id="food-pack" aria-labelledby="food-pack-label" aria-describedby="pack-note"><option value="starter">Original favorites · 8 foods</option><option value="fresh">Fresh picks · 6 new foods</option><option value="snacks">Snack break · 6 snacks</option><option value="big">Big bites · 6 longer words</option><option value="garden">Garden harvest · 8 foods</option><option value="market">Fruit market · 8 fruits</option><option value="pantry">Pantry & comfort · 8 foods</option><option value="mixed">Mixed basket · all packs</option></select><small id="pack-note"></small><a id="pack-preview" href="./assets.html" target="_blank" rel="noopener">Meet the foods ↗</a>';
challengeControls.prepend(packControl);
const packSelect=packControl.querySelector<HTMLSelectElement>('select')!;
function selectedFoods():FoodSelection{return validSelection(packSelect.value)?packSelect.value:'starter';}
try{const saved=browserStorage?.getItem('typeslasher-food-pack');if(validSelection(saved))packSelect.value=saved;}catch{/* Optional. */}
function updatePackChoice(){
  const selected=selectedFoods();
  const pool=foodsForPlay(selected,selectedMode()!=='arcade'&&difficultySelect.value==='sprout');
  const lengths=pool.map(food=>food.letters);
  document.querySelector('#pack-note')!.textContent=selected==='mixed'?`${pool.length} foods · ${Math.min(...lengths)}–${Math.max(...lengths)} letters`:FOOD_PACKS[selected].description;
  document.querySelector<HTMLAnchorElement>('#pack-preview')!.href=`./assets.html?pack=${selected}`;
  try{browserStorage?.setItem('typeslasher-food-pack',selected);}catch{/* Optional. */}
  prepareAssets();
}
packSelect.addEventListener('change',updatePackChoice);
const difficultySelect = document.querySelector<HTMLSelectElement>('#difficulty')!;
const adaptiveInput = document.querySelector<HTMLInputElement>('#adaptive')!;
const themeSelect = document.querySelector<HTMLSelectElement>('#theme')!;
const modeChoice = document.createElement('fieldset');modeChoice.className='mode-choice';
modeChoice.innerHTML='<legend>Pick your kitchen</legend><label><input type="radio" name="mode" value="practice" checked><span>Free Play</span></label><label><input type="radio" name="mode" value="arcade"><span>Arcade</span></label><label><input type="radio" name="mode" value="beat"><span>Beat Kitchen</span></label><p id="mode-note"></p>';
document.querySelector('.start-content')!.insertBefore(modeChoice, document.querySelector('.pace-control'));
let gameMode: 'practice' | 'arcade' | 'beat' = 'practice';
const beatLauncher=new BeatLauncher();let beatHits=0;let beatOffset=0;let previousPulse=-1;
function selectedMode() {return modeChoice.querySelector<HTMLInputElement>('input:checked')!.value as typeof gameMode;}
function updateModeNote() {
  const mode=selectedMode();
  document.querySelector('#mode-note')!.textContent=mode==='beat'?`Foods arrive on the beat. Finish a whole word near a pulse for +${BEAT_BONUS}. Type the letters at your own pace.`:'Type each word at your own pace. Accuracy comes first.';
  try{browserStorage?.setItem('typeslasher-mode',mode);}catch{/* Optional. */}
}
try{if(browserStorage?.getItem('typeslasher-mode')==='beat')modeChoice.querySelector<HTMLInputElement>('[value="beat"]')!.checked=true;}catch{/* Optional. */}
updateModeNote();
modeChoice.addEventListener('change',updateModeNote);
const beatDisplay=document.createElement('div');beatDisplay.className='beat-display hidden';
beatDisplay.innerHTML='<span class="beat-name">♫ BEAT KITCHEN</span><span class="beat-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span id="beat-count">120 BPM · finish near the pulse</span>';
document.querySelector('.arena-wrap')!.append(beatDisplay);
for(const [id,theme] of Object.entries(THEMES)) themeSelect.add(new Option(theme.title,id));
function refreshThemeUnlocks(completed: number) {
  const available=unlockedThemes(completed);
  for(const option of themeSelect.options)option.disabled=!available.includes(option.value as Theme);
  if(!available.includes(themeSelect.value as Theme))themeSelect.value='midnight';
  const nextTheme=Object.values(THEMES).find(theme=>theme.unlock>completed);
  document.querySelector('#challenge-note')!.textContent=`Higher challenges shorten typing windows. Each word has a different first letter.${nextTheme?` Slice ${nextTheme.unlock-completed} more foods to unlock ${nextTheme.title}.`:' All kitchen looks unlocked!'}`;
  return available;
}
const unlocked=refreshThemeUnlocks(progressStore.get().foods);
try {const value=browserStorage?.getItem('typeslasher-difficulty');if(value && value in DIFFICULTIES)difficultySelect.value=value;adaptiveInput.checked=browserStorage?.getItem('typeslasher-adaptive')!=='false';}catch{}
try {const value=browserStorage?.getItem('typeslasher-theme') as Theme;if(unlocked.includes(value))themeSelect.value=value;}catch{}
function applyTheme(){gameShell.dataset.theme=themeSelect.value;}
function saveChallenge(){applyTheme();try{browserStorage?.setItem('typeslasher-difficulty',difficultySelect.value);browserStorage?.setItem('typeslasher-adaptive',String(adaptiveInput.checked));browserStorage?.setItem('typeslasher-theme',themeSelect.value);}catch{}}
difficultySelect.addEventListener('change',saveChallenge);adaptiveInput.addEventListener('change',saveChallenge);themeSelect.addEventListener('change',saveChallenge);applyTheme();
difficultySelect.addEventListener('change',updatePackChoice);updatePackChoice();
const challengeStatus=document.createElement('div');challengeStatus.className='challenge-status';challengeStatus.setAttribute('role','status');document.querySelector('.arena-wrap')!.append(challengeStatus);
const roundClock = new RoundClock();
let pace: Pace = 'relaxed';
try { const saved = localStorage.getItem('typeslasher-pace'); if (saved === 'relaxed' || saved === 'steady' || saved === 'brisk') pace = saved; } catch { /* Play still works when storage is unavailable. */ }
const paceSelects = [document.querySelector<HTMLSelectElement>('.start-content .pace-select')!,pausedPace.querySelector<HTMLSelectElement>('select')!];
paceSelects.forEach(select => {
  select.value = pace;
  select.addEventListener('change', () => {
    pace = select.value as Pace;
    if (running) roundPace = 'mixed';
    paceSelects.forEach(other => { other.value = pace; });
    try { localStorage.setItem('typeslasher-pace', pace); } catch { /* Optional preference storage. */ }
  });
});
let lastSpawnAt = 0;
let running = false;
let paused = false;
let score = 0;
let combo = 0;
let correctKeys = 0;
let typedKeys = 0;
let roundKeys: KeyStats = {};
let roundPace: string = pace;
let foodCount = 0;
let roundSelection:FoodSelection='starter';
let sampler=new FoodSampler(foodsForSelection('starter'));
let toastTimeout = 0;
let missEffectTimeout = 0;
let needsRender = true;
let lastRenderAt = 0;
let lastUiAt = -100;
let shakeUntil = 0;
const renderMeter=import.meta.env.DEV && new URLSearchParams(location.search).get('diagnostics')==='1'?createRenderMeter():undefined;

function resize() {
  const bounds = canvas.parentElement!.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  renderer.setSize(bounds.width, bounds.height, false);
  camera.aspect = bounds.width / bounds.height; camera.updateProjectionMatrix();
  // Maintain enough horizontal room for the food even in a narrow window.
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.max(6.3, 2.1 / camera.aspect) / 17));
  camera.updateProjectionMatrix();
  needsRender = true;
}
window.addEventListener('resize', resize); resize();
new ResizeObserver(resize).observe(canvas.parentElement!);

function applySettings() {
  settings = preferences.get(); audio.configure(settings);
  gameShell.classList.toggle('reduced-effects', settings.reduced);
  renderer.setPixelRatio(Math.min(devicePixelRatio, settings.quality === 'low' ? 1 : settings.quality === 'high' ? 2 : 1.5));
  sliceEffects.clear(); camera.position.x = 0; shakeUntil = 0; resize();
}
const settingsUI = createSettingsUI(preferences, audio, applySettings);
settingsUI.dialog.addEventListener('close',()=>menu?.refreshPreferences());
addRhythmSettings(settingsUI.dialog, preferences, audio, applySettings);
for (const parent of [learningNav]) {
  const button = document.createElement('button'); button.className = 'quiet-button settings-button'; button.textContent = 'Sound & feel';
  button.addEventListener('click', () => settingsUI.open()); parent.append(button);
}
const pauseOptions=document.createElement('section');pauseOptions.className='pause-settings-extra';
pauseOptions.append(pausedPace,paceNote,guideChoice);
settingsUI.dialog.querySelector('.settings-fields')!.append(pauseOptions);
document.querySelector('#pause-settings')!.addEventListener('click',()=>{pauseOptions.hidden=false;settingsUI.open();});
document.querySelector('#retry-button')!.addEventListener('click',()=>beginRound('retry'));
document.querySelector('#exit-button')!.addEventListener('click',exitRound);
const nextRoundButton=document.createElement('button');nextRoundButton.className='play-button';nextRoundButton.textContent='Next round →';nextRoundButton.hidden=true;
resultsScreen.querySelector('.results-card')!.append(nextRoundButton);
nextRoundButton.addEventListener('click',()=>beginRound('next'));
applySettings();
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); togglePause(true);
  showToast('Graphics paused. Restore the window or reload to continue.', 'miss');
});
canvas.addEventListener('webglcontextrestored', () => { needsRender = true; showToast('Graphics ready. Resume when you are ready.'); });
document.querySelector('.brand')!.addEventListener('click', event => { event.preventDefault(); if (running) togglePause(true); else { resultsScreen.classList.add('hidden');startScreen.classList.remove('hidden');playButton.focus(); } });

function createFood(def: FoodDefinition) { return foodModel(def.kind)!; }

function positionFood(item: Food, progress: number) {
  const capacity=DIFFICULTIES[difficulty].capacity;
  const cols=innerWidth<700?Math.min(2,capacity):capacity;
  const rows=Math.ceil(capacity/cols);
  wordCard.classList.toggle('multi-row',rows>1);
  item.label.style.gridColumn=String(item.lane%cols+1);
  item.label.style.gridRow=String(Math.floor(item.lane/cols)+1);
  wordCard.style.setProperty('--targets',String(cols));
  const extent=Math.max(6.3,2.1/camera.aspect);
  const x=((item.lane%cols+.5)/cols*2-1)*(extent*camera.aspect*.85);
  const wave=settings.reduced ? .5 : Math.sin(progress*Math.PI);
  const y=rows===1?-2.1+wave*1.2: 2.6-Math.floor(item.lane/cols)*5+wave*.25;
  item.group.position.set(x,y,0);
  item.group.scale.setScalar(Math.min(rows===1?1.35:.8,extent*camera.aspect/cols*.6));
}

function spawnFood(now: number) {
  const capacity=DIFFICULTIES[difficulty].capacity;
  const lane=Array.from({length:capacity},(_,i)=>i).find(i=>!foods.some(f=>f.lane===i));
  if(lane===undefined)return;
  const definition=sampler.next(foods.filter(f=>!f.sliced).map(f=>f.definition.name));
  if(!definition)return;
  const group=createFood(definition); foodLayer.add(group);
  const label=document.createElement('div');label.className='word-card target-card';wordCard.append(label);
  label.style.setProperty('--word-scale',String(Math.min(1,6/definition.letters)));
  const item: Food={definition,group,lane,typed:'',label,bornAt:now,deadline:now+Math.round(director.budget(foodTime(pace,definition.name.length))*runFactor),selected:false,sliced:false};
  foods.push(item);positionFood(item,0);lastSpawnAt=now;updateWordCard();
}

function updateWordCard() {
  const active=foods.filter(f=>!f.sliced);
  wordCard.classList.toggle('hidden',active.length===0);
  wordCard.style.setProperty('--targets',String(DIFFICULTIES[difficulty].capacity));
  for(const item of active) {
    const columns=innerWidth<700?Math.min(2,DIFFICULTIES[difficulty].capacity):DIFFICULTIES[difficulty].capacity;
    item.label.style.gridColumn=String(item.lane%columns+1);
    item.label.style.gridRow=String(Math.floor(item.lane/columns)+1);
    wordCard.style.setProperty('--targets',String(columns));
    item.label.classList.toggle('locked',item===food);
    item.label.innerHTML=[...item.definition.name].map((letter,i)=>`<span class="${i<item.typed.length?'typed':i===item.typed.length?'current':''}">${letter}</span>`).join('')+
      `<small>${item===food?'LOCKED ON':(item.lane+1)+' · TYPE '+item.definition.name[0].toUpperCase()+' TO SELECT'}</small><div class="food-time"><progress aria-label="Time left for ${item.definition.name}" max="1" value="1"></progress><small class="food-seconds"></small></div>`;
  }
  updateFoodTime();
  const suggested=food??active[0];
  const next=suggested?.definition.name[suggested.typed.length]??'';
  nextKeyEl.textContent=next.toUpperCase()||'—';
  fingerNameEl.textContent=next?(fingerFor(next)?.label??'Choose a word'):'Ready for the next snack';
  highlightFinger(next);
  keyboardEl.querySelectorAll<HTMLElement>('[data-key]').forEach(el=>el.classList.toggle('active',el.dataset.key===next));
}

function resolveChallenge(success: boolean) {
  const change=director.resolve(success);
  if(change)challengeStatus.textContent=change==='harder'?'Finding your rhythm! A little quicker on new foods.':'Take your time. New foods get a little longer.';
}

function showToast(message: string, className = '') {
  toastEl.textContent = message; toastEl.className = `toast visible ${className}`;
  window.clearTimeout(toastTimeout); toastTimeout = window.setTimeout(() => { toastEl.className = 'toast'; }, 950);
}

function formatScore(value: number) {
  return value < 0 ? `−${String(Math.abs(value)).padStart(3, '0')}` : String(value).padStart(4, '0');
}

function registerMiss(item: Food, now: number) {
  if (item.sliced) return;
  removeFood(item); resolveChallenge(false);
  combo = 0;
  score -= MISS_PENALTY;
  scoreEl.textContent = formatScore(score);
  comboEl.textContent = '×1';
  nextKeyEl.textContent = '—';
  highlightFinger();
  fingerNameEl.textContent = 'Ready for the next snack';
  document.querySelectorAll('.keyboard .active').forEach((el) => el.classList.remove('active'));
  showToast(`MISSED! −${MISS_PENALTY}`, 'miss');
  audio.miss();
  gameShell.classList.remove('missed');
  void gameShell.offsetWidth;
  gameShell.classList.add('missed');
  window.clearTimeout(missEffectTimeout);
  missEffectTimeout = window.setTimeout(() => gameShell.classList.remove('missed'), 500);
  lastSpawnAt = Math.max(lastSpawnAt,now-DIFFICULTIES[difficulty].gap+650);
  updateWordCard();
}

function sliceFood(now: number) {
  if (!food) return;
  const bonus=gameMode==='beat'?beatBonus(now,beatOffset):0;
  if(bonus)beatHits++;
  if (!settings.reduced) sliceEffects.trigger(food.group.position, food.definition.color);
  audio.slice(bonus>0);
  if(settings.shake && !settings.reduced)shakeUntil=now+180;
  food.sliced = true; food.sliceAt = now; foodCount += 1; combo += 1; score += 100 * Math.min(combo, 5)+bonus;
  scoreEl.textContent = formatScore(score); comboEl.textContent = `×${Math.min(combo, 5)}`;
  const halves: THREE.Group[] = [];
  for (const direction of [-1, 1]) {
    const half = foodModel(food.definition.kind, direction < 0 ? '_left' : '_right')!;
    half.position.copy(food.group.position); half.rotation.copy(food.group.rotation); half.scale.copy(food.group.scale);
    half.userData.direction = direction; foodLayer.add(half); halves.push(half);
  }
  foodLayer.remove(food.group); food.halves = halves; food.label.remove();
  resolveChallenge(true); food=null; updateWordCard();
  if(!foods.some(item=>!item.sliced)) {nextKeyEl.textContent='✦';fingerNameEl.textContent='Perfect slice!';highlightFinger();}
  showToast(bonus?`ON THE BEAT! +${bonus}`:combo > 1 ? `${combo} slice combo!` : 'SNACK SLASH!', 'success');
}

function removeFood(item: Food) {
  foodLayer.remove(item.group);item.halves?.forEach(half=>foodLayer.remove(half));item.label.remove();
  const index=foods.indexOf(item);if(index>=0)foods.splice(index,1);
  if(food===item)food=null;
}
function clearFood() {
  sliceEffects.clear();for(const item of [...foods])removeFood(item);wordCard.classList.add('hidden');
}
function updateFoodTime() {
  for(const item of foods) {
    if(item.sliced)continue;
    const remaining=Math.max(0,item.deadline-roundClock.elapsed);
    item.label.querySelector<HTMLProgressElement>('progress')!.value=remaining/(item.deadline-item.bornAt);
    const seconds=item.label.querySelector<HTMLElement>('.food-seconds')!;
    const text=`${Math.ceil(remaining/1000)}s`;if(seconds.textContent!==text)seconds.textContent=text;
  }
}

function updateHud(now: number) {
  const remaining = Math.max(0, roundMs - now);
  const totalSeconds = Math.ceil(remaining / 1000);
  const text=remaining === 0 && foods.length ? 'Last snacks' : `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
  if(timerEl.textContent!==text)timerEl.textContent=text;
}

function endRound() {
  if (!running) return;
  running = false; clearFood(); audio.stop(); needsRender=true; pauseButton.disabled = true;
  beatDisplay.classList.add('hidden');gameShell.classList.remove('beat-mode');
  paused = false; pauseScreen.classList.add('hidden'); highlightFinger();
  setArenaPaused(false);
  const accuracy = typedKeys ? Math.round((correctKeys / typedKeys) * 100) : 100;
  document.querySelector<HTMLElement>('#result-score')!.textContent = String(score);
  document.querySelector<HTMLElement>('#result-foods')!.textContent = String(foodCount);
  document.querySelector<HTMLElement>('#result-accuracy')!.textContent = typedKeys ? `${accuracy}%` : '—';
  document.querySelector<HTMLElement>('#result-message')!.textContent = !typedKeys ? 'Start with the glowing key. Try Relaxed pace for more time to find each letter.' : accuracy >= 90 ? 'Amazing accuracy. Your fingers are finding their rhythm.' : 'Nice work. Slow, accurate slices make fast typing later.';
  const previousBest = progressStore.get().best[roundPace] ?? 0;
  const personalBest = roundPace !== 'mixed' && score > previousBest;
  const themesBefore=unlockedThemes(progressStore.get().foods);
  progressStore.complete({mode:gameMode==='beat'?'beat':'arcade',label:roundPace,attempts:typedKeys,correct:correctKeys,score,completed:foodCount,activeMs:roundClock.elapsed},roundKeys);
  const themesAfter=refreshThemeUnlocks(progressStore.get().foods);
  const unlockedTheme=themesAfter.find(theme=>!themesBefore.includes(theme));
  const speed = roundClock.elapsed >= 10_000 && typedKeys ? `${Math.round(correctKeys / 5 / (roundClock.elapsed / 60000))} WPM over active round time. ` : '';
  document.querySelector('#learning-result')!.textContent = `${personalBest ? 'New personal best! ' : ''}${gameMode==='beat'?`${beatHits} on-beat slices · ${beatHits*BEAT_BONUS} bonus points. `:''}${unlockedTheme?`${THEMES[unlockedTheme].title} unlocked! `:''}${speed}${practiceTip(roundKeys)} ${progressStore.saved()?'Progress saved on this browser.':'Progress lasts for this visit; storage is unavailable.'}`;
  resultsScreen.classList.remove('hidden');
  document.querySelector<HTMLButtonElement>('#replay-button')!.focus();
  menu?.results({accuracy:typedKeys?`${accuracy}%`:'—',score,foods:foodCount,best:personalBest,
    message:document.querySelector('#learning-result')!.textContent!,total:progressStore.get().foods,
    next:Object.values(THEMES).find(t=>t.unlock>progressStore.get().foods),round:gameMode==='arcade'?runRound:undefined});
}

function exitRound(){
  running=false;paused=false;clearFood();audio.stop();needsRender=true;pauseButton.disabled=true;
  pauseScreen.classList.add('hidden');setArenaPaused(false);countdownEl.classList.remove('show');
  beatDisplay.classList.add('hidden');gameShell.classList.remove('beat-mode');highlightFinger();
  menu?.home();
}

function beginRound(action:'new'|'retry'|'next'='new') {
  if (!assetsReady) {menu?.loading('Preparing your snacks…',true);prepareAssets();return;}
  menu?.hide();
  setArenaPaused(false);
  audio.stop(); void audio.unlock(); lastUiAt=-100;shakeUntil=0;camera.position.x=0;
  startScreen.classList.add('hidden');
  clearFood(); score = 0; combo = 0; correctKeys = 0; typedKeys = 0; foodCount = 0; roundSelection=selectedFoods();sampler=new FoodSampler(foodsForPlay(roundSelection,selectedMode()!=='arcade'&&difficultySelect.value==='sprout')); roundClock.start(performance.now()); lastSpawnAt = -SPAWN_GAP_MS; running = true; paused = false;
  gameMode=selectedMode();beatLauncher.reset();beatHits=0;beatOffset=settings.beatOffset;previousPulse=-1;
  if(action==='new'){runRound=1;runStart=difficultySelect.value as Difficulty;}
  else if(action==='next')runRound++;
  const stage=arcadeRound(runRound,runStart);
  difficulty=gameMode==='arcade'?stage.difficulty:difficultySelect.value as Difficulty;
  runFactor=gameMode==='arcade'?stage.factor:1;runGap=gameMode==='arcade'?stage.gap:DIFFICULTIES[difficulty].gap;
  director=new ChallengeDirector(difficulty,gameMode==='arcade'?false:adaptiveInput.checked);
  roundMs=roundSeconds*1000;
  beatDisplay.querySelector('#beat-count')!.textContent='120 BPM · finish near the pulse';
  beatDisplay.classList.remove('on-beat');beatDisplay.querySelectorAll('i').forEach(dot=>dot.classList.remove('active'));
  beatDisplay.classList.toggle('hidden',gameMode!=='beat');gameShell.classList.toggle('beat-mode',gameMode==='beat');
  challengeStatus.textContent=(gameMode==='arcade'?`ROUND ${runRound} · `:'')+DIFFICULTIES[difficulty].title+' · '+selectionTitle(roundSelection)+' · '+(gameMode==='arcade'?'A little quicker each round':director.adaptive?'Gentle adjustment on':'Fixed challenge');
  roundKeys = {}; roundPace = (gameMode==='beat'?'beat-':gameMode==='arcade'?'run-':'')+difficulty+'-'+pace+'-'+(director.adaptive?'adaptive':'fixed')+(roundSelection==='starter'?'':'-'+roundSelection)+`-${roundSeconds}s`; highlightFinger();
  scoreEl.textContent = '0000'; comboEl.textContent = '×1'; pauseButton.disabled = false; pauseScreen.classList.add('hidden'); resultsScreen.classList.add('hidden');nextRoundButton.hidden=gameMode!=='arcade';
  updateHud(0); pauseButton.textContent = 'Ⅱ';
  nextKeyEl.textContent = '—'; fingerNameEl.textContent = 'Home row ready?';
  document.querySelectorAll('.keyboard .active').forEach(el => el.classList.remove('active'));
  window.clearTimeout(toastTimeout); toastEl.className = 'toast';toastEl.textContent='';
  window.clearTimeout(missEffectTimeout); gameShell.classList.remove('missed');
  (document.activeElement as HTMLElement | null)?.blur();
}

function togglePause(force?: boolean) {
  if (!running) return;
  const next = force ?? !paused;
  if (next === paused) return;
  paused = next; pauseScreen.classList.toggle('hidden', paused === false); pauseButton.textContent = paused ? '▶' : 'Ⅱ';
  setArenaPaused(paused);
  if (paused) { roundClock.pause(performance.now());audio.stop();document.querySelector<HTMLButtonElement>('#resume-button')!.focus(); }
  else { void audio.unlock();roundClock.resume(performance.now()); (document.activeElement as HTMLElement | null)?.blur(); }
}

function setArenaPaused(value:boolean){
  for(const selector of ['.hud','.arena-wrap','.typing-deck'])gameShell.querySelector<HTMLElement>(selector)!.inert=value;
}
pauseScreen.setAttribute('role','dialog');pauseScreen.setAttribute('aria-label','Game paused');pauseScreen.setAttribute('aria-modal','true');
pauseScreen.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const buttons=Array.from(pauseScreen.querySelectorAll<HTMLElement>('button:not(:disabled),select'));
  const first=buttons[0],last=buttons[buttons.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

document.addEventListener('visibilitychange', () => { if (document.hidden) { togglePause(true);audio.stop(); } });
window.addEventListener('keydown', (event) => {
  if (sentenceUI?.active()) return;
  if (menu?.visible()) return;
  if (learningUI.isOpen() || settingsUI.isOpen()) return;
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key === 'Escape') { togglePause(); return; }
  if ((event.target as HTMLElement).closest('button,select,input,a')) return;
  if (event.key === 'Enter' && paused) { togglePause(false); return; }
  if (event.key === 'Enter' && !running) { beginRound(); return; }
  if (!running || !roundClock.ready) return;
  const key=event.key.toLowerCase();if(!/^[a-z;]$/.test(key))return;
  const available=foods.filter(f=>!f.sliced && roundClock.elapsed<f.deadline);
  if(food && !available.includes(food))food=null;
  if(!available.length)return;
  food=selectTarget(available,food??undefined,key,item=>item.definition.name)??null;
  typedKeys++;
  if(!food){director.key(false);combo=0;comboEl.textContent='×1';showToast('Type a food’s first letter','miss');return;}
  const expected=food.definition.name[food.typed.length];
  recordKey(roundKeys,expected,key);director.key(key===expected);
  if(key===expected) {
    food.selected=true;food.typed+=key;correctKeys++;audio.letter(food.typed.length);updateWordCard();
    if(food.typed===food.definition.name)sliceFood(roundClock.elapsed);
  } else {combo=0;comboEl.textContent='×1';showToast(food?'Finish the locked word':'Type a food’s first letter','miss');}
});


document.querySelector<HTMLButtonElement>('#play-button')!.addEventListener('click', () => beginRound());
document.querySelector<HTMLButtonElement>('#replay-button')!.addEventListener('click', () => beginRound());
document.querySelector<HTMLButtonElement>('#resume-button')!.addEventListener('click', () => togglePause(false));
pauseButton.addEventListener('click', () => togglePause());

function animate(now: number) {
  requestAnimationFrame(animate);
  const delta = running ? roundClock.tick(now) : 0;
  const frameTime = now;
  renderMeter?.tick(now);
  audio.update(roundClock.elapsed, running && roundClock.ready && !document.hidden);
  countdownEl.classList.toggle('show', running && !paused && roundClock.countdown > 0);
  const countLabel = running && !paused && roundClock.countdown > 0 ? String(Math.ceil(roundClock.countdown / 1000)) : '';
  if (countdownEl.textContent !== countLabel) countdownEl.textContent = countLabel;
  if (running && roundClock.ready && delta > 0) {
    now = roundClock.elapsed;
    sliceEffects.update(delta);
    if(now-lastUiAt>=100)updateHud(now);
    if (now >= roundMs && foods.length===0) { endRound(); renderer.render(scene, camera); return; }
    if(gameMode==='beat') {
      const pulse=Math.floor(Math.max(0,now-beatOffset)/BEAT_MS);
      if(pulse!==previousPulse){previousPulse=pulse;beatDisplay.querySelectorAll('i').forEach((dot,i)=>dot.classList.toggle('active',i===pulse%4));}
      beatDisplay.classList.toggle('on-beat',Math.abs(beatError(now,beatOffset))<=90);
      const beatText=beatHits?`${beatHits} on-beat slices · +${beatHits*BEAT_BONUS}`:'120 BPM · finish near the pulse';
      const count=beatDisplay.querySelector('#beat-count')!;if(count.textContent!==beatText)count.textContent=beatText;
    }
    const room=foods.length<DIFFICULTIES[difficulty].capacity;
    const spawnDue=gameMode==='beat'?beatLauncher.due(now,runGap,room):room && now-lastSpawnAt>=runGap;
    if(now<roundMs && spawnDue)spawnFood(now);
    for(const item of [...foods]) {
      if(!item.sliced) {
        const progress=(now-item.bornAt)/(item.deadline-item.bornAt);
        positionFood(item,progress);item.group.rotation.y=settings.reduced?0:Math.sin(progress*Math.PI*2)*.22;item.group.rotation.z=settings.reduced?0:Math.sin(progress*Math.PI)*.2;
        if(now>=item.deadline)registerMiss(item,now);
      } else if(item.halves && item.sliceAt!==undefined) {
        const age=(now-item.sliceAt)/1000;
        for(const half of item.halves){const direction=half.userData.direction as number;half.position.x+=direction*(settings.reduced?.5:2.6)*delta;if(!settings.reduced){half.position.y-=(1.5+age*3)*delta;half.rotation.y+=direction*2.1*delta;half.rotation.z+=direction*1.3*delta;}}
        if(age>(settings.reduced?.4:1.1))removeFood(item);
      }
    }
    if(now-lastUiAt>=100){updateFoodTime();lastUiAt=now;}
    camera.position.x=now<shakeUntil?Math.sin(now*.09)*.035*(shakeUntil-now)/180:0;
  }


  if(!document.hidden && (needsRender || (running && !paused && frameTime-lastRenderAt>=(settings.quality==='low'?1000/30:0)))) {
    const renderStart=renderMeter?performance.now():0;
    renderer.render(scene, camera);needsRender=false;lastRenderAt=frameTime;
    renderMeter?.record(performance.now()-renderStart,renderer.info.render.calls,renderer.info.render.triangles,renderer.info.memory.geometries);
  }
}
const menuLevels:Difficulty[]=['sprout','slicer','chef','master'];
const menuPaces:Pace[]=['relaxed','steady','brisk'];
menu=createArcadeMenu({
  setup:()=>({basket:selectedFoods(),mode:selectedMode()==='beat'?'Beat Kitchen':selectedMode()==='arcade'?'Arcade':'Free Play',level:menuLevels.indexOf(difficultySelect.value as Difficulty),pace:menuPaces.indexOf(pace),adaptive:adaptiveInput.checked,reduced:preferences.get().reduced,seconds:roundSeconds}),
  change(value){
    const reload=packSelect.value!==value.basket||difficultySelect.value!==menuLevels[value.level]||selectedMode()!==(value.mode==='Arcade'?'arcade':value.mode==='Beat Kitchen'?'beat':'practice');
    packSelect.value=value.basket;difficultySelect.value=menuLevels[value.level];adaptiveInput.checked=value.adaptive;saveChallenge();
    modeChoice.querySelector<HTMLInputElement>(`[value="${value.mode==='Arcade'?'arcade':value.mode==='Beat Kitchen'?'beat':'practice'}"]`)!.checked=true;updateModeNote();
    if(validRoundSeconds(value.seconds))roundSeconds=value.seconds;
    if(pace!==menuPaces[value.pace]){paceSelects[0].value=menuPaces[value.pace];paceSelects[0].dispatchEvent(new Event('change'));}
    if(settings.reduced!==value.reduced){preferences.update({reduced:value.reduced});applySettings();}
    if(reload){updatePackChoice();menu?.loading('Preparing your snacks…',true);}
  },
  play:()=>beginRound(),next:()=>beginRound('next'),training:()=>learningUI.open('lessons'),settings:()=>{pauseOptions.hidden=false;settingsUI.open();},
  sentence:()=>{menu?.hide();void audio.unlock();sentenceUI?.open();},
  sentenceReady:()=>sentenceUI?.hasPassage()??false,
  locker(dialog){
    const total=progressStore.get().foods;
    refreshThemeUnlocks(total);
    dialog.querySelector('#dialog-title')!.textContent='Your arcade locker.';
    dialog.querySelector('#dialog-copy')!.textContent='Your favorite looks and practice records live here.';
    const detail=dialog.querySelector('#dialog-detail')!;
    detail.innerHTML=`<div class="locker-stats"><div><strong>${total}</strong><span>FOODS SLICED</span></div><div><strong>${sentenceProgress.records().length}</strong><span>SENTENCE SESSIONS</span></div></div><p class="locker-label">CHOOSE A KITCHEN LOOK</p><div class="locker-looks"></div><div class="locker-links"><button type="button" id="locker-notebook">My practice & bests →</button><a href="./assets.html?pack=mixed" target="_blank" rel="noopener">Meet all 50 foods ↗</a></div>`;
    const looks=detail.querySelector('.locker-looks')!;
    for(const option of themeSelect.options){const theme=THEMES[option.value as Theme];const button=document.createElement('button');button.className='locker-look';button.type='button';button.disabled=option.disabled;button.setAttribute('aria-pressed',String(themeSelect.value===option.value));button.innerHTML=`<span class="locker-swatch swatch-${option.value}" aria-hidden="true">✦</span><span><b>${theme.title}</b><small>${option.disabled?`${Math.max(0,theme.unlock-total)} more slices`:'Ready to use'}</small></span>`;button.addEventListener('click',()=>{themeSelect.value=option.value;saveChallenge();looks.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});looks.append(button);}
    detail.querySelector('#locker-notebook')!.addEventListener('click',()=>{dialog.close();learningUI.open('progress');});
  }
});
sentenceUI=createSentenceUI({home:()=>menu?.home(),reduced:()=>preferences.get().reduced,sound:()=>audio.slice(),progress:sentenceProgress,
  quality:()=>preferences.get().quality,theme:()=>themeSelect.value,muted:()=>preferences.get().muted,settings:()=>{pauseOptions.hidden=true;settingsUI.open();},
  toggleMute:()=>{preferences.update({muted:!preferences.get().muted});applySettings();void audio.unlock();},
  setReduced:value=>{preferences.update({reduced:value});applySettings();},letter:index=>audio.letter(index),serve:()=>audio.serve(),stopSound:()=>audio.stop()});
menu.loading(assetsReady?'':'Preparing your snacks…',!assetsReady);
// The old controls remain the single source of game preferences, outside the visible menu.
startScreen.hidden=true;resultsScreen.hidden=true;
document.querySelector('.brand')!.addEventListener('click',()=>{if(!running)menu?.home();});
requestAnimationFrame(animate);
learningUI.firstVisit();
