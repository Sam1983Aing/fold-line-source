#!/usr/bin/env node
// The paper globe's land, as a signed distance field (V6, Sam's globe idea, 17 Oct 2026).
//   node tools/make-globe-data.mjs [source.bmp]
// Writes "Fold Line/V7/hero/globe-data.js": one greyscale PNG, inlined as a data URI so the page still runs from a double
// click on file:// (a texture from a file:// image taints WebGL, a data URI does not).
//
// The source is the land silhouette macOS ships for its time zone picker (GeoKit's worldmap@2x.png, 1160 x 580,
// equirectangular, land opaque). Convert it first: sips -s format bmp worldmap@2x.png --out wm2x.bmp
// It has no Antarctica, so a rough coast is drawn in below. Natural Earth's public domain land outline is the cleaner
// source if this ever ships: only the reading step changes.
//
// What the field holds: every texel is the distance to the nearest coast, in texels of this texture at the equator,
// measured on the sphere (a degree of longitude shrinks by cos(latitude)), 128 at the coast, +4 per texel inland.
// The shader cuts the coast at 128, draws the paper's edge and the shadow it throws from the same numbers, and rules the
// coastal water lines at fixed distances offshore.
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2] || '/private/tmp/wm2x.bmp';
const OUT = join(ROOT, 'Fold Line/V7/hero/globe-data.js');
const W = 2048, H = 1024, SCALE = 4;
const MIN_ISLAND = 22, MIN_LAKE = 40;      // in source pixels: smaller islands go, smaller lakes are filled

// ---- read the source's alpha (32-bit BMP, BGRA, top-down when the height is negative)
const b = readFileSync(SRC);
const off = b.readUInt32LE(10), sw = b.readInt32LE(18), shRaw = b.readInt32LE(22), bpp = b.readUInt16LE(28);
const sh = Math.abs(shRaw), row = Math.ceil(sw*bpp/8/4)*4;
if(bpp !== 32) throw new Error('expected a 32-bit BMP with alpha');
const cov = new Float32Array(sw*sh);
for(let y = 0; y < sh; y++){
  const yy = shRaw < 0 ? y : sh - 1 - y;
  for(let x = 0; x < sw; x++) cov[y*sw + x] = b[off + yy*row + x*4 + 3]/255;
}

// ---- Antarctica, drawn by hand from the atlas: lon, lat round the coast eastward, then shut along the pole
const ANT = [
  [-180, -78.4], [-170, -78.3], [-160, -78.0], [-155, -77.3], [-150, -76.9], [-140, -75.4], [-130, -74.3], [-120, -73.8],
  [-110, -74.2], [-100, -73.3], [-95, -72.4], [-90, -72.9], [-80, -73.3], [-75, -71.6], [-71, -70.0], [-68, -69.0],
  [-66, -67.5], [-64, -65.8], [-61, -64.2], [-57.5, -63.3], [-58, -64.6], [-60, -66.2], [-61.5, -68.2], [-62, -70.2],
  [-61, -72.4], [-60, -74.6], [-55, -76.8], [-48, -77.9], [-40, -78.0], [-35, -77.4], [-29, -75.8], [-20, -73.9],
  [-14, -72.3], [-8, -70.9], [0, -70.2], [10, -70.0], [20, -69.9], [30, -69.5], [38, -69.2], [45, -67.8], [50, -66.4],
  [57, -66.7], [62, -67.6], [68, -68.2], [70, -69.6], [72, -70.3], [74, -69.6], [77, -69.0], [82, -67.2], [90, -66.6],
  [100, -65.6], [110, -66.3], [120, -66.8], [130, -66.2], [140, -66.7], [150, -68.4], [158, -69.8], [164, -70.8],
  [170, -71.4], [169, -73.2], [166, -75.0], [163.5, -76.6], [166, -77.6], [170, -78.1], [180, -78.4], [180, -90], [-180, -90]
];
{
  const P = ANT.map(([lo, la]) => [(lo + 180)/360*sw, (90 - la)/180*sh]);
  for(let y = Math.floor(sh*0.75); y < sh; y++){
    const py = y + 0.5, xs = [];
    for(let i = 0, j = P.length - 1; i < P.length; j = i++){
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if((yi > py) !== (yj > py)) xs.push(xi + (py - yi)*(xj - xi)/(yj - yi));
    }
    xs.sort((a, c) => a - c);
    for(let k = 0; k + 1 < xs.length; k += 2)
      for(let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x < Math.min(sw, xs[k + 1] - 0.5); x++) cov[y*sw + x] = 1;
  }
}

