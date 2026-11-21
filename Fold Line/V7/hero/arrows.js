/* ============================================================
   FOLD LINE V6 . THE ARROWS: CREASE
   Sam's pick of the arrows round (17 Oct 2026). He found the plain glyphs "a little bit too generic" and pointed at the E
   of Unbounded: "it has a line in the middle where we can fold ... a flat arrow, but with that line where we fold, like
   the arrow is folding, but slightly". The arrow is paper creased along its length: the upper half lies flat, the lower
   half is folded back a little and sits in shade. Pointed at, or reached from the keyboard, it unfolds flat. Clicked or
   tapped, it snaps shut and springs back.
   Paper Layers and Page Turn are at commit 098bc6a behind ?arrow=layers|turn. ?arrow=off gives back the plain glyphs.
   The fold is two HTML halves of one SVG, each clipped to its half, the lower one turned in 3D with its own perspective:
   3D transforms on the parts of an SVG are unreliable in Safari, on HTML elements they are not.
   fold.js puts the markup in the two buttons and sets is-hover (for the scripted tour, whose pointer events never reach
   CSS :hover) and is-press (for 0.6 s after a click).
   ============================================================ */
(function(){
'use strict';
// one arrow, pointing right, 24 x 16: a round-ended shaft and a head with softened corners, Unbounded's kind of geometry
const AR = 'M2.5 6.4H12.6V2.9Q12.6 1.8 13.5 2.4L21.7 7.3Q22.7 8 21.7 8.7L13.5 13.6Q12.6 14.2 12.6 13.1V9.6H2.5Q1.6 9.6 1.6 8.7V7.3Q1.6 6.4 2.5 6.4Z';
const svg = (inner) => '<svg viewBox="0 0 24 16" aria-hidden="true" focusable="false">' + inner + '</svg>';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
// unfolded: pointed at with a mouse (a tap would leave a touch screen's :hover stuck on), the tour's cursor, or the keyboard
const OPEN = '.fo .fo-arrow.crease.is-hover, .fo .fo-arrow.crease:focus-visible';
const PRESS = '.fo .fo-arrow.crease.is-press';
const SHADE = (k) => 'color-mix(in srgb, var(--v2-ivory) ' + k + '%, #4c5566)';

window.FOLD_ARROW = {
  html:() => '<span class="flip"><span class="ar">' +
    '<span class="hf up">' + svg('<path d="' + AR + '"/><path class="ln" d="M1.9 7.75H22.4"/>') + '</span>' +
    '<span class="hf dn">' + svg('<path d="' + AR + '"/>') + '</span></span></span>',
  css:`
.fo .fo-arrow.crease{font-size:0;}
.fo .fo-arrow.crease .flip{display:block;}
.fo .fo-arrow.crease.prev .flip{transform:scaleX(-1);}
.fo .fo-arrow.crease .ar{position:relative;display:block;width:28px;height:18.7px;transition:transform .5s ${SPRING};}
.fo.fo-narrow .fo-arrow.crease .ar{width:22px;height:14.7px;}
.fo .fo-arrow.crease svg{display:block;width:100%;height:100%;overflow:visible;}
.fo .fo-arrow.crease .hf{position:absolute;inset:0;}
.fo .fo-arrow.crease .up{clip-path:inset(0 0 50% 0);}
.fo .fo-arrow.crease .up path{fill:var(--v2-ivory);}
.fo .fo-arrow.crease .up .ln{fill:none;stroke:#fff;stroke-width:.5;opacity:.85;}
.fo .fo-arrow.crease .dn{clip-path:inset(50% 0 0 0);transform-origin:50% 50%;transform:perspective(40px) rotateX(-44deg);transition:transform .55s ${SPRING};}
.fo .fo-arrow.crease .dn path{fill:${SHADE(50)};transition:fill .45s ease;}
@media (hover:hover){ .fo .fo-arrow.crease:hover .ar{transform:translateX(2px);} .fo .fo-arrow.crease:hover .dn{transform:perspective(40px) rotateX(-6deg);} .fo .fo-arrow.crease:hover .dn path{fill:${SHADE(86)};} }
${OPEN.split(', ').map(s => s + ' .ar').join(', ')}{transform:translateX(2px);}
${OPEN.split(', ').map(s => s + ' .dn').join(', ')}{transform:perspective(40px) rotateX(-6deg);}
${OPEN.split(', ').map(s => s + ' .dn path').join(', ')}{fill:${SHADE(86)};}
${PRESS} .dn, .fo .fo-arrow.crease.is-press:hover .dn{transform:perspective(40px) rotateX(-78deg);transition-duration:.14s;}
${PRESS} .dn path, .fo .fo-arrow.crease.is-press:hover .dn path{fill:${SHADE(40)};}
@media (prefers-reduced-motion:reduce){ .fo .fo-arrow.crease .ar, .fo .fo-arrow.crease .dn, .fo .fo-arrow.crease .dn path{transition-duration:.01s;} }
`
};
})();
