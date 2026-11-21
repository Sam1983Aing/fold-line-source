/* ============================================================
   FIVE HUTS V2 . HERO OPTION . FIVE HORIZONS   (?hero=horizons)

   A tunnel book of five real horizons at dawn. Five cut sheets stand on the
   table one behind another, each cut along the real skyline seen from one
   trek's high ground, all drawn to one vertical scale with the table at sea
   level. A low sun behind them lights the paper from behind. The cursor
   carries the sun along the horizon and the glow travels through the stack.
   On scroll the book closes: the sheets fold flat front first, the sky folds
   over them like a cover, the sun sets, and the camera settles on map No. 01.

   Classic script. Registers window.HERO_OPTIONS.horizons, see BUILDER BRIEF.md
   ============================================================ */
(function(){
'use strict';
window.HERO_OPTIONS = window.HERO_OPTIONS || {};

window.HERO_OPTIONS.horizons = function(kit){
const T0 = performance.now();
const { THREE, gsap } = kit;
const V2 = kit.V2, TREKS = kit.TREKS, KEYS = kit.KEYS;
const D2R = Math.PI/180, HALF_PI = Math.PI*0.5;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const seg = (v, a, b) => clamp01((v - a)/(b - a));
const sm = t => t*t*(3 - 2*t);
const lerp = (a, b, t) => a + (b - a)*t;
const eIn = t => t*t*t;
const eIO = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
const narrowNow = () => window.innerWidth <= 760 || window.innerWidth/Math.max(1, window.innerHeight) < 0.85;
// stills (?hx=, ?p=) and reduced motion settle every spring at once
const SNAP = !!(kit.REDUCED || kit.DEBUG);

/* ============================================================
   1. KNOBS
   ============================================================ */
const K = {
  X: 3.6,               // the middle of map No. 01, where the book stands
  SUN_U: 0.70,          // where the sun rests on the horizon, 0 left to 1 right
  SUN_K: 15, SUN_C: 6.4,   // the sun's spring: heavy, a little overshoot
  LIFT: 0.26,           // a hovered sheet rises this far
  PARALLAX: [2.6, 1.2]  // degrees of yaw and pitch from the cursor
};
// the bearing window of each skyline. full views, except where a crop moves a summit off another
// summit's line, so the five highest points spread across the width (still the real skyline)
const CROP = { tongariro:[70, 140.5], inca:null, torres:null, kili:[32, 85], everest:[60, 103.2] };
// back to front tones: pale and cool far away, deep ink up front, like air
const TONE = ['#1E2130', '#2C3042', '#3E4155', '#56586E', '#7A7A90'];
const HAZE = [0.006, 0.022, 0.045, 0.078, 0.120];
const GLOW = [0.62, 0.74, 0.84, 0.93, 1.0];       // the light gets through less of the stack up front
const NAME = { tongariro:'Tongariro Crossing', inca:'Inca Trail', torres:'Torres del Paine', kili:'Kilimanjaro', everest:'Everest Base Camp' };
const NAME_S = { tongariro:'Tongariro', inca:'Inca Trail', torres:'W Trek', kili:'Kilimanjaro', everest:'Everest' };
// the view each edge was traced from, spelled properly
const VIEW = { tongariro:'Ngāuruhoe from Mangatepōpō', inca:'Machu Picchu from the Sun Gate', torres:'The Paine massif from Lago Pehoé',
  kili:'Kibo from the south west', everest:'Everest from Kala Patthar' };
const dryOf = (k) => { const T = TREKS[k] || {}; return T.line || ''; };

/* ============================================================
   2. THE SKYLINES. kit.terrain(key).sky.rows are [bearing, angle above
   the eye, ridge elevation]. The skyline is the highest angle on each
   bearing, so the point that makes it can jump from a far summit to a
   near shoulder, and the raw elevations then step like cliffs. Smooth the
   distance instead of the height: along one ridge the distance barely
   changes, so the true elevations survive, and only the jumps are eased.
   ============================================================ */
const NS = 360;
function skyline(key){
  const g = kit.terrain(key);
  if(!g || !g.sky || !g.sky.rows || g.sky.rows.length < 8){
    const m = new Float32Array(NS); let pk = 0;
    for(let j=0;j<NS;j++){ const u = j/(NS-1); m[j] = 1500 + 900*Math.sin(u*3.1)*Math.sin(u*1.3 + 0.4); if(m[j] > m[pk]) pk = j; }
    return { m, pk, max:m[pk] };
  }
  const s = g.sky, rows = s.rows, n = rows.length;
  const L = new Float64Array(n), Ls = new Float64Array(n), H = new Float64Array(n);
  for(let i=0;i<n;i++){ const r = rows[i]; L[i] = Math.log(Math.max(60, (r[2] - s.eye)/Math.max(0.003, Math.tan(r[1]*D2R)))); }
  const sig = 6;
  for(let i=0;i<n;i++){
    let w = 0, a = 0;
    for(let j=Math.max(0, i - 3*sig); j<=Math.min(n - 1, i + 3*sig); j++){ const q = Math.exp(-((j - i)*(j - i))/(2*sig*sig)); w += q; a += q*L[j]; }
    Ls[i] = a/w;
  }
  for(let i=0;i<n;i++) H[i] = s.eye + Math.exp(Ls[i])*Math.tan(rows[i][1]*D2R);
  const b0 = rows[0][0], b1 = rows[n-1][0], step = (b1 - b0)/(n - 1), win = CROP[key] || [b0, b1];
  const m = new Float32Array(NS); let pk = 0;
  for(let j=0;j<NS;j++){
    const f = Math.max(0, Math.min(n - 1.0001, ((win[0] + (win[1] - win[0])*j/(NS - 1)) - b0)/step)), k = f|0;
    m[j] = H[k] + (H[k+1] - H[k])*(f - k);
    if(m[j] > m[pk]) pk = j;
  }
  return { m, pk, max:m[pk] };
}
const PROF = KEYS.map(skyline);

/* ============================================================
   3. THE PAPER. kit.makePaper gives V1's stock (fibre, deckle, real
   shadows). Two grafts on top of it:
   - sheets: light coming through from behind. Strongest just under the
     cut edge (a baked distance-below-the-ridge texture) and on the side
     of the sun (its angle from the view ray), driven by the same fibre
     fields as the albedo so the formation shows. Plus a rim on the cut,
     and the air between the eye and the sheet.
   - the sky: a lit panel, a dawn gradient and the sun as a soft disc.
   ============================================================ */
const SH = {
  uSunV:   { value:new THREE.Vector3(0, 0, -1) },
  uSunCol: { value:new THREE.Color('#FFB070') },
  uHazeCol:{ value:new THREE.Color('#8C88AE') },
  uSig:    { value:new THREE.Vector2(0.075, 0.24) },
  uRimI:   { value:1.0 }
};
const SHEET_PARS = `
uniform sampler2D uEdge;
uniform vec3 uSunV;
uniform vec3 uSunCol;
uniform vec3 uHazeCol;
uniform vec2 uSig;
uniform float uRimI;
uniform float uGlow;
uniform float uHaze;
uniform float uHot;
`;
const SHEET_FRAG = `
{
  vec3 _vd = normalize(-vViewPosition);
  float _ax = atan(_vd.x, -_vd.z) - atan(uSunV.x, -uSunV.z);
  float _ay = atan(_vd.y, -_vd.z) - atan(uSunV.y, -uSunV.z);
  // near the sun on screen, and a wider column under it
  float _sk = exp(-_ax*_ax/(2.0*uSig.x*uSig.x)) * exp(-_ay*_ay/(2.0*uSig.y*uSig.y));
  float _sw = exp(-_ax*_ax/(2.0*uSig.x*uSig.x*5.0));
  vec4 _ed = texture2D(uEdge, _uv);
  // thin formation lets more light through, fibre bundles and flecks hold it back
  float _form = pFbm(_nuv*vec2(19.0) + uSeed*1.31);
  float _tr = 0.84 + (0.5 - _form)*0.48 + (0.5 - _blot)*0.20 - (_grain - 0.5)*0.06 - (_cross - 0.5)*0.08 - _fleck*0.5;
  vec3 _tint = mix(vec3(1.0, 0.93, 0.86), texture2D(map, _uv).rgb*2.2, 0.35);
  _tr *= 1.0 - 0.42*_ed.b;
  float _g = uGlow*(1.0 + 0.5*uHot)*(_ed.r*(0.008 + 0.05*_sw + 0.60*_sk) + _ed.g*(0.035 + 0.26*_sw + 1.6*_sk));
  totalEmissiveRadiance += uSunCol*_tint*max(_tr, 0.0)*_g;
  // the cut edge itself catches the sun
  float _rim = 1.0 - smoothstep(0.5, 0.57, _a);
  totalEmissiveRadiance += uSunCol*_rim*uRimI*uGlow*(0.06 + 0.42*_sw + 1.35*_sk)*(1.0 + 0.6*uHot);
  // air between the eye and the sheet: the far sheets go pale
  totalEmissiveRadiance += uHazeCol*uHaze*(0.80 + 0.45*_ed.r);
}
`;
const SKY = {
  uSunUV:  { value:new THREE.Vector2(0.6, 0.5) },
  uSunR:   { value:0.05 },
  uSkyAsp: { value:1.3 },
  uSkyI:   { value:0 },
  uDawn:   { value:0 },
  uSunI:   { value:0 },
  uSkyTop: { value:new THREE.Color('#0A0D1C') },
  uSkyMid: { value:new THREE.Color('#2E3159') },
  uSkyLow: { value:new THREE.Color('#8C6577') },
  uSkyHor: { value:new THREE.Color('#EE9C62') },
  uSunCore:{ value:new THREE.Color('#FFF0D2') }
};
const SKY_PARS = `
uniform vec2 uSunUV;
uniform float uSunR;
uniform float uSkyAsp;
uniform float uSkyI;
uniform float uDawn;
uniform float uSunI;
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyLow;
uniform vec3 uSkyHor;
uniform vec3 uSunCore;
`;
const SKY_FRAG = `
{
  vec2 _d = (_uv - uSunUV)*vec2(uSkyAsp, 1.0);
  float _r = length(_d);
  // the warm band sits on the sun's horizon, the indigo above it
  float _hy = _uv.y - (uSunUV.y - 0.12);
  float _near = exp(-_d.x*_d.x/0.30);
  vec3 _c = mix(mix(uSkyLow*0.85, uSkyHor, _near), uSkyLow, smoothstep(-0.05, 0.20, _hy));
  _c = mix(_c, uSkyMid, smoothstep(0.10, 0.42, _hy));
  _c = mix(_c, uSkyTop, smoothstep(0.30, 0.80, _hy));
  // warmer toward the sun, wide sideways like a real dawn
  float _wide = exp(-dot(_d*vec2(0.42, 1.0), _d*vec2(0.42, 1.0))/0.05);
  _c += uSkyHor*_wide*0.38*uSunI + uSunCore*exp(-_r*_r/0.005)*0.40*uSunI;
  // before the sun is up it is all deep blue black
  _c = mix(vec3(0.008, 0.010, 0.022), _c, uDawn);
  float _disc = 1.0 - smoothstep(uSunR*0.78, uSunR, _r);
  _c = mix(_c, uSunCore*1.08, _disc*uSunI);
  float _form = pFbm(_nuv*vec2(14.0) + uSeed*1.31);
  float _tr = 0.92 + (0.5 - _form)*0.30 + (0.5 - _blot)*0.18 - (_grain - 0.5)*0.06 - _fleck*0.3;
  float _edge = smoothstep(0.0, 0.07, _uv.x)*smoothstep(1.0, 0.93, _uv.x)*smoothstep(1.0, 0.95, _uv.y);
  float _torn = 1.0 - smoothstep(0.5, 0.6, _a);
  totalEmissiveRadiance += _c*_tr*uSkyI*(mix(0.35, 1.0, _edge) + _torn*0.9);
}
`;
function graft(pp, U, pars, frag, cacheKey){
  const base = pp.mat.onBeforeCompile;
  pp.mat.onBeforeCompile = (sh, r) => {
    base(sh, r);
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + pars)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + frag);
  };
  // a different program from V1's paper, or three would hand back the cached one
  pp.mat.customProgramCacheKey = () => cacheKey;
}

/* ---- canvases for one sheet ---- */
function sheetCanvases(P, W, Hs, S, cw, tone){
  const ch = Math.max(48, Math.round(cw*Hs/W));
  const shape = kit.shapeCanvas(cw, ch, (a, w, h, pad) => {
    a.beginPath(); a.moveTo(0, h + pad);
    for(let j=0;j<NS;j++) a.lineTo(j/(NS - 1)*w, h*(1 - P.m[j]*S/Hs));
    a.lineTo(w, h + pad); a.closePath(); a.fill();
  }, 1.9);
  // the stock: a touch lighter at the cut, a touch darker at the foot
  const tw = 256, th = Math.max(24, Math.round(tw*Hs/W));
  const colour = kit.colourCanvas(tw, th, tone, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, kit.rgba('#FFFFFF', 0.06)); g.addColorStop(0.55, kit.rgba('#000000', 0)); g.addColorStop(1, kit.rgba('#000000', 0.18));
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  // distance below the cut edge, baked: R broad, G narrow. B is ink: a hairline every 1 000 m,
  // printed on every sheet at the same heights, so the shared scale is on the paper itself
  const ew = 384, eh = Math.max(48, Math.round(ew*Hs/W*2.0));
  const edge = document.createElement('canvas'); edge.width = ew; edge.height = eh;
  const ex = edge.getContext('2d'), img = ex.createImageData(ew, eh);
  for(let px=0; px<ew; px++){
    const f = px/(ew - 1)*(NS - 1), k = Math.min(NS - 2, f|0), top = (P.m[k] + (P.m[k+1] - P.m[k])*(f - k))*S;
    for(let py=0; py<eh; py++){
      const y = (1 - (py + 0.5)/eh)*Hs, d = Math.max(0, top - y), o = (py*ew + px)*4;
      img.data[o] = Math.round(255*Math.exp(-d/0.55));
      img.data[o+1] = Math.round(255*Math.exp(-d/0.075));
      const km = y/S/1000, f1 = Math.abs(km - Math.round(km))*1000*S, onLine = Math.round(km) >= 1 && f1 < 0.011 && d > 0.05;
      img.data[o+2] = onLine ? 255 : 0; img.data[o+3] = 255;
    }
  }
  ex.putImageData(img, 0, 0);
  return { shape, colour, edge, cw, ch };
}

/* ============================================================
   4. THE BOOK. It stands on map No. 01's own footprint (the map hides
   while the hero plays). The sky is the map's size exactly, 7.2 x 9.6,
   and carries V1's real cover on its back, so when it folds forward over
   the flattened sheets it lands as the shut map, and the page's own map
   takes its place in the same frame. Nothing has to leave the shot.
   ============================================================ */
let firstFrame = true;
const ROOT = new THREE.Group(); ROOT.name = 'horizons';
const BOOKG = new THREE.Group(); ROOT.add(BOOKG);
kit.scene.add(ROOT);
kit.mapRoot.visible = false;
// V1 compiles and renders its boot frame right after this factory, with its own camera. our
// materials go along so their shaders and shadow casters compile then, not on the intro's
// first frame, but they write neither colour nor depth until the hero owns the frame
const MATS = new Set();
function quiet(m, dw){ MATS.add(m); m._dw = dw !== false; if(firstFrame){ m.colorWrite = false; m.depthWrite = false; } }

const PW = kit.PW, PD = kit.PD;                       // 7.2 x 9.6, the map
const SW = 6.86;                                      // the sheets fold flat well inside the cover's paper (about 7.0 of its 7.2)
const S = 0.68/1000;                                  // one vertical scale: world units per metre
const ZS = -PD*0.5;                                   // the sky's hinge: the cover's top edge
const ZL = [3.10, 1.55, 0.0, -1.55, -3.25];           // sheets, 01 Tongariro at the front to 05 Everest at the back
const CAM = {
  desk:  { EL:14, FOV:30, BOX:[-0.10, 0.88, -0.78, 0.85] },
  phone: { EL:15, FOV:38, BOX:[-0.95, 0.95, -0.64, 0.50] }
};

// the light pool: a multiply decal on the table that lets the sun's light fall off into the
// dark room, since a directional light would light the whole table the same
const POOL = { mesh:null, tex:null, U:{ uMap:{ value:null }, uFade:{ value:0 } } };
function buildPool(){
  const MW = 120, z0 = -176, z1 = 22, MD = z1 - z0, N = 384;
  const c = document.createElement('canvas'); c.width = N; c.height = N;
  const x = c.getContext('2d');
  const X = (wx) => (wx - (kit.PW*0.5 - MW*0.5))/MW*N, Z = (wz) => (wz - z0)/MD*N;
  // dark around the book, then back to white far off, where the fog has already made the table the room
  const gz = x.createLinearGradient(0, Z(-110), 0, Z(-50));
  gz.addColorStop(0, 'rgb(255,255,255)'); gz.addColorStop(1, 'rgb(12,12,12)');
  x.fillStyle = gz; x.fillRect(0, 0, N, N);
  x.filter = 'blur(' + Math.round(N*0.012) + 'px)';
  x.fillStyle = 'rgb(255,255,255)';
  const cx = PW*0.5, hw = SW*0.5 + 0.7;
  x.beginPath(); x.ellipse(X(cx), Z(ZL[0] - 0.4), (X(cx + hw) - X(cx - hw))*0.5, (Z(ZL[0] + 1.7) - Z(ZS + 0.2))*0.5, 0, 0, Math.PI*2);
  x.rect(X(cx - hw), Z(ZS + 0.2), X(cx + hw) - X(cx - hw), Z(ZL[0] + 0.5) - Z(ZS + 0.2));
  x.fill();
  x.filter = 'none';
  POOL.tex = kit.tex(c, false); POOL.tex.flipY = false; POOL.U.uMap.value = POOL.tex;
  const mat = new THREE.ShaderMaterial({
    uniforms:POOL.U,
    vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0); }',
    fragmentShader:'uniform sampler2D uMap; uniform float uFade; varying vec2 vUv; void main(){ float m = texture2D(uMap, vec2(vUv.x, 1.0 - vUv.y)).r; gl_FragColor = vec4(vec3(mix(m, 1.0, uFade)), 1.0); }',
    transparent:true, depthWrite:false,
    blending:THREE.CustomBlending, blendEquation:THREE.AddEquation, blendSrc:THREE.ZeroFactor, blendDst:THREE.SrcColorFactor
  });
  quiet(mat, false);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(MW, MD), mat);
  mesh.rotation.x = -HALF_PI; mesh.position.set(PW*0.5, -0.008, (z0 + z1)*0.5);
  ROOT.add(mesh); POOL.mesh = mesh;
}

