# Sentence Slash — second playstyle

Planning checkpoint: 2026-09-22. The first production release is implemented in
Typeslasher 1.2. This document also retains future ideas and playtest gates.
User brief: bring a paragraph, type a sentence, slash it on completion, and see
the next sentence subtly underneath. The slash should feel dramatic and satisfying.

## Product direction

Keep one Typeslasher identity with two playstyles:

- **Food Slash**: the existing flying-food game, with Arcade and Beat Kitchen.
- **Sentence Slash**: accurate, self-paced typing with sentence-sized celebrations.

Sentence Slash is a full playstyle, separate from the four short Training lessons.
Do not place it beside Arcade and Beat Kitchen as if all three had the same setup.
Add a compact Food Slash / Sentence Slash choice above the home Play button.
Remember the selected playstyle. Each has its own setup summary and primary action.
Food Slash retains its basket, challenge, pace, and rhythm settings.
Sentence Slash shows Add text until there is a prepared passage in this visit.
Without remembered passage text after a reload, return to Add text rather than a
dead Play button. Built-in samples offer an immediate way to try it.

Recommended first release: English, physical keyboard, untimed sessions, pasted
text and local UTF-8 .txt files. No account, server, or AI conversion is necessary.
PDF, Word, webpage import, automatic story generation, multiplayer, timed racing,
and additional languages can follow after the core loop is validated.

## Player journey

1. Choose Sentence Slash → Add your text.
2. Paste a paragraph, choose a .txt file, or choose one of three short original
   samples: a snack adventure, a space mission, or a funny everyday story.
3. Review the playable passage and choose Gentle or Exact typing.
4. Press Start → a short ready countdown → type the first sentence.
5. Complete the sentence → slash → continue straight into the next sentence.
6. Complete the passage → final flourish and a readable scorecard.
7. Choose Replay passage, Edit text, New passage, or Home.

Do not interrupt this flow with a reward dialog after every sentence.

## Text preparation and upload

Use a large labeled text box, a Choose text file button, and sample chips. File
selection reads locally; explain simply: “Your text stays in this browser.”
Drag-and-drop is optional polish, not a dependency for the first release.

Proposed limits: 64 KiB per file and 10,000 characters after normalization.
Reject oversize input clearly; never silently truncate it. Empty, whitespace-only,
unreadable, or unsupported files leave the editor open with an actionable message.
Replacing a prepared passage preserves the previous one until the new import
succeeds. Replacing an edited draft asks before discarding that draft.

Normalize line endings, repeated whitespace, non-breaking spaces, typographic
quotes into a consistent playable version. Preserve the
original editor text until the player accepts the preview. Explain any changes
briefly in the preview; never show one character while requiring a different one.

### Automatic article and list cleanup — user requirement, 2026-09-22

Cleanup is automatic for both Gentle and Exact typing, before sentence splitting
and character validation. The preview shows the cleaned version; the player does
not need to manually remove Wikipedia formatting or switch on a cleaning option.

- Keep the readable words of ordinary links, but remove their destinations and
  formatting. Both a pasted HTML link and Markdown `[Sleep Token](https://...)`
  become `Sleep Token`. Remove standalone web URLs entirely. Never fetch links.
- Remove reference links and citation markers such as `[1]`, `[12][13]`, `[1–3]`,
  and Markdown/HTML links whose labels are those markers. Recognize escaped
  Markdown forms too, including `[\[1\]](https://...)`. Remove copied citation
  maintenance markers such as `[citation needed]`. Preserve ordinary bracketed
  prose; do not use a blanket rule that deletes everything in square brackets.
- Remove em dashes and en dashes as typing characters, replacing them with a
  word boundary and collapsing spaces so `music—especially metal` becomes
  `music especially metal`. Preserve normal hyphens inside words such as
  `well-known`. This rule applies even in Exact mode.
