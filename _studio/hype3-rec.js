'use strict';
// Frame-perfect hype-video renderer: steps the seekable timeline in hype3.html
// at exactly 30fps via CDP (__seek(t) + Page.captureScreenshot per frame),
// then encodes with ffmpeg. Zero dropped frames by construction.
const { spawn, execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const pexec = promisify(execFile);

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9447, W = 1920, H = 1080, FPS = 30;
const SITE = 'file:///C:/Users/efrai/OneDrive/Desktop/PUMP LAND/tickers/_studio/hype3.html';
const OUT = path.join(__dirname, 'out', 'tickers-doubleprint.mp4');
const FRAMES = path.join(__dirname, 'hype-frames');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitDevtools() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return; } catch (e) {}
    await sleep(200);
  }
  throw new Error('devtools never came up');
}
async function pageTarget() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const p = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!p) throw new Error('no page target');
  return p.webSocketDebuggerUrl;
}

async function main() {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`,
    `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    `--user-data-dir=${path.join(__dirname, 'hype-profile')}`,
    SITE,
  ], { stdio: 'ignore' });

  try {
    await waitDevtools();
    const ws = new WebSocket(await pageTarget());
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    let id = 0; const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });

    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await sleep(2000);
    await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(()=>1)', awaitPromise: true });

    const endR = await send('Runtime.evaluate', { expression: 'window.__END', returnByValue: true });
    const END = endR.result.value || 21000;
    const total = Math.round((END / 1000) * FPS);
    console.log(`rendering ${total} frames at ${FPS}fps…`);

    for (let f = 0; f < total; f++) {
      const t = Math.round((f * 1000) / FPS);
      await send('Runtime.evaluate', { expression: `window.__seek(${t})`, returnByValue: true });
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(FRAMES, `f_${String(f).padStart(5, '0')}.png`), Buffer.from(shot.data, 'base64'));
      if (f % 90 === 0) console.log(`  frame ${f}/${total}`);
    }
    ws.close();
  } finally {
    chrome.kill();
  }

  console.log('encoding…');
  await pexec('ffmpeg', [
    '-y', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f_%05d.png'),
    '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow',
    '-movflags', '+faststart', OUT,
  ], { maxBuffer: 1 << 28 });
  fs.rmSync(FRAMES, { recursive: true, force: true });
  console.log('✓', OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
