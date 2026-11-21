/* ============================================================
   FOLD LINE . V7 . 06 Book: the Ticket (Sam's pick of three, 18 Oct 2026)
   A walker's ticket prints up out of a slot as the page reaches it, frozen in one screen under the centred headline like
   the guides, When to go and the FAQ. The trek, the month and how many of you are punched into it (only the months the
   trek runs can be punched), the stub on its right adds it up over the trek's own profile drawn as a barcode, and
   tearing the stub off sends it. The ticket keeps a torn edge and a line saying when we write back. Nothing is sent
   anywhere. "Book this map" at the end of a walk prints a fresh ticket for that trek.
   Fan and Pop-up lost, they are at commit 8456022 behind ?book= (sections/book-options.js there).
   Classic script. Exposes window.BOOK_STOP; sections.js builds the stop from it, the old form is the fallback.
   ============================================================ */
(function(){
'use strict';
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const INK = '#1B2230', CREAM = '#F3EEE4';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ---- the treks, what has been picked, the fields and the send
let C = null, TK = [], el = null;
const S = { k:0, m:-1, n:2, name:'', mail:'', sent:false };
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
function treks(){
  TK = C.T.map((t, k) => { const c = C.catOf(t);
    return { t, k, name:t.name, full:t.fullName.split(',')[0], price:t.price.low, on:C.months(t.seasonShort), color:c.color, ink:c === C.PAL.cats.multi ? INK : CREAM, prof:t.profile || [] }; });
}
const no = (k) => String(k + 1).padStart(2, '0');
const PERSON = '<svg viewBox="0 0 24 40" aria-hidden="true"><circle cx="12" cy="5" r="4.2"/><path d="M6 12 Q12 9.5 18 12 L19.5 25 L16.5 25 L16 39 L12.8 39 L12 28 L11.2 39 L8 39 L7.5 25 L4.5 25Z"/></svg>';

function render(){
  const T = TK[S.k], m = S.m >= 0 && T.on[S.m] ? S.m : -1;
  const F = { no:no(S.k), name:T.name, n:S.n, est:fmt(T.price*S.n), mo:m >= 0 ? MONTH[m] : 'Any month' };
  el.querySelectorAll('[data-f]').forEach(e => { const v = F[e.dataset.f]; if(v !== undefined && e.textContent !== String(v)) e.textContent = v; });
  el.querySelectorAll('[data-tk]').forEach(b => { const on = +b.dataset.tk === S.k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  el.querySelectorAll('[data-mo]').forEach(b => { const k = +b.dataset.mo, on = T.on[k]; b.disabled = !on; b.classList.toggle('in', on); b.classList.toggle('on', k === m); b.setAttribute('aria-pressed', String(k === m));
    b.style.setProperty('--cat', T.color); b.style.setProperty('--ink', T.ink); b.title = on ? MONTH[k] : MONTH[k] + ': not in season, we leave the mountain alone'; });
  el.querySelectorAll('[data-n]').forEach(b => { b.classList.toggle('on', +b.dataset.n <= S.n); b.setAttribute('aria-pressed', String(+b.dataset.n === S.n)); });
}
function msg(t, bad){ const p = el.querySelector('.bo-msg'); p.textContent = t; p.classList.toggle('bad', !!bad); p.classList.toggle('on', !!t); }
function send(){
  if(S.sent) return;
  const nm = el.querySelector('input[name=name]'), em = el.querySelector('input[name=email]');
  S.name = nm.value.trim(); S.mail = em.value.trim();
  if(!S.name || !/.+@.+\..+/.test(S.mail)){ const bad = !S.name ? nm : em, box = bad.closest('.bo-in'); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); bad.focus({ preventScroll:true }); msg('We need a name and an email to write back to.', true); return; }
  S.sent = true; msg('');
  const T = TK[S.k];
  el.querySelector('.bo-done-line').textContent = 'Thanks, ' + S.name.split(' ')[0] + '. We write back about the ' + T.full + (S.m >= 0 ? ' in ' + MONTH[S.m] : '') + ' within two working days, with dates, a price and your map.';
  el.querySelector('.bt').classList.add('sent');
  setTimeout(() => { const a = el.querySelector('.bt-again'); if(a && document.activeElement === el.querySelector('.bt-stub')) a.focus({ preventScroll:true }); }, 1700);
}
// a fresh ticket: the torn one goes, a new one prints with the same name and email in it
function reprint(){
  const bt = el.querySelector('.bt');
  S.sent = false; msg(''); el.querySelector('.bo-done-line').textContent = '';
  bt.classList.add('reprint'); bt.classList.remove('printed', 'sent'); void bt.offsetWidth; bt.classList.remove('reprint');
  requestAnimationFrame(() => bt.classList.add('printed'));
}
function bars(T){
  const P = T.prof; if(!P.length) return '';
  const k0 = P[0][0], k1 = P[P.length - 1][0], lo = Math.min(...P.map(q => q[1])), hi = Math.max(...P.map(q => q[1])), N = 46;
  let s = '';
  for(let q = 0; q < N; q++){
    const km = k0 + (k1 - k0)*q/(N - 1); let j = 1; while(j < P.length - 1 && P[j][0] < km) j++;
    const a = P[j - 1], b = P[j], f = b[0] - a[0] ? (km - a[0])/(b[0] - a[0]) : 0, h = a[1] + (b[1] - a[1])*f, v = 0.18 + 0.82*(h - lo)/Math.max(1, hi - lo);
    s += '<rect x="' + (q*4) + '" y="' + (40*(1 - v)).toFixed(1) + '" width="' + (q % 5 === 0 ? 2.4 : 1.6) + '" height="' + (40*v).toFixed(1) + '"/>';
  }
  return '<svg class="bt-bars" viewBox="0 0 184 40" preserveAspectRatio="none" aria-hidden="true">' + s + '</svg>';
}
function punch(k){
  const was = S.k; S.k = k; if(S.m >= 0 && !TK[k].on[S.m]) S.m = -1;
  render(); el.querySelector('.bt-barw').innerHTML = bars(TK[k]);
  if(k !== was){ const st = el.querySelector('.bt-stub'); st.classList.remove('flip'); void st.offsetWidth; st.classList.add('flip'); }
}
const ACT = {
  tk(k){ if(!S.sent) punch(k); },
  mo(k){ if(S.sent || !TK[S.k].on[k]) return; S.m = S.m === k ? -1 : k; render(); },
  n(v){ if(S.sent) return; S.n = Math.max(1, Math.min(8, v)); render(); }
};
function wire(){
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if(!b || !el.contains(b)) return;
    if(b.dataset.tk !== undefined) ACT.tk(+b.dataset.tk);
    else if(b.dataset.mo !== undefined) ACT.mo(+b.dataset.mo);
    else if(b.dataset.n !== undefined) ACT.n(+b.dataset.n);
    else if(b.hasAttribute('data-send')) send();
    else if(b.hasAttribute('data-again')) reprint();
  });
  el.addEventListener('keydown', (e) => { if(e.key === 'Enter' && e.target.matches('input')){ e.preventDefault(); send(); } });
}

function html(){
  const chips = TK.map(T => '<button type="button" class="bt-chip" data-tk="' + T.k + '" aria-pressed="false" style="--cat:' + T.color + ';--ink:' + T.ink + ';--tilt:' + [-2, 1.5, -1, 2, -1.6][T.k] + 'deg"><span>' + T.name + '</span><i class="bt-hole"></i></button>').join('');
  const walk = [1, 2, 3, 4, 5, 6, 7, 8].map(n => '<button type="button" class="bt-w" data-n="' + n + '" aria-label="' + n + (n === 1 ? ' walker' : ' walkers') + '">' + PERSON + '</button>').join('');
  const months = '<div class="bo-months bt-months">' + C.MON.map((m, k) => '<button type="button" data-mo="' + k + '" aria-label="' + MONTH[k] + '"><span>' + m + '</span></button>').join('') + '</div>';
  const T = TK[0];
  return '<div class="bo bt"><div class="bt-mouth"><div class="bt-tk">' +
    '<div class="bt-body"><p class="bt-top"><span>Fold Line</span><span>Walker\u2019s ticket</span><span>No. 06<b data-f="no">01</b></span></p>' +
      '<div class="bt-row"><p class="bo-lab" id="btTrek">Trek</p><div class="bt-treks" role="group" aria-labelledby="btTrek">' + chips + '</div></div>' +
      '<div class="bt-row"><p class="bo-lab" id="btMonth">Month</p><div role="group" aria-labelledby="btMonth">' + months + '</div></div>' +
      '<div class="bt-row"><p class="bo-lab" id="btWalk">Walkers</p><div class="bt-walk" role="group" aria-labelledby="btWalk">' + walk + '</div></div>' +
      '<div class="bt-row bt-you"><label class="bo-in"><span>Your name</span><input name="name" autocomplete="name" spellcheck="false"></label><label class="bo-in"><span>Email</span><input name="email" type="email" autocomplete="email" spellcheck="false"></label></div>' +
      '<p class="bo-msg" role="status"></p><p class="bo-done-line" role="status"></p><button type="button" class="bt-again" data-again>Punch another ticket</button></div>' +
    '<button type="button" class="bt-stub" data-send aria-label="Tear off the stub to send the enquiry"><span class="bt-no" data-f="no">01</span><b class="bt-name" data-f="name">' + T.name + '</b>' +
      '<span class="bt-l bt-lm"><em>Month</em><i data-f="mo">Any month</i></span><span class="bt-l bt-lw"><em>Walkers</em><i data-f="n">2</i></span><span class="bt-l"><em>From</em><i>USD <i data-f="est">' + fmt(T.price*2) + '</i></i></span>' +
      '<span class="bt-barw">' + bars(T) + '</span><span class="bt-tear"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 7.6 L20 17 M8.2 16.4 L20 7"/></svg>Tear here to send</span></button>' +
    '</div></div><i class="bt-slot" aria-hidden="true"></i></div>';
}

/* ---- the page side ---- */
function def(C0){
  C = C0; treks();
  return {
    id:'book', kick:'Book', eyebrow:'Your turn', flow:true, cls:'bopt bo-ticket',
    title:['Pick a map.', '<em>We do the folding.</em>'],
    lede:'Punch in the trek, the month and how many of you. Tear off the stub and we write back within two working days.',
    pols:html(), cards:[]
  };
}
const owns = (e) => !!e && e.classList.contains('bopt');
const pinLen = (narrow) => narrow ? 1.0 : 1.3;
function frame(s, y, vh){
  if(!el){ el = s.el; wire(); punch(S.k); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); }
  const p = clamp01((y - (s.pinStart - vh*0.45))/(vh*0.7));
  const on = p > 0.1; if(on !== s.btOn){ s.btOn = on; el.querySelector('.bt').classList.toggle('printed', on); }
}
// "Book this map" at the end of a walk: that trek punched in, on a fresh ticket if the last one was sent
function pick(key){
  const k = TK.findIndex(T => T.t.key === key); if(k < 0) return;
  if(!el){ S.k = k; return; }
  if(S.sent) reprint();
  punch(k);
}
// for the recordings: the same steps a person takes
async function demo(){
  if(!el) return;
  const q = (s) => el.querySelector(s), press = (b) => { if(!b) return; b.classList.add('press'); setTimeout(() => b.classList.remove('press'), 260); };
  const type = async (name, text) => { const i = el.querySelector('input[name=' + name + ']'); i.focus({ preventScroll:true }); for(const ch of text){ i.value += ch; await wait(55 + Math.random()*45); } i.blur(); };
  press(q('[data-tk="1"]')); ACT.tk(1); await wait(1100);
  press(q('[data-mo="5"]')); ACT.mo(5); await wait(800);
  press(q('[data-n="3"]')); ACT.n(3); await wait(700);
  await type('name', 'Ana Ruiz'); await wait(250); await type('email', 'ana@example.com'); await wait(600);
  press(q('[data-send]')); send();
}

