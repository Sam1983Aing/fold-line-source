import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const S = process.env.S;
export const META = JSON.parse(readFileSync(`${S}/tiles/meta.json`, 'utf8'));
// stitched elevation grid for one place and kind, with web mercator lookups
export function grid(place, kind){
  const m = META[place][kind], N = 256*m.n, E = new Float32Array(N*N);
  for (let j=0;j<m.n;j++) for (let i=0;i<m.n;i++){
    const b = readFileSync(`${S}/raw/t_${m.z}_${m.x0+i}_${m.y0+j}.rgb`);
    for (let y=0;y<256;y++) for (let x=0;x<256;x++){
      const k = (y*256+x)*3;
      E[(j*256+y)*N + i*256+x] = b[k]*256 + b[k+1] + b[k+2]/256 - 32768;
    }
  }
  const Z = 2**m.z;
  const px = lon => ((lon+180)/360*Z - m.x0)*256;
  const py = lat => { const r = lat*Math.PI/180; return ((1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*Z - m.y0)*256; };
  const lon = X => (X/256 + m.x0)/Z*360 - 180;
  const lat = Y => { const n = Math.PI - 2*Math.PI*(Y/256 + m.y0)/Z; return 180/Math.PI*Math.atan(0.5*(Math.exp(n) - Math.exp(-n))); };
  // metres per pixel at this latitude
  const mpp = latDeg => 40075016.686*Math.cos(latDeg*Math.PI/180)/(Z*256);
  const at = (X,Y) => {
    X = Math.max(0, Math.min(N-1.001, X)); Y = Math.max(0, Math.min(N-1.001, Y));
    const i = Math.floor(X), j = Math.floor(Y), fx = X-i, fy = Y-j;
    const a = E[j*N+i], b = E[j*N+i+1], c = E[(j+1)*N+i], d = E[(j+1)*N+i+1];
    return a + (b-a)*fx + (c-a)*fy + (a-b-c+d)*fx*fy;
  };
  return { E, N, m, px, py, lon, lat, mpp, at };
}
// write an RGB buffer as png through ffmpeg
export function png(file, w, h, rgb){
  const tmp = file + '.rgb'; writeFileSync(tmp, rgb);
  execFileSync('ffmpeg', ['-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${w}x${h}`,'-i',tmp,file]);
}
