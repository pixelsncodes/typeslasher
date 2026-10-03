import './styles.css';

import('./main').catch((error: unknown) => {
  console.error('Typeslasher could not start', error);
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) return;
  if (/webgl|graphics|context/i.test(String(error))) {
    root.innerHTML = '<section class="startup-error"><h1>Sentence Slash is ready.</h1><p>Food graphics are unavailable here, but you can still type your own passage.</p><button id="fallback-sentence" class="play-button">Open Sentence Slash</button></section>';
    void import('./sentence-ui').then(async ({createSentenceUI})=>{
      const {createSentenceProgress}=await import('./sentence-progress');
      let storage:Storage|undefined;try{storage=localStorage;}catch{/* Optional. */}
      const {createPreferences}=await import('./preferences');
      const {createAudio}=await import('./audio');
      const {createSettingsUI}=await import('./settings-ui');
      const prefs=createPreferences(storage,matchMedia('(prefers-reduced-motion: reduce)').matches);
      const audio=createAudio(prefs.get());
      const settings=createSettingsUI(prefs,audio,()=>audio.configure(prefs.get()));
      const sentence=createSentenceUI({home:()=>{root.hidden=false;root.inert=false;},reduced:()=>prefs.get().reduced,sound:()=>{},progress:createSentenceProgress(storage),settings:()=>settings.open()});
      document.querySelector('#fallback-sentence')!.addEventListener('click',()=>{root.hidden=true;sentence.open();});
    });
    return;
  }
  root.innerHTML = '<section class="startup-error"><p class="eyebrow">THE KITCHEN NEEDS A MOMENT</p><h1>Let’s try again.</h1><p>Typeslasher needs a browser with 3D graphics enabled. Try reloading, or open it in a current Chrome, Edge, or Firefox window.</p><button class="play-button" id="reload-game">Reload game</button><p class="learning-muted">Your saved progress stays on this browser.</p></section>';
  document.querySelector('#reload-game')!.addEventListener('click', () => location.reload());
});
