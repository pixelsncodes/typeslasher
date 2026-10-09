import { RECIPES, type RecipeId } from './kitchen-recipes';
import type { FoodKind } from './food-catalog';

export const RESTAURANT_MENU: { recipe: RecipeId; sentence: string }[] = [
  { recipe:'fruit', sentence:'Slice the apple, kiwi, pear, orange, mango and grapes, then serve a colorful fruit salad.' },
  { recipe:'salad', sentence:'Chop tomato, cucumber, yellow pepper, radish, avocado and carrot, then add lemon to our garden salad.' },
  { recipe:'soup', sentence:'Chop pumpkin, onion, potato, carrot and celery, then serve a warm bowl of pumpkin soup.' },
  { recipe:'citrus', sentence:'Mix orange, lemon, mango, pineapple, lime, dragon fruit and kiwi for a bright tropical bowl.' },
  { recipe:'vegetables', sentence:'Cut potato, beet, onion, zucchini, mushroom and broccoli, then plate the roasted vegetables.' },
  { recipe:'berries', sentence:'Slice strawberry, raspberry, blueberry and cherry, then add pomegranate to our berry bowl.' },
  { recipe:'tofu', sentence:'Cut tofu, cucumber, pepper, carrot and radish, then squeeze lime over our crunchy tofu salad.' },
  { recipe:'orchard', sentence:'Slice apple, pear, peach, plum, apricot, cherry and fig, then serve a sweet orchard bowl.' },
  { recipe:'picnic', sentence:'Slice bread, cheese, tomato, cucumber and apple, then arrange a fresh picnic plate.' },
  { recipe:'breakfast', sentence:'Plate bagel, croissant, cheese, fig, apricot and blueberry for a cheerful bakery breakfast.' },
];

export type KitchenOrder = {
  index: number; recipe: RecipeId; title: string; sentence: string;
  ingredients: readonly FoodKind[]; cutOrdinals: readonly number[];
};

export function planOrders(sentences: readonly string[], fallback: RecipeId): KitchenOrder[] {
  let ordinal = 0;
  const recipes=Object.keys(RECIPES) as RecipeId[];
  const start=recipes.indexOf(fallback);
  const menu=[...recipes.slice(start),...recipes.slice(0,start)];
  let available=[...menu],previous:RecipeId|undefined;
  return sentences.map((sentence, index) => {
    // Stories and custom passages get a varied menu, too. Explicit restaurant
    // sentences keep their dish when it has not already appeared in this deck.
    // Long passages exhaust all ten cards before replenishing the menu.
    if(!available.length)available=[...menu];
    const preferred=RESTAURANT_MENU.find(item=>item.sentence===sentence)?.recipe;
    const recipe=preferred&&available.includes(preferred)&&preferred!==previous
      ?preferred:available.find(id=>id!==previous)!;
    available.splice(available.indexOf(recipe),1);previous=recipe;
    const words = [...sentence.matchAll(/\S+/g)].length;
    // The fruit menu is a six-item batch; other recipes keep their complete ingredient list.
    const ingredients = Object.freeze(RECIPES[recipe].items.slice(0, recipe === 'fruit' ? 6 : undefined));
    const cutOrdinals = Object.freeze(ingredients.map((_, i) => ordinal + Math.ceil((i + 1) * words / ingredients.length) - 1));
    ordinal += words;
    return { index, recipe, title:RECIPES[recipe].title, sentence, ingredients, cutOrdinals };
  });
}

/** Finite order inventory shared by the scene and lifecycle checks. Slots never reorder. */
export class IngredientBatch {
  readonly ingredients: readonly FoodKind[];
  private waiting = new Set<number>();
  private moving = new Set<number>();
  private plated = new Set<number>();
  board: number | undefined;
  discarded = false;
  constructor(ingredients: readonly FoodKind[]) {
    this.ingredients = Object.freeze([...ingredients]);
    ingredients.forEach((_, index) => this.waiting.add(index));
  }
  get basket() { return [...this.waiting]; }
  get bowl() { return [...this.plated]; }
  get complete() { return !this.discarded && this.plated.size === this.ingredients.length; }
  take(index: number) {
    if (this.discarded || this.board !== undefined || this.moving.size || index !== this.basket[0]) return false;
    this.waiting.delete(index); this.board = index; return true;
  }
  cut(index: number) {
    if (this.discarded || this.board !== index) return false;
    this.board = undefined; this.moving.add(index); return true;
  }
  settle(index: number) {
    if (!this.moving.delete(index) || this.discarded) return false;
    this.plated.add(index); return true;
  }
  clear() {
    this.discarded = true; this.waiting.clear(); this.moving.clear(); this.plated.clear(); this.board = undefined;
  }
}
