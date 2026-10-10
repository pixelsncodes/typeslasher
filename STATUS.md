# Current checkpoint — Playable storybooks and smooth kitchen preparation · 2026-10-09

- All six stories now have sentence-matched artwork: 30 selected illustrated
  pages, with a grayscale-to-watercolor reveal driven by correct typing.
- Fruit Adventure follows one tiny rat chef with ordinary faceless fruit.
  Character, setting and prop continuity were planned and reviewed per page.
- Completed words unlock ingredient milestones; arrival, cutting and plating
  animate smoothly on the paused scene clock. The final ingredient's blade
  contact triggers the sentence slash, then the completed dish is served.
- Short or fast sentences catch up earlier ingredients separately. The final
  item gets its own 2.1-second ease-out and lands before serving begins.
  “Finishing touches…” marks this pause after typing; motion remains pausable,
  mistakes unlock nothing, and reduced motion settles directly.
- The original sentence stays hidden during its cut and serving transition.

Validation: all 18 automated suites, the production build, and portable release
checks pass. Browser checks cover milestone gating, smooth completion without
another keystroke, pause/resume, consecutive services and story-page transitions.
Release: 39.79 MB raw / 22.43 MB gzip. Production destination:
https://www.kaziahmed.net/typeslasher.

---

# Previous checkpoint — Illustrated story menu and serving dishes · 2026-10-09

- Sentence Slash now opens a six-tile story menu, with a separate “+ Add your
  story” tab for writing or pasting. File upload is removed; choosing a story
  preserves the custom draft. Start launches the selected story directly.
- Six generated story illustrations match the game's rounded style:
  Restaurant shift, Fruit adventure, Space mission, Funny day, Little kindness,
  and Helping paws. The two new stories follow animal friends sharing shelter
  and helping collect spilled apples, with five sentences each. Additional
  recipe stories are kept out of the menu for now.
- Each recipe uses its own serving vessel: seven bowls and three plates/platter,
  including scalloped ceramics, a wooden bowl, and a handled soup bowl.
- Confirmation dialogs use the game's colors, lettering, buttons and motion.

Validation: all 17 automated suites, production build, and portable release
checks pass. The ten serving models were reviewed from six views; a two-order
browser session verified soup-to-picnic dish changes, food placement, and full
service. Custom drafts, keyboard tabs, confirmation cancellation, and all tile
images were checked in the browser. The new kindness/helping tiles both load,
select their stories, and enable Start. Release: 36.08 MB raw / 18.73 MB gzip.
Artwork prompts and previews are in art-review/stories; vessel review images
and the interactive review page are in art-review/serving-dishes.
Release destination: https://www.kaziahmed.net/typeslasher.

---

# Previous checkpoint — Restaurant orders and polished foods · 2026-10-09

- Fixed ingredient batches move from basket to board to bowl, then serve as one
  sentence/order. Cuts finish before the next batch arrives.
- Ten illustrated recipe cards rotate through the full menu before repeating.
  Rush timers start in the kitchen; expired orders clear and count as lost.
- All 50 food models use calibrated proportions, polished geometry/materials,
  and natural resting poses in the basket and on the board. Seven editable
  Blender packs match the exported models; all foods were reviewed from seven views.
- Sentence Slash uses Play → choose/write/paste/import text → Start. Game options
  retain typing style, service pace, and first recipe without a preview page.
- “Are you hungry for a good story?” drops into a stacked headline on entry,
  with a small landing bounce. Reduced motion shows it immediately.

Validation: all 16 automated suites, production build, and portable release checks
pass. Browser checks covered direct story/custom starts, setup controls, fixed
inventory/varied orders, natural resting poses, headline replay, reduced motion,
and narrow layout. Release: 35.89 MB raw / 18.55 MB gzip. Review evidence is saved
under art-review/food-polish and art-review/recipes.

Earlier checkpoints follow.

---

# Current checkpoint — Typeslasher 1.6 / 50 modeled foods

## New assets — 2026-10-01

