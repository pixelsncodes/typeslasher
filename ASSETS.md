# Typeslasher food assets

The game now uses 50 Blender foods across seven separately loaded packs. Each
has a whole model and two bisected pieces with closed interior surfaces:
150 named food roots in total. The current catalog loads Original favorites
revision 6, Big bites revision 3, and revision 2 of the other five packs.

## Current art pass — proportions, resting poses, and serving dishes

The latest pass refines all 50 food models and their cut pieces, including
silhouettes and materials seen from the side, underside, and cut view. The seven
editable Blender projects match the exported packs. Turnarounds, generation
records, and browser checkpoints are saved in `art-review/food-polish/`.

- `src/food-proportions.ts` defines relative game sizes; a strawberry or raspberry
  stays much smaller than a watermelon.
- `src/food-sizing.ts` shares a calibrated frame between intact and cut pieces.
- `src/food-resting.ts` applies grounded preparation poses in the basket and on
  the cutting board, including horizontal elongated foods.
- `tools/check-food-proportions.mjs` checks every whole/cut frame, resting bounds,
  grounding, and shared scale.

Each recipe also selects one of ten serving vessels from `src/serving-dishes.ts`.
These are Three.js-generated bowls, plates, and a platter, with closed profiles,
usable inner floors, rim variations, wooden grain, and soup handles. They are
reviewed in `art-review/serving-dishes/`, and validated by
`tools/check-serving-dishes.mjs`. There is no separate serving-vessel GLB pack.

Recipe and story illustrations are static generated artwork, independent of the
playable geometry. Their optimized WebP assets live in `public/assets/recipes/`
and `public/assets/stories/`; originals and exact prompts are in the matching
`art-review` folders. The six story tiles total about 176 KB. Production budgets
allow 80 KB per illustration and 300 KB for the combined story artwork.

The sections below retain the original expansion and modeling history. Review
the current source and saved Blender project before regenerating an older revision.

## Version 1.6 — garden, market, and pantry

| Pack | Foods | Editable source | Browser GLB |
| --- | --- | --- | --- |
| Garden harvest | tomato, cucumber, pepper, radish, beet, mushroom, zucchini, onion | `typeslasher-garden.blend` | `public/assets/typeslasher-garden-pack.glb` |
| Fruit market | lemon, raspberry, blueberry, cherry, fig, pomegranate, dragonfruit, apricot | `typeslasher-market.blend` | `public/assets/typeslasher-market-pack.glb` |
| Pantry & comfort | bread, cheese, bagel, croissant, tofu, potato, pumpkin, celery | `typeslasher-pantry.blend` | `public/assets/typeslasher-pantry-pack.glb` |

The three packs add 72 food roots and embedded cut-face textures. Whole/cut
reviews are `art-review/garden-review.png`, `art-review/market-review.png`, and
`art-review/pantry-review.png`. Generation uses `tools/build_expansion_assets.py`;
see `FOOD_EXPANSION_PLAN.md` and the script's command-line options before rebuilding.
Generated anatomy references and their prompts live in `design/food-expansion/`.

Sentence Slash uses the editable `typeslasher-kitchen-v2.blend` scene exported
to `public/assets/typeslasher-kitchen.glb`. Its concept and review notes are in
`design/kitchen-v2/`. The kitchen loads on demand and recipe baskets select the
food packs they need. The sections below preserve earlier modeling revisions.

## Version 1.1 — three expansion packs

Big bites revision 2 redesigns the pineapple: embossed eyes on a barrel-shaped
rind, a three-layer blade crown, golden cut edges, and a pale fibrous core.
`art-review/pineapple-v2.png` supersedes the pineapple in `big-v1.png`.
To regenerate only it while preserving the other saved Big bites models, run
Blender with `--background --factory-startup --python tools/build_extra_assets.py
-- big --only-pineapple`. The previous pack/source is in
`art-review/pre-pineapple-v2/`.

