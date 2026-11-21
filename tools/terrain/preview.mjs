// hillshade of every stack grid, with min/max and the highest point
import { grid, png, META } from './terrain.mjs';
const S = process.env.S;
for (const place of Object.keys(META)){
  const g = grid(place, 'stack'), N = g.N, out = Buffer.alloc(N*N*3);
  let lo = 1e9, hi = -1e9, hx = 0, hy = 0;
  for (let k=0;k<N*N;k++){ const e = g.E[k]; if (e < lo) lo = e; if (e > hi){ hi = e; hx = k%N; hy = (k/N)|0; } }
  const mpp = g.mpp(g.lat(N/2));
  for (let y=1;y<N-1;y++) for (let x=1;x<N-1;x++){
    const dx = (g.E[y*N+x+1]-g.E[y*N+x-1])/(2*mpp), dy = (g.E[(y+1)*N+x]-g.E[(y-1)*N+x])/(2*mpp);
    const sh = Math.max(0, Math.min(1, 0.6 + (-dx*0.7 - dy*0.7)*0.9));
    const t = (g.E[y*N+x]-lo)/(hi-lo), k = (y*N+x)*3;
    // contour every 100 m in red so the levels read
    const c = Math.floor(g.E[y*N+x]/100) !== Math.floor(g.E[y*N+x+1]/100);
    out[k] = c ? 220 : 255*sh*(0.5+0.5*t); out[k+1] = c ? 60 : 255*sh*(0.5+0.5*t); out[k+2] = c ? 40 : 255*sh*(0.55+0.45*t);
  }
  png(`${S}/raw/stack-${place}.png`, N, N, out);
  console.log(place, 'z', g.m.z, 'size km', (N*mpp/1000).toFixed(1), 'lo', lo.toFixed(0), 'hi', hi.toFixed(0), 'at', g.lat(hy).toFixed(4), g.lon(hx).toFixed(4));
}
