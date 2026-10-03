import type { Preferences } from './preferences';

// Original pentatonic kitchen loop. Audio follows the active-play clock;
// scheduled voices are cancelled on pause, so no hidden beat keeps running.
const MELODY = [72, 0, 76, 79, 0, 76, 74, 0, 69, 0, 72, 76, 0, 74, 72, 0,
  65, 0, 69, 72, 0, 76, 74, 0, 67, 0, 71, 74, 79, 0, 74, 0];
const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12);
export function createAudio(initial: Preferences) {
  let settings = initial;
  let ctx: AudioContext | undefined;
  let music: GainNode | undefined;
  let effects: GainNode | undefined;
  let noise: AudioBuffer | undefined;
  let anchor: number | undefined;
  let nextStep = 0;
  let previewUntil = 0;
  const voices = new Set<AudioScheduledSourceNode>();
  function volumes() {
    if (!ctx) return;
    music!.gain.setTargetAtTime(settings.muted ? 0 : settings.music, ctx.currentTime, .015);
    effects!.gain.setTargetAtTime(settings.muted ? 0 : settings.effects, ctx.currentTime, .015);
  }
  async function unlock() {
    try {
      if (!ctx) {
        ctx = new AudioContext(); music = ctx.createGain(); effects = ctx.createGain();
        music.connect(ctx.destination); effects.connect(ctx.destination);
        noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .23), ctx.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        volumes();
      }
      if (ctx.state === 'suspended') await ctx.resume();
      return ctx.state === 'running';
    } catch { return false; }
  }
  function track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    voices.add(source);
    source.onended = () => { voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  }
  function tone(note: number, at: number, duration: number, level: number, bus: GainNode, type: OscillatorType = 'sine', endNote?: number) {
    if (!ctx || ctx.state !== 'running' || settings.muted) return;
    const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency(note), at);
    if (endNote !== undefined) oscillator.frequency.exponentialRampToValueAtTime(frequency(endNote), at + duration);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(level, at + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain).connect(bus); track(oscillator, [gain]);
    oscillator.start(at); oscillator.stop(at + duration + .01);
  }
  function stop() {
    for (const voice of voices) { try { voice.stop(); } catch { /* Already ended. */ } }
    voices.clear(); anchor = undefined; previewUntil = 0;
  }
  function step(index: number, at: number, beatOnly = false) {
    if (!ctx || !music || settings.music === 0) return;
    if (index % 2 === 0) tone(index % 8 === 0 ? 88 : 81, at, .055, .07, music);
    if (beatOnly) return;
    const note = MELODY[index % MELODY.length];
    if (note) tone(note, at, .24, .095, music, 'triangle');
    if (index % 4 === 0) tone([48, 45, 41, 43][Math.floor(index / 8) % 4], at, .32, .16, music);
  }
  return {
    unlock, stop,
    configure(next: Preferences) { settings = next; volumes(); if (next.muted) stop(); },
    update(elapsed: number, active: boolean) {
      if (!ctx || ctx.state !== 'running' || settings.muted) return;
      if (!active) { if (anchor !== undefined) stop(); return; }
      // Skip a missed scheduling window instead of playing a burst of late notes.
      const desiredAnchor = ctx.currentTime - elapsed / 1000;
      if (anchor === undefined || Math.abs(anchor - desiredAnchor) > .08) {
        stop(); anchor = desiredAnchor; nextStep = Math.ceil(elapsed / 250);
      }
      while (anchor + nextStep * .25 < ctx.currentTime + .12) {
        const at = anchor + nextStep * .25;
        if (at >= ctx.currentTime - .015) step(nextStep, Math.max(ctx.currentTime, at));
        nextStep++;
      }
    },
    async preview() {
      if (!(await unlock())) return false;
      stop(); previewUntil = ctx!.currentTime + 2;
      for (let i = 0; i < 8; i++) step(i, ctx!.currentTime + .04 + i * .25);
      return true;
    },
    // A steady calibration click uses the music bus and the same synthesis.
    calibrationBeat(atSeconds: number, strong: boolean) { if (music) tone(strong ? 88 : 81, atSeconds, .055, .2, music); },
    time: () => ctx?.currentTime ?? 0,
    latency: () => ((ctx?.baseLatency ?? 0) + (ctx?.outputLatency ?? 0)) * 1000,
    get previewing() { return !!ctx && ctx.currentTime < previewUntil; },
    letter(index: number) { if (ctx && effects && settings.effects) tone([72, 74, 76, 79, 81][index % 5], ctx.currentTime, .045, .018, effects); },
    miss() { if (ctx && effects && settings.effects) tone(55, ctx.currentTime, .2, .10, effects, 'triangle', 43); },
    serve() { if(ctx&&effects&&settings.effects){for(const [i,note] of [76,79,84].entries())tone(note,ctx.currentTime+i*.07,.22,.06,effects);} },
    slice(onBeat = false) {
      if (!ctx || !effects || ctx.state !== 'running' || settings.muted || settings.effects === 0) return;
      const at = ctx.currentTime;
      const source = ctx.createBufferSource(); source.buffer = noise!;
      const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = .65;
      filter.frequency.setValueAtTime(3800, at); filter.frequency.exponentialRampToValueAtTime(500, at + .22);
      const gain = ctx.createGain(); gain.gain.setValueAtTime(.001, at);
      gain.gain.linearRampToValueAtTime(.22, at + .025); gain.gain.exponentialRampToValueAtTime(.001, at + .22);
      source.connect(filter).connect(gain).connect(effects); track(source, [filter, gain]); source.start(); source.stop(at + .23);
      tone(onBeat ? 84 : 79, at, .15, .08, effects);
    },
  };
}
