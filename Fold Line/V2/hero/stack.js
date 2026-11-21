/* ============================================================
   FIVE HUTS V2 . HERO OPTION "stack" . CONTOUR STACK
   A museum terrain model standing on the cover of map No. 01: one ivory card per
   contour, cut from the real elevation grid, under a low sun that follows the cursor.
   Hover reads the contour under the pointer and inks it red. The 01 to 05 index deals that
   trek's own pocket map cover onto No. 01 and rebuilds the model on it.
   Scroll and the model becomes the map: the cards sink top-down, each one settling
   onto its own printed contour line, until only the printed cover is left.

   How it is made, in short:
   - every card of a mountain is merged into ONE geometry (caps and cut walls), with a
     per-vertex card index. a small uniform table per card (base, thickness, offset, spin,
     fade, glow) moves each card in the vertex shader, so a whole cascade is one draw call
   - a 128 x 128 height texture of the same real grid lets the fragment shader find the
     distance to each card's own contour: the contact shadow at the foot of every card,
     the light cut edge, and the contour line a card turns into when it lies flat
   - V1's key light is borrowed as the sun, so there is one shadow map and no recompile

   Classic script. Registers window.HERO_OPTIONS.stack.
   ============================================================ */
(function(){
'use strict';
window.HERO_OPTIONS = window.HERO_OPTIONS || {};

window.HERO_OPTIONS.stack = function(kit){
const { THREE, gsap } = kit;
const V2 = kit.V2, TREKS = kit.TREKS, KEYS = kit.KEYS;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const seg = (v, a, b) => clamp01((v - a)/(b - a));
const sm = (t) => t*t*(3 - 2*t);
const lerp = (a, b, t) => a + (b - a)*t;
const eio = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
const eo3 = (t) => 1 - Math.pow(1 - t, 3);
const D2R = Math.PI/180;
const NOW = () => gsap.ticker.time;
const DBG = !!kit.DEBUG, RED_M = !!kit.REDUCED;

/* ============================================================
   KNOBS
   ============================================================ */
const KN = {
  SIZE: 7.2,                        // the crop's full width on the cover, world units
  CTR: [kit.PW*0.5, 0.864],         // where the crop's centre sits on the cover (x, z)
  PLINTH: [0.012, 0.118, 0.975, 0.882], // (unused now that the other four stand on their own covers)
  NL: 28,                           // most cards one model can have (shader table size)
  SUN_I: 5.2,                       // the sun, at full
  SUN_REST: [105, 21],              // azimuth from north (east +), elevation, with no cursor yet: low from the east
  SUN_AZ: [235, 80], SUN_EL: [34, 18], // cursor left: sun from the left (south west), cursor right: from the right (east)
  SUN_K: 7.5, SUN_C: 4.3,           // the sun's spring. a little heavy, a little overshoot
  LIFT: 0.06, GLOW: 0.16,           // hover: how far the card lifts, how much it glows
  DROP: 0.95,                       // how high a card falls from
  DROP_K: 230, DROP_C: 15,          // the landing spring
  PLATE_Y: 0.02,                    // a dealt cover lies this far above No. 01's
  PLATE_WARP: 0.003,
  MIN_T: 0.0012,                    // a flattened card keeps this much, so nothing z-fights
  LINE_PX: 1.45,                     // a flat card's contour line, px inside its edge
  CAM_EL: 45, CAM_YAW: 18
};
// one card per contour step. every step is a multiple of the interval the cover prints
// win: the model's square cut in crop u, v. Everest reaches west to take in Kala Patthar
const SPEC = {
  tongariro:{ step:50,  ve:1.5 },
  inca:     { step:50,  ve:1 },
  torres:   { step:100, ve:1 },
  kili:     { step:200, ve:1.5 },
  everest:  { step:200, ve:1, win:[0.024, 0.135, 0.93, 0.865] }
};
// the readout's number for each model. it has to be a number TREKS prints: the trek's landmark
// summit when it has one (Ngāuruhoe, sourced in data/treks.md), else the highest marked height
// inside the cut
function parseMark(mk){
  const r = /^(.*?)[\s\u00A0]+([\d\s\u00A0]+)$/.exec(mk.label || '');
  return r ? { name:r[1].trim(), m:+r[2].replace(/\D/g, '') } : { name:String(mk.label || '').trim(), m:null };
}
const inWin = (q, W, e) => q[0] > W[0] + (e || 0) && q[0] < W[2] - (e || 0) && q[1] > W[1] + (e || 0) && q[1] < W[3] - (e || 0);
function summitOf(info){
  const i = info.i, key = KEYS[i], T = TREKS[i] || {}, g = info.g;
  if(T.summit && T.summit.m) return { name:String(T.summit.name).toUpperCase(), m:T.summit.m };
  let best = null;
  for(const mk of T.marks || []){
    const p = parseMark(mk); if(!p.m) continue;
    if(!inWin(g.uv(mk.lat, mk.lon), info.win)) continue;
    if(!best || p.m > best.m) best = p;
  }
  const top = info.L0 + (info.n - 1)*info.step;
  if(best && best.m >= top - 2*info.step) return best;
  // no printed height near the top of this model: say the top card's contour, and say that it is one
  return { name:String(g.peak || T.name).toUpperCase(), m:top, contour:true };
}
const COVER_Y = 2*kit.COVER_H + 0.001;      // the cover's top face when the map is shut
const S = KN.SIZE;
const DEF_WIN = [0.07, 0.135, 0.93, 0.865];
const plateSeed = (i) => 9.1 + i*2.3;
// kit.brand is copied by Object.assign while still null, so read the name the way the kit does
const brandOf = () => kit.brand || kit.NAMES[(kit.Q.get('name') || '').replace(/[^a-z]/g, '')] || kit.NAMES.hachure;
const boxOf = (W) => new THREE.Vector4((W[0] - 0.5)*S, (W[1] - 0.5)*S, (W[2] - 0.5)*S, (W[3] - 0.5)*S);

/* ============================================================
   the card material. MeshStandardMaterial so it keeps real light and real shadows,
   with the card table, the contact shadow and the contour line grafted in
   ============================================================ */
const GL_V = `
#define NL ${KN.NL}
uniform vec4 uA[NL];
uniform vec4 uB[NL];
uniform vec4 uC[NL];
uniform vec4 uCover;
uniform vec4 uWF;
uniform float uN;
attribute vec2 aL;
float sxWarp(vec2 w){
  float x = w.x - uWF.w, y = -w.y;
  return uCover.z*( sin(x*uWF.x + uCover.w)*0.55 + sin(y*uWF.y + uCover.w*1.7)*0.35 + sin((x + y)*uWF.z + uCover.w*2.3)*0.25 );
}
mat3 sxRot(float a, float t){
  float ca = cos(a), sa = sin(a), ct = cos(t), st = sin(t);
  return mat3(ca, 0.0, -sa, 0.0, 1.0, 0.0, sa, 0.0, ca) * mat3(1.0, 0.0, 0.0, 0.0, ct, st, 0.0, -st, ct);
}
`;
const GL_SETUP = `
int sxI = int(aL.x + 0.5);
vec4 sxA = uA[sxI];
vec4 sxB = uB[sxI];
vec4 sxC = uC[sxI];
mat3 sxR = sxRot(sxB.w, sxC.y);
`;
const GL_POS = `
vec3 transformed = vec3(position.x, sxA.x + position.y*sxA.y, position.z);
vec3 sxP = vec3(0.0, sxA.x + 0.5*sxA.y, 0.0);
transformed = sxR*(transformed - sxP) + sxP + sxB.xyz;
transformed.y += sxWarp(uCover.xy + position.xz);
`;
const GL_F = `
uniform sampler2D uH;
uniform vec4 uHm;
uniform vec4 uWin;
uniform vec4 uFld;
uniform vec4 uLev;
uniform vec4 uLine;
uniform vec3 uCa;
uniform vec3 uCb;
uniform vec3 uInk;
uniform vec3 uIvo;
uniform vec3 uGlowC;
uniform vec3 uRed;
varying vec4 vSxL;
varying vec3 vSxM;
varying vec2 vSxK;
float sxHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
float sxNoise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(sxHash(i), sxHash(i + vec2(1.0, 0.0)), u.x), mix(sxHash(i + vec2(0.0, 1.0)), sxHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float sxH(vec2 m){
  vec2 uv = m/uHm.z + 0.5;
  vec2 tc = (uv*(uHm.w - 1.0) + 0.5)/uHm.w;
  return mix(uHm.x, uHm.y, texture2D(uH, tc).r);
}
float sxBox(vec2 m, vec4 b){ return min(min(m.x - b.x, b.z - m.x), min(m.y - b.y, b.w - m.y)); }
`;
const GL_CARD = `
float sxk = vSxK.x;
vec2 sxm = vSxM.xy;
float sxh = sxH(sxm);
float sxe = 0.016;
vec2 sxg = vec2(sxH(sxm + vec2(sxe, 0.0)) - sxH(sxm - vec2(sxe, 0.0)), sxH(sxm + vec2(0.0, sxe)) - sxH(sxm - vec2(0.0, sxe)))/(2.0*sxe);
float sxgl = max(length(sxg), 40.0);
float sxL = uLev.x + sxk*uLev.y;
bool sxPl = uLev.z > 0.5 && sxk < 0.5;
float sxC = (sxh - sxL)/sxgl;
float sxWi = sxBox(sxm, uWin);
float sxIn = sxPl ? sxBox(sxm, uFld) : min(sxC, sxWi);
float sxUp = sxPl ? max(-sxWi, 0.0) : (sxL + uLev.y - sxh)/sxgl;
float sxFw = max(fwidth(sxC), 1e-5);
float sxPx = sxC/sxFw;
float sxLn = 1.0 - smoothstep(uLine.y - 0.75, uLine.y + 0.75, sxPx);
vec3 sxCol = mod(sxk + 0.5, 2.0) < 1.0 ? uCa : uCb;
float sxF = sxNoise(sxm*vec2(160.0, 24.0))*0.6 + sxNoise(sxm*vec2(21.0, 170.0))*0.4;
sxCol *= 1.0 + (sxF - 0.5)*0.055;
float sxAl = vSxL.y;
float sxFl = vSxL.x;
if(vSxK.y < 0.5){
  float sxAo = 1.0 - vSxL.w*(0.30*(1.0 - smoothstep(0.0, 0.11, sxUp)) + 0.16*(1.0 - smoothstep(0.0, 0.02, sxUp)));
  float sxRim = 1.0 - smoothstep(0.0, 0.012, sxIn);
  sxCol = sxCol*sxAo + vec3(0.06, 0.055, 0.045)*sxRim*(1.0 - sxFl);
  vec3 sxLc = mix(uInk, uIvo, uLev.w);
  sxCol = mix(sxCol, sxLc, sxFl*sxLn);
  sxAl *= mix(1.0, sxLn*uLine.x, sxFl);
  // hover: the card's own contour line inks up in the route red
  float sxHl = (1.0 - smoothstep(1.4, 2.9, sxPx))*step(-0.5, sxPx);
  sxCol = mix(sxCol, uRed*1.15, sxHl*vSxL.z*(1.0 - sxFl));
} else {
  float sxT = vSxM.z;
  sxCol *= 0.83*mix(0.55, 1.0, smoothstep(0.0, 0.26, sxT));
  sxCol *= mix(1.0, 1.12, smoothstep(0.80, 1.0, sxT));
  sxAl *= 1.0 - sxFl;
}
diffuseColor = vec4(sxCol, sxAl);
if(sxAl < 0.004) discard;
`;

function makeMats(info, htex){
  const NL = KN.NL, g = info.g;
  const lin = (hex) => new THREE.Color(hex);
  const U = {
    uA:{ value:new Float32Array(NL*4) }, uB:{ value:new Float32Array(NL*4) }, uC:{ value:new Float32Array(NL*4) },
    // the sheet the model stands on, and its warp: No. 01 (V1 makePaper: warp 0.01, seed 9.1) or a dealt cover
    uCover:{ value:info.plate ? new THREE.Vector4(KN.CTR[0], KN.CTR[1], KN.PLATE_WARP, plateSeed(info.i)) : new THREE.Vector4(KN.CTR[0], KN.CTR[1], 0.01, 9.1) },
    uWF:{ value:new THREE.Vector4(0.3, 0.26, 0.18, kit.PW*0.5) },                // and its warp frequencies
    uN:{ value:info.n },
    uH:{ value:htex }, uHm:{ value:new THREE.Vector4(g.lo, g.hi, S, g.N) },
    uWin:{ value:boxOf(info.win) }, uFld:{ value:boxOf(KN.PLINTH) },
    uLev:{ value:new THREE.Vector4(info.L0, info.step, info.plinth ? 1 : 0, 0) },
    uLine:{ value:new THREE.Vector4(1, KN.LINE_PX, 0, 0) },
    uCa:{ value:lin(V2.card) }, uCb:{ value:lin('#ECE5D8') }, uInk:{ value:lin('#3A3F48') }, uIvo:{ value:lin(V2.ivory) },
    uGlowC:{ value:lin('#FFD7A0').multiplyScalar(KN.GLOW) }, uRed:{ value:lin(V2.red) }
  };
  const mat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.9, metalness:0, transparent:true });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + GL_V + 'varying vec4 vSxL;\nvarying vec3 vSxM;\nvarying vec2 vSxK;\n')
      .replace('#include <beginnormal_vertex>', GL_SETUP + 'vec3 objectNormal = sxR*vec3(normal);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(tangent.xyz);\n#endif\n')
      .replace('#include <begin_vertex>', GL_POS +
        'int sxNx = sxI + 1 < NL ? sxI + 1 : NL - 1;\n' +
        'float sxUpC = (aL.x + 1.0 < uN) ? uC[sxNx].z : 0.0;\n' +
        'vSxL = vec4(sxA.z, sxA.w, sxC.x, sxUpC);\nvSxM = vec3(position.x, position.z, position.y);\nvSxK = aL;\n');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + GL_F)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GL_CARD)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlowC*vSxL.z;\n');
  };
  mat.customProgramCacheKey = () => 'stack-card';
  const depth = new THREE.MeshDepthMaterial({ depthPacking:THREE.RGBADepthPacking });
  depth.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + GL_V + 'varying float vSxD;\n')
      .replace('#include <begin_vertex>', GL_SETUP + GL_POS + 'vSxD = sxA.w*(1.0 - sxA.z);\n');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vSxD;\nfloat sxDh(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453); }\n')
      .replace('#include <clipping_planes_fragment>', 'if(vSxD < sxDh(gl_FragCoord.xy)) discard;\n#include <clipping_planes_fragment>');
  };
  depth.customProgramCacheKey = () => 'stack-card-depth';
  return { mat, depth, U };
}

