/* ============================================================
   FOLD LINE . V7 . the landing page and the walk, as two journeys
   Sam (17 Oct 2026, after round 1): "Right now we only have one map that we can enter, but eventually we can enter all
   those five." The walk into a map is its own sequence, started from the Explore the trail button between the globe
   and the map in the light: the dive, the walk, the map folding up, then book it or go back. The scroll belongs to the
   landing page: a red thread from the hero to each stop (round 1's Red Thread) and each stop a paper station (round 1's
   Map Goes On) with floating cards, "sometimes a straight line, sometimes some curve", down to the final call.
   Then (same day): "when the character starts walking from the hero we should already start to see the second
   section forming ... make that thread shorter ... go more to the left and do a circle and enter the cutout animation,
   like one continuous motion." So every stop is a box in the page, a screen tall and sticky: its paper station is
   drawn inside the box, rises in from the bottom with it while its cut-outs spring up, holds while the hiker crosses it,
   and leaves with it. The canvas draws each box where it is on screen (the hero's and up to two stations at once),
   so nothing ever fades to an empty screen. The thread runs between the boxes as a free path, loops included.
   Two modes on one page:
   - landing (the default): the hero, then sections/sections.js's six stops on sections/stations.js's stations. The
     hero's exit and V1's timeline stay at 0, so scrolling never dives.
   - trek: the page as V6 had it (the hero's exit, the walk, the fold, the booking panel). Entered from the button,
     which glides the scroll through the dive. Scrolling back to the top hands back to the landing.
   Classic script. The page calls create(), build(api) after the interior, scroll() from its scroll trigger, cam()
   inside its update, frame() before the render, resize(), book(), home() and away().
   ============================================================ */
(function(){
'use strict';
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (t) => t*t*(3 - 2*t);
const lerp = (a, b, t) => a + (b - a)*t;
const seg = (v, a, b) => clamp01((v - a)/(b - a));
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = (s*1664525 + 1013904223) >>> 0; return s/4294967296; }; }
const mixHex = (a, b, t) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(lerp((A >> s) & 255, (B >> s) & 255, t));
  return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')';
};

const CSS = `
html.mode-landing main > .hero-exit,html.mode-landing main > .handoff,html.mode-landing main > .unfold,
html.mode-landing main > .day,html.mode-landing main > .finale,html.mode-landing main > .close{display:none;}
/* the end of a walk goes back to the hero (Sam, 18 Oct): no end panel, and the hero's type waits for the camera, then fades in */
#bookPanel{display:none !important;}
.landing.l-measure .stop-box,.landing.l-measure .stop-text,.landing.l-measure .pol-pin{position:relative !important;top:auto !important;}
html.fl-return .fo{opacity:0 !important;transition:none !important;}
html.fl-return-in .fo{transition:opacity 1s ease !important;}
html.mode-trek #landing{display:none;}
html.mode-trek .hk{display:none;}
.l-curtain{position:fixed;inset:0;z-index:30;pointer-events:none;background:var(--c-room,#0A1019);opacity:0;}
/* the header keeps its ground once the hero has gone */
html.mode-landing .top::before{content:'';position:absolute;z-index:-1;left:0;right:0;top:0;height:150%;pointer-events:none;opacity:0;transition:opacity .5s ease;
  background:linear-gradient(to bottom, rgba(var(--c-shade-rgb),0.92), rgba(var(--c-shade-rgb),0.6) 55%, rgba(var(--c-shade-rgb),0));}
html.mode-landing.l-past .top::before{opacity:1;}
.landing .leg{position:relative;}
.landing > .stop,.landing > .leg,.landing > .foot{position:relative;z-index:1;}
.threads{position:absolute;left:0;top:0;z-index:0;overflow:visible;pointer-events:none;}
/* under the hero its picture runs on a little way and fades into the room, so it never ends on a line (Sam: "the
   transition from the hero feels cut"). below the screen at the top of the page, so the hero opens as it was */
.hero-fade{position:absolute;left:0;right:0;top:-32vh;height:calc(32vh + var(--l-gap,0px) + 2px);z-index:3;pointer-events:none;opacity:0;
  background:linear-gradient(to bottom, rgba(var(--c-room-rgb,10,16,25),0) 0%, rgba(var(--c-room-rgb,10,16,25),0.05) 16%, rgba(var(--c-room-rgb,10,16,25),0.18) 32%,
    rgba(var(--c-room-rgb,10,16,25),0.4) 48%, rgba(var(--c-room-rgb,10,16,25),0.66) 64%, rgba(var(--c-room-rgb,10,16,25),0.88) 80%, var(--c-room,#0A1019) 94%);}
/* every station's box starts soft at the top too: the cloth under the lamp melts into the room, no line where it begins
   (Sam, 18 Oct: "make sure that texture is blending into the second section, there's no straight edge") */
.landing .stop-box::before{content:'';position:absolute;left:0;right:0;top:0;height:26vh;pointer-events:none;
  background:linear-gradient(to bottom, var(--c-room,#0A1019) 0%, rgba(var(--c-room-rgb,10,16,25),0.6) 40%, rgba(var(--c-room-rgb,10,16,25),0) 100%);}
.landing .stop-box{z-index:0;}
/* a focusing stop: its text sits over the hero's last fade, and the sheet passing under the text column melts into the
   room on the left, so only the scene in view reads */
.landing .stop.lead{z-index:5;}
.landing .stop.orb{z-index:4;}
.landing .stop.orb .stop-box::before{display:none;}
.landing .stop.orb .box-foot{position:absolute;left:0;right:0;bottom:0;height:36vh;pointer-events:none;
  background:linear-gradient(to bottom, rgba(var(--c-room-rgb,10,16,25),0) 0%, rgba(var(--c-room-rgb,10,16,25),0.5) 45%, rgba(var(--c-room-rgb,10,16,25),0.88) 78%, var(--c-room,#0A1019) 100%);}
@media (min-width:761px){
  .landing .slide-edge{position:absolute;left:0;right:0;top:100%;height:18vh;pointer-events:none;
    background:linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.22) 35%, rgba(0,0,0,0));border-top:1px solid rgba(var(--c-text-rgb),0.07);}
}
@media (min-width:761px){
  .landing .stop.lead .stop-box::after{content:'';position:absolute;left:0;top:0;bottom:0;width:46vw;pointer-events:none;
    background:linear-gradient(to right, var(--c-room,#0A1019) 0%, rgba(var(--c-room-rgb,10,16,25),0.92) 22vw, rgba(var(--c-room-rgb,10,16,25),0) 100%);}
}
@media (min-width:761px){
  .landing .stop.lead .fcard{--fw:min(320px,22vw);}
  .landing .fcard.paper .fc-in{transform-origin:50% 100%;transform:perspective(800px) rotateX(80deg);opacity:0;transition:transform 1s cubic-bezier(.2,1.45,.35,1), opacity .3s ease;}
  .landing .fcard.paper.on .fc-in{transform:none;opacity:1;}
}
.threads .ahead{fill:none;stroke:rgba(var(--c-text-rgb),0.12);stroke-width:2;stroke-dasharray:9 8;stroke-linecap:round;}
.threads .done{fill:none;stroke:var(--v2-red,#D63B2F);stroke-width:2.6;stroke-dasharray:9 8;stroke-linecap:round;}
.threads .head{fill:var(--v2-red,#D63B2F);stroke:#F1EBDF;stroke-width:2;}
.threads .tus{fill:none;stroke:#8A6E4B;stroke-width:1.8;stroke-linecap:round;opacity:0.85;}
.threads .stn{fill:#2A3547;}
.threads .ring{fill:none;stroke:rgba(var(--c-text-rgb),0.17);stroke-width:1.2;}
.threads .cairn{fill:#3A4659;}
.landing .stop.tall .stop-text{position:relative;top:auto;}
@media (min-width:761px){
  .landing .fcard.on{visibility:visible;}
  .landing .fcard{transition:visibility 0s linear .45s;}
  .landing .fcard.on{transition:visibility 0s;}
  .landing .fcard .fc-in{opacity:0;transition:opacity .45s ease, transform .7s cubic-bezier(.2,.8,.2,1);transform:translateY(12px) scale(0.98);}
  .landing .fcard .fc-lead{opacity:0;transition:opacity .45s ease;}
  .landing .fcard.on .fc-in{opacity:1;transform:none;}
  .landing .fcard.on .fc-lead{opacity:1;transition-delay:.15s;}
}
/* the button between the globe and the map in the light (Sam: "just above the selected card and underneath the globe"),
   placed each frame from the hero's gap(). Red Pin, Sam's pick of three (17 Oct 2026): the hero's red ball as the button,
   rings going out from it like a pin on a map. pointing lifts the ball, pressing pushes it in. Ghost Route and Trail Sign
   are at commit 26ac058 behind ?btn=route|sign, the cream tag before them at the same commit without the switch */
.fo-explore{position:absolute;left:0;top:0;pointer-events:auto;display:inline-flex;align-items:center;gap:14px;padding:6px 18px 6px 6px;border:0;border-radius:999px;cursor:pointer;
  background:none;color:var(--c-text);font:inherit;text-align:left;opacity:0;visibility:hidden;-webkit-tap-highlight-color:transparent;}
html.mode-trek .fo-explore{opacity:0 !important;visibility:hidden !important;transition:opacity .3s ease, visibility 0s linear .3s;}
/* a soft dark ground behind it, so the label reads over the oak and the books either side */
.fo-explore::before{content:'';position:absolute;z-index:-1;inset:-18px -26px;border-radius:999px;pointer-events:none;
  background:radial-gradient(closest-side, rgba(var(--c-shade-rgb),0.78), rgba(var(--c-shade-rgb),0));}
.fo-explore .bp-ball{position:relative;display:block;width:38px;height:38px;flex:none;border-radius:50%;
  background:radial-gradient(circle at 34% 30%, #FF9A8C 0, #E5483B 26%, var(--v2-red,#D63B2F) 48%, #7E1A13 100%);
  box-shadow:0 10px 18px -6px rgba(0,0,0,0.85), inset -3px -5px 8px rgba(0,0,0,0.25);transition:transform .45s cubic-bezier(.2,1.4,.3,1), box-shadow .45s ease;}
.fo-explore .bp-ball::after{content:'';position:absolute;left:24%;top:16%;width:30%;height:22%;border-radius:50%;background:rgba(255,255,255,0.55);filter:blur(1.5px);}
.fo-explore .bp-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid var(--v2-red,#D63B2F);opacity:0;animation:bpRing 2.6s cubic-bezier(.2,.6,.3,1) infinite;}
.fo-explore .bp-ring.r2{animation-delay:1.3s;}
@keyframes bpRing{0%{transform:scale(1);opacity:0.7;}100%{transform:scale(2.3);opacity:0;}}
.fo-explore .bp-txt{display:flex;flex-direction:column;align-items:flex-start;gap:4px;line-height:1;transition:transform .5s cubic-bezier(.2,.8,.2,1);}
.fo-explore .bp-txt b{font-family:var(--f-label);font-stretch:var(--l-st,100%);font-weight:500;font-size:calc(11px*var(--l-scale,1));letter-spacing:0.2em;text-transform:uppercase;color:var(--c-text);white-space:nowrap;}
.fo-explore .bp-txt em{font-style:normal;font-family:var(--f-text);font-size:13px;color:rgba(var(--c-text-rgb),0.62);white-space:nowrap;}
.fo-explore .bp-txt em i{font-style:normal;color:var(--v2-red,#D63B2F);}
/* pointing: only where there is a real pointer, so a tap on a phone does not leave it lifted. is-hover is the scripted
   cursor's, for recordings */
@media (hover:hover){
  .fo-explore:hover .bp-ball{transform:translateY(-4px) scale(1.08);box-shadow:0 18px 24px -8px rgba(0,0,0,0.9), inset -3px -5px 8px rgba(0,0,0,0.25);}
  .fo-explore:hover .bp-ring{animation-duration:1.3s;}
  .fo-explore:hover .bp-txt{transform:translateX(3px);}
}
/* fo-map-hot: the mouse is on the map in the light, which goes in too (hero/fold.js), so the button answers as if pointed at */
.fo-explore.is-hover .bp-ball,html.fo-map-hot .fo-explore .bp-ball{transform:translateY(-4px) scale(1.08);box-shadow:0 18px 24px -8px rgba(0,0,0,0.9), inset -3px -5px 8px rgba(0,0,0,0.25);}
.fo-explore.is-hover .bp-ring,html.fo-map-hot .fo-explore .bp-ring{animation-duration:1.3s;}
.fo-explore.is-hover .bp-txt,html.fo-map-hot .fo-explore .bp-txt{transform:translateX(3px);}
.fo-explore.is-press .bp-ball,.fo-explore:active .bp-ball{transform:translateY(2px) scale(0.9);transition-duration:.12s;}
/* the keyboard's focus: a ring round the ball, in the paper colour, outside the red rings */
.fo-explore:focus{outline:none;}
.fo-explore:focus-visible .bp-ball{box-shadow:0 10px 18px -6px rgba(0,0,0,0.85), 0 0 0 3px var(--c-room,#0A1019), 0 0 0 4.5px var(--c-text);}
.fo-explore:focus-visible .bp-txt b{text-decoration:underline;text-decoration-color:var(--v2-red,#D63B2F);text-underline-offset:4px;}
.fo-explore.arriving .bp-ball,.fo-explore.arriving .bp-txt{transition:none !important;}
.fo.fo-narrow .fo-explore{gap:11px;padding:4px 14px 4px 4px;}
.fo.fo-narrow .fo-explore .bp-ball{width:32px;height:32px;}
.fo.fo-narrow .fo-explore .bp-txt b{font-size:calc(10px*var(--l-scale,1));}
.fo.fo-narrow .fo-explore .bp-txt em{font-size:12px;}
@media (prefers-reduced-motion: reduce){
  .fo-explore .bp-ring{display:none;}
  .fo-explore .bp-ball,.fo-explore .bp-txt{transition-duration:.01s !important;}
}
/* the end of the walk, in the hero's type and with the trek's own numbers */
html.mode-trek .finale-line h2{font-family:var(--f-display);font-weight:var(--d-w,400);letter-spacing:var(--d-track,-0.03em);color:var(--c-text);font-size:calc(clamp(30px,3.4vw,52px)*var(--d-scale,1)*1.3);}
html.mode-trek .finale-line h2 em{font-style:normal;color:var(--v2-red,#D63B2F);}
html.mode-trek .finale-line .k{font-family:var(--f-label);font-stretch:var(--l-st,100%);color:rgba(var(--c-text-rgb),0.6);letter-spacing:0.18em;}
`;

