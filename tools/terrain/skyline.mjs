// true skyline from a viewpoint: for each bearing, the highest elevation angle along the ray,
// with earth curvature and refraction. keeps the elevation and distance of the point that wins.
import { grid, png } from './terrain.mjs';
import { writeFileSync } from 'node:fs';
const S = process.env.S;
export const VIEWS = {
  tongariro: { lat:-39.1446, lon:175.5809, az:[70,150], name:'Ngauruhoe from Mangatepopo' },
  inca:      { lat:-13.1690, lon:-72.5357, az:[285,345], name:'Machu Picchu from the Sun Gate' },
  torres:    { lat:-51.0750, lon:-73.0500, az:[330,400], name:'Paine massif from Lago Pehoe' },
  kili:      { lat:-3.1600,  lon:37.2500,  az:[20,85],  name:'Kibo from the south west' },
  everest:   { lat:27.9957,  lon:86.8289,  az:[60,130], name:'Everest from Kala Patthar' }
};
const R = 6371000, K = 0.13; // refraction coefficient
const res = {};
for (const [place, v] of Object.entries(VIEWS)){
  const g = grid(place, 'sky'), mpp = g.mpp(v.lat);
  const X0 = g.px(v.lon), Y0 = g.py(v.lat), h0 = g.at(X0, Y0) + 2;
  const rows = [], step = 0.2, maxD = Math.min(X0, Y0, g.N-X0, g.N-Y0)*mpp*0.98;
  for (let a = v.az[0]; a <= v.az[1] + 1e-6; a += step){
    const b = a*Math.PI/180, sx = Math.sin(b), sy = -Math.cos(b);
    let best = -1e9, bh = h0, bd = 0;
    for (let d = 60; d < maxD; d += Math.max(20, d*0.004)){
      const X = X0 + sx*d/mpp, Y = Y0 + sy*d/mpp, h = g.at(X, Y);
      const drop = d*d*(1-K)/(2*R);
      const ang = Math.atan2(h - drop - h0, d);
      if (ang > best){ best = ang; bh = h; bd = d; }
    }
    rows.push([+a.toFixed(2), +(best*180/Math.PI).toFixed(3), Math.round(bh), Math.round(bd)]);
  }
  res[place] = { view:v, h0:Math.round(h0), maxD:Math.round(maxD), rows };
  console.log(place, 'eye', Math.round(h0), 'm, reach', (maxD/1000).toFixed(1), 'km, top', Math.max(...rows.map(r=>r[2])), 'm, max angle', Math.max(...rows.map(r=>r[1])).toFixed(1));
}
writeFileSync(`${S}/raw/skylines.json`, JSON.stringify(res));
// plot: angle profile per place, stacked
const W = 1200, H = 5*170, out = Buffer.alloc(W*H*3, 245);
Object.values(res).forEach((r, k) => {
  const a0 = r.rows[0][0], a1 = r.rows[r.rows.length-1][0];
  const angs = r.rows.map(q=>q[1]), lo = Math.min(...angs) - 1, hi = Math.max(...angs) + 1;
  const sc = Math.min(W/(a1-a0), 160/(hi-lo));   // same degrees per pixel both ways: the real view
  for (let x=0;x<W;x++){
    const a = a0 + x/sc; if (a > a1) break;
    const i = Math.min(r.rows.length-1, Math.round((a-a0)/0.2)), y = Math.round(k*170 + 165 - (r.rows[i][1]-lo)*sc);
    for (let yy = Math.max(k*170, y); yy < k*170+168; yy++){ const o = (yy*W+x)*3; out[o]=60; out[o+1]=70; out[o+2]=90; }
  }
});
png(`${S}/raw/skylines.png`, W, H, out);
