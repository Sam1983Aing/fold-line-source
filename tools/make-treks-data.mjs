// data/treks.json (researched, sourced in data/treks.md) -> Fold Line/V7/hero/treks-data.js (V1 to V6 are frozen)
// the research stays the single truth. this only adds display fields: short titles,
// labels, cover marks and one dry line per trek. run: node tools/make-treks-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const T = JSON.parse(readFileSync('data/treks.json', 'utf8'));
const KEYS = ['tongariro', 'inca', 'torres', 'kili', 'everest'];
const NB = ' ', m = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
const D = [
  { name:'Tongariro', line2:'Alpine Crossing', countryShort:'NZ', kmLabel:'19.4 KM', nightLabel:'No night',
    seasonShort:'Nov to Apr', line:'One way, 19.4 km, and no water you can drink. The shuttle is part of the plan.',
    summit:{ name:'Ng\u0101uruhoe', m:2291, note:'landmark, not climbed on the crossing (GNS Science)' },
    marks:[{ label:'RED CRATER ' + m(1886), lat:-39.136, lon:175.650, red:true }, { label:'NGĀURUHOE', lat:-39.1567, lon:175.6322 }] },
  { name:'Inca Trail', line2:'to Machu Picchu', countryShort:'Peru', kmLabel:'42 KM', nightLabel:'Tents',
    seasonShort:'May to Sep', line:'Four days of stone stairs, and you walk into Machu Picchu through the front gate.',
    marks:[{ label:'INTI PUNKU ' + m(2745), lat:-13.170, lon:-72.534, red:true }, { label:'MACHU PICCHU', lat:-13.166, lon:-72.543 }] },
  { name:'W Trek', line2:'Torres del Paine', countryShort:'Chile', kmLabel:'71 KM', nightLabel:'Refugios',
    seasonShort:'Dec to Mar', line:'Five days in a wind that gusts to 110 km/h. Every bed is booked before you land.',
    marks:[{ label:'BASE TORRES ' + m(870), lat:-50.943, lon:-72.950, red:true }, { label:'MIRADOR BRITÁNICO', lat:-50.983, lon:-73.054 }] },
  { name:'Kilimanjaro', line2:'by the Machame route', countryShort:'Tanzania', kmLabel:'62 KM', nightLabel:'Tents',
    seasonShort:'Jan to Mar, Jun to Oct', line:'Seven days to the highest point in Africa. Summit night starts at midnight.',
    marks:[{ label:'UHURU PEAK ' + m(5895), lat:-3.076, lon:37.354, red:true }, { label:'BARAFU CAMP', lat:-3.100, lon:37.379 }] },
  { name:'Everest', line2:'Base Camp and Kala Patthar', countryShort:'Nepal', kmLabel:'120 KM', nightLabel:'Teahouses',
    seasonShort:'Mar to May, Oct to Nov', line:'Twelve days, eleven teahouse beds, and one dawn with Everest across the valley.',
    marks:[{ label:'KALA PATTHAR ' + m(5644), lat:27.996, lon:86.828, red:true }, { label:'EVEREST ' + m(8849), lat:27.9881, lon:86.9250 }, { label:'BASE CAMP', lat:28.003, lon:86.856 }] }
];
const out = T.map((t, i) => ({
  n:i + 1, key:KEYS[i], fullName:t.name, name:D[i].name, line2:D[i].line2, country:t.country, countryShort:D[i].countryShort,
  days:t.days, daysLabel:t.days + (t.days === 1 ? ' DAY' : ' DAYS'), km:t.distance_km, kmLabel:D[i].kmLabel,
  start:{ name:t.start.name, m:t.start.elev_m }, end:{ name:t.end.name, m:t.end.elev_m },
  high:{ name:t.high.name, m:t.high.elev_m }, ascent:t.ascent_m, descent:t.descent_m,
  nightLabel:D[i].nightLabel, nights:t.nights.map(n => ({ day:n.day, name:n.name, m:n.elev_m, type:n.type })),
  beats:t.beats.map(b => ({ key:b.key, name:b.name, m:b.elev_m, day:b.day, line:b.line, fact:b.fact })),
  season:t.season, seasonShort:D[i].seasonShort, permits:t.permits, price:t.price_usd, group:t.group,
  facts:t.facts, kit:t.kit, line:D[i].line, marks:D[i].marks, summit:D[i].summit || null,
  profile:t.waypoints.map(w => [w.km, w.elev_m]), waypoints:t.waypoints.map(w => ({ name:w.name, lat:w.lat, lon:w.lon, m:w.elev_m, km:w.km }))
}));
const js = `/* The five treks, generated from data/treks.json by tools/make-treks-data.mjs.
   Every number is researched and sourced in data/treks.md (14 Oct 2026). Change the research,
   then run the script, never edit numbers here by hand.
   Kala Patthar is printed as 5 644 m (GPS). Most guides say 5 545 m. Our SRTM data reads about
   5 600 m at the marked point and SRTM reads summits low, which favours 5 644 m.
   Prices are USD per person from real operators, used as a believable "from" price only. */
window.TREKS = ${JSON.stringify(out, null, 1)};
`;
writeFileSync('Fold Line/V7/hero/treks-data.js', js);
console.log('wrote', (js.length/1024).toFixed(1), 'KB');
out.forEach(t => console.log(t.n, t.name, '|', t.daysLabel, t.kmLabel, '| high', t.high.name, t.high.m, '| from $' + t.price.low, '|', t.nightLabel));