/* the thread before each stop: a path from where the hiker leaves the stop above (or the hero's trailhead) to where he
   steps onto this stop's sheet. a and b are those two points in the page, W the width, vh a screen. each shape gives
   anchors and whether they join straight or as a smooth curve, so no two legs look alike */
const LEGS = [
  // out of the hero: one calm curve down to the first stop's trail sign (Sam: "the red thread is too much ... just find
  // a simple walk line where he can reach Pick your length". the loop of the last version is at commit 8e01778)
  (a, b, W) => ({ curve:true, plain:true, a:[[a.x, a.y], [lerp(a.x, b.x, 0.3) + W*0.03, lerp(a.y, b.y, 0.45)], [b.x, b.y]] }),
  // a straight line, corner to corner
  (a, b) => ({ curve:false, a:[[a.x, a.y], [b.x, b.y]] }),
  // switchbacks: back and forth across the page, a staircase cut into a slope
  (a, b, W) => ({ curve:false, a:[[a.x, a.y], [W*0.86, lerp(a.y, b.y, 0.2)], [W*0.2, lerp(a.y, b.y, 0.4)], [W*0.8, lerp(a.y, b.y, 0.6)], [W*0.3, lerp(a.y, b.y, 0.8)], [b.x, b.y]] }),
  // one wide arc, out to the edge and back
  (a, b, W) => ({ curve:true, a:[[a.x, a.y], [W*0.08, lerp(a.y, b.y, 0.5)], [b.x, b.y]] }),
  // a meander round a hill
  (a, b, W) => ({ curve:true, a:[[a.x, a.y], [W*0.8, lerp(a.y, b.y, 0.25)], [W*0.32, lerp(a.y, b.y, 0.5)], [W*0.72, lerp(a.y, b.y, 0.75)], [b.x, b.y]], hill:[0.52, 0.5] }),
  // the long straight drop to the last stop
  (a, b, W) => ({ curve:false, a:[[a.x, a.y], [W*0.5, lerp(a.y, b.y, 0.15)], [W*0.5, lerp(a.y, b.y, 0.82)], [b.x, b.y]] })
];
const LEG_H = [0, 0.3, 0.45, 0.35, 0.4, 0.35];    // the gap between one box and the next, in screens

