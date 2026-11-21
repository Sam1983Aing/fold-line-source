// prints "z x y" for every tile needed, one per line
const PLACES = {
  // stack: the hero mountain as a terrain model. sky: area around the viewpoint for a real skyline
  tongariro: { stack:{ lat:-39.150, lon:175.640, z:13, n:2 }, sky:{ lat:-39.15, lon:175.62, z:11, n:3 } },
  inca:      { stack:{ lat:-13.163, lon:-72.542, z:14, n:2 }, sky:{ lat:-13.20, lon:-72.52, z:11, n:3 } },
  torres:    { stack:{ lat:-50.980, lon:-73.030, z:12, n:2 }, sky:{ lat:-51.00, lon:-73.02, z:11, n:3 } },
  kili:      { stack:{ lat:-3.070,  lon:37.355,  z:12, n:2 }, sky:{ lat:-3.10,  lon:37.30,  z:11, n:3 } },
  everest:   { stack:{ lat:27.975,  lon:86.905,  z:12, n:2 }, sky:{ lat:27.98,  lon:86.88,  z:11, n:3 } }
};
const tx = (lon,z) => (lon+180)/360*2**z;
const ty = (lat,z) => { const r = lat*Math.PI/180; return (1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*2**z; };
const out = new Set(), meta = {};
for (const [k, p] of Object.entries(PLACES)) {
  meta[k] = {};
  for (const kind of ['stack','sky']) {
    const q = p[kind], fx = tx(q.lon,q.z), fy = ty(q.lat,q.z);
    // n tiles centred on the point: for n=2 take the two nearest, for n=3 the tile and its ring
    const x0 = q.n === 2 ? Math.round(fx) - 1 : Math.floor(fx) - 1;
    const y0 = q.n === 2 ? Math.round(fy) - 1 : Math.floor(fy) - 1;
    meta[k][kind] = { z:q.z, x0, y0, n:q.n };
    for (let j=0;j<q.n;j++) for (let i=0;i<q.n;i++) out.add(`${q.z} ${x0+i} ${y0+j}`);
  }
}
if (process.argv[2] === 'meta') console.log(JSON.stringify(meta, null, 1)); else console.log([...out].join('\n'));
