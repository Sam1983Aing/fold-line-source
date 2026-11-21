// Tongariro at route scale: the real track from OpenStreetMap and a z14 elevation grid around it.
// Run from tools/terrain with W=<work folder>. The work folder holds:
//   route-meta.json   { z, x0, y0, nx, ny } of the tiles
//   raw/t_z_x_y.rgb   the decoded terrarium tiles (see README)
//   osm-route.json    Overpass answer for relation["route"="hiking"]["name"~"Tongariro Alpine Crossing"]
// Writes route.json (the chained track, start to finish, with km and DEM height) and preview.png.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const W = process.env.W || 'work';
const M = JSON.parse(readFileSync(`${W}/route-meta.json`, 'utf8'));

/* ---- the stitched grid, web mercator ---- */
export function routeGrid(){
  const T = 256, GW = M.nx*T, GH = M.ny*T, E = new Float32Array(GW*GH);
  for (let j=0;j<M.ny;j++) for (let i=0;i<M.nx;i++){
    const b = readFileSync(`${W}/raw/t_${M.z}_${M.x0+i}_${M.y0+j}.rgb`);
    for (let y=0;y<T;y++) for (let x=0;x<T;x++){
      const k = (y*T+x)*3;
      let e = b[k]*256 + b[k+1] + b[k+2]/256 - 32768;
      if (e < 0) e = NaN;                  // a few void pixels read -4 981 m
      E[(j*T+y)*GW + i*T+x] = e;
    }
  }
  // fill voids from their neighbours
  for (let pass=0; pass<8; pass++) for (let q=0;q<E.length;q++) if (Number.isNaN(E[q])){
    let s = 0, n = 0;
    for (const o of [-1, 1, -GW, GW]){ const v = E[q+o]; if (v === v && v !== undefined){ s += v; n++; } }
    if (n) E[q] = s/n;
  }
  const Z = 2**M.z;
  const px = lon => ((lon+180)/360*Z - M.x0)*T;
  const py = lat => { const r = lat*Math.PI/180; return ((1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*Z - M.y0)*T; };
  const at = (X, Y) => {
    X = Math.max(0, Math.min(GW-1.001, X)); Y = Math.max(0, Math.min(GH-1.001, Y));
    const i = Math.floor(X), j = Math.floor(Y), fx = X-i, fy = Y-j;
    const a = E[j*GW+i], b = E[j*GW+i+1], c = E[(j+1)*GW+i], d = E[(j+1)*GW+i+1];
    return a + (b-a)*fx + (c-a)*fy + (a-b-c+d)*fx*fy;
  };
  const h = (lat, lon) => at(px(lon), py(lat));
  return { E, GW, GH, px, py, at, h };
}

/* ---- local metres around a reference point (flat enough at this size) ---- */
export const REF = { lat:-39.12, lon:175.62 };
const KX = Math.cos(REF.lat*Math.PI/180)*111320, KY = 110574;
export const toXY = (lat, lon) => [(lon - REF.lon)*KX, -(lat - REF.lat)*KY];     // x east, y south, metres
export const toLL = (x, y) => [REF.lat - y/KY, REF.lon + x/KX];

if (process.argv[1] && process.argv[1].endsWith('route.mjs')){
  const G = routeGrid();
  const osm = JSON.parse(readFileSync(`${W}/osm-route.json`, 'utf8'));
  const rel = osm.elements.find(e => e.id === 104369);
  // chain the member ways end to end, flipping where needed
  const ways = rel.members.filter(m => m.type === 'way' && m.geometry).map(m => m.geometry.map(p => [p.lat, p.lon]));
  const key = p => p[0].toFixed(7) + ',' + p[1].toFixed(7);
  const START = [-39.145, 175.581];
  const d2 = (a, b) => (a[0]-b[0])**2 + (a[1]-b[1])**2;
  // begin with the way that has an end nearest the road end
  let best = 0, bd = 1e9, flip = false;
  ways.forEach((w, i) => { const a = d2(w[0], START), b = d2(w[w.length-1], START); if (a < bd){ bd = a; best = i; flip = false; } if (b < bd){ bd = b; best = i; flip = true; } });
  const used = new Set([best]);
  let line = flip ? ways[best].slice().reverse() : ways[best].slice();
  while (used.size < ways.length){
    const end = line[line.length-1];
    let ni = -1, nd = 1e9, nf = false;
    ways.forEach((w, i) => { if (used.has(i)) return; const a = d2(w[0], end), b = d2(w[w.length-1], end); if (a < nd){ nd = a; ni = i; nf = false; } if (b < nd){ nd = b; ni = i; nf = true; } });
    if (ni < 0 || nd > 1e-7){ console.log('chain stops: gap', Math.sqrt(nd)*111000, 'm,', ways.length - used.size, 'ways left'); break; }
    used.add(ni);
    const w = nf ? ways[ni].slice().reverse() : ways[ni];
    line = line.concat(w.slice(key(w[0]) === key(end) ? 1 : 0));
  }
  // distance and height along it
  const pts = []; let km = 0;
  line.forEach((p, i) => {
    if (i){ const a = toXY(...line[i-1]), b = toXY(...p); km += Math.hypot(b[0]-a[0], b[1]-a[1])/1000; }
    pts.push([+p[0].toFixed(6), +p[1].toFixed(6), +km.toFixed(4), Math.round(G.h(p[0], p[1]))]);
  });
  console.log('track', pts.length, 'points,', km.toFixed(2), 'km, from', pts[0].slice(0,2), 'to', pts[pts.length-1].slice(0,2));
  writeFileSync(`${W}/route.json`, JSON.stringify(pts));

  // preview: hillshade, 20 m contours, the track in red, over the track's box plus 3 km
  const xs = pts.map(p => toXY(p[0], p[1]));
  const minX = Math.min(...xs.map(v=>v[0])) - 3000, maxX = Math.max(...xs.map(v=>v[0])) + 3000;
  const minY = Math.min(...xs.map(v=>v[1])) - 3000, maxY = Math.max(...xs.map(v=>v[1])) + 3000;
  const S = 10, PW = Math.round((maxX-minX)/S), PH = Math.round((maxY-minY)/S), rgb = Buffer.alloc(PW*PH*3);
  const H = new Float32Array(PW*PH);
  for (let y=0;y<PH;y++) for (let x=0;x<PW;x++){ const ll = toLL(minX + x*S, minY + y*S); H[y*PW+x] = G.h(ll[0], ll[1]); }
  for (let y=1;y<PH-1;y++) for (let x=1;x<PW-1;x++){
    const q = y*PW+x, dx = (H[q+1]-H[q-1])/(2*S), dy = (H[q+PW]-H[q-PW])/(2*S);
    let sh = 0.5 + (-dx*0.7 - dy*0.7)*0.9; sh = Math.max(0, Math.min(1, sh));
    const lev = Math.floor(H[q]/20), lv = [Math.floor(H[q+1]/20), Math.floor(H[q+PW]/20)];
    const c = (lev !== lv[0] || lev !== lv[1]) ? (lev % 5 === 0 ? 0.55 : 0.78) : 1;
    const g = Math.round((60 + sh*180)*c);
    rgb[q*3] = g; rgb[q*3+1] = g; rgb[q*3+2] = Math.round(g*0.96);
  }
  xs.forEach(v => { const x = Math.round((v[0]-minX)/S), y = Math.round((v[1]-minY)/S);
    for (let oy=-1;oy<=1;oy++) for (let ox=-1;ox<=1;ox++){ const q = ((y+oy)*PW + x+ox)*3; rgb[q]=220; rgb[q+1]=40; rgb[q+2]=30; } });
  const tmp = `${W}/preview.rgb`; writeFileSync(tmp, rgb);
  execFileSync('ffmpeg', ['-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${PW}x${PH}`,'-i',tmp,`${W}/preview.png`]);
  console.log('preview', PW, 'x', PH, 'px at', S, 'm a pixel, box x', minX.toFixed(0), maxX.toFixed(0), 'y', minY.toFixed(0), maxY.toFixed(0));
}
