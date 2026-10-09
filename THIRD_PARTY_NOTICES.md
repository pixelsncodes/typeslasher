# Typeslasher credits

- The 50 food models, modeled cut pieces, and kitchen scene were created for
  this project using Blender and Python, with AI-assisted development.
  Editable sources are the root `typeslasher-*.blend` projects; game exports
  are the food packs and kitchen in `public/assets/`.
- Generated images were used as modeling/concept references. The kitchen and
  food expansion prompts are recorded in `design/kitchen-v2/REFERENCE_PROMPT.md`
  and `design/food-expansion/PROMPTS.md`. These references are distinct from
  the playable 3D models and Blender review renders.
- Generated recipe cards and six story illustrations are also used as static
  artwork in the game. Originals and prompts are in `art-review/recipes/`
  and `art-review/stories/`; optimized WebP files are in
  `public/assets/recipes/` and `public/assets/stories/`.
- The ten recipe-specific serving bowls and plates use original Three.js
  geometry and procedural material work in `src/serving-dishes.ts`.
- The kitchen music pattern, synthesized sound effects, and slice visuals are
  original project code. No third-party music recordings are included.
- Three.js: MIT license; copyright its authors. Source and license:
  https://github.com/mrdoob/three.js
- Outfit by the Outfit project authors: SIL Open Font License 1.1.
  Full license: `public/fonts/outfit-OFL.txt`.
- DM Mono by the DM Mono project authors: SIL Open Font License 1.1.
  Full license: `public/fonts/dm-mono-OFL.txt`.
- The fonts were downloaded from Google Fonts and are served locally.
  Upstream source: https://github.com/google/fonts
- Vite and TypeScript are development tools; their dependency licenses are
  retained in the installed packages. No external service is required during play.
