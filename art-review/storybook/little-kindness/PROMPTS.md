# Little kindness — illustrated gameplay concept

Created 2026-10-09 using built-in image generation. These are concept assets; no game integration or publishing has occurred.

## Continuity

- Canonical reference: `../../stories/little-kindness.png` (existing story thumbnail original).
- Every subsequent illustration also references `page-01.png`, the opening illustration, to preserve bunny design and garden continuity.
- Cream bunny, pink nose and cheeks, mint fringed scarf. Small lavender mouse, pink ears and curled tail. Yellow umbrella with brown curved handle.
- Same rainy cobblestone garden, fence/daisies left, mossy wall right, cream cottage with mint door behind.
- One illustration per existing sentence. No changes to the story text.

## Shared exact prompt

Use case: illustration-story. Create one finished landscape 3:2 illustration for page of the children's book "Little kindness" in Typeslasher. Input image 1 is the canonical character, umbrella, environment and art-style reference, not a frame to copy literally. Match it closely: the SAME plump cream bunny with one gently flopped ear, pink nose and rosy cheeks, mint-green fringed scarf, no other clothes; the SAME much smaller lavender mouse with round pink-inner ears, pink nose, fine white whiskers and thin pink curled tail, no clothes; golden yellow umbrella with brown curved wooden handle. Plush, rounded polished stylized 3D storybook art, softly textured fur, matte handmade materials, warm cream highlights, peach/mint garden palette. Same wet cobblestone garden path, mossy stone wall on right, rustic fence and daisies on left, cream cottage with mint arched door in distance. Gentle rain with readable droplets, warm overcast light. Character proportions never change, no extra characters, no food props. Frame all important subjects with generous margins, rich but readable story composition, landscape 3:2. No text, typography, borders, panels, UI, logo, watermark. Story starts rainy and finishes warm but retains the same location.

## Page prompts

### Page 1

Sentence: Rain tapped on a tiny yellow umbrella.

PAGE 1 / opening: Medium-wide scene of ONLY the cream bunny beneath her yellow umbrella, walking quietly down the wet garden path. She holds the brown handle with one paw, looks up toward the tapping raindrops with a curious gentle smile. Clear raindrops bead and tap on umbrella, shallow puddles reflect yellow. Mouse is not visible yet. No other characters. Establish the canonical garden from the reference.

### Page 2

Sentence: Bunny spotted a mouse with very soggy whiskers.

Input image 2 is the finished opening page; match its bunny face, scarf, umbrella and garden as well.

PAGE 2 / discovery: Bunny on the left under her yellow umbrella has paused and turns her head toward the SAME little lavender mouse on the right, outside the umbrella edge beside the mossy wall. Mouse has damp fur and visibly drooping wet white whiskers, a shy hopeful face, water drops on ears. Bunny looks concerned and kind. Mouse is about half bunny height. Keep them separated at this story beat. Same garden, rain, cottage and character designs.

### Page 3

Sentence: She lifted her umbrella and made room for her new friend.

Input image 2 is the finished opening page; match its bunny face, scarf, umbrella and garden as well.

PAGE 3 / sharing: Close-medium story scene. The SAME cream bunny raises and tilts her yellow umbrella outward with her paw to make space for the SAME lavender mouse. Mouse is stepping from the rain into the protected space by her side, looking up gratefully; bunny gives a soft welcoming smile. Show umbrella handle held correctly in bunny paw. Mouse about half bunny height. Both bodies and umbrella visible. Same garden and fine rain. Fresh composition; preserve all identities from reference.

### Page 4

Sentence: They splashed through the puddles together.

Input image 2 is the finished opening page; match its bunny face, scarf, umbrella and garden as well.

PAGE 4 / playful action: Medium-wide scene. The SAME cream bunny in mint scarf and smaller lavender mouse walk side by side beneath the SAME yellow umbrella, playfully splashing into a shallow garden puddle. Bunny holds the handle; mouse raises one tiny paw happily. Low rounded splash arcs and ripples, reflected yellow umbrella. Both look delighted, lively natural foot poses, correct anatomy and proportions. Same wet garden with fence left, wall right and mint-door cottage beyond. No additional umbrella.

### Page 5

**Superseded illustration:** the initial prompt below introduced a raised stone platform. Current mockups use `page-05-v2.png` / `page-05-v2.webp`, with both characters standing on the same flat path as the earlier pages. See [the continuity correction and exact edit prompt](CONTINUITY-FIX.md).

Sentence: A little kindness made the rainy day feel warm.

Input image 2 is the finished opening page; match its bunny face, scarf, umbrella and garden as well.

PAGE 5 / warm ending: Medium-wide quiet closing illustration. The SAME cream bunny and small lavender mouse sit together on a low mossy stone at the edge of the SAME garden path, snuggled beneath the SAME yellow umbrella. Bunny holds the handle, mint scarf stays on bunny, mouse leans against her with a warm smile. Rain lightens and a soft warm beam lights them, gentle golden reflection in puddle and yellow flower in foreground. Same cottage with mint door, same mossy wall and fence. Peaceful emotional payoff, not a new location. Maintain mouse half bunny height.

