// The four walks after Tongariro, measured the way Tongariro was (V7, 18 Oct 2026, Sam: "yes, fetch it"): the AWS
// terrain tiles (Mapzen / Tilezen, terrarium) around each route, deep enough on either side for the strip's panels, at
// a zoom finer than the strip's own grid. Writes work-walks/<key>/meta.json and prints the tile list to fetch.
//   node walk-tiles.mjs            lists every tile as "key z x y"
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), V7 = path.resolve(HERE, '../../Fold Line/V7');
const ctx = { window:{} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/treks-data.js'), 'utf8'), ctx);
for(const k of ['inca', 'torres', 'kili', 'everest']) vm.runInContext(fs.readFileSync(path.join(V7, 'interior', k + '-strip.js'), 'utf8'), ctx);
const TREKS = ctx.window.TREKS, STRIPS = ctx.window.FOLD_STRIPS;
// zoom, and how far either side of the route the ground must reach (km): half the panel depth at the widest panel's
// scale, capped so the longest stretches do not ask for a whole country
const Z = { inca:13, torres:12, kili:13, everest:12 }, CAP = { inca:12, torres:16, kili:14, everest:22 };
const tx = (lon, z) => Math.floor((lon + 180)/360*2**z);
const ty = (lat, z) => { const r = lat*Math.PI/180; return Math.floor((1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*2**z); };
const out = [];
for(const key of Object.keys(Z)){
  const t = TREKS.find(q => q.key === key), S = STRIPS[key], z = Z[key];
  const reach = Math.min(CAP[key], 4.8*Math.max(...S.frames.map(f => f.sc))/1000);
  const lat0 = Math.min(...t.waypoints.map(w => w.lat)), lat1 = Math.max(...t.waypoints.map(w => w.lat));
  const lon0 = Math.min(...t.waypoints.map(w => w.lon)), lon1 = Math.max(...t.waypoints.map(w => w.lon));
  const dLat = reach/110.574, dLon = reach/(111.32*Math.cos((lat0 + lat1)/2*Math.PI/180));
  const x0 = tx(lon0 - dLon, z), x1 = tx(lon1 + dLon, z), y0 = ty(lat1 + dLat, z), y1 = ty(lat0 - dLat, z);
  const meta = { key, z, x0, y0, nx:x1 - x0 + 1, ny:y1 - y0 + 1, reach:+reach.toFixed(1), bbox:[lat0, lon0, lat1, lon1] };
  fs.mkdirSync(path.join(HERE, 'work-walks', key, 'tiles'), { recursive:true }); fs.mkdirSync(path.join(HERE, 'work-walks', key, 'raw'), { recursive:true });
  fs.writeFileSync(path.join(HERE, 'work-walks', key, 'meta.json'), JSON.stringify(meta));
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++) out.push(key + ' ' + z + ' ' + x + ' ' + y);
  console.error(key, 'z' + z, meta.nx + ' x ' + meta.ny + ' = ' + meta.nx*meta.ny + ' tiles, reach ' + meta.reach + ' km');
}
console.log(out.join('\n'));
