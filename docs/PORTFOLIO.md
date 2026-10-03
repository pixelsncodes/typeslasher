# Typeslasher — portfolio copy

## Project card

**Typeslasher**
A browser typing arcade where words slice 3D foods and sentences become a kitchen service. Built with TypeScript, Three.js, and custom Blender assets through an iterative, AI-assisted development process.

**Tags:** Browser game · TypeScript · Three.js · Blender · AI-assisted development

## Project overview

Typeslasher turns keyboard practice into visible, playful feedback. Food Slash challenges players to type the names of flying foods, with free play, progressive arcade rounds, and an optional rhythm mode. Sentence Slash lets players bring their own paragraph into a cozy 3D kitchen: each completed word cuts an ingredient and each sentence serves a bowl.

The project grew from a small typing prototype into a 50-food catalog with modeled cut interiors, finger guidance, practice drills, adjustable difficulty, and local progress. Development included gameplay planning, an interface prototype, Blender asset generation and review, kitchen animation refinement, and automated checks for timing, input, scoring, and exported geometry.

Codex assisted development, Blender and Python supported the asset pipeline, and generated reference images guided the kitchen and food expansion. All gameplay runs in the browser without an account or live AI service.

## Visuals

- `screenshots/sentence-slash.png`: main kitchen gameplay image.
- `screenshots/food-slash.jpg`: Food Slash with visible targets and finger guidance.
- `screenshots/garden-assets.png`: whole foods and modeled cut interiors.
- `screenshots/market-assets.png`: fruit anatomy and asset variety.
- `screenshots/kitchen-render.png`: Blender kitchen review render.

## Links and publishing notes

- Source: https://github.com/pixelsncodes/typeslasher (available after repository publishing).
- Intended play address: https://kaziahmed.net/typeslasher (future deployment; not live as part of this GitHub preparation).
- Build command: `npm run build`; static output: `dist/`.
- The build uses relative asset links and is checked for subfolder portability. Hosting it at `/typeslasher` will require integration with the existing Vercel website.
