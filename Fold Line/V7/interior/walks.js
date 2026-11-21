/* ============================================================
   FOLD LINE . V7 . the four walks after Tongariro (18 Oct 2026)
   Sam: "build the four remaining maps ... a similar structure from the first one but adapted, because some have more
   crossing, longer, but try to keep five sections to each". The engine is interior/interior.js; each trek here brings
   what makes it itself: the captions (every line from the research in hero/treks-data.js, the beats, facts and kit), the
   pop-up scenery for each of its five stretches, and the cut shapes it needs that Tongariro did not.
   Scenery is vibe, not survey, the same rule as Tongariro: the map underneath carries the numbers.
   Classic script. Exposes window.FOLD_WALKS.
   ============================================================ */
(function(){
'use strict';
const HALF_PI = Math.PI/2;

/* ---- cut shapes. white on black, detail cut out of the card, never drawn on it ---- */
const cut = (c, fn) => { c.save(); c.globalCompositeOperation = 'destination-out'; fn(); c.restore(); };
const keepTop = (c, W, H, f) => { c.save(); c.globalCompositeOperation = 'destination-in'; c.fillRect(0, 0, W, H*f); c.restore(); };
const SH = {
  // Inca terraces: a hillside cut into steps, the slits between them cut out
  terraces(c, W, H){
    const n = 7;
    for(let k = 0; k < n; k++){ const y = H*(1 - (k + 1)/n*0.96), hw = W*0.5*(1 - k/n*0.72), cx = W*(0.5 + (k % 2 ? 0.015 : -0.015)); c.fillRect(cx - hw, y, hw*2, H - y); }
    cut(c, () => { c.lineWidth = Math.max(1, H*0.012); for(let k = 1; k < n; k++){ const y = H*(1 - k/n*0.96); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } });
  },
  // stone walls of a ruin with its trapezoid niches, the Inca shape
  ruin(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.38); c.lineTo(W*0.22, H*0.38); c.lineTo(W*0.22, H*0.2); c.lineTo(W*0.62, H*0.2); c.lineTo(W*0.62, H*0.32); c.lineTo(W, H*0.32); c.lineTo(W, H); c.closePath(); c.fill();
    cut(c, () => { for(const x0 of [0.08, 0.3, 0.45, 0.74]){ const w0 = W*0.09, y0 = H*(x0 > 0.2 && x0 < 0.6 ? 0.42 : 0.55), h0 = H*0.26; c.beginPath(); c.moveTo(W*x0, y0 + h0); c.lineTo(W*x0 + w0*0.15, y0); c.lineTo(W*x0 + w0*0.85, y0); c.lineTo(W*x0 + w0, y0 + h0); c.closePath(); c.fill(); } });
  },
  // Inti Punku: the stone gateway, its door a trapezoid
  gate(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.04, H*0.3); c.lineTo(W*0.18, H*0.12); c.lineTo(W*0.82, H*0.08); c.lineTo(W*0.96, H*0.26); c.lineTo(W, H); c.closePath(); c.fill();
    cut(c, () => { c.beginPath(); c.moveTo(W*0.36, H); c.lineTo(W*0.41, H*0.3); c.lineTo(W*0.59, H*0.3); c.lineTo(W*0.64, H); c.closePath(); c.fill(); });
  },
  // Huayna Picchu: the sugarloaf behind the citadel
  spire(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.bezierCurveTo(W*0.28, H*0.9, W*0.38, H*0.22, W*0.52, H*0.02); c.bezierCurveTo(W*0.62, H*0.18, W*0.66, H*0.52, W*0.78, H*0.6); c.quadraticCurveTo(W*0.9, H*0.7, W, H); c.closePath(); c.fill();
  },
  tent(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.5, 0); c.lineTo(W, H); c.closePath(); c.fill();
    cut(c, () => { c.beginPath(); c.moveTo(W*0.42, H); c.lineTo(W*0.5, H*0.42); c.lineTo(W*0.58, H); c.closePath(); c.fill(); });
  },
  // a rounded crown for the cloud forest, its lit side a second layer
  cloudtree(c, W, H, r){
    c.fillRect(W*0.46, H*0.55, W*0.08, H*0.45);
    for(const p of [[0.5, 0.3, 0.3], [0.3, 0.42, 0.22], [0.7, 0.4, 0.24], [0.5, 0.12, 0.18]]){ c.beginPath(); c.arc(W*(p[0] + (r() - 0.5)*0.04), H*p[1], W*p[2], 0, 6.2832); c.fill(); }
  },
  // the Torres: three granite towers on their shoulder
  towers(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.08, H*0.62); c.lineTo(W*0.2, H*0.55); c.lineTo(W*0.8, H*0.5); c.lineTo(W*0.92, H*0.6); c.lineTo(W, H); c.closePath(); c.fill();
    for(const [x, top, w] of [[0.3, 0.08, 0.11], [0.48, 0.0, 0.12], [0.66, 0.05, 0.11]]){
      c.beginPath(); c.moveTo(W*(x - w*0.5), H*0.6); c.lineTo(W*(x - w*0.42), H*(top + 0.1)); c.quadraticCurveTo(W*x, H*(top - 0.02), W*(x + w*0.42), H*(top + 0.08)); c.lineTo(W*(x + w*0.5), H*0.6); c.closePath(); c.fill();
    }
    cut(c, () => { c.lineWidth = W*0.004; for(const x of [0.27, 0.33, 0.45, 0.51, 0.63, 0.69]){ c.beginPath(); c.moveTo(W*x, H*0.2); c.lineTo(W*(x + 0.004), H*0.5); c.stroke(); } });
  },
  // Los Cuernos: pale granite under dark horns. the same outline for both layers
  cuernos(c, W, H){ cuernosPath(c, W, H); },
  cuernosCap(c, W, H){ cuernosPath(c, W, H); keepTop(c, W, H, 0.42); },
  // a glacier's front: a wall of ice, jagged on top, split by crevasses
  glacier(c, W, H, r){
    c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.3);
    for(let q = 1; q <= 24; q++) c.lineTo(W*q/24, H*(0.08 + r()*0.24 + (q % 2)*0.06));
    c.lineTo(W, H); c.closePath(); c.fill();
    cut(c, () => { c.lineWidth = W*0.006; for(let q = 0; q < 9; q++){ const x = W*(0.06 + q*0.11 + r()*0.03); c.beginPath(); c.moveTo(x, H*0.35); c.lineTo(x + W*0.01, H*0.98); c.stroke(); } });
  },
  iceberg(c, W, H, r){ c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.12, H*0.4); c.lineTo(W*(0.35 + r()*0.1), H*0.08); c.lineTo(W*0.62, H*0.3); c.lineTo(W*0.8, H*0.22); c.lineTo(W, H); c.closePath(); c.fill(); },
  // a lenga, a southern beech, its crown blown flat by the wind
  lenga(c, W, H){
    c.beginPath(); c.moveTo(W*0.42, H); c.quadraticCurveTo(W*0.4, H*0.6, W*0.3, H*0.4); c.lineTo(W*0.36, H*0.38); c.quadraticCurveTo(W*0.5, H*0.62, W*0.52, H); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(W*0.12, H*0.45); c.quadraticCurveTo(W*0.2, H*0.12, W*0.5, H*0.18); c.quadraticCurveTo(W*0.9, H*0.2, W*0.98, H*0.34); c.quadraticCurveTo(W*0.6, H*0.4, W*0.4, H*0.52); c.quadraticCurveTo(W*0.2, H*0.56, W*0.12, H*0.45); c.fill();
  },
  guanaco(c, W, H){
    c.beginPath(); c.ellipse(W*0.45, H*0.52, W*0.3, H*0.13, 0, 0, 6.2832); c.fill();
    c.beginPath(); c.moveTo(W*0.68, H*0.5); c.lineTo(W*0.74, H*0.1); c.lineTo(W*0.86, H*0.08); c.lineTo(W*0.88, H*0.14); c.lineTo(W*0.79, H*0.16); c.lineTo(W*0.76, H*0.5); c.closePath(); c.fill();
    for(const x of [0.22, 0.3, 0.58, 0.66]) c.fillRect(W*x, H*0.55, W*0.04, H*0.45);
  },
  // Kibo: Kilimanjaro's broad summit cone, its ice a separate cut along the top
  kibo(c, W, H){ kiboPath(c, W, H); },
  kiboIce(c, W, H, r){
    kiboPath(c, W, H); keepTop(c, W, H, 0.3);
    cut(c, () => { for(let q = 0; q < 10; q++){ const x = W*(0.2 + q*0.065), y = H*(0.2 + r()*0.06); c.beginPath(); c.moveTo(x, H*0.31); c.lineTo(x + W*0.02, y); c.lineTo(x + W*0.04, H*0.31); c.closePath(); c.fill(); } });
  },
  lavatower(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.12, H*0.55); c.lineTo(W*0.22, H*0.5); c.lineTo(W*0.3, H*0.08); c.lineTo(W*0.62, H*0.02); c.lineTo(W*0.72, H*0.3); c.lineTo(W*0.86, H*0.36); c.lineTo(W, H); c.closePath(); c.fill();
  },
  // giant groundsels, Kilimanjaro's tree-sized daisies: thick stems, rosettes of leaves on top
  groundsel(c, W, H, r){
    const st = [[0.35, 0.3], [0.55, 0.12], [0.72, 0.38]];
    for(const [x, top] of st){
      c.fillRect(W*(x - 0.035), H*top, W*0.07, H*(1 - top));
      for(let q = 0; q < 11; q++){ const a = -Math.PI*(0.05 + 0.9*q/10), L = W*(0.1 + r()*0.03); c.save(); c.translate(W*x, H*top); c.rotate(a); c.beginPath(); c.ellipse(L*0.55, 0, L*0.55, W*0.018, 0, 0, 6.2832); c.fill(); c.restore(); }
    }
  },
  heather(c, W, H, r){ c.beginPath(); c.moveTo(0, H); for(let q = 0; q <= 16; q++) c.lineTo(W*q/16, H*(0.25 + r()*0.25 + (q % 2)*0.12)); c.lineTo(W, H); c.closePath(); c.fill(); },
  // a stupa: whitewashed dome, the gilded spire of thirteen rings, a parasol on top
  stupa(c, W, H){
    c.fillRect(W*0.1, H*0.84, W*0.8, H*0.16); c.fillRect(W*0.18, H*0.74, W*0.64, H*0.12);
    c.beginPath(); c.ellipse(W*0.5, H*0.74, W*0.28, H*0.2, 0, Math.PI, 0); c.fill();
    c.fillRect(W*0.38, H*0.46, W*0.24, H*0.1);
    c.beginPath(); c.moveTo(W*0.4, H*0.46); c.lineTo(W*0.46, H*0.14); c.lineTo(W*0.54, H*0.14); c.lineTo(W*0.6, H*0.46); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(W*0.5, H*0.13, W*0.12, H*0.03, 0, 0, 6.2832); c.fill(); c.fillRect(W*0.49, 0, W*0.02, H*0.13);
    cut(c, () => { c.lineWidth = H*0.006; for(let q = 1; q < 9; q++){ const y = H*(0.46 - q*0.035); c.beginPath(); c.moveTo(W*0.38, y); c.lineTo(W*0.62, y); c.stroke(); } });
  },
  // prayer flags on a line between two poles
  flags(c, W, H){
    c.fillRect(0, 0, W*0.025, H); c.fillRect(W*0.975, H*0.15, W*0.025, H*0.85);
    c.lineWidth = H*0.025; c.beginPath(); c.moveTo(W*0.01, H*0.04); c.quadraticCurveTo(W*0.5, H*0.42, W*0.99, H*0.18); c.stroke();
    for(let q = 0; q < 11; q++){ const u = (q + 0.5)/11, x = W*(0.04 + u*0.92), y = H*(0.04 + 0.38*4*u*(1 - u)*0.9 + (0.18 - 0.04)*u); c.fillRect(x - W*0.03, y, W*0.06, H*0.24); }
  },
  // a suspension bridge: towers, the sagging cable, the deck and its hangers, flags along the top
  suspbridge(c, W, H){
    c.fillRect(0, H*0.1, W*0.03, H*0.9); c.fillRect(W*0.97, H*0.1, W*0.03, H*0.9);
    c.lineWidth = H*0.03; c.beginPath(); c.moveTo(W*0.015, H*0.12); c.quadraticCurveTo(W*0.5, H*0.95, W*0.985, H*0.12); c.stroke();
    c.lineWidth = H*0.05; c.beginPath(); c.moveTo(W*0.015, H*0.72); c.quadraticCurveTo(W*0.5, H*1.02, W*0.985, H*0.72); c.stroke();
    c.lineWidth = H*0.012; for(let q = 1; q < 18; q++){ const u = q/18, x = W*(0.015 + u*0.97), y0 = H*(0.12 + 0.83*4*u*(1 - u)*0.5*1.7*0.6), y1 = H*(0.72 + 0.3*4*u*(1 - u)*0.5); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
  },
  // a Sherpa teahouse: stone walls, a low roof, windows cut out
  teahouse(c, W, H){
    c.fillRect(W*0.05, H*0.4, W*0.9, H*0.6);
    c.beginPath(); c.moveTo(0, H*0.44); c.lineTo(W*0.12, H*0.2); c.lineTo(W*0.88, H*0.2); c.lineTo(W, H*0.44); c.closePath(); c.fill();
    cut(c, () => { for(const x of [0.16, 0.36, 0.56, 0.76]) c.fillRect(W*x, H*0.55, W*0.1, H*0.16); c.fillRect(W*0.46, H*0.72, W*0.1, H*0.28); });
  },
  teaRoof(c, W, H){ c.beginPath(); c.moveTo(0, H*0.44); c.lineTo(W*0.12, H*0.2); c.lineTo(W*0.88, H*0.2); c.lineTo(W, H*0.44); c.closePath(); c.fill(); },
  yak(c, W, H){
    c.beginPath(); c.moveTo(W*0.12, H*0.42); c.quadraticCurveTo(W*0.4, H*0.18, W*0.72, H*0.3); c.lineTo(W*0.86, H*0.32); c.lineTo(W*0.92, H*0.5); c.lineTo(W*0.8, H*0.56); c.lineTo(W*0.72, H*0.72); c.lineTo(W*0.18, H*0.72); c.quadraticCurveTo(W*0.06, H*0.6, W*0.12, H*0.42); c.fill();
    for(const x of [0.2, 0.3, 0.6, 0.68]) c.fillRect(W*x, H*0.66, W*0.05, H*0.34);
    c.lineWidth = H*0.04; c.beginPath(); c.moveTo(W*0.84, H*0.32); c.quadraticCurveTo(W*0.8, H*0.12, W*0.9, H*0.1); c.stroke();
    c.fillRect(W*0.1, H*0.55, W*0.62, H*0.08);
  },
  mani(c, W, H){ c.beginPath(); c.moveTo(0, H); c.quadraticCurveTo(0, H*0.25, W*0.08, H*0.25); c.lineTo(W*0.92, H*0.25); c.quadraticCurveTo(W, H*0.25, W, H); c.closePath(); c.fill(); },
  // Ama Dablam: the mother's necklace, a horned summit with its two arms
  amadablam(c, W, H){
    c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.18, H*0.62); c.lineTo(W*0.3, H*0.58); c.lineTo(W*0.42, H*0.22); c.lineTo(W*0.5, H*0.0); c.lineTo(W*0.56, H*0.16); c.lineTo(W*0.6, H*0.14); c.lineTo(W*0.68, H*0.5); c.lineTo(W*0.82, H*0.56); c.lineTo(W, H); c.closePath(); c.fill();
  },
  amaSnow(c, W, H){
    c.beginPath(); c.moveTo(W*0.36, H*0.4); c.lineTo(W*0.42, H*0.22); c.lineTo(W*0.5, H*0.0); c.lineTo(W*0.56, H*0.16); c.lineTo(W*0.6, H*0.14); c.lineTo(W*0.64, H*0.36); c.lineTo(W*0.56, H*0.3); c.lineTo(W*0.5, H*0.4); c.lineTo(W*0.44, H*0.32); c.closePath(); c.fill();
  }
};
function cuernosPath(c, W, H){
  c.beginPath(); c.moveTo(0, H); c.lineTo(W*0.06, H*0.55); c.lineTo(W*0.16, H*0.42);
  const P = [[0.22, 0.12], [0.28, 0.2], [0.34, 0.08], [0.42, 0.24], [0.5, 0.1], [0.58, 0.16], [0.64, 0.04], [0.72, 0.22], [0.8, 0.3], [0.9, 0.46]];
  for(const [x, y] of P) c.lineTo(W*x, H*y);
  c.lineTo(W, H*0.6); c.lineTo(W, H); c.closePath(); c.fill();
}
function kiboPath(c, W, H){
  c.beginPath(); c.moveTo(0, H); c.bezierCurveTo(W*0.12, H*0.82, W*0.22, H*0.36, W*0.32, H*0.16); c.lineTo(W*0.38, H*0.1); c.lineTo(W*0.66, H*0.08); c.lineTo(W*0.72, H*0.14); c.bezierCurveTo(W*0.8, H*0.34, W*0.9, H*0.8, W, H); c.closePath(); c.fill();
}

