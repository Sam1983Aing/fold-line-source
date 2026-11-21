/* ============================================================
   FOLD LINE V3 . HERO "fold" . THE DRAWER THAT GROWS MOUNTAINS
   The page's only hero from V5 (?hero=fold in V3 and V4). The hover is Lean In, Sam's pick
   from the three hover demos. Pick Up and Eye Level are in the history at commit 4f93378

   Five pocket maps on the dark bookcloth under one desk lamp (Map Drawer, round 1),
   and each one grows its real mountain out of its printed contours when you point
   at it (Contour Stack, round 1). One mountain stands at a time. While it stands
   the lamp drops low and to the side, so the light rakes across the terraces.

   How it is built:
   - The desk, the five maps, their six springs each, the lamp and the deal come from
     drawer.js. No. 01 is V1's real concertina (kit.mapRoot) under the V2 cover.
   - Each mountain is the stack.js card model: every card in ONE geometry with a
     per-vertex card index, a uniform table per card moved in the vertex shader, and a
     128 x 128 height texture so the fragment shader can draw each card's contact
     shadow, cut edge and contour line. Here the model is a child of its map's pivot,
     so it rides every spring the map has.
   - Growing is the stack's exit run backwards: every card starts as its own contour
     line lying on the print, the bottom one thickens first and lifts the rest.
   - Mountains are cut on the CPU a few levels a frame (No. 01 at boot, the rest in the
     background). Only the one standing and No. 01 keep their GPU buffers.
   - Classic script, no modules. Registers window.HERO_OPTIONS.fold.
   ============================================================ */