- Strip bullet symbols, ordered-list prefixes (`1.`, `1)`, `a)`), Markdown list
  markers, and checkbox markers from recognized list items. Treat **each item
  as its own typing sentence**, including an item without terminal punctuation.
  An item containing multiple grammatical sentences stays one playable item.
  Wrapped continuation lines remain part of the same item; nested items become
  separate targets in reading order. Do not combine adjacent items into a paragraph.
- Detect list prefixes only at actual item boundaries. Preserve numbers within
  prose and decimals; an ordinary paragraph beginning with a year is not a list.
  Drop items that become empty after citations/URLs/formatting are removed.

When clipboard HTML is available, use its link/list structure only to extract
safe text and item boundaries. Never insert that HTML into the live page or load
its images/resources. Plain text and .txt imports use equivalent text rules;
ambiguous plain-text wrapping remains correctable in the preview. Non-content
markup/scripts must not become executable content or typing targets.

Preparation order: enforce raw input limits → extract text and preserve list
boundaries → remove citations/link destinations/URLs/list markers → normalize
dashes and whitespace → split ordinary prose into sentences while preserving
each list item → apply Gentle/Exact transformation → validate → preview.
Show a small summary such as “Removed 4 references · Prepared 3 list items.”
Keep cleanup deterministic and idempotent; re-previewing must not alter it again.

Examples (Exact mode, so ordinary punctuation remains):

| Imported text | Playable result |
| --- | --- |
| `Sleep Token[1] is a band—formed in London.[2]` | `Sleep Token is a band formed in London.` |
| `[Read more](https://example.com)` | `Read more` |
| `- Practice slowly.` followed by `- Keep your hands relaxed.` | Two separate targets: `Practice slowly.` and `Keep your hands relaxed.` |
| `1. Find F and J` followed by `2. Return to the home row` | Two separate targets without numbering or an extra required full stop |

Sentence boundaries need tests for abbreviations, initials, decimals, ellipses,
quoted punctuation, blank lines, and text without a final full stop. Prefer a
language-aware splitter with a tested fallback; do not just split on every dot.
Before play, show sentence count, character count, and a numbered preview.
Offer Merge with next / Split here corrections, or an equivalent simple boundary
editor, because arbitrary imported prose cannot always be segmented correctly.

English-only v1 must identify characters it cannot support before Start. Show the
affected text and let the player edit it. Do not silently delete emoji, accented
letters, or other scripts, and never create an untypeable target. Treat all input
as untrusted content: extract safe readable text and never execute source markup
or scripts. See the automatic cleanup rules above.

## Typing rules

Two settings, explained with an example rather than a complex difficulty form:

| Setting | What the player types | Purpose |
| --- | --- | --- |
| Gentle, default | Lowercase letters and spaces; punctuation omitted from the playable preview | Learn words and spacing without Shift pressure |
| Exact | The normalized sentence, including case, punctuation, digits, and spaces | Practice ordinary written text |

Gentle transformation must be visible before starting, and the boundary splitter
runs before punctuation is removed. Sentences that become empty are excluded
with a preview note. A passage with no playable characters cannot start.

Use a stable, correction-required tutor interaction in both settings:

- The current character has a strong caret/underline. Correct characters change
  color; upcoming characters remain legible. Color is not the only cue.
- Wrong characters appear at the caret with a small error marker. Backspace
  removes them; subsequent text cannot advance until the error is corrected.
  Keep a bounded error tail and an explicit “Backspace to correct” hint.
- Backspace at an error-free caret does nothing in v1; accepted characters are
  committed. State this in the first-run hint. Error correction cannot erase
  recorded mistakes or improve the historical accuracy denominator.
- Spaces count. Make the current space visible with a small space-key marker.
  Do not require an invisible trailing space, Enter, or an extra confirmation.
- The final required character completes a sentence exactly once. The final
  sentence completes the passage exactly once.
- Ignore modifier-only events, browser shortcuts, repeated held-key events,
  and input while paused or in a menu. Caps Lock gets a helpful hint in Exact.
