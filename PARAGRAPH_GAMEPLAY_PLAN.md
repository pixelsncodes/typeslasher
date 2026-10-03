# Sentence Slash: Midnight Service

Design proposal · 2026-10-01 · Implemented in Typeslasher 1.3

Implementation checkpoint: Relaxed and Rush service, the 3D kitchen scene,
per-word cuts, combos, live HUD, caret-following, results chart, replay comparison,
motion/audio controls, and aggregate-history migration are implemented. The
values below remain the design and playtesting baseline. Human comfort and
cross-browser/device acceptance remain follow-up validation, not proven balance.

## Recommendation

Turn paragraph practice into a miniature midnight kitchen service. A floating
gold blade prepares ingredients as the player types. Each completed word cuts
an ingredient, each sentence finishes an order, and the paragraph builds a
counter full of completed plates. Accuracy builds a combo and makes the kitchen
more lively. An optional Rush challenge adds a time-based serving bonus later.

Keep **Sentence Slash** as the home-screen playstyle. **Midnight Service** is its
gameplay setting, so the home screen does not gain another competing mode.
Keep Gentle / Exact as typing rules, separate from Relaxed / Rush gameplay.

The first milestone is a playable visual prototype of one sentence and its
word-to-cut loop. Validate that the player can enjoy the action while continuing
to read before expanding the scene or adding pressure.

## 1. Reference analysis