(function(){
'use strict';
window.HERO_OPTIONS = window.HERO_OPTIONS || {};

window.HERO_OPTIONS.fold = function(kit){
  const { THREE, gsap } = kit;
  const V2 = kit.V2, TREKS = kit.TREKS, KEYS = kit.KEYS, PW = kit.PW, PD = kit.PD;
  const PI = Math.PI, D2R = PI/180;
  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (v, a, b) => clamp01((v - a)/(b - a));
  const smooth = (t) => t*t*(3 - 2*t);
  const lerp = (a, b, t) => a + (b - a)*t;
  const eio = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const REDUCED = !!kit.REDUCED, DBG = !!kit.DEBUG;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // the dive, along the hero's stretch of scroll (hx 0 to 1)
  const X = {
    DOM: 0.1,              // the type has left by here
    SWEEP: [0.02, 0.15],   // when No. 05 leaves, and how long each map takes. the others follow 0.05 apart
    GROW: 0.14,            // No. 01's mountain is all the way up by here, whatever was standing before
    DIVE: [0.08, 0.6],     // the camera comes down onto the pin
    SWAP: 0.6,             // through the paper: the desk goes, the open map is behind. 0.55 until V5 round 3: the
                           // recording plan's pause at 0.5 caught a half-grown red ball, now it holds on the pin in its terrain
    P_OPEN: 0.086,         // V1's progress where the map is open and the camera is on day 1
    P_LAND: 0.086          // and where the hero hands over: the hiker standing on the dot. the route starts as you
                           // scroll on (V3 let him walk off it first, which left two red blobs and put him on the
                           // printed place name, round 0)
  };
  document.documentElement.style.setProperty('--hero-exit', '300vh');

  /* ---------------- knobs ---------------- */
  const K = {
    THICK: 2*kit.COVER_H + 0.002,   // a shut concertina: five sheets and the cover, same as No. 01
    LIFT: 0.55, TILT: 7*D2R,        // hover: how far a map rises, and tips toward you
    DIM: 0.6,                       // the other maps, while one is pointed at
    DIM_UP: 0.52,                   // and while the view is in on a standing mountain (0.42 in round 0: the other maps went black)
    DIM_SIDE: 0.08,                 // and a share of that again for one lying under the index column (0.4 in round 1, 0.16 in round 2: "05 Everest" still read twice)
    LAMP_I: 1000,                   // candela-ish, decay 2
    LAMP_H: 13.5,                   // lamp height above the desk, before a mountain stands
    LAMP_BACK: 5.5, LAMP_LEFT: 3.2, // the head sits behind and left of its pool, so shadows fall toward you
    LAMP_ANGLE: 64*D2R, LAMP_PEN: 1.0,
    AMB: 0.08,                      // what is left of V1's sky light in the room beyond the pool
    BOUNCE: 0.036,                  // light thrown back up off the lit desk, as a share of the lamp
    GLOSS_K: 0.05,                  // how hard the varnished ink glints (0.09 read as acrylic, round 0)
    POOL_K: 24, POOL_C: 7.2,        // the pool's spring: weighted, a little overshoot
    DEAL0: 0.42, DEAL_GAP: 0.23, DEAL_DUR: 0.62,
    // the mountain on its cover
    SIZE: PW,                       // the terrain crop's full width on the cover
    CTR_Z: 0.864,                   // the crop's centre on the cover, toward the front (the title is at the back)
    NL: 28,                         // most cards one model can have (shader table size)
    MIN_T: 0.0012,                  // a flat card keeps this much, so nothing z-fights
    LINE_PX: 1.45,                  // a flat card's contour line, px inside its edge
    CLIFT: 0.11, GLOW: 0.26,        // a card under the cursor: how far it (and all above it) lifts, how much it glows (round 0: 0.06, 0.16, unnoticed)
    GROW_S: 1.25, SINK_S: 0.8,      // seconds for the cascade up, and back down into the print
    CARD_K: 150, CARD_C: 12,        // each card's own spring, so it lands with a small bounce
    FIRST: 2.05,                    // No. 01 starts to grow this long into the intro
    // the raking lamp, once a mountain stands
    RAKE_D: 13,                     // lamp distance from the mountain
    RAKE_AZ: [250, 112],            // degrees from north, cursor at the left and at the right of the window
    RAKE_EL: [38, 23],              // degrees above the desk, cursor at the top and at the bottom
    RAKE_REST: [112, 27],           // with no cursor yet: low from the right
    RAKE_ANGLE: 44*D2R, RAKE_PEN: 1.0,
    RAKE_I: 0.82,                   // the cards are near white, so the pool's brightness would burn them out
    RAKE_AMB: 0.21,                 // the room's sky light while a mountain stands, so its shadows keep some colour and the flat prints read
    RAKE_BOUNCE: 0.07,              // and the light thrown back off the desk on the far side
    SUN_K: 7.5, SUN_C: 4.3,         // the lamp's swing around the mountain: heavy, a little overshoot
    // Lean In: the view goes in on the standing mountain, so it is big enough to read
    LEAN: 0.42, LEAN_N: 0.5,        // the camera moves this share of the way to the map (desktop, phone. 0.3 on phone in round 0: postage stamp)
    SLIDE_K: 16, SLIDE_C: 7.6,      // the slide from one standing map to the next: heavy, about 0.9 s (round 0 was 30 and 10.5, a whip)
    TEXT_GAP: 0.035,                // the standing map keeps this far (NDC) from the type
    SPOT_Y: -0.3, SPOT_N: -0.12,    // where the standing map's centre settles on screen, in NDC (desktop, phone)
    // the dive: the lamp becomes a low sun on the pin, and the camera's last pose before the swap
    SUN_AZ: 122, SUN_EL: 13, SUN_ANGLE: 15*D2R,
    SUN_COL: new THREE.Color((window.LOOK && window.LOOK.pal && window.LOOK.pal.sun) || '#FFD8A6')   // the palette's low sun (Polar Night: cold)
  };
  // where the dive ends: from almost straight above, the red head fills the frame. it is a match cut,
  // Sam's pick of three (Pinhole and Contour Cut are at commit 2b1ff3c)
  // d: close enough that the head covers the whole screen, corners too (its angular radius, asin(0.05/0.085)
  // = 36 degrees, beats the frame's half diagonal, 28 on a wide screen), so the cut is red to red
  const DIVE_END = { el:80, yaw:20, d:0.085 };
  // the other side: the trailhead is the same red head, pressed into the map, seen the same size,
  // from the same direction, under the same lamp. then the pull back stops on the trailhead in the
  // map's own lines, the hiker springs up there, the camera drops to his eye level while panel 1
  // springs up round him (Eye Level, Sam's pick of three in V5 round 1, Pop-up and Unfold are at
  // commit 03f832a), then rises to V1's shot of day 1 with the panel standing and its caption in
  const TRAIL_K = 1.3;                           // the trailhead head is this much bigger than the pin's
  // round 0 was red corner to corner for 13 percent of the hero's scroll (the dive eased out into the pin, the
  // landing eased in out of the dot, so both lingered). now the fall keeps its speed into the pin and the
  // zoom comes straight back out: red for about 2 percent, still red to red across the cut
  const LAND = {
    D0: DIVE_END.d*TRAIL_K,                      // so it starts exactly the size the pin head was: all red
    RED: 0,                                      // no hold on the red: the zoom out leaves at the speed the fall arrived
    FLAT: [0.03, 0.16],                          // on the way out the head presses flat into a printed dot
    MID: { s:[0, 0.2], d:2.5, el:46 },           // the first pull back, to the trailhead in its lines (shorter in round 3,
    POP: 0.15,                                   // the hiker springs up as the camera arrives there        so the eye level breathes)
    EYE: { s:[0.2, 0.48], el:9, yaw:-16, d:1.8, head:0.32 },    // down to his eye level, a little round (the trail sign is on the other side)
    STAND: 0.24,                                 // panel 1 starts to stand as the camera goes down
    OUT: [0.42, 1],                              // then up and out to day 1, overlapping the way down (round 1: a stall, then a lurch)
    LIGHT: [0.05, 0.28]                          // the pin's lamp hands over to V1's daylight over this
  };
  // panel 1 standing (0 to 1, a ramp in time once the landing asks for it): the page's sceneF, the interior's
  // first caption and its trail sign read it through stand0()
  const STAND = { k:0 }, LEG = { k:-1 };
  // panel 1's print is seen at a raking angle and close up at the landing: filter it anisotropically (round 1: smeared)
  if(kit.PANEL && kit.PANEL[0] && kit.PANEL[0].map){ const t = kit.PANEL[0].map; t.anisotropy = Math.min(8, kit.renderer.capabilities.getMaxAnisotropy()); t.needsUpdate = true; }
  const PL = window.LOOK && window.LOOK.pal;   // the palette round (?pal=): the lamp's colour, the room's dark, how much the room is lit
  const LAMP_WARM = new THREE.Color(PL ? PL.lamp : '#FFD6A6'), LAMP_COLD = new THREE.Color(PL ? PL.lampCold : '#FF8F45');

  /* dry lines. TREKS carries a researched line per trek (T.line) and that is what shows.
     these only stand in if the data ever loses it, so they carry no numbers */
  const DRY = [
    'Over an active volcano in a day. The Emerald Lakes smell faintly of eggs.',
    'Down to Machu Picchu through the Sun Gate, the way the Incas meant you to arrive.',
    'Granite towers, a blue glacier and a wind with strong opinions about hats.',
    'Rainforest at the bottom, glacier at the top. The guides say pole pole, and they mean it.',
    'Teahouse to teahouse up the Khumbu valley. Yaks have right of way.'
  ];
  const lineOf = (T, i) => T.line || DRY[i];
  const WORDS = ['no','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];
  const daysOf = (T) => { const n = typeof T.days === 'number' ? T.days : parseInt(T.days, 10); return isFinite(n) ? n : null; };
  const kmOf = (T) => T.kmLabel ? String(T.kmLabel).toLowerCase() : (T.km ? kit.fmtN(T.km) + kit.NB + 'km' : '');
  const daysLabel = (T) => T.daysLabel || (daysOf(T) ? daysOf(T) + (daysOf(T) === 1 ? ' DAY' : ' DAYS') : '');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const fmtM = kit.fmtM;

  /* ============================================================
     1. the maps (from drawer.js)
     ============================================================ */
  const root = new THREE.Group(); root.name = 'fold';
  kit.scene.add(root);

  const BEV = 0.012, BW = PW - 0.24, BD = PD - 0.24, BR = 0.2;
  const bodyGeo = (() => {
    const s = new THREE.Shape(), x0 = -BW/2, y0 = -BD/2, x1 = BW/2, y1 = BD/2, r = BR;
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
    s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1);
    s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
    const g = new THREE.ExtrudeGeometry(s, { depth:K.THICK - 0.004 - 2*BEV, bevelEnabled:true, bevelThickness:BEV, bevelSize:BEV, bevelSegments:2, curveSegments:5 });
    g.rotateX(-PI/2); g.translate(0, BEV, 0);
    return g;
  })();
  // the side faces print the stacked sheets: cream paper, a dark hairline between each,
  // the top layer in the cover's tone. it averages out when a layer is thinner than a pixel
  function sideMaterial(tone){
    const m = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.9, metalness:0 });
    const U = { uTone:{ value:new THREE.Color(tone) }, uThick:{ value:K.THICK } };
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vH;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = position.y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vH;\nuniform vec3 uTone;\nuniform float uThick;')
        .replace('#include <color_fragment>', `#include <color_fragment>
        float _L = clamp(vH/uThick, 0.0, 1.0)*6.0;
        float _w = fwidth(_L);
        float _fr = fract(_L);
        float _e = min(_fr, 1.0 - _fr);
        float _line = smoothstep(0.0, _w + 0.14, _e);
        float _k = mix(_line, 0.8, smoothstep(0.3, 0.9, _w));
        vec3 _paper = vec3(0.93, 0.895, 0.83);
        vec3 _col = mix(_paper*0.52, _paper, _k);
        _col = mix(_col, uTone*mix(0.7, 1.0, _k), smoothstep(5.0 - _w, 5.0 + _w, _L));
        diffuseColor.rgb *= _col;`);
    };
    m.customProgramCacheKey = () => 'drawer-side';
    return m;
  }
  function coverShape(x, w, h){
    const r = 6, a = 2, b = 2, c = w - 2, d = h - 2;
    x.beginPath(); x.moveTo(a + r, b); x.lineTo(c - r, b); x.quadraticCurveTo(c, b, c, b + r); x.lineTo(c, d - r);
    x.quadraticCurveTo(c, d, c - r, d); x.lineTo(a + r, d); x.quadraticCurveTo(a, d, a, d - r); x.lineTo(a, b + r);
    x.quadraticCurveTo(a, b, a + r, b); x.closePath(); x.fill();
  }
  const coverShapeCanvas = kit.shapeCanvas(135, 180, coverShape, 1.6);
  const topGeo = new THREE.PlaneGeometry(PW, PD, 8, 10);
  const pickGeo = new THREE.BoxGeometry(PW, 1, PD);
  const pickMat = new THREE.MeshBasicMaterial();

  // the soft shadow card under every map: a tight contact edge and a wide falloff
  const SH_W = 1.6, SH_D = 1.45;
  const shadowTex = (() => {
    const w = 192, h = 240, c = kit.mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    const fw = w/SH_W, fh = h/SH_D, fx = (w - fw)/2, fy = (h - fh)/2;
    const box = (grow, blur, a) => { x.filter = 'blur(' + blur + 'px)'; x.fillStyle = 'rgba(255,255,255,' + a + ')'; x.fillRect(fx - grow, fy - grow, fw + grow*2, fh + grow*2); };
    box(5, 16, 0.42); box(1.5, 5, 0.55); box(0, 1.6, 0.5);
    x.filter = 'none';
    return kit.tex(c, false);
  })();
  const shadowGeo = new THREE.PlaneGeometry(PW*SH_W, PD*SH_D);
  shadowGeo.rotateX(-PI/2);

  // spot varnish on the printed ink: glints where the lamp rakes across it
  const GLOSS = { uLamp:{ value:V3(0, 10, 0) }, uDir:{ value:V3(0, -1, 0) }, uCos:{ value:Math.cos(K.LAMP_ANGLE) }, uI:{ value:0 }, uCol:{ value:LAMP_WARM.clone() } };
  const glossGeo = new THREE.PlaneGeometry(PW, PD, 1, 1);
  glossGeo.rotateX(-PI/2);
  function glossMaterial(){
    return new THREE.ShaderMaterial({
      uniforms:Object.assign({ uMask:{ value:null }, uAmt:{ value:0 } }, GLOSS),
      vertexShader:`varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader:`uniform sampler2D uMask; uniform vec3 uLamp; uniform vec3 uDir; uniform vec3 uCol; uniform float uCos; uniform float uI; uniform float uAmt;
        varying vec2 vUv; varying vec3 vW; varying vec3 vN;
        void main(){
          float m = texture2D(uMask, vUv).g;
          vec3 L = uLamp - vW; float d2 = dot(L, L); L = normalize(L);
          vec3 V = normalize(cameraPosition - vW);
          vec3 H = normalize(L + V);
          float nh = max(dot(normalize(vN), H), 0.0);
          float spec = pow(nh, 70.0) + 0.12*pow(nh, 9.0);
          float cone = smoothstep(uCos, 1.0, dot(-L, uDir));
          gl_FragColor = vec4(uCol*(m*spec*cone*uI/d2*uAmt), 1.0);
        }`,
      transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, fog:false
    });
  }
  function inkMask(cover, tone){
    const w = 300, h = 400, c = kit.mk(w, h), x = c.getContext('2d', { willReadFrequently:true });
    x.drawImage(cover, 0, 0, w, h);
    const img = x.getImageData(0, 0, w, h), d = img.data;
    const n = parseInt(tone.slice(1), 16), tl = 0.299*((n>>16)&255) + 0.587*((n>>8)&255) + 0.114*(n&255);
    for(let k=0;k<d.length;k+=4){
      const L = 0.299*d[k] + 0.587*d[k+1] + 0.114*d[k+2], v = Math.max(0, Math.min(255, (L - tl - 14)*2.4));
      d[k] = d[k+1] = d[k+2] = v; d[k+3] = 255;
    }
    x.putImageData(img, 0, 0);
    return kit.tex(c, false);
  }

  // the walk map: the trek this page walks (?walk=, Tongariro without it). Its slot on the table has no body of its own, it
  // is the walk's real concertina (kit.mapRoot), and the dive goes into it (Sam, 19 Oct: "apply the pin animation to the
  // four other ones"). Before that day it was always No. 01
  const WALKM = Math.max(0, TREKS.findIndex(t => t.key === new URLSearchParams(location.search).get('walk')));
  // the dive target: the walk map, or another trek's map when a pick on this page dives into it before the page swaps to
  // that walk at the bottom of the fall (sections/landing.js, diveTo). FOLD.dive(i) sets it
  let DIVE = WALKM, COVERS_DUE = false;
  function coverOne(M, cov0){
    if(!M.coverCanvas){ M.gloss.material.uniforms.uMask.value = inkMask(cov0, M.tone); return; }
    const c = kit.drawCover(M.i, brand(), 600, 800);
    M.coverCanvas.getContext('2d').drawImage(c, 0, 0);
    M.paper.map.needsUpdate = true;
    M.gloss.material.uniforms.uMask.value = inkMask(c, M.tone);
  }
  const MAPS = [];
  for(let i=0;i<5;i++){
    const M = { i, T:TREKS[i], tone:V2.tones[i] };
    M.pivot = new THREE.Group(); root.add(M.pivot);
    if(i === WALKM){
      M.offX = -PW*0.5;                                 // kit.mapRoot's origin is the map's left edge
      M.dimMats = [kit.COVER.front.material];
      M.coverY = 2*kit.COVER_H + 0.001;                 // V1's cover face, in the pivot's space
      M.warp = [0.01, 9.1];                             // V1's makePaper call for the cover
    } else {
      const sm = sideMaterial(V2.tones[i]);
      const body = new THREE.Mesh(bodyGeo, sm);
      body.castShadow = true; body.receiveShadow = true;
      M.pivot.add(body);
      M.coverCanvas = kit.mk(600, 800);
      const paper = kit.makePaper({ colour:M.coverCanvas, shape:coverShapeCanvas, aspect:PW/PD, seed:9.1 + i*2.3,
        deckle:0.003, rim:0.12, contact:0, fibre:0.085, warp:0.004, warpF:[0.3,0.26,0.18], side:THREE.FrontSide });
      const top = new THREE.Mesh(topGeo, paper.mat);
      top.customDepthMaterial = paper.depth;
      top.rotation.x = -PI/2; top.position.y = K.THICK + 0.004;
      top.castShadow = true; top.receiveShadow = true;
      M.pivot.add(top);
      M.paper = paper;
      M.dimMats = [paper.mat, sm];
      M.coverY = K.THICK + 0.004;
      M.warp = [0.004, 9.1 + i*2.3];
    }
    M.gloss = new THREE.Mesh(glossGeo, glossMaterial());
    M.gloss.position.y = M.coverY + 0.014;
    M.gloss.renderOrder = 2;
    M.pivot.add(M.gloss);
    const pick = new THREE.Mesh(pickGeo, pickMat); pick.visible = false;
    pick.userData.mapI = i; M.pivot.add(pick); M.pick = pick;
    const smat = new THREE.MeshBasicMaterial({ color:0x000000, alphaMap:shadowTex, transparent:true, opacity:0.5, depthWrite:false });
    const sh = new THREE.Mesh(shadowGeo, smat); sh.position.y = -0.008; sh.renderOrder = -1;
    root.add(sh); M.shadow = sh;
    M.s = { x:{p:0,v:0}, y:{p:0,v:0}, z:{p:0,v:0}, rx:{p:0,v:0}, ry:{p:0,v:0}, rz:{p:0,v:0} };
    M.lift = { p:0, v:0 }; M.dim = { p:1, v:0 };
    M.home = { x:0, z:0, ry:0 }; M.start = { x:0, y:0, z:0, ry:0, rz:0 };
    M.dealt = false;
    M.model = null;                                     // the mountain, once it is cut
    MAPS.push(M);
  }
  const PICKS = MAPS.map(M => M.pick);
  // V6: the Turntable (Sam's pick of the switching round, hero/switch.js) takes the maps' poses, which map is picked and
  // the camera's shot. ?switch=hover gives back the hover and the lean (V5 and the start of V6), the before
  const SWQ = (kit.Q.get('switch') || 'turntable').replace(/[^a-z]/g, '');
  let SW = null, swMade = false;

  /* ============================================================
     2. the lamp
     ============================================================ */
  const lamp = new THREE.SpotLight(LAMP_WARM.clone(), 0, 0, K.LAMP_ANGLE, K.LAMP_PEN, 2);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);   // the raking light draws every terrace's shadow, so it needs the texels
  lamp.shadow.camera.near = 3; lamp.shadow.camera.far = 70;
  lamp.shadow.focus = 0.72;
  lamp.shadow.bias = -0.00028; lamp.shadow.normalBias = 0.02;
  kit.scene.add(lamp); kit.scene.add(lamp.target);
  // light the pool throws back up off the desk: no shadows, so the shadow side of a
  // mountain is dark brown rather than black and the far room stays black
  const bounce = new THREE.PointLight(LAMP_WARM.clone(), 0, 0, 2);
  kit.scene.add(bounce);
  const LAMP = { k:0, warm:0 };
  const pool = { x:{p:0,v:0}, z:{p:0,v:0} };
  // the raking pose: azimuth and elevation on springs, the blend toward it, the point it aims at
  const RAKE = { az:K.RAKE_REST[0], el:K.RAKE_REST[1], va:0, ve:0, r:{ p:0, v:0 }, aim:V3(), aimInit:false };

  /* ============================================================
     3. the mountains (from stack.js)
     ============================================================ */
  const S = K.SIZE;
  // one card per contour step, every step a multiple of the interval the cover prints.
  // win: the model's square cut in crop u, v. Everest reaches west to take in Kala Patthar
  const SPEC = {
    tongariro:{ step:50,  ve:1.5 },
    inca:     { step:50,  ve:1 },
    torres:   { step:100, ve:1 },
    kili:     { step:200, ve:1.5 },
    everest:  { step:200, ve:1, win:[0.024, 0.135, 0.93, 0.865] }
  };
  const DEF_WIN = [0.07, 0.135, 0.93, 0.865];
  function parseMark(mk){
    const r = /^(.*?)[\s ]+([\d\s ]+)$/.exec(mk.label || '');
    return r ? { name:r[1].trim(), m:+r[2].replace(/\D/g, '') } : { name:String(mk.label || '').trim(), m:null };
  }
  const inWin = (q, W, e) => q[0] > W[0] + (e || 0) && q[0] < W[2] - (e || 0) && q[1] > W[1] + (e || 0) && q[1] < W[3] - (e || 0);
  // the readout's number: a number TREKS prints. the trek's landmark summit when it has one
  // (Ngāuruhoe, sourced in data/treks.md), else the highest marked height inside the cut
  function summitOf(info){
    const T = TREKS[info.i] || {}, g = info.g;
    if(T.summit && T.summit.m) return { name:String(T.summit.name).toUpperCase(), m:T.summit.m, kind:'SUMMIT' };
    let best = null;
    for(const mk of T.marks || []){
      const p = parseMark(mk); if(!p.m) continue;
      if(!inWin(g.uv(mk.lat, mk.lon), info.win)) continue;
      if(!best || p.m > best.m) best = p;
    }
    const top = info.L0 + (info.n - 1)*info.step;
    // "highest mark" beside the cover's "MAX 4 215 M" read as a contradiction on the Inca Trail (round 0):
    // say whether the number is the trek's high point or only the top of this sheet
    if(best && best.m >= top - 2*info.step) return { name:best.name.toUpperCase(), m:best.m,
      kind:(T.high && T.high.m === best.m) ? 'HIGH POINT OF THE TREK' : 'HIGHEST ON THIS SHEET' };
    return { name:String(g.peak || T.name).toUpperCase(), m:top, kind:'TOP CARD' };
  }
  const boxOf = (W) => new THREE.Vector4((W[0] - 0.5)*S, (W[1] - 0.5)*S, (W[2] - 0.5)*S, (W[3] - 0.5)*S);

  const GL_V = `
#define NL ${K.NL}
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
uniform vec4 uLev;
uniform vec4 uLine;
uniform vec3 uCa;
uniform vec3 uCb;
uniform vec3 uInk;
uniform vec3 uIvo;
uniform vec3 uGlowC;
uniform vec3 uRed;
uniform vec3 uTone;
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
float sxC = (sxh - sxL)/sxgl;
float sxWi = sxBox(sxm, uWin);
float sxIn = min(sxC, sxWi);
float sxUp = (sxL + uLev.y - sxh)/sxgl;
float sxFw = max(fwidth(sxC), 1e-5);
float sxPx = sxC/sxFw;
float sxLn = 1.0 - smoothstep(uLine.y - 0.75, uLine.y + 0.75, sxPx);
vec3 sxCol = mod(sxk + 0.5, 2.0) < 1.0 ? uCa : uCb;
// paper tooth: fine and random, with a faint grain one way (two crossed grains read as cloth, round 0)
// stronger in round 3 ("no fibre" in close-up), each octave faded out where it would be finer than a pixel, so it
// cannot shimmer at desk distance
vec2 sxR1 = mat2(0.8, 0.6, -0.6, 0.8)*sxm, sxR2 = mat2(0.28, -0.96, 0.96, 0.28)*sxm;
float sxPw = length(fwidth(sxm));
float sxO1 = 1.0 - smoothstep(0.2, 0.5, sxPw*230.0), sxO2 = 1.0 - smoothstep(0.2, 0.5, sxPw*520.0);
float sxF = (sxNoise(sxm*95.0) - 0.5)*0.42 + (sxNoise(sxm*230.0 + 3.1) - 0.5)*0.32*sxO1
          + (sxNoise(sxR1*vec2(300.0, 46.0)) - 0.5)*0.22*sxO1 + (sxNoise(sxR2*vec2(520.0, 70.0)) - 0.5)*0.18*sxO2;
sxCol *= 1.0 + sxF*0.13;
float sxAl = vSxL.y;
float sxFl = vSxL.x;
if(vSxK.y < 0.5){
  float sxAo = 1.0 - vSxL.w*(0.30*(1.0 - smoothstep(0.0, 0.11, sxUp)) + 0.16*(1.0 - smoothstep(0.0, 0.02, sxUp)));
  float sxRim = 1.0 - smoothstep(0.0, 0.012, sxIn);
  sxCol = sxCol*sxAo + vec3(0.06, 0.055, 0.045)*sxRim*(1.0 - sxFl);
  // still lying in the print, a card is the cover's own colour: it turns to card as it lifts
  sxCol = mix(sxCol, uTone, smoothstep(0.25, 1.0, sxFl)*0.9);
  vec3 sxLc = mix(uInk, uIvo, uLev.w);
  sxCol = mix(sxCol, sxLc, sxFl*sxLn);
  sxAl *= mix(1.0, sxLn*uLine.x, sxFl);
  // the card under the cursor inks its own contour in the route red
  float sxHl = (1.0 - smoothstep(2.2, 4.6, sxPx))*step(-0.5, sxPx);   // a wider, softer line: the narrow one read as a fizzy pink thread (round 2)
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

  function makeMats(info, htex, warp){
    const NL = K.NL, g = info.g, col = (hex) => new THREE.Color(hex);
    const U = {
      uA:{ value:new Float32Array(NL*4) }, uB:{ value:new Float32Array(NL*4) }, uC:{ value:new Float32Array(NL*4) },
      // the cover the model stands on and its warp, so the base card sits flush on it
      uCover:{ value:new THREE.Vector4(PW*0.5, K.CTR_Z, warp[0], warp[1]) },
      uWF:{ value:new THREE.Vector4(0.3, 0.26, 0.18, PW*0.5) },
      uN:{ value:info.n },
      uH:{ value:htex }, uHm:{ value:new THREE.Vector4(g.lo, g.hi, S, g.N) },
      uWin:{ value:boxOf(info.win) },
      uLev:{ value:new THREE.Vector4(info.L0, info.step, 0, 1) },
      uLine:{ value:new THREE.Vector4(0, K.LINE_PX, 0, 0) },
      uCa:{ value:col(V2.card) }, uCb:{ value:col('#ECE5D8') }, uInk:{ value:col('#3A3F48') }, uIvo:{ value:col(V2.ivory) },
      uGlowC:{ value:col((PL && PL.glow) || '#FFD7A0').multiplyScalar(K.GLOW) }, uRed:{ value:col(V2.red) },
      uTone:{ value:col(V2.tones[info.i]) }
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
    mat.customProgramCacheKey = () => 'fold-card';
    const depth = new THREE.MeshDepthMaterial({ depthPacking:THREE.RGBADepthPacking });
    depth.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\n' + GL_V + 'varying float vSxD;\n')
        .replace('#include <begin_vertex>', GL_SETUP + GL_POS + 'vSxD = sxA.w*(1.0 - sxA.z);\n');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vSxD;\nfloat sxDh(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453); }\n')
        .replace('#include <clipping_planes_fragment>', 'if(vSxD < 0.4) discard;\n#include <clipping_planes_fragment>');   // a threshold: a dithered fade speckled every rising relief (round 2)
    };
    depth.customProgramCacheKey = () => 'fold-card-depth';
    return { mat, depth, U };
  }

  function modelInfo(i){
    const key = KEYS[i], g = kit.terrain(key), sp = SPEC[key], W = sp.win || DEF_WIN;
    const mPerU = g.km*1000/S;
    let mn = 1e9, mx = -1e9, mu = 0.5, mv = 0.5;
    for(let j=0;j<=96;j++) for(let q=0;q<=96;q++){
      const u = W[0] + (W[2] - W[0])*q/96, v = W[1] + (W[3] - W[1])*j/96, h = g.at(u, v);
      if(h < mn) mn = h;
      if(h > mx){ mx = h; mu = u; mv = v; }
    }
    // the lowest card: the highest contour at or under the lowest ground in the cut, so it is whole
    const L0 = Math.floor(mn/sp.step)*sp.step;
    const n = Math.min(K.NL, Math.floor((mx - L0)/sp.step) + 1);
    const T = TREKS[i] || {}, mark = (T.marks || []).find(m => m.red);
    let pin = null;
    if(mark){
      const q = g.uv(mark.lat, mark.lon), pm = parseMark(mark);
      if(inWin(q, W, 0.004)){
        const high = T.high && pm.m && pm.m === T.high.m;
        pin = { u:q[0], v:q[1], label:pm.name, m:pm.m, sub:high ? (i === 0 ? 'HIGH POINT OF THE CROSSING' : 'HIGH POINT OF THE TREK') : 'ON THE ROUTE' };
      }
    }
    const info = { i, key, g, win:W, step:sp.step, ve:sp.ve, mPerU, thick:sp.step/mPerU*sp.ve, L0, n, mx, mu, mv, pin };
    info.summit = summitOf(info);
    return info;
  }
  const INFO = MAPS.map((M, i) => modelInfo(i));

  function clean(pts){
    const o = [];
    for(const p of pts){ const q = o[o.length - 1]; if(!q || Math.abs(q.x - p.x) + Math.abs(q.y - p.y) > 1e-6) o.push(p); }
    while(o.length > 2 && Math.abs(o[0].x - o[o.length-1].x) + Math.abs(o[0].y - o[o.length-1].y) < 1e-6) o.pop();
    return o;
  }
  // one level a step, so a mountain can be cut over several frames
  // growing typed arrays: a mountain is up to 70k triangles, and pushing that many numbers
  // onto plain arrays left the collector a pause to take in the middle of a hover
  function buf(T, n){ return { a:new T(n), n:0 }; }
  function room(b, k){ if(b.n + k > b.a.length){ let L = b.a.length*2; while(L < b.n + k) L *= 2; const a = new b.a.constructor(L); a.set(b.a.subarray(0, b.n)); b.a = a; } return b.a; }
  function put3(b, x, y, z){ const a = room(b, 3); a[b.n++] = x; a[b.n++] = y; a[b.n++] = z; }
  function put2(b, x, y){ const a = room(b, 2); a[b.n++] = x; a[b.n++] = y; }
  function* cutGen(info){
    const P = buf(Float32Array, 1 << 17), N = buf(Float32Array, 1 << 17), A = buf(Float32Array, 1 << 16), I = buf(Uint32Array, 1 << 17);
    let vc = 0, made = 0;
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
        put3(P, p.x, 0, -p.y); put3(P, q.x, 0, -q.y); put3(P, q.x, 1, -q.y); put3(P, p.x, 1, -p.y);
        put3(N, ax, 0, az); put3(N, bx, 0, bz); put3(N, bx, 0, bz); put3(N, ax, 0, az);
        put2(A, k, 1); put2(A, k, 1); put2(A, k, 1); put2(A, k, 1);
        vc += 4;
        const dx = q.x - p.x, dz = -q.y + p.y;
        if(-dz*nx[i] + dx*nz[i] > 0){ put3(I, v, v+1, v+2); put3(I, v, v+2, v+3); } else { put3(I, v, v+2, v+1); put3(I, v, v+3, v+2); }
      }
    }
    for(let k=0;k<info.n;k++){
      const L = info.L0 + k*info.step;
      // No. 01 is the one the camera dives into: one more smoothing pass, its curves faceted at the pin (round 2)
      const shapes = kit.levelShapes(THREE, info.key, L, S, { smooth:info.i === WALKM ? 2 : 1, win:info.win });
      let any = false;
      for(const sh of shapes){
        const ex = sh.extractPoints(1);
        const outer = clean(ex.shape), holes = ex.holes.map(clean).filter(h => h.length >= 3);
        if(outer.length < 3) continue;
        any = true;
        const tris = THREE.ShapeUtils.triangulateShape(outer, holes);
        const pts = outer.concat(...holes), b = vc;
        for(const p of pts){ put3(P, p.x, 1, -p.y); put3(N, 0, 1, 0); put2(A, k, 0); vc++; }
        for(const t of tris){
          const a = pts[t[0]], c1 = pts[t[1]], c2 = pts[t[2]];
          const ny = (-c1.y + a.y)*(c2.x - a.x) - (c1.x - a.x)*(-c2.y + a.y);
          if(ny >= 0) put3(I, b + t[0], b + t[1], b + t[2]); else put3(I, b + t[0], b + t[2], b + t[1]);
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
    geo.setAttribute('position', new THREE.BufferAttribute(P.a.slice(0, P.n), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(N.a.slice(0, N.n), 3));
    geo.setAttribute('aL', new THREE.BufferAttribute(A.a.slice(0, A.n), 2));
    geo.setIndex(new THREE.BufferAttribute(vc > 65535 ? I.a.slice(0, I.n) : Uint16Array.from(I.a.subarray(0, I.n)), 1));
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

  // the pin: a red head on a steel needle, standing on the card it belongs to
  const PIN_H = 0.40, PIN_R = 0.05;
  const pinNeedleGeo = new THREE.CylinderGeometry(0.0075, 0.005, PIN_H, 8, 1).translate(0, PIN_H*0.5, 0);
  const pinHeadGeo = new THREE.SphereGeometry(PIN_R, 64, 40);   // the dive fills the frame with it
  const pinNeedleMat = new THREE.MeshStandardMaterial({ color:0xC9C3B6, roughness:0.32, metalness:0.75 });
  // the head is red paper, not plastic (round 0: "a glossy CG sphere"): matte, with a fibre worked out in its own
  // space, so it holds up when it fills the screen at the cut. the trailhead dot is a clone, so the match holds
  const pinHeadMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(V2.red), roughness:0.86, metalness:0 });
  pinHeadMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPinP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPinP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vPinP;
float pnH(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)))*43758.5453); }
float pnN(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(pnH(i), pnH(i + vec3(1,0,0)), f.x), mix(pnH(i + vec3(0,1,0)), pnH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(pnH(i + vec3(0,0,1)), pnH(i + vec3(1,0,1)), f.x), mix(pnH(i + vec3(0,1,1)), pnH(i + vec3(1,1,1)), f.x), f.y), f.z); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{ // long fibres one way, short tooth the other, faded out where they would be finer than a pixel
  vec3 q = vPinP*vec3(900.0, 2600.0, 900.0);
  float fib = pnN(q)*0.55 + pnN(q*vec3(2.3, 0.5, 2.3) + 7.1)*0.45;
  float px = length(fwidth(q));
  float k = 1.0 - smoothstep(0.6, 2.2, px);
  diffuseColor.rgb *= 1.0 + (fib - 0.5)*0.12*k;
}`);
  };
  pinHeadMat.customProgramCacheKey = () => 'pin-paper';

  function makeModel(M, info, geo){
    const htex = heightTex(info.key);
    const { mat, depth, U } = makeMats(info, htex, M.warp);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.customDepthMaterial = depth; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    mesh.position.set(0, M.coverY, K.CTR_Z);
    mesh.renderOrder = 2;
    mesh.visible = false;
    M.pivot.add(mesh);
    const L = [];
    for(let k=0;k<info.n;k++) L.push({ k, p:0, v:0, ly:0, lv:0, glow:0, sk:1, base:0, top:0, tk:0 });
    const D = { info, geo, htex, mat, depth, U, mesh, L, g:0, gpu:true, pin:null, hk:-1 };
    if(info.pin){
      const g = new THREE.Group();
      const needle = new THREE.Mesh(pinNeedleGeo, pinNeedleMat), head = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      head.position.y = PIN_H;
      needle.castShadow = head.castShadow = true; needle.receiveShadow = head.receiveShadow = true;
      g.add(needle); g.add(head); g.visible = false;
      mesh.add(g);
      const h = info.g.at(info.pin.u, info.pin.v);
      D.pin = { g, needle, head, y:0, v:0, on:false,
        k:Math.max(0, Math.min(info.n - 1, Math.floor((h - info.L0)/info.step))),
        x:(info.pin.u - 0.5)*S, z:(info.pin.v - 0.5)*S };
    }
    M.model = D;
    // the pick box grows with the mountain, so pointing at its top still counts as the map
    return D;
  }
  // the cover's warp under a point of the model (mesh space), the same sum the vertex shader adds
  function warpAt(M, x, z){ return kit.coverWarp(x, K.CTR_Z + z, M.warp[0], M.warp[1]); }

  // cutting: No. 01 now, the rest a few levels a frame in the background, hovered maps first
  const CUT = { q:[0, 1, 2, 3, 4].filter(k => k !== WALKM), cur:null };
  function cutNow(i){
    const info = INFO[i], gen = cutGen(info);
    let r = gen.next(); while(!r.done) r = gen.next();
    makeModel(MAPS[i], info, r.value);
  }
  cutNow(WALKM);
  function wantCut(i){
    if(MAPS[i].model || (CUT.cur && CUT.cur.i === i)) return;
    CUT.asked = true;
    CUT.q = [i].concat(CUT.q.filter(k => k !== i));
  }
  function pumpCut(ms){
    if(!CUT.cur && !CUT.asked && !(MAPS[WALKM].model && MAPS[WALKM].model.g >= 1)) return;
    const t0 = performance.now();
    while(performance.now() - t0 < ms){
      if(!CUT.cur){
        let i; do { i = CUT.q.shift(); } while(i !== undefined && MAPS[i].model);
        if(i === undefined) return;
        CUT.cur = { i, gen:cutGen(INFO[i]) };
      }
      const r = CUT.cur.gen.next();
      if(r.done){ makeModel(MAPS[CUT.cur.i], INFO[CUT.cur.i], r.value); CUT.cur = null; }
    }
  }

  /* ---- a model's card table for this frame. g: 0 lying in the print, 1 standing ---- */
  function stepModel(M, dt, t, hk){
    const D = M.model, I = D.info, n = I.n, th = I.thick, L = D.L;
    const A = D.U.uA.value, B = D.U.uB.value, C = D.U.uC.value;
    const settle = REDUCED || dt === 0;
    const sinkP = 1 - D.g, spread = 7;
    let base = 0, prevOff = 0, moving = false;
    for(let k=0;k<n;k++){
      const s = L[k];
      // the stack's exit, run backwards: bottom card first
      const sk = clamp01((sinkP*(n - 1 + spread) - (n - 1 - k))/spread);
      const a = 1 - sk;
      if(settle){ s.p = a; s.v = 0; }
      else { s.v += ((a - s.p)*K.CARD_K - s.v*K.CARD_C)*dt; s.p += s.v*dt; if(s.p < 0){ s.p = 0; if(s.v < 0) s.v = 0; } }
      if(Math.abs(s.v) > 1e-3 || Math.abs(a - s.p) > 1e-3) moving = true;
      const gk = s.p, ske = 1 - Math.min(1, gk);
      // thickness grows over the top three quarters of a card's rise, and overshoots with its spring
      let tk = th*(1 - eio(seg(ske, 0, 0.86)));
      if(gk > 1) tk = th*(1 + (gk - 1)*1.2);
      tk = Math.max(K.MIN_T, tk);
      const flat = smooth(seg(ske, 0.14, 1));
      const lt = (hk >= 0 && k >= hk) ? K.CLIFT : 0;
      s.lv += ((lt - s.ly)*260 - s.lv*24)*dt; s.ly += s.lv*dt;
      if(settle){ s.ly = lt; s.lv = 0; }
      s.glow += ((k === hk ? 1 : 0) - s.glow)*(1 - Math.exp(-dt*12));
      const b = k === 0 ? lerp(-0.004, 0.0025, smooth(seg(ske, 0, 0.8))) : base;
      const off = s.ly;
      const contact = (1 - flat)*(1 - clamp01(Math.abs(off - prevOff)/0.03));
      A[k*4] = b; A[k*4+1] = tk; A[k*4+2] = flat; A[k*4+3] = 1;
      B[k*4] = 0; B[k*4+1] = off; B[k*4+2] = 0; B[k*4+3] = 0;
      C[k*4] = s.glow; C[k*4+1] = 0; C[k*4+2] = contact; C[k*4+3] = 0;
      s.sk = ske; s.base = b; s.tk = tk; s.top = b + tk + off;
      base = b + tk; prevOff = off;
    }
    // the lines: ivory like the print they lie on, and gone into it once the mountain is down
    const L0 = L[0];
    D.U.uLev.value.w = smooth(seg(L0.sk, 0.55, 1.0));
    D.U.uLine.value.x = lerp(1, 0.66, D.U.uLev.value.w)*smooth(seg(D.g + Math.max(0, L0.p)*0.5, 0.0, 0.14));
    D.height = base;
    const vis = D.g > 0.0005 || moving;
    D.mesh.visible = vis;
    // the pin rides its card. it drops in once its card stands, and presses flat into the print on the way down
    const P = D.pin;
    if(P){
      const s = L[P.k];
      const up = s.p > 0.92 && D.g > 0.5;
      if(up && !P.on){ P.on = true; P.y = settle ? 0 : 0.5; P.v = -1; }
      if(!up && D.g < 0.5) P.on = false;
      if(P.on && !settle){ P.v += (-P.y*200 - P.v*13)*dt; P.y += P.v*dt; if(P.y < 0){ P.y = 0; if(P.v < 0) P.v *= -0.25; } }
      const gone = P.on ? 0 : smooth(seg(s.sk, 0.0, 0.7));
      P.g.position.set(P.x, s.top + P.y + warpAt(M, P.x, P.z), P.z);
      P.needle.scale.set(1, Math.max(0.001, 1 - gone), 1);
      P.head.position.y = PIN_H*(1 - gone) + 0.006*gone;
      const r = lerp(1, 0.001, smooth(seg(s.sk, 0.35, 0.95)));
      P.head.scale.setScalar(Math.max(0.001, P.on ? 1 : r));
      P.g.visible = vis && (P.on || s.sk < 0.95);
    }
    return vis;
  }

  /* ---- hover on the model: march the pointer ray over the stepped terrain, in the model's own space ---- */
  const _inv = new THREE.Matrix4(), _ro = V3(), _rd = V3();
  function topAt(D, x, z){
    // mesh space: x = (u - 0.5)*S, z = (v - 0.5)*S, the cover's offset is in the mesh's position
    const I = D.info, u = x/S + 0.5, v = z/S + 0.5, W = I.win;
    if(u < W[0] || u > W[2] || v < W[1] || v > W[3]) return null;
    const h = I.g.at(u, v);
    if(h < I.L0) return null;
    const k = Math.min(I.n - 1, Math.floor((h - I.L0)/I.step));
    return { k, y:D.L[k].top };
  }
  function pickCard(M, px, py){
    const D = M.model; if(!D || !D.mesh.visible) return -1;
    ndc.set((px/window.innerWidth)*2 - 1, -(py/window.innerHeight)*2 + 1);
    ray.setFromCamera(ndc, eye);
    D.mesh.updateWorldMatrix(true, false);
    _inv.copy(D.mesh.matrixWorld).invert();
    _ro.copy(ray.ray.origin).applyMatrix4(_inv);
    _rd.copy(ray.ray.direction).transformDirection(_inv);
    const W = D.info.win;
    const x0 = (W[0] - 0.5)*S, x1 = (W[2] - 0.5)*S, z0 = (W[1] - 0.5)*S, z1 = (W[3] - 0.5)*S, y1 = (D.height || 0) + 0.1;
    let tn = 0, tf = 1e9;
    for(const [oa, da, a, b] of [[_ro.x, _rd.x, x0, x1], [_ro.y, _rd.y, -0.01, y1], [_ro.z, _rd.z, z0, z1]]){
      if(Math.abs(da) < 1e-9){ if(oa < a || oa > b) return -1; continue; }
      let ta = (a - oa)/da, tb = (b - oa)/da; if(ta > tb){ const q = ta; ta = tb; tb = q; }
      tn = Math.max(tn, ta); tf = Math.min(tf, tb);
    }
    if(tn > tf) return -1;
    for(let t = tn; t <= tf; t += 0.006){
      const x = _ro.x + _rd.x*t, y = _ro.y + _rd.y*t, z = _ro.z + _rd.z*t, h = topAt(D, x, z);
      if(h && y <= h.y) return h.k;
    }
    return -1;
  }

  /* ============================================================
     4. layout: where the maps lie and where the camera stands
     ============================================================ */
  let NARROW = false, layoutDone = false;
  const CAM = { pos:V3(0, 30, 30), tgt:V3(0, 0, 0), fov:34, intro:0, rest:V3(), dist:40 };
  const REGION = { x0:0, x1:0, z0:0, z1:0 };
  const ROW = [[3.6, 0, 0], [11.6, -0.75, -3.4], [19.55, -1.15, 2.6], [27.45, -0.5, -1.9], [35.5, 0.35, 4.2]];
  const FAN = [[3.6, 0, 0], [11.45, -5.15, -3.2], [4.15, -10.6, 2.8], [11.75, -15.9, -2.2], [4.5, -21.15, 3.4]];
  const SWEEP_D = { dx:34, dz:-5, ry:-16*D2R };
  const SWEEP_N = { dx:20, dz:-3, ry:-14*D2R };

  const _fitCam = new THREE.PerspectiveCamera();
  function fit(pts, T, elDeg, yawDeg, fov, box){
    const el = elDeg*D2R, yaw = yawDeg*D2R;
    const dir = V3(Math.sin(yaw)*Math.cos(el), Math.sin(el), Math.cos(yaw)*Math.cos(el));
    _fitCam.fov = fov; _fitCam.aspect = kit.camera.aspect; _fitCam.near = 0.1; _fitCam.far = 1000; _fitCam.updateProjectionMatrix();
    const t = T.clone(), v = V3(0,0,0), right = V3(0,0,0), up = V3(0,0,0);
    const bw = box[1]-box[0], bh = box[3]-box[2], bcx = (box[0]+box[1])*0.5, bcy = (box[2]+box[3])*0.5;
    const tanV = Math.tan(fov*PI/360), tanH = tanV*kit.camera.aspect;
    let D = 40;
    for(let it=0; it<24; it++){
      _fitCam.position.copy(t).addScaledVector(dir, D); _fitCam.lookAt(t); _fitCam.updateMatrixWorld();
      let x0=1e9, x1=-1e9, y0=1e9, y1=-1e9;
      for(const p of pts){ v.copy(p).project(_fitCam); x0=Math.min(x0,v.x); x1=Math.max(x1,v.x); y0=Math.min(y0,v.y); y1=Math.max(y1,v.y); }
      right.setFromMatrixColumn(_fitCam.matrixWorld, 0); up.setFromMatrixColumn(_fitCam.matrixWorld, 1);
      const dy = Math.min((y0+y1)*0.5 - bcy, y0 - box[2]);
      t.addScaledVector(right, ((x0+x1)*0.5 - bcx)*tanH*D*0.9).addScaledVector(up, dy*tanV*D*0.9);
      D *= Math.pow(Math.max((x1-x0)/bw, (y1-y0)/bh), 0.8);
    }
    return { pos:t.clone().addScaledVector(dir, D), tgt:t, fov, dist:D };
  }
  function cornersOf(){
    const pts = [];
    for(const M of MAPS){
      for(const sx of [-1, 1]) for(const sz of [-1, 1]){
        const a = M.home.ry, lx = sx*PW*0.5, lz = sz*PD*0.5;
        const x = M.home.x + lx*Math.cos(a) + lz*Math.sin(a), z = M.home.z - lx*Math.sin(a) + lz*Math.cos(a);
        pts.push(V3(x, 0, z), V3(x, K.THICK + 0.3, z));
      }
    }
    return pts;
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function layout(){
    NARROW = !!kit.NARROW;
    if(!swMade){
      swMade = true;
      const F = window.FOLD_SWITCH && window.FOLD_SWITCH[SWQ];
      if(F){ SW = F(swCtx()); document.documentElement.dataset.switch = SWQ; }
      if(SW && dom){
        if(SW.hint) dom.hint.innerHTML = '<i></i><span>' + SW.hint + '</span>';
        if(SW.tip) dom.tipcard.querySelector('.ro-tip').innerHTML = '<i></i>' + SW.tip;
      }
    }
    const L = NARROW ? FAN : ROW;
    MAPS.forEach((M, i) => { M.home.x = L[i][0]; M.home.z = L[i][1]; M.home.ry = L[i][2]*D2R; });
    let cx = 0, cz = 0; MAPS.forEach(M => { cx += M.home.x; cz += M.home.z; }); cx /= 5; cz /= 5;
    const pts = cornersOf();
    if(dom) dom.root.classList.toggle('fo-narrow', NARROW);
    const tb = textBounds(), Hh = window.innerHeight;
    const top = Math.min(0.3, 1 - 2*(tb.top + (NARROW ? 14 : 34))/Hh), bot = Math.max(-0.95, 1 - 2*(tb.bottom - 16)/Hh);
    measureText();
    const P = SW ? SW.shot({ top, bot, txt:TXT, cx, cz })
            : NARROW ? fit(pts, V3(cx, 0, cz), 47, -6, 38, [-0.9, 0.9, bot, top])
                     : fit(pts, V3(cx, 0, cz), 44, -4, 32, [-0.94, 0.94, -0.95, Math.max(-0.2, top)]);
    CAM.pos.copy(P.pos); CAM.tgt.copy(P.tgt); CAM.fov = P.fov; CAM.dist = P.dist;
    CAM.rest.set(cx - (NARROW ? 0 : 1.5), 0, cz + (NARROW ? 0 : 1.6));
    if(SW && P.rest) CAM.rest.copy(P.rest);
    if(NARROW){ REGION.x0 = -1.5; REGION.x1 = 17; REGION.z0 = -26; REGION.z1 = 5.5; }
    else { REGION.x0 = -3; REGION.x1 = 40.5; REGION.z0 = -9; REGION.z1 = 6; }
    // the deal comes from below the bottom of the frame, on the viewer's side of the desk
    _fitCam.position.copy(CAM.pos).sub(CAM.tgt).multiplyScalar(1.07).add(CAM.tgt); _fitCam.position.y += 1.2;
    _fitCam.fov = CAM.fov; _fitCam.updateProjectionMatrix(); _fitCam.lookAt(CAM.tgt); _fitCam.updateMatrixWorld();
    ray.setFromCamera(ndc.set(0, -1), _fitCam);
    const edge = ray.ray.intersectPlane(new THREE.Plane(V3(0, 1, 0), -2.4), V3(0, 0, 0));
    const zEdge = edge ? edge.z : 30;
    MAPS.forEach((M, i) => {
      M.start.x = lerp(M.home.x, cx, 0.4) + (NARROW ? 0 : 2);
      M.start.z = Math.max(M.home.z + 17, zEdge + PD*0.75 + 2);
      M.start.y = 2.4;
      M.start.ry = M.home.ry + (i % 2 ? 17 : -13)*D2R;
      M.start.rz = (i % 2 ? -0.09 : 0.08);
    });
    if(!poolInit){ pool.x.p = CAM.rest.x; pool.z.p = CAM.rest.z; poolT.x = CAM.rest.x; poolT.z = CAM.rest.z; poolInit = true; }
    measureText();
    layoutDone = true;
  }
  function textBounds(){
    if(!dom) return { top:window.innerHeight*0.4, bottom:window.innerHeight };
    const head = dom.head, side = dom.side, headBottom = head.offsetTop + head.offsetHeight;
    if(NARROW) return { top:headBottom, bottom:side.offsetTop };
    let cur = 0, open = 0;
    return { top:side.offsetTop > window.innerHeight*0.5 ? headBottom : Math.max(headBottom, side.offsetTop + side.offsetHeight), bottom:window.innerHeight };
  }
  let poolInit = false;
  // where the type is on screen (NDC), measured at layout and when the fonts land
  const TXT = { sideL:1, headR:-1, headB:1, roT:-1, clash:false };
  function measureText(){
    if(!dom) return;
    const W = window.innerWidth, H = window.innerHeight, h = dom.head.getBoundingClientRect(), sd = dom.side.getBoundingClientRect();
    TXT.sideL = 2*sd.left/W - 1; TXT.headR = 2*h.right/W - 1; TXT.headB = 1 - 2*h.bottom/H; TXT.roT = 1 - 2*sd.top/H;
  }
  // a map's footprint on screen through a camera, its mountain's top included
  const _mc = V3();
  function mapBox(M, cam){
    M.pivot.updateWorldMatrix(true, false);
    const D = M.model, h = D ? (D.height || 0) : 0, W0 = D ? D.info.win : DEF_WIN;
    const b = { x0:1e9, x1:-1e9, y0:1e9, y1:-1e9 };
    const pt = (x, y, z) => { _mc.set(x, y, z).applyMatrix4(M.pivot.matrixWorld).project(cam);
      b.x0 = Math.min(b.x0, _mc.x); b.x1 = Math.max(b.x1, _mc.x); b.y0 = Math.min(b.y0, _mc.y); b.y1 = Math.max(b.y1, _mc.y); };
    for(const sx of [0, 1]) for(const sz of [0, 1]){
      pt((sx - 0.5)*PW, M.coverY, (sz - 0.5)*PD);
      if(h > 0.01) pt((W0[sx*2] - 0.5)*S, M.coverY + h, K.CTR_Z + (W0[1 + sz*2] - 0.5)*S);
    }
    return b;
  }

  /* ============================================================
     5. the DOM: headline, the 01 to 05 index that is also the readout
     ============================================================ */
  const css = document.createElement('style'); css.id = 'fold-css';
  css.textContent = `