/* ============================================================
   the cards. one level a step, so a new mountain can be cut over several frames
   ============================================================ */
function modelInfo(i){
  const key = KEYS[i], g = kit.terrain(key), sp = SPEC[key], W = sp.win || DEF_WIN;
  const mPerU = g.km*1000/S;
  let mn = 1e9, mx = -1e9, mu = 0.5, mv = 0.5;
  for(let j=0;j<=96;j++) for(let q=0;q<=96;q++){
    const u = W[0] + (W[2] - W[0])*q/96, v = W[1] + (W[3] - W[1])*j/96, h = g.at(u, v);
    if(h < mn) mn = h;
    if(h > mx){ mx = h; mu = u; mv = v; }
  }
  // the lowest card is the highest contour at or under the lowest ground in the cut, so it is whole
  // (and never under the grid's own floor: the kit's contour tracer finds nothing below lo)
  const L0 = Math.max(Math.floor(mn/sp.step)*sp.step, Math.ceil((g.lo + 1)/sp.step)*sp.step);
  const n = Math.min(KN.NL, Math.floor((mx - L0)/sp.step) + 1);
  const T = TREKS[i] || {}, mark = (T.marks || []).find(m => m.red);
  let pin = null;
  if(mark){
    const q = g.uv(mark.lat, mark.lon), pm = parseMark(mark);
    if(inWin(q, W, 0.004)){
      const high = T.high && pm.m && pm.m === T.high.m;
      pin = { u:q[0], v:q[1], label:pm.name, m:pm.m, sub:high ? (i === 0 ? 'HIGH POINT OF THE CROSSING' : 'HIGH POINT OF THE TREK') : 'ON THE ROUTE' };
    }
  }
  const info = { i, key, g, win:W, step:sp.step, ve:sp.ve, mPerU, thick:sp.step/mPerU*sp.ve, L0, n, plinth:false, plate:i !== 0, mx, mu, mv, pin };
  info.summit = summitOf(info);
  return info;
}
function rectShape(F){
  const x0 = (F[0] - 0.5)*S, x1 = (F[2] - 0.5)*S, y0 = -(F[1] - 0.5)*S, y1 = -(F[3] - 0.5)*S;
  return new THREE.Shape([new THREE.Vector2(x0, y1), new THREE.Vector2(x1, y1), new THREE.Vector2(x1, y0), new THREE.Vector2(x0, y0)]);
}
function clean(pts){
  const o = [];
  for(const p of pts){ const q = o[o.length - 1]; if(!q || Math.abs(q.x - p.x) + Math.abs(q.y - p.y) > 1e-6) o.push(p); }
  while(o.length > 2 && Math.abs(o[0].x - o[o.length-1].x) + Math.abs(o[0].y - o[o.length-1].y) < 1e-6) o.pop();
  return o;
}
function* cutGen(info){
  const P = [], N = [], A = [], I = [];
  let vc = 0, made = 0;
  // the other treks stand on their own pocket map cover, dealt on top of No. 01
  if(info.plate && !info.coverCanvas){ info.coverCanvas = kit.drawCover(info.i, brandOf(), 600, 800); yield -1; }
  function wall(r, k, hole){
    const n = r.length; if(n < 3) return;
    let a2 = 0;
    for(let i=0;i<n;i++){ const p = r[i], q = r[(i+1)%n]; a2 += p.x*(-q.y) - q.x*(-p.y); }
    const sg = (a2 > 0 ? 1 : -1)*(hole ? -1 : 1);
    const nx = new Float32Array(n), nz = new Float32Array(n);
    for(let i=0;i<n;i++){
      const p = r[i], q = r[(i+1)%n], dx = q.x - p.x, dz = -q.y + p.y, l = Math.hypot(dx, dz) || 1;
      nx[i] = sg*dz/l; nz[i] = -sg*dx/l;
    }
    for(let i=0;i<n;i++){
      const j = (i+1)%n, ip = (i - 1 + n)%n, p = r[i], q = r[j];
      let ax = nx[i], az = nz[i], bx = nx[i], bz = nz[i];
      if(nx[ip]*nx[i] + nz[ip]*nz[i] > 0.74){ ax = nx[ip] + nx[i]; az = nz[ip] + nz[i]; const l = Math.hypot(ax, az); ax /= l; az /= l; }
      if(nx[j]*nx[i] + nz[j]*nz[i] > 0.74){ bx = nx[j] + nx[i]; bz = nz[j] + nz[i]; const l = Math.hypot(bx, bz); bx /= l; bz /= l; }
      const v = vc;
      P.push(p.x, 0, -p.y, q.x, 0, -q.y, q.x, 1, -q.y, p.x, 1, -p.y);
      N.push(ax, 0, az, bx, 0, bz, bx, 0, bz, ax, 0, az);
      A.push(k, 1, k, 1, k, 1, k, 1);
      vc += 4;
      const dx = q.x - p.x, dz = -q.y + p.y;
      if(-dz*nx[i] + dx*nz[i] > 0) I.push(v, v+1, v+2, v, v+2, v+3); else I.push(v, v+2, v+1, v, v+3, v+2);
    }
  }
  for(let k=0;k<info.n;k++){
    const L = info.L0 + k*info.step;
    const shapes = (k === 0 && info.plinth) ? [rectShape(KN.PLINTH)] : kit.levelShapes(THREE, info.key, L, S, { smooth:1, win:info.win });
    let any = false;
    for(const sh of shapes){
      const ex = sh.extractPoints(1);
      const outer = clean(ex.shape), holes = ex.holes.map(clean).filter(h => h.length >= 3);
      if(outer.length < 3) continue;
      any = true;
      const tris = THREE.ShapeUtils.triangulateShape(outer, holes);
      const pts = outer.concat(...holes), b = vc;
      for(const p of pts){ P.push(p.x, 1, -p.y); N.push(0, 1, 0); A.push(k, 0); vc++; }
      for(const t of tris){
        const a = pts[t[0]], c1 = pts[t[1]], c2 = pts[t[2]];
        const ny = (-c1.y + a.y)*(c2.x - a.x) - (c1.x - a.x)*(-c2.y + a.y);
        if(ny >= 0) I.push(b + t[0], b + t[1], b + t[2]); else I.push(b + t[0], b + t[2], b + t[1]);
      }
      wall(outer, k, false);
      holes.forEach(h => wall(h, k, true));
    }
    if(!any) break;
    made = k + 1;
    yield k;
  }
  if(made !== info.n){ info.n = made; info.summit = summitOf(info); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.setAttribute('aL', new THREE.Float32BufferAttribute(A, 2));
  geo.setIndex(vc > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
  geo.boundingSphere = new THREE.Sphere(V3(0, 1, 0), 8);
  return geo;
}
function heightTex(key){
  const c = window.TERRAIN[key].crop, raw = atob(c.bytes), n = c.n, d = new Uint8Array(n*n);
  for(let q=0;q<n*n;q++) d[q] = raw.charCodeAt(q);
  const t = new THREE.DataTexture(d, n, n, THREE.RedFormat, THREE.UnsignedByteType);
  t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.unpackAlignment = 1; t.needsUpdate = true;
  return t;
}

/* ---- the pin: a red head on a steel needle, standing on the card it belongs to ---- */
const PIN_H = 0.40, PIN_R = 0.05;
const pinNeedleGeo = new THREE.CylinderGeometry(0.0075, 0.005, PIN_H, 8, 1).translate(0, PIN_H*0.5, 0);
const pinHeadGeo = new THREE.SphereGeometry(PIN_R, 22, 14);
const pinNeedleMat = new THREE.MeshStandardMaterial({ color:0xC9C3B6, roughness:0.32, metalness:0.75 });
const pinHeadMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(V2.red), roughness:0.42, metalness:0 });
function makePin(){
  const g = new THREE.Group();
  const needle = new THREE.Mesh(pinNeedleGeo, pinNeedleMat), head = new THREE.Mesh(pinHeadGeo, pinHeadMat);
  head.position.y = PIN_H;
  needle.castShadow = head.castShadow = true; needle.receiveShadow = head.receiveShadow = true;
  g.add(needle); g.add(head); g.visible = false;
  kit.scene.add(g);
  return { g, needle, head, y:0, v:0, on:false, rel:Infinity };
}

