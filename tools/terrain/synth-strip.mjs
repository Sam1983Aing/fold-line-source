// Superseded on 18 Oct 2026 by walk-tiles.mjs, walk-route.mjs and walk-strip.mjs (measured ground, Sam said yes to the
// downloads). Kept for the record: it drew the first night's strips from the research alone.
// Strip maps for the four walks after Tongariro (V7, 18 Oct 2026), in the shape of interior/tongariro-strip.js, built
// only from what is already in the project: the researched waypoints and profile in hero/treks-data.js (every printed
// number), and the measured skylines in hero/terrain-data.js (the backdrops). Tongariro's strip was cut from AWS terrain
// tiles and the OpenStreetMap trace; downloading those for the other four waits for Sam's OK, so here the ground of each
// panel is shaped around the route from the waypoint heights, and the route is laid along each panel by distance walked
// (an Ogilby strip by the mile), so out-and-back legs read left to right.
//   node tools/terrain/synth-strip.mjs            writes Fold Line/V7/interior/<key>-strip.js for inca, torres, kili, everest
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const V7 = path.join(ROOT, 'Fold Line/V7');
const ctx = { window:{} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/treks-data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/terrain-data.js'), 'utf8'), ctx);
const TREKS = ctx.window.TREKS, TERRAIN = ctx.window.TERRAIN;

const PW = 7.2, PD = 9.6, ZR = 2.4, X0 = 0.55, NX = 120, NZ = 160;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a)*t;
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = (s*1664525 + 1013904223) >>> 0; return s/4294967296; }; }
// a smooth value noise, for the ground's small hills
function noise2(seed){
  const r = rnd(seed), G = 64, T = new Float32Array(G*G); for(let k = 0; k < G*G; k++) T[k] = r()*2 - 1;
  const at = (i, j) => T[((j % G + G) % G)*G + ((i % G + G) % G)], sm = (t) => t*t*(3 - 2*t);
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j);
    return lerp(lerp(at(i, j), at(i + 1, j), fx), lerp(at(i, j + 1), at(i + 1, j + 1), fx), fy); };
}

/* ---- each trek: where the five stretches start (research km), their names, and the shape of the ground around the
   route on each panel: how far it rises behind (back) and in front (front, negative falls away), how wide those slopes
   are (w, units), and the big mountains standing behind (peaks: x along the panel 0..1, z, metres above the route, r) ---- */
