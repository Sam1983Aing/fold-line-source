// writes hero/terrain-data.js: per trek a 128x128 height grid (bytes, lo..hi) for the terrain
// model and the covers, plus the real skyline from the trek's viewpoint
import { grid } from './terrain.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const S = process.env.S, OUT = process.argv[2];
const CROPS = {
  tongariro: { lat:-39.1470, lon:175.6420, km:5.5, src:'sky', peak:'Ngauruhoe', note:'Ngauruhoe, South Crater and Red Crater' },
  inca:      { lat:-13.1600, lon:-72.5380, km:3.1, peak:'Huayna Picchu', note:'Machu Picchu, Huayna Picchu and the Urubamba loop' },
  torres:    { lat:-50.9700, lon:-73.0000, km:10.0, src:'sky', peak:'Paine massif', note:'The Torres, Base Torres and the French Valley' },
  kili:      { lat:-3.0758,  lon:37.3533,  km:11.0, peak:'Kibo', note:'Kibo, the summit cone' },
  everest:   { lat:27.9750,  lon:86.8800,  km:11.0, src:'sky', peak:'Everest', note:'Everest, Lhotse, Nuptse, Base Camp and Kala Patthar' }
};
const SKY = JSON.parse(readFileSync(`${S}/raw/skylines.json`, 'utf8'));
const N = 128, out = {};
for (const [k, c] of Object.entries(CROPS)){
  const g = grid(k, c.src || 'stack'), mpp = g.mpp(c.lat), half = c.km*500/mpp;
  const cx = g.px(c.lon), cy = g.py(c.lat), H = new Float32Array(N*N);
  let lo = 1e9, hi = -1e9;
  for (let j=0;j<N;j++) for (let i=0;i<N;i++){
    const e = g.at(cx - half + (i/(N-1))*2*half, cy - half + (j/(N-1))*2*half);
    H[j*N+i] = e; lo = Math.min(lo, e); hi = Math.max(hi, e);
  }
  const b = Buffer.alloc(N*N);
  for (let q=0;q<N*N;q++) b[q] = Math.round((H[q]-lo)/(hi-lo)*255);
  const s = SKY[k];
  // skyline resampled to 0.25 degree steps: [bearing, angle above the eye, elevation of the ridge point]
  const rows = s.rows.filter((r,i)=>i%1===0).map(r=>[r[0], r[1], r[2]]);
  out[k] = { crop:{ ...c, n:N, lo:Math.round(lo), hi:Math.round(hi), bytes:b.toString('base64') },
             sky:{ view:s.view.name, eye:s.h0, lat:s.view.lat, lon:s.view.lon, rows } };
  console.log(k, 'lo', Math.round(lo), 'hi', Math.round(hi), 'grid', b.length, 'sky pts', rows.length);
}
const js = `/* Real terrain for the five treks, extracted ${new Date().toISOString().slice(0,10)}.
   Source: AWS Terrain Tiles (Mapzen / Tilezen, terrarium encoding), mostly SRTM 30 m here.
   SRTM smooths sharp summits, so heights read low on spires (Everest 8 753 m against 8 849 m,
   Huayna Picchu 2 588 m against 2 720 m). Printed numbers come from data/treks.md, never from this grid.
   crop: a 128 x 128 grid, row 0 is north, bytes are 0..255 between lo and hi metres.
   sky: the skyline seen from a viewpoint, rows are [bearing deg, angle above eye deg, ridge elevation m].
   Made by tools/terrain/export.mjs. */
window.TERRAIN = ${JSON.stringify(out)};
`;
writeFileSync(OUT, js);
console.log('wrote', OUT, (js.length/1024).toFixed(1), 'KB');