function build(){
  const layers = [];
  for(let i=0;i<5;i++){
    const P = PROF[i], Hs = P.max*S + 0.10;
    const cv = sheetCanvases(P, SW, Hs, S, 768, TONE[i]);
    const pp = kit.makePaper({ colour:cv.colour, shape:cv.shape, aspect:SW/Hs, seed:3.1 + i*5.73,
      deckle:0.0030, fibre:0.05, rim:0.0, contact:0.35, warp:0.014, warpF:[0.55 + i*0.07, 0.62 - i*0.03, 0.42 + i*0.05] });
    const edgeTex = kit.tex(cv.edge, false); edgeTex.generateMipmaps = false; edgeTex.minFilter = THREE.LinearFilter;
    const U = Object.assign({ uEdge:{ value:edgeTex }, uGlow:{ value:0 }, uHaze:{ value:0 }, uHot:{ value:0 } }, SH);
    graft(pp, U, SHEET_PARS, SHEET_FRAG, 'paper-horizons-sheet');
    // a little polygon offset, back sheets further, so the folded stack never fights
    pp.mat.polygonOffset = true; pp.mat.polygonOffsetFactor = -(i + 1)*0.5; pp.mat.polygonOffsetUnits = -(i + 1);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, Hs, 36, 6), pp.mat);
    mesh.position.y = Hs*0.5;
    mesh.customDepthMaterial = pp.depth; mesh.castShadow = true; mesh.receiveShadow = true;
    const hinge = new THREE.Group();
    const x = PW*0.5;
    hinge.position.set(x, 0, ZL[i]);
    hinge.add(mesh); BOOKG.add(hinge);
    quiet(pp.mat);
    const L = { i, key:KEYS[i], P, W:SW, Hs, z:ZL[i], x, hinge, mesh, mat:pp.mat, depth:pp.depth, edgeTex, U,
      probe:cv.shape.getContext('2d', { willReadFrequently:true }), cw:cv.cw, ch:cv.ch,
      fold:{ p:0, v:0 }, lift:{ p:0, v:0 }, stackY:0.006 + i*0.009, PU:pp.U,
      peak:new THREE.Vector3(x - SW*0.5 + SW*P.pk/(NS - 1), P.max*S, ZL[i]) };
    mesh.userData.hz = L;
    layers.push(L);
  }

  // the sky: the back wall of the book, lit from behind like a lightbox
  const hinge = new THREE.Group(); BOOKG.add(hinge);
  // the sky face is the sheets' width, so it never peeks out beside them. the cover on its back is the map's full size
  const shape = kit.shapeCanvas(262, 360, (a, w, h) => { a.fillRect(2, 3, w - 4, h - 6); }, 2.0);
  const sp = kit.makePaper({ colour:kit.colourCanvas(32, 32, '#2B2622'), shape, aspect:SW/PD, seed:61.7,
    deckle:0.003, fibre:0.05, rim:0.0, contact:0.0, warp:0.012, warpF:[0.3, 0.26, 0.18], side:THREE.FrontSide });
  graft(sp, SKY, SKY_PARS, SKY_FRAG, 'paper-horizons-sky');
  sp.mat.color.setScalar(0.25);
  quiet(sp.mat);
  SKY.uSkyAsp.value = SW/PD;
  const skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, PD, 24, 16), sp.mat);
  skyMesh.position.set(0, PD*0.5, 0.004); skyMesh.castShadow = false; skyMesh.receiveShadow = false;
  hinge.add(skyMesh);
  // its back is V1's cover, made the way V1 makes it, so the hand-over is exact
  const cp = kit.makePaper({ colour:kit.COVER.map.image, shape:kit.shapeCanvas(135, 180, (a, w, h) => { a.fillRect(2, 2, w - 4, h - 4); }, 1.6),
    aspect:PW/PD, seed:9.1, deckle:0.003, rim:0.3, contact:0, fibre:0.05, warp:0.01, warpF:[0.3, 0.26, 0.18], side:THREE.FrontSide });
  quiet(cp.mat);
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD, 8, 10), cp.mat);
  cover.customDepthMaterial = cp.depth; cover.castShadow = false; cover.receiveShadow = true;
  cover.matrixAutoUpdate = false;
  hinge.add(cover);
  const sky = { hinge, mesh:skyMesh, mat:sp.mat, depth:sp.depth, cover, coverMat:cp.mat, coverDepth:cp.depth, fold:{ p:0, v:0 }, y:0.137, landed:false };
  BOOK = { layers, sky, W:SW, S, sunY0:PROF[4].max*S*0.9, ridgeTop:PROF[4].max*S, centre:new THREE.Vector3(PW*0.5, 2.6, (ZL[0] + ZS)*0.5) };
  seatCover();
  buildPool();
  return BOOK;
}

