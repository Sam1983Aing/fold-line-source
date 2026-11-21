// The four walks' strips from measured data (V7, 18 Oct 2026, after Sam's "yes, fetch it"): the trail from OpenStreetMap
// routed through the researched waypoints (walk-route.mjs) and the ground from the AWS terrain tiles under and around it.
// Same shape as interior/tongariro-strip.js, laid like the drawn ones before them: each panel's route runs by the
// research's km (so the waypoints and the captions fall where the research puts them, and out-and-back legs read left
// to right), its sideways wander is the trail's real wander off the stretch's line, and the ground is the real ground
// beside each point of the trail, measured square to the stretch.
//   node walk-strip.mjs [key ...]      writes Fold Line/V7/interior/<key>-strip.js
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dem } from './walk-route.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), V7 = path.resolve(HERE, '../../Fold Line/V7'), WK = path.join(HERE, 'work-walks');
const ctx = { window:{} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/treks-data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/terrain-data.js'), 'utf8'), ctx);
const TREKS = ctx.window.TREKS, TERRAIN = ctx.window.TERRAIN;
const PW = 7.2, PD = 9.6, ZR = 2.4, X0 = 0.55, NX = 120, NZ = 160;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a)*t;
const CFG = {
  inca:{ cuts:[13.4, 21.1, 27.8, 36.3], names:['The valley', 'The pass', 'The ruins', 'The cloud forest', 'The Sun Gate'] },
  torres:{ cuts:[21, 39.9, 55.7, 61.1], names:['Glacier Grey', 'The French Valley', 'Los Cuernos', 'The towers', 'The way out'] },
  kili:{ cuts:[11, 23, 35, 40], names:['The forest', 'Shira and Lava Tower', 'The Barranco Wall', 'Summit night', 'The way down'] },
  everest:{ cuts:[19.5, 41, 54.7, 65.7], names:['Namche Hill', 'Tengboche', 'The moraine', 'Base Camp', 'The long way down'] }
};

