# Typeslasher illustrated story review

All six existing story choices now have one illustration per sentence: 30 selected pages. Built-in image generation produced the 25 new pages; Little Kindness retains its five approved pages, including the corrected ending.

Fruit Adventure now follows one tiny rat chef with ordinary faceless fruit. Its four revised typing sentences, new story tile and selected pages are integrated into the local game. The [rat-chef plan](fruit-adventure/RAT-CHEF-PLAN.md) records the page sequence, continuity locks and individual checks; [exact prompts](fruit-adventure/PROMPTS.md) include the targeted correction that removed an extra spoon handle from the ending. Earlier apple-chef and helper drafts remain unselected review history.

| Story | Pages | Review folder |
| --- | ---: | --- |
| Restaurant shift | 10 | restaurant |
| Fruit adventure | 4 | fruit-adventure |
| Space mission | 3 | space-mission |
| Funny day | 3 | funny-day |
| Little kindness | 5 | little-kindness |
| Helping paws | 5 | helping-paws |

## Preview

Open `http://127.0.0.1:5175/art-review/storybook/index.html`. Each tile links to a gameplay mockup and the full story sequence. In the mockup, choose any story, click its sentence and type, or use **Watch color bloom**. Correctly typed characters reveal the color through soft overlapping brush marks. Changing pages or stories resets the picture to grayscale. The illustration panel stays at 3:2 without side gaps. The real game kitchen and serving dishes appear above the story; its order cards follow the selected page. Cooking, scores and sound controls remain illustrative in this review.

The selected artwork is integrated into the playable game. Choose Sentence Slash, then a story and Start. Correct typing reveals each picture while completed-word milestones trigger smooth ingredient preparation and completed sentences serve dishes. Relaxed service has no deadline; Rush service advances to the next illustrated sentence when an order expires. Custom passages retain the text-only layout. Production: https://www.kaziahmed.net/typeslasher.

## Artwork and prompts

Each story folder contains generated PNG originals, selected optimized 1200 × 800 WebP images, a contact sheet and `PROMPTS.md`. The exact new prompt set and reference identities are also recorded in [remaining-stories.json](remaining-stories.json). Later pages reference both the existing thumbnail and their opening page to preserve identities and setting.

Funny Day page 2 was edited to remove the teacher who appeared early; the teacher is introduced on page 3. Restaurant page 7 was edited to match the blue tofu serving bowl. Both selected files use `-v2`; originals remain as review history. Exact edit prompts are in their `CONTINUITY-FIX.md` files. Little Kindness keeps its previously corrected final page with the level garden path.

## Validation

- All six sequences inspected together for characters, scenery, props and sentence progression.
- All 30 selected images checked at 1200 × 800; combined optimized artwork approximately 3.53 MiB.
- `node art-review/storybook/check-review.mjs` verifies current story sentences, page counts, image availability and selected corrections.
- Browser checks cover every page transition and all six endings, disabled navigation at the end, grayscale reset when changing pages, typed completion and partial color reveal. No browser errors were reported.
- Playable integration checks cover a complete Little Kindness service, correct-key color progress, pause/resume, picture reset on the next order, and expired Fruit Adventure orders. The project checks and production build pass; `tools/check-storybooks.mjs` verifies all 30 shipped pages and sentence alignment.

The local preview uses `vite.review.config.ts` to avoid watching generated images while Windows copies/optimizes them. `library.json` records the selected pages; `prepare-art.py` optimizes images and renders contact sheets.
