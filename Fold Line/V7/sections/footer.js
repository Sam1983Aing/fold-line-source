/* ============================================================
   FOLD LINE . V7 . the footer (Sam, 18 Oct 2026: "make a more fun footer, with useful details and some social media,
   those companies work on social media")
   A postcard to sign up for a map a month in the middle, the socials as postage stamps stuck round its edges, two each
   side at their own angles (Sam's layout, 18 Oct: "centre the postcard, the stamps around its edges"), the time right
   now at each trailhead and whether it is in season, the name cut out in paper letters that spring up, and a camp at the
   end of the trail with a quiet way back up, how to reach us beside it.
   The whole footer is one folded sheet in three panels that unfolds as the page reaches it, one panel after another,
   the postcard first (Sam, 18 Oct: "after 06 it feels like it ends there, then as you scroll the footer unfolds, like
   the FAQ map"). Scrolling back up folds it again.
   Contact details and handles are placeholders: hello@foldline.example and @foldline.
   Classic script. Exposes window.FOOT_X { html(C), init(root) }; sections.js uses it when it is there.
   ============================================================ */
(function(){
'use strict';
const TZ = { tongariro:'Pacific/Auckland', inca:'America/Lima', torres:'America/Punta_Arenas', kili:'Africa/Dar_es_Salaam', everest:'Asia/Kathmandu' };
const MAIL = 'hello@foldline.example', HANDLE = '@foldline';
const ICON = {
  instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 9 L15.5 12 L10 15Z" fill="currentColor"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 3.5 V15.2 A3.6 3.6 0 1 1 9.9 11.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M13.5 3.8 Q14.6 7.6 18.6 8.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  strava:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15 L10.2 4 L15.4 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12.6 15 L15.6 20.5 L18.6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
};
const NETS = [
  { k:'instagram', name:'Instagram', line:'Trail days, every day', c:'#D2A23A' },
  { k:'youtube', name:'YouTube', line:'The five walks, filmed end to end', c:'#D63B2F' },
  { k:'tiktok', name:'TikTok', line:'Sixty seconds on a ridge', c:'#5B8FC4' },
  { k:'strava', name:'Strava', line:'Our guides’ routes, live in season', c:'#5E8C61' }
];
let C = null;

function html(C0){
  C = C0;
  const esc = C.esc, T = C.T;
  const coord = (w) => Math.abs(w.lat).toFixed(2) + '°' + (w.lat < 0 ? 'S' : 'N') + ' ' + Math.abs(w.lon).toFixed(2) + '°' + (w.lon < 0 ? 'W' : 'E');
  const stamps = NETS.map((n, k) => '<li style="--c:' + n.c + ';--d:' + (k*0.09).toFixed(2) + 's"><a class="fx-stamp" href="#" data-net="' + n.k + '" aria-label="Fold Line on ' + n.name + ' (placeholder)">' +
    '<span class="fx-st-in"><span class="fx-st-ic">' + ICON[n.k] + '</span><b>' + n.name + '</b><span class="fx-st-h">' + HANDLE + '</span><i>' + esc(n.line) + '</i></span><span class="fx-st-v">' + String(k + 1).padStart(2, '0') + '</span></a></li>').join('');
  const now = T.map(t => { const w = (t.waypoints || [])[0]; return '<li data-tz="' + (TZ[t.key] || 'UTC') + '" data-k="' + t.key + '"><b>' + esc(t.name) + '</b><span class="fx-clock"><i class="fx-sky"></i><time>--:--</time></span><span class="fx-season"></span><em>' + (w ? coord(w) : '') + '</em></li>'; }).join('');
  const word = (s, cls) => '<span class="fx-w ' + cls + '">' + [...s].map((ch, k) => '<span style="--r:' + [-3, 2, -1.5, 2.5, -2, 1][k % 6] + 'deg;--d:' + (k*0.06).toFixed(2) + 's">' + ch + '</span>').join('') + '</span>';
  // each panel of the sheet hangs from the bottom edge of the one before it
  const pan = (k, inner) => '<div class="fx-pan" data-p="' + k + '"><div class="fx-pan-in">' + inner + '</div></div>';
  return '<footer class="foot fx" id="foot"><div class="fx-sheet">' + pan(0,
    '<div class="fx-row1">' +
      '<form class="fx-card" novalidate><div class="fx-card-l">' +
        '<p class="fx-k">Fold Line post</p><h3>A map in your inbox, <em>once a month.</em></h3>' +
        '<p class="fx-p">One trek, folded into an email: the route, the season that is opening and a note from a guide on the trail. Nothing else. We are mostly outside.</p>' +
        '<div class="fx-sub"><input type="email" name="email" autocomplete="email" placeholder="your@email" aria-label="Your email" spellcheck="false"><button type="submit">Send me maps<i aria-hidden="true">→</i></button></div>' +
        '<p class="fx-ok" role="status"></p></div>' +
        '<div class="fx-card-r" aria-hidden="true"><span class="fx-post"><b>06</b><span>Fold Line<br>post</span></span><span class="fx-mark"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="31"/><path d="M4 42 Q27 34 50 42 T96 42 M4 58 Q27 50 50 58 T96 58"/></svg><span>' + new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short' }).toUpperCase() + '</span></span>' +
          '<span class="fx-lines"><i></i><i></i><i></i></span><span class="fx-to"><em>Follow the walks</em><b>' + HANDLE + ', everywhere</b></span></div>' +
      '</form>' +
      '<div class="fx-social"><p class="fx-h">Follow the walks</p><ul class="fx-stamps">' + stamps + '</ul></div>' +
    '</div>') + pan(1,
    '<div class="fx-now"><p class="fx-h">Right now at the trailheads</p><ul>' + now + '</ul></div>' +
    '<p class="fx-big" aria-label="Fold Line">' + word('Fold', 'a') + word('Line', 'b') + '</p>') + pan(2,
    '<div class="fx-base">' +
      '<div class="fx-end"><div class="fx-camp" aria-hidden="true"><svg viewBox="0 0 220 90">' +
        '<path class="fx-tent" d="M40 82 L78 22 L116 82Z"/><path class="fx-door" d="M78 82 L78 40 L92 82Z"/><path class="fx-guy" d="M78 22 L60 8 M78 22 L98 6"/>' +
        '<g class="fx-fire"><path class="f1" d="M156 82 Q146 66 156 50 Q160 62 166 58 Q170 70 162 82Z"/><path class="f2" d="M158 82 Q153 72 159 64 Q162 72 165 70 Q166 77 162 82Z"/></g>' +
        '<path class="fx-logs" d="M140 84 L180 78 M142 78 L178 85"/><circle class="fx-ball" cx="196" cy="70" r="8"/><path class="fx-ground" d="M10 84 L210 84"/>' +
        '</svg></div><p>End of the trail. Camp is up, the fire is lit.</p>' +
        '<button type="button" class="fx-up" data-act="top">Back to the trailhead<i aria-hidden="true">↑</i></button></div>' +
      '<div class="fx-talk"><p class="fx-h">Talk to us</p><a href="mailto:' + MAIL + '">' + MAIL + '</a><p>We answer within two working days, from Ōhakune, New Zealand, where the first map was folded.</p>' +
        '<p class="fx-hours"><i></i><span></span></p></div>' +
    '</div>') +
  '</div></footer>';
}

function init(root){
  const F = root.querySelector('.fx'); if(!F) return;
  // the postcard: a thank-you, no network
  const form = F.querySelector('.fx-card');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = form.elements.email.value.trim(), ok = F.querySelector('.fx-ok');
    if(!/.+@.+\..+/.test(v)){ ok.textContent = 'That email does not look right yet.'; ok.className = 'fx-ok on bad'; return; }
    ok.textContent = 'Stamped. Your first map lands on the first of the month.'; ok.className = 'fx-ok on';
    form.classList.add('sent'); form.querySelector('button').disabled = true;
  });
  // the stamps are placeholders, so they go nowhere for now
  F.querySelectorAll('.fx-stamp').forEach(a => a.addEventListener('click', (e) => e.preventDefault()));
  F.querySelector('[data-act=top]').addEventListener('click', () => { const TR = window.APP && window.APP.TR; if(TR && TR.home) TR.home(); else window.scrollTo({ top:0, behavior:'smooth' }); });
  // the time at each trailhead, whether it is day there and whether the trek is in season this month
  const fmtT = {}, mon = {};
  const tick = () => {
    const now = new Date();
    F.querySelectorAll('.fx-now li').forEach(li => {
      const tz = li.dataset.tz, t = (C.T || []).find(q => q.key === li.dataset.k);
      try{
        fmtT[tz] = fmtT[tz] || new Intl.DateTimeFormat('en-GB', { timeZone:tz, hour:'2-digit', minute:'2-digit', hour12:false });
        mon[tz] = mon[tz] || new Intl.DateTimeFormat('en-GB', { timeZone:tz, month:'numeric' });
        const hm = fmtT[tz].format(now), h = +hm.slice(0, 2), m = +mon[tz].format(now) - 1;
        li.querySelector('time').textContent = hm;
        li.classList.toggle('is-day', h >= 6 && h < 19);
        const on = t ? C.months(t.seasonShort)[m] : false;
        const s = li.querySelector('.fx-season'); s.textContent = on ? 'In season' : 'Out of season'; s.classList.toggle('on', !!on);
      } catch(e){}
    });
    // our hours, in New Zealand
    try{
      const nz = new Intl.DateTimeFormat('en-GB', { timeZone:'Pacific/Auckland', hour:'2-digit', hour12:false, weekday:'short' }).formatToParts(now);
      const h = +nz.find(p => p.type === 'hour').value, wd = nz.find(p => p.type === 'weekday').value, open = h >= 8 && h < 18 && wd !== 'Sat' && wd !== 'Sun';
      const hrs = F.querySelector('.fx-hours'); hrs.classList.toggle('open', open);
      hrs.querySelector('span').textContent = open ? 'Open now, Mon to Fri, 8 to 6 NZ time' : 'Closed now. Mon to Fri, 8 to 6 NZ time';
    } catch(e){}
  };
  tick(); setInterval(tick, 20000);
  // the sheet unfolds with the scroll, a panel at a time: each one swings down from the bottom edge of the one before as
  // its hinge comes up the screen, and is flat by the time the hinge is a little past the middle. The last one is flat by
  // the end of the page. A panel's contents land (the postcard, the stamps, the letters) as it starts to open, and stay
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pans = [...F.querySelectorAll('.fx-pan')].map(el => ({ el, in:el.firstElementChild, a:-1, done:false }));
  const ease = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  let lastY = null, lastH = 0, lastD = 0;
  const unfold = () => {
    const y = window.scrollY, vh = window.innerHeight, dh = document.documentElement.scrollHeight;
    if(y !== lastY || vh !== lastH || dh !== lastD){
      lastY = y; lastH = vh; lastD = dh;
      const max = dh - vh;
      pans.forEach(P => {
        const top = P.el.getBoundingClientRect().top + y;
        const e = Math.min(top - vh*0.5, max - 2), s0 = Math.min(top - vh*0.97, e - vh*0.32);
        const u = Math.max(0, Math.min(1, (y - s0)/Math.max(1, e - s0))), k = RM ? (u > 0 ? 1 : 0) : ease(u);
        const a = Math.round((1 - k)*92*100)/100;
        if(a !== P.a){ P.a = a; P.in.style.setProperty('--a', a); P.in.style.setProperty('--sh', ((1 - k)*0.9).toFixed(3)); P.in.classList.toggle('moving', a > 0 && a < 92); }
        if(u > 0.12 && !P.done){ P.done = true; P.in.querySelectorAll('.fx-row1, .fx-now, .fx-big, .fx-base').forEach(x => x.classList.add('in')); }
      });
    }
    requestAnimationFrame(unfold);
  };
  requestAnimationFrame(unfold);
}