- Created and saved all 24 planned foods in three independent Blender projects.
  Each has a whole model and complementary left/right cut pieces.
- Generated a corrected celery reference before modeling its single U-shaped rib.
  All four references are saved in the project and packed into the Blender sources.
- Sculpted hollow peppers/pumpkins, aggregate raspberries, bagels with open centers,
  raised pomegranate arils, single retained fruit stones, and carved loaf scores.
  Baked anatomy textures for all new cut faces; exported portable embedded textures.
- Added Garden harvest, Fruit market, and Pantry & comfort to setup, gameplay,
  previews, fair food sampling, saved selections, and separate personal bests.
  Mixed contains 50 foods; Sprout's Free Play mixed pool has 32 short words.
- Added ten sentence recipe baskets and nine recipe stories. New produce now
  appears in salads, fruit mixes, roast dinners, tofu salad, soup and picnic prep.
  Selected recipe packs load on demand; changing recipes prepares their models.
- The food studio offers a basket selector and the Locker links to all 50 foods.

Validation: 14 automated suites pass, including all 72 new asset roots, embedded
textures, cap normals, complementary bounds, anatomy and budgets. Browser tests
confirmed successful slices and points for mushroom, fig and bagel; the berry
recipe reached 100% passage completion and accuracy with punctuation intact.
Narrow setup cards fit in two columns; desktop cards use four columns.

The pumpkin soup recipe also completed with 100% accuracy after switching recipes.
The production build loaded all 50 foods in the studio without browser errors.
Build and release checks passed: 35.68 MB raw / 17.50 MB gzip; the portable ZIP
is 16.31 MB and passed archive integrity checks. Test servers were stopped.

Release: Typeslasher-1.6-web.zip. Saved sources: typeslasher-garden.blend,
typeslasher-market.blend, typeslasher-pantry.blend. Reference notes and future
expansion are in FOOD_EXPANSION_PLAN.md. Prior checkpoint details follow.

---

# Current checkpoint — Typeslasher 1.5 / Clear pause menu and more ways to play

## Current changes — 2026-10-01

- Both games use Continue, Retry, Settings, and Exit in a shared styled pause card.
  Settings stays paused; food pace and guide options moved inside Settings.
  Retry resets score, clocks, input and animations. Arcade Retry keeps its round.
- Food rounds offer 30/60/90 seconds, with 30 on a new visit. Mode and duration
  records are separated while retaining older saved records.
- Free Play keeps the single-round experience. Arcade has successive rounds,
  slightly shorter new-food windows and an extra target every three rounds,
  capped at four targets and bounded speed. Next Round follows each scorecard.
- Sentence Slash adds five coherent ingredient baskets, twelve fruits in the
  main fruit mix, and four recipe passages. Uses existing modeled ingredients.
- Generated whole/cut reference sheets for 24 planned new foods across garden,
  fruit market, and pantry packs. See FOOD_EXPANSION_PLAN.md and
  design/food-expansion/PROMPTS.md. These references are not runtime models.

Browser checks: all three timer choices; pause Continue, Retry, Settings and Exit;
Arcade round 1 completion, round 2 transition and same-round Retry; garden salad
preview and typing. New automated checks cover bounded gradual progression,
duration records, and coherent recipe pools. Narrow-layout and final release
verification passed: the 390px pause card and setup controls fit without horizontal
overflow. Garden salad completed with 100% accuracy. Thirteen check suites and
the portable release check passed; the 1.5 release is 24.09 MB raw / 10.89 MB gzip.
Archive: `Typeslasher-1.5-web.zip`. Test servers were stopped after verification.

Prior checkpoint details follow.

## Follow-up fixes — 2026-10-01

- Replaced the elevated orthographic camera with a lower perspective view.
- Kitchen canvas spans the full cabinet width; removed its separate frame and
  rounded corners. Text and controls retain their side gutters.
