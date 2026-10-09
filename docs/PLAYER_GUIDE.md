# Typeslasher 1.6

A keyboard typing arcade with two playstyles: slice 50 sculpted 3D foods, or
turn your own paragraph into a restaurant kitchen service. Finger guidance and
an optional musical food challenge make short practice sessions inviting.

## Play on this computer

Double-click **Play Typeslasher.cmd**, then open **http://127.0.0.1:5173/**.
Keep its window open while playing. Close it when finished. Node.js must be
installed (it is already installed on this development computer).

If the game is already running, open the same address. The address matters:
progress is saved separately for each browser and site address. Local development
and the launch script both use port 5173 to preserve the same notebook. The optional
preview server at port 4173 uses a separate notebook and was used for release tests.

Use a physical QWERTY keyboard on a desktop or laptop. Small screens have a
compact layout, but the game does not include a touch keyboard.

## A comfortable first session

1. Open **Finger guide** and find the bumps on F and J.
2. Try **Prep School** for a short untimed warm-up.
3. Choose **Free Play**, **Sprout**, **Relaxed**, and a **30-second** round.
4. Type a food's name to slice it. No Enter key is needed. Wrong letters leave
   your accepted letters in place. If a food runs out of time, the next one comes.
5. Press **Escape** for a break. Leaving the tab also pauses; resume deliberately
   after the three-second countdown.

Start with a few minutes. Aim for accuracy and relaxed hands before speed.
The guide recommends a finger; it cannot detect which finger is physically used.

## Rounds and pause menu

Choose **30**, **60**, or **90 seconds** in Change setup. A new visit starts at
30 seconds. The last food keeps its remaining typing time when the round timer
ends. Personal bests are separate for each duration and mode.

**Free Play** is a single round at your chosen challenge. **Arcade** adds a
Next Round button to its scorecard. Each round gives new foods slightly less
typing time; every three rounds adds a target, up to four. Choose your starting
challenge and pace. Timing stops increasing once the safe difficulty bounds are
reached. **Beat Kitchen** remains a single round with musical timing bonuses.

Both playstyles have **Continue**, **Retry**, **Settings**, and **Exit** in their
pause menu. Retry resets the current round or passage; Arcade Retry keeps its
round number. Exit returns home. Sound, motion, graphics, food pace, and guide
controls sit under Settings, which leaves the game paused until Continue.

## Sentence Slash — Kitchen Service

The kitchen now uses the approved Blender scene, with daylight, textured surfaces,
a sink, plants, utensils and recipe-specific bowls and plates. Ten recipe baskets include
fruit mix, citrus and tropical, orchard, garden salad, roasted vegetables, berry
bowl, tofu salad, pumpkin soup, picnic plate, and bakery breakfast. Recipes use
appropriate produce and pantry ingredients, with no cookies in the bowls.
The knife cuts before the halves separate and land in the
dish; the board rests briefly before the next ingredient appears. Sentence
transitions wait until serving finishes. Less motion uses instant cuts with the
same rest between fruits. The scene fills the cabinet width and uses a lower
perspective camera. It loads on demand when starting paragraph practice.


Choose **Sentence Slash**, then **Play** on the home screen. The six illustrated stories are Restaurant shift (ten orders), Fruit adventure, Space mission, Funny day, Little kindness, and Helping paws.
The **+ Add your story** tab lets you write or paste your own passage. Your draft
stays intact when you switch back to the story menu. Press **Start** to begin. **Game options** lets you choose
**Gentle** for forgiving letter case or **Exact** for case-sensitive typing,
Relaxed or Rush service, target pace, and your first recipe. Both typing styles
require punctuation. Curly quotes and long dashes become ordinary keyboard
characters.

Each sentence is one order, with a fixed batch of ingredients. Ingredients lie
naturally in the basket and on the board, then move through cutting and into the
bowl. All cuts finish before the dish is served and the next batch arrives. Recipe
cards show the current order and the next two. All ten dishes are used before a
recipe repeats in a longer passage. Each recipe has its own serving dish: mint,
coral, wooden, garden, lilac, blue and handled soup bowls, plus roast, picnic
and bakery plates. The dish changes with the order.

Type the highlighted sentence to guide the blade. Each completed word advances
the recipe; each completed sentence serves a dish. Spaces are ordinary typing
characters. Correct mistakes with Backspace; accepted characters stay committed.
Use **Escape** to pause the kitchen and its clocks.

**Relaxed service** is untimed. Every five clean words increases the next word's
multiplier, up to ×5. Mistakes reset the streak. A perfect sentence earns 100
bonus points. The HUD shows points, accuracy, combo, and passage progress; WPM
appears after 15 seconds of active typing. Optional finger hints cover mapped keys.

**Rush service** gives each active recipe card a timer at 20, 30, 45, or 60
target WPM. Time is based on sentence length, with a minimum 12 seconds and a
four-second allowance. The clock starts when the order reaches the kitchen,
including idle time; queued orders wait. Serving in time earns 150 extra points.
If an order expires, it is counted as lost, the ingredients clear, and the next
order begins. A short shake signals the loss; Less motion uses a still alert.
Pauses, cutting animations, and sentence transitions do not consume order time.

Results include clean-word streak, perfect dishes, and a speed chart for longer
sessions. Replay compares points against the previous completed service for the
same passage, typing style, and pace during this visit. Scores from different
passages are not directly comparable. Sound, Less motion, graphics quality, and
the selected kitchen look apply to the new scene. A simple illustrated board
keeps paragraph typing available when 3D graphics cannot load.