html.hero-on .hero-copy > .fo{pointer-events:none;}
/* over the cream terrain and the open map in the dive, the header turns to ink (round 0: it washed out) */
html.hero-on .top .brand-name,html.hero-on .top .brand-sub{transition:color .5s ease;}
html.hero-on .top.on-light .brand,html.hero-on .top.on-light .brand-name{color:var(--v2-ink);}
html.hero-on .top.on-light .brand-sub{color:color-mix(in srgb, var(--v2-ink) 86%, transparent);}
.fo{position:fixed;inset:0;color:var(--v2-ivory);pointer-events:none;}
/* nothing of the hero's type or its card shows before the intro starts: the intro waits for a few smooth frames (up to
   2.2 s), and the card stood alone on the dark room until then (Sam, 19 Oct) */
.fo:not(.fo-live){visibility:hidden;opacity:0;}
.fo-head{position:absolute;left:var(--pad-x);top:clamp(150px,21vh,210px);width:min(640px,48vw);pointer-events:none;}   /* more room under the header (Sam, V6) */
.fo-kick{color:rgba(var(--c-text-rgb,241,235,223),0.6);display:block;}
.fo-kick .v2-line{padding-bottom:0.25em;margin-bottom:-0.25em;}
html.hero-on .fo .fo-h1{font-family:var(--v2-display);font-weight:var(--d-w,400);font-stretch:var(--d-st,100%);text-transform:var(--d-case,none);font-size:calc(clamp(44px,min(5.3vw,9.2vh),84px)*var(--d-scale,1));line-height:var(--d-lh,0.94);letter-spacing:var(--d-track,-0.014em);margin:4px 0 0 -0.04em;color:var(--v2-ivory);}
.fo .x{display:inline-block;will-change:transform;}
.fo .fo-h1 .pw{display:inline-block;white-space:nowrap;}
.fo .fo-h1.fo-popping .v2-line{overflow:visible;}   /* a word springing past upright must not be cut by its line's mask */
html.hero-on .fo .fo-h1 em.acc{color:var(--v2-red);font-style:var(--d-acc,italic);}
.fo:not(.fo-narrow) .fo-head::before{content:'';position:absolute;z-index:-1;left:-160px;top:-90px;right:-60px;bottom:-110px;pointer-events:none;
  background:radial-gradient(closest-side at 40% 50%, rgba(var(--c-shade-rgb,9,8,7),0.72) 0%, rgba(var(--c-shade-rgb,9,8,7),0.5) 58%, rgba(var(--c-shade-rgb,9,8,7),0) 100%);}   /* a map under the lede or the hint falls into shade (V6) */
