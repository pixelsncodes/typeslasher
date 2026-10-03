# Typeslasher — game and development plan

Status: All five game phases and the 26-food expansion are implemented. The next
proposed work is the menu and experience redesign in [UI_REFRESH_PLAN.md](UI_REFRESH_PLAN.md),
based on the full UI audit. See STATUS.md for validation coverage and README.md
for play and release instructions. The UI refresh is planned, not implemented.

## Direction

A keyboard-first browser arcade game for a 12-year-old learning to type. Colorful food launches into the arena; typing its name builds a slash, and completing it splits the food with a satisfying burst. Short sessions reward accuracy, growing confidence, and personal improvement.

Design read: a playful arcade game for a young beginner, with sculpted toy-food, bold typography, and a spacious, readable playfield. Apply Taste Skill's audience-led art direction, hierarchy, consistency, and purposeful motion. Its landing-page conventions are contextual; this game's colorful brief and legibility take priority.

Initial assumptions: English words, standard QWERTY physical keyboard, desktop/laptop browser, single player, progress saved on the device. Mobile may show menus but touch typing is outside the first release.

## Core loop

1. Choose a difficulty and play a 90-second round.
2. A food item rises from the bottom, turns gently, and follows a slow arc. A large lowercase word label follows it without rotating.
3. The first correct letter selects a target; accepted letters fill in visibly and grow a slash trail.
4. Finishing the word immediately slices the food. No Enter key needed. Two halves tumble away, particles pop, and a short musical sound rewards success.
5. Consecutive completed words build a capped score multiplier. A missed food breaks the combo. Wrong keys lower accuracy but never erase correct progress or trigger a harsh penalty.
6. At the end, show accuracy first, completed foods, speed, a personal best if earned, and one useful next practice suggestion.

Beginner mode has no game-over condition. Later arcade difficulty can have three misses, but failing early should remain optional. Escape pauses; leaving the tab pauses automatically. Returning requires a deliberate resume and short countdown.

Target rules: active words have distinct first letters so selection is predictable. Once selected, a word stays selected until completion or expiry. Display the target prominently. Ignore held-key repeat so holding a letter cannot complete repeated letters. Ignore shortcuts and inputs while a menu is focused. Start with letters only and case-insensitive matching; add spaces and punctuation only in later lessons.

## Teaching typing

The game cannot sense which physical finger presses a key. The guide teaches and reminds; it must not claim to verify technique.

- A short first-run demonstration places the left hand on A S D F and the right on J K L ;, with index fingers finding the F/J bumps and thumbs resting near space.
- A bottom keyboard strip and two simplified hand diagrams highlight the next key and the recommended finger. Include labels such as “Left index,” so color is not the only cue.
- Use conventional QWERTY finger zones: left pinky Q/A/Z, ring W/S/X, middle E/D/C, index R/F/V/T/G/B; right index Y/H/N/U/J/M, middle I/K/comma, ring O/L/period, pinky P/semicolon/slash. Numbers and Shift are later extensions.
- Keep guides visible by default; offer compact and hidden versions as confidence grows.
- Encourage accuracy before speed. Recommend a comfortable posture and relaxed hands in one brief setup card.

Food names require letters across the keyboard, so a strict home-row curriculum needs a separate warm-up. “Prep School” starts with short letter sequences presented as ingredients, then expands to top and bottom rows. Arcade food-name mode remains available immediately with generous time and full guidance.

Progression: home-row warm-up → short food names with full guidance → whole-keyboard words → longer words and multiple targets → optional rhythm challenges. Never require speed to unlock essential instruction.

## Difficulty and adaptation

The original tuning targets below describe future catalog expansion. Version 1.0 uses the existing eight 4–6 letter food names across all four presets; presets vary capacity, spacing, and timing. Relaxed base time is 14–18 seconds, initially multiplied by 1.0 / 0.9 / 0.8 / 0.7 for Sprout / Slicer / Chef / Master. Fixed mode preserves those factors; optional adaptation stays within the preset bounds. Later word lengths remain dependent on playtesting and new assets.

| Preset | Typical word length | Simultaneous foods | Initial time per food | Experience |
| --- | --- | --- | --- | --- |
| Sprout | 3–5 letters | 1 | 10–14 seconds | Full guide, gentle motion, no failure |
| Slicer | 3–7 letters | 1–2 | 7–11 seconds | Combos and more variety |
| Chef | 4–10 letters | 2–3 | 5–9 seconds | Faster waves and longer words |
| Master | 5–12 letters | Up to 4 | 4–8 seconds | Optional survival challenge |