// a smooth curve through the anchors (Catmull-Rom), or straight lines, as points with their running length
function polyline(A, curve){
  const P = [];
  if(!curve || A.length < 3) A.forEach(p => P.push([p[0], p[1]]));
  else for(let i = 0; i < A.length - 1; i++){
    const p0 = A[Math.max(0, i - 1)], p1 = A[i], p2 = A[i + 1], p3 = A[Math.min(A.length - 1, i + 2)];
    for(let s = 0; s < 24; s++){
      const t = s/24, t2 = t*t, t3 = t2*t;
      const f = (a, b, c, d) => 0.5*((2*b) + (-a + c)*t + (2*a - 5*b + 4*c - d)*t2 + (-a + 3*b - 3*c + d)*t3);
      P.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if(curve && A.length >= 3) P.push(A[A.length - 1].slice());
  const L = [0];
  for(let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  return { P, L, len:L[L.length - 1] || 1 };
}
function pointAt(pl, s, out){
  const L = pl.L, P = pl.P;
  if(s <= 0){ out.x = P[0][0]; out.y = P[0][1]; out.i = 0; return out; }
  if(s >= pl.len){ out.x = P[P.length - 1][0]; out.y = P[P.length - 1][1]; out.i = P.length - 1; return out; }
  let lo = 0, hi = L.length - 1;
  while(hi - lo > 1){ const m = (lo + hi) >> 1; if(L[m] < s) lo = m; else hi = m; }
  const f = (s - L[lo])/Math.max(1e-6, L[hi] - L[lo]);
  out.x = lerp(P[lo][0], P[hi][0], f); out.y = lerp(P[lo][1], P[hi][1], f); out.i = lo;
  return out;
}

function create(){
  const SEC = window.SECTIONS, STB = window.STATIONS;
  if(!SEC || !STB) return null;
  const T = { idle:false, mode:'landing' };
  let A = null, ST = null, root = null, fo = null, btn = null, curtain = null, H = null, svg = null;
  const L = { legs:[], stops:[], vw:0, vh:0, narrow:false, trail:{ x:0, y:0 }, top:0, gap:0 };
  let entering = false, lastFo = null, past = false;
  const INK = (SEC.PAL.ink) || '#121A26', PAPER = '#ECE6DA';

  /* ---------- build ---------- */
  T.build = function(api){
    A = api;
    const st = document.createElement('style'); st.id = 'landing-css'; st.textContent = CSS; document.head.appendChild(st);
    document.documentElement.classList.add('mode-landing');
    // the landing sits straight under the hero, before the walk's own sections (which only the trek mode shows)
    root = document.createElement('div'); root.className = 'landing'; root.id = 'landing';
    document.querySelector('main > .hero').after(root);
    const stops = SEC.build(root);
    // the gap before every stop (none before the first: it comes straight up behind the hero)
    stops.forEach((s, i) => {
      const leg = document.createElement('div'); leg.className = 'leg'; leg.setAttribute('aria-hidden', 'true');
      s.before(leg);
      L.legs.push({ el:leg, shape:LEGS[i % LEGS.length], h:LEG_H[i % LEG_H.length], i });
    });
    // one drawing for every leg of thread, over the stations and under the text
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'threads'); svg.setAttribute('aria-hidden', 'true');
    root.prepend(svg);
    const fade = document.createElement('div'); fade.className = 'hero-fade'; fade.setAttribute('aria-hidden', 'true'); root.prepend(fade); T.fade = fade;
    L.legs.forEach(g => {
      const grp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      grp.innerHTML = '<g class="deco"></g><path class="ahead"/><path class="done"/>' + (g.i === 0 ? '<circle class="head" r="5"/>' : '');
      svg.appendChild(grp); g.g = grp;
    });
    ST = STB.build(api, stops);
    L.stops = stops.map((el, i) => ({ el, i, S:ST.stations[i], text:el.querySelector('.stop-text'), cards:[...el.querySelectorAll('.fcard')], cam:new A.THREE.PerspectiveCamera(34, 1, 0.5, 400), last:i === stops.length - 1 }));
    stops.forEach(el => { if(el.classList.contains('orb')){ const e = document.createElement('i'); e.className = 'box-foot'; e.setAttribute('aria-hidden', 'true'); el.querySelector('.stop-box').appendChild(e); } });
    stops.forEach((el, i) => { const nx = stops[i + 1]; if(nx && nx.classList.contains('orb')){ const e = document.createElement('i'); e.className = 'slide-edge'; e.setAttribute('aria-hidden', 'true'); el.querySelector('.stop-box').appendChild(e); } });
    H = SEC.hiker();
    curtain = document.createElement('div'); curtain.className = 'l-curtain'; document.body.appendChild(curtain);
    T.enterPending = new URLSearchParams(location.search).get('enter') === '1';
    T.divePending = new URLSearchParams(location.search).get('dive') === '1';
    if(T.enterPending) curtain.style.opacity = '1';
    L.stops.forEach(s => {
      // a leading stop's lines lie flat, folded back on their foot, until they snap up
      if(s.el.classList.contains('lead') || s.el.classList.contains('flow')){
        gsap.set(s.el.querySelectorAll('.stop-text .stop-kick, .stop-text h2 .ln > span'), { rotationX:88, autoAlpha:0, transformPerspective:700, transformOrigin:'50% 88%' });
        gsap.set(s.el.querySelectorAll('.stop-lede, .stop-more'), { autoAlpha:0, y:14 });
        return;
      }
      gsap.set(s.el.querySelectorAll('.stop-text h2 .ln > span'), { yPercent:112 });
      gsap.set(s.el.querySelectorAll('.stop-kick, .stop-lede, .stop-more'), { autoAlpha:0, y:14 });
    });
    // the button between the globe and the map in the light, in the hero's own layer so it leaves with it
    fo = document.querySelector('.fo');
    if(fo){
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fo-explore';
      btn.innerHTML = '<span class="bp-ball" aria-hidden="true"><i class="bp-ring"></i><i class="bp-ring r2"></i></span>' +
        '<span class="bp-txt"><b>Explore the trail</b><em aria-hidden="true">Go in at the <i>pin</i></em></span>';
      btn.setAttribute('aria-label', 'Explore the trail: go in at the pin and walk the map');
      fo.appendChild(btn);
      btn.addEventListener('click', () => T.enter());
      T.ball = btn.querySelector('.bp-ball');
      // it arrives as the hero's intro ends: the ball drops onto the table and bounces once, then the label slides out
      const delay = 2.6;
      if(A.REDUCED) gsap.set(btn, { autoAlpha:1 });
      else {
        const txt = btn.querySelector('.bp-txt');
        gsap.set(btn, { autoAlpha:1 });
        btn.classList.add('arriving');   // the CSS transitions would drag behind the drop
        gsap.fromTo(T.ball, { y:-70, opacity:0 }, { y:0, opacity:1, duration:1.0, delay, ease:'bounce.out', clearProps:'transform,opacity', onComplete:() => btn.classList.remove('arriving') });
        gsap.fromTo(txt, { x:-10, opacity:0 }, { x:0, opacity:1, duration:0.8, delay:delay + 0.5, ease:'power3.out', clearProps:'transform,opacity' });
      }
      // the scripted cursor's pointer events never reach :hover, so the button also answers to classes
      window.addEventListener('pointermove', (e) => { const on = !!(e.target && e.target.closest && e.target.closest('.fo-explore')); if(on !== btn._hov){ btn._hov = on; btn.classList.toggle('is-hover', on); } }, { passive:true });
      btn.addEventListener('pointerdown', () => btn.classList.add('is-press'));
      window.addEventListener('pointerup', () => btn.classList.remove('is-press'), { passive:true });
    }
    endScreen();
    wire();
    // each station is drawn once into a tiny target in the first frames, so its textures and pipelines are on the GPU
    // before it first shows (V6: a first draw on ANGLE Metal stalled the page 0.4 to 0.6 s)
    T.warm = ST.stations.length;
    T.warmRT = new A.THREE.WebGLRenderTarget(64, 64);
  };
  T.away = function(){ return T.mode === 'landing' && window.scrollY > L.vh*0.5; };

  /* the walk's end in the trek mode: the trek's own numbers in the finale line, then the map folds itself shut and the
     page goes back to the hero with it in the light (back, below). The wheel of five maps with its arrows and buttons
     that stood here before is at commit 334ab77 (Sam, 18 Oct: "it feels disconnected at the end ... make it a loop") */
  const BK = { i:0 };
  function endScreen(){ BK.i = window.FOLD_WALK_I || 0; fillEnd(BK.i, true); }
  // the shut map's cover is the hero's No. 01 too: it takes another trek's at the end of that trek's walk, and goes back
  function coverFor(i){
    const K = window.HERO_KIT, C = A.COVER; if(!K || !C || !C.map || BK.cov === i) return;
    BK.cov = i; C.map.image = K.drawCover(i, K.NAMES.foldline, 600, 800); C.map.needsUpdate = true;
  }
  T.coverFor = coverFor;
  function fillEnd(i, first){
    const t = (window.TREKS || [])[i];
    if(!t) return;
    const fin = document.getElementById('finaleLine');
    const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if(fin && first) fin.innerHTML = '<p class="k">' + t.start.name + ' ' + fmt(t.start.m) + '&nbsp;m &nbsp; to &nbsp; ' + t.end.name + ' ' + fmt(t.end.m) + '&nbsp;m</p>' +
      '<h2 id="h-fin">' + (t.days === 1 ? 'One day' : t.days + ' days') + ', ' + t.km + '&nbsp;km, <em>' + (t.days === 1 ? 'and a shuttle at the end.' : t.nights.length + ' nights on the trail.') + '</em></h2>';
  }

  function wire(){
    // the enquiry: nothing leaves the page, it is a design study
    const form = root.querySelector('.enq');
    if(form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.name.value.trim(), mail = form.elements.email.value.trim();
      const done = form.querySelector('.enq-done');
      if(!name || !/.+@.+\..+/.test(mail)){ done.hidden = false; done.textContent = 'We need a name and an email to write back to.'; return; }
      const trek = form.elements.trek.selectedOptions[0].textContent.split(' · ')[0];
      done.hidden = false; done.textContent = 'Thanks, ' + name.split(' ')[0] + '. We will write back about ' + trek + ' within two working days.';
      form.querySelector('.enq-go').disabled = true;
    });
    // the footer's maps go back up to the hero and turn the table to that trek
    root.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if(!a) return;
      const href = a.getAttribute('href') || '';
      if(a.dataset.trek){ e.preventDefault(); goTo(0, () => { if(A.HK && A.HK.select) A.HK.select(+a.dataset.trek); }); return; }
      if(href[0] === '#' && href.length > 1){ const el = document.querySelector(href); if(el){ e.preventDefault(); goTo(el); } }
    });
  }

  function goTo(target, done){
    const y = typeof target === 'number' ? target : stopY(target);
    const lenis = A.lenis;
    if(lenis) lenis.scrollTo(y, { duration:A.REDUCED ? 0 : Math.min(3.2, 0.8 + Math.abs(y - window.scrollY)/4000), onComplete:done || undefined });
    else { window.scrollTo(0, y); if(done) done(); }
  }
  // a stop's place: its box just pinned, its heading up
  function stopY(el){
    const s = L.stops.find(q => q.el === el);
    if(s) return s.top + 2;
    return el.getBoundingClientRect().top + window.scrollY;
  }

  /* ---------- modes ---------- */
  function setMode(m){
    if(T.mode === m) return;
    T.mode = m;
    // back on the hero and the page: whatever a mid-dive page put off is done now
    if(m === 'landing' && window.FL_LATER){ const L2 = window.FL_LATER; window.FL_LATER = null; while(L2.length) L2.shift()(); }
    const h = document.documentElement;
    h.classList.toggle('mode-landing', m === 'landing'); h.classList.toggle('mode-trek', m === 'trek');
    A.camera.clearViewOffset();
    if(fo) fo.style.transform = ''; lastFo = null;
    L.stops.forEach(s => { ST.light(s.S, 0); s.S.group.visible = false; });
    H.show(false); T.idle = false;
    if(m === 'trek') A.HIKER.group.visible = true;
    // the walk map is the walked trek's slot on the hero's table (No. 01 on Tongariro's page): its cover in both modes
    coverFor(WALK_I);
    window.ScrollTrigger && window.ScrollTrigger.refresh();
    if(A.lenis && A.lenis.resize) A.lenis.resize();
    T.resize();
  }
  /* ---- the five walks (V7, 18 Oct). Each page walks one trek (?walk=, Tongariro without it), and that trek's slot on the
     hero's table is the walk's own folded map. Picking another fades to the room and reloads into it; the page comes
     up on the hero with that map in the light and dives in through its pin (19 Oct: every trek dives, not only No. 01) ---- */
  const WALK_I = window.FOLD_WALK_I || 0;
  const heroSel = () => { const F = window.FOLD; return F && F.SW ? F.SW.sel : 0; };
  function walkTo(i){
    const t = (window.TREKS || [])[i]; if(!t) return;
    gsap.to(curtain, { opacity:1, duration:A.REDUCED ? 0 : 0.45, ease:'power2.in', onComplete:() => {
      const u = new URL(location.href);
      if(i === 0) u.searchParams.delete('walk'); else u.searchParams.set('walk', t.key);
      u.searchParams.set('enter', '1');
      location.href = u.toString();
    } });
  }
  T.walkTo = walkTo;
  /* a pick on another trek (Sam, 19 Oct: "it should zoom into that red pin right away, no loading, one continuous
     motion"). Each walk is its own page, so the swap hides inside the dive: the camera falls onto the picked map's pin
     here, the pin's red head fills the screen, the page swaps to that walk under the same red (?dive=1), and the new page
     pulls straight out of the red head into the walk (divePending in T.frame) */
  // the work a page opened mid-dive put off (the hero's covers, the FAQ's map): one piece at a time once the walk is still
  function later(){
    const L2 = window.FL_LATER; if(!L2) return;
    const step = () => { if(!L2.length){ window.FL_LATER = null; return; } L2.shift()(); setTimeout(step, 90); };
    setTimeout(step, 250);
  }
  function diveTo(i){
    const t = (window.TREKS || [])[i]; if(!t) return;
    entering = true;
    if(window.FOLD && window.FOLD.dive) window.FOLD.dive(i);
    const go = () => {
      setMode('trek');
      A.lenis && A.lenis.scrollTo(0, { immediate:true, force:true }); window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        const hp = A.heroPx(), D = A.REDUCED ? 0 : 1.75;
        const swap = () => {
          const u = new URL(location.href);
          if(i === 0) u.searchParams.delete('walk'); else u.searchParams.set('walk', t.key);
          u.searchParams.delete('enter'); u.searchParams.set('dive', '1');
          location.href = u.toString();
        };
        if(A.REDUCED){ document.documentElement.classList.add('fl-red'); swap(); return; }
        if(A.lenis) A.lenis.scrollTo(Math.round(hp*0.585), { duration:D, easing:(x) => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2, lock:true, force:true });
        // the red opens out of the picked map's pin head, wherever it is on the screen at that moment
        gsap.delayedCall(D - 0.44, () => {
          const h = document.documentElement, M = window.FOLD && window.FOLD.MAPS && window.FOLD.MAPS[i], P = M && M.model && M.model.pin;
          if(P && P.head){
            const v = new A.THREE.Vector3(), e = new A.THREE.Vector3();
            P.head.getWorldPosition(v); e.copy(v); v.project(A.camera);
            const g = P.head.geometry, r = (g && g.parameters && g.parameters.radius) || (g && g.boundingSphere && g.boundingSphere.radius) || 0.1;
            e.x += r*P.head.getWorldScale(new A.THREE.Vector3()).x; e.project(A.camera);
            const sx = (v.x + 1)*0.5*innerWidth, sy = (1 - v.y)*0.5*innerHeight, sr = Math.max(12, Math.abs((e.x - v.x)*0.5*innerWidth));
            if(v.z < 1){ h.style.setProperty('--rx', Math.round(sx) + 'px'); h.style.setProperty('--ry', Math.round(sy) + 'px'); h.style.setProperty('--r0', Math.round(sr) + 'px'); }
          }
          h.classList.add('fl-red');
        });
        gsap.delayedCall(D, swap);
      });
    };
    if(window.scrollY > 4) goTo(0, go); else go();
  }
  T.enter = function(){
    if(T.mode === 'trek' || entering) return;
    // a walk other than the one loaded: reload into it (the page comes back on the hero with that map in the light and
    // dives in). The dive goes into the walk map, whichever trek it is
    const sel = heroSel();
    if(sel !== WALK_I){ diveTo(sel); return; }
    entering = true;
    const go = () => {
      setMode('trek');
      A.lenis && A.lenis.scrollTo(0, { immediate:true, force:true });
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        const y = A.heroPx() + 2;
        if(A.lenis) A.lenis.scrollTo(y, { duration:A.REDUCED ? 0 : 4.4, easing:(t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2, lock:true, force:true, onComplete:() => { entering = false; } });
        else { window.scrollTo(0, y); entering = false; }
      });
    };
    if(window.scrollY > 4) goTo(0, go); else go();
  };
  /* ---- the way back (Sam, 18 Oct: "fold it back and connect to the hero at the same selected position, so it's a
     loop"). Once the walk's map has folded itself shut, the page goes back to the hero at the top with that map in the
     light. The first frame is the walk's last shot (the hero's camera blends from the walk's own, FOLD_RETURN.w = 1), the
     table and the other maps around the shut map; then the camera rises out to the hero's shot while the map's mountain
     springs up and the hero's type fades in. From there: pick another trek, explore it, or scroll down the page ---- */
  const RET = { on:false, t:0 };
  // the turntable straight onto a map, no turn (hero/switch.js snap); the hero's own select turns it if there is no snap
  const snapTo = (i) => { const SW = window.FOLD && window.FOLD.SW; if(SW && SW.snap) SW.snap(i); else if(A.HK && A.HK.select) A.HK.select(i); };
  function back(){
    RET.on = true; RET.t = 0;
    const R = window.FOLD_RETURN = { on:true, w:1 }, h = document.documentElement;
    if(A.REDUCED){ R.w = 0; R.on = false; toLanding(0); snapTo(WALK_I); RET.on = false; return; }
    if(A.lenis) A.lenis.stop();
    // a breath through the room's dark while the walk's spotlit table becomes the hero's turntable round the shut map
    gsap.to(curtain, { opacity:0.42, duration:0.2, ease:'power1.in', onComplete:() => {
      h.classList.add('fl-return');
      snapTo(WALK_I);
      R.snap = true; requestAnimationFrame(() => requestAnimationFrame(() => { R.snap = false; }));
      setMode('landing');
      A.HXS.t = A.HXS.s = 0; A.P.t = A.P.s = 0;
      A.lenis && A.lenis.scrollTo(0, { immediate:true, force:true }); window.scrollTo(0, 0);
      // the walked trek is punched into the 06 ticket, ready if they go to book it
      const tk = (window.TREKS || [])[WALK_I]; if(tk && window.BOOK_STOP && window.BOOK_STOP.pick) window.BOOK_STOP.pick(tk.key);
      gsap.to(curtain, { opacity:0, duration:0.75, ease:'power1.out' });
      ret();
    } });
    const ret = () => gsap.to(R, { w:0, duration:2.8, delay:0.25, ease:'power2.inOut',
      onUpdate(){ if(R.w < 0.4 && h.classList.contains('fl-return')){ h.classList.add('fl-return-in'); h.classList.remove('fl-return'); } },
      onComplete(){ R.on = false; RET.on = false; if(A.lenis) A.lenis.start(); setTimeout(() => h.classList.remove('fl-return-in'), 1100); } });
  }
  T.back = back;
  function toLanding(target, trekKey, trekI){
    gsap.to(curtain, { opacity:1, duration:A.REDUCED ? 0 : 0.35, ease:'power2.in', onComplete:() => {
      coverFor(0);
      setMode('landing');
      A.HXS.t = A.HXS.s = 0; A.P.t = A.P.s = 0;
      const el = typeof target === 'string' ? document.querySelector(target) : null;
      const y = el ? stopY(el) : 0;
      A.lenis && A.lenis.scrollTo(y, { immediate:true, force:true }); window.scrollTo(0, y);
      if(trekKey){ const sel = root.querySelector('.enq select[name=trek]'); if(sel) sel.value = trekKey; else if(window.BOOK_STOP && window.BOOK_STOP.pick) window.BOOK_STOP.pick(trekKey); }
      if(trekI !== undefined && A.HK && A.HK.select) A.HK.select(trekI);
      gsap.to(curtain, { opacity:0, duration:A.REDUCED ? 0 : 0.6, delay:0.15, ease:'power2.out' });
    } });
  }
  // named places for recordings: f of the way through stop i's hold, or f of the way along the leg before it
  T.at = function(i, f){ const s = L.stops[i]; return s ? lerp(s.top, s.pinEnd, f) : 0; };
  T.leg = function(i, f){ const g = L.legs[i]; return g ? lerp(g.y0, g.y1, f) : 0; };
  T.book = function(){ if(T.mode === 'trek') toLanding('#book'); else goTo(document.getElementById('book')); };
  T.home = function(){ if(T.mode === 'trek') toLanding(0); else goTo(0); };
  // a section by its place in the landing (-1 is the top): the header's tabs use it (sections/nav.js)
  T.go = function(i){ const s = i >= 0 ? L.stops[i] : null; if(T.mode === 'trek'){ toLanding(s ? '#' + s.el.id : 0); return; } goTo(s ? s.el : 0); };
  T.scroll = function(){ return T.mode === 'landing' ? { hx:0, p:0 } : null; };
  T.cam = function(){};

  /* ---------- layout ---------- */
  // the layout is measured with nothing sticky, so it reads the same at any scroll. a sticky box measured while the page
  // is scrolled past it reads where it is stuck, not where it starts (Sam, 19 Oct: back from a walk by the logo, the
  // first two stops had a hold of zero length, the lengths stop raced and the globe never turned)
  T.resize = function(){
    if(!A) return;
    root.classList.add('l-measure');
    try{ layout(); } finally { root.classList.remove('l-measure'); }
  };
  function layout(){
    const vw = window.innerWidth, vh = window.innerHeight, narrow = vw < 761;
    L.vw = vw; L.vh = vh; L.narrow = narrow;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    // each station's camera, fitted to its place in the box: big, right of the text (the first one bigger still), or
    // across the top half on a phone
    L.stops.forEach(s => {
      s.flow = s.el.classList.contains('flow');
      if(s.flow){
        s.lead = false; s.orb = false; s.poses = null; s.el.style.marginTop = ''; s.el.style.setProperty('--stop-h', '');
        s.entry = { x:vw*0.5, y:0 }; s.exit = { x:vw*0.5, y:vh*0.9 };
        // the guides in sets that share one row: four to a set on a wide screen, two on a phone. every set sits in the
        // same cells, a later set over an earlier one, and the row is frozen for as long as the sets take to open
        const pgs = [...s.el.querySelectorAll('.pg')], per = narrow ? 2 : 4;
        s.pg = pgs.map((el, k) => {
          el.style.gridColumn = String(k % per + 1); el.style.zIndex = String(1 + Math.floor(k/per));
          el.style.setProperty('--d', ((k % per)*0.1).toFixed(2) + 's');
          return { el, set:Math.floor(k/per), up:null, open:null, under:null };
        });
        s.sets = Math.ceil(pgs.length/per);
        const stage = s.el.querySelector('.pol-stage'), pin = s.el.querySelector('.pol-pin');
        if(stage && pin){
          // the text and the row freeze together, so the whole frame is fitted to the screen under the header, scaled
          // down from its top if it is taller
          stage.style.height = ''; pin.style.transform = '';
          s.pinH = pin.offsetHeight;
          const head = narrow ? 80 : 98, room = vh - head - (narrow ? 10 : 22);
          s.pinK = Math.min(1, room/s.pinH);
          pin.style.transform = s.pinK < 1 ? 'scale(' + s.pinK.toFixed(4) + ')' : '';
          s.pinTop = Math.round(head + Math.max(0, (room - s.pinH*s.pinK)*0.5));
          s.step = Math.round(vh*(narrow ? 0.8 : 0.95));
          const WO = [window.WHEN_STOP, window.FAQ_MAP, window.BOOK_STOP].find(o => o && o.owns(s.el)) || null;
          s.wo = WO;
          s.pinLen = WO ? Math.round(vh*WO.pinLen(narrow)) : Math.round((s.sets - 1)*s.step + vh*0.5);
          pin.style.top = s.pinTop + 'px';
          stage.style.height = Math.round(s.pinH + s.pinLen) + 'px';
          s.stage = stage; s.pin = pin;
        }
        return;
      }
      const fov = narrow ? 40 : 32, aspect = vw/vh;
      // the lengths stop is what sells the section (Sam: "don't be afraid to expand more"): its scenes take most of the
      // screen under a row of cards, the text beside them is the introduction
      // a focusing stop (the lengths, Sam 18 Oct: "zoom it a little bit more ... the whole remaining space of the right
      // side") frames one scene at a time between the text and its card, and pans from scene to scene
      const R = narrow ? (s.S.focus ? { x0:0.0, x1:1.0, y0:0.1, y1:0.6 } : s.S.orb ? { x0:0.0, x1:1.0, y0:0.08, y1:0.6 } : { x0:0.03, x1:0.97, y0:0.09, y1:0.5 })
                       : s.S.focus ? { x0:0.33, x1:0.8, y0:0.08, y1:0.98 } : s.S.orb ? { x0:0.34, x1:0.78, y0:0.09, y1:0.98 } : { x0:0.37, x1:0.99, y0:0.3, y1:0.97 };
      const V = () => new A.THREE.Vector3(), half = [R.x1 - R.x0, R.y1 - R.y0];
      s.poses = s.S.focus ? [0, 1, 2].map(k => ST.posePart(s.S, k, aspect, half, { pos:V(), tgt:V(), fov })) : null;
      const P = s.poses ? s.poses[0] : (s.S.orb ? ST.poseOrb : ST.pose)(s.S, aspect, half, { pos:V(), tgt:V(), fov });
      const c = s.cam; c.fov = fov; c.aspect = aspect; c.near = 0.5; c.far = 400;
      c.position.copy(P.pos); c.lookAt(P.tgt);
      s.offX = -vw*((R.x0 + R.x1)*0.5 - 0.5); s.offY = -vh*((R.y0 + R.y1)*0.5 - 0.5);
      c.setViewOffset(vw, vh, s.offX, s.offY, vw, vh);
      c.updateMatrixWorld(); c.updateProjectionMatrix();
      if(s.S.focus){ s.X = [0, 1, 2].map(k => ST.sceneX(s.S, k)); s.signX = -s.S.SW*0.5 + 1.1; }
      // a flipping station's cards are all as tall as the tallest
      if(s.S.flip || s.S.orb){ const ins = s.cards.map(c => c.querySelector('.fc-in')); ins.forEach(e => { e.style.minHeight = ''; }); const mh = Math.max(...ins.map(e => e.offsetHeight)); ins.forEach(e => { e.style.minHeight = mh + 'px'; }); }
      // where the hiker steps on and off, on screen while the box is held
      s.entry = scr(c, ST.at(s.S, 0, new A.THREE.Vector3()));
      // a focusing stop is left from its last scene
      if(s.poses){ c.position.copy(s.poses[2].pos); c.lookAt(s.poses[2].tgt); c.updateMatrixWorld(); }
      s.exit = scr(c, s.S.orb ? ST.orbPin(s.S, new A.THREE.Vector3()) : ST.at(s.S, 1, new A.THREE.Vector3()));
      if(s.poses){ c.position.copy(P.pos); c.lookAt(P.tgt); c.updateMatrixWorld(); }
      // how long the box holds: room to cross the sheet and read the cards, or the whole text when it is long
      s.el.classList.remove('tall');
      const th = s.text.offsetHeight;
      s.lead = s.el.classList.contains('lead');
      const tall = !narrow && !s.lead && th > vh*0.8;
      s.el.classList.toggle('tall', tall);
      // a focusing stop holds longer: three scenes and two pans across the sheet
      // the orb holds for its five turns, and on a wide screen for the slide going off it first
      const hold = vh*(s.S.focus ? (narrow ? 2.2 : 2.8) : s.S.orb ? (narrow ? 3.0 : 1.04 + 3.4) : s.S.flip ? 1.7 : s.cards.length > 3 ? 1.35 : 1.1);
      s.el.style.setProperty('--stop-h', narrow ? '' : Math.round(vh + Math.max(hold, tall ? th - vh*0.3 : 0)) + 'px');
      // on a phone a focusing stop's text comes first and its box holds under it for the three scenes
      s.el.style.setProperty('--hold', narrow && (s.S.focus || s.S.orb) ? Math.round(hold) + 'px' : '');
      // on a wide screen the orb waits behind the stop before it: it starts a screen early, so its box is already holding
      // when the stop before starts to leave, and that stop slides up off it (Sam, 18 Oct: "the globe already is hidden
      // behind that slide, so when the slide disappears the globe is already in place")
      s.orb = !!s.S.orb;
      s.el.style.marginTop = s.orb && !narrow ? -vh + 'px' : '';
    });
    // the first gap is breathing room under the hero, where its turntable runs on and fades into the room before the
    // first headline (Sam, 18 Oct: "the headline is too close to the hero ... let the layout finish naturally")
    L.gap = Math.round(vh*(narrow ? 0.14 : 0.26));
    root.style.setProperty('--l-gap', L.gap + 'px');
    // no thread into the orb, and no gap: the stop before is a slide over it
    L.legs.forEach(g => {
      const into = L.stops[g.i];
      if(into && into.S.orb){ g.off = true; g.g.style.display = 'none'; }
      g.el.style.height = (g.i === 0 ? L.gap : into && into.S.orb ? 0 : into && into.el.classList.contains('flow') ? Math.round(vh*0.1) : Math.round(g.h*vh)) + 'px';
    });
    L.top = docTop(root);
    // now the page has its height: where every box starts holding and lets go
    L.stops.forEach(s => {
      s.head = docTop(s.el); s.top = s.flow ? s.head : docTop(s.el.querySelector('.stop-box')); s.pinEnd = s.head + s.el.offsetHeight - vh;
      // the row freezes when the stage reaches its place; the first set opens on the way there
      if(s.flow && s.stage){
        s.stageTop = docTop(s.stage); s.pinStart = s.stageTop - s.pinTop;
        const ul = s.el.querySelector('.pols');
        s.rowTop = ul ? s.stageTop + (ul.getBoundingClientRect().top - s.pin.getBoundingClientRect().top) : s.stageTop;
      }
      // the orb starts turning once the slide is off it
      s.u0 = s.top + (s.orb && !narrow ? Math.round(vh*1.04) : 0);
      // where each headline line sits in the text, for when it snaps up (the text's own top is the stop's top on both
      // layouts: beside the box on a wide screen, before it on a phone)
      if(s.lead || s.flow){
        const t0 = s.text.getBoundingClientRect().top;
        s.lineOff = [...s.text.querySelectorAll('.stop-kick, h2 .ln')].map(l => l.getBoundingClientRect().top - t0);
        s.restOff = s.text.querySelector('.stop-lede').getBoundingClientRect().top - t0;
      }
    });
    L.trail = { x:vw*0.5, y:vh - (narrow ? 22 : 14) };
    L.foot = root.querySelector('.foot');
    svg.setAttribute('width', vw); svg.setAttribute('height', Math.max(1, root.offsetHeight));
    L.legs.forEach(drawLeg);
    // the thread from the hero to the first stop is off for now (Sam, 18 Oct: "remove the red thread, I will add it later,
    // it feels disconnected"). the hiker waits at the first stop's sign instead
    L.legs[0].off = true; L.legs[0].g.style.display = 'none';
  }
  const _p = { v:null };
  function scr(cam, w){
    if(!_p.v) _p.v = new A.THREE.Vector3();
    _p.v.copy(w).project(cam);
    return { x:(_p.v.x + 1)*0.5*L.vw, y:(1 - _p.v.y)*0.5*L.vh };
  }

  // a leg: from the stop above as it lets go (or the hero's trailhead) to this stop as it starts holding, in page
  // coordinates. the hiker covers it at an even pace between those two moments of the scroll
  function drawLeg(g){
    const vw = L.vw, vh = L.vh, i = g.i, s = L.stops[i];
    const prev = L.stops[i - 1];
    g.y0 = i === 0 ? vh*0.04 : prev.pinEnd;        // the scroll at which he sets off
    g.y1 = s.top;                                   // and arrives, as the box takes hold
    const a = i === 0 ? { x:L.trail.x, y:L.trail.y } : { x:prev.exit.x, y:prev.pinEnd + prev.exit.y };
    const b = { x:s.entry.x, y:s.top + s.entry.y };
    let sh = g.shape(a, b, vw, vh);
    g.stay = 0; g.pinS = undefined;
    if(s.flow){
      // into a flowing stop (Sam, 18 Oct: "from the blue dot ... not a straight line but a curved line, towards the
      // headline"): out to the side and back in to just left of the eyebrow, arriving as it nears the middle of the screen
      const k = s.text.querySelector('.stop-kick .lk') || s.text.querySelector('h2'), kr = k.getBoundingClientRect();
      const pr = s.pin ? s.pin.getBoundingClientRect() : { top:kr.top - (s.stageTop - window.scrollY) };
      b.x = Math.max(24, kr.left - (L.narrow ? 22 : 44)); b.y = (s.stageTop || 0) + (kr.top - pr.top) + kr.height*0.5;
      g.y1 = b.y - vh*0.42;
      const dy = b.y - a.y, side = L.narrow ? vw*0.08 : Math.max(vw*0.1, Math.min(vw*0.18, b.x - vw*0.14));
      sh = { curve:true, plain:true, a:[[a.x, a.y], [lerp(a.x, side, 0.6), a.y + dy*0.26], [side, a.y + dy*0.6], [lerp(side, b.x, 0.55), b.y + dy*0.02], [b.x, b.y]] };
      // he stays by the eyebrow, frozen with it while the frame is, and leaves the screen with it
      g.pinS = s.pinStart; g.pinL = s.pinLen || 0;
      g.stay = b.y + 120 + g.pinL - g.y1;
    }
    if(i === 0 && s.lead){
      // round the headline: down to just over its kicker, out past its left edge, down its side and on to the sign
      const h2 = s.text.querySelector('h2').getBoundingClientRect(), kick = (s.text.querySelector('.stop-kick') || s.text.querySelector('h2')).getBoundingClientRect(), lede = s.text.querySelector('.stop-lede').getBoundingClientRect();
      const top = kick.top + window.scrollY - 34, bot = lede.bottom + window.scrollY + 40;
      const side = L.narrow ? 14 : Math.max(28, Math.min(h2.left, lede.left) - 64);
      sh = { curve:true, plain:true, a:[[a.x, a.y], [lerp(a.x, side, 0.45), lerp(a.y, top, 0.6)], [side + (L.narrow ? 0 : 20), lerp(top, bot, 0.35)], [side, lerp(top, bot, 0.8)], [lerp(side, b.x, 0.5), lerp(bot, b.y, 0.45)], [b.x, b.y]] };
    }
    sh.a.forEach(p => { p[0] = Math.max(18, Math.min(vw - 18, p[0])); });
    g.pl = polyline(sh.a, sh.curve);
    const rel = (y) => (y - L.top).toFixed(1);
    const d = g.pl.P.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + rel(p[1])).join('');
    g.g.querySelector('.ahead').setAttribute('d', d);
    g.done = g.g.querySelector('.done'); g.doneI = -1;
    const head = g.g.querySelector('.head'); if(head){ head.setAttribute('cx', a.x.toFixed(1)); head.setAttribute('cy', rel(a.y)); }
    // beside the thread: tussocks and stones, a hill's contour rings for the meander, a cairn now and then
    const R = rnd(11 + i*7);
    let deco = '';
    if(sh.hill){
      const hx = vw*sh.hill[0], hy = lerp(a.y, b.y, sh.hill[1]) - L.top;
      for(let r = 1; r <= 7; r++) deco += '<ellipse class="ring" cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" rx="' + (r*vw*0.035).toFixed(1) + '" ry="' + (r*vw*0.024).toFixed(1) + '" transform="rotate(-12 ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ')"/>';
    }
    const _q = {};
    for(let sd = 140; !sh.plain && sd < g.pl.len - 120; sd += 120 + R()*220){
      pointAt(g.pl, sd, _q);
      const x = _q.x + (R() < 0.5 ? -1 : 1)*(16 + R()*28), yy = _q.y - L.top, k = R();
      if(k < 0.55){ let t = ''; const h = 8 + R()*9; for(let bb = -2; bb <= 2; bb++) t += 'M' + (x + bb*1.8).toFixed(1) + ' ' + yy.toFixed(1) + ' L' + (x + bb*3.6).toFixed(1) + ' ' + (yy - h*(1 - Math.abs(bb)*0.18)).toFixed(1) + ' '; deco += '<path class="tus" d="' + t + '"/>'; }
      else if(k < 0.9) deco += '<path class="stn" d="M' + (x - 7).toFixed(1) + ' ' + yy.toFixed(1) + ' Q' + (x - 6).toFixed(1) + ' ' + (yy - 7).toFixed(1) + ' ' + x.toFixed(1) + ' ' + (yy - 8).toFixed(1) + ' Q' + (x + 7).toFixed(1) + ' ' + (yy - 6).toFixed(1) + ' ' + (x + 8).toFixed(1) + ' ' + yy.toFixed(1) + ' Z"/>';
      else { let c = ''; for(let q = 0; q < 4; q++){ const w = 9 - q*2; c += '<ellipse class="cairn" cx="' + x.toFixed(1) + '" cy="' + (yy - q*5).toFixed(1) + '" rx="' + w + '" ry="3"/>'; } deco += c; }
    }
    g.g.querySelector('.deco').innerHTML = deco;
  }
  // the walked part of a leg in red, up to the hiker
  function walked(g, i){
    if(i === g.doneI) return;
    g.doneI = i;
    const P = g.pl.P, n = Math.max(0, Math.min(P.length - 1, i + 1));
    let d = '';
    for(let k = 0; k <= n; k++) d += (k ? 'L' : 'M') + P[k][0].toFixed(1) + ' ' + (P[k][1] - L.top).toFixed(1);
    g.done.setAttribute('d', d);
  }

  // a focusing stop's scroll: hold on scene 0, pan, hold on scene 1, pan, hold on scene 2
  const HOLD = [[0, 0.24], [0.4, 0.6], [0.76, 1]];
  // the orb: hold on each of the five a little longer than each turn between them takes
  const OR = 1/11, OH = 1.4/11;
  function orbOf(u){
    const k = Math.min(4, Math.floor(u/(OH + OR))), l = u - k*(OH + OR);
    return k >= 4 || l <= OH ? k : k + smooth(seg(l, OH, OH + OR));
  }
  // what the springs see: nothing until the box holds (the map comes up bare, the hiker at its sign), then the first
  // scene's pieces pop up one by one over the first bit of scroll (Sam, 18 Oct: "place the map in position, and then
  // when we start scrolling a little bit, the one day animation will pop up"), then the focus
  function popOf(s, y){ return y < s.top ? -1 : s.u < 0.14 ? lerp(-0.6, 0, seg(s.u, 0.015, 0.11)) : s.f; }
  function focusOf(u){
    if(u <= HOLD[0][1]) return 0;
    if(u < HOLD[1][0]) return smooth(seg(u, HOLD[0][1], HOLD[1][0]));
    if(u <= HOLD[1][1]) return 1;
    if(u < HOLD[2][0]) return 1 + smooth(seg(u, HOLD[1][1], HOLD[2][0]));
    return 2;
  }
  // the camera between two scenes' poses: the map scrolls sideways under the walker (Sam: "the map can be horizontal
  // scrolling")
  const _pp = {};
  function poseAt(s){
    if(!_pp.a){ _pp.a = new A.THREE.Vector3(); _pp.b = new A.THREE.Vector3(); }
    const k = Math.min(1, Math.floor(s.f)), t = s.f - k, P0 = s.poses[k], P1 = s.poses[k + 1];
    _pp.a.lerpVectors(P0.pos, P1.pos, t); _pp.b.lerpVectors(P0.tgt, P1.tgt, t);
    s.cam.position.copy(_pp.a); s.cam.lookAt(_pp.b); s.cam.updateMatrixWorld();
  }
  // where along the sheet the walker is: from the sign, slowly past each scene while it is held, quicker between them
  function walkX(s, u){
    const X = s.X, K = [[0, s.signX], [HOLD[0][1], X[0] + 0.4], [HOLD[1][0], X[1] - 1.3], [HOLD[1][1], X[1] + 0.4], [HOLD[2][0], X[2] - 1.3], [1, X[2] + 0.6]];
    for(let i = 0; i < K.length - 1; i++) if(u <= K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], seg(u, K[i][0], K[i + 1][0]));
    return K[K.length - 1][1];
  }
  // a leading stop's headline: each line lies flat and snaps up like a paper cut-out as the stop comes in, one after the
  // other, then the subtitle (Sam, 18 Oct: "it starts hidden and as we scroll it snaps into place like those cutouts")
  // the guides: the text first, then the first set's Polaroids hinge up from the line under them, then their bios hinge
  // down from it (Sam: "the eyebrow, the headline and the description first ... then the Polaroids ... and the
  // description of all of them"). while the row is frozen each next set opens the same way over the last
  function guidesAt(s, y, vh){
    const st = [];
    for(let j = 0; j < s.sets; j++){
      const up = j === 0 ? y > s.rowTop - vh*0.74 : y > s.pinStart + (j - 1)*s.step + vh*0.3;
      const open = j === 0 ? y > Math.min(s.rowTop - vh*0.56, s.pinStart) : y > s.pinStart + (j - 1)*s.step + vh*0.46;
      st.push({ up, open });
    }
    for(const p of s.pg){
      // (the sets under stay: Sam, 18 Oct: "the previous four doesn't disappear")
      const S = st[p.set];
      if(S.up !== p.up){ p.up = S.up; p.el.classList.toggle('up', S.up); }
      if(S.open !== p.open){ p.open = S.open; p.el.classList.toggle('open', S.open); }
    }
  }
  function snapLines(s){
    if(!s.lineOff) return;
    const lines = s.lines || (s.lines = [...s.el.querySelectorAll('.stop-text .stop-kick, .stop-text h2 .ln > span')]);
    const rest = s.rest || (s.rest = s.el.querySelectorAll('.stop-lede, .stop-more'));
    const y = window.scrollY, vh = L.vh, n = lines.length;
    const behind = s.orb && !L.narrow;
    lines.forEach((ln, k) => {
      const on = behind ? y > s.top + vh*(0.84 + 0.06*k) : s.flow ? y > s.head + s.lineOff[k] - vh*(0.8 - 0.05*k) : y > s.head + s.lineOff[k] - vh*(0.68 - 0.1*k);
      if(ln._on === on) return;
      ln._on = on;
      if(A.REDUCED) gsap.set(ln, { rotationX:on ? 0 : 88, autoAlpha:on ? 1 : 0 });
      else gsap.to(ln, on ? { rotationX:0, autoAlpha:1, duration:1.1, ease:'elastic.out(1, 0.45)', overwrite:true } : { rotationX:88, autoAlpha:0, duration:0.35, ease:'power2.in', overwrite:true });
    });
    const on = behind ? y > s.top + vh*(0.84 + 0.06*n) : s.flow ? y > s.head + s.restOff - vh*(0.8 - 0.05*n) : y > s.head + s.restOff - vh*(0.68 - 0.1*n);
    if(on !== s.restOn){
      s.restOn = on;
      if(A.REDUCED) gsap.set(rest, { autoAlpha:on ? 1 : 0, y:0 });
      else gsap.to(rest, on ? { autoAlpha:1, y:0, duration:0.9, stagger:0.12, ease:'power3.out', overwrite:true } : { autoAlpha:0, y:14, duration:0.3, overwrite:true });
    }
  }

  function revealHead(s, on){
    if(s.on === on) return;
    s.on = on;
    const lines = s.el.querySelectorAll('.stop-text h2 .ln > span'), rest = s.el.querySelectorAll('.stop-kick, .stop-lede, .stop-more');
    if(A.REDUCED){ gsap.set(lines, { yPercent:on ? 0 : 112 }); gsap.set(rest, { autoAlpha:on ? 1 : 0, y:0 }); return; }
    if(on){ gsap.to(lines, { yPercent:0, duration:1.1, stagger:0.11, ease:'power3.out', overwrite:true }); gsap.to(rest, { autoAlpha:1, y:0, duration:0.8, stagger:0.1, delay:0.15, ease:'power3.out', overwrite:true }); }
    else { gsap.to(lines, { yPercent:112, duration:0.4, ease:'power2.in', overwrite:true }); gsap.to(rest, { autoAlpha:0, y:14, duration:0.3, overwrite:true }); }
  }

  function warmOne(){
    const s = L.stops[--T.warm];
    if(!s || s.S.dom) return;
    const S = s.S, R = A.renderer, vis = S.group.visible;
    S.group.visible = true; S.props.forEach(q => { q._v = (q.g || q.m).visible; (q.g || q.m).visible = true; });
    ST.light(S, 1);
    const prev = R.getRenderTarget();
    R.setRenderTarget(T.warmRT); R.render(A.scene, s.cam); R.setRenderTarget(prev);
    ST.light(S, 0);
    S.group.visible = vis; S.props.forEach(q => { (q.g || q.m).visible = q._v; });
    if(T.warm === 0){ T.warmRT.dispose(); T.warmRT = null; }
  }

  /* ---------- every frame ---------- */
  const _w = { v:null, q:{}, pos:null, quat:null };
  T.frame = function(dt){
    if(T.divePending && A && (T.dfr = (T.dfr || 0) + 1) > 1){
      T.divePending = false;
      // the rest of the walk is built now, in one go under the red, rather than a piece a frame (Sam, 19 Oct: "before it
      // loads the next scene there's a few seconds")
      while(A.QUEUE && A.QUEUE.length) A.QUEUE.shift()();
      try{ const u = new URL(location.href); u.searchParams.delete('dive'); history.replaceState(null, '', u.toString()); }catch(e){ /* file:// in some browsers */ }
      entering = true;
      setMode('trek');
      if(window.FOLD && window.FOLD.lampUp) window.FOLD.lampUp();
      const hp = A.heroPx(), yb = Math.round(hp*0.592), y0 = Math.round(hp*0.602) + 1;
      // a few frames just before the cut, under the red, so the hero takes its snapshot of the camera's way in and of
      // the pin's lamp (the landing is lit from it); then over the cut
      A.lenis && A.lenis.scrollTo(yb, { immediate:true, force:true }); window.scrollTo(0, yb);
      A.HXS.t = A.HXS.s = yb/hp;
      const h = document.documentElement;
      let n = 0;
      const pre = () => { if(++n < 3){ A.HXS.t = A.HXS.s = yb/hp; requestAnimationFrame(pre); return; } over(); };
      requestAnimationFrame(pre);
      const over = () => {
      A.lenis && A.lenis.scrollTo(y0, { immediate:true, force:true }); window.scrollTo(0, y0);
      A.HXS.t = A.HXS.s = y0/hp;
      requestAnimationFrame(() => {
        h.classList.add('fl-dive-out'); setTimeout(() => h.classList.remove('fl-dive', 'fl-dive-out'), 300);
        // it leaves at once, at the speed the hero's own dive arrives at the pin, and slows into the walk
        if(A.lenis) A.lenis.scrollTo(hp + 2, { duration:A.REDUCED ? 0 : 2.6, easing:(x) => 1 - Math.pow(1 - x, 3), lock:true, force:true, onComplete:() => { entering = false; later(); } });
        else { window.scrollTo(0, hp + 2); entering = false; }
      });
      };
    }
    if(T.enterPending && window.HERO_READY){
      T.enterPending = false;
      // the address goes back to plain, so a reload starts on the hero (the walk stays)
      try{ const u = new URL(location.href); u.searchParams.delete('enter'); history.replaceState(null, '', u.toString()); }catch(e){ /* file:// in some browsers */ }
      // every trek dives in through its pin now: the hero's lamp comes up under the curtain with this walk's map already in
      // the light, then the curtain lifts and the camera falls onto the pin
      setTimeout(() => { gsap.to(curtain, { opacity:0, duration:0.6 }); T.enter(); }, A.REDUCED ? 0 : 1500);
    }
    if(!A) return;
    if(!L.vw) T.resize();
    if(!_w.v){ _w.v = new A.THREE.Vector3(); _w.pos = new A.THREE.Vector3(); _w.quat = new A.THREE.Quaternion(); }
    if(T.mode === 'trek'){
      T.idle = false;
      // all the way back up through the dive: the landing again
      if(!entering && window.scrollY < 2 && A.HXS.s < 0.003) setMode('landing');
      // the end of the walk: the map has folded itself shut and stays shut a beat, then the way back to the hero
      if(!entering && !RET.on){ RET.t = A.P.s > 0.992 && A.P.t > 0.99 ? RET.t + (dt || 0.016) : 0; if(RET.t > 0.5) back(); }
      return;
    }
    if(T.warm > 0) warmOne();
    const y = window.scrollY, vw = L.vw, vh = L.vh, narrow = L.narrow;
    const isPast = y > vh*0.92;
    if(isPast !== past){ past = isPast; document.documentElement.classList.toggle('l-past', past); }

    const fo2 = smooth(seg(y, 0, vh*0.2));
    if(T.fade && Math.abs(fo2 - (T.fadeO || 0)) > 0.004){ T.fadeO = fo2; T.fade.style.opacity = fo2.toFixed(3); }
    // the hero leaves like the page it is: its HTML layer moves up with the scroll (its picture is drawn below)
    const ty = y < vh + L.gap ? -Math.round(y) : -Math.round(vh + L.gap + 4);
    if(fo && ty !== lastFo){ lastFo = ty; fo.style.transform = ty ? 'translate3d(0,' + ty + 'px,0)' : ''; }
    // the button in the gap between the globe's foot and the far edge of the map in the light, centred, ball and label
    // together, on the line through the globe and the map (Sam: "make sure it's centred with the globe")
    if(btn && y < vh && A.HK && A.HK.gap){
      const G = A.HK.gap();
      if(G.y1 > G.y0){
        const h = btn.offsetHeight, w = btn.offsetWidth;
        const left = Math.round(G.x - w*0.5), top = Math.round((G.y0 + G.y1)*0.5 - h*0.5);
        if(left !== btn._l || top !== btn._t){ btn._l = left; btn._t = top; btn.style.left = left + 'px'; btn.style.top = top + 'px'; }
      }
    }

    // ---- each stop's box: where it is on screen, how far its station has formed, how far the hiker is across it
    let walker = null;
    for(const s of L.stops){
      if(s.flow){
        s.vis = false; s.held = false; snapLines(s);
        if(s.pg && s.pg.length) guidesAt(s, y, vh);
        if(s.wo) s.wo.frame(s, y, vh);
        continue;
      }
      s.bt = y < s.top ? s.top - y : y <= s.pinEnd ? 0 : s.pinEnd - y;
      s.vis = s.bt < vh && s.bt > -vh;
      s.form = s.orb && !narrow ? smooth(seg(y, s.top - vh*0.5, s.top)) : smooth(seg(y, s.top - vh*0.9, s.top - vh*0.06));
      const span = s.pinEnd - s.top;
      // on a phone the text soon rises over the station, so the hiker crosses it (and its scenes flip) in the first part
      s.u = s.orb ? seg(y, s.u0, s.pinEnd) : seg(y, s.top, s.top + (narrow && !s.S.focus ? Math.min(span, vh*(s.S.flip ? 0.45 : 0.85)) : span));
      s.held = y >= s.top && (y <= s.pinEnd || s.last);
      if(s.held) walker = s;
      if(s.S.focus){ s.f = y >= s.top ? focusOf(s.u) : 0; if(s.vis) poseAt(s); }
      if(s.orb){ s.f = y >= s.u0 ? orbOf(s.u) : 0; if(s.vis) ST.orbFrame(s.S, s.f, y >= s.u0 && s.u > 0.012, dt, A.REDUCED, s.cam, performance.now()/1000); }
      else if(s.vis) ST.spring(s.S, s.form, dt, A.REDUCED, true, s.S.focus ? popOf(s, y) : y >= s.top ? s.u : 0);
      else if(s.form <= 0) ST.spring(s.S, 0, dt, true, false, 0);
      if(s.lead) snapLines(s);
      else if(s.form > 0.55 && s.vis) revealHead(s, true); else if(y < s.top - vh*0.95) revealHead(s, false);
    }

    // ---- the hiker: on a leg of thread (paper, in the page) or on a held station (ink, in 3D)
    let show = false, three = false, hx = 0, hy = 0, hh = 0, col = PAPER, face = 0;
    let leg = null;
    for(const g of L.legs) if(y >= g.y0 - (g.i === 0 ? vh : 0) && y < g.y1 + (g.stay || 0)){ leg = g; break; }
    if(leg && leg.off) leg = null;
    if(leg && !walker){
      const g = leg;
      if(g.i === 0 && y < g.y0){
        // the hero: he stands at the trailhead under the book, and gets up when the page starts to move
        hx = L.trail.x; hy = L.trail.y - y; hh = narrow ? 40 : 50; show = y > 2;
        H.rise = A.REDUCED ? 1 : smooth(seg(y, 2, vh*0.04));
        walked(g, 0);
      } else {
        H.rise = 1;
        const t = seg(y, g.y0, g.y1);
        const p = pointAt(g.pl, t*g.pl.len, _w.q);
        const yf = g.pinS !== undefined && y > g.y1 ? y - Math.max(0, Math.min(y - g.pinS, g.pinL)) : y;
        hx = p.x; hy = p.y - yf; show = true;
        walked(g, p.i);
        const q2 = pointAt(g.pl, Math.min(g.pl.len, t*g.pl.len + 6), {});
        face = Math.abs(q2.x - p.x) > 0.6 ? Math.sign(q2.x - p.x) : 0;
        // the size and the ink change near the ends, so he matches the walker on the sheets he leaves and reaches
        const s = L.stops[g.i], prev = L.stops[g.i - 1];
        const big = narrow ? 46 : 62;
        const inkIn = s && !s.flow && !s.orb, inkOut = prev && !prev.flow && !prev.orb;
        const hIn = inkIn ? h3(s, 0) : big, hOut = inkOut ? h3(prev, 1) : big;
        const kIn = inkIn ? smooth(seg(t, 0.82, 1)) : 0, kOut = g.i === 0 || !inkOut ? 1 : smooth(seg(t, 0, 0.16));
        hh = lerp(lerp(hOut, big, kOut), hIn, kIn);
        col = kIn > 0 ? mixHex(PAPER, INK, kIn) : g.i === 0 || !inkOut ? PAPER : mixHex(INK, PAPER, kOut);
        if(y >= g.y1) L.stand = true;
      }
    } else if(walker){
      // no walking on the orb (Sam: "it feels a lot of walking"): the planet turns, nobody crosses it
      three = !walker.orb;
    } else {
      // no thread into a leading stop: the walker already stands at its sign while the box comes up
      const s0 = L.stops.find(s => s.S.focus && s.vis && s.form > 0.3 && y < s.top);
      if(s0){ walker = s0; three = true; s0.u = 0; }
    }

    // ---- draw: the hero's picture and each station in view, each in its own box (this file draws the landing)
    T.idle = true;
    const R = A.renderer, cam = A.camera;
    _w.pos.copy(cam.position); _w.quat.copy(cam.quaternion); const fov0 = cam.fov, fog0 = [A.scene.fog.near, A.scene.fog.far];
    const vis = L.stops.filter(s => s.vis);
    // lamps out, then lit for the stations in view (two at most, on different lamps)
    L.stops.forEach(s => { s.S.group.visible = s.vis; });
    ST.light(L.stops[0].S, 0); if(L.stops[1]) ST.light(L.stops[1].S, 0);
    vis.forEach(s => ST.light(s.S, 1));
    if(three){
      const s = walker, P = ST.at(s.S, s.S.focus ? ST.uOfX(s.S, walkX(s, s.u)) : s.u, _w.v), Hg = A.HIKER.group;
      const moved = s.orb ? Math.abs((s.f || 0) - (s.lf === undefined ? s.f || 0 : s.lf))*2*Math.PI/5*ST.RG : Math.abs(P.x - (s.lx === undefined ? P.x : s.lx));
      s.lx = P.x; s.lf = s.f || 0;
      s.walk = lerp(s.walk || 0, A.REDUCED ? 0 : Math.min(1, moved/Math.max(dt, 1e-3)*0.9), 1 - Math.exp(-dt*8));
      s.phase = (s.phase || 0) + moved*7.5;
      Hg.position.set(P.x, P.y + Math.abs(Math.sin(s.phase*Math.PI))*0.055*s.walk, P.z);
      Hg.rotation.set(0, -0.14, (s.orb ? ST.ORB_HA : 0) + Math.sin(s.phase*Math.PI)*0.07*s.walk);
    }
    A.HIKER.group.visible = three;
    // the landing's ground is the page's own room colour, so the canvas and the CSS fades over it are one colour
    if(!T.room) T.room = new A.THREE.Color((SEC.PAL && SEC.PAL.room) || '#0A1019');
    R.setScissorTest(false); R.setClearColor(T.room, 1); R.clear();
    R.setScissorTest(true);
    const sh0 = R.shadowMap.autoUpdate;
    let first = true;
    // the hero, still on screen at the top
    if(y < vh + L.gap){
      const bottom = Math.min(vh, Math.round(vh + L.gap - y));
      cam.setViewOffset(vw, vh, 0, Math.round(y), vw, vh);
      R.setScissor(0, vh - bottom, vw, bottom);
      R.render(A.scene, cam); first = false;
      cam.clearViewOffset();
    }
    // the stations, each shifted into its box, on the room colour
    const bg0 = A.scene.background ? A.scene.background.clone() : null, fc0 = A.scene.fog.color.clone();
    if(vis.length){ if(A.scene.background) A.scene.background.copy(T.room); A.scene.fog.color.copy(T.room); }
    for(let vi = vis.length - 1; vi >= 0; vi--){
      const s = vis[vi], c = s.cam, top = Math.max(0, s.bt), bot = Math.min(vh, s.bt + vh);
      if(bot - top < 1) continue;
      cam.position.copy(c.position); cam.quaternion.copy(c.quaternion); cam.fov = c.fov;
      cam.setViewOffset(vw, vh, s.offX, s.offY - s.bt, vw, vh);
      cam.updateMatrixWorld();
      const cd = c.position.distanceTo(s.S.center);
      A.scene.fog.near = cd*1.05; A.scene.fog.far = cd*2.1;
      R.shadowMap.autoUpdate = first; first = false;
      R.setScissor(0, Math.round(vh - bot), vw, Math.round(bot - top));
      R.render(A.scene, cam);
    }
    R.shadowMap.autoUpdate = sh0;
    R.setScissorTest(false);
    if(bg0) A.scene.background.copy(bg0); A.scene.fog.color.copy(fc0);
    // the camera goes back to the hero's, for its pointer and the next frame
    cam.clearViewOffset(); cam.position.copy(_w.pos); cam.quaternion.copy(_w.quat); cam.fov = fov0; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    A.scene.fog.near = fog0[0]; A.scene.fog.far = fog0[1];

    // the floating cards of the station being walked
    L.stops.forEach(s => { if(s !== walker) s.cards.forEach(c => { if(c._on){ c._on = false; c.classList.remove('on'); } }); });
    if(walker) cards(walker, walker.u);

    H.show(show);
    if(show){
      const stand = L.stand; L.stand = false;
      const moved = stand ? 0 : Math.hypot(hx - (L.lx === undefined ? hx : L.lx), hy - (L.ly === undefined ? hy : L.ly)) + Math.abs(y - (L.lyy === undefined ? y : L.lyy))*0.3;
      L.lx = hx; L.ly = hy; L.lyy = y;
      H.step(moved, dt, A.REDUCED); H.colour(col); H.set(hx, hy, hh, face);
    }
  };
  // the walker's height on screen at either end of a stop's sheet
  function h3(s, u){
    const P = ST.at(s.S, u, new A.THREE.Vector3());
    const a = scr(s.cam, P), b = scr(s.cam, P.clone().setY(P.y + A.KNOB.HIKER_H));
    return Math.max(8, a.y - b.y);
  }

  // the floating cards: on a wide screen, over the station, each tied to its cut-out; two at a time at most. a card
  // with no room above its cut-out goes beside it
  function cards(s, u){
    if(!s.cards.length) return;
    // on a phone the card of the scene in view sits under it, placed by the page's CSS
    if(L.narrow){
      if(s.S.focus || s.orb) s.cards.forEach((c, k) => { const on = Math.abs(s.f - k) < 0.3 && (s.orb ? window.scrollY >= s.u0 && (k > 0 || s.u > 0.03) : k > 0 || s.u > 0.09); if(on !== !!c._on){ c._on = on; c.classList.toggle('on', on); } });
      return;
    }
    const S = s.S, n = s.cards.length;
    const showAt = s.cards.map((c, k) => ST.cardShowAt(S, k));
    const placed = [];
    s.cards.forEach((c, k) => {
      const on = S.orb ? Math.abs(s.f - k) < 0.3 && window.scrollY >= s.u0 && (k > 0 || s.u > 0.03) : S.focus ? Math.abs(s.f - k) < 0.3 && (k > 0 || s.u > 0.09) : S.flip ? u > showAt[k] - 0.02 : u > showAt[k] - 0.07 && (k + 2 >= n || u < showAt[k + 2] - 0.07);
      if(on !== !!c._on){ c._on = on; c.classList.toggle('on', on); }
      if(!on && !c.classList.contains('on')) return;
      const a = ST.anchor(S, k, _w.v); if(!a) return;
      const p = scr(s.cam, a);
      const w = c.offsetWidth || 216, h = c.offsetHeight || 160;
      let x = p.x - w*0.5, yy = p.y - (n > 3 ? 56 : 70) - h;
      // a flipping station's cards stay, in a row along the top, evenly spaced and all one size
      // a focusing station's card for the scene in view sits on the right, level with it
      if(S.focus){ x = L.vw - w - Math.max(28, L.vw*0.03); yy = L.vh*0.48 - h*0.5; }
      else if(S.orb){ x = L.vw - w - Math.max(28, L.vw*0.03); yy = Math.max(110, L.vh*0.2); }
      else if(S.flip){ yy = Math.max(96, L.vh*0.1); x = L.vw*(0.5 + (k - (n - 1)*0.5)*0.3) - w*0.5; }
      else if(yy < 84){ yy = Math.max(84, p.y - h*0.6); x = p.x > L.vw*0.66 ? p.x - w - 48 : p.x + 48; }
      // over a leading stop the cards can go anywhere across the screen; elsewhere they keep clear of the text column
      const x0 = s.lead ? 14 : L.vw*0.36;
      const fit = () => { x = Math.max(x0, Math.min(L.vw - w - 14, x)); yy = Math.max(84, Math.min(L.vh - h - 14, yy)); };
      fit();
      for(const o of placed){
        if(x < o.x + o.w + 12 && x + w + 12 > o.x && yy < o.y + o.h + 12 && yy + h + 12 > o.y){
          const right = o.x + o.w + 14, left = o.x - w - 14;
          x = right + w < L.vw - 14 ? right : left >= x0 ? left : x;
          fit();
        }
      }
      placed.push({ x, y:yy, w, h });
      if(c._x !== Math.round(x) || c._y !== Math.round(yy)){ c._x = Math.round(x); c._y = Math.round(yy); c.style.transform = 'translate3d(' + c._x + 'px,' + c._y + 'px,0)'; }
      // the thin line from the card to its cut-out, from whichever edge of the card is nearest
      const bx = Math.max(10, Math.min(w - 10, p.x - x)), by = p.y > yy + h ? h : p.y < yy ? 0 : h*0.5;
      const sx = by === h*0.5 ? (p.x > x + w*0.5 ? w : 0) : bx;
      const dx = p.x - (x + sx), dy = p.y - (yy + by);
      const len = Math.max(8, Math.hypot(dx, dy)), ang = Math.atan2(-dx, dy)*180/Math.PI;
      const ld = c.querySelector('.fc-lead');
      ld.style.left = sx.toFixed(0) + 'px'; ld.style.top = by.toFixed(0) + 'px';
      ld.style.height = len.toFixed(0) + 'px'; ld.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
    });
  }

  return T;
}

window.LANDING = { create };
})();