/* ---- the colours. one paper per trek, in the house's tones ---- */
const COL = {
  inca:{ far:'#9AAEA3', mid:'#6F8F73', ridge:'#5D7C62', terr:'#7FA06C', terrHi:'#A6C08A', stone:'#B7AB95', stoneHi:'#D7CDB9', spire:'#4D6A56', spireHi:'#6C8C72', tree:'#4E7A58', treeHi:'#77A06E', tent:'#D7703E', river:'#7EA6C1', cloud:'#F5F2EA' },
  torres:{ far:'#AAB6C1', massif:'#8E949C', granite:'#CFC8BC', granDk:'#4F4945', ice:'#D9EAF2', iceHi:'#F4FAFC', lake:'#5FA6B9', lakeHi:'#7FC0CF', lenga:'#5D7A4D', lengaHi:'#7E9B66', grass:'#C8B27A', grassHi:'#E0CB94', guanaco:'#B07A4A', hut:'#E9E1D2', roof:'#8E5A42', cloud:'#F5F2EA' },
  kili:{ far:'#8F99A6', forest:'#3F6A49', forestHi:'#5F8C5E', moor:'#A69C70', moorHi:'#C2B88A', rock:'#7C7067', rockHi:'#A1958A', kibo:'#6C676D', kiboHi:'#87828A', ice:'#EEF3F6', groundsel:'#5B7A4C', groundselHi:'#7F9C66', tent:'#D9A441', tentHi:'#EBC36A', cloud:'#F5F2EA', dust:'#C4AB88' },
  everest:{ far:'#A1ADBD', range:'#7F8794', rangeHi:'#9BA3AF', snow:'#F2F4F7', pine:'#4D6D57', pineHi:'#6E8F72', stupa:'#F1EEE8', gold:'#D2A23A', house:'#E3DACB', roof:'#5B8FC4', yak:'#3A332E', mani:'#9E978C', moraine:'#A49C90', moraineHi:'#C2BAAE', cloud:'#F5F2EA', bridge:'#8C7B66' }
};
const FLAGS = ['#5B8FC4', '#F1EBDF', '#D63B2F', '#5E8C61', '#D2A23A'];
const flagPaint = (c, W, H) => { for(let q = 0; q < 11; q++){ const u = (q + 0.5)/11, x = W*(0.04 + u*0.92), y = H*(0.04 + 0.38*4*u*(1 - u)*0.9 + 0.14*u); c.fillStyle = FLAGS[q % 5]; c.fillRect(x - W*0.03, y, W*0.06, H*0.24); } };
const stupaPaint = (c, W, H) => { c.fillStyle = '#D2A23A'; c.fillRect(0, 0, W, H*0.47); c.fillStyle = '#2E3F6B'; for(const x of [0.43, 0.53]){ c.beginPath(); c.ellipse(W*x, H*0.51, W*0.025, H*0.012, 0, 0, 6.2832); c.fill(); } };