Reviewed the [live Outpace game](https://outpace.ethanplus.ai/), including the
play screen, instructions, a short typing run, and results. Also read its
[repository overview](https://github.com/ethanplusai/outpace) and
[game engine](https://github.com/ethanplusai/outpace/blob/main/public/js/engine.js).
This is a design inspection, not a balance study or full repository audit.

Outpace connects correct letters to forward movement, Space to jumping, and
typing pace to an adaptive pursuing wave. Its screen combines a landscape,
compact status displays, and a readable typing area. Results include accuracy,
speed, best combo, and a speed-over-time chart. The engine separates rules and
events from the presentation and accepts explicit time values for testing.

### Principles to bring into Typeslasher

| Principle | Proposed interpretation |
| --- | --- |
| Typing visibly controls the world | Every accepted character advances the blade's preparation motion. |
| Rewards happen at several scales | Character feedback, word cuts, sentence plating, passage finale. |
| The game state is easy to read | One ingredient in focus, a small upcoming queue, and a visible plate filling. |
| The environment carries the identity | Our dimensional foods, plum kitchen, cream type, and gold blade. |
| Challenge has visible consequences | Clean typing builds a combo; optional Rush rewards prompt service. |
| Results explain the run | Show typing metrics alongside dishes served and longest clean streak. |

The main design tension is attention: gameplay can compete with reading. Keep
the blade directly above the current sentence and make rewards automatic.
Space must remain a typed space. An extra jump/dodge control would interrupt
natural paragraph entry and conflict with the current correction model.

## 2. Current Typeslasher findings

Inspected the running app and `sentence-core.ts`, `sentence-ui.ts`,
`sentence-ui.css`, `sentence-progress.ts`, the food asset/effect modules, and
the existing plans/status notes. Runtime behavior and current source take
precedence over older proposal sections in `SENTENCE_SLASH_PLAN.md`.

Existing strengths:

- Local paste / text-file import, automatic cleanup, preview, and sample stories.
- Gentle preserves capitalization and internal apostrophes while accepting either
  case; Exact requires the prepared case and punctuation.
- Committed correct characters, a bounded error tail, and Backspace correction.
- Sentence cuts, upcoming-sentence preview, pause, replay, and local results.
- A consistent plum cabinet, warm cream text, mint success, gold accents, and
  pink errors. Existing whole and cut 3D foods provide reusable art.

Main gaps:

- Most play is a large text surface. The major animation happens only after a
  sentence, leaving a long gap between rewards for longer passages.
- During play, sentence count and next-key help are visible, but live accuracy,
  WPM, character progress, and combo are absent.
- The current 620 ms sentence cut deliberately finishes before the next sentence
  appears; early keys are queued and the transition is excluded from typing time.
  The new design must account for this behavior explicitly.
- The reading region resets to its top on every render. A longer sentence needs
  caret-following instead, especially when a game scene shares the screen.
- Sentence Slash has a route that works without WebGL. Gameplay art must retain
  that usable fallback.

## 3. Gameplay: words become kitchen actions

### Scene

A small countertop theater sits above the typing deck. Ingredients move from a
prep tray on the left to a central cutting board, then tumble onto a plate on
the right. A floating gold blade traces a short arc as the current word fills.
Warm hanging lights, ticket clips, and soft steam establish the midnight kitchen.

Use our sculpted foods and existing whole/cut pairs. Start with a small selection
from the starter pack. Map words to ingredients deterministically by position;
the player's paragraph can be about anything and never needs food vocabulary.
Ingredient names are not extra typing targets.

### Input and reward rules

| Player action | Immediate response | Game consequence |
| --- | --- | --- |
| Correct character | Mint text; blade advances a fraction of its arc | Current ingredient preparation progresses. |
| Finish a word | Quick gold sweep; ingredient separates and lands on plate | Earn points; a clean word advances the combo. |
| Required space | Visible space cue resolves; next ingredient settles in | Ordinary typing progress; no separate action key. |
| Wrong character | Pink caret marker; blade briefly loses its glow | Current word becomes imperfect; clean streak resets. |
| Backspace correction | Error marker clears | Typing continues; recorded mistakes remain counted. |
| Finish sentence | Full blade flourish, plate slides to the serving shelf | One order served; next sentence follows. |
| Finish paragraph | Completed plates form a short final display | Results appear after the final flourish. |

Define a gameplay word as a non-whitespace token in the prepared sentence.
Attached punctuation belongs to that token in Exact. A cut happens when its
final required character is accepted; a following space is still required to
advance the passage. A final token without a trailing space still cuts.
Punctuation-only tokens may animate but do not increase the clean-word streak.
Only the accepted character cursor can award a word or sentence event.

Long words get a longer visible preparation arc, not a longer blocking animation.
A one-word sentence awards its word and sentence events once each, with one
combined visual flourish. If words arrive faster than the scene can animate,
merge cosmetic effects; never delay or drop valid input.

### Combo and points — starting values for playtesting

- Every five consecutive clean words raises the next word's multiplier by one,
  from x1 to a maximum of x5. Display progress as five small blade marks.
- Award a token's base points on completion: 10 times its required non-space
  character count. Apply the multiplier established before that token began.
- A mistake resets the streak and current multiplier. That imperfect token
  earns only base points when eventually completed. Correcting it cannot make
  it clean again. Backspace itself never awards points or damages the streak.
- An entirely clean sentence earns a proposed 100-point plating bonus.
- Combo changes the blade trail and a few kitchen lights. It never changes
  text size, line layout, or the required characters.
- Relaxed play has no clock penalty, lost lives, skipped text, or early failure.
  Players can take time to correct a mistake and still complete the paragraph.

These points support replay of the same prepared passage. Arbitrary passages
have different lengths and difficulty, so total score is not a general typing
ability ranking. First release offers same-visit replay comparisons and local
streak records; it does not require storing passage text or adding leaderboards.

## 4. Screen layout and UI

Desktop composition, with illustrative values:

```text
 TYPESLASHER       SENTENCE SLASH · MIDNIGHT SERVICE       Sound  Pause

 Sentence 2 / 6      WPM 42      Accuracy 98%      Combo x2
 Passage  [================.................................]  34%

              warm lights · clipped order tickets
    next foods → [ ingredient + floating blade ] → filling plate
                          CLEAN CUT +60

 TYPE THIS SENTENCE                                      Gentle
 The kitchen glowed as we prepared the midnight feast.
         completed text · current caret · remaining text

 UP NEXT   A tiny bell rang beside the serving window.

 Next key / optional finger cue                  Esc pause · Finish
```

### Layout priorities

- Use an upper game strip, a stable typing deck underneath, and a compact HUD.
  As a starting allocation, give the scene roughly one third of usable height.
  Reading space wins when content needs more room.
- Keep the blade and plate near the caret's horizontal region. Avoid gameplay
  events at opposite screen corners that require constant eye travel.
- Show the current sentence in context, with the active word and character
  clearly marked. Keep a subtle next-sentence preview. Long sentences scroll
  within the reading region only when the caret leaves its comfortable band.
- Passage progress uses accepted required characters / total required
  characters, including spaces inside prepared sentences. Sentence markers are
  secondary, because sentence lengths differ substantially.
- Show live WPM only after 15 seconds of active typing, consistent with the
  current results threshold. Before then show an em dash. Refresh metrics a few
  times per second, rather than causing text to jitter on each keystroke.
- Put Pause and Sound within reach. Put Exit / Edit passage / Finish early in
  pause options as well. Restoring focus must not swallow the next character.
- Provide a collapsible finger cue using existing guidance where supported;
  punctuation and Shift require an explicit mapping before enabling that cue.
- Keep setup concise: passage editor → cleaned preview → typing style and
  gameplay choice → start. Use the existing samples for immediate entry.

### Visual treatment

- Background `#16131f`; plum surfaces around `#30233e` and `#3a2b46`.
- Cream `#fff4d8` for primary text; mint `#9ce2bf` for accepted characters;
  gold `#ffd453` for blade, caret, and primary actions; pink for correction.
- Keep Outfit for interface labels and DM Mono for typing and compact metrics.
- Match existing substantial keycap buttons and cabinet edges. Reserve glows
  for actionable feedback, rather than illuminating every panel equally.
- Keep text on an opaque, quiet surface. Food, steam, particles, and lighting
  remain outside the reading area.

### Motion and sound

Target timings for prototyping: character response within the next frame,
roughly 150–220 ms for a word cut, and 450–620 ms for a sentence serve.
Alternate a few cut directions and plate landings to avoid repetitive motion.
Use subtle character ticks, a short word slice, and a warmer serving chime.
Respect existing effect volume and mute; rapid typing must not stack loud sounds.

Initially retain the existing sentence-transition queue and time exclusion.
Animate the plating alongside that transition. Word cuts never block input.
Moving to an immediate next-sentence reveal would be a separate playtest decision,
because the current release explicitly waits for the previous cut to finish.

Reduced motion uses static ingredient swaps, progress fills, and brief color
changes. Remove flying pieces, camera movement, sparks, and continuous steam.
At narrow widths or 200% zoom, shrink the decorative scene first, wrap the HUD,
and preserve readable text. A physical keyboard remains the supported input.

## 5. Optional challenge: Rush service

Add after the Relaxed loop is enjoyable. Rush puts a freshness gauge on the
current order. Completing the sentence while it is fresh earns an extra serving
bonus and a bright bell. When freshness expires, the plate cools and the bonus
is lost; the player still finishes the sentence and proceeds normally.

Use sentence length to set the allowance. Prototype a chosen target WPM and
`max(12 seconds, 4 seconds + 60 × requiredCharacters / (5 × targetWpm))`.
Treat the formula and its grace time as tuning values, not validated balance.
Offer a visible pace selection; account for punctuation-heavy Exact passages
in testing. The timer starts on the first typing attempt for that sentence.

Pause, focus loss, countdowns, and sentence transitions freeze freshness.
If adaptation is introduced, adjust only future orders, within visible bounds;
never accelerate the current order in response to a short burst of typing.
Keep Rush records distinct from Relaxed and Gentle distinct from Exact.

The motivation is to serve more fresh orders and improve accuracy. A pursuing
hazard, combat controls, or losing the passage is unnecessary for this concept.

## 6. Results

Lead with orders served and a small final food composition, then show:

- Accuracy, average WPM, active typing time, and passage completion.
- Longest clean-word streak and clean sentences.
- Rush only: fresh orders / completed orders.
- A compact speed-over-time chart after sufficient typing, with an accessible
  text summary. Sample using active time; omit pauses and transitions.
- One concrete practice note based on recorded behavior, such as a frequent
  mistyped character. Never claim which physical finger the player used.
- Replay passage, Edit text, New passage, and Home.

Keep partial practice clearly labeled. Passage text remains in visit memory.
Save only bounded, versioned aggregate results. Detailed chart samples can stay
in memory for the result screen; they need not expand permanent storage.

## 7. Implementation shape

| Area | Proposed work |
| --- | --- |
| `src/sentence-core.ts` | Retain authoritative typing/correction rules. Add typed events for accepted characters, word completion, mistakes, and sentence completion, carrying stable sentence/token IDs. |
| New `src/sentence-game.ts` | Pure state for clean streak, points, completed plates, and later freshness. Consume events once; inject active time. |
| New `src/sentence-scene.ts` | Draw blade, ingredient queue, board, and plate. Consume state/events; never award progress based on animation timing. |
| `src/sentence-ui.ts` / `.css` | New scene region, HUD, progress, caret-following, setup choices, and results. Preserve focus, input queue, and pause behavior. |
| `src/food-assets.ts` / `src/slice-effects.ts` | Reuse starter models and cut pairs; adapt effects to fit the sentence scene's smaller scale. |
| `src/preferences.ts` / `src/main.ts` | Pass theme, volume, motion, and quality settings into the sentence route; keep menu/food loops inactive while it runs. |
| `src/bootstrap.ts` | Keep paragraph typing usable if WebGL or assets fail; use a lightweight 2D/CSS presentation. |
| `src/sentence-progress.ts` | Versioned optional game metrics and migration of the existing 12-record history. No source text persistence. |
| `tools/check-sentence.mjs` and a new rule check | Cover word-event boundaries, points, streaks, clocks, and persistence alongside existing typing checks. |

Keep rendering incremental: update accepted/error character states without
rebuilding the entire sentence on every key. Use bounded ingredient/effect
pools. Load only the initial food pack needed for the scene. Respect quality
caps and stop rendering while paused, hidden, or outside the game.

Prepare a small event adapter first: the current typing session advances its
sentence index before returning `slash`, so completion events must include the
just-completed sentence/token identity instead of reading the next sentence.
Test the last token and final passage character carefully for duplicate awards.

## 8. Delivery sequence and acceptance

### Phase 1 — Prove the feeling

Build a separate development prototype using one sample sentence, a few existing
foods, the real typing rules, blade progress, word cuts, and one plating sequence.
Include a compact HUD and reduced-motion treatment. No new art pack is needed.

Accept when a player can explain the word-to-cut relationship immediately,
follow the sentence without losing the caret, and enjoy rewards at both slow
and fast typing speeds. Observe real beginner and experienced typists.

### Phase 2 — Ship the Relaxed experience

Integrate arbitrary prepared passages, all boundary cases, combos, progress,
results, replay, audio/settings, no-WebGL fallback, and responsive layouts.
Retain the current passage preparation and correction behavior.

Acceptance checks:

1. A correct character, word, sentence, and final passage each trigger the right
   event exactly once; wrong input and paste never advance the scene.
2. Gentle apostrophes, Exact punctuation, typed spaces, one-word sentences,
   long tokens, long sentences, lists, and final words without spaces work.
3. Fast typing through sentence transitions preserves ordered input and awards.
4. Pausing during a cut, switching tabs, resuming, replaying, finishing early,
   and leaving the screen cannot leave stale timers or effects.
5. Accuracy counts original mistakes after correction. WPM, charts, and game
   clocks share the same active-time definition.
6. Keyboard focus, 200% zoom, narrow screens, reduced motion, mute, slow asset
   loading, and unavailable WebGL all leave typing usable.
7. Quality settings and paused rendering remain effective. Food Slash and
   existing saved practice records continue to work.
8. Run the existing checks, production build, and release validation, then do
   targeted browser playtests. A child/beginner comfort check is essential.

### Phase 3 — Add and tune Rush

Add freshness, pace selection, separate results, and optional later adaptation.
Test around 15, 30, 60, and 100 WPM with realistic mistakes and correction time,
using both short and long sentences and both typing styles. Confirm the challenge
does not encourage ignoring errors or holding a key to farm progress.

Further scenery, themed serving counters, and more elaborate finales can follow
only if they improve replay value without making the text harder to read.

## Next validation step

Playtest the implemented **blade → word cut → plate → sentence serve** sequence
with beginner and experienced typists. Observe reading comfort, sentence length,
correction behavior, and the Rush allowance before changing the scoring or
adding more scenery. See `STATUS.md` for completed implementation checks.