| Pack | Foods | Editable source | Browser GLB |
| --- | --- | --- | --- |
| Fresh picks | lime, plum, mango, peach, orange, donut | `typeslasher-fresh.blend` | `public/assets/typeslasher-fresh-pack.glb` |
| Snack break | egg, pie, muffin, waffle, pretzel, popcorn | `typeslasher-snacks.blend` | `public/assets/typeslasher-snacks-pack.glb` |
| Big bites | avocado, broccoli, sandwich, pineapple, strawberry, watermelon | `typeslasher-big.blend` | `public/assets/typeslasher-big-pack.glb` |

Contact sheets: `art-review/fresh-v1.png`, `art-review/snacks-v1.png`, and
`art-review/big-v1.png`. Citrus retains segments and pith; stone fruits have
modeled pits and painted flesh. Bread, filling, yolk, rind, seeds, and popcorn
have distinct cut treatments. The broccoli is joined into one continuous mesh
before cutting. Donut and pretzel holes remain open.

Regenerate each pack with Blender's `--background --factory-startup --python`
followed by `tools/build_fresh_assets.py`, or `tools/build_extra_assets.py`
followed by `-- snacks` / `-- big`. These reuse common modeling helpers without
regenerating the approved starter pack. Preserve manual edits before regeneration.

Review `/assets.html?pack=fresh`, `?pack=snacks`, `?pack=big`, or `?pack=mixed`.
The default studio still shows Original favorites. `?food=watermelon` and the
other food IDs open a focused model. Each optional GLB has a 6 MB release limit;
only selected packs load. The current catalog selects packs for the chosen
mode, basket, and challenge.

The models use smooth organic shapes, colored surfaces, curved stems, veined
leaves, embedded chocolate, kernels around the full cob, and a dimensional grape
cluster. Apple and pear slices include a core and seeds. The kiwi is an intact
brown, lightly fuzzy oval; green radial flesh and black seeds appear only after
slicing.

## Revision 5 — grapes matched to the supplied red-grape reference

Grapes now have ruby-red skin and lighter blush-pink flesh in the same color
family. Slightly oval berries carry subtle surface mottling. The modeled cut
faces have a soft gradient, faint internal fibers, a curved central membrane,
and a very thin ruby skin edge. Small branches support the berry cluster.

The skin and flesh use physical transmission (18% / 24%) with an IOR of 1.38,
wet surface highlights, and tinted thickness in the browser. Opacity stays at
one: the material transmits light rather than fading the whole object. Blender
also uses a little subsurface scattering; that Blender-only effect is not
exported to glTF, so the browser review is the final appearance check.

The loader requests revision 5 so an older cached pack does not remain in play.

## Revision 4 — whole and sliced anatomy

- Apple: fuller shoulders, a tapered base, a deep stem well, subtle red/gold skin,
  and a thin red skin border around the cut flesh.
- Kiwi: a whole brown fruit with dry blossom ends, plus separately modeled
  green interiors and seeds on both cut faces.
- Grapes: revised berry spacing (color/material treatment superseded by revision 5).
- Banana: a yellow peel ring around its cream cut face.
- Carrot: an orange cut face with a lighter inner core.
- Corn: golden kernel interiors surrounding the pale cob.
- Cookie, pear, and other attached details: cut chocolate, stems, and leaves
  retain their own materials instead of inheriting generic fruit flesh.

## Inspect and play

Run `npm run dev`, then open `/assets.html` for the interactive food studio.
Drag each item to rotate it, scroll over it to zoom, or use Front, Side, Back,
and Cut open. The studio uses the same GLB, loader, and lighting as the game.
The game is at `/`. Use `/assets.html?food=grape` for an enlarged, rotatable
grape inspection; the same option accepts any of the 50 food IDs.

## Editable source and export

- `typeslasher-foods.blend`: editable models, grouped in named collections.
  Only the apple is initially visible; unhide the other collections/objects
  in Blender's Outliner to inspect them.