.fo .fo-lede{margin-top:24px;color:rgba(var(--c-text-rgb,241,235,223),0.74);max-width:36ch;}
.fo-hint{margin:22px 0 0;font-family:var(--v2-label);font-size:calc(10.5px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.18em + var(--l-track,0em));text-transform:uppercase;color:rgba(var(--c-text-rgb,241,235,223),0.5);display:flex;gap:10px;align-items:center;}
.fo-hint i{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--v2-red);font-style:normal;}
.fo-hint > *{transition:opacity .5s ease;}
.fo-hint.aside > *{opacity:0;}   /* a raised map too tall to clear the headline block: the hint steps aside (round 1: over a card's label) */
.fo-side{position:absolute;right:var(--pad-x);bottom:clamp(30px,5.5vh,60px);width:min(360px,27vw);pointer-events:auto;--cat:var(--v2-red);}
/* the room falls dark behind the panel, so a map passing under it never prints through the type. the gradient is sized
   to its own box (closest-side), so it reaches nothing before the box ends: round 3's hard edge at x 944 is gone */
.fo-side::before{content:'';position:absolute;z-index:-1;left:-170px;right:calc(-1*var(--pad-x));top:-130px;bottom:calc(-1*clamp(30px,5.5vh,60px));pointer-events:none;
  background:radial-gradient(closest-side at 60% 60%, rgba(var(--c-shade-rgb,9,8,7),0.9) 0%, rgba(var(--c-shade-rgb,9,8,7),0.76) 55%, rgba(var(--c-shade-rgb,9,8,7),0) 100%);}
.fo.fo-narrow .fo-side::before{left:calc(-1*var(--pad-x));top:-70px;bottom:calc(-10px - env(safe-area-inset-bottom));
  background:linear-gradient(to top, rgba(var(--c-shade-rgb,9,8,7),0.86) 0%, rgba(var(--c-shade-rgb,9,8,7),0.7) 55%, rgba(var(--c-shade-rgb,9,8,7),0) 100%);}
/* V6: one trek at a time, bottom right, in the colour of its length (Sam: "the numbers and info on the bottom right ...
   if it's yellow, that information can have some yellow inside, so it is recognizable"). the five cards share one grid
   cell, so the panel's box is the tallest card and nothing below it jumps when the trek changes */
