# Fold Line · source

A landing page for a trekking company where every trek is a folded paper map. The map in front grows its mountain out of the contour lines printed on its cover, you dive into its red pin and walk the trail inside it in cut paper, and the landing page around the five maps is made of the same paper.

**Live page:** https://sam1983aing.github.io/fold-line/ (published from [Sam1983Aing/fold-line](https://github.com/Sam1983Aing/fold-line))

This repo is the whole build, version by version, for the course *Build Interactive 3D Landing Pages with Claude Code and Codex*. It was built in Claude Code with Opus 5.5. The company and its guides are made up. The five treks, their numbers and their ground are real.

## The versions

Each version is a folder, frozen once the next one started, so you can open any step of the build.

| Folder | What it is |
|---|---|
| `Fold Line/V1/` | The first build, The Long Fold: a made-up walk you unfold like a concertina map, on a paper pop-up engine |
| `Fold Line/V2/` | The trekking company on five real treks, with three hero options: `?hero=drawer`, `?hero=stack` or `?hero=horizons` |
| `Fold Line/V3/` | The hero: maps on a desk that grow their mountains, the dive into the pin and the match cut. Open with `?hero=fold` |
| `Fold Line/V4/` | The inside of the map in cut paper, on Tongariro's real track. Open with `?hero=fold` |
| `Fold Line/V5/` | The hero refined: the landing at eye level, the model tinted by height |
| `Fold Line/V6/` | The new look: Unbounded, the Polar Night palette, the turntable, the paper globe |
| `Fold Line/V7/` | The full landing page and five walks. This is the live page |

## Run it

Every version runs straight from your disk: double-click its HTML file.

Or serve the repo (Python's own server with caching turned off, so a reload always runs the files as they are):

```
python3 tools/serve.py
```

and open http://127.0.0.1:8611/Fold%20Line/V7/FOLD%20LINE%20-%20V7.html

In V7, `?walk=inca`, `?walk=torres`, `?walk=kili` or `?walk=everest` loads that trek's walk (no parameter is Tongariro). Debug flags on the Fold Line pages: `?p=0.43` jumps to 43% of the scroll, `&still` holds that state, `&hud` shows the progress, `&log` prints scroll and build state.

## The data and the tools

| Path | What it is |
|---|---|
| `data/treks.md`, `data/treks.json` | The five treks' researched numbers, each with its source. The page's trek data is generated from them |
| `tools/make-treks-data.mjs` | `data/treks.json` to the page's `hero/treks-data.js` |
| `tools/terrain/` | Real elevation tiles and OpenStreetMap tracks turned into the page's terrain, skylines and strip maps. Its README explains each step. The downloaded tiles are not in the repo, the page's data files hold the result |
| `tools/make-globe-data.mjs` | The paper globe's coastline as a distance field |
| `tools/serve.py` | The local server above |
| `tools/build-site.py`, `tools/site/` | Packs V7 into the published repo (only the files the page loads) |
| `tools/perf-probe.mjs` | Load weight, graphics memory and frame times of a page, measured in Chrome |
| `tools/record-frames.mjs` | Records a page frame by frame by stopping its clock, so a demo video is smooth whatever a frame costs |

## Credits and licences

- The code is here to read and learn from. No licence is granted for reuse.
- [three.js](https://threejs.org) r158 (MIT), [GSAP](https://gsap.com) and ScrollTrigger 3.12.5 ([GreenSock standard licence](https://gsap.com/standard-license)), [Lenis](https://lenis.darkroom.engineering) 1.1.13 (MIT, `licences/LICENSE-lenis.txt`). V7 hosts its own copies in `Fold Line/V7/vendor/`, the earlier versions load them from jsDelivr.
- Fonts: Unbounded, Martian Mono and Instrument Sans, SIL Open Font License 1.1 (`licences/OFL-*.txt`).
- Trails © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, under the Open Database License. The route data in `Fold Line/V7/interior/*-strip.js` is derived from it and falls under the same licence.
- Elevation from [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen and Tilezen), built on SRTM and, for Tongariro, the LINZ New Zealand elevation model (CC BY 4.0).
- The guides' portraits are AI-generated. Fold Line and its guides are fictional.
- Trek facts: every number in `data/treks.md` has its source beside it.

## Before this repo goes public (remove this section then)

1. **The globe's coastline** (`hero/globe-data.js` in V6 and V7, `tools/make-globe-data.mjs`) is traced from the world map inside macOS. Redo it from Natural Earth (public domain) and update the live page to match.
2. **The paper engine** in V1 and V7 started from Sam's own Paper Theatre pop-up book piece. Confirm it can be published, then credit it here.
3. **The guides' portraits:** name the tool that made them in the credits above.

Left out on purpose: the build's notes and recordings, two other concepts, the original pop-up book file, the agents' hand-over briefs, the scoring kit, the Aura loader and the one-file builds, and the portraits' full-size originals.