/* ---- the common moves of a stretch: a backdrop of ranges, a scatter of pieces along the route, clouds ---- */
function scatter(K, km0, km1, n, kind, o, side){
  K.along(km0, km1, n, (km, q) => {
    const at = K.onRoute(km, (K.r() < 0.5 ? -1 : 1)*(side || (0.45 + K.r()*1.05))); if(!K.ok(at)) return;
    const sc = (o.sc || 1)*(0.78 + K.r()*0.45);
    K.prop(kind, at, Object.assign({ v:q % 3, trig:'near', lead:1.5, yaw:(K.r() - 0.5)*0.4, flip:K.r() < 0.5, px:160 }, o, { w:o.w*sc, h:o.h*sc }));
  });
}
const place = (K, km, side) => { const a = K.onRoute(km, side || 0); return K.ok(a) ? a : null; };
const sky = (K, x, w, h, col, snow, seed) => { if(!K.sky) return false; K.backdrop(K.i, 'sky', x, -1.95, w, h, col, seed); if(snow) K.backdrop(K.i, 'skySnow', x, -1.9, w, h, snow, seed); return true; };

/* ============================================================ the Inca Trail ============================================================ */
const inca = {
  shapes:SH,
  captions({ t, wp, row, b, f }){
    const a = wp('KM 82'), wy = wp('Wayllabamba'), ay = wp('Ayapata'), dw = wp("Dead Woman"), pc = wp('Pacaymayo'), ru = wp('Runkurakay'), sa = wp('Sayacmarca'), ch = wp('Chaquicocha'), ph = wp('Phuyupatamarca'), wi = wp('Wiñay'), ip = wp('Inti Punku'), mp = wp('Machu Picchu');
    const k = (n) => (t.kit || []).find(q => q.item.toLowerCase().indexOf(n) >= 0);
    return [
      { km:0, km0:a.km, kick:'The valley', title:['Along the', 'Urubamba'], line:k('passport').why, data:row(a, wy) },
      { km:13.4, km0:wy.km, kick:'The climb', title:["Dead Woman's", 'Pass'], line:b[0].line, data:row(ay, dw) + '<b><span>High point</span>of the trail</b>' },
      { km:21.4, km0:pc.km, kick:'The ruins', title:['Runkurakay to', 'Sayacmarca'], line:k('poles').why, data:row(ru, sa) },
      { km:27.8, km0:ch.km, kick:'The cloud forest', title:['Into the', 'cloud forest'], line:k('rain').why, data:row(ph, wi) },
      { km:33.8, km0:wi.km, kick:'The last camp', title:['Wiñay', 'Wayna'], line:b[1].line, data:row(wi) },
      { km:37.6, km0:ip.km, kick:'The top', title:['The Sun', 'Gate'], line:b[2].line, data:row(ip, mp) + '<b><span>End</span>' + t.end.name + '</b>' }
    ];
  },
  scenery(i, K){
    const C = COL.inca, cl = (n) => K.clouds(n);
    if(i === 0){
      // the Urubamba valley: green walls, the river along the track, the first terraces
      K.backdrop(0, 'massif', 0.4, -1.95, 6.6, 1.5, C.far, 101);
      K.backdrop(0, 'snowcap', 1.6, -1.9, 2.6, 1.0, '#F2F4F6', 101);
      K.backdrop(0, 'ridge', -1.2, -1.4, 4.2, 1.05, C.mid, 102);
      K.ribbon('stream', 0.6, 12.6, 1.15, 0.22, C.river, { gloss:K.ST.gloss });
      const te = place(K, 6.5, -1.1); if(te) K.prop('terraces', te, { w:1.5, h:0.8, col:C.terr, trig:'F', delay:0.15, px:260, layers:[{ kind:'terraces', col:C.terrHi, sx:0.86, sy:0.8, dz:0.012 }] });
      const ru = place(K, 9.5, -0.9); if(ru) K.prop('ruin', ru, { w:0.9, h:0.42, col:C.stone, trig:'near', lead:1.6, px:220, layers:[{ kind:'ruin', col:C.stoneHi, sx:0.94, sy:0.9, dz:0.01 }] });
      scatter(K, 0.5, 12.8, 10, 'cloudtree', { w:0.5, h:0.62, col:C.tree, layers:[{ kind:'cloudtree', col:C.treeHi, sx:0.8, sy:0.8, dz:0.012 }] });
      K.tuss(0.4, 12.8, 8); cl(2);
      const tn = K.at('Wayllabamba', -0.6); if(tn) K.prop('tent', tn, { w:0.42, h:0.3, col:C.tent, trig:'near', lead:1.4, px:140 });
    }
    if(i === 1){
      // the climb: the valley narrows to puna grass and the pass at its head
      K.backdrop(1, 'jagged', 0.6, -1.95, 6.4, 1.6, C.far, 111);
      K.backdrop(1, 'ridge', -0.4, -1.45, 5.0, 1.2, C.ridge, 112);
      K.backdrop(1, 'hill', 2.2, -0.95, 2.8, 1.1, C.mid, 113);
      scatter(K, 13.6, 17.2, 6, 'cloudtree', { w:0.48, h:0.6, col:C.tree, layers:[{ kind:'cloudtree', col:C.treeHi, sx:0.8, sy:0.8, dz:0.012 }] });
      K.tuss(16.5, 21.0, 14); K.rocks(17.0, 21.0, 6);
      const st = place(K, 19.6, -0.7); if(st) K.prop('stairs', st, { w:1.1, h:0.75, col:C.stone, trig:'near', lead:2.0, px:260, rim:0.8, blur:0.7, layers:[{ kind:'treads', col:C.stoneHi, dz:0.008, blur:0.6 }] });
      const tn = K.at('Llulluchapampa', -0.7); if(tn){ K.prop('tent', tn, { w:0.42, h:0.3, col:C.tent, trig:'near', lead:1.4, px:140 }); K.prop('tent', { ...tn, lx:tn.lx + 0.5, z:tn.z - 0.2 }, { v:1, w:0.36, h:0.26, col:'#E9B04A', trig:'near', lead:1.4, px:140 }); }
      cl(2);
    }
    if(i === 2){
      // the ruins on the ridge: Runkurakay's round walls, Sayacmarca on its spur
      K.backdrop(2, 'massif', -0.6, -1.95, 6.6, 1.3, C.far, 121);
      K.backdrop(2, 'snowcap', -0.2, -1.9, 2.4, 0.95, '#F2F4F6', 121);
      K.backdrop(2, 'ridge', 1.2, -1.45, 4.4, 0.95, C.ridge, 122);
      const r1 = K.at('Runkurakay', -0.65); if(r1) K.prop('ruin', r1, { w:0.85, h:0.4, col:C.stone, trig:'F', delay:0.2, px:220, layers:[{ kind:'ruin', col:C.stoneHi, sx:0.94, sy:0.9, dz:0.01 }] });
      const r2 = K.at('Sayacmarca', -0.7); if(r2){ K.prop('terraces', { ...r2, lx:r2.lx - 0.4 }, { w:1.2, h:0.7, col:C.terr, trig:'F', delay:0.25, px:240, layers:[{ kind:'terraces', col:C.terrHi, sx:0.86, sy:0.8, dz:0.012 }] }); K.prop('ruin', { ...r2, lx:r2.lx + 0.3, z:r2.z + 0.1 }, { v:1, w:1.0, h:0.45, col:C.stone, trig:'F', delay:0.3, px:220, layers:[{ kind:'ruin', col:C.stoneHi, sx:0.94, sy:0.9, dz:0.01 }] }); }
      K.tuss(21.2, 27.6, 10); K.rocks(21.2, 27.6, 6); cl(2);
    }
    if(i === 3){
      // down into the cloud forest: Phuyupatamarca's terraces, then crowns all round, mist
      K.backdrop(3, 'treeline', 0.0, -1.95, 6.6, 1.4, C.tree, 131);
      K.backdrop(3, 'treeline', -0.5, -1.35, 5.8, 1.0, C.treeHi, 132);
      const ph = K.at('Phuyupatamarca', -0.75); if(ph) K.prop('terraces', ph, { w:1.4, h:0.8, col:C.terr, trig:'F', delay:0.15, px:260, layers:[{ kind:'terraces', col:C.terrHi, sx:0.86, sy:0.8, dz:0.012 }] });
      scatter(K, 29.5, 36.0, 18, 'cloudtree', { w:0.55, h:0.68, col:C.tree, layers:[{ kind:'cloudtree', col:C.treeHi, sx:0.8, sy:0.8, dz:0.012 }] });
      const wi = K.at('Wiñay', -0.7); if(wi){ K.prop('terraces', wi, { v:2, w:1.6, h:0.85, col:C.terr, trig:'near', lead:2, px:260, layers:[{ kind:'terraces', col:C.terrHi, sx:0.86, sy:0.8, dz:0.012 }] }); K.prop('tent', { ...wi, lx:wi.lx + 0.9, z:wi.z + 0.3 }, { w:0.42, h:0.3, col:C.tent, trig:'near', lead:1.5, px:140 }); }
      cl(3);
    }
    if(i === 4){
      // the Sun Gate, and Machu Picchu below it under Huayna Picchu: the real skyline from the gate behind
      if(!sky(K, 0.2, 6.8, 1.9, C.far, null, 141)) K.backdrop(4, 'massif', 0.2, -1.95, 6.6, 1.5, C.far, 141);
      K.backdrop(4, 'spire', 1.7, -1.4, 1.6, 1.9, C.spire, 142);
      K.backdrop(4, 'spire', 2.6, -1.3, 1.1, 1.3, C.spireHi, 143);
      const ip = K.at('Inti Punku', -0.55); if(ip) K.prop('gate', ip, { w:0.9, h:0.62, col:C.stone, trig:'F', delay:0.1, px:240, layers:[{ kind:'gate', col:C.stoneHi, sx:0.92, sy:0.92, dz:0.01 }] });
      const mp = K.at('Machu Picchu', -0.8); if(mp){ K.prop('terraces', mp, { w:1.7, h:0.75, col:C.terr, trig:'near', lead:2, px:260, layers:[{ kind:'terraces', col:C.terrHi, sx:0.86, sy:0.8, dz:0.012 }] }); K.prop('ruin', { ...mp, lx:mp.lx - 0.5, z:mp.z + 0.15 }, { v:2, w:1.2, h:0.5, col:C.stoneHi, trig:'end', km:K.t.km - 1.2, px:240 }); }
      scatter(K, 36.6, 40.0, 8, 'cloudtree', { w:0.5, h:0.62, col:C.tree, layers:[{ kind:'cloudtree', col:C.treeHi, sx:0.8, sy:0.8, dz:0.012 }] });
      cl(2);
    }
  }
};

