#!/usr/bin/env node
// Frame-by-frame recording of a page, for demo videos that have to be smooth and sharp (21 Oct 2026).
//
// Real-time capture (tools/record-gaps.mjs) keeps what the browser manages to paint, and on the Fold Line hero at 1080p
// that was 20 to 38 frames a second with hitches of 150 to 470 ms. Here the page's clock stands still and is moved on
// exactly 1/fps at a time: animation frames, timers, Date and performance.now, and the CSS animations and transitions,
// all on the same clock. Each frame is drawn in full and captured before the clock moves again, so the video is smooth
// at any size and pixel density, however long a frame takes to make.
//
//   node tools/record-frames.mjs --url URL --out FILE.mp4 [--size 1920x1080] [--dpr 2] [--fps 60] [--seconds 20]
//        [--start "window.HERO_READY === true"] [--drive FILE.js] [--out-size 1920x1080] [--crf 14] [--png]
//
// --start  the clock runs (without capturing) until this is true, then capture begins. Default: the load event.
// --drive  a script run in the page as capture begins: the demo's own timeline (a scripted cursor, Lenis scrolls). It
//          runs on the page's clock, so gsap.ticker.time and setTimeout in it are video time.
// --dpr    the page's device pixel ratio. With --out-size smaller than size*dpr the frames are scaled down (lanczos):
//          supersampled, sharper than rendering at the output size.
// --png    lossless frames (slower). The default is JPEG at quality 95.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';

const argv = process.argv.slice(2), A = {};
for (let i = 0; i < argv.length; i++) { const k = argv[i]; if (!k.startsWith('--')) continue; const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) A[k.slice(2)] = true; else { A[k.slice(2)] = v; i++; } }
if (!A.url || !A.out) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 20).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(1); }
const [VW, VH] = (A.size || '1920x1080').split('x').map(Number), DPR = +(A.dpr || 1), FPS = +(A.fps || 60), SECONDS = +(A.seconds || 10);
const [OW, OH] = (A['out-size'] || `${VW}x${VH}`).split('x').map(Number), N = Math.round(SECONDS*FPS), DT = 1000/FPS;
const OUT = resolve(A.out); mkdirSync(dirname(OUT), { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// the page's clock, installed before any of its scripts. Off (the real clock) until the DOM is parsed, then stepped
const CLOCK = `(() => {
  const NP = performance.now.bind(performance), ND = Date.now, NRAF = window.requestAnimationFrame.bind(window), NCAF = window.cancelAnimationFrame.bind(window),
        NST = window.setTimeout.bind(window), NCT = window.clearTimeout.bind(window), NSI = window.setInterval.bind(window), NCI = window.clearInterval.bind(window);
  const V = window.__vt = { on:false, now:0, off:0, raf:new Map(), rid:0, timers:new Map(), tid:1e7, anims:new WeakMap() };
  performance.now = () => V.on ? V.now : NP();
  Date.now = () => V.on ? V.off + V.now : ND();
  window.requestAnimationFrame = (cb) => { if(!V.on) return NRAF(cb); const id = ++V.rid; V.raf.set(id, cb); return -id; };
  window.cancelAnimationFrame = (id) => { if(id < 0) V.raf.delete(-id); else NCAF(id); };
  window.setTimeout = (fn, ms, ...a) => { if(!V.on) return NST(fn, ms, ...a); const id = ++V.tid; V.timers.set(id, { at:V.now + Math.max(0, +ms || 0), fn, a, every:0 }); return id; };
  window.setInterval = (fn, ms, ...a) => { if(!V.on) return NSI(fn, ms, ...a); const e = Math.max(1, +ms || 0), id = ++V.tid; V.timers.set(id, { at:V.now + e, fn, a, every:e }); return id; };
  window.clearTimeout = (id) => { if(V.timers.has(id)) V.timers.delete(id); else NCT(id); };
  window.clearInterval = (id) => { if(V.timers.has(id)) V.timers.delete(id); else NCI(id); };
  V.start = () => { if(V.on) return; V.now = NP(); V.off = ND() - V.now; V.on = true; };
  V.step = (dt) => {
    const end = V.now + dt;
    for(let guard = 0; guard < 5000; guard++){
      let best = null, bid = 0;
      for(const [id, t] of V.timers) if(t.at <= end && (!best || t.at < best.at)){ best = t; bid = id; }
      if(!best) break;
      V.now = Math.max(V.now, best.at);
      if(best.every) best.at += best.every; else V.timers.delete(bid);
      try { if(typeof best.fn === 'function') best.fn(...best.a); } catch(e){ console.error(e); }
    }
    V.now = end;
    const cbs = [...V.raf.values()]; V.raf.clear();
    for(const cb of cbs){ try { cb(V.now); } catch(e){ console.error(e); } }
    // CSS animations and transitions: held, and set to where the page's clock says they are
    for(const a of document.getAnimations()){
      let s = V.anims.get(a);
      if(!s){ s = { t0:V.now, c0:a.currentTime || 0 }; V.anims.set(a, s); try { a.pause(); } catch(e){} }
      try { a.currentTime = s.c0 + (V.now - s.t0)*(a.playbackRate || 1); } catch(e){}
    }
    return V.now;
  };
  document.addEventListener('DOMContentLoaded', V.start);
})();`;

const CHROME = A.chrome || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9300 + Math.floor(Math.random()*200), PROFILE = mkdtempSync(join(tmpdir(), 'frames-'));
const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--mute-audio', `--window-size=${VW},${VH}`, A.headful ? '--new-window' : '--headless=new', '--use-angle=metal',
  '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', 'about:blank'], { stdio: 'ignore' });