- Whole fruit stays hidden until all cut pieces land, then waits a quarter second
  before the next fruit appears. Input updates cannot bypass the gap. Pausing
  freezes it; reduced-motion mode keeps the same gap with instant cuts.
- Removed animation catch-up that shortened timings. Rapid typing keeps only
  the latest pending decorative cut; scoring and accepted input still count every word.
  Completing a sentence discards waiting cuts and serves after the active cut,
  so fruit cutting does not continue playing a backlog after typing ends.
- Gentle now preserves all supported punctuation and only relaxes letter case.
  Smart quotes normalize to straight quotes; en/em dashes normalize to hyphens.
- Prevented the hidden typing input from scrolling the page away from the header.

The initial one-second rest was shortened to 250 ms after player feedback.
Browser verification of the original rest showed no whole fruit on the board;
typing ahead during that rest did not reveal the next fruit. A punctuated Gentle
passage completed after deliberate comma-error correction. The 390×844 scene
matched the full stage width (357 px) with no horizontal overflow. New regression
checks cover punctuation retention, required punctuation, and the fruit delay gate.

Build archive: `Typeslasher-1.4.1-web.zip`. Prior checkpoint details follow.

## Game integration — 2026-10-01

The approved Blender kitchen is playable in Sentence Slash. The camera frames the
whole kitchen, with a height-aware desktop layout that leaves room for typing and
a compact small-screen layout. Lighting matches the daylight direction of the
Blender review. Word completion drives the modeled knife and closed fruit halves;
pieces separate before transferring to the bowl. Sentence transitions now wait
for serving to finish, retain queued input, and exclude animation time from WPM
and Rush freshness. Fast input accelerates decorative playback to keep it current.
The built-in Fruit adventure and result copy now match the fruit-bowl activity.

Chromium checks on the new scene passed: full-motion Rush/Exact with pause/resume,
queued typing across sentence transitions, final serving/results, replay, and
reduced-motion completion. Both two-order runs finished at 100% accuracy and 970
points, with both orders fresh. The 1280×720 and 390×844 layouts were checked;
the narrow layout had no horizontal overflow. Browser logs had no warnings/errors.
All twelve automated checks pass. Current build and ZIP: `Typeslasher-1.4-web.zip`.
GPU performance on other devices and Firefox/Safari remain untested.

## Daylight Blender kitchen revision — 2026-10-01

Rebuilt the kitchen from the generated reference with separate island/rear counters,
an open sink and brass faucet, plants, utensils, a paddle board, fluted pottery and
a striped linen towel. Removed the hanging lamps. Added off-camera daylight and
packed wood, end-grain, limestone and linen textures. The shelf is now deep enough
for the full dishes and jars; measured wall clearances pass.

Editable scene: `typeslasher-kitchen-v2.blend`. Verified Cycles render:
`art-review/kitchen-daylight-v2.png`. The original Blender revision is preserved.
The optimized 4.00 MB GLB is integrated with matching game camera/daylight settings.
Sentence ingredients are apple, kiwi, pear, orange and mango; blade contact,
separation and bowl-transfer timing now share a tested animation timeline.

All twelve check scripts, build and portable release checks passed at the Blender
checkpoint. That export was 24.08 MB raw / 10.89 MB gzip. Integration and browser
verification are now complete as recorded above. Earlier browser checks below
describe the previous kitchen. See `design/kitchen-v2/SCENE_REVIEW.md` for details.

## Previous implementation checkpoint

Implemented 2026-10-01 from `PARAGRAPH_GAMEPLAY_PLAN.md`:

- Sentence Slash now has a kitchen scene with the existing sculpted foods,
  floating blade, per-word cuts, plated pieces, served-order shelf, and tickets.
- Correct characters drive blade preparation. Clean words build a multiplier
  up to x5; errors reset it, and correction cannot erase recorded mistakes.
  Each completed sentence earns a serving animation and optional clean bonus.
- Relaxed service stays untimed. Rush offers 20/30/45/60 target WPM and a
  length-based freshness allowance. Fresh plates earn +150; cooled plates can
  still be completed. The first attempt starts each order's clock.