- Pasting is supported in the passage editor; it does not complete gameplay.
  Give a neutral “Type this passage to practice” message if attempted during play.

Use a real accessible text-input surface with controlled input/composition
handling. The existing food game's a–z key handler is not sufficient. Do not
apply global keyboard capture while the editor, buttons, or other dialogs have
focus. Full IME/language support is outside v1; unsupported composition must not
award progress or strand the session.

## Sentence stage

Retain the plum arcade cabinet, cream text, mint correct letters, warm gold slash,
and pink error accents. This screen should feel like practicing inside the game.

Layout:

    SENTENCE SLASH       3 / 8 sentences       Pause

              [current sentence, large and readable]
               typed text | next character | remaining

              [next sentence, smaller and quieter]

                next key / optional finger guide

The active sentence is semantic HTML text, not a texture that makes reading or
accessibility depend on WebGL. Prefer generous monospace spacing and a centered,
bounded reading width. Keep metrics quiet during play; show accuracy and sentence
progress first, with speed primarily on the result screen.

The upcoming sentence is one preview only, below the active sentence, smaller
and lower contrast but still readable. Avoid blur as the only hierarchy cue.
It has no active caret and never accepts input. On the last sentence, replace it
with “Last sentence — bring it home.” No duplicate screen-reader announcements.

Wrap long sentences by words. Keep the caret's current line visible inside a
bounded reading area; scroll only at line boundaries and respect reduced motion.
Do not shrink text to fit arbitrary paragraphs or require horizontal scrolling.
Long unbroken words wrap safely. Completing a visual line is not completing a
sentence: award and slash only at the true sentence boundary.

Reuse the optional guide, extending it for Space/thumbs, digits, punctuation,
Backspace, and opposite-hand Shift guidance for the supported US-QWERTY layout.
Show the supported layout in setup; do not imply guidance is accurate for every
keyboard. Keep the guide stationary while effects animate around the sentence.

## The signature slash

Make sentence completion the big reward. Proposed 450–650 ms visual sequence:

1. **Charge, about 60 ms:** the finished sentence brightens and a narrow cut line
   forms. Brief visual emphasis; no full-screen strobe.
2. **Strike, about 100 ms:** a gold/cream diagonal blade crosses the completed
   sentence with a pink trailing edge, a tight whoosh, and a crisp impact sound.
3. **Separation, about 200 ms:** two decorative clipped copies of the completed
   text separate along that diagonal, rotate slightly, and shed a few glyph sparks.
4. **Release, about 200 ms:** fragments fade while the next sentence settles into
   place. The last sentence receives a slightly larger final flourish.

No arbitrary real-time 3D text cutting is needed. Use clipped HTML copies for
the readable text split and a small overlay effect for the blade and particles.
Keep decorative copies aria-hidden and pointer-transparent. Cancel and clean up
all effect objects on replay, leaving the mode, resize, or interruption.

**Responsiveness is a release requirement:** the next sentence becomes logically
active immediately after completion, with a visible caret. Its first keystrokes
must work while the previous sentence's decorative fragments are still moving.
Do not freeze the keyboard for a celebration. Keep the outgoing ghosts behind
or away from the newly active reading area. Cap concurrent effects for short
sentences completed rapidly; prove there are no missing or duplicated characters.

Reuse sound controls, mute, and reduced effects. Reduced mode uses a brief cut
line, quiet impact, and fade: no rotation, sparks, or shake. Audio is optional
and starts only after the user's gesture. Screen shake remains opt-in and never
moves the active text or keyboard guide. A no-WebGL path still supports typing
and a CSS slash; this playstyle should not depend on successful food-pack loading.

## Timing, results, and motivation

No time limit, lives, miss penalty, or auto-increasing speed in v1. Sentence
length comes from the passage; adaptation must not rewrite imported text.
Pause on Escape, hidden tab, or lost window focus. Resume explicitly, preserving
the caret and error tail. Don't let audio or effects resume invisibly in a tab.

