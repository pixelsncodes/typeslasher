export type Preferences = {
  music: number; effects: number; muted: boolean;
  reduced: boolean; shake: boolean; quality: 'auto' | 'low' | 'high';
  beatOffset: number;
};
export function defaultPreferences(reduced = false): Preferences {
  return { music: .22, effects: .65, muted: false, reduced, shake: false, quality: 'auto', beatOffset: 0 };
}
export function parsePreferences(raw: string | null, reduced = false): Preferences {
  const defaults = defaultPreferences(reduced);
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || value.version !== 1) return defaults;
    for (const key of ['music', 'effects'] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key])) defaults[key] = Math.max(0, Math.min(1, value[key]));
    for (const key of ['muted', 'reduced', 'shake'] as const) if (typeof value[key] === 'boolean') defaults[key] = value[key];
    if (['auto', 'low', 'high'].includes(value.quality)) defaults.quality = value.quality;
    if (typeof value.beatOffset === 'number' && Number.isFinite(value.beatOffset)) defaults.beatOffset = Math.max(-200, Math.min(200, value.beatOffset));
  } catch { /* Defaults keep the game playable with damaged settings. */ }
  return defaults;
}
export function createPreferences(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined, reduced = false) {
  let value = defaultPreferences(reduced);
  let saved = !!storage;
  try { value = parsePreferences(storage?.getItem('typeslasher-settings-v1') ?? null, reduced); } catch { saved = false; }
  return {
    get: () => ({ ...value }), saved: () => saved,
    update(patch: Partial<Preferences>) {
      value = parsePreferences(JSON.stringify({ ...value, ...patch, version: 1 }), reduced);
      try { if (!storage) throw Error(); storage.setItem('typeslasher-settings-v1', JSON.stringify({ ...value, version: 1 })); saved = true; } catch { saved = false; }
      return { ...value };
    },
  };
}