const CSS = `
.foot.fx{position:relative;z-index:4;padding:8vh clamp(10px,2.4vw,40px) 26px;border-top:0;background:var(--c-room,#0A1019);color:var(--c-text);overflow:hidden;}
/* the sheet: three panels of one folded map, its back printed with faint contour rings, a crease between each */
.fx-sheet{max-width:1460px;margin:0 auto;}
.fx-pan{perspective:2400px;perspective-origin:50% 0;}
.fx-pan-in{position:relative;container-type:inline-size;transform-origin:50% 0;transform:rotateX(calc(var(--a,0)*-1deg));backface-visibility:hidden;-webkit-backface-visibility:hidden;
  background-color:#0F1825;background-image:repeating-radial-gradient(ellipse 120% 90% at 16% 24%, rgba(233,226,211,0.032) 0 1px, transparent 1.5px 28px), repeating-radial-gradient(ellipse 110% 100% at 86% 88%, rgba(233,226,211,0.026) 0 1px, transparent 1.5px 34px);
  box-shadow:0 0 0 1px rgba(255,255,255,0.025), 0 40px 60px -40px rgba(0,0,0,0.9);}
.fx-pan-in.moving{will-change:transform;}
.fx-pan-in::after{content:'';position:absolute;inset:0;z-index:5;pointer-events:none;background:linear-gradient(180deg, rgba(4,7,12,0.5), rgba(4,7,12,0.88));opacity:var(--sh,0);}
.fx-pan + .fx-pan > .fx-pan-in::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;z-index:4;pointer-events:none;background:linear-gradient(rgba(0,0,0,0.5), rgba(255,255,255,0.05) 60%, transparent);}
.fx-pan[data-p="0"] > .fx-pan-in{padding:7vh clamp(16px,3vw,52px) 7vh;}
.fx-pan[data-p="1"] > .fx-pan-in{padding:6vh clamp(16px,3vw,52px) 5vh;background-position:40% 0, 60% 0;}
.fx-pan[data-p="2"] > .fx-pan-in{padding:4vh clamp(16px,3vw,52px) 4vh;background-position:70% 0, 20% 0;}
.fx a{color:var(--c-text);text-decoration:none;}
.fx button{appearance:none;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;}
.fx :focus-visible{outline:2px solid #D63B2F;outline-offset:3px;}
.fx-h{margin:0 0 14px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.5);}
.fx ul{list-style:none;margin:0;padding:0;}
.fx-row1{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,660px) minmax(0,1fr);grid-template-rows:auto auto;column-gap:0;row-gap:34px;align-items:center;max-width:1260px;margin:0 auto;padding:20px 0;}

/* the postcard */
.fx-card{position:relative;display:grid;grid-template-columns:1fr 150px;gap:24px;padding:26px 28px 24px;color:#1B2230;background:#F3EEE4 linear-gradient(170deg, rgba(255,255,255,0.4), rgba(0,0,0,0.05));
  box-shadow:0 30px 44px -26px rgba(0,0,0,0.95);transform:rotate(-1.2deg) translateY(30px);opacity:0;transition:transform 1s cubic-bezier(.2,1.3,.35,1), opacity .4s ease;}
.fx-row1.in .fx-card{transform:rotate(-1.2deg);opacity:1;}
.fx-card::before{content:'';position:absolute;top:-10px;left:38%;width:84px;height:22px;transform:rotate(3deg);background:rgba(226,214,186,0.85);box-shadow:0 2px 3px rgba(0,0,0,0.2);}
.fx-k{margin:0 0 10px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.2em;text-transform:uppercase;color:#D63B2F;}
.fx-card h3{margin:0;font-family:var(--f-display);font-weight:var(--d-w,400);font-size:calc(clamp(24px,2.2vw,34px)*var(--d-scale,1));line-height:1.06;letter-spacing:-0.025em;color:#121A26;}
.fx-card h3 em{font-style:normal;color:#D63B2F;}
.fx-p{margin:12px 0 18px;max-width:44ch;font-size:14px;line-height:1.55;color:rgba(27,34,48,0.72);}
.fx-sub{display:flex;gap:8px;max-width:440px;}
.fx-sub input{flex:1 1 auto;min-width:0;height:44px;padding:0 12px;border:0;border-bottom:1.5px solid rgba(27,34,48,0.35);background:rgba(27,34,48,0.05);font:inherit;font-size:15px;color:#1B2230;outline:none;border-radius:0;}
.fx-sub input:focus{border-color:#D63B2F;background:rgba(214,59,47,0.06);}
.fx-sub button{display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 18px;background:#1B2230;color:#F3EEE4;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;white-space:nowrap;transition:transform .3s cubic-bezier(.2,1.6,.35,1), background-color .3s ease;}
.fx-sub button i{font-style:normal;color:#D63B2F;}
.fx-sub button:hover{transform:translateY(-2px) rotate(-1deg);}
.fx-card.sent .fx-sub button{background:#D63B2F;} .fx-card.sent .fx-sub button i{color:#F3EEE4;}
.fx-ok{min-height:1.3em;margin:10px 0 0;font-size:13px;color:#1B2230;opacity:0;transition:opacity .3s ease;} .fx-ok.on{opacity:1;} .fx-ok.bad{color:#B3362B;}
.fx-card-r{position:relative;border-left:1.5px dashed rgba(27,34,48,0.25);padding-left:20px;}
.fx-post{position:absolute;top:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:70px;height:84px;background:#D63B2F;color:#F3EEE4;text-align:center;
  font-family:var(--f-label);font-size:8px;letter-spacing:0.14em;text-transform:uppercase;line-height:1.3;transform:rotate(3deg);
  -webkit-mask:radial-gradient(circle 3px, transparent 97%, #000) -3px -3px / 9px 9px, linear-gradient(#000,#000) 4px 4px / calc(100% - 8px) calc(100% - 8px) no-repeat;
  mask:radial-gradient(circle 3px, transparent 97%, #000) -3px -3px / 9px 9px, linear-gradient(#000,#000) 4px 4px / calc(100% - 8px) calc(100% - 8px) no-repeat;}
.fx-post b{font-family:var(--f-display);font-size:24px;font-weight:500;letter-spacing:-0.02em;}
.fx-mark{position:absolute;top:40px;right:44px;width:84px;height:84px;color:rgba(27,34,48,0.5);transform:rotate(-14deg);}
.fx-mark svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;}
.fx-mark span{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-label);font-size:10px;letter-spacing:0.12em;}
.fx-lines{position:absolute;left:20px;right:0;bottom:6px;display:grid;gap:18px;}
.fx-lines i{display:block;height:1px;background:rgba(27,34,48,0.3);}

/* the stamps */
.fx-stamps li{position:relative;z-index:2;width:min(262px,100%);transform:rotate(var(--t)) translate(var(--sx), -16px) scale(1.12);opacity:0;transition:transform .7s cubic-bezier(.2,1.6,.35,1) calc(.25s + var(--d)), opacity .2s ease calc(.25s + var(--d));}
.fx-row1.in .fx-stamps li{transform:rotate(var(--t));opacity:1;}
/* the stamps' paper is whiter than the postcard's, with a fine dark edge that follows the perforations and a short
   shadow, so where they sit on the card their edge still reads (Sam, 19 Oct). The filter sits on the li: on the stamp
   itself its mask would cut the edge away */
.fx-stamps li > a{filter:none;}
.fx-stamps li{filter:drop-shadow(0 0 0.6px rgba(27,34,48,0.75)) drop-shadow(0 0 0.6px rgba(27,34,48,0.5)) drop-shadow(0 7px 8px rgba(0,0,0,0.38));}
.fx-stamp{position:relative;display:block;padding:9px;background:#FFFCF6;
  -webkit-mask:radial-gradient(circle 4px, transparent 97%, #000) -4px -4px / 12px 12px, linear-gradient(#000,#000) 6px 6px / calc(100% - 12px) calc(100% - 12px) no-repeat;
  mask:radial-gradient(circle 4px, transparent 97%, #000) -4px -4px / 12px 12px, linear-gradient(#000,#000) 6px 6px / calc(100% - 12px) calc(100% - 12px) no-repeat;
  transition:transform .35s cubic-bezier(.2,1.6,.35,1);}
.fx-stamp:hover{transform:translateY(-5px) rotate(calc(var(--t)*-0.6));}
.fx-st-in{position:relative;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;column-gap:12px;align-items:center;padding:14px 14px 12px;min-height:96px;box-sizing:border-box;
  color:#F6EFE3;background:var(--c) linear-gradient(160deg, rgba(255,255,255,0.18), rgba(0,0,0,0.14));}
.fx-st-ic{grid-row:1 / span 2;display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.16);}
.fx-st-ic svg{width:24px;height:24px;}
.fx-st-in b{font-family:var(--f-display);font-weight:500;font-size:18px;letter-spacing:-0.015em;line-height:1;}
.fx-st-h{font-family:var(--f-label);font-size:10px;letter-spacing:0.14em;opacity:0.85;}
.fx-st-in i{grid-column:1 / -1;margin-top:10px;font-style:normal;font-size:12.5px;line-height:1.35;opacity:0.92;}
.fx-st-v{position:absolute;right:16px;top:14px;font-family:var(--f-label);font-size:10px;letter-spacing:0.12em;color:rgba(246,239,227,0.8);}
.fx-stamp::after{content:'';position:absolute;right:-6px;bottom:-4px;width:58px;height:58px;border:2px solid rgba(27,34,48,0.55);border-radius:50%;opacity:0;transform:scale(1.4) rotate(-20deg);transition:opacity .2s ease, transform .35s cubic-bezier(.2,1.6,.35,1);pointer-events:none;
  background:repeating-linear-gradient(-20deg, transparent 0 9px, rgba(27,34,48,0.45) 9px 11px);}
.fx-stamp:hover::after{opacity:0.75;transform:scale(1) rotate(-20deg);}


/* the trailheads, now */
.fx-now{max-width:1320px;margin:0 auto;opacity:0;transform:translateY(16px);transition:opacity .6s ease, transform .8s cubic-bezier(.2,.8,.2,1);}
.fx-now.in{opacity:1;transform:none;}
.fx-now ul{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;}
.fx-now li{position:relative;display:flex;flex-direction:column;gap:6px;padding:14px 14px 12px;border:1px solid rgba(var(--c-text-rgb),0.12);border-radius:2px;background:rgba(var(--c-text-rgb),0.025);}
.fx-now b{font-family:var(--f-display);font-weight:500;font-size:15px;letter-spacing:-0.01em;}
.fx-clock{display:flex;align-items:center;gap:9px;}
.fx-clock time{font-family:var(--f-display);font-size:30px;font-weight:400;letter-spacing:-0.03em;line-height:1;font-variant-numeric:tabular-nums;}
.fx-sky{width:16px;height:16px;border-radius:50%;background:transparent;box-shadow:inset -5px -2px 0 0 #DCE3EA;transform:rotate(-20deg);}
.fx-now li.is-day .fx-sky{background:#D2A23A;box-shadow:0 0 0 4px rgba(210,162,58,0.18);transform:none;}
.fx-season{align-self:flex-start;padding:3px 7px;font-family:var(--f-label);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.55);border:1px solid rgba(var(--c-text-rgb),0.2);}
.fx-season.on{color:#F6EFE3;background:#D63B2F;border-color:#D63B2F;transform:rotate(-2deg);}
.fx-now em{font-style:normal;font-family:var(--f-label);font-size:9.5px;letter-spacing:0.1em;color:rgba(var(--c-text-rgb),0.4);}

/* the name in paper letters */
/* one line at every width (Sam, 18 Oct: it broke on two lines on a full-screen MacBook): "Fold Line" is 4.24 times as wide as
   its type size, so the type is sized from the panel's width, about 83% of it, up to 280 px */
.fx-big{position:relative;display:flex;flex-wrap:nowrap;white-space:nowrap;align-items:baseline;gap:0 0.18em;max-width:1320px;margin:9vh auto 0;font-family:var(--f-display);font-weight:var(--d-w,400);font-size:min(280px, 19.6cqi);line-height:0.86;letter-spacing:-0.05em;perspective:900px;}
.fx-w{display:inline-flex;}
.fx-w > span{display:inline-block;transform-origin:50% 92%;transform:rotateX(88deg);opacity:0;transition:transform .9s cubic-bezier(.2,1.5,.35,1) var(--d), opacity .2s ease var(--d), color .3s ease;}
.fx-w.a > span{color:#E9E2D3;text-shadow:0 0.03em 0 rgba(0,0,0,0.35);}
.fx-w.b > span{color:#D63B2F;text-shadow:0 0.03em 0 rgba(0,0,0,0.35);}
.fx-w.b > span{transition-delay:calc(var(--d) + .24s);}
.fx-big.in .fx-w > span{transform:rotate(var(--r));opacity:1;}
.fx-big:hover .fx-w > span{transform:rotate(calc(var(--r)*-1.4)) translateY(-0.03em);}

/* the end: the camp in the middle with a quiet way back up, how to reach us on the right */
.fx-base{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:end;gap:28px;max-width:1320px;margin:0 auto;opacity:0;transition:opacity .8s ease .2s;}
.fx-base.in{opacity:1;}
.fx-end{grid-column:2;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;}
.fx-camp svg{display:block;width:118px;height:48px;overflow:visible;}
.fx-end p{margin:0;font-size:12px;line-height:1.45;color:rgba(var(--c-text-rgb),0.5);}
.fx-tent{fill:#D2A23A;} .fx-door{fill:rgba(0,0,0,0.3);} .fx-guy{stroke:rgba(var(--c-text-rgb),0.4);stroke-width:1.2;fill:none;}
.fx-ground{stroke:rgba(var(--c-text-rgb),0.3);stroke-width:1.5;stroke-dasharray:5 5;}
.fx-logs{stroke:#6E5B49;stroke-width:4;stroke-linecap:round;}
.fx-ball{fill:#D63B2F;}
.fx-fire path{transform-origin:160px 82px;}
.fx-fire .f1{fill:#D63B2F;animation:fxFlick 0.9s ease-in-out infinite alternate;}
.fx-fire .f2{fill:#F2B33D;animation:fxFlick 0.6s ease-in-out infinite alternate-reverse;}
@keyframes fxFlick{0%{transform:scale(1,1) skewX(0);}50%{transform:scale(0.92,1.08) skewX(4deg);}100%{transform:scale(1.04,0.94) skewX(-3deg);}}
.fx-up{display:inline-flex !important;align-items:center;gap:7px;margin-top:2px !important;padding:2px 0 3px !important;border-bottom:1px solid rgba(var(--c-text-rgb),0.18) !important;font-family:var(--f-label) !important;font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1)) !important;letter-spacing:0.16em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.55) !important;transition:color .3s ease, border-color .3s ease;}
.fx-up i{font-style:normal;color:#D63B2F;font-size:12px;}
.fx-up:hover{color:var(--c-text) !important;border-color:#D63B2F !important;}
.fx-talk{grid-column:3;justify-self:end;max-width:40ch;text-align:right;}
.fx-talk .fx-h{margin-bottom:8px;}
.fx-talk a{display:inline-block;font-size:14px;color:var(--c-text);border-bottom:1px solid rgba(214,59,47,0.6);}
.fx-talk p{margin:8px 0 0;font-size:12.5px;line-height:1.5;color:rgba(var(--c-text-rgb),0.6);}
.fx-hours{display:flex;align-items:center;justify-content:flex-end;gap:9px;}
.fx-hours i{width:8px;height:8px;border-radius:50%;background:rgba(var(--c-text-rgb),0.35);flex:0 0 auto;}
.fx-hours.open i{background:#5E8C61;box-shadow:0 0 0 4px rgba(94,140,97,0.25);animation:fxPulse 2s ease-in-out infinite;}
@keyframes fxPulse{50%{box-shadow:0 0 0 7px rgba(94,140,97,0.08);}}

@media (max-width:1100px){
  .fx-now ul{grid-template-columns:repeat(3,minmax(0,1fr));}
}
@media (max-width:760px){
  .foot.fx{padding:6vh 8px 20px;}
  .fx-pan[data-p] > .fx-pan-in{padding-left:12px;padding-right:12px;}
  .fx-card{grid-template-columns:1fr;padding:22px 18px 18px;}
  .fx-card-r{display:none;}
  .fx-sub{flex-direction:column;} .fx-sub button{justify-content:center;}
  .fx-st-in{grid-template-columns:1fr;padding:12px 10px 10px;min-height:0;} .fx-st-ic{grid-row:auto;width:34px;height:34px;margin-bottom:8px;} .fx-st-in b{font-size:15px;} .fx-st-in i{font-size:11.5px;margin-top:6px;}
  .fx-now ul{grid-template-columns:1fr 1fr;} .fx-now li:last-child{grid-column:1 / -1;}
  .fx-clock time{font-size:24px;}
  .fx-base{grid-template-columns:1fr;gap:26px;}
  .fx-end{grid-column:1;} .fx-talk{grid-column:1;justify-self:center;text-align:center;} .fx-hours{justify-content:center;}
}
/* the postcard in the middle, the four stamps stuck round its edges, two each side, at angles. "Follow the walks" is
   written on the card's address lines */
.fx .fx-card{grid-column:2;grid-row:1 / span 2;z-index:1;padding:30px 60px 30px 58px;}
.fx .fx-social,.fx .fx-stamps{display:contents;}
.fx .fx-social > .fx-h{display:none;}
.fx .fx-stamps li:nth-child(1){grid-column:1;grid-row:1;justify-self:end;align-self:end;margin:0 -40px -6px 0;--t:-8deg;--sx:-70px;}
.fx .fx-stamps li:nth-child(3){grid-column:1;grid-row:2;justify-self:end;align-self:start;margin:4px -26px 0 0;--t:5deg;--sx:-70px;}
.fx .fx-stamps li:nth-child(2){grid-column:3;grid-row:1;justify-self:start;align-self:end;margin:0 0 -14px -30px;--t:7deg;--sx:70px;}
.fx .fx-stamps li:nth-child(4){grid-column:3;grid-row:2;justify-self:start;align-self:start;margin:10px 0 0 -42px;--t:-4deg;--sx:70px;}
.fx .fx-card-r{padding-left:22px;}
.fx .fx-lines{bottom:2px;}
.fx .fx-to{position:absolute;left:22px;right:0;bottom:12px;display:flex;flex-direction:column;gap:9px;color:#1B2230;}
.fx .fx-to em{font-style:normal;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(27,34,48,0.55);}
.fx .fx-to b{font-family:var(--f-display);font-weight:500;font-size:15px;letter-spacing:-0.01em;transform:rotate(-2deg);transform-origin:0 50%;}
@media (max-width:1180px){
  /* no room either side: the card in the middle, the four stamps in a row tucked under its bottom edge */
  .fx .fx-row1{grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:auto auto;column-gap:24px;row-gap:0;max-width:860px;}
  .fx .fx-stamps li:nth-child(1){--t:-4deg;} .fx .fx-stamps li:nth-child(2){--t:3deg;} .fx .fx-stamps li:nth-child(3){--t:-3deg;} .fx .fx-stamps li:nth-child(4){--t:4deg;}
  .fx .fx-st-in b{font-size:16px;} .fx .fx-st-in{column-gap:9px;padding:12px 12px 10px;} .fx .fx-st-ic{width:36px;height:36px;}
  .fx .fx-card{grid-column:1 / -1;grid-row:1;padding:26px 28px 26px;}
  .fx .fx-stamps li:nth-child(n){grid-row:2;justify-self:stretch;align-self:start;width:auto;margin:-26px 0 0;--sx:0px;}
  .fx .fx-stamps li:nth-child(1){grid-column:1;} .fx .fx-stamps li:nth-child(2){grid-column:2;margin-top:-12px;}
  .fx .fx-stamps li:nth-child(3){grid-column:3;margin-top:-30px;} .fx .fx-stamps li:nth-child(4){grid-column:4;margin-top:-16px;}
}
@media (max-width:760px){
  .fx .fx-row1{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;row-gap:14px;}
  .fx .fx-social > .fx-h{display:block;grid-column:1 / -1;grid-row:2;margin:14px 0 0;}
  .fx .fx-stamps li:nth-child(1){grid-column:1;grid-row:3;margin-top:0;} .fx .fx-stamps li:nth-child(2){grid-column:2;grid-row:3;margin-top:8px;}
  .fx .fx-stamps li:nth-child(3){grid-column:1;grid-row:4;margin-top:0;} .fx .fx-stamps li:nth-child(4){grid-column:2;grid-row:4;margin-top:6px;}
}
@media (prefers-reduced-motion: reduce){ .fx *{transition:none !important;animation:none !important;} .fx .fx-card,.fx .fx-stamps li,.fx .fx-now,.fx .fx-w > span,.fx .fx-base{opacity:1 !important;transform:none !important;}
  /* the tilts are the design, not motion: they stay */
  .fx .fx-card{transform:rotate(-1.2deg) !important;} .fx .fx-stamps li{transform:rotate(var(--t)) !important;} .fx .fx-w > span{transform:rotate(var(--r)) !important;} }
`;
let cssOn = false;
window.FOOT_X = {
  // the landing sets the markup straight after asking for it, so the footer wires itself up on the next turn
  html(C0){ if(!cssOn){ const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); cssOn = true; } setTimeout(() => init(document), 0); return html(C0); },
  init
};
})();
