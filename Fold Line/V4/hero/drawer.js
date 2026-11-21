/* ============================================================
   FIVE HUTS V2 . HERO OPTION "drawer" . THE MAP DRAWER
   ?hero=drawer

   The company's whole range on one desk at night: five pocket maps on the dark
   bookcloth under one warm desk lamp. The lamp's pool follows the cursor on a
   spring, the shadows swing with it, and a map you point at lifts off the desk
   and reads out its trek. Scroll, and the desk is cleared down to No. 01.

   How it is built:
   - No. 01 is V1's real concertina (kit.mapRoot). Nos. 02 to 05 are shut pocket
     maps: a rounded paper block (the side faces print the stacked sheets) under
     a cover drawn by kit.drawCover, on V1's own paper material.
   - Every map rides six springs (x, y, z and three angles). Hover, deal and
     sweep only ever move the targets, so the motion always has weight.
   - One SpotLight is the lamp. It casts the real shadows. A soft shadow card
     under every map adds the contact shadow and spreads when a map lifts.
   - Classic script, no modules. Registers window.HERO_OPTIONS.drawer.
   ============================================================ */
(function(){
'use strict';
window.HERO_OPTIONS = window.HERO_OPTIONS || {};

window.HERO_OPTIONS.drawer = function(kit){
  const { THREE, gsap } = kit;
  const V2 = kit.V2, TREKS = kit.TREKS, PW = kit.PW, PD = kit.PD;
  const PI = Math.PI, D2R = PI/180;
  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (v, a, b) => clamp01((v - a)/(b - a));
  const smooth = (t) => t*t*(3 - 2*t);
  const lerp = (a, b, t) => a + (b - a)*t;
  const easeInOut = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const REDUCED = !!kit.REDUCED;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  /* ---------------- knobs ---------------- */
  const K = {
    THICK: 2*kit.COVER_H + 0.002,   // a shut concertina: five sheets and the cover, same as No. 01
    LIFT: 0.95, TILT: 9*D2R,        // hover: how far a map rises, and tips toward you
    DIM: 0.62,                      // the other maps, while one is up
    LAMP_I: 1000,                   // candela-ish, decay 2. the pool centre a little brighter than V1's key
    LAMP_H: 13.5,                   // lamp height above the desk
    LAMP_BACK: 5.5, LAMP_LEFT: 3.2, // the head sits behind and left of its pool, so shadows fall toward you
    LAMP_ANGLE: 64*D2R, LAMP_PEN: 1.0,
    AMB: 0.08,                      // what is left of V1's sky light in the room beyond the pool
    BOUNCE: 0.036,                  // light thrown back up off the lit desk, as a share of the lamp
    GLOSS_K: 0.09,                  // how hard the varnished ink glints
    POOL_K: 24, POOL_C: 7.2,        // the pool's spring: weighted, a little overshoot
    DEAL0: 0.42, DEAL_GAP: 0.23, DEAL_DUR: 0.62
  };
  const LAMP_WARM = new THREE.Color('#FFD6A6'), LAMP_COLD = new THREE.Color('#FF8F45');

  /* ---------------- dry lines. TREKS carries a researched line per trek (T.line) and that is
     what shows. these only stand in if the data ever loses it, so they carry no numbers ---------------- */
  const DRY = [
    'Over an active volcano in a day. The Emerald Lakes smell faintly of eggs.',
    'Down to Machu Picchu through the Sun Gate, the way the Incas meant you to arrive.',
    'Granite towers, a blue glacier and a wind with strong opinions about hats.',
    'Rainforest at the bottom, glacier at the top. The guides say pole pole, and they mean it.',
    'Teahouse to teahouse up the Khumbu valley. Yaks have right of way.'
  ];
  const lineOf = (T, i) => T.line || T.dry || T.quip || T.note || DRY[i];
  const WORDS = ['no','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const daysOf = (T) => { const n = typeof T.days === 'number' ? T.days : parseInt(T.days, 10); return isFinite(n) ? n : null; };
  const kmOf = (T) => T.kmLabel ? String(T.kmLabel).toLowerCase() : (T.km ? kit.fmtN(T.km) + kit.NB + 'km' : '');
  const daysLabel = (T) => T.daysLabel || (daysOf(T) ? daysOf(T) + (daysOf(T) === 1 ? ' DAY' : ' DAYS') : '');

  /* ============================================================
     1. the maps
     ============================================================ */
  const root = new THREE.Group(); root.name = 'drawer';
  kit.scene.add(root);

  // one rounded block for all four new maps. the cover overhangs it by a hair,
  // the bevel softens the silhouette so it never reads as a CG box
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
  // the side faces print the stacked sheets: cream paper, a dark hairline between
  // each, the top layer in the cover's tone. it fades to an average when a layer
  // gets thinner than a pixel, so it never shimmers
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
  // the cover's cut: V1's panel shape with the corners eased
  function coverShape(x, w, h){
    const r = 6, a = 2, b = 2, c = w - 2, d = h - 2;
    x.beginPath(); x.moveTo(a + r, b); x.lineTo(c - r, b); x.quadraticCurveTo(c, b, c, b + r); x.lineTo(c, d - r);
    x.quadraticCurveTo(c, d, c - r, d); x.lineTo(a + r, d); x.quadraticCurveTo(a, d, a, d - r); x.lineTo(a, b + r);
    x.quadraticCurveTo(a, b, a + r, b); x.closePath(); x.fill();
  }
  const coverShapeCanvas = kit.shapeCanvas(135, 180, coverShape, 1.6);
  const topGeo = new THREE.PlaneGeometry(PW, PD, 8, 10);
  const pickGeo = new THREE.BoxGeometry(PW, 0.34, PD);
  const pickMat = new THREE.MeshBasicMaterial();

  // the soft shadow card: a tight contact edge and a wide falloff, white on black,
  // read as alpha. it lies on the cloth under every map and spreads as the map lifts
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

  // spot varnish: the printed contours and the title carry a satin varnish, so they glint
  // when the lamp rakes across them and flash as a map tips up toward you. one additive
  // layer per cover, masked by the cover's own ink, lit only by the lamp
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
  // the ink, read off the printed cover: anything lighter than the board is ivory ink
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

  const MAPS = [];
  for(let i=0;i<5;i++){
    const M = { i, T:TREKS[i], tone:V2.tones[i] };
    M.pivot = new THREE.Group(); root.add(M.pivot);
    if(i === 0){
      M.offX = -PW*0.5;                                 // kit.mapRoot's origin is the map's left edge
      M.dimMats = [kit.COVER.front.material];
    } else {
      const sm = sideMaterial(V2.tones[i]);
      const body = new THREE.Mesh(bodyGeo, sm);
      body.castShadow = true; body.receiveShadow = true;
      M.pivot.add(body);
      // blank stock until the brand is known, then kit.drawCover prints it (see onCover)
      M.coverCanvas = kit.mk(600, 800);
      const paper = kit.makePaper({ colour:M.coverCanvas, shape:coverShapeCanvas, aspect:PW/PD, seed:9.1 + i*2.3,
        deckle:0.003, rim:0.3, contact:0, fibre:0.05, warp:0.004, warpF:[0.3,0.26,0.18], side:THREE.FrontSide });
      const top = new THREE.Mesh(topGeo, paper.mat);
      top.customDepthMaterial = paper.depth;
      top.rotation.x = -PI/2; top.position.y = K.THICK + 0.004;
      top.castShadow = true; top.receiveShadow = true;
      M.pivot.add(top);
      M.paper = paper;
      M.dimMats = [paper.mat, sm];
    }
    M.gloss = new THREE.Mesh(glossGeo, glossMaterial());
    M.gloss.position.y = (i === 0 ? 2*kit.COVER_H + 0.001 : K.THICK + 0.004) + 0.014;
    M.gloss.renderOrder = 2;
    M.pivot.add(M.gloss);
    const pick = new THREE.Mesh(pickGeo, pickMat); pick.visible = false; pick.position.y = 0.17;
    pick.userData.mapI = i; M.pivot.add(pick); M.pick = pick;
    const smat = new THREE.MeshBasicMaterial({ color:0x000000, alphaMap:shadowTex, transparent:true, opacity:0.5, depthWrite:false });
    const sh = new THREE.Mesh(shadowGeo, smat); sh.position.y = -0.008; sh.renderOrder = -1;
    root.add(sh); M.shadow = sh;
    // six springs: position and angles. p is the value, v its velocity
    M.s = { x:{p:0,v:0}, y:{p:0,v:0}, z:{p:0,v:0}, rx:{p:0,v:0}, ry:{p:0,v:0}, rz:{p:0,v:0} };
    M.lift = { p:0, v:0 }; M.dim = { p:1, v:0 };
    M.home = { x:0, z:0, ry:0 }; M.start = { x:0, y:0, z:0, ry:0, rz:0 };
    M.dealt = false;
    MAPS.push(M);
  }
  const PICKS = MAPS.map(M => M.pick);

  /* ============================================================
     2. the lamp
     ============================================================ */
  const lamp = new THREE.SpotLight(LAMP_WARM.clone(), 0, 0, K.LAMP_ANGLE, K.LAMP_PEN, 2);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(1024, 1024);   // a lamp throws soft shadows anyway, and this keeps the GPU budget near V1
  lamp.shadow.camera.near = 6; lamp.shadow.camera.far = 70;
  lamp.shadow.focus = 0.72;          // the shadow map covers the lit middle of the cone, not its whole spread
  lamp.shadow.bias = -0.00035; lamp.shadow.normalBias = 0.025;
  kit.scene.add(lamp); kit.scene.add(lamp.target);
  // light the pool throws back up off the desk: no shadows, falls off fast, so the
  // shadows near the lamp are dark brown rather than black and the far room stays black
  const bounce = new THREE.PointLight(LAMP_WARM.clone(), 0, 0, 2);
  kit.scene.add(bounce);
  const LAMP = { k:0, warm:0 };              // k: switched on (overshoots a touch), warm: filament colour
  const pool = { x:{p:0,v:0}, z:{p:0,v:0} };

  /* ============================================================
     3. layout: where the maps lie and where the camera stands,
        for a wide window and for a phone
     ============================================================ */
  let NARROW = false, layoutDone = false;
  const CAM = { pos:V3(0, 30, 30), tgt:V3(0, 0, 0), fov:34, intro:0, rest:V3(), dist:40 };
  const REGION = { x0:0, x1:0, z0:0, z1:0 };
  // desktop: a loose row, the way a person lays a set out. phone: two staggered columns
  const ROW = [[3.6, 0, 0], [11.6, -0.75, -3.4], [19.55, -1.15, 2.6], [27.45, -0.5, -1.9], [35.5, 0.35, 4.2]];
  const FAN = [[3.6, 0, 0], [11.45, -5.15, -3.2], [4.15, -10.6, 2.8], [11.75, -15.9, -2.2], [4.5, -21.15, 3.4]];
  // how each map leaves on the exit: 05 first, swept right off the desk into the dark
  const SWEEP_D = { dx:34, dz:-5, ry:-16*D2R };
  const SWEEP_N = { dx:20, dz:-3, ry:-14*D2R };

  const _fitCam = new THREE.PerspectiveCamera();
  // V1's fitPose, plus one change: when the shot is bound by width, the row sits on the
  // bottom of its box rather than floating in the middle of it
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
  function layout(){
    NARROW = !!kit.NARROW;
    const L = NARROW ? FAN : ROW;
    MAPS.forEach((M, i) => { M.home.x = L[i][0]; M.home.z = L[i][1]; M.home.ry = L[i][2]*D2R; });
    let cx = 0, cz = 0; MAPS.forEach(M => { cx += M.home.x; cz += M.home.z; }); cx /= 5; cz /= 5;
    const pts = cornersOf();
    // the desk takes whatever the type leaves: below the headline and the open index,
    // above the phone's readout
    if(dom) dom.root.classList.toggle('dr-narrow', NARROW);
    const tb = textBounds(), Hh = window.innerHeight;
    const top = Math.min(0.3, 1 - 2*(tb.top + (NARROW ? 14 : 34))/Hh), bot = Math.max(-0.95, 1 - 2*(tb.bottom - 16)/Hh);
    const P = NARROW ? fit(pts, V3(cx, 0, cz), 47, -6, 38, [-0.9, 0.9, bot, top])
                     : fit(pts, V3(cx, 0, cz), 44, -4, 32, [-0.94, 0.94, -0.95, Math.max(-0.2, top)]);
    CAM.pos.copy(P.pos); CAM.tgt.copy(P.tgt); CAM.fov = P.fov; CAM.dist = P.dist;
    CAM.rest.set(cx - (NARROW ? 0 : 1.5), 0, cz + (NARROW ? 0 : 1.6));
    if(NARROW){ REGION.x0 = -1.5; REGION.x1 = 17; REGION.z0 = -26; REGION.z1 = 5.5; }
    else { REGION.x0 = -3; REGION.x1 = 40.5; REGION.z0 = -9; REGION.z1 = 6; }
    // the deal comes from the viewer's side of the desk, from below the bottom of the
    // frame: find where the frame's bottom edge meets hand height, with the intro's
    // wider opening shot, and start every map well past it
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
    layoutDone = true;
  }
  // where the type ends, in px. layout boxes only (offsetTop), so the intro's and the
  // exit's transforms never move the answer. the index is counted fully open
  function textBounds(){
    if(!dom) return { top:Hpx()*0.4, bottom:Hpx() };
    const head = dom.head, side = dom.side, headBottom = head.offsetTop + head.offsetHeight;
    if(NARROW) return { top:headBottom, bottom:side.offsetTop };
    let cur = 0, open = 0;
    dom.lis.forEach((li) => { const dx = li.querySelector('.dx'); cur += dx.offsetHeight; open = Math.max(open, dx.firstChild.scrollHeight); });
    return { top:Math.max(headBottom, side.offsetTop + side.offsetHeight - cur + open), bottom:Hpx() };
  }
  const Hpx = () => window.innerHeight;
  let poolInit = false;

  /* ============================================================
     4. the DOM: headline, the 01 to 05 index that is also the readout
     ============================================================ */
  const css = document.createElement('style'); css.id = 'drawer-css';
  css.textContent = `
html.hero-on .hero-copy > .dr{pointer-events:none;}
.dr{position:fixed;inset:0;color:var(--v2-ivory);pointer-events:none;}
.dr-head{position:absolute;left:var(--pad-x);top:clamp(96px,13.5vh,130px);width:min(640px,48vw);pointer-events:none;}
.dr-kick{color:rgba(241,235,223,0.6);display:block;}
.dr-kick .v2-line{padding-bottom:0.25em;margin-bottom:-0.25em;}
html.hero-on .dr .dr-h1{font-family:var(--v2-serif);font-weight:400;font-size:clamp(44px,min(5.3vw,9.2vh),84px);line-height:0.94;letter-spacing:-0.014em;margin:18px 0 0 -0.04em;color:var(--v2-ivory);}
.dr .x{display:inline-block;will-change:transform;}
html.hero-on .dr .dr-h1 em.acc{color:var(--v2-red);font-style:italic;}
.dr .dr-lede{margin-top:24px;color:rgba(241,235,223,0.74);max-width:36ch;}
.dr-hint{margin:22px 0 0;font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(241,235,223,0.5);display:flex;gap:10px;align-items:center;}
.dr-hint i{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--v2-red);font-style:normal;}
.dr-side{position:absolute;right:var(--pad-x);top:clamp(96px,13.5vh,130px);width:min(340px,26vw);pointer-events:auto;}
.dr-side .v2-k{color:rgba(241,235,223,0.5);margin:0 0 12px;display:flex;justify-content:space-between;}
.dr .v2-index{list-style:none;margin:0;padding:0;}
.dr .dr-rule{display:block;height:1px;background:rgba(241,235,223,0.2);transform-origin:0 50%;}
.dr .v2-index li{display:grid;grid-template-columns:38px 1fr auto;align-items:baseline;column-gap:6px;padding:10px 0 9px;border-bottom:1px solid rgba(241,235,223,0.1);cursor:pointer;color:rgba(241,235,223,0.7);transition:color .4s ease, opacity .4s ease;}
.dr .v2-index li:focus-visible{outline:1px solid rgba(241,235,223,0.5);outline-offset:4px;}
.dr .v2-index li .n{font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.12em;color:rgba(241,235,223,0.45);transition:color .4s ease;}
.dr .v2-index li .t{font-family:var(--v2-serif);font-size:22px;line-height:1.05;letter-spacing:-0.005em;}
.dr .v2-index li .d{font-family:var(--v2-mono);font-size:10px;letter-spacing:0.16em;color:rgba(241,235,223,0.45);}
.dr .v2-index.has-on li{color:rgba(241,235,223,0.42);}
.dr .v2-index li.on{color:var(--v2-ivory);}
.dr .v2-index li.on .n{color:var(--v2-red);}
.dr .v2-index li.on .d{color:rgba(241,235,223,0.75);}
.dr .dx{grid-column:1 / -1;display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s cubic-bezier(.2,.8,.2,1);}
.dr .v2-index li.on .dx{grid-template-rows:1fr;}
.dr .dx-in{overflow:hidden;min-height:0;padding-left:44px;}
.dr .dx-in > *{opacity:0;transform:translateY(8px);transition:opacity .35s ease, transform .5s cubic-bezier(.2,.8,.2,1);}
.dr li.on .dx-in > *{opacity:1;transform:none;transition-delay:.08s;}
.dr li.on .dx-in > *:nth-child(2){transition-delay:.14s;}
.dr li.on .dx-in > *:nth-child(3){transition-delay:.2s;}
.dr .dx-sub{margin:3px 0 0;font-family:var(--v2-serif);font-style:italic;font-size:16.5px;line-height:1.2;color:rgba(241,235,223,0.78);}
.dr .dx-data{margin:7px 0 0;font-family:var(--v2-mono);font-size:11.5px;line-height:1.5;color:rgba(241,235,223,0.9);}
.dr .dx-data i{font-style:normal;color:rgba(241,235,223,0.35);padding:0 6px;}
.dr .dx-data b{font-weight:500;white-space:nowrap;color:var(--v2-ivory);}
.dr .dx-line{margin:6px 0 9px;font-size:13px;line-height:1.45;color:rgba(241,235,223,0.66);max-width:36ch;text-wrap:pretty;}
@media (max-height:780px){
  .dr .v2-index li{padding:8px 0 7px;}
  .dr .v2-index li .t{font-size:20px;}
  .dr .dx-line{font-size:12.5px;}
}
.dr-ro{display:none;}
/* phone: the index becomes a row of numbers, the readout sits under the desk */
.dr.dr-narrow .dr-head{top:calc(var(--pad-y) + 56px);right:var(--pad-x);width:auto;}
html.hero-on .dr.dr-narrow .dr-h1{font-size:clamp(38px,11.2vw,50px);margin-top:12px;}
.dr.dr-narrow .dr-lede{font-size:13.5px;line-height:1.5;margin-top:12px;max-width:34ch;}
.dr.dr-narrow .dr-hint{display:none;}
.dr.dr-narrow .dr-side{left:var(--pad-x);right:var(--pad-x);top:auto;bottom:calc(10px + env(safe-area-inset-bottom));width:auto;}
.dr.dr-narrow .dr-side > .v2-k,.dr.dr-narrow .v2-index{display:none;}
.dr.dr-narrow .dr-ro{display:block;}
.dr-ro .ro-nums{display:flex;gap:0;border-top:1px solid rgba(241,235,223,0.16);}
.dr-ro .ro-nums button{flex:1;appearance:none;border:0;background:none;padding:10px 0 9px;font-family:var(--v2-mono);font-size:11px;letter-spacing:0.12em;color:rgba(241,235,223,0.5);text-align:left;cursor:pointer;transition:color .3s;}
.dr-ro .ro-nums button.on{color:var(--v2-red);}
.dr-ro .ro-body{position:relative;height:100px;}
.dr-ro .ro-card{position:absolute;left:0;right:0;top:0;opacity:0;transform:translateY(10px);transition:opacity .35s ease, transform .55s cubic-bezier(.2,.8,.2,1);}
.dr-ro .ro-card.on{opacity:1;transform:none;}
.dr-ro .ro-name{margin:6px 0 0;font-family:var(--v2-serif);font-size:24px;line-height:1.05;}
.dr-ro .ro-name em{font-size:18px;color:rgba(241,235,223,0.74);}
.dr-ro .ro-data{margin:7px 0 0;font-family:var(--v2-mono);font-size:10.5px;letter-spacing:0.08em;color:rgba(241,235,223,0.86);}
.dr-ro .ro-line{margin:6px 0 0;font-size:12.5px;line-height:1.42;color:rgba(241,235,223,0.64);text-wrap:pretty;}
.dr-ro .ro-tip{margin:10px 0 0;font-family:var(--v2-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(241,235,223,0.5);}
`;
  document.head.appendChild(css);

  let dom = null;
  function buildDom(){
    const T0 = TREKS[0], T4 = TREKS[4], d0 = daysOf(T0), d4 = daysOf(T4);
    const lede = (d0 && d4 && WORDS[d0] && WORDS[d4])
      ? 'From ' + (d0 === 1 ? 'one day' : WORDS[d0] + ' days') + ' on a volcano to ' + WORDS[d4] + ' under Everest. Every route comes as a map you can hold.'
      : 'From a day on a volcano to the long walk under Everest. Every route comes as a map you can hold.';
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const hi = (T) => T.high && T.high.m ? esc(T.high.name) + ' ' + kit.fmtM(T.high.m) : '';
    const wrap = document.createElement('div'); wrap.className = 'dr';
    wrap.innerHTML =
      '<div class="dr-head">' +
        '<p class="v2-k dr-kick"><span class="v2-line"><span><span class="x">Pocket maps &nbsp;.&nbsp; No. 01 to 05</span></span></span></p>' +
        '<h1 id="h-hero" class="v2-display dr-h1">' +
          '<span class="v2-line"><span><span class="x">Five treks.</span></span></span>' +
          '<span class="v2-line"><span><span class="x">Each one folds</span></span></span>' +
          '<span class="v2-line"><span><span class="x">into a <em class="acc">pocket.</em></span></span></span>' +
        '</h1>' +
        '<p class="v2-lede dr-lede">' + lede + '</p>' +
        '<p class="dr-hint"><i></i><span>Point at a map to read it</span><span class="sep">/</span><span>Scroll to open No. 01</span></p>' +
      '</div>' +
      '<div class="dr-side">' +
        '<p class="v2-k"><span>The series</span><span>' + TREKS.length + ' maps</span></p>' +
        '<span class="dr-rule"></span>' + kit.indexHTML('dr-index') +
        '<div class="dr-ro">' +
          '<div class="ro-nums">' + TREKS.map((T, k) => '<button type="button" data-i="' + k + '">' + String(k + 1).padStart(2, '0') + '</button>').join('') + '</div>' +
          '<div class="ro-body">' +
            '<div class="ro-card ro-tipcard on"><p class="ro-tip">Tap a map to read it</p></div>' +
            TREKS.map((T, k) => '<div class="ro-card" data-i="' + k + '">' +
              '<p class="ro-name">' + esc(T.name) + ' <em>' + esc(T.line2 || '') + '</em></p>' +
              '<p class="ro-data">' + [daysLabel(T), kmOf(T).toUpperCase(), hi(T).toUpperCase()].filter(Boolean).join(' &nbsp;.&nbsp; ') + '</p>' +
              '<p class="ro-line">' + esc(lineOf(T, k)) + '</p></div>').join('') +
          '</div>' +
        '</div>' +
      '</div>';
    kit.copy.appendChild(wrap);
    // every index row gets its readout folded inside it: hover opens it
    wrap.querySelectorAll('.v2-index li').forEach((li) => {
      const k = +li.dataset.i, T = TREKS[k];
      const dx = document.createElement('div'); dx.className = 'dx';
      dx.innerHTML = '<div class="dx-in">' +
        '<p class="dx-sub">' + esc(T.line2 || '') + (T.country ? ', ' + esc(T.country) : '') + '</p>' +
        '<p class="dx-data">' + [kmOf(T), T.high && T.high.m ? esc(T.high.name) + ' <b>' + kit.fmtM(T.high.m) + '</b>' : ''].filter(Boolean).join('<i>/</i>') + '</p>' +
        '<p class="dx-line">' + esc(lineOf(T, k)) + '</p></div>';
      li.appendChild(dx);
    });
    dom = {
      root:wrap,
      head:wrap.querySelector('.dr-head'),
      kick:wrap.querySelector('.dr-kick .v2-line > span'),
      kickX:wrap.querySelector('.dr-kick .x'),
      lines:Array.from(wrap.querySelectorAll('.dr-h1 .v2-line > span')),
      xs:Array.from(wrap.querySelectorAll('.dr-h1 .x')),
      lede:wrap.querySelector('.dr-lede'), hint:wrap.querySelector('.dr-hint'),
      side:wrap.querySelector('.dr-side'),
      sideK:wrap.querySelector('.dr-side > .v2-k'),
      rule:wrap.querySelector('.dr-rule'),
      list:wrap.querySelector('.v2-index'),
      lis:Array.from(wrap.querySelectorAll('.v2-index li')),
      ro:wrap.querySelector('.dr-ro'),
      nums:Array.from(wrap.querySelectorAll('.ro-nums button')),
      cards:Array.from(wrap.querySelectorAll('.ro-card[data-i]')),
      tipcard:wrap.querySelector('.ro-tipcard')
    };
    dom.root.classList.toggle('dr-narrow', NARROW);
  }
  buildDom();

  let shownI = -2;
  function showActive(i){
    if(i === shownI) return;
    shownI = i;
    dom.lis.forEach((li, k) => li.classList.toggle('on', k === i));
    dom.list.classList.toggle('has-on', i >= 0);
    dom.nums.forEach((b, k) => b.classList.toggle('on', k === i));
    dom.cards.forEach((c, k) => c.classList.toggle('on', k === i));
    dom.tipcard.classList.toggle('on', i < 0);
  }

  /* ============================================================
     5. pointer: hover on a wide screen, tap on a phone. the index
        and the desk drive the same state
     ============================================================ */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  // V1 moves the real camera to its own shot before our frame runs, so pointer rays
  // use a copy of the camera as it was last drawn
  const eye = new THREE.PerspectiveCamera(34, 1, 0.4, 400);
  function keepEye(){
    const c = kit.camera;
    eye.position.copy(c.position); eye.quaternion.copy(c.quaternion);
    if(eye.fov !== c.fov || eye.aspect !== c.aspect){ eye.fov = c.fov; eye.aspect = c.aspect; eye.updateProjectionMatrix(); }
    eye.updateMatrixWorld(true);
  }
  const PLANE = new THREE.Plane(V3(0, 1, 0), 0), _hit = V3(0,0,0);
  const PTR = { has:false, x:0, y:0, el:null, sx:0, sy:0, speed:0 };
  let listI = -1, focusI = -1, hoverI = -1, tapI = -1, candI = -1, candT = 0, started = false, ticked = false, tIntro = 0;
  // the intro clock starts on the first smooth frame, not when the page calls intro():
  // the first frames after boot can stall while the GPU links shaders, and a timeline
  // started then would skip the lamp coming on
  let playing = false, warmN = 0, lastPerf = 0, introPerf = 0, introTl = null;

  window.addEventListener('pointermove', (e) => {
    PTR.has = true; PTR.x = e.clientX; PTR.y = e.clientY; PTR.el = e.target;
  }, { passive:true });
  window.addEventListener('pointerout', (e) => { if(!e.relatedTarget) { PTR.has = false; PTR.el = null; } }, { passive:true });
  function mapAt(x, y){
    ndc.set((x/window.innerWidth)*2 - 1, -(y/window.innerHeight)*2 + 1);
    ray.setFromCamera(ndc, eye);
    const h = ray.intersectObjects(PICKS, false);
    return h.length ? h[0].object.userData.mapI : -1;
  }
  const overSide = (el) => !!(el && el.closest && el.closest('.dr-side'));
  window.addEventListener('pointerup', (e) => {
    if(!started || HX > 0.02) return;
    if(!(NARROW || e.pointerType === 'touch')) return;
    if(overSide(e.target)) return;
    const i = mapAt(e.clientX, e.clientY);
    tapI = (i === tapI) ? -1 : i;
  });
  dom.nums.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.i; tapI = (i === tapI) ? -1 : i; }));
  dom.lis.forEach((li) => {
    li.addEventListener('click', () => { const i = +li.dataset.i; tapI = (i === tapI) ? -1 : i; });
    // keyboard: tab through the index and each map lifts as its row takes focus
    li.tabIndex = 0;
    li.addEventListener('focus', () => { focusI = +li.dataset.i; });
    li.addEventListener('blur', () => { focusI = -1; });
  });

  /* ============================================================
     6. springs and the per-frame pose of every map
     ============================================================ */
  function spring(c, target, k, d, dt){ c.v += ((target - c.p)*k - c.v*d)*dt; c.p += c.v*dt; }
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _v = V3(0,0,0);
  const hermite = (a, m0, b, m1, u) => { const u2 = u*u, u3 = u2*u; return (2*u3 - 3*u2 + 1)*a + (u3 - 2*u2 + u)*m0 + (-2*u3 + 3*u2)*b + (u3 - u2)*m1; };

  // the deal: a scripted flight in from the viewer's side, then the springs take over on landing
  function dealPose(M, u){
    const S = M.start, H = M.home;
    const dx = H.x - S.x, dz = H.z - S.z, len = Math.hypot(dx, dz) || 1, ux = dx/len, uz = dz/len;
    const SLIDE = 0.55, VS = 3.0;                           // lands short and slides the rest
    const Lx = H.x - ux*SLIDE, Lz = H.z - uz*SLIDE, dur = K.DEAL_DUR;
    const x = hermite(S.x, (Lx - S.x)*1.7, Lx, ux*VS*dur, u), z = hermite(S.z, (Lz - S.z)*1.7, Lz, uz*VS*dur, u);
    const y = S.y*(1 - Math.pow(u, 2.4));
    const ry = lerp(S.ry, H.ry + (S.ry - H.ry)*0.14, 1 - Math.pow(1 - u, 2.2));
    return { x, y, z, ry, rz:S.rz*(1 - u), rx:-0.07*Math.sin(PI*u), vx:ux*VS, vz:uz*VS, vy:-S.y*2.4/dur };
  }

  let HX = 0;
  function poseMaps(dt, time, hx){
    const anyActive = activeI();
    const sweep = NARROW ? SWEEP_N : SWEEP_D;
    for(const M of MAPS){
      const i = M.i, s = M.s, H = M.home;
      const tDeal = K.DEAL0 + i*K.DEAL_GAP;
      const since = playing ? time - tIntro - tDeal : -1;
      // before its turn: waiting below the frame
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
      // targets: home, the hover lift, the exit sweep
      const up = (anyActive === i) ? 1 : 0;
      spring(M.lift, up, REDUCED ? 400 : 150, REDUCED ? 40 : 15, dt);
      spring(M.dim, (anyActive >= 0 && anyActive !== i) ? K.DIM : 1, 60, 16, dt);
      const L = Math.max(0, M.lift.p);
      const order = 4 - i;                                    // 05 goes first
      const sw = i === 0 ? 0 : easeInOut(seg(hx, 0.04 + (order)*0.085, 0.42 + order*0.085));
      // a lifted map squares up to the viewer and tips toward them
      const toCam = Math.atan2(CAM.pos.x - H.x, CAM.pos.z - H.z);
      const tx = H.x + sw*sweep.dx, tz = H.z + sw*sweep.dz;
      const tyaw = lerp(H.ry, toCam*0.35, Math.min(1, L)) + sw*sweep.ry;
      if(M.dealt){
        const sub = dt > 0.02 ? 2 : 1, h = dt/sub;
        for(let k=0;k<sub;k++){
          spring(s.x, tx, 55, 14, h); spring(s.z, tz, 55, 14, h);
          spring(s.y, M.lift.p*K.LIFT, 170, 12, h);
          // the desk is a floor: land and give a small bounce
          if(s.y.p < 0){ s.y.p = 0; if(s.y.v < 0) s.y.v *= -0.22; }
          spring(s.rx, M.lift.p*K.TILT, 120, 13, h);
          spring(s.ry, tyaw, 90, 13, h);
          spring(s.rz, 0, 120, 14, h);
        }
      }
      // No. 01 has to be exactly in V1's pose when the hero hands over
      let px = s.x.p, py = s.y.p, pz = s.z.p, rx = s.rx.p, ry = s.ry.p, rz = s.rz.p;
      if(i === 0){
        const f = 1 - seg(hx, 0.82, 0.995);
        if(hx >= 0.995 || M.dealt){
          px = H.x + (px - H.x)*f; py *= f; pz = H.z + (pz - H.z)*f; rx *= f; ry = H.ry + (ry - H.ry)*f; rz *= f;
        }
      }
      M.pivot.position.set(px, py, pz);
      _e.set(rx, ry, rz, 'YXZ'); M.pivot.quaternion.setFromEuler(_e);
      if(i === 0){
        const R = kit.mapRoot;
        if(hx >= 0.995){ R.position.set(0, 0, 0); R.quaternion.identity(); }
        else { R.position.copy(_v.set(M.offX, 0, 0).applyQuaternion(M.pivot.quaternion).add(M.pivot.position)); R.quaternion.copy(M.pivot.quaternion); }
      }
      // dim the maps you are not looking at
      const dim = hx >= 0.995 ? 1 : M.dim.p;
      M.dimMats.forEach(m => m.color.setScalar(dim));
      M.gloss.material.uniforms.uAmt.value = dim*dim*(1 - smooth(seg(hx, 0.4, 0.85)));
      // the shadow card: tight on the desk, spreading and fading as the map rises,
      // and pushed away from the lamp the way the real shadow is
      const sh = M.shadow, lift = Math.max(0, py);
      const away = lift/Math.max(2, K.LAMP_H - lift);
      sh.position.set(px + (px - lamp.position.x)*away, -0.008, pz + (pz - lamp.position.z)*away);
      sh.rotation.y = ry;
      const spread = 1 + lift*0.16;
      sh.scale.set(spread, 1, spread);
      sh.material.opacity = 0.58*(1 - Math.min(0.55, lift*0.42))*(1 - smooth(seg(hx, 0.7, 0.97)))*Math.min(1, LAMP.k*1.5);
    }
  }

  let dealtAll = false;
  function activeI(){
    if(!started || HX > 0.015) return -1;
    if(listI >= 0) return listI;
    if(focusI >= 0) return focusI;
    if(NARROW) return tapI;
    return tapI >= 0 && hoverI < 0 ? tapI : hoverI;
  }

  /* ---- read the pointer once a frame: hover intent, the list, the pool target ---- */
  const poolT = { x:0, z:0 };
  function readPointer(dt, time){
    // speed in px/s, smoothed: a cursor sweeping across the row doesn't lift every map it crosses
    const vx = (PTR.x - PTR.sx)/Math.max(dt, 1e-3), vy = (PTR.y - PTR.sy)/Math.max(dt, 1e-3);
    PTR.speed = lerp(PTR.speed, Math.hypot(vx, vy), 1 - Math.exp(-dt*14));
    PTR.sx = PTR.x; PTR.sy = PTR.y;
    // the index
    const li = PTR.el && PTR.el.closest ? PTR.el.closest('.v2-index li') : null;
    listI = (PTR.has && li) ? +li.dataset.i : -1;
    // the desk
    let cand = -1;
    if(PTR.has && !overSide(PTR.el) && dealtAll) cand = mapAt(PTR.x, PTR.y);
    if(!NARROW){
      if(cand !== hoverI){
        if(cand !== candI){ candI = cand; candT = time; }
        const dwell = time - candT;
        if(cand >= 0 && (PTR.speed < 520 || dwell > 0.16)) hoverI = cand;
        else if(cand < 0 && dwell > 0.12) hoverI = -1;
      } else candI = cand;
    }
    // the pool goes where the pointer meets the desk, held inside the lit part of the desk
    let px = CAM.rest.x, pz = CAM.rest.z;
    if(PTR.has && playing && time - tIntro > 1.5){
      ndc.set((PTR.x/window.innerWidth)*2 - 1, -(PTR.y/window.innerHeight)*2 + 1);
      ray.setFromCamera(ndc, eye);
      if(ray.ray.intersectPlane(PLANE, _hit)){ px = _hit.x; pz = _hit.z; }
      else { px = CAM.rest.x; pz = REGION.z0; }
      px = Math.max(REGION.x0, Math.min(REGION.x1, px)); pz = Math.max(REGION.z0, Math.min(REGION.z1, pz));
    }
    const a = activeI();
    // over a map the pool leans onto it. from the index (or the keyboard) it goes all the way
    if(a >= 0){ const M = MAPS[a], k = (a === listI || a === focusI || a === tapI) ? 0.9 : 0.55; px = lerp(px, M.home.x, k); pz = lerp(pz, M.home.z + 0.6, k); }
    poolT.x = px; poolT.z = pz;
  }

  /* ============================================================
     7. the frame
     ============================================================ */
  const _bg = new THREE.Color(V2.bg), BLACK = new THREE.Color('#060505');
  const _cp = V3(0,0,0), _ct = V3(0,0,0);
  const par = { x:{p:0,v:0}, y:{p:0,v:0} };
  let lastX = '', lastHead = '', domHidden = false;

  function frame(dt, t, hx, pre){
    if(!layoutDone) layout();
    HX = hx;
    const time = t;
    // V1 placed the camera and lit the room before this runs: read what we hand over to
    const v1Near = kit.scene.fog.near, v1Far = kit.scene.fog.far;
    if(!pre) readPointer(dt, time);
    poseMaps(pre ? 0 : dt, time, hx);

    // the pool: spring toward the pointer, then settle over No. 01 for the exit
    const settle = smooth(seg(hx, 0.02, 0.5));
    const ptx = lerp(poolT.x, MAPS[0].home.x + (NARROW ? 0 : 1.2), settle);
    const ptz = lerp(poolT.z, MAPS[0].home.z, settle);
    if(!pre){
      const sub = dt > 0.02 ? 2 : 1, h = dt/sub;
      for(let k=0;k<sub;k++){ spring(pool.x, ptx, REDUCED ? 200 : K.POOL_K, REDUCED ? 28 : K.POOL_C, h); spring(pool.z, ptz, REDUCED ? 200 : K.POOL_K, REDUCED ? 28 : K.POOL_C, h); }
    }
    lamp.target.position.set(pool.x.p, 0, pool.z.p);
    lamp.position.set(pool.x.p - K.LAMP_LEFT, K.LAMP_H, pool.z.p - K.LAMP_BACK);
    const out = 1 - smooth(seg(hx, 0.5, 0.97));
    lamp.intensity = hx >= 0.999 ? 0 : K.LAMP_I*Math.max(0, LAMP.k)*out;
    lamp.color.copy(LAMP_COLD).lerp(LAMP_WARM, LAMP.warm);
    lamp.shadow.autoUpdate = hx < 0.999;
    GLOSS.uLamp.value.copy(lamp.position);
    GLOSS.uDir.value.copy(lamp.target.position).sub(lamp.position).normalize();
    GLOSS.uI.value = lamp.intensity*K.GLOSS_K;
    GLOSS.uCol.value.copy(lamp.color);
    bounce.position.set(pool.x.p, 7, pool.z.p);
    bounce.intensity = lamp.intensity*K.BOUNCE;
    bounce.color.copy(lamp.color);

    // V1's lights: off while the lamp owns the room, all the way back by hx = 1
    const v1k = hx >= 0.999 ? 1 : smooth(seg(hx, 0.4, 0.985));
    if(v1k < 1){
      const amb = K.AMB*clamp01(LAMP.k);
      kit.key.intensity *= v1k;
      kit.fill.intensity *= v1k;
      kit.hemi.intensity *= lerp(amb, 1, v1k);
      // the room starts black and comes up with the lamp
      const room = lerp(0.35, 1, clamp01(LAMP.k));
      _bg.copy(kit.scene.background);
      kit.scene.background.copy(BLACK).lerp(_bg, lerp(room, 1, v1k));
      kit.scene.fog.color.copy(kit.scene.background);
    }

    // camera: our shot, a slow push in during the intro, a breath of parallax,
    // then a heavy ease into V1's shot of the shut map
    const w = hx >= 0.999 ? 1 : easeInOut(seg(hx, 0.05, 0.995));
    const k = 1 - CAM.intro;
    _cp.copy(CAM.pos).sub(CAM.tgt).multiplyScalar(1 + 0.07*k);
    if(!pre && !REDUCED){
      const nx = PTR.has ? (PTR.x/window.innerWidth)*2 - 1 : 0, ny = PTR.has ? (PTR.y/window.innerHeight)*2 - 1 : 0;
      spring(par.x, nx, 18, 8, dt); spring(par.y, ny, 18, 8, dt);
    }
    _cp.applyAxisAngle(_y, -par.x.p*0.018);
    _cp.y += par.y.p*_cp.length()*0.008;
    _cp.add(CAM.tgt); _cp.y += 1.2*k;
    _ct.copy(CAM.tgt);
    kit.blendCam(_cp, _ct, CAM.fov, w);
    keepEye();
    // V1 fogs from its own camera distance, which would swallow our wide shot
    kit.scene.fog.near = lerp(CAM.dist*1.7, v1Near, w);
    kit.scene.fog.far = lerp(CAM.dist*4.2, v1Far, w);

    root.visible = hx < 0.999;
    if(!pre) domFrame(hx);
  }
  const _y = V3(0, 1, 0);

  /* ---- the DOM's exit: the headline leaves upward through its masks, line by line ---- */
  function domFrame(hx){
    // 150, not 100: the italic descenders hang below the line box and would peek through the mask
    const xs = dom.xs.map((el, k) => -150*easeInOut(seg(hx, 0.02 + k*0.045, 0.24 + k*0.045)));
    const key = xs.map(v => v.toFixed(1)).join(',');
    if(key !== lastX){ lastX = key; dom.xs.forEach((el, k) => { el.style.transform = 'translate3d(0,' + xs[k].toFixed(2) + '%,0)'; }); }
    const a = seg(hx, 0.0, 0.2), b = seg(hx, 0.0, 0.24);
    const hk = (1 - smooth(a)).toFixed(3) + '|' + (1 - smooth(b)).toFixed(3);
    if(hk !== lastHead){
      lastHead = hk;
      const kick = -150*easeInOut(a);
      dom.kickX.style.transform = 'translate3d(0,' + kick.toFixed(2) + '%,0)';
      [dom.lede, dom.hint].forEach((el) => { el.style.opacity = (1 - smooth(a)).toFixed(3); el.style.translate = '0 ' + (-18*smooth(a)).toFixed(1) + 'px'; });
      dom.side.style.opacity = (1 - smooth(b)).toFixed(3);
      dom.side.style.translate = '0 ' + (-16*smooth(b)).toFixed(1) + 'px';
      dom.side.style.pointerEvents = hx > 0.05 ? 'none' : '';
    }
    const hide = hx > 0.5;
    if(hide !== domHidden){ domHidden = hide; dom.root.style.visibility = hide ? 'hidden' : ''; }
    showActive(activeI());
  }

  // the page paints one frame at boot before the first tick. keep that frame dark too
  const prevOBR = kit.scene.onBeforeRender;
  kit.scene.onBeforeRender = function(r, s, c){
    if(!ticked && layoutDone){ frame(0, 0, 0, true); s.updateMatrixWorld(); c.updateMatrixWorld(); }
    if(prevOBR) return prevOBR.apply(this, arguments);
  };

  // kit.brand is copied by value when the kit is made (Object.assign reads the getter once),
  // so without &name it stays null. resolve the name the same way the kit does
  function brand(){
    if(kit.brand) return kit.brand;
    const q = (kit.Q.get('name') || '').replace(/[^a-z]/g, '');
    return kit.NAMES[q] || kit.NAMES.northing;
  }

  /* ============================================================
     8. hooks
     ============================================================ */
  return {
    name:'northing',
    onCover(cov0){
      // the brand is known now: print the four new covers, and read the varnish off all five
      MAPS.forEach((M) => {
        if(!M.coverCanvas){ M.gloss.material.uniforms.uMask.value = inkMask(cov0, M.tone); return; }
        const c = kit.drawCover(M.i, brand(), 600, 800);
        M.coverCanvas.getContext('2d').drawImage(c, 0, 0);
        M.paper.map.needsUpdate = true;
        M.gloss.material.uniforms.uMask.value = inkMask(c, M.tone);
      });
    },
    intro(){
      started = true;
      introPerf = performance.now();
      const tl = introTl = gsap.timeline({ paused:true });
      // the header comes up through a mask too: each piece rises while a clip, fixed to
      // where it will end, opens with it
      const tops = Array.from(document.querySelectorAll('.top .brand, .top #bookTop'));
      const rise = tops.map(() => ({ v:1 }));
      const paint = (el, o) => {
        const on = o.v > 0.001, y = (el.offsetHeight + 8)*o.v;
        el.style.transition = on ? 'none' : '';
        el.style.transform = on ? 'translate3d(0,' + y.toFixed(2) + 'px,0)' : '';
        el.style.clipPath = on ? 'inset(0 -30px ' + (y - 8).toFixed(2) + 'px -30px)' : '';
      };
      tops.forEach((el, k) => paint(el, rise[k]));
      gsap.set(dom.kick, { yPercent:112 });
      gsap.set(dom.lines, { yPercent:112 });
      gsap.set([dom.lede, dom.hint], { autoAlpha:0, y:14 });
      gsap.set([dom.sideK].concat(dom.lis), { autoAlpha:0, y:12 });
      gsap.set(dom.rule, { scaleX:0 });
      gsap.set(dom.ro, { autoAlpha:0, y:12 });
      if(REDUCED){
        LAMP.k = 1; LAMP.warm = 1; CAM.intro = 1;
        tops.forEach((el, k) => { rise[k].v = 0; paint(el, rise[k]); });
        tl.to([dom.lede, dom.hint, dom.sideK, dom.ro].concat(dom.lis), { autoAlpha:1, y:0, duration:0.6 }, 0)
          .to(dom.rule, { scaleX:1, duration:0.01 }, 0)
          .to([dom.kick].concat(dom.lines), { yPercent:0, duration:0.01 }, 0);
        playing = true; tIntro = gsap.ticker.time; tl.play(0);
        return tl;
      }
      // the lamp: a warm ramp with a small overshoot, the filament colour warming behind it
      tl.to(LAMP, { k:1, duration:1.15, ease:'back.out(2.4)' }, 0.16)
        .to(LAMP, { warm:1, duration:1.7, ease:'power2.out' }, 0.16)
        .to(CAM, { intro:1, duration:3.4, ease:'power3.out' }, 0)
        .to(rise[0], { v:0, duration:1.2, ease:'expo.out', onUpdate:() => paint(tops[0], rise[0]) }, 0.95)
        .to(rise[1] || {}, { v:0, duration:1.2, ease:'expo.out', onUpdate:() => tops[1] && paint(tops[1], rise[1]) }, 1.05)
        .to(dom.kick, { yPercent:0, duration:1.1, ease:'expo.out' }, 1.0)
        .to(dom.lines, { yPercent:0, duration:1.4, stagger:0.12, ease:'expo.out' }, 1.1)
        .to([dom.lede, dom.hint], { autoAlpha:1, y:0, duration:1.0, stagger:0.1, ease:'power3.out' }, 1.7)
        .to(dom.rule, { scaleX:1, duration:1.3, ease:'expo.inOut' }, 1.2)
        .to([dom.sideK].concat(dom.lis), { autoAlpha:1, y:0, duration:0.8, stagger:0.07, ease:'power3.out' }, 1.55)
        .to(dom.ro, { autoAlpha:1, y:0, duration:0.9, ease:'power3.out' }, 1.9);
      if(kit.DEBUG){ playing = true; tIntro = gsap.ticker.time - 10; tl.progress(1); }
      return tl;
    },
    frame(dt, t, hx){
      ticked = true;
      const now = performance.now();
      if(started && !playing){
        warmN = (lastPerf && now - lastPerf < 34) ? warmN + 1 : 0;
        if(warmN >= 3 || now - introPerf > 2200){ playing = true; tIntro = t; introTl.play(0); }
      }
      lastPerf = now;
      frame(dt, t, hx, false);
    },
    resize(){ layout(); },
    tour(){
      // positions follow the maps on any screen: a point on the desk, or a map's centre
      const W = (x, z) => () => kit.screenOf(V3(x, 0, z));
      const C = (i, dx, dz) => () => { const H = MAPS[i].home; return kit.screenOf(V3(H.x + (dx || 0), K.THICK, H.z + (dz || 0))); };
      if(NARROW) return [
        { t:0, at:W(8.2, -7.9) }, { t:3.3, at:W(8.2, -7.9) },
        { t:4.7, at:W(7.6, -18.6) },                       // up the desk: the pool and the shadows swing
        { t:5.45, at:C(3) }, { t:5.6, at:C(3), click:true }, // tap No. 04
        { t:6.75, at:C(3, 0.3, 0.2) },
        { t:7.2, at:C(4) }, { t:7.35, at:C(4), click:true }, // tap No. 05
        { t:8.25, at:C(0, 0.4, 0.6) }, { t:8.4, at:C(0, 0.4, 0.6), click:true }, // and No. 01
        { t:9.0, at:C(0, 0.4, 0.6) }
      ];
      return [
        { t:0, at:W(12.5, -7.8) }, { t:3.25, at:W(12.5, -7.8) },
        { t:5.0, at:W(35.0, -7.4) },                       // across the back of the desk: the pool swings
        { t:5.75, at:C(3, 0.3, 0.6) },                      // onto No. 04, Kilimanjaro
        { t:6.65, at:C(3, 0.9, 1.2) },
        { t:7.25, at:C(4, -0.2, 0.6) },                     // No. 05
        { t:7.95, at:C(4, 0.4, 1.0) },
        { t:8.85, at:C(0, 0.6, 0.8) },                      // and rest on No. 01
        { t:9.0, at:C(0, 0.6, 0.8) }
      ];
    }
  };
};
})();
