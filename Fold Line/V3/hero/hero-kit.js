/* ============================================================
   FOLD LINE V3 . HERO KIT
   The shared pieces every hero option stands on (?hero=fold, and the round 1
   options drawer and stack, kept in V3 while fold grows out of them).
   Classic script, no modules, so the page still runs from a double click on file://.

   What it does:
   - the V2 look: palette, type, the dark bookcloth table, the header
   - the cover series: one pocket map cover per trek, contours from real elevation data
   - terrain helpers: sample a trek's height grid, trace contour loops (open or closed)
   - the name switch: &name=northing|hachure|spot|neatline|foldline
   - the frame, resize and intro plumbing, and the &tour cursor for recordings

   An option registers itself as window.HERO_OPTIONS[slug] = function(kit){ ... return hooks }
   hooks: { frame(dt, t, hx), resize(), intro() -> gsap timeline or nothing, tour() -> keys,
            boot() runs once before the page's boot render, so the first frame is already ours,
            after() runs right after each render (the frame is still in the drawing buffer),
            pOf(hx) and pLand for a hero that lands inside the map instead of on it }
   intro() is called on the first smooth frame, not when the page asks: the GPU is still
   linking shaders for the first few frames and a timeline started then skips its opening
   hx runs 0 to 1 over the hero's own stretch of scroll. At hx = 1 the option must be gone
   and the camera must sit exactly on kit.homeCam(): map No. 01 shut on the table.
   ============================================================ */