/* ============================================================
   a model: geometry, material, the per-card state, its pin
   ============================================================ */
const CACHE = {};                     // trek 01 stays cut: the exit always comes back to it
function makeModel(info, geo){
  const htex = CACHE[info.i] && CACHE[info.i].htex || heightTex(info.key);
  const { mat, depth, U } = makeMats(info, htex);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.customDepthMaterial = depth; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  mesh.position.set(KN.CTR[0], COVER_Y + (info.plate ? KN.PLATE_Y : 0), KN.CTR[1]);
  mesh.renderOrder = 2;
  kit.scene.add(mesh);
  let plate = null;
  if(info.plate){
    const cv = info.coverCanvas || kit.drawCover(info.i, brandOf(), 600, 800);
    const shape = kit.shapeCanvas(135, 180, (a, w, h) => { a.fillRect(1.5, 1.5, w - 3, h - 3); }, 1.6);
    const paper = kit.makePaper({ colour:cv, shape, aspect:kit.PW/kit.PD, seed:plateSeed(info.i), deckle:0.003, rim:0.3, contact:0, fibre:0.05,
      warp:KN.PLATE_WARP, warpF:[0.3, 0.26, 0.18], side:THREE.FrontSide });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(kit.PW, kit.PD, 8, 10), paper.mat);
    pm.customDepthMaterial = paper.depth; pm.castShadow = true; pm.receiveShadow = true;
    pm.rotation.x = -Math.PI*0.5;
    const g = new THREE.Group(); g.add(pm); g.visible = false;
    kit.scene.add(g);
    plate = { g, pm, paper, tin:Infinity, tout:Infinity };
  }
  const L = [];
  for(let k=0;k<info.n;k++) L.push({ k, rel:Infinity, on:false, a:0, y:0, v:0, ly:0, lv:0, glow:0, fly:null, dropH:KN.DROP });
  const M = { info, geo, htex, mat, depth, U, mesh, L, pin:null, plate, gone:false, landedAt:Infinity };
  if(info.pin){
    M.pin = makePin();
    const h = info.g.at(info.pin.u, info.pin.v);
    M.pin.k = Math.max(0, Math.min(info.n - 1, Math.floor((h - info.L0)/info.step)));
    M.pin.x = (info.pin.u - 0.5)*S; M.pin.z = (info.pin.v - 0.5)*S;
  }
  return M;
}
function disposeModel(M){
  kit.scene.remove(M.mesh);
  M.mat.dispose(); M.depth.dispose();
  if(M.info.i !== 0){ M.geo.dispose(); M.htex.dispose(); }
  if(M.pin){ kit.scene.remove(M.pin.g); }
  if(M.plate){
    const P = M.plate; kit.scene.remove(P.g);
    P.pm.geometry.dispose(); P.paper.mat.map.dispose(); if(P.paper.mat.alphaMap) P.paper.mat.alphaMap.dispose(); P.paper.mat.dispose(); P.paper.depth.dispose();
    M.info.coverCanvas = null;
  }
  M.gone = true;
}
function getBuilt(i){
  if(CACHE[i]) return CACHE[i];
  const info = modelInfo(i), gen = cutGen(info);
  let r = gen.next(); while(!r.done) r = gen.next();
  return (CACHE[i] = { info, geo:r.value, htex:heightTex(info.key) });
}

/* schedule a cascade: the cards fall into place bottom-up */
function dropIn(M, t0, span, h){
  const n = M.info.n;
  M.L.forEach((s, k) => { s.rel = t0 + (n > 1 ? k/(n - 1) : 0)*span; s.on = false; s.a = 0; s.dropH = h; s.y = h; s.v = 0; s.fly = null; });
  M.landedAt = t0 + span + 0.55;
  if(M.pin){ M.pin.rel = M.L[M.pin.k].rel + 0.42; M.pin.on = false; M.pin.g.visible = false; }
}
/* and lift off top-down, up and away */
let flySeed = 7;
const frand = () => { flySeed = (flySeed*16807) % 2147483647; return flySeed/2147483647; };
function flyOff(M, t0, span){
  const n = M.info.n, ride = M.plate ? Math.floor(n*0.4) : 0;
  if(RED_M) span = 0;
  M.L.forEach((s, k) => {
    if(k < ride){ s.fly = null; return; }
    s.fly = { t0:t0 + (n - 1 - ride > 0 ? (n - 1 - k)/(n - 1 - ride) : 0)*span, dur:RED_M ? 0.05 : 0.42, h:7 + frand()*2.5, dx:(frand() - 0.5)*1.2, dz:-0.8 - frand()*1.2,
      rot:(frand() - 0.5)*0.9, tilt:-(0.12 + frand()*0.3) };
  });
  M.flyEnd = t0 + span + 0.44;
}