// ---- tidy for paper: drop the specks, fill the ponds (components wrap round the date line)
function components(want){
  const lab = new Int32Array(sw*sh).fill(-1), out = [];
  const st = [];
  for(let s = 0; s < sw*sh; s++){
    if(lab[s] >= 0 || (cov[s] >= 0.5) !== want) continue;
    const id = out.length, px = []; lab[s] = id; st.push(s);
    while(st.length){
      const p = st.pop(); px.push(p);
      const x = p % sw, y = (p - x)/sw;
      for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx = (x + dx + sw) % sw, ny = y + dy;
        if(ny < 0 || ny >= sh) continue;
        const q = ny*sw + nx;
        if(lab[q] < 0 && (cov[q] >= 0.5) === want){ lab[q] = id; st.push(q); }
      }
    }
    out.push(px);
  }
  return out;
}
let gone = 0, filled = 0;
for(const c of components(true)) if(c.length < MIN_ISLAND){ for(const p of c) cov[p] = 0; gone++; }
const seas = components(false).sort((a, c) => c.length - a.length);
for(const c of seas.slice(1)) if(c.length < MIN_LAKE){ for(const p of c) cov[p] = 1; filled++; }

// ---- up to the field's size, bilinear on the coverage, cut at a half
const land = new Uint8Array(W*H);
for(let y = 0; y < H; y++){
  const fy = Math.min(sh - 1, Math.max(0, (y + 0.5)*sh/H - 0.5)), y0 = Math.floor(fy), y1 = Math.min(sh - 1, y0 + 1), ty = fy - y0;
  for(let x = 0; x < W; x++){
    const fx = (x + 0.5)*sw/W - 0.5, x0 = Math.floor(fx), tx = fx - x0;
    const a = (x0 + sw) % sw, c = (x0 + 1) % sw;
    const v = (cov[y0*sw + a]*(1 - tx) + cov[y0*sw + c]*tx)*(1 - ty) + (cov[y1*sw + a]*(1 - tx) + cov[y1*sw + c]*tx)*ty;
    land[y*W + x] = v >= 0.5 ? 1 : 0;
  }
}