(function(){
'use strict';

window.HERO_OPTIONS = window.HERO_OPTIONS || {};

/* ---- names that survived the clash check (14 Oct 2026). none of them is a real
   trekking or outdoor company as far as a web search could tell ---- */
const NAMES = {
  northing: { name:'Northing', cover:'NORTHING', sub:'Expeditions', note:'the second half of a grid reference, measured north up the sheet' },
  hachure:  { name:'Hachure & Co.', cover:'HACHURE & CO.', sub:'Trekking', note:'short strokes drawn down a slope, closer together where it is steeper' },
  spot:     { name:'Spot Height', cover:'SPOT HEIGHT', sub:'Guided treks', note:'a surveyed height printed next to a dot on a map' },
  neatline: { name:'Neatline', cover:'NEATLINE', sub:'Expeditions', note:'the ruled border that frames the printed part of a map' },
  foldline: { name:'Fold Line', cover:'FOLD LINE', sub:'Trekking company', note:'the crease where a printed sheet folds' }
};

/* ---- the V2 palette. one accent, the route red. one muted tone per trek ---- */
const V2 = {
  ink:'#1B2230', inkSoft:'#4A5263', paper:'#EFE9DD', paperHi:'#F7F3EA', card:'#F3EFE6', ivory:'#F1EBDF',
  red:'#C8432B', redDk:'#A23420',
  table:'#2A2824', tableDk:'#161513', bg:'#121110',
  tones:['#55595E', '#5D6B4E', '#4F6A78', '#8A6A45', '#3F4A6B'],
  toneNames:['basalt', 'cloud forest', 'glacier', 'savanna', 'high altitude'],
  serif:'"Instrument Serif", Georgia, serif', sans:'"Instrument Sans", system-ui, sans-serif', mono:'"DM Mono", ui-monospace, Menlo, monospace'
};

/* ---- trek data. hero/treks-data.js holds the researched numbers (data/treks.md has the
   sources). this fallback only keeps the page from breaking if that file is missing ---- */
const KEYS = ['tongariro', 'inca', 'torres', 'kili', 'everest'];
function trekList(){
  const T = window.TREKS;
  if(Array.isArray(T) && T.length === 5) return T;
  return KEYS.map((k, i) => ({ n:i+1, key:k, name:['Tongariro','Inca Trail','W Trek','Kilimanjaro','Everest Base Camp'][i],
    line2:['Alpine Crossing','to Machu Picchu','Torres del Paine','Machame route','Kala Patthar'][i], country:'', days:'', km:'', high:{ name:'', m:0 }, marks:[] }));
}

/* ---- number formatting the way the map prints it: 1 886 m ---- */
const NB = ' ';
function fmtM(m){ return String(Math.round(m)).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + 'm'; }
function fmtN(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB); }

/* ============================================================
   terrain. TERRAIN[key].crop is a 128 x 128 byte grid, row 0 north.
   ============================================================ */
const GRIDS = {};
function terrain(key){
  if(GRIDS[key]) return GRIDS[key];
  const T = window.TERRAIN && window.TERRAIN[key];
  if(!T) return null;
  const c = T.crop, N = c.n, raw = atob(c.bytes), G = new Float32Array(N*N);
  for(let i=0;i<N*N;i++) G[i] = c.lo + (raw.charCodeAt(i)/255)*(c.hi - c.lo);
  const at = (u, v) => {             // u east 0..1, v south 0..1, metres
    const X = Math.max(0, Math.min(N - 1.0001, u*(N - 1))), Y = Math.max(0, Math.min(N - 1.0001, v*(N - 1)));
    const i = X|0, j = Y|0, fx = X - i, fy = Y - j;
    const a = G[j*N+i], b = G[j*N+i+1], cc = G[(j+1)*N+i], d = G[(j+1)*N+i+1];
    return a + (b - a)*fx + (cc - a)*fy + (a - b - cc + d)*fx*fy;
  };
  // lat/lon to the crop's u, v. the crop is small enough to treat as flat
  const uv = (lat, lon) => {
    const k = Math.cos(c.lat*Math.PI/180)*111.32;
    return [0.5 + (lon - c.lon)*k/c.km, 0.5 - (lat - c.lat)*110.57/c.km];
  };
  return (GRIDS[key] = { key, N, G, lo:c.lo, hi:c.hi, km:c.km, peak:c.peak, note:c.note, at, uv, sky:T.sky });
}

/* marching squares on the grid. returns line segments for one level, in u, v.
   with closed:true the grid is padded with a ring below every level, so every
   contour closes along the cut edge of the model, the way a real terrain model
   is cut square */
function isoSegments(g, level, closed, win){
  const N = g.N, P = closed ? 1 : 0, M = N + 2*P, below = g.lo - 1;
  // win cuts the model to a rectangle of the crop: grid points outside it count as below every level
  const wx0 = win ? Math.ceil(win[0]*(N-1)) : 0, wy0 = win ? Math.ceil(win[1]*(N-1)) : 0;
  const wx1 = win ? Math.floor(win[2]*(N-1)) : N-1, wy1 = win ? Math.floor(win[3]*(N-1)) : N-1;
  const val = (i, j) => { const x = i - P, y = j - P; return (x < wx0 || y < wy0 || x > wx1 || y > wy1) ? below : g.G[y*N + x]; };
  const toU = (i) => (i - P)/(N - 1);
  const segs = [];
  for(let j=0;j<M-1;j++) for(let i=0;i<M-1;i++){
    const a = val(i,j), b = val(i+1,j), c = val(i+1,j+1), d = val(i,j+1);
    const idx = (a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0);
    if(idx === 0 || idx === 15) continue;
    // edge points, keyed so segments can be joined: top, right, bottom, left.
    // the key is a number (edge index times two, plus one for a vertical edge), not a string
    const T = () => [(j*M + i)*2, toU(i + (level - a)/(b - a)), toU(j)];
    const R = () => [(j*M + i + 1)*2 + 1, toU(i + 1), toU(j + (level - b)/(c - b))];
    const B = () => [((j+1)*M + i)*2, toU(i + (level - d)/(c - d)), toU(j + 1)];
    const L = () => [(j*M + i)*2 + 1, toU(i), toU(j + (level - a)/(d - a))];
    // oriented so the high ground is always on the same side of travel
    switch(idx){
      case 1: segs.push([L(), B()]); break;
      case 2: segs.push([B(), R()]); break;
      case 3: segs.push([L(), R()]); break;
      case 4: segs.push([R(), T()]); break;
      case 5: { const m = (a + b + c + d)/4; if(m >= level){ segs.push([L(), T()]); segs.push([R(), B()]); } else { segs.push([L(), B()]); segs.push([R(), T()]); } break; }
      case 6: segs.push([B(), T()]); break;
      case 7: segs.push([L(), T()]); break;
      case 8: segs.push([T(), L()]); break;
      case 9: segs.push([T(), B()]); break;
      case 10: { const m = (a + b + c + d)/4; if(m >= level){ segs.push([T(), R()]); segs.push([B(), L()]); } else { segs.push([T(), L()]); segs.push([B(), R()]); } break; }
      case 11: segs.push([T(), R()]); break;
      case 12: segs.push([R(), L()]); break;
      case 13: segs.push([R(), B()]); break;
      case 14: segs.push([B(), L()]); break;
    }
  }
  return segs;
}

/* join segments into closed loops. each loop: { pts:[[u,v]...], area } where area > 0
   is an outer edge (ground above the level inside) and area < 0 is a hole */
function isoLoops(key, level, opts){
  const g = typeof key === 'string' ? terrain(key) : key;
  const segs = isoSegments(g, level, true, opts && opts.win), next = new Map();
  for(const s of segs) next.set(s[0][0], s);
  const used = new Set(), loops = [];
  for(const s of segs){
    if(used.has(s[0][0])) continue;
    const pts = []; let cur = s, guard = 0;
    while(cur && !used.has(cur[0][0]) && guard++ < 100000){
      used.add(cur[0][0]); pts.push([cur[0][1], cur[0][2]]);
      cur = next.get(cur[1][0]);
    }
    if(pts.length < 3) continue;
    let A = 0; for(let i=0;i<pts.length;i++){ const p = pts[i], q = pts[(i+1)%pts.length]; A += p[0]*q[1] - q[0]*p[1]; }
    A *= 0.5;
    if(Math.abs(A) < ((opts && opts.minArea) || 4e-5)) continue;
    loops.push({ pts: (opts && opts.smooth) ? chaikin(pts, opts.smooth) : pts, area:A });
  }
  // marching squares orientation above makes outer loops one sign. normalise so outer > 0
  const outerSign = loops.length ? Math.sign(loops.reduce((m, l) => Math.abs(l.area) > Math.abs(m.area) ? l : m).area) : 1;
  loops.forEach(l => { l.area *= outerSign; if(outerSign < 0) l.pts.reverse(); });
  return loops;
}
function chaikin(pts, n){
  for(let k=0;k<n;k++){
    const o = [];
    for(let i=0;i<pts.length;i++){
      const p = pts[i], q = pts[(i+1)%pts.length];
      o.push([p[0]*0.75 + q[0]*0.25, p[1]*0.75 + q[1]*0.25], [p[0]*0.25 + q[0]*0.75, p[1]*0.25 + q[1]*0.75]);
    }
    pts = o;
  }
  return pts;
}
function inside(pt, poly){
  let c = false;
  for(let i=0, j=poly.length-1; i<poly.length; j=i++){
    const a = poly[i], b = poly[j];
    if(((a[1] > pt[1]) !== (b[1] > pt[1])) && (pt[0] < (b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1]) + a[0])) c = !c;
  }
  return c;
}
/* THREE.Shapes (with holes) for the ground above one level. size: model width in world
   units, centred on 0. u maps to +x, v maps to +z (south toward the viewer), so pass the
   result to an ExtrudeGeometry and rotate it -90 degrees about x.
   opts: { smooth: chaikin passes, minArea, win:[u0,v0,u1,v1] to cut the model to a window.
   with a window, size still scales a full 0..1 crop, so the window keeps its place on the map } */