- Live points, WPM, accuracy, combo, and character-based passage progress share
  the typing session's clock. Long sentences follow the caret without rebuilding
  all character nodes on every key. Spaces remain ordinary typed characters.
- Results show clean streak, perfect plates, fresh orders or active time, a
  speed chart for longer sessions, and same-visit replay score comparisons.
- Pause freezes scene effects and sentence transitions as well as timing. The
  existing transition input queue remains. Sound, theme, quality, reduced motion,
  optional finger hints, and a CSS graphics fallback are integrated.
- Aggregate result records migrate from version 1 to version 2 in the existing
  storage key. New fields distinguish Rush/Relaxed and pace. Passage content
  remains in memory. The notebook labels the new gameplay modes.

Validation: all eleven check scripts, TypeScript/Vite build, and portable release
checks pass. New rule coverage includes correction, typed spaces, punctuation,
single-word/final-word completion, combo boundaries, duplicate serving events,
Rush expiry, paused clocks, bounded chart samples, history migration, and 15–100
WPM simulations with mistakes. Release is 20.08 MB raw / 9.69 MB gzip; the existing
shared Three.js chunk-size advisory remains.

Chromium browser checks covered a complete four-sentence run with correction,
rapid typing across transitions, Exact Rush completion, unchanged freshness
during a pause, pause during a serving animation, queued input after resume,
reduced motion, replay comparison, cooled orders, result chart, and a 390 px
layout without horizontal overflow. A long sentence scrolled to keep the caret
visible. The normal 5173 play address shows the updated scene without browser
errors. Screenshot: `art-review/midnight-service-1.3.jpg`.

Remaining acceptance: human/beginner comfort and Rush balancing, Firefox/Safari,
200% browser zoom, forced graphics/asset failure, and device/GPU performance.
Audio scheduling is checked; actual speaker/headphone output was not listened to.
No new bitmap or Blender assets were generated. No public deployment was made.

Delivery: updated `dist/`, `Typeslasher-1.3-web.zip`, README, and design checkpoint.
Previous releases remain available.

## Previous checkpoint — Typeslasher 1.2 / Sentence Slash

Follow-up: source capitalization is preserved in both styles; Gentle accepts
either case while Exact requires it. Sentence transitions now finish the cut
before revealing the next sentence. Early keys are queued, transition time is
excluded from typing time, and pause/resume during a cut was browser-tested.
Gentle now also keeps word-internal apostrophes, so “I've” and “Don't” remain
intact in the preview and can be typed. Curly apostrophes normalize to the
keyboard apostrophe. Automated passage and typing checks cover this correction.

Sentence Slash is now a second production playstyle. Players can paste text,
load a local UTF-8 `.txt` file, or use three built-in stories. The preview cleans
citations, linked text, URLs, dashes, and list markers; each list item begins a
separate slice. Gentle and Exact typing styles, correction, pause, a visible
upcoming sentence, slash effects, results, replay, and early finish are wired
into the game. Passage text stays in visit memory; only bounded aggregate
practice records are saved locally. The home choice persists, and Locker and
the notebook show both playstyles. Food Slash setup and gameplay are retained.

Validation: all check scripts, production build, and portable-release checks
pass (20.04 MB raw / 9.68 MB gzip). Browser tests covered
paste cleanup, `.txt` import, sentence completion with correction, a full
three-sentence run, early finish, pause/focus, narrow layout, slash transition,
Locker/notebook, and switching back to Food Slash. The no-WebGL sentence route
is implemented but has not been forced in a browser test. Further family
playtest, Firefox/Safari coverage, 200% zoom, and device performance checks
remain. Astra medium is recommended for a later art-direction pass on the
sentence slash effect; no new bitmap or Blender asset was needed for this build.

`Typeslasher-1.2-web.zip` is the portable build. Previous release archives remain.

## Previous checkpoint — UI-2 integrated arcade menus

