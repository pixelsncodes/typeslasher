# Daylight kitchen revision

The reference has two distinct work surfaces: a foreground island for the fruit tray, chopping board and mixing bowl, plus a rear counter carrying the sink, tap, utensils and plants. The first Blender version compressed those into one shallow surface and placed dishes too far into the wall.

## Corrected in Blender

- Removed pendant lamps and cables from the active scene. A large off-camera window light, soft sky fill and gentle sun now light the scene. The review uses Cycles with denoising.
- Restored a separate rear counter and cabinets. Added an open sink cavity, brass gooseneck tap, lever and soap dispenser.
- Increased shelf depth from 0.65 to 1.32 scene units, moved the wall behind the rear counter, and repositioned all dishes and jars. Plates clear the wall by 0.188 units; jars and lids clear it by at least 0.368 units. Their full footprints fit on the shelf.
- Added herbs at both ends, a trailing shelf plant, a leaning paddle board, a ceramic utensil crock with wooden spoons, ribbed jars, bowl fluting and a striped linen towel draped over the island.
- Added packed wood-grain, end-grain, limestone and linen textures. Individual board blocks use varied texture coordinates.
- Populated the Blender review with the existing sculpted apples, kiwis, pears, oranges and mangoes. Review fruit is excluded from the kitchen GLB because gameplay supplies it dynamically.

## Files and reproduction

- `reference.png`: generated visual reference. Prompt and generation method are in `REFERENCE_PROMPT.md`.
- `../../typeslasher-kitchen-v2.blend`: editable scene with packed textures, review fruit, lighting and camera.
- `../../art-review/kitchen-daylight-v2.png`: verified render.
- `../../art-review/kitchen-v2-clearance.json`: measured shelf clearance.
- `../../public/assets/typeslasher-kitchen.glb`: optimized game export, three named assemblies, 25 material primitives. Lights and review fruit are excluded.

Blender MCP build order: `build_sentence_kitchen_v2.py`, `refine_sentence_kitchen_v2.py`, then `export_sentence_kitchen_v2.py` in `tools/`. The export works on a separate copy, preserving individually editable authoring objects. The original scene and `typeslasher-kitchen.blend` remain available as the first revision.
