// The real line of each walk from OpenStreetMap: the footpath network around the route (work-walks/<key>/osm.json, an
// Overpass answer for highway paths, tracks and small roads in the route's box), routed through the researched
// waypoints in order (Dijkstra, paths cheaper than roads), with heights from the terrain tiles under it.
// Writes work-walks/<key>/route.json: [[lat, lon, trace km, DEM m], ...] and reports each leg against the research.
//   node walk-route.mjs [key ...]
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), V7 = path.resolve(HERE, '../../Fold Line/V7'), WK = path.join(HERE, 'work-walks');
const ctx = { window:{} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(V7, 'hero/treks-data.js'), 'utf8'), ctx);
const TREKS = ctx.window.TREKS;
const R = 6371000, D2R = Math.PI/180;
const dist = (a, b) => { const dLat = (b[0] - a[0])*D2R, dLon = (b[1] - a[1])*D2R, m = Math.cos((a[0] + b[0])*0.5*D2R); return R*Math.hypot(dLat, dLon*m); };

// the stitched terrain under a key's tiles
export function dem(key){
  const M = JSON.parse(fs.readFileSync(path.join(WK, key, 'meta.json'), 'utf8')), T = 256, GW = M.nx*T, GH = M.ny*T, E = new Float32Array(GW*GH);
  for(let j = 0; j < M.ny; j++) for(let i = 0; i < M.nx; i++){
    const b = fs.readFileSync(path.join(WK, key, 'raw', `t_${M.z}_${M.x0 + i}_${M.y0 + j}.rgb`));
    for(let y = 0; y < T; y++) for(let x = 0; x < T; x++){ const k = (y*T + x)*3; let e = b[k]*256 + b[k + 1] + b[k + 2]/256 - 32768; if(e < -100) e = NaN; E[(j*T + y)*GW + i*T + x] = e; }
  }
  for(let pass = 0; pass < 12; pass++) for(let q = 0; q < E.length; q++) if(Number.isNaN(E[q])){ let s = 0, n = 0; for(const o of [-1, 1, -GW, GW]){ const v = E[q + o]; if(v === v && v !== undefined){ s += v; n++; } } if(n) E[q] = s/n; }
  const Z = 2**M.z, px = (lon) => ((lon + 180)/360*Z - M.x0)*T, py = (lat) => { const r = lat*D2R; return ((1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*Z - M.y0)*T; };
  const at = (X, Y) => { X = Math.max(0, Math.min(GW - 1.001, X)); Y = Math.max(0, Math.min(GH - 1.001, Y)); const i = Math.floor(X), j = Math.floor(Y), fx = X - i, fy = Y - j;
    const a = E[j*GW + i], b = E[j*GW + i + 1], c = E[(j + 1)*GW + i], d = E[(j + 1)*GW + i + 1]; return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy; };
  return { h:(lat, lon) => at(px(lon), py(lat)), M };
}

function route(key){
  const t = TREKS.find(q => q.key === key), osm = JSON.parse(fs.readFileSync(path.join(WK, key, 'osm.json'), 'utf8'));
  // the graph: every way's nodes, an edge between neighbours, paths and steps cost their length, tracks a little more,
  // roads twice, so the walk keeps to the trail where there is one
  const COST = { path:1, footway:1, steps:1, bridleway:1, track:1.4, service:1.8, unclassified:2, residential:2, tertiary:2.4 };
  const pos = new Map(), adj = new Map(), onPath = new Set();
  const add = (a, b, w) => { if(!adj.has(a)) adj.set(a, []); adj.get(a).push([b, w]); };
  for(const e of osm.elements){
    if(e.type !== 'way' || !e.nodes || !e.geometry) continue;
    const c = COST[e.tags && e.tags.highway] || 2.5, foot = c <= 1;
    e.nodes.forEach((id, k) => { const g = e.geometry[k]; if(g) pos.set(id, [g.lat, g.lon]); if(foot) onPath.add(id); });
    for(let k = 1; k < e.nodes.length; k++){ const a = e.nodes[k - 1], b = e.nodes[k], ga = e.geometry[k - 1], gb = e.geometry[k]; if(!ga || !gb) continue; const w = dist([ga.lat, ga.lon], [gb.lat, gb.lon])*c; add(a, b, w); add(b, a, w); }
  }
  // each waypoint on the nearest node of the network, a footpath node when one is near enough
  const snap = (w) => {
    let best = null, bd = 1e12, bestP = null, bdP = 1e12;
    for(const [id, p] of pos){ if(!adj.has(id)) continue; const d = dist([w.lat, w.lon], p); if(d < bd){ bd = d; best = id; } if(onPath.has(id) && d < bdP){ bdP = d; bestP = id; } }
    return bdP < Math.max(400, bd*3) ? [bestP, bdP] : [best, bd];
  };
  // Dijkstra on a binary heap
  function path1(a, b){
    const D = new Map([[a, 0]]), prev = new Map(), H = [[0, a]], done = new Set();
    const push = (it) => { H.push(it); let i = H.length - 1; while(i){ const p = (i - 1) >> 1; if(H[p][0] <= H[i][0]) break; [H[p], H[i]] = [H[i], H[p]]; i = p; } };
    const pop = () => { const top = H[0], last = H.pop(); if(H.length){ H[0] = last; let i = 0; for(;;){ const l = 2*i + 1, r = l + 1; let m = i; if(l < H.length && H[l][0] < H[m][0]) m = l; if(r < H.length && H[r][0] < H[m][0]) m = r; if(m === i) break; [H[m], H[i]] = [H[i], H[m]]; i = m; } } return top; };
    while(H.length){
      const [d, u] = pop(); if(done.has(u)) continue; done.add(u); if(u === b) break;
      for(const [v, w] of adj.get(u) || []){ const nd = d + w; if(nd < (D.get(v) ?? Infinity)){ D.set(v, nd); prev.set(v, u); push([nd, v]); } }
    }
    if(!D.has(b)) return null;
    const out = [b]; let u = b; while(u !== a){ u = prev.get(u); out.push(u); } return out.reverse();
  }
  const W = t.waypoints, snaps = W.map(snap), pts = [], legs = [];
  for(let k = 1; k < W.length; k++){
    const a = snaps[k - 1][0], b = snaps[k][0];
    const p = a === b ? [a] : path1(a, b);
    if(!p){ legs.push({ from:W[k - 1].name, to:W[k].name, ok:false }); continue; }
    let L = 0; for(let q = 1; q < p.length; q++) L += dist(pos.get(p[q - 1]), pos.get(p[q]));
    legs.push({ from:W[k - 1].name, to:W[k].name, km:+(L/1000).toFixed(2), research:+(W[k].km - W[k - 1].km).toFixed(2), ok:true });
    for(const id of (pts.length ? p.slice(1) : p)) pts.push(pos.get(id));
  }
  // a point every 25 m along it, with its trace km and the height of the ground there
  const { h } = dem(key), dense = [];
  let km = 0;
  for(let q = 0; q < pts.length; q++){
    if(q){ const d = dist(pts[q - 1], pts[q]), n = Math.max(1, Math.ceil(d/25)); for(let s = 1; s <= n; s++){ const f = s/n, la = pts[q - 1][0] + (pts[q][0] - pts[q - 1][0])*f, lo = pts[q - 1][1] + (pts[q][1] - pts[q - 1][1])*f; dense.push([+la.toFixed(6), +lo.toFixed(6), +(km + d*f/1000).toFixed(4), Math.round(h(la, lo))]); } km += d/1000; }
    else dense.push([pts[0][0], pts[0][1], 0, Math.round(h(pts[0][0], pts[0][1]))]);
  }
  // where each waypoint falls on the trace (its km along it), for mapping the research's km onto the trace
  const wkm = W.map((w, k) => { let best = 0, bd = 1e12; const from = k ? 0 : 0; for(let q = from; q < dense.length; q++){ const d = dist([w.lat, w.lon], dense[q]); if(d < bd){ bd = d; best = q; } } return dense[best][2]; });
  // the waypoints are visited in order, so their trace km must rise: take each one's nearest point after the last
  let last = 0; const wkmO = W.map((w) => { let best = -1, bd = 1e12; for(let q = 0; q < dense.length; q++){ if(dense[q][2] < last - 1e-6) continue; const d = dist([w.lat, w.lon], dense[q]); if(d < bd - 1){ bd = d; best = q; } } if(best < 0) best = dense.length - 1; last = dense[best][2]; return [last, Math.round(bd)]; });
  void wkm;
  fs.writeFileSync(path.join(WK, key, 'route.json'), JSON.stringify({ key, pts:dense, wkm:wkmO.map(x => x[0]), snaps:snaps.map(s => Math.round(s[1])) }));
  console.log('==', key, 'trace', km.toFixed(1), 'km against', t.km, 'researched, points', dense.length);
  legs.forEach((l, k) => console.log('  ', (l.ok ? '' : 'NO ROUTE ') + l.from + ' -> ' + l.to, l.km, 'km (research ' + l.research + ')', 'snap ' + Math.round(snaps[k + 1][1]) + ' m', 'off ' + wkmO[k + 1][1] + ' m'));
}
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['inca', 'torres', 'kili', 'everest'];
keys.forEach(route);