Starting a passage removes citation markers, links and URLs, and turns each
bullet or numbered item into its own order. It also normalizes dashes and checks
for characters unsupported by this English-keyboard version. A custom story is limited to 10,000 source characters. Finishing early records partial practice.

Your source passage stays in memory for this visit. It is not saved or sent
anywhere; only recent practice results are saved in this browser. The Locker
links to both Food Slash records and Sentence Slash sessions.

## Challenges and rewards

Choose a **Food basket** before playing:

- **Original favorites:** apple, banana, carrot, cookie, corn, grape, kiwi, pear.
- **Fresh picks:** lime, plum, mango, peach, orange, donut.
- **Snack break:** egg, pie, muffin, waffle, pretzel, popcorn.
- **Big bites:** avocado, broccoli, sandwich, pineapple, strawberry, watermelon.
- **Garden harvest:** tomato, cucumber, pepper, radish, beet, mushroom, zucchini, onion.
- **Fruit market:** lemon, raspberry, blueberry, cherry, fig, pomegranate, dragonfruit, apricot.
- **Pantry & comfort:** bread, cheese, bagel, croissant, tofu, potato, pumpkin, celery.
- **Mixed basket:** all 50, or 32 short words (3–6 letters) on Sprout in Free Play.

Every basket is available immediately. Big bites is an explicit longer-word
choice even on Sprout. Longer words receive more typing time. Only the selected
models load before play; switching baskets shows a loading state when needed.
**Meet the foods** opens a rotatable whole/cut preview of your basket.
The studio's basket selector lets you browse every pack or all 50 foods.

The new Blender sources are `typeslasher-garden.blend`, `typeslasher-market.blend`,
and `typeslasher-pantry.blend`. Each contains eight whole models, sixteen cut
pieces, packed interior textures, and the generated modeling references.
Whole/cut review renders are in `art-review/*-review.png`.

Sprout has one food, Slicer two, Chef three, and Master four. Higher presets
shorten the selected pace's base time. Every active word has a different first
letter. Once selected, finish that word or let it expire before selecting another.

Completed words score 100 points times a combo multiplier, capped at ×5. A wrong
key breaks the combo; an expired food also deducts 50 points. There is no early
game-over. When the chosen round time ends, foods already on screen keep their remaining time.

**Adjust gently as I improve** changes only future deadlines. Every ten foods,
strong completion and accuracy make timing a small step faster; struggling makes
it easier. Uncheck it for a fixed challenge. Timers and results exclude pauses.

Watermelon Pop unlocks after 10 lifetime slices; Citrus Rush after 25. Both game
modes count, and instruction is always available. The notebook keeps key-level
practice, the last 12 sessions, lifetime totals, and separate personal bests for
mode, food basket, challenge, pace, and adaptation. Changing pace mid-round excludes that round
from preset bests. Resetting learning progress also resets earned looks.

## Beat Kitchen

Foods launch on a 120 BPM beat. Type each word normally; completing its final
letter within 90 milliseconds of a beat earns **25 extra points**. Missing the
beat loses no extra points. The four dots show the rhythm even with sound muted.
Normal food deadlines still apply, so there is no need to wait on a final letter.

If headphone delay makes the beat feel off, open **Sound & feel → Beat Kitchen
timing**. Listen to four clicks, then tap Space on eight beats. Consistent taps
set an offset; scattered taps leave the old setting alone. This is a practical
listening/tapping adjustment, not a hardware latency measurement. You can fine-tune
or reset it. Positive values move the cue and scoring window later. Timing changes
apply to the next round. Wired sound is usually easier to match than Bluetooth.

## Sound, motion, and performance

**Sound & feel** offers separate music and effect volume, mute, reduced motion,
optional camera nudges, and graphics quality. Reduced effects keeps foods steady,
removes sparks/flashes, and makes cuts gentler. Camera nudges default to off.
The initial reduced-motion choice follows the browser preference.

Balanced caps rendering resolution at 1.5× device pixels; Battery saver caps it
at 1× and renders at most 30 frames per second. Crisp allows 2×. Idle menus and
paused scenes do not render continuously. Audio starts only after a user gesture
and stops on pause or when leaving the tab. Unavailable audio does not block play.

## Development and release

Requires Node.js 22.12+ (Node 24 was used for this release).

```
npm ci
npm run dev
npm run check
npm run build
npm run check:release
npm run play
```

`dist/` is the complete static website. Upload its contents to a static host to
publish it; relative links support a domain root or subfolder. Serve `.glb` as
`model/gltf-binary`, enable gzip/Brotli where supported, and serve through HTTP(S)
rather than double-clicking `index.html`. `assets.html` is the food review studio.
`Typeslasher-1.3-web.zip` contains the Midnight Service release. Earlier archives
remain separately. Editable Blender sources remain in the project folder.

There is no server account, AI request, advertising, analytics, or cloud save in
gameplay. Fonts and food models are local. Browser storage is optional: when it
is blocked, the game reports that progress lasts only for that visit. This release
does not install an offline service worker.

See **STATUS.md** for completed checks and remaining device playtest coverage,
**PLAN.md** for the roadmap, and **THIRD_PARTY_NOTICES.md** for asset/library credits.