Measure active typing time from the first printable attempt. Exclude countdown,
explicit pauses, and unfocused time. Include ordinary thinking time and error
correction. Since typing continues during effects, those intervals count too;
do not subtract animation duration to inflate speed.

Results prioritize accuracy, sentences finished, and passage completion. Show
WPM secondarily: accepted target characters / 5 / active minutes. Accuracy is
correct printable attempts / all printable attempts; Backspace and modifiers
are not attempts. Errors remain counted after correction. Show no speed rating
for samples under 15 seconds; empty sessions show dashes instead of fake 100%.
Avoid a second arcade score formula in v1. Celebrate completion and personal
improvement without penalizing deliberate beginners.

Early Finish produces a clearly partial summary. Never call a partial passage
complete or compare it with a completed-passage best. Replay uses the same
prepared passage and typing setting. New text returns to the editor.

Custom passages differ in difficulty, so don't claim an overall WPM personal
best is a fair comparison. Built-in passage bests can be keyed by sample id,
revision, and typing setting. Custom text gets session stats without a global
leaderboard or a stored content fingerprint in v1.

## Progress and privacy

Keep imported text in memory by default. Refresh closes the draft; show that
plainly before starting. Do not store raw text, filenames, or excerpts in history,
logs, or analytics. Persistent drafts and session resume are a later opt-in
feature with an explicit remove action.

Use a separate versioned sentence-practice store for v1. Save aggregate accuracy,
accepted characters, attempts, active time, sentences completed, completion
status, typing setting, and supported key statistics. Bound history to 12 recent
sessions, like the existing notebook. Separate cumulative totals from history.
Expose both playstyles through the notebook, with separate summaries and records.
Reset learning progress must clearly cover both stores. Blocked/corrupt storage
falls back safely without preventing play.

Do not pass sentence sessions into the existing addSession function unchanged:
it treats every non-prep session as food gameplay and increments food unlocks.
Sentence completion must not change food counts, kitchen-look unlocks, arcade
scores, or arcade bests. New sentence cosmetics can be considered later.
Keep existing food key statistics intact; any combined letter view must label
its sources and avoid treating unsupported keys as known finger mappings.

## Engineering boundaries

Keep TypeScript, semantic HTML/CSS, and the existing asset/audio infrastructure.
Suggested independently testable modules:

- passage preparation: validation, normalization, supported characters, boundaries;
- sentence session: state machine, cursor, errors, timing, metrics, completion;
- sentence screen: editor, preview, stage, results, accessible focus;
- sentence effects: decorative slash lifecycle and reduced-motion fallback;
- sentence progress: versioned parsing, persistence, and notebook adapter.

Session states: editing → preview → ready → typing → results, with explicit pause
and exit paths. The slash is an effect of successful completion, not a blocking
state that owns input. Use one authoritative input owner for menus, food play,
sentence play, and training. Attach/detach ownership on navigation; test switching
both directions. A session token prevents late callbacks from updating a new run.

Before wiring the playstyle into home, replace the current hidden legacy form
controls as the source of food setup with a typed shared setup state. Preserve
existing preference keys. The current UI-2 integration intentionally keeps these
controls as a bridge; a second playstyle would otherwise compound that coupling.
Avoid a whole-engine rewrite: isolate navigation, setup, and input ownership only.
Lazy-load food gameplay/assets when Food Slash is selected; a failing optional
food GLB must not block paragraph editing or sentence play.

## Delivery phases and acceptance gates

Retain the established model preference: routine integration uses the previously
recommended Sol medium; all new visual assets use Astra. Announce the model
recommendation before each implementation phase. No model changes are made by
this plan. Work sequentially to manage usage and keep each phase reviewable.