// put the sky's hinge on the cover's top edge and its back face exactly where V1's cover lies,
// read from V1's own mesh once the map is shut
const _M = new THREE.Matrix4(), _H = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _one = new THREE.Vector3(1, 1, 1);
let coverSeated = false;
function seatCover(fromV1){
  const sky = BOOK.sky;
  if(fromV1){
    kit.COVER.front.updateWorldMatrix(true, false);
    _M.copy(kit.COVER.front.matrixWorld);
  } else {
    // the shut map, worked out from V1's numbers: the cover pivot sits COVER_H up, the cover COVER_H above it
    _M.compose(new THREE.Vector3(PW*0.5, 2*kit.COVER_H + 0.001, 0), _q.setFromEuler(_e.set(-HALF_PI, 0, 0)), _one);
  }
  const p = new THREE.Vector3().setFromMatrixPosition(_M);
  sky.y = p.y;
  sky.hinge.position.set(p.x, p.y, p.z - PD*0.5);
  _H.compose(sky.hinge.position, _q.setFromEuler(_e.set(HALF_PI, 0, 0)), _one);
  sky.cover.matrix.copy(_H.invert().multiply(_M));
  sky.cover.matrixWorldNeedsUpdate = true;
}
let BOOK = null;

/* ============================================================
   5. THE DOM: headline, lede, index (the readout), labels, scale, note
   ============================================================ */