## Mockup behavior

`mockup.html` is a standalone design preview. The cream spread pairs the illustration on the left with readable live-style sentence text on the right. The actual existing kitchen screenshot is cropped with CSS beneath it as a layout reference. Preview buttons switch among five pages; scores and order counters are illustrative, not live gameplay. Three order cards show an example queue, not the runtime-generated queue for each page.

Proposed implementation after review: keep each illustration bound to its sentence index; completing the sentence serves its dish, then advances the illustration and sentence together. Relaxed reading has no timer; Rush would retain the current expiration behavior and advance both together after an expired order. Pause and reduced-motion preferences should apply to page transitions. Images remain stable while typing.

## Saved artwork

All files are under `D:/AI/Kazi WorkOS/Typeslasher/art-review/storybook/little-kindness/`. Originals are 1536 × 1024 PNG; preview assets are 1200 × 800 WebP, 805 KB combined.

| Page | Original | Preview asset | Sentence |
| --- | --- | --- | --- |
| 1 | [page-01.png](page-01.png) | [page-01.webp](page-01.webp) | Rain tapped on a tiny yellow umbrella. |
| 2 | [page-02.png](page-02.png) | [page-02.webp](page-02.webp) | Bunny spotted a mouse with very soggy whiskers. |
| 3 | [page-03.png](page-03.png) | [page-03.webp](page-03.webp) | She lifted her umbrella and made room for her new friend. |
| 4 | [page-04.png](page-04.png) | [page-04.webp](page-04.webp) | They splashed through the puddles together. |
| 5 | [page-05-v2.png](page-05-v2.png) | [page-05-v2.webp](page-05-v2.webp) | A little kindness made the rainy day feel warm. |

[Gameplay mockup](mockup.html) · [Five-page storyboard](storyboard.html) · [Gameplay screenshot](gameplay-mockup.png) · [Storyboard screenshot](storyboard.png)

## Review

## Kitchen-first revision

The restaurant premise is: guests pay for their food by typing a story. Typed words advance food preparation; idle typing pauses preparation. Completing a sentence serves a dish and moves to the next illustrated page.

The revised [kitchen-first mockup](mockup-kitchen-first.html) places the existing 3D kitchen scene above the book spread, with the story illustration on the left and the typing text on the right. The header reads “Type a story. Dinner’s on us.” The original layout remains available for comparison. This revision is a layout preview using the existing kitchen screenshot; the cooking behavior is proposed for later implementation.

Saved proof: [gameplay-mockup-kitchen-first.png](gameplay-mockup-kitchen-first.png). Checked that the kitchen is above the story, the picture is left of the text, the illustration loads, and there is no horizontal overflow.

### Roomier kitchen revision

The kitchen-first preview now renders the existing game’s actual Three.js kitchen in its own design-review host through `preview-kitchen.ts`. Desktop framing uses a 2.9:1 scene area, giving the shelf and plants much more headroom. The story spread is reduced to 220–250 px tall on desktop, and its illustration uses contain sizing so the artwork remains complete. The preview settles the ingredient arrival then pauses the scene for review; it does not implement story-driven cooking yet. At the reviewed desktop size, the kitchen is 481 px tall and the story is 250 px tall. Models and ingredients loaded successfully, with no browser errors or horizontal overflow.

Current proof: [gameplay-mockup-roomier-kitchen.png](gameplay-mockup-roomier-kitchen.png). Production game source remains unchanged.

### Image fit and watercolor reveal prototype

The kitchen-first mockup now sizes the image column from the story spread’s inner height at exactly 3:2. The image occupies its full column without cropping or side gutters. At the reviewed desktop size, the column measured 369 × 246 px, matching the 1200 × 800 source image.

`storybook-reveal.js` adds an isolated interaction prototype: the original illustration is shown in CSS grayscale, and a colored canvas layer is revealed through a deterministic mask of overlapping soft daubs and irregular bristle marks. Correctly typed characters drive the reveal percentage. A short eased spread settles after typing stops; there is no continuing autonomous reveal. A fully completed sentence reveals the entire original image. Reduced-motion preference makes progress updates immediate.

Click the sentence to type the current page, or use **Watch color bloom** for an eight-second demonstration. **Reset page** returns to black and white. Each new scene starts fresh. This preview leaves the published game and cooking mechanics unchanged.

Checked the grayscale start, partial typed sentence (47%), full completion, reset, exact aspect ratio and browser error log. Saved proof: [partial watercolor reveal](gameplay-watercolor-partial.png).

All five pages reviewed together for character, wardrobe, palette, umbrella and location continuity. Preview navigation verified across pages 1–5, including disabled first/last controls and matched illustration/sentence updates. All image assets loaded; desktop layout has no horizontal overflow. Runtime source and published site were not modified.
