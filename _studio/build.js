'use strict';
// TICKERS brand-kit generator. Self-contained HTML per asset -> headless Chrome (ABSOLUTE file:// URL) -> PNG.
// 1870s patent-office: parchment + ink + oxblood, Old Standard TT + Special Elite.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Special+Elite&display=swap" rel="stylesheet">`;

const BASE = `
:root{--parch:#f0e6cf;--parch2:#e8dcc0;--ink:#2b2014;--faint:#6b5a41;--ox:#6e2b1e;--line:#3a2c1c}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Old Standard TT',serif;color:var(--ink);background:var(--parch)}
.stage{position:relative;overflow:hidden;background:var(--parch)}
.ruled{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(58,44,28,.06) 28px)}
.te{font-family:'Special Elite',monospace}
.sheet{position:absolute;background:var(--parch2);border:3px solid var(--line);box-shadow:10px 10px 0 rgba(43,32,20,.18)}
`;

// the big engraved ticker (glass dome) — reused across assets, scalable
const machine = (s) => `<svg width="${300*s}" height="${210*s}" viewBox="0 0 300 210">
  <g stroke="#2b2014" fill="none" stroke-width="2.4">
    <path d="M60 190 Q60 50 150 45 Q240 50 240 190" stroke-width="3"/>
    <line x1="45" y1="190" x2="255" y2="190"/><rect x="42" y="190" width="216" height="12" fill="#e8dcc0"/><rect x="42" y="190" width="216" height="12"/>
    <ellipse cx="150" cy="140" rx="52" ry="18"/>
    <rect x="98" y="108" width="104" height="34" rx="4" fill="#e8dcc0"/><rect x="98" y="108" width="104" height="34" rx="4"/>
    <circle cx="150" cy="95" r="16"/><circle cx="150" cy="95" r="9"/>
    <path d="M202 128 L232 120 L232 132 L202 136 Z" fill="#e8dcc0"/><path d="M202 128 L232 120 L232 132 L202 136 Z"/>
    <line x1="150" y1="142" x2="150" y2="158"/><ellipse cx="150" cy="166" rx="34" ry="9"/>
  </g>
  <text x="222" y="116" font-family="Special Elite" font-size="9" fill="#6e2b1e">TAPE</text>
</svg>`;

