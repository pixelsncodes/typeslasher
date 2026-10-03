import * as THREE from 'three';
import { FOOD_KINDS, foodModel, loadFoodAssets, lightFoodScene } from './food-assets';
import { FOOD_CATALOG, FOOD_PACKS, selectionTitle, foodsForSelection, packsForSelection, validSelection, type PackId } from './food-catalog';

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector<HTMLCanvasElement>('#studio')!, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const grid = document.querySelector<HTMLElement>('#grid')!;
const requestedFood = new URLSearchParams(location.search).get('food');
const focusedFood = FOOD_KINDS.find(kind => kind === requestedFood);
const requestedPack = new URLSearchParams(location.search).get('pack');
const selection=validSelection(requestedPack)?requestedPack:'starter';
const reviewKinds = focusedFood ? [focusedFood] : foodsForSelection(selection).map(food=>food.kind);
const packs=focusedFood?[FOOD_CATALOG.find(food=>food.kind===focusedFood)!.pack]:packsForSelection(selection);
const basket=document.createElement('label');basket.className='studio-basket';
basket.innerHTML=`Food basket <select aria-label="Food basket">${[...Object.keys(FOOD_PACKS) as PackId[],'mixed' as const].map(id=>`<option value="${id}" ${id===selection?'selected':''}>${selectionTitle(id)}</option>`).join('')}</select>`;
document.querySelector('nav')!.prepend(basket);
basket.querySelector('select')!.addEventListener('change',event=>{location.search='?pack='+(event.target as HTMLSelectElement).value;});
if (focusedFood) {
  grid.classList.add('focused');
  document.querySelector('h1')!.textContent = `${focusedFood === 'grape' ? 'Grapes' : focusedFood[0].toUpperCase() + focusedFood.slice(1)}, up close.`;
}
const scenes: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; mount: THREE.Group; whole: THREE.Group; halves: THREE.Group; view: HTMLElement }[] = [];
const status = document.querySelector<HTMLElement>('#status')!;
void loadFoodAssets(packs).then(() => {
  for (const kind of reviewKinds) {
    const card = document.createElement('section'); card.className = 'card';
    card.innerHTML = `<div class="viewport" aria-label="Rotate ${kind} model"></div><div class="caption"><b>${kind === 'grape' ? 'Grapes' : kind}</b><span>3D / DRAG TO ROTATE</span></div>`;
    grid.append(card);
    const view = card.querySelector<HTMLElement>('.viewport')!;
    const scene = new THREE.Scene(); lightFoodScene(renderer, scene);
    const mount = new THREE.Group(); scene.add(mount);
    const whole = foodModel(kind)!; mount.add(whole);
    const halves = new THREE.Group(); halves.visible = false;
    for (const direction of [-1, 1]) {
      const half = foodModel(kind, direction < 0 ? '_left' : '_right')!;
      half.position.x = direction * .8; half.rotation.y = direction * .8; halves.add(half);
    }
    mount.add(halves); mount.rotation.set(.12, -.2, 0);
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 30); camera.position.set(0, .15, 5.6); camera.lookAt(0, .1, 0);
    let drag: { x: number; y: number } | undefined;
    view.addEventListener('pointerdown', (event) => { drag = { x: event.clientX, y: event.clientY }; view.setPointerCapture(event.pointerId); });
    view.addEventListener('pointermove', (event) => { if (!drag) return; mount.rotation.y += (event.clientX - drag.x) * .012; mount.rotation.x += (event.clientY - drag.y) * .012; drag = { x: event.clientX, y: event.clientY }; });
    view.addEventListener('pointerup', () => { drag = undefined; });
    view.addEventListener('pointercancel', () => { drag = undefined; });
    view.addEventListener('wheel', (event) => { event.preventDefault(); camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * .006, 3.6, 8); }, { passive: false });
    scenes.push({ scene, camera, mount, whole, halves, view });
  }
  status.textContent = `${reviewKinds.length} ${focusedFood ? 'food' : 'snacks'} · Blender models loaded`;
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach((el) => el.setAttribute('aria-pressed', String(el === button)));
    const value = button.dataset.view;
    for (const { mount, whole, halves } of scenes) {
      whole.visible = value !== 'cut'; halves.visible = value === 'cut';
      mount.rotation.set(.12, value === 'back' ? Math.PI + .25 : value === 'side' ? Math.PI / 2 : -.2, 0);
    }
  }));
}).catch((error: unknown) => { status.textContent = 'Could not load the food pack. Please reload.'; console.error(error); });

function render() {
  requestAnimationFrame(render);
  if (renderer.domElement.width !== Math.floor(innerWidth * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(innerHeight * renderer.getPixelRatio())) renderer.setSize(innerWidth, innerHeight, false);
  renderer.setScissorTest(false); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.setScissorTest(true);
  for (const { scene, camera, view } of scenes) {
    const b = view.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) continue;
    camera.aspect = b.width / b.height; camera.updateProjectionMatrix();
    renderer.setViewport(b.left, innerHeight - b.bottom, b.width, b.height);
    renderer.setScissor(b.left, innerHeight - b.bottom, b.width, b.height); renderer.render(scene, camera);
  }
}
render();