The 2026-09-22 `SENTENCE_SLASH_PLAN.md` captured the paragraph-based typing
playstyle and a source/check-suite audit of the original game. Its initial
proposal status has been superseded by the 1.2 implementation above.

The new Home, Setup, and Results now run in the main game at `/`.
Play and Play Again start real countdowns with the selected setup. The result
medal, score, food count, personal best, and kitchen-look progress use the real
round and saved learning record. Existing preference keys are preserved.
Training opens the working lessons (including access to the finger guide),
Settings opens sound/comfort/calibration, and Locker offers earned kitchen
looks, the food collection, and the existing progress notebook.

Pause prioritizes Resume, contains keyboard focus, and makes the arena inert.
Home/setup/results also keep hidden game controls out of keyboard navigation.
Pack loading disables Play and exposes retry after failure. The home food
scene stops rendering during gameplay. Approved tray PNGs were encoded as
lossless WebP: 844 KB became 365 KB, keeping the existing starter budget.

Validation: production build, all game/asset checks, and portable-release checks
pass (20.01 MB total raw / 9.67 MB gzip, including optional packs). Browser
checks at 1280×720 and 390×640 cover Home/Setup/Results, real word → 100 points,
pause/end round, replay countdown, saved Beat Kitchen/snack/pace setup after
reload, reduced-motion synchronization, Locker/theme/progress, and Training.
No browser console errors or warnings in the tested flows. Forced network
failure and cross-browser testing were not performed. Shared Three.js size
advisory remains. `Typeslasher-1.1-ui2-web.zip` contains this integrated build.

Next: UI-3 can redesign the interiors of Training, the notebook, Settings, and
Locker further. They are functional now; their deeper visual refresh remains
separate. Recommended Sol medium; new art remains Astra.

## Previous checkpoint — UI-1 arcade menu prototype

Built the approved next step: a separate interactive home/setup/results preview
at `/prototype.html`, using Astra medium. Home combines a dimensional wordmark,
actual 3D foods, a counter, a slash accent, and keycap-style controls. Setup uses
five rendered food trays, mode illustrations, visible food-count challenges,
typing-time choices, and a pinned Play action. Results uses an accuracy medal,
cut-food renders, separate stats, and a sample cosmetic-progress moment.

The prototype uses in-memory selections and clearly labeled example results.
Training/Locker/Settings are explanatory next-phase panels; Less motion works.
It does not play or save a real round. The working game and 1.1 ZIP are unchanged.
Build with `npm run build:prototype` after a normal game build. Full details and
checked interactions are in `design/ui-v2/README.md`. Next phase is UI-2 menu
integration, recommended Sol medium; any new asset work remains Astra.

## Previous checkpoint — pineapple redesign / Big bites revision 2

`UI_REFRESH_PLAN.md` contains the 2026-09-15 UI audit and screen-by-screen arcade
redesign. UI-1 is now built separately, as recorded above.

Pineapple now has a fuller barrel silhouette, a continuous embossed rind with
hexagonal eyes and brown centers, and 23 narrow curved crown blades in three
layers. Both slices follow the new body shape, with a golden rind edge, yellow
flesh, and a pale vertical fibrous core. Astra was used for this asset work.

Updated the editable `typeslasher-big.blend`, browser pack, cache revision,
production build, and 1.1 release ZIP. Previous source/GLB are preserved in
`art-review/pre-pineapple-v2/`; the final whole/cut render is
`art-review/pineapple-v2.png`. The generator supports `-- big --only-pineapple`
to retain the other saved models. All 15 other Big bites roots were compared
with the previous export: geometry and vertex colors are identical.

All nine check scripts, build, and release checks pass, including pineapple
paint contrast, crown presence, and outward-facing interior normals. Browser
review covered the whole model and separated cut faces under game lighting.
No gameplay mechanics changed; a new full round was not repeated for this asset
revision. Big bites is 4.49 MB, within its 6 MB limit; the complete release is
19.59 MB raw / 9.29 MB gzip. The shared Three.js size advisory remains.

