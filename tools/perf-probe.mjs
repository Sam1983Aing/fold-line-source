#!/usr/bin/env node
// Performance probe for a Fold Line page: cold load weight, boot time, GPU memory,
// draw calls, and frame times over a full scroll. Chrome over CDP, no deps.
//   node tools/perf-probe.mjs URL [dpr] [WxH] [scrollSeconds] [endExpr]
// endExpr: JS for where the timed scroll stops, in px (default the bottom of the page).
// For the hero alone: "APP.heroPx()".
// Serve the folder first (.claude/launch.json, port 8611). Records nothing, prints JSON.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [URL, DPRs = '1', SIZE = '1440x900', SECS = '40', END = ''] = process.argv.slice(2);
const DPR = Number(DPRs), [VW, VH] = SIZE.split('x').map(Number), SCROLL_S = Number(SECS);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9900 + Math.floor(Math.random() * 90);
const PROFILE = mkdtempSync(join(tmpdir(), 'probe-'));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--mute-audio', `--window-size=${VW},${VH}`, '--headless=new', '--use-angle=metal',
  '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling',
  '--enable-precise-memory-info', 'about:blank'], { stdio: 'ignore' });
const quit = async c => { try { chrome.kill(); } catch {} await sleep(500); try { rmSync(PROFILE, { recursive: true, force: true }); } catch {} process.exit(c); };