/* ============================================================ the W Trek ============================================================ */
const torres = {
  shapes:SH,
  captions({ t, wp, row, b, f }){
    const pg = wp('Paine Grande'), gr = wp('Refugio Grey'), it = wp('Italiano ranger'), mf = wp('Mirador Francés'), mb = wp('Mirador Británico'), fc = wp('Francés camp'), cu = wp('Refugio Los Cuernos'), pv = wp('Paso de los Vientos'), cl = wp('Refugio Chileno'), bt = wp('Mirador Base Torres'), wc = wp('Welcome Center');
    return [
      { km:0, km0:pg.km, kick:'The lake', title:['Glacier', 'Grey'], line:f[0], data:row(pg, gr) },
      { km:21, km0:it.km, kick:'The valley', title:['Valle del', 'Francés'], line:b[0].line, data:row(it, mf) },
      { km:31.5, km0:mb.km, kick:'The lookout', title:['Mirador', 'Británico'], line:b[0].fact, data:row(mb) },
      { km:39.9, km0:fc.km, kick:'The horns', title:['Los', 'Cuernos'], line:f[1], data:row(fc, cu) },
      { km:50.5, km0:pv.km, kick:'The last bed', title:['Refugio', 'Chileno'], line:b[1].line, data:row(pv, cl) },
      { km:57.4, km0:bt.km, kick:'The top', title:['Base', 'Torres'], line:b[2].line, data:row(bt) + '<b><span>High point</span>of the W</b>' },
      { km:62.5, km0:null, kick:'The way out', title:['Down to', 'Las Torres'], line:t.permits[1], data:row(wp('Refugio Chileno (return)'), wc) + '<b><span>End</span>' + t.end.name.split(',')[0] + '</b>' }
    ];
  },
  scenery(i, K){
    const C = COL.torres, cl = (n) => K.clouds(n);
    const grass = (a, z, n) => K.along(a, z, n, (km, q) => { const at = K.onRoute(km, (K.r() < 0.5 ? -1 : 1)*(0.42 + K.r()*1.0)); if(!K.ok(at)) return; const sc = 0.75 + K.r()*0.5;
      K.prop('tussock', at, { v:q % 3, w:0.42*sc, h:0.3*sc, col:C.grass, trig:'near', lead:1.6, flip:K.r() < 0.5, px:150, layers:[{ kind:'tussockHi', col:C.grassHi, sx:0.85, sy:0.8, dz:0.01 }] }); });
    const lengas = (a, z, n) => scatter(K, a, z, n, 'lenga', { w:0.62, h:0.6, col:C.lenga, layers:[{ kind:'lenga', col:C.lengaHi, sx:0.85, sy:0.85, dz:0.012 }] });
    if(i === 0){
      // Lago Grey and its glacier at the far end, icebergs on the water, the Paine massif's real skyline behind
      if(!sky(K, -0.6, 6.6, 2.0, C.massif, '#F4F6F8', 151)) K.backdrop(0, 'massif', -0.6, -1.95, 6.6, 1.6, C.massif, 151);
      K.backdrop(0, 'glacier', 2.2, -1.4, 2.8, 0.55, C.ice, 152);
      const gl = place(K, 9.6, -1.0); if(gl) K.prop('glacier', gl, { w:1.8, h:0.42, col:C.ice, trig:'F', delay:0.12, px:240, layers:[{ kind:'glacier', col:C.iceHi, sx:0.96, sy:0.8, dz:0.01 }] });
      for(const [km, sd] of [[5.5, 1.2], [7.5, -1.3], [12.0, 1.4], [14.5, -1.2]]){ const ib = place(K, km, sd); if(ib) K.prop('iceberg', ib, { v:Math.round(km), w:0.36, h:0.22, col:C.iceHi, trig:'near', lead:1.4, bob:0.5, px:120 }); }
      K.ribbon('stream', 1.0, 19.6, 1.3, 0.3, C.lake, { gloss:K.ST.gloss });
      const rg = K.at('Refugio Grey', -0.6); if(rg) K.prop('hut', rg, { w:0.62, h:0.5, col:C.hut, trig:'F', delay:0.2, px:180, rim:0.7, layers:[{ kind:'roof', col:C.roof, dz:0.01 }] });
      lengas(1.0, 20, 8); grass(0.5, 20.5, 8); cl(2);
    }
    if(i === 1){
      // the French Valley: hanging glaciers on Paine Grande, granite walls all round, up to Británico and back
      K.backdrop(1, 'jagged', 0.0, -1.95, 6.6, 1.9, C.granite, 161);
      K.backdrop(1, 'snowcap', -1.2, -1.9, 3.0, 1.2, '#F4F6F8', 161);
      K.backdrop(1, 'cuernos', 1.8, -1.4, 3.0, 1.5, C.granite, 162);
      K.backdrop(1, 'cuernosCap', 1.8, -1.36, 3.0, 1.5, C.granDk, 162);
      const it = K.at('Italiano ranger', -0.6); if(it){ K.prop('tent', it, { w:0.4, h:0.3, col:'#D7703E', trig:'near', lead:1.4, px:140 }); }
      const br = K.at('Mirador Británico', -0.7); if(br) K.prop('rock', br, { v:3, w:0.6, h:0.4, col:'#8E8780', trig:'F', delay:0.3, px:140, layers:[{ kind:'rockHi', col:'#B3ACA4', dz:0.008 }] });
      lengas(21.5, 31, 10); K.rocks(30, 38, 8); grass(21.2, 39.5, 6); cl(2);
    }
    if(i === 2){
      // Los Cuernos over Lago Nordenskjöld, the refugio on its shore, guanacos on the slopes
      K.backdrop(2, 'cuernos', 0.4, -1.95, 6.0, 2.0, C.granite, 171);
      K.backdrop(2, 'cuernosCap', 0.4, -1.9, 6.0, 2.0, C.granDk, 171);
      K.ribbon('stream', 40.5, 52.0, 1.25, 0.32, C.lake, { gloss:K.ST.gloss });
      const cu = K.at('Refugio Los Cuernos', -0.55); if(cu) K.prop('hut', cu, { v:1, w:0.62, h:0.5, col:C.hut, trig:'F', delay:0.2, px:180, rim:0.7, layers:[{ kind:'roof', col:C.roof, dz:0.01 }] });
      for(const km of [46, 49.5, 53]){ const g = place(K, km, -1.2 - K.r()*0.4); if(g) K.prop('guanaco', g, { v:Math.round(km), w:0.36, h:0.4, col:C.guanaco, trig:'near', lead:1.6, flip:K.r() < 0.5, px:140 }); }
      lengas(41, 55, 8); grass(40, 55.5, 10); cl(2);
    }
    if(i === 3){
      // up the Ascencio valley through the beech forest to the moraine, the three towers over the lake
      K.backdrop(3, 'towers', 0.8, -1.95, 4.2, 2.6, C.granite, 181);
      K.backdrop(3, 'ridge', -1.8, -1.45, 3.4, 1.1, C.massif, 182);
      lengas(55.8, 59, 12); K.rocks(59, 61, 10);
      const bt = K.at('Mirador Base Torres', -0.4); if(bt) K.prop('lake', bt, { v:9, w:1.0, h:0.7, col:C.lake, trig:'F', delay:0.3, lie:-HALF_PI, stand:-HALF_PI + 0.32, px:160, gloss:K.ST.gloss, rim:0.5, layers:[{ kind:'shore', v:19, col:'#E7E2D6', sx:1.18, sy:1.22, dy:-0.11, dz:-0.006 }] });
      const ch = K.at('Refugio Chileno', -0.6); if(ch) K.prop('hut', ch, { v:2, w:0.6, h:0.48, col:C.hut, trig:'F', delay:0.2, px:180, rim:0.7, layers:[{ kind:'roof', col:C.roof, dz:0.01 }] });
      cl(2);
    }
    if(i === 4){
      // down and out: the pampa, guanacos, the Welcome Center at the end
      K.backdrop(4, 'towers', -1.6, -1.95, 3.0, 1.8, C.granite, 191);
      K.backdrop(4, 'plain', 1.0, -1.45, 5.0, 0.9, C.grass, 192);
      for(const km of [64, 67.5]){ const g = place(K, km, -1.1); if(g) K.prop('guanaco', g, { v:Math.round(km), w:0.36, h:0.4, col:C.guanaco, trig:'near', lead:1.6, px:140 }); }
      lengas(61.5, 64.5, 6); grass(62, 70.5, 14);
      const wc = place(K, 70.4, 0.6); if(wc) K.prop('hut', wc, { v:3, w:0.8, h:0.5, col:C.hut, trig:'end', km:K.t.km - 1.0, px:180, rim:0.7, layers:[{ kind:'roof', col:C.roof, dz:0.01 }] });
      cl(2);
    }
  }
};