const CFG = {
  inca:{ cuts:[13.4, 21.1, 27.8, 36.3], seed:41,
    names:['The valley', 'The pass', 'The ruins', 'The cloud forest', 'The Sun Gate'],
    panels:[
      { back:1100, front:650, wB:2.2, wF:1.6, peaks:[{ x:0.75, z:-3.6, h:1700, r:1.1 }] },
      { back:900, front:500, wB:1.6, wF:1.4, peaks:[{ x:0.95, z:-2.2, h:500, r:0.9 }] },
      { back:520, front:-650, wB:1.4, wF:1.8, peaks:[{ x:0.2, z:-2.6, h:380, r:0.8 }, { x:0.7, z:-2.8, h:420, r:0.9 }] },
      { back:450, front:-900, wB:1.5, wF:2.0, peaks:[] },
      { back:380, front:-950, wB:1.4, wF:1.5, peaks:[{ x:0.82, z:3.2, h:420, r:0.45 }] }
    ] },
  torres:{ cuts:[21, 39.9, 55.7, 61.1], seed:42,
    names:['Glacier Grey', 'The French Valley', 'Los Cuernos', 'The towers', 'The way out'],
    panels:[
      { back:900, front:-60, wB:1.8, wF:2.4, peaks:[{ x:0.55, z:-3.4, h:1800, r:1.2 }] },
      { back:1400, front:300, wB:1.4, wF:1.6, peaks:[{ x:0.45, z:-3.0, h:1900, r:1.0 }] },
      { back:1500, front:-40, wB:1.6, wF:2.5, peaks:[{ x:0.4, z:-3.2, h:2000, r:0.9 }] },
      { back:1400, front:400, wB:1.2, wF:1.6, peaks:[{ x:0.8, z:-2.6, h:1700, r:0.7 }] },
      { back:600, front:-80, wB:1.8, wF:2.4, peaks:[] }
    ] },
  kili:{ cuts:[11, 23, 35, 40], seed:43,
    names:['The forest', 'Shira and Lava Tower', 'The Barranco Wall', 'Summit night', 'The way down'],
    panels:[
      { back:700, front:-350, wB:2.0, wF:2.2, peaks:[] },
      { back:900, front:-300, wB:1.8, wF:2.0, peaks:[{ x:0.9, z:-2.4, h:1300, r:1.4 }] },
      { back:800, front:-500, wB:1.4, wF:2.0, peaks:[{ x:0.55, z:-3.0, h:1700, r:1.5 }] },
      { back:200, front:-900, wB:1.2, wF:1.8, peaks:[] },
      { back:500, front:-500, wB:2.0, wF:2.0, peaks:[{ x:0.15, z:-3.2, h:1500, r:1.6 }] }
    ] },
  everest:{ cuts:[19.5, 41, 54.7, 65.7], seed:44,
    names:['Namche Hill', 'Tengboche', 'The moraine', 'Base Camp', 'The long way down'],
    panels:[
      { back:1500, front:900, wB:1.4, wF:1.2, peaks:[{ x:0.7, z:-3.4, h:2600, r:1.0 }] },
      { back:1600, front:700, wB:1.5, wF:1.4, peaks:[{ x:0.65, z:-3.3, h:2700, r:0.7 }] },
      { back:1300, front:800, wB:1.3, wF:1.2, peaks:[{ x:0.5, z:-3.5, h:2400, r:1.0 }] },
      { back:2100, front:500, wB:1.2, wF:1.3, peaks:[{ x:0.6, z:-3.6, h:3000, r:1.1 }] },
      { back:1500, front:900, wB:1.6, wF:1.3, peaks:[{ x:0.3, z:-3.4, h:2500, r:1.0 }] }
    ] }
};