const quit = async (c) => { try { chrome.kill(); } catch {} await sleep(400); try { rmSync(PROFILE, { recursive: true, force: true }); } catch {} process.exit(c); };

let tab;
for (let i = 0; i < 100 && !tab; i++) { try { tab = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {} if (!tab) await sleep(150); }
if (!tab) { console.error('Chrome did not start'); await quit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map(), errors = []; let loaded = false;
const send = (method, params = {}) => new Promise(res => { const my = ++id; waiting.set(my, res); ws.send(JSON.stringify({ id: my, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); return r.result?.exceptionDetails ? { error: (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text || '').slice(0, 400) } : r.result?.result?.value; };
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); return; }
  if (m.method === 'Page.loadEventFired') loaded = true;
  if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '').slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300));
});
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: DPR, mobile: false, screenWidth: VW, screenHeight: VH });
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK });
await send('Page.navigate', { url: A.url });
for (let i = 0; i < 600 && !loaded; i++) await sleep(50);
if (!loaded) { console.error('the page never loaded'); await quit(1); }

// run the page's clock until the start condition, a frame at a time, nothing captured
const START = A.start || 'true';
let pre = 0;
for (; pre < 60*FPS; pre++) {
  await ev(`__vt.step(${DT})`);
  if (pre % 4 === 0 && await ev(`!!(${START})`) === true) break;
  if (pre % 2 === 0) await sleep(4);   // fetches and script loads finish in real time
}
console.log(`start condition after ${(pre*DT/1000).toFixed(1)} s of page time`);
if (A.drive) { const r = await ev(readFileSync(A.drive, 'utf8') + '\n;1'); if (r && r.error) { console.error('drive script:', r.error); await quit(1); } }

const fmt = A.png ? 'png' : 'jpeg';
const vf = (OW !== VW*DPR || OH !== VH*DPR) ? [`scale=${OW}:${OH}:flags=lanczos`] : [];
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', fmt === 'png' ? 'png' : 'mjpeg', '-i', '-',
  '-vf', [...vf, 'format=yuv420p'].join(','), '-c:v', 'libx264', '-preset', A.preset || 'slow', '-crf', String(A.crf || 14),
  '-r', String(FPS), '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  if (f) await ev(`__vt.step(${DT})`);
  const r = await send('Page.captureScreenshot', { format: fmt, quality: fmt === 'jpeg' ? +(A.quality || 95) : undefined, fromSurface: true });
  const buf = Buffer.from(r.result.data, 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % (FPS*2) === 0 || f === N - 1) {
    const el = (Date.now() - t0)/1000, per = el/(f + 1);
    process.stdout.write(`  frame ${f + 1}/${N}  ${(per*1000).toFixed(0)} ms a frame, about ${Math.round(per*(N - f - 1))} s to go\n`);
  }
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
console.log(`${OUT}\n  ${N} frames, ${SECONDS} s at ${FPS} fps, captured at ${VW*DPR}x${VH*DPR}, written at ${OW}x${OH}, ${((Date.now() - t0)/1000).toFixed(0)} s to make`);
if (errors.length) console.log('  page errors:\n   ' + [...new Set(errors)].slice(0, 8).join('\n   '));
await quit(0);
