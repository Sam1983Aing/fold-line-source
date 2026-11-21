/* ============================================================
   FOLD LINE V6 . HOW YOU MOVE BETWEEN THE TREKS: THE TURNTABLE
   Sam's pick of the switching round (16 to 17 Oct 2026). He had said the hover "doesn't feel as responsive, it takes a
   while", asked for five ideas, and named the one he liked: "the book rotating from left to right, with some kind of
   spotlight on it". Five were recorded next to the hover (teach/shots/v6-switch-round1/) and he kept the Turntable:
   the five maps lie round a lazy susan under one tight spotlight, and the table turns left to right to bring the next
   one into the light, where its mountain grows.
   Display Stand, Board Book, Hand of Cards and Spotlight are at commit 1489c92 behind ?switch=stand|book|fan|spot.

   fold.js hands this file three things through a few hooks:
   - pose(M, t, hx, dt): where every map lies this frame (the table's angle lives here on a spring, so a second click
     mid-turn carries on from wherever the table is)
   - sel and upI(t, hx): which trek is picked (the card on the right shows it at once) and when its mountain may stand
   - shot(): the camera's one shot. Nothing pans or leans, the table turns instead
   The card's arrows and numbers, the keyboard's arrows, a swipe, and a click on a map at the table's edge all call
   select(). On the scroll the table turns No. 01 back into the light, tied to the scroll so a hard flick still lands the
   dive on its pin. ?switch=hover gives back the hover and the lean of V5 and the start of V6, the before.
   Classic script, no modules.
   ============================================================ */