function build(key){
  const t = TREKS.find(q => q.key === key), C = CFG[key];
  const W = t.waypoints, total = t.km, REF = { lat:W[0].lat, lon:W[0].lon };
  const KY = 110574, KX = 111320*Math.cos(REF.lat*Math.PI/180);
  const mxy = (w) => [(w.lon - REF.lon)*KX, -(w.lat - REF.lat)*KY];
  // the route every 50 m of research km: planar position between waypoints, height from the profile
  const prof = t.profile, hOf = (km) => { for(let k = 1; k < prof.length; k++) if(km <= prof[k][0]) return lerp(prof[k-1][1], prof[k][1], (km - prof[k-1][0])/Math.max(1e-6, prof[k][0] - prof[k-1][0])); return prof[prof.length - 1][1]; };
  const pOf = (km) => { for(let k = 1; k < W.length; k++) if(km <= W[k].km){ const a = mxy(W[k-1]), b = mxy(W[k]), f = (km - W[k-1].km)/Math.max(1e-6, W[k].km - W[k-1].km); return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; } return mxy(W[W.length - 1]); };
  const bounds = [0, ...C.cuts, total];
  const nz = noise2(C.seed), wig = rnd(C.seed + 7);
  const frames = [], grids = [], route = [], stretches = [], zAt = [];
  let H0 = 1e9, H1 = -1e9;
  for(let i = 0; i < 5; i++){
    const ka = bounds[i], kb = bounds[i + 1], xs = (i === 0 ? X0 : 0.12), xe = PW - (i === 4 ? 0.6 : 0.12);
    // the panel's axis: start to end, or start to the farthest point when it comes back to where it began
    const pa = pOf(ka); let pb = pOf(kb);
    if(Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) < 400){ let far = 0; for(let km = ka; km <= kb; km += 0.1){ const q = pOf(km), d = Math.hypot(q[0] - pa[0], q[1] - pa[1]); if(d > far){ far = d; pb = q; } } }
    const len = Math.max(1, Math.hypot(pb[0] - pa[0], pb[1] - pa[1])), u = [(pb[0] - pa[0])/len, (pb[1] - pa[1])/len], n = [-u[1], u[0]];
    const sc = (kb - ka)*1000/(xe - xs);
    frames.push({ e:[+pa[0].toFixed(2), +pa[1].toFixed(2)], u:[+u[0].toFixed(6), +u[1].toFixed(6)], n:[+n[0].toFixed(6), +n[1].toFixed(6)], lx0:i === 0 ? X0 : 0, z0:ZR, route:true, sc:+sc.toFixed(1), km:true });
    // the route on the panel: x by distance walked, z from where it really strays off the panel's line (squeezed), and
    // switchbacks where it climbs hard, a soft meander elsewhere
    const ph = wig()*6.28, rows = [];
    const steps = Math.max(40, Math.round((kb - ka)/0.05));
    for(let q = 0; q <= steps; q++){
      const km = lerp(ka, kb, q/steps), x = lerp(xs, xe, q/steps), p = pOf(km), h = hOf(km);
      const lat = ((p[0] - pa[0])*n[0] + (p[1] - pa[1])*n[1]), env = Math.sin(Math.PI*q/steps);
      const grade = Math.abs(hOf(Math.min(kb, km + 0.3)) - hOf(Math.max(ka, km - 0.3)))/600;
      const zig = grade > 0.12 ? 0.32*Math.min(1, (grade - 0.12)*6)*(2*Math.abs(((x*1.9 + ph) % 2 + 2) % 2 - 1) - 1) : 0;
      let z = ZR + clamp(lat/sc*0.55, -1.5, 1.2)*env + 0.22*Math.sin(x*1.3 + ph)*env + zig*env;
      z = clamp(z, 0.7, 3.7);
      rows.push([+(i*PW + x).toFixed(4), +z.toFixed(4), +km.toFixed(3), Math.round(h), i]);
      H0 = Math.min(H0, h); H1 = Math.max(H1, h);
    }
    route.push(...rows);
    zAt.push(rows);
    // the stretch's numbers, measured on the research profile (10 m steps count)
    let up = 0, down = 0, hi = -1e9, lo = 1e9, hiKm = ka, last = rows[0][3];
    for(const r of rows){ const d = r[3] - last; if(Math.abs(d) >= 10){ if(d > 0) up += d; else down -= d; last = r[3]; } if(r[3] > hi){ hi = r[3]; hiKm = r[2]; } lo = Math.min(lo, r[3]); }
    stretches.push({ km0:ka, km1:kb, up:Math.round(up), down:Math.round(down), hi:Math.round(hi), hiKm:+hiKm.toFixed(2), lo:Math.round(lo) });
    // the ground: the route's height carried across the panel, rising behind and in front as the panel says, the big
    // mountains raised behind, small hills over it all
    const P = C.panels[i], G = new Uint16Array(NX*NZ);
    let glo = 1e9, ghi = -1e9;
    const rowAtX = (lx) => { const f = clamp((lx - xs)/(xe - xs), 0, 1)*(rows.length - 1), k = Math.floor(f), g = f - k, a = rows[k], b = rows[Math.min(rows.length - 1, k + 1)]; return [lerp(a[1], b[1], g), lerp(a[3], b[3], g)]; };
    const relief = Math.max(P.back, Math.abs(P.front), 300);
    for(let j = 0; j < NZ; j++) for(let q = 0; q < NX; q++){
      const lx = q/(NX - 1)*PW, lz = -PD/2 + j/(NZ - 1)*PD, [zr, hr] = rowAtX(lx), d = lz - zr;
      let h = hr;
      if(d < 0) h += P.back*(1 - Math.exp(-Math.pow(-d/P.wB, 2)));
      else h += P.front*(1 - Math.exp(-Math.pow(d/P.wF, 2)));
      for(const pk of P.peaks){ const dx = lx - pk.x*PW, dz = lz - pk.z; h += pk.h*Math.exp(-(dx*dx + dz*dz)/(pk.r*pk.r)); }
      // small hills, quieter on the route itself so the track stays walkable
      const calm = 1 - Math.exp(-Math.pow(d/0.45, 2));
      h += (nz(lx*0.9 + i*17, lz*0.9) + 0.5*nz(lx*2.1 + 40, lz*2.1 + i*9))*relief*0.08*(0.35 + 0.65*calm);
      h = Math.max(1, h);
      G[j*NX + q] = Math.round(h); glo = Math.min(glo, h); ghi = Math.max(ghi, h);
    }
    grids.push({ nx:NX, nz:NZ, lo:Math.round(glo), hi:Math.round(ghi), b64:Buffer.from(G.buffer).toString('base64') });
  }
  // the card interval: about fourteen cards over the tallest panel's relief
  const relief = Math.max(...grids.map(g => g.hi - g.lo));
  const STEP = [25, 50, 75, 100, 150, 200, 250].find(s => relief/s <= 18) || 300;
  const SC = Math.round(frames.reduce((a, f) => a + f.sc, 0)/frames.length);
  // the measured skyline, for the backdrop: angles above the eye every step degrees of bearing
  const sky = TERRAIN[key] && TERRAIN[key].sky, rows = sky ? sky.rows : [];
  const SKY = rows.length ? { view:sky.view, az0:rows[0][0], az1:rows[rows.length - 1][0], step:+(rows[1][0] - rows[0][0]).toFixed(3), rows:rows.map(r => +r[1].toFixed(3)) } : null;
  // a panel here spans four to six times Tongariro's ground, so its heights are raised more for the same paper drama:
  // the tallest panel's relief stands about as high as Tongariro's cone does
  const EXAG = +Math.min(3, Math.max(0.6, 1.5*SC/relief)).toFixed(2);
  return { key, synth:true, PW, PD, SC, ZR, X0, REF, KX:+KX.toFixed(4), KY, STEP, EXAG, H0:Math.round(H0), H1:Math.round(H1),
    names:C.names, frames, grids, route, stretches, sky:SKY };
}