Refresh `/assets.html?food=pineapple` or the game to load the redesign.

## Previous checkpoint — Typeslasher 1.1 / all three content packs

All five original game phases and the three planned expansion packs are built.
The catalog now contains 26 foods (78 whole/cut roots). Fresh picks adds lime,
plum, mango, peach, orange, and donut; Snack break adds egg, pie, muffin, waffle,
pretzel, and popcorn; Big bites adds avocado, broccoli, sandwich, pineapple,
strawberry, and watermelon. Each has an editable Blender source and a separate
browser pack. The approved starter/grape revision 5 pack is unchanged.

The menu offers each basket and a mixed basket. Sprout's mixed basket uses 18
words of 3–6 letters and skips downloading Big bites. Selecting Big bites
explicitly allows longer words at any challenge. Fair sampling balances foods
while keeping active initials distinct. Labels scale for up to ten letters;
the existing per-letter deadlines provide more time for longer names. Basket
choices persist; rapid switching keeps Play gated on the latest selection.
Personal bests are separated by basket and retain earlier starter records.

Validation: all nine check scripts, TypeScript/production build, and portable
release checks pass. Tests cover all 78 roots, half partitions, paint/materials,
cut normals, catalog fairness, beginner eligibility, and donut/pretzel holes.
Browser review covered the new whole/cut models under game lighting. An isolated
localhost notebook completed a 90-second mixed Master round: 11 slices, 100%
typing accuracy, expiry penalties, and saved results. Big bites was also checked
at 390 × 640, including ten-letter labels, slicing, and pause/resume. No console
warnings or errors were reported in the gameplay test. The child's notebook at
127.0.0.1 was not used for these saved test rounds.

Delivery: production website 18.38 MB raw / 8.44 MB gzip across all four packs.
The original initial-load budget remains under 8 MB; optional packs each remain
under 6 MB. `Typeslasher-1.1-web.zip` is the new portable release; the old archive
is retained. Vite's shared Three.js chunk-size advisory remains. New device/FPS
profiling, Firefox/Safari coverage, and the child's expansion playtest remain
unverified; no claim is made that the browser checks replace those.

Models: Astra used for asset work. Sol medium was recommended before routine
integration and verification; the current Astra task continued without a switch.
Next work should follow feedback on these foods and comfortable typing timing.

## Previous checkpoint — grape reference revision 5

Reworked grapes to follow the user's supplied red-grape reference: ruby skins,
lighter blush-pink flesh, slightly oval berries, small supporting branches,
thin red cut edges, soft flesh gradients, faint fibers, and curved membranes.
The browser preserves physical transmission (18% skin / 24% flesh), wet surface
highlights, IOR 1.38, and tinted thickness. Whole-object opacity remains one.
Grape slice particles now use the same red/pink palette.

Added `/assets.html?food=grape` for an enlarged rotatable whole/cut inspection.
Other valid food IDs work as well. `art-review/grapes-v5.png` is the final
Blender whole/cut reference render; the earlier source and GLB are preserved
in `art-review/pre-v5/`. The GLB and loader cache revision are now v5.

Validation: all six automated checks, production build, and release checks
pass. New asset assertions verify red/pink colors, lighter flesh, and retained
physical transmission after export. Browser review covered whole and separated
grapes at full size and in the eight-food grid. Arcade/Master playtesting
confirmed the new grape target can be typed and sliced; no browser warnings
or errors were reported. The test did not complete/save a practice session.
Physical transmission adds a render pass; full device performance profiling
was not repeated for this grape revision.

Delivery updated: editable Blender source, 6.12 MB GLB, static build, and release
ZIP. The website is about 7.13 MB raw / 3.11 MB gzip (ZIP about 3.13 MB), within
the 8 MB starter budget. Refresh an open game or studio to load revision 5.

## Previous checkpoint — food asset revision 4

Remodeled the existing eight-food Blender pack after the child's playtest:

