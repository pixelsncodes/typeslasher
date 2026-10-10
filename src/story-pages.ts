export type StoryPage = { readonly text:string; readonly beat:string; readonly alt:string; readonly image:string };

// Selected, reviewed artwork only. Original generation assets stay in art-review.
export const STORY_PAGES:Readonly<Record<string,readonly StoryPage[]>> = {
  "restaurant": [
    {
      "text": "Slice the apple, kiwi, pear, orange, mango and grapes, then serve a colorful fruit salad.",
      "beat": "Order 1 · Fruit salad",
      "alt": "Slice the apple, kiwi, pear, orange, mango and grapes, then serve a colorful fruit salad.",
      "image": "storybooks/restaurant/page-01.webp"
    },
    {
      "text": "Chop tomato, cucumber, yellow pepper, radish, avocado and carrot, then add lemon to our garden salad.",
      "beat": "Order 2 · Garden salad",
      "alt": "Chop tomato, cucumber, yellow pepper, radish, avocado and carrot, then add lemon to our garden salad.",
      "image": "storybooks/restaurant/page-02.webp"
    },
    {
      "text": "Chop pumpkin, onion, potato, carrot and celery, then serve a warm bowl of pumpkin soup.",
      "beat": "Order 3 · Pumpkin soup",
      "alt": "Chop pumpkin, onion, potato, carrot and celery, then serve a warm bowl of pumpkin soup.",
      "image": "storybooks/restaurant/page-03.webp"
    },
    {
      "text": "Mix orange, lemon, mango, pineapple, lime, dragon fruit and kiwi for a bright tropical bowl.",
      "beat": "Order 4 · Tropical bowl",
      "alt": "Mix orange, lemon, mango, pineapple, lime, dragon fruit and kiwi for a bright tropical bowl.",
      "image": "storybooks/restaurant/page-04.webp"
    },
    {
      "text": "Cut potato, beet, onion, zucchini, mushroom and broccoli, then plate the roasted vegetables.",
      "beat": "Order 5 · Roasted veggies",
      "alt": "Cut potato, beet, onion, zucchini, mushroom and broccoli, then plate the roasted vegetables.",
      "image": "storybooks/restaurant/page-05.webp"
    },
    {
      "text": "Slice strawberry, raspberry, blueberry and cherry, then add pomegranate to our berry bowl.",
      "beat": "Order 6 · Berry bowl",
      "alt": "Slice strawberry, raspberry, blueberry and cherry, then add pomegranate to our berry bowl.",
      "image": "storybooks/restaurant/page-06.webp"
    },
    {
      "text": "Cut tofu, cucumber, pepper, carrot and radish, then squeeze lime over our crunchy tofu salad.",
      "beat": "Order 7 · Tofu salad",
      "alt": "Cut tofu, cucumber, pepper, carrot and radish, then squeeze lime over our crunchy tofu salad.",
      "image": "storybooks/restaurant/page-07-v2.webp"
    },
    {
      "text": "Slice apple, pear, peach, plum, apricot, cherry and fig, then serve a sweet orchard bowl.",
      "beat": "Order 8 · Orchard bowl",
      "alt": "Slice apple, pear, peach, plum, apricot, cherry and fig, then serve a sweet orchard bowl.",
      "image": "storybooks/restaurant/page-08.webp"
    },
    {
      "text": "Slice bread, cheese, tomato, cucumber and apple, then arrange a fresh picnic plate.",
      "beat": "Order 9 · Picnic plate",
      "alt": "Slice bread, cheese, tomato, cucumber and apple, then arrange a fresh picnic plate.",
      "image": "storybooks/restaurant/page-09.webp"
    },
    {
      "text": "Plate bagel, croissant, cheese, fig, apricot and blueberry for a cheerful bakery breakfast.",
      "beat": "Order 10 · Bakery breakfast",
      "alt": "Plate bagel, croissant, cheese, fig, apricot and blueberry for a cheerful bakery breakfast.",
      "image": "storybooks/restaurant/page-10.webp"
    }
  ],
  "fruit-adventure": [
    {
      "text": "A tiny rat wore an oversized chef hat.",
      "beat": "Meet the tiny chef",
      "alt": "A tiny taupe rat in a cream apron adjusts his oversized mint chef hat beside an empty mint bowl.",
      "image": "storybooks/fruit-adventure/page-01.webp"
    },
    {
      "text": "He carried a basket of fruit into his kitchen.",
      "beat": "A basket full of sunshine",
      "alt": "The tiny rat chef carries a wicker basket of ordinary apples, kiwi, pears, oranges and mango to his kitchen counter.",
      "image": "storybooks/fruit-adventure/page-02.webp"
    },
    {
      "text": "He mixed pears and oranges in a mint bowl.",
      "beat": "A little stir of sunshine",
      "alt": "The tiny rat chef stirs ordinary pear cubes and orange segments in the mint scalloped bowl.",
      "image": "storybooks/fruit-adventure/page-03.webp"
    },
    {
      "text": "With a sprinkle of mango, lunch was ready to share.",
      "beat": "Lunch is ready",
      "alt": "The tiny rat chef adds golden mango cubes to the completed pear and orange salad in the mint bowl.",
      "image": "storybooks/fruit-adventure/page-04.webp"
    }
  ],
  "space-mission": [
    {
      "text": "Our spaceship landed beside a purple moon.",
      "beat": "A very purple landing",
      "alt": "Our spaceship landed beside a purple moon.",
      "image": "storybooks/space-mission/page-01.webp"
    },
    {
      "text": "A friendly robot offered us a map.",
      "beat": "A friendly guide",
      "alt": "A friendly robot offered us a map.",
      "image": "storybooks/space-mission/page-02.webp"
    },
    {
      "text": "We followed the glowing stars home.",
      "beat": "Follow the stars",
      "alt": "We followed the glowing stars home.",
      "image": "storybooks/space-mission/page-03.webp"
    }
  ],
  "funny-day": [
    {
      "text": "I opened my backpack and found a squeaky rubber duck.",
      "beat": "An unexpected school guest",
      "alt": "I opened my backpack and found a squeaky rubber duck.",
      "image": "storybooks/funny-day/page-01.webp"
    },
    {
      "text": "It had eaten my homework.",
      "beat": "The homework mystery",
      "alt": "It had eaten my homework.",
      "image": "storybooks/funny-day/page-02-v2.webp"
    },
    {
      "text": "The teacher laughed so hard she gave the duck a gold star.",
      "beat": "A star for the surprise guest",
      "alt": "The teacher laughed so hard she gave the duck a gold star.",
      "image": "storybooks/funny-day/page-03.webp"
    }
  ],
  "little-kindness": [
    {
      "text": "Rain tapped on a tiny yellow umbrella.",
      "beat": "A rainy beginning",
      "alt": "Cream bunny in a mint scarf watches raindrops tap on her yellow umbrella.",
      "image": "storybooks/little-kindness/page-01.webp"
    },
    {
      "text": "Bunny spotted a mouse with very soggy whiskers.",
      "beat": "Someone needs a little shelter",
      "alt": "Bunny notices a tiny lavender mouse standing in the rain with wet whiskers.",
      "image": "storybooks/little-kindness/page-02.webp"
    },
    {
      "text": "She lifted her umbrella and made room for her new friend.",
      "beat": "There’s always room for a friend",
      "alt": "Bunny lifts her yellow umbrella to welcome the lavender mouse beneath it.",
      "image": "storybooks/little-kindness/page-03.webp"
    },
    {
      "text": "They splashed through the puddles together.",
      "beat": "Better together",
      "alt": "Bunny and mouse splash happily through a garden puddle beneath one umbrella.",
      "image": "storybooks/little-kindness/page-04.webp"
    },
    {
      "text": "A little kindness made the rainy day feel warm.",
      "beat": "A little kindness goes a long way",
      "alt": "Bunny and mouse stand together on the wet garden path under the yellow umbrella as the rain eases.",
      "image": "storybooks/little-kindness/page-05-v2.webp"
    }
  ],
  "helping-paws": [
    {
      "text": "A little hedgehog spilled his basket of apples.",
      "beat": "A little tumble",
      "alt": "A little hedgehog spilled his basket of apples.",
      "image": "storybooks/helping-paws/page-01.webp"
    },
    {
      "text": "Bear put down her picnic and hurried over to help.",
      "beat": "Help is on the way",
      "alt": "Bear put down her picnic and hurried over to help.",
      "image": "storybooks/helping-paws/page-02.webp"
    },
    {
      "text": "They gathered every apple with their tiny paws.",
      "beat": "Many paws make light work",
      "alt": "They gathered every apple with their tiny paws.",
      "image": "storybooks/helping-paws/page-03.webp"
    },
    {
      "text": "Hedgehog saved the sweetest one for his new friend.",
      "beat": "A sweet thank-you",
      "alt": "Hedgehog saved the sweetest one for his new friend.",
      "image": "storybooks/helping-paws/page-04.webp"
    },
    {
      "text": "Together they turned a small tumble into a happy picnic.",
      "beat": "A happy picnic together",
      "alt": "Together they turned a small tumble into a happy picnic.",
      "image": "storybooks/helping-paws/page-05.webp"
    }
  ]
};

/** Bind illustrations only when the complete prepared story still matches. */
export function getStoryPages(id:string|undefined,sentences:readonly string[]):readonly StoryPage[]|undefined {
  const pages=id?STORY_PAGES[id]:undefined;
  return pages?.length===sentences.length&&pages.every((page,index)=>page.text===sentences[index])?pages:undefined;
}
