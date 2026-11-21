/* ============================================================
   FOLD LINE . V7 . the stops on the landing page
   Sam (17 Oct 2026, after round 1): the scroll from the hero goes down the landing page. A red thread leads from stop
   to stop, and each stop is a paper station like Map Goes On, with all the details and floating cards, down to the
   final call and the footer.
   This file is the content: six stops built from hero/treks-data.js (the researched numbers, sources in
   data/treks.md), never typed in by hand. Also the hiker as a paper cut-out in the page (the same figure as the 3D
   walker in interior/interior.js). sections/stations.js builds the paper stations, sections/landing.js runs it all.
   The guides are invented people (marked in the README). Classic script, file:// safe. Exposes window.SECTIONS.
   ============================================================ */
(function(){
'use strict';
const T = window.TREKS || [];
const PAL = (window.LOOK && window.LOOK.pal) || { cats:{ day:{ name:'Day walk', color:'#5E8C61' }, multi:{ name:'Multi-day', color:'#D2A23A' }, exp:{ name:'Expedition', color:'#5B8FC4' } }, accent:'#D63B2F', ink:'#121A26', room:'#0A1019' };
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const word = (n) => WORDS[n] || String(n);
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// the same rule as catOf() in hero/hero-kit.js: a day walk, two to four days, five and over
const catKey = (d) => d <= 1 ? 'day' : d <= 4 ? 'multi' : 'exp';
const catOf = (t) => PAL.cats[catKey(t.days)];
const RANGE = { day:'1 day', multi:'2 to 4 days', exp:'5 days and over' };
const byKey = (k) => T.find(t => t.key === k);
const daysTxt = (d) => d + (d === 1 ? ' day' : ' days');
// the research keeps its sources in brackets at the end of each line: the page shows the line, data/treks.md the source
const clean = (s) => String(s || '').replace(/\s*\([^()]*\)\s*(?=[.:,]|$)/g, '').replace(/\s+\./g, '.').trim();
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "Nov to Apr", "Jan to Mar, Jun to Oct": the months a trek is run, as twelve flags
function months(short){
  const on = new Array(12).fill(false);
  String(short || '').split(',').forEach(part => {
    const m = part.trim().match(/^([A-Z][a-z]{2})(?:\s+to\s+([A-Z][a-z]{2}))?/);
    if(!m) return;
    const a = MON.indexOf(m[1]), b = m[2] ? MON.indexOf(m[2]) : a;
    if(a < 0 || b < 0) return;
    for(let k = a; ; k = (k + 1) % 12){ on[k] = true; if(k === b) break; }
  });
  return on;
}
const chip = (c) => '<p class="chip-cat" style="--cat:' + c.color + '"><i></i>' + esc(c.name) + '</p>';

/* ============================================================
   the six stops. each: the text that scrolls on the left, and the cards that float over its paper station
   ============================================================ */
// Sam (17 Oct 2026): "present it in a more standard way ... we offer three types of trek". Then (18 Oct): the cards should
// feel like the paper cut-outs, all the same size, and say how many treks each length has and where the price starts, not
// which treks: "we're not limiting ourselves to the five from the hero". The count takes the five on the table and the ten
// more the globe shows as dots (hero/globe.js, MORE), sorted by the same rule as the covers
function lengths(){
  const g = { day:[], multi:[], exp:[] };
  T.forEach(t => g[catKey(t.days)].push(t));
  const more = window.FOLD_GLOBE_MORE || [];
  const count = { day:g.day.length, multi:g.multi.length, exp:g.exp.length };
  const span = { day:g.day.map(t => t.days), multi:g.multi.map(t => t.days), exp:g.exp.map(t => t.days) };
  more.forEach(m => { const k = catKey(m[3]); count[k]++; span[k].push(m[3]); });
  const minP = (l) => Math.min(...l.map(t => t.price.low));
  const maxHigh = (l) => Math.max(...l.map(t => t.high.m));
  const tg = byKey('tongariro'), inca = byKey('inca');
  const hours = tg ? ((tg.kit.find(k => /allow (\d+) hours/i.test(k.why)) || {}).why || '').match(/allow (\d+) hours/i) : null;
  const water = tg ? tg.kit.find(k => /litres/i.test(k.item)) : null;
  const kg = inca ? ((inca.kit.find(k => /porter allowance/i.test(k.item)) || {}).why || '').match(/(\d+) kg/) : null;
  const types = new Set(); g.exp.forEach(t => t.nights.forEach(n => types.add(n.type)));
  const beds = [types.has('teahouse') && 'Teahouses', types.has('refugio') && 'refugios', types.has('tent') && 'tents'].filter(Boolean);
  const range = (l) => Math.min(...l) + ' to ' + Math.max(...l) + ' days';
  // more on each card, from the research where there is a number to give (Sam: "here you can add more")
  const facts = {
    day:[hours ? 'Up to ' + hours[1] + ' hours on your feet' : 'One long day on your feet', water ? 'A day pack with ' + water.item.replace(' of water', '').toLowerCase() + ' of water' : 'A day pack and your lunch', 'A pickup at dawn, a bed in town at night'],
    multi:[range(span.multi) + ', camps or huts each night', kg ? 'Porters carry ' + kg[1] + ' kg of your things' : 'Porters for the heavy part', 'Passes up to ' + fmt(maxHigh(g.multi)) + '\u202Fm'],
    exp:[range(span.exp) + ', rest days built in', beds.length ? beds.slice(0, -1).join(', ') + (beds.length > 1 ? ' or ' : '') + beds[beds.length - 1] : 'Huts and camps', 'Summits up to ' + fmt(maxHigh(g.exp)) + '\u202Fm']
  };
  // Sam (18 Oct): "too safe ... use a paper cut like underneath the description, at an angle, and say one day,
  // multi-day, expedition ... a little bit of colour, green to match our card, the other one yellow"
  const TAG = { day:'1 day', multi:'Multi-day', exp:'Expedition' }, TILT = [-3, 2.2, -2];
  const UNDER = { day:'There and back by dinner', multi:RANGE.multi, exp:RANGE.exp };
  const what = {
    day:'Up before light, over the top and down by dinner.',
    multi:'A few days on the trail, a camp or a hut each night.',
    exp:'A week or more, high and far, at the altitude\u2019s pace.'
  };
  return {
    id:'lengths', kick:'Pick your length', eyebrow:'First step',
    title:['Three kinds', '<em>of trek.</em>'],
    lede:'We run three kinds of trek, sorted by how long you walk. Pick the length first, then the mountain.',
    // Sam (18 Oct): the headline and subtitle on the left, "add a little bit more meat to it ... invent content that fits"
    more:'<p class="stop-sub">A day walk is one big push: out at dawn, over the top, back in town for dinner. Multi-day treks link camps and huts, with porters for the heavy part. Expeditions go high and far, with rest days so your body can catch up with the altitude.</p>' +
      '<ul class="stop-tags" aria-label="In every package"><li>A guide every day</li><li>The folded map</li><li>Transfers</li><li>Permits sorted</li></ul>',
    flip:true,
    cards:['day', 'multi', 'exp'].filter(k => g[k].length).map((k, n) => ({ cat:PAL.cats[k], paper:true, html:
      '<p class="pc-top"><span class="pc-tag" style="--tilt:' + TILT[n % 3] + 'deg;--tag-ink:' + (k === 'multi' ? '#1B2230' : '#F6EFE3') + '"><span>' + TAG[k] + '</span></span><span class="pc-n">0' + (n + 1) + ' / 03</span></p>' +
      '<p class="pc-range">' + esc(UNDER[k]) + '</p>' +
      '<p class="pc-count"><b>' + count[k] + '</b> ' + (count[k] === 1 ? 'trek' : 'treks') + ' to pick from</p>' +
      '<p class="pc-line">' + esc(what[k]) + '</p>' +
      '<ul class="pc-facts">' + facts[k].map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' +
      '<p class="pc-from"><span>From</span><b>USD ' + fmt(minP(g[k])) + '</b><span>per person</span></p>' }))
  };
}

function pocket(){
  const gmax = Math.max(...T.map(t => t.group.max));
  const types = new Set(); T.forEach(t => t.nights.forEach(n => types.add(n.type)));
  const sleep = [types.has('tent') && 'tents', types.has('refugio') && 'refugios', types.has('teahouse') && 'teahouses'].filter(Boolean);
  const tg = byKey('tongariro'), inca = byKey('inca');
  const incaDay = inca ? (inca.permits[0].match(/About (\d+) permits a day/) || [])[1] : null;
  // name, what it is, one line of fact, the colour of its paper tag
  const items = [
    ['The map, folded', 'Your trek on one sheet: the route, the heights and every night. It goes home with you.', 'One sheet for every walker', PAL.accent || '#D63B2F'],
    ['A guide every day', 'Small groups, never more than ' + gmax + ', and someone who has walked it in every kind of weather.', 'Groups of ' + gmax + ' at most', PAL.cats.day.color],
    ['A bed every night', sleep.length ? 'Booked before you land: ' + sleep.slice(0, -1).join(', ') + (sleep.length > 1 ? ' or ' : '') + sleep[sleep.length - 1] + ', whatever the trek has.' : 'Booked before you land.', 'Every night on the route', PAL.cats.multi.color],
    ['The road in and out', tg ? 'Transfers to the start and back from the end. Tongariro finishes ' + tg.km + ' km from where it starts, so the shuttle is part of the plan.' : 'Transfers to the start and back from the end.', 'Both ends of the trail', PAL.cats.exp.color],
    ['Permits, sorted', incaDay ? 'We book them. The Inca Trail lets in about ' + incaDay + ' people a day, porters and cooks included, so it goes early.' : 'We book them, and we book them early.', 'Booked the day you book', '#B48A5C']
  ];
  const tilt = [-2.6, 2, -1.8, 2.4, -2.2];
  return {
    // the pocket as a little planet that turns a fifth at a time (Sam, 18 Oct). it waits behind the lengths stop, which
    // slides up off it like a slide, with no thread between them
    id:'pocket', kick:"What's in the pocket", eyebrow:'What comes with it', lead:true, orb:true,
    title:['Everything it takes', 'to walk <em>it.</em>'],
    lede:'Five things come with every trek, whichever mountain you pick. The folded map is only the first.',
    more:'<p class="stop-sub">Flights aside, the price on each card covers the walk. No extras at the end, no permits to chase and no taxi to find at the trailhead.</p>',
    cards:items.map(([h, l, f, c], k) => ({ cat:{ color:c }, paper:true, html:
      '<p class="pc-top"><span class="pc-tag" style="--tilt:' + tilt[k] + 'deg;--tag-ink:' + (k === 2 ? '#1B2230' : '#F6EFE3') + '"><span>' + esc(h) + '</span></span><span class="pc-n">0' + (k + 1) + ' / 05</span></p>' +
      '<p class="pc-range">' + esc(f) + '</p>' +
      '<p class="pc-line pc-what">' + esc(l) + '</p>' }))
  };
}

// invented people with believable roles and years (Sam's pick in the V7 brief). README marks them as fictional
// eight of them since 18 Oct (Sam: "eight guides ... a nice creative description for each, the purpose, the interests,
// years of experience, how many treks to their record"). the last three guide treks from the globe's dots
const GUIDES = [
  { key:'tongariro', name:'Aroha Tipene', from:'Ōhakune', since:2013, count:'640 crossings', look:{ hat:'brim' }, land:'cone',
    why:'I want you to meet the mountain the way my nan introduced it to me, by name.',
    line:'Has crossed Red Crater in every month of the year, and recommends about six of them.', off:'Te reo night classes, sourdough, very bad karaoke' },
  { key:'inca', name:'Lucía Mamani', from:'Ollantaytambo', since:2016, count:'210 treks', look:{ hat:'braid' }, land:'spire',
    why:'People like my family laid these stones. I like walking guests through that.',
    line:'Grew up an hour from the trailhead. Knows the porters by name and the stairs by number.', off:'Weaving with her grandmother, five-a-side on Sundays' },
  { key:'torres', name:'Tomás Vidal', from:'Puerto Natales', since:2014, count:'180 treks', look:{ hat:'beanie' }, land:'towers',
    why:'Patagonia humbles everybody once. I would rather it happened with me there.',
    line:'Reads Patagonian wind like a forecast, and carries a spare beanie for whoever forgot theirs.', off:'Fly fishing, old tango records, fixing other people\u2019s stoves' },
  { key:'kili', name:'Neema Lyimo', from:'Moshi', since:2012, count:'96 summits', look:{ hat:'cap' }, land:'dome',
    why:'Most people think the top is the point. I think it is the night before.',
    line:'Starts every summit night at midnight with the same slow song.', off:'Coffee on the family farm, coaching the village netball team' },
  { key:'everest', name:'Pasang Dorje Sherpa', from:'Khumjung', since:2011, count:'74 treks', look:{ hat:'beanie' }, land:'ridge',
    why:'Slow is not a speed. It is how you get there and still enjoy it.',
    line:'Our first guide. He taught us to walk slowly, which above 4 000 m is the whole trick.', off:'Dry stone walls, potatoes grown at 3 790 m' },
  { trek:'Laugavegur', days:4, name:'Sigrún Ólafsdóttir', from:'Hella', since:2015, count:'150 treks', look:{ hat:'braid' }, land:'hills',
    why:'Iceland changes its mind every hour. I like showing people that it is allowed.',
    line:'Knows which river crossings bite and which only look like they will.', off:'Cold water swimming, knitting, far too much liquorice' },
  { trek:'Tour du Mont Blanc', days:11, name:'Élise Bertrand', from:'Chamonix', since:2010, count:'120 circuits', look:{ hat:'cap' }, land:'snow',
    why:'Three countries, one mountain, and every hut makes a better soup than the last.',
    line:'Has walked round Mont Blanc in every kind of weather, often in one afternoon.', off:'Ski touring, cheese, settling arguments about cheese' },
  { trek:'Toubkal', days:2, name:'Youssef Aït Lahcen', from:'Imlil', since:2017, count:'300 ascents', look:{ hat:'brim' }, land:'peak',
    why:'My village sits at the foot of the climb. Every guest is a guest of my mother\u2019s.',
    line:'Still stops for lunch at his mother\u2019s on the way down, and so will you.', off:'Mint tea, strong. Berber music, louder' }
];
// the guides' photos (Sam's eight, 18 Oct: images/guides/, 640 px, the 1024 px originals beside them), fetched only as
// the page comes near them (loading=lazy, 19 Oct: 0.93 MB off the first load). the paper
// stand-in below stays behind each one and shows if a photo is missing: their mountain cut from paper in the colour
// of its length, a head and shoulders in ink in front of it
const PHOTOS = ['01-aroha-tipene', '02-lucia-mamani', '03-tomas-vidal', '04-neema-lyimo', '05-pasang-dorje-sherpa',
  '06-sigrun-olafsdottir', '07-elise-bertrand', '08-youssef-ait-lahcen'];
const polImg = (G, k) => PHOTOS[k] ? '<img src="images/guides/' + PHOTOS[k] + '.jpg" alt="' + esc(G.name) + ', guide on the ' + esc(G.trek || (byKey(G.key) || {}).name || '') + '" width="640" height="640" loading="lazy" decoding="async" onerror="this.remove()">' : '';
const INKC = '#1B2230';
function polPhoto(G, k, col){
  const L = { cone:'M0 240 L0 178 Q70 160 100 92 L108 86 L118 86 L126 92 Q150 160 240 176 L240 240Z',
    spire:'M0 240 L0 170 L44 150 L58 158 L92 70 L110 120 L128 112 L170 168 L240 160 L240 240Z',
    towers:'M0 240 L0 160 L40 150 L56 80 L70 86 L82 60 L96 84 L110 70 L124 140 L240 150 L240 240Z',
    dome:'M0 240 L0 176 Q40 150 70 120 Q120 92 170 120 Q200 140 240 160 L240 240Z',
    ridge:'M0 240 L0 150 L30 120 L52 132 L84 60 L106 98 L130 80 L164 126 L196 104 L240 140 L240 240Z',
    hills:'M0 240 L0 160 Q40 120 90 150 Q130 120 170 146 Q210 130 240 150 L240 240Z',
    snow:'M0 240 L0 170 Q60 120 110 80 Q130 72 150 84 Q200 120 240 150 L240 240Z',
    peak:'M0 240 L0 168 L60 140 L100 76 L118 92 L136 70 L190 150 L240 158 L240 240Z' }[G.land] || '';
  const hat = G.look.hat === 'brim' ? '<rect x="96" y="132" width="48" height="5" rx="1"/><rect x="108" y="122" width="24" height="12" rx="3"/>'
    : G.look.hat === 'beanie' ? '<path d="M104 146 Q120 118 136 146Z"/><circle cx="120" cy="122" r="5"/>'
    : G.look.hat === 'cap' ? '<path d="M104 146 Q120 124 136 146Z"/><rect x="128" y="140" width="22" height="5" rx="2"/>'
    : '<ellipse cx="102" cy="176" rx="6" ry="16"/>';
  const id = 'pp' + k;
  return '<svg viewBox="0 0 240 240" aria-hidden="true" focusable="false"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#EDE6D6"/><stop offset="1" stop-color="' + col + '" stop-opacity="0.45"/></linearGradient></defs>' +
    '<rect width="240" height="240" fill="url(#' + id + ')"/>' +
    '<circle cx="' + (60 + (k*37) % 120) + '" cy="58" r="18" fill="#F6EFE3" opacity="0.9"/>' +
    '<path d="' + L + '" fill="' + col + '" opacity="0.55" transform="translate(' + ((k % 3) - 1)*18 + ' -16)"/>' +
    '<path d="' + L + '" fill="' + col + '"/>' +
    '<g fill="' + INKC + '"><circle cx="120" cy="154" r="20"/><path d="M70 240 Q72 190 104 182 L136 182 Q168 190 170 240Z"/>' + hat + '</g>' +
    '<rect width="240" height="240" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/></svg>';
}
function guides(){
  // a flowing stop (Sam, 18 Oct): the text centred, then the guides as Polaroids that spring up like the cut-outs as the
  // page reaches them, four to a row. no paper station
  const tilt = [-2.2, 1.6, -1.2, 2.4, 1.8, -2.6, 1.1, -1.6];
  const pols = GUIDES.map((G, k) => {
    const t = G.key ? byKey(G.key) : null, c = t ? catOf(t) : PAL.cats[catKey(G.days)], trek = t ? t.name : G.trek, yrs = 2026 - G.since;
    return '<li class="pg" data-k="' + k + '" style="--tilt:' + tilt[k % tilt.length] + 'deg;--cat:' + c.color + '">' +
      '<figure class="pol-frame"><div class="pol-photo">' + polPhoto(G, k, c.color) + polImg(G, k) + '</div>' +
        '<figcaption><b>' + esc(G.name) + '</b><span>' + esc(G.from) + ' \u00b7 since ' + G.since + '</span></figcaption></figure>' +
      '<div class="pol-text">' +
        '<p class="pol-trek"><i></i>' + esc(trek) + '</p>' +
        '<p class="pol-why">\u201c' + esc(G.why) + '\u201d</p>' +
        '<p class="pol-line">' + esc(G.line) + '</p>' +
        '<div class="pol-foot"><p class="pol-stats"><span><b>' + yrs + '</b> years</span><span><b>' + esc(G.count.split(' ')[0]) + '</b> ' + esc(G.count.split(' ').slice(1).join(' ')) + '</span></p>' +
        '<p class="pol-off"><em>Off the trail</em>' + esc(G.off) + '</p></div>' +
      '</div></li>';
  }).join('');
  // one row, frozen while the second four open over the first (Sam, 18 Oct: "freeze frame that section and the current
  // will have another Polaroid animation on top of it")
  const stage = '<ul class="pols">' + pols + '</ul>';
  return {
    id:'guides', kick:'The guides', eyebrow:'Who walks with you', flow:true,
    title:['The people who', '<em>walk it with you.</em>'],
    lede:'Fold Line began in 2011 with one map of one crossing, folded on a kitchen table in Ōhakune. Every trek since has a guide who grew up near the start of it. Here are eight of them.',
    pols:stage, cards:[]
  };
}

function when(){
  // Ribbons, Sam's pick of the round (sections/when.js). the paper station and the table below are what it replaced
  const WO = window.WHEN_STOP || null;
  if(WO) return WO.def({ T, catOf, months, esc, MON, clean, PAL });
  const rows = T.map(t => { const c = catOf(t), on = months(t.seasonShort);
    return '<tr style="--cat:' + c.color + '"><th scope="row">' + esc(t.name) + '</th>' + on.map((v, k) => '<td' + (v ? ' class="on"' : '') + '><span class="sr-only">' + MON[k] + (v ? ', in season' : '') + '</span></td>').join('') + '</tr>'; }).join('');
  const grid = '<table class="cal"><caption class="sr-only">The months each trek is run</caption><thead><tr><td></td>' + MON.map(m => '<th scope="col">' + m[0] + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
  return {
    id:'when', kick:'When to go',
    title:['Every trek keeps', '<em>its own calendar.</em>'],
    lede:'These are the months we run each one. The cards say when we leave it alone, and why.',
    more:grid,
    cards:T.map(t => { const c = catOf(t), first = clean(t.season.avoid).split('. ')[0].replace(/\.$/, '') + '.';
      return { cat:c, html:'<p class="fc-k" style="--cat:' + c.color + '"><i></i>' + esc(t.name) + ' · ' + esc(t.seasonShort) + '</p><h3>Not in</h3><p>' + esc(first) + '</p>' }; })
  };
}

function ready(){
  const hi = T.map(t => esc(clean(t.high.name).replace(/ \(.*\)/, '')) + ' <b>' + fmt(t.high.m) + ' m</b> on ' + esc(t.name === 'W Trek' ? 'the W' : t.name === 'Inca Trail' ? 'the Inca Trail' : t.name)).join(', ');
  const tg = byKey('tongariro'), inca = byKey('inca'), kili = byKey('kili'), ev = byKey('everest');
  const water = tg && tg.facts.find(f => /water/i.test(f));
  const alt = ev && ev.facts.find(f => /altitude/i.test(f));
  const groups = T.map(t => esc(t.name) + ' ' + t.group.min + ' to ' + t.group.max).join(', ');
  const faq = [
    ['How high do they go?', 'From ' + hi + '.', 'high'],
    ['Can I walk them on my own?', 'Tongariro and the W, yes, though most people come with us for the transport. ' + (inca ? clean(inca.permits[1]).split(':')[0] + ' on the Inca Trail, ' : '') + (kili ? 'and Kilimanjaro needs a licensed operator and guide. ' : '') + 'In the Khumbu the rules on guides are still argued over, so we always walk with one.'],
    ['Is there water on the way?', water ? clean(water) + ' Higher up, water comes from streams and is treated at camp.' : 'Some days yes, some days no. The map says which.'],
    ['What about the altitude?', alt ? clean(alt).replace(/\.?$/, '.') + ' That is why the long treks have rest days built in.' : 'The long treks have rest days built in.'],
    ['What if the weather turns?', 'We move the date and keep your place. We never cancel for small numbers.'],
    ['How big are the groups?', groups + '.', 'group']
  ];
  const kit = [
    tg && tg.kit.find(k => /water/i.test(k.item)) && [tg, tg.kit.find(k => /water/i.test(k.item))],
    tg && tg.kit.find(k => /boots/i.test(k.item)) && [tg, tg.kit.find(k => /boots/i.test(k.item))],
    inca && inca.kit.find(k => /poles/i.test(k.item)) && [inca, inca.kit.find(k => /poles/i.test(k.item))],
    kili && kili.kit.find(k => /down/i.test(k.item)) && [kili, kili.kit.find(k => /down/i.test(k.item))]
  ].filter(Boolean);
  // the questions over a folded world map (Sam, 18 Oct, sections/faq.js), with what to bring as one more question
  if(window.FAQ_MAP){
    const bring = kit.map(([t, k]) => '<b>' + esc(k.item) + '</b> on ' + esc(t.name === 'W Trek' ? 'the W' : t.name === 'Inca Trail' ? 'the Inca Trail' : t.name)).join(', ');
    return window.FAQ_MAP.def({ T, catOf, esc, fmt, PAL, faq:faq.concat(bring ? [['What should I bring?', 'Good boots you have walked in, layers, and what each trek asks for: ' + bring + '. The full list is printed inside your map.']] : []) });
  }
  return {
    id:'ready', kick:'Ready for it?',
    title:['How hard,', '<em>how high.</em>'],
    lede:'None of the five needs climbing gear in season. All of them need legs that have done a few long days first.',
    more:'<div class="faq">' + faq.map(([q, a]) => '<details><summary>' + esc(q) + '</summary><p>' + a + '</p></details>').join('') + '</div>',
    cards:kit.map(([t, k]) => { const c = catOf(t);
      return { cat:c, html:'<p class="fc-k" style="--cat:' + c.color + '"><i></i>' + esc(t.name) + '</p><h3>' + esc(k.item) + '</h3><p>' + esc(clean(k.why)) + '</p>' }; })
  };
}

function book(){
  // the walker's ticket (Sam's pick of three, 18 Oct), sections/book.js. The enquiry form below is the fallback
  if(window.BOOK_STOP) return window.BOOK_STOP.def({ T, catOf, months, esc, MON, PAL });
  const opts = T.map(t => '<option value="' + esc(t.key) + '">' + esc(t.fullName.split(',')[0]) + ' · ' + daysTxt(t.days) + '</option>').join('');
  return {
    id:'book', kick:'Book',
    title:['Pick a map.', '<em>We do the folding.</em>'],
    lede:'Tell us which trek and roughly when. We write back within two working days with dates, a price and a map with your name on it.',
    more:
      '<form class="enq" novalidate>' +
        '<label class="f-wide"><span>Which trek</span><select name="trek">' + opts + '</select></label>' +
        '<label><span>When</span><select name="month"><option value="">Any month</option>' + MON.map(m => '<option>' + m + '</option>').join('') + '</select></label>' +
        '<label><span>How many</span><select name="n">' + [1, 2, 3, 4, 5, 6, 7, 8].map(n => '<option>' + n + '</option>').join('') + '<option>More</option></select></label>' +
        '<label><span>Your name</span><input name="name" autocomplete="name" required></label>' +
        '<label><span>Email</span><input name="email" type="email" autocomplete="email" required></label>' +
        '<label class="f-wide"><span>Anything we should know</span><textarea name="note" rows="2"></textarea></label>' +
        '<button type="submit" class="enq-go"><span>Send the enquiry</span><i aria-hidden="true">→</i></button>' +
        '<p class="enq-done" role="status" hidden></p>' +
      '</form>',
    cards:[]
  };
}

const BUILD = [lengths, pocket, guides, when, ready, book];

function stopHTML(c, n){
  const num = String(n).padStart(2, '0');
  const text = '<div class="stop-text">' +
      (c.flip || c.lead || c.flow ? '<p class="stop-kick"><span class="lk"><b>' + num + '</b><i class="rule"></i><span>' + esc(c.eyebrow || c.kick) + '</span></span></p>'
              : '<p class="stop-kick"><b>' + num + '</b><span class="rule"></span><span>' + esc(c.kick) + '</span></p>') +
      '<h2 id="h-' + c.id + '">' + c.title.map(l => '<span class="ln"><span>' + l + '</span></span>').join('') + '</h2>' +
      '<p class="stop-lede">' + esc(c.lede) + '</p>' +
      (c.more ? '<div class="stop-more">' + c.more + '</div>' : '') +
    '</div>';
  // the station's box: sticky, a screen tall. the paper station is drawn inside it, so it scrolls in and out with the page.
  // a stop whose scene leads opens on a centred headline, and its box slides up after it (Sam: "make it a headline,
  // maybe centred underneath the hero section")
  const box = '<div class="stop-box" aria-hidden="true"></div>';
  return '<section class="stop' + (c.flip || c.lead ? ' lead' : '') + (c.orb ? ' orb' : '') + (c.flow ? ' flow' : '') + (c.cls ? ' ' + c.cls : '') + '" id="' + c.id + '" data-stop="' + n + '" aria-labelledby="h-' + c.id + '">' +
    box + (c.flow ? '<div class="pol-stage"><div class="pol-pin">' + text + (c.pols || '') + '</div></div>' : text + (c.pols || '')) +
    (c.cards.length ? '<ul class="stop-cards">' + c.cards.map((d, k) => '<li class="fcard' + (d.paper ? ' paper' : '') + '" data-k="' + k + '"' + (d.cat ? ' style="--cat:' + d.cat.color + '"' : '') + '><div class="fc-in">' + d.html + '</div><i class="fc-lead" aria-hidden="true"></i></li>').join('') + '</ul>' : '') +
  '</section>';
}

function footHTML(){
  // the fun footer (Sam, 18 Oct: "useful details and some social media"), sections/footer.js. The plain one below stays
  // as the fallback
  if(window.FOOT_X) return window.FOOT_X.html({ T, catOf, esc, months });
  const coord = (w) => Math.abs(w.lat).toFixed(2) + '° ' + (w.lat < 0 ? 'S' : 'N') + ' ' + Math.abs(w.lon).toFixed(2) + '° ' + (w.lon < 0 ? 'W' : 'E');
  return '<footer class="foot" id="foot">' +
    '<a class="foot-big" href="#book"><span>Fold Line</span><i aria-hidden="true">→</i></a>' +
    '<div class="foot-cols">' +
      '<div><p class="foot-h">The maps</p><ul>' + T.map((t, k) => '<li><a href="#top" data-trek="' + k + '">' + esc(t.fullName.split(',')[0]) + '</a></li>').join('') + '</ul></div>' +
      '<div><p class="foot-h">The company</p><ul><li><a href="#lengths">Lengths</a></li><li><a href="#pocket">What comes with it</a></li><li><a href="#guides">The guides</a></li><li><a href="#when">When to go</a></li><li><a href="#ready">Ready for it?</a></li></ul></div>' +
      '<div><p class="foot-h">Where they start</p><ul class="foot-co">' + T.map(t => { const w = (t.waypoints || [])[0]; return w ? '<li><span>' + esc(t.name) + '</span>' + coord(w) + '</li>' : ''; }).join('') + '</ul></div>' +
    '</div>' +
    '<p class="foot-small">A design study. The treks, their routes and their numbers are real and sourced. Fold Line, its guides and its bookings are not.</p>' +
  '</footer>';
}

/* ---- the look. every rule is scoped to .landing, so nothing above it changes ---- */
const CSS = `
.landing{position:relative;z-index:4;pointer-events:auto;color:var(--c-text,#E9EEF2);font-family:var(--f-text,"Instrument Sans",system-ui,sans-serif);}
.landing .stop{position:relative;height:var(--stop-h,220vh);}
.landing .stop-box{position:sticky;top:0;height:100vh;pointer-events:none;}
.landing .stop-text{position:sticky;top:clamp(108px,15vh,150px);width:min(470px,33vw);margin:-100vh 0 0 calc(var(--pad-x) + 2vw);padding:0 0 8vh;}
.stop-kick{display:flex;gap:14px;align-items:baseline;margin:0 0 18px;font-family:var(--f-label);font-size:calc(10.5px*var(--l-scale,1));font-weight:var(--l-w,400);font-stretch:var(--l-st,100%);
  letter-spacing:0.18em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.62);}
.stop-kick b{font-weight:500;color:var(--v2-red,#D63B2F);}
.stop-kick .rule{flex:0 0 34px;height:1px;background:rgba(var(--c-text-rgb),0.35);align-self:center;}
.stop h2{font-family:var(--f-display);font-weight:var(--d-w,400);font-size:calc(clamp(34px,3.5vw,56px)*var(--d-scale,1)*1.05);line-height:var(--d-lh,1.04);letter-spacing:var(--d-track,-0.03em);margin:0;color:var(--c-text);}
.stop h2 .ln{display:block;overflow:hidden;padding-bottom:0.08em;margin-bottom:-0.08em;}
.stop h2 .ln > span{display:inline-block;white-space:nowrap;}
.stop h2 em{font-style:var(--d-acc,normal);color:var(--v2-red,#D63B2F);}
.stop-lede{margin:20px 0 0;max-width:42ch;font-size:15px;line-height:1.6;color:rgba(var(--c-text-rgb),0.72);text-wrap:pretty;}
.stop-more{margin-top:28px;}
/* a leading stop: its text in a left column, its headline lines snap up like paper cut-outs (landing.js), a fuller
   subtitle and the four things every package has */
.landing .stop.lead .stop-text{width:min(440px,31vw);top:clamp(120px,19vh,180px);}
.landing .stop.lead h2{font-size:calc(clamp(44px,min(5vw,9vh),84px)*var(--d-scale,1));}
.landing .stop.lead h2 .ln{overflow:visible;}
.landing .stop.lead h2 .ln > span{transform-origin:50% 88%;}
.landing .stop.lead .stop-lede{font-size:17px;line-height:1.55;color:rgba(var(--c-text-rgb),0.86);margin-top:26px;}
.stop-sub{margin:16px 0 0;max-width:44ch;font-size:14px;line-height:1.65;color:rgba(var(--c-text-rgb),0.62);text-wrap:pretty;}
.stop-tags{list-style:none;margin:22px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px;}
.stop-tags li{padding:6px 10px 6px 9px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.14em;text-transform:uppercase;color:#1B2230;
  background:#D9CDB6 linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.06));border-radius:1px;box-shadow:0 6px 10px -6px rgba(0,0,0,0.8);}
.stop-tags li:nth-child(odd){transform:rotate(-1deg);} .stop-tags li:nth-child(even){transform:rotate(0.8deg);}
/* a leading stop's eyebrow: an arrow cut from the red paper, a notch for its tail, a little crooked, its shadow on the
   room (the kraft board on the sheet is the other kind of arrow) */
.landing .stop.lead .stop-kick,.landing .stop.flow .stop-kick{display:block;margin:0 0 26px;filter:drop-shadow(0 9px 9px rgba(0,0,0,0.5));}
.landing .stop.lead .stop-kick .lk,.landing .stop.flow .stop-kick .lk{display:inline-flex;align-items:center;gap:11px;padding:9px 32px 9px 24px;color:#F6EFE3;letter-spacing:0.2em;
  background:var(--v2-red,#D63B2F) linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.12));
  clip-path:polygon(0 3%, calc(100% - 17px) 0, 100% 52%, calc(100% - 16px) 100%, 1px 97%, 13px 50%);transform:rotate(-2.5deg);transform-origin:0 50%;}
.landing .stop.lead .stop-kick b,.landing .stop.flow .stop-kick b{color:#F6EFE3;font-family:var(--f-display);font-size:17px;font-weight:500;letter-spacing:-0.01em;}
.landing .stop.lead .stop-kick .rule,.landing .stop.flow .stop-kick .rule{display:block;flex:0 0 1px;width:1px;height:15px;background:rgba(246,239,227,0.5);}
.landing .stop.lead .stop-kick span span,.landing .stop.flow .stop-kick span span{font-weight:500;white-space:nowrap;font-size:calc(11.5px*var(--l-scale,1));}
.fcard .fc-treks{margin-top:10px;padding-top:9px;border-top:1px solid rgba(var(--c-text-rgb),0.12);font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.12em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.8);line-height:1.6;}
.fcard .fc-treks + .fc-foot{border-top:0;padding-top:4px;margin-top:6px;}
.chip-cat,.fc-k{display:inline-flex;align-items:center;gap:8px;margin:0;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;}
.chip-cat{padding:5px 11px 5px 9px;border-radius:999px;color:color-mix(in srgb, var(--cat) 60%, #fff);background:color-mix(in srgb, var(--cat) 16%, transparent);border:1px solid color-mix(in srgb, var(--cat) 50%, transparent);}
.chip-cat i,.fc-k i{display:block;width:7px;height:7px;border-radius:50%;background:var(--cat,var(--v2-red));flex:none;}
.fc-k{color:rgba(var(--c-text-rgb),0.7);}

/* the floating cards: over the paper station on a wide screen, each tied to its cut-out by a thin line */
.stop-cards{list-style:none;margin:0;padding:0;}
.fcard{--cat:var(--v2-red,#D63B2F);}
.fc-in{position:relative;padding:15px 16px 16px;border-radius:3px;background:rgba(var(--c-shade-rgb),0.9);border:1px solid rgba(var(--c-text-rgb),0.13);
  box-shadow:0 20px 40px -22px rgba(0,0,0,0.85);}
.fc-in::before{content:'';position:absolute;left:-1px;right:-1px;top:-1px;height:2px;background:var(--cat);border-radius:3px 3px 0 0;}
.fcard h3{margin:10px 0 0;font-family:var(--f-display);font-weight:var(--d-ui-w,400);font-size:calc(19px*var(--d-ui,1)*1.12);line-height:1.12;letter-spacing:-0.015em;color:var(--c-text);}
.fcard p{margin:8px 0 0;font-size:13px;line-height:1.5;color:rgba(var(--c-text-rgb),0.7);text-wrap:pretty;}
.fcard .fc-n{margin:0;font-family:var(--f-label);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.16em;color:var(--v2-red,#D63B2F);}
.fcard .fc-meta{margin-top:4px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.12em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.5);}
.fcard ul{list-style:none;margin:10px 0 0;padding:0;}
.fcard li{padding:8px 0;border-top:1px solid rgba(var(--c-text-rgb),0.12);}
.fcard li b{display:block;font-weight:500;font-size:13.5px;}
.fcard li span{display:block;margin-top:2px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.12em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.55);}
.fcard .fc-foot{padding-top:9px;border-top:1px solid rgba(var(--c-text-rgb),0.12);}
.fcard .fc-foot b{font-weight:500;color:var(--c-text);}
.fc-lead{position:absolute;left:50%;top:100%;width:1px;height:var(--lead,40px);transform-origin:50% 0;background:linear-gradient(rgba(var(--c-text-rgb),0.55), rgba(var(--c-text-rgb),0.25));}
.fc-lead::after{content:'';position:absolute;left:-3px;bottom:-3px;width:7px;height:7px;border-radius:50%;background:var(--cat);box-shadow:0 0 0 2px rgba(var(--c-shade-rgb),0.7);}
@media (min-width:761px){
  .landing .stop-cards{position:fixed;inset:0;z-index:5;pointer-events:none;}
  .landing .fcard{position:absolute;left:0;top:0;width:var(--fw,216px);visibility:hidden;will-change:transform;}
}

/* a flowing stop: no station. its text is centred, then one row of guides frozen on screen. each guide opens like a
   pop-up card from the line between its Polaroid and its bio: the Polaroid hinges up from that line, the bio hinges down
   from it (Sam, 18 Oct: "imagine an invisible line between the Polaroid and the bio"). the next set opens the same way on
   top of the last, which then goes */
.landing .stop.flow{height:auto;padding:0 0 14vh;}
.landing .stop.flow .stop-box{display:none;}
.landing .stop.flow .stop-text{position:relative;top:auto;margin:0 auto;width:min(780px,88vw);padding:0 0 5vh;text-align:center;}
.landing .stop.flow h2{font-size:calc(clamp(44px,min(5vw,9vh),84px)*var(--d-scale,1));}
.landing .stop.flow h2 .ln{overflow:visible;}
.landing .stop.flow .stop-lede{margin:26px auto 0;max-width:54ch;font-size:17px;line-height:1.55;color:rgba(var(--c-text-rgb),0.86);}
.pol-stage{position:relative;}
.pol-pin{position:sticky;top:90px;transform-origin:50% 0;}
.pols{list-style:none;margin:0 auto;padding:0 calc(var(--pad-x) + 2vw);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:clamp(24px,3vw,48px);max-width:1320px;}
.pg{--d:0s;position:relative;grid-row:1;display:flex;flex-direction:column;visibility:visible;transition:visibility 0s;}
.pol-frame{position:relative;margin:0;padding:12px 12px 0;color:#1B2230;
  background:#F3EEE4 linear-gradient(170deg, rgba(255,255,255,0.35), rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.07));
  box-shadow:0 22px 34px -18px rgba(0,0,0,0.85);transform-origin:50% 100%;transform:perspective(1000px) rotateX(86deg);opacity:0;
  transition:transform 1.05s cubic-bezier(.2,1.4,.35,1) var(--d), opacity .25s ease var(--d);}
.pol-frame::before{content:'';position:absolute;top:-11px;left:50%;width:74px;height:22px;transform:translateX(-50%) rotate(-3deg);background:rgba(226,214,186,0.82);box-shadow:0 2px 3px rgba(0,0,0,0.18);}
.pg.up .pol-frame{transform:perspective(1000px) rotate(var(--tilt));opacity:1;}
.pol-photo{position:relative;}
.pol-photo svg{display:block;width:100%;height:auto;}
.pol-photo img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:50% 30%;filter:saturate(0.9) contrast(1.03);}
.pol-photo::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.1), inset 0 0 26px rgba(40,30,10,0.16);pointer-events:none;}
.pol-frame figcaption{padding:12px 4px 16px;text-align:left;}
.pol-frame figcaption b{display:block;font-family:var(--f-display);font-weight:500;font-size:calc(18px*var(--d-ui,1));letter-spacing:-0.015em;line-height:1.15;color:#121A26;}
.pol-frame figcaption span{display:block;margin-top:5px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:rgba(27,34,48,0.58);}
.pol-text{flex:1 1 auto;display:flex;flex-direction:column;margin-top:14px;padding:10px 2px 4px;text-align:left;background:var(--c-room,#0A1019);
  transform-origin:50% 0;transform:perspective(1000px) rotateX(-86deg);opacity:0;
  transition:transform 1s cubic-bezier(.2,1.3,.35,1) var(--d), opacity .25s ease var(--d);}
.pg.open .pol-text{transform:none;opacity:1;}
.pol-trek{display:flex;align-items:center;gap:8px;margin:0;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.7);}
.pol-trek i{display:block;width:8px;height:6px;border-radius:1px;background:var(--cat);transform:rotate(-14deg);}
.pol-why{margin:12px 0 0;font-family:var(--f-display);font-weight:400;font-size:calc(15.5px*var(--d-ui,1));line-height:1.35;letter-spacing:-0.01em;color:var(--c-text);text-wrap:pretty;}
.pol-line{margin:10px 0 0;font-size:13px;line-height:1.55;color:rgba(var(--c-text-rgb),0.66);text-wrap:pretty;}
.pol-foot{margin-top:auto;padding-top:14px;}
.pol-stats span{white-space:nowrap;}
.pol-stats{display:flex;flex-wrap:wrap;gap:4px 18px;margin:0;padding-top:11px;border-top:1px dashed rgba(var(--c-text-rgb),0.22);font-size:12px;color:rgba(var(--c-text-rgb),0.6);}
.pol-stats b{font-family:var(--f-display);font-weight:500;font-size:20px;color:var(--c-text);margin-right:3px;}
.pol-off{margin:10px 0 0;min-height:calc(2*1.5*12.5px + 16px);font-size:12.5px;line-height:1.5;color:rgba(var(--c-text-rgb),0.62);}
.pol-off em{display:block;font-style:normal;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:var(--cat);filter:brightness(1.25);margin-bottom:2px;}
@media (prefers-reduced-motion: reduce){ .pol-frame,.pol-text{transition:none;} }

/* paper cards: cut from the same card as the scenes, all one size, printed in ink with a band of the length's colour */
.fcard.paper .fc-in{padding:20px 22px 18px;border:0;border-radius:2px;color:#1B2230;
  background:#EFE9DD url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.16'/></svg>");
  box-shadow:0 22px 34px -20px rgba(0,0,0,0.95), 0 2px 0 rgba(0,0,0,0.25), inset 0 -3px 0 rgba(0,0,0,0.06);display:flex;flex-direction:column;}
.fcard.paper .fc-in::before{left:0;right:0;top:0;height:6px;border-radius:2px 2px 0 0;}
.fcard.paper .pc-top{display:flex;justify-content:space-between;align-items:center;margin:4px 0 0;}
.fcard.paper .pc-tag{display:inline-block;margin:-38px 0 0 -36px;filter:drop-shadow(0 8px 7px rgba(0,0,0,0.42));transform:rotate(var(--tilt,-3deg));transform-origin:0 100%;}
.fcard.paper .pc-tag span{display:block;padding:11px 24px 10px 20px;font-family:var(--f-display);font-weight:500;font-size:calc(25px*var(--d-ui,1));line-height:1;letter-spacing:-0.02em;color:var(--tag-ink,#F6EFE3);
  background:var(--cat) linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.1));clip-path:polygon(1% 6%, 99% 0, 100% 90%, 2% 100%);}
.fcard.paper .pc-top{align-items:flex-start;}
.fcard.paper .pc-range{margin:14px 0 0;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-weight:500;font-size:calc(10px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(27,34,48,0.6);}
.fcard.paper .pc-range + .pc-count{margin-top:6px;}
.fcard.paper .pc-chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-weight:500;font-size:calc(10px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:#1B2230;}
.fcard.paper .pc-chip i{display:block;width:8px;height:8px;border-radius:50%;background:var(--cat);}
.fcard.paper .pc-n{font-family:var(--f-label);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.14em;color:rgba(27,34,48,0.45);}
.fcard.paper h3{margin:16px 0 0;color:#121A26;font-size:calc(24px*var(--d-ui,1)*1.15);}
.fcard.paper .pc-count{margin:8px 0 0;font-size:14px;color:rgba(27,34,48,0.8);}
.fcard.paper .pc-count b{font-family:var(--f-display);font-weight:500;color:var(--cat);font-size:17px;margin-right:2px;filter:brightness(0.85);}
.fcard.paper .pc-line{margin:10px 0 0;font-size:13px;line-height:1.5;color:rgba(27,34,48,0.68);flex:1 1 auto;}
.fcard.paper .pc-facts{list-style:none;margin:12px 0 0;padding:0;}
.fcard.paper .pc-facts li{position:relative;padding:6px 0 6px 18px;border-top:1px solid rgba(27,34,48,0.1);font-size:12.5px;line-height:1.4;color:rgba(27,34,48,0.78);}
.fcard.paper .pc-facts li::before{content:'';position:absolute;left:1px;top:12px;width:9px;height:6px;border-radius:1px;background:var(--cat);transform:rotate(-14deg);}
.fcard.paper .pc-facts li:nth-child(2)::before{transform:rotate(9deg);}
.fcard.paper .pc-from{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin:16px 0 0;padding-top:12px;border-top:1px dashed rgba(27,34,48,0.3);font-size:12.5px;color:rgba(27,34,48,0.65);}
.fcard.paper .pc-from b{font-family:var(--f-display);font-weight:500;font-size:16px;color:#121A26;}
.fcard.paper .fc-lead{background:linear-gradient(rgba(233,238,242,0.6), rgba(233,238,242,0.3));}

/* 04: the months, as a paper calendar */
.cal{border-collapse:separate;border-spacing:3px;width:100%;max-width:440px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.08em;}
.cal th{font-weight:400;color:rgba(var(--c-text-rgb),0.5);text-align:center;padding:0 0 4px;}
.cal tbody th{text-align:left;padding:0 10px 0 0;white-space:nowrap;color:rgba(var(--c-text-rgb),0.8);text-transform:uppercase;letter-spacing:0.1em;}
.cal td{height:16px;border-radius:2px;background:rgba(var(--c-text-rgb),0.06);}
.cal td.on{background:var(--cat);box-shadow:inset 0 1px 0 rgba(255,255,255,0.18);}

/* 05: the questions */
.faq{border-top:1px solid rgba(var(--c-text-rgb),0.14);max-width:460px;}
.faq details{border-bottom:1px solid rgba(var(--c-text-rgb),0.14);}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;padding:13px 0;font-family:var(--f-display);font-weight:var(--d-ui-w,400);font-size:calc(16px*var(--d-ui,1)*1.12);letter-spacing:-0.01em;}
.faq summary::-webkit-details-marker{display:none;}
.faq summary::after{content:'+';font-family:var(--f-label);color:var(--v2-red,#D63B2F);transition:transform .3s ease;}
.faq details[open] summary::after{transform:rotate(45deg);}
.faq details p{margin:0 0 14px;font-size:13.5px;line-height:1.6;color:rgba(var(--c-text-rgb),0.72);}
.faq details p b{font-weight:500;color:var(--c-text);}

/* 06: the enquiry */
.enq{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;max-width:460px;}
.enq label{display:flex;flex-direction:column;gap:6px;}
.enq .f-wide{grid-column:1 / -1;}
.enq label span{font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(9.5px*var(--l-scale,1));letter-spacing:0.16em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.55);}
.enq input,.enq select,.enq textarea{appearance:none;-webkit-appearance:none;border:0;border-bottom:1px solid rgba(var(--c-text-rgb),0.28);background:rgba(var(--c-text-rgb),0.04);color:var(--c-text);
  font:inherit;font-size:14.5px;padding:10px 10px;border-radius:2px 2px 0 0;outline:none;transition:border-color .3s ease, background-color .3s ease;}
.enq select{background-image:linear-gradient(45deg, transparent 50%, rgba(var(--c-text-rgb),0.6) 50%), linear-gradient(135deg, rgba(var(--c-text-rgb),0.6) 50%, transparent 50%);
  background-position:calc(100% - 16px) 55%, calc(100% - 11px) 55%;background-size:5px 5px;background-repeat:no-repeat;padding-right:28px;}
.enq select option{color:#121A26;}
.enq input:focus,.enq select:focus,.enq textarea:focus{border-color:var(--v2-red,#D63B2F);background-color:rgba(var(--c-text-rgb),0.07);}
.enq-go{grid-column:1 / -1;justify-self:start;margin-top:8px;display:inline-flex;align-items:center;gap:12px;height:46px;padding:0 22px;border:0;border-radius:2px;cursor:pointer;
  background:#F1EBDF;color:#121A26;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(11px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;font-weight:500;
  box-shadow:0 14px 30px -16px rgba(0,0,0,0.9);transition:transform .4s cubic-bezier(.2,.8,.2,1);}
.enq-go i{font-style:normal;color:var(--v2-red,#D63B2F);}
.enq-go:hover{transform:translateY(-2px) rotate(-0.5deg);}
.enq-done{grid-column:1 / -1;margin:6px 0 0;font-size:14px;color:var(--c-text);}

/* the footer: the last thing on the page, no station behind it */
.foot{position:relative;z-index:4;padding:16vh var(--pad-x) 48px;border-top:1px solid rgba(var(--c-text-rgb),0.1);background:var(--c-room,#0A1019);color:var(--c-text);}
.foot .foot-big{display:flex;align-items:baseline;justify-content:space-between;gap:24px;text-decoration:none;color:rgba(var(--c-text-rgb),0.14);font-family:var(--f-display);font-weight:var(--d-w,400);
  font-size:clamp(64px,13vw,220px);line-height:0.9;letter-spacing:-0.05em;transition:color .6s ease;}
.foot .foot-big i{font-style:normal;font-size:0.4em;color:var(--v2-red,#D63B2F);}
.foot .foot-big:hover{color:rgba(var(--c-text-rgb),0.32);}
.foot-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;margin-top:9vh;padding-top:28px;border-top:1px solid rgba(var(--c-text-rgb),0.12);}
.foot-h{margin:0 0 14px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10px*var(--l-scale,1));letter-spacing:0.18em;text-transform:uppercase;color:rgba(var(--c-text-rgb),0.5);}
.foot ul{list-style:none;margin:0;padding:0;}
.foot li{margin:0 0 8px;font-size:14px;}
.foot a{color:var(--c-text);text-decoration:none;}
.foot li a:hover{color:var(--v2-red,#D63B2F);}
.foot-co li{display:flex;justify-content:space-between;gap:12px;font-family:var(--f-label);font-stretch:var(--l-st,100%);font-size:calc(10.5px*var(--l-scale,1));letter-spacing:0.1em;color:rgba(var(--c-text-rgb),0.7);}
.foot-co li span{color:var(--c-text);text-transform:uppercase;letter-spacing:0.14em;}
.foot-small{margin:48px 0 0;max-width:70ch;font-size:12px;line-height:1.6;color:rgba(var(--c-text-rgb),0.45);}

@media (max-width:760px){
  .landing .stop{height:auto;padding:0 0 22vh;}
  .landing .stop-text{position:relative;top:auto;width:auto;margin:-48vh 16px 0;padding:22px 0 0;}
  .landing .stop.flow .stop-text{margin:0 auto;width:auto;padding:0 20px 6vh;}
  .landing .stop.flow .stop-text::before{display:none;}
  .landing .stop.flow h2{font-size:calc(40px*var(--d-scale,1)*1.3);}
  .landing .stop.flow .stop-lede{font-size:15px;}
  .pols{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px;padding:0 16px;}
  .pol-frame{padding:8px 8px 0;} .pol-frame figcaption{padding:9px 2px 12px;} .pol-frame figcaption b{font-size:15px;}
  .pol-why{font-size:14px;} .pol-line{display:none;} .pol-stats{gap:4px 10px;font-size:11px;} .pol-stats b{font-size:16px;margin-right:2px;}
  .landing .stop.lead{display:flex;flex-direction:column;padding:0;}
  .landing .stop.lead .stop-text{order:-1;margin:0 16px;padding:12vh 0 8vh;}
  .landing .stop.lead .stop-text::before{display:none;}
  .landing .stop.lead h2{font-size:calc(40px*var(--d-scale,1)*1.3);}
  .landing .stop.lead .stop-cards{display:block;height:var(--hold,200vh);margin:0;}
  .landing .stop.lead .stop-cards::before{display:none;}
  .landing .stop.lead .fcard{position:fixed;left:16px;right:16px;bottom:max(14px,2.4vh);z-index:5;visibility:hidden;transition:visibility 0s linear .45s;}
  .landing .stop.lead .fcard.on{visibility:visible;transition:visibility 0s;}
  .landing .stop.lead .fcard .fc-in{transform-origin:50% 100%;transform:perspective(800px) rotateX(80deg);opacity:0;transition:transform 1s cubic-bezier(.2,1.45,.35,1), opacity .3s ease;}
  .landing .stop.lead .fcard.on .fc-in{transform:none;opacity:1;}
  .landing .stop.lead .fcard .pc-line:not(.pc-what){display:none;}
  .landing .stop-text::before{content:'';position:absolute;z-index:-1;left:-16px;right:-16px;top:-12vh;bottom:-4vh;pointer-events:none;
    background:linear-gradient(to bottom, rgba(var(--c-shade-rgb),0) 0, rgba(var(--c-shade-rgb),0.94) 12vh, rgba(var(--c-shade-rgb),0.94) 100%);}
  .stop h2{font-size:calc(34px*var(--d-scale,1)*1.3);}
  .stop-lede{font-size:14px;}
  .landing .stop-cards{display:grid;gap:10px;margin:22px 16px 0;position:relative;}
  .landing .stop-cards::before{content:'';position:absolute;z-index:-1;left:-16px;right:-16px;top:-22px;bottom:-24px;background:rgba(var(--c-shade-rgb),0.94);}
  .fc-lead{display:none;}
  .enq{grid-template-columns:1fr;}
  .foot-cols{grid-template-columns:1fr;gap:24px;}
}

/* the hiker in the page: the walker from the map, cut from card */
.hk{position:fixed;left:0;top:0;z-index:7;pointer-events:none;width:68px;height:100px;transform-origin:50% 100%;will-change:transform;color:var(--hk,#121A26);visibility:hidden;}
.hk svg{display:block;width:100%;height:100%;overflow:visible;}
.hk .fig{fill:currentColor;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;}
.hk .sh{fill:rgba(0,0,0,0.38);stroke:none;}
`;

let built = false;
function build(container){
  if(!built){
    const st = document.createElement('style'); st.id = 'sections-css'; st.textContent = CSS; document.head.appendChild(st);
    built = true;
  }
  const defs = BUILD.map(f => f());
  container.innerHTML = defs.map((c, k) => stopHTML(c, k + 1)).join('') + footHTML();
  const stops = [...container.querySelectorAll('.stop')];
  stops.forEach((el, k) => { el._def = defs[k]; });
  return stops;
}

/* ---- the hiker: interior.js draws him on canvas as a head, a body, a pack, two legs, an arm and a pole.
   the same strokes in a 68 x 100 box, the legs on their own hinge at the hip so he can walk ---- */
function hiker(){
  const el = document.createElement('div'); el.className = 'hk'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 68 100">' +
    '<ellipse class="sh" cx="34" cy="99" rx="24" ry="2.6"/>' +
    '<g class="fig">' +
      '<g class="lb"><path d="M30.6 48 Q27.2 72 18.4 93" fill="none" stroke-width="8.5"/><path d="M16.3 95 L23.1 95.5" fill="none" stroke-width="5"/></g>' +
      '<g class="lf"><path d="M33.3 48 Q43.5 66 47.6 95" fill="none" stroke-width="8.5"/><path d="M46.2 96.5 L54.4 96.5" fill="none" stroke-width="5"/></g>' +
      '<path d="M20.4 17 Q18.4 32 21.1 45 L30.6 45 L33.3 16 Z" stroke-width="0"/>' +
      '<path d="M36 21 L32 47" fill="none" stroke-width="15"/>' +
      '<circle cx="38.4" cy="8.5" r="6.2" stroke-width="0"/>' +
      '<g class="ar"><path d="M37.4 24 Q46.2 33 51.7 40" fill="none" stroke-width="6"/><path d="M53.7 34 L61.2 98.5" fill="none" stroke-width="2.2"/></g>' +
    '</g></svg>';
  document.body.appendChild(el);
  const lf = el.querySelector('.lf'), lb = el.querySelector('.lb'), ar = el.querySelector('.ar'), sh = el.querySelector('.sh');
  const H = { el, x:0, y:0, h:100, face:1, phase:0, walk:0, on:false, rise:1 };
  // x, y: his feet on screen. h: his height in px. face 1 walks right, -1 left. rise 0 lies flat, 1 stands
  H.set = function(x, y, h, face){
    H.x = x; H.y = y; H.h = h; if(face) H.face = face;
    const s = h/100, bob = -Math.abs(Math.sin(H.phase))*2.2*H.walk*s;
    el.style.transform = 'translate3d(' + (x - 34).toFixed(1) + 'px,' + (y - 100 + bob).toFixed(1) + 'px,0) perspective(300px) rotateX(' + ((1 - H.rise)*88).toFixed(1) + 'deg) scale(' + (s*H.face).toFixed(4) + ',' + s.toFixed(4) + ')';
    const a = Math.sin(H.phase)*16*H.walk;
    lf.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' 32 48)');
    lb.setAttribute('transform', 'rotate(' + (-a).toFixed(2) + ' 32 48)');
    ar.setAttribute('transform', 'rotate(' + (-a*0.35).toFixed(2) + ' 36 24)');
    sh.setAttribute('rx', (24 - Math.abs(Math.sin(H.phase))*3*H.walk).toFixed(2));
  };
  // a step: dist in px moved along the ground this frame
  H.step = function(dist, dt, reduced){
    const v = reduced ? 0 : Math.min(1, Math.abs(dist)/Math.max(dt, 1e-3)/120);
    H.walk += (v - H.walk)*(1 - Math.exp(-dt*9));
    H.phase += Math.abs(dist)/Math.max(18, H.h*0.32)*Math.PI*0.5;
  };
  H.show = function(on){ if(on !== H.on){ H.on = on; el.style.visibility = on ? 'visible' : 'hidden'; } };
  H.colour = function(c){ if(c !== H.col){ H.col = c; el.style.color = c; } };
  return H;
}

window.SECTIONS = { build, hiker, catKey, catOf, PAL, months, GUIDES, byKey };
})();
