import { grid, META } from './terrain.mjs';
for (const k of Object.keys(META)){
  const g = grid(k, 'stack'), N = g.N;
  console.log(k, 'lat', g.lat(N-1).toFixed(4), '..', g.lat(0).toFixed(4), ' lon', g.lon(0).toFixed(4), '..', g.lon(N-1).toFixed(4), ' km', (N*g.mpp(g.lat(N/2))/1000).toFixed(2));
}
