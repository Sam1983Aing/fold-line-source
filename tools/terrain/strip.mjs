// Tongariro as a strip map for the concertina: Fold Line/V6/interior/tongariro-strip.js (V1 to V5 are frozen)
// Run from tools/terrain with W=<work folder> after route.mjs (it reads route.json and the tiles).
//
// The concertina is five panels in a row, 7.2 x 9.6 units each, and the track is an L (6 km east,
// 8 km north). So each panel is its own straight stretch of the route, the way John Ogilby drew roads
// in 1675: the route runs left to right across every panel and crosses each crease at the same depth,
// and every panel turns with the route and carries its own north arrow. Within a panel the map is
// true to scale. Across a crease the route is continuous and the ground is not.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { routeGrid, toXY, toLL, REF } from './route.mjs';
const W = process.env.W || 'work';
const OUT = process.argv[2] || '../../Fold Line/V6/interior/tongariro-strip.js';

const PW = 7.2, PD = 9.6, NP = 5;
const SC = +(process.env.SC || 380);          // metres per unit: the route runs across all five panels (round 1 used 760, one panel per climb)
const ZR = 2.4;          // depth where the route crosses every crease (front is +4.8)
const X0 = 0.55;         // the trailhead sits this far in from panel 1's left edge
const G = routeGrid();
const track = JSON.parse(readFileSync(`${W}/route.json`, 'utf8'));   // [lat, lon, km, h]
const P = track.map(p => toXY(p[0], p[1]));                          // metres, x east, y south

/* ---- frames: entry point (at local x0, z0), axis along the route, normal to its right (the
   panel's front). Each panel turns to the angle that keeps its stretch of track nearest ZR in
   depth, and the track leaves it wherever it crosses the right edge: that is where the next starts ---- */
// panel-local to metres, and metres to concertina coordinates for a given panel
const toM = (f, lx, lz) => [f.e[0] + f.u[0]*(lx - f.lx0)*SC + f.n[0]*(lz - f.z0)*SC, f.e[1] + f.u[1]*(lx - f.lx0)*SC + f.n[1]*(lz - f.z0)*SC];
const toL = (f, m) => { const dx = m[0]-f.e[0], dy = m[1]-f.e[1]; return [f.lx0 + (dx*f.u[0] + dy*f.u[1])/SC, f.z0 + (dx*f.n[0] + dy*f.n[1])/SC]; };
function tryFrame(i, ei, E, z0, lx0, ang){
  const u = [Math.sin(ang), -Math.cos(ang)], n = [-u[1], u[0]];
  const f = { i, e:E.slice(), u, n, lx0, z0, from:ei, to:P.length - 1 };
  let lo = 1e9, hi = -1e9, back = 0;
  for (let k = ei; k < P.length; k++){
    const l = toL(f, P[k]);
    if (l[0] >= PW){
      // the crossing, between k-1 and k
      const a = toL(f, P[k-1]), t = (PW - a[0])/(l[0] - a[0]);
      f.to = k; f.exit = [P[k-1][0] + (P[k][0]-P[k-1][0])*t, P[k-1][1] + (P[k][1]-P[k-1][1])*t]; f.zx = a[1] + (l[1]-a[1])*t;
      break;
    }
    lo = Math.min(lo, l[1]); hi = Math.max(hi, l[1]); if (l[0] < lx0 - 0.05) back++;
  }
  f.lo = lo; f.hi = hi;
  // keep the track's middle near ZR, never near the edges, and never running back past the crease
  // a panel the route ends in has no exit to aim for: only keep the track centred and inside it
  const lastPanel = !f.exit && ei > 0 && Math.hypot(P[P.length-1][0] - E[0], P[P.length-1][1] - E[1]) < (PW - lx0)*SC;
  if(!f.exit && lastPanel){ const l = toL(f, P[P.length-1]); if(l[0] < lx0 + 0.5) back += 50; }
  f.ends = lastPanel;
  f.cost = Math.abs((lo + hi)/2 - ZR) + 4*Math.max(0, hi - 4.1) + 4*Math.max(0, 0.5 - lo) + back*0.01 + (f.exit || lastPanel ? 0 : 1.5);
  return f;
}
const frames = [];
let ei = 0, E = P[0], z0 = ZR, lastAng = Math.PI/2;
for (let i=0;i<NP;i++){
  const lx0 = i === 0 ? X0 : 0;
  let best = null;
  if (ei < P.length - 1){
    for (let a = -180; a < 180; a += 0.5){ const f = tryFrame(i, ei, E, z0, lx0, a*Math.PI/180); if (!best || f.cost < best.cost) best = f; }
  }
  if (best && !best.exit && best.ends){
    // the route ends on this panel: keep its own angle, and the next panel carries on the same way
    best.exit = toM(best, PW, best.z0); best.zx = best.z0; best.to = P.length - 1;
  } else if (!best || !best.exit){
    // past the end of the route: carry on in the last direction
    const f = best || tryFrame(i, P.length - 1, E, z0, lx0, lastAng);
    const u = frames.length ? frames[frames.length-1].u : f.u;
    Object.assign(f, { u, n:[-u[1], u[0]] });
    f.exit = toM(f, PW, z0); f.zx = z0; f.to = P.length - 1;
    best = f;
  }
  lastAng = Math.atan2(best.u[0], -best.u[1]);
  frames.push(best);
  E = best.exit; z0 = best.zx; ei = Math.min(best.to, P.length - 1);
}

