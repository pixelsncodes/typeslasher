import type { FoodKind } from './food-catalog';

export const RECIPES = {
  fruit: { title: 'Fruit mix', items: ['apple','kiwi','pear','orange','mango','grape','plum','peach','strawberry','pineapple','watermelon','banana'] },
  citrus: { title: 'Citrus & tropical', items: ['orange','lemon','mango','pineapple','lime','dragonfruit','kiwi'] },
  orchard: { title: 'Orchard bowl', items: ['apple','pear','peach','plum','apricot','cherry','fig'] },
  salad: { title: 'Garden salad', items: ['tomato','cucumber','pepper','radish','avocado','carrot','lemon'] },
  vegetables: { title: 'Roasted vegetables', items: ['potato','beet','onion','zucchini','mushroom','broccoli'] },
  berries: { title: 'Berry bowl', items: ['strawberry','raspberry','blueberry','cherry','pomegranate'] },
  tofu: { title: 'Crunchy tofu salad', items: ['tofu','cucumber','pepper','carrot','radish','lime'] },
  soup: { title: 'Pumpkin soup', items: ['pumpkin','onion','potato','carrot','celery'] },
  picnic: { title: 'Picnic plate', items: ['bread','cheese','tomato','cucumber','apple'] },
  breakfast: { title: 'Bakery breakfast', items: ['bagel','croissant','cheese','fig','apricot','blueberry'] },
} satisfies Record<string, { title: string; items: FoodKind[] }>;
export type RecipeId = keyof typeof RECIPES;
export const RECIPE_STORIES = {
  salad: 'Slice the tomato and cucumber. Cut a yellow pepper, then add crisp radishes and creamy avocado. Grate the carrot and squeeze a lemon. Toss gently; our garden salad is ready!',
  tropical: 'Peel the orange and cut the mango. Add pineapple, dragon fruit, and bright green kiwi. A squeeze of lemon and lime makes the fruit taste fresh. Mix the colors together, then serve!',
  orchard: 'Wash the apple, pear, and peaches. Cut each fruit into small pieces. Add plums, apricots, cherries, and sweet figs. Remove the stones, then stir gently. Our orchard bowl is ready!',
  vegetables: 'Cut the potatoes, beets, and onion into little pieces. Add zucchini, mushrooms, and broccoli to the tray. Roast until tender and golden. Dinner smells delicious!',
  berries: 'Wash the strawberries, raspberries, and blueberries. Slice the cherries and remove their stones. Add ruby pomegranate seeds to the bowl. Stir softly, and taste the sweet summer colors!',
  tofu: 'Cut the tofu into little cubes. Slice cucumber, pepper, carrot, and radishes for a crunchy salad. Squeeze a lime over the bowl. Toss everything together, then share a fresh bite!',
  soup: 'Cut the pumpkin and scoop out its seeds. Chop an onion, a potato, a carrot, and a celery stalk. Simmer the vegetables until soft. Blend the soup carefully; lunch is warm and ready!',
  picnic: 'Slice the bread and cheese. Add tomatoes and cucumber to a picnic plate. Cut an apple for a sweet finish. Pack our lunch, find a shady tree, and enjoy!',
  breakfast: 'Slice a bagel and a warm croissant. Add a little cheese, ripe figs, and soft apricots. Wash the blueberries for a bright fruit bowl. Breakfast is ready to share!',
};
export const RECIPE_STORY_CHOICES = [
  {id:'salad',recipe:'salad',title:'Garden salad'}, {id:'tropical',recipe:'citrus',title:'Tropical bowl'},
  {id:'orchard',recipe:'orchard',title:'Orchard bowl'}, {id:'vegetables',recipe:'vegetables',title:'Roasted veggies'},
  {id:'berries',recipe:'berries',title:'Berry bowl'}, {id:'tofu',recipe:'tofu',title:'Tofu salad'},
  {id:'soup',recipe:'soup',title:'Pumpkin soup'}, {id:'picnic',recipe:'picnic',title:'Picnic plate'},
  {id:'breakfast',recipe:'breakfast',title:'Bakery breakfast'},
] satisfies {id:keyof typeof RECIPE_STORIES;recipe:RecipeId;title:string}[];