/* ============================================================ Kilimanjaro ============================================================ */
const kili = {
  shapes:SH,
  captions({ t, wp, row, b, f }){
    const mg = wp('Machame Gate'), mc = wp('Machame Camp'), sh = wp('Shira 2'), lt = wp('Lava Tower'), ba = wp('Barranco Camp'), ka = wp('Karanga'), bf = wp('Barafu Camp'), sp = wp('Stella'), uh = wp('Uhuru'), mw = wp('Mweka Camp'), mwg = wp('Mweka Gate');
    const k = (n) => (t.kit || []).find(q => q.item.toLowerCase().indexOf(n) >= 0);
    return [
      { km:0, km0:mg.km, kick:'The forest', title:['Machame', 'Gate'], line:t.permits[0], data:row(mg, mc) },
      { km:11, km0:mc.km, kick:'The plateau', title:['Up to', 'Shira'], line:k('water').why, data:row(mc, sh) },
      { km:18.5, km0:lt.km, kick:'The tower', title:['Lava', 'Tower'], line:'Up to Lava Tower at ' + t.waypoints.find(w => w.name === 'Lava Tower').m.toLocaleString('en').replace(',', ' ') + ' m for the day, then down to Barranco Camp at 3 976 m to sleep.', data:row(lt, ba) },
      { km:25.5, km0:ba.km, kick:'The wall', title:['Barranco', 'Wall'], line:b[0].line, data:row(ba, ka) },
      { km:31.5, km0:bf.km, kick:'The high camp', title:['Barafu', 'Camp'], line:b[1].line, data:row(bf) },
      { km:35.4, km0:sp.km, kick:'The top', title:['Uhuru', 'Peak'], line:b[2].line, data:row(sp, uh) + '<b><span>High point</span>of Africa</b>' },
      { km:42, km0:mw.km, kick:'The way down', title:['Down to', 'Mweka'], line:k('poles').why, data:row(mw, mwg) + '<b><span>End</span>' + t.end.name + '</b>' }
    ];
  },
  scenery(i, K){
    const C = COL.kili, cl = (n) => K.clouds(n);
    const forest = (a, z, n) => scatter(K, a, z, n, 'cloudtree', { w:0.55, h:0.7, col:C.forest, layers:[{ kind:'cloudtree', col:C.forestHi, sx:0.8, sy:0.8, dz:0.012 }] });
    const senecio = (a, z, n) => scatter(K, a, z, n, 'groundsel', { w:0.5, h:0.72, col:C.groundsel, layers:[{ kind:'groundsel', col:C.groundselHi, sx:0.9, sy:0.92, dz:0.012 }] });
    const heath = (a, z, n) => scatter(K, a, z, n, 'heather', { w:0.5, h:0.28, col:C.moor, layers:[{ kind:'heather', col:C.moorHi, sx:0.86, sy:0.8, dz:0.01 }] });
    const camp = (name, col) => { const a = K.at(name, -0.6); if(!a) return; K.prop('tent', a, { w:0.42, h:0.3, col:col || C.tent, trig:'near', lead:1.4, px:140, layers:[{ kind:'tent', col:C.tentHi, sx:0.6, sy:0.6, dz:0.01 }] }); K.prop('tent', { ...a, lx:a.lx + 0.45, z:a.z - 0.15 }, { v:1, w:0.36, h:0.26, col:'#5B8FC4', trig:'near', lead:1.4, px:140 }); };
    const kibo = (x, w, h, seed) => { if(sky(K, x, w, h, C.kibo, C.ice, seed)) return; K.backdrop(K.i, 'kibo', x, -1.95, w, h, C.kibo, seed); K.backdrop(K.i, 'kiboIce', x, -1.9, w, h, C.ice, seed); };
    if(i === 0){
      // the rainforest from the gate, Kibo far off over the trees
      K.backdrop(0, 'kibo', 1.4, -1.95, 4.4, 1.5, C.far, 201); K.backdrop(0, 'kiboIce', 1.4, -1.9, 4.4, 1.5, C.ice, 201);
      K.backdrop(0, 'treeline', 0.0, -1.45, 6.6, 1.3, C.forest, 202);
      K.backdrop(0, 'treeline', -0.6, -0.95, 5.6, 0.95, C.forestHi, 203);
      forest(0.4, 10.5, 22); camp('Machame Camp'); cl(3);
    }
    if(i === 1){
      // heather and moorland up to the Shira plateau, then rock to Lava Tower, Kibo filling the back
      kibo(0.6, 6.6, 2.2, 211);
      heath(11.5, 16.5, 12); K.rocks(16.5, 22.8, 8);
      camp('Shira 2');
      const lt = K.at('Lava Tower', -0.7); if(lt) K.prop('lavatower', lt, { w:0.9, h:0.95, col:C.rock, trig:'F', delay:0.25, px:220, layers:[{ kind:'lavatower', col:C.rockHi, sx:0.9, sy:0.9, dz:0.01 }] });
      cl(2);
    }
    if(i === 2){
      // the Barranco valley's giant groundsels, the wall, Karanga and the high desert to Barafu
      kibo(-0.4, 6.6, 2.3, 221);
      senecio(23.4, 27.5, 10);
      const bw = place(K, 26.6, -0.75); if(bw) K.prop('stairs', bw, { w:1.1, h:0.85, col:C.rock, trig:'near', lead:2.2, px:260, rim:0.8, blur:0.7, layers:[{ kind:'treads', col:C.rockHi, dz:0.008, blur:0.6 }] });
      camp('Barranco Camp'); camp('Karanga'); K.rocks(28, 34.8, 8); cl(2);
    }
    if(i === 3){
      // summit night: up the scree from Barafu to Stella Point and the ice of the crater rim, Uhuru at the top
      K.backdrop(3, 'kibo', 0.0, -1.95, 6.8, 2.4, C.kibo, 231); K.backdrop(3, 'kiboIce', 0.0, -1.9, 6.8, 2.4, C.ice, 231);
      camp('Barafu Camp');
      for(const km of [38.6, 39.6]){ const g = place(K, km, -0.9); if(g) K.prop('glacier', g, { v:Math.round(km), w:1.3, h:0.42, col:C.ice, trig:'near', lead:1.6, px:220 }); }
      K.rocks(35.5, 39.5, 8);
      const up = K.at('Uhuru', -0.45); if(up) K.prop('sign', up, { key:'uh', w:0.9, h:0.62, col:'#7B5A3A', trig:'F', delay:0.4, px:260, rim:0.6, blur:0.9 });
    }
    if(i === 4){
      // the long way down: scree, then heather, then the forest again to Mweka Gate
      kibo(-2.0, 4.2, 1.8, 241);
      K.backdrop(4, 'treeline', 1.0, -1.45, 5.0, 1.1, C.forest, 242);
      K.rocks(40.5, 47, 6); heath(47, 53, 10); forest(53, 61.5, 16); camp('Mweka Camp'); cl(2);
    }
  }
};

