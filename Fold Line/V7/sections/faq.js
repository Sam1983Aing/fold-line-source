/* ============================================================
   FOLD LINE . V7 . the questions, over a folded world map (18 Oct 2026)
   Sam: "a basic FAQ with a touch of creativity ... a nice map at an angle that folds, like the whole screen, and you
   have some pins on the map and the questions overlay on the left side ... don't try to reinvent the wheel ... make
   sure it has a nice world map". One option, no switch.
   The map is the hero globe's own land (hero/globe-data.js), unrolled flat on a canvas: cream card on navy paper, three
   engraved water lines along every coast, a faint graticule. It is cut into six panels folded like a road map and laid
   at an angle on the table. As the stop arrives it unfolds across the screen and the treks' pins stand up out of it.
   The questions sit on a paper sheet on the left. Some answers have numbers on the map: open one and the pins say them.
   Classic script. Exposes window.FAQ_MAP.
   ============================================================ */
(function(){
'use strict';
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (t) => t*t*(3 - 2*t);
const PANELS = 6, LON0 = -89;          // the map's left edge: Peru just off it, so Africa to New Zealand fills the right
const INK = '#1B2230', CREAM = '#F6EFE3';

// ---- the flat map, drawn once from the globe's signed distance field (128 at the coast, +scale per texel inland)
let MAPURL = null, mapWaiting = [];
function drawMap(done){
  if(MAPURL) return done(MAPURL);
  mapWaiting.push(done);
  if(mapWaiting.length > 1) return;
  const D = window.GLOBE_DATA;
  const finish = (url) => { MAPURL = url; mapWaiting.forEach(f => f(url)); mapWaiting = []; };
  if(!D){ finish(''); return; }
  const img = new Image();
  img.onload = () => {
    const W = 2048, H = 1024, src = document.createElement('canvas'); src.width = W; src.height = H;
    const sx = src.getContext('2d', { willReadFrequently:true }); sx.drawImage(img, 0, 0, W, H);
    const S = sx.getImageData(0, 0, W, H).data;
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const ox = out.getContext('2d'), O = ox.createImageData(W, H), P = O.data;
    const sea = [28, 48, 73], seaLo = [20, 36, 56], land = [226, 218, 202], landEdge = [196, 186, 168], ink = [110, 139, 174];
    const shift = Math.round((LON0 + 180)/360*W);          // roll the map so its left edge is LON0
    for(let y = 0; y < H; y++){
      const lat = 90 - (y + 0.5)/H*180, sh = 0.86 + 0.14*Math.cos(lat*Math.PI/180);
      for(let x = 0; x < W; x++){
        const sxp = (x + shift) % W, i = (y*W + sxp)*4, o = (y*W + x)*4;
        const d = (S[i] - 128)/D.scale;               // texels from the coast, + inland
        let r, g, b;
        if(d >= 0){
          const e = clamp01(d/3);
          r = landEdge[0] + (land[0] - landEdge[0])*e; g = landEdge[1] + (land[1] - landEdge[1])*e; b = landEdge[2] + (land[2] - landEdge[2])*e;
          if(d < 0.9){ r *= 0.82; g *= 0.82; b *= 0.82; }          // the card's cut edge
        } else {
          const k = clamp01(-d/40);
          r = sea[0] + (seaLo[0] - sea[0])*k; g = sea[1] + (seaLo[1] - sea[1])*k; b = sea[2] + (seaLo[2] - sea[2])*k;
          // three engraved water lines along the coast, and the card's shadow on the sea
          let L = 0; for(let q = 0; q < 3; q++){ const at = 3 + q*4; L += Math.max(0, 1 - Math.abs(-d - at)/0.7)*(0.5 - q*0.13); }
          const shadow = clamp01(1 + d/2.2)*0.35;
          r = r*(1 - shadow) + ink[0]*L*0.5; g = g*(1 - shadow) + ink[1]*L*0.5; b = b*(1 - shadow) + ink[2]*L*0.5;
        }
        P[o] = r*sh; P[o + 1] = g*sh; P[o + 2] = b*sh; P[o + 3] = 255;
      }
    }
    ox.putImageData(O, 0, 0);
    // a faint graticule every 30 degrees, the equator a little stronger
    ox.strokeStyle = 'rgba(160,184,214,0.16)'; ox.lineWidth = 1.5;
    for(let lon = -180; lon <= 180; lon += 30){ const x = ((lon - LON0 + 360) % 360)/360*W; ox.beginPath(); ox.moveTo(x, 0); ox.lineTo(x, H); ox.stroke(); }
    for(let lat = -60; lat <= 60; lat += 30){ const y = (90 - lat)/180*H; ox.lineWidth = lat === 0 ? 2.5 : 1.5; ox.beginPath(); ox.moveTo(0, y); ox.lineTo(W, y); ox.stroke(); }
    finish(out.toDataURL('image/jpeg', 0.88));
  };
  img.onerror = () => finish('');
  img.src = D.src;
}
const xOf = (lon) => ((lon - LON0 + 360) % 360)/360, yOf = (lat) => (90 - lat)/180;

function def(C){
  const T = C.T, more = window.FOLD_GLOBE_MORE || [];
  const hi = (t) => C.fmt(t.high.m) + ' m', grp = (t) => t.group.min + ' to ' + t.group.max;
  // the questions; "pins" says what each trek's pin shows while the answer is open
  const Q = C.faq.map(([q, a, key]) => ({ q, a, key }));
  const pins = T.map((t, k) => { const w = (t.waypoints || [])[0] || {}, c = C.catOf(t);
    return { name:t.name, lon:w.lon || 0, lat:w.lat || 0, color:c.color, ink:c === C.PAL.cats.multi ? INK : CREAM, high:hi(t), group:grp(t), key:true }; })
    .concat(more.map(m => ({ name:m[0], lon:m[2], lat:m[1], color:C.PAL.cats[m[3] <= 1 ? 'day' : m[3] <= 4 ? 'multi' : 'exp'].color, small:true })));
  // which panel a pin is on, and where across it
  const pinHTML = (p, k) => {
    const fx = xOf(p.lon)*PANELS, pi = Math.min(PANELS - 1, Math.floor(fx)), px = (fx - pi)*100, py = yOf(p.lat)*100;
    return { pi, html:'<span class="fm-pin' + (p.small ? ' sm' : '') + (xOf(p.lon) > 0.6 ? ' left' : '') + '" data-k="' + k + '" style="left:' + px.toFixed(2) + '%;top:' + py.toFixed(2) + '%;--cat:' + p.color + ';--ink:' + (p.ink || CREAM) + ';--d:' + (k*0.05).toFixed(2) + 's">' +
      '<span class="fm-stand"><i class="fm-stick"></i><i class="fm-head"></i>' + (p.small ? '' : '<b class="fm-lab" data-name="' + C.esc(p.name) + '" data-high="' + p.high + '" data-group="' + p.group + '">' + C.esc(p.name) + '</b>') + '</span></span>' };
  };
  const byPanel = Array.from({ length:PANELS }, () => '');
  pins.forEach((p, k) => { const h = pinHTML(p, k); byPanel[h.pi] += h.html; });
  // the panels nest, each hinged on the right edge of the one before, so folding them makes an accordion
  let panels = '';
  for(let k = PANELS - 1; k >= 0; k--) panels = '<div class="fm-p" data-i="' + k + '" style="--i:' + k + '"><div class="fm-face"></div>' + byPanel[k] + panels + '</div>';
  const map = '<div class="fm" aria-hidden="true"><div class="fm-tilt"><div class="fm-shadow"></div>' + panels + '</div></div>';
  const faq = '<div class="fq"><div class="fq-sheet">' + Q.map((x, k) =>
    '<div class="fq-q' + (k === 0 ? ' open' : '') + '" data-key="' + (x.key || '') + '"><button type="button" class="fq-b" aria-expanded="' + (k === 0) + '"><b>' + String(k + 1).padStart(2, '0') + '</b><span>' + C.esc(x.q) + '</span><i aria-hidden="true"></i></button>' +
    '<div class="fq-a"><p>' + x.a + '</p></div></div>').join('') + '</div></div>';
  return {
    id:'ready', kick:'Ready for it?', eyebrow:'Ready for it?', flow:true, cls:'faqmap',
    title:['How hard,', '<em>how high.</em>'],
    lede:'None of the five needs climbing gear in season. All of them need legs that have done a few long days first.',
    pols:map + faq, cards:[]
  };
}

// ---- the page side
const owns = (el) => !!el && el.classList.contains('faqmap');
const pinLen = () => 0.8;
function init(s){
  const el = s.el;
  const paint = () => drawMap(url => { if(url) el.querySelectorAll('.fm-face').forEach(f => { f.style.backgroundImage = 'url(' + url + ')'; }); });
  // a page opened mid-dive draws the map once the camera has settled in the walk
  if(window.FL_LATER) window.FL_LATER.push(paint); else paint();
  // one question open at a time; an answer with numbers puts them on the pins
  const qs = [...el.querySelectorAll('.fq-q')], labs = [...el.querySelectorAll('.fm-lab')];
  const show = (key) => labs.forEach(l => { const v = key === 'high' ? l.dataset.high : key === 'group' ? l.dataset.group : l.dataset.name; if(l.textContent !== v){ l.textContent = v; } l.classList.toggle('num', key === 'high' || key === 'group'); });
  qs.forEach(q => q.querySelector('.fq-b').addEventListener('click', () => {
    const was = q.classList.contains('open');
    qs.forEach(o => { o.classList.remove('open'); o.querySelector('.fq-b').setAttribute('aria-expanded', 'false'); });
    if(!was){ q.classList.add('open'); q.querySelector('.fq-b').setAttribute('aria-expanded', 'true'); }
    show(!was ? q.dataset.key : '');
  }));
  show(qs[0] ? qs[0].dataset.key : '');
  s.fm = { root:el.querySelector('.fm'), pins:[...el.querySelectorAll('.fm-pin')], sheet:el.querySelector('.fq'), last:-1 };
  // the sheet keeps the room of its longest answer, so opening one never changes the frozen frame's size and the map
  // under it stays put (Sam, 18 Oct: "when it expands, the map moves")
  const sheet = el.querySelector('.fq-sheet'), as = [...el.querySelectorAll('.fq-a')];
  const reserve = () => {
    // a hidden page (inside a walk) measures nothing: keep what was there and measure again once it shows (Sam, 19 Oct:
    // back from a walk the map sat too high, measured at 0 while the landing was hidden)
    if(!el.offsetHeight){ s.fmStale = true; return false; }
    s.fmStale = false;
    const open = qs.filter(q => q.classList.contains('open'));
    as.forEach(a => { a.style.transition = 'none'; }); open.forEach(q => q.classList.remove('open'));
    sheet.style.minHeight = '';
    const h0 = sheet.offsetHeight, maxA = Math.max(0, ...as.map(a => a.firstElementChild ? a.firstElementChild.scrollHeight : 0)) + 16;
    open.forEach(q => q.classList.add('open')); void sheet.offsetHeight; as.forEach(a => { a.style.transition = ''; });
    // the room always goes back on: measuring took it off (a later check that found the same number used to leave the
    // sheet without it, and the map moved again, Sam 18 Oct)
    const want = Math.round(h0 + maxA), changed = Math.abs(want - (s.fmMin || 0)) > 2;
    s.fmMin = want; sheet.style.minHeight = want + 'px';
    // the map hangs from a fixed point, the middle of the frame at its full height, not from 50% of whatever height the
    // frame has while an answer is opening
    const pin = el.querySelector('.pol-pin'); if(pin) s.fm.root.style.top = Math.round(pin.offsetHeight*0.5) + 'px';
    return changed;
  };
  if(reserve()) window.dispatchEvent(new Event('resize'));
  s.fm.reserve = reserve;
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(reserve()) window.dispatchEvent(new Event('resize')); }, 200); });
}
function frame(s, y, vh){
  if(!s.fm) init(s);
  if(s.fmStale && s.el.offsetHeight && s.fm.reserve && s.fm.reserve()) window.dispatchEvent(new Event('resize'));
  // the map unfolds as the frame comes in and holds, then the pins stand up and the sheet of questions lands
  const u = smooth(clamp01((y - (s.pinStart - vh*0.55))/(vh*0.75)));
  if(Math.abs(u - s.fm.last) > 0.002){
    s.fm.last = u;
    s.fm.root.style.setProperty('--fold', (1 - u).toFixed(3));
  }
  const up = u > 0.82;
  if(up !== s.fm.up){ s.fm.up = up; s.fm.root.classList.toggle('pins-up', up); s.fm.sheet.classList.toggle('on', up); }
}

