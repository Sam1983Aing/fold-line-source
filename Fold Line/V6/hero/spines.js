/* ============================================================
   FOLD LINE V6 . THE TREK NUMBERS: SPINES
   Sam's pick of the numbers round (17 Oct 2026). He had found the row of numbers over coloured bars "a little bit too
   generic, too safe". Now the five treks are map books on a shelf: each spine in the colour of its length, as thick as
   its trek is long (one day to twelve), its number running up the spine under a paper label. The book in the light
   slides half out and glows in its colour. Pointed at with a mouse, a book tips forward a little.
   Summits and Dial are at commit 53645ee behind ?nums=summits|dial. ?nums=off gives back the plain row, the before.
   The spines dress the same buttons the plain row used, so fold.js's clicks, the keyboard and its "on" class carry over.
   ============================================================ */
(function(){
'use strict';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
const TXT = (a) => 'rgba(var(--c-text-rgb,241,235,223),' + a + ')';

window.FOLD_NUMS = {
  build(c){
    const spine = (T, k) => {
      const d = typeof T.days === 'number' ? T.days : 3, w = Math.round(13 + Math.min(12, d)*1.05);
      return '<span class="sp" aria-hidden="true" style="--sw:' + w + 'px"><span class="sp-band"></span><em>' + String(k + 1).padStart(2, '0') + '</em></span>';
    };
    c.dom.fnums.forEach((b, k) => b.insertAdjacentHTML('afterbegin', spine(c.TREKS[k], k)));
    c.dom.nums.forEach((b, k) => { b.insertAdjacentHTML('afterbegin', spine(c.TREKS[k], k)); b.setAttribute('aria-label', c.TREKS[k].name); });
    c.dom.fnav.classList.add('sp-on');
  },
  css:`
.fo .fc-nav.sp-on{align-items:flex-end;gap:5px;padding-top:22px;border-top:0;position:relative;}
.fo .fc-nav.sp-on::after{content:'';position:absolute;left:-6px;right:-6px;bottom:2px;height:2px;border-radius:1px;background:${TXT(.22)};box-shadow:0 3px 8px rgba(0,0,0,.5);}
.fo .fc-nav.sp-on .fc-num{padding:0;gap:0;}
.fo .fc-nav.sp-on .fc-num > b, .fo .fc-nav.sp-on .fc-num .bar{display:none;}
.fo .fc-nav.sp-on .fc-count{margin-bottom:8px;}
.fo .sp{position:relative;display:block;width:var(--sw);height:58px;border-radius:2px 2px 1px 1px;
  background:linear-gradient(90deg, rgba(0,0,0,.28), rgba(255,255,255,.1) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,.3)), var(--c);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);transform:translateY(0);filter:brightness(.62) saturate(.8);
  transition:transform .55s ${SPRING}, filter .4s ease, box-shadow .4s ease;}
.fo .sp-band{position:absolute;left:2px;right:2px;top:7px;height:9px;border-radius:1px;background:${TXT(.82)};opacity:.85;}
.fo .sp em{position:absolute;left:50%;bottom:7px;transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl;font-style:normal;
  font-family:var(--v2-label);font-size:calc(9px*var(--l-scale,1));letter-spacing:.14em;color:${TXT(.92)};}
@media (hover:hover){ .fo .fc-num:hover:not(.on) .sp{transform:translateY(-5px) rotate(-2deg);filter:brightness(.8) saturate(.9);} }
.fo .fc-num.on .sp, .fo .ro-nums button.on .sp{transform:translateY(-16px);filter:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25), 0 10px 14px -6px rgba(0,0,0,.7), 0 0 18px -6px var(--c);}
.fo .fc-nav.sp-on .fc-num:focus-visible, .fo .ro-nums button:focus-visible{outline:none;}
.fo .fc-nav.sp-on .fc-num:focus-visible .sp, .fo .ro-nums button:focus-visible .sp{outline:1px solid var(--c);outline-offset:3px;}
.fo .ro-nums{align-items:flex-end;gap:5px;border-top:0;padding-top:14px;position:relative;}
.fo .ro-nums::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:${TXT(.22)};}
.fo .ro-nums button{flex:none;padding:0 0 2px;font-size:0;}
.fo .ro-nums button::before{display:none;}
.fo .ro-nums .sp{height:40px;}
.fo .ro-nums button.on .sp{transform:translateY(-10px);}
@media (prefers-reduced-motion:reduce){ .fo .sp{transition-duration:.01s;} }`
};
})();