- Kiwi now starts as a closed brown oval with fine fuzz and dry blossom ends.
  Radial green flesh and black seeds appear on the two cut pieces only.
- Apple has fuller shoulders, a tapered base, a stem well, quieter red/gold
  stripes, and a thin red skin border around its seeded cut face.
- Grapes have yellow-green flesh, thin purple skin, and revised berry spacing
  to remove intersecting cut discs.
- Banana has a peel ring; carrot has an inner core; corn kernel interiors stay
  golden. Chocolate, leaves, and stems retain their own cut materials.

Preserved the previous source/pack in `art-review/pre-v4/`. The editable Blender
source, browser GLB, production build, and `Typeslasher-1.0-web.zip` are updated.
The loader requests asset revision 4; refresh an already open game to load it.

Validation: all six automated check scripts, production build, and release
checks pass. The 24 asset roots meet the geometry and color checks, including
whole-kiwi anatomy, outward-facing kiwi interiors, and grape flesh color. All
eight foods were inspected in front, side, back, and cut browser views. The
final whole/cut Blender contact sheet is `art-review/after-v4.png`. A short
production Master/Beat Kitchen playtest confirmed word completion opens the
kiwi into two visible seeded halves during the swoosh and awards 100 points.
The test tab was closed before round completion so it did not save a session.

Release: about 6.21 MB raw / 2.51 MB gzip, ZIP 2.53 MB. The existing Three.js
bundle-size advisory remains. The local server is still at 127.0.0.1:5173.

`CONTENT_ROADMAP.md` proposes three six-item packs: Fresh picks, Snack break,
and Big bites, taking the catalog from eight to 26. These packs are planned,
not built. Use Astra for every asset task; Sol medium is proposed for routine
catalog/pack-selection integration. Announce the choice before the next phase.

## Previous checkpoint — 1.0 release (Phases 4 and 5)

All five planned phases are implemented. Phase 4 adds:

- Original synthesized kitchen music, quiet key notes, swooshes, and miss tones.
  A shared audio engine starts only after a gesture, reuses its noise buffer,
  disconnects completed voices, and cancels queued sound on pause/tab hiding.
- Sound & feel panel from the start and pause screens: independent volumes,
  mute, reduced motion/effects, opt-in camera nudge, and three graphics settings.
  Settings are bounded, locally saved, and safe with unavailable storage/audio.
- Reduced effects uses steady foods, gentle halves, no particles, no flashing,
  and no shake. Word labels and the keyboard never move with the camera.
- Balanced rendering caps pixel ratio at 1.5, Battery saver at 1 and 30 rendered
  fps, and Crisp at 2. Idle/paused scenes stop continuous WebGL rendering;
  time bars update at 10 Hz. A development-only meter is available through
  `?diagnostics=1` for repeatable local performance checks.
- Seven local font faces with bundled licenses; no Google Fonts request in play.
  A friendly startup error and retryable food loading replace dead start buttons.

Phase 5 adds:

- Arcade / Beat Kitchen selector. Beat Kitchen launches on the 120 BPM grid;
  a visible four-dot beat cue works even when muted. Whole-word completion
  within ±90 ms of a beat earns a flat +25, with no extra off-beat penalty.
- Music, visual pulses, launches, and judgement use the active round timeline.
  Pauses and resume countdowns preserve phase; stalled frames skip old beats.
- Optional eight-tap calibration after four listening clicks, a ±200 ms manual
  adjustment, and timing reset. Scattered taps do not overwrite an old setting.
  Calibration stops when closed/hidden or sound is changed. Offset changes
  apply to the next round. Calibration includes human tapping delay, not just
  hardware latency.
- Separate Beat Kitchen personal bests and notebook session labels. Both game
  modes contribute to lifetime cosmetic unlocks. Reset refreshes the menu.
- Desktop menu layout, compact grid with each label above its matching food,
  portable relative asset paths, release checker, local launch script, and README.