const page = (w, h, css, body) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
.stage{width:${w}px;height:${h}px}${css}</style></head><body><div class="stage"><div class="ruled"></div>${body}</div></body></html>`;

const assets = {};

// 1) PFP 800x800 — machine in a sealed frame
assets['tickers-pfp'] = page(800, 800, `
  .sheet{inset:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
  .wm{font-size:86px;font-weight:700;letter-spacing:.14em}
  .sub{font-size:20px;letter-spacing:.3em;color:var(--ox)}`,
  `<div class="sheet">${machine(1.35)}<div class="wm">TICKERS</div><div class="sub te">$TAPE · 3,333 UNDER GLASS</div></div>`);

// 2) BANNER 1500x500
assets['tickers-banner'] = page(1500, 500, `
  .sheet{inset:30px;display:flex;align-items:center;gap:50px;padding:0 60px}
  .h{font-size:110px;font-weight:700;letter-spacing:.12em;line-height:.95}
  .s{font-style:italic;font-size:26px;color:var(--faint);margin-top:10px}
  .t{font-size:15px;letter-spacing:.24em;color:var(--ox);margin-top:16px}
  .rt{position:absolute;right:60px;top:34px;font-size:14px;letter-spacing:.22em;color:var(--faint)}
  .rb{position:absolute;right:60px;bottom:34px;font-size:19px;font-weight:700;color:var(--ox)}`,
  `<div class="sheet">${machine(1.5)}
    <div><div class="h">TICKERS</div><div class="s">An Improvement in Printing-Telegraphs, for the delivery of stock prices to the bearer.</div>
    <div class="t te">BURN THE COIN · KEEP THE MACHINE · COLLECT THE STOCK</div></div>
    <div class="rt te">SERIES OF 3,333 · ROBINHOOD CHAIN</div><div class="rb te">$TAPE · tickersonrh.xyz</div></div>`);

// 3) KEY ART 2400x1350
assets['tickers-keyart'] = page(2400, 1350, `
  .sheet{inset:70px;display:flex;align-items:center;gap:90px;padding:0 110px}
  .no{font-size:22px;letter-spacing:.3em;color:var(--faint)}
  .h{font-size:190px;font-weight:700;letter-spacing:.1em;line-height:.92;margin:16px 0 10px}
  .s{font-size:40px;font-style:italic;color:var(--faint);line-height:1.5;max-width:1050px}
  .chips{display:flex;gap:18px;margin-top:52px;flex-wrap:wrap}
  .chip{border:2px solid var(--line);padding:16px 28px;font-size:26px;letter-spacing:.1em}
  .chip b{color:var(--ox)}
  .rb{position:absolute;right:110px;bottom:64px;font-size:30px;font-weight:700;color:var(--ox)}`,
  `<div class="sheet"><div>
    <div class="no te">LETTERS PATENT · SERIES OF 3,333 · ROBINHOOD CHAIN</div>
    <div class="h">TICKERS</div>
    <div class="s">Burning 300,000 $TAPE winds one of 3,333 stock tickers. Wound machines print: the pot buys tokenized stocks — NVDA, AAPL, SPY, GME and eight more — split equally into every machine's vault.</div>
    <div class="chips te"><div class="chip">◆ BURN <b>300,000 $TAPE</b></div><div class="chip">◆ CAP <b>3,333</b></div><div class="chip">◆ POT BUYS <b>REAL STOCKS</b></div></div>
  </div>${machine(3.2)}
  <div class="rb te">$TAPE · tickersonrh.xyz</div></div>`);

// 4) MECHANISM 2400x1350 — FIG. 1-4 flow
const fig = (n, t, d, art) => `<div style="flex:1;border:2px solid var(--line);background:var(--parch);padding:40px 36px;text-align:center;display:flex;flex-direction:column;justify-content:center">
  <div style="height:150px;display:flex;align-items:center;justify-content:center;font-size:100px">${art}</div>
  <div class="te" style="font-size:22px;letter-spacing:.2em;color:var(--ox);margin-top:10px">FIG. ${n}</div>
  <div style="font-size:42px;font-weight:700;margin:10px 0 8px">${t}</div>
  <div style="font-size:26px;font-style:italic;color:var(--faint);line-height:1.5">${d}</div></div>`;
assets['tickers-mechanism'] = page(2400, 1350, `
  .sheet{inset:70px;padding:80px 100px;display:flex;flex-direction:column}
  .no{font-size:22px;letter-spacing:.3em;color:var(--faint);text-align:center}
  .h{font-size:96px;font-weight:700;letter-spacing:.08em;text-align:center;margin:10px 0 50px}
  .figs{display:flex;gap:26px;flex:1}
  .foot{display:flex;justify-content:space-between;font-size:26px;color:var(--faint);padding-top:40px}`,
  `<div class="sheet">
    <div class="no te">THE WORKS · IN FOUR FIGURES</div>
    <div class="h">How the machine prints.</div>
    <div class="figs">
      ${fig(1,'The Burn','300,000 $TAPE destroyed inside the wind — before the machine exists.','🔥')}
      ${fig(2,'The Pot','80% of creator fees + wind surcharges converge on one pot.','⚱️')}
      ${fig(3,'The Print','At 0.05 ETH the pot buys the next stock in a 12-stop rotation.','🖨️')}
      ${fig(4,'The Vault','Split equally — machine No. 1 and No. 3,333 get the same print.','🏦')}
    </div>
    <div class="foot te"><span>◆ STOP 12 BUYS $TAPE AND BURNS IT — THE WHEEL FEEDS THE FIRE</span><span style="color:var(--ox);font-weight:700">$TAPE · tickersonrh.xyz</span></div>
  </div>`);

// 5) ROTATION 2400x1350 — the twelve stops
const STOPS = [['NVDA','NVIDIA'],['AAPL','Apple'],['TSLA','Tesla'],['SPY','S&P 500'],['GME','GameStop'],['PLTR','Palantir'],['MSTR','Strategy'],['HOOD','Robinhood'],['COIN','Coinbase'],['NFLX','Netflix'],['GLD','Gold'],['TAPE','buyback & burn']];
assets['tickers-rotation'] = page(2400, 1350, `
  .sheet{inset:70px;padding:80px 110px;display:flex;flex-direction:column}
  .no{font-size:22px;letter-spacing:.3em;color:var(--faint)}
  .h{font-size:100px;font-weight:700;letter-spacing:.08em;margin:12px 0 14px}
  .s{font-size:32px;font-style:italic;color:var(--faint);max-width:1600px;line-height:1.5}
  .wheel{display:grid;grid-template-columns:repeat(6,1fr);gap:20px;margin-top:50px;flex:1}
  .stop{border:2px solid var(--line);background:var(--parch);padding:26px 22px;text-align:center;display:flex;flex-direction:column;justify-content:center}
  .stop.last{background:var(--ink);color:var(--parch);border-color:var(--ink)}
  .stop .n{font-size:18px;letter-spacing:.2em;color:var(--ox)}
  .stop.last .n{color:#d9b48a}
  .stop .sym{font-size:52px;font-weight:700;margin:6px 0 2px}
  .stop .nm{font-size:22px;font-style:italic;color:var(--faint)}
  .stop.last .nm{color:rgba(240,230,207,.7)}
  .foot{display:flex;justify-content:space-between;font-size:26px;color:var(--faint);padding-top:36px}`,
  `<div class="sheet">
    <div class="no te">THE ROTATION · TWELVE STOPS, THEN THE TOP</div>
    <div class="h">The pot buys real stocks.</div>
    <div class="s">Every time the pot clears 0.05 ETH it is spent — all of it — on the next stop. One equal share to every wound machine's vault.</div>
    <div class="wheel">${STOPS.map((x,i)=>`<div class="stop${i===11?' last':''}"><div class="n te">STOP ${i+1}</div><div class="sym">${x[0]}</div><div class="nm">${x[1]}</div></div>`).join('')}</div>
    <div class="foot te"><span>◆ TOKENIZED EQUITIES ON ROBINHOOD CHAIN</span><span style="color:var(--ox);font-weight:700">$TAPE · tickersonrh.xyz</span></div>
  </div>`);

// 6) LINEAGE 2400x1350 — QUOTRONS → OTC DESKS → TICKERS
const lrow = (yr, name, tick, note, us) => `<div style="display:flex;align-items:center;gap:44px;padding:40px 48px;border:2px solid ${us?'var(--ink)':'var(--line)'};background:${us?'var(--ink)':'var(--parch)'};color:${us?'var(--parch)':'var(--ink)'};margin-top:24px">
  <div class="te" style="font-size:26px;letter-spacing:.14em;color:${us?'#d9b48a':'var(--ox)'};min-width:130px">${yr}</div>
  <div style="flex:1"><div style="font-size:52px;font-weight:700;letter-spacing:.06em">${name}</div><div class="te" style="font-size:24px;color:${us?'rgba(240,230,207,.7)':'var(--faint)'};margin-top:4px">${tick}</div></div>
  <div style="flex:1.5;font-size:28px;font-style:italic;line-height:1.45;color:${us?'rgba(240,230,207,.85)':'var(--faint)'}">${note}</div></div>`;
assets['tickers-lineage'] = page(2400, 1350, `
  .sheet{inset:70px;padding:80px 110px;display:flex;flex-direction:column}
  .no{font-size:22px;letter-spacing:.3em;color:var(--faint)}
  .h{font-size:96px;font-weight:700;letter-spacing:.08em;margin:12px 0 6px}
  .foot{margin-top:auto;display:flex;justify-content:space-between;font-size:26px;color:var(--faint);padding-top:34px}`,
  `<div class="sheet">
    <div class="no te">PROVENANCE · THE MACHINES THAT CARRIED PRICES</div>
    <div class="h">The oldest machine wins.</div>
    ${lrow('1968','QUOTRONS','4,444 terminals · Robinhood Chain · $12M', 'Burn the token, light the terminal, print the reward stock. The proof.', false)}
    ${lrow('2026','OTC DESKS','5,000 desks · Solana', 'The same engine moved to pump.fun. The confirmation.', false)}
    ${lrow('1871','TICKERS','3,333 machines · Robinhood Chain', "One machine older than all of it: Edison's stock ticker under glass. The origin, wound at last.", true)}
    <div class="foot te"><span>◆ NOT AFFILIATED · LINEAGE HONORED, WORKS OUR OWN</span><span style="color:var(--ox);font-weight:700">$TAPE · tickersonrh.xyz</span></div>
  </div>`);

for (const [name, html] of Object.entries(assets)) { fs.writeFileSync(path.join(OUT, name + '.html'), html); console.log('wrote', name); }
console.log('done:', Object.keys(assets).length);
