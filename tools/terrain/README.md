# Terrain tools

How `Fold Line/V5/hero/terrain-data.js` was made (first made for V2, copied forward into V3, V4 and V5). Node only, plus ffmpeg to decode the PNG tiles.

1. `node tiles.mjs meta > <work>/tiles/meta.json` and `node tiles.mjs` lists the tiles (z x y) for each trek.
   Download each from `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
   (AWS Terrain Tiles, Mapzen / Tilezen, mostly SRTM 30 m) into `<work>/tiles/t_z_x_y.png`.
2. Decode: `ffmpeg -i t_z_x_y.png -f rawvideo -pix_fmt rgb24 <work>/raw/t_z_x_y.rgb`.
   Height in metres is `R*256 + G + B/256 - 32768`.
3. `S=<work> node skyline.mjs` computes the true skyline from each trek's viewpoint.
4. `S=<work> node export.mjs <out.js>` crops a 128 x 128 grid per trek and writes the data file.

`peaks.mjs`, `bounds.mjs`, `preview.mjs` and `cropview.mjs` are checks: named peaks, tile coverage, hillshade and contour previews.
Everything reads its working folder from the `S` environment variable. The V2 working folder was temporary: the tiles are not in the repo, so a new crop means downloading them again.

## Route scale: Tongariro's strip map for V4's interior (15 Oct 2026)

The hero's crops above are 5.5 km around the summit. The interior needs the whole route, so:

1. `work/route-tiles.txt`: the 110 zoom 14 tiles covering lat -39.205 to -39.040, lon 175.530 to 175.720 (made with a node one-liner, see `teach/journal.md`). Download each into `work/tiles/t_z_x_y.png` from the same AWS address, decode each to `work/raw/` with ffmpeg as in step 2. `work/route-meta.json` holds `{ z, x0, y0, nx, ny }`.
2. `work/osm-route.json`: the Overpass answer for `relation["route"="hiking"]["name"~"Tongariro Alpine Crossing"]; out geom;` (send a User-Agent, Overpass answers 406 without one).
3. `W=work node route.mjs` chains the OSM ways into one track (`work/route.json`, start to finish with km and DEM height) and draws `work/preview.png`.
4. `W=work node strip.mjs` writes `Fold Line/V5/interior/tongariro-strip.js` (V4 is frozen): the concertina as a strip map (each panel a straight stretch of the route that turns with it, the way Ogilby drew roads) at `SC` metres a unit (380, so the route fills five panels), a height grid per panel in the panel's own coordinates, the track in concertina coordinates, Ngāuruhoe's real profile from 3.2 km up the valley for the scenery, and each stretch's numbers measured on the track (distance, climb, descent with a 10 m threshold `TH`, high and low point). `work/strip.png` previews the five panels.

`work/` is ignored by git. Everything in it can be downloaded again.

## The four other walks (18 Oct 2026, V7)

The same sources at the scale of each walk, for `Fold Line/V7/interior/<key>-strip.js`:

1. `node walk-tiles.mjs > work-walks/tiles.txt` writes `work-walks/<key>/meta.json` and lists the tiles (`key z x y`): zoom 13 for the Inca Trail and Kilimanjaro, 12 for the W Trek and Everest, reaching far enough either side of the route for the strip's panels (316 tiles, 14 MB). Fetch each into `work-walks/<key>/tiles/t_z_x_y.png` from the AWS address above and decode to `work-walks/<key>/raw/` with ffmpeg.
2. `work-walks/<key>/osm.json`: the Overpass answer for `way["highway"~"^(path|footway|track|steps|bridleway|unclassified|service|residential|tertiary)$"](box); out body geom;`, the box the waypoints' plus 0.03 degrees. Send a plain User-Agent.
3. `node walk-route.mjs` routes the trail through the researched waypoints on that network (Dijkstra, footpaths cheaper than roads), with the DEM height every 25 m, and reports each leg against the research (`work-walks/<key>/route.json`).
4. `node walk-strip.mjs` writes the four strips.

`work-walks/` is ignored by git.
