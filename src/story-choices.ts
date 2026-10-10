import type { RecipeId } from './kitchen-recipes';
import { RESTAURANT_MENU } from './restaurant-orders';

export type StoryChoice = { id: string; title: string; image: string; text: string; recipe: RecipeId; rush?: boolean };
export const STORY_CHOICES: readonly StoryChoice[] = [
  { id:'restaurant', title:'Restaurant shift', image:'stories/restaurant-shift.webp', text:RESTAURANT_MENU.map(order=>order.sentence).join(' '), recipe:'fruit', rush:true },
  { id:'fruit-adventure', title:'Fruit adventure', image:'stories/fruit-adventure.webp', recipe:'fruit', text:'A tiny rat wore an oversized chef hat. He carried a basket of fruit into his kitchen. He mixed pears and oranges in a mint bowl. With a sprinkle of mango, lunch was ready to share.' },
  { id:'space-mission', title:'Space mission', image:'stories/space-mission.webp', recipe:'fruit', text:'Our spaceship landed beside a purple moon. A friendly robot offered us a map. We followed the glowing stars home.' },
  { id:'funny-day', title:'Funny day', image:'stories/funny-day.webp', recipe:'fruit', text:'I opened my backpack and found a squeaky rubber duck. It had eaten my homework. The teacher laughed so hard she gave the duck a gold star.' },
  { id:'little-kindness', title:'Little kindness', image:'stories/little-kindness.webp', recipe:'soup', text:'Rain tapped on a tiny yellow umbrella. Bunny spotted a mouse with very soggy whiskers. She lifted her umbrella and made room for her new friend. They splashed through the puddles together. A little kindness made the rainy day feel warm.' },
  { id:'helping-paws', title:'Helping paws', image:'stories/helping-paws.webp', recipe:'orchard', text:'A little hedgehog spilled his basket of apples. Bear put down her picnic and hurried over to help. They gathered every apple with their tiny paws. Hedgehog saved the sweetest one for his new friend. Together they turned a small tumble into a happy picnic.' },
];