/* ============================================================
   state
   ============================================================ */
const ST = {
  cur:null,        // the model on the cover
  out:[],          // models flying away
  pend:null,       // the next mountain, being cut
  queued:-1,
  active:0,        // the trek the index shows
  hover:-1, hoverHold:0,
  t0:0, introAt:Infinity, introDone:false,
  sink:0
};
const PT = { x:0, y:0, has:false, moved:false, type:'mouse' };
const SUN = { az:30, el:2, va:0, ve:0, i:0, hemi:0.02 };
const CAM = { pos:V3(), tgt:V3(), fov:30, P:V3(), T:V3(), F:30, init:false, dolly:0, par:0, pv:0 };

// hide the map for the very first render, which happens before the first frame hook
kit.mapRoot.visible = false;
const TABLE_COL = kit.table.material.color.clone();
kit.table.material.color.setScalar(0);
// V1's shadow settings, put back exactly at the hand-off
const SH0 = { bias:kit.key.shadow.bias, nb:kit.key.shadow.normalBias, near:kit.key.shadow.camera.near, far:kit.key.shadow.camera.far };

{ const b = getBuilt(0); ST.cur = makeModel(b.info, b.geo); }

/* ============================================================
   the DOM
   ============================================================ */
const css = document.createElement('style'); css.id = 'stack-css';
css.textContent = `
html.hero-on .hero-copy > .sx{pointer-events:none;}
.sx{position:absolute;inset:0;color:var(--v2-ivory);--sxo:0;--sxh0:0;--sxh1:0;}
.sx .sx-col{position:absolute;left:var(--pad-x);top:clamp(104px,18.5vh,176px);width:min(42vw,600px);}
.sx .xo{opacity:calc(1 - var(--sxo));transform:translateY(calc(var(--sxo) * -18px));}
.sx .xf{opacity:calc(1 - var(--sxo));}
.sx .sx-kick{color:rgba(241,235,223,0.62);margin:0 0 24px;display:block;overflow:hidden;}
.sx .sx-kick > span{display:inline-block;}
.sx .sx-kick .r{color:var(--v2-red);}
html.hero-on .sx .sx-h{font-family:var(--v2-serif);font-weight:400;font-size:clamp(60px,8.4vw,134px);line-height:0.93;letter-spacing:-0.018em;color:var(--v2-ivory);margin:0;}
html.hero-on .sx .sx-h em.acc{color:var(--v2-red);font-style:italic;}
.sx .sx-h .v2-line > span.o{display:inline-block;}
.sx .sx-h .v2-line:nth-child(1) > span.o{transform:translateY(calc(var(--sxh0) * -112%));}
.sx .sx-h .v2-line:nth-child(2) > span.o{transform:translateY(calc(var(--sxh1) * -112%));}
.sx .sx-h .i{display:inline-block;}
.sx .sx-lede{color:rgba(241,235,223,0.72);margin-top:28px;max-width:36ch;}
.sx .sx-idx{margin-top:clamp(26px,5.2vh,54px);width:min(100%,380px);pointer-events:auto;}
.sx .v2-index{list-style:none;margin:0;padding:0;}
.sx .v2-index li:last-child{border-bottom:1px solid rgba(241,235,223,0.13);}
.sx.narrow .v2-index li:last-child{border-bottom:0;}
.sx .v2-index li{display:grid;grid-template-columns:40px 1fr auto;align-items:baseline;padding:10px 2px 9px;border-top:1px solid rgba(241,235,223,0.13);cursor:pointer;position:relative;}
.sx .v2-index .n{font-family:var(--v2-mono);font-size:11px;letter-spacing:0.12em;color:rgba(241,235,223,0.42);transition:color .35s;}
.sx .v2-index .t{font-family:var(--v2-serif);font-size:23px;line-height:1;color:rgba(241,235,223,0.56);transition:color .35s,transform .5s cubic-bezier(.2,.8,.2,1);}
.sx .v2-index .d{font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.16em;color:rgba(241,235,223,0.38);}
.sx .v2-index li:hover .t{color:var(--v2-ivory);transform:translateX(5px);}
.sx .v2-index li.on .n{color:var(--v2-red);}
.sx .v2-index li.on .t{color:var(--v2-ivory);}
.sx .v2-index li::after{content:"";position:absolute;left:0;top:-1px;height:1px;width:0;background:var(--v2-red);transition:width .7s cubic-bezier(.2,.8,.2,1);}
.sx .v2-index li.on::after{width:40px;}
.sx .sx-ro{position:absolute;right:var(--pad-x);top:clamp(96px,13.5vh,128px);text-align:right;pointer-events:none;}
.sx .sx-ro-k{color:rgba(241,235,223,0.6);white-space:nowrap;}
.sx .sx-ro-k b{font-weight:500;color:var(--v2-ivory);}
.sx .sx-ro-vw{display:block;overflow:hidden;margin:12px 0 12px;}
.sx .sx-ro-v{display:inline-block;font-family:var(--v2-mono);font-weight:400;font-size:clamp(36px,3.5vw,54px);letter-spacing:-0.03em;line-height:1.02;color:var(--v2-ivory);font-variant-numeric:tabular-nums;white-space:nowrap;}
.sx .sx-ro-s{color:rgba(241,235,223,0.42);white-space:nowrap;}
.sx .sx-ro-p{color:rgba(241,235,223,0.78);white-space:nowrap;margin-top:14px;display:flex;align-items:center;justify-content:flex-end;gap:9px;}
.sx .sx-ro-p i{display:block;width:7px;height:7px;border-radius:50%;background:var(--v2-red);box-shadow:0 0 0 2px rgba(200,67,43,0.22);}
.sx .sx-ro-p .pv{color:rgba(241,235,223,0.42);}
.sx.narrow .sx-ro-p{justify-content:flex-start;margin-top:10px;}
.sx .sx-ro-l{font-family:var(--v2-sans);font-size:13.5px;line-height:1.5;color:rgba(241,235,223,0.66);max-width:31ch;margin:12px 0 0 auto;text-wrap:pretty;}
.sx.narrow .sx-ro-l{display:none;}
.sx .sx-hint{position:absolute;left:var(--pad-x);bottom:clamp(26px,4.6vh,44px);color:rgba(241,235,223,0.46);display:flex;align-items:center;gap:12px;}
.sx .sx-hint i{display:block;width:34px;height:1px;background:rgba(241,235,223,0.4);}
.sx.narrow .sx-col{top:max(76px,10.5vh);right:var(--pad-x);width:auto;}
.sx.narrow .sx-kick{margin-bottom:12px;}
html.hero-on .sx.narrow .sx-h{font-size:clamp(40px,12.4vw,66px);}
.sx.narrow .sx-lede{font-size:14px;line-height:1.5;margin-top:14px;max-width:34ch;}
.sx.narrow .sx-idx{position:fixed;left:var(--pad-x);right:var(--pad-x);bottom:max(16px,2.4vh);width:auto;margin:0;}
.sx.narrow .v2-index{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;border:0;}
.sx.narrow .v2-index li{display:flex;flex-direction:column;gap:6px;padding:11px 0 2px;}
.sx.narrow .v2-index li::after{top:-1px;}
.sx.narrow .v2-index li.on::after{width:100%;}
.sx.narrow .v2-index .t{font-family:var(--v2-sans);font-size:12px;line-height:1.15;}
.sx.narrow .v2-index .d{display:none;}
.sx.narrow .v2-index li:hover .t{transform:none;}
.sx.narrow .sx-ro{left:var(--pad-x);right:auto;top:auto;bottom:calc(max(16px,2.4vh) + 70px);text-align:left;}
.sx.narrow .sx-ro-p .pv{display:none;}
.sx.narrow .sx-ro-s{font-size:9.5px;letter-spacing:0.16em;}
.sx.narrow .sx-ro-v{font-size:34px;}
.sx.narrow .sx-ro-vw{margin:8px 0 8px;}
.sx.narrow .sx-hint{display:none;}
`;
document.head.appendChild(css);