const css = document.createElement('style'); css.id = 'hz-css';
css.textContent = `
html.hero-on .hero-copy > .hz{pointer-events:none;}
.hz{position:fixed;inset:0;color:var(--v2-ivory);}
.hz-copy{position:absolute;left:var(--pad-x);top:clamp(104px,17vh,170px);width:min(500px,36vw);pointer-events:auto;}
.hz-eye{color:rgba(241,235,223,0.56);margin:0 0 24px;}
.hz-eye i{font-style:normal;color:var(--v2-red);}
html.hero-on .hero h1.hz-h1{font-family:var(--v2-serif);font-weight:400;font-size:clamp(46px,min(6.1vw,9.8vh),94px);line-height:0.95;letter-spacing:-0.014em;color:var(--v2-ivory);margin:0;}
html.hero-on .hero h1.hz-h1 em{font-style:italic;color:var(--v2-red);}
.hz-h1 .v2-line > span > span{display:inline-block;will-change:transform;}
.hz-lede{color:rgba(241,235,223,0.68);margin:26px 0 0;max-width:37ch;}
.hz-index{list-style:none;margin:28px 0 0;padding:0;max-width:410px;border-top:1px solid rgba(241,235,223,0.14);}
.hz-index li{display:grid;grid-template-columns:36px 1fr auto;align-items:baseline;padding:7px 2px 6px;border-bottom:1px solid rgba(241,235,223,0.09);cursor:pointer;outline:none;
  font-family:var(--v2-mono);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(241,235,223,0.44);transition:color .35s;}
.hz-index li .t{font-family:var(--v2-serif);font-size:19px;letter-spacing:0;text-transform:none;color:rgba(241,235,223,0.84);transition:color .35s, transform .5s cubic-bezier(.2,.8,.2,1);}
.hz-index li .n{transition:color .35s;}
.hz-index li.on{color:rgba(241,235,223,0.86);}
.hz-index li.on .n{color:var(--v2-red);}
.hz-index li.on .t{color:var(--v2-ivory);transform:translateX(5px);}
.hz-index li .x{grid-column:1 / -1;display:grid;grid-template-rows:0fr;transition:grid-template-rows .55s cubic-bezier(.2,.8,.2,1);}
.hz-index li.on .x{grid-template-rows:1fr;}
.hz-index li .xi{overflow:hidden;min-height:0;padding-left:36px;}
.hz-index li .row{display:flex;gap:18px;margin:6px 0 4px;color:rgba(241,235,223,0.88);letter-spacing:0.12em;font-size:10px;}
.hz-index li .row span{display:flex;flex-direction:column;gap:2px;}
.hz-index li .row em{font-style:normal;font-size:8.5px;color:rgba(241,235,223,0.42);}
.hz-index li .s{font-family:var(--v2-serif);font-style:italic;text-transform:none;letter-spacing:0;font-size:15.5px;line-height:1.3;color:rgba(241,235,223,0.76);margin:0 0 5px;max-width:34ch;}
.hz-index li .v{margin:0 0 7px;font-size:8.5px;letter-spacing:0.16em;color:rgba(241,235,223,0.40);}
.hz-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
.hz-lab{position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;will-change:transform,opacity;
  text-shadow:0 0 16px rgba(8,8,14,0.9),0 0 6px rgba(8,8,14,0.75),0 1px 2px rgba(8,8,14,0.7);}
.hz-lab::before{content:"";position:absolute;inset:-9px -16px -9px -14px;z-index:-1;pointer-events:none;
  background:radial-gradient(closest-side, rgba(9,9,15,0.46), rgba(9,9,15,0.24) 60%, rgba(9,9,15,0));}
.hz-lab .t{display:block;font-family:var(--v2-mono);font-weight:500;font-size:10px;line-height:1.3;letter-spacing:0.16em;text-transform:uppercase;color:rgba(241,235,223,0.90);transition:color .35s;}
.hz-lab .t b{font-weight:500;color:rgba(241,235,223,0.55);margin-right:0.9em;transition:color .35s;}
.hz-lab .d{display:block;margin-top:2px;font-family:var(--v2-mono);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(241,235,223,0.66);transition:color .35s;}
.hz-lab.r .t b{margin-right:0.9em;}
.hz-lab.r{text-align:right;}
.hz-lab.on .t{color:var(--v2-ivory);}
.hz-lab.on .t b{color:var(--v2-red);}
.hz-lab.on .d{color:rgba(241,235,223,0.88);}
.hz-tick{position:absolute;left:0;top:0;pointer-events:none;font-family:var(--v2-mono);font-size:8.5px;letter-spacing:0.14em;color:rgba(241,235,223,0.40);white-space:nowrap;will-change:transform,opacity;}
.hz-note{position:absolute;right:var(--pad-x);bottom:clamp(18px,3.4vh,34px);width:min(480px,40vw);pointer-events:none;text-align:right;}
.hz-note .k{font-family:var(--v2-mono);font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(241,235,223,0.50);margin:0 0 5px;}
.hz-note .k b{display:inline-block;width:6px;height:6px;background:var(--v2-red);vertical-align:1px;margin-right:0.9em;}
.hz-note .p{font-family:var(--v2-serif);font-style:italic;font-size:15px;line-height:1.3;color:rgba(241,235,223,0.62);margin:0;}
.hz-cap{display:none;}
@media (min-width:761px) and (max-height:820px){
  .hz-copy{top:clamp(84px,13vh,140px);}
  .hz-eye{margin-bottom:16px;}
  .hz-lede{margin-top:18px;}
  .hz-index{margin-top:20px;}
  .hz-index li{padding:5px 2px 4px;}
  .hz-index li .t{font-size:17px;}
}
@media (max-width:760px){
  .hz-copy{top:calc(var(--pad-y) + 54px);right:var(--pad-x);width:auto;}
  .hz-eye{margin-bottom:12px;}
  html.hero-on .hero h1.hz-h1{font-size:clamp(40px,11.2vw,52px);}
  .hz-lede{font-size:13.5px;line-height:1.5;margin-top:12px;max-width:none;}
  .hz-index{display:none;}
  .hz-note{display:none;}
  .hz-lab .t{font-size:8.5px;letter-spacing:0.12em;}
  .hz-lab .d{font-size:7.5px;letter-spacing:0.12em;margin-top:1px;}
  .hz-cap{display:block;position:absolute;left:var(--pad-x);right:var(--pad-x);bottom:14px;height:74px;pointer-events:none;}
  .hz-cap > div{position:absolute;left:0;right:0;bottom:0;transition:opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1);}
  .hz-cap > div.off{opacity:0;transform:translateY(8px);}
  .hz-cap .k{font-family:var(--v2-mono);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(241,235,223,0.54);margin:0 0 6px;}
  .hz-cap .k b{font-weight:500;color:var(--v2-red);margin-right:0.6em;}
  .hz-cap .k b.sq{display:inline-block;width:5px;height:5px;background:var(--v2-red);vertical-align:1px;}
  .hz-cap .row{display:flex;gap:14px;margin:0 0 5px;font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.08em;color:var(--v2-ivory);}
  .hz-cap .row span{display:flex;flex-direction:column;gap:1px;}
  .hz-cap .row em{font-style:normal;font-size:7.5px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(241,235,223,0.46);}
  .hz-cap .p{font-family:var(--v2-serif);font-style:italic;font-size:14px;line-height:1.25;color:rgba(241,235,223,0.74);margin:0;}
}
`;
document.head.appendChild(css);

const root = document.createElement('div'); root.className = 'hz';
root.innerHTML =
  '<svg class="hz-svg" aria-hidden="true"></svg>' +
  '<div class="hz-labs" aria-hidden="true"></div>' +
  '<div class="hz-copy">' +
    '<p class="v2-k hz-eye"></p>' +
    '<h1 class="v2-display hz-h1" id="h-hero">' +
      '<span class="v2-line"><span><span>Five horizons.</span></span></span>' +
      '<span class="v2-line"><span><span>One of them</span></span></span>' +
      '<span class="v2-line"><span><span>is <em class="acc">yours.</em></span></span></span>' +
    '</h1>' +
    '<p class="v2-lede hz-lede"></p>' +
    kit.indexHTML('hz-index') +
  '</div>' +
  '<div class="hz-note"><p class="k"><b></b>Real skylines . one vertical scale . table at sea level</p>' +
    '<p class="p">Everest stands at the back because it would hide the others.</p></div>' +
  '<div class="hz-cap" aria-live="polite"><div class="main"></div><div class="alt off"></div></div>';
kit.copy.appendChild(root);
const $ = (s) => root.querySelector(s);
const svg = $('.hz-svg'), labsEl = $('.hz-labs'), capMain = $('.hz-cap .main'), capAlt = $('.hz-cap .alt'), noteEl = $('.hz-note');
const h1Ins = Array.from(root.querySelectorAll('.hz-h1 .v2-line > span'));
const h1Outs = Array.from(root.querySelectorAll('.hz-h1 .v2-line > span > span'));
const eyeEl = $('.hz-eye'), ledeEl = $('.hz-lede'), idxEl = $('.hz-index');
const idxRows = Array.from(root.querySelectorAll('.hz-index li'));
const SVGNS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };

function fillCopy(){
  const nar = narrowNow();
  eyeEl.innerHTML = nar ? 'Five treks <i>.</i> one scale' : 'Five treks <i>.</i> the view from the top <i>.</i> one scale';
  ledeEl.textContent = nar
    ? 'The view from the top of five great treks, cut from real elevation data and drawn to one scale.'
    : 'The view from the top of five of the great walks, cut from real elevation data and drawn to one scale. From a day on a volcano to ' +
      ((TREKS[4] && TREKS[4].days) ? TREKS[4].days + ' days' : 'the long walk') + ' under Everest.';
}
fillCopy();

// the readout lives in the index: the hovered trek opens up with its numbers and one dry line
const cells = (T, nar) => {
  const out = [];
  if(T.daysLabel) out.push('<span><em>Days</em>' + T.daysLabel.replace(/ ?DAYS?/i, '') + '</span>');
  if(T.kmLabel) out.push('<span><em>Distance</em>' + T.kmLabel + '</span>');
  if(T.high && T.high.m) out.push('<span><em>' + (nar ? 'High point' : 'High point') + '</em>' + kit.fmtM(T.high.m).toUpperCase() + '</span>');
  if(!nar && T.nightLabel) out.push('<span><em>Nights</em>' + T.nightLabel + '</span>');
  return out.join('');
};
idxRows.forEach((li, k) => {
  const T = TREKS[k] || {}, x = document.createElement('div');
  x.className = 'x';
  x.innerHTML = '<div class="xi"><div class="row">' + cells(T, false) + '</div><p class="s">' + dryOf(k) + '</p>' +
    '<p class="v">The edge: ' + VIEW[KEYS[k]] + '</p></div>';
  li.appendChild(x);
});