function levelShapes(THREE, key, level, size, opts){
  // under the grid's own floor every point is above the level, so the card is the whole window
  const g = typeof key === 'string' ? terrain(key) : key;
  if(g && level <= g.lo) level = g.lo + 1e-3;
  const loops = isoLoops(key, level, opts);
  const outers = loops.filter(l => l.area > 0), holes = loops.filter(l => l.area < 0);
  const v2 = (p) => new THREE.Vector2((p[0] - 0.5)*size, -(p[1] - 0.5)*size);
  const shapes = outers.map(o => { const s = new THREE.Shape(o.pts.map(v2)); s._loop = o; return s; });
  for(const h of holes){
    const owner = outers.findIndex(o => inside(h.pts[0], o.pts));
    if(owner >= 0) shapes[owner].holes.push(new THREE.Path(h.pts.map(v2)));
  }
  return shapes;
}

/* the height of a warped cover at a point, the way makePaper bends it. x, z: from the
   cover's centre in world units (z toward the viewer). warp and seed as passed to makePaper,
   frequencies are the covers' [0.3, 0.26, 0.18]. V1's cover is warp 0.01, seed 9.1 */
function coverWarp(x, z, warp, seed, f){
  f = f || [0.3, 0.26, 0.18];
  const X = x, Y = -z;
  return warp*(Math.sin(X*f[0] + seed)*0.55 + Math.sin(Y*f[1] + seed*1.7)*0.35 + Math.sin((X + Y)*f[2] + seed*2.3)*0.25);
}

