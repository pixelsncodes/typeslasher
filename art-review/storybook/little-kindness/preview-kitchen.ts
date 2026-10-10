// Design-review scene only. The published game and story mechanics are unchanged.
import { createSentenceScene } from '../../../src/sentence-scene';
import { planOrders } from '../../../src/restaurant-orders';

const host = document.querySelector<HTMLElement>('.kitchen')!;
const scene = createSentenceScene(host, { reduced: () => true, quality: () => 'high' });
const sentence = 'Rain tapped on a tiny yellow umbrella.';
const order = planOrders([sentence], 'soup')[0];
let page = (Number(location.hash.split('-').pop()) || 1) - 1;
function updateTickets() {
  host.querySelector('.kitchen-tickets span b')!.textContent = String(page + 1).padStart(2, '0');
  scene.update({ ordinal: 0, progress: .12, served: page, total: 5, multiplier: 1, error: false });
}
document.addEventListener('preview-page', (event) => {
  page = (event as CustomEvent<number>).detail;
  updateTickets();
});
await scene.prepare([order]);
scene.beginOrder(order);
host.querySelector('.kitchen-sign span')!.textContent = 'YOUR WORDS KEEP THE CHEF COOKING';
updateTickets();
scene.setActive(true);
// Settle the ingredient arrival, then leave the preview quiet for layout review.
setTimeout(() => scene.setActive(false), 1100);
window.addEventListener('pagehide', () => scene.setActive(false));
