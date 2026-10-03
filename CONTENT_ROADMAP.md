# More food for Typeslasher

All three expansion packs are implemented in version 1.1: 26 foods total, each
with a whole model and two cut pieces. The approved original eight, including
the reference-matched red grapes, remain unchanged in this expansion.

## Pack 1 — Fresh picks (six items)

| Food | Letters | Visual and cut treatment |
| --- | --- | --- |
| Lime | 4 | Green dimpled peel; pale green citrus segments |
| Plum | 4 | Purple oval with a seam; amber flesh and one stone |
| Mango | 5 | Asymmetric orange/green skin; golden flesh and flat stone |
| Peach | 5 | Warm blush, seam and fuzz; golden flesh and textured stone |
| Orange | 6 | Orange peel and navel; distinct segments and thin white pith |
| Donut | 5 | Baked ring with icing; real hole, crumbs, and icing on cut edges |

Implemented with segmented citrus, modeled stones, painted flesh, and a donut
whose whole and cut meshes preserve its real hole.

## Pack 2 — Snack break (six items)

Egg, pie, muffin, waffle, pretzel, and popcorn. Use a hard-boiled egg with shell
and yolk, a small whole filled pie, and a striped paper popcorn tub that splits
with its contents. These add 3–7 letter words and distinct shapes/materials.
Implemented. The catalog reaches 20 foods.

## Pack 3 — Big bites (six items)

Avocado, broccoli, sandwich, pineapple, strawberry, and watermelon. These add
7–10 letter targets and more complex interiors. Keep them out of the starter pool;
introduce them with generous recognition time before using them in faster modes.
Implemented. The catalog reaches 26 foods. Mixed basket on Sprout excludes
words longer than six letters; selecting Big bites explicitly allows them.

## How each pack enters the game

1. Move food definitions into one catalog containing name, asset ID, category,
   word length, required keys, and beginner suitability. Keep distinct initial
   letters among simultaneous targets; duplicates such as peach/plum are fine
   in the catalog but cannot appear together.
2. Model an intact whole and two closed cut pieces in Blender with consistent
   scale and origin. Nothing exposes flesh until the player completes the word.
   Give peel, flesh, seeds, stems, icing and crumbs their own cut treatments.
3. Inspect front, side, back, and separated cuts under the actual game lighting.
   Test the slash at both large Sprout size and small Master size. Fix silhouette,
   material color, holes, floating details, and overlapping surfaces before release.
4. Package new foods separately and load only the selected pack before play.
   Avoid making the growing catalog increase every initial download. Retain the
   eight-food starter pack and keep GPU geometry/materials shared across clones.
5. Add pack selection and balanced word sampling. Expand beginner words first;
   introduce longer names through the existing length-based timing and challenge
   system. Food variety should not require high scores to access typing practice.
6. Run geometry/color checks and browser playtests, then release. The next child
   playtest should focus on recognizability and comfortable longer-word timing.

Asset creation and visual correction: **GPT-6 Astra**, per the user's preference.
Routine catalog integration and UI work: Sol medium is the proposed setting;
announce the choice before starting that work. All three packs are included in
the current release. Further content should follow feedback on these 26 foods.