let tab;
for (let i = 0; i < 100 && !tab; i++) { try { tab = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {} if (!tab) await sleep(150); }
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map(), reqs = new Map(), errors = [];
const send = (method, params = {}) => new Promise(res => { const my = ++id; waiting.set(my, res); ws.send(JSON.stringify({ id: my, method, params })); });
const ev = async (expression, awaitPromise = false) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); return; }
  if (m.method === 'Network.requestWillBeSent') reqs.set(m.params.requestId, { url: m.params.request.url, bytes: 0 });
  if (m.method === 'Network.responseReceived') { const q = reqs.get(m.params.requestId); if (q) q.type = m.params.response.mimeType; }
  if (m.method === 'Network.loadingFinished') { const q = reqs.get(m.params.requestId); if (q) q.bytes = m.params.encodedDataLength; }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value).join(' '));
});
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: DPR, mobile: false });
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__lt = [];
  try { new PerformanceObserver(l => l.getEntries().forEach(e => __lt.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  window.__t = {};
  window.__upMB = () => { const A = window.APP, r = A.renderer, seen = new Set(); let mb = 0, n = 0;
    A.scene.traverse(o => { const ms = o.material ? [].concat(o.material) : []; if (o.customDepthMaterial) ms.push(o.customDepthMaterial);
      ms.forEach(m => Object.values(m).concat(m.uniforms ? Object.values(m.uniforms).map(u => u && u.value) : []).forEach(t => {
        if (!t || !t.isTexture || seen.has(t.uuid) || !t.image || !r.properties.get(t).__webglTexture) return; seen.add(t.uuid); n++;
        const w = t.image.width || 0, h = t.image.height || 0; mb += w * h * 4 * (t.generateMipmaps === false ? 1 : 4 / 3) / 1048576; })); });
    return { uploaded: n, uploadedMB: +mb.toFixed(1) }; };
  const iv = setInterval(() => {
    if (window.APP && !__t.app) __t.app = performance.now();
    if (window.APP && !window.APP.QUEUE.length && !__t.queue) { __t.queue = performance.now(); clearInterval(iv); }
  }, 10);
` });
await send('Page.navigate', { url: URL });
let ok = false;
for (let i = 0; i < 600 && !ok; i++) { try { ok = await ev(`!!(window.__t && __t.queue) && document.readyState === 'complete'`); } catch {} if (!ok) await sleep(50); }
if (!ok) { console.log('page never finished building'); await quit(1); }
await sleep(3500); // let the intro finish

const boot = await ev(`(() => {
  const n = performance.getEntriesByType('navigation')[0];
  const lt = __lt.filter(e => e[0] < __t.queue + 50);
  const A = window.APP, r = A.renderer, seen = new Set(); let px = 0, gpu = 0, nTex = 0;
  A.scene.traverse(o => { const ms = o.material ? [].concat(o.material) : []; if (o.customDepthMaterial) ms.push(o.customDepthMaterial);
    ms.forEach(m => ['map', 'alphaMap', 'emissiveMap'].forEach(k => { const t = m[k]; if (!t || seen.has(t.uuid) || !t.image) return; seen.add(t.uuid);
      const w = t.image.width, h = t.image.height; px += w * h; nTex++; gpu += w * h * 4 * (t.generateMipmaps === false ? 1 : 4 / 3); })); });
  const sm = A.KNOB.SHADOW;
  return {
    htmlDone: Math.round(n.responseEnd), domReady: Math.round(n.domContentLoadedEventEnd), loadEvent: Math.round(n.loadEventEnd),
    firstFrame: Math.round(__t.app), allDaysBuilt: Math.round(__t.queue),
    longTasks: lt.length, longTaskMs: Math.round(lt.reduce((s, e) => s + e[1], 0)), longestTask: Math.round(Math.max(0, ...lt.map(e => e[1]))),
    textures: nTex, texMegapixels: +(px / 1e6).toFixed(2), texGpuMB: +(gpu / 1048576).toFixed(1), shadowMB: +(sm * sm * 4 / 1048576).toFixed(1),
    buffer: r.domElement.width + 'x' + r.domElement.height, bufferMP: +(r.domElement.width * r.domElement.height / 1e6).toFixed(2), pixelRatio: r.getPixelRatio(),
    gpuGeometries: r.info.memory.geometries, gpuTextures: r.info.memory.textures, programs: r.info.programs.length,
    jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    sheets: A.SCENES.map(s => s.sheets.length + s.flats.length).join('+'), onGpu: window.__upMB()
  };
})()`);

// scroll the whole page once, eased, like a steady reader, and time every frame
const run = await ev(`new Promise(res => {
  const max = ${END ? '(' + END + ')' : 'document.documentElement.scrollHeight - innerHeight'}, D = ${SCROLL_S} * 1000, r = APP.renderer;
  const fr = [], calls = [], tris = []; let t0 = null, last = null;
  window.__lt.length = 0;
  function f(t) {
    if (t0 === null) { t0 = t; last = t; }
    const k = Math.min(1, (t - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    window.scrollTo(0, e * max);
    fr.push(t - last); last = t; calls.push(r.info.render.calls); tris.push(r.info.render.triangles);
    if (k < 1) requestAnimationFrame(f); else setTimeout(() => {
      const s = fr.slice(2).sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
      res({ frames: s.length, fps: +(1000 * s.length / s.reduce((a, b) => a + b, 0)).toFixed(1), p50: +q(.5).toFixed(1), p95: +q(.95).toFixed(1), p99: +q(.99).toFixed(1),
        worst: +s[s.length - 1].toFixed(0), over33: s.filter(v => v > 33.4).length, over50: s.filter(v => v > 50).length,
        maxCalls: Math.max(...calls), gpuTexturesAfter: r.info.memory.textures, onGpuAfter: window.__upMB(), maxTrisK: Math.round(Math.max(...tris) / 1000), longTasks: __lt.length });
    }, 300);
  }
  requestAnimationFrame(f);
})`, true);

const list = [...reqs.values()].filter(q => q.bytes > 0);
const kb = b => +(b / 1024).toFixed(0);
const groups = {};
for (const q of list) {
  const u = q.url;
  const g = /three/.test(u) ? 'three.js' : /ScrollTrigger/.test(u) ? 'ScrollTrigger' : /gsap/.test(u) ? 'GSAP' : /lenis/.test(u) ? 'Lenis'
    : /fonts\.gstatic/.test(u) ? 'font files' : /fonts\.googleapis/.test(u) ? 'font CSS' : /\.html/.test(u) ? 'page HTML' : 'other';
  groups[g] = (groups[g] || 0) + q.bytes;
}
console.log(JSON.stringify({ viewport: `${VW}x${VH}@${DPR}`, transferKB: kb(list.reduce((s, q) => s + q.bytes, 0)), requests: list.length,
  byGroupKB: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, kb(v)])), boot, scroll: run, errors }, null, 1));
await quit(0);