/* ============================================================ Everest Base Camp ============================================================ */
const everest = {
  shapes:SH,
  captions({ t, wp, row, b, f }){
    const lu = wp('Lukla'), pk = wp('Phakding'), mo = wp('Monjo'), nb = wp('Namche Bazaar'), tb = wp('Tengboche'), pb = wp('Pangboche'), db = wp('Dingboche'), lb = wp('Lobuche'), gs = wp('Gorak Shep'), ebc = wp('Everest Base Camp'), kp = wp('Kala Patthar'), pr = wp('Pheriche'), lr = wp('Lukla (return)');
    const k = (n) => (t.kit || []).find(q => q.item.toLowerCase().indexOf(n) >= 0);
    return [
      { km:0, km0:lu.km, kick:'The airstrip', title:['Lukla to', 'Phakding'], line:f[0], data:row(lu, pk) },
      { km:9.5, km0:mo.km, kick:'The climb', title:['Namche', 'Hill'], line:b[0].line, data:row(mo, nb) },
      { km:19.5, km0:nb.km, kick:'The monastery', title:['Up to', 'Tengboche'], line:f[4], data:row(nb, tb) },
      { km:32.5, km0:pb.km, kick:'The high valley', title:['Pangboche to', 'Dingboche'], line:f[2], data:row(pb, db) },
      { km:41, km0:lb.km, kick:'The moraine', title:['Lobuche to', 'Gorak Shep'], line:b[1].line, data:row(lb, gs) },
      { km:55.5, km0:ebc.km, kick:'Base Camp', title:['Everest', 'Base Camp'], line:f[3], data:row(ebc) },
      { km:61.9, km0:kp.km, kick:'The top', title:['Kala', 'Patthar'], line:b[2].line, data:row(kp) + '<b><span>High point</span>of the trek</b>' },
      { km:66.5, km0:pr.km, kick:'The way down', title:['The long', 'way down'], line:k('poles').why, data:row(pr, lr) + '<b><span>End</span>Lukla</b>' }
    ];
  },
  scenery(i, K){
    const C = COL.everest, cl = (n) => K.clouds(n);
    const pines = (a, z, n) => scatter(K, a, z, n, 'rimu', { w:0.4, h:0.9, col:C.pine });
    const scrub = (a, z, n) => scatter(K, a, z, n, 'heather', { w:0.46, h:0.24, col:C.moraine, layers:[{ kind:'heather', col:C.moraineHi, sx:0.86, sy:0.8, dz:0.01 }] });
    const house = (name, dz, v) => { const a = K.at(name, dz || -0.65); if(!a) return null; K.prop('teahouse', a, { v:v || 0, w:0.66, h:0.46, col:C.house, trig:'F', delay:0.2, px:200, rim:0.7, layers:[{ kind:'teaRoof', col:C.roof, dz:0.01 }] }); return a; };
    const flags = (km, side, v) => { const a = place(K, km, side); if(a) K.prop('flags', a, { key:'f' + v, v, w:0.9, h:0.42, col:'#E9E2D4', trig:'near', lead:1.5, px:220, paint:flagPaint, yaw:0.3 }); };
    const yaks = (a, z, n) => scatter(K, a, z, n, 'yak', { w:0.42, h:0.3, col:C.yak, sc:1 }, 1.0);
    if(i === 0){
      // the Dudh Kosi gorge: pine forest, the high suspension bridges with their flags, up to Namche
      K.backdrop(0, 'jagged', 0.4, -1.95, 6.6, 1.9, C.range, 301);
      K.backdrop(0, 'snowcap', 0.4, -1.9, 6.6, 1.9, C.snow, 301);
      K.backdrop(0, 'treeline', -0.4, -1.45, 6.0, 1.1, C.pine, 302);
      const br1 = place(K, 6.5, 0.05), br2 = place(K, 15.5, 0.05);
      for(const [b2, v] of [[br1, 1], [br2, 2]]) if(b2) K.prop('suspbridge', b2, { key:'b' + v, v, w:1.6, h:0.5, col:C.bridge, trig:'near', lead:1.8, yaw:-b2.dir, px:260, rim:0.6, blur:0.8 });
      flags(4.0, -0.8, 3); flags(17.5, -0.9, 4);
      pines(0.6, 18.8, 12); house('Phakding'); house('Namche Bazaar', -0.7, 1); cl(2);
    }
    if(i === 1){
      // Tengboche's monastery and its stupa, Ama Dablam over the valley, rhododendron and pine
      K.backdrop(1, 'jagged', -0.4, -1.95, 6.6, 1.7, C.range, 311);
      K.backdrop(1, 'amadablam', 1.6, -1.45, 2.6, 2.6, C.rangeHi, 312);
      K.backdrop(1, 'amaSnow', 1.6, -1.4, 2.6, 2.6, C.snow, 312);
      const tb = K.at('Tengboche', -0.6); if(tb){ K.prop('stupa', tb, { w:0.62, h:0.9, col:C.stupa, trig:'F', delay:0.15, px:260, rim:0.6, paint:stupaPaint }); K.prop('teahouse', { ...tb, lx:tb.lx + 0.7, z:tb.z + 0.15 }, { v:2, w:0.66, h:0.46, col:C.house, trig:'F', delay:0.25, px:200, rim:0.7, layers:[{ kind:'teaRoof', col:'#B8473A', dz:0.01 }] }); }
      house('Pangboche', -0.6, 3); house('Dingboche', -0.65, 4);
      flags(28.5, -0.9, 5); pines(20, 31, 8); scrub(33, 40.5, 8); yaks(22, 40, 3);
      const mw = place(K, 36.5, -0.85); if(mw) K.prop('mani', mw, { w:0.9, h:0.18, col:C.mani, trig:'near', lead:1.4, px:120, yaw:-mw.dir });
      cl(2);
    }
    if(i === 2){
      // up the Khumbu moraine: Lobuche, the memorials on the pass, Gorak Shep on its frozen lake bed
      K.backdrop(2, 'jagged', 0.2, -1.95, 6.6, 2.1, C.range, 321);
      K.backdrop(2, 'snowcap', 0.2, -1.9, 6.6, 2.1, C.snow, 321);
      K.backdrop(2, 'massif', -1.6, -1.45, 3.4, 1.2, C.rangeHi, 322);
      house('Lobuche', -0.6, 5); house('Gorak Shep', -0.65, 6);
      K.rocks(42, 54, 12); scrub(41.5, 48, 6); flags(51.5, -0.85, 6); yaks(41.5, 46, 2); cl(1);
    }
    if(i === 3){
      // Base Camp's glacier and the dawn on Kala Patthar: Everest from Kala Patthar, the real skyline, behind it all
      if(!sky(K, 0.0, 6.8, 2.6, C.range, C.snow, 331)){ K.backdrop(3, 'jagged', 0.0, -1.95, 6.8, 2.4, C.range, 331); K.backdrop(3, 'snowcap', 0.0, -1.9, 6.8, 2.4, C.snow, 331); }
      for(const km of [57.2, 58.6]){ const g = place(K, km, -0.95); if(g) K.prop('glacier', g, { v:Math.round(km), w:1.5, h:0.4, col:'#E6EEF3', trig:'near', lead:1.6, px:220, layers:[{ kind:'glacier', col:'#F6FAFC', sx:0.96, sy:0.8, dz:0.01 }] }); }
      const ebc = K.at('Everest Base Camp', -0.55); if(ebc){ K.prop('tent', ebc, { w:0.4, h:0.28, col:'#D9A441', trig:'F', delay:0.2, px:140 }); K.prop('tent', { ...ebc, lx:ebc.lx + 0.45, z:ebc.z - 0.15 }, { v:1, w:0.36, h:0.26, col:'#D63B2F', trig:'F', delay:0.25, px:140 }); K.prop('flags', { ...ebc, lx:ebc.lx - 0.6 }, { key:'f9', v:9, w:0.9, h:0.42, col:'#E9E2D4', trig:'F', delay:0.3, px:220, paint:flagPaint }); }
      K.rocks(55, 65, 10);
    }
    if(i === 4){
      // the long way down: back past the stupas and the bridges to Lukla
      K.backdrop(4, 'amadablam', -1.6, -1.95, 2.4, 2.2, C.rangeHi, 341);
      K.backdrop(4, 'amaSnow', -1.6, -1.9, 2.4, 2.2, C.snow, 341);
      K.backdrop(4, 'treeline', 1.0, -1.45, 5.0, 1.1, C.pine, 342);
      house('Pheriche', -0.6, 7); house('Namche Bazaar (return)', -0.65, 8);
      const st2 = place(K, 92, -0.8); if(st2) K.prop('stupa', st2, { v:1, w:0.5, h:0.75, col:C.stupa, trig:'near', lead:1.6, px:240, rim:0.6, paint:stupaPaint });
      const b3 = place(K, 108, 0.05); if(b3) K.prop('suspbridge', b3, { key:'b3', v:3, w:1.6, h:0.5, col:C.bridge, trig:'near', lead:1.8, yaw:-b3.dir, px:260, rim:0.6, blur:0.8 });
      scrub(66, 80, 8); pines(95, 117, 12); flags(84, -0.9, 7); yaks(70, 90, 3); cl(2);
    }
  }
};

window.FOLD_WALKS = { inca, torres, kili, everest };
})();