// ---- exact distance transform (Felzenszwalb and Huttenlocher), rows first with the row's own spacing, cos(latitude),
//      so the numbers are distances on the globe. Rows wrap round the date line: three copies side by side
const INF = 1e20;
function dt1(f, n, sp){
  const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for(let q = 1; q < n; q++){
    let s;
    do { const r = v[k]; s = ((f[q] + (q*sp)**2) - (f[r] + (r*sp)**2))/(2*sp*(q - r)); if(s <= z[k]) k--; else break; } while(k >= 0);
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for(let q = 0; q < n; q++){ while(z[k + 1] < q*sp) k++; d[q] = (q*sp - v[k]*sp)**2 + f[v[k]]; }
  return d;
}
function edt(inside){
  const g = new Float64Array(W*H);
  for(let i = 0; i < W*H; i++) g[i] = (land[i] === 1) === inside ? INF : 0;
  // columns: plain spacing
  const col = new Float64Array(H);
  for(let x = 0; x < W; x++){
    for(let y = 0; y < H; y++) col[y] = g[y*W + x];
    const d = dt1(col, H, 1);
    for(let y = 0; y < H; y++) g[y*W + x] = d[y];
  }
  // rows: spacing cos(latitude), tripled to wrap
  const rw = new Float64Array(W*3);
  for(let y = 0; y < H; y++){
    const lat = (0.5 - (y + 0.5)/H)*Math.PI, sp = Math.max(0.04, Math.cos(lat));
    for(let k = 0; k < 3; k++) for(let x = 0; x < W; x++) rw[k*W + x] = g[y*W + x];
    const d = dt1(rw, W*3, sp);
    for(let x = 0; x < W; x++) g[y*W + x] = d[W + x];
  }
  return g;
}
const dIn = edt(true), dOut = edt(false);
const sdf = new Uint8Array(W*H);
for(let i = 0; i < W*H; i++){
  // dIn: from a land texel to the nearest water. dOut: from a water texel to the nearest land
  const d = land[i] ? Math.sqrt(dIn[i]) - 0.5 : -(Math.sqrt(dOut[i]) - 0.5);
  sdf[i] = Math.max(0, Math.min(255, Math.round(128 + d*SCALE)));
}

// ---- the continents, for a faint tint each (Sam: "a slight colour for each continent ... subtle but noticeable").
//      Africa, Europe and Asia touch, so the split is drawn with the usual lines: the Red Sea and Suez, the
//      Mediterranean, the Bosphorus, the Caucasus, the Ural. Panama splits the Americas, Timor and New Guinea Asia
//      from Oceania. Rough at the borders on purpose: the tint is blurred across them
const CONT = ['none', 'africa', 'europe', 'asia', 'namerica', 'samerica', 'oceania', 'antarctica'];
function continentOf(lat, lon){
  if(lat < -60) return 7;
  if(lat > 55 && lon < -168.4) return 3;                                    // Chukotka, across the date line
  if(lat > 62.8 && lat < 67 && lon > -25.5 && lon < -12.5) return 2;        // Iceland
  if(lat > 67.5 && lon < -10 && lon > -75) return 4;                        // Greenland's north-east reaches 11 W
  if(lon < -25 || (lon > 179.9 && lat > 45)) {
    if(lat < 7.2 || (lat < 12.6 && lon > -77.3)) return 5;
    return 4;
  }
  if((lon > 155 || lon < -140) && lat < 0) return 6;                        // New Zealand and the Pacific
  if((lon > 110 && lat < -10.05) || (lon > 130.8 && lat < -0.3 && lat > -12)) return 6;
  // Africa: below the Mediterranean and west of the Red Sea line, Suez (32.4, 30) to Bab-el-Mandeb (43.3, 12.6)
  const redSea = lat >= 12.6 ? 43.3 + (lat - 12.6)*(32.4 - 43.3)/(30 - 12.6) : 99;
  const north = lon < -1.5 ? 35.98 : lon < 11.8 ? 37.5 : 34.0;
  if(lat < north && lon >= -25 && lon < 52 && (lat < 11.5 ? true : lon < Math.max(32.4, redSea))) return 1;
  if(lat < 11.5 && lon >= 41 && lon < 52 && lat > -27) return 1;          // the Horn and Madagascar
  // Europe and Asia
  if(lat > 50) return lon < 59.5 ? 2 : 3;
  if(lat > 41.3){
    if(lon < 29) return 2;
    if(lon < 37.3) return lat > 42.5 ? 2 : 3;
    if(lon < 51.5) return lat > 43.4 ? 2 : 3;
    return 3;
  }
  if(lat > 40.5) return lon < 29.2 ? 2 : 3;
  return lon < 27.5 ? 2 : 3;
}
// each continent's tint as a chroma pair (Cb, Cr, as in YCbCr), so the shader keeps the paper's light and only
// shifts its hue, and the tints blend where two continents meet. Hues picked to stay clear of the trek colours'
// strength and of pink and cyan
const HUE = { africa:[42, 1], europe:[222, 0.85], asia:[108, 0.75], namerica:[8, 0.8], samerica:[92, 0.85], oceania:[266, 0.7], antarctica:[210, 0.25] };
const cb = new Float32Array(W*H), cr = new Float32Array(W*H), has = new Uint8Array(W*H);
for(let y = 0; y < H; y++){
  const lat = 90 - (y + 0.5)*180/H;
  for(let x = 0; x < W; x++){
    const i = y*W + x; if(!land[i]) continue;
    const c = CONT[continentOf(lat, (x + 0.5)*360/W - 180)], h = HUE[c]; if(!h) continue;
    // a hue (0 red, 60 yellow, 120 green, 240 blue) to its angle on the chroma plane, where red sits at about 109 degrees
    const a = (h[0] + 109)*Math.PI/180;
    cb[i] = Math.cos(a)*0.22*h[1]; cr[i] = Math.sin(a)*0.22*h[1]; has[i] = 1;
  }
}
// carry each coast's tint a little out to sea, so filtering at the shore never pulls in grey, then soften the borders
for(let pass = 0; pass < 10; pass++){
  const nh = has.slice();
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
    const i = y*W + x; if(has[i]) continue;
    let sb = 0, sr = 0, n = 0;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = (x + dx + W) % W, ny = y + dy; if(ny < 0 || ny >= H) continue; const q = ny*W + nx; if(has[q]){ sb += cb[q]; sr += cr[q]; n++; } }
    if(n){ cb[i] = sb/n; cr[i] = sr/n; nh[i] = 1; }
  }
  has.set(nh);
}
function blur(f, r){
  const t = new Float32Array(W*H), o = new Float32Array(W*H);
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){ let s = 0; for(let k = -r; k <= r; k++) s += f[y*W + (x + k + W) % W]; t[y*W + x] = s/(2*r + 1); }
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){ let s = 0, n = 0; for(let k = -r; k <= r; k++){ const yy = y + k; if(yy < 0 || yy >= H) continue; s += t[yy*W + x]; n++; } o[y*W + x] = s/n; }
  return o;
}
// the tint is soft anyway, so it gets its own small texture: a quarter the size each way, then blurred there
const TW = W/4, TH = H/4, tb = new Float32Array(TW*TH), trr = new Float32Array(TW*TH);
for(let y = 0; y < TH; y++) for(let x = 0; x < TW; x++){
  let sb = 0, sr = 0;
  for(let j = 0; j < 4; j++) for(let k = 0; k < 4; k++){ const i = (y*4 + j)*W + x*4 + k; sb += cb[i]; sr += cr[i]; }
  tb[y*TW + x] = sb/16; trr[y*TW + x] = sr/16;
}
function blurT(f, r){
  const t = new Float32Array(TW*TH), o = new Float32Array(TW*TH);
  for(let y = 0; y < TH; y++) for(let x = 0; x < TW; x++){ let s = 0; for(let k = -r; k <= r; k++) s += f[y*TW + (x + k + TW) % TW]; t[y*TW + x] = s/(2*r + 1); }
  for(let y = 0; y < TH; y++) for(let x = 0; x < TW; x++){ let s = 0, n = 0; for(let k = -r; k <= r; k++){ const yy = y + k; if(yy < 0 || yy >= TH) continue; s += t[yy*TW + x]; n++; } o[y*TW + x] = s/n; }
  return o;
}
const cbB = blurT(blurT(tb, 2), 2), crB = blurT(blurT(trr, 2), 2);
const tint = new Uint8Array(TW*TH*3);
for(let i = 0; i < TW*TH; i++){
  tint[i*3] = 128;
  tint[i*3 + 1] = Math.max(0, Math.min(255, Math.round(128 + cbB[i]*255)));
  tint[i*3 + 2] = Math.max(0, Math.min(255, Math.round(128 + crB[i]*255)));
}

