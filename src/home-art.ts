import * as THREE from 'three';
import { foodModel, loadFoodAssets, lightFoodScene } from './food-assets';
import type { FoodKind } from './food-catalog';
import './home-art.css';

type FloatingFood = {
  model: THREE.Group;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  offset: THREE.Vector2;
  phase: number;
};

/** The logo uses the same whole/cut models as the game, with independent floating pieces. */
export function createHomeArtwork(stage: HTMLElement, initiallyReduced: boolean) {
  const canvas = stage.querySelector<HTMLCanvasElement>('canvas')!;
  const caption = stage.querySelector<HTMLElement>('#scene-status')!;
  const decorations = [...stage.querySelectorAll<HTMLElement>('[data-float]')].map(element => ({
    element, x: 0, y: 0, offset: new THREE.Vector2(), phase: Number(element.dataset.float),
  }));
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = initiallyReduced;
  let active = true;
  let renderer: THREE.WebGLRenderer | undefined;
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let frame = 0;
  let lastDraw = 0;
  let previousTime = 0;
  let elapsed = 0;
  let loading = false;
  let ready = false;
  let bounds = stage.getBoundingClientRect();
  let worldHeight = 9;
  const foods: FloatingFood[] = [];
  const pointer = new THREE.Vector2();
  let pointerNear = false;
  const calm = () => reduced || systemMotion.matches;

  function measure() {
    bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    worldHeight = 10 * bounds.height / bounds.width;
    if (renderer) {
      renderer.setSize(bounds.width, bounds.height, false);
      camera.left = -5; camera.right = 5;
      camera.top = worldHeight / 2; camera.bottom = -worldHeight / 2;
      camera.updateProjectionMatrix();
    }
    for (const item of decorations) {
      const rect = item.element.getBoundingClientRect();
      item.x = ((rect.left + rect.width / 2 - bounds.left) / bounds.width - .5) * 10;
      item.y = (.5 - (rect.top + rect.height / 2 - bounds.top) / bounds.height) * worldHeight;
    }
  }

  function repulsion(x: number, y: number) {
    if (!pointerNear || calm()) return new THREE.Vector2();
    const dx = x - pointer.x, dy = y - pointer.y;
    const distance = Math.hypot(dx, dy);
    const strength = Math.max(0, 1 - distance / 2.4) ** 2;
    return new THREE.Vector2(dx / Math.max(.25, distance), dy / Math.max(.25, distance))
      .multiplyScalar(strength * .24)
      .addScaledVector(pointer, .009);
  }

  function pose(delta: number) {
    const still = calm();
    const smoothing = 1 - Math.exp(-delta * 7);
    for (const { model, position, rotation, offset, phase } of foods) {
      if (still) offset.set(0, 0);
      else offset.lerp(repulsion(position.x, position.y), smoothing);
      const wave = still ? 0 : Math.sin(elapsed * .85 + phase);
      model.position.copy(position);
      model.position.x += offset.x + (still ? 0 : Math.cos(elapsed * .55 + phase) * .025);
      model.position.y += offset.y + wave * .075;
      model.rotation.copy(rotation);
      if (!still) {
        model.rotation.y += Math.sin(elapsed * .6 + phase) * .035 + offset.x * .4;
        model.rotation.z += wave * .025 - offset.x * .2;
      }
    }
    for (const item of decorations) {
      if (still) item.offset.set(0, 0);
      else item.offset.lerp(repulsion(item.x, item.y), smoothing);
      const pixels = bounds.width / 10;
      const bob = still ? 0 : Math.sin(elapsed * .85 + item.phase) * .055;
      item.element.style.translate = `${item.offset.x * pixels}px ${-(item.offset.y + bob) * pixels}px`;
    }
    stage.dataset.motion = still ? 'still' : 'floating';
  }

  function draw() {
    if (renderer && ready) renderer.render(scene, camera);
  }

  function tick(time: number) {
    frame = 0;
    if (!active || document.hidden) return;
    if (time - lastDraw >= 1000 / 30) {
      const delta = previousTime ? Math.min(.1, (time - previousTime) / 1000) : 0;
      previousTime = time; lastDraw = time;
      if (!calm()) elapsed += delta;
      pose(delta); draw();
    }
    if (!calm()) frame = requestAnimationFrame(tick);
  }

  function start() {
    active = true;
    cancelAnimationFrame(frame);
    previousTime = 0; lastDraw = 0;
    measure(); pose(0); draw();
    if (!document.hidden && !calm()) frame = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    pointerNear = false;
    cancelAnimationFrame(frame); frame = 0;
  }

  function addFood(kind: FoodKind, part: '' | '_left' | '_right', x: number, y: number,
    scale: number, rx: number, ry: number, rz: number) {
    const source = foodModel(kind, part)!;
    // Center each half before posing, so it floats around its own center of mass.
    source.position.sub(new THREE.Box3().setFromObject(source).getCenter(new THREE.Vector3()));
    const model = new THREE.Group(); model.add(source);
    model.position.set(x, y, 0); model.scale.setScalar(scale); model.rotation.set(rx, ry, rz);
    scene.add(model);
    foods.push({ model, position: model.position.clone(), rotation: model.rotation.clone(),
      offset: new THREE.Vector2(), phase: foods.length * 1.7 });
  }

  async function load() {
    if (loading || ready) return;
    loading = true;
    caption.textContent = 'Packing the food…';
    try {
      if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-5, 5, 4.5, -4.5, .1, 60);
        camera.position.set(0, 0, 15);
        lightFoodScene(renderer, scene);
        renderer.toneMappingExposure = 1.05;
      }
      await loadFoodAssets(['starter']);
      addFood('apple', '_left', -1.05, 2.75, 1.03, -.12, -.68, -.22);
      addFood('apple', '_right', .72, 2.95, .92, .18, 1.14, -.36);
      addFood('grape', '', -3.45, -.25, 1.15, .08, -.25, -.2);
      addFood('kiwi', '_left', 3.35, 1.6, .94, .24, -.85, .36);
      addFood('kiwi', '_right', 3.75, .35, .8, -.22, 1.05, -.28);
      addFood('cookie', '_left', -.52, -2.9, 1.03, .18, -.4, -.28);
      addFood('cookie', '_right', .78, -3.22, 1.03, -.12, .25, -.38);
      addFood('pear', '_left', 3.7, -2.2, .88, .08, -.65, .34);
      addFood('pear', '_right', 2.65, -3.4, .73, .25, 1.05, .56);
      caption.textContent = '';
      ready = true;
      measure(); pose(0); draw();
      if (active) start();
    } catch {
      caption.innerHTML = 'Food preview could not load. <button type="button">Try again</button>';
      caption.querySelector('button')!.addEventListener('click', () => void load());
    } finally {
      loading = false;
    }
  }

  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || calm()) return;
    bounds = stage.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width - .5) * 10,
      (.5 - (event.clientY - bounds.top) / bounds.height) * worldHeight);
    pointerNear = true;
  }, { passive: true });
  const clearPointer = () => { pointerNear = false; };
  stage.addEventListener('pointerleave', clearPointer);
  stage.addEventListener('pointercancel', clearPointer);
  window.addEventListener('blur', clearPointer);
  new ResizeObserver(() => { if (active) { measure(); pose(0); draw(); } }).observe(stage);
  systemMotion.addEventListener('change', () => { if (active) start(); });
  document.addEventListener('visibilitychange', () => {
    clearPointer();
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else if (active) start();
  });
  start();
  void load();
  return {
    start, stop,
    setReduced(value: boolean) {
      if (reduced === value) return;
      reduced = value; clearPointer();
      if (active) start();
      else pose(0);
    },
  };
}