const CSS = `
/* the frame: the map behind everything, the text and the questions on the left */
.faqmap .pol-pin{display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr);column-gap:4vw;align-items:start;max-width:1400px;margin:0 auto;padding:0 calc(var(--pad-x) + 2vw);box-sizing:border-box;}
.landing .stop.flow.faqmap .stop-text{grid-column:1;grid-row:1;margin:0;width:auto;text-align:left;padding:0;position:relative;z-index:2;}
.landing .stop.flow.faqmap .stop-lede{margin-left:0;max-width:44ch;}
.fm{position:absolute;left:50%;top:50%;width:0;height:0;z-index:0;pointer-events:none;--fold:1;perspective:1600px;}
.fm-tilt{position:absolute;left:0;top:0;width:min(134vw, 2100px);aspect-ratio:2;transform-style:preserve-3d;
  transform:translate(-43.5%, -50%) rotateX(52deg) rotateZ(-8deg);}
.fm-shadow{position:absolute;inset:2% -1% -3% 1%;background:rgba(0,0,0,0.6);filter:blur(30px);transform:translateZ(-2px);}
.fm-p{position:absolute;top:0;height:100%;width:calc(100%/${PANELS});transform-style:preserve-3d;transform-origin:0 50%;}
.fm-tilt > .fm-p{left:0;transform:rotateY(calc(var(--fold)*-38deg));}
.fm-p .fm-p{left:100%;width:100%;transform:rotateY(calc(var(--fold)*76deg));}
.fm-p .fm-p .fm-p{transform:rotateY(calc(var(--fold)*-76deg));}
.fm-p .fm-p .fm-p .fm-p{transform:rotateY(calc(var(--fold)*76deg));}
.fm-p .fm-p .fm-p .fm-p .fm-p{transform:rotateY(calc(var(--fold)*-76deg));}
.fm-p .fm-p .fm-p .fm-p .fm-p .fm-p{transform:rotateY(calc(var(--fold)*76deg));}
.fm-face{position:absolute;inset:0;background-color:#1C3049;background-size:${PANELS*100}% 100%;background-position:calc(var(--i)*100%/${PANELS - 1}) 0;backface-visibility:hidden;}
.fm-face::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(255,255,255,0.08));opacity:calc(0.35 + var(--fold)*0.65);}
.fm-p[data-i="1"] > .fm-face::after,.fm-p[data-i="3"] > .fm-face::after,.fm-p[data-i="5"] > .fm-face::after{background:linear-gradient(90deg, rgba(255,255,255,0.08), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.3));}
/* a crease across the middle too, like a real road map */
.fm-face::before{content:'';position:absolute;left:0;right:0;top:50%;height:2px;background:linear-gradient(rgba(0,0,0,0.25), rgba(255,255,255,0.1));}
/* the pins stand up off the map, a beat apart, the five treks with their names, the rest as small pins */
.fm-pin{position:absolute;width:0;height:0;transform-style:preserve-3d;}
.fm-stand{position:absolute;left:0;bottom:0;display:block;width:0;height:0;transform-style:preserve-3d;transform-origin:0 0;transform:rotateX(0deg) scale(0.001);transition:transform .8s cubic-bezier(.2,1.5,.35,1) var(--d);}
.fm.pins-up .fm-stand{transform:rotateX(-90deg) scale(1);}
.fm-stick{position:absolute;left:-1.5px;bottom:0;width:3px;height:70px;background:linear-gradient(90deg,#B8C0CC,#7E8794);}
.fm-head{position:absolute;left:-13px;bottom:62px;width:26px;height:26px;border-radius:50%;background:var(--cat);box-shadow:inset -5px -6px 0 rgba(0,0,0,0.22), inset 4px 4px 0 rgba(255,255,255,0.25);}
.fm-pin.sm .fm-stick{height:40px;} .fm-pin.sm .fm-head{left:-8px;bottom:34px;width:16px;height:16px;}
.fm-lab{position:absolute;left:18px;bottom:78px;padding:7px 13px 6px 11px;white-space:nowrap;font-family:var(--f-display);font-weight:500;font-size:22px;letter-spacing:-0.01em;color:var(--ink);
  background:var(--cat);clip-path:polygon(1% 6%, 99% 0, 100% 90%, 2% 100%);transform:rotate(-3deg);}
.fm-lab.num{font-size:26px;}
.fm-pin.left .fm-lab{left:auto;right:18px;transform:rotate(3deg);}
/* a soft shade behind the text, so the lede reads over the land: an ellipse that is gone before it meets any side of its
   box, so it never ends on a line (Sam, 18 Oct) */
.landing .stop.flow.faqmap .stop-text::before{content:'';position:absolute;z-index:-1;inset:-110px -200px -110px -260px;pointer-events:none;
  background:radial-gradient(closest-side, rgba(var(--c-room-rgb,10,16,25),0.9) 0%, rgba(var(--c-room-rgb,10,16,25),0.78) 40%, rgba(var(--c-room-rgb,10,16,25),0.35) 72%, rgba(var(--c-room-rgb,10,16,25),0) 100%);}
/* the questions: a paper sheet that lands on the map */
.fq{grid-column:1;grid-row:2;margin-top:4vh;position:relative;z-index:2;max-width:520px;filter:drop-shadow(0 24px 30px rgba(0,0,0,0.55));
  transform-origin:50% 0;transform:perspective(1200px) rotateX(-70deg);opacity:0;transition:transform 1s cubic-bezier(.2,1.3,.35,1), opacity .3s ease;}
.fq.on{transform:none;opacity:1;}
.fq-sheet{padding:10px 26px 14px;color:#1B2230;background:#F3EEE4 linear-gradient(170deg, rgba(255,255,255,0.4), rgba(0,0,0,0.05));transform:rotate(-0.8deg);}
.fq-q + .fq-q{border-top:1px dashed rgba(27,34,48,0.22);}
.fq-b{display:flex;align-items:center;gap:14px;width:100%;padding:15px 0;border:0;background:none;cursor:pointer;text-align:left;color:#121A26;font:inherit;}
.fq-b b{font-family:var(--f-label);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.14em;color:#D63B2F;font-weight:500;}
.fq-b span{flex:1;font-family:var(--f-display);font-weight:500;font-size:calc(17px*var(--d-ui,1));letter-spacing:-0.01em;}
.fq-b i{position:relative;width:14px;height:14px;flex:none;}
.fq-b i::before,.fq-b i::after{content:'';position:absolute;left:0;right:0;top:6px;height:2px;background:#1B2230;transition:transform .35s ease;}
.fq-b i::after{transform:rotate(90deg);}
.fq-q.open .fq-b i::after{transform:rotate(0deg);}
.fq-a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.2,.8,.2,1);}
.fq-a > p{overflow:hidden;margin:0;padding:0 0 0 34px;font-size:14px;line-height:1.6;color:rgba(27,34,48,0.75);}
.fq-q.open .fq-a{grid-template-rows:1fr;}
.fq-q.open .fq-a > p{padding-bottom:16px;}
.fq-a b{color:#121A26;font-weight:600;}
.fq-b:focus-visible{outline:2px solid #D63B2F;outline-offset:2px;}
@media (prefers-reduced-motion: reduce){ .fq,.fm-stand,.fq-a{transition:none;} }
@media (max-width:760px){
  .faqmap .pol-pin{grid-template-columns:1fr;padding:0 18px;}
  .fq{margin-top:20px;max-width:none;}
  .fq-sheet{padding:4px 18px 8px;} .fq-b{padding:12px 0;} .fq-b span{font-size:15px;} .fq-a > p{font-size:13px;padding-left:30px;}
  .fm-tilt{width:330vw;transform:translate(-40%, -30%) rotateX(56deg) rotateZ(-9deg);}
  .fm-lab{font-size:30px;} .fm-lab.num{font-size:34px;}
}
`;

let cssOn = false;
window.FAQ_MAP = {
  def(C){ if(!cssOn){ const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); cssOn = true; } return def(C); },
  owns, pinLen, frame
};
})();
