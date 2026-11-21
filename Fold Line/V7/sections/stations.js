/* ============================================================
   FOLD LINE . V7 . the paper stations
   Map Goes On (round 1, option 03), one station per stop: a sheet of the same paper as the maps, lying on a pool of
   dark cloth under one cold lamp, the stop printed on it, the red route across it and cut-outs standing on it,
   hinged at their feet like the walk's scenery. They spring up as the hiker reaches them, and each one can carry a
   floating card in the page (sections/landing.js places the cards from anchor()).
   The stations stand far from the hero's room and the Tongariro map, so neither ever shows behind them.
   Built with the page's own paper (makePaper, shapeCanvas, colourCanvas). Classic script. Exposes window.STATIONS.
   ============================================================ */
(function(){
'use strict';
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const lerp = (a, b, t) => a + (b - a)*t;
const smooth = (t) => t*t*(3 - 2*t);
const HALF_PI = Math.PI*0.5;
const SW = 9.4, SD = 6.6;            // a sheet, left to right and front to back
const ZR = 1.75;                     // the route runs along the front of the sheet
const X0 = 640, DX = 60;             // where the stations stand, well away from the room and the map

function build(A, stops){
  const THREE = A.THREE, SEC = window.SECTIONS, PAL = SEC.PAL, LK = window.LOOK;
  const font = (role, px, w) => LK ? LK.cf(role, px, w) : px + 'px sans-serif';
  const INK = '#1B2230', PAPER = '#EAE4D8', CREAM = '#F1EBDF', ACC = PAL.accent || '#D63B2F';
  const T = window.TREKS || [];
  const cats = PAL.cats;

  // two lamps, each with a soft fill, so a station leaving the screen and the next one arriving are both lit.
  // station i takes lamp i % 2
  const LAMPS = [0, 1].map(() => {
    const lamp = new THREE.SpotLight(PAL.landLamp || 0xE2EAFF, 0, 0, 30*Math.PI/180, 0.7, 2);
    lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.bias = -0.0004; lamp.shadow.normalBias = 0.03; lamp.shadow.camera.near = 6; lamp.shadow.camera.far = 40;
    lamp.shadow.autoUpdate = false;
    const fill = new THREE.PointLight(0xDCE6FF, 0, 40, 2);
    A.scene.add(lamp, lamp.target, fill);
    return { lamp, fill };
  });

  // the cloth under each station: dark, lit only where the lamp falls, gone into the room at its edge
  const clothTex = (() => {
    const c = A.colourCanvas(512, 512, PAL.room || '#0A1019', (x, w, h) => {
      const g = x.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w*0.5);
      g.addColorStop(0, PAL.table || '#1A2638'); g.addColorStop(0.62, PAL.tableDk || '#0C131E'); g.addColorStop(1, PAL.room || '#0A1019');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
    return A.tex(c, true);
  })();

  // a cut-out standing on the sheet: hinged at its foot, lying flat until it springs
  function cut(S, o){
    // a station can scale all its pieces up together (the lengths, on its wide sheet)
    if(S.k && o.scene !== undefined){ o = Object.assign({}, o, { w:o.w*S.k, h:o.h*S.k, y0:o.y0 ? o.y0*S.k : o.y0, z:o.z*Math.min(1.15, S.k) }); }
    const h = o.h, w = o.w, chh = o.ch || 256, cww = Math.max(32, Math.round(chh*w/h));
    const shp = A.shapeCanvas(cww, chh, (x, W, H) => o.shape(x, W, H), 1.6);
    const col = A.colourCanvas(cww, chh, o.col, (x, W, H) => { if(o.paint) o.paint(x, W, H); });
    const { mat, depth } = A.makePaper({ colour:col, shape:shp, aspect:w/h, seed:o.seed || 3.3, deckle:o.deckle === undefined ? 0.004 : o.deckle, rim:o.rim === undefined ? 0.4 : o.rim, contact:0.12, warp:0.012 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 2, 4), mat);
    mesh.customDepthMaterial = depth; mesh.castShadow = true; mesh.receiveShadow = true; mesh.position.y = h*0.5;
    const g = new THREE.Group(); g.add(mesh); g.position.set(o.x, o.y0 || 0.035, o.z); g.rotation.x = -HALF_PI; g.visible = false;
    if(o.ry) g.rotation.y = o.ry;
    S.group.add(g);
    const P = { g, mesh, at:o.at, sp:{ p:-HALF_PI, v:0 }, x:o.x, z:o.z, w, h, y0:o.y0 || 0, card:o.card, phase:o.seed || 0, k:S.props.length, scene:o.scene };
    S.props.push(P); return P;
  }

  // a piece lying flat on the sheet (a lake, a patch of snow): it grows out from its middle as the station forms
  function flat(S, o){
    if(S.k && o.scene !== undefined){ o = Object.assign({}, o, { w:o.w*S.k, d:o.d*S.k, z:o.z*Math.min(1.15, S.k) }); }
    const cw = 256, ch = Math.max(32, Math.round(256*o.d/o.w));
    const shp = A.shapeCanvas(cw, ch, (x, W, H) => o.shape(x, W, H), 1.4);
    const col = A.colourCanvas(cw, ch, o.col, (x, W, H) => { if(o.paint) o.paint(x, W, H); });
    const { mat } = A.makePaper({ colour:col, shape:shp, aspect:o.w/o.d, seed:o.seed || 9.1, deckle:0.004, rim:0.3, contact:0.05, warp:0 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.d), mat);
    m.rotation.x = -HALF_PI; m.position.set(o.x, 0.034, o.z); m.receiveShadow = true; m.scale.setScalar(0.001); m.visible = false;
    S.group.add(m);
    const F = { m, flat:true, at:o.at, k:S.props.length, x:o.x, z:o.z, w:o.w, d:o.d, h:0.05, sp:{ p:0, v:0 }, scene:o.scene };
    S.props.push(F); return F;
  }

  /* ---- the shapes, all cut from card: detail is cut out of the paper, never drawn on it ---- */
  const SH = {
    hill:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.quadraticCurveTo(W*0.12, H*0.08, W*0.5, H*0.04); x.quadraticCurveTo(W*0.88, H*0.08, W, H); x.closePath(); x.fill(); },
    peak:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.lineTo(W*0.48, H*0.02); x.lineTo(W*0.56, H*0.12); x.lineTo(W*0.62, H*0.06); x.lineTo(W, H); x.closePath(); x.fill(); },
    tri:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.lineTo(W*0.5, 0); x.lineTo(W, H); x.closePath(); x.fill(); },
    folded:(x, W, H) => { x.beginPath(); x.moveTo(0, H*0.2); x.lineTo(W*0.33, 0); x.lineTo(W*0.66, H*0.2); x.lineTo(W, 0); x.lineTo(W, H*0.8); x.lineTo(W*0.66, H); x.lineTo(W*0.33, H*0.8); x.lineTo(0, H); x.closePath(); x.fill(); },
    van:(x, W, H) => { x.beginPath(); x.moveTo(W*0.02, H*0.82); x.lineTo(W*0.02, H*0.18); x.quadraticCurveTo(W*0.02, H*0.04, W*0.18, H*0.04); x.lineTo(W*0.78, H*0.04); x.lineTo(W*0.98, H*0.45); x.lineTo(W*0.98, H*0.82); x.closePath(); x.fill();
      x.beginPath(); x.arc(W*0.24, H*0.84, H*0.15, 0, 6.3); x.arc(W*0.76, H*0.84, H*0.15, 0, 6.3); x.fill(); },
    ticket:(x, W, H) => { x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, H*0.38); x.arc(W, H*0.5, H*0.12, -HALF_PI, HALF_PI, true); x.lineTo(W, H); x.lineTo(0, H); x.lineTo(0, H*0.62); x.arc(0, H*0.5, H*0.12, HALF_PI, -HALF_PI, true); x.closePath(); x.fill(); },
    sign:(x, W, H) => { x.fillRect(W*0.16, H*0.4, W*0.06, H*0.6); x.beginPath(); x.moveTo(0, 0); x.lineTo(W*0.86, 0); x.lineTo(W, H*0.22); x.lineTo(W*0.86, H*0.44); x.lineTo(0, H*0.44); x.closePath(); x.fill(); },
    // a person, cut in one piece: head, body, legs, and what makes them them (a hat, a pack, a pole, a flag)
    person:(o) => (x, W, H) => {
      // a figure with a flag stands a little left in its card, so the flag's tip is inside it (Sam, 18 Oct: it was cropped)
      const cx = W*(o.flag ? 0.4 : 0.46);
      x.beginPath(); x.arc(cx, H*0.12, W*0.12, 0, 6.3); x.fill();
      x.beginPath(); x.moveTo(cx - W*0.17, H*0.24); x.lineTo(cx + W*0.17, H*0.24); x.lineTo(cx + W*0.2, H*0.6); x.lineTo(cx - W*0.2, H*0.6); x.closePath(); x.fill();
      x.fillRect(cx - W*0.17, H*0.58, W*0.13, H*0.42); x.fillRect(cx + W*0.04, H*0.58, W*0.13, H*0.42);
      if(o.hat === 'brim'){ x.fillRect(cx - W*0.24, H*0.06, W*0.48, H*0.025); x.fillRect(cx - W*0.12, H*0.0, W*0.24, H*0.07); }
      if(o.hat === 'beanie'){ x.beginPath(); x.arc(cx, H*0.09, W*0.13, Math.PI, 0); x.fill(); x.beginPath(); x.arc(cx, H*-0.005, W*0.045, 0, 6.3); x.fill(); }
      if(o.hat === 'cap'){ x.beginPath(); x.arc(cx, H*0.09, W*0.12, Math.PI, 0); x.fill(); x.fillRect(cx, H*0.075, W*0.24, H*0.022); }
      if(o.hat === 'braid'){ x.beginPath(); x.ellipse(cx - W*0.13, H*0.25, W*0.04, H*0.1, 0.2, 0, 6.3); x.fill(); }
      if(o.pack === 'big'){ x.beginPath(); x.moveTo(cx - W*0.17, H*0.2); x.lineTo(cx - W*0.4, H*0.22); x.lineTo(cx - W*0.42, H*0.55); x.lineTo(cx - W*0.17, H*0.56); x.closePath(); x.fill(); }
      if(o.pack === 'small'){ x.fillRect(cx - W*0.32, H*0.27, W*0.16, H*0.22); }
      if(o.pole){ x.fillRect(cx + W*0.3, H*0.22, W*0.035, H*0.78); }
      if(o.flag){ x.fillRect(cx + W*0.3, H*0.0, W*0.035, H*1.0); x.beginPath(); x.moveTo(cx + W*0.335, H*0.01); x.lineTo(cx + W*0.56, H*0.07); x.lineTo(cx + W*0.335, H*0.14); x.fill(); }
    },
    pack:(x, W, H) => { x.beginPath(); x.moveTo(W*0.2, H); x.lineTo(W*0.12, H*0.3); x.quadraticCurveTo(W*0.12, H*0.05, W*0.5, H*0.04); x.quadraticCurveTo(W*0.88, H*0.05, W*0.88, H*0.3); x.lineTo(W*0.8, H); x.closePath(); x.fill(); },
    boot:(x, W, H) => { x.beginPath(); x.moveTo(W*0.16, 0); x.lineTo(W*0.5, 0); x.lineTo(W*0.54, H*0.55); x.quadraticCurveTo(W*0.98, H*0.6, W*0.98, H*0.86); x.lineTo(W*0.98, H); x.lineTo(W*0.06, H); x.lineTo(W*0.08, H*0.5); x.closePath(); x.fill(); },
    bottle:(x, W, H) => { x.fillRect(W*0.36, 0, W*0.28, H*0.1); x.beginPath(); x.moveTo(W*0.3, H*0.1); x.lineTo(W*0.7, H*0.1); x.lineTo(W*0.86, H*0.24); x.lineTo(W*0.86, H); x.lineTo(W*0.14, H); x.lineTo(W*0.14, H*0.24); x.closePath(); x.fill(); },
    poles:(x, W, H) => { x.save(); x.translate(W*0.5, H); x.rotate(-0.12); x.fillRect(-W*0.06, -H, W*0.12, H); x.fillRect(-W*0.2, -H, W*0.4, H*0.05); x.restore(); x.save(); x.translate(W*0.5, H); x.rotate(0.14); x.fillRect(-W*0.06, -H, W*0.12, H); x.fillRect(-W*0.2, -H, W*0.4, H*0.05); x.restore(); },
    jacket:(x, W, H) => { x.beginPath(); x.moveTo(W*0.36, 0); x.lineTo(W*0.64, 0); x.lineTo(W*0.98, H*0.2); x.lineTo(W*0.92, H*0.62); x.lineTo(W*0.8, H*0.6); x.lineTo(W*0.8, H); x.lineTo(W*0.2, H); x.lineTo(W*0.2, H*0.6); x.lineTo(W*0.08, H*0.62); x.lineTo(W*0.02, H*0.2); x.closePath(); x.fill(); },
    tab:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.lineTo(0, H*0.12); x.quadraticCurveTo(0, 0, W*0.12, 0); x.lineTo(W*0.88, 0); x.quadraticCurveTo(W, 0, W, H*0.12); x.lineTo(W, H); x.closePath(); x.fill(); },
    sun:(x, W, H) => { x.beginPath(); x.arc(W*0.5, H*0.5, W*0.28, 0, 6.3); x.fill(); for(let k = 0; k < 12; k++){ const a = k/12*6.2832; x.save(); x.translate(W*0.5, H*0.5); x.rotate(a); x.fillRect(W*0.33, -W*0.025, W*0.15, W*0.05); x.restore(); } },
    cloud:(x, W, H) => { x.beginPath(); x.arc(W*0.3, H*0.5, H*0.22, 0, 6.3); x.arc(W*0.5, H*0.36, H*0.28, 0, 6.3); x.arc(W*0.72, H*0.5, H*0.22, 0, 6.3); x.fill(); x.fillRect(W*0.3, H*0.5, W*0.42, H*0.22);
      for(let k = 0; k < 5; k++){ x.beginPath(); x.arc(W*(0.28 + k*0.11), H*(0.86 + (k % 2)*0.06), H*0.035, 0, 6.3); x.fill(); } },
    cover:(x, W, H) => { x.fillRect(0, 0, W, H); },
    pin:(x, W, H) => { x.fillRect(W*0.47, H*0.3, W*0.06, H*0.7); x.beginPath(); x.arc(W*0.5, H*0.2, W*0.42, 0, 6.3); x.fill(); },
    // a volcano: a concave cone with a notch of a crater, and its steam
    cone:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.quadraticCurveTo(W*0.38, H*0.9, W*0.44, H*0.12); x.lineTo(W*0.47, H*0.15); x.lineTo(W*0.53, H*0.15); x.lineTo(W*0.56, H*0.12); x.quadraticCurveTo(W*0.62, H*0.9, W, H); x.closePath(); x.fill(); },
    // a plume drifting off the crater: narrow at the vent, swelling and leaning as it rises
    steam:(x, W, H) => { x.beginPath(); x.moveTo(W*0.44, H); x.bezierCurveTo(W*0.3, H*0.72, W*0.62, H*0.6, W*0.42, H*0.42); x.bezierCurveTo(W*0.24, H*0.22, W*0.5, H*0.02, W*0.78, H*0.04);
      x.bezierCurveTo(W*0.98, H*0.08, W*0.9, H*0.3, W*0.72, H*0.36); x.bezierCurveTo(W*0.6, H*0.42, W*0.78, H*0.62, W*0.6, H*0.78); x.bezierCurveTo(W*0.56, H*0.86, W*0.58, H*0.94, W*0.56, H); x.closePath(); x.fill(); },
    hills:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.lineTo(0, H*0.55); x.quadraticCurveTo(W*0.2, H*0.05, W*0.42, H*0.45); x.quadraticCurveTo(W*0.62, H*0.15, W*0.8, H*0.4); x.quadraticCurveTo(W*0.92, H*0.3, W, H*0.5); x.lineTo(W, H); x.closePath(); x.fill(); },
    tuft:(x, W, H) => { for(let b = -3; b <= 3; b++){ x.save(); x.translate(W*0.5 + b*W*0.06, H); x.rotate(b*0.16); x.beginPath(); x.moveTo(-W*0.03, 0); x.lineTo(0, -H*(0.95 - Math.abs(b)*0.12)); x.lineTo(W*0.03, 0); x.fill(); x.restore(); } },
    // a sharp Andean peak, like Huayna Picchu over the ruins
    spire:(x, W, H) => { x.beginPath(); x.moveTo(0, H); x.lineTo(W*0.2, H*0.6); x.lineTo(W*0.32, H*0.66); x.lineTo(W*0.5, H*0.02); x.lineTo(W*0.62, H*0.3); x.lineTo(W*0.74, H*0.28); x.lineTo(W, H); x.closePath(); x.fill(); },
    // stepped terraces cut into a slope
    terraces:(x, W, H) => { const n = 6; x.beginPath(); x.moveTo(0, H); for(let k = 0; k < n; k++){ const y = H - (k + 1)/n*H*0.92, x0 = k/n*W*0.5, x1 = W - k/n*W*0.5; if(k === 0) x.lineTo(0, y); x.lineTo(x0, y); } x.lineTo(W*0.5, H*0.08); for(let k = n - 1; k >= 0; k--){ const y = H - (k + 1)/n*H*0.92, x1 = W - k/n*W*0.5; x.lineTo(x1, y); } x.lineTo(W, H); x.closePath(); x.fill(); },
    ruin:(x, W, H) => { x.fillRect(0, H*0.35, W*0.3, H*0.65); x.fillRect(W*0.34, H*0.15, W*0.32, H*0.85); x.fillRect(W*0.7, H*0.45, W*0.3, H*0.55); x.beginPath(); x.moveTo(W*0.32, H*0.18); x.lineTo(W*0.5, 0); x.lineTo(W*0.68, H*0.18); x.fill(); },
    // a high ridge of jagged summits
    ridge:(x, W, H) => { const P = [[0, 1], [0.08, 0.55], [0.16, 0.62], [0.27, 0.12], [0.36, 0.38], [0.46, 0.22], [0.58, 0.5], [0.68, 0.06], [0.8, 0.4], [0.9, 0.3], [1, 0.7], [1, 1]]; x.beginPath(); P.forEach((p, k) => k ? x.lineTo(p[0]*W, p[1]*H) : x.moveTo(p[0]*W, p[1]*H)); x.closePath(); x.fill(); },
    flags:(x, W, H) => { x.fillRect(0, 0, W*0.03, H); x.fillRect(W*0.97, H*0.2, W*0.03, H*0.8); for(let k = 0; k < 9; k++){ const u = (k + 0.5)/9, y = H*(0.08 + 0.18*Math.sin(Math.PI*u)); x.fillRect(W*(0.04 + u*0.88) - W*0.035, y, W*0.07, H*0.2); } x.fillRect(0, H*0.06, W, H*0.025); },
    hut:(x, W, H) => { x.fillRect(W*0.1, H*0.45, W*0.8, H*0.55); x.beginPath(); x.moveTo(0, H*0.5); x.lineTo(W*0.5, 0); x.lineTo(W, H*0.5); x.fill(); },
    lake:(x, W, H) => { x.beginPath(); for(let k = 0; k <= 40; k++){ const a = k/40*6.2832, r = 0.46 + 0.04*Math.sin(a*3 + 1); const px = W*(0.5 + Math.cos(a)*r), py = H*(0.5 + Math.sin(a)*r); k ? x.lineTo(px, py) : x.moveTo(px, py); } x.fill(); }
  };
  const shadeL = (snow) => (x, W, H) => {
    x.fillStyle = 'rgba(0,0,0,0.17)'; x.beginPath(); x.moveTo(W*0.48, H*0.02); x.lineTo(W*0.36, H); x.lineTo(0, H); x.closePath(); x.fill();
    if(snow){ x.fillStyle = '#F4F1EA'; x.beginPath(); x.moveTo(W*0.48, H*0.02); x.lineTo(W*0.37, H*0.25); x.lineTo(W*0.46, H*0.2); x.lineTo(W*0.52, H*0.27); x.lineTo(W*0.6, H*0.18); x.lineTo(W*0.67, H*0.24); x.lineTo(W*0.62, H*0.06); x.lineTo(W*0.56, H*0.12); x.closePath(); x.fill(); }
  };
  const edge = (a) => (x, W, H) => { x.fillStyle = 'rgba(0,0,0,' + (a || 0.12) + ')'; x.fillRect(0, H*0.72, W, H*0.28); };

  /* ---- each station's route across its sheet, a little different every time: u 0 at the left edge, 1 at the right ---- */
  const ROUTES = [
    (u) => ZR + 0.25*Math.sin(Math.PI*u),
    (u) => ZR - 0.35*Math.sin(Math.PI*u*2),
    (u) => ZR + 0.2 - 0.5*smooth(u),
    (u) => ZR - 0.3 + 0.45*Math.sin(Math.PI*u*1.5),
    (u) => ZR + 0.3*Math.cos(Math.PI*u*2.5),
    (u) => ZR - 0.15 - 0.9*smooth(clamp01((u - 0.55)/0.45))
  ];
  const routeX = (S, u) => lerp(-S.SW*0.5 + 0.25, S.SW*0.5 - 0.35, u);

  /* ---- what stands on each sheet. at: how far along the route the hiker is when it springs up. card: which floating
     card it carries ---- */
  const guides = SEC.GUIDES;
  const looks = [{ hat:'brim', pole:true }, { hat:'braid', pack:'small' }, { hat:'beanie', pack:'big' }, { hat:'cap', pole:true }, { hat:'beanie', flag:true }];
  const STOPS = {
    lengths(S){
      // three small scenes, one per length, each cut in layers: what a day on a volcano, four days on Inca stairs and
      // twelve under the Himalaya look like. they lie flat on the sheet until their turn, then each flips up whole
      // (Sam: "it will start flat ... one day will start flipping with the card, and then the second and the third")
      // one scene at a time (Sam, 18 Oct): the camera frames the day walk, then pans along the sheet to the multi-day, then
      // to the expedition, each flipping up as it comes into focus. landing.js drives the focus from the scroll
      S.flip = true; S.focus = true; S.sceneAt = [0.06, 0.4, 0.74]; S.k = 1.22;
      const D = 0, M = 1, X = 2, kx = S.SW/9.4;
      // a day walk: a volcano with its steam, green hills, the emerald lakes, tussock
      cut(S, { scene:D, x:kx*-3.05, z:-2.2, w:2.5, h:2.4, col:'#556B5E', shape:SH.cone, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.16)'; x.beginPath(); x.moveTo(W*0.5, H*0.15); x.quadraticCurveTo(W*0.6, H*0.9, W, H); x.lineTo(W*0.5, H); x.fill(); x.fillStyle = '#7E5A4A'; x.fillRect(W*0.44, H*0.12, W*0.12, H*0.06); }, card:0, seed:1.1 });
      cut(S, { scene:D, x:kx*-2.95, z:-2.24, w:0.9, h:1.15, col:'#E4E8EA', shape:SH.steam, paint:(x, W, H) => { x.fillStyle = 'rgba(80,96,120,0.14)'; x.fillRect(W*0.5, 0, W*0.5, H); }, seed:1.2, y0:2.24 });
      cut(S, { scene:D, x:kx*-3.0, z:-1.2, w:3.2, h:1.1, col:cats.day.color, shape:SH.hills, paint:(x, W, H) => { x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, H*0.55, W, H*0.04); }, seed:1.3 });
      flat(S, { scene:D, x:kx*-3.45, z:-0.45, w:0.66, d:0.4, col:'#4FA690', shape:SH.lake, seed:1.4 });
      flat(S, { scene:D, x:kx*-2.8, z:-0.35, w:0.5, d:0.32, col:'#4FA690', shape:SH.lake, seed:1.5 });
      flat(S, { scene:D, x:kx*-2.25, z:-0.55, w:0.6, d:0.36, col:'#6E98BA', shape:SH.lake, seed:1.6 });
      cut(S, { scene:D, x:kx*-1.75, z:-0.25, w:0.42, h:0.36, col:'#C3A266', shape:SH.tuft, seed:1.7, ch:96 });
      cut(S, { scene:D, x:kx*-3.95, z:-0.15, w:0.36, h:0.3, col:'#C3A266', shape:SH.tuft, seed:1.8, ch:96 });
      // multi-day: a spire over terraces, the stone walls of a ruin, a tent at camp
      cut(S, { scene:M, x:kx*0.4, z:-2.35, w:1.9, h:2.8, col:'#8C6A2C', shape:SH.spire, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.moveTo(W*0.5, H*0.02); x.lineTo(W*0.62, H*0.3); x.lineTo(W*0.74, H*0.28); x.lineTo(W, H); x.lineTo(W*0.5, H); x.fill(); }, card:1, seed:2.1 });
      cut(S, { scene:M, x:kx*-0.15, z:-1.35, w:2.7, h:1.35, col:cats.multi.color, shape:SH.terraces, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.12)'; for(let k = 1; k < 6; k++) x.fillRect(0, H - k/6*H*0.92 - 3, W, 3); }, seed:2.2 });
      cut(S, { scene:M, x:kx*0.85, z:-0.7, w:1.2, h:0.6, col:'#C9B596', shape:SH.ruin, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(W*0.44, H*0.45, W*0.12, H*0.2); x.fillRect(W*0.08, H*0.55, W*0.1, H*0.15); }, seed:2.3 });
      cut(S, { scene:M, x:kx*-0.75, z:-0.4, w:0.74, h:0.54, col:'#E0B85A', shape:SH.tri, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.moveTo(W*0.5, H*0.35); x.lineTo(W*0.4, H); x.lineTo(W*0.6, H); x.fill(); }, seed:2.4 });
      // expedition: a high snowy ridge, the big peak in front of it, prayer flags and a teahouse
      cut(S, { scene:X, x:kx*3.05, z:-2.7, w:3.4, h:2.5, col:'#3E5B80', shape:SH.ridge, paint:(x, W, H) => { x.fillStyle = 'rgba(244,241,234,0.85)'; [[0.27, 0.12], [0.68, 0.06], [0.46, 0.22]].forEach(p => { x.beginPath(); x.moveTo(W*(p[0] - 0.06), H*(p[1] + 0.16)); x.lineTo(W*p[0], H*p[1]); x.lineTo(W*(p[0] + 0.06), H*(p[1] + 0.16)); x.fill(); }); }, seed:3.1 });
      cut(S, { scene:X, x:kx*2.7, z:-1.65, w:2.9, h:3.2, col:cats.exp.color, shape:SH.peak, paint:shadeL(true), card:2, seed:3.2 });
      cut(S, { scene:X, x:kx*3.7, z:-0.65, w:1.5, h:0.72, col:'#E8E2D6', shape:SH.flags, paint:(x, W, H) => { const c = ['#5B8FC4', '#F1EBDF', '#D63B2F', '#5E8C61', '#D2A23A']; for(let k = 0; k < 9; k++){ const u = (k + 0.5)/9, y = H*(0.08 + 0.18*Math.sin(Math.PI*u)); x.fillStyle = c[k % 5]; x.fillRect(W*(0.04 + u*0.88) - W*0.035, y, W*0.07, H*0.2); } }, seed:3.3 });
      cut(S, { scene:X, x:kx*1.95, z:-0.45, w:0.82, h:0.64, col:'#EDE6D8', shape:SH.hut, paint:(x, W, H) => { x.fillStyle = cats.exp.color; x.beginPath(); x.moveTo(0, H*0.5); x.lineTo(W*0.5, 0); x.lineTo(W, H*0.5); x.fill(); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(W*0.42, H*0.68, W*0.16, H*0.32); }, seed:3.4 });
    },
    pocket(S){
      const xs = [-3.5, -1.75, 0, 1.75, 3.5];
      cut(S, { x:xs[0], z:-1.0, w:1.25, h:1.0, col:CREAM, shape:SH.folded, at:0.12, card:0, seed:4.1,
        paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(W*0.33, 0, W*0.33, H); x.strokeStyle = ACC; x.lineWidth = 6; x.setLineDash([14, 10]); x.beginPath(); x.moveTo(W*0.05, H*0.7); x.bezierCurveTo(W*0.3, H*0.3, W*0.6, H*0.8, W*0.95, H*0.35); x.stroke(); } });
      cut(S, { x:xs[1], z:-1.1, w:0.75, h:1.35, col:INK, shape:SH.person({ hat:'brim', flag:true }), at:0.3, card:1, seed:4.2,
        paint:(x, W, H) => { x.fillStyle = ACC; x.fillRect(W*0.72, 0, W*0.28, H*0.15); } });
      cut(S, { x:xs[2], z:-1.1, w:1.45, h:1.0, col:cats.multi.color, shape:SH.tri, at:0.48, card:2, seed:4.3,
        paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.moveTo(W*0.5, H*0.3); x.lineTo(W*0.36, H); x.lineTo(W*0.64, H); x.closePath(); x.fill(); } });
      cut(S, { x:xs[3], z:-1.0, w:1.6, h:0.8, col:'#E4DCCB', shape:SH.van, at:0.66, card:3, seed:4.4,
        paint:(x, W, H) => { x.fillStyle = cats.exp.color; x.fillRect(W*0.08, H*0.16, W*0.62, H*0.24); x.fillStyle = INK; x.beginPath(); x.arc(W*0.24, H*0.84, H*0.13, 0, 6.3); x.arc(W*0.76, H*0.84, H*0.13, 0, 6.3); x.fill(); } });
      cut(S, { x:xs[4], z:-0.9, w:1.1, h:0.68, col:CREAM, shape:SH.ticket, at:0.84, card:4, seed:4.5,
        paint:(x, W, H) => { x.fillStyle = 'rgba(27,34,48,0.6)'; x.fillRect(W*0.14, H*0.3, W*0.5, H*0.07); x.fillRect(W*0.14, H*0.5, W*0.34, H*0.07); x.fillStyle = ACC; x.beginPath(); x.arc(W*0.78, H*0.62, H*0.11, 0, 6.3); x.fill(); } });
    },
    guides(S){
      guides.forEach((G, k) => {
        const t = SEC.byKey(G.key), c = t ? SEC.catOf(t).color : ACC, L = looks[k % looks.length];
        cut(S, { x:-3.5 + k*1.75, z:-1.0 - (k % 2)*0.35, w:0.8, h:1.45 + (k % 3)*0.08, col:INK, shape:SH.person(L), at:0.12 + k*0.18, card:k, seed:6 + k,
          paint:(x, W, H) => { x.fillStyle = c; x.fillRect(W*0.29, H*0.24, W*0.34, H*0.06); if(L.flag){ x.fillRect(W*0.72, 0, W*0.28, H*0.15); } } });
      });
    },
    when(S){
      // twelve month tabs across the back, a sun over summer in the south and snow over the northern winter
      const M = 'JFMAMJJASOND';
      for(let k = 0; k < 12; k++){
        cut(S, { x:-4.12 + k*0.75, z:-2.2, w:0.6, h:0.82, col:CREAM, shape:SH.tab, at:0.04 + k*0.06, seed:20 + k, ch:160,
          paint:(x, W, H) => { x.fillStyle = INK; x.font = font('display', Math.round(H*0.36)); x.textAlign = 'center'; x.fillText(M[k], W*0.5, H*0.55); } });
      }
      cut(S, { x:-3.4, z:-2.9, w:1.3, h:1.3, col:cats.multi.color, shape:SH.sun, at:0.08, seed:33 });
      cut(S, { x:3.3, z:-2.9, w:1.7, h:1.1, col:'#DCE3EA', shape:SH.cloud, at:0.86, seed:34 });
      // each trek's season as a paper ribbon on the sheet, under its months, one row per trek
      S.ribbons = [];
      T.forEach((t, r) => {
        const on = SEC.months(t.seasonShort), c = SEC.catOf(t).color, z = -1.45 + r*0.42;
        let k = 0, first = true;
        while(k < 12){
          if(!on[k]){ k++; continue; }
          let e = k; while(e + 1 < 12 && on[e + 1]) e++;
          const x0 = -4.12 + k*0.75 - 0.33, x1 = -4.12 + e*0.75 + 0.33;
          const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.26), new THREE.MeshStandardMaterial({ color:c, roughness:0.9 }));
          m.rotation.x = -HALF_PI; m.position.set(x0, 0.036, z); m.receiveShadow = true;
          m.geometry.translate(0.5, 0, 0);
          m.scale.x = 0.001; m.visible = false;
          S.group.add(m);
          S.ribbons.push({ m, len:x1 - x0, at:clamp01((x0 + S.SW*0.5)/S.SW)*0.9, row:r, first, x:x0, z });
          first = false; k = e + 1;
        }
      });
      // the cards hang off the start of each trek's first ribbon
      S.cardAt = T.map((t, r) => { const R = S.ribbons.find(q => q.row === r && q.first); return R ? { x:R.x + 0.2, y:0.05, z:R.z, at:Math.min(0.9, 0.1 + r*0.18) } : null; });
    },
    ready(S){
      cut(S, { x:-3.5, z:-1.0, w:1.1, h:1.3, col:'#6E5B49', shape:SH.pack, paint:edge(0.18), at:0.1, seed:41 });
      cut(S, { x:-1.75, z:-1.05, w:0.6, h:1.05, col:'#8FB2C9', shape:SH.bottle, paint:edge(0.15), at:0.28, card:0, seed:42 });
      cut(S, { x:0.0, z:-0.95, w:1.1, h:0.85, col:'#4B3B30', shape:SH.boot, paint:edge(0.2), at:0.46, card:1, seed:43 });
      cut(S, { x:1.75, z:-1.2, w:0.8, h:1.7, col:'#9A9A96', shape:SH.poles, at:0.64, card:2, seed:44 });
      cut(S, { x:3.5, z:-1.1, w:1.4, h:1.35, col:ACC, shape:SH.jacket, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(W*0.49, H*0.04, W*0.02, H*0.96); }, at:0.82, card:3, seed:45 });
    },
    book(S){
      // the five maps stood up in a row, each in its length's colour, and the red ball at the end of the route
      T.forEach((t, k) => {
        const c = SEC.catOf(t).color;
        cut(S, { x:-3.4 + k*1.45, z:-1.3 - Math.abs(k - 2)*0.12, w:1.05, h:1.4, col:c, shape:SH.cover, at:0.1 + k*0.12, seed:50 + k, ry:(k - 2)*0.08,
          paint:(x, W, H) => {
            x.fillStyle = 'rgba(255,255,255,0.08)'; for(let r = 0; r < 7; r++){ x.beginPath(); x.ellipse(W*0.55, H*0.62, W*(0.12 + r*0.07), H*(0.08 + r*0.05), 0.3, 0, 6.3); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,0.16)'; x.stroke(); }
            x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = font('display', Math.round(H*0.085)); x.textAlign = 'left'; x.fillText(t.name, W*0.1, H*0.2);
            x.font = font('label', Math.round(H*0.045)); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillText(String(k + 1).padStart(2, '0') + ' · ' + t.days + (t.days === 1 ? ' DAY' : ' DAYS'), W*0.1, H*0.9);
            x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, W*0.05, H);
          } });
      });
      S.pin = cut(S, { x:S.SW*0.5 - 0.55, z:ZR - 1.05, w:0.5, h:0.75, col:ACC, shape:SH.pin, at:0.9, seed:58,
        paint:(x, W, H) => { x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.arc(W*0.38, H*0.13, W*0.12, 0, 6.3); x.fill(); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, H*0.3, W, H*0.7); } });
    }
  };

  /* ---- the pocket as a little planet (Sam, 18 Oct: "a big globe, as we rotate the five elements will be spread out
     equally around it, and as we scroll the one at the top centre will snap into position ... then the globe will rotate
     and the second item will appear"). The hero's paper globe again, bigger, with the five things that come with a trek
     standing round its rim like a pop-up planet. The page turns it a fifth at a time: the one on top springs up full size,
     the others wait half folded. The hiker walks on top while it turns under him ---- */
  const RG = 2.4, ORB_N = 5, ORB_ZS = 0.35, ORB_HA = 0.46, ORB_ZH = 0.95, ORB_REST = -0.95;
  function buildOrb(S){
    S.orb = true; S.RG = RG;
    S.wheel = new THREE.Group(); S.group.add(S.wheel);
    if(window.FOLD_GLOBE){
      const keep = window.FOLD_GLOBE.last, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
      const C = { THREE, V3, TREKS:T, lerp, smooth, seg:(v, a, b) => clamp01((v - a)/(b - a)), clamp01, REDUCED:A.REDUCED,
        kit:{ renderer:A.renderer, catOf:(i) => SEC.catOf(T[i]) },
        spring:(s, to, k, c, h) => { s.v += ((to - s.p)*k - s.v*c)*h; s.p += s.v*h; } };
      S.globe = window.FOLD_GLOBE(C, { at:V3(0, 0, 0), r:RG, light:V3(-0.45, 0.8, 0.55).normalize(), floor:-1e4, glowI:0.12 });
      window.FOLD_GLOBE.last = keep;
      if(S.globe) S.group.add(S.globe.root);
    }
    // the five, in the order of the cards: the folded map, a guide, a bed (the tent), the road (the van), the permits
    const items = [
      { w:1.45, h:1.15, col:CREAM, shape:SH.folded, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(W*0.33, 0, W*0.33, H); x.strokeStyle = ACC; x.lineWidth = 6; x.setLineDash([14, 10]); x.beginPath(); x.moveTo(W*0.05, H*0.7); x.bezierCurveTo(W*0.3, H*0.3, W*0.6, H*0.8, W*0.95, H*0.35); x.stroke(); } },
      { w:0.9, h:1.6, col:INK, shape:SH.person({ hat:'brim', flag:true }), paint:(x, W, H) => { x.fillStyle = ACC; x.fillRect(W*0.72, 0, W*0.28, H*0.15); } },
      { w:1.65, h:1.15, col:cats.multi.color, shape:SH.tri, paint:(x, W, H) => { x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.moveTo(W*0.5, H*0.3); x.lineTo(W*0.36, H); x.lineTo(W*0.64, H); x.closePath(); x.fill(); } },
      { w:1.85, h:0.92, col:'#E4DCCB', shape:SH.van, paint:(x, W, H) => { x.fillStyle = cats.exp.color; x.fillRect(W*0.08, H*0.16, W*0.62, H*0.24); x.fillStyle = INK; x.beginPath(); x.arc(W*0.24, H*0.84, H*0.13, 0, 6.3); x.arc(W*0.76, H*0.84, H*0.13, 0, 6.3); x.fill(); } },
      { w:1.35, h:0.84, col:CREAM, shape:SH.ticket, paint:(x, W, H) => { x.fillStyle = 'rgba(27,34,48,0.6)'; x.fillRect(W*0.14, H*0.3, W*0.5, H*0.07); x.fillRect(W*0.14, H*0.5, W*0.34, H*0.07); x.fillStyle = ACC; x.beginPath(); x.arc(W*0.78, H*0.62, H*0.11, 0, 6.3); x.fill(); } }
    ];
    items.forEach((o, k) => {
      // the globe's pieces stand big on screen: cut at three times the detail, with a clean edge and a faint rim (Sam, 18 Oct:
      // "clean the rough edges")
      const P = cut(S, Object.assign({ x:0, z:0, card:k, seed:4.1 + k*0.1, ch:1000, deckle:0.0012, rim:0.22 }, o));
      const pivot = new THREE.Group(); pivot.rotation.z = -k*2*Math.PI/ORB_N; S.wheel.add(pivot);
      pivot.add(P.g); P.g.position.set(0, Math.sqrt(RG*RG - ORB_ZS*ORB_ZS) - 0.03, ORB_ZS);
      P.g.rotation.x = ORB_REST; P.sp.p = ORB_REST; P.g.visible = true; P.sc = { p:0.82, v:0 }; P.slot = k; P.g.scale.setScalar(0.82);
    });
  }
  // each frame: the turn (f is which item is on top, 0 to 4, between whole numbers while it turns), the springs, the ball
  const _oq = new THREE.Quaternion(), _oz = new THREE.Vector3(0, 0, 1);
  const _ob = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.38, -1.95, 0, 'XYZ'));
  function orbFrame(S, f, popped, dt, reduced, cam, t){
    const th = f*2*Math.PI/ORB_N;
    S.wheel.rotation.z = th;
    const h = Math.min(0.034, dt || 0.016);
    for(const P of S.props){
      const on = (P.slot > 0 || popped) && Math.abs(f - P.slot) < 0.4;
      const ta = on ? 0 : ORB_REST, ts = on ? 1.32 : 0.82;
      if(reduced){ P.sp.p = ta; P.sp.v = 0; P.sc.p = ts; P.sc.v = 0; }
      else {
        P.sp.v += ((ta - P.sp.p)*(on ? 150 : 80) - P.sp.v*(on ? 10 : 13))*h; P.sp.p += P.sp.v*h;
        P.sc.v += ((ts - P.sc.p)*170 - P.sc.v*11)*h; P.sc.p += P.sc.v*h;
      }
      P.g.rotation.x = P.sp.p; P.g.scale.setScalar(P.sc.p); P.g.visible = true;
    }
    if(S.globe && cam){ _oq.setFromAxisAngle(_oz, th).multiply(_ob); S.globe.update(t, dt, { cam, sel:Math.round(f) % ORB_N, f:1, k:120, c:14, quat:_oq }); }
  }
  // the pin the thread leaves the orb from (Sam: "the blue dot ... from there the character can start"): the trek pin
  // that stands in the light at the last turn
  function orbPin(S, out){
    if(!S.globe) return orbHiker(S, out);
    const spin = S.globe.root.children[0], k = ORB_N - 1;
    _oq.setFromAxisAngle(_oz, k*2*Math.PI/ORB_N).multiply(_ob); spin.quaternion.copy(_oq);
    S.group.updateMatrixWorld(true);
    const P = S.globe.PINS[k % S.globe.PINS.length];
    return P ? P.head.getWorldPosition(out) : orbHiker(S, out);
  }
  // where the hiker walks on the orb: a little left of the top, in front of the items
  function orbHiker(S, out){ const r = Math.sqrt(RG*RG - ORB_ZH*ORB_ZH); return out.set(S.center.x - Math.sin(ORB_HA)*r, S.center.y + Math.cos(ORB_HA)*r, S.center.z + ORB_ZH); }
  // the camera on the orb: nearly level, the ball's top half and the item on top in the box, its lower half below
  function poseOrb(S, aspect, half, out){
    const box = [-half[0], half[0], -half[1], half[1]], el = 9*Math.PI/180;
    _d.set(0, Math.sin(el), Math.cos(el));
    const tgt = out.tgt.set(S.center.x, S.center.y + RG*0.5, S.center.z);
    _fit.fov = out.fov; _fit.aspect = aspect; _fit.updateProjectionMatrix();
    const pts = [[-RG*1.04, RG*0.12, 0], [RG*1.04, RG*0.12, 0], [0, RG + 2.2, ORB_ZS]];
    let lo = 3, hi = 80;
    for(let it = 0; it < 22; it++){
      const D = (lo + hi)*0.5;
      _fit.position.copy(tgt).addScaledVector(_d, D); _fit.lookAt(tgt); _fit.updateMatrixWorld();
      let ok = true;
      for(const p of pts){ _v.set(S.center.x + p[0], S.center.y + p[1], S.center.z + p[2]).project(_fit); if(_v.x < box[0] || _v.x > box[1] || _v.y < box[2] || _v.y > box[3]){ ok = false; break; } }
      if(ok) hi = D; else lo = D;
    }
    out.pos.copy(tgt).addScaledVector(_d, hi);
    return out;
  }

  const stations = stops.map((stop, i) => {
    const def = stop._def, n = +stop.dataset.stop;
    // the lengths sheet is wider, so its three scenes spread across the screen (Sam: "expand almost full width")
    const S = { i, id:def.id, n, group:new THREE.Group(), props:[], center:new THREE.Vector3(X0 + i*DX, 0, 0), route:ROUTES[i % ROUTES.length], cardAt:null, SW:def.flip ? 13.6 : SW };
    S.group.position.copy(S.center); S.group.visible = false;
    A.scene.add(S.group);
    if(def.orb){ buildOrb(S); S.maxH = RG + 1.6; return S; }
    // a flowing stop has no station: it is all page
    if(def.flow){ S.dom = true; S.maxH = 1; return S; }
    // the cloth
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map:clothTex, roughness:1 }));
    cloth.rotation.x = -HALF_PI; cloth.position.y = -0.01; cloth.receiveShadow = true;
    S.group.add(cloth);
    // the sheet, its stop printed on it and the route across it
    const cw = Math.round(1024*S.SW/SW), ch = Math.round(cw*SD/S.SW);
    const cv = A.colourCanvas(cw, ch, PAPER, (x, w, h) => {
      const zy = (z) => (z + SD*0.5)/SD*h, xx = (X) => (X + S.SW*0.5)/S.SW*w;
      // faint contours, so the sheet is a map before anything stands on it
      x.strokeStyle = 'rgba(27,34,48,0.07)'; x.lineWidth = 2;
      for(let r = 1; r < 9; r++){ x.beginPath(); x.ellipse(w*(0.3 + 0.4*((i*0.37) % 1)), h*0.35, w*0.06*r, h*0.05*r, 0.4 + i, 0, 6.3); x.stroke(); }
      x.strokeStyle = 'rgba(27,34,48,0.3)'; x.lineWidth = 2; x.strokeRect(22, 22, w - 44, h - 44);
      // the stop printed in the far corner, clear of the kraft sign at the start of the route
      x.fillStyle = INK; x.font = font('display', 64); x.textBaseline = 'alphabetic'; x.textAlign = 'right';
      x.fillText(String(n).padStart(2, '0'), w - 48, 110);
      x.font = font('label', 17); x.fillStyle = 'rgba(27,34,48,0.7)';
      x.fillText(def.kick.toUpperCase(), w - 48, 142); x.textAlign = 'left';
      x.strokeStyle = ACC; x.lineWidth = 6; x.setLineDash([20, 15]); x.lineCap = 'round';
      x.beginPath();
      for(let k = 0; k <= 60; k++){ const u = k/60; const px = xx(routeX(S, u)), py = zy(S.route(u)); k ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke(); x.setLineDash([]);
      x.fillStyle = ACC; x.beginPath(); x.arc(xx(routeX(S, 0)), zy(S.route(0)), 9, 0, 6.3); x.fill();
      if(def.id === 'lengths'){
        x.font = font('label', 17); x.fillStyle = 'rgba(27,34,48,0.75)'; x.textAlign = 'center';
        [['1 DAY', -2.9], ['2 TO 4 DAYS', 0.0], ['5 DAYS AND OVER', 2.9]].forEach(l => x.fillText(l[0], xx(l[1]*S.SW/9.4), zy(0.55)));
      }
    });
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(S.SW, 0.03, SD), new THREE.MeshStandardMaterial({ map:A.tex(cv, true), roughness:0.95 }));
    sheet.position.y = 0.015; sheet.receiveShadow = true; sheet.castShadow = true;
    S.group.add(sheet);
    // a kraft sign at the start of the route. on the lengths sheet it stands behind the line, so the hiker waiting at the
    // start is in front of it (Sam, 18 Oct: "make sure the character is not hidden with the pick your length")
    cut(S, { x:-S.SW*0.5 + (def.flip ? 1.0 : 0.9), z:def.flip ? ZR - 0.8 : ZR + 0.85, w:1.55, h:1.05, col:'#B48A5C', shape:SH.sign, at:-0.2, seed:70 + i,
      paint:(x, W, H) => { x.fillStyle = '#8E6A43'; x.fillRect(W*0.16, H*0.44, W*0.06, H*0.56); x.fillStyle = INK; x.font = font('display', Math.round(H*0.2)); x.textAlign = 'left';
        x.fillText(String(n).padStart(2, '0'), W*0.05, H*0.3); x.font = font('label', Math.round(H*0.072)); x.fillText(def.kick.toUpperCase().slice(0, 22), W*0.3, H*0.27); } });
    if(STOPS[def.id]) STOPS[def.id](S);
    S.maxH = Math.max(1.4, ...S.props.map(p => p.h));
    return S;
  });

  /* ---- the hiker's place on a station, in world space ---- */
  function at(S, u, out){
    if(S.orb) return orbHiker(S, out);
    const x = routeX(S, clamp01(u)), z = S.route(clamp01(u));
    return out.set(S.center.x + x, 0.04, S.center.z + z);
  }
  // where a floating card points: the top of its cut-out (or a spot the station names)
  function anchor(S, k, out){
    if(S.orb){ const P = S.props.find(p => p.card === k); if(!P) return null; P.g.updateWorldMatrix(true, false); return out.set(0, P.h + 0.15, 0).applyMatrix4(P.g.matrixWorld); }
    if(S.cardAt && S.cardAt[k]){ const c = S.cardAt[k]; return out.set(S.center.x + c.x, c.y, S.center.z + c.z); }
    const P = S.props.find(p => p.card === k);
    if(!P) return null;
    return out.set(S.center.x + P.x, P.h + 0.12, S.center.z + P.z);
  }
  function cardShowAt(S, k){
    if(S.flip && S.sceneAt) return S.sceneAt[k] !== undefined ? S.sceneAt[k] : 2;
    if(S.cardAt && S.cardAt[k]) return S.cardAt[k].at;
    const P = S.props.find(p => p.card === k); return P ? P.at : 2;
  }
  // the camera: the same high three-quarter view as the walk, aimed at the middle of what stands on the sheet and
  // pulled back until it all fits a box of half-width bx and half-height by around the middle of the view. the page then
  // slides the picture to the station's place on screen with a view offset
  const _fit = new THREE.PerspectiveCamera(34, 1, 0.5, 400), _v = new THREE.Vector3(), _d = new THREE.Vector3();
  function pose(S, aspect, half, out){
    const box = [-half[0], half[0], -half[1], half[1]];
    const el = 27*Math.PI/180, yaw = -10*Math.PI/180;
    _d.set(Math.sin(yaw)*Math.cos(el), Math.sin(el), Math.cos(yaw)*Math.cos(el));
    const tgt = out.tgt.copy(S.center); tgt.y += S.maxH*0.32; tgt.z -= 0.2;
    _fit.fov = out.fov; _fit.aspect = aspect; _fit.updateProjectionMatrix();
    const pts = [];
    for(const sx of [-1, 1]) for(const sz of [-1, 1]) pts.push([S.center.x + sx*S.SW*0.5, 0, S.center.z + sz*SD*0.5]);
    for(const sx of [-1, 0, 1]) pts.push([S.center.x + sx*S.SW*0.42, S.maxH + 0.1, S.center.z - 1.6]);
    let lo = 4, hi = 80;
    for(let it = 0; it < 22; it++){
      const D = (lo + hi)*0.5;
      _fit.position.copy(tgt).addScaledVector(_d, D); _fit.lookAt(tgt); _fit.updateMatrixWorld();
      let ok = true;
      for(const p of pts){ _v.set(p[0], p[1], p[2]).project(_fit); if(_v.x < box[0] || _v.x > box[1] || _v.y < box[2] || _v.y > box[3]){ ok = false; break; } }
      if(ok) hi = D; else lo = D;
    }
    out.pos.copy(tgt).addScaledVector(_d, hi);
    return out;
  }
  // the middle of each scene along the sheet, and a pose that frames scene k alone: its pieces, standing, and the
  // stretch of route in front of them, a little lower and closer than the whole-sheet view
  function sceneX(S, k){ const ps = S.props.filter(p => p.scene === k); return ps.length ? ps.reduce((a, p) => a + p.x, 0)/ps.length : 0; }
  function posePart(S, k, aspect, half, out){
    const box = [-half[0], half[0], -half[1], half[1]];
    const el = 20*Math.PI/180, yaw = -9*Math.PI/180;
    _d.set(Math.sin(yaw)*Math.cos(el), Math.sin(el), Math.cos(yaw)*Math.cos(el));
    const ps = S.props.filter(p => p.scene === k);
    let x0 = 1e9, x1 = -1e9, top = 0;
    const pts = [];
    for(const p of ps){
      const hw = (p.w || 0.5)*0.5, ht = (p.y0 || 0) + (p.h || 0.1);
      x0 = Math.min(x0, p.x - hw); x1 = Math.max(x1, p.x + hw); top = Math.max(top, ht);
      pts.push([p.x - hw, 0, p.z], [p.x + hw, 0, p.z], [p.x - hw, ht, p.z], [p.x + hw, ht, p.z]);
    }
    pts.push([x0 - 0.4, 0, ZR + 0.7], [x1 + 0.4, 0, ZR + 0.7]);
    const tgt = out.tgt.set(S.center.x + (x0 + x1)*0.5, top*0.42, S.center.z - 0.6);
    _fit.fov = out.fov; _fit.aspect = aspect; _fit.updateProjectionMatrix();
    let lo = 3, hi = 60;
    for(let it = 0; it < 22; it++){
      const D = (lo + hi)*0.5;
      _fit.position.copy(tgt).addScaledVector(_d, D); _fit.lookAt(tgt); _fit.updateMatrixWorld();
      let ok = true;
      for(const p of pts){ _v.set(S.center.x + p[0], p[1], S.center.z + p[2]).project(_fit); if(_v.x < box[0] || _v.x > box[1] || _v.y < box[2] || _v.y > box[3]){ ok = false; break; } }
      if(ok) hi = D; else lo = D;
    }
    out.pos.copy(tgt).addScaledVector(_d, hi);
    return out;
  }
  // the route's u for a point along the sheet (the walker is placed by where he is along the sheet)
  const uOfX = (S, x) => clamp01((x - (-S.SW*0.5 + 0.25))/((S.SW*0.5 - 0.35) - (-S.SW*0.5 + 0.25)));

  // light a station with its own lamp (k 0 puts that lamp out)
  function light(S, k){
    const L = LAMPS[S.i % 2];
    if(k <= 0.001){ L.lamp.intensity = 0; L.fill.intensity = 0; L.lamp.shadow.autoUpdate = false; return; }
    L.lamp.position.set(S.center.x - 6.5, 13.5, S.center.z + 7.5);
    L.lamp.target.position.copy(S.center); L.lamp.target.position.z -= 0.6; L.lamp.target.updateMatrixWorld();
    L.lamp.intensity = 900*k;
    L.lamp.shadow.autoUpdate = true;
    L.fill.position.set(S.center.x - 2, 8, S.center.z + 12);
    L.fill.intensity = 26*k;
  }
  // the cut-outs: up as the station forms (its box coming into view), one after another in the order they were cut,
  // down again if the page goes back up
  function spring(S, form, dt, reduced, on, u){
    const h = Math.min(0.034, dt || 0.016), n = Math.max(1, S.props.length - 1);
    // in a flipping station each scene's pieces go up one after another, back to front, a beat apart
    const order = {};
    for(const q of S.props){
      let want = on && form > 0.05 + 0.8*q.k/n;
      if(S.focus && q.scene !== undefined){ const r = order[q.scene] = (order[q.scene] || 0) + 1; want = on && (u || 0) > q.scene - 0.42 + (r - 1)*0.03; }
      else if(S.flip && q.scene !== undefined){ const r = order[q.scene] = (order[q.scene] || 0) + 1; want = on && (u || 0) > S.sceneAt[q.scene] + (r - 1)*0.012; }
      if(q.flat){
        const s = want ? 1 : 0.001;
        q.m.scale.setScalar(reduced ? s : lerp(q.m.scale.x, s, 1 - Math.exp(-h*7)));
        q.m.visible = q.m.scale.x > 0.01;
        continue;
      }
      const target = want ? 0 : -HALF_PI;
      if(reduced){ q.sp.p = target; q.sp.v = 0; }
      else { q.sp.v += ((target - q.sp.p)*(want ? 120 : 70) - q.sp.v*(want ? 9 : 12))*h; q.sp.p += q.sp.v*h; }
      q.g.rotation.x = q.sp.p;
      q.g.visible = want || Math.abs(q.sp.p + HALF_PI) > 0.012;
    }
    if(S.ribbons) for(const R of S.ribbons){
      const want = on && form > 0.3 + R.at*0.6;
      const s = want ? R.len : 0.001;
      R.m.scale.x = reduced ? s : lerp(R.m.scale.x, s, 1 - Math.exp(-h*6));
      R.m.visible = R.m.scale.x > 0.01;
    }
  }
  return { stations, at, anchor, cardShowAt, pose, posePart, poseOrb, orbFrame, orbPin, ORB_HA, RG, sceneX, uOfX, light, spring, LAMPS, SW, SD };
}

window.STATIONS = { build };
})();
