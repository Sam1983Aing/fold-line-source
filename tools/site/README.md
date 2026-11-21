# Fold Line

A landing page for a fictional trekking company, where every trek is a folded paper map you can dive into and walk, built in 3D with three.js.

[**Open the live site**](https://sam1983aing.github.io/fold-line/) · [**Source**](https://github.com/Sam1983Aing/fold-line)

![Fold Line: five folded trek maps on a turntable around a paper globe](assets/preview.jpg)

## What it does

- Five treks lie on a turntable around a paper globe: Tongariro, the Inca Trail, the W Trek in Patagonia, Kilimanjaro and Everest Base Camp. The map in the light grows its mountain out of its printed contours.
- Click that map, or Explore the trail, and the camera dives in at the red pin.
- Scroll to walk the route stretch by stretch over the real ground, with pop-up paper scenery, a map card that follows along and the real distances and heights.
- At the end the map folds itself shut and you are back on the turntable, with that trek in the light.
- Further down the page: trip lengths, what's included, the guides, when to go, an FAQ on a folded world map, a ticket to book on and a postcard footer that unfolds as you scroll.

## How it's made

Plain HTML, CSS and JavaScript with no build step. three.js draws the scene: each map is a stack of contour cards cut from real elevation data, lit by one lamp with soft shadows. GSAP and Lenis run the scroll.

Each walk is a strip of panels made from the real route: its track, its heights and the ground beside it, with the trail's bends drawn a little larger than life so they read on a paper map. The numbers printed on the page come from researched trek facts, never from the terrain grid.

Built with [Claude Code](https://claude.com/claude-code).

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. Everything the page needs is in this repository, so once it's served it runs without a network. It needs a server rather than opening `index.html` from disk, because browsers refuse to load web fonts from `file://`.

## Structure

```text
index.html        the page: layout, styles, the 3D scene and the scroll
hero/             the turntable of maps, the globe, the covers and the trek data
interior/         the five walks: strip maps and scenery
sections/         the landing page's sections, the nav, the ticket and the footer
vendor/           three.js, GSAP, ScrollTrigger and Lenis
fonts/            Unbounded, Martian Mono and Instrument Sans
images/guides/    the guides' portraits
```

## Credits

- Trails: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, under the Open Database License (ODbL)
- Elevation: AWS Terrain Tiles (Mapzen / Tilezen), mostly from SRTM
- three.js r158 (MIT), GSAP and ScrollTrigger 3.12.5 (GreenSock standard licence), Lenis 1.1.13 (MIT), details in `vendor/README.md`
- Fonts: Unbounded, Martian Mono and Instrument Sans, all SIL Open Font License 1.1

Fold Line is a design study. The company and its guides are fictional and have no link to any trekking operator. The trek facts (distances, heights, seasons) come from public sources, but check them before planning a real trip.