.fo .fo-rule{height:2px;background:var(--cat);transform-origin:0 50%;transition:background-color .6s ease;margin-bottom:16px;}
.fc-stage{display:grid;}
.fc-card{grid-area:1 / 1;opacity:0;visibility:hidden;transition:opacity .16s ease, visibility 0s linear .16s;}
.fc-card.on{opacity:1;visibility:visible;transition:opacity .2s ease;}
.fc-card > *{transform:translateY(-6px);opacity:0;transition:opacity .16s ease, transform .3s ease;}
.fc-card.on > *{transform:none;opacity:1;transition:opacity .4s ease, transform .6s cubic-bezier(.2,.8,.2,1);}
.fc-card.on > *:nth-child(1){transition-delay:.12s;} .fc-card.on > *:nth-child(2){transition-delay:.16s;} .fc-card.on > *:nth-child(3){transition-delay:.2s;}
.fc-card.on > *:nth-child(4){transition-delay:.24s;} .fc-card.on > *:nth-child(5){transition-delay:.29s;} .fc-card.on > *:nth-child(6){transition-delay:.34s;} .fc-card.on > *:nth-child(7){transition-delay:.39s;} .fc-card.on > *:nth-child(8){transition-delay:.44s;}
@media (prefers-reduced-motion: reduce){ .fc-card > *,.fc-card.on > *{transform:none;} }
.fc-cat{display:inline-flex;align-items:center;gap:8px;margin:0;padding:5px 11px 5px 9px;border-radius:999px;font-family:var(--v2-label);font-stretch:var(--l-st,100%);font-weight:var(--l-w,400);
  font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:color-mix(in srgb, var(--cat) 60%, #fff);
  background:color-mix(in srgb, var(--cat) 16%, transparent);border:1px solid color-mix(in srgb, var(--cat) 50%, transparent);}
.fc-cat i{display:block;width:7px;height:7px;border-radius:50%;background:var(--cat);flex:none;}
.fc-meta{margin:12px 0 0;font-family:var(--v2-label);font-stretch:var(--l-st,100%);font-weight:var(--l-w,400);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:rgba(var(--c-text-rgb,241,235,223),0.55);}
.fc-name{margin:8px 0 0;font-family:var(--v2-display);font-weight:var(--d-ui-w,400);font-stretch:var(--d-ui-st,100%);font-size:calc(32px*var(--d-ui,1));line-height:1.05;letter-spacing:-0.02em;color:var(--v2-ivory);}
.fc-sub{margin:6px 0 0;font-family:var(--v2-display);font-style:var(--d-sub,italic);font-weight:var(--d-sub-w,400);font-stretch:var(--d-sub-st,var(--d-ui-st,100%));font-size:calc(16.5px*var(--d-ui,1));line-height:1.25;color:rgba(var(--c-text-rgb,241,235,223),0.74);}
.fc-alt{margin:18px 0 0;}
.fc-alt .v{font-family:var(--n-family,var(--v2-label));font-weight:var(--n-w,400);font-size:calc(48px*var(--n-scale,1));letter-spacing:calc(-0.03em + var(--n-track,0em));line-height:1;color:var(--v2-ivory);font-variant-numeric:tabular-nums;white-space:nowrap;}
.fc-k{text-wrap:balance;margin:9px 0 0;font-family:var(--v2-label);font-size:calc(9.5px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.16em + var(--l-track,0em));line-height:1.55;color:rgba(var(--c-text-rgb,241,235,223),0.5);text-transform:uppercase;}
.fc-k b{font-weight:500;color:rgba(var(--c-text-rgb,241,235,223),0.85);}
.fc-pin{text-wrap:balance;margin:12px 0 0;font-family:var(--v2-label);font-size:calc(10px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.14em + var(--l-track,0em));line-height:1.5;color:rgba(var(--c-text-rgb,241,235,223),0.86);display:flex;align-items:center;gap:8px;text-transform:uppercase;}
.fc-pin i{display:block;flex:none;width:7px;height:7px;border-radius:50%;background:var(--v2-red);box-shadow:0 0 0 2px rgba(var(--c-accent-rgb,200,67,43),0.22);}
.fc-line{margin:14px 0 0;font-size:13.5px;line-height:1.5;color:rgba(var(--c-text-rgb,241,235,223),0.66);max-width:34ch;text-wrap:pretty;}
/* the five numbers, each underlined in its length's colour, so the three groups read at a glance */
.fc-nav{display:flex;align-items:flex-end;gap:18px;margin-top:20px;padding-top:14px;border-top:1px solid rgba(var(--c-text-rgb,241,235,223),0.14);}
.fc-nav .fc-num{appearance:none;border:0;background:none;cursor:pointer;padding:4px 0;display:flex;flex-direction:column;align-items:flex-start;gap:7px;color:rgba(var(--c-text-rgb,241,235,223),0.45);
  font-family:var(--v2-label);font-stretch:var(--l-st,100%);font-size:calc(10.5px*var(--l-scale,1));letter-spacing:0.12em;transition:color .3s ease;}
.fc-nav .fc-num b{font-weight:inherit;}
.fc-nav .fc-num .bar{display:block;width:16px;height:2px;border-radius:1px;background:var(--c);opacity:0.5;transition:width .45s cubic-bezier(.2,.8,.2,1), opacity .3s ease;}
.fc-nav .fc-num:hover{color:var(--v2-ivory);} .fc-nav .fc-num:hover .bar{opacity:0.85;}
.fc-nav .fc-num.on{color:var(--v2-ivory);} .fc-nav .fc-num.on .bar{width:30px;opacity:1;}
.fc-count{margin:0 0 4px auto;font-family:var(--v2-label);font-stretch:var(--l-st,100%);font-size:calc(10.5px*var(--l-scale,1));letter-spacing:0.16em;color:rgba(var(--c-text-rgb,241,235,223),0.45);font-variant-numeric:tabular-nums;}
.fc-count b{font-weight:inherit;color:var(--cat);}
/* the map in the light under a mouse: a click goes in at its pin */
html.fo-map-hot body{cursor:pointer;}
/* the arrows either side of the map in the light (Sam: "put them towards the selected one, on each side") */
.fo-arrow{position:absolute;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;display:grid;place-items:center;padding:0;cursor:pointer;pointer-events:auto;
  font-family:var(--v2-display);font-size:19px;line-height:1;color:var(--v2-ivory);background:rgba(var(--c-shade-rgb,9,8,7),0.5);border:1px solid rgba(var(--c-text-rgb,241,235,223),0.26);
  transition:border-color .3s ease, background-color .3s ease;will-change:transform;}
.fo-arrow:hover,.fo-arrow.is-hover{border-color:var(--cat,var(--v2-red));background:color-mix(in srgb, var(--cat,var(--v2-red)) 26%, rgba(var(--c-shade-rgb,9,8,7),0.6));}
.fo-arrow:focus-visible{outline:1px solid var(--cat,var(--v2-red));outline-offset:4px;}
.fo.fo-narrow .fo-arrow{width:42px;height:42px;margin:-21px 0 0 -21px;font-size:16px;}
@media (max-height:780px){
  .fc-name{font-size:calc(28px*var(--d-ui,1));}
  .fc-alt{margin-top:14px;} .fc-alt .v{font-size:calc(40px*var(--n-scale,1));}
  .fc-line{font-size:12.5px;margin-top:10px;} .fc-nav{margin-top:14px;}
}
.fo-ro{display:none;}
/* phone: the index becomes a row of numbers, the readout sits under the desk */
.fo.fo-narrow .fo-head{top:calc(var(--pad-y) + 76px);right:var(--pad-x);width:auto;}
/* phone: the room falls dark behind the headline and lede, so a card passing under them never prints through (round 2) */
.fo.fo-narrow .fo-head::before{content:'';position:absolute;z-index:-1;left:calc(-1*var(--pad-x));right:calc(-1*var(--pad-x));top:-140px;bottom:-56px;pointer-events:none;
  background:linear-gradient(to bottom, rgba(var(--c-shade-rgb,9,8,7),0.9) 0%, rgba(var(--c-shade-rgb,9,8,7),0.82) 68%, rgba(var(--c-shade-rgb,9,8,7),0) 100%);}
html.hero-on .fo.fo-narrow .fo-h1{font-size:calc(clamp(38px,11.2vw,50px)*var(--d-scale-n,var(--d-scale,1)));margin-top:4px;}
.fo.fo-narrow .fo-lede{font-size:13.5px;line-height:1.5;margin-top:12px;max-width:34ch;}
.fo.fo-narrow .fo-hint{display:none;}
.fo.fo-narrow .fo-side{left:var(--pad-x);right:var(--pad-x);top:auto;bottom:calc(10px + env(safe-area-inset-bottom));width:auto;}
.fo.fo-narrow .fo-side > .fo-rule,.fo.fo-narrow .fc-stage,.fo.fo-narrow .fc-nav{display:none;}
.fo.fo-narrow .fo-ro{display:block;}
.fo-ro .ro-nums{display:flex;gap:0;border-top:1px solid rgba(var(--c-text-rgb,241,235,223),0.16);}
.fo-ro .ro-nums button{flex:1;appearance:none;border:0;background:none;padding:10px 0 9px;font-family:var(--v2-label);font-size:calc(11px*var(--l-scale,1));letter-spacing:calc(0.12em + var(--l-track,0em));color:rgba(var(--c-text-rgb,241,235,223),0.5);text-align:left;cursor:pointer;transition:color .3s;font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);}
.fo-ro .ro-nums button{position:relative;}
.fo-ro .ro-nums button::before{content:'';position:absolute;left:0;top:-1px;width:16px;height:2px;background:var(--c);opacity:0.5;transition:width .45s cubic-bezier(.2,.8,.2,1), opacity .3s ease;}
.fo-ro .ro-nums button.on{color:var(--v2-ivory);} .fo-ro .ro-nums button.on::before{width:28px;opacity:1;}
.fo-ro .ro-cat{margin:4px 0 0;display:flex;align-items:center;gap:7px;font-family:var(--v2-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:color-mix(in srgb, var(--c) 60%, #fff);}
.fo-ro .ro-cat i{display:block;width:6px;height:6px;border-radius:50%;background:var(--c);}
.fo-ro .ro-body{position:relative;height:126px;}
/* out first, then in: two readouts never print over each other (round 0: Kilimanjaro over Tongariro) */
.fo-ro .ro-card{position:absolute;left:0;right:0;top:0;opacity:0;transform:translateY(-6px);transition:opacity .16s ease, transform .3s ease;}
.fo-ro .ro-card.on{opacity:1;transform:none;transition:opacity .38s ease .17s, transform .6s cubic-bezier(.2,.8,.2,1) .17s;}
.fo-ro .ro-name{margin:6px 0 0;font-family:var(--v2-display);font-weight:var(--d-ui-w,400);font-stretch:var(--d-ui-st,100%);font-size:calc(24px*var(--d-ui,1));line-height:1.05;}
.fo-ro .ro-name em{font-style:var(--d-sub,italic);font-weight:var(--d-sub-w,400);font-stretch:var(--d-sub-st,var(--d-ui-st,100%));font-size:calc(18px*var(--d-ui,1));color:rgba(var(--c-text-rgb,241,235,223),0.74);}
.fo-ro .ro-alt{margin:8px 0 0;display:flex;align-items:baseline;gap:10px;}
.fo-ro .ro-alt .v{font-family:var(--n-family,var(--v2-label));font-weight:var(--n-w,400);font-size:calc(24px*var(--n-scale,1));letter-spacing:calc(-0.03em + var(--n-track,0em));line-height:1;color:var(--v2-ivory);font-variant-numeric:tabular-nums;white-space:nowrap;}
.fo-ro .ro-alt .k{font-family:var(--v2-label);font-size:calc(9.5px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.14em + var(--l-track,0em));color:rgba(var(--c-text-rgb,241,235,223),0.55);text-transform:uppercase;}
.fo-ro .ro-pin{margin:8px 0 0;font-family:var(--v2-label);font-size:calc(10px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.12em + var(--l-track,0em));color:rgba(var(--c-text-rgb,241,235,223),0.86);display:flex;align-items:center;gap:8px;text-transform:uppercase;}
.fo-ro .ro-pin i{display:block;width:6px;height:6px;border-radius:50%;background:var(--v2-red);}
.fo-ro .ro-tip{margin:12px 0 0;font-family:var(--v2-label);font-size:calc(10.5px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);letter-spacing:calc(0.18em + var(--l-track,0em));text-transform:uppercase;color:rgba(var(--c-text-rgb,241,235,223),0.78);display:flex;gap:10px;align-items:center;}
.fo-ro .ro-tip i{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--v2-red);}
`;
  document.head.appendChild(css);

  let dom = null;
  const altText = (i) => fmtM(INFO[i].summit.m);
  // a separator stays on the line before it, and a count never splits ("card 9 of / 15" and a line opening on "·", rounds 3 and V6)
  const altKey = (i) => '<b>' + esc(INFO[i].summit.name) + '</b>&nbsp;· ' + INFO[i].summit.kind + '&nbsp;· ' + INFO[i].n + '&nbsp;cards, ' + INFO[i].step + '&nbsp;m&nbsp;apart';
  const pinText = (i) => { const p = INFO[i].pin; return p ? esc(p.label) + ' ' + (p.m ? fmtM(p.m) : '') : ''; };
  function buildDom(){
    const T0 = TREKS[0], T4 = TREKS[4], d0 = daysOf(T0), d4 = daysOf(T4);
    // V6: Fold Line runs more treks than the five on the desk, so the copy is about the company and the five are a start
    // (Sam: "it's a trekking expedition company, for the landing page we display only five for now"). "since 2011" left the header for here
    const lede = (d0 && d4 && WORDS[d0] && WORDS[d4])
      ? 'Guided treks and expeditions since 2011. Five to start with, from ' + (d0 === 1 ? 'one day' : WORDS[d0] + ' days') + ' on a volcano to ' + WORDS[d4] + ' under Everest.'
      : 'Guided treks and expeditions since 2011. Five to start with, from a day on a volcano to the long walk under Everest.';
    const two = (k) => String(k + 1).padStart(2, '0');
    const metaOf = (T) => [daysLabel(T), kmOf(T).toUpperCase(), (T.country || '').toUpperCase()].filter(Boolean).map(esc).join('&nbsp;· ');
    const wrap = document.createElement('div'); wrap.className = 'fo';
    wrap.innerHTML =
      '<div class="fo-head">' +
        '<h1 id="h-hero" class="v2-display fo-h1">' +
          '<span class="v2-line"><span><span class="x">Every trek</span></span></span>' +
          '<span class="v2-line"><span><span class="x">folds into</span></span></span>' +
          '<span class="v2-line"><span><span class="x">a <em class="acc">pocket.</em></span></span></span>' +
        '</h1>' +
        '<p class="v2-lede fo-lede">' + lede + '</p>' +
        '<p class="fo-hint"><i></i><span>Point at a map to raise it</span><span class="sep">/</span><span>Scroll to go in at the pin</span></p>' +
      '</div>' +
      '<div class="fo-side">' +
        '<span class="fo-rule"></span>' +
        '<div class="fc-stage">' + TREKS.map((T, k) => '<article class="fc-card" data-i="' + k + '" aria-label="' + esc(T.name) + '" style="--cat:' + kit.catOf(k).color + '">' +
          '<p class="fc-cat"><i></i><span>' + esc(kit.catOf(k).name) + '</span></p>' +
          '<p class="fc-meta">' + metaOf(T) + '</p>' +
          '<h2 class="fc-name">' + esc(T.name) + '</h2>' +
          '<p class="fc-sub">' + esc(T.line2 || '') + '</p>' +
          '<p class="fc-alt"><span class="v">' + altText(k) + '</span></p>' +
          '<p class="fc-k">' + altKey(k) + '</p>' +
          (INFO[k].pin ? '<p class="fc-pin"><i></i><span>' + pinText(k) + '&nbsp;· ' + esc(INFO[k].pin.sub) + '</span></p>' : '') +
          '<p class="fc-line">' + esc(lineOf(T, k)) + '</p>' +
          '</article>').join('') + '</div>' +
        '<div class="fc-nav" role="group" aria-label="Featured treks">' +
          TREKS.map((T, k) => '<button type="button" class="fc-num" data-i="' + k + '" aria-label="' + esc(T.name) + '" style="--c:' + kit.catOf(k).color + '"><b>' + two(k) + '</b><span class="bar"></span></button>').join('') +
          '<span class="fc-count"><b>01</b> / ' + two(TREKS.length - 1) + '</span>' +
        '</div>' +
        '<div class="fo-ro">' +
          '<div class="ro-nums">' + TREKS.map((T, k) => '<button type="button" data-i="' + k + '" style="--c:' + kit.catOf(k).color + '">' + two(k) + '</button>').join('') + '</div>' +
          '<div class="ro-body">' +
            '<div class="ro-card ro-tipcard on"><p class="ro-tip"><i></i>Tap a map to raise it</p></div>' +
            TREKS.map((T, k) => '<div class="ro-card" data-i="' + k + '">' +
              '<p class="ro-cat" style="--c:' + kit.catOf(k).color + '"><i></i>' + esc(kit.catOf(k).name) + ' · ' + esc(daysLabel(T)) + '</p>' +
              '<p class="ro-name">' + esc(T.name) + ' <em>' + esc(T.line2 || '') + '</em></p>' +
              '<p class="ro-alt"><span class="v">' + altText(k) + '</span><span class="k">' + esc(INFO[k].summit.name) + '</span></p>' +
              (INFO[k].pin ? '<p class="ro-pin"><i></i>' + pinText(k) + '</p>' : '') +
              '</div>').join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      // the arrows sit either side of the map in the light (placed each frame from the table's edges())
      '<button type="button" class="fo-arrow prev" aria-label="Previous trek">←</button>' +
      '<button type="button" class="fo-arrow next" aria-label="Next trek">→</button>';
    kit.copy.appendChild(wrap);
    dom = {
      root:wrap,
      head:wrap.querySelector('.fo-head'),
      lines:Array.from(wrap.querySelectorAll('.fo-h1 .v2-line > span')),
      xs:Array.from(wrap.querySelectorAll('.fo-h1 .x')),
      lede:wrap.querySelector('.fo-lede'), hint:wrap.querySelector('.fo-hint'),
      side:wrap.querySelector('.fo-side'),
      sideK:wrap.querySelector('.fc-count'),
      rule:wrap.querySelector('.fo-rule'),
      count:wrap.querySelector('.fc-count b'),
      stage:wrap.querySelector('.fc-stage'),
      fcs:Array.from(wrap.querySelectorAll('.fc-card')),
      fnav:wrap.querySelector('.fc-nav'),
      fnums:Array.from(wrap.querySelectorAll('.fc-num')),
      prev:wrap.querySelector('.fo-arrow.prev'), next:wrap.querySelector('.fo-arrow.next'),
      ro:wrap.querySelector('.fo-ro'),
      nums:Array.from(wrap.querySelectorAll('.ro-nums button')),
      cards:Array.from(wrap.querySelectorAll('.ro-card[data-i]')),
      tipcard:wrap.querySelector('.ro-tipcard'),
      altV:Array.from(wrap.querySelectorAll('.fc-card .fc-alt .v')),
      altK:Array.from(wrap.querySelectorAll('.fc-card .fc-k')),
      roV:Array.from(wrap.querySelectorAll('.ro-card[data-i] .ro-alt .v')),
      roK:Array.from(wrap.querySelectorAll('.ro-card[data-i] .ro-alt .k'))
    };
    dom.root.classList.toggle('fo-narrow', NARROW);
  }
  buildDom();
  /* ---- the headline springs up like paper cut-outs, a word at a time (Sam, V6: "each word of the headline can spring
     from flat and put into position"). Each word lies flat on its back, hinged on its baseline, and springs upright with a
     little overshoot, one after the other. Sam's pick of two: a letter at a time is at commit 5151c84 (?pop=letters there).
     ?pop=off gives back the lines sliding up out of their masks, the before ---- */
  const POP = { off:kit.Q.get('pop') === 'off', bits:[], on:false, h1:dom.root.querySelector('.fo-h1') };
  if(!POP.off){
    POP.h1.setAttribute('aria-label', POP.h1.textContent.replace(/\s+/g, ' ').trim());
    dom.xs.forEach((x) => {
      x.setAttribute('aria-hidden', 'true');
      const texts = [], tw = document.createTreeWalker(x, NodeFilter.SHOW_TEXT);   // the accent word sits in an <em>
      while(tw.nextNode()) texts.push(tw.currentNode);
      texts.forEach((tn) => {
        const frag = document.createDocumentFragment();
        tn.nodeValue.split(/(\s+)/).forEach((part) => {
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'pw'; w.textContent = part;
          POP.bits.push(w); frag.appendChild(w);
        });
        tn.parentNode.replaceChild(frag, tn);
      });
    });
  }
  function popIn(){
    const t = POP.tl = gsap.timeline();
    if(POP.off) return t.to(dom.lines, { yPercent:0, duration:1.4, stagger:0.12, ease:'expo.out' });
    return t.to(POP.bits, { rotationX:0, duration:1.45, ease:'elastic.out(1, 0.42)', stagger:0.11 }, 0)
      .to(POP.bits, { autoAlpha:1, duration:0.18, ease:'power1.out', stagger:0.11 }, 0.04)
      .add(endPop);
  }
  // the spring's own timeline is killed, not the words' tweens: those sit inside the intro's timeline and kept running
  function endPop(){ if(!POP.on) return; POP.on = false; if(POP.tl) POP.tl.kill(); gsap.set(POP.bits, { clearProps:'transform,opacity,visibility' }); POP.h1.classList.remove('fo-popping'); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureText(); });
  /* ---- the arrows: Crease (hero/arrows.js), Sam's pick of three. ?arrow=off gives back the plain glyphs ---- */
  {
    const AO = kit.Q.get('arrow') === 'off' ? null : window.FOLD_ARROW;
    if(AO){
      const st = document.createElement('style'); st.id = 'fold-arrows'; st.textContent = AO.css;
      document.head.appendChild(st);
      [dom.prev, dom.next].forEach((b) => { b.classList.add('crease'); b.innerHTML = AO.html(); });
    }
    // a hover the scripted tour can show too (its pointer events never reach CSS :hover), and a beat after each click
    [dom.prev, dom.next].forEach((b) => {
      b.addEventListener('pointermove', (e) => { if(e.pointerType === 'mouse') b.classList.add('is-hover'); });   // a finger leaves no hover behind
      b.addEventListener('pointerleave', () => b.classList.remove('is-hover'));
      b.addEventListener('click', () => { b.classList.remove('is-press'); void b.offsetWidth; b.classList.add('is-press'); clearTimeout(b._pt); b._pt = setTimeout(() => b.classList.remove('is-press'), 620); });
    });
    window.addEventListener('pointermove', (e) => { [dom.prev, dom.next].forEach((b) => { if(!b.contains(e.target)) b.classList.remove('is-hover'); }); }, { passive:true });
  }

  /* ---- the trek numbers: Spines (hero/spines.js), Sam's pick of three. ?nums=off gives back the plain row ---- */
  const NO = kit.Q.get('nums') === 'off' ? null : window.FOLD_NUMS;
  if(NO){
    const st = document.createElement('style'); st.id = 'fold-nums'; st.textContent = NO.css; document.head.appendChild(st);
    NO.build({ dom, TREKS, kit });
  }

  let shownI = -2;
  // the card always shows a trek: with nothing raised it keeps the last one (No. 01 before the first)
  let cardI = WALKM;
  function showActive(i){
    if(i === shownI) return;
    shownI = i;
    if(i >= 0) cardI = i;
    dom.fcs.forEach((c, k) => c.classList.toggle('on', k === cardI));
    dom.fnums.forEach((b, k) => b.classList.toggle('on', k === cardI));
    dom.count.textContent = String(cardI + 1).padStart(2, '0');
    dom.side.style.setProperty('--cat', kit.catOf(cardI).color);
    dom.root.style.setProperty('--cat', kit.catOf(cardI).color);
    dom.nums.forEach((b, k) => b.classList.toggle('on', k === i));
    dom.cards.forEach((c, k) => c.classList.toggle('on', k === i));
    dom.tipcard.classList.toggle('on', i < 0);
  }
  // the readout: the height counts with the cards as they stand, and reads the card under the cursor
  const RO = { v:[], k:[] };
  function readout(i, v, kHtml, kPlain){
    if(RO.v[i] !== v){ RO.v[i] = v; dom.altV[i].textContent = v; dom.roV[i].textContent = v; }
    if(RO.k[i] !== kHtml){ RO.k[i] = kHtml; dom.altK[i].innerHTML = kHtml; dom.roK[i].textContent = kPlain; }
  }

  /* ============================================================
     6. pointer: hover on a wide screen, tap on a phone. the index
        and the desk drive the same state
     ============================================================ */
  // V1 moves the real camera to its own shot before our frame runs, so pointer rays
  // use a copy of the camera as it was last drawn
  const eye = new THREE.PerspectiveCamera(34, 1, 0.4, 400);
  const GAP = { x:0, y0:0, y1:0 };
  function keepEye(){
    const c = kit.camera;
    eye.position.copy(c.position); eye.quaternion.copy(c.quaternion);
    if(eye.fov !== c.fov || eye.aspect !== c.aspect){ eye.fov = c.fov; eye.aspect = c.aspect; eye.updateProjectionMatrix(); }
    eye.updateMatrixWorld(true);
  }
  const PLANE = new THREE.Plane(V3(0, 1, 0), 0), _hit = V3(0,0,0);
  const PTR = { has:false, x:0, y:0, el:null, sx:0, sy:0, speed:0, moves:0 };
  let listI = -1, focusI = -1, hoverI = -1, hoverT = -9, tapI = -1, candI = -1, candT = 0, started = false, playing = false, tIntro = 0;
  let upI = -1, hold = false, holdMoves = 0;   // the mountain that stands, and whether the intro still owns the lean

  window.addEventListener('pointermove', (e) => {
    PTR.has = true; PTR.x = e.clientX; PTR.y = e.clientY; PTR.el = e.target; PTR.moves++; PTR.mouse = e.pointerType === 'mouse';
  }, { passive:true });
  window.addEventListener('pointerout', (e) => { if(!e.relatedTarget) { PTR.has = false; PTR.el = null; } }, { passive:true });
  function mapAt(x, y){
    ndc.set((x/window.innerWidth)*2 - 1, -(y/window.innerHeight)*2 + 1);
    ray.setFromCamera(ndc, eye);
    const h = ray.intersectObjects(PICKS, false);
    return h.length ? h[0].object.userData.mapI : -1;
  }
  const overSide = (el) => !!(el && el.closest && el.closest('.fo-side'));
  // the map in the light is a way in too, the same as the Explore the trail button (V7, feedback on Sam's demo: people
  // click the map itself, between the arrows, and nothing happened). Only once its mountain stands (upI), so a map the
  // table is still turning to is not dived into, and only on the scene itself, not on text or a button over it.
  // A mouse over it gets the pointer and lights the button up, so the two read as one thing
  const onCanvas = (el) => !!(el && el.tagName === 'CANVAS');
  const explore = () => { const b = document.querySelector('.fo-explore'); if(b) b.click(); };
  let mapHot = false;
  // !!: before any mouse has moved PTR.mouse is undefined, and toggle(name, undefined) flips the class instead of clearing it
  const setHot = (on) => { on = !!on; if(on !== mapHot){ mapHot = on; document.documentElement.classList.toggle('fo-map-hot', on); } };
  window.addEventListener('scroll', () => { if(mapHot && window.scrollY > 40) setHot(false); }, { passive:true });
  // a swipe across the desk steps through the treks (the options)
  const SWIPE = { x:0, y:0, on:false };
  window.addEventListener('pointerdown', (e) => { SWIPE.x = e.clientX; SWIPE.y = e.clientY; SWIPE.on = !overSide(e.target); }, { passive:true });
  window.addEventListener('pointerup', (e) => {
    if(!started || HX > 0.02 || (kit.away && kit.away())) return;
    if(SW){
      if(overSide(e.target)) return;
      const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y;
      if(SWIPE.on && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)*1.3){ step(dx < 0 ? 1 : -1); return; }
      let i = mapAt(e.clientX, e.clientY);
      if(i >= 0 && i === upI && e.button === 0 && Math.hypot(dx, dy) < 12 && onCanvas(e.target)){ setHot(false); explore(); return; }
      // or a pin on the globe at the table's centre
      if(i < 0 && SW.pickAt) i = SW.pickAt((e.clientX/window.innerWidth)*2 - 1, -(e.clientY/window.innerHeight)*2 + 1, eye);
      if(i >= 0) (SW.click || SW.select)(i);
      return;
    }
    if(!(NARROW || e.pointerType === 'touch')) return;
    if(overSide(e.target)) return;
    const i = mapAt(e.clientX, e.clientY);
    tapI = (i === tapI) ? -1 : i;
    hold = false;
  });
  dom.nums.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.i; if(SW){ SW.select(i); return; } tapI = (i === tapI) ? -1 : i; hold = false; }));
  // the card's numbers, its arrows and the keyboard's arrows step through the treks
  // a pick made a little way into the scroll, while the card still shows, glides the page back to the top and turns
  // the table there. it used to do nothing from 0.015 of the hero on, where the card is still on screen (V6, Sam:
  // "when we scroll back into the hero section, the left and right arrow doesn't rotate the table anymore")
  function toTop(){ if(HX > 0.002 && kit.lenis) kit.lenis.scrollTo(0, { duration:REDUCED ? 0 : 0.7 }); }
  function pick(i){ if(SW){ if(HX > 0.1) return; toTop(); SW.select(i); return; } tapI = i; hoverI = -1; candI = -1; hold = false; }
  function step(d){
    if(!started || (kit.away && kit.away())) return;
    if(SW){ if(HX > 0.1) return; toTop(); SW.select((SW.sel + d + TREKS.length) % TREKS.length, d); return; }
    if(HX > 0.02) return;
    const cur = tapI >= 0 ? tapI : upI >= 0 ? upI : cardI; pick((cur + d + TREKS.length) % TREKS.length);
  }
  dom.fnums.forEach((b) => {
    b.addEventListener('click', () => pick(+b.dataset.i));
    b.addEventListener('focus', () => { focusI = +b.dataset.i; hold = false; });
    b.addEventListener('blur', () => { focusI = -1; });
  });
  dom.prev.addEventListener('click', () => step(-1));
  dom.next.addEventListener('click', () => step(1));
  window.addEventListener('keydown', (e) => {
    if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    step(e.key === 'ArrowRight' ? 1 : -1);
  });

  // what hero/switch.js can see and use
  function swCtx(){
    return { THREE, kit, gsap, MAPS, K, X, PW, PD, PI, D2R, V3, seg, smooth, eio, lerp, clamp01, spring, fit, root, REDUCED, TREKS, walkI:WALKM, get diveI(){ return DIVE; },
      get NARROW(){ return NARROW; }, get started(){ return started; },
      introT(t){ return playing ? t - tIntro : -1; },
      pick:(i) => { pick(i); } };
  }

  /* ============================================================
     7. springs and the per-frame pose of every map
     ============================================================ */
  function spring(c, target, k, d, dt){ c.v += ((target - c.p)*k - c.v*d)*dt; c.p += c.v*dt; }
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _v = V3(0,0,0);
  const hermite = (a, m0, b, m1, u) => { const u2 = u*u, u3 = u2*u; return (2*u3 - 3*u2 + 1)*a + (u3 - 2*u2 + u)*m0 + (-2*u3 + 3*u2)*b + (u3 - u2)*m1; };
  function dealPose(M, u){
    const S0 = M.start, H = M.home;
    const dx = H.x - S0.x, dz = H.z - S0.z, len = Math.hypot(dx, dz) || 1, ux = dx/len, uz = dz/len;
    const SLIDE = 0.55, VS = 3.0;
    const Lx = H.x - ux*SLIDE, Lz = H.z - uz*SLIDE, dur = K.DEAL_DUR;
    const x = hermite(S0.x, (Lx - S0.x)*1.7, Lx, ux*VS*dur, u), z = hermite(S0.z, (Lz - S0.z)*1.7, Lz, uz*VS*dur, u);
    const y = S0.y*(1 - Math.pow(u, 2.4));
    const ry = lerp(S0.ry, H.ry + (S0.ry - H.ry)*0.14, 1 - Math.pow(1 - u, 2.2));
    return { x, y, z, ry, rz:S0.rz*(1 - u), rx:-0.07*Math.sin(PI*u), vx:ux*VS, vz:uz*VS, vy:-S0.y*2.4/dur };
  }

  let HX = 0, dealtAll = false;
  // who is pointed at right now (lifts the map, leans the camera), -1 for nobody
  function activeI(){
    if(SW) return started && HX <= 0.015 ? SW.sel : -1;
    if(!started || HX > 0.015) return -1;
    if(listI >= 0) return listI;
    if(focusI >= 0) return focusI;
    if(NARROW) return tapI;
    return tapI >= 0 && hoverI < 0 ? tapI : hoverI;
  }
  // the point the camera leans toward and the lamp aims at: the map's centre, half way up its mountain
  function anchorOf(M, out){
    const D = M.model, h = D ? (D.height || 0)*0.45 : 0;
    _v.set(0, M.coverY + h, K.CTR_Z);
    M.pivot.updateWorldMatrix(true, false);
    return out.copy(_v).applyMatrix4(M.pivot.matrixWorld);
  }
    function poseMaps(dt, time, hx){
    const act = activeI();
    const sweep = NARROW ? SWEEP_N : SWEEP_D;
    for(const M of MAPS){
      const i = M.i, s = M.s, H = M.home;
      let shadowK = 1;
      if(SW){
        const P = SW.pose(M, time, hx, dt);
        s.x.p = P.x; s.y.p = P.y; s.z.p = P.z; s.rx.p = P.rx || 0; s.ry.p = P.ry || 0; s.rz.p = P.rz || 0;
        spring(M.dim, P.dim === undefined ? 1 : P.dim, 60, 16, dt);
        shadowK = P.shadow === undefined ? 1 : P.shadow;
        if(!M.dealt){ M.dealt = true; if(i === 4) dealtAll = true; }
      } else {
      const tDeal = K.DEAL0 + i*K.DEAL_GAP;
      const since = playing ? time - tIntro - tDeal : -1;
      if(!M.dealt){
        if(since < 0 || REDUCED){
          if(REDUCED && playing){ M.dealt = true; s.x.p = H.x; s.z.p = H.z; s.y.p = 0; s.ry.p = H.ry; s.rx.p = 0; s.rz.p = 0; }
          else { s.x.p = M.start.x; s.z.p = M.start.z; s.y.p = M.start.y; s.ry.p = M.start.ry; s.rz.p = M.start.rz; s.rx.p = 0; }
        } else if(since < K.DEAL_DUR){
          const P = dealPose(M, since/K.DEAL_DUR);
          s.x.p = P.x; s.y.p = P.y; s.z.p = P.z; s.ry.p = P.ry; s.rz.p = P.rz; s.rx.p = P.rx;
        } else {
          const P = dealPose(M, 1);
          s.x.p = P.x; s.z.p = P.z; s.y.p = 0; s.ry.p = P.ry; s.rz.p = 0; s.rx.p = 0;
          s.x.v = P.vx; s.z.v = P.vz; s.y.v = P.vy; s.ry.v = 0; s.rz.v = 0; s.rx.v = 0;
          M.dealt = true;
          if(i === 4) dealtAll = true;
        }
      }
      const up = (act === i) ? 1 : 0;
      // up quickly, down slower: a map let go dropped in a frame at 30 fps (round 2, phone taps)
      spring(M.lift, up, REDUCED ? 400 : up ? 150 : 55, REDUCED ? 40 : up ? 15 : 10.5, dt);
      // a map that slides under the index column falls into its shade, or its printed title reads
      // through the type (round 0: "Everest" twice)
      let dimT = (upI >= 0 && upI !== i) ? lerp(K.DIM, K.DIM_UP, FOCUS.p) : (act >= 0 && act !== i) ? K.DIM : 1;
      // only once the view has settled: maps passing under the column mid-slide stay lit, or the frame goes dark
      if(dimT < 1 && LP.v.lengthSq() < 0.36){
        const b = mapBox(M, eye);
        if(NARROW ? (b.y1 > TXT.headB || b.y0 < TXT.roT) : b.x1 > TXT.sideL) dimT *= K.DIM_SIDE;
      }
      spring(M.dim, dimT, 60, 16, dt);
      const L = Math.max(0, M.lift.p);
      const order = 4 - i;
      const sw = i === DIVE ? 0 : eio(seg(hx, X.SWEEP[0] + order*0.05, X.SWEEP[0] + X.SWEEP[1] + order*0.05));
      const toCam = Math.atan2(CAM.pos.x - H.x, CAM.pos.z - H.z);
      let tx = H.x + sw*sweep.dx, tz = H.z + sw*sweep.dz, ty = M.lift.p*K.LIFT, trx = M.lift.p*K.TILT;
      const tyaw = lerp(H.ry, toCam*0.35, Math.min(1, L)) + sw*sweep.ry;
      // the walk's way back lands the maps on their places at once, under the walk's own shot (sections/landing.js, back)
      if(window.FOLD_RETURN && window.FOLD_RETURN.snap){ s.x.p = tx; s.z.p = tz; s.y.p = ty; s.rx.p = trx; s.ry.p = tyaw; s.rz.p = 0; s.x.v = s.z.v = s.y.v = s.rx.v = s.ry.v = s.rz.v = 0; }
      if(M.dealt){
        const sub = dt > 0.02 ? 2 : 1, h = dt/sub;
        for(let k=0;k<sub;k++){
          spring(s.x, tx, 55, 14, h); spring(s.z, tz, 55, 14, h);
          spring(s.y, ty, 170, 12, h);
          if(s.y.p < 0){ s.y.p = 0; if(s.y.v < 0) s.y.v *= -0.22; }
          spring(s.rx, trx, 120, 13, h);
          spring(s.ry, tyaw, 90, 13, h);
          spring(s.rz, 0, 120, 14, h);
        }
      }
      }
      const px = s.x.p, py = s.y.p, pz = s.z.p, rx = s.rx.p, ry = s.ry.p, rz = s.rz.p;
      M.pivot.position.set(px, py, pz);
      _e.set(rx, ry, rz, 'YXZ'); M.pivot.quaternion.setFromEuler(_e);
      if(i === WALKM){
        const R = kit.mapRoot;
        if(hx >= X.SWAP){ R.position.set(0, 0, 0); R.quaternion.identity(); }
        else { R.position.copy(_v.set(M.offX, 0, 0).applyQuaternion(M.pivot.quaternion).add(M.pivot.position)); R.quaternion.copy(M.pivot.quaternion); }
      }
      // No. 01's cover darkens round its mountain as the dive tips over it: its big printed title passed under the header (round 2)
      const dim = hx >= X.SWAP ? 1 : M.dim.p*(i === DIVE ? 1 - 0.62*smooth(seg(hx, 0.08, 0.22)) : 1);
      M.dimMats.forEach(m => m.color.setScalar(dim));
      const gUp = M.model ? M.model.g : 0;
      M.gloss.material.uniforms.uAmt.value = dim*dim*(1 - smooth(gUp));
      // the pick box stands as tall as the mountain, so its top still counts as the map
      const ph = 0.34 + (M.model ? (M.model.height || 0) : 0);
      M.pick.scale.y = ph; M.pick.position.y = ph*0.5;
      const sh = M.shadow, lift = Math.max(0, py);
      const away = lift/Math.max(2, K.LAMP_H - lift);
      sh.position.set(px + (px - lamp.position.x)*away, -0.008, pz + (pz - lamp.position.z)*away);
      sh.rotation.y = ry;
      const spread = 1 + lift*0.16;
      sh.scale.set(spread, 1, spread);
      sh.material.opacity = 0.58*(1 - Math.min(0.55, lift*0.42))*Math.min(1, LAMP.k*1.5)*shadowK;
    }
  }

  /* ---- read the pointer once a frame: hover intent, the list, the pool target ---- */
  const poolT = { x:0, z:0 };
  function readPointer(dt, time){
    const vx = (PTR.x - PTR.sx)/Math.max(dt, 1e-3), vy = (PTR.y - PTR.sy)/Math.max(dt, 1e-3);
    PTR.speed = lerp(PTR.speed, Math.hypot(vx, vy), 1 - Math.exp(-dt*14));
    PTR.sx = PTR.x; PTR.sy = PTR.y;
    const li = PTR.el && PTR.el.closest ? PTR.el.closest('.fc-num') : null;
    listI = (PTR.has && li) ? +li.dataset.i : -1;
    let cand = -1;
    if(PTR.has && !overSide(PTR.el) && dealtAll) cand = mapAt(PTR.x, PTR.y);
    // while the view slides to a new map, the maps move under a cursor that is standing still.
    // only a real move of the pointer may change what it points at
    const moved = PTR.moves !== PTR.seen; PTR.seen = PTR.moves;
    if(SW){
      if(SW.hover) SW.hover(PTR.has && !overSide(PTR.el) ? cand : -1, time);
      setHot(PTR.mouse && cand >= 0 && cand === upI && HX <= 0.02 && window.scrollY <= 40 && onCanvas(PTR.el) &&
             document.documentElement.classList.contains('mode-landing'));
      const q = SW.pool(time, HX); poolT.x = q.x; poolT.z = q.z;
      return;
    }
    if(!NARROW){
      if(moved && cand !== candI){ candI = cand; candT = time; }
      if(candI !== hoverI){
        // a quick sweep across the row doesn't raise every map it crosses. and while the view slides
        // from one map to the next, the maps travel under the cursor: nothing new is taken until the
        // slide has settled, and a map just taken holds a moment (round 0: Kilimanjaro, Everest,
        // Kilimanjaro in a third of a second, its print blinking and its count dropping back)
        const dwell = time - candT;
        const sliding = FOCUS.p > 0.02 && LP.v.lengthSq() > 0.36;
        const held = hoverI >= 0 && time - hoverT < 0.5;
        if(candI >= 0 && !sliding && !held && ((PTR.speed < 300 && dwell > 0.08) || dwell > 0.24)){ hoverI = candI; hoverT = time; }
        else if(candI < 0 && dwell > 0.18) hoverI = -1;
      }
    }
    let px = CAM.rest.x, pz = CAM.rest.z;
    if(PTR.has && playing && time - tIntro > 1.5){
      ndc.set((PTR.x/window.innerWidth)*2 - 1, -(PTR.y/window.innerHeight)*2 + 1);
      ray.setFromCamera(ndc, eye);
      if(ray.ray.intersectPlane(PLANE, _hit)){ px = _hit.x; pz = _hit.z; }
      else { px = CAM.rest.x; pz = REGION.z0; }
      px = Math.max(REGION.x0, Math.min(REGION.x1, px)); pz = Math.max(REGION.z0, Math.min(REGION.z1, pz));
    }
    const a = activeI();
    if(a >= 0){ const M = MAPS[a], k = (a === listI || a === focusI || a === tapI) ? 0.9 : 0.55; px = lerp(px, M.home.x, k); pz = lerp(pz, M.home.z + 0.6, k); }
    poolT.x = px; poolT.z = pz;
  }

  /* ============================================================
     8. the frame
     ============================================================ */
  const _bg = new THREE.Color(V2.bg), BLACK = new THREE.Color(PL ? PL.void : '#060505');
  const _cp = V3(0,0,0), _ct = V3(0,0,0), _y = V3(0, 1, 0), _ax = V3(), _q = new THREE.Quaternion();
  const _aim = V3(), _lp = V3(), _ld = V3(), _rk = V3(), _dk = V3();
  const par = { x:{p:0,v:0}, y:{p:0,v:0} };
  const FOCUS = { p:0, v:0 };                            // how far the view has gone in on the standing mountain
  const LP = { p:V3(), v:V3(), init:false };             // the point it goes in on, on a spring so a switch slides
  const SPOT = { x:0, y:0, vx:0, vy:0, init:false };     // where on screen that point is panned to, on the same spring
  const LEANK = { p:1 };                                 // phone: how much of the lean fits between the type
  let lastX = '', lastHead = '', domHidden = false, cardK = -1;

  function frame(dt, t, hx, pre){
    if(!layoutDone) layout();
    if(COVERS_DUE && hx < X.SWAP && window.FL_LATER && !document.documentElement.classList.contains('fl-dive')){ COVERS_DUE = false; while(window.FL_LATER.length) window.FL_LATER.shift()(); }
    HX = hx;
    const time = t;
    const v1Near = kit.scene.fog.near, v1Far = kit.scene.fog.far;
    if(!pre) readPointer(dt, time);
    if(!pre) pumpCut(MAPS.some(M => M.model && M.model.g > 0.001 && M.model.g < 0.999) ? 2.5 : 4);

    // ---- which mountain stands, and how far the view goes in on it
    const act = activeI();
    // the intro's lean on No. 01 lasts until the pointer moves after the mountain has finished standing
    if(SW) upI = SW.upI(time, hx);
    else {
      if(hold){ const g0 = MAPS[WALKM].model ? MAPS[WALKM].model.g : 0; if(g0 < 1) holdMoves = PTR.moves; else if(PTR.moves > holdMoves) hold = false; }
      if(hx > 0.015 || hold) upI = 0;
      else if(act >= 0) upI = act;
    }
    if(upI >= 0) wantCut(upI);
    // once in, the view stays in and slides from map to map: going back out would slide
    // the other maps under a cursor that has not moved
    const focusOn = !SW && upI >= 0;   // the options hold their own shot, nothing leans or slides
    if(!pre) spring(FOCUS, focusOn ? 1 : 0, REDUCED ? 300 : 22, REDUCED ? 35 : 9.5, dt);

    poseMaps(pre ? 0 : dt, time, hx);

    // ---- the mountains: one up, the rest sinking back into their print
    let hk = -1;
    for(const M of MAPS){
      const D = M.model; if(!D) continue;
      const want = (M.i === upI) ? 1 : 0;
      if(pre || REDUCED) D.g = want;
      else if(want > D.g) D.g = Math.min(1, D.g + dt/K.GROW_S);
      // only sink when it should be lower. A plain "else" also sank a mountain that was all the way up: it dipped one frame
      // in four, and the height on the tall ones flickered a metre (5 895 / 5 894 m, Sam, 17 Oct 2026)
      else if(want < D.g) D.g = Math.max(0, D.g - dt/((SW && SW.sinkS) || K.SINK_S));
      // the dive goes into the walk map: its mountain is all the way up early in the scroll
      if(M.i === DIVE && hx > 0) D.g = Math.max(D.g, smooth(seg(hx, 0, X.GROW)));
      const vis = stepModel(M, pre ? 0 : dt, time, M.i === upI ? cardK : -1);
      // only the standing mountain and the walk map's keep their GPU buffers
      if(!vis && M.i !== WALKM && M.i !== DIVE && D.gpu && M.i !== upI){ D.geo.dispose(); D.gpu = false; }
      if(vis) D.gpu = true;
    }

    // ---- the lamp: a desk pool that follows the pointer, until a mountain stands. then it
    //      drops low to the side of it, and the cursor swings it round
    const settle = smooth(seg(hx, 0.02, 0.5));
    const ptx = SW ? poolT.x : lerp(poolT.x, MAPS[WALKM].home.x + (NARROW ? 0 : 1.2), settle);
    const ptz = SW ? poolT.z : lerp(poolT.z, MAPS[WALKM].home.z, settle);
    const W = window.innerWidth, Hh = window.innerHeight;
    let azT = K.RAKE_REST[0], elT = K.RAKE_REST[1];
    if(PTR.has && playing){ azT = lerp(K.RAKE_AZ[0], K.RAKE_AZ[1], clamp01(PTR.x/W)); elT = lerp(K.RAKE_EL[0], K.RAKE_EL[1], clamp01(PTR.y/Hh)); }
    // in the dive the cursor lets go of the lamp: it settles low and warm on the pin, a low sun
    const sunK = smooth(seg(hx, 0.04, 0.36));
    azT = lerp(azT, K.SUN_AZ, sunK); elT = lerp(elT, K.SUN_EL, sunK);
    const upM = upI >= 0 ? MAPS[upI] : null, upD = upM && upM.model;
    const rakeOn = upM ? 1 : 0;
    if(!pre){
      const sub = dt > 0.02 ? 2 : 1, h = dt/sub;
      for(let k=0;k<sub;k++){
        const pk = (SW && SW.poolK) || K.POOL_K, pc = (SW && SW.poolC) || K.POOL_C;
        spring(pool.x, ptx, REDUCED ? 200 : pk, REDUCED ? 28 : pc, h); spring(pool.z, ptz, REDUCED ? 200 : pk, REDUCED ? 28 : pc, h);
        RAKE.va += ((azT - RAKE.az)*K.SUN_K - RAKE.va*K.SUN_C)*h; RAKE.az += RAKE.va*h;
        RAKE.ve += ((elT - RAKE.el)*K.SUN_K - RAKE.ve*K.SUN_C)*h; RAKE.el += RAKE.ve*h;
      }
      spring(RAKE.r, rakeOn, REDUCED ? 300 : 9, REDUCED ? 35 : 5.4, dt);
    } else { RAKE.az = azT; RAKE.el = elT; RAKE.r.p = rakeOn; }
    if(upM){
      anchorOf(upM, _aim);
      if(!RAKE.aimInit || pre){ RAKE.aim.copy(_aim); RAKE.aimInit = true; }
      else RAKE.aim.lerp(LP.init && FOCUS.p > 0.02 ? LP.p : _aim, 1 - Math.exp(-dt*6));   // with the view's slide, not ahead of it: the old map went dark first (round 2)
    }
    // and its aim slides from the middle of the mountain onto the pin
    const pinK = smooth(seg(hx, 0.12, 0.45));
    if(pinK > 0 && pinAt(PIN_BASE)) _lamAim.copy(RAKE.aim).lerp(PIN_BASE, pinK); else _lamAim.copy(RAKE.aim);
    const R = clamp01(RAKE.r.p), Rs = smooth(R);
    // the desk pose
    _dk.set(pool.x.p, 0, pool.z.p);
    _ld.set(pool.x.p - K.LAMP_LEFT, K.LAMP_H, pool.z.p - K.LAMP_BACK);
    if(SW && SW.lamp) SW.lamp(_ld, _dk);   // an option may hang the lamp elsewhere (a map stood upright is lit from the front)
    // the raking pose
    const az = RAKE.az*D2R, el = Math.max(4, RAKE.el)*D2R;
    _rk.set(Math.sin(az)*Math.cos(el), Math.sin(el), -Math.cos(az)*Math.cos(el)).multiplyScalar(K.RAKE_D).add(_lamAim);
    lamp.target.position.copy(_dk).lerp(_lamAim, Rs);
    lamp.position.copy(_ld).lerp(_rk, Rs);
    // the cone narrows onto the pin, so the shadow map spends its texels where the camera is going
    lamp.angle = lerp(lerp((SW && SW.lampAngle) || K.LAMP_ANGLE, K.RAKE_ANGLE, Rs), K.SUN_ANGLE, pinK);
    lamp.penumbra = lerp(K.LAMP_PEN, K.RAKE_PEN, Rs);
    lamp.shadow.focus = lerp(lerp(0.72, 0.92, Rs), 1, pinK);
    const dDesk = _ld.distanceTo(_dk), dRake = K.RAKE_D;
    const iRake = K.LAMP_I*(dRake*dRake)/(Math.hypot(K.LAMP_H, K.LAMP_BACK, K.LAMP_LEFT)**2)*K.RAKE_I;
    lamp.intensity = hx >= X.SWAP ? 0 : lerp(K.LAMP_I, iRake, Rs)*Math.max(0, LAMP.k)*(1 + 0.25*sunK)*((PL && PL.lampI) || 1);
    lamp.color.copy(LAMP_COLD).lerp(LAMP_WARM, LAMP.warm).lerp(K.SUN_COL, sunK);
    lamp.shadow.autoUpdate = hx < X.SWAP;
    GLOSS.uLamp.value.copy(lamp.position);
    GLOSS.uDir.value.copy(lamp.target.position).sub(lamp.position).normalize();
    GLOSS.uCos.value = Math.cos(lamp.angle);
    GLOSS.uI.value = lamp.intensity*K.GLOSS_K;
    GLOSS.uCol.value.copy(lamp.color);
    // the bounce: off the lit desk in the pool, or off the desk on the mountain's far side
    _lp.set(pool.x.p, 7, pool.z.p);
    _rk.sub(_lamAim).multiplyScalar(-0.6).add(_lamAim); _rk.y = _lamAim.y + 3.5;
    bounce.position.copy(_lp).lerp(_rk, Rs);
    bounce.intensity = lamp.intensity*lerp(K.BOUNCE, K.RAKE_BOUNCE, Rs);
    bounce.color.copy(lamp.color);

    if(hx < X.SWAP){
      if(pinAt(PIN_BASE, PIN_HEAD)){ SNAP.lampRel.copy(lamp.position).sub(PIN_HEAD); SNAP.bounceRel.copy(bounce.position).sub(PIN_HEAD); }
      SNAP.lampI = lamp.intensity; SNAP.bounceI = bounce.intensity; SNAP.angle = lamp.angle; SNAP.pen = lamp.penumbra;
      SNAP.focus = lamp.shadow.focus; SNAP.col.copy(lamp.color);
    } else landLight(seg(hx, X.SWAP, 1));

    // V1's lights: off while the lamp owns the room, coming up behind it once we are through the pin
    const v1k = hx < X.SWAP ? 0 : smooth(seg(seg(hx, X.SWAP, 1), LAND.LIGHT[0], LAND.LIGHT[1]));
    kit.key.shadow.autoUpdate = v1k > 0;                 // its shadow map costs a pass even at zero
    if(v1k < 1){
      // a light room (the palette round) is lit by its sky at a fixed level, the lamp only adds a pool and the shadows
      const amb = PL && PL.light ? clamp01(LAMP.k) : lerp(K.AMB, K.RAKE_AMB, Rs)*clamp01(LAMP.k)*((PL && PL.amb) || 1);
      kit.key.intensity *= v1k;
      kit.fill.intensity *= v1k;
      kit.hemi.intensity *= lerp(amb, 1, v1k);
      const room = lerp(0.35, 1, clamp01(LAMP.k));
      _bg.copy(kit.scene.background);
      kit.scene.background.copy(BLACK).lerp(_bg, lerp(room, 1, v1k));
      kit.scene.fog.color.copy(kit.scene.background);
    }

    // ---- camera: the desk shot, a slow push in during the intro, a breath of parallax,
    //      going in on the standing mountain, the dive onto the pin, then the other side
    const k = 1 - CAM.intro;
    _cp.copy(CAM.pos).sub(CAM.tgt).multiplyScalar(1 + 0.07*k);
    if(!pre && !REDUCED){
      const nx = PTR.has ? (PTR.x/W)*2 - 1 : 0, ny = PTR.has ? (PTR.y/Hh)*2 - 1 : 0;
      spring(par.x, nx, 18, 8, dt); spring(par.y, ny, 18, 8, dt);
    }
    _cp.applyAxisAngle(_y, -par.x.p*0.012);
    _cp.y += par.y.p*_cp.length()*0.006;
    _cp.add(CAM.tgt); _cp.y += 1.2*k;
    _ct.copy(CAM.tgt);
    const F = FOCUS.p;
    if(upM){
      // the point to go in on slides from map to map on a spring, unless the view is all the way out
      anchorOf(upM, _aim);
      if(!LP.init || F < 0.02 || pre){ LP.p.copy(_aim); LP.v.set(0, 0, 0); LP.init = true; }
      else { _lp.copy(_aim).sub(LP.p).multiplyScalar(K.SLIDE_K).addScaledVector(LP.v, -K.SLIDE_C); LP.v.addScaledVector(_lp, dt); LP.p.addScaledVector(LP.v, dt); }
      const z = (NARROW ? K.LEAN_N*LEANK.p : K.LEAN)*F;
      // a dolly straight at that point: it stays where it is on screen and grows
      _lp.copy(LP.p).sub(_cp).multiplyScalar(z);
      _cp.add(_lp); _ct.add(_lp);
      // then a pan across the image plane toward a spot where the map and its mountain fit whole:
      // the maps lie along the bottom of the frame, and grown in place they fall out of it
      _fitCam.position.copy(_cp); _fitCam.fov = CAM.fov; _fitCam.aspect = kit.camera.aspect; _fitCam.near = 0.1; _fitCam.far = 1000;
      _fitCam.updateProjectionMatrix(); _fitCam.lookAt(_ct); _fitCam.updateMatrixWorld();
      _lp.copy(LP.p).project(_fitCam);
      let wx = NARROW ? 0 : _lp.x*0.42 + 0.06, wy = NARROW ? K.SPOT_N : K.SPOT_Y;
      // and clear of the type (round 0: map 04 under the index, "Everest" printed twice, card titles
      // under the lede): never under the index column, below the headline block wherever it would
      // sit under it, the front edge kept in the frame. the map's extent is taken from its own anchor,
      // not from the point the view is sliding through, or the spot jumps the moment the map changes
      // (round 1: a one-frame snap on every switch), and the spot itself glides on a spring
      const bx = mapBox(upM, _fitCam), G = K.TEXT_GAP;
      _v.copy(_aim).project(_fitCam);
      const oL = bx.x0 - _v.x, oR = bx.x1 - _v.x, oT = bx.y1 - _v.y, oB = _v.y - bx.y0;
      if(!NARROW){
        wx = Math.min(wx, TXT.sideL - G - oR);
        TXT.clash = wx + oL < TXT.headR && TXT.headB - G - oT < -1.03 + oB;   // too tall to clear the block: the hint steps aside
        if(wx + oL < TXT.headR) wy = Math.max(Math.min(wy, TXT.headB - G - oT), -1.03 + oB);
      } else {
        // phone: between the headline block and the readout. the lean shrinks until the map fits that room
        // (round 1: at a 0.5 lean the raised map sat behind the lede)
        const top = TXT.headB - G, bot = TXT.roT + G, room = top - bot, need = oT + oB;
        if(!pre) LEANK.p = Math.max(0.45, Math.min(1, LEANK.p*(1 + Math.min(2, dt*1.6)*(room/Math.max(0.05, need) - 1))));
        wy = need <= room ? Math.max(bot + oB, Math.min(wy, top - oT)) : (top - oT + bot + oB)*0.5;
      }
      if(!SPOT.init || F < 0.02 || pre){ SPOT.x = wx; SPOT.y = wy; SPOT.vx = SPOT.vy = 0; SPOT.init = true; }
      else {
        SPOT.vx += ((wx - SPOT.x)*K.SLIDE_K - SPOT.vx*K.SLIDE_C)*dt; SPOT.x += SPOT.vx*dt;
        SPOT.vy += ((wy - SPOT.y)*K.SLIDE_K - SPOT.vy*K.SLIDE_C)*dt; SPOT.y += SPOT.vy*dt;
      }
      wx = SPOT.x; wy = SPOT.y;
      _ax.setFromMatrixColumn(_fitCam.matrixWorld, 2);
      const depth = _ld.copy(LP.p).sub(_cp).dot(_ax)*-1;
      const tanV = Math.tan(CAM.fov*PI/360), tanH = tanV*kit.camera.aspect;
      const dx = (_lp.x - wx)*depth*tanH*F, dy = (_lp.y - wy)*depth*tanV*F;
      _ax.setFromMatrixColumn(_fitCam.matrixWorld, 0); _cp.addScaledVector(_ax, dx); _ct.addScaledVector(_ax, dx);
      _ax.setFromMatrixColumn(_fitCam.matrixWorld, 1); _cp.addScaledVector(_ax, dy); _ct.addScaledVector(_ax, dy);
    }
    HSP.dt = pre ? 0 : dt;
    if(hx < X.SWAP){
      HSP.p = 0; HSP.v = 0; STAND.k = 0;
      if(hx > 0.04 && !pre) warmUp();
      const dv = seg(hx, X.DIVE[0], X.SWAP);
      // with reduced motion there is no flight into the pin: the camera stays on the desk and the cut is a fade through dark
      if(dv > 0 && !REDUCED && pinAt(PIN_BASE, PIN_HEAD)){ diveCam(dv); SNAP.dir.copy(_cp).sub(_ct).normalize(); SNAP.fov = CAM.fov; SNAP.ok = true; }
      // FOLD_RETURN.w: the walk's way back starts on the walk's last shot (kit.homeCam is the walk's camera this frame)
      // and glides into the hero's (sections/landing.js, back)
      kit.blendCam(_cp, _ct, CAM.fov, (window.FOLD_RETURN && window.FOLD_RETURN.w) || 0);
      kit.scene.fog.near = CAM.dist*1.7; kit.scene.fog.far = CAM.dist*4.2;
    } else {
      landCam(seg(hx, X.SWAP, 1));
      { const want = seg(hx, X.SWAP, 1) >= (REDUCED ? 0.001 : LAND.STAND); STAND.k = (REDUCED || pre) ? (want ? 1 : 0) : clamp01(STAND.k + (want ? dt/1.5 : -dt/0.7)); }
      kit.scene.fog.near = v1Near; kit.scene.fog.far = v1Far;
    }
    nearFar();
    keepEye();

    // ---- the card under the cursor, on the standing mountain
    cardK = -1;
    // from the moment the cards have half stood, not only once the whole mountain is up
    if(!pre && upM && upD && upD.g >= 0.45 && hx < 0.01 && PTR.has && !overSide(PTR.el)) cardK = pickCard(upM, PTR.x, PTR.y);

    root.visible = hx < X.SWAP;
    TRAIL.visible = hx >= X.SWAP;
    // the open cover's legend page lies at the left of the landing's shot, cut by the frame mid-word (round 0's broken
    // frame). once panel 1 stands it falls out of the lamp's light, so the cut edge is paper in shadow, not cropped
    // type. back to full light once the map has moved on past panel 1 (p 0.2 to 0.26)
    if(kit.COVER.inside){
      const p = kit.P.s, sh = STAND.k*(1 - smooth(seg(p, 0.2, 0.26)));
      if(Math.abs(sh - LEG.k) > 0.002){ LEG.k = sh; kit.COVER.inside.material.color.setScalar(1 - 0.6*sh); }
    }
    if(FADE && !pre){ const f = smooth(1 - clamp01(Math.abs(hx - X.SWAP)/0.07)); if(Math.abs(f - FADE.k) > 0.002){ FADE.k = f; FADE.el.style.opacity = f.toFixed(3); } }
    if(!pre) domFrame(hx);
  }

  /* ============================================================
     the dive
     ============================================================ */
  const PIN_BASE = V3(), PIN_HEAD = V3(), _lamAim = V3();
  const _dS = V3(), _dE = V3(), _tS = V3(), _tE = V3(), _cw = V3();
  // the pin's base (where the needle enters its card) and its head, in world space
  function pinAt(base, head){
    const D = MAPS[DIVE].model; if(!D || !D.pin) return false;
    D.mesh.updateWorldMatrix(true, true);
    D.pin.g.getWorldPosition(base);
    if(head) D.pin.head.getWorldPosition(head);
    return true;
  }
  const dirOf = (out, elDeg, yawDeg) => out.set(Math.sin(yawDeg*D2R)*Math.cos(elDeg*D2R), Math.sin(elDeg*D2R), Math.cos(yawDeg*D2R)*Math.cos(elDeg*D2R));
  // from the lean shot (_cp, _ct) down onto the pin: the aim slides onto it, the direction swings
  // round and steepens, the distance falls away exponentially so the last part feels like a fall
  function diveCam(dv){
    const E = DIVE_END;
    _tS.copy(_ct); _dS.copy(_cp).sub(_ct); const dS = _dS.length(); _dS.normalize();
    _tE.copy(PIN_HEAD);
    // heading and height above the desk move separately, so the camera only ever climbs toward
    // looking down: a blend of the two directions dipped low and cut through the terraces
    const yaw0 = Math.atan2(_dS.x, _dS.z)/D2R, el0 = Math.asin(Math.max(-1, Math.min(1, _dS.y)))/D2R;
    // first the aim finds the pin and the view tips over it, then it zooms straight in
    // the zoom eases in and keeps its speed to the end: a fall, not a landing on the head
    // a hermite: some speed from the start (round 1: the frame sat dark and empty while the headline left), and
    // nearly twice the average speed at the end
    const u = seg(dv, 0.02, 1), eZ = hermite(0, 0.5, 1, 2.6, u);   // the pin stays small longer, the fall is steeper (round 3)
    const eT = eio(seg(dv, 0, 0.5)), eD = eio(seg(dv, 0, 0.7));
    dirOf(_cw, lerp(el0, E.el, eD), yaw0 + E.yaw*eD);
    _ct.copy(_tS).lerp(_tE, eT);
    _cp.copy(_ct).addScaledVector(_cw, dS*Math.pow(E.d/dS, eZ));
    // never inside the model: if the path passes under a card's top, lift the camera clear of it
    const D = MAPS[DIVE].model;
    if(D){
      _inv.copy(D.mesh.matrixWorld).invert();
      _ro.copy(_cp).applyMatrix4(_inv);
      const tp = topAt(D, _ro.x, _ro.z), clear = tp ? tp.y + 0.12 : 0;
      if(tp && _ro.y < clear){ _ro.y = clear; _cp.copy(_ro).applyMatrix4(D.mesh.matrixWorld); }
    }
  }
  // the other side. the trailhead is the pin's own red head pressed into the map, a little bigger,
  // its front rim where the route begins, so the hiker stands at it
  const trailMat = pinHeadMat.clone();
  trailMat.onBeforeCompile = pinHeadMat.onBeforeCompile; trailMat.customProgramCacheKey = pinHeadMat.customProgramCacheKey;   // clone() leaves these behind
  trailMat.polygonOffset = true; trailMat.polygonOffsetFactor = -4; trailMat.polygonOffsetUnits = -8;
  const TRAIL = new THREE.Mesh(pinHeadGeo, trailMat);
  TRAIL.scale.setScalar(TRAIL_K); TRAIL.castShadow = true; TRAIL.receiveShadow = true; TRAIL.visible = false;
  { const r0 = kit.ROUTE.at(0); TRAIL.position.set(r0.x, 0.0085, r0.z); kit.FRAME[0].add(TRAIL); }
  // what the dive looked like on its last frame: the camera's direction, the lamp and its bounce
  const SNAP = { ok:false, fov:32, dir:V3(), lampRel:V3(), bounceRel:V3(), lampI:0, bounceI:0, angle:0, pen:0, focus:0, col:new THREE.Color() };
  const _dM = V3(), _dEye = V3(), _tEye = V3();
  // reduced motion: a still dark sheet over the canvas that the cut fades through (the header stays above it)
  const FADE = REDUCED ? (() => { const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;z-index:6;background:' + (PL ? PL.room : '#0b0a09') + ';opacity:0;pointer-events:none;';
    document.body.appendChild(el); return { el, k:0 }; })() : null;
  function landCam(s){
    const H = kit.homeCam();
    if(REDUCED){
      // straight to the map's shot, the dot pressed flat, the hiker standing, the panel up (STAND, under the fade)
      _ct.copy(H.tgt); kit.camera.position.copy(H.pos); kit.camera.lookAt(_ct); kit.setFov(H.fov);
      TRAIL.scale.set(TRAIL_K, TRAIL_K*0.02, TRAIL_K); HSP.p = 1; HSP.v = 0; kit.HIKER.group.rotation.x = 0;
      return;
    }
    TRAIL.updateWorldMatrix(true, false); TRAIL.getWorldPosition(_tS);
    _dE.copy(H.pos).sub(H.tgt); const d1 = _dE.length(); _dE.normalize();
    const yaw1 = Math.atan2(_dE.x, _dE.z)/D2R;
    // the first frame looks at the trailhead exactly the way the last frame looked at the pin
    if(SNAP.ok) _dS.copy(SNAP.dir); else dirOf(_dS, DIVE_END.el, yaw1);
    dirOf(_dM, LAND.MID.el, yaw1);
    let d, eA = 1;
    if(s <= LAND.MID.s[1]){
      // out of the cut to the trailhead in the map's lines: the dot, the route's first dashes, the contours
      const e = eA = Math.sin(seg(s, LAND.MID.s[0] + LAND.RED, LAND.MID.s[1])*PI*0.5);
      _ct.copy(_tS); _cw.copy(_dS).lerp(_dM, e).normalize();
      d = LAND.D0*Math.pow(LAND.MID.d/LAND.D0, e);
    } else {
      // down to his eye level, a little round, while the panel springs up behind him. then up and out to the map's
      // shot: it rises first and pulls back after, or it flies through the trail sign standing just ahead of him
      const E = LAND.EYE, eD = eio(seg(s, E.s[0], E.s[1])), eO = 0.5 - 0.5*Math.cos(seg(s, LAND.OUT[0], LAND.OUT[1])*PI);
      dirOf(_dEye, lerp(LAND.MID.el, E.el, eD), yaw1 + E.yaw*eD);
      _tEye.copy(_tS); _tEye.y += E.head*eD;
      const dEye = lerp(LAND.MID.d, E.d, eD);
      const eR = 1 - Math.pow(1 - eO, 2.4), eB = Math.pow(eO, 1.7);
      _ct.copy(_tEye).lerp(H.tgt, eB);
      _cw.copy(_dEye).lerp(_dE, eR).normalize();
      d = dEye*Math.pow(d1/dEye, eB);
    }
    _cp.copy(_ct).addScaledVector(_cw, d);
    kit.camera.position.copy(_cp); kit.camera.lookAt(_ct);
    // the lens carries across the cut and only changes to V1's on the way out
    kit.setFov(lerp(SNAP.ok ? SNAP.fov : H.fov, H.fov, eA));
    // the red head presses down into the map and becomes a printed dot, before anything stands on it
    const fl = smooth(seg(s, LAND.FLAT[0], LAND.FLAT[1]));
    TRAIL.scale.set(TRAIL_K, TRAIL_K*lerp(1, 0.02, fl), TRAIL_K);
    // the hiker lies flat until the camera has the trailhead framed, then springs up out of it, the way
    // a cut-out stands when the page opens. V1 has posed him this frame, this only tips him
    const want = s >= LAND.POP ? 1 : 0, h = Math.min(0.034, HSP.dt);
    if(REDUCED || s >= 1){ HSP.p = want; HSP.v = 0; }
    else { HSP.v += ((want - HSP.p)*60 - HSP.v*7.2)*h; HSP.p += HSP.v*h; if(HSP.p < 0){ HSP.p = 0; HSP.v = 0; } }   // about 0.5 s, a small overshoot (round 0: up in one frame at 150)
    kit.HIKER.group.rotation.x = -PI*0.5*(1 - Math.min(1.1, HSP.p));
    // and he grows out of the dot as he stands: lying flat at full size he was a whole silhouette in one frame (round 1)
    kit.HIKER.group.scale.set(1, 0.04 + 0.96*smooth(clamp01(HSP.p*1.25)), 1);
    if(!want && HSP.p < 0.002) kit.HIKER.group.visible = false;
  }
  const HSP = { p:0, v:0, dt:0.016 };
  // the lamp through the cut: the same light on the trailhead as on the pin, from the same side, fading
  // as V1's daylight comes up behind it
  function landLight(s){
    const fade = 1 - smooth(seg(s, LAND.LIGHT[0], LAND.LIGHT[1]));
    TRAIL.updateWorldMatrix(true, false); TRAIL.getWorldPosition(_tE);
    lamp.position.copy(_tE).add(SNAP.lampRel); lamp.target.position.copy(_tE);
    lamp.angle = SNAP.angle; lamp.penumbra = SNAP.pen; lamp.shadow.focus = SNAP.focus; lamp.color.copy(SNAP.col);
    lamp.intensity = SNAP.lampI*fade; lamp.shadow.autoUpdate = fade > 0;
    bounce.position.copy(_tE).add(SNAP.bounceRel); bounce.intensity = SNAP.bounceI*fade;
  }
  // close to the pin the camera's near plane would cut it, so near and far follow the distance
  let lastNear = 0;
  function nearFar(){
    const c = kit.camera, d = c.position.distanceTo(_ct);
    const near = Math.max(0.004, Math.min(0.4, d*0.15)), far = d < 4 ? 160 : 400;
    if(Math.abs(near - lastNear) > 1e-4 || c.far !== far){ c.near = near; c.far = far; c.updateProjectionMatrix(); lastNear = near; }
  }
  // V1's progress while the hero owns the screen: the shut map until the swap, then the open map with the
  // hiker on the trailhead (the route starts once you scroll on into the map)
  function pOf(hx){ return hx < X.SWAP ? 0 : lerp(X.P_OPEN, X.P_LAND, smooth(seg(seg(hx, X.SWAP, 1), LAND.OUT[0], 1))); }
  // V1's day 2 to 5 have never been drawn while the map is shut, so the first frame of the open map
  // would upload all their textures at once (a 280 ms stall). upload two a frame during the dive instead
  let warmQ = null;
  function warmUp(){
    if(!warmQ){
      warmQ = [];
      const seen = new Set();
      kit.SCENES.forEach(sc => sc.sheets.concat(sc.flats).forEach(L => {
        const m = L.mesh.material;
        [m.map, m.alphaMap, m.emissiveMap].forEach(t => { if(t && !seen.has(t)){ seen.add(t); warmQ.push(t); } });
      }));
    }
    for(let k=0;k<2 && warmQ.length;k++) kit.renderer.initTexture(warmQ.shift());
  }

  /* ---- the DOM's exit, and the readout ---- */
  const topEl = document.querySelector('.top');
  let navLight = false, hintAside = false;
  function domFrame(hx){
    // the dive's light stretch, measured behind the brand with the header hidden, every 0.01 of the hero (round 3, after
    // the dive was re-paced: desktop 0.42 to 0.74, phone 0.48 to 0.73. measured again in V6 for the Turntable's shot:
    // desktop 0.41 to 0.74, phone now from 0.455): from the cream terraces filling the top of the frame to the eye level,
    // where the dark room comes in behind it. with reduced motion the room stays dark there
    const light = !REDUCED && (NARROW ? hx > 0.452 && hx < 0.735 : hx > 0.415 && hx < 0.745);
    if(light !== navLight && topEl){ navLight = light; topEl.classList.toggle('on-light', light); }
    // a scroll that starts mid-spring lands the words at once: the lines' masks have to be back for the exit
    if(POP.on && hx > 0.004) endPop();
    const xs = dom.xs.map((el, k) => -150*eio(seg(hx, 0.004 + k*0.016, 0.08 + k*0.016)));
    const key = xs.map(v => v.toFixed(1)).join(',');
    if(key !== lastX){ lastX = key; dom.xs.forEach((el, k) => { el.style.transform = 'translate3d(0,' + xs[k].toFixed(2) + '%,0)'; }); }
    const a = seg(hx, 0.0, 0.07), b = seg(hx, 0.0, 0.045);   // the index goes in half the time it took in round 2
    const hk = (1 - smooth(a)).toFixed(3) + '|' + (1 - smooth(b)).toFixed(3);
    if(hk !== lastHead){
      lastHead = hk;
      [dom.lede, dom.hint].forEach((el) => { el.style.opacity = (1 - smooth(a)).toFixed(3); el.style.translate = '0 ' + (-18*smooth(a)).toFixed(1) + 'px'; });
      dom.side.style.opacity = (1 - smooth(b)).toFixed(3);
      dom.side.style.translate = '0 ' + (-16*smooth(b)).toFixed(1) + 'px';
      dom.side.style.pointerEvents = hx > 0.05 ? 'none' : '';
      [dom.prev, dom.next].forEach((el) => { el.style.opacity = (1 - smooth(b)).toFixed(3); el.style.pointerEvents = hx > 0.05 ? 'none' : ''; });
    }
    if(SW && SW.edges){
      // projected through the camera as it is drawn this frame (eye): mid-frame the real camera can still hold V1's shot
      const E = SW.edges(), W = window.innerWidth, Hh = window.innerHeight, m = NARROW ? 26 : 34;
      // the right arrow never sits on the trek card: on a tall window the map is big and its edge reached the text (Sam, V6)
      const xMax = NARROW ? W - m : Math.min(W - m, (TXT.sideL*0.5 + 0.5)*W - 40);
      [dom.prev, dom.next].forEach((el, k) => {
        _v.copy(E[k]).project(eye);
        const x = Math.max(m, Math.min(k ? xMax : W - m, (_v.x*0.5 + 0.5)*W)), y = (-_v.y*0.5 + 0.5)*Hh;
        const tr = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        if(el._tr !== tr){ el._tr = tr; el.style.transform = tr; }
      });
    }
    // V7: the gap under the globe and over the map in the light, on screen, for the landing's button
    if(SW && SW.gap){ const G2 = SW.gap(), W = window.innerWidth, Hh = window.innerHeight;
      _v.copy(G2[0]).project(eye); const ya = (-_v.y*0.5 + 0.5)*Hh, xa = (_v.x*0.5 + 0.5)*W;
      _v.copy(G2[1]).project(eye); const yb = (-_v.y*0.5 + 0.5)*Hh;
      GAP.x = xa; GAP.y0 = ya; GAP.y1 = yb; }
    const hide = hx > X.DOM + 0.05;
    if(hide !== domHidden){ domHidden = hide; dom.root.style.visibility = hide ? 'hidden' : ''; }
    // once the scroll starts the index keeps the row it had: switching to 01 as it faded reflowed its rows over the cards (round 2)
    if(hx < 0.004) showActive(SW ? SW.sel : upI);
    const aside = TXT.clash && FOCUS.p > 0.3 && upI >= 0;
    if(aside !== hintAside){ hintAside = aside; dom.hint.classList.toggle('aside', aside); }
    // every map's readout follows its own mountain: the height counts up with the cards as they
    // stand, and while the cursor is on a card it reads that card's contour
    MAPS.forEach((M, i) => {
      const I = INFO[i], D = M.model, g = D ? D.g : 0;
      if(i === upI && cardK >= 0 && D){
        const m = I.L0 + cardK*I.step;
        readout(i, fmtM(m), '<b>Contour</b>&nbsp;· card&nbsp;' + (cardK + 1) + '&nbsp;of&nbsp;' + I.n + '&nbsp;· under the cursor', 'CONTOUR · CARD ' + (cardK + 1) + ' OF ' + I.n);
      } else {
        const m = g >= 1 ? I.summit.m : I.L0 + (I.summit.m - I.L0)*eio(g);
        readout(i, fmtM(m), altKey(i), I.summit.name);
      }
    });
  }

  function brand(){
    if(kit.brand) return kit.brand;
    const q = (kit.Q.get('name') || '').replace(/[^a-z]/g, '');
    return kit.NAMES[q] || kit.NAMES.foldline;
  }

  // for inspection while building: window.FOLD
  window.FOLD = { MAPS, INFO, FOCUS, RAKE, LP, SPOT, LEANK, TXT, CAM, K, lamp, eye, pickCard, anchorOf, cutGen, modelInfo,
    get upI(){ return upI; }, get cardK(){ return cardK; }, get hold(){ return hold; }, get act(){ return activeI(); }, get SW(){ return SW; },
    walkI:WALKM, dive(i){ DIVE = i >= 0 && i < 5 ? i : WALKM; },
    // a page opened mid-dive has no intro: its lamp is set where the intro leaves it, so the cut lights the trail as it should
    lampUp(){ LAMP.k = 1; LAMP.warm = 1; } };

  /* ============================================================
     9. hooks
     ============================================================ */
  let introTl = null;
  return {
    name:'foldline',
    pOf, pLand:X.P_LAND,
    // V7: the landing turns the table from outside (the footer's maps, the walk's other maps)
    select(i){ if(SW) SW.select(i); },
    gap(){ return GAP; },
    stand0(){ return STAND.k; },
    // how far the interior's own lamp has come up through the cut, on the curve the hero's lamp fades on
    lampIn(hx){ return hx < X.SWAP ? 0 : smooth(seg(seg(hx, X.SWAP, 1), LAND.LIGHT[0], LAND.LIGHT[1])); },
    onCover(cov0){
      // a page opened mid-dive paints the hero's covers after the camera has settled in the walk: nobody sees them before
      // (the red waited on them, Sam 19 Oct). They are painted at once if the hero comes back sooner (frame, below)
      if(window.FL_LATER){ MAPS.forEach((M) => window.FL_LATER.push(() => coverOne(M, cov0))); COVERS_DUE = true; return; }
      MAPS.forEach((M) => coverOne(M, cov0));
    },
    // the page paints one frame at boot, before the first tick: make it ours, and dark.
    // No. 01's mountain is in the scene (flat, so it draws nothing) so its program compiles now
    // the GPU builds each pipeline on its first real draw (ANGLE on Metal), so a map dealt in for
    // the first time mid-intro stalled the page 0.4 to 0.6 s. draw everything once now, in view:
    // the lamp is off and the room black, so nothing shows, and the next frame puts it all back
    boot(){
      frame(0, 0, 0, true);
      MAPS.forEach((M) => { M.pivot.position.set(M.home.x, 0, M.home.z); M.pivot.rotation.set(0, M.home.ry, 0); M.shadow.position.set(M.home.x, -0.008, M.home.z); });
      kit.mapRoot.position.set(MAPS[WALKM].home.x + MAPS[WALKM].offX, 0, MAPS[WALKM].home.z); kit.mapRoot.quaternion.copy(MAPS[WALKM].pivot.quaternion);
      const D = MAPS[WALKM].model;
      if(D){ D.mesh.visible = true; if(D.pin) D.pin.g.visible = true; }
    },
    intro(){
      started = true;
      const tl = introTl = gsap.timeline();
      dom.root.classList.add('fo-live');
      const H5 = document.documentElement;
      const tops = Array.from(document.querySelectorAll('.top .brand, .top #bookTop'));
      const rise = tops.map(() => ({ v:1 }));
      const paint = (el, o) => {
        const on = o.v > 0.001, y = (el.offsetHeight + 8)*o.v;
        el.style.transition = on ? 'none' : '';
        el.style.transform = on ? 'translate3d(0,' + y.toFixed(2) + 'px,0)' : '';
        el.style.clipPath = on ? 'inset(0 -30px ' + (y - 8).toFixed(2) + 'px -30px)' : '';
      };
      tops.forEach((el, k) => paint(el, rise[k]));
      // a look's faces can reach further above their line box than Instrument Serif, so they start further down
      const MY = window.LOOK && window.LOOK.key ? 140 : 112;
      if(POP.off) gsap.set(dom.lines, { yPercent:MY });
      else {
        // every word flat on its back, hinged at its baseline, until it springs
        gsap.set(dom.lines, { yPercent:0 });
        gsap.set(POP.bits, { transformPerspective:900, transformOrigin:'50% 86%', rotationX:90, autoAlpha:0 });
        POP.h1.classList.add('fo-popping'); POP.on = true;
      }
      gsap.set([dom.lede, dom.hint], { autoAlpha:0, y:14 });
      gsap.set([dom.stage, dom.fnav], { autoAlpha:0, y:12 });
      gsap.set([dom.prev, dom.next], { autoAlpha:0 });
      gsap.set(dom.rule, { scaleX:0 });
      gsap.set(dom.ro, { autoAlpha:0, y:12 });
      playing = true; tIntro = gsap.ticker.time;
      const grow = () => { upI = 0; hold = true; holdMoves = PTR.moves; };
      if(REDUCED || DBG){
        LAMP.k = 1; LAMP.warm = 1; CAM.intro = 1;
        if(DBG) tIntro -= 10;
        tops.forEach((el, k) => { rise[k].v = 0; paint(el, rise[k]); });
        H5.classList.add('hero-live');
        gsap.set([dom.lede, dom.hint, dom.ro, dom.stage, dom.fnav, dom.prev, dom.next], { autoAlpha:1, y:0 });
        gsap.set(dom.rule, { scaleX:1 });
        gsap.set(dom.lines, { yPercent:0 });
        endPop();
        grow();
        if(DBG){ MAPS[0].model.g = 1; FOCUS.p = 1; }
        return tl;
      }
      tl.to(LAMP, { k:1, duration:1.15, ease:'back.out(2.4)' }, 0.16)
        .to(LAMP, { warm:1, duration:1.7, ease:'power2.out' }, 0.16)
        .to(CAM, { intro:1, duration:3.4, ease:'power3.out' }, 0)
        .to(rise[0], { v:0, duration:1.2, ease:'expo.out', onUpdate:() => paint(tops[0], rise[0]) }, 0.95)
        .to(rise[1] || {}, { v:0, duration:1.2, ease:'expo.out', onUpdate:() => tops[1] && paint(tops[1], rise[1]) }, 1.05)
        .add(popIn(), 1.1)
        .add(() => H5.classList.add('hero-live'), 1.0)
        .to([dom.lede, dom.hint], { autoAlpha:1, y:0, duration:1.0, stagger:0.1, ease:'power3.out' }, 1.7)
        .to(dom.rule, { scaleX:1, duration:1.3, ease:'expo.inOut' }, 1.2)
        .to([dom.stage, dom.fnav], { autoAlpha:1, y:0, duration:0.9, stagger:0.12, ease:'power3.out' }, 1.55)
        .to([dom.prev, dom.next], { autoAlpha:1, duration:0.9, stagger:0.08, ease:'power2.out' }, 2.2)
        .to(dom.ro, { autoAlpha:1, y:0, duration:0.9, ease:'power3.out' }, 1.9)
        .add(grow, K.FIRST);
      return tl;
    },
    frame(dt, t, hx){ frame(dt, t, hx, false); },
    resize(){ layout(); },
    tour(){
      const EL = (q) => () => { const e = document.querySelector(q), r = e ? e.getBoundingClientRect() : { left:0, top:0, width:0, height:0 }; return [r.left + r.width*0.5, r.top + r.height*0.5]; };
      if(SW && SW.tour){
        const C0 = (i, dx, dz) => () => { const M = MAPS[i]; M.pivot.updateWorldMatrix(true, false);
          return kit.screenOf(V3(dx || 0, M.coverY, (dz || 0)).applyMatrix4(M.pivot.matrixWorld)); };
        const ON0 = (i, u, v) => () => { const M = MAPS[i], D = M.model; if(!D) return C0(i)();
          const I = D.info, W0 = I.win, x = (lerp(W0[0], W0[2], u) - 0.5)*S, z = (lerp(W0[1], W0[3], v) - 0.5)*S;
          const tp = topAt(D, x, z); D.mesh.updateWorldMatrix(true, false);
          return kit.screenOf(V3(x, tp ? tp.y : 0, z).applyMatrix4(D.mesh.matrixWorld)); };
        return SW.tour({ EL, C:C0, ON:ON0, NARROW, W:window.innerWidth, H:window.innerHeight });
      }
      // positions follow the maps live, on any screen and whatever the camera is doing
      const W = (x, z) => () => kit.screenOf(V3(x, 0, z));
      const C = (i, dx, dz) => () => { const M = MAPS[i]; M.pivot.updateWorldMatrix(true, false);
        return kit.screenOf(V3(dx || 0, M.coverY, (dz || 0)).applyMatrix4(M.pivot.matrixWorld)); };
      const ON = (i, u, v) => () => {
        // a point on the standing mountain's face: u, v across the cut window, on the top of its card
        const M = MAPS[i], D = M.model; if(!D) return C(i)();
        const I = D.info, W0 = I.win, uu = lerp(W0[0], W0[2], u), vv = lerp(W0[1], W0[3], v);
        const x = (uu - 0.5)*S, z = (vv - 0.5)*S;
        const tp = topAt(D, x, z), y = tp ? tp.y : 0;
        D.mesh.updateWorldMatrix(true, false);
        return kit.screenOf(V3(x, y, z).applyMatrix4(D.mesh.matrixWorld));
      };
      // the round 1 plan starts the scroll at 9 s, so everything here lands before it
      // the readout's number row, where a thumb goes once a raised map fills the desk
      const NUM = (i) => () => { const r = dom.nums[i].getBoundingClientRect(); return [r.left + r.width*0.3, r.top + r.height*0.5]; };
      if(NARROW) return [
        { t:0, at:W(8.2, -26) }, { t:3.5, at:W(8.2, -26) },
        { t:4.1, at:C(3) }, { t:4.25, at:C(3), click:true },     // tap No. 04
        { t:6.4, at:C(3, 0.3, 0.2) },
        { t:6.9, at:NUM(1) }, { t:7.05, at:NUM(1), click:true }, // then 02 in the number row: map 02 now lies behind the readout
        { t:9.0, at:C(1, 0.3, 0.2) }
      ];
      return [
        { t:0, at:W(21.0, -15.0) }, { t:3.4, at:W(21.0, -15.0) }, // resting behind the row, on no map
        { t:4.2, at:C(3, 0.2, 0.9) },                          // onto No. 04, Kilimanjaro: it grows
        { t:5.5, at:C(3, 0.3, 1.1) },
        { t:5.95, at:ON(3, 0.42, 0.62) },                      // up the mountain: the card under the cursor inks red
        { t:6.45, at:ON(3, 0.5, 0.48) },
        { t:6.8, at:ON(3, 0.47, 0.42) },
        { t:7.5, at:C(1, 0.0, 0.8) },                          // over to No. 02, the Inca Trail
        { t:9.0, at:C(1, 0.2, 1.0) }
      ];
    }
  };
};
})();