/* contour lines straight onto a 2D canvas. rect: [x, y, w, h] on the canvas,
   win: [u0, v0, u1, v1] of the crop to show in it */
function drawContours(ctx, key, rect, win, o){
  const g = terrain(key); if(!g) return;
  const step = o.step, i0 = Math.ceil(g.lo/step), i1 = Math.floor(g.hi/step);
  const sx = rect[2]/(win[2] - win[0]), sy = rect[3]/(win[3] - win[1]);
  const X = (u) => rect[0] + (u - win[0])*sx, Y = (v) => rect[1] + (v - win[1])*sy;
  const thin = new Path2D(), bold = new Path2D();
  for(let n=i0; n<=i1; n++){
    const segs = isoSegments(g, n*step, false), pth = (n % (o.index || 5) === 0) ? bold : thin;
    for(const s of segs){ pth.moveTo(X(s[0][1]), Y(s[0][2])); pth.lineTo(X(s[1][1]), Y(s[1][2])); }
  }
  ctx.save();
  ctx.beginPath(); ctx.rect(rect[0], rect[1], rect[2], rect[3]); ctx.clip();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = o.thinCol; ctx.lineWidth = o.thinW; ctx.stroke(thin);
  ctx.strokeStyle = o.boldCol; ctx.lineWidth = o.boldW; ctx.stroke(bold);
  ctx.restore();
}
/* soft hypsometric bands under the lines: higher ground prints a touch lighter */
function drawBands(ctx, key, rect, win, col, strength){
  const g = terrain(key); if(!g) return;
  const w = 150, h = Math.round(150*rect[3]/rect[2]), c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d'), img = x.createImageData(w, h);
  const n = parseInt(col.slice(1), 16), r = (n>>16)&255, gg = (n>>8)&255, b = n&255;
  for(let py=0; py<h; py++) for(let px=0; px<w; px++){
    const u = win[0] + (px/(w-1))*(win[2]-win[0]), v = win[1] + (py/(h-1))*(win[3]-win[1]);
    const e = (g.at(u, v) - g.lo)/(g.hi - g.lo), dx = g.at(u + 0.006, v) - g.at(u - 0.006, v), dy = g.at(u, v + 0.006) - g.at(u, v - 0.006);
    // light from the north west, the cartographer's convention
    const sh = Math.max(-1, Math.min(1, (-dx - dy)/((g.hi - g.lo)*0.06)));
    const k = (py*w + px)*4;
    img.data[k] = r; img.data[k+1] = gg; img.data[k+2] = b;
    img.data[k+3] = Math.round(255*Math.max(0, Math.min(1, strength*(0.25 + 0.75*e) + sh*strength*0.9)));
  }
  x.putImageData(img, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(c, rect[0], rect[1], rect[2], rect[3]); ctx.restore();
}

/* ============================================================
   the cover series. 600 x 800 (the map's 3:4), one tone per trek,
   the real contours in ivory, the trek's high point in red
   ============================================================ */
function tracked(x, str, px, py, sp, align){
  let w = 0; const ws = [];
  for(const ch of str){ const cw = x.measureText(ch).width; ws.push(cw); w += cw + sp; }
  w -= sp;
  let cx = align === 'center' ? px - w/2 : align === 'right' ? px - w : px;
  let i = 0; const prev = x.textAlign; x.textAlign = 'left';
  for(const ch of str){ x.fillText(ch, cx, py); cx += ws[i++] + sp; }
  x.textAlign = prev;
  return w;
}
function rgba(hex, a){ const n = parseInt(hex.slice(1), 16); return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')'; }
function shade(hex, k){ // k < 0 darker, k > 0 lighter
  const n = parseInt(hex.slice(1), 16); let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  const t = k < 0 ? 0 : 255, f = Math.abs(k);
  r = Math.round(r + (t - r)*f); g = Math.round(g + (t - g)*f); b = Math.round(b + (t - b)*f);
  return '#' + ((1<<24) | (r<<16) | (g<<8) | b).toString(16).slice(1);
}

function drawCover(i, brand, W, H){
  W = W || 600; H = H || 800;
  const T = trekList()[i], tone = V2.tones[i], key = KEYS[i], s = W/600;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = tone; x.fillRect(0, 0, W, H);
  const gr = x.createLinearGradient(0, 0, W*0.3, H);
  gr.addColorStop(0, rgba('#FFFFFF', 0.06)); gr.addColorStop(0.6, rgba('#000000', 0)); gr.addColorStop(1, rgba('#000000', 0.12));
  x.fillStyle = gr; x.fillRect(0, 0, W, H);

  // the contour field bleeds across the middle of the cover
  const g = terrain(key);
  const fy0 = 236*s, fy1 = 708*s, rect = [0, fy0, W, fy1 - fy0];
  const asp = rect[3]/rect[2], win = [0, 0.5 - asp*0.5, 1, 0.5 + asp*0.5];
  if(g){
    drawBands(x, key, rect, win, V2.ivory, 0.10);
    const span = g.hi - g.lo, step = span > 2500 ? 100 : span > 1100 ? 50 : 25;
    drawContours(x, key, rect, win, { step, index:5, thinCol:rgba(V2.ivory, 0.26), thinW:1*s, boldCol:rgba(V2.ivory, 0.55), boldW:1.7*s });
    // fade the field into the board at the top and bottom, like ink running out
    const f1 = x.createLinearGradient(0, fy0, 0, fy0 + 70*s); f1.addColorStop(0, tone); f1.addColorStop(1, rgba(tone, 0));
    x.fillStyle = f1; x.fillRect(0, fy0 - 1, W, 70*s);
    const f2 = x.createLinearGradient(0, fy1 - 80*s, 0, fy1); f2.addColorStop(0, rgba(tone, 0)); f2.addColorStop(1, tone);
    x.fillStyle = f2; x.fillRect(0, fy1 - 80*s, W, 80*s + 1);
    // the marks: a red dot for where the trek tops out, plain ticks for the rest
    (T.marks || []).forEach(m => {
      const q = g.uv(m.lat, m.lon), px = rect[0] + (q[0] - win[0])/(win[2] - win[0])*rect[2], py = rect[1] + (q[1] - win[1])/(win[3] - win[1])*rect[3];
      if(px < 20*s || px > W - 20*s || py < fy0 + 30*s || py > fy1 - 30*s) return;
      x.fillStyle = m.red ? V2.red : V2.ivory; x.strokeStyle = tone; x.lineWidth = 2.5*s;
      x.beginPath(); x.arc(px, py, (m.red ? 6.5 : 4)*s, 0, Math.PI*2); x.fill(); x.stroke();
      x.font = '500 ' + Math.round(12.5*s) + 'px ' + V2.mono; x.fillStyle = rgba(V2.ivory, 0.92);
      const right = px > W*0.62;
      tracked(x, m.label, px + (right ? -14 : 14)*s, py + 4.5*s, 1.3*s, right ? 'right' : 'left');
    });
  }

  // header: the brand small and spaced, the series number on the right
  x.fillStyle = rgba(V2.ivory, 0.9); x.font = '500 ' + Math.round(13*s) + 'px ' + V2.mono;
  tracked(x, brand.cover, 40*s, 62*s, 3.2*s, 'left');
  tracked(x, 'NO. ' + String(i + 1).padStart(2, '0'), W - 40*s, 62*s, 3.2*s, 'right');
  x.fillStyle = rgba(V2.ivory, 0.45); x.fillRect(40*s, 80*s, W - 80*s, 1.2*s);
  // title
  x.fillStyle = V2.ivory; x.font = '400 ' + Math.round(86*s) + 'px ' + V2.serif;
  x.fillText(T.name, 36*s, 168*s);
  x.font = 'italic 400 ' + Math.round(40*s) + 'px ' + V2.serif; x.fillStyle = rgba(V2.ivory, 0.86);
  x.fillText(T.line2, 39*s, 214*s);
  // data row
  x.fillStyle = rgba(V2.ivory, 0.45); x.fillRect(40*s, 726*s, W - 80*s, 1.2*s);
  x.fillStyle = rgba(V2.ivory, 0.92); x.font = '500 ' + Math.round(14*s) + 'px ' + V2.mono;
  const cells = [T.daysLabel || '', T.kmLabel || '', T.high && T.high.m ? 'MAX ' + fmtM(T.high.m).toUpperCase() : '', (T.countryShort || T.country || '').toUpperCase()];
  const cw = (W - 80*s)/4;
  cells.forEach((t, k) => tracked(x, t, 40*s + k*cw, 760*s, 1.6*s, 'left'));
  x.fillStyle = V2.red; x.fillRect(40*s, 726*s - 0.6*s, 34*s, 3*s);
  return c;
}

/* ---- the table: dark bookcloth. the weave is regular so it averages out to an even
   surface at a distance (random thread shading reads as plaid), with soft slubs and mottling ---- */
function drawTableV2(){
  const S = 512, c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = V2.table; x.fillRect(0, 0, S, S);
  let seed = 7; const r = () => { seed = (seed*1664525 + 1013904223)>>>0; return seed/4294967296; };
  // over and under: alternate threads a touch darker, both ways
  for(let y=0; y<S; y+=2){ x.fillStyle = (y/2) % 2 ? 'rgba(0,0,0,0.045)' : 'rgba(255,240,220,0.018)'; x.fillRect(0, y, S, 1); }
  for(let X=0; X<S; X+=2){ x.fillStyle = (X/2) % 2 ? 'rgba(0,0,0,0.035)' : 'rgba(255,240,220,0.014)'; x.fillRect(X, 0, 1, S); }
  // slubs: short thicker runs in the thread, the thing that says cloth up close
  for(let k=0;k<420;k++){
    const y = Math.floor(r()*S/2)*2, X0 = r()*S, len = 6 + r()*26;
    x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,240,220,0.03)';
    x.fillRect(X0, y, len, 1); if(X0 + len > S) x.fillRect(X0 - S, y, len, 1);
  }
  for(let k=0;k<22;k++){
    const bx = r()*S, by = r()*S, br = 60 + r()*140, g = x.createRadialGradient(bx, by, 0, bx, by, br);
    const dark = r() < 0.5; g.addColorStop(0, dark ? 'rgba(0,0,0,0.035)' : 'rgba(255,235,210,0.018)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    // drawn in all four wraps so the tile repeats without a seam
    for(const ox of [-S, 0, S]) for(const oy of [-S, 0, S]){ x.save(); x.translate(ox, oy); x.fillRect(bx - br, by - br, br*2, br*2); x.restore(); }
  }
  return c;
}

/* ---- shared CSS for the V2 look. options add their own on top ---- */
const CSS = `
html.hero-on{
  --v2-ink:${V2.ink}; --v2-ink-soft:${V2.inkSoft}; --v2-paper:${V2.paper}; --v2-ivory:${V2.ivory}; --v2-red:${V2.red};
  --v2-bg:${V2.bg}; --v2-serif:${V2.serif}; --v2-sans:${V2.sans}; --v2-mono:${V2.mono};
  background:var(--v2-bg);
}
html.hero-on body{background:var(--v2-bg);font-family:var(--v2-sans);}
html.hero-on .lamp,html.hero-on .grain{display:none;}
html.hero-on .top{color:var(--v2-ivory);align-items:center;}
html.hero-on .brand{color:var(--v2-ivory);gap:14px;align-items:baseline;}
html.hero-on .brand-name{font-family:var(--v2-serif);font-weight:400;font-size:27px;letter-spacing:0;font-variation-settings:normal;}
html.hero-on .brand-sub{font-family:var(--v2-mono);color:rgba(241,235,223,0.62);letter-spacing:0.2em;font-size:10px;}
html.hero-on .book-top{transform:none;padding:11px 18px 12px;}
html.hero-on .book-top::before{background:var(--v2-ivory);filter:none;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,0.28);}
html.hero-on .book-top span:last-child{font-family:var(--v2-sans);font-weight:500;font-size:13px;letter-spacing:0.01em;color:var(--v2-ink);}
html.hero-on .book-top .dot{background:var(--v2-red);}
html.hero-on .book-top:hover{transform:translateY(-1px);}
html.hero-on .hero-copy{position:fixed;inset:0;left:0;top:0;transform:none;width:auto;pointer-events:none;}
html.hero-on .hero-copy > *{pointer-events:auto;}
html.hero-on .hero h1{font-family:inherit;font-weight:inherit;font-size:inherit;line-height:inherit;letter-spacing:inherit;margin:0;color:inherit;font-variation-settings:normal;text-wrap:balance;}
html.hero-on .hero h1 em{font-weight:inherit;color:inherit;}
.v2-k{font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.2em;text-transform:uppercase;font-weight:500;margin:0;}
.v2-display{font-family:var(--v2-serif);font-weight:400;letter-spacing:-0.012em;line-height:0.96;margin:0;}
.v2-display em{font-style:italic;}
.v2-display .acc{color:var(--v2-red);}
.v2-line{display:block;overflow:hidden;padding-bottom:0.1em;margin-bottom:-0.1em;}
.v2-line > span{display:inline-block;will-change:transform;}
.v2-lede{font-family:var(--v2-sans);font-size:clamp(14.5px,1.05vw,16.5px);line-height:1.6;max-width:38ch;margin:0;text-wrap:pretty;}
.v2-btn{display:inline-flex;align-items:center;gap:12px;border:0;cursor:pointer;text-decoration:none;font-family:var(--v2-sans);font-size:14px;font-weight:500;
  padding:14px 22px 15px;border-radius:999px;background:var(--v2-ivory);color:var(--v2-ink);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s;box-shadow:0 8px 24px rgba(0,0,0,0.25);}
.v2-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,0.32);}
.v2-btn .arr{font-family:var(--v2-mono);color:var(--v2-red);}
.v2-ghost{display:inline-flex;align-items:center;gap:10px;font-family:var(--v2-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:inherit;text-decoration:none;}
@media (max-width:760px){ html.hero-on .brand-name{font-size:23px;} }
`;

/* ============================================================
   create: the V2 base, then the option on top of it
   ============================================================ */
function create(api, factory){
  const { THREE, gsap, Q } = api;

  // the name: the option picks a default, &name= overrides it
  const brandKey = () => (Q.get('name') || '').replace(/[^a-z]/g, '');
  let brand = NAMES[brandKey()] || null;

  const st = document.createElement('style'); st.id = 'v2-kit-css'; st.textContent = CSS; document.head.appendChild(st);

  // the table becomes bookcloth, and the V1 daylight sees the dark room
  const tcv = drawTableV2();
  api.table.material.map.image = tcv; api.table.material.map.needsUpdate = true;
  api.table.material.map.repeat.set(52, 26);
  api.table.material.roughness = 0.95;
  const BG = new THREE.Color(V2.bg);
  api.LIGHT.day.bg.copy(BG); api.LIGHT.gold.bg.copy(BG);
  // V1's daylight was tuned for a pale oak table. on dark bookcloth it reads flat and grey,
  // so the V2 room gets a warm key, little ambient and a dark floor bounce: the paper stays
  // bright, the cloth falls away, like a desk under one lamp
  const D = api.LIGHT.day;
  D.key.set('#FFE6C8'); D.ki = 2.9; D.sky.set('#D3C9BA'); D.gnd.set('#120F0C'); D.hi = 0.42; D.fi = 0.22;
  api.scene.background.copy(BG); api.scene.fog.color.copy(BG);

  const copy = document.getElementById('heroCopy');
  copy.innerHTML = '';

  // inherit from api rather than copy it: api has getters (lenis, NARROW) that must stay lazy
  const kit = Object.assign(Object.create(api), {
    V2, NAMES, KEYS, NB, fmtM, fmtN, rgba, shade, trekList, TREKS:trekList(),
    terrain, isoSegments, isoLoops, levelShapes, drawContours, drawBands, chaikin, coverWarp,
    trackedText:tracked, drawCover, copy,
    // project a world point to screen pixels, for tour paths and DOM labels
    screenOf(v){ const p = v.clone().project(api.camera); return [ (p.x*0.5 + 0.5)*window.innerWidth, (-p.y*0.5 + 0.5)*window.innerHeight, p.z ]; },
    // blend the camera between the hero's own shot (w = 0) and V1's shut-map shot (w = 1)
    blendCam(pos, tgt, fov, w){
      const H = api.homeCam();
      api.camera.position.lerpVectors(pos, H.pos, w);
      const t = new THREE.Vector3().lerpVectors(tgt, H.tgt, w);
      api.camera.lookAt(t);
      api.setFov(fov + (H.fov - fov)*w);
    },
    // count a number up inside an element, formatted the way the map prints it
    countTo(el, to, dur, fmt, from){
      const o = { v:from || 0 }; fmt = fmt || ((v) => fmtN(Math.round(v)));
      return gsap.to(o, { v:to, duration:dur, ease:'power2.out', onUpdate:() => { el.textContent = fmt(o.v); } });
    },
    // the five-trek index. a real company page lets you jump to the trek you came for
    indexHTML(cls){
      return '<ol class="v2-index ' + (cls || '') + '">' + trekList().map((t, k) =>
        '<li data-i="' + k + '"><span class="n">' + String(k + 1).padStart(2, '0') + '</span><span class="t">' + t.name + '</span><span class="d">' + (t.daysLabel || '') + '</span></li>').join('') + '</ol>';
    }
  });

  // live getters on the kit itself (Object.assign would freeze them at creation)
  Object.defineProperty(kit, 'brand', { get(){ return brand; } });
  // the camera as it was drawn last frame. V1 moves the real camera to its own shot
  // before frame() runs, so raycasts inside frame() should use this instead
  const eye = api.camera.clone();
  kit.eye = eye;

  const hooks = factory(kit) || {};
  if(!brand) brand = NAMES[hooks.name] || NAMES.northing;

  // header copy for the company
  const bn = document.querySelector('.brand-name'), bs = document.querySelector('.brand-sub');
  if(bn) bn.textContent = brand.name;
  if(bs) bs.textContent = brand.sub + ' . since 2011';
  const bt = document.querySelector('#bookTop span:last-child'); if(bt) bt.textContent = 'Book a trek';
  document.title = brand.name + ' . Five treks, folded';

  // map No. 01 gets the V2 cover: it is what every hero hands off to
  const cov = drawCover(0, brand, 600, 800);
  api.COVER.map.image = cov; api.COVER.map.needsUpdate = true;
  if(hooks.onCover) hooks.onCover(cov);

  // the intro waits for three smooth frames in a row (or 2.2 s): the first frames after
  // boot stall while the GPU links shaders, and an intro started then skips its opening
  let introState = 0, warmN = 0, lastPerf = 0, askPerf = 0;
  function startIntro(){
    introState = 2;
    document.querySelector('.top').style.visibility = 'visible';
    document.getElementById('heroCopy').style.visibility = 'visible';
    const tl = hooks.intro ? hooks.intro() : null;
    window.HERO_READY = true;
    if(Q.has('tour') && hooks.tour) api.startTour(hooks.tour());
    return tl;
  }
  const out = {
    // a hero that lands inside the map: V1's progress for a given hx, and where V1 starts after the hero
    pOf:hooks.pOf || null, pLand:hooks.pLand || 0,
    boot(){ if(hooks.boot) hooks.boot(); },
    frame(dt, t, hx){
      if(introState === 1){
        const now = performance.now();
        warmN = (lastPerf && now - lastPerf < 34) ? warmN + 1 : 0;
        lastPerf = now;
        if(warmN >= 3 || now - askPerf > 2200) startIntro();
      }
      if(hooks.frame) hooks.frame(dt, t, hx);
      eye.copy(api.camera);
    },
    resize(){ if(hooks.resize) hooks.resize(); },
    intro(){
      if(api.DEBUG || api.REDUCED) return startIntro();
      introState = 1; askPerf = performance.now();
      return null;
    }
  };
  // called right after the page renders, while the frame is still in the drawing buffer
  if(hooks.after) out.after = () => hooks.after();
  return out;
}

window.HERO_KIT = { create, NAMES, V2, KEYS, terrain, isoLoops, levelShapes, drawCover, coverWarp };
})();
