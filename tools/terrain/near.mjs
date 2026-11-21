// highest point of a grid within r metres of a lat/lon
import { grid } from './terrain.mjs';
const [place, kind, lat, lon, r] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6]];
const g = grid(place, kind), mpp = g.mpp(lat), X0 = g.px(lon), Y0 = g.py(lat), R = r/mpp;
let best = -1e9, bx = 0, by = 0;
for (let y = Math.floor(Y0-R); y <= Y0+R; y++) for (let x = Math.floor(X0-R); x <= X0+R; x++){
  if ((x-X0)**2 + (y-Y0)**2 > R*R) continue; const e = g.E[y*g.N + x]; if (e > best){ best = e; bx = x; by = y; }
}
console.log(place, 'max', Math.round(best), 'm at', g.lat(by).toFixed(4), g.lon(bx).toFixed(4), '| at point', Math.round(g.at(X0, Y0)));