const root = document.createElement('div');
root.className = 'sx'; root.id = 'sx';
root.innerHTML =
  '<div class="sx-col">' +
    '<div class="xo"><p class="v2-k sx-kick"><span class="kk">Relief models <span class="r">.</span> five treks, cut in card</span></p></div>' +
    '<h1 class="sx-h" id="h-hero"><span class="v2-line"><span class="o"><span class="i">Every trek,</span></span></span>' +
      '<span class="v2-line"><span class="o"><span class="i">to <em class="acc">scale</em>.</span></span></span></h1>' +
    '<div class="xo"><p class="v2-lede sx-lede"><span class="ll">Five of the great walks, cut from real elevation data, one card for every contour line. Pick one and we will hand you the map.</span></p></div>' +
    '<div class="xf sx-idxw"><nav class="sx-idx" aria-label="The five treks">' + kit.indexHTML() + '</nav></div>' +
  '</div>' +
  '<div class="xf sx-row"><div class="sx-ro" aria-live="polite">' +
    '<p class="v2-k sx-ro-k"><b class="a"></b> <span class="b"></span></p>' +
    '<span class="sx-ro-vw"><span class="sx-ro-v">0 m</span></span>' +
    '<p class="v2-k sx-ro-s"></p>' +
    '<p class="v2-k sx-ro-p"><i></i><span class="pk"></span> <span class="pv"></span></p>' +
    '<p class="sx-ro-l"></p>' +
  '</div></div>' +
  '<div class="xf"><p class="v2-k sx-hint"><i></i><span>Scroll, it turns into the map</span></p></div>';
kit.copy.appendChild(root);
const $ = (s) => root.querySelector(s);
const EL = {
  kick:$('.sx-kick > span'), lines:Array.from(root.querySelectorAll('.sx-h .i')), lede:$('.sx-lede > span'),
  idx:$('.sx-idx'), items:Array.from(root.querySelectorAll('.v2-index li')),
  ro:$('.sx-ro'), roL:$('.sx-ro-l'), roA:$('.sx-ro-k .a'), roB:$('.sx-ro-k .b'), roV:$('.sx-ro-v'), roS:$('.sx-ro-s'),
  pin:$('.sx-ro-p'), pinK:$('.sx-ro-p .pk'), pinV:$('.sx-ro-p .pv'), hint:$('.sx-hint')
};
// hidden until the intro reveals them
gsap.set(EL.lines, { yPercent:112 });
gsap.set(EL.kick, { yPercent:110 });
gsap.set([EL.lede, EL.hint], { autoAlpha:0, y:14 });
gsap.set(EL.items, { autoAlpha:0, y:12 });
gsap.set(EL.ro, { autoAlpha:0, y:10 });
gsap.set(EL.pin, { autoAlpha:0 });

const fmtM = kit.fmtM;
function setReadout(kind, info, k){
  if(kind === 'summit'){
    const sm_ = info.summit;
    EL.roA.textContent = String(sm_.name).toUpperCase();
    EL.roB.textContent = sm_.contour ? '. TOP CARD' : (info.i === 0 ? '. SUMMIT' : '. HIGHEST MARK');
    EL.roS.textContent = info.n + ' CARDS, ' + info.step + ' M APART . VERTICAL SCALE ×' + info.ve;
  } else {
    EL.roA.textContent = 'CONTOUR';
    EL.roB.textContent = '. CARD ' + (k + 1) + ' OF ' + info.n;
    EL.roS.textContent = (k === 0 && info.plinth) ? 'THE BASE CARD, EVERYTHING ABOVE IT' : 'UNDER THE CURSOR . VERTICAL SCALE ×' + info.ve;
  }
  const T = TREKS[info.i];
  const line = T && T.line ? T.line : '';
  if(EL.roL.textContent !== line) EL.roL.textContent = line;
}
let lastRoll = 0;
function rollValue(text){
  if(EL.roV.textContent === text) return;
  EL.roV.textContent = text;
  const t = NOW(), quick = t - lastRoll < 0.18;
  lastRoll = t;
  if(RED_M || quick){ gsap.set(EL.roV, { yPercent:0, opacity:1, overwrite:true }); return; }
  gsap.fromTo(EL.roV, { yPercent:28, opacity:0.35 }, { yPercent:0, opacity:1, duration:0.28, ease:'power3.out', overwrite:true });
}
const CNT = { v:0, tw:null };
function countTo(to, dur, from, delay){
  if(CNT.tw) CNT.tw.kill();
  if(from !== undefined){ CNT.v = from; if(ST.hover < 0) EL.roV.textContent = fmtM(from); }
  gsap.set(EL.roV, { yPercent:0, opacity:1 });
  CNT.tw = gsap.to(CNT, { v:to, duration:RED_M ? 0 : dur, delay:RED_M ? 0 : (delay || 0), ease:'power1.inOut', onUpdate:() => { if(ST.hover < 0) EL.roV.textContent = fmtM(CNT.v); } });
}
function setIndex(i){ EL.items.forEach((li, k) => li.classList.toggle('on', k === i)); }
function setPinLabel(M){
  const p = M && M.info.pin;
  EL.pinK.textContent = p ? p.label + (p.m ? ' . ' + fmtM(p.m) : '') : '';
  EL.pinV.textContent = p ? '. ' + p.sub : '';
  EL.pin.style.display = p ? '' : 'none';
}
setIndex(0); setReadout('summit', ST.cur.info); setPinLabel(ST.cur);

/* ============================================================
   choosing a trek: the cards lift off top-down, the new ones drop in bottom-up
   ============================================================ */
function busy(){ return !!ST.pend || ST.out.length > 0 || (ST.cur && NOW() < ST.cur.landedAt); }
function choose(i, fast){
  if(i === ST.active && !ST.pend) return;
  if(busy()){ ST.queued = i; return; }
  const t = NOW();
  ST.active = i; setIndex(i);
  ST.hover = -1;
  const old = ST.cur;
  if(old){
    flyOff(old, t, fast ? 0.24 : 0.28); ST.out.push(old);
    if(old.plate){ old.plate.tout = t + 0.16; old.flyEnd = Math.max(old.flyEnd, old.plate.tout + 0.55); }
  }
  ST.cur = null;
  const info = CACHE[i] ? CACHE[i].info : modelInfo(i);
  ST.pend = { i, info, gen:CACHE[i] ? null : cutGen(info), geo:CACHE[i] ? CACHE[i].geo : null, t0:t, wait:fast ? 0.44 : 0.52 };
  // the readout says where we are going while the cards are in the air
  EL.roS.textContent = 'CUTTING ' + info.n + ' CARDS FOR ' + (TREKS[i] ? TREKS[i].name.toUpperCase() : '');
  gsap.to(EL.pin, { autoAlpha:0, duration:0.2, overwrite:true });
}
EL.items.forEach((li, k) => li.addEventListener('click', (e) => { e.preventDefault(); if(HX < 0.04) choose(k); }));

function pumpBuild(t){
  const P = ST.pend; if(!P) return;
  if(P.gen){
    const t0 = performance.now();
    while(performance.now() - t0 < 4){
      const r = P.gen.next();
      if(r.done){ P.geo = r.value; P.gen = null; if(P.i === 0) CACHE[0] = { info:P.info, geo:P.geo, htex:heightTex(P.info.key) }; break; }
    }
  }
  if(!P.gen && P.geo && t - P.t0 >= P.wait){
    const M = makeModel(P.info, P.geo);
    const n = M.info.n;
    const span = Math.min(0.5, 0.03*n), lag = M.plate ? 0.3 : 0;
    if(M.plate) M.plate.tin = t;
    dropIn(M, t + lag, span, 0.5);
    ST.cur = M; ST.pend = null;
    setReadout('summit', M.info);
    countTo(M.info.summit.m, span + 0.4, M.info.L0, lag);
    setPinLabel(M);
    if(M.pin) gsap.to(EL.pin, { autoAlpha:1, duration:RED_M ? 0 : 0.6, delay:RED_M ? 0 : M.pin.rel - t + 0.3, ease:'power2.out', overwrite:true });
    CAM.refit = true;
  }
}

/* ============================================================
   the per-frame card table
   ============================================================ */