function build(key){
  const t = TREKS.find(q => q.key === key), C = CFG[key], W = t.waypoints, total = t.km;
  const RT = JSON.parse(fs.readFileSync(path.join(WK, key, 'route.json'), 'utf8')), P = RT.pts, { h } = dem(key);
  const REF = { lat:W[0].lat, lon:W[0].lon }, KY = 110574, KX = 111320*Math.cos(REF.lat*Math.PI/180);
  const toM = (la, lo) => [(lo - REF.lon)*KX, -(la - REF.lat)*KY], toLL = (mx, my) => [REF.lat - my/KY, REF.lon + mx/KX];
  // the research's km along the trace: piecewise between the waypoints' places on it (the last stretch runs on to t.km)
  const WK2 = RT.wkm.map((tk, k) => [tk, W[k].km]); WK2.push([P[P.length - 1][2], total]);
  const rkm = (tk) => { for(let k = 1; k < WK2.length; k++) if(tk <= WK2[k][0] + 1e-9){ const a = WK2[k - 1], b = WK2[k]; return b[0] - a[0] < 1e-6 ? b[1] : lerp(a[1], b[1], (tk - a[0])/(b[0] - a[0])); } return total; };
  const pts = P.map(p => ({ m:toM(p[0], p[1]), r:rkm(p[2]), h:p[3] }));
  // the trail at a research km: its place and its ground
  const at = (km) => { let lo = 0, hi = pts.length - 1; while(hi - lo > 1){ const mid = (lo + hi) >> 1; if(pts[mid].r <= km) lo = mid; else hi = mid; } const a = pts[lo], b = pts[hi], f = b.r - a.r > 1e-9 ? clamp((km - a.r)/(b.r - a.r), 0, 1) : 0; return { m:[lerp(a.m[0], b.m[0], f), lerp(a.m[1], b.m[1], f)], h:lerp(a.h, b.h, f) }; };
  const bounds = [0, ...C.cuts, total];
  const frames = [], grids = [], route = [], stretches = [];
  // where the route crosses each fold: off the middle toward the side the trail turns there (the heading of the stretch
  // before against the one after), so the walk does not cross every fold dead centre. The ends stay on the middle line
  const dirOf = (ka, kb) => { const a = at(ka).m, b = at(kb).m, L = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])); return [(b[0] - a[0])/L, (b[1] - a[1])/L]; };
  const turn = bounds.map((km, k) => {
    if(k === 0 || k === bounds.length - 1) return 0;
    const u0 = dirOf(bounds[k - 1], km), u1 = dirOf(km, bounds[k + 1]), cr = u0[0]*u1[1] - u0[1]*u1[0];
    return clamp(cr*2.2, -0.7, 0.7) || (k % 2 ? 0.5 : -0.5);
  });
  let H0 = 1e9, H1 = -1e9;
  for(let i = 0; i < 5; i++){
    const ka = bounds[i], kb = bounds[i + 1], xs = i === 0 ? X0 : 0.12, xe = PW - (i === 4 ? 0.6 : 0.12);
    const pa = at(ka).m; let pb = at(kb).m;
    if(Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) < 400){ let far = 0; for(let km = ka; km <= kb; km += 0.05){ const q = at(km).m, d = Math.hypot(q[0] - pa[0], q[1] - pa[1]); if(d > far){ far = d; pb = q; } } }
    const len = Math.max(1, Math.hypot(pb[0] - pa[0], pb[1] - pa[1])), u = [(pb[0] - pa[0])/len, (pb[1] - pa[1])/len], n = [-u[1], u[0]];
    const sc = (kb - ka)*1000/(xe - xs);
    frames.push({ e:[+pa[0].toFixed(2), +pa[1].toFixed(2)], u:[+u[0].toFixed(6), +u[1].toFixed(6)], n:[+n[0].toFixed(6), +n[1].toFixed(6)], lx0:i === 0 ? X0 : 0, z0:ZR, route:true, sc:+sc.toFixed(1), km:true });
    // the route: x by the research's km, z the trail's own bends off the stretch's line. On a stretch of 10 to 50 km the
    // real wander is a few hundred metres, a hair across the panel, and the walk read as a straight line (Sam, 19 Oct:
    // "it feels more from A to B, Tongariro's path zigzags"). So the bends are the trail's own, drawn larger than life:
    // its sideways offset, cleared of GPS jitter, split into the long swing (bends of about a quarter of the stretch) and
    // the shorter turns inside it, each scaled to fill the panel the way Tongariro's 4 km stretches do, and eased to the
    // stretch's line at both ends so the route meets itself across every fold. The km and the heights stay true.
    const rows = [], steps = Math.max(60, Math.round((kb - ka)/0.04));
    const raw = [];
    for(let s = 0; s <= steps; s++){ const km = lerp(ka, kb, s/steps), q = at(km); raw.push({ km, q, d:(q.m[0] - pa[0])*n[0] + (q.m[1] - pa[1])*n[1] }); }
    const gauss = (arr, sig) => {
      if(sig < 0.6) return arr.slice();
      const R = Math.ceil(sig*3), w = []; for(let k = -R; k <= R; k++) w.push(Math.exp(-k*k/(2*sig*sig)));
      return arr.map((_, j) => { let a = 0, ws = 0; for(let k = -R; k <= R; k++){ const jj = Math.max(0, Math.min(arr.length - 1, j + k)); a += arr[jj]*w[k + R]; ws += w[k + R]; } return a/ws; });
    };
    const D = raw.map(r => r.d), lp = gauss(D, 0.012*steps), low = gauss(lp, 0.11*steps), mid = lp.map((v, j) => v - low[j]);
    const rng = (a) => Math.max(...a) - Math.min(...a);
    const gl = 1.8/Math.max(1, rng(low)), gm = 1.35/Math.max(1, rng(mid));
    const ease = (t) => { const a = clamp(t/0.09, 0, 1), b = clamp((1 - t)/0.09, 0, 1); return a*a*(3 - 2*a)*b*b*(3 - 2*b); };
    // near the edge of the route's band a swing eases into it (a soft knee) rather than running flat along it; the small
    // turns keep their size
    const base = raw.map((r, s) => ZR + lerp(turn[i], turn[i + 1], s/steps));
    const wand = raw.map((r, s) => ((low[s] - low[0]*(1 - s/steps) - low[steps]*(s/steps))*gl + mid[s]*gm)*ease(s/steps));
    raw.forEach((r, s) => {
      const w = wand[s], room = w > 0 ? 3.6 - base[s] : base[s] - 0.8, z = base[s] + Math.sign(w)*room*Math.tanh(Math.abs(w)/Math.max(0.2, room));
      rows.push([+(i*PW + lerp(xs, xe, s/steps)).toFixed(4), +clamp(z, 0.7, 3.7).toFixed(4), +r.km.toFixed(3), Math.round(r.q.h), i]);
      H0 = Math.min(H0, r.q.h); H1 = Math.max(H1, r.q.h);
    });
    route.push(...rows);
    // the stretch's numbers, measured on the trail (10 m steps count), the way Tongariro's were
    let up = 0, down = 0, hi = -1e9, lo = 1e9, hiKm = ka, last = rows[0][3];
    for(const r of rows){ const d = r[3] - last; if(Math.abs(d) >= 10){ if(d > 0) up += d; else down -= d; last = r[3]; } if(r[3] > hi){ hi = r[3]; hiKm = r[2]; } lo = Math.min(lo, r[3]); }
    stretches.push({ km0:ka, km1:kb, up:Math.round(up), down:Math.round(down), hi:Math.round(hi), hiKm:+hiKm.toFixed(2), lo:Math.round(lo) });
    // the ground: for every point of the panel, the trail point at its km, then square to the stretch by the distance
    // from the route, on the real terrain
    const G = new Uint16Array(NX*NZ); let glo = 1e9, ghi = -1e9;
    const rowAt = (lx) => { const f = clamp((lx - xs)/(xe - xs), 0, 1)*(rows.length - 1), k = Math.floor(f), g = f - k, a = rows[k], b = rows[Math.min(rows.length - 1, k + 1)]; return [lerp(a[2], b[2], g), lerp(a[1], b[1], g)]; };
    for(let q = 0; q < NX; q++){
      const lx = q/(NX - 1)*PW, [km, zr] = rowAt(lx), c = at(km).m;
      for(let j = 0; j < NZ; j++){
        const lz = -PD/2 + j/(NZ - 1)*PD, off = (lz - zr)*sc, mx = c[0] + n[0]*off, my = c[1] + n[1]*off, [la, lo2] = toLL(mx, my);
        const v = Math.max(1, h(la, lo2)); G[j*NX + q] = Math.round(v); glo = Math.min(glo, v); ghi = Math.max(ghi, v);
      }
    }
    grids.push({ nx:NX, nz:NZ, lo:Math.round(glo), hi:Math.round(ghi), b64:Buffer.from(G.buffer).toString('base64') });
  }
  const relief = Math.max(...grids.map(g => g.hi - g.lo));
  const STEP = [25, 50, 75, 100, 150, 200, 250, 300, 400].find(s => relief/s <= 18) || 500;
  const SC = Math.round(frames.reduce((a, f) => a + f.sc, 0)/frames.length);
  const EXAG = +Math.min(3, Math.max(0.6, 1.5*SC/relief)).toFixed(2);
  const sky = TERRAIN[key] && TERRAIN[key].sky, rr = sky ? sky.rows : [];
  const SKY = rr.length ? { view:sky.view, az0:rr[0][0], az1:rr[rr.length - 1][0], step:+(rr[1][0] - rr[0][0]).toFixed(3), rows:rr.map(r => +r[1].toFixed(3)) } : null;
  return { key, measured:true, byKm:true, PW, PD, SC, ZR, X0, REF, KX:+KX.toFixed(4), KY, STEP, EXAG, H0:Math.round(H0), H1:Math.round(H1),
    names:C.names, frames, grids, route, stretches, sky:SKY };
}

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CFG);
for(const key of keys){
  const S = build(key), t = TREKS.find(q => q.key === key), M = JSON.parse(fs.readFileSync(path.join(WK, key, 'meta.json'), 'utf8'));
  const head = `/* ${t.fullName} as a strip map for the V7 walk. Made by tools/terrain/walk-strip.mjs on ${new Date().toISOString().slice(0, 10)}.
   Sources: the track is OpenStreetMap's footpaths (c) OpenStreetMap contributors, ODbL, routed through the researched
   waypoints in hero/treks-data.js (tools/terrain/walk-route.mjs); heights are AWS Terrain Tiles at zoom ${M.z} (Mapzen /
   Tilezen, mostly SRTM). Each panel runs by the research's km, the trail's real wander off the stretch's line is its z,
   and the ground is the real ground beside each point of the trail, square to the stretch. stretches are measured on the
   trail (10 m climb threshold); printed point heights come from treks-data.js, never from this grid.
   sky is the real skyline from hero/terrain-data.js: ${S.sky ? S.sky.view : 'none'}. */\n`;
  const out = path.join(V7, 'interior', key + '-strip.js');
  fs.writeFileSync(out, head + 'window.FOLD_STRIPS = window.FOLD_STRIPS || {};\nwindow.FOLD_STRIPS.' + key + ' = ' + JSON.stringify(S) + ';\n');
  console.log(key, 'exag', S.EXAG, 'step', S.STEP, 'SC', S.SC, 'route', S.H0, '-', S.H1, 'm |', S.stretches.map(s => s.km0 + '-' + s.km1 + ' up ' + s.up + ' down ' + s.down + ' hi ' + s.hi).join(' | '), (fs.statSync(out).size/1024).toFixed(0) + ' KB');
}
