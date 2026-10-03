# Food library — Typeslasher 1.6

## Implemented

The catalog now has 50 Blender foods. The 24 reference-led additions are playable
in Food Slash, Arcade, Beat Kitchen, the food studio, and relevant sentence recipes.

| Basket | Eight new foods | Saved Blender source | Runtime size |
| --- | --- | --- | --- |
| Garden harvest | tomato, cucumber, pepper, radish, beet, mushroom, zucchini, onion | typeslasher-garden.blend | 3.35 MB |
| Fruit market | lemon, raspberry, blueberry, cherry, fig, pomegranate, dragonfruit, apricot | typeslasher-market.blend | 5.01 MB |
| Pantry & comfort | bread, cheese, bagel, croissant, tofu, potato, pumpkin, celery | typeslasher-pantry.blend | 2.99 MB |

Each source has eight whole roots and sixteen complementary cut roots. Modeling
references and interior textures are packed in the saved projects. The runtime
exports contain embedded PNG textures, vertex colors, and portable materials.
Each basket loads independently and stays within its 6 MB asset budget.

## Reference artwork

Generated before modeling with the built-in image generation tool:

- design/food-expansion/fruit-whole-and-cut.png
- design/food-expansion/salad-whole-and-cut.png
- design/food-expansion/pantry-whole-and-cut.png
- design/food-expansion/celery-whole-and-cut.png — corrected single U-shaped rib

The references guide the shapes, materials, and cut anatomy. Cucumber and
zucchini use slender proportions. Cherries and apricots retain a stone in one
half. Peppers and pumpkins have real cavity walls; bagels keep their center open.
Raspberries use separate drupelets around a hollow cup. Onion and beet layers,
citrus segments, fig fibers, dragon fruit seeds, and bread crumb are baked into
cut textures. Pomegranate arils and fruit stones have raised geometry.

## Recipes

Ten baskets: fruit mix, citrus and tropical, orchard, garden salad, roasted
vegetables, berry bowl, crunchy tofu salad, pumpkin soup, picnic plate, and bakery
breakfast. Nine sample recipe passages set matching ingredient baskets. Custom
paragraphs can use any recipe. Sentence Slash loads the selected recipe's packs
and prepares new models when the recipe changes between sessions.

## Implementation and review

- tools/build_expansion_assets.py builds one independent basket in Blender.
- tools/finish_expansion_sources.py packs references and frames the first model.
- tools/render_food_review.py renders whole/cut sheets.
- tools/render_menu_trays.py renders the basket thumbnails from actual models.
- art-review/garden-review.png, market-review.png, and pantry-review.png show assets.
- tools/check-expansion-assets.mjs checks 72 roots, textures, finite geometry,
  vertex colors, outward cuts, complementary bounds, bagel openings, single stones,
  saved sources, and triangle/download budgets.

## Future expansion

Generate new references before modeling lettuce, cabbage, spinach, asparagus,
peas, eggplant, and additional recipe ingredients. Leafy foods should separate
actual leaves or stalks. Introduce these as another optional basket after review.
Continue using single-word typing IDs and coherent recipe pools to keep the
current selection system predictable.
