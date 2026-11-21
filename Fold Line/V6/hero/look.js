/* ============================================================
   FOLD LINE . LOOK
   Every typeface on the page comes from here, so a new look is one token set, not edits in four files.
   Classic script, loaded in <head> before anything draws, so it runs from a double click on file://.

   Three roles:
   - display: the headline, the wordmark, the trek names, the cover titles, the landing's caption,
     the trail sign's distance
   - text: the lede, the index's line of copy, the button
   - label: every map annotation (the eyebrow, the index numbers, the readout, the print on the covers
     and on the open map)

   V6's type is Unbounded, Sam's pick of the font round (16 Oct 2026). He found it himself on the specimen
   sheet of thirty faces set on the dark room. Martian Mono, narrowed to 75%, shares its geometry and carries
   the labels. Instrument Sans stays for the text.
   The other five pairings (Trail Sign, Knife Cut, Survey Sheet, Thin Air, Field Guide) are at commit 4fc4e3e
   behind ?look=trail|cut|survey|air|guide, the reels in teach/shots/v6-type-round1/. V5's type is tag v5.

   The CSS reads the tokens below as custom properties. Its fallbacks are V5's values
   (font-weight:var(--d-w,400) and so on), so taking a token out puts that one thing back the way V5 had it.
   Canvas text asks LOOK.cf(role, px) for its font string, so the covers, the open map and the trail sign follow.
   ============================================================ */