// one label per layer: a hairline from the highest point of its skyline up to the name
const LAB = KEYS.map((key, i) => {
  const T = TREKS[i] || {}, el = document.createElement('div');
  el.className = 'hz-lab';
  labsEl.appendChild(el);
  const halo = sv('line', { stroke:'rgb(10,10,16)', 'stroke-width':'3', 'stroke-opacity':'0' });
  const line = sv('line', { stroke:V2.ivory, 'stroke-width':'1', 'stroke-opacity':'0' });
  const dot = sv('circle', { r:'2.3', fill:V2.ivory, stroke:'rgb(10,10,16)', 'stroke-width':'1', opacity:'0' });
  return { i, key, T, el, line, halo, dot, len:40, side:1, w:0, h:0 };
});
function fillLabels(){
  const nar = narrowNow();
  LAB.forEach(l => {
    const T = l.T, n = String(l.i + 1).padStart(2, '0');
    const hi = T.high && T.high.m ? kit.fmtM(T.high.m).toUpperCase() : '';
    // the brief's label: number, name and days in mono, the trek's high point under it
    l.el.innerHTML = nar
      ? '<span class="t"><b>' + n + '</b>' + NAME_S[l.key] + ' . ' + (T.daysLabel || '') + '</span>' + (hi ? '<span class="d">High point ' + hi + '</span>' : '')
      : '<span class="t"><b>' + n + '</b>' + NAME[l.key] + ' . ' + (T.daysLabel || '') + '</span>' + (hi ? '<span class="d">High point ' + hi + '</span>' : '');
    l.w = l.el.offsetWidth; l.h = l.el.offsetHeight;
  });
}

// the altitude scale: a hairline at the depth of the back sheet, one tick a kilometre
const SCALE = { line:sv('line', { stroke:V2.ivory, 'stroke-width':'1', 'stroke-opacity':'0.3' }), ticks:[], labs:[] };
for(let m=0; m<=8000; m+=1000){
  SCALE.ticks.push({ m, el:sv('line', { stroke:V2.ivory, 'stroke-width':'1', 'stroke-opacity':(m % 2000 ? 0.26 : 0.46) }) });
  if(m % 2000 === 0){
    const el = document.createElement('div'); el.className = 'hz-tick';
    el.textContent = m === 8000 ? kit.fmtM(m).toUpperCase() : kit.fmtN(m);
    labsEl.appendChild(el); SCALE.labs.push({ m, el });
  }
}

// phone: the readout sits under the book, the scale note by default and a trek's numbers on touch
function capDefault(){
  return '<p class="k"><b class="sq"></b>&nbsp; Real skylines . one scale . table at sea level</p>' +
    '<p class="p">Everest stands at the back because it would hide the others.</p>';
}
function capTrek(i){
  const T = TREKS[i] || {}, n = String(i + 1).padStart(2, '0');
  return '<p class="k"><b>' + n + '</b>' + (T.name || '') + ' . ' + VIEW[KEYS[i]] + '</p>' +
    '<div class="row">' + cells(T, true) + '</div>' +
    '<p class="p">' + dryOf(i) + '</p>';
}
capMain.innerHTML = capDefault();
let capShown = -1;
function setCaption(i){
  if(i === capShown) return;
  capShown = i;
  if(i < 0){ capAlt.classList.add('off'); capMain.classList.remove('off'); }
  else { capAlt.innerHTML = capTrek(i); capAlt.classList.remove('off'); capMain.classList.add('off'); }
}

/* ============================================================
   6. POINTER, HOVER
   ============================================================ */
const PTR = { x:-1, y:-1, has:false, last:0 };
window.addEventListener('pointermove', (e) => { PTR.x = e.clientX; PTR.y = e.clientY; PTR.has = true; PTR.last = performance.now(); }, { passive:true });
window.addEventListener('pointerdown', (e) => { PTR.x = e.clientX; PTR.y = e.clientY; PTR.has = true; PTR.last = performance.now(); }, { passive:true });
document.documentElement.addEventListener('pointerleave', () => { PTR.has = false; });
let idxHover = -1;
idxRows.forEach((li, k) => {
  li.tabIndex = 0;
  li.addEventListener('pointerenter', () => { idxHover = k; });
  li.addEventListener('pointerleave', () => { if(idxHover === k) idxHover = -1; });
  li.addEventListener('focus', () => { idxHover = k; });
  li.addEventListener('blur', () => { if(idxHover === k) idxHover = -1; });
});
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickLayer(){
  if(!PTR.has || !BOOK) return -1;
  ndc.set((PTR.x/window.innerWidth)*2 - 1, -(PTR.y/window.innerHeight)*2 + 1);
  ray.setFromCamera(ndc, kit.camera);
  const hits = ray.intersectObjects(BOOK.layers.map(L => L.mesh), false);
  for(const h of hits){
    const L = h.object.userData.hz; if(!L || !h.uv) continue;
    const px = Math.max(0, Math.min(L.cw - 1, Math.floor(h.uv.x*L.cw))), py = Math.max(0, Math.min(L.ch - 1, Math.floor((1 - h.uv.y)*L.ch)));
    let a = 255; try{ a = L.probe.getImageData(px, py, 1, 1).data[1]; }catch(err){}
    if(a > 128) return L.i;
  }
  return -1;
}

/* ============================================================
   7. CAMERA POSE, fitted to the window the way V1 fits its rail
   ============================================================ */
