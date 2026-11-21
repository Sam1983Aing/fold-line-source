/* ============================================================
   FOLD LINE . V7 . the navigation: Index Tabs (Sam's pick of three, 18 Oct 2026)
   Paper tabs hang from the top edge of the screen between the mark and Book a trek, one per section, and the one you
   are in drops down in red. At 06 Book no tab is down, the Book a trek chip turns red instead. Where the row has no
   room (900 px and under) one tab hangs alone with the section's short name, and opens the others as a stack.
   A tab takes you to its section through TR.go(i) in landing.js. Hidden inside a walk.
   Trail Line and Map Index lost, they are at commit 8456022 behind ?nav= (sections/nav-options.js there).
   Classic script. Exposes window.NAV { open(bool) } for recordings.
   ============================================================ */
(function(){
'use strict';
// the sections: the hero's treks, then the stops. i is the stop's place in the landing (-1 is the top). Book has the chip
const SEC = [
  { i:-1, label:'Treks', short:'Treks' },
  { i:0, label:'Lengths', short:'Lengths' },
  { i:1, label:'Included', short:'Included' },
  { i:2, label:'Guides', short:'Guides' },
  { i:3, label:'When to go', short:'When' },
  { i:4, label:'FAQ', short:'FAQ' },
  { i:5, label:'Book', short:'Book', chip:true }
];
const TABS = SEC.filter(s => !s.chip);

const CSS = `
.navx{position:absolute;left:0;right:0;top:0;z-index:2;display:flex;justify-content:center;pointer-events:none;transition:opacity .5s ease, visibility 0s;}
html.mode-trek .navx{opacity:0;visibility:hidden;transition:opacity .3s ease, visibility 0s linear .3s;}
/* the tabs come in with the mark and Book a trek, not before the hero's intro (Sam, 19 Oct) */
html.hero-on:not(.hero-live) .navx{opacity:0;visibility:hidden;transition:none;}
html.hero-live:not(.mode-trek) .navx{transition:opacity .9s ease, visibility 0s;}
.navx :where(button){appearance:none;border:0;background:none;padding:0;margin:0;cursor:pointer;font:inherit;color:inherit;}
.navx :where(button):focus-visible{outline:2px solid #D63B2F;outline-offset:3px;}
.nt-row,.nt-cur{pointer-events:auto;}
.nx-scrim{position:fixed;inset:0;z-index:-1;background:rgba(6,10,16,0.6);opacity:0;pointer-events:none;transition:opacity .35s ease;}
.nt-row{display:flex;gap:3px;}
.nt{position:relative;display:flex;align-items:baseline;gap:7px;padding:calc(var(--pad-y) + 4px) 15px 11px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;white-space:nowrap;
  color:#1B2230;background:#E4DACA linear-gradient(180deg, rgba(0,0,0,0.06), rgba(255,255,255,0.12));border-radius:0 0 7px 7px;box-shadow:0 10px 16px -10px rgba(0,0,0,0.8);
  transform:translateY(-8px) rotate(var(--tilt,0deg));transition:transform .5s cubic-bezier(.2,1.5,.35,1), background-color .3s ease, color .3s ease;}
.nt b{font-family:var(--f-display);font-weight:500;font-size:12px;letter-spacing:0;color:rgba(27,34,48,0.45);transition:color .3s ease;}
.nt:hover{transform:translateY(-4px) rotate(var(--tilt,0deg));}
.nt.on{background-color:#D63B2F;color:#F6EFE3;transform:translateY(0) rotate(0deg);box-shadow:0 14px 20px -10px rgba(0,0,0,0.85);}
.nt.on b{color:rgba(246,239,226,0.7);}
.nt-cur{display:none;align-items:baseline;gap:5px;padding:calc(var(--pad-y) + 3px) 10px 10px;border-radius:0 0 7px 7px;background:#D63B2F;color:#F6EFE3;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;
  box-shadow:0 12px 18px -10px rgba(0,0,0,0.85);transform:rotate(-1.5deg);transition:transform .4s cubic-bezier(.2,1.5,.35,1), background-color .3s ease, color .3s ease;}
.nt-cur b{display:none;font-family:var(--f-display);font-weight:500;font-size:13px;letter-spacing:0;}
.nt-cur i{display:block;width:0;height:0;margin-left:2px;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid currentColor;align-self:center;transition:transform .3s ease;}
.nt-cur.off{background:#E4DACA;color:#1B2230;}
.navx.open .nt-cur{transform:rotate(0deg) translateY(3px);}
.navx.open .nt-cur i{transform:rotate(180deg);}
/* at 06 Book the chip is the tab that is down */
.book-top.nav-on{transform:rotate(-1.4deg) translateY(3px);}
.book-top.nav-on::before{background:linear-gradient(168deg,#E4574A 0%,#D63B2F 58%,#B9322A 100%);}
.book-top.nav-on,.book-top.nav-on .bt-label,.book-top.nav-on .bt-ar{color:#F6EFE3;}
.book-top.nav-on .dot{background:#F6EFE3;}
@media (max-width:1180px){ .nt b{display:none;} .nt{padding-left:12px;padding-right:12px;letter-spacing:0.12em;} }
@media (max-width:900px){
  /* no room for the row: one tab hangs in the header's gap and opens the rest as a stack under it */
  .navx{flex-direction:column;align-items:center;}
  .nt-cur{display:flex;}
  .nt-row{position:fixed;top:64px;left:50%;width:210px;margin-left:-105px;flex-direction:column;gap:4px;pointer-events:none;}
  .nt-row .nt{padding:13px 16px;font-size:10px;border-radius:2px 7px 7px 2px;justify-content:flex-start;opacity:0;visibility:hidden;transform:translateY(-14px) rotate(var(--tilt,0deg));
    transition:transform .45s cubic-bezier(.2,1.4,.35,1) calc(var(--k)*0.04s), opacity .2s ease calc(var(--k)*0.04s), visibility 0s linear .45s, background-color .3s ease, color .3s ease;}
  .nt-row .nt b{display:inline;}
  .navx.open .nx-scrim{opacity:1;pointer-events:auto;}
  .navx.open .nt-row{pointer-events:auto;}
  .navx.open .nt-row .nt{opacity:1;visibility:visible;transform:translateX(calc(var(--k)*3px - 8px)) rotate(var(--tilt,0deg));transition-delay:calc(var(--k)*0.04s), calc(var(--k)*0.04s), 0s, 0s, 0s;}
  .navx.open .nt-row .nt.on{transform:translateX(14px);}
}
@media (max-width:420px){ .nt-cur{padding-left:7px;padding-right:7px;font-size:8.5px;letter-spacing:0.06em;gap:4px;} }
@media (max-width:380px){ .nt-cur span{display:none;} .nt-cur b{display:inline;} }
@media (prefers-reduced-motion: reduce){ .nt,.nt-cur,.nt-row .nt,.nx-scrim,.book-top.nav-on{transition:none !important;} }
`;

function build(){
  const top = document.querySelector('.top'); if(!top || document.querySelector('.navx')) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const nav = document.createElement('nav'); nav.className = 'navx'; nav.setAttribute('aria-label', 'Sections');
  nav.innerHTML = '<i class="nx-scrim"></i><button type="button" class="nt-cur" aria-expanded="false" aria-controls="ntRow" aria-label="Sections, now Treks"><b>00</b><span>Treks</span><i aria-hidden="true"></i></button>' +
    '<div class="nt-row" id="ntRow">' + TABS.map((s, k) => '<button type="button" class="nt" data-k="' + k + '" style="--k:' + k + ';--tilt:' + (k % 2 ? 0.7 : -0.6) + 'deg"><b>' + String(k).padStart(2, '0') + '</b>' + s.label + '</button>').join('') + '</div>';
  top.querySelector('.brand').after(nav);
  const cur = nav.querySelector('.nt-cur'), chip = document.getElementById('bookTop');
  const open = (o) => { nav.classList.toggle('open', o); cur.setAttribute('aria-expanded', String(o)); };
  // opened from the keyboard, the focus goes into the stack. a tap leaves it where it is
  cur.addEventListener('click', (e) => { e.stopPropagation(); open(!nav.classList.contains('open')); if(nav.classList.contains('open') && e.detail === 0){ const t = nav.querySelector('.nt.on') || nav.querySelector('.nt'); setTimeout(() => t.focus({ preventScroll:true }), 60); } });
  document.addEventListener('click', (e) => { if(!nav.contains(e.target)) open(false); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && nav.classList.contains('open')){ open(false); cur.focus({ preventScroll:true }); } });
  nav.addEventListener('click', (e) => {
    if(e.target.closest('.nx-scrim')){ open(false); return; }
    const b = e.target.closest('.nt'); if(!b) return;
    open(false);
    const TR = window.APP && window.APP.TR; if(TR && TR.go) TR.go(TABS[+b.dataset.k].i);
  });
  // where you are: the last section whose stop has come up past the middle of the screen
  let at = null;
  const tick = () => {
    const TR = window.APP && window.APP.TR;
    if(TR && TR.at && TR.mode !== 'trek'){
      const y = window.scrollY, vh = window.innerHeight;
      let k = 0;
      SEC.forEach((s, q) => { if(s.i >= 0 && y >= TR.at(s.i, 0) - vh*0.45) k = q; });
      if(k !== at){ at = k; mark(k); }
    } else if(at !== null && TR && TR.mode === 'trek'){ at = null; if(chip) chip.classList.remove('nav-on'); }
    requestAnimationFrame(tick);
  };
  function mark(k){
    const s = SEC[k];
    nav.querySelectorAll('.nt').forEach(b => { const on = TABS[+b.dataset.k] === s; b.classList.toggle('on', on); if(on) b.setAttribute('aria-current', 'location'); else b.removeAttribute('aria-current'); });
    if(chip){ chip.classList.toggle('nav-on', !!s.chip); if(s.chip) chip.setAttribute('aria-current', 'location'); else chip.removeAttribute('aria-current'); }
    cur.querySelector('span').textContent = s.chip ? 'Sections' : s.short; cur.querySelector('b').textContent = String(k).padStart(2, '0'); cur.classList.toggle('off', !!s.chip);
    cur.setAttribute('aria-label', 'Sections, now ' + s.label);
  }
  requestAnimationFrame(tick);
  window.NAV = { open };
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