const CSS = `

.landing .stop.flow.bopt .stop-text{padding-bottom:3vh;}
.bo{position:relative;max-width:1180px;margin:0 auto;padding:0 calc(var(--pad-x) + 1vw);color:${INK};}
.bo button{appearance:none;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;}
.bo button:focus-visible{outline:2px solid #D63B2F;outline-offset:2px;}
.bo button.press{transform:scale(0.92) !important;transition:transform .12s ease !important;}
.bo-lab{margin:0 0 7px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(27,34,48,0.55);}
.bo-months{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:0 0 14px;}
.bo-months button{position:relative;height:26px;border-radius:2px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.08em;text-transform:uppercase;color:rgba(27,34,48,0.32);
  background:repeating-linear-gradient(135deg, rgba(27,34,48,0.05) 0 3px, transparent 3px 7px);transition:background-color .3s ease, color .3s ease, transform .3s cubic-bezier(.2,1.6,.35,1);}
.bo-months button.in{color:var(--ink);background:var(--cat) linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.08));}
.bo-months button.on{background:#D63B2F;color:#F6EFE3;transform:translateY(-2px) rotate(-3deg);box-shadow:0 6px 8px -5px rgba(0,0,0,0.6);}
.bo-months button:disabled{cursor:not-allowed;}
.bo-in{display:flex;flex-direction:column;gap:5px;margin:0 0 12px;min-width:0;}
.bo-in span{font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(27,34,48,0.55);}
.bo-in input{appearance:none;border:0;border-bottom:1.5px solid rgba(27,34,48,0.3);background:rgba(27,34,48,0.04);width:100%;min-width:0;box-sizing:border-box;height:34px;padding:0 8px;font:inherit;font-size:15px;color:${INK};outline:none;border-radius:0;}
.bo-in input:focus{border-color:#D63B2F;background:rgba(214,59,47,0.06);}
.bo-in.shake{animation:boShake .4s ease;}
@keyframes boShake{20%,60%{transform:translateX(-5px);}40%,80%{transform:translateX(5px);}}
.bo-msg{min-height:1em;margin:8px 0 0;font-size:12.5px;color:rgba(27,34,48,0.7);opacity:0;transition:opacity .3s ease;}
.bo-msg.on{opacity:1;} .bo-msg.bad{color:#B3362B;}
.bo-done-line{margin:0;font-family:var(--f-display);font-size:calc(17px*var(--d-ui,1));line-height:1.35;color:var(--c-text);text-align:center;opacity:0;transform:translateY(10px);transition:opacity .6s ease .3s, transform .8s cubic-bezier(.2,.8,.2,1) .3s;pointer-events:none;}

/* 02 ticket */
.bt{display:flex;flex-direction:column;align-items:center;}
.bt-mouth{position:relative;width:min(1060px,100%);height:370px;overflow:hidden;padding:20px 20px 0;margin:-20px -20px 0;box-sizing:content-box;}
.bt-tk{position:relative;display:flex;width:100%;height:350px;filter:drop-shadow(0 22px 26px rgba(0,0,0,0.6));transform:translateY(102%);transition:transform 1.5s steps(9, jump-end);}
.bt.printed .bt-tk{transform:none;transition:transform 1.4s cubic-bezier(.3,.85,.3,1);}
.bt-slot{display:block;width:min(1040px,104%);height:10px;margin-top:-4px;border-radius:5px;background:#05080D;box-shadow:inset 0 2px 3px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.08);}
.bt-body{position:relative;flex:1 1 auto;padding:20px 30px 18px;background:${CREAM} linear-gradient(180deg, rgba(255,255,255,0.35), rgba(0,0,0,0.03));
  -webkit-mask:radial-gradient(circle 12px at 0 50%, transparent 98%, #000) ;mask:radial-gradient(circle 12px at 0 50%, transparent 98%, #000);}
.bt-top{display:flex;justify-content:space-between;margin:0 0 12px;padding-bottom:9px;border-bottom:1.5px solid rgba(27,34,48,0.8);font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.2em;text-transform:uppercase;color:#121A26;}
.bt-top b{font-weight:500;color:#D63B2F;}
.bt-row{display:grid;grid-template-columns:96px 1fr;align-items:center;margin:0 0 12px;}
.bt-row .bo-lab{margin:0;}
.bt-row .bo-months{grid-template-columns:repeat(12,minmax(0,1fr));margin:0;}
.bt-treks{display:flex;flex-wrap:wrap;gap:6px 8px;}
.bt-chip{position:relative;filter:drop-shadow(0 4px 4px rgba(0,0,0,0.25));transition:transform .35s cubic-bezier(.2,1.6,.35,1);}
.bt-chip > span{display:block;padding:7px 14px 6px 11px;font-family:var(--f-display);font-weight:500;font-size:15px;line-height:1;letter-spacing:-0.01em;white-space:nowrap;color:var(--ink);background:var(--cat);clip-path:polygon(1% 6%, 99% 0, 100% 90%, 2% 100%);transform:rotate(var(--tilt));opacity:0.5;transition:opacity .3s ease;}
.bt-chip.on > span{opacity:1;}
.bt-chip.on{transform:translateY(-2px);}
.bt-hole{position:absolute;right:5px;top:50%;width:9px;height:9px;margin-top:-5px;border-radius:50%;background:#0A1019;box-shadow:inset 0 1px 2px rgba(0,0,0,0.8);transform:scale(0);transition:transform .25s cubic-bezier(.2,2,.35,1);}
.bt-chip.on .bt-hole{transform:scale(1);}
.bt-months button.on::after{content:'';position:absolute;left:50%;bottom:3px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#0A1019;}
.bt-walk{display:flex;gap:4px;}
.bt-w{width:24px;height:38px;color:rgba(27,34,48,0.22);transition:color .25s ease, transform .3s cubic-bezier(.2,1.8,.35,1);}
.bt-w svg{display:block;width:100%;height:100%;fill:currentColor;}
.bt-w.on{color:#D63B2F;transform:translateY(-2px);}
.bt-you{grid-template-columns:1fr 1fr;gap:18px;margin-top:4px;}
.bt-you .bo-in{margin:0;}
.bt .bo-msg{margin:4px 0 0;}
/* the rows share the ticket's height, so its lower half is not left empty (Sam, 19 Oct: "space it out to fill the gap
   underneath") */
.bt-body{display:flex;flex-direction:column;}
.bt-body > .bt-row{flex:1 1 0;margin:0;min-height:0;}
.bt-body > .bt-you{align-items:end;padding-bottom:6px;}
.bt .bo-msg{flex:none;min-height:16px;}
.bt-body .bo-done-line{position:absolute;left:28px;right:28px;bottom:18px;color:#121A26;text-align:left;}
.bt-stub{position:relative;flex:0 0 250px;display:flex !important;flex-direction:column;align-items:flex-start;padding:18px 22px 16px !important;text-align:left;cursor:pointer;color:${INK};
  background:#E9E0CC linear-gradient(180deg, rgba(255,255,255,0.3), rgba(0,0,0,0.04)) !important;border-left:2px dashed rgba(27,34,48,0.35) !important;transform-origin:0 0;
  -webkit-mask:radial-gradient(circle 12px at 100% 50%, transparent 98%, #000);mask:radial-gradient(circle 12px at 100% 50%, transparent 98%, #000);transition:transform .3s ease;}
.bt-stub:hover{transform:rotate(1.2deg);}
.bt-no{font-family:var(--f-display);font-weight:500;font-size:46px;line-height:0.9;letter-spacing:-0.03em;color:#D63B2F;}
.bt-name{margin:6px 0 10px;font-family:var(--f-display);font-weight:500;font-size:19px;letter-spacing:-0.015em;color:#121A26;}
.bt-l{display:flex;justify-content:space-between;width:100%;padding:4px 0;border-top:1px dotted rgba(27,34,48,0.3);font-size:12.5px;}
.bt-l em{font-style:normal;font-family:var(--f-label);font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(27,34,48,0.55);align-self:center;}
.bt-l i{font-style:normal;font-weight:600;}
.bt-barw{display:block;width:100%;margin-top:auto;}
.bt-bars{display:block;width:100%;height:34px;fill:#121A26;}
.bt-tear{display:flex;align-items:center;gap:7px;margin-top:8px;font-family:var(--f-label);font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:#D63B2F;}
.bt-tear svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;transform:rotate(-90deg);}
.bt-stub.flip .bt-no,.bt-stub.flip .bt-name{animation:btFlip .5s ease;}
@keyframes btFlip{0%{transform:rotateX(0);}45%{transform:rotateX(90deg);}100%{transform:rotateX(0);}}
.bt.sent .bt-stub{transform:translate(70px, 640px) rotate(24deg);transition:transform 1.6s cubic-bezier(.5,-0.25,.75,.6);pointer-events:none;}
.bt.sent .bt-body > *:not(.bt-top):not(.bo-done-line):not(.bt-again){opacity:0.3;transition:opacity .6s ease .5s;}
.bt.sent .bt-body{clip-path:polygon(0 0, 100% 0.00%, calc(100% - 7px) 4.17%, 100% 8.33%, calc(100% - 7px) 12.50%, 100% 16.67%, calc(100% - 7px) 20.83%, 100% 25.00%, calc(100% - 7px) 29.17%, 100% 33.33%, calc(100% - 7px) 37.50%, 100% 41.67%, calc(100% - 7px) 45.83%, 100% 50.00%, calc(100% - 7px) 54.17%, 100% 58.33%, calc(100% - 7px) 62.50%, 100% 66.67%, calc(100% - 7px) 70.83%, 100% 75.00%, calc(100% - 7px) 79.17%, 100% 83.33%, calc(100% - 7px) 87.50%, 100% 91.67%, calc(100% - 7px) 95.83%, 100% 100.00%, 0 100%);}
.bt.sent .bo-done-line{opacity:1;transform:none;transition-delay:.9s;}

.bt-again{display:none !important;margin:10px 0 0;font-family:var(--f-label) !important;font-size:calc(9.5px*var(--l-scale,1)) !important;letter-spacing:0.16em;text-transform:uppercase;color:#D63B2F !important;border-bottom:1px solid rgba(214,59,47,0.5) !important;padding:0 0 2px !important;}
.bt.sent .bt-again{display:inline-block !important;position:absolute;left:30px;bottom:14px;opacity:0;animation:btIn .5s ease 1.6s forwards;}
.bt.sent .bt-body .bo-done-line{bottom:44px;}
@keyframes btIn{to{opacity:1;}}
.bt.reprint .bt-tk{transition:none !important;}
@media (max-width:760px){
  .landing .stop.bopt h2{font-size:31px;}
  .bo{padding:0 14px;}
  .bo-months{grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;} .bo-months button{height:22px;font-size:8px;letter-spacing:0.02em;}
  .bo-in input{height:30px;font-size:13px;}
  .bt-mouth{height:auto;width:100%;}
  .bt-tk{flex-direction:column;height:auto;}
  .bt-body{padding:14px 14px 12px;-webkit-mask:none;mask:none;}
  .bt-row{grid-template-columns:1fr;gap:5px;}
  .bt-body > .bt-row{flex:none;margin-bottom:10px;}
  .bt-body > .bt-you{padding-bottom:0;}
  .bt-row .bo-months{grid-template-columns:repeat(6,minmax(0,1fr));}
  .bt-you{grid-template-columns:1fr 1fr;gap:10px;}
  .bt-stub{flex:0 0 auto;width:100%;box-sizing:border-box;border-left:0 !important;border-top:2px dashed rgba(27,34,48,0.35) !important;-webkit-mask:none;mask:none;display:grid !important;grid-template-columns:auto 1fr;column-gap:12px;padding:12px 14px !important;}
  .bt-no{grid-row:1 / span 2;font-size:38px;} .bt-name{margin:0;font-size:17px;} .bt-l{grid-column:2;} .bt-lm, .bt-lw{display:none !important;}
  .bt-chip > span{font-size:13px;padding:6px 11px 5px 9px;} .bt-row{margin-bottom:8px;} .bt-top{margin-bottom:8px;}
  .bt-bars{height:20px;} .bt-tear{margin-top:5px;}
  .bt-barw,.bt-tear{grid-column:1 / -1;}
  .bt-body .bo-done-line{left:14px;right:14px;}
  .bt.sent .bt-again{left:14px;bottom:12px;}
}
@media (prefers-reduced-motion: reduce){ .bt-tk,.bt-stub,.bt-chip,.bt-w,.bt-hole,.bo-months button,.bo-done-line{transition:none !important;} .bt-stub.flip .bt-no,.bt-stub.flip .bt-name{animation:none;} .bt.sent .bt-stub{visibility:hidden;} .bt.sent .bt-again{animation:none;opacity:1;} }
`;

let cssOn = false;
window.BOOK_STOP = {
  def(C0){ if(!cssOn){ const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); cssOn = true; } return def(C0); },
  owns, pinLen, frame, pick, demo, get state(){ return S; }
};
})();