Use word-length-adjusted deadlines, not the same timer for “pea” and “watermelon.” Initially use preset timing; later estimate comfortable seconds per correct character and add a recognition allowance. Keep this estimate inside the preset's bounds. The food must remain in its usable screen area for its entire deadline; ordinary fast gravity would make beginner typing impossible.

Evaluate after each 10 resolved foods. If at least 9 were completed and character accuracy is at least 95%, adjust one pressure variable a small step: spawn spacing, deadline, or word difficulty. If 3 or more foods were missed or accuracy falls below 85%, ease one step. Otherwise hold steady. No mid-word deadline changes. Cap pressure within the selected preset and offer a fixed-difficulty toggle. Exclude pause time from every metric.

Starter examples: pea, egg, pie, yam, fig, pear, kiwi, lime, plum, corn, apple, grape, mango, peach, carrot, banana, cookie, muffin. Expand to foods such as broccoli, popcorn, avocado, sandwich, and watermelon after the core experience works. Store word length, required keys, category, asset ID, and lesson suitability in one data catalog.

## Visual and sound direction

Theme: “the midnight snack arcade.” Deep ink-blue backdrop (#17283B), warm cream labels (#FFF4DB), watermelon pink (#FF647C), citrus yellow (#FFD34E), mint (#67DDB0), and carrot orange (#FF964F). Verify actual text contrast during implementation.

Rounded, slightly exaggerated 3D food with matte surfaces, clear silhouettes, visible seeds or interiors, soft lighting, and gentle squash on launch. Keep the backdrop calm so the colorful objects and words remain easy to track. Outfit for menus and a clearly distinguishable monospace font for the typing labels; self-host fonts with appropriate licenses.

Screen layout: a slim score/combo/time strip at the top; the arena in the main area; the active word and finger guide below. Start screen has a large Typeslasher title, a composed food scene, one obvious Play button, difficulty selection, and access to practice/settings. Results use clear typography and one strong Replay action.

Each successful letter gets a subtle response; word completion gets the large response. Effects must never cover unsliced labels. Provide separate music/effects volume, mute, reduced effects, and screen-shake controls. Keyboard guidance stays still even when decorative elements move.

Rhythm influence starts with musical typing feedback and beat-shaped visual pulses. A later “Beat Kitchen” mode launches foods on beats, with an optional timing bonus for completing a word near a beat. Do not demand each letter land on a beat while teaching basic typing. All essential cues remain visual, and ordinary arcade timing is independent of the soundtrack.

## Three.js and asset approach

Use Vite, TypeScript, and Three.js, with lightweight HTML/CSS menus and word overlays. Keep rendering separate from input, score, timing, and progression so those rules can be tested without a graphics scene. Use an orthographic camera for readable 2.5D presentation, simple scripted arcs, and a single animation loop. Avoid a physics engine in the first version.

Suggested modules: game state, input/target selection, food catalog, spawn/timing director, scene renderer, effects/audio, finger guide, and local progress storage. Menus and labels use semantic HTML; update transforms without rebuilding the interface every frame.

Start with roughly eight recognizable procedural food meshes and reusable prebuilt halves. A completed word swaps the whole object for halves; arbitrary real-time cutting is unnecessary. Share materials and geometry, cap particles, and clean up scene resources on restart. Target smooth play on the family's laptop and test there before adding expensive effects.

Blender decision: defer until Phase 4. If the prototype is fun, replace the procedural models with a cohesive small GLB pack. Each asset contains a whole model, two split parts, modeled cut surfaces, consistent origin/scale, and reusable materials. Validate one exported apple end-to-end before producing the pack. Keep procedural assets as a fallback. No image generation is needed for the first version.

No backend or AI calls during gameplay. Save settings, unlocked cosmetics, and aggregate typing progress locally with a versioned format and a reset option. Account sync, multiplayer, leaderboards, advertising, and monetization are outside the initial scope.

## Phased delivery and model choices

The settings below are recommendations for future development tasks, not changes to the current task's model. They use models exposed by this Codex installation. Check availability when starting a phase. Effort is a practical starting point, not a promised allowance saving.

| Phase | Deliverable and completion gate | Recommended model / effort |
| --- | --- | --- |
| 1 — Playable slice | One arena, eight foods, one target at a time, 90-second round, correct-letter progress, wrong-key feedback, slice halves, basic finger guide, pause/restart, results. Complete a full round reliably and let the child play it. | GPT-5.6 Terra / medium |
| 2 — Learning | First-run hand guide, finger zones, Prep School warm-ups, adjustable timing, accuracy and key-level progress, local save. Verify guide mappings and confirm that a beginner can finish words without rushing. | GPT-5.6 Terra / medium; Luna / low for catalog and copy edits |
| 3 — Challenge | Four presets, multiple-target selection, bounded adaptation, combos, unlockable themes. Verify shared-initial prevention, expiry, repeated letters, and that struggling eases pressure. | GPT-5.6 Terra / medium; Sol / high only for a stubborn timing/state problem |
| 4 — Polish | Refined food assets, optional Blender pack, better slice effects, sound, reduced effects, browser/performance pass. Keep the typing words readable throughout effects. | GPT-5.6 Terra / medium; Luna / low for isolated style changes |
| 5 — Rhythm and release | Optional Beat Kitchen, visual timing cue, latency calibration if scoring beat timing, final playtest and a static production build. Verify pause/resume and music scheduling stay aligned. | GPT-5.6 Sol / medium for rhythm timing; Luna / low for release documentation |

Phase 2B includes hand diagrams, four untimed home-row warm-ups, accuracy and key-level progress, and local progress save. Phase 2A covers pause-safe timing, gated countdowns, a visible keyboard deck, and selectable typing pace. Phase 3 adds four challenge presets, predictable multi-target selection, bounded optional adaptation, combos, and cosmetic unlocks. Phase 4 completes the remodeled food pack, slice effects, audio/settings, local fonts, and rendering controls. Phase 5 adds optional Beat Kitchen, tap calibration, separate records, and the portable static release. The user authorized completing all remaining phases in one run on Astra medium, with Astra required for asset generation.

Current model preference: use Astra for all asset generation and remodeling. Sol medium is the recommendation for routine catalog/gameplay integration. Announce the recommendation before each new phase; these recommendations do not change the selected model automatically.

Post-release content expansion is complete in version 1.1: all three packs in
[CONTENT_ROADMAP.md](CONTENT_ROADMAP.md), 26 whole/cut foods, basket selection,
fair sampling, a short-word Sprout mix, length-aware labels, and per-basket bests.
The five original game phases remain complete. The next checkpoint is the
child's playtest of the expanded catalog and tuning based on that feedback.

Usage strategy: work serially on one bounded feature group, keep this plan and a short implementation status file current, and finish each phase with a playable build and brief validation report. Avoid maximum effort and repeated broad audits. Subscription consumption depends on model, task complexity, context, and tools, so do not promise a message count or total project allowance.

## Verification and playtesting

UI refresh checkpoint: UI-2 is integrated at `/`. Home/Setup/Results now launch
real rounds and display real progress. See `UI_REFRESH_PLAN.md` and `STATUS.md`.
The deeper Training/Locker/Settings redesign remains UI-3.

Automated checks should focus on real failure modes: target locking, distinct initials, held-key repeat, word expiry, pause-safe deadlines, score/accuracy calculations, and adaptation bounds. Browser checks cover a complete round, keyboard-only menus, replay cleanup, resize, sound startup after a user gesture, and persistent settings. Test current Chrome/Edge initially; check Firefox before release and Safari if it will be used.

Five-minute child playtest after Phase 1: can he understand the first target without explanation; find the guided keys; finish several foods; recover from a mistake; and choose to replay? Observe whether he watches the guide, whether labels are hard to track, and whether the timing feels unfair. Change tuning before adding content. Longer-term progress should compare accuracy and speed over several sessions, rather than rewarding a single unusually fast round.

## Sources consulted

- [Taste Skill](https://www.tasteskill.dev/) and its [contextual design guidance](https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/SKILL.md): audience-led design, typography, hierarchy, and deliberate motion. The game-specific palette, mechanics, and layout above are original proposals.
- [Official OpenAI pricing and usage guidance](https://learn.chatgpt.com/docs/pricing): model positioning and allowance variability. Model/effort assignments above are recommendations, not guaranteed cost estimates.
- [Official OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model): Astra capabilities and configurable reasoning.
