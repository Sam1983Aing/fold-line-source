import { png } from './terrain.mjs';
import { readFileSync } from 'node:fs';
const S = process.env.S, src = readFileSync(process.argv[2], 'utf8');
const T = new Function('window', src + ';return window.TERRAIN;')({});
const ks = Object.keys(T), C = 300, W = C*ks.length, out = Buffer.alloc(W*C*3);
ks.forEach((k, n) => {
  const c = T[k].crop, b = Buffer.from(c.bytes, 'base64'), N = c.n;
  const h = (x,y) => { x = Math.min(N-1.001, Math.max(0,x)); y = Math.min(N-1.001, Math.max(0,y)); const i=x|0, j=y|0, fx=x-i, fy=y-j;
    const a=b[j*N+i], bb=b[j*N+i+1], cc=b[(j+1)*N+i], d=b[(j+1)*N+i+1]; return (a+(bb-a)*fx+(cc-a)*fy+(a-bb-cc+d)*fx*fy)/255; };
  const L = 24;
  for (let y=0;y<C;y++) for (let x=0;x<C;x++){
    const u = x/(C-1)*(N-1), v = y/(C-1)*(N-1), e = h(u,v);
    const band = Math.floor(e*L), bx = Math.floor(h(u+0.45,v)*L), by = Math.floor(h(u,v+0.45)*L);
    const line = band !== bx || band !== by, o = (y*W + n*C + x)*3, t = 0.35 + 0.65*band/L;
    out[o] = line ? 240 : 40+60*t; out[o+1] = line ? 234 : 44+60*t; out[o+2] = line ? 222 : 52+60*t;
  }
});
png(`${S}/raw/crops.png`, W, C, out);
