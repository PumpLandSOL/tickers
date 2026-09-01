'use strict';
// TICKERS demo recorder — drives the REAL site in headless Chrome over CDP,
// injects a patent-office caption overlay, winds a machine LIVE on camera,
// captures a screencast and encodes to constant-30fps MP4 (lag-free: frames
// are written with their true capture timestamps, then resampled by ffmpeg).
//   node _studio/demo.js                 # records http://localhost:8192
//   SITE=https://tickersonrh.xyz node _studio/demo.js
const { spawn, execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const pexec = promisify(execFile);

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9446, W = 1280, H = 720;
const SITE = process.env.SITE || 'http://localhost:8192';
const OUT = path.join(__dirname, 'out', 'tickers-demo.mp4');
const FRAMES = path.join(__dirname, 'demo-frames');
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
function makeCdp(ws) {
  let id = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); }
    else if (m.method) listeners.forEach((fn) => fn(m));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
  return { send, on: (fn) => listeners.push(fn) };
}

// patent-office overlay: parchment caption plate + wax-seal click ring
const OVERLAY = String.raw`
(() => {
  if (window.__cap) return true;
  const s = document.createElement('style');
  s.textContent = ` + '`' + `
    #dmTitle{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
      background:#f0e6cf;opacity:0;transition:opacity .5s;
      background-image:repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(58,44,28,.06) 28px)}
    #dmTitle.on{opacity:1}
    #dmTitle .t{font-family:'Old Standard TT',serif;font-weight:700;font-size:92px;letter-spacing:.14em;color:#2b2014}
    #dmTitle .s{font-family:'Special Elite',monospace;font-size:19px;letter-spacing:.3em;color:#6e2b1e;text-transform:uppercase}
    #dmCap{position:fixed;left:50%;bottom:36px;transform:translateX(-50%) translateY(24px);z-index:99998;min-width:min(880px,92vw);max-width:94vw;
      background:#e8dcc0;border:2px solid #3a2c1c;border-left:6px solid #6e2b1e;box-shadow:6px 6px 0 rgba(43,32,20,.25);
      padding:14px 24px;opacity:0;transition:opacity .35s,transform .35s}
    #dmCap.on{opacity:1;transform:translateX(-50%) translateY(0)}
    #dmCap .k{font-family:'Special Elite',monospace;font-size:11px;letter-spacing:.26em;color:#6e2b1e;text-transform:uppercase}
    #dmCap .v{font-family:'Old Standard TT',serif;font-size:22px;color:#2b2014;margin-top:4px;line-height:1.35}
    #dmCap .v b{color:#6e2b1e}
    #dmCur{position:fixed;z-index:99999;width:22px;height:22px;left:0;top:0;pointer-events:none;transition:left .6s cubic-bezier(.5,0,.2,1),top .6s cubic-bezier(.5,0,.2,1);opacity:0}
    #dmRing{position:fixed;z-index:99999;width:60px;height:60px;border:3px solid #6e2b1e;border-radius:50%;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.3)}
    #dmRing.go{animation:dmr .55s ease-out}
    @keyframes dmr{0%{opacity:.9;transform:translate(-50%,-50%) scale(.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
  ` + '`' + `;
  document.head.appendChild(s);
  const title = document.createElement('div'); title.id='dmTitle'; title.innerHTML='<div class="t"></div><div class="s"></div>'; document.body.appendChild(title);
  const cap = document.createElement('div'); cap.id='dmCap'; cap.innerHTML='<div class="k"></div><div class="v"></div>'; document.body.appendChild(cap);
  const cur = document.createElement('div'); cur.id='dmCur';
  cur.innerHTML='<svg width="22" height="22" viewBox="0 0 22 22"><path d="M2 2 L2 17 L6 13 L9 20 L12 19 L9 12 L15 12 Z" fill="#2b2014" stroke="#f0e6cf" stroke-width="1.2"/></svg>';
  document.body.appendChild(cur);
  const ring = document.createElement('div'); ring.id='dmRing'; document.body.appendChild(ring);
  window.__title = (t, sub) => { title.querySelector('.t').textContent=t; title.querySelector('.s').textContent=sub||''; title.classList.add('on'); };
  window.__titleHide = () => title.classList.remove('on');
  window.__cap = (k, v) => { cap.querySelector('.k').textContent=k||''; cap.querySelector('.v').innerHTML=v||''; cap.classList.add('on'); };
  window.__capHide = () => cap.classList.remove('on');
  window.__center = (sel) => { const el=document.querySelector(sel); if(!el) return null; const r=el.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; };
  window.__cursorToSel = (sel) => { const c=window.__center(sel); if(!c) return; cur.style.opacity='1'; cur.style.left=c.x+'px'; cur.style.top=c.y+'px'; };
  window.__clickSel = (sel) => { const c=window.__center(sel); if(!c) return false; ring.style.left=c.x+'px'; ring.style.top=c.y+'px'; ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
    const el=document.querySelector(sel); if(el) el.click(); return true; };
  window.__scrollToSel = (sel, dur) => new Promise((res) => {
    const el=document.querySelector(sel); if(!el){res();return;}
    const startY=window.scrollY, endY=window.scrollY+el.getBoundingClientRect().top - (window.innerHeight*0.14);
    const t0=performance.now(); dur=dur||1100;
    (function fr(t){ const k=Math.min(1,(t-t0)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; window.scrollTo(0,startY+(endY-startY)*e); if(k<1)requestAnimationFrame(fr); else res(); })(t0);
  });
  return true;
})()`;