(function(){
'use strict';

// token names: d display, wm wordmark, c the landing's caption, t text, b the button, l label, n the big readout numbers
const L = {
  key:'unbounded',
  name:'Unbounded',
  google:'family=Unbounded:wght@200..900&family=Martian+Mono:wdth,wght@75..112.5,300..600',
  display:{ family:'Unbounded, system-ui, sans-serif', w:400, sub:'normal', subW:300, stretch:'' },
  text:{ family:'"Instrument Sans", system-ui, sans-serif', w:400 },
  label:{ family:'"Martian Mono", ui-monospace, monospace', w:400, stretch:'condensed' },
  cover:{ title:0.6, sub:0.72, upper:false },
  css:{ '--d-w':400, '--d-scale':0.7, '--d-scale-n':0.84, '--c-scale':0.58, '--c-scale-n':0.74, '--d-track':'-0.03em', '--d-lh':1.04, '--d-acc':'normal',
        '--d-ui':0.76, '--d-ui-w':400, '--d-sub':'normal', '--d-sub-w':300,
        '--wm-w':500, '--wm-size':'18px', '--wm-track':'-0.02em',
        '--t-w':400, '--b-w':500,
        '--l-w':400, '--l-st':'75%', '--l-scale':0.92,
        '--n-w':300, '--n-scale':0.8, '--n-track':'0.01em', '--n-family':'Unbounded, sans-serif' }
};

document.documentElement.dataset.look = L.key;
{
  const link = document.createElement('link'); link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?' + L.google + '&display=swap';
  document.head.appendChild(link);
  const st = document.createElement('style'); st.id = 'look-tokens';
  st.textContent = ':root{--f-display:' + L.display.family + ';--f-text:' + L.text.family + ';--f-label:' + L.label.family + ';' +
    Object.entries(L.css).map(([k, v]) => k + ':' + v).join(';') + '}';
  document.head.appendChild(st);
}

// canvas: font-stretch only goes into the font shorthand as a keyword
function cf(role, px, w){
  const r = role === 'sub' ? L.display : L[role];
  const style = role === 'sub' && r.sub === 'italic' ? 'italic ' : '';
  const weight = w || (role === 'sub' ? (r.subW || r.w) : r.w);
  const sk = role === 'sub' && r.subStretch !== undefined ? r.subStretch : r.stretch;
  const stretch = sk ? sk + ' ' : '';
  return style + stretch + weight + ' ' + px + 'px ' + r.family;
}
// every face and weight the canvas uses, for document.fonts.load before anything is drawn
function loads(){
  return [cf('display', 120), cf('sub', 120), cf('label', 40), cf('label', 40, 400), cf('text', 40)];
}

/* ============================================================
   THE PALETTE: POLAR NIGHT. Sam's pick of the colour round (17 Oct 2026). He had said the room "feels like brown, but I'm
   not sure it's brown" and asked for three light and three dark palettes, expedition trekking, no pink or cyan. Six were
   recorded next to the old colours (teach/shots/v6-palette-round1/) and he kept Polar Night: a navy black room under a
   cold blue-white lamp, flag red for the one accent. Basalt, Forest Hut, Topo Paper, Sandstone and Snowfield are at
   commit 2109637 behind ?pal=basalt|forest|topo|sand|snow. The brown room is tag v5 and V6 before that commit.
   - room, void: the room's colour and what it falls to before the lamp is on
   - table, tableDk: the cloth on the desk. disc: the turntable's board, centre to rim, and its edge
   - text: the type on the room. ink: type on light paper (the header in the dive). accent: the one colour, which is
     also the pin, the trailhead, the route and the inked contour under the cursor
   - tones: the five covers. lamp, lampCold: the lamp warmed up and cold. shade: the scrim behind the type
   - sun, glow, landLamp, landKey, landGnd: the dive's low sun, the hovered card's glow, and the landing's lights
   - cats: the three lengths of trek and their colours (the covers, the panel). board: the turntable's wood
   The code keeps the old brown room's values as its fallbacks, so taking a value out puts that one thing back
   ============================================================ */
const PAL = { key:'polar', name:'Polar Night', light:false,
  room:'#0A1019', void:'#03060B', table:'#1A2638', tableDk:'#0C131E', text:'#E9EEF2', ink:'#121A26', inkSoft:'#3F4B5C',
  accent:'#D63B2F', accentDk:'#AE2C22', tones:['#4F5862', '#4C605F', '#46687F', '#7B6350', '#3A4665'],
  lamp:'#E6EDFF', lampCold:'#9FB7FF', shade:'5,8,12', disc:['#202B3B', '#1A2433', '#111823'], discSide:'#131C29',
  // the dive and the landing go cold with it (Sam: "make the dive's sun and the landing's lamp cold to match"): the low sun
  // on the pin, the glow of the card under the cursor, the landing's lamp, its faint key and the floor under the room's fill
  sun:'#D6E2FF', glow:'#CFE0FF', landLamp:'#E2EAFF', landKey:'#E6EDFF', landGnd:'#0D1119',
  // each map's cover takes the colour of its trek's length (Sam: "quick track, one day, one colour, two to four days
  // another, five days and over another, so it is recognizable"): meadow green, sun ochre, glacier blue
  cats:{ day:{ name:'Day walk', color:'#5E8C61' }, multi:{ name:'Multi-day', color:'#D2A23A' }, exp:{ name:'Expedition', color:'#5B8FC4' } },
  // the turntable's board: ebonized oak, the grain still showing through the black stain
  board:{ pale:'#3F3B38', dark:'#121010', grain:1.0, ringFreq:5.2 } };
if(PAL){
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255); };
  document.documentElement.dataset.pal = PAL.key;
  if(PAL.light) document.documentElement.dataset.palLight = '1';
  const st = document.createElement('style'); st.id = 'pal-tokens';
  st.textContent = ':root{--c-room:' + PAL.room + ';--c-text:' + PAL.text + ';--c-text-rgb:' + rgb(PAL.text) + ';--c-accent-rgb:' + rgb(PAL.accent) +
    ';--c-shade-rgb:' + PAL.shade + (PAL.tag ? ';--c-tag-bg:' + PAL.tag.bg + ';--c-tag-ear:' + PAL.tag.ear + ';--c-tag-fg:' + PAL.tag.fg : '') + '}' +
    // the landing's caption sits on the room as well
    'html{background:' + PAL.room + ';}' +
    // in a light room the covers are pale and printed in dark ink, so the type needs only a light scrim
    'html[data-pal-light] .fo-side::before{background:radial-gradient(closest-side at 58% 50%, rgba(var(--c-shade-rgb),0.82) 0%, rgba(var(--c-shade-rgb),0.6) 60%, rgba(var(--c-shade-rgb),0) 100%);}' +
    'html[data-pal-light] .fo:not(.fo-narrow) .fo-head::before{content:"";position:absolute;z-index:-1;left:-140px;top:-120px;right:-80px;bottom:-140px;pointer-events:none;' +
      'background:radial-gradient(closest-side at 42% 50%, rgba(var(--c-shade-rgb),0.78) 0%, rgba(var(--c-shade-rgb),0.55) 60%, rgba(var(--c-shade-rgb),0) 100%);}';
  document.head.appendChild(st);
}

window.LOOK = {
  key:L.key, name:L.name, display:L.display.family, text:L.text.family, label:L.label.family,
  labelLight:L.label.light || 400,
  cover:L.cover, cf, loads, upper:(s) => L.cover.upper ? String(s).toUpperCase() : s,
  pal:PAL
};
})();
