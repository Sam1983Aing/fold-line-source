/* ============================================================
   FOLD LINE . V7 . when to go: Ribbons (Sam's pick of three, 18 Oct 2026)
   A month board: twelve paper tabs along the top, a row for each trek, and its season laid along its row as a strip of
   torn paper in its colour, one trek after another as the page moves. A red line marks this month, and the line under
   the board says what is in season now. The stop is frozen like the guides while the strips go down.
   Dial (a paper season wheel) and Tear-off (a desk calendar pad) lost, they are at commit 03fc316 behind ?when=.
   Classic script. Exposes window.WHEN_STOP.
   ============================================================ */
(function(){
'use strict';
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (t) => t*t*(3 - 2*t);
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NOW = new Date().getMonth();
const INK = '#1B2230', CREAM = '#F6EFE3';

// ---- the shared pieces: the treks as rows, an angled paper tag in a trek's colour
function rowsOf(C){
  return C.T.map((t, r) => {
    const c = C.catOf(t), on = C.months(t.seasonShort);
    const runs = []; let k = 0;
    // the season as runs of months; one that wraps the year end is two runs
    while(k < 12){ if(!on[k]){ k++; continue; } let e = k; while(e + 1 < 12 && on[e + 1]) e++; runs.push([k, e]); k = e + 1; }
    const avoid = C.clean(t.season.avoid).split(/[.:]/)[0];
    return { t, r, name:t.name, color:c.color, ink:c === C.PAL.cats.multi ? INK : CREAM, on, runs, season:t.seasonShort, avoid };
  });
}
const tag = (R, cls, tilt) => '<span class="wo-tag ' + (cls || '') + '" style="--cat:' + R.color + ';--ink:' + R.ink + ';--tilt:' + (tilt || 0) + 'deg"><span>' + R.name + '</span></span>';
const TILT = [-2.4, 1.8, -1.4, 2.2, -2];

/* ---- 01 Ribbons: the calendar as a board. twelve month tabs along the top, a row per trek, and its season laid
   along its row as a strip of torn paper in its colour, one trek after another as the page moves. A red line marks
   this month and the line under the board says what is in season now ---- */
function ribbons(C, rows){
  const head = '<div class="wr-m0" style="grid-row:1;grid-column:1"></div>' + C.MON.map((m, k) => '<b class="wr-m' + (k === NOW ? ' now' : '') + '" style="grid-row:1;grid-column:' + (k + 2) + ';--tilt:' + ((k % 2) ? 1.2 : -1.2) + 'deg">' + m + '</b>').join('');
  const body = rows.map(R => {
    const longest = R.runs.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a), R.runs[0]);
    const strips = R.runs.map(u => '<i class="wr-strip" title="' + R.name + ': ' + R.season + '. Not outside it: ' + R.avoid.replace(/"/g, '') + '" style="grid-row:' + (R.r + 2) + ';grid-column:' + (u[0] + 2) + ' / span ' + (u[1] - u[0] + 1) + ';--cat:' + R.color + ';--ink:' + R.ink + ';--d:' + (u === longest ? 0 : 0.25) + 's">' + (u === longest ? '<em>' + R.season + '</em>' : '') + '</i>').join('');
    return '<div class="wr-lab" style="grid-row:' + (R.r + 2) + '">' + tag(R, '', TILT[R.r % 5]) + '</div><div class="wr-bg" style="grid-row:' + (R.r + 2) + '"></div>' + strips;
  }).join('');
  const inNow = rows.filter(R => R.on[NOW]).map(R => R.name);
  const today = '<div class="wr-today" style="grid-column:' + (NOW + 2) + ';grid-row:1 / ' + (rows.length + 2) + '"><span>Today</span></div>';
  const line = '<p class="wr-line">' + MONTH[NOW] + ': ' + (inNow.length ? inNow.join(' and ') + (inNow.length > 1 ? ' are' : ' is') + ' in season.' : 'nothing in season, a good month to plan.') + '</p>';
  return '<div class="wr"><div class="wr-board">' + head + body + today + '</div>' + line + '</div>';
}
/* ---- 02 Dial: a season wheel cut from paper, like the old card ones. The months round its rim, a ring per trek in
   its colour where it is in season, and a red arrow at the top. The page turns it a month at a time, and beside it
   the treks in season for the month under the arrow stand up ---- */
function def(C){
  const rows = rowsOf(C);
  return {
    id:'when', kick:'When to go', eyebrow:'When to go', flow:true, cls:'wopt wo-ribbons',
    title:['Every trek keeps', '<em>its own calendar.</em>'],
    lede:'These are the months we run each one. Outside them we leave the mountain alone, for snow, for rain or for the monsoon.',
    pols:ribbons(C, rows), cards:[]
  };
}

// ---- the page side: the strips go down one trek after another while the frame holds, then today's line and its words
const owns = (el) => !!el && el.classList.contains('wopt');
const pinLen = () => 1.5;
function frame(s, y, vh){
  const el = s.el;
  const p = clamp01((y - (s.pinStart - vh*0.25))/(s.pinLen + vh*0.1));
  const rows = s.wr || (s.wr = [...el.querySelectorAll('.wr-lab')].map((lab, r) => ({ lab, strips:[...el.querySelectorAll('.wr-strip')].filter(x => x.style.gridRow.trim().startsWith(String(r + 2))), on:null })));
  rows.forEach((R, r) => { const on = p > 0.04 + r*0.14; if(on !== R.on){ R.on = on; R.lab.classList.toggle('on', on); R.strips.forEach(x => x.classList.toggle('on', on)); } });
  const t = p > 0.82; if(t !== s.wrT){ s.wrT = t; el.querySelector('.wr').classList.toggle('today-on', t); }
}

const CSS = `
.landing .stop.flow.wopt .stop-text{padding-bottom:4vh;}
.wo-tag{display:inline-block;filter:drop-shadow(0 7px 6px rgba(0,0,0,0.42));}
.wo-tag > span{display:block;padding:8px 16px 7px 13px;font-family:var(--f-display);font-weight:500;font-size:calc(16px*var(--d-ui,1));line-height:1;letter-spacing:-0.015em;white-space:nowrap;color:var(--ink);
  background:var(--cat) linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.1));clip-path:polygon(1% 6%, 99% 0, 100% 90%, 2% 100%);transform:rotate(var(--tilt));}

/* 01 ribbons */
.wr{max-width:1180px;margin:0 auto;padding:0 calc(var(--pad-x) + 1vw);}
.wr-board{position:relative;display:grid;grid-template-columns:150px repeat(12,minmax(0,1fr));row-gap:14px;column-gap:4px;align-items:center;}
.wr-m{justify-self:center;padding:6px 0;width:100%;max-width:56px;text-align:center;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-weight:500;font-size:calc(10px*var(--l-scale,1));letter-spacing:0.14em;text-transform:uppercase;color:#1B2230;
  background:#D9CDB6 linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.06));box-shadow:0 6px 10px -6px rgba(0,0,0,0.8);transform:rotate(var(--tilt));}
.wr-m.now{background:#F3EEE4;}
.wr-lab{grid-column:1;transform-origin:0 100%;transform:perspective(700px) rotateX(86deg);opacity:0;transition:transform .9s cubic-bezier(.2,1.45,.35,1), opacity .25s ease;}
.wr-lab.on{transform:none;opacity:1;}
.wr-bg{grid-column:2 / -1;height:34px;border-radius:2px;background:repeating-linear-gradient(90deg, rgba(var(--c-text-rgb),0.05) 0 calc(100%/12 - 4px), transparent calc(100%/12 - 4px) calc(100%/12));}
.wr-strip{position:relative;height:34px;display:flex;align-items:center;padding:0 14px;color:var(--ink);
  background:var(--cat) linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.12));box-shadow:0 8px 12px -8px rgba(0,0,0,0.7);
  clip-path:polygon(0 8%, 3px 30%, 0 52%, 4px 74%, 0 94%, calc(100% - 2px) 100%, 100% 76%, calc(100% - 4px) 54%, 100% 30%, calc(100% - 3px) 6%);
  transform-origin:0 50%;transform:scaleX(0);transition:transform 1s cubic-bezier(.3,.9,.25,1) calc(.25s + var(--d));}
.wr-strip.on{transform:none;}
.wr-strip em{font-style:normal;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-weight:500;font-size:calc(10px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;white-space:nowrap;}
.wr-today{position:relative;justify-self:center;align-self:stretch;width:0;border-left:2px dashed #D63B2F;opacity:0;transition:opacity .6s ease;pointer-events:none;margin-top:-10px;}
.wr-today span{position:absolute;top:-22px;left:50%;transform:translateX(-50%) rotate(-3deg);padding:4px 8px;font-family:var(--f-label);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:#F6EFE3;background:#D63B2F;white-space:nowrap;}
.wr.today-on .wr-today{opacity:1;}
.wr-line{margin:30px 0 0;text-align:center;font-family:var(--f-display);font-size:calc(17px*var(--d-ui,1));color:var(--c-text);opacity:0;transform:translateY(10px);transition:opacity .6s ease .2s, transform .8s cubic-bezier(.2,.8,.2,1) .2s;}
.wr.today-on .wr-line{opacity:1;transform:none;}

@media (max-width:760px){
  .wr{padding:0 14px;}
  .wr-board{grid-template-columns:0 repeat(12,minmax(0,1fr));row-gap:10px;column-gap:2px;}
  .wr-m{font-size:8px;letter-spacing:0.04em;padding:5px 0;}
  .wr-lab{grid-column:1 / -1;align-self:start;}
  .wr-bg,.wr-strip{height:26px;margin-top:40px;}
  .wr-strip em{font-size:8px;letter-spacing:0.08em;}
}
@media (prefers-reduced-motion: reduce){ .wr-lab,.wr-strip,.wr-today,.wr-line{transition:none;} }
`;

let cssOn = false;
window.WHEN_STOP = {
  def(C){ if(!cssOn){ const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); cssOn = true; } return def(C); },
  owns, pinLen, frame
};
})();