for(const key of Object.keys(CFG)){
  const S = build(key);
  const head = `/* ${TREKS.find(q => q.key === key).fullName} as a strip map for the V7 walk. Made by tools/terrain/synth-strip.mjs on ${new Date().toISOString().slice(0, 10)}.
   Built from the project's own research, not from a survey: the route is laid along each panel by distance walked
   between the researched waypoints in hero/treks-data.js, its heights are the researched profile, and the ground on
   each side is shaped from those heights (the measured terrain would need the AWS tiles and the OpenStreetMap trace).
   sky is the real skyline from hero/terrain-data.js: ${S.sky ? S.sky.view : 'none'}. Same shape as tongariro-strip.js,
   plus sc (metres a unit) and km:true on each frame, STEP and EXAG for the card model, H0 and H1 for the print. */\n`;
  const out = path.join(V7, 'interior', key + '-strip.js');
  fs.writeFileSync(out, head + 'window.FOLD_STRIPS = window.FOLD_STRIPS || {};\nwindow.FOLD_STRIPS.' + key + ' = ' + JSON.stringify(S) + ';\n');
  console.log(key, 'exag', S.EXAG, 'step', S.STEP, 'SC', S.SC, 'H', S.H0, S.H1, 'stretches', S.stretches.map(s => s.km0 + '-' + s.km1 + ' up ' + s.up + ' down ' + s.down + ' hi ' + s.hi).join(' | '), (fs.statSync(out).size/1024).toFixed(0) + ' KB');
}
