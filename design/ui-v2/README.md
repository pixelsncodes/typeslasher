# Arcade menu prototype — UI-1

Open **http://127.0.0.1:5173/prototype.html** while the usual game server is running.
The current playable game remains at `/`.

Three interactive compositions are implemented: Home, Setup, and Results.
The bottom preview controls jump between screens. Home's Play and Setup's Play
show an explicitly labeled sample scorecard; they do not start a round or save
progress. Play again demonstrates the return transition. This prototype does
not read or write the player's saved preferences or notebook.

Setup changes mode, basket, challenge, typing pace, and gentle adjustment in
memory. Mode/difficulty copy and eligible word counts update; the basket carries
through to home's actual 3D scene and the result's cut-food illustration.
Training, Locker, and Settings explain their planned next-phase contents in
dismissible panels. Less motion works in this preview; menu audio is deferred.

## Build

```powershell
npm run build
npm run build:prototype
npm run play
```

The regular build supplies the game's shared food packs and fonts. The prototype
build adds `dist/prototype.html` and `dist/prototype-assets/`, preserving the
existing game entry. A subsequent regular build intentionally removes the
prototype. The 1.1 release ZIP was not changed to include this design preview.
Run production release checks after the regular build, before adding prototype
output; its extra preview files are not part of the game's transfer budget.

`src/ui-prototype.ts` and `src/ui-prototype.css` are isolated from the game entry.
The prototype reuses `food-catalog.ts` and `food-assets.ts`; no gameplay module
was changed. `vite.prototype.config.ts` controls the additional build.

`trays/` contains ten small transparent Blender renders: five basket compositions
and their cut versions. They total about 0.85 MB. Rebuild them using Blender with
`--background --factory-startup --python tools/render_menu_trays.py`. The script
reads the existing sources without saving or remodeling them. The home scene
uses one Three.js canvas, only the chosen pack, and a brief entrance animation.
It stops rendering after that entrance, with resize/visibility updates as needed.

## Checked

- TypeScript and the prototype production build pass.
- Home, setup, and results reviewed at desktop size; home at 1024 × 600;
  compact home/setup/results at 390 × 640.
- Switching modes, baskets, challenge, pace, and returning home updates the
  corresponding selections and content. Mixed/Sprout reports 18 short words.
- Native dialog Escape restores focus to its opener; screen navigation focuses
  its heading. Less motion works. No errors/warnings in the tested browser log.
- Primary Play remains visible on the compact home/setup. Long setup content
  scrolls independently. Compact results can scroll to secondary details.

No new device performance or cross-browser claims are made from this visual pass.
Real rounds, score calculation, settings persistence, training, and Locker will
be connected in UI-2/UI-3 after this direction is reviewed.