// ---- PNG, each row filtered by whichever of up and paeth packs smaller
function crc32(buf){ let c, crc = 0xffffffff; for(let n = 0; n < buf.length; n++){ c = (crc ^ buf[n]) & 0xff; for(let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data){ const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, c]); }
function pngOf(pix, w, h, bpp){
  const RW = w*bpp, raw = Buffer.alloc((RW + 1)*h);
  for(let y = 0; y < h; y++){
    const o = y*(RW + 1), cur = y*RW, prv = (y - 1)*RW;
    const up = Buffer.alloc(RW), pa = Buffer.alloc(RW); let su = 0, sp = 0;
    for(let x = 0; x < RW; x++){
      const a = x >= bpp ? pix[cur + x - bpp] : 0, bb = y ? pix[prv + x] : 0, c = x >= bpp && y ? pix[prv + x - bpp] : 0;
      const p = a + bb - c, pA = Math.abs(p - a), pB = Math.abs(p - bb), pC = Math.abs(p - c);
      const pr = pA <= pB && pA <= pC ? a : pB <= pC ? bb : c;
      up[x] = (pix[cur + x] - bb) & 255; pa[x] = (pix[cur + x] - pr) & 255;
      su += up[x] < 128 ? up[x] : 256 - up[x]; sp += pa[x] < 128 ? pa[x] : 256 - pa[x];
    }
    raw[o] = sp < su ? 4 : 2; (sp < su ? pa : up).copy(raw, o + 1);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = bpp === 3 ? 2 : 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level:9 })), chunk('IEND', Buffer.alloc(0))]);
}
const png = pngOf(sdf, W, H, 1), tpng = pngOf(tint, TW, TH, 3);

writeFileSync(OUT, `/* The paper globe's land, a signed distance field: generated by tools/make-globe-data.mjs, do not edit by hand.
   ${W} x ${H} equirectangular, greyscale: 128 at the coast, +${SCALE} per texel inland (texels at the equator, distances
   measured on the sphere). tint: ${TW} x ${TH}, each continent's faint tint as a chroma pair in green and blue, around 128. Source: the land silhouette in macOS GeoKit (time zone map), Antarctica drawn in by hand.
   ${gone} specks of island dropped, ${filled} small lakes filled. */
window.GLOBE_DATA = { w:${W}, h:${H}, scale:${SCALE}, src:'data:image/png;base64,${png.toString('base64')}',
  tint:'data:image/png;base64,${tpng.toString('base64')}' };
`);
// --preview file.ppm: the flat map with each continent's tint strongly exaggerated, to check where the borders fall
const PV = process.argv.indexOf('--preview');
if(PV > 0){
  const out = Buffer.alloc(W*H*3);
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
    const i = y*W + x, t = (Math.floor(y/4))*TW + Math.floor(x/4), b = cbB[t]*4, r = crB[t]*4, Y = land[i] ? 0.62 : 0.12;
    const rgb = land[i] ? [Y + 1.402*r, Y - 0.344*b - 0.714*r, Y + 1.772*b] : [Y, Y, Y + 0.05];
    rgb.forEach((v, k) => { out[i*3 + k] = Math.max(0, Math.min(255, Math.round(v*255))); });
  }
  writeFileSync(process.argv[PV + 1], Buffer.concat([Buffer.from('P6\n' + W + ' ' + H + '\n255\n'), out]));
}
console.log('wrote', OUT, (png.length/1024).toFixed(0) + ' KB field, ' + (tpng.length/1024).toFixed(0) + ' KB tint', { gone, filled, seas: seas.length });
