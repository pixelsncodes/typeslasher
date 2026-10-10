// Review only: real game assets, illustrative cooking, no production changes.
import { createSentenceScene } from '../../src/sentence-scene';
import { planOrders, type KitchenOrder } from '../../src/restaurant-orders';
import type { RecipeId } from '../../src/kitchen-recipes';

type PreviewStory = { id:string; recipe:RecipeId; pages:{text:string}[] };
const host = document.querySelector<HTMLElement>('.kitchen')!;
const scene = createSentenceScene(host,{reduced:()=>true,quality:()=> 'high'});
let generation=0, settle:ReturnType<typeof setTimeout>, loadedStory='';
let orders:KitchenOrder[]=[];
async function update(story:PreviewStory,index:number) {
  const ticket=++generation;
  scene.setActive(false);
  clearTimeout(settle);
  if (loadedStory!==story.id) {
    orders=planOrders(story.pages.map(p=>p.text),story.recipe);
    await scene.prepare(orders);
    if (ticket!==generation) return;
    loadedStory=story.id;
  }
  if (ticket!==generation) return;
  scene.beginOrder(orders[index]);
  host.querySelector('.kitchen-sign span')!.textContent='YOUR WORDS KEEP THE CHEF COOKING';
  host.querySelector('.kitchen-tickets span b')!.textContent=String(index+1).padStart(2,'0');
  scene.update({ordinal:orders[index].cutOrdinals[0]-1,progress:.12,served:index,total:orders.length,multiplier:1,error:false});
  document.querySelectorAll<HTMLElement>('.order').forEach((card,offset)=>{
    const order=orders[index+offset];card.hidden=!order;
    if(!order)return;
    const image=card.querySelector<HTMLImageElement>('img')!;
    image.src=`../../public/assets/recipes/${order.recipe}.webp`;image.alt=order.title;
    card.querySelector('b')!.textContent=order.title;
  });
  scene.setActive(true);settle=setTimeout(()=>{
    // Reduced-motion scenes do not redraw idle frames. Refresh the settled
    // arrival once so the ingredient rests on the board before pausing.
    scene.setActive(true);scene.setActive(false);
  },1100);
}
document.addEventListener('preview-page',event=>{const {story,index}=(event as CustomEvent<{story:PreviewStory;index:number}>).detail;void update(story,index);});
window.addEventListener('pagehide',()=>{++generation;clearTimeout(settle);scene.setActive(false);});