/* ---- the route in concertina coordinates, simplified to a few metres ---- */
const R = [];
frames.forEach(f => {
  if (f.from >= P.length - 1 && f.i > 0) return;
  // the crease crossing is shared: each panel starts on it and ends on it
  if (f.i > 0){ const l = toL(f, f.e); R.push([f.i*PW + l[0], l[1], null, null, f.i]); }
  for (let k = f.from + (f.i > 0 ? 1 : 0); k < P.length; k++){
    const l = toL(f, P[k]);
    if (l[0] >= PW) break;
    R.push([f.i*PW + l[0], l[1], track[k][2], track[k][3], f.i]);
  }
});
// fill km and height at the crease points from their neighbours
R.forEach((r, k) => { if (r[2] === null){ const a = R[k-1], b = R[k+1] || a; r[2] = (a[2] + b[2])/2; r[3] = Math.round((a[3] + b[3])/2); } });
function dp(pts, tol){
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length-1] = 1;
  const st = [[0, pts.length-1]];
  while (st.length){
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const ax = pts[a][0], az = pts[a][1], bx = pts[b][0], bz = pts[b][1], L = Math.hypot(bx-ax, bz-az) || 1e-9;
    for (let k=a+1;k<b;k++){ const d = Math.abs((bx-ax)*(az-pts[k][1]) - (ax-pts[k][0])*(bz-az))/L; if (d > md){ md = d; mi = k; } }
    if (md > tol){ keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((p, k) => keep[k]);
}
const route = dp(R, 4/SC);
const bad = R.filter(r => r[1] < -4.6 || r[1] > 4.6 || r[0] < r[4]*PW - 0.02 || r[0] > (r[4]+1)*PW + 0.02);
frames.forEach(f => {
  const rs = R.filter(r => r[4] === f.i);
  if (!rs.length) return console.log('panel', f.i+1, 'no route');
  console.log('panel', f.i+1, 'bearing', (Math.atan2(f.u[0], -f.u[1])*180/Math.PI).toFixed(1), 'deg, route z', Math.min(...rs.map(r=>r[1])).toFixed(2), 'to', Math.max(...rs.map(r=>r[1])).toFixed(2), ', km', rs[0][2].toFixed(2), 'to', rs[rs.length-1][2].toFixed(2));
});
console.log('route', R.length, 'points ->', route.length, 'kept, outside the panels:', bad.length);

/* ---- one height grid per panel, in the panel's own coordinates, uint16 metres ---- */
const RES = [[144, 192], [144, 192], [120, 160], [120, 160], [120, 160]];   // every panel carries scenery and a model now
const grids = frames.map((f, i) => {
  const [nx, nz] = RES[i], buf = Buffer.alloc(nx*nz*2); let lo = 1e9, hi = -1e9;
  for (let j=0;j<nz;j++) for (let k=0;k<nx;k++){
    const lx = k/(nx-1)*PW, lz = -PD/2 + j/(nz-1)*PD;
    const m = toM(f, lx, lz), ll = toLL(m[0], m[1]), h = G.h(ll[0], ll[1]);
    buf.writeUInt16LE(Math.max(0, Math.round(h)), (j*nx + k)*2); lo = Math.min(lo, h); hi = Math.max(hi, h);
  }
  return { nx, nz, lo:Math.round(lo), hi:Math.round(hi), b64:buf.toString('base64') };
});

/* ---- Ngāuruhoe's real profile, for the scenery: from 3.2 km up the Mangatepōpō valley, the cone
   alone (the ground 2.4 to 3.6 km away), its crater a notch at the top. the rest of the scenery is
   drawn, not measured (Sam, after round 1: the map tells the truth, the paper tells the mood) ---- */
const Rr = 6371000, Kr = 0.13;
const cone = (() => {
  const k = track.findIndex(p => p[2] >= 3.2), V = track[k], vx = G.px(V[1]), vy = G.py(V[0]);
  const mpp = 40075016.686*Math.cos(V[0]*Math.PI/180)/(2**14*256), h0 = G.at(vx, vy) + 1.7, rows = [];
  for (let a = 98; a <= 156 + 1e-6; a += 0.5){
    const br = a*Math.PI/180, sx = Math.sin(br), sy = -Math.cos(br); let best = -90;
    for (let d = 2400; d < 3600; d += 8){ const ang = Math.atan2(G.at(vx + sx*d/mpp, vy + sy*d/mpp) - d*d*(1-Kr)/(2*Rr) - h0, d)*180/Math.PI; if (ang > best) best = ang; }
    rows.push(+best.toFixed(2));
  }
  console.log('cone profile', rows.length, 'rows, top', Math.max(...rows));
  return { az0:98, az1:156, step:0.5, rows };
})();

/* ---- the numbers for each stretch, measured on the track: its km, distance, climb, descent, highest
   and lowest point. heights from the DEM along the trace, climbs counted with a 10 m threshold so the
   model's noise does not add up (the whole crossing has to come out near the research's 830 m and 1 196 m) ---- */
const TH = +(process.env.TH || 10);   // 10 m: the whole crossing comes out at 851 up, 1 196 down (DOC: 1 196 down, research measured 830 up)
const stretches = frames.map((f, i) => {
  const rs = R.filter(r => r[4] === i && r[3] !== null); if (rs.length < 2) return null;
  let up = 0, down = 0, ref = rs[0][3], hi = -1e9, lo = 1e9, hiKm = 0;
  for (const r of rs){
    const h = r[3]; if (h > hi){ hi = h; hiKm = r[2]; } lo = Math.min(lo, h);
    if (h - ref >= TH){ up += h - ref; ref = h; } else if (ref - h >= TH){ down += ref - h; ref = h; }
  }
  return { km0:+rs[0][2].toFixed(2), km1:+rs[rs.length-1][2].toFixed(2), up:Math.round(up), down:Math.round(down), hi:Math.round(hi), hiKm:+hiKm.toFixed(2), lo:Math.round(lo) };
});
{ const t = stretches.filter(Boolean); console.log('stretches', JSON.stringify(t)); console.log('total up', t.reduce((a, b) => a + b.up, 0), 'down', t.reduce((a, b) => a + b.down, 0)); }

const js = `/* Tongariro Alpine Crossing as a strip map, for the interior (V4 on). Made by tools/terrain/strip.mjs on ${new Date().toISOString().slice(0,10)}.
   Sources: the track is OpenStreetMap relation 104369 (DOC, (c) OpenStreetMap contributors, ODbL),
   heights are AWS Terrain Tiles at zoom 14 (Mapzen / Tilezen, the New Zealand DEM here).
   Each panel is its own straight stretch of the route (an Ogilby strip): frames[i] maps the panel's
   local x (0..PW, along the route) and z (-PD/2..PD/2, + is the front, right of travel) to metres
   east and south of REF. grids[i] is the ground in those local coordinates, row 0 at the back.
   route rows are [concertina x, z, km along the OSM trace, DEM metres, panel].
   cone is Ngāuruhoe's real profile from 3.2 km up the valley (angle above the eye per half degree of bearing).
   stretches[i]: panel i's stretch measured on the trace (km on the OSM trace, metres from the DEM, 10 m climb threshold).
   Printed heights come from treks-data.js (researched), never from this grid. */
window.TONGARIRO_STRIP = ${JSON.stringify({
  PW, PD, SC, ZR, X0, REF, KX:Math.cos(REF.lat*Math.PI/180)*111320, KY:110574,
  frames:frames.map(f => ({ e:f.e.map(v=>+v.toFixed(2)), u:f.u.map(v=>+v.toFixed(6)), n:f.n.map(v=>+v.toFixed(6)), lx0:f.lx0, z0:+f.z0.toFixed(4), route:f.from < P.length - 1 })),
  grids, route:route.map(r => [+r[0].toFixed(4), +r[1].toFixed(4), +r[2].toFixed(3), r[3], r[4]]),
  cone, stretches
})};
`;
writeFileSync(OUT, js);
console.log('wrote', OUT, (js.length/1024).toFixed(1), 'KB');

/* ---- preview: the five panels side by side, hillshade and 20 m contours, the route in red ---- */
const S = 60, PX = Math.round(PW*S), PZ = Math.round(PD*S), IW = PX*NP + (NP-1)*8, rgb = Buffer.alloc(IW*PZ*3, 30);
frames.forEach((f, i) => {
  const H = new Float32Array(PX*PZ);
  for (let y=0;y<PZ;y++) for (let x=0;x<PX;x++){ const m = toM(f, x/S, -PD/2 + y/S), ll = toLL(m[0], m[1]); H[y*PX+x] = G.h(ll[0], ll[1]); }
  for (let y=1;y<PZ-1;y++) for (let x=1;x<PX-1;x++){
    const q = y*PX+x, dx = (H[q+1]-H[q-1])/(2*SC/S), dy = (H[q+PX]-H[q-PX])/(2*SC/S);
    const sh = Math.max(0, Math.min(1, 0.55 + (-dx*0.6 - dy*0.6)*0.8));
    const lev = Math.floor(H[q]/20), c = (lev !== Math.floor(H[q+1]/20) || lev !== Math.floor(H[q+PX]/20)) ? (lev % 5 === 0 ? 0.5 : 0.75) : 1;
    const g = Math.round((70 + sh*170)*c), o = (y*IW + i*(PX+8) + x)*3;
    rgb[o] = g; rgb[o+1] = Math.round(g*0.97); rgb[o+2] = Math.round(g*0.92);
  }
});
R.forEach(r => { const i = r[4], x = Math.round((r[0] - i*PW)*S) + i*(PX+8), y = Math.round((r[1] + PD/2)*S);
  for (let oy=-1;oy<=1;oy++) for (let ox=-1;ox<=1;ox++){ const o = ((y+oy)*IW + x+ox)*3; if (o >= 0 && o < rgb.length){ rgb[o]=225; rgb[o+1]=45; rgb[o+2]=30; } } });
const tmp = `${W}/strip.rgb`; writeFileSync(tmp, rgb);
execFileSync('ffmpeg', ['-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${IW}x${PZ}`,'-i',tmp,`${W}/strip.png`]);
console.log('preview', `${W}/strip.png`);
