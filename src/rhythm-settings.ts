import type { createPreferences } from './preferences';
import type { createAudio } from './audio';
import { BEAT_MS, beatError, calibrationOffset } from './rhythm';

export function addRhythmSettings(dialog: HTMLDialogElement, store: ReturnType<typeof createPreferences>, audio: ReturnType<typeof createAudio>, changed: () => void) {
  const panel = dialog.querySelector('#rhythm-settings')!;
  panel.innerHTML = `<details class="rhythm-calibration"><summary>Beat Kitchen timing</summary>
    <p class="learning-muted">If the beat feels late through your headphones, match the game to what you hear. Use wired headphones or speakers for the steadiest timing.</p>
    <label for="beat-offset">Beat timing <output id="beat-offset-value"></output></label><input id="beat-offset" aria-label="Beat timing offset" type="range" min="-200" max="200" step="5">
    <p class="learning-muted">Positive values move the beat cue and bonus window later. Changes apply when you start your next round. Ordinary Arcade is unaffected.</p>
    <div class="learning-actions"><button id="calibrate-beat" class="quiet-button">Match my taps</button><button id="reset-beat" class="quiet-button">Reset timing</button></div>
    <p id="calibration-status" class="learning-muted" role="status">Optional: listen to four clicks, then tap Space on eight beats.</p></details>`;
  const slider = panel.querySelector<HTMLInputElement>('#beat-offset')!;
  const output = panel.querySelector('#beat-offset-value')!;
  const status = panel.querySelector('#calibration-status')!;
  const button = panel.querySelector<HTMLButtonElement>('#calibrate-beat')!;
  let start: number | undefined; let taps: number[] = []; let previousBeat = -1; let timeout = 0; let generation = 0;
  function sync() { slider.value = String(store.get().beatOffset); output.textContent = `${store.get().beatOffset > 0 ? '+' : ''}${store.get().beatOffset} ms`; }
  function cancel() { generation++;start=undefined;clearTimeout(timeout);audio.stop();button.textContent='Match my taps'; }
  function save(offset: number) { store.update({beatOffset:offset});changed();sync(); }
  slider.addEventListener('input', () => { cancel(); save(Number(slider.value)); });
  panel.querySelector('#reset-beat')!.addEventListener('click', () => { cancel();save(0);status.textContent='Timing reset. The visible pulse and sound share the same beat.'; });
  button.addEventListener('click', async () => {
    if (start !== undefined) {cancel();status.textContent='Timing practice stopped. Your previous setting is safe.';return;}
    if (store.get().muted || store.get().music === 0) {status.textContent='Unmute sound and raise Music volume before matching your taps.';return;}
    const request=++generation;
    const ready=await audio.unlock();
    if(request!==generation || !dialog.open)return;
    if (!ready) {status.textContent='Audio is unavailable. Keep the default timing and follow the visible pulse.';return;}
    audio.stop();start=audio.time()+.6;taps=[];previousBeat=-1;button.textContent='Stop matching';
    for(let i=0;i<28;i++)audio.calibrationBeat(start+i*.5,i%4===0);
    status.textContent='Listen to four clicks. Then tap Space on eight beats. Keep this window open.';
    // Space should tap, not activate the button.
    (document.activeElement as HTMLElement | null)?.blur();dialog.focus();
    timeout=window.setTimeout(()=>{cancel();status.textContent='No timing saved. Try again and tap Space with each beat.';},15000);
  });
  window.addEventListener('keydown', event => {
    if(!dialog.open || start===undefined || event.code!=='Space' || event.repeat || event.ctrlKey || event.altKey || event.metaKey)return;
    event.preventDefault();event.stopImmediatePropagation();
    const elapsed=(audio.time()-start)*1000;
    if(elapsed<3.5*BEAT_MS){status.textContent='Listen for the first four clicks, then join in.';return;}
    const beat=Math.round(elapsed/BEAT_MS);if(beat===previousBeat)return;
    const error=beatError(elapsed);if(Math.abs(error)>200){status.textContent='Try tapping closer to the click.';return;}
    previousBeat=beat;taps.push(error);status.textContent=`${taps.length} of 8 taps. Stay with the click.`;
    if(taps.length===8){const offset=calibrationOffset(taps);cancel();if(offset===undefined){status.textContent='Those taps varied a little. Try once more; your previous timing is unchanged.';}else{save(Math.round(offset/5)*5);status.textContent='Timing matched! It includes your listening and tapping delay. Fine-tune the slider if needed.';}}
  },true);
  dialog.addEventListener('close',cancel);
  dialog.addEventListener('input', event=>{if(start!==undefined && event.target!==slider){cancel();status.textContent='Sound changed. Match your taps again when ready.';}});
  dialog.querySelector('#preview-audio')!.addEventListener('click',()=>{if(start!==undefined)cancel();},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && start!==undefined){cancel();status.textContent='Matching paused when you left. Try again when ready.';}});
  sync();
}