(function(){
'use strict';
const REG = window.FOLD_SWITCH = window.FOLD_SWITCH || {};

/* ---- what every option shares: the pick, the timing of the mountain, the screen boxes ---- */
function base(C, o){
  const S = { sel:C.walkI || 0, prev:C.walkI || 0, t0:-9, sinkS:0.45, poolK:42, poolC:11.5, lampAngle:42*C.D2R };
  S.select = (i, d) => {
    if(i === S.sel || i < 0 || i > 4) return;
    S.prev = S.sel; S.sel = i; S.t0 = C.gsap.ticker.time;
    if(o.onSelect) o.onSelect(S.prev, i, d);
  };
  S.upI = (t, hx) => {
    // the scroll brings No. 01 back first, the option's own way. not for a second after a pick, while a pick made a little
    // way into the scroll glides the page back to the top (fold.js, toTop)
    const w = C.diveI !== undefined ? C.diveI : (C.walkI || 0);
    if(hx > 0.015 && S.sel !== w && t - S.t0 > 1.2) S.select(w);
    const it = C.introT(t);
    if(it < (o.first || C.K.FIRST)) return -1;
    return o.settled(t) ? S.sel : -1;
  };
  return S;
}
// the free room on screen, in NDC, for the trek on show: between the headline block and the card on a wide screen,
// between the headline block and the readout on a phone
function room(C, P, d, phone){
  const T = P.txt;
  if(C.NARROW) return [-0.9, 0.9, Math.max(-0.98, T.roT + (phone === undefined ? 0.05 : phone)), Math.min(0.9, T.headB - 0.05)];
  // d: [x0, x1, y0, y1], where x1 and y1 can be 'card' (just left of the card) and 'col' (between the headline and the card)
  const x0 = d[0] === 'col' ? T.headR + 0.03 : d[0], x1 = Math.min(0.94, T.sideL - 0.05);
  return [x0, x1, d[2], d[3]];
}
// corners of a map lying at x, y, z turned ry, and the same raised by h
function box(C, x, y, z, ry, w, d, h){
  const pts = [], c = Math.cos(ry), s = Math.sin(ry);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){
    const lx = sx*w*0.5, lz = sz*d*0.5;
    const px = x + lx*c + lz*s, pz = z - lx*s + lz*c;
    pts.push(C.V3(px, y, pz)); if(h) pts.push(C.V3(px, y + h, pz));
  }
  return pts;
}
const wrapPI = (a) => { a = (a + Math.PI) % (2*Math.PI); if(a < 0) a += 2*Math.PI; return a - Math.PI; };
// the tour for the options picked with the card's arrows: two treks on, the cursor on a mountain in between
function arrowTour(T){
  // (V6 arrows round: the cursor points at the next arrow, clicks, then the previous one, so the arrows' hover and click show.
  // It rests on the button's lower right edge, so the icon itself stays in view)
  const EL0 = T.EL, EL = (q) => { const f = EL0(q), dx = T.NARROW ? 12 : 16, dy = T.NARROW ? 10 : 13; return () => { const p = f(); return [p[0] + dx, p[1] + dy]; }; };
  T = Object.assign({}, T, { EL });
  // ?tour=nums: the cursor picks treks from the row of numbers instead (the numbers round, recordings)
  if(new URLSearchParams(location.search).get('tour') === 'nums'){
    const N = (i) => { const f = EL0(T.NARROW ? '.ro-nums button[data-i="' + i + '"]' : '.fc-num[data-i="' + i + '"]'); return () => { const p = f(); return [p[0] + 5, p[1] + 6]; }; };
    return [
      { t:0, at:[T.W*0.6, T.H*0.35] }, { t:3.6, at:[T.W*0.6, T.H*0.35] },
      { t:4.4, at:N(2) }, { t:5.2, at:N(2), click:true }, { t:7.4, at:N(4) }, { t:8.0, at:N(4), click:true },
      { t:10.2, at:N(0) }, { t:10.8, at:N(0), click:true }, { t:12.6, at:[T.W*0.6, T.H*0.35] }
    ];
  }
  if(T.NARROW) return [
    { t:0, at:[T.W*0.72, T.H*0.56] }, { t:3.6, at:[T.W*0.72, T.H*0.56] },
    { t:4.4, at:T.EL('.fo-arrow.next') }, { t:5.0, at:T.EL('.fo-arrow.next'), click:true },
    { t:7.2, at:T.EL('.fo-arrow.prev') }, { t:7.8, at:T.EL('.fo-arrow.prev'), click:true },
    { t:10.0, at:[T.W*0.62, T.H*0.5] }
  ];
  return [
    { t:0, at:[T.W*0.56, T.H*0.3] }, { t:3.6, at:[T.W*0.56, T.H*0.3] },
    { t:4.4, at:T.EL('.fo-arrow.next') }, { t:5.6, at:T.EL('.fo-arrow.next'), click:true },
    { t:7.2, at:T.EL('.fo-arrow.next') }, { t:8.0, at:T.EL('.fo-arrow.prev') },
    { t:9.2, at:T.EL('.fo-arrow.prev'), click:true }, { t:10.8, at:T.EL('.fo-arrow.prev') },
    { t:11.8, at:[T.W*0.56, T.H*0.3] }
  ];
}
/* ---- the board's wood (V6, after Sam: "focus a little more on texture, right now it feels a little blurry").
   The 3d-wood-material skill's timber, cut down for one board: a small periodic noise field baked once (512 x 512, about
   1.4 MB with its mips), read at several stretches in the fragment shader in the board's own space, so rings, pores,
   fibres and rays turn with the board and stay sharp at a grazing angle. Every fine layer fades out by its own screen
   footprint instead of smearing into a blur. Ebonized oak: black stain, the grain still showing ---- */
const WOOD_HASH = `
  vec2 hash2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453123)*2.0-1.0; }
  float hash1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }`;
let woodField = null;
function woodFieldTex(C){
  if(woodField) return woodField.texture;
  const THREE = C.THREE, R = C.kit.renderer;
  woodField = new THREE.WebGLRenderTarget(512, 512, { type:THREE.UnsignedByteType, depthBuffer:false, stencilBuffer:false,
    minFilter:THREE.LinearMipmapLinearFilter, magFilter:THREE.LinearFilter, generateMipmaps:true, wrapS:THREE.RepeatWrapping, wrapT:THREE.RepeatWrapping });
  woodField.texture.colorSpace = THREE.NoColorSpace;
  const bake = new THREE.ShaderMaterial({ depthTest:false, depthWrite:false,
    vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader:WOOD_HASH + `
      varying vec2 vUv;
      float pn(vec2 x){
        vec2 p = floor(x), w = fract(x), u = w*w*w*(w*(w*6.0-15.0)+10.0);
        float a = dot(hash2(mod(p,32.0)),w), b = dot(hash2(mod(p+vec2(1,0),32.0)),w-vec2(1,0));
        float c = dot(hash2(mod(p+vec2(0,1),32.0)),w-vec2(0,1)), d = dot(hash2(mod(p+vec2(1,1),32.0)),w-vec2(1,1));
        return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*0.70+0.5;
      }
      void main(){
        vec2 p = vUv*32.0; float n = pn(p);
        gl_FragColor = vec4(n, n*0.60 + pn(p*2.0+9.0)*0.27 + pn(p*4.0+27.0)*0.13, pn(p+vec2(31.7,11.9)), 1.0);
      }` });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bake); q.frustumCulled = false;
  const sc = new THREE.Scene(); sc.add(q);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), was = R.getRenderTarget();
  R.setRenderTarget(woodField); R.render(sc, cam); R.setRenderTarget(was);
  bake.dispose(); q.geometry.dispose();
  return woodField.texture;
}
function woodMat(C, o){
  const THREE = C.THREE;
  const m = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.62, metalness:0, ior:1.43, specularIntensity:0.72, clearcoat:0.12, clearcoatRoughness:0.5 });
  const U = { uPale:{ value:new THREE.Color(o.pale) }, uDark:{ value:new THREE.Color(o.dark) }, uGrain:{ value:o.grain || 0.5 },
    uRingFreq:{ value:o.ringFreq || 2.6 }, uBump:{ value:0.0024 }, uWoodField:{ value:woodFieldTex(C) } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vOP;
      uniform vec3 uPale, uDark; uniform float uGrain, uRingFreq, uBump; uniform sampler2D uWoodField;
      ${WOOD_HASH}
      vec3 tf(vec2 p){ return texture2D(uWoodField, p/32.0).rgb; }
      // the board top, flat sawn: grain runs along x, the pith wanders below the face so the rings draw long arcs
      vec4 woodTop(vec3 P){
        vec3 q = P*uGrain; float along = q.x; vec2 cr = q.zy; float across = cr.x;
        vec3 broad = tf(vec2(across, along)*vec2(0.92, 0.22)), curl = tf(vec2(across, along)*vec2(2.3, 0.38) + 17.0);
        float drift = (broad.r - 0.5)*0.72 + (curl.r - 0.5)*0.19;
        float radius = length((cr + vec2(-drift, 0.9))*vec2(1.0, 0.56));
        float growth = radius*uRingFreq + (curl.g - 0.5)*0.8;
        float phase = fract(growth), ring = floor(growth);
        float annual = tf(vec2(ring*0.73, 25.0)).r, lw = 0.065 + annual*0.21;
        float late = smoothstep(0.94 - lw, 0.97 - lw, phase)*(1.0 - smoothstep(0.965, 1.0, phase));
        float rp = fwidth(growth);
        late = mix(late, lw*0.65, smoothstep(0.16, 0.72, rp));
        float early = mix(pow(phase, 1.6), 0.38, smoothstep(0.18, 0.72, rp));
        vec2 vp = vec2((across + drift*0.25)*96.0, along*7.5); vec3 ves = tf(vp);
        float vpx = max(length(dFdx(vp)), length(dFdy(vp)));
        float pores = smoothstep(0.59, 0.75, ves.r)*smoothstep(0.40, 0.65, ves.b)*(1.0 - smoothstep(0.22, 0.9, vpx));
        vec2 fp = vec2(across*230.0, along*2.4); float fpx = max(length(dFdx(fp)), length(dFdy(fp)));
        float fib = (tf(fp).r - 0.5)*(1.0 - smoothstep(0.18, 0.85, fpx));
        float tone = 0.075 + late*0.40 + early*0.07 + pores*0.25 - fib*0.16 + (broad.g - 0.5)*0.23;
        float h = late*0.20*(1.0 - smoothstep(0.07, 0.24, rp)) - pores*0.42*(1.0 - smoothstep(0.05, 0.18, vpx)) + fib*0.09;
        return vec4(clamp(tone, 0.035, 0.83), 0.91 + late*0.13 + pores*0.19 + (broad.b - 0.5)*0.2, h, annual);
      }
      vec3 bumpN(vec3 pv, vec3 n, float h, float k){
        vec3 sx = dFdx(pv), sy = dFdy(pv), r1 = cross(sy, n), r2 = cross(n, sx); float det = dot(sx, r1);
        vec3 g = sign(det)*(dFdx(h)*k*r1 + dFdy(h)*k*r2); g *= min(1.0, abs(det)*0.38/max(length(g), 1e-20));
        return normalize(abs(det)*n - g);
      }`)
      .replace('#include <map_fragment>', '#include <map_fragment>\nvec4 W = woodTop(vOP);\ndiffuseColor.rgb *= mix(uPale, uDark, W.x)*(0.93 + W.w*0.095);')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = clamp(roughness*W.y, 0.35, 1.0);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = bumpN(-vViewPosition, normal, W.z, uBump);');
  };
  m.customProgramCacheKey = () => 'fold-wood-board';
  return m;
}

/* ============================================================
   THE TURNTABLE. Sam's idea, read one way: the five maps lie round a lazy susan, the lamp is a tight spot on the
   front of it, and the table turns left to right to bring the next map round into the light.
   V6 refinements (Sam, 17 Oct 2026): the board is wood that holds its grain at a grazing angle, the table turns on its
   own and slowly from trek to trek until someone takes over (an arrow, a number, a key, a swipe, a click, or the cursor
   on a map), and the arrows sit either side of the map in the light (fold.js places them at edges())
   ============================================================ */
REG.turntable = (C) => {
  const { THREE, MAPS, PW, PD, D2R, V3, lerp, smooth, seg, clamp01, gsap } = C;
  const R = 10.6, STEP = 72, H0 = 0.16;
  const SPOT = V3(3.6, 0, 0), CEN = V3(SPOT.x, 0, SPOT.z - R);
  // the walk map starts in the light (No. 01 on Tongariro's page, the walked trek's on the others)
  // a page opened to walk straight in (&enter=1, after a pick on another page) has the map already in the light: no intro turn
  const ENTER = new URLSearchParams(location.search).get('enter') === '1';
  const st = { phi:ENTER ? STEP*(C.walkI || 0) : -160, v:0, T:STEP*(C.walkI || 0), lastT:-1, k:15, c:7.4 };
  const RAD = R + PD*0.5 + 0.7, PL = window.LOOK && window.LOOK.pal;
  const wood = woodMat(C, PL && PL.board ? PL.board : { pale:'#6f4d2c', dark:'#2c1a0b', grain:1.0, ringFreq:5.2 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(RAD, RAD, H0, 160), [wood, wood, new THREE.MeshStandardMaterial({ color:0x0b0a09 })]);
  disc.position.set(CEN.x, H0*0.5, CEN.z); disc.receiveShadow = true; C.root.add(disc);
  // a turned groove near the rim, cut into the board: a crisp line the eye can follow round
  const groove = new THREE.Mesh(new THREE.RingGeometry(RAD - 0.62, RAD - 0.5, 200), new THREE.MeshStandardMaterial({ color:0x050506, roughness:0.9 }));
  groove.rotation.x = -Math.PI/2; groove.position.set(0, H0*0.5 + 0.002, 0); groove.receiveShadow = true; disc.add(groove);
  // the paper globe at the table's centre (hero/globe.js, Sam's idea of 17 Oct 2026). It turns to the trek in the light,
  // and with it on the camera stands square to the table, so the ring and the globe sit in the middle of the screen.
  // ?globe=off gives back the table as it was, the before
  // its size: 3.3 on a wide screen. a phone has only the height between the headline and the readout, so there it is
  // smaller and lower and the map in the light keeps its size
  const GQ = C.kit.Q.get('globe'), GAT = V3(CEN.x, 0, CEN.z);
  let GR = 3.3;
  // (Sam, after the first look: "slightly bigger and bring it down a little", so it fills the hub between the five books)
  const gSize = () => { GR = C.NARROW ? 2.7 : 3.95; GAT.y = H0 + (C.NARROW ? 0.3 : 0.38) + GR; };
  gSize();
  const GL = GQ !== 'off' && window.FOLD_GLOBE ? window.FOLD_GLOBE(C, { at:GAT, r:GR, floor:H0, light:V3(-0.29, 0.82, 0.5).normalize() }) : null;
  let gShade = null;
  if(GL){
    C.root.add(GL.root);
    // its soft shadow on the board, which does not turn with the board
    // an alphaMap is read from the green channel, so the falloff is drawn in grey on black. The first one was white with a
    // falling alpha, which the upload turns back into solid white: a hard disc (Sam: "a circle underneath")
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128);
    [[0, 1], [0.2, 0.86], [0.4, 0.56], [0.6, 0.27], [0.8, 0.08], [1, 0]].forEach(([at, v]) => g.addColorStop(at, 'rgb(' + Array(3).fill(Math.round(v*255)).join(',') + ')'));
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    gShade = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), new THREE.MeshBasicMaterial({ color:0x000000, alphaMap:new THREE.CanvasTexture(c), transparent:true, opacity:0, depthWrite:false }));
    gShade.rotation.x = -Math.PI/2; gShade.position.set(CEN.x, H0 + 0.004, CEN.z); gShade.scale.setScalar(GR); gShade.renderOrder = 1; C.root.add(gShade);
    document.documentElement.dataset.globe = 'on';
  }
  // the slow turn on its own: a long beat on each trek, a gentle turn to the next, and a pause whenever someone takes over
  const AUTO = { next:0, quietTill:0, hover:false }, DWELL = 6.2, USER = [15, 7.4], SLOW = [4.2, 3.9];
  const S = base(C, {
    settled:() => Math.abs(st.phi - st.T) < 3 && Math.abs(st.v) < 25,
    onSelect(a, b, d){
      const fwd = ((b - a) % 5 + 5) % 5, back = 5 - fwd;
      const go = d ? d : (fwd <= back ? 1 : -1);
      st.T += go > 0 ? STEP*fwd : -STEP*back;
    }
  });
  const turnTo = S.select;
  // anything from outside is a person: their pick turns at the normal pace and holds the slow turn off for a while
  S.select = (i, d) => { AUTO.quietTill = gsap.ticker.time + 14; st.k = USER[0]; st.c = USER[1]; turnTo(i, d); };
  S.hover = (i) => { AUTO.hover = i >= 0; };
  S.hint = 'Scroll down for lengths, guides and dates';
  S.tip = 'Swipe or tap a number to turn the table';
  S.lampAngle = (PL && PL.light ? 56 : 34)*D2R;
  let phiD = st.phi;
  // the end of a walk comes back to the hero with the walked map already in the light: no turn, the table is simply
  // there (Sam, 18 Oct: "fold it back and connect to the hero at the same selected position")
  S.snap = (i) => { if(i !== S.sel) turnTo(i); st.phi = st.T; st.v = 0; phiD = st.T; AUTO.quietTill = gsap.ticker.time + 14; };
  function tick(t, dt, hx){
    if(st.lastT === t) return; st.lastT = t;
    const it = C.introT(t);
    if(AUTO.hover) AUTO.quietTill = Math.max(AUTO.quietTill, t + 3);
    if(!C.REDUCED && it > C.K.FIRST && hx < 0.005){
      if(!AUTO.next) AUTO.next = t + DWELL;
      if(t >= AUTO.next && t >= AUTO.quietTill && Math.abs(st.phi - st.T) < 3){
        st.k = SLOW[0]; st.c = SLOW[1];
        turnTo((S.sel + 1) % 5, 1);
        AUTO.next = t + DWELL + 2.6;
      }
      if(AUTO.next < AUTO.quietTill) AUTO.next = AUTO.quietTill;
    }
    // only reduced motion snaps. (The Display Stand's "it > 30", meaning the intro is long over, was copied here once and
    // switched the spring off for good 30 s after the load: the table jumped from map to map. Sam found it, 17 Oct 2026)
    if(C.REDUCED){ st.phi = st.T; st.v = 0; }
    else if(it < 0.5){ st.phi = ENTER ? st.T : -160; st.v = 0; }      // the table turns into place as the lamp comes on
    else { const h = Math.min(dt, 0.034); st.v += ((st.T - st.phi)*st.k - st.v*st.c)*h; st.phi += st.v*h; }
    // on the scroll No. 01 comes back into the light at the table's own pace, but never later than the scroll says:
    // by 0.075 of the hero it is in place, so a hard flick still dives into a pin that has stopped moving
    phiD = lerp(st.phi, st.T, smooth(seg(hx, 0.015, 0.075)));
    disc.rotation.y = phiD*D2R;
    if(GL){
      // it comes up with the lamp and goes as the dive starts, so the pin in the light has the frame to itself
      const f = (C.REDUCED ? (it > 0 ? 1 : 0) : smooth(seg(it, 0.35, 1.8)))*(1 - smooth(seg(hx, 0.012, 0.07)));
      GL.update(t, dt, { sel:S.sel, k:st.k, c:st.c, f, cam:C.kit.camera });
      gShade.material.opacity = 0.5*f;
    }
  }
  S.pose = (M, t, hx, dt) => {
    tick(t, dt, hx);
    const th = (phiD - M.i*STEP)*D2R;
    const off = Math.abs(wrapPI(th));
    return { x:CEN.x + Math.sin(th)*R, y:H0, z:CEN.z + Math.cos(th)*R, ry:th,
      dim:lerp(1, 0.3, smooth(clamp01(off/(70*D2R)))) };
  };
  // where the arrows go: just outside the left and right edges of the map in the light, half way down it
  // tucked in beside the book (Sam: the right one sat on the trek's text on a taller window). fold.js also keeps the
  // right one clear of the card
  const EDGE = GL ? 0.62 : 1.3;
  S.edges = () => [V3(SPOT.x - PW*0.5 - EDGE, H0 + 0.6, SPOT.z + 0.6), V3(SPOT.x + PW*0.5 + EDGE, H0 + 0.6, SPOT.z + 0.6)];
  S.pool = () => ({ x:SPOT.x, z:SPOT.z + 0.4 });
  // V7: the gap between the globe's foot and the far edge of the map in the light, where the Explore the trail button sits
  S.gap = () => [V3(GAT.x, GL ? GAT.y - GR : H0 + 3.2, GAT.z), V3(SPOT.x, H0, SPOT.z - PD*0.5)];
  S.shot = (P) => {
    const pts = box(C, SPOT.x, H0, SPOT.z, 0, PW*1.12, PD*1.04, 2.6);
    if(GL){
      gSize(); GL.size(GR, GAT); gShade.scale.setScalar(GR);
      // square to the table, the map in the light and the globe above it on the screen's centre line. the globe's
      // outline and the tallest pin go into the fit, so neither the header nor the trek card can cut it
      for(let a = 0; a < 16; a++){
        const u = a/16*2*Math.PI;
        pts.push(V3(GAT.x + Math.cos(u)*GR, GAT.y + Math.sin(u)*GR, GAT.z), V3(GAT.x + Math.cos(u)*GR, GAT.y, GAT.z + Math.sin(u)*GR));
      }
      pts.push(V3(GAT.x, GAT.y + GR*1.06, GAT.z));
      const T = P.txt;
      // on a wide screen a band under the header stays clear for V7's navigation and section tabs (Sam: "a little bit
      // more lower ... in V7 we will need to add some tabs for the new section and the navigation")
      const Hh = window.innerHeight, band = Math.max(120, Math.min(170, Hh*0.16));
      const fr = C.NARROW ? [-0.92, 0.92, Math.max(-0.98, T.roT + 0.04), Math.min(0.9, T.headB - 0.03)]
                          : [-0.6, 0.6, -0.97, 1 - 2*band/Hh];
      return Object.assign(C.fit(pts, SPOT.clone(), C.NARROW ? 31 : 26, 0, C.NARROW ? 38 : 32, fr), { rest:SPOT.clone() });
    }
    return Object.assign(C.fit(pts, SPOT.clone(), C.NARROW ? 46 : 36, C.NARROW ? -4 : -6, C.NARROW ? 38 : 32, room(C, P, [-0.5, 0, -1.0, 0.0])), { rest:SPOT.clone() });
  };
  // a click on a globe pin picks its trek (fold.js asks when the click is on no map)
  S.pickAt = (nx, ny, cam) => GL ? GL.pinAt(nx, ny, cam) : -1;
  S.tour = arrowTour;
  return S;
};
})();