async function main() {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`,
    `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    `--user-data-dir=${path.join(__dirname, 'demo-profile')}`,
    SITE,
  ], { stdio: 'ignore' });

  const frames = [];
  try {
    await waitDevtools();
    const ws = new WebSocket(await pageTarget());
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    const { send, on } = makeCdp(ws);
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

    const ev = (expr, awaitPromise = false) => send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
    const inject = async () => {
      await ev("document.fonts && document.fonts.ready.then(()=>1)", true).catch(() => {});
      await ev(OVERLAY, true);
    };
    await sleep(2500); await inject();

    on((m) => {
      if (m.method === 'Page.screencastFrame') {
        frames.push({ buf: Buffer.from(m.params.data, 'base64'), t: Date.now() });
        send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
      }
    });
    await send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

    // ============ ACT I — the letters patent (landing) ============
    await ev("window.scrollTo(0,0)");
    await ev("window.__title('TICKERS','3,333 stock tickers under glass · $TAPE')"); await sleep(2800);
    await ev("window.__titleHide()"); await sleep(500);

    await ev("window.__cap('letters patent · robinhood chain','One coin, one machine. <b>Burning 300,000 $TAPE</b> winds one of <b>3,333</b> stock tickers — permanent, transferable, printing.')"); await sleep(4600);

    await ev("window.__scrollToSel('.cols',1100)", true);
    await ev("window.__cap('fig. 2 — the burn','The burn happens <b>inside the wind</b> — the coin is destroyed before the machine exists. A full fleet retires <b>~999.9M $TAPE.</b>')"); await sleep(4800);
    await ev("window.__cap('fig. 3 — the print','Creator fees fill a common <b>pot</b>. At <b>0.05 ETH</b> it is spent — all of it — on real tokenized stocks.')"); await sleep(4400);

    // ============ ACT II — the exchange floor ============
    await send('Page.navigate', { url: SITE + '/app' });
    await sleep(2600); await inject();
    await ev("window.__cap('the exchange floor','Live: machines wound, $TAPE burned, the pot filling toward its trigger.')"); await sleep(4000);

    await ev("window.__scrollToSel('#rot',900)", true);
    await ev("window.__cap('the rotation — twelve stops','NVDA · AAPL · TSLA · SPY · GME · PLTR · MSTR · HOOD · COIN · NFLX · GLD — and stop 12 <b>buys $TAPE and burns it.</b>')"); await sleep(5000);

    // wind one LIVE
    await ev("window.__cap('now wind one','Watch — a machine, minted by <b>destroying the coin.</b>')");
    await ev("document.getElementById('owner').value='the patent office'");
    await ev("window.__cursorToSel('#windBtn')"); await sleep(1100);
    await ev("window.__clickSel('#windBtn')"); await sleep(1800);
    await ev("window.__cap('wound ✅','<b>300,000 $TAPE destroyed forever.</b> The fleet grows by one; the coin shrinks for everyone.')"); await sleep(4400);

    await ev("window.__scrollToSel('#ledger',1000)", true);
    await ev("window.__cap('the ledger of prints','Every pot spend, on the record: which stock, how much, and the <b>equal share</b> each machine received.')"); await sleep(4800);

    await ev("window.__scrollToSel('#gallery',1000)", true);
    await ev("window.__cap('the fleet','Each machine engraved with its own traits — and a <b>vault of stock</b> it collected by existing.')"); await sleep(4800);

    await ev("window.__cap('one machine, one share','Ticker No. 1 and No. 3,333 get the <b>same print</b>. No whale math.')"); await sleep(3800);

    // endcard
    await ev("window.__capHide()"); await sleep(300);
    await ev("window.__title('BURN THE COIN. KEEP THE MACHINE.','collect the stock · tickersonrh.xyz')"); await sleep(3400);

    await send('Page.stopScreencast');
    await sleep(300);
    ws.close();
  } finally {
    chrome.kill();
  }

  if (frames.length < 5) throw new Error('too few frames captured: ' + frames.length);
  const list = [];
  for (let i = 0; i < frames.length; i++) {
    const name = `f_${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(FRAMES, name), frames[i].buf);
    const dur = i < frames.length - 1 ? Math.max(0.016, (frames[i + 1].t - frames[i].t) / 1000) : 0.5;
    list.push(`file '${name}'`, `duration ${dur.toFixed(3)}`);
  }
  list.push(`file 'f_${String(frames.length - 1).padStart(5, '0')}.jpg'`);
  fs.writeFileSync(path.join(FRAMES, 'list.txt'), list.join('\n'));

  console.log(`captured ${frames.length} frames over ${((frames[frames.length - 1].t - frames[0].t) / 1000).toFixed(1)}s — encoding…`);
  await pexec('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', path.join(FRAMES, 'list.txt'),
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
    '-movflags', '+faststart', OUT,
  ], { maxBuffer: 1 << 27 });
  fs.rmSync(FRAMES, { recursive: true, force: true });
  console.log('✓', OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