const _q = V3(), _m3 = new THREE.Matrix4(), _e = new THREE.Euler();
function stepModel(M, dt, t, sinkP){
  const n = M.info.n, th = M.info.thick, L = M.L, A = M.U.uA.value, B = M.U.uB.value, C = M.U.uC.value;
  const hk = (M === ST.cur) ? ST.hover : -1;
  let base = 0, prevOff = 0;
  for(let k=0;k<n;k++){
    const s = L[k];
    if(!s.on && t >= s.rel){ s.on = true; s.y = s.dropH; s.v = -1.6; }
    if(s.on){
      s.a = RED_M ? 1 : clamp01((t - s.rel)/(s.dropH > 0.7 ? 0.16 : 0.1));
      if(RED_M || dt === 0 && DBG){ s.y = 0; s.v = 0; }
      else {
        s.v += (-s.y*KN.DROP_K - s.v*KN.DROP_C)*dt; s.y += s.v*dt;
        if(s.y < 0){ s.y = 0; if(s.v < 0) s.v *= -0.2; }
      }
    } else { s.a = 0; }
    const lt = (hk >= 0 && k >= hk) ? KN.LIFT : 0;
    s.lv += ((lt - s.ly)*260 - s.lv*24)*dt; s.ly += s.lv*dt;
    s.glow += ((k === hk ? 1 : 0) - s.glow)*(1 - Math.exp(-dt*12));
    let fdy = 0, fdx = 0, fdz = 0, frot = 0, ftilt = 0, fa = 1;
    if(s.fly && t >= s.fly.t0){
      const f = clamp01((t - s.fly.t0)/s.fly.dur), e = Math.pow(f, 2.2);
      fdy = e*s.fly.h + sm(seg(f, 0, 0.25))*0.06; fdx = e*s.fly.dx; fdz = e*s.fly.dz; frot = e*s.fly.rot; ftilt = sm(f)*s.fly.tilt;
      fa = 1 - sm(seg(f, 0.08, 0.5));
    }
    // the exit: top-down, each card loses its thickness, then lies down as its own contour line
    const spread = 5, sk = clamp01((sinkP*(n - 1 + spread) - (n - 1 - k))/spread);
    const tk = Math.max(KN.MIN_T, th*(1 - eio(seg(sk, 0, 0.78))));
    const flat = sm(seg(sk, 0.42, 1));
    const b = k === 0 ? lerp(-0.004, 0.0025, sm(seg(sk, 0, 0.8))) : base;
    const off = s.y + s.ly + fdy;
    const contact = s.a*fa*(1 - flat)*(1 - clamp01(Math.abs(off - prevOff)/0.03));
    A[k*4] = b; A[k*4+1] = tk; A[k*4+2] = flat; A[k*4+3] = s.a*fa;
    B[k*4] = fdx; B[k*4+1] = off; B[k*4+2] = fdz; B[k*4+3] = frot;
    C[k*4] = s.glow; C[k*4+1] = ftilt; C[k*4+2] = contact; C[k*4+3] = 0;
    s.top = b + tk; s.off = off; s.fdx = fdx; s.fdz = fdz; s.rot = frot; s.tilt = ftilt; s.mid = b + tk*0.5; s.alpha = s.a*fa; s.sk = sk;
    base = b + tk; prevOff = off;
  }
  M.U.uLine.value.x = 1;
  // the pin rides its card
  const P = M.pin;
  if(P){
    const s = L[P.k];
    if(!P.on && t >= P.rel){ P.on = true; P.y = 0.55; P.v = -1; }
    if(P.on){
      if(RED_M){ P.y = 0; P.v = 0; } else { P.v += (-P.y*200 - P.v*13)*dt; P.y += P.v*dt; if(P.y < 0){ P.y = 0; if(P.v < 0) P.v *= -0.25; } }
    }
    _q.set(P.x, s.top + P.y, P.z);
    _q.y -= s.mid; _e.set(s.tilt, s.rot, 0, 'YXZ'); _q.applyEuler(_e); _q.y += s.mid;
    _q.x += s.fdx; _q.y += s.off; _q.z += s.fdz;
    _q.y += warpAt(M.mesh.position.x + P.x, M.mesh.position.z + P.z);
    M.mesh.updateMatrixWorld();
    P.g.position.copy(_q).applyMatrix4(M.mesh.matrixWorld);
    P.g.rotation.set(_e.x, _e.y + M.mesh.rotation.y, 0, 'YXZ');
    // in the exit the pin presses into its printed dot: the needle goes, the head flattens
    const sk = s.sk, gone = sm(seg(sk, 0.0, 0.7));
    P.needle.scale.set(1, Math.max(0.001, 1 - gone), 1);
    P.head.position.y = PIN_H*(1 - gone) + 0.006*gone;
    const r = lerp(1, 0.001, sm(seg(sk, 0.35, 0.95)));
    P.head.scale.set(r, r, r);
    P.g.visible = P.on && s.alpha > 0.5 && !M.gone && !HOME && sk < 0.97;
  }
}
function stepPlate(M, t, home){
  const P = M.plate; if(!P) return;
  let x = 0, y = 0, r = 0, vis = t >= P.tin;
  if(t >= P.tin){
    // dealt in from the right, a little lift and turn, landing square on No. 01
    const p = clamp01((t - P.tin)/0.62), e = 1 - Math.pow(1 - p, 4);
    x = 10*(1 - e); y = 0.06*(1 - e); r = 0.11*(1 - e);
  }
  if(t >= P.tout){
    // and taken back out to the right, lifted clear of the next one. leaving to the left
    // carried it behind the headline on desktop
    const f = clamp01((t - P.tout)/0.45), e = Math.pow(f, 2.2);
    x += 12*e; y += 0.14*sm(Math.min(1, f*2.5)); r += 0.07*e;
    if(f >= 1) vis = false;
  }
  P.g.position.set(kit.PW*0.5 + x, COVER_Y + KN.PLATE_Y + y, z0Plate);
  P.g.rotation.y = r;
  // the model stands on the plate: same slide, same turn about the plate's centre
  const dz = KN.CTR[1] - z0Plate, cr = Math.cos(r), sr = Math.sin(r);
  M.mesh.position.set(P.g.position.x + sr*dz, COVER_Y + KN.PLATE_Y + y, z0Plate + cr*dz);
  M.mesh.rotation.y = r;
  P.g.visible = vis && !home && !M.gone;
}
const z0Plate = 0;
function warpAt(x, z){
  const X = x - kit.PW*0.5, Y = -z, w = 9.1;
  return 0.01*(Math.sin(X*0.3 + w)*0.55 + Math.sin(Y*0.26 + w*1.7)*0.35 + Math.sin((X + Y)*0.18 + w*2.3)*0.25);
}

/* ============================================================
   hover: march the pointer ray over the stepped terrain. exact for the cut model,
   and far cheaper than raycasting 50 000 triangles
   ============================================================ */
const ray = new THREE.Raycaster(), _ndc = new THREE.Vector2();
function topAt(M, x, z){
  const I = M.info, u = x/S + 0.5, v = z/S + 0.5, W = I.win, F = KN.PLINTH;
  const inW = u >= W[0] && u <= W[2] && v >= W[1] && v <= W[3];
  if(!inW){
    if(I.plinth && u >= F[0] && u <= F[2] && v >= F[1] && v <= F[3]) return { k:0, y:I.thick };
    return null;
  }
  const h = I.g.at(u, v);
  if(h < I.L0) return I.plinth ? { k:0, y:I.thick } : null;
  const k = Math.min(I.n - 1, Math.floor((h - I.L0)/I.step));
  return { k, y:(k + 1)*I.thick };
}
function pick(M, px, py){
  _ndc.set(px/window.innerWidth*2 - 1, -py/window.innerHeight*2 + 1);
  ray.setFromCamera(_ndc, kit.camera);
  const o = ray.ray.origin.clone().sub(M.mesh.position), d = ray.ray.direction;
  const F = M.info.plinth ? KN.PLINTH : M.info.win;
  const x0 = (F[0] - 0.5)*S, x1 = (F[2] - 0.5)*S, z0 = (F[1] - 0.5)*S, z1 = (F[3] - 0.5)*S, y1 = M.info.n*M.info.thick + 0.05;
  let tn = 0, tf = 1e9;
  for(const [oa, da, a, b] of [[o.x, d.x, x0, x1], [o.y, d.y, -0.01, y1], [o.z, d.z, z0, z1]]){
    if(Math.abs(da) < 1e-9){ if(oa < a || oa > b) return -1; continue; }
    let ta = (a - oa)/da, tb = (b - oa)/da; if(ta > tb){ const q = ta; ta = tb; tb = q; }
    tn = Math.max(tn, ta); tf = Math.min(tf, tb);
  }
  if(tn > tf) return -1;
  const stp = 0.006;
  for(let t = tn; t <= tf; t += stp){
    const x = o.x + d.x*t, y = o.y + d.y*t, z = o.z + d.z*t, h = topAt(M, x, z);
    if(h && y <= h.y) return h.k;
  }
  return -1;
}
window.addEventListener('pointermove', (e) => { PT.x = e.clientX; PT.y = e.clientY; PT.has = true; PT.moved = true; PT.type = e.pointerType || 'mouse'; }, { passive:true });
window.addEventListener('pointerdown', (e) => {
  PT.x = e.clientX; PT.y = e.clientY; PT.has = true; PT.moved = true; PT.type = e.pointerType || 'mouse';
  if(PT.type === 'touch') PT.tapAt = NOW();
}, { passive:true });

/* ============================================================
   camera: fitted to whatever is on the cover, for any window shape
   ============================================================ */
