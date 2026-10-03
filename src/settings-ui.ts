import type { createPreferences } from './preferences';
import type { createAudio } from './audio';

export function createSettingsUI(store: ReturnType<typeof createPreferences>, audio: ReturnType<typeof createAudio>, changed: () => void) {
  const dialog = document.createElement('dialog'); dialog.className = 'learning-dialog settings-dialog';
  dialog.setAttribute('aria-labelledby', 'settings-title'); document.body.append(dialog);
  dialog.innerHTML = `<header class="learning-heading"><div><p class="eyebrow">MAKE YOURSELF AT HOME</p><h2 id="settings-title">Sound & feel</h2></div><button class="quiet-button" id="settings-close" aria-label="Close settings">✕</button></header>
    <p class="learning-intro">A comfortable kitchen makes better practice.</p>
    <div class="settings-fields">
      <label for="music-volume">Music <output id="music-value" aria-hidden="true"></output><input id="music-volume" aria-label="Music volume" type="range" min="0" max="100" step="1"></label>
      <label for="effects-volume">Slice & key sounds <output id="effects-value" aria-hidden="true"></output><input id="effects-volume" aria-label="Effects volume" type="range" min="0" max="100" step="1"></label>
      <label class="check-setting"><input id="mute-all" type="checkbox"> Mute all sound</label>
      <label class="check-setting"><input id="reduce-effects" type="checkbox"> Reduced motion & effects</label>
      <p class="learning-muted">Gentler cuts, no sparks or flashes, and steady food. Your word labels and finger guide always stay still.</p>
      <label class="check-setting"><input id="screen-shake" type="checkbox"> A tiny camera nudge on slices</label>
      <label for="graphics-quality">Graphics<select id="graphics-quality" aria-label="Graphics" class="pace-select"><option value="auto">Balanced</option><option value="low">Battery saver · 30 frames/sec</option><option value="high">Crisp · high resolution</option></select></label>
    </div><div id="rhythm-settings"></div>
    <div class="learning-actions"><button id="preview-audio" class="quiet-button">Test sound</button><button id="settings-done" class="play-button">All set</button></div>
    <p id="settings-status" class="learning-muted" role="status"></p>`;
  function sync() {
    const p = store.get();
    for (const key of ['music', 'effects'] as const) {
      dialog.querySelector<HTMLInputElement>(`#${key}-volume`)!.value = String(p[key] * 100);
      dialog.querySelector(`#${key}-value`)!.textContent = `${Math.round(p[key] * 100)}%`;
    }
    dialog.querySelector<HTMLInputElement>('#mute-all')!.checked = p.muted;
    dialog.querySelector<HTMLInputElement>('#reduce-effects')!.checked = p.reduced;
    const shake = dialog.querySelector<HTMLInputElement>('#screen-shake')!; shake.checked = p.shake; shake.disabled = p.reduced;
    dialog.querySelector<HTMLSelectElement>('#graphics-quality')!.value = p.quality;
    dialog.querySelector('#settings-status')!.textContent = store.saved() ? 'Settings saved on this browser.' : 'Settings last for this visit; browser storage is unavailable.';
  }
  for (const key of ['music', 'effects'] as const) dialog.querySelector(`#${key}-volume`)!.addEventListener('input', event => {
    store.update({ [key]: Number((event.target as HTMLInputElement).value) / 100 }); changed(); sync();
  });
  for (const [id, key] of [['mute-all', 'muted'], ['reduce-effects', 'reduced'], ['screen-shake', 'shake']] as const) dialog.querySelector(`#${id}`)!.addEventListener('change', event => {
    store.update({ [key]: (event.target as HTMLInputElement).checked }); changed(); sync();
  });
  dialog.querySelector('#graphics-quality')!.addEventListener('change', event => {
    store.update({ quality: (event.target as HTMLSelectElement).value as 'auto' | 'low' | 'high' }); changed(); sync();
  });
  dialog.querySelector('#preview-audio')!.addEventListener('click', async () => {
    const available = await audio.preview(); audio.slice();
    dialog.querySelector('#settings-status')!.textContent = !available ? 'Sound is unavailable here. Visual play still works.' : store.get().muted ? 'Sound is muted. Uncheck Mute all sound to listen.' : 'A taste of the kitchen soundtrack.';
  });
  dialog.querySelector('#settings-close')!.addEventListener('click', () => dialog.close());
  dialog.querySelector('#settings-done')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => audio.stop());
  return { dialog, isOpen: () => dialog.open, open() { sync(); dialog.showModal(); } };
}