Validation completed: all six rule/asset check scripts and the production build
pass. Release checks validate local fonts/licenses and relative links for hosting
at a root or subfolder. The static build is about 5.74 MB raw / 2.18 MB gzip;
the existing Three.js chunk-size advisory remains, with no build errors.

Production Chromium browser playtesting verified a full Beat Kitchen round,
misses through natural expiry and final results, four simultaneous foods,
whole-word bonuses, saved results, frozen pause timers and resumed countdown,
replay, lifetime Watermelon unlock at 10 slices, and persistence after reload.
Eight evenly spaced calibration taps successfully saved an offset, which was
then reset. Desktop and 390×600 layouts were checked. No browser errors were
reported during these tests.

Development rendering measurements on this machine: four active foods reached
120 rendered fps at Balanced, approximately 0.14 ms CPU time per render. Battery
saver measured 26 fps (cap: 30); paused rendering measured zero. CPU submission
time is not GPU time, and these measurements are not guarantees for other devices.

Remaining device acceptance: child playtest of rhythm comfort and timing,
Firefox/Safari coverage, and audio listening on the actual speakers/headphones.
Automated scheduling checks and successful browser audio startup do not verify
speaker output or Bluetooth latency. These are validation limits, not missing
game modes. Public hosting has not been configured; the build is ready to serve.

Delivery: `Typeslasher-1.0-web.zip` contains the complete static website (about
2.19 MB). `Play Typeslasher.cmd` runs the dependency-free local Node server at
127.0.0.1:5173, preserving the previous development address's notebook. The final
browser was left on Arcade / Sprout / Relaxed with Balanced rendering. The
production build is running at that address; no public deployment was made.

Model guidance: Sol medium was recommended before Phases 4 and 5; the user
selected Astra medium for the implementation. Future asset generation must use
Astra. No additional food models were needed for these two phases.

## Previous checkpoint — Phase 3

Phase 3 adds challenge and progression while keeping beginner play comfortable:

- Four presets: Sprout (one food), Slicer (two), Chef (three), and Master
  (four). Each preset controls target capacity, spawn spacing, and bounded
  deadline pressure.
- Multiple active foods use separate numbered word cards. Active words always
  have different first letters; the first matching letter selects a target,
  which stays locked until completion or expiry.
- Responsive lanes keep three or four targets legible. Desktop uses one row;
  compact screens use a two-column grid without horizontal overflow.
- Optional gentle adaptation evaluates each block of ten resolved foods. Strong
  accuracy and completion shorten future deadlines slightly; misses or lower
  accuracy ease them. Pressure is capped and never changes an active deadline.
- The existing five-step combo multiplier now works across overlapping targets;
  each expired food breaks the combo and applies the score penalty independently.
- Midnight, Watermelon, and Citrus kitchen looks are selectable. Watermelon
  unlocks after 10 lifetime arcade slices and Citrus after 25. Lifetime totals
  persist separately from the bounded recent-session history, so unlocked looks
  cannot relock as old sessions rotate out.
- Challenge, adaptive/fixed mode, theme, and pace preferences save locally.
  Personal bests are separate for every challenge, pace, and adaptation setting.
- Invalid first letters count against round accuracy without assigning the error
  to an arbitrary finger's learning history.

Validation: `node tools/check-challenge.mjs` covers capacities, distinct initials,
target locking, harder/easier/fixed adaptation, pressure bounds, and theme
milestones. Learning, timing, and all 24 whole/cut asset checks pass. The
production build passes with only the existing Three.js chunk-size advisory.
Browser playtesting verified four simultaneous targets, lock retention after a
different target's initial, successful completion after that error, and a 390×600
four-target layout with no horizontal overflow. Beginner defaults were restored
after testing.

The sound/settings and Beat Kitchen work proposed at this checkpoint is now
included in the 1.0 release above.

## Previous checkpoint — Phase 2B

Phase 2B added the first-visit hand-position guide, live finger highlighting,
four Prep School lessons, local key-level progress, result coaching, guide display
settings, and storage-safe reset. Its automated and browser checks remain in
place.