const _fit = new THREE.PerspectiveCamera();
function fitPose(pts, T, elDeg, yawDeg, fov, box){
  const el = elDeg*D2R, yaw = yawDeg*D2R;
  const dir = V3(Math.sin(yaw)*Math.cos(el), Math.sin(el), Math.cos(yaw)*Math.cos(el));
  _fit.fov = fov; _fit.aspect = kit.camera.aspect; _fit.near = 0.1; _fit.far = 1000; _fit.updateProjectionMatrix();
  const t = T.clone(), v = V3(), right = V3(), up = V3();
  const bw = box[1] - box[0], bh = box[3] - box[2], bcx = (box[0] + box[1])*0.5, bcy = (box[2] + box[3])*0.5;
  const tanV = Math.tan(fov*Math.PI/360), tanH = tanV*kit.camera.aspect;
  let D = 22;
  for(let it=0; it<22; it++){
    _fit.position.copy(t).addScaledVector(dir, D); _fit.lookAt(t); _fit.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for(const p of pts){ v.copy(p).project(_fit); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    right.setFromMatrixColumn(_fit.matrixWorld, 0); up.setFromMatrixColumn(_fit.matrixWorld, 1);
    t.addScaledVector(right, ((x0 + x1)*0.5 - bcx)*tanH*D*0.9).addScaledVector(up, ((y0 + y1)*0.5 - bcy)*tanV*D*0.9);
    D *= Math.pow(Math.max((x1 - x0)/bw, (y1 - y0)/bh), 0.8);
  }
  return { pos:t.clone().addScaledVector(dir, D), tgt:t, fov };
}
function heroPose(info){
  const N = kit.NARROW, c = V3(KN.CTR[0], COVER_Y, KN.CTR[1]);
  const F = info.plinth ? KN.PLINTH : info.win, H = info.n*info.thick;
  const x0 = (F[0] - 0.5)*S, x1 = (F[2] - 0.5)*S, z0 = (F[1] - 0.5)*S, z1 = (F[3] - 0.5)*S;
  const pts = [];
  for(const x of [x0, x1]) for(const z of [z0, z1]) pts.push(V3(c.x + x, c.y, c.z + z), V3(c.x + x, c.y + info.thick, c.z + z));
  // the high ground: the summit and a ring around it
  const sx = (info.mu - 0.5)*S, sz = (info.mv - 0.5)*S;
  pts.push(V3(c.x + sx, c.y + H + 0.1, c.z + sz));
  if(!N){ for(const x of [0.05, kit.PW - 0.05]) for(const z of [-4.75, 4.75]) pts.push(V3(x, 0.14, z)); }
  return N
    ? fitPose(pts, V3(c.x, 0.7, c.z), 44, 14, 36, [-0.86, 0.86, -0.44, 0.13])
    : fitPose(pts, V3(c.x, 0.7, c.z), KN.CAM_EL, KN.CAM_YAW, 28, [0.02, 0.95, -0.97, 0.44]);
}

/* ============================================================
   the intro
   ============================================================ */
const LT = { sun:0, hemi:0.02, table:0, dolly:0 };
function intro(){
  const t = NOW();
  ST.t0 = t;
  gsap.set('.top', { autoAlpha:0, y:-10 });
  const M = ST.cur, n = M.info.n;
  if(DBG || RED_M){
    dropIn(M, t - 10, 0, 0); LT.sun = 1; LT.hemi = 1; LT.table = 1; LT.dolly = 1;
    gsap.set('.top', { autoAlpha:1, y:0 });
    gsap.set([EL.lines, EL.kick], { yPercent:0 }); gsap.set([EL.lede, EL.hint, EL.items, EL.ro, EL.pin], { autoAlpha:1, y:0 });
    EL.roV.textContent = fmtM(M.info.summit.m);
    SUN.az = KN.SUN_REST[0]; SUN.el = KN.SUN_REST[1];
    ST.introDone = true;
    return null;
  }
  const span = 1.32;
  dropIn(M, t + 0.30, span, KN.DROP);
  const tl = gsap.timeline();
  tl.to(LT, { sun:1, duration:1.7, ease:'power2.out' }, 0.05)
    .to(LT, { hemi:1, duration:1.9, ease:'power2.out' }, 0.15)
    .to(LT, { table:1, duration:2.2, ease:'power2.out' }, 0.1)
    .to(LT, { dolly:1, duration:3.4, ease:'power3.out' }, 0)
    .add(() => { EL.roV.textContent = fmtM(M.info.L0); countTo(M.info.summit.m, span + 0.42, M.info.L0); }, 0.30)
    .to(EL.ro, { autoAlpha:1, y:0, duration:0.9, ease:'power3.out' }, 0.32)
    .to('.top', { autoAlpha:1, y:0, duration:1.0, ease:'power3.out' }, 0.55)
    .to(EL.kick, { yPercent:0, duration:1.0, ease:'expo.out' }, 0.62)
    .to(EL.lines, { yPercent:0, duration:1.45, stagger:0.13, ease:'expo.out' }, 0.74)
    .to(EL.lede, { autoAlpha:1, y:0, duration:1.0, ease:'power3.out' }, 1.25)
    .to(EL.items, { autoAlpha:1, y:0, duration:0.8, stagger:0.06, ease:'power3.out' }, 1.42)
    .to(EL.hint, { autoAlpha:1, y:0, duration:0.9, ease:'power3.out' }, 2.05)
    .add(() => { ST.introDone = true; }, 2.1);
  if(M.pin) tl.to(EL.pin, { autoAlpha:1, duration:0.7, ease:'power2.out' }, M.L[M.pin.k].rel - t + 0.75);
  return tl;
}

/* ============================================================
   the frame
   ============================================================ */
let HOME = false, HX = 0, lastSxo = -1, lastH0 = -1, lastH1 = -1, shownRoot = true, wasHome = false, lastNarrow = null;
const v1 = { pos:V3(), tgt:V3(), col:new THREE.Color(), i:0, hc:new THREE.Color(), hg:new THREE.Color(), hi:0, fi:0 };
const sunCol = new THREE.Color('#FFE6C8'), sunHi = new THREE.Color('#FFF6EA'), hemiSky = new THREE.Color('#7E8798'), hemiGnd = new THREE.Color('#231F1B');
const _dir = V3(), _c = V3(), _p = V3(), _t = V3();

function frame(dt, t, hx){
  HX = hx;
  const R1 = v1r();                  // V1's shadow radius, read before the camera is ours
  const W = window.innerWidth, Hh = window.innerHeight;
  if(lastNarrow !== kit.NARROW){ lastNarrow = kit.NARROW; root.classList.toggle('narrow', !!kit.NARROW); CAM.refit = true; }
  const home = hx >= 0.9995;
  HOME = home;

  // ---- the exit: if another mountain is up, come back to No. 01 first
  if(hx > 0.003 && ST.active !== 0 && !ST.pend){
    if(busy()) ST.queued = 0; else choose(0, true);
  }
  if(ST.queued >= 0 && !busy()){ const q = ST.queued; ST.queued = -1; if(q !== ST.active) choose(q, hx > 0.003); }
  pumpBuild(t);

  // ---- camera
  const tgtInfo = ST.cur ? ST.cur.info : (ST.pend ? ST.pend.info : null);
  if(tgtInfo && (CAM.refit || !CAM.init || CAM.forInfo !== tgtInfo)){
    const p = heroPose(tgtInfo); CAM.P.copy(p.pos); CAM.T.copy(p.tgt); CAM.F = p.fov; CAM.refit = false; CAM.forInfo = tgtInfo;
    if(!CAM.init){ CAM.pos.copy(CAM.P); CAM.tgt.copy(CAM.T); CAM.fov = CAM.F; CAM.init = true; }
  }
  const ck = dt > 0 ? 1 - Math.exp(-dt*2.6) : 1;
  const dpos = CAM.pos.distanceTo(CAM.P);
  CAM.pos.lerp(CAM.P, ck); CAM.tgt.lerp(CAM.T, ck); CAM.fov = lerp(CAM.fov, CAM.F, ck);
  CAM.moving = dpos > 0.002;
  if(!home){
    // the intro dolly, a slow drift, and a touch of parallax from the cursor
    const off = _p.copy(CAM.pos).sub(CAM.tgt);
    const parT = PT.has ? (PT.x/W - 0.5) : 0;
    CAM.pv += ((parT - CAM.par)*12 - CAM.pv*7)*dt; CAM.par += CAM.pv*dt;
    const yaw = (RED_M ? 0 : Math.sin(t*0.13)*0.9 + CAM.par*2.2)*D2R;
    off.applyAxisAngle(V3(0, 1, 0), yaw);
    const di = 1 - LT.dolly;
    off.multiplyScalar(1 + 0.22*di); off.y += 2.2*di;
    _t.copy(CAM.tgt); _t.y += 0.25*di;
    const pos = _q.copy(CAM.tgt).add(off);
    const cw = eio(seg(hx, 0.06, 1.0));
    kit.blendCam(pos, _t, CAM.fov, cw);
    kit.camera.updateMatrixWorld();
  }

  // ---- cards
  const sinkP = (ST.cur && ST.cur.info.i === 0) ? seg(hx, 0.30, 0.84) : 0;
  ST.sink = sinkP;
  // hover, at rest only
  const canHover = hx < 0.01 && ST.cur && !busy() && ST.introDone && PT.has;
  if(canHover){
    const k = pick(ST.cur, PT.x, PT.y);
    if(PT.type === 'touch' && k < 0 && NOW() - (PT.tapAt || 0) < 0.3) ST.hover = -1;
    else ST.hover = k;
  }
  if(!canHover && ST.hover >= 0) ST.hover = -1;
  PT.moved = false;
  if(ST.hover !== ST.lastHover){
    if(ST.hover >= 0){ setReadout('contour', ST.cur.info, ST.hover); rollValue(fmtM(ST.cur.info.L0 + ST.hover*ST.cur.info.step)); }
    else if(ST.cur){ setReadout('summit', ST.cur.info); if(!CNT.tw || !CNT.tw.isActive()) rollValue(fmtM(ST.cur.info.summit.m)); }
    ST.lastHover = ST.hover;
  }
  for(const M of ST.out){ stepModel(M, dt, t, 0); stepPlate(M, t, home); }
  if(ST.cur) stepPlate(ST.cur, t, home);
  ST.out = ST.out.filter(M => { if(t > M.flyEnd){ disposeModel(M); return false; } return true; });
  if(ST.cur) stepModel(ST.cur, dt, t, sinkP);

  // the flat cards' lines: ink while they lie on card, ivory once they reach the cover, then into the print
  if(ST.cur){
    const L0 = ST.cur.L[0], U = ST.cur.U;
    U.uLev.value.w = sm(seg(L0.sk || 0, 0.55, 1.0));
    U.uLine.value.x = lerp(1, 0.66, U.uLev.value.w)*(1 - sm(seg(hx, 0.82, 0.96)));
    ST.cur.mesh.visible = !home;
  }
  for(const M of ST.out) M.mesh.visible = !home;

  // ---- the sun
  let azT = KN.SUN_REST[0], elT = KN.SUN_REST[1];
  if(PT.has){
    azT = lerp(KN.SUN_AZ[0], KN.SUN_AZ[1], clamp01(PT.x/W));
    elT = lerp(KN.SUN_EL[0], KN.SUN_EL[1], clamp01(PT.y/Hh));
  }
  if(t - ST.t0 < 1.0 && !DBG){ const f = sm(seg(t - ST.t0, 0, 1.0)); azT = lerp(azT - 75, azT, f); elT = lerp(3, elT, f); }
  // in the exit the sun stops following the cursor and settles where the model reads best
  const ex = sm(seg(hx, 0.0, 0.25));
  azT = lerp(azT, KN.SUN_REST[0] + 10, ex); elT = lerp(elT, KN.SUN_REST[1] + 4, ex);
  if(RED_M || DBG && dt === 0){ SUN.az = azT; SUN.el = elT; }
  else {
    SUN.va += ((azT - SUN.az)*KN.SUN_K - SUN.va*KN.SUN_C)*dt; SUN.az += SUN.va*dt;
    SUN.ve += ((elT - SUN.el)*KN.SUN_K - SUN.ve*KN.SUN_C)*dt; SUN.el += SUN.ve*dt;
  }
  const lw = home ? 1 : sm(seg(hx, 0.22, 0.97));       // the hand-back to V1's light
  const key = kit.key, hemi = kit.hemi, fill = kit.fill;
  if(!home){
    v1.pos.copy(key.position); v1.tgt.copy(key.target.position); v1.col.copy(key.color); v1.i = key.intensity;
    v1.hc.copy(hemi.color); v1.hg.copy(hemi.groundColor); v1.hi = hemi.intensity; v1.fi = fill.intensity;
    const az = SUN.az*D2R, el = Math.max(1, SUN.el)*D2R;
    _dir.set(Math.sin(az)*Math.cos(el), Math.sin(el), -Math.cos(az)*Math.cos(el));
    _c.set(KN.CTR[0], 0.7, KN.CTR[1]);
    _p.copy(_c).addScaledVector(_dir, 30);
    key.position.lerpVectors(_p, v1.pos, lw);
    key.target.position.lerpVectors(_c, v1.tgt, lw);
    key.color.copy(sunCol).lerp(sunHi, seg(SUN.el, 9, 26)*0.7).lerp(v1.col, lw);
    key.intensity = lerp(KN.SUN_I*LT.sun, v1.i, lw);
    hemi.color.copy(hemiSky).lerp(v1.hc, lw); hemi.groundColor.copy(hemiGnd).lerp(v1.hg, lw);
    hemi.intensity = lerp(0.85*LT.hemi, v1.hi, lw);
    fill.intensity = lerp(0.10*LT.hemi, v1.fi, lw);
    // the shadow camera: tight on the cover while it is ours, V1's again by the hand-off
    const sc = key.shadow.camera;
    const H = ST.cur ? ST.cur.info.n*ST.cur.info.thick : 2;
    const R = Math.max(6.4, Math.hypot(4.2, 5.0, H));
    const r = lerp(R, R1, lw);
    if(Math.abs(sc.right - r) > 1e-4 || Math.abs(sc.top - r) > 1e-4){ sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.updateProjectionMatrix(); }
    key.shadow.bias = lerp(-0.00025, SH0.bias, lw);
    key.shadow.normalBias = lerp(0.006, SH0.nb, lw);
    kit.table.material.color.copy(TABLE_COL).multiplyScalar(lerp(0.5*LT.table, 1, lw));
    kit.mapRoot.visible = true;
    wasHome = false;
  } else if(!wasHome){
    // gone: V1's own values are already in place for this frame, only put back what V1 never resets
    const sc = key.shadow.camera, r1 = R1;
    sc.left = -r1; sc.right = r1; sc.top = r1; sc.bottom = -r1; sc.near = SH0.near; sc.far = SH0.far; sc.updateProjectionMatrix();
    key.shadow.bias = SH0.bias; key.shadow.normalBias = SH0.nb;
    kit.table.material.color.copy(TABLE_COL);
    kit.mapRoot.visible = true;
    wasHome = true;
  }

  // ---- DOM
  const showRoot = !home;
  if(showRoot !== shownRoot){ shownRoot = showRoot; root.style.visibility = showRoot ? 'visible' : 'hidden'; }
  const sxo = sm(seg(hx, 0.0, 0.17));
  if(Math.abs(sxo - lastSxo) > 1e-4){ lastSxo = sxo; root.style.setProperty('--sxo', sxo.toFixed(4)); }
  const h0 = eio(seg(hx, 0.015, 0.19)), h1 = eio(seg(hx, 0.045, 0.22));
  if(Math.abs(h0 - lastH0) > 1e-4){ lastH0 = h0; root.style.setProperty('--sxh0', h0.toFixed(4)); }
  if(Math.abs(h1 - lastH1) > 1e-4){ lastH1 = h1; root.style.setProperty('--sxh1', h1.toFixed(4)); }
}
function v1r(){
  // the shadow frustum V1 keeps for its own camera (applyLight): radius from the camera's distance
  const H = kit.homeCam();
  return Math.max(6.5, Math.min(26, H.pos.distanceTo(H.tgt)*0.62));
}

function resize(){ CAM.refit = true; }

/* ============================================================
   the recording tour
   ============================================================ */
function modelPoint(target){
  // a point on the face of the current mountain at a given height, on the side toward the camera
  return () => {
    const M = ST.cur || (ST.out[0]);
    if(!M) return [window.innerWidth*0.6, window.innerHeight*0.6];
    const I = M.info, g = I.g, W = I.win;
    let best = null;
    for(let v = I.mv; v <= W[3] - 0.01; v += 0.004){
      const u = I.mu + (v - I.mv)*0.35;
      const h = g.at(u, v);
      if(h <= target){ best = [u, v, h]; break; }
    }
    if(!best) best = [I.mu, I.mv, g.at(I.mu, I.mv)];
    const k = Math.max(0, Math.min(I.n - 1, Math.floor((best[2] - I.L0)/I.step)));
    const p = V3(KN.CTR[0] + (best[0] - 0.5)*S, COVER_Y + (k + 1)*I.thick, KN.CTR[1] + (best[1] - 0.5)*S + 0.03);
    kit.camera.updateMatrixWorld();
    const s = kit.screenOf(p);
    return [s[0], s[1] + 6];
  };
}
function itemPoint(i){
  return () => { const r = EL.items[i].getBoundingClientRect(); return [r.left + Math.min(r.width*0.5, 70), r.top + r.height*0.55]; };
}
function tour(){
  const W = () => window.innerWidth, H = () => window.innerHeight;
  const at = (fx, fy) => () => [W()*fx, H()*fy];
  return [
    { t:0.0, at:at(0.82, 0.94) },
    { t:3.3, at:at(0.82, 0.94) },
    { t:3.85, at:at(0.12, 0.62) },
    { t:4.95, at:at(0.97, 0.50) },
    { t:5.4, at:modelPoint(1520) },
    { t:5.9, at:modelPoint(1770) },
    { t:6.4, at:modelPoint(2080) },
    { t:6.85, at:itemPoint(3) },
    { t:6.95, at:itemPoint(3), click:true },
    { t:8.3, at:itemPoint(3) },
    { t:8.9, at:at(0.2, 0.95) }
  ];
}

// for inspection while building: window.STACK
window.STACK = { ST, SUN, CAM, LT, KN, PT, choose, pick, modelInfo, tour, get HX(){ return HX; } };

return { name:'hachure', intro, frame, resize, tour };
};
})();
