// local maxima (within r px) above a floor, to find named peaks in a grid
import { grid } from './terrain.mjs';
const [place, kind, floor, r] = [process.argv[2], process.argv[3], +process.argv[4], +(process.argv[5]||12)];
const g = grid(place, kind), N = g.N, out = [];
for (let y=r;y<N-r;y++) for (let x=r;x<N-r;x++){
  const e = g.E[y*N+x]; if (e < floor) continue;
  let top = true;
  for (let j=-r;j<=r && top;j++) for (let i=-r;i<=r;i++){ if ((i||j) && g.E[(y+j)*N+x+i] > e){ top = false; break; } }
  if (top) out.push([Math.round(e), g.lat(y).toFixed(4), g.lon(x).toFixed(4)]);
}
out.sort((a,b)=>b[0]-a[0]).slice(0, 14).forEach(p=>console.log(p.join('  ')));
