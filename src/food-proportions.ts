import type { FoodKind } from './food-catalog';

// Relative longest dimensions, gently compressed for typing-game readability.
// A berry stays small; a melon remains a large whole fruit. Stems are included.
export const FOOD_SIZE = {
  apple:1.35,banana:1.85,carrot:1.9,cookie:1.05,corn:1.85,grape:1.4,kiwi:1.0,pear:1.55,
  lime:.8,plum:.82,mango:1.5,peach:1.15,orange:1.25,donut:1.3,
  egg:.95,pie:2.0,muffin:1.25,waffle:1.65,pretzel:1.45,popcorn:1.75,
  avocado:1.5,broccoli:1.8,sandwich:1.75,pineapple:2.35,strawberry:.72,watermelon:2.55,
  tomato:1.2,cucumber:1.95,pepper:1.4,radish:.9,beet:1.2,mushroom:.85,zucchini:1.95,onion:1.15,
  lemon:1.05,raspberry:.44,blueberry:.34,cherry:.62,fig:.88,pomegranate:1.45,dragonfruit:1.6,apricot:.78,
  bread:1.95,cheese:1.35,bagel:1.3,croissant:1.65,tofu:1.25,potato:1.2,pumpkin:2.25,celery:2.05,
} satisfies Record<FoodKind,number>;
export const KITCHEN_FOOD_SCALE = .72;
