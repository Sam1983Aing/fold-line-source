# V7 · the walks brief (18 Oct 2026, night)

Sam, logging off at 02:20, after seeing the Tongariro walk:

> "On the left side we always have the same layout and text that switch when we go to the next section. It feels
> boring ... add a nice map card style card, like a map with those details, and it can move around depending on each
> section, just make sure to place it where it doesn't cover the character or important detail."
>
> "When you finish the final scroll, like the screenshot here (Fold it back up), you can have an option to switch the
> book up and down, so the five will be in a circle, infinite, so you can either book that selected map or just press
> the arrow to switch to the next one."
>
> "Build at the same time the four remaining maps from the hero section ... refine the five maps using a similar
> structure from the first one but adapted, because some have more crossing, longer, but try to keep five sections
> to each." He reviews in the morning.

Also in flight from earlier the same night: the 04 When to go demo round (`?when=ribbons|dial|pad`, reels in
`teach/shots/v7-when-round1/`) and the 05 FAQ as one option (a folded world map with pins, `sections/faq.js`).

## Plan, in order

1. 04 reels sent, FAQ map wired, checked, recorded. Commit.
2. Walk card: the caption (`.beat`, built in `interior/interior.js` `captions()`) becomes a paper map card (cream,
   a strip-map thumbnail of the stretch with the route in red and the hiker's spot, the stretch numbers in mono, the
   kicker on a red paper arrow like the landing's eyebrows). Each stretch gives the card a place on screen (left top,
   right top, right bottom, left bottom...) chosen where the hiker and the scene's key piece are not: measured by
   projecting the hiker and the panel's tallest prop to screen and picking the free corner. It slides and turns to its
   new spot between stretches.
3. End screen: the finale ("Fold it back up") gets up and down arrows that turn the five folded maps like a wheel,
   endless both ways. Book books the map in front. Switching changes the book's colour, title and numbers.
4. The four other walks with the same machinery: a strip per trek (`interior/<key>-strip.js`, same shape as
   `TONGARIRO_STRIP`), five stretches each, scenery per trek, captions per trek. The walk you enter is the trek
   selected in the hero.

## Data rule (Sam's "map truth, paper mood")

Tongariro's strip came from AWS Terrain Tiles and the OpenStreetMap trace, downloaded with Sam present. Downloading
more needs his OK, so the four new strips are built from what is already in the project: the researched waypoints and
profile in `hero/treks-data.js` (every printed number) and the real terrain crops around each key summit in
`hero/terrain-data.js`. Where the crop does not reach, the ground between waypoints is shaped from the waypoint
heights, and the README says so. In the morning: ask Sam whether to fetch the full-route tiles and traces (sources and
sizes stated) to replace the shaped ground with measured ground.

## Five stretches each (by waypoint)

- Inca Trail (42 km): KM 82 to Wayllabamba · up to Dead Woman's Pass · Pacaymayo, Runkurakay, Sayacmarca ·
  Phuyupatamarca down to Wiñay Wayna · the Sun Gate and Machu Picchu.
- W Trek (71 km): Paine Grande to Grey and back · the French Valley to Británico · Los Cuernos ·
  up to Chileno · Base Torres and out.
- Kilimanjaro (62 km, Machame): the forest to Machame Camp · Shira and Lava Tower · Barranco Wall to Karanga and
  Barafu · the summit night to Uhuru · down to Mweka Gate.
- Everest Base Camp (120 km there and back): Lukla to Namche · Tengboche and Dingboche · Lobuche and Gorak Shep ·
  Base Camp and Kala Patthar · the way down.

## Status, end of the night

Done and pushed:
1. 04 When to go demo round (`?when=ribbons|dial|pad`), reels sent. 05 FAQ over a folded world map (`sections/faq.js`).
2. The walk's map card (`interior/interior.js`, `captions()`, `mcBase`, `mcDraw`, `slotFor`).
3. The end screen's wheel of five maps (`sections/landing.js`, `switcher`, `flip`, `bookFrame`, `coverFor`).
4. All five walks: `interior/walks.js`, `interior/<key>-strip.js`, `tools/terrain/synth-strip.mjs`, the loader in the page
   (`?walk=`), `walkTo` and `jumpIn` in `sections/landing.js`.

Open, for Sam in the morning:
- Pick for 04 (Ribbons, Dial, Tear-off or keep Now).
- Yes or no to downloading measured terrain (AWS terrain tiles, zoom 14) and the OpenStreetMap traces for the four new
  walks, the way Tongariro's was made. Roughly 100 to 300 tiles a trek (a few MB each trek) and one Overpass query each.
- Only Tongariro dives in through the hero's pin. Giving each trek its own dive means making the hero's five maps each a
  walk map (today only No. 01 is): a bigger change, worth its own round.
- Rough edges: phone layout of the FAQ map (the sheet covers most of the map), the Tear-off's first frame hitch, scenery
  density on the long Everest descent.

## Morning, 18 Oct

Sam: Ribbons for 04 (done, `sections/when.js`) and yes to the downloads: the four walks now stand on measured ground
(`tools/terrain/walk-tiles.mjs`, `walk-route.mjs`, `walk-strip.mjs`). Still open: a dive into the pin for each trek
(only Tongariro's map No. 01 is a walk map today), the FAQ map on phones, nav tabs.