- `public/assets/typeslasher-food-pack.glb`: browser-ready pack, approximately 6.1 MB.
- `tools/remodel_food_assets.py`: deterministic Blender generation and export.
- `tools/create_food_assets.py`: compatibility entry point for the new generator.
- `art-review/before.png` and `art-review/after.png`: Blender review contact sheets.
- `art-review/after-v4.png`: previous whole/cut Blender contact sheet.
- `art-review/grapes-v5.png`: enlarged whole/cut grape reference render.
- `art-review/pre-v4/` and `art-review/pre-v5/`: preserved earlier Blender sources and GLBs.
- `CONTENT_ROADMAP.md`: proposed fruit/snack packs and their quality gates.

From the project folder, regenerate using Blender in background mode:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --python tools/remodel_food_assets.py
```

Regeneration replaces the generated `.blend` and `.glb`; preserve a separate copy
before making manual Blender edits you want to retain. Meshes are authored in
game coordinates, then converted to Blender coordinates for glTF export. Keep
the `food_<kind>`, `food_<kind>_left`, and `food_<kind>_right` root names and shared
origins when editing. Export each mesh with one material slot to preserve painted
vertex colors in Blender 5.2's exporter.

## Validation

Run `npm run check`, `npm run build`, and `npm run check:release`.
The original asset check validates its 24 roots, finite geometry, scale, triangle budgets,
painted colors, interior materials, and that cut pieces occupy their own side of
the cut plane. It also checks whole-kiwi anatomy, outward-facing kiwi interiors,
and grape transmission, red/pink vertex colors, and lighter flesh than skin.
Whole models range from about 2,000 to 25,000 triangles.
The fresh/extra asset checks cover the other 54 roots, half partitioning,
material colors, outward cut normals, whole-egg anatomy, and real donut/pretzel
openings. Catalog checks cover fair selection, distinct active initials, and
the short-word beginner pool.

The final pack was inspected in Blender and in the browser from front, side,
back, and cut views. Live gameplay confirmed rendering and word-triggered slicing;
the browser reported no game console errors. The production build passes, with
Vite's size advisory for the shared Three.js bundle.

The loader now accepts Blender's Object3D roots and validates mesh content. The
previous Group-only check rejected the exported roots and silently showed the
old primitive foods. Starting a round now waits for the validated pack to load.

## Illustrated storybooks

All six story choices have one reviewed 3:2 illustration per sentence: Restaurant
Shift (10), Fruit Adventure (4), Space Mission (3), Funny Day (3), Little Kindness
(5), and Helping Paws (5). The 30 selected WebP pages are in
`public/assets/storybooks/`, 1200 × 800 pixels and approximately 3.53 MiB combined.
The current picture and next picture load only during an illustrated story.
Original PNGs, continuity edits, contact sheets and prompts remain in
`art-review/storybook/`; superseded variants are excluded from production assets.

`src/story-pages.ts` binds each image to its exact prepared sentence.
`src/storybook.ts` reveals a colored canvas over the grayscale original using
soft brush marks as correct characters are accepted. Pause freezes the reveal;
serving retains the completed page until the dish finishes, and the next order
starts with its own grayscale image. Edited/custom passages use the text-only
layout. `tools/check-storybooks.mjs` checks text binding, assets, serving and expiry
alignment; release checks budget the optional pages separately from the starter.

Fruit Adventure features a single tiny rat chef, ordinary faceless fruit and a
matching story tile. Its four revised sentences follow gathering, mixing and
finishing lunch. The planned sequence, exact built-in image generation prompts
and individual continuity checks are in `art-review/storybook/fruit-adventure/`.

In the playable kitchen, completed words unlock evenly distributed ingredient
milestones. Each milestone plays a smooth arrival, cut and transfer on the paused
scene clock, independently of the next keystroke. The next ingredient stays in
the basket until its milestone. Sentence completion unlocks the final ingredient;
the text slash matches its blade contact, and serving waits for the pieces to land.
Fast or very short sentences finish the remaining preparation in a bounded .7s
flourish. Mistakes unlock nothing; Pause freezes preparation and serving.