const _fit = new THREE.PerspectiveCamera();
const POSE = { pos:new THREE.Vector3(), tgt:new THREE.Vector3(), fov:30 };
function fitHero(){
  const B = BOOK, C = narrowNow() ? CAM.phone : CAM.desk, fov = C.FOV, el = C.EL*D2R;
  const hw = B.W*0.5, sw = SW*0.5, top = B.sky.y + PD;
  const pts = [
    new THREE.Vector3(K.X - hw, 0, ZL[0] + 0.2), new THREE.Vector3(K.X + hw, 0, ZL[0] + 0.2),
    new THREE.Vector3(K.X - sw, top, ZS), new THREE.Vector3(K.X + sw, top, ZS),
    new THREE.Vector3(K.X - sw, 0.4, ZS), new THREE.Vector3(K.X + sw, 0.4, ZS)
  ];
  const box = C.BOX, dir = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
  _fit.fov = fov; _fit.aspect = window.innerWidth/Math.max(1, window.innerHeight); _fit.near = 0.1; _fit.far = 1000; _fit.updateProjectionMatrix();
  const t = B.centre.clone(), v = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  const bw = box[1] - box[0], bh = box[3] - box[2], bcx = (box[0] + box[1])*0.5, bcy = (box[2] + box[3])*0.5;
  const tanV = Math.tan(fov*Math.PI/360), tanH = tanV*_fit.aspect;
  let D = 26;
  for(let it=0; it<24; it++){
    _fit.position.copy(t).addScaledVector(dir, D); _fit.lookAt(t); _fit.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for(const p of pts){ v.copy(p).project(_fit); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    right.setFromMatrixColumn(_fit.matrixWorld, 0); up.setFromMatrixColumn(_fit.matrixWorld, 1);
    t.addScaledVector(right, ((x0 + x1)*0.5 - bcx)*tanH*D*0.9).addScaledVector(up, ((y0 + y1)*0.5 - bcy)*tanV*D*0.9);
    D *= Math.pow(Math.max((x1 - x0)/bw, (y1 - y0)/bh), 0.8);
  }
  POSE.pos.copy(t).addScaledVector(dir, D); POSE.tgt.copy(t); POSE.fov = fov;
}

/* ============================================================
   8. STATE: the intro drives IS, the cursor drives the springs
   ============================================================ */
const IS = { sky:0, dawn:0, sunY:0, sunI:0, room:0, cam:0, input:0, lead:0, labs:0, scale:0, note:0, copy:0, g:[{v:0},{v:0},{v:0},{v:0},{v:0}] };
const SUN = { x:{ p:(K.SUN_U - 0.5)*6.86, v:0 }, y:{ p:0, v:0 } };
const PAR = { x:{ p:0, v:0 }, y:{ p:0, v:0 } };
let hover = -1;
function spring(s, target, k, c, dt){
  if(SNAP){ s.p = target; s.v = 0; return s.p; }
  s.v += (target - s.p)*k*dt - s.v*c*dt; s.p += s.v*dt; return s.p;
}

const KEY = kit.key, HEMI = kit.hemi, FILL = kit.fill;
const V1SH = { r:null, mine:null };
const _sunW = new THREE.Vector3(), _v = new THREE.Vector3(), _w = new THREE.Vector3(), _pos = new THREE.Vector3(), _tgt = new THREE.Vector3();
const _c1 = new THREE.Color(), _kc = new THREE.Color('#FFC48A'), _hs = new THREE.Color('#2E3358'), _hg = new THREE.Color('#0C0B0B'), _fc = new THREE.Color('#8D96D0');
const _y = new THREE.Vector3(0, 1, 0), _xAxis = new THREE.Vector3();
const ROOM_BG = new THREE.Color('#070708');
const _kp = new THREE.Vector3(), _kt = new THREE.Vector3(), _fp = new THREE.Vector3();
let handed = false;
const UPLOADED = new Set();

// the boot frame renders before the first tick with V1's camera: keep the table black until the hero owns the light
const tableCol = kit.table.material.color.clone();
kit.table.material.color.setScalar(0);

function setShadowRadius(r){
  const sc = KEY.shadow.camera;
  if(Math.abs(sc.right - r) < 1e-3) return;
  sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.updateProjectionMatrix();
}
function handOff(){
  // hx = 1: V1 already put the camera on homeCam this frame. give the fov and the shadow
  // frustum back the way V1 last left them, and stop drawing anything of ours
  kit.setFov(kit.homeCam().fov);
  if(V1SH.r !== null) setShadowRadius(V1SH.r);
  kit.mapRoot.visible = true;
  ROOT.visible = false;
  root.style.visibility = 'hidden';
  handed = true;
}

/* ============================================================
   9. FRAME
   ============================================================ */
function setT(el, key, val){ if(el['_' + key] !== val){ el['_' + key] = val; el.style[key] = val; } }
function setA(el, key, val){ if(el['_' + key] !== val){ el['_' + key] = val; el.setAttribute(key, val); } }
const _sp = new THREE.Vector3();
function scr(v){ _sp.copy(v).project(kit.camera); return [(_sp.x*0.5 + 0.5)*window.innerWidth, (-_sp.y*0.5 + 0.5)*window.innerHeight, _sp.z]; }

function frame(dt, t, hx){
  if(!BOOK) return;
  if(firstFrame){ firstFrame = false; kit.table.material.color.copy(tableCol); MATS.forEach(m => { m.colorWrite = true; m.depthWrite = m._dw !== false; }); }
  const B = BOOK, xh = clamp01(hx);
  if(xh >= 0.9995){ if(!handed) handOff(); return; }
  if(handed){ handed = false; ROOT.visible = true; root.style.visibility = ''; }
  // map No. 01 is hidden while we play, so its freshly printed panels would all upload in the
  // hand-over frame. upload each one as V1 prints it instead
  if(kit.PANEL) for(const P of kit.PANEL){ if(P.printed && !UPLOADED.has(P)){ UPLOADED.add(P); try{ kit.renderer.initTexture(P.map); }catch(err){} } }
  // the cover's place, read from V1's own mesh the first time the map is shut
  if(!coverSeated && kit.FOLD && kit.FOLD.M < 1e-4 && kit.FOLD.uc < 1e-4){ seatCover(true); coverSeated = true; }
  dt = Math.min(dt, 0.05);

  // ---- the exit's clocks ----
  const wCam = eIO(seg(xh, 0.12, 1.0));
  const wLight = sm(seg(xh, 0.32, 0.93));
  const sunset = sm(seg(xh, 0.04, 0.58));
  const exitDom = seg(xh, 0.0, 0.10);

  // ---- camera first: the fitted pose, a little parallax, a slow push in the intro.
  // the sun's cursor ray below has to be cast from this camera, not the one V1 left ----
  const px = PTR.has ? (PTR.x/window.innerWidth)*2 - 1 : 0, py = PTR.has ? (PTR.y/window.innerHeight)*2 - 1 : 0;
  const ax = spring(PAR.x, px*IS.input, 22, 8.5, dt), ay = spring(PAR.y, py*IS.input, 22, 8.5, dt);
  _v.copy(POSE.pos).sub(POSE.tgt);
  _v.multiplyScalar(1 + 0.08*(1 - IS.cam));
  _v.applyAxisAngle(_y, -ax*K.PARALLAX[0]*D2R);
  _xAxis.set(1, 0, 0).applyAxisAngle(_y, -ax*K.PARALLAX[0]*D2R);
  _v.applyAxisAngle(_xAxis, ay*K.PARALLAX[1]*D2R);
  _pos.copy(POSE.tgt).add(_v);
  _tgt.copy(POSE.tgt); _tgt.y += 0.35*(1 - IS.cam);
  kit.blendCam(_pos, _tgt, POSE.fov, wCam);
  kit.camera.updateMatrixWorld();

  // ---- the sun: the cursor carries it along the horizon ----
  const restX = (K.SUN_U - 0.5)*B.W;
  let tx = restX, ty = B.sunY0;
  if(idxHover >= 0 && IS.input > 0){
    // hovering the index sends the sun behind that trek's summit
    const L = B.layers[idxHover];
    tx = lerp(restX, L.peak.x - K.X, IS.input);
  } else if(PTR.has && IS.input > 0){
    // the point on the sky under the cursor
    ndc.set((PTR.x/window.innerWidth)*2 - 1, -(PTR.y/window.innerHeight)*2 + 1);
    ray.setFromCamera(ndc, kit.camera);
    const o = ray.ray.origin, d = ray.ray.direction;
    if(Math.abs(d.z) > 1e-4){
      const k = (ZS + 0.02 - o.z)/d.z, wx = o.x + d.x*k - K.X, wy = o.y + d.y*k;
      const cx = Math.max(-B.W*0.40, Math.min(B.W*0.40, wx));     // the whole disc stays on the sky
      const cy = B.sunY0 + Math.max(-0.8, Math.min(0.6, (wy - B.sunY0)*0.30));
      tx = lerp(restX, cx, IS.input); ty = lerp(B.sunY0, cy, IS.input);
    }
  } else if(!kit.REDUCED){
    // left alone, the sun drifts a little so the page never sits still
    tx = restX + Math.sin(t*0.13)*B.W*0.07*IS.input;
  }
  // rising in the intro, setting in the exit
  ty = lerp(B.sunY0*0.05, ty, IS.sunY) - sunset*B.sunY0*0.80;
  const sx = spring(SUN.x, tx, K.SUN_K, K.SUN_C, dt);
  let sy;
  if(IS.sunY < 0.999){ SUN.y.p = sy = ty; SUN.y.v = 0; }     // the rise belongs to the intro, not the spring
  else sy = spring(SUN.y, ty, K.SUN_K*1.2, K.SUN_C*1.1, dt);
  _sunW.set(K.X + sx, sy, ZS + 0.03);
  SKY.uSunUV.value.set(sx/SW + 0.5, (sy - B.sky.y)/PD);
  SKY.uSunR.value = 0.32/PD;

  // ---- the sun in the camera's frame, for the glow ----
  _w.copy(_sunW).applyMatrix4(kit.camera.matrixWorldInverse).normalize();
  SH.uSunV.value.copy(_w);

  // ---- sky ----
  SKY.uSkyI.value = IS.sky*(1 - sm(seg(xh, 0.40, 0.70))*0.95);
  SKY.uDawn.value = IS.dawn*(1 - sunset*0.85);
  SKY.uSunI.value = IS.sunI*(1 - sm(seg(xh, 0.30, 0.58)));

  // ---- lights: the sun from behind, a dim dawn room, then V1 again ----
  const room = IS.room*(1 - sunset*0.6);
  if(V1SH.mine !== null && Math.abs(KEY.shadow.camera.right - V1SH.mine) > 1e-3) V1SH.r = KEY.shadow.camera.right;
  if(V1SH.r === null) V1SH.r = KEY.shadow.camera.right;
  _kp.copy(KEY.position); _kt.copy(KEY.target.position); _fp.copy(FILL.position);
  {
    // azimuth from the sun's place on the horizon, height kept so the light reaches the table
    const az = Math.atan2(sx, 13.0), elv = (36 - 8*sunset)*D2R, c = B.centre;
    _v.set(Math.sin(az)*Math.cos(elv), Math.sin(elv), -Math.cos(az)*Math.cos(elv)).multiplyScalar(40).add(c);
    KEY.position.lerpVectors(_v, _kp, wLight);
    KEY.target.position.lerpVectors(c, _kt, wLight);
    _c1.copy(_kc).lerp(KEY.color, wLight); KEY.color.copy(_c1);
    KEY.intensity = lerp(2.3*IS.room*(1 - sunset*0.85), KEY.intensity, wLight);
    _c1.copy(_hs).lerp(HEMI.color, wLight); HEMI.color.copy(_c1);
    _c1.copy(_hg).lerp(HEMI.groundColor, wLight); HEMI.groundColor.copy(_c1);
    HEMI.intensity = lerp(1.0*room, HEMI.intensity, wLight);
    _c1.copy(_fc).lerp(FILL.color, wLight); FILL.color.copy(_c1);
    FILL.intensity = lerp(0.28*room, FILL.intensity, wLight);
    FILL.position.lerpVectors(_v.set(K.X - 3, 7, 24), _fp, wLight);
    setShadowRadius(lerp(8.0, V1SH.r, wLight)); V1SH.mine = KEY.shadow.camera.right;
  }
  POOL.U.uFade.value = 1 - IS.room*(1 - wLight);
  _c1.setRGB(0, 0, 0).lerp(ROOM_BG, IS.sky).lerp(kit.scene.background, wLight);
  kit.scene.background.copy(_c1); kit.scene.fog.color.copy(_c1);

  // ---- hover: the cursor or the index lifts a layer ----
  const canHover = xh < 0.04 && IS.input > 0.5;
  const picked = canHover ? (idxHover >= 0 ? idxHover : pickLayer()) : -1;
  if(picked !== hover){
    hover = picked;
    idxRows.forEach((li, k) => li.classList.toggle('on', k === hover));
    LAB.forEach(l => l.el.classList.toggle('on', l.i === hover));
    setCaption(hover);
  }

  // ---- the layers: fold, lift, light ----
  for(const L of B.layers){
    // front first. each sheet folds forward onto the table on its own spring
    const fs = 0.08 + L.i*0.065;
    const ft = HALF_PI*sm(seg(xh, fs, fs + 0.15));
    spring(L.fold, ft, 64, 8.4, dt);
    // paper cannot pass through paper: a sheet is never further over than the one in front of it
    if(L.i > 0){ const F = B.layers[L.i - 1].fold; if(L.fold.p > F.p){ L.fold.p = F.p; L.fold.v = Math.min(L.fold.v, F.v); } }
    if(L.fold.p > HALF_PI){ L.fold.p = HALF_PI; if(L.fold.v > 0) L.fold.v *= -0.22; }
    spring(L.lift, hover === L.i ? K.LIFT : 0, 120, 13, dt);
    const f = Math.min(HALF_PI, Math.max(0, L.fold.p)), ff = f/HALF_PI;
    L.hinge.rotation.x = f;
    L.hinge.position.y = L.lift.p*(1 - ff) + ff*ff*L.stackY;
    L.PU.uWarp.value = 0.014*(1 - 0.92*ff);
    L.U.uGlow.value = GLOW[L.i]*IS.g[L.i].v*(1 - sunset*0.92)*Math.cos(f);
    L.U.uHaze.value = HAZE[L.i]*IS.room*(1 - sunset*0.7);
    L.U.uHot.value = lerp(L.U.uHot.value, hover === L.i ? 1 : 0, 1 - Math.exp(-dt*9));
  }
  // the sky folds over the stack last, like the cover of the book
  {
    const sky = B.sky, fs = 0.44, ft = HALF_PI*sm(seg(xh, fs, fs + 0.22));
    spring(sky.fold, ft, 38, 7.2, dt);
    const E = B.layers[4].fold;
    if(sky.fold.p > E.p){ sky.fold.p = E.p; sky.fold.v = Math.min(sky.fold.v, E.v); }
    if(sky.fold.p > HALF_PI){ sky.fold.p = HALF_PI; if(sky.fold.v > 0) sky.fold.v *= -0.2; }
    const f = Math.min(HALF_PI, Math.max(0, sky.fold.p));
    sky.hinge.rotation.x = f;
    sky.cover.castShadow = f > 1.0;
    // landed: the closed book is map No. 01, so the page's own map takes over in the same frame
    const landed = ft >= HALF_PI - 1e-6 && f > HALF_PI - 0.004 && Math.abs(sky.fold.v) < 0.35;
    if(landed !== sky.landed){ sky.landed = landed; BOOKG.visible = !landed; kit.mapRoot.visible = landed; }
  }

  // ---- DOM ----
  domFrame(xh, exitDom);
}

const _pk = new THREE.Vector3(), _sa = new THREE.Vector3();
function domFrame(xh, ex){
  const B = BOOK;
  // headline: the lines leave up through their masks, top line first
  h1Outs.forEach((el, l) => {
    const e = eIn(seg(xh, 0.0 + l*0.022, 0.085 + l*0.022));
    setT(el, 'transform', e > 0 ? 'translate3d(0,' + (-112*e).toFixed(2) + '%,0)' : 'none');
  });
  const fade = 1 - sm(ex);
  setT(eyeEl, 'opacity', (IS.copy*fade).toFixed(3));
  setT(eyeEl, 'transform', 'translate3d(0,' + ((1 - IS.copy)*10 - 12*ex).toFixed(1) + 'px,0)');
  setT(ledeEl, 'opacity', (IS.copy*fade).toFixed(3));
  setT(ledeEl, 'transform', 'translate3d(0,' + ((1 - IS.copy)*12 - 14*ex).toFixed(1) + 'px,0)');
  if(idxEl) setT(idxEl, 'opacity', (Math.min(1, IS.copy*2)*fade).toFixed(3));
  idxRows.forEach((li, k) => {
    const a = clamp01(IS.copy*1.5 - 0.1 - k*0.1);
    setT(li, 'opacity', (a*fade).toFixed(3));
    setT(li, 'transform', 'translate3d(0,' + ((1 - a)*10 - 14*ex).toFixed(1) + 'px,0)');
  });
  setT(noteEl, 'opacity', (IS.note*fade).toFixed(3));
  setT(noteEl, 'transform', 'translate3d(0,' + ((1 - IS.note)*8 + 10*ex).toFixed(1) + 'px,0)');
  const capEl = capMain.parentNode;
  setT(capEl, 'opacity', (IS.note*fade).toFixed(3));

  // labels and leaders, glued to the peaks
  const out = sm(seg(xh, 0.0, 0.065)), labA = IS.labs*(1 - out), lead = IS.lead*(1 - out);
  for(const l of LAB){
    const L = B.layers[l.i];
    _pk.copy(L.peak); _pk.y += L.hinge.position.y;
    const p = scr(_pk), len = l.len*lead;
    const x = p[0].toFixed(1), y1 = (p[1] - 4).toFixed(1), y2 = (p[1] - Math.max(4, len)).toFixed(1);
    setA(l.line, 'x1', x); setA(l.line, 'x2', x); setA(l.line, 'y1', y1); setA(l.line, 'y2', y2);
    setA(l.halo, 'x1', x); setA(l.halo, 'x2', x); setA(l.halo, 'y1', y1); setA(l.halo, 'y2', y2);
    setA(l.dot, 'cx', x); setA(l.dot, 'cy', p[1].toFixed(1));
    const on = hover === l.i ? 1 : 0, la = Math.min(1, lead*3)*(0.5 + 0.4*on);
    setA(l.line, 'stroke-opacity', la.toFixed(3)); setA(l.halo, 'stroke-opacity', (la*0.35).toFixed(3));
    setA(l.dot, 'opacity', (Math.min(1, IS.lead*4)*(1 - out)).toFixed(3));
    const lx = l.side > 0 ? p[0] + 8 : p[0] - 8 - l.w, ly = p[1] - len - 3;
    setT(l.el, 'transform', 'translate3d(' + lx.toFixed(1) + 'px,' + (ly + (1 - IS.labs)*7).toFixed(1) + 'px,0)');
    setT(l.el, 'opacity', (labA*(hover >= 0 && hover !== l.i ? 0.45 : 1)).toFixed(3));
  }

  // the scale, at the depth of the back sheet, just right of the book
  const sxw = K.X + PW*0.5 + 0.30, sz = B.layers[4].z;
  const s0 = scr(_sa.set(sxw, 0, sz)), s1 = scr(_sa.set(sxw, 8000*B.S, sz));
  const sa = IS.scale*(1 - out);
  const top = lerp(s0[1], s1[1], IS.scale);
  // the nearer sheets look wider than the back one, so their right ends cover the scale's foot
  let cut = 1e9;
  for(let i=0;i<4;i++){
    const L = B.layers[i];
    if(L.fold.p > 0.2) continue;
    const e = scr(_sa.set(L.x + L.W*0.5, 0, L.z));
    if(e[0] < s0[0] + 2) continue;
    for(let j=NS - 1; j>=0; j-=6){
      const q = scr(_sa.set(L.x - L.W*0.5 + L.W*j/(NS - 1), L.P.m[j]*B.S + L.hinge.position.y, L.z));
      if(q[0] <= s0[0]){ cut = Math.min(cut, q[1] - 6); break; }
    }
  }
  const foot = Math.min(s0[1], cut);
  setA(SCALE.line, 'x1', s0[0].toFixed(1)); setA(SCALE.line, 'y1', Math.max(top, foot).toFixed(1));
  setA(SCALE.line, 'x2', s1[0].toFixed(1)); setA(SCALE.line, 'y2', top.toFixed(1));
  setA(SCALE.line, 'opacity', sa.toFixed(3));
  for(const tk of SCALE.ticks){
    const q = scr(_sa.set(sxw, tk.m*B.S, sz)), vis = q[1] >= top - 0.5 && q[1] <= foot ? sa : 0;
    setA(tk.el, 'x1', q[0].toFixed(1)); setA(tk.el, 'x2', (q[0] + (tk.m % 2000 ? 4 : 7)).toFixed(1));
    setA(tk.el, 'y1', q[1].toFixed(1)); setA(tk.el, 'y2', q[1].toFixed(1));
    setA(tk.el, 'opacity', vis.toFixed(3));
  }
  for(const lb of SCALE.labs){
    const q = scr(_sa.set(sxw, lb.m*B.S, sz)), vis = q[1] >= top - 0.5 && q[1] <= foot + 4 ? sa : 0;
    setT(lb.el, 'transform', 'translate3d(' + (q[0] + 11).toFixed(1) + 'px,' + (q[1] - 6).toFixed(1) + 'px,0)');
    setT(lb.el, 'opacity', vis.toFixed(3));
  }
}

/* ---- label layout, done once per resize at the rest pose so the leaders never jitter.
   every label sits in the sky above the whole silhouette, clear of the others ---- */
function layoutLabels(){
  const B = BOOK; if(!B) return;
  const cam = kit.camera, sp = cam.position.clone(), sq = cam.quaternion.clone(), sf = cam.fov, sa = cam.aspect;
  cam.position.copy(POSE.pos); cam.lookAt(POSE.tgt);
  cam.fov = POSE.fov; cam.aspect = window.innerWidth/Math.max(1, window.innerHeight); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  try{ placeLabels(B); } finally {
    cam.position.copy(sp); cam.quaternion.copy(sq); cam.fov = sf; cam.aspect = sa; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  }
}
function placeLabels(B){
  fillLabels();
  const W = window.innerWidth, nar = narrowNow(), v = new THREE.Vector3();
  // every ridge on screen, so a label never sits across a lit edge
  const ridges = [];
  for(const L of B.layers) for(let j=0;j<NS;j+=2){ v.set(L.x - L.W*0.5 + L.W*j/(NS - 1), L.P.m[j]*B.S, L.z); const p = scr(v); ridges.push(p[0], p[1]); }
  // the glow sits just under each cut, so a ridge counts as in the way from a little above the label to just below it
  const crossesRidge = (r) => { for(let k=0;k<ridges.length;k+=2){ const x = ridges[k], y = ridges[k+1]; if(x > r[0] - 2 && x < r[2] + 2 && y > r[1] - 14 && y < r[3] + 5) return true; } return false; };
  const copyEl = root.querySelector('.hz-copy').getBoundingClientRect();
  const copyR = nar ? null : [copyEl.left - 10, copyEl.top - 10, copyEl.right + 20, copyEl.bottom + 10];
  const topLimit = nar ? (root.querySelector('.hz-lede').getBoundingClientRect().bottom + 10) : 84;
  // the altitude scale's labels are in the way too
  const placed = SCALE.labs.map(lb => { const q = scr(_sa.set(K.X + PW*0.5 + 0.30, lb.m*B.S, B.layers[4].z)); return { r:[q[0] - 4, q[1] - 10, q[0] + 64, q[1] + 8], x:-99, y0:0, y1:0 }; });
  { const q0 = scr(_sa.set(K.X + PW*0.5 + 0.30, 0, B.layers[4].z)), q1 = scr(_sa.set(K.X + PW*0.5 + 0.30, 8000*B.S, B.layers[4].z)); placed.push({ r:[q0[0] - 3, q1[1], q0[0] + 3, q0[1]], x:-99, y0:0, y1:0 }); }
  const order = LAB.slice().sort((a, b) => scr(B.layers[a.i].peak)[0] - scr(B.layers[b.i].peak)[0]);
  const hit = (r, q) => !(r[2] < q[0] || q[2] < r[0] || r[3] < q[1] || q[3] < r[1]);
  for(const l of order){
    const p = scr(B.layers[l.i].peak);
    let best = null;
    // first pass keeps clear of every lit edge, the second only of the other labels
    for(let pass = 0; pass < 2 && !best; pass++)
    for(let len = nar ? 16 : 22; len < 420 && !best; len += 5){
      for(const side of [1, -1]){
        const x0 = side > 0 ? p[0] + 8 : p[0] - 8 - l.w, y0 = p[1] - len - 3;
        const r = [x0 - 6, y0 - 3, x0 + l.w + 6, y0 + l.h + 3];
        if(r[0] < 6 || r[2] > W - 6 || r[1] < topLimit) continue;
        if(pass === 0 && crossesRidge(r)) continue;
        if(copyR && hit(r, copyR)) continue;
        if(placed.some(q => hit(r, q.r) || (q.x > r[0] - 3 && q.x < r[2] + 3 && q.y1 > r[1] && q.y0 < r[3]))) continue;
        // and our own leader must not run through a placed label
        if(placed.some(q => p[0] > q.r[0] - 3 && p[0] < q.r[2] + 3 && p[1] > q.r[1] && y0 < q.r[3])) continue;
        best = { len, side, r }; break;
      }
    }
    if(!best) best = { len:40, side:1, r:[p[0], p[1] - 40, p[0] + l.w, p[1]] };
    l.len = best.len; l.side = best.side;
    l.el.classList.toggle('r', best.side < 0);
    placed.push({ r:best.r, x:p[0], y0:p[1] - best.len, y1:p[1] });
  }
}

/* ============================================================
   10. RESIZE, INTRO, TOUR
   ============================================================ */
function resize(){
  fillCopy();
  fitHero();
  layoutLabels();
}
build();

function intro(){
  // nothing of ours shows before this, and the header waits for the light
  gsap.set('.top', { autoAlpha:0, y:-10 });
  gsap.set(h1Ins, { yPercent:118 });
  const tl = gsap.timeline({ defaults:{ ease:'power2.out' } });
  if(kit.REDUCED){
    Object.assign(IS, { sky:1, dawn:1, sunY:1, sunI:1, room:1, cam:1, input:1, lead:1, labs:1, scale:1, note:1, copy:1 });
    IS.g.forEach(g => g.v = 1);
    tl.to('.top', { autoAlpha:1, y:0, duration:0.4 }, 0).set(h1Ins, { yPercent:0 }, 0);
    return tl;
  }
  tl.to(IS, { sky:1, duration:2.4, ease:'power2.inOut' }, 0.05)
    .to(IS, { sunY:1, duration:3.0, ease:'power3.out' }, 0.0)
    .to(IS, { sunI:1, duration:1.6, ease:'power2.out' }, 0.35)
    .to(IS, { dawn:1, duration:2.5, ease:'power1.inOut' }, 0.30)
    .to(IS, { room:1, duration:2.4, ease:'power2.inOut' }, 0.6)
    .to(IS, { cam:1, duration:3.8, ease:'power3.out' }, 0.0);
  // the glow fills the paper back to front
  for(let k=0;k<5;k++) tl.to(IS.g[4 - k], { v:1, duration:1.2, ease:'power2.out' }, 0.95 + k*0.17);
  tl.to('.top', { autoAlpha:1, y:0, duration:1.1, ease:'power3.out' }, 1.0)
    .to(h1Ins, { yPercent:0, duration:1.5, stagger:0.13, ease:'power4.out' }, 0.75)
    .to(IS, { copy:1, duration:1.1, ease:'power2.out' }, 1.4)
    .to(IS, { lead:1, duration:0.9, ease:'power3.inOut' }, 1.9)
    .to(IS, { labs:1, duration:0.8, ease:'power2.out' }, 2.3)
    .to(IS, { scale:1, duration:1.1, ease:'power3.inOut' }, 2.0)
    .to(IS, { note:1, duration:0.9, ease:'power2.out' }, 2.45)
    .to(IS, { input:1, duration:1.0, ease:'power1.inOut' }, 2.3);
  return tl;
}

function tour(){
  // every point is read live from the scene, so the path holds on any window
  const sky = (u, k) => () => { const b = BOOK; const p = scr(_sa.set(K.X + (u - 0.5)*b.W, b.ridgeTop + (k || 0.5), b.layers[4].z)); return [p[0], p[1]]; };
  // a point well inside a layer's visible band, just under its highest point
  const onLayer = (i, du) => () => { const b = BOOK, L = b.layers[i]; const p = scr(_sa.copy(L.peak).setX(L.peak.x + (du || 0)*b.W).setY(L.peak.y - 0.24)); return [p[0], p[1]]; };
  return [
    { t:0, at:sky(K.SUN_U, 0.9) },
    { t:3.3, at:sky(K.SUN_U, 0.9) },
    { t:3.9, at:sky(0.08, 0.45) },
    { t:6.0, at:sky(0.92, 0.45) },
    { t:6.7, at:onLayer(3, 0.03) },
    { t:7.6, at:onLayer(3, 0.03) },
    { t:8.0, at:onLayer(4, -0.04) },
    { t:8.8, at:onLayer(4, -0.04) },
    { t:9.4, at:sky(K.SUN_U, 0.9) },
    { t:18, at:sky(K.SUN_U, 0.9) }
  ];
}

const TIMING = { factory:0 };
window.HZ = { TIMING, K, IS, PROF, get BOOK(){ return BOOK; }, POSE, SUN, LAB, scr, layoutLabels, fitHero, POOL };

// the kit prints the V2 cover after this factory returns. the sky's back wears the same canvas
function onCover(cv){
  const m = BOOK && BOOK.sky.coverMat.map;
  if(m){ m.image = cv; m.needsUpdate = true; }
}

TIMING.factory = Math.round(performance.now() - T0);
return { name:'spot', intro, frame, resize, tour, onCover };
};
})();
