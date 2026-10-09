# Restaurant orders and stable ingredient batches

Each sentence is one order. Prepare a fixed recipe batch once when the order
arrives; never regenerate its basket from the current word. Move one ingredient
from its existing basket slot to the board, cut it, and transfer both halves to
the bowl before preparing the next ingredient. Finite ingredient checkpoints are
distributed over sentence words. Keep every required ingredient cut when typing
quickly. Serve only after all ingredients have landed, then load the next batch.

Show the active order and two queued orders as illustrated recipe cards. Use
built-in GPT image generation with actual game food models as style references.
Render recipe names, ingredient counts, status and timer bars as accessible HTML.
Queued orders do not age. Rush starts its deadline on arrival, including idle
time; countdown, loading, pause and serving transitions do not consume it.
Relaxed service remains untimed practice.

On expiry, resolve that sentence once as a lost order, preserve actual typing
accuracy, award no serve bonus, reset the streak, cancel its pending cuts and
transfers, clear basket/board/bowl, and advance after a short loss alert. Shake
only when motion is enabled. The next order receives its own full allowance.
Final expiry finishes service; retry resets all order state. Save served and
lost counts separately without saving the player's passage.

Add a restaurant menu with one sentence for each of the ten recipes. Existing
stories and custom passages still work, using their chosen recipe per sentence.
Validate with deterministic lifecycle/timing checks and browser playthroughs of
normal and fast serving, untouched-basket stability, expiry, final expiry,
pause/resume, retry, reduced motion and responsive cards. Build/release checks
must pass. This request is implemented and reviewed locally before publishing.

Implementation order: order model and clocks; stable scene lifecycle; order rail
and loss UI; generated artwork; automated and browser checks.

Verified locally: production build, all 15 check suites, and portable release
checks pass. A browser shift served all ten recipes with zero losses and no
console errors. Separate playthroughs checked normal cutting, six ingredients
queued by a single short word, expiry after partial prep, final expiry, idle
expiry without typing, pause/resume, retry, and reduced motion. The mobile rail
was checked at 390 × 844 with no page overflow. Ten optimized card illustrations
total 119,452 bytes and load only in Sentence Slash. Generation prompts and
originals are saved under `art-review/recipes`; runtime artwork is in
`public/assets/recipes`. The update has not been published.
