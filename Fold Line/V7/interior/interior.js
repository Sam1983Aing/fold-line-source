/* ============================================================
   FOLD LINE . V4 . the interior, as V4 ends (15 Oct 2026)
   Sam's rule after round 1: the map tells the truth, the paper tells the mood. The real
   Tongariro map (OpenStreetMap's DOC route on the NZ elevation model, as an Ogilby strip map)
   carries the numbers. On every panel the ground grows as a white card contour model and
   pop-up scenery stands on it: Storybook, Sam's pick of round 2, polished in round 3, with a
   cut-paper trail sign at the start of each stretch carrying its measured numbers (his pick of
   round 3). The hiker walks the real track, captions follow his km.
   The rounds that lost are kept: round 1 at tag v4-round1, round 2 (Ivory, Two Tones) at tag
   v4-round2, round 3's printed numbers and on-screen card at commit c268642.
   Opens with the page (?interior=none shows V1's interior, the before).
   Classic script. The page calls create(mode), route(), setup(U) and the draw hooks while it
   builds, build(api) once the hero exists, and frame() at the end of every update.
   ============================================================ */
(function(){
'use strict';
// the walk's strip: the page loads the one for the trek picked in the hero (V7, 18 Oct: all five walks). Tongariro's is
// the surveyed one; the other four are built from the research (tools/terrain/synth-strip.mjs)
const S = window.FOLD_STRIP || window.TONGARIRO_STRIP;
const WKEY = (S && S.key) || 'tongariro';
// a trek's own captions, scenery and cut shapes, for the walks after Tongariro (interior/walks.js)
const WALK = (window.FOLD_WALKS || {})[WKEY] || null;
const MODES = { story:'Storybook' };
// each panel's cards are tinted by height, sand at its lowest card to near white at its highest, like the bands on a
// relief map, and the trail sign is a kraft board (Sam's pick of three in V5, Elevation. Two Stocks and Inked Edges
// are at commit d55f820): in one cream, the layers melted where they faced the lamp
const ELEV = { lo:'#CDBB9B', hi:'#F6F2EA', side:0.74, sign:'#B48A5C' };
const PAL = {
  paper:'#EFE9DD', paperHi:'#F7F3EA', ink:'#1B2230', inkSoft:'#4A5263',
  red:'#C8432B', tone:'#55595E', toneDk:'#3A3E43', ivory:'#F1EBDF'
};
// the palette round (?pal=): the route, the red marks and the caption's accent follow the page's one colour
if(window.LOOK && window.LOOK.pal) PAL.red = window.LOOK.pal.accent;
// Sam's pick after round 2 (Ivory and Two Tones are at tag v4-round2). each piece has a body tone and a
// lighter front tone, so the pieces are built in layers the way paper-cut scenes are
const STYLE = {
  story: { far:'#A3AEAA', mid:'#86968C', cone:'#5D6075', coneHi:'#7C7F97', hill:'#94A58C', tussock:'#C3A266', tussockHi:'#DCC28A',
           rock:'#7E7A72', rockHi:'#A29D93', steam:'#F7F3EB', crater:'#A2523B', craterHi:'#C77C5F', floor:'#E4DACA',
           lakeE:'#4FA690', lakeB:'#6E98BA', shore:'#E7DFCE', hut:'#F5F1E9', roof:'#8F8476', tree:'#577D5E', treeHi:'#7FA27B',
           tree2:'#476A50', van:'#EFE2CA', step:'#A39E93', step2:'#CDBBA0', tread:'#EEE3D1', cloud:'#F7F3EB', jag:'#956350',
           pole:'#F4F0E8', water:'#78A3C3', loo:'#F4F0E8', fern:'#69906A', stream:'#86AECB', plank:'#BFA988', sign:'#F2EADB',
           hiker:'ink', density:1.6, clouds:true, gloss:0.22 }
};
const SERIF = '"Instrument Serif", Georgia, serif', SANS = '"Instrument Sans", system-ui, sans-serif', MONO = '"DM Mono", ui-monospace, Menlo, monospace';
// canvas type follows hero/look.js, so the open map, the legend and the trail sign wear the hero's faces.
// without a look these give back V5's strings exactly
const LK = window.LOOK && window.LOOK.key ? window.LOOK : null;
const DSP = (px) => LK ? LK.cf('display', px) : '400 ' + px + 'px ' + SERIF;
const SUB = (px) => LK ? LK.cf('sub', px) : 'italic 400 ' + px + 'px ' + SERIF;
const LBL = (px, light) => LK ? LK.cf('label', px, light ? LK.labelLight : 0) : (light ? '400 ' : '500 ') + px + 'px ' + MONO;
const TXT = (px) => LK ? LK.cf('text', px) : '400 ' + px + 'px ' + SANS;
// how far a masked line sits outside its mask. faces with taller ascenders and deeper descenders than Instrument Serif
// left the descenders of g and p in the window after the caption went out (V6, Field Guide), so a look moves further
const MASK_Y = LK ? 140 : 112;
const D2R = Math.PI/180, HALF_PI = Math.PI/2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (t) => t*t*(3 - 2*t);
const lerp = (a, b, t) => a + (b - a)*t;
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',' + a + ')'; };
const T = () => (window.TREKS || []).find(t => t.key === WKEY) || (window.TREKS || [])[0] || null;
const TNO = () => { const k = (window.TREKS || []).findIndex(t => t.key === WKEY); return 'NO. ' + String((k < 0 ? 0 : k) + 1).padStart(2, '0'); };
function rnd(seed){ let s = seed>>>0 || 1; return function(){ s = (s*1664525 + 1013904223)>>>0; return s/4294967296; }; }

/* ---- the ground, per panel, in the panel's own coordinates ---- */
function decode(gr){
  const n = gr.nx*gr.nz, H = new Float32Array(n);
  if(gr.r){
    // packed (the standalone build, tools/standalone/pack_grids.py says how): each height's miss against what its
    // neighbours predict, Rice-coded with k chosen by how rough the ground is around it. Lossless, a third of the size
    const s = atob(gr.r), nx = gr.nx, Z = new Uint32Array(n), A = new Array(16).fill(4), N = new Array(16).fill(1);
    let at = 0;
    const bit = () => (s.charCodeAt(at >> 3) >> (7 - (at++ & 7))) & 1;
    const bits = w => { let v = 0; while(w--) v = v*2 + bit(); return v; };
    for(let k = 0; k < n; k++){
      const i = k % nx, j = (k - i)/nx;
      const rough = (i ? Z[k - 1] : 0) + (j ? Z[k - nx] : 0) + (i && j ? Z[k - nx - 1] : 0) + (j && i < nx - 1 ? Z[k - nx + 1] : 0);
      const c = Math.min(15, rough ? 32 - Math.clz32(rough) : 0);
      let b = 0, q = 0, z;
      while((N[c] << b) < A[c]) b++;
      while(!bit() && q < 24) q++;
      z = q < 24 ? q*(1 << b) + bits(b) : bits(18);
      A[c] += z; N[c]++;
      if(N[c] >= 64){ A[c] >>= 1; N[c] >>= 1; }
      Z[k] = z;
      H[k] = (z % 2 ? -(z + 1)/2 : z/2) + (i && j ? H[k - 1] + H[k - nx] - H[k - nx - 1] : i ? H[k - 1] : j ? H[k - nx] : 0);
    }
  } else {
    const raw = atob(gr.b64);
    for(let k=0;k<n;k++) H[k] = raw.charCodeAt(2*k) | (raw.charCodeAt(2*k + 1) << 8);
  }
  return { nx:gr.nx, nz:gr.nz, H, lo:gr.lo, hi:gr.hi };
}
const GRID = S.grids.map((gr, i) => S.frames[i].route ? decode(gr) : null);
function hAt(g, lx, lz){
  const X = clamp(lx/S.PW*(g.nx - 1), 0, g.nx - 1.001), Y = clamp((lz + S.PD/2)/S.PD*(g.nz - 1), 0, g.nz - 1.001);
  const i = X|0, j = Y|0, fx = X - i, fy = Y - j, n = g.nx, H = g.H;
  const a = H[j*n+i], b = H[j*n+i+1], c = H[(j+1)*n+i], d = H[(j+1)*n+i+1];
  return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy;
}
function gridAt(g, lx, lz){
  const N = g.N, X = clamp((lx - g.x0)/g.size*(N - 1), 0, N - 1.001), Y = clamp((lz + g.size/2)/g.size*(N - 1), 0, N - 1.001);
  const i = X|0, j = Y|0, fx = X - i, fy = Y - j, G = g.G;
  const a = G[j*N+i], b = G[j*N+i+1], c = G[(j+1)*N+i], d = G[(j+1)*N+i+1];
  return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy;
}
// Catmull-Rom upsample, so the contours print as curves rather than cell-sized facets
function upsample(g, k){
  const nx = (g.nx - 1)*k + 1, nz = (g.nz - 1)*k + 1, Tm = new Float32Array(g.nx*nz), H = new Float32Array(nx*nz);
  const cr = (p0, p1, p2, p3, t) => 0.5*(2*p1 + (-p0 + p2)*t + (2*p0 - 5*p1 + 4*p2 - p3)*t*t + (-p0 + 3*p1 - 3*p2 + p3)*t*t*t);
  for(let x=0;x<g.nx;x++) for(let z=0;z<nz;z++){
    const f = z/k, j = Math.min(g.nz - 2, Math.floor(f)), t = f - j, at = (q) => g.H[clamp(q, 0, g.nz - 1)*g.nx + x];
    Tm[z*g.nx + x] = cr(at(j-1), at(j), at(j+1), at(j+2), t);
  }
  for(let z=0;z<nz;z++) for(let x=0;x<nx;x++){
    const f = x/k, i = Math.min(g.nx - 2, Math.floor(f)), t = f - i, at = (q) => Tm[z*g.nx + clamp(q, 0, g.nx - 1)];
    H[z*nx + x] = cr(at(i-1), at(i), at(i+1), at(i+2), t);
  }
  return { nx, nz, H, lo:g.lo, hi:g.hi };
}
// marching squares straight into two Path2Ds: every contour, and every fifth (the index lines)
function contourPaths(g, w, h, step, every){
  const thin = new Path2D(), bold = new Path2D(), n = g.nx, H = g.H;
  const cx = w/(g.nx - 1), cz = h/(g.nz - 1);
  for(let j=0;j<g.nz-1;j++) for(let i=0;i<g.nx-1;i++){
    const a = H[j*n+i], b = H[j*n+i+1], c = H[(j+1)*n+i+1], d = H[(j+1)*n+i];
    const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
    for(let L = Math.ceil(lo/step)*step; L <= hi; L += step){
      const x0 = i*cx, y0 = j*cz, e = [];
      if((a < L) !== (b < L)) e.push(x0 + cx*(L - a)/(b - a), y0);
      if((b < L) !== (c < L)) e.push(x0 + cx, y0 + cz*(L - b)/(c - b));
      if((d < L) !== (c < L)) e.push(x0 + cx*(L - d)/(c - d), y0 + cz);
      if((a < L) !== (d < L)) e.push(x0, y0 + cz*(L - a)/(d - a));
      const p = (Math.round(L/step) % every === 0) ? bold : thin;
      if(e.length >= 4){ p.moveTo(e[0], e[1]); p.lineTo(e[2], e[3]); }
      if(e.length === 8){ p.moveTo(e[4], e[5]); p.lineTo(e[6], e[7]); }
    }
  }
  return [thin, bold];
}
/* ---- lat, lon to a panel's local x, z ---- */
function localOf(i, lat, lon){
  const f = S.frames[i], mx = (lon - S.REF.lon)*S.KX, my = -(lat - S.REF.lat)*S.KY;
  const dx = mx - f.e[0], dy = my - f.e[1];
  return [f.lx0 + (dx*f.u[0] + dy*f.u[1])/S.SC, f.z0 + (dx*f.n[0] + dy*f.n[1])/S.SC];
}
// the research's km (19.4 for the whole crossing) against the OSM trace's own (19.63)
const KM_TRACE = S.route[S.route.length - 1][2];
const kmT = (km) => km*KM_TRACE/((T() && T().km) || 19.4);
function panelOfKm(km){ const k = kmT(km); let best = S.route[0]; for(const r of S.route){ if(Math.abs(r[2] - k) < Math.abs(best[2] - k)) best = r; } return best[4]; }

/* ============================================================
   the panels: a heading, the captions the hiker walks through, and what stands on each
   ============================================================ */
const HEADS = S.names ? S.names.map((n, k) => String(k + 1).padStart(2, '0') + '  ' + n.toUpperCase()) : ['01  THE WALK IN', '02  THE CLIMB', '03  THE CRATERS', '04  THE WAY DOWN', '05  THE BUSH'];
// the print's ranges: Tongariro's as they were, the others from their own ground
const GLO = Math.min(...S.grids.map(g => g.lo)), GHI = Math.max(...S.grids.map(g => g.hi));
const OWN = !!(S.synth || S.measured);
const TINT = OWN ? [GLO, GHI - GLO] : [700, 1300];
const CI = OWN ? Math.max(20, Math.round((S.STEP || 100)/2/10)*10) : 20;
const PROF = OWN ? [S.H0 - (S.H1 - S.H0)*0.15, S.H1 + (S.H1 - S.H0)*0.1] : [700, 2000];
const scOf = (i) => (S.frames[i] && S.frames[i].sc) || S.SC;

function create(mode){
  if(!MODES[mode] || !S) return null;
  const ST = STYLE[mode];
  let U = null, NP = 5, PW = S.PW, PD = S.PD;
  // each stretch shows its numbers on a cut-paper trail sign at its start: Sam's pick of round 3 (printed on
  // the map and a card on screen are at commit c268642)
  const SNAMES = S.names || ['The walk in', 'The climb', 'The craters', 'The way down', 'The bush'];
  // each stretch's numbers, measured on the track (tools/terrain/strip.mjs), the high point taken from the
  // research when a researched point is it
  const STRETCH = (S.stretches || []).map((st, i) => {
    if(!st) return null;
    const t = T(), k = t ? t.km/KM_TRACE : 1;
    const wps = t ? t.waypoints.filter(w => panelOfKm(w.km) === i) : [];
    const hiR = wps.length ? Math.max(...wps.map(w => w.m)) : 0;
    return { i, name:SNAMES[i], km0R:st.km0*k, km1R:st.km1*k, dist:((st.km1 - st.km0)*k).toFixed(1), up:st.up, down:st.down,
      hi:hiR && hiR >= st.hi - 40 ? hiR : st.hi, lo:st.lo };
  });
  const IN = { mode, name:MODES[mode], PAL, STRETCH };

  /* ---- the route: the OSM track in concertina coordinates, resampled every 0.03 units ---- */
  IN.route = function(np, pw){
    NP = np; PW = pw;
    const src = S.route, pts = [], kmA = [];
    for(let k=0;k<src.length;k++){
      const a = src[k];
      if(k){
        const b = src[k-1], d = Math.hypot(a[0] - b[0], a[1] - b[1]), n = Math.max(1, Math.ceil(d/0.03));
        for(let q=1;q<n;q++){ const t = q/n; pts.push([lerp(b[0], a[0], t), lerp(b[1], a[1], t)]); kmA.push(lerp(b[2], a[2], t)); }
      }
      pts.push([a[0], a[1]]); kmA.push(a[2]);
    }
    const s = [0];
    for(let i=1;i<pts.length;i++) s.push(s[i-1] + Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]));
    const L = s[s.length - 1], cross = [0];
    for(let c=1;c<NP;c++){
      const X = c*PW; let v = L;
      for(let i=1;i<pts.length;i++) if(pts[i-1][0] < X && pts[i][0] >= X){ const f = (X - pts[i-1][0])/(pts[i][0] - pts[i-1][0]); v = s[i-1] + f*(s[i] - s[i-1]); break; }
      cross.push(v);
    }
    cross.push(L);
    function idx(sv){ let lo = 0, hi = s.length - 1; while(hi - lo > 1){ const m = (lo + hi) >> 1; if(s[m] <= sv) lo = m; else hi = m; } return lo; }
    function at(sv){
      sv = clamp(sv, 0, L); const lo = idx(sv), hi = Math.min(s.length - 1, lo + 1);
      const f = (sv - s[lo])/Math.max(1e-6, s[hi] - s[lo]), a = pts[lo], b = pts[hi];
      return { x:a[0] + (b[0] - a[0])*f, z:a[1] + (b[1] - a[1])*f, dx:b[0] - a[0], dz:b[1] - a[1] };
    }
    // the research's km at an arc length, and the arc length at a research km
    function kmAt(sv){ sv = clamp(sv, 0, L); const lo = idx(sv), hi = Math.min(s.length - 1, lo + 1); const f = (sv - s[lo])/Math.max(1e-6, s[hi] - s[lo]); return lerp(kmA[lo], kmA[hi], f)*(T() ? T().km/KM_TRACE : 1); }
    function sAtKm(km){ const k = kmT(km); let lo = 0, hi = kmA.length - 1; while(hi - lo > 1){ const m = (lo + hi) >> 1; if(kmA[m] <= k) lo = m; else hi = m; } return s[lo]; }
    IN.R = { pts, s, L, cross, at, kmAt, sAtKm };
    return IN.R;
  };

  // where a researched point sits on its panel: by its coordinates on the surveyed strip, by its km on the others
  function wpLocal(i, w){
    if(!(S.synth || S.byKm)) return localOf(i, w.lat, w.lon);
    const R = IN.R; if(!R) return [PW*0.5, S.ZR];
    const q = R.at(R.sAtKm(w.km)); return [q.x - i*PW, q.z];
  }
  IN.wpLocal = wpLocal;
  IN.setup = function(u){
    U = u;
    U.KNOB.HIKER_H = 0.5;     // a smaller walker: the map is a real one now
    U.KNOB.ELEV = 30;         // a little more from above than V1's 24, so the walk shows over the scenery
  };

  /* ============================================================
     the white card model, one per panel: round 1's White Card on every page
     ============================================================ */
  const STK = { step:S.STEP || 25, exag:S.EXAG || 0.6, margin:0.22, back:-1.15, front:4.0 };
  STK.ch = STK.step/S.SC*STK.exag;
  STK.win = { x0:STK.margin, x1:PW - STK.margin, z0:STK.back, z1:STK.front };
  const MODEL = GRID.map((g0, i) => {
    if(!g0) return null;
    const N = 200, size = PD, xA = (PW - size)/2, GG = new Float32Array(N*N);
    for(let j=0;j<N;j++) for(let q=0;q<N;q++) GG[j*N + q] = hAt(g0, xA + q/(N - 1)*size, -size/2 + j/(N - 1)*size);
    // a model maker simplifies: blur the ground first, so lava lobes don't cut into confetti
    const tmp = new Float32Array(N*N), R2 = 3;
    for(let pass=0; pass<2; pass++){
      for(let j=0;j<N;j++) for(let q=0;q<N;q++){ let a = 0, n = 0; for(let d=-R2; d<=R2; d++){ a += GG[j*N + clamp(q + d, 0, N-1)]; n++; } tmp[j*N + q] = a/n; }
      for(let j=0;j<N;j++) for(let q=0;q<N;q++){ let a = 0, n = 0; for(let d=-R2; d<=R2; d++){ a += tmp[clamp(j + d, 0, N-1)*N + q]; n++; } GG[j*N + q] = a/n; }
    }
    // the whole panel as one model, the way round 1's White Card was. at this zoom (380 m a unit, half
    // of round 1's 760) true heights stand twice as tall on screen, so the model is 0.6 of true: round 1's look
    let lo = 1e9, hi = -1e9;
    for(let q=0;q<N*N;q++){ lo = Math.min(lo, GG[q]); hi = Math.max(hi, GG[q]); }
    const DEEP = lo - 500;
    const grid = { N, G:GG, x0:xA, size, lo, hi };
    const vals = [];
    for(let j=0;j<=80;j++) for(let q=0;q<=80;q++){ const v = gridAt(grid, lerp(STK.win.x0, STK.win.x1, q/80), lerp(STK.win.z0, STK.win.z1, j/80)); if(v > DEEP + 1) vals.push(v); }
    vals.sort((a, b) => a - b);
    const pct = (f) => vals.length ? vals[Math.min(vals.length - 1, Math.floor(f*vals.length))] : 1000;
    // the model starts at a low share of its ground, not its single lowest gully (below the base stays in
    // the print), and stops at sixteen cards. panel 1 keeps the trailhead in the print
    let base = Math.floor(pct(0.12)/STK.step)*STK.step + STK.step;
    if(i === 0){ const p0 = S.route[0]; base = Math.max(base, gridAt(grid, p0[0], p0[1]) + 4); }
    return { i, grid, base, levels:Math.max(0, Math.min(32, Math.ceil((pct(0.995) - base)/STK.step))), cards:[], lift:0, built:false, root:null };
  });
  function topAt(i, lx, lz){
    const M = MODEL[i]; if(!M) return 0;
    if(lx < STK.win.x0 || lx > STK.win.x1 || lz < STK.win.z0 || lz > STK.win.z1) return 0;
    const h = gridAt(M.grid, lx, lz);
    if(h < M.base) return 0;
    return Math.min(M.levels, Math.floor((h - M.base)/STK.step) + 1)*STK.ch;
  }
  const panelOf = (x) => clamp(Math.floor(x/PW), 0, NP - 1);
  // the route rides the upper step at a card's edge, or its dashes sink into the riser
  IN.routeY = (x, z) => { const i = panelOf(x), lx = x - i*PW; let y = 0; for(const d of [[0,0],[0.05,0],[-0.05,0],[0,0.05],[0,-0.05]]) y = Math.max(y, topAt(i, lx + d[0], z + d[1])); return y + 0.006; };
  const HY = { p:0, v:0 };
  IN.groundY = () => HY.p;

  /* ============================================================
     the print. one sheet of a real map: tint, hill shade, 20 m contours, the planned line,
     the researched points, a heading, a north arrow per strip, the scale, and along the
     front edge the profile of this stretch with its real heights
     ============================================================ */
  IN.print = function(i){
    return function(x, w, h){
      const k = w/690, s = w/PW, X = (lx) => lx*s, Y = (lz) => (lz + PD/2)*s;
      const g = GRID[i], t = T(), ink = PAL.ink;
      x.fillStyle = PAL.paper; x.fillRect(0, 0, w, h);
      if(g){
        const c = U.mk(g.nx, g.nz), cx = c.getContext('2d'), img = cx.createImageData(g.nx, g.nz);
        const cell = scOf(i)*PW/(g.nx - 1), tn = parseInt(PAL.tone.slice(1), 16), tr = (tn>>16)&255, tg = (tn>>8)&255, tb = tn&255;
        for(let j=0;j<g.nz;j++) for(let q=0;q<g.nx;q++){
          const H = g.H, n = g.nx, o = j*n + q;
          const hx = (H[j*n + Math.min(n-1, q+1)] - H[j*n + Math.max(0, q-1)])/(2*cell);
          const hz = (H[Math.min(g.nz-1, j+1)*n + q] - H[Math.max(0, j-1)*n + q])/(2*cell);
          // light from the north west of the sheet, the cartographer's convention, ground x2
          const nl = Math.hypot(hx*2, hz*2, 1), sh = (-hx*2*0.6 - hz*2*0.6 + 0.53)/nl - 0.53;
          const e = clamp01((H[o] - TINT[0])/TINT[1]), p = o*4;
          if(sh < 0){ img.data[p] = tr; img.data[p+1] = tg; img.data[p+2] = tb; img.data[p+3] = Math.round(255*clamp01(0.04 + e*0.12 - sh*0.42)); }
          else { img.data[p] = 255; img.data[p+1] = 252; img.data[p+2] = 244; img.data[p+3] = Math.round(255*clamp01(sh*0.6)); }
        }
        cx.putImageData(img, 0, 0);
        x.save(); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, w, h); x.restore();
        const c2 = U.mk(g.nx, g.nz), x2 = c2.getContext('2d'), im2 = x2.createImageData(g.nx, g.nz);
        for(let o=0;o<g.nx*g.nz;o++){ const e = clamp01((g.H[o] - TINT[0])/TINT[1]), p = o*4; im2.data[p] = tr; im2.data[p+1] = tg; im2.data[p+2] = tb; im2.data[p+3] = Math.round(255*(0.03 + e*0.09)); }
        x2.putImageData(im2, 0, 0);
        x.save(); x.imageSmoothingEnabled = true; x.drawImage(c2, 0, 0, w, h); x.restore();
        const gu = upsample(g, 2), [thin, bold] = contourPaths(gu, w, h, CI, 5);
        x.lineCap = 'round'; x.lineJoin = 'round';
        x.strokeStyle = rgba(PAL.toneDk, 0.32); x.lineWidth = 0.9*k; x.stroke(thin);
        x.strokeStyle = rgba(PAL.toneDk, 0.6); x.lineWidth = 1.6*k; x.stroke(bold);
      }

      // the planned line, faint: the red one prints over it as the hiker walks
      x.save();
      x.strokeStyle = rgba(ink, 0.3); x.lineWidth = 2.0*k; x.setLineDash([2*k, 6*k]); x.lineCap = 'round';
      x.beginPath(); let on = false;
      for(const p of IN.R.pts){
        const lx = p[0] - i*PW;
        if(lx < -0.05 || lx > PW + 0.05){ on = false; continue; }
        if(!on){ x.moveTo(X(lx), Y(p[1])); on = true; } else x.lineTo(X(lx), Y(p[1]));
      }
      x.stroke(); x.restore();

      // the researched points, from treks-data
      if(t){
        const LAB = {
          'Mangatepōpō road end':{ t:'MANGATEPŌPŌ ROAD END', dx:-8, dy:30, al:'left' },
          'Soda Springs turn-off':{ t:'SODA SPRINGS', dx:-10, dy:28, al:'right' },
          "South Crater rim, top of the Devil's Staircase":{ t:"DEVIL'S STAIRCASE", dx:-8, dy:-18, al:'right' },
          'South Crater':{ t:'SOUTH CRATER', dx:12, dy:28, al:'left' },
          'Red Crater':{ t:'RED CRATER', dx:14, dy:5, al:'left', red:true },
          'Emerald Lakes':{ t:'EMERALD LAKES', dx:14, dy:24, al:'left' },
          'Blue Lake':{ t:'BLUE LAKE', dx:14, dy:5, al:'left' },
          'Ketetahi Shelter':{ t:'KETETAHI SHELTER', dx:-14, dy:5, al:'right' },
          'Ketetahi road end':{ t:'KETETAHI ROAD END', dx:-14, dy:-14, al:'right' }
        };
        let alt = 0;
        for(const wp of t.waypoints){
          if(panelOfKm(wp.km) !== i) continue;
          let lab = LAB[wp.name];
          if(OWN){ const nm = wp.name.split(/[,(]/)[0].trim().toUpperCase(); alt++; lab = { t:nm, dx:alt % 2 ? 12 : -12, dy:alt % 2 ? 26 : -16, al:alt % 2 ? 'left' : 'right', red:wp.m === t.high.m || wp.name.indexOf(t.high.name.split(' (')[0]) === 0 }; }
          if(!lab) continue;
          const start = wp.km === 0, l = start ? IN.R.pts[0] : wpLocal(i, wp);
          if(l[0] < 0.1 || l[0] > PW - 0.1 || l[1] < -PD/2 + 0.3 || l[1] > PD/2 - 0.3) continue;
          const px = X(l[0]), py = Y(l[1]);
          if(!start){ x.fillStyle = PAL.paperHi; x.strokeStyle = lab.red ? PAL.red : ink; x.lineWidth = 1.6*k; x.beginPath(); x.arc(px, py, 4.2*k, 0, 6.2832); x.fill(); x.stroke(); }
          x.font = LBL((12.5*k).toFixed(1)); x.fillStyle = lab.red ? PAL.red : rgba(ink, 0.88);
          U.tracked(x, lab.t, px + lab.dx*k, py + lab.dy*k, 1.1*k, lab.al);
          x.font = LBL((11*k).toFixed(1), 1); x.fillStyle = rgba(ink, 0.6);
          U.tracked(x, fmt(wp.m), px + lab.dx*k, py + (lab.dy + 15)*k, 0.9*k, lab.al);
        }
      }

      // the neat line and the survey ticks
      const m = 16*k;
      x.strokeStyle = rgba(ink, 0.55); x.lineWidth = 1.3*k; x.strokeRect(m, m, w - 2*m, h - 2*m);
      x.lineWidth = 1.1*k;
      for(let tt = m; tt <= w - m; tt += 48*k){ const L = (Math.round(tt/(48*k))%2 ? 6 : 11)*k; x.beginPath(); x.moveTo(tt, m); x.lineTo(tt, m + L); x.moveTo(tt, h - m); x.lineTo(tt, h - m - L); x.stroke(); }
      for(let tt = m; tt <= h - m; tt += 48*k){ const L = (Math.round(tt/(48*k))%2 ? 6 : 11)*k; x.beginPath(); x.moveTo(m, tt); x.lineTo(m + L, tt); x.moveTo(w - m, tt); x.lineTo(w - m - L, tt); x.stroke(); }

      // the heading, the strip and its bearing
      const f = S.frames[i], brg = (Math.atan2(f.u[0], -f.u[1])/D2R + 360)%360;
      x.fillStyle = ink; x.font = LBL((22*k).toFixed(1));
      U.tracked(x, HEADS[i] || '', 32*k, 58*k, 2.0*k, 'left');
      x.fillStyle = PAL.red; x.fillRect(32*k, 30*k, 26*k, 3*k);
      x.fillStyle = rgba(ink, 0.6); x.font = LBL((11*k).toFixed(1), 1);
      U.tracked(x, 'STRIP ' + (i + 1) + ' OF ' + NP + '   BEARING ' + String(Math.round(brg)).padStart(3, '0') + '°', 33*k, 80*k, 1.2*k, 'left');

      // an Ogilby north arrow: each strip turns with the road, so each carries its own north
      {
        const nx = -f.u[1], nz = -f.n[1], L = Math.hypot(nx, nz), ax = nx/L, az = nz/L;
        const cx0 = w - 64*k, cy0 = 70*k, R = 24*k;
        x.save(); x.translate(cx0, cy0);
        x.strokeStyle = rgba(ink, 0.7); x.fillStyle = rgba(ink, 0.8); x.lineWidth = 1.2*k;
        x.beginPath(); x.moveTo(-ax*R, -az*R); x.lineTo(ax*R, az*R); x.stroke();
        const bx = -az, bz = ax;
        x.beginPath(); x.moveTo(ax*R, az*R); x.lineTo(ax*R*0.45 + bx*6*k, az*R*0.45 + bz*6*k); x.lineTo(ax*R*0.6, az*R*0.6); x.closePath(); x.fill();
        x.font = LBL((12*k).toFixed(1)); x.textAlign = 'center';
        x.fillText('N', ax*(R + 11*k), az*(R + 11*k) + 4*k); x.textAlign = 'left';
        x.restore();
        // the scale, in real kilometres
        const kU = [1, 2, 5, 10, 20].find(u => u*1000/scOf(i)*s >= 60*k) || 20, km = kU*1000/scOf(i)*s, sx = w - 120*k - km, sy = 66*k;
        x.fillStyle = ink; x.fillRect(sx, sy, km, 4*k);
        x.fillStyle = PAL.paperHi; x.fillRect(sx + km*0.5, sy + 0.8*k, km*0.5, 2.4*k);
        x.fillStyle = rgba(ink, 0.7); x.font = LBL((11*k).toFixed(1), 1);
        U.tracked(x, '0', sx, sy - 7*k, 0, 'center'); U.tracked(x, kU + ' KM', sx + km, sy - 7*k, 0.6*k, 'center');
      }
      if(i === 0 && t) stamp(x, 120*k, 150*k, k, t);

      // the profile of this stretch, printed along the front edge: real heights, real km
      profile(x, i, w, h, k, s, X, t);

      // a folded map never lies quite flat at the creases
      const cl = x.createLinearGradient(0, 0, 34*k, 0); cl.addColorStop(0, 'rgba(70,52,34,0.13)'); cl.addColorStop(1, 'rgba(70,52,34,0)');
      x.fillStyle = cl; x.fillRect(0, 0, 34*k, h);
      const cr = x.createLinearGradient(w, 0, w - 34*k, 0); cr.addColorStop(0, 'rgba(70,52,34,0.10)'); cr.addColorStop(1, 'rgba(70,52,34,0)');
      x.fillStyle = cr; x.fillRect(w - 34*k, 0, 34*k, h);
    };
  };
  function profile(x, i, w, h, k, s, X, t){
    const rs = S.route.filter(r => r[4] === i); if(!rs.length) return;
    const z0 = 4.05, z1 = 4.52, y0 = (z0 + PD/2)*s, y1 = (z1 + PD/2)*s, H0 = PROF[0], H1 = PROF[1];
    const Yh = (m) => y1 - (m - H0)/(H1 - H0)*(y1 - y0);
    const xs = rs.map(r => X(r[0] - i*PW));
    x.save();
    x.beginPath(); x.moveTo(xs[0], y1);
    rs.forEach((r, q) => x.lineTo(xs[q], Yh(r[3])));
    x.lineTo(xs[xs.length - 1], y1); x.closePath();
    x.fillStyle = rgba(PAL.tone, 0.14); x.fill();
    x.beginPath(); rs.forEach((r, q) => q ? x.lineTo(xs[q], Yh(r[3])) : x.moveTo(xs[q], Yh(r[3])));
    x.strokeStyle = rgba(PAL.ink, 0.62); x.lineWidth = 1.3*k; x.stroke();
    x.strokeStyle = rgba(PAL.ink, 0.25); x.lineWidth = 0.8*k; x.beginPath(); x.moveTo(xs[0], y1); x.lineTo(xs[xs.length - 1], y1); x.stroke();
    // the researched points on it, with their heights and km
    if(t) for(const wp of t.waypoints){
      if(panelOfKm(wp.km) !== i) continue;
      const k0 = kmT(wp.km); let best = rs[0], bq = 0; rs.forEach((r, q) => { if(Math.abs(r[2] - k0) < Math.abs(best[2] - k0)){ best = r; bq = q; } });
      const px = xs[bq], py = Yh(wp.m);
      x.fillStyle = wp.m === t.high.m ? PAL.red : PAL.ink; x.beginPath(); x.arc(px, py, 2.6*k, 0, 6.2832); x.fill();
      x.font = LBL((10*k).toFixed(1)); x.fillStyle = rgba(PAL.ink, 0.8);
      U.tracked(x, fmt(wp.m) + ' M', px, py - 7*k, 0.6*k, 'center');
      x.font = LBL((9*k).toFixed(1), 1); x.fillStyle = rgba(PAL.ink, 0.55);
      U.tracked(x, 'KM ' + wp.km, px, y1 + 12*k, 0.6*k, 'center');
    }
    x.restore();
  }
  // season and permits as a rubber stamp in the margin, in the route's red
  function stamp(x, cx, cy, k, t){
    x.save(); x.translate(cx, cy); x.rotate(-0.09);
    const W = 168*k, H = 92*k;
    x.strokeStyle = rgba(PAL.red, 0.78); x.lineWidth = 2.6*k; x.strokeRect(-W/2, -H/2, W, H);
    x.lineWidth = 1*k; x.strokeRect(-W/2 + 5*k, -H/2 + 5*k, W - 10*k, H - 10*k);
    x.fillStyle = rgba(PAL.red, 0.82);
    x.font = LBL((10*k).toFixed(1)); U.tracked(x, 'SEASON', 0, -H/2 + 24*k, 2*k, 'center');
    x.font = LBL((17*k).toFixed(1)); U.tracked(x, (t.seasonShort || '').toUpperCase(), 0, -H/2 + 46*k, 1.4*k, 'center');
    const p0 = (t.permits && t.permits[0]) || '';
    x.font = LBL((9.5*k).toFixed(1));
    U.tracked(x, /no permit/i.test(p0) ? 'NO PERMIT OR FEE' : 'PERMIT NEEDED', 0, -H/2 + 64*k, 1.4*k, 'center');
    U.tracked(x, OWN ? 'WE BOOK THEM FOR YOU' : 'BOOK THE TRACK, FREE', 0, -H/2 + 78*k, 1.2*k, 'center');
    x.globalCompositeOperation = 'destination-out';
    const r = rnd(17);
    for(let q=0;q<160;q++){ x.fillStyle = 'rgba(0,0,0,' + (0.25 + r()*0.5) + ')'; x.fillRect((r() - 0.5)*W, (r() - 0.5)*H, (1 + r()*3)*k, (1 + r()*2)*k); }
    x.restore();
  }

  IN.back = function(x, w, h){
    x.fillStyle = '#ECE5D8'; x.fillRect(0, 0, w, h);
    x.save(); x.translate(w*0.5, h*0.5); x.rotate(-0.5);
    x.fillStyle = rgba(PAL.ink, 0.06); x.font = LBL(14);
    const tt = T(), nm = (tt ? tt.fullName : 'Tongariro Alpine Crossing').toUpperCase();
    for(let r=-8;r<=8;r++) U.tracked(x, 'FOLD LINE   ' + TNO() + '   ' + nm + '   FOLD LINE   ' + TNO(), -520 + (r%2)*70, r*44, 2, 'left');
    x.restore();
    x.strokeStyle = rgba(PAL.ink, 0.2); x.lineWidth = 1.2; x.strokeRect(12, 12, w - 24, h - 24);
  };

  /* the inside of the cover: what to carry is the legend */
  IN.legend = function(x, w, h){
    const t = T(), k = w/480, ink = PAL.ink;
    x.fillStyle = PAL.paper; x.fillRect(0, 0, w, h);
    x.strokeStyle = rgba(ink, 0.5); x.lineWidth = 1.2*k; x.strokeRect(16*k, 16*k, w - 32*k, h - 32*k);
    x.fillStyle = rgba(ink, 0.6); x.font = LBL((11*k).toFixed(1), 1);
    U.tracked(x, TNO() + '   ' + (t ? t.daysLabel + '   ' + t.kmLabel : ''), 36*k, 50*k, 1.6*k, 'left');
    x.fillStyle = ink; x.font = DSP((46*k).toFixed(1));
    x.fillText(t ? t.name : 'Tongariro', 34*k, 104*k);
    x.font = SUB((24*k).toFixed(1)); x.fillStyle = rgba(ink, 0.75);
    x.fillText(t ? t.line2 : '', 36*k, 134*k);
    x.fillStyle = PAL.red; x.fillRect(36*k, 156*k, 30*k, 2.5*k);
    x.fillStyle = rgba(ink, 0.62); x.font = LBL((10.5*k).toFixed(1));
    U.tracked(x, 'WHAT TO CARRY', 36*k, 192*k, 2*k, 'left');
    let y = 218*k;
    x.font = TXT((15*k).toFixed(1));
    for(const it of (t ? t.kit : [])){
      if(/^winter/i.test(it.item)) continue;
      x.fillStyle = ink; x.fillRect(38*k, y - 5*k, 5*k, 1.6*k);
      x.fillText(it.item, 54*k, y); y += 25*k;
    }
    y += 16*k;
    x.fillStyle = rgba(ink, 0.62); x.font = LBL((10.5*k).toFixed(1));
    U.tracked(x, 'ON THE MAP', 36*k, y, 2*k, 'left'); y += 24*k;
    const row = (draw, label) => { draw(40*k, y - 5*k); x.fillStyle = rgba(ink, 0.82); x.font = TXT((13*k).toFixed(1)); x.fillText(label, 90*k, y); y += 22*k; };
    row((px, py) => { x.fillStyle = PAL.red; for(let q=0;q<3;q++) x.fillRect(px + q*13*k, py - 1.5*k, 8*k, 3*k); }, 'The route, as you walk it');
    row((px, py) => { x.strokeStyle = rgba(PAL.toneDk, 0.6); x.lineWidth = 1*k; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 34*k, py); x.stroke(); }, 'Contour every ' + CI + ' m');
    row((px, py) => { x.strokeStyle = rgba(PAL.toneDk, 0.85); x.lineWidth = 2*k; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 34*k, py); x.stroke(); }, 'Every ' + CI*5 + ' m');
    row((px, py) => { x.fillStyle = rgba(PAL.tone, 0.3); x.fillRect(px, py - 6*k, 34*k, 10*k); x.strokeStyle = PAL.ink; x.lineWidth = 1.2*k; x.beginPath(); x.moveTo(px, py + 2*k); x.lineTo(px + 14*k, py - 5*k); x.lineTo(px + 34*k, py); x.stroke(); }, 'The profile of each stretch');
    x.fillStyle = rgba(ink, 0.45); x.font = LBL((9*k).toFixed(1), 1);
    U.tracked(x, S.synth ? 'ROUTE AND HEIGHTS FROM OUR TREK NOTES . GROUND DRAWN' : S.measured ? 'TRACK OPENSTREETMAP . HEIGHTS AWS TERRAIN TILES' : 'TRACK OPENSTREETMAP . HEIGHTS NZ DEM . DOC', 36*k, h - 34*k, 1*k, 'left');
  };

  /* ============================================================
     the hiker. one plain figure walking right: pack, pole, mid stride. no face, no hat
     ============================================================ */
  IN.hiker = function(m){
    return function(x, w, h){
      const white = ST.hiker === 'white';
      x.save();
      if(m === 'col'){
        x.fillStyle = white ? '#F4F1EA' : PAL.ink; x.fillRect(0, 0, w, h);
        // the white card figure shows its cut edge, a warm grey line, or he vanishes into the model
        if(white){ x.fillStyle = '#8E877C'; x.fillRect(0, 0, w, h); figure(x, w, h, '#F4F1EA', 0.03); }
        x.restore(); return;
      }
      figure(x, w, h, '#fff', 0);
      x.restore();
    };
  };
  function figure(x, w, h, col, inset){
    x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round';
    const P = (u, v) => [u*w, v*h], I = inset*h;
    x.beginPath(); x.arc(...P(0.565, 0.085), 0.062*h - I*0.6, 0, 6.2832); x.fill();
    x.lineWidth = 0.15*h - I; x.beginPath(); x.moveTo(...P(0.53, 0.21)); x.lineTo(...P(0.47, 0.47)); x.stroke();
    x.beginPath(); x.moveTo(...P(0.30 + inset*0.5, 0.17 + inset*0.5)); x.quadraticCurveTo(...P(0.27 + inset*0.5, 0.32), ...P(0.31 + inset*0.5, 0.45 - inset*0.5)); x.lineTo(...P(0.45, 0.45 - inset*0.5)); x.lineTo(...P(0.49 - inset*0.5, 0.16 + inset*0.5)); x.closePath(); x.fill();
    x.lineWidth = 0.085*h - I;
    x.beginPath(); x.moveTo(...P(0.49, 0.48)); x.quadraticCurveTo(...P(0.64, 0.66), ...P(0.70, 0.95)); x.stroke();
    x.beginPath(); x.moveTo(...P(0.45, 0.48)); x.quadraticCurveTo(...P(0.40, 0.72), ...P(0.27, 0.93)); x.stroke();
    x.lineWidth = Math.max(0.01*h, 0.05*h - I); x.beginPath(); x.moveTo(...P(0.68, 0.965)); x.lineTo(...P(0.80, 0.965)); x.stroke();
    x.beginPath(); x.moveTo(...P(0.24, 0.95)); x.lineTo(...P(0.34, 0.955)); x.stroke();
    x.lineWidth = Math.max(0.012*h, 0.06*h - I); x.beginPath(); x.moveTo(...P(0.55, 0.24)); x.quadraticCurveTo(...P(0.68, 0.33), ...P(0.76, 0.40)); x.stroke();
    x.lineWidth = Math.max(0.008*h, 0.022*h - I*0.5); x.beginPath(); x.moveTo(...P(0.79, 0.34)); x.lineTo(...P(0.90, 0.985)); x.stroke();
  }

  /* ============================================================
     the cut shapes. every piece is a silhouette cut from card. detail is cut out of the
     paper (slits, holes), never drawn on it. 'shape' draws white on black for the alpha,
     'col' adds only a soft light toward the top edge
     ============================================================ */
  const skyPath = (c, W, H, k) => {
    const sk = S.sky; if(!sk) return;
    const n = sk.rows.length, mx = Math.max(...sk.rows), mn = Math.min(...sk.rows);
    c.beginPath(); c.moveTo(0, H);
    for(let q = 0; q < n; q++){ const a = (sk.rows[q] - mn)/(mx - mn || 1); c.lineTo(q/(n - 1)*W, H*(1 - (0.12 + 0.86*a)*k)); }
    c.lineTo(W, H); c.closePath(); c.fill();
  };
  const SHAPES = {
    // the trek's measured skyline (hero/terrain-data.js), heights stretched to the card. and its snow: what stands above
    // the top fifth of it, cut as a lighter layer
    sky(c, W, H){ skyPath(c, W, H, 1); },
    skySnow(c, W, H){
      skyPath(c, W, H, 1);
      c.save(); c.globalCompositeOperation = 'destination-in'; c.fillRect(0, 0, W, H*0.3); c.restore();
    },
    // Ngāuruhoe: a concave cone, the crater a notch at the top, gullies cut as slits
    cone(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      c.quadraticCurveTo(W*0.40, H*0.93, W*0.455, H*0.05);
      c.lineTo(W*0.478, H*0.085); c.lineTo(W*0.522, H*0.085); c.lineTo(W*0.545, H*0.05);
      c.quadraticCurveTo(W*0.60, H*0.93, W, H); c.closePath(); c.fill();
      c.save(); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round';
      for(let q=0;q<7;q++){ const u = 0.43 + q*0.023 + (r() - 0.5)*0.01, l = 0.14 + r()*0.22; c.lineWidth = W*0.006; c.beginPath(); c.moveTo(W*u, H*(0.14 + r()*0.05)); c.lineTo(W*(0.5 + (u - 0.5)*2.1), H*(0.14 + l)); c.stroke(); }
      c.restore();
    },
    // a range: a few soft summits and a little jag
    ridge(c, W, H, r){
      const pk = []; const n = 3 + Math.floor(r()*3);
      for(let q=0;q<n;q++) pk.push([0.1 + 0.8*q/(n - 1) + (r() - 0.5)*0.12, 0.35 + r()*0.6, 0.08 + r()*0.12]);
      c.beginPath(); c.moveTo(0, H);
      for(let q=0;q<=120;q++){
        const u = q/120; let y = 0.12;
        for(const p of pk) y = Math.max(y, p[1]*Math.exp(-Math.pow((u - p[0])/p[2], 2)) + 0.12);
        y += (r() - 0.5)*0.025;
        c.lineTo(u*W, H*(1 - y*0.98));
      }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // one rounded hill
    hill(c, W, H){
      c.beginPath(); c.moveTo(0, H); c.bezierCurveTo(W*0.18, H*0.1, W*0.62, H*0.0, W, H); c.closePath(); c.fill();
    },
    // tussock: a low mound and a fan of thin blades, cut as a fringe
    tussock(c, W, H, r){
      c.beginPath(); c.ellipse(W*0.5, H, W*0.42, H*0.28, 0, Math.PI, 0); c.fill();
      const n = 15;
      for(let q=0;q<n;q++){
        const u = 0.12 + 0.76*q/(n - 1) + (r() - 0.5)*0.03, lean = (u - 0.5)*0.9 + (r() - 0.5)*0.25, top = 0.04 + r()*0.35;
        c.beginPath(); c.moveTo(W*(u - 0.03), H); c.quadraticCurveTo(W*(u + lean*0.2), H*0.55, W*(u + lean*0.42), H*top); c.lineTo(W*(u + 0.03), H); c.closePath(); c.fill();
      }
    },
    // the front blades of a tussock, lighter, a few only
    tussockHi(c, W, H, r){
      for(let q=0;q<7;q++){
        const u = 0.22 + 0.56*q/6 + (r() - 0.5)*0.04, lean = (u - 0.5)*0.8 + (r() - 0.5)*0.2, top = 0.3 + r()*0.35;
        c.beginPath(); c.moveTo(W*(u - 0.025), H); c.quadraticCurveTo(W*(u + lean*0.2), H*0.65, W*(u + lean*0.4), H*top); c.lineTo(W*(u + 0.025), H); c.closePath(); c.fill();
      }
    },
    // the lit facet of a boulder
    rockHi(c, W, H, r){
      c.beginPath(); c.moveTo(W*0.48, H*0.12); c.lineTo(W*(0.86 + r()*0.06), H*0.42); c.lineTo(W*0.7, H*(0.72 + r()*0.1)); c.lineTo(W*0.5, H*0.5); c.closePath(); c.fill();
    },
    // a lava boulder
    rock(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      const n = 7; for(let q=1;q<n;q++){ const a = Math.PI*(1 - q/n); c.lineTo(W*(0.5 + Math.cos(a)*(0.42 + r()*0.08)), H*(1 - Math.sin(a)*(0.7 + r()*0.3))); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // steam from a vent: a puff of round cuts on a thin strut, the way the theatre held its clouds
    steam(c, W, H, r){
      c.fillRect(W*0.485, H*0.45, W*0.03, H*0.55);
      const P = [[0.5,0.30,0.22],[0.33,0.36,0.15],[0.67,0.37,0.16],[0.44,0.16,0.15],[0.58,0.14,0.13],[0.5,0.04,0.08]];
      for(const p of P){ c.beginPath(); c.arc(W*(p[0] + (r() - 0.5)*0.03), H*(p[1] + 0.06), W*p[2], 0, 6.2832); c.fill(); }
    },
    cloud(c, W, H, r){
      c.fillRect(W*0.49, H*0.5, W*0.02, H*0.5);
      const P = [[0.5,0.32,0.17],[0.3,0.38,0.13],[0.7,0.38,0.14],[0.18,0.42,0.09],[0.82,0.42,0.09],[0.42,0.24,0.12],[0.6,0.25,0.12]];
      for(const p of P){ c.beginPath(); c.arc(W*p[0], H*p[1], W*p[2]*0.62, 0, 6.2832); c.fill(); }
      c.fillRect(W*0.18, H*0.36, W*0.64, H*0.1);
    },
    // Ngāuruhoe's ash band, the upper cone in a lighter cut, its lower edge ragged
    coneHi(c, W, H, r){
      SHAPES.ngauruhoe(c, W, H, r);
      c.save(); c.globalCompositeOperation = 'destination-out';
      c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.5);
      for(let q=0;q<=40;q++){ const u = q/40; c.lineTo(W*u, H*(0.46 + Math.sin(u*31)*0.025 + (r() - 0.5)*0.04 + Math.abs(u - 0.5)*0.12)); }
      c.lineTo(W, H); c.closePath(); c.fill(); c.restore();
    },
    // Red Crater's front lip, a lighter rust laid over the foot of the rim
    craterHi(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      for(let q=0;q<=24;q++){ const u = q/24; c.lineTo(W*u, H*(0.5 + Math.sin(u*14)*0.06 + (r() - 0.5)*0.06 + (u > 0.45 && u < 0.62 ? 0.2 : 0))); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // the front of a cloud, a smaller white cut
    cloudHi(c, W, H, r){
      for(const p of [[0.38,0.4,0.11],[0.56,0.42,0.12],[0.47,0.33,0.09]]){ c.beginPath(); c.arc(W*p[0], H*p[1], W*p[2]*0.62, 0, 6.2832); c.fill(); }
    },
    // the hut's roof, darker, over the white walls
    roof(c, W, H){ c.beginPath(); c.moveTo(0, H*0.45); c.lineTo(W*0.5, H*0.02); c.lineTo(W, H*0.45); c.lineTo(W*0.9, H*0.5); c.lineTo(W*0.5, H*0.13); c.lineTo(W*0.1, H*0.5); c.closePath(); c.fill(); },
    // a shore: a lake's paler rim of scree, lying under it
    shore(c, W, H, r){ SHAPES.lake(c, W, H, r); },
    // South Crater's floor: flat, pale, an oval lying in the crater
    floor(c, W, H, r){ SHAPES.lake(c, W, H, r); },
    // the treads of the Staircase, pale strips along each step
    treads(c, W, H){
      const n = 7;
      for(let q=0;q<n;q++){ const y = 0.86 - (q + 1)/n*0.84; c.fillRect(W*(q/n + 0.01), H*y, W/n*0.96, H*0.05); }
    },
    // the boardwalk over the old lava at the start: planks, the gaps between them cut
    boardwalk(c, W, H){
      c.fillRect(0, H*0.15, W, H*0.7);
      c.save(); c.globalCompositeOperation = 'destination-out';
      for(let q=1;q<30;q++) c.fillRect(W*q/30 - W*0.003, 0, W*0.006, H);
      c.restore();
    },
    // a stream, a ribbon of water lying on the ground
    stream(c, W, H, r){
      c.beginPath(); c.moveTo(0, H*0.3);
      for(let q=0;q<=30;q++){ const u = q/30; c.lineTo(W*u, H*(0.28 + Math.sin(u*9 + 1)*0.12 + (r() - 0.5)*0.03)); }
      for(let q=30;q>=0;q--){ const u = q/30; c.lineTo(W*u, H*(0.72 + Math.sin(u*9 + 2)*0.12 + (r() - 0.5)*0.03)); }
      c.closePath(); c.fill();
    },
    // a footbridge's railing: deck, two rails, posts
    bridge(c, W, H){
      c.fillRect(0, H*0.82, W, H*0.18);
      c.fillRect(0, H*0.1, W, H*0.07); c.fillRect(0, H*0.45, W, H*0.06);
      for(let q=0;q<=6;q++) c.fillRect(W*(q/6) - (q === 6 ? W*0.04 : 0), H*0.08, W*0.04, H*0.84);
    },
    // a trail sign: a post and an arrow board, the numbers printed on it
    sign(c, W, H){
      c.fillRect(W*0.12, H*0.3, W*0.05, H*0.7);
      c.beginPath(); c.moveTo(0, H*0.02); c.lineTo(W*0.88, H*0.02); c.lineTo(W*0.995, H*0.32); c.lineTo(W*0.88, H*0.62); c.lineTo(0, H*0.62); c.closePath(); c.fill();
    },
    // Red Crater: a broken rim with a deep notch, the vent cut as a hole
    crater(c, W, H, r){
      // a broken rim: the high back wall on the left, a deep V where the vent breaks it, a low lip right
      c.beginPath(); c.moveTo(0, H);
      const pts = [[0.03,0.72],[0.10,0.42],[0.17,0.30],[0.24,0.12],[0.30,0.18],[0.36,0.06],[0.43,0.22],[0.50,0.62],[0.55,0.86],[0.60,0.58],[0.68,0.44],[0.76,0.50],[0.84,0.40],[0.92,0.56],[0.98,0.80]];
      for(const p of pts) c.lineTo(W*p[0], H*(p[1] + (r() - 0.5)*0.03));
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // a lake, a soft oval that lies on the ground
    lake(c, W, H, r){
      c.beginPath();
      for(let q=0;q<=48;q++){ const a = q/48*6.2832, rr = 0.46 + Math.sin(a*3 + r()*0.3)*0.025 + (r() - 0.5)*0.01; const px = W*(0.5 + Math.cos(a)*rr), py = H*(0.5 + Math.sin(a)*rr*0.98); q ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.closePath(); c.fill();
    },
    // the shelter: a gable of white card, a door cut out, no windows
    hut(c, W, H){
      c.beginPath(); c.moveTo(W*0.1, H); c.lineTo(W*0.1, H*0.45); c.lineTo(W*0.0, H*0.45); c.lineTo(W*0.5, H*0.02); c.lineTo(W*1.0, H*0.45); c.lineTo(W*0.9, H*0.45); c.lineTo(W*0.9, H); c.closePath(); c.fill();
      c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(W*0.44, H*0.66, W*0.13, H*0.34); c.restore();
    },
    // bush: a podocarp, a round crown of three cuts on a short trunk
    tree(c, W, H, r){
      c.fillRect(W*0.47, H*0.55, W*0.06, H*0.45);
      const P = [[0.5,0.32,0.3],[0.3,0.44,0.21],[0.7,0.42,0.22],[0.42,0.16,0.19],[0.6,0.2,0.18]];
      for(const p of P){ c.beginPath(); c.arc(W*(p[0] + (r() - 0.5)*0.05), H*p[1], W*p[2]*(0.9 + r()*0.2), 0, 6.2832); c.fill(); }
      // gaps in the leaves, cut out
      c.save(); c.globalCompositeOperation = 'destination-out';
      for(let q=0;q<4;q++){ c.beginPath(); c.arc(W*(0.3 + r()*0.4), H*(0.18 + r()*0.3), W*(0.018 + r()*0.02), 0, 6.2832); c.fill(); }
      c.restore();
    },
    // the lit side of a crown, a lighter cut laid over the right of it
    crownHi(c, W, H, r){
      const P = [[0.64,0.24,0.17],[0.74,0.4,0.12],[0.52,0.13,0.12]];
      for(const p of P){ c.beginPath(); c.arc(W*(p[0] + (r() - 0.5)*0.03), H*p[1], W*p[2], 0, 6.2832); c.fill(); }
    },
    // a tall emergent: tiers of crown up a straight trunk
    rimu(c, W, H, r){
      c.fillRect(W*0.475, H*0.18, W*0.05, H*0.82);
      for(let q=0;q<5;q++){ const y = 0.12 + q*0.15, w2 = 0.18 + q*0.06; c.beginPath(); c.ellipse(W*0.5, H*y, W*w2*(0.9 + r()*0.2), H*0.065, 0, 0, 6.2832); c.fill(); }
    },
    // the shuttle: a rounded van, windows and wheel arches cut out
    van(c, W, H){
      const R = H*0.16;
      c.beginPath(); c.moveTo(W*0.04, H*0.82); c.lineTo(W*0.04, H*0.3); c.quadraticCurveTo(W*0.04, H*0.08, W*0.22, H*0.08);
      c.lineTo(W*0.72, H*0.08); c.quadraticCurveTo(W*0.84, H*0.08, W*0.9, H*0.36); c.lineTo(W*0.97, H*0.48); c.lineTo(W*0.97, H*0.82); c.closePath(); c.fill();
      c.beginPath(); c.arc(W*0.25, H*0.82, R, 0, 6.2832); c.arc(W*0.77, H*0.82, R, 0, 6.2832); c.fill();
      c.save(); c.globalCompositeOperation = 'destination-out';
      c.fillRect(W*0.12, H*0.2, W*0.16, H*0.18); c.fillRect(W*0.33, H*0.2, W*0.16, H*0.18); c.fillRect(W*0.54, H*0.2, W*0.18, H*0.18);
      c.beginPath(); c.arc(W*0.25, H*0.82, R*0.45, 0, 6.2832); c.arc(W*0.77, H*0.82, R*0.45, 0, 6.2832); c.fill();
      c.restore();
    },
    step(c, W, H, r){ c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.1); c.lineTo(W*0.5, H*(0.02 + r()*0.08)); c.lineTo(W, H*0.12); c.lineTo(W, H); c.closePath(); c.fill(); },
    // a flight of steps climbing left to right, the treads a little uneven, as if cut by hand
    stairs(c, W, H, r){
      const n = 7; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.86);
      for(let q=0;q<n;q++){ const x1 = (q + 1)/n, y = 0.86 - (q + 1)/n*0.84 + (r() - 0.5)*0.01; c.lineTo(W*(q/n), H*y); c.lineTo(W*x1, H*y); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // Ngāuruhoe from its real profile (data: S.cone), the crater notch included, gullies cut as slits
    ngauruhoe(c, W, H, r){
      const R = S.cone.rows, lo = Math.min(...R) - 0.6, hi = Math.max(...R);
      c.beginPath(); c.moveTo(0, H);
      R.forEach((a, q) => c.lineTo(q/(R.length - 1)*W, H - (a - lo)/(hi - lo)*H*0.97));
      c.lineTo(W, H); c.closePath(); c.fill();
      const top = R.indexOf(hi)/(R.length - 1);
      c.save(); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round';
      for(let q=0;q<9;q++){ const u = top + (q - 4)*0.022 + (r() - 0.5)*0.008, l = 0.12 + r()*0.24; c.lineWidth = W*0.005; c.beginPath(); c.moveTo(W*u, H*(0.1 + r()*0.04)); c.lineTo(W*(top + (u - top)*2.2), H*(0.1 + l)); c.stroke(); }
      c.restore();
    },
    // a broad old volcano far off, Ruapehu's long shoulders and flat top
    massif(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      for(let q=0;q<=80;q++){ const u = q/80; let y = 0.08 + 0.78*Math.pow(Math.sin(Math.PI*clamp01((u - 0.04)/0.92)), 0.7); y -= 0.06*Math.exp(-Math.pow((u - 0.47)/0.06, 2)); y += (r() - 0.5)*0.018; c.lineTo(u*W, H*(1 - y)); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // the snow on it, cut along a ragged line: the second piece that sits just in front
    snowcap(c, W, H, r){
      c.beginPath(); c.moveTo(W*0.18, H);
      for(let q=0;q<=80;q++){ const u = q/80, uu = lerp(0.18, 0.82, u); let y = 0.08 + 0.78*Math.pow(Math.sin(Math.PI*clamp01((uu - 0.04)/0.92)), 0.7); y -= 0.06*Math.exp(-Math.pow((uu - 0.47)/0.06, 2)); c.lineTo(uu*W, H*(1 - y)); }
      for(let q=0;q<=24;q++){ const uu = lerp(0.82, 0.18, q/24); c.lineTo(uu*W, H*(1 - 0.58 - (q%2 ? 0.07 : 0) - r()*0.05)); }
      c.closePath(); c.fill();
    },
    // jagged crater rims: sharp peaks, broken
    jagged(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      let y = 0.4;
      for(let q=0;q<=60;q++){ const u = q/60; y = clamp(y + (r() - 0.48)*0.22, 0.25, 0.95); const yy = q%3 === 0 ? y : y*0.82; c.lineTo(u*W, H*(1 - yy*Math.sin(Math.PI*clamp01(u*1.05)))); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // the lake country far below, low and long, a small cone standing out of it
    plain(c, W, H, r){
      c.beginPath(); c.moveTo(0, H);
      for(let q=0;q<=80;q++){ const u = q/80; let y = 0.16 + 0.05*Math.sin(u*9 + r()) + 0.62*Math.exp(-Math.pow((u - 0.68)/0.07, 2)) + 0.18*Math.exp(-Math.pow((u - 0.25)/0.12, 2)); c.lineTo(u*W, H*(1 - y)); }
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    // a row of bush crowns, round cuts along the top
    treeline(c, W, H, r){
      c.fillRect(0, H*0.55, W, H*0.45);
      for(let x = 0; x < W; x += W*0.035){ const rr = H*(0.16 + r()*0.18); c.beginPath(); c.arc(x + r()*W*0.02, H*0.55 - rr*0.4 + r()*H*0.08, rr, 0, 6.2832); c.fill(); }
    },
    // a trail marker pole
    pole(c, W, H){ c.fillRect(W*0.3, H*0.02, W*0.4, H*0.98); },
    // Soda Springs falling over a lip of old lava into a pool
    fall(c, W, H, r){
      // one ribbon of water, widening as it falls
      c.beginPath(); c.moveTo(W*0.38, 0);
      for(let q=0;q<=20;q++){ const v = q/20; c.lineTo(W*(0.38 - v*0.22 + Math.sin(v*6)*0.03), H*v); }
      for(let q=20;q>=0;q--){ const v = q/20; c.lineTo(W*(0.62 + v*0.22 + Math.sin(v*6 + 1)*0.03), H*v); }
      c.closePath(); c.fill();
    },
    // a toilet block: the most useful building on the crossing. a box, a pent roof, a vent pipe
    loo(c, W, H){
      c.beginPath(); c.moveTo(W*0.08, H); c.lineTo(W*0.08, H*0.36); c.lineTo(W*0.96, H*0.22); c.lineTo(W*0.92, H*0.3); c.lineTo(W*0.92, H); c.closePath(); c.fill();
      c.fillRect(W*0.72, H*0.0, W*0.07, H*0.3);
      c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(W*0.24, H*0.55, W*0.16, H*0.45); c.fillRect(W*0.56, H*0.55, W*0.16, H*0.45); c.restore();
    },
    // a tree fern: a slim trunk and a crown of fronds, cut as a fringe
    fern(c, W, H, r){
      c.fillRect(W*0.47, H*0.3, W*0.06, H*0.7);
      for(let q=0;q<9;q++){ const a = Math.PI*(0.08 + 0.84*q/8), L = 0.42 + r()*0.1, ex = 0.5 + Math.cos(a)*L, ey = 0.3 - Math.sin(a)*L*0.6 + (Math.abs(Math.cos(a)))*0.22;
        c.beginPath(); c.moveTo(W*0.5, H*0.3); c.quadraticCurveTo(W*(0.5 + Math.cos(a)*L*0.5), H*(0.3 - Math.sin(a)*L*0.7), W*ex, H*ey); c.lineTo(W*(ex + 0.02), H*(ey + 0.03)); c.quadraticCurveTo(W*(0.5 + Math.cos(a)*L*0.45), H*(0.34 - Math.sin(a)*L*0.55), W*0.5, H*0.33); c.closePath(); c.fill(); }
    }
  };

  if(WALK && WALK.shapes) Object.assign(SHAPES, WALK.shapes);
  /* ---- a material per kind and variant, shared by every piece of that kind ---- */
  const MATS = {}, extraTex = [];
  function material(kind, v, w, h, colour, opts){
    const key = kind + v + (opts.key || ''); if(MATS[key]) return MATS[key];
    const ch = Math.round(opts.px || 220), cw = Math.max(16, Math.round(ch*w/h));
    const r1 = rnd(31 + v*97 + kind.length*13), r2 = rnd(31 + v*97 + kind.length*13);
    const shp = A.shapeCanvas(cw, ch, (c, W, H) => SHAPES[kind](c, W, H, r1), opts.blur || 1.6);
    const col = A.colourCanvas(cw, ch, colour, (c, W, H) => {
      // a little light toward the top edge, the way card catches a lamp, and a darker foot
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.7, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.08)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // the tooth of the card: a fine speckle, lighter and darker, so a flat colour reads as paper up close
      for(let q = 0, n = Math.round(W*H/90); q < n; q++){ c.fillStyle = r2() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'; c.fillRect(r2()*W, r2()*H, 1 + r2()*1.5, 1 + r2()*1.5); }
      // the trail markers carry the route's red at the top, like the real poles' painted tips
      if(kind === 'pole'){ c.fillStyle = PAL.red; c.fillRect(0, 0, W, H*0.2); }
      if(opts.paint) opts.paint(c, W, H);
    });
    const p = A.makePaper({ colour:col, shape:shp, aspect:w/h, seed:3.3 + v*1.7 + kind.length, deckle:opts.deckle || 0.003, fibre:0.085,
      rim:opts.rim === undefined ? 0.7 : opts.rim, rimCol:opts.rimCol || '#FBF8F2', contact:opts.contact === undefined ? 0.26 : opts.contact, warp:opts.warp || 0.01 });
    if(opts.gloss){ p.mat.roughness = 1 - opts.gloss; }
    // water always wins over the pale shore it sits in
    if(kind === 'lake' || kind === 'stream'){ p.mat.polygonOffset = true; p.mat.polygonOffsetFactor = -2; p.mat.polygonOffsetUnits = -6; }
    extraTex.push(p.map, p.mat.alphaMap);
    return (MATS[key] = { mat:p.mat, depth:p.depth, w, h });
  }

  /* ============================================================
     build: once the hero exists. the room, the captions, the models, the scenery
     ============================================================ */
  let A = null, lamp = null, cap = null, capI = -1, capOff = false;
  const PROPS = [];
  // round 2's lamp burned the white model out under the pool (Sam's screenshot of the bush). softer now
  const LAMP_I = { story:1080 };
  IN.build = function(api){
    A = api;
    const { THREE } = A;
    // V1's sun stays only as a faint fill. the light is the hero's desk lamp carried into the map
    const D = A.LIGHT.day;
    // the room's fill at 0.6 of V4's, so the panels either side of the one being walked fall into shadow (Sam, V5)
    const PLL = window.LOOK && window.LOOK.pal;   // the palette's landing lights (Polar Night: cold)
    D.key.set((PLL && PLL.landKey) || '#FFEEDC'); D.ki = 0.27;
    D.sky.set('#CDD1D6'); D.gnd.set((PLL && PLL.landGnd) || '#15120F'); D.hi = 0.1; D.fi = 0.05;
    // a light room (the palette round) stays light through the landing: its sky lights the map as it lit the desk
    if(PLL && PLL.light){ D.sky.set(PLL.day.sky); D.gnd.set(PLL.day.gnd); D.hi = PLL.day.hi*PLL.amb; }
    const az = 122*D2R, el = 34*D2R;
    IN.keyOff = new THREE.Vector3(Math.sin(az)*Math.cos(el), Math.sin(el), -Math.cos(az)*Math.cos(el)).multiplyScalar(16);
    A.key.castShadow = false;
    lamp = new THREE.SpotLight((PLL && PLL.landLamp) || 0xFFE8CF, 0, 0, 22*D2R, 0.6, 2);   // the pool sized to one panel (27 and 0.75 in V4)
    lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048);
    lamp.shadow.bias = -0.0003; lamp.shadow.normalBias = 0.025; lamp.shadow.camera.near = 4; lamp.shadow.camera.far = 40;
    A.scene.add(lamp, lamp.target);
    // each panel's stretch of route rises with its own model
    A.ROUTE_MESH.forEach((m, i) => { const u = { uDraw:A.routeU.uDraw, uDash:A.routeU.uDash, uLift:{ value:0 } }; m.material = A.routeMaterial(u); m.material.color.set(PAL.red); m.userData.u = u; });
    A.ROUTE_MAT.color.set(PAL.red);
    captions();
    // the model and scenery of panel 1 now, the rest a panel at a time in the page's build queue
    buildPanel(0);
    for(let i=1;i<NP;i++) A.QUEUE.push(() => buildPanel(i));
    // upload panel 1 now and compile its programs, so nothing is drawn for the first time mid-landing
    const g = A.SCENES[0].group, was = g.visible; g.visible = true;
    extraTex.forEach(t => A.renderer.initTexture(t));
    A.renderer.compile(A.scene, A.camera);
    g.visible = was;
  };

  /* ---- a panel: its model, its backdrop of standing ranges, its pieces ---- */
  function buildPanel(i){
    if(MODEL[i] && !MODEL[i].built) buildModel(i);
    scenery(i);
  }
  let modelMat = null;
  function buildModel(i){
    const { THREE } = A, K = window.HERO_KIT, M = MODEL[i]; if(!M || !K) return;
    const G0 = M.grid, size = G0.size, xA = G0.x0;
    const grid = { N:G0.N, G:G0.G, lo:G0.lo, hi:G0.hi };
    const win = [(STK.win.x0 - xA)/size, (STK.win.z0 + size/2)/size, (STK.win.x1 - xA)/size, (STK.win.z1 + size/2)/size];
    if(!modelMat) modelMat = [ new THREE.MeshStandardMaterial({ color:'#EAE5DB', roughness:0.9, metalness:0 }), new THREE.MeshStandardMaterial({ color:'#D3CABB', roughness:0.95, metalness:0 }) ];
    const root = new THREE.Group(); root.position.set(0, 0.003, 0);
    A.SCENES[i].group.add(root);
    for(let k=0;k<M.levels;k++){
      const L = M.base + k*STK.step;
      const shapes = K.levelShapes(THREE, grid, L, size, { smooth:2, win, minArea:1.6e-4 });
      if(!shapes.length) continue;
      const geo = new THREE.ExtrudeGeometry(shapes, { depth:STK.ch, bevelEnabled:false, curveSegments:1 });
      geo.rotateX(-HALF_PI);
      // each card fades in over the first part of its rise, so the model comes up out of the print instead of
      // replacing it in one frame (V5 round 1: the printed road end vanished under the first card)
      const mats = modelMat.map(m => { const c = m.clone(); c.transparent = true; c.opacity = 0; return c; });
      elevationLook(mats, k, M.levels);
      const mesh = new THREE.Mesh(geo, mats);
      mesh.castShadow = true; mesh.receiveShadow = true;
      const grp = new THREE.Group(); grp.add(mesh); grp.position.y = k*STK.ch; grp.scale.y = 0.001; grp.visible = false;
      root.add(grp);
      M.cards.push({ k, grp, mats, o:0, sp:{ p:0, v:0 } });
    }
    M.root = root; M.built = true;
  }

  // a card's colour from its level on its own panel, so every panel uses the full range of tones. one scale for the
  // whole crossing was tried: the craters panel only spans its top fifth, and its layers melted together again
  function elevationLook(mats, k, n){
    const { THREE } = A, u = n > 1 ? k/(n - 1) : 0, top = mats[0], side = mats[1];
    top.color.set(ELEV.lo).lerp(new THREE.Color(ELEV.hi), Math.pow(u, 0.8));
    side.color.copy(top.color).multiplyScalar(ELEV.side);
  }

  // a point on the route at a research km, with its direction and the panel it is on
  function onRoute(km, side, ahead){
    const R = IN.R, sv = R.sAtKm(km) + (ahead || 0), p = R.at(sv), l = Math.hypot(p.dx, p.dz) || 1;
    const nx = -p.dz/l, nz = p.dx/l, x = p.x + nx*(side || 0), z = p.z + nz*(side || 0), i = panelOf(x);
    return { x, z, i, lx:x - i*PW, s:sv, dir:Math.atan2(p.dz, p.dx) };
  }
  // a standing piece on the model. trig: 'F' with the page, 'near' as the hiker comes, 'after' behind him,
  // 'end' when he reaches the road end
  function prop(kind, at, o){
    const { THREE } = A, i = at.i;
    if(!A.SCENES[i]) return null;
    const w = o.w, h = o.h, M = material(kind, o.v || 0, w, h, o.col, o);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), M.mat);
    mesh.customDepthMaterial = M.depth; mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.position.y = h*0.5;
    if(o.flip) mesh.scale.x = -1;
    const grp = new THREE.Group(); grp.add(mesh);
    // the layers: a second cut in a lighter tone, a hair in front of the first, so each piece has depth
    for(const ly of (o.layers || [])){
      const lw = w*(ly.sx || 1), lh = h*(ly.sy || 1), LM = material(ly.kind, ly.v === undefined ? (o.v || 0) : ly.v, lw, lh, ly.col, Object.assign({}, o, { px:ly.px || o.px, blur:ly.blur, rim:ly.rim, contact:0.05 }));
      const lm = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh, 1, 1), LM.mat);
      lm.customDepthMaterial = LM.depth; lm.castShadow = true; lm.receiveShadow = true;
      // a child of the piece: it shares its flip and, for flat pieces, its unrolling
      lm.position.set((ly.dx || 0)*w, lh*0.5 + (ly.dy || 0)*h - h*0.5, ly.dz === undefined ? 0.012 : ly.dz);
      mesh.add(lm);
    }
    grp.position.set(at.lx - PW*0.5, 0, at.z);
    grp.rotation.order = 'YXZ'; grp.rotation.y = o.yaw || 0;
    A.SCENES[i].group.add(grp);
    const P0 = { kind, i, lx:at.lx, z:at.z, s:at.s, grp, mesh, w, h, sp:{ p:o.lie === undefined ? -HALF_PI : o.lie, v:0 },
      trig:o.trig || 'F', delay:o.delay || 0, lead:o.lead || 1.3, km:o.km || 0, stand:o.stand === undefined ? 0 : o.stand,
      lie:o.lie === undefined ? -HALF_PI : o.lie, bob:o.bob || 0, slide:o.slide || 0, phase:PROPS.length*1.37, sl:{ p:o.slide || 0, v:0 }, on:false,
      unroll:!!o.unroll, ur:{ p:0, v:0 } };
    // an unrolling piece starts at its near end: the group sits there, the mesh runs out from it
    if(o.unroll){ grp.position.x -= Math.cos(o.yaw || 0)*w*0.5; grp.position.z += Math.sin(o.yaw || 0)*w*0.5; mesh.scale.x = 0.001; }
    PROPS.push(P0);
    return P0;
  }
  // a backdrop range through the page's own sheet system: it lies back and stands with its spring
  function backdrop(i, kind, x, z, w, h, col, seed, extra){
    const r0 = rnd(seed);
    const draw = (m) => (c, W, H) => {
      if(m === 'col'){
        c.fillStyle = col; c.fillRect(0, 0, W, H);
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.10)');
        c.fillStyle = g; c.fillRect(0, 0, W, H); return;
      }
      const r = rnd(seed); SHAPES[kind](c, W, H, r);
    };
    void r0;
    A.buildSheet(Object.assign({ day:i, name:kind + i + '_' + seed, z, x, w, h, ch:Math.round(150*h + 80), blur:2.4, deckle:0.0022, sway:0.0012, draw }, extra || {}));
    const L = A.SCENES[i].sheets[A.SCENES[i].sheets.length - 1];
    L.warp0 = 0.012; L.U.uRimCol.value.set('#F4F1EA'); L.U.uRim.value = 0.7; L.U.uFibre.value = 0.045;
    extraTex.push(L.mesh.material.map, L.mesh.material.alphaMap);
  }

  /* ---- what stands on each panel. vibe, not survey: the map underneath has the truth.
     the backdrop stands in layers behind the model, the pieces stand on it, each piece cut in two
     tones (a body and a lighter front), each stretch with its own features ---- */
  function scenery(i){
    const t = T(); if(!t) return;
    const r = rnd(100 + i*31), D = ST.density, C = ST, wp = (name) => t.waypoints.find(w => w.name.indexOf(name) === 0);
    // ...and nothing within reach of the trailhead, where the hero's landing puts the camera at the hiker's eye level
    // (V5 round 1: a rock stood in front of his legs and rose through the red dot)
    const t0 = onRoute(0, 0), clear = (at) => !(at.i === t0.i && Math.hypot(at.lx - t0.lx, at.z - t0.z) < 1.15);
    const ok = (at) => at.i === i && at.lx > 0.3 && at.lx < PW - 0.3 && at.z < 3.85 && at.z > -0.45 && clear(at);
    const along = (km0, km1, n, fn) => { const N = Math.round(n*D); for(let q=0;q<N;q++) fn(lerp(km0, km1, (q + 0.2 + r()*0.6)/N), q); };
    const tuss = (km0, km1, n) => along(km0, km1, n, (km, q) => {
      const at = onRoute(km, (r() < 0.5 ? -1 : 1)*(0.42 + r()*0.95)); if(!ok(at)) return;
      const sc = 0.75 + r()*0.5;
      prop('tussock', at, { v:q%3, w:0.42*sc, h:0.3*sc, col:C.tussock, trig:'near', lead:1.6, yaw:(r() - 0.5)*0.4, flip:r() < 0.5, px:150,
        layers:[{ kind:'tussockHi', col:C.tussockHi, sx:0.85, sy:0.8, dz:0.01 }] });
    });
    const rocks = (km0, km1, n) => along(km0, km1, n, (km, q) => {
      const at = onRoute(km, (r() < 0.5 ? -1 : 1)*(0.5 + r()*1.0)); if(!ok(at)) return;
      const sc = 0.7 + r()*0.6;
      prop('rock', at, { v:q%2, w:0.36*sc, h:0.2*sc, col:C.rock, trig:'near', lead:1.4, yaw:(r() - 0.5)*0.5, px:120,
        layers:[{ kind:'rockHi', col:C.rockHi, dz:0.008 }] });
    });
    const poles = (km0, km1) => { for(let km = km0; km < km1; km += 0.45){ const at = onRoute(km, 0.2); if(!ok(at)) continue; prop('pole', at, { w:0.05, h:0.34, col:C.pole, trig:'near', lead:1.1, px:90, rim:0.3, blur:0.8 }); } };
    const steam = (lx, z, n, big) => { for(let q=0;q<n;q++){ const at = { i, lx:lx + (r() - 0.5)*0.8, z:z + (r() - 0.5)*0.5, s:0 }; const sc = (big || 1)*(0.75 + r()*0.5);
      prop('steam', at, { v:q%2, w:0.5*sc, h:0.85*sc, col:C.steam, trig:'F', delay:0.25 + q*0.08, bob:1, px:200, rim:0.4 }); } };
    const clouds = (n) => { if(!ST.clouds) return; for(let q=0;q<n;q++){ const at = { i, lx:0.9 + r()*(PW - 1.8), z:-0.9 + r()*1.4, s:0 };
      prop('cloud', at, { w:1.3, h:1.5, col:C.cloud, trig:'F', delay:0.35 + q*0.1, bob:0.6, px:220, rim:0.4, contact:0.1,
        layers:[{ kind:'cloudHi', col:'#FFFFFF', dz:0.014 }] }); } };
    // a flat ribbon of pieces that unroll along the track, one after another
    const ribbon = (kind, km0, km1, side, wdt, col, o) => { for(let km = km0; km < km1 - 0.05; km += 0.42){
      const a = onRoute(km, side), b = onRoute(Math.min(km1, km + 0.42), side); if(!ok(a) || b.i !== i) continue;
      const len = Math.hypot(b.x - a.x, b.z - a.z) + 0.02, yaw = -Math.atan2(b.z - a.z, b.x - a.x);
      prop(kind, { ...a, lx:(a.lx + b.lx)/2, z:(a.z + b.z)/2 }, Object.assign({ w:len, h:wdt, col, trig:'near', lead:1.3, yaw, lie:-HALF_PI, stand:-HALF_PI, unroll:true, px:60, rim:0.5, contact:0 }, o || {}));
    } };
    const at = (name, dz) => { const w = wp(name); if(!w) return null; const l = wpLocal(i, w); return { i, lx:clamp(l[0], 0.5, PW - 0.5), z:clamp(l[1] + (dz || 0), -0.4, 3.7), s:IN.R.sAtKm(w.km), km:w.km }; };
    if(WALK && WALK.scenery){
      WALK.scenery(i, { i, t, r, C, ST, PW, PD, NP, prop, backdrop, onRoute, along, tuss, rocks, poles, steam, clouds, ribbon, ok, at, wp, HALF_PI, sky:!!S.sky });
    }
    else {
    if(i === 0){
      // the walk in: the boardwalk over the old lava, the Mangatepōpō stream, tussock, Ngāuruhoe ahead
      backdrop(0, 'massif', 1.4, -1.95, 5.4, 1.15, C.far, 11);
      backdrop(0, 'ngauruhoe', 0.9, -1.45, 3.4, 2.5, C.cone, 12);
      backdrop(0, 'coneHi', 0.9, -1.4, 3.4, 2.5, C.coneHi, 12);
      backdrop(0, 'jagged', -2.0, -0.95, 3.0, 0.9, C.jag, 13);
      ribbon('boardwalk', 0.25, 1.1, 0, 0.13, C.plank, { px:40 });
      ribbon('stream', 0.4, 2.8, -0.75, 0.16, C.stream, { gloss:ST.gloss });
      tuss(0.2, 3.0, 12); rocks(0.4, 2.9, 7); poles(0.3, 3.0); clouds(2);
    }
    if(i === 1){
      // the climb: Soda Springs and its toilets, then the Staircase, the cone filling the right
      backdrop(1, 'massif', -1.2, -1.95, 4.8, 1.1, C.far, 21);
      backdrop(1, 'ngauruhoe', 1.4, -1.45, 4.2, 3.1, C.cone, 22);
      backdrop(1, 'coneHi', 1.4, -1.4, 4.2, 3.1, C.coneHi, 22);
      backdrop(1, 'jagged', -2.1, -0.95, 3.0, 1.4, C.jag, 23);
      const ss = at('Soda', -0.65);
      if(ss){ prop('fall', ss, { w:0.3, h:0.62, col:C.water, trig:'F', delay:0.12, px:170, gloss:ST.gloss, rim:0.5 });
        prop('lake', { ...ss, z:ss.z + 0.12 }, { v:7, w:0.5, h:0.3, col:C.water, trig:'F', delay:0.18, lie:-HALF_PI, stand:-HALF_PI + 0.3, px:110, gloss:ST.gloss, rim:0.5,
          layers:[{ kind:'shore', col:C.shore, sx:1.25, sy:1.3, dy:-0.15, dz:-0.006 }] });
        prop('loo', { ...ss, lx:ss.lx - 0.75, z:ss.z + 0.1 }, { w:0.42, h:0.42, col:C.loo, trig:'F', delay:0.2, px:140, rim:0.7 }); }
      tuss(3.1, 4.3, 5); rocks(3.2, 6.6, 6); poles(3.1, 6.9);
      const sa = onRoute(5.4, -0.7);
      if(sa.i === 1) prop('stairs', sa, { w:1.1, h:0.75, col:C.step2, trig:'near', lead:2.2, px:260, rim:0.8, blur:0.7,
        layers:[{ kind:'treads', col:C.tread, dz:0.008, blur:0.6 }] });
      const sc = at('South Crater', 0);
      if(sc && sc.lx < PW - 0.4) prop('floor', sc, { v:2, w:1.4, h:0.9, col:C.floor, trig:'F', delay:0.3, lie:-HALF_PI, stand:-HALF_PI + 0.05, px:120, rim:0.3, contact:0 });
      clouds(2);
    }
    if(i === 2){
      // the craters: Ngāuruhoe behind with Ruapehu, the crater rims, Red Crater's broken rim and its steam,
      // the Emerald Lakes and Blue Lake on their pale shores, tipping up to the lamp
      backdrop(2, 'massif', 1.6, -1.95, 5.0, 1.05, C.far, 31);
      backdrop(2, 'ngauruhoe', 1.6, -1.45, 2.8, 2.1, C.cone, 32);
      backdrop(2, 'coneHi', 1.6, -1.4, 2.8, 2.1, C.coneHi, 32);
      backdrop(2, 'jagged', -1.3, -0.95, 4.2, 1.3, C.jag, 33);
      const rc = at('Red Crater', -0.55), em = at('Emerald'), bl = at('Blue');
      if(rc){ prop('crater', rc, { w:1.5, h:0.7, col:C.crater, trig:'F', delay:0.1, px:240, layers:[{ kind:'craterHi', col:C.craterHi, dz:0.012 }] }); steam(rc.lx + 0.05, rc.z - 0.1, 3); }
      // the lakes tip up toward the lamp a little, the one joke a paper lake can make
      if(em){ [[0.0, 0.35, 0.9], [0.55, 0.05, 0.6], [-0.45, -0.1, 0.5]].forEach((o, q) => {
          prop('lake', { i, lx:em.lx + o[0], z:em.z + o[1] + 0.2, s:em.s }, { v:q, w:0.62*o[2] + 0.2, h:0.5*o[2] + 0.15, col:C.lakeE, trig:'F', delay:0.2 + q*0.07, lie:-HALF_PI, stand:-HALF_PI + 0.36, px:140, gloss:ST.gloss, rim:0.5,
            layers:[{ kind:'shore', v:q + 10, col:C.shore, sx:1.22, sy:1.28, dy:-0.14, dz:-0.006 }] });
        });
        steam(em.lx + 0.7, em.z - 0.25, 2, 0.8); }
      if(bl) prop('lake', { ...bl, z:Math.min(3.6, bl.z + 0.3) }, { v:5, w:1.1, h:0.8, col:C.lakeB, trig:'F', delay:0.35, lie:-HALF_PI, stand:-HALF_PI + 0.32, px:160, gloss:ST.gloss, rim:0.5,
        layers:[{ kind:'shore', v:15, col:C.shore, sx:1.18, sy:1.22, dy:-0.11, dz:-0.006 }] });
      rocks(7.1, 10.8, 6); poles(7.1, 10.8); clouds(1);
    }
    if(i === 3){
      // the way down: the lake country below, the shelter and its toilets, steam from the springs,
      // golden tussock all down the zigzags
      backdrop(3, 'plain', 0.0, -1.95, 6.6, 1.1, C.far, 41);
      backdrop(3, 'hill', 1.9, -1.45, 2.6, 1.0, C.mid, 42);
      backdrop(3, 'jagged', -2.0, -0.95, 2.8, 0.8, C.jag, 43);
      const ks = at('Ketetahi Shelter', -0.45);
      if(ks){ prop('hut', ks, { w:0.62, h:0.5, col:C.hut, trig:'F', delay:0.15, px:180, rim:0.7, layers:[{ kind:'roof', col:C.roof, dz:0.01 }] });
        prop('loo', { ...ks, lx:ks.lx + 0.7, z:ks.z + 0.15 }, { w:0.38, h:0.38, col:C.loo, trig:'F', delay:0.22, px:140, rim:0.7 });
        steam(ks.lx - 1.2, ks.z - 0.5, 2, 0.8); }
      tuss(11.0, 16.0, 18); rocks(11.0, 14.0, 3); poles(11.0, 16.0); clouds(2);
    }
    if(i === 4){
      // the bush: crowns and tree ferns spring up around the hiker, a footbridge over the stream,
      // and the shuttle pulls in at the road end
      backdrop(4, 'treeline', 0.0, -1.95, 6.6, 1.3, C.tree2, 51);
      backdrop(4, 'treeline', -0.4, -1.35, 5.8, 0.95, C.tree, 52);
      along(16.2, 19.1, 20, (km, q) => {
        const a2 = onRoute(km, (r() < 0.5 ? -1 : 1)*(0.4 + r()*1.2)); if(!ok(a2)) return;
        const kind = r() < 0.22 ? 'rimu' : r() < 0.35 ? 'fern' : 'tree', sc = 0.8 + r()*0.45;
        const w = kind === 'rimu' ? 0.42 : kind === 'fern' ? 0.6 : 0.55, h = kind === 'rimu' ? 1.0 : 0.62;
        prop(kind, a2, { v:q%3, w:w*sc, h:h*sc, col:kind === 'fern' ? C.fern : (q%2 ? C.tree : C.tree2), trig:'near', lead:1.5, yaw:(r() - 0.5)*0.4, flip:r() < 0.5, px:180,
          layers:kind === 'tree' ? [{ kind:'crownHi', col:C.treeHi, dz:0.012 }] : [] });
      });
      // the stream crossing and its footbridge
      const sb = onRoute(17.6, 0);
      if(sb.i === 4){
        prop('stream', { ...sb }, { w:1.6, h:0.22, col:C.stream, trig:'near', lead:1.6, yaw:-sb.dir + HALF_PI, lie:-HALF_PI, stand:-HALF_PI, unroll:true, px:70, gloss:ST.gloss, rim:0.5, contact:0 });
        prop('bridge', { ...sb, lx:sb.lx + Math.sin(sb.dir)*0.16, z:sb.z - Math.cos(sb.dir)*0.16 }, { w:0.5, h:0.2, col:C.plank, trig:'near', lead:1.4, yaw:-sb.dir, px:90, rim:0.6, blur:0.7 });
      }
      poles(16.1, 19.2);
      const end = onRoute(t.km, 0.55);
      if(end.i === 4) prop('van', end, { w:0.62, h:0.34, col:C.van, trig:'end', km:t.km - 0.9, slide:-1.6, yaw:-end.dir, px:150, rim:0.7 });
      clouds(2);
    }
    }
    // a trail sign at the start of each stretch, its numbers printed on the board
    {
      const st = STRETCH[i]; if(!st) return;
      let a2 = null;
      for(const dk of [0.3, 0.6, 0.9, 1.2]) for(const sd of [0.95, -0.95]){ if(a2) break; const c2 = onRoute(st.km0R + dk, sd); if(ok(c2) && c2.lx < PW*0.55) a2 = c2; }
      if(!a2) return;
      prop('sign', { ...a2, z:Math.min(a2.z, 3.75) }, { key:'s' + i, w:1.7, h:1.15, col:ELEV.sign, trig:'F', delay:0.05, px:480, rim:0.6, blur:0.9, contact:0.15, yaw:0.12,
        paint:(c, W, H) => {
          c.fillStyle = PAL.red; c.fillRect(W*0.05, H*0.05, W*0.83, H*0.014);
          c.fillStyle = PAL.ink; c.textBaseline = 'alphabetic';
          c.font = LBL(Math.round(H*0.072)); U.tracked(c, 'STRETCH ' + (i + 1) + ' OF ' + NP, W*0.07, H*0.15, H*0.006, 'left');
          { let px = Math.round(H*0.21); c.font = DSP(px); const w0 = c.measureText(st.dist + ' km').width; if(w0 > W*0.8){ px = Math.floor(px*W*0.8/w0); c.font = DSP(px); } }
          c.fillText(st.dist + ' km', W*0.07, H*0.37);
          c.font = LBL(Math.round(H*0.085));
          U.tracked(c, 'UP ' + fmt(st.up) + '  DOWN ' + fmt(st.down), W*0.07, H*0.49, H*0.004, 'left');
          U.tracked(c, 'HIGH ' + fmt(st.hi) + ' M', W*0.07, H*0.585, H*0.004, 'left');
        } });
    }
  }

  /* ---- the captions: they follow the hiker's km, not the panels ---- */
  function captions(){
    const t = T(); if(!t) return;
    if(WALK && WALK.captions){
      const wpn = (name) => t.waypoints.find(w => w.name.indexOf(name) === 0);
      const rowW = (a, z) => '<b><span>Km</span>' + a.km + (z ? ' to ' + z.km : '') + '</b><b><span>Height</span>' + fmt(a.m) + (z ? ' to ' + fmt(z.m) : '') + ' m</b>';
      IN.CAPS = WALK.captions({ t, wp:wpn, row:rowW, fmt, b:t.beats, f:t.facts });
    }
    else {
    const wp = (name) => t.waypoints.find(w => w.name.indexOf(name) === 0);
    const b = t.beats, f = t.facts;
    const row = (a, z) => '<b><span>Km</span>' + a.km + (z ? ' to ' + z.km : '') + '</b><b><span>Height</span>' + fmt(a.m) + (z ? ' to ' + fmt(z.m) : '') + ' m</b>';
    const shade = (t.kit || []).find(k => /shade/i.test(k.why));
    const st = wp('Mangatepōpō'), so = wp('Soda'), sr = wp('South Crater rim'), sc = wp('South Crater'), rc = wp('Red Crater'), em = wp('Emerald'), bl = wp('Blue'), ks = wp('Ketetahi Shelter'), ke = wp('Ketetahi road');
    IN.CAPS = [
      { km:0, at:0,   kick:'The walk in', title:['Mangatepōpō', 'Valley'], line:f[4], data:row(st, so) },
      { km:4.2, kick:'The climb', title:b[0].name.split(' '), line:b[0].line, data:row(so, sr) },
      { km:6.6, kick:'The pause', title:b[1].name.split(' '), line:b[1].line, data:row(sc) },
      { km:7.6, kick:'The top', title:b[2].name.split(' '), line:b[2].line, data:row(rc) + '<b><span>High point</span>of the crossing</b>' },
      { km:8.5, kick:'The lakes', title:['Emerald', 'Lakes'], line:f[1], data:row(em, bl) },
      { km:12.6, kick:'The way down', title:['Down', 'to Ketetahi'], line:(shade ? shade.why + ' Bring ' + shade.item.toLowerCase() + '.' : f[3]), data:row(ks) },
      { km:16.0, kick:'The bush', title:['Into the', 'bush'], line:f[0].split(', and')[0] + '. The shuttle is part of the plan.', data:row(ke) + '<b><span>End</span>' + t.end.name + '</b>' }
    ];
    const starts = [st, so, sc, rc, em, ks, null];
    // the kicker's km is a researched waypoint's, or none: the switch points (C.km) are design, not data
    IN.CAPS.forEach((C, k) => { C.km0 = starts[k] ? starts[k].km : null; });
    }
    // the caption is a paper map card since 18 Oct (Sam: "on the left side we always have the same layout and text ...
    // it feels boring. Add a nice map card style card ... it can move around depending on each section, just make sure
    // it doesn't cover the character or important detail"). A strip map of the stretch the hiker is on, with the route,
    // the part walked and where he is, and the stretch's words and numbers under it. It moves to the free corner
    const css = document.createElement('style');
    css.textContent = `
.beat.mcard{position:fixed;left:0;top:0;z-index:6;width:min(340px,29vw);pointer-events:none;will-change:transform;color:#1B2230;}
.mcard .mc-in{position:relative;padding:16px 18px 14px;background:#F3EEE4 linear-gradient(170deg, rgba(255,255,255,0.45), rgba(0,0,0,0.05));
  box-shadow:0 26px 40px -22px rgba(0,0,0,0.9), 0 2px 0 rgba(0,0,0,0.12);transform:rotate(var(--rot,-1.2deg));transition:transform .9s cubic-bezier(.2,1.2,.35,1);}
.mcard .mc-in::before{content:'';position:absolute;top:-10px;left:50%;width:70px;height:20px;transform:translateX(-50%) rotate(-3deg);background:rgba(226,214,186,0.85);box-shadow:0 2px 3px rgba(0,0,0,0.2);}
.mcard .bk{display:inline-flex;align-items:center;gap:10px;margin:0 0 12px;padding:7px 26px 7px 18px;color:#F6EFE3;font-family:var(--f-label,"DM Mono",monospace);font-stretch:var(--l-st,100%);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;
  background:var(--v2-red,#D63B2F) linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.12));clip-path:polygon(0 3%, calc(100% - 14px) 0, 100% 52%, calc(100% - 13px) 100%, 1px 97%, 11px 50%);transform:rotate(-1.5deg);transform-origin:0 50%;}
.mcard .bk b{font-family:var(--f-display,Georgia,serif);font-size:15px;letter-spacing:-0.01em;font-weight:500;text-transform:none;}
.mcard .bk .rule{display:block;width:1px;height:13px;background:rgba(246,239,227,0.5);}
.mcard h2{font-family:var(--f-display,"Instrument Serif",Georgia,serif);font-weight:var(--d-w,400);font-stretch:var(--d-st,100%);font-size:calc(clamp(24px,2.2vw,32px)*var(--c-scale,var(--d-scale,1)));line-height:1.02;letter-spacing:var(--d-track,-.012em);margin:0 0 12px;color:#121A26;}
.mcard h2 .ln{display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em;}
.mcard h2 .ln > span{display:inline-block;}
.mcard h2 em{font-style:var(--d-acc,italic);color:var(--v2-red,#C8432B);}
.mcard .mc-float{will-change:transform;}
.mcard .mc-map{position:relative;margin:0 -4px 12px;border:1px solid rgba(27,34,48,0.18);background:#EDE6D8;}
.mcard .mc-map canvas{display:block;width:100%;height:auto;}
.mcard p.bl{font-family:var(--f-text,"Instrument Sans",system-ui,sans-serif);font-size:13.5px;line-height:1.5;color:rgba(27,34,48,0.78);margin:0 0 10px;text-wrap:pretty;}
.mcard p.bd{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0;padding-top:9px;border-top:1px dashed rgba(27,34,48,0.25);font-family:var(--f-label,"DM Mono",monospace);font-size:calc(10px*var(--l-scale,1));letter-spacing:.12em;text-transform:uppercase;color:#1B2230;}
.mcard p.bd b{font-weight:500;}
.mcard p.bd span{color:rgba(27,34,48,0.5);margin-right:5px;}
.mcard .fx{opacity:0;}
@media (max-width:760px){
  .beat.mcard{width:calc(100vw - 28px);}
  .mcard .mc-in{padding:12px 14px 10px;}
  .mcard h2{font-size:calc(24px*var(--c-scale-n,var(--d-scale-n,var(--d-scale,1))));margin-bottom:8px;}
  .mcard p.bl{font-size:12.5px;margin-bottom:8px;}
  .mcard .mc-map{margin-bottom:8px;}
  .mcard p.bd{display:none;}
}`;
    document.head.appendChild(css);
    cap = document.createElement('aside');
    cap.className = 'beat mcard'; cap.setAttribute('aria-live', 'polite');
    document.body.appendChild(cap);
  }
  function fill(n){
    const C = IN.CAPS[n], words = C.title.slice(), last = words.pop();
    cap.innerHTML = '<div class="mc-float"><div class="mc-in">' +
      '<p class="bk fx">' + (C.km0 !== null ? '<b>Km ' + C.km0 + '</b><i class="rule"></i>' : '') + '<span>' + C.kick + '</span></p>' +
      '<h2><span class="ln"><span>' + (words.length ? words.join(' ') + ' ' : '') + '<em>' + last + '</em></span></span></h2>' +
      '<div class="mc-map fx"><canvas></canvas></div>' +
      '<p class="bl fx">' + C.line + '</p>' +
      '<p class="bd fx">' + C.data + '</p></div></div>';
    MC.cv = cap.querySelector('canvas'); MC.panel = -1; MC.last = ''; MC.fl = cap.querySelector('.mc-float');
  }
  /* ---- the card's strip map: the panel's contours, its route, the part walked and the hiker ---- */
  const MC = { cv:null, panel:-1, last:'', base:[], slot:-1, x:0, y:0, group:-1, fl:null, gk0:0, gk1:1 };
  const MZ0 = -1.3, MZ1 = 4.3;                 // the depth of the panel the card shows, the band the model stands in
  function mcBase(i, W, H){
    const key = i + '_' + W;
    if(MC.base[key]) return MC.base[key];
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), g0 = GRID[i];
    x.fillStyle = '#EDE6D8'; x.fillRect(0, 0, W, H);
    if(g0){
      const g = upsample(g0, 2), Hf = H*S.PD/(MZ1 - MZ0), oy = -(MZ0 + S.PD/2)/S.PD*Hf;
      const lo = g.lo, hi = g.hi, step = S.CI || (hi - lo > 1600 ? 100 : hi - lo > 700 ? 50 : 20);
      const [thin, bold] = contourPaths(g, W, Hf, step, 5);
      x.save(); x.translate(0, oy);
      x.strokeStyle = 'rgba(27,34,48,0.16)'; x.lineWidth = W/360; x.stroke(thin);
      x.strokeStyle = 'rgba(27,34,48,0.34)'; x.lineWidth = W/240; x.stroke(bold);
      x.restore();
    }
    // the planned route, dashed
    const pts = S.route.filter(r => r[4] === i).map(r => [(r[0] - i*S.PW)/S.PW*W, (r[1] - MZ0)/(MZ1 - MZ0)*H]);
    x.strokeStyle = rgba(PAL.red, 0.55); x.lineWidth = W/150; x.setLineDash([W/60, W/90]); x.lineCap = 'round';
    x.beginPath(); pts.forEach((q, k) => k ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); x.setLineDash([]);
    // the researched points on this stretch
    const t = T();
    if(t) t.waypoints.forEach(w => {
      if(panelOfKm(w.km) !== i) return;
      const l = wpLocal(i, w), px = clamp(l[0]/S.PW, 0.03, 0.97)*W, py = clamp((l[1] - MZ0)/(MZ1 - MZ0), 0.06, 0.94)*H;
      x.fillStyle = PAL.ink; x.beginPath(); x.arc(px, py, W/120, 0, 6.2832); x.fill();
      x.font = LBL(Math.round(W/44)); x.textBaseline = 'middle';
      const name = w.name.split(/[,(]/)[0].trim().toUpperCase(), tw = x.measureText(name).width, left = px + W/60 + tw > W - 4;
      x.textAlign = left ? 'right' : 'left'; x.fillText(name, left ? px - W/60 : px + W/60, py - W/70);
    });
    // a north arrow, turned as this stretch is turned (an Ogilby strip runs along the road, not north up)
    const f = S.frames[i];
    if(f){ const ax = (-f.u[1]), az = (-f.n[1]), a = Math.atan2(az, ax), cx = W - W/14, cy = H/5, r = W/34;
      x.save(); x.translate(cx, cy); x.rotate(a + Math.PI/2); x.fillStyle = PAL.ink; x.beginPath(); x.moveTo(0, -r); x.lineTo(r*0.45, r*0.6); x.lineTo(0, r*0.25); x.lineTo(-r*0.45, r*0.6); x.closePath(); x.fill(); x.restore();
      x.font = LBL(Math.round(W/40)); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = PAL.ink; x.fillText('N', cx, cy + r*1.4); }
    x.font = LBL(Math.round(W/40)); x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = 'rgba(27,34,48,0.6)';
    x.fillText('STRETCH ' + (i + 1) + ' OF ' + NP, W/40, W/40);
    return (MC.base[key] = c);
  }
  // each frame: the stretch's map, the route walked so far and the hiker's dot (redrawn only when he moves)
  function mcDraw(i, pt, S0){
    const cv = MC.cv; if(!cv) return;
    const W = 560, H = Math.round(W*(MZ1 - MZ0)/S.PW*0.62);
    if(cv.width !== W){ cv.width = W; cv.height = H; }
    const hx = (pt.x - i*S.PW)/S.PW*W, hy = (pt.z - MZ0)/(MZ1 - MZ0)*H, key = i + ':' + hx.toFixed(0) + ':' + hy.toFixed(0);
    if(key === MC.last) return;
    MC.last = key;
    const x = cv.getContext('2d'), sy = H/(H);
    x.drawImage(mcBase(i, W, H), 0, 0);
    // walked: the route from the panel's start to the hiker, solid red
    const R = IN.R; x.strokeStyle = PAL.red; x.lineWidth = W/110; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
    const s0 = R.cross[i], s1 = Math.min(S0, R.cross[i + 1]);
    for(let sv = s0, k = 0; sv <= s1; sv += 0.06, k++){ const q = R.at(sv), px = (q.x - i*S.PW)/S.PW*W, py = (q.z - MZ0)/(MZ1 - MZ0)*H*sy; k ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.lineTo(hx, hy); x.stroke();
    // the hiker: a red ball pin like the hero's, with a ring
    x.fillStyle = 'rgba(214,59,47,0.22)'; x.beginPath(); x.arc(hx, hy, W/34, 0, 6.2832); x.fill();
    x.fillStyle = PAL.red; x.beginPath(); x.arc(hx, hy, W/70, 0, 6.2832); x.fill();
    x.strokeStyle = '#F6EFE3'; x.lineWidth = W/280; x.stroke();
  }
  /* ---- where the card goes (Sam, 19 Oct: "it goes left, right, left, right, so fast. One and two can stay in the
     same place with some floating, at three it can reposition and stay there for three and four, and for the last one
     move a little to another location"). One place per group of stretches: 1 and 2, 3 and 4, then 5. Each group's
     place is the corner its hiker's walk and its pieces leave freest, seen from each of its stretches' own settled
     cameras. A new group always moves; the last one prefers the corner nearest, a short move ---- */
  const GROUP = [0, 0, 1, 1, 2];
  const capPanel = (n) => Math.max(0, Math.min(NP - 1, onRoute(IN.CAPS[n].km + 0.05, 0).i));
  const groupOf = (n) => GROUP[capPanel(n)];
  function slotsNow(){
    const vw = window.innerWidth, vh = window.innerHeight, narrow = A.NARROW, cw = cap.offsetWidth, ch = cap.offsetHeight;
    const pad = narrow ? 14 : Math.max(24, vw*0.03), top = narrow ? 64 : 92, bot = narrow ? 14 : 24;
    return narrow ? [{ x:pad, y:vh - ch - bot, r:0.6 }, { x:pad, y:top, r:-0.8 }]
      : [{ x:pad, y:top, r:-1.4 }, { x:vw - cw - pad, y:top, r:1.2 }, { x:vw - cw - pad, y:vh - ch - bot, r:-1.0 }, { x:pad, y:vh - ch - bot, r:1.1 }];
  }
  let mcCam = null;
  function slotForGroup(g){
    const vw = window.innerWidth, vh = window.innerHeight, cw = cap.offsetWidth, ch = cap.offsetHeight;
    const slots = slotsNow(), score = slots.map(() => 0);
    const caps = IN.CAPS.map((C, k) => k).filter(k => groupOf(k) === g);
    const last = caps[caps.length - 1], after = IN.CAPS[last + 1];
    const km0 = IN.CAPS[caps[0]].km, km1 = after ? after.km : (T() ? T().km : km0 + 4);
    MC.gk0 = km0; MC.gk1 = km1;
    const { THREE } = A;
    if(!mcCam) mcCam = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    const v = new THREE.Vector3();
    const hit = (wx, wy, wz, wgt, rad) => {
      v.set(wx, wy, wz).project(mcCam); if(v.z > 1) return;
      const sx = (v.x + 1)*0.5*vw, sy = (1 - v.y)*0.5*vh;
      slots.forEach((S2, k) => { if(sx > S2.x - rad && sx < S2.x + cw + rad && sy > S2.y - rad && sy < S2.y + ch + rad) score[k] += wgt; });
    };
    // each stretch of the group from its own settled camera: the hiker all along his walk there, and its pieces
    const panels = [...new Set(caps.map(capPanel))];
    for(const pi of panels){
      const Pz = A.POSES && A.POSES[pi + 1]; if(!Pz) continue;
      mcCam.fov = Pz.fov; mcCam.aspect = vw/vh; mcCam.updateProjectionMatrix();
      mcCam.position.copy(Pz.pos); mcCam.lookAt(Pz.tgt); mcCam.updateMatrixWorld();
      for(let q = 0; q <= 16; q++){
        const at = onRoute(lerp(km0, km1, q/16), 0); if(at.i !== pi) continue;
        const F = A.FRAME[at.i]; if(!F) continue;
        for(const yy of [0.05, 0.3, 0.55]){ v.set(at.lx, yy, at.z); F.localToWorld(v); hit(v.x, v.y, v.z, 6, 30); }
      }
      for(const q of PROPS){
        if(q.i !== pi) continue;
        const F = A.FRAME[q.i]; if(!F) continue;
        // the trail sign carries the stretch's numbers: the card never sits on it
        if(q.kind === 'sign'){ for(const yy of [0.25, 0.6, 0.95]){ v.set(q.lx, q.h*yy, q.z); F.localToWorld(v); hit(v.x, v.y, v.z, 40, 40); } continue; }
        v.set(q.lx, q.h*0.6, q.z); F.localToWorld(v); hit(v.x, v.y, v.z, Math.min(3, q.w*q.h*4 + 0.5), 10);
      }
    }
    // a new group moves; the last one prefers the nearest corner, a short move
    const cx = (S2) => S2.x + cw*0.5, cy = (S2) => S2.y + ch*0.5, diag = Math.hypot(vw, vh);
    const cur = MC.slot >= 0 && MC.slot < slots.length ? slots[MC.slot] : null;
    let best = -1, bestV = Infinity;
    slots.forEach((S2, k) => {
      if(cur && k === MC.slot && slots.length > 1) return;
      const travel = cur ? Math.hypot(cx(S2) - cx(cur), cy(S2) - cy(cur))/diag : 0;
      const val = score[k] + travel*(g === 2 ? 8 : 0.5);
      if(val < bestV - 0.01){ bestV = val; best = k; }
    });
    MC.slot = best < 0 ? 0 : best;
    return slots[MC.slot];
  }
  let capTl = null;
  // the landing beat (the first caption, panel 1 in frame) on a wide screen: the room falls dark at the left edge
  // behind the type, where the open cover's legend page is cut by the frame mid-word (round 0's broken frame)
  let capShade = null;
  function showCaption(n){
    void capShade;
    if(!cap || n === capI) return;
    const G = A.gsap, k = A.REDUCED ? 0 : 1, was = capI;
    capI = n;
    if(capTl) capTl.kill();
    // the reveal's own tweens are not part of capTl: stop them too, or a scroll back up just as a caption came in let
    // them finish after the exit and leave the caption over the hero's headline (V6, Sam: "the text content of that track
    // is overlaying our hero headline")
    G.killTweensOf(cap.querySelectorAll('h2 .ln > span, .fx'));
    capTl = G.timeline();
    if(was >= 0){
      capTl.to(cap.querySelectorAll('h2 .ln > span'), { yPercent:-MASK_Y, duration:0.4*k, ease:'power2.in' }, 0)
        .to(cap.querySelectorAll('.fx'), { autoAlpha:0, y:-8, duration:0.3*k, ease:'power2.in' }, 0);
    }
    if(n < 0){ MC.group = -1; MC.slot = -1; const mi = cap.querySelector('.mc-in'); if(mi) capTl.to(mi, { autoAlpha:0, y:10, duration:0.35*k, ease:'power2.in' }, 0.1); return; }
    capTl.add(() => {
      fill(n);
      // a new group of stretches finds its place, with its new words in it; inside a group the card stays put (it only
      // settles its height against the bottom edge if it sits there) and floats (IN.frame)
      const g = groupOf(n), first = was < 0 || MC.group < 0, moved = first || g !== MC.group;
      let sl;
      if(moved){ MC.group = g; sl = slotForGroup(g); }
      else sl = slotsNow()[MC.slot] || slotsNow()[0];
      cap.querySelector('.mc-in').style.setProperty('--rot', sl.r + 'deg');
      if(first || k === 0){ G.set(cap, { x:sl.x, y:sl.y }); }
      else if(moved) G.to(cap, { x:sl.x, y:sl.y, duration:1.4, ease:'power3.inOut' });
      else G.to(cap, { x:sl.x, y:sl.y, duration:0.8, ease:'power2.out' });
      if(first && k) G.fromTo(cap.querySelector('.mc-in'), { y:18, autoAlpha:0 }, { y:0, autoAlpha:1, duration:0.9, ease:'back.out(1.6)' });
      else G.set(cap.querySelector('.mc-in'), { autoAlpha:1, y:0 });
      G.set(cap.querySelectorAll('h2 .ln > span'), { yPercent:MASK_Y });
      G.to(cap.querySelectorAll('h2 .ln > span'), { yPercent:0, duration:1.2*k, ease:'expo.out' });
      G.fromTo(cap.querySelectorAll('.fx'), { autoAlpha:0, y:12 }, { autoAlpha:1, y:0, duration:0.85*k, stagger:0.08, delay:0.12*k, ease:'power3.out' });
    });
  }

  /* ============================================================
     every update, after the page has posed the map and its springs
     ============================================================ */
  IN.frame = function(dt, t, p, R, settle){
    if(!A) return;
    const h = Math.min(0.034, dt || 0.016), fast = settle || A.REDUCED;
    if(lamp){
      // through the cut the hero's lamp fades out as this one comes up, on the hero's own curve
      // (the hero hands the curve over: HK.lampIn)
      const hx = A.HK ? A.HXS.s : 1;
      const k = A.HK && A.HK.lampIn ? A.HK.lampIn(hx) : 1;
      lamp.position.copy(A.CAMS.tgt).add(IN.keyOff);
      lamp.target.position.copy(A.CAMS.tgt); lamp.target.position.x -= 1.3; lamp.target.position.z -= 0.2; lamp.target.position.y = 0;
      lamp.intensity = LAMP_I[mode]*k;
      lamp.shadow.autoUpdate = k > 0;
    }
    // the panels you have walked stay built: their models and pieces keep standing, only their backdrop
    // ranges fold away with the page's own spring as you move on
    const FS = (i) => (R > i + 1.2 && p < 0.93) ? 1 : A.SCENES[i].F;
    // the models: the low cards stand first and lift everything above them
    for(const M of MODEL){
      if(!M || !M.built) continue;
      const F = FS(M.i), n = M.levels;
      let sum = 0;
      for(const c of M.cards){
        const d = c.k/(n + 6), e = smooth(clamp01((F*1.25 - d)/0.35));
        if(fast){ c.sp.p = e; c.sp.v = 0; }
        else { c.sp.v += ((e - c.sp.p)*150 - c.sp.v*12)*h; c.sp.p += c.sp.v*h; if(c.sp.p < 0){ c.sp.p = 0; c.sp.v = 0; } }
        sum += c.sp.p;
      }
      let y = 0, k = 0;
      const first = M.cards[0] ? M.cards[0].sp.p : 0;
      for(const c of M.cards){
        while(k < c.k){ y += STK.ch*first; k++; }
        const s = Math.max(0.001, c.sp.p); c.grp.position.y = y; c.grp.scale.y = s; c.grp.visible = c.sp.p > 0.004; y += s*STK.ch; k++;
        const o = smooth(clamp01(c.sp.p/0.35));
        if(Math.abs(o - c.o) > 0.004 || (o === 1 && c.o !== 1)){ c.o = o; for(const m of c.mats){ m.opacity = o; m.transparent = o < 1; } }
      }
      M.lift = M.cards.length ? sum/M.cards.length : 0;
      const rm = A.ROUTE_MESH[M.i]; if(rm && rm.userData.u) rm.userData.u.uLift.value = M.lift;
    }
    // the hiker: where he is, his km, and the step he stands on
    const S0 = A.routeAt(p), pt = A.ROUTE.at(S0), hi = panelOf(pt.x), km = IN.R.kmAt(S0);
    const want = MODEL[hi] ? topAt(hi, pt.x - hi*PW, pt.z)*MODEL[hi].lift : 0;
    if(fast){ HY.p = want; HY.v = 0; } else { HY.v += ((want - HY.p)*220 - HY.v*18)*h; HY.p += HY.v*h; }
    // the scenery
    for(const q of PROPS){
      const F = FS(q.i);
      let on = false;
      if(q.trig === 'F') on = F > q.delay + 0.08;
      else if(q.trig === 'near') on = F > 0.35 && S0 > q.s - q.lead;
      else if(q.trig === 'after') on = F > 0.35 && S0 > q.s + 0.04;
      else if(q.trig === 'end') on = F > 0.35 && km > q.km;
      // after a hero landing the trail sign stands last, once the camera is back up: the reveal of the numbers,
      // and never in the way of the camera coming down to the hiker (V5, Eye Level)
      if(q.kind === 'sign' && A.HK && A.HK.stand0 && A.HK.stand0() > 0 && A.HXS.s < 0.97) on = false;
      const target = on ? q.stand : q.lie;
      if(fast){ q.sp.p = target; q.sp.v = 0; }
      else { q.sp.v += ((target - q.sp.p)*(on ? 120 : 70) - q.sp.v*(on ? 9 : 12))*h; q.sp.p += q.sp.v*h; }
      q.grp.rotation.x = q.sp.p;
      const M = MODEL[q.i];
      if(q.foot === undefined){
        q.foot = 0;
        if(q.lie > -HALF_PI - 0.01 && q.stand < -0.5){ const rr = Math.max(q.w, q.h)*0.6; for(const d of [[0,0],[rr,0],[-rr,0],[0,rr],[0,-rr],[rr*0.7,rr*0.7],[-rr*0.7,rr*0.7],[rr*0.7,-rr*0.7],[-rr*0.7,-rr*0.7]]) q.foot = Math.max(q.foot, topAt(q.i, q.lx + d[0], q.z + d[1])); }
        else q.foot = topAt(q.i, q.lx, q.z);
      }
      q.grp.position.y = (M ? q.foot*M.lift : 0) + 0.004;
      const up = clamp01(1 - Math.abs(q.sp.p - q.stand)/HALF_PI);
      if(q.bob && !A.REDUCED){ q.mesh.position.y = q.h*0.5 + Math.sin(t*1.1 + q.phase)*0.04*q.bob*up; q.mesh.rotation.z = Math.sin(t*0.7 + q.phase)*0.03*q.bob*up; }
      if(q.slide){
        const st = on ? 0 : q.slide;
        if(fast){ q.sl.p = st; q.sl.v = 0; } else { q.sl.v += ((st - q.sl.p)*28 - q.sl.v*9)*h; q.sl.p += q.sl.v*h; }
        q.mesh.position.x = q.sl.p;
      }
      if(q.unroll){
        const ut = on ? 1 : 0;
        if(fast){ q.ur.p = ut; q.ur.v = 0; } else { q.ur.v += ((ut - q.ur.p)*60 - q.ur.v*11)*h; q.ur.p += q.ur.v*h; }
        q.mesh.scale.x = Math.max(0.001, q.ur.p); q.mesh.position.x = q.w*0.5*Math.max(0.001, q.ur.p);
      }
      q.on = on;
      q.grp.visible = on || Math.abs(q.sp.p - q.lie) > 0.012 || (q.unroll && q.ur.p > 0.01);
    }
    for(let i=0;i<NP;i++){ const sc = A.SCENES[i]; for(const L of sc.sheets) L.mesh.visible = sc.F > 0.004 || L.sp.p > -HALF_PI + 0.012; }
    // the caption for the stretch the hiker is on
    let n = -1;
    // after the hero's landing the first caption also comes in once panel 1 stands (V5, Eye Level)
    const landed = A.HK && A.HK.stand0 && A.HK.stand0() > 0.55 && A.HXS.s > 0.93;   // not over the cream close-up, where it washes out
    if((p > 0.104 || landed) && p < 0.84 && IN.CAPS) for(let c=0;c<IN.CAPS.length;c++) if(km >= IN.CAPS[c].km) n = c;
    showCaption(n);
    if(n >= 0 && cap && MC.cv) mcDraw(hi, pt, S0);
    if(MC.fl){
      if(A.REDUCED){ if(MC.fl.style.transform) MC.fl.style.transform = ''; }
      else {
        const gp = clamp01((km - MC.gk0)/Math.max(0.1, MC.gk1 - MC.gk0));
        const fy = Math.sin(t*0.8)*4 - (gp - 0.5)*18, fr = Math.sin(t*0.55 + 1.3)*0.6 + (gp - 0.5)*0.8;
        MC.fl.style.transform = 'translate3d(0,' + fy.toFixed(2) + 'px,0) rotate(' + fr.toFixed(3) + 'deg)';
      }
    }
    // and while the hero owns the screen, before its landing, the caption is not on it at all, whatever its tweens are
    // doing (V6: the landing's caption was left over the hero's headline after a scroll back up)
    const off = !!(A.HK && A.HXS && A.HXS.s < 0.9);
    if(cap && off !== capOff){ capOff = off; cap.style.visibility = off ? 'hidden' : ''; }
  };

  window.INTERIOR_STATE = { MODEL, PROPS, STK, IN, get lamp(){ return lamp; } };
  return IN;
}

window.INTERIOR = { create, MODES };
})();