| Phase | Deliverable | Gate before continuing |
| --- | --- | --- |
| S0: integration foundation | Typed setup/navigation and single input owner, preserving existing food behavior | Existing suite passes; home → both food modes → pause → results → replay still works; preferences survive reload |
| S1: isolated tutor prototype | Paste/.txt/sample → preview → Gentle/Exact → sentence and next preview → basic slash → real results | Capitals, spaces, punctuation, correction, boundaries, long text, pause, and early finish work without food assets |
| S2: signature effect | Dramatic split, sound, final flourish, reduced-effects version | Child likes repeated cuts; rapid input crosses boundaries without loss; long text stays readable; no growing resource use |
| S3: production integration | Home playstyle choice, persisted preferences, separate progress, notebook access, release | No food progress migration/regression; first visit and returning-player flows work end to end |
| S4: final playtest | Responsive/accessibility/browser/error-state/performance checks and portable build | Family laptop test plus Chrome/Edge and Firefox; Safari if used; no input loss or blocked import states |

Release 1.2 now contains the S1 loop, code-drawn S2 slash and reduced-effects
variant, and S3 home/progress integration. S0 uses the existing food preference
controls as a bridge rather than a full typed navigation rewrite. S4's local
browser and portable-build checks are complete; family and cross-browser gates
remain. No new Blender models were required. Astra can tune the visual effect
or make supporting art after child feedback.

## Test matrix

- Text: empty/whitespace, one sentence, no punctuation, multiple paragraphs,
  abbreviations, initials, decimal numbers, quotations, smart punctuation,
  oversized file/text, unsupported characters, invalid encoding, literal HTML.
- Cleanup: Wikipedia numeric/linked/escaped citations, adjacent/ranged references,
  ordinary bracketed prose, named links, bare URLs, em/en dashes, hyphenated words,
  HTML/plain-text/Markdown lists, numbered/nested/wrapped items, multiple sentences
  in one item, checkbox lists, empty cleaned items, and repeated cleanup passes.
- Input: spaces, repeated letters, uppercase, punctuation, numbers, Shift,
  Caps Lock, wrong characters, Backspace, held keys, paste, composition,
  browser shortcuts, final-character race, and rapid consecutive sentences.
- Lifecycle: pause mid-error, blur mid-slash, close tab, resize, replay during
  a fading effect, leave/re-enter, switch playstyles, and dialog focus ownership.
- Metrics: empty, short, partial, full, corrected mistakes, paused time,
  double-completion prevention, and each typing setting kept separate.
- Storage: prior food saves preserved byte-for-byte unless the user plays/changes
  food settings; blocked/quota/corrupt sentence store; no raw passage persistence.
- Visual: short/long sentences, 1280×720 and compact layouts, 200% zoom,
  keyboard-only menus, reduced effects, muted audio, and no-WebGL sentence path.

## Original game audit and next work

Historical planning audit, verified from source and checkpoint documents on
2026-09-22; npm run check passes
all current game and asset checks. No new browser playtest or production rebuild
was performed for this planning review; earlier visual checks are historical.

**Complete:** all five original phases; Arcade and Beat Kitchen; four challenges;
adaptive pace; guides and four warm-ups; pause-safe timing; scoring, sound,
settings, local learning, and cosmetic looks; 26 whole/cut foods; UI-1 design and
UI-2 integrated Home/Setup/Results with working Play and Play Again.

**Still open:** UI-3's deeper Training, Locker/notebook, Settings/calibration, and
first-run experience; context-aware warm-up completion advice; UI-4's final child
playtest, keyboard/accessibility polish, performance and cross-browser checks,
and forced asset-load/storage failure checks. The shared Three.js bundle-size
advisory is still documented; do not optimize it at the expense of this feature's
typing behavior without measurement.

Source review confirms three practical integration tasks: hidden legacy menu
controls remain in main.ts; global key handlers need explicit ownership; progress
currently only recognizes arcade/beat/prep and food-based unlocks. These are
known boundaries to address, not claims that the current game is broken.

**Next review:** child feedback on sentence pacing and the slash effect, then an
Astra visual pass if warranted. Continue UI-3's Training and Settings interiors,
then finish UI-4/S4 device, accessibility, and cross-browser checks. The existing
26 foods already provide variety; more food packs are not a release dependency.
