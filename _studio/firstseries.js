'use strict';
// tickers-firstseries.png — the V2.1 update: First Series plate + weighted Golden Tape.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Special+Elite&display=swap" rel="stylesheet">`;

const machine = (s, sw) => `<svg width="${300 * s}" height="${210 * s}" viewBox="0 0 300 210">
  <g stroke="#2b2014" fill="none" stroke-width="${sw || 2.4}">
    <path d="M60 190 Q60 50 150 45 Q240 50 240 190" stroke-width="${(sw || 2.4) * 1.25}"/>
    <line x1="45" y1="190" x2="255" y2="190"/><rect x="42" y="190" width="216" height="12" fill="#e8dcc0"/><rect x="42" y="190" width="216" height="12"/>
    <ellipse cx="150" cy="140" rx="52" ry="18"/><rect x="98" y="108" width="104" height="34" rx="4" fill="#e8dcc0"/><rect x="98" y="108" width="104" height="34" rx="4"/>
    <circle cx="150" cy="95" r="16"/><circle cx="150" cy="95" r="9"/>
    <path d="M202 128 L232 120 L232 132 L202 136 Z" fill="#e8dcc0"/><path d="M202 128 L232 120 L232 132 L202 136 Z"/>
    <line x1="150" y1="142" x2="150" y2="158"/><ellipse cx="150" cy="166" rx="34" ry="9"/>
  </g></svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
:root{--parch:#f0e6cf;--parch2:#e8dcc0;--ink:#2b2014;--faint:#6b5a41;--ox:#6e2b1e;--line:#3a2c1c}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Old Standard TT',serif;color:var(--ink);background:var(--parch);overflow:hidden}
.stage{width:2400px;height:1350px;position:relative;background:var(--parch);
  background-image:repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(58,44,28,.06) 28px)}
.te{font-family:'Special Elite',monospace}
.sheet{position:absolute;inset:56px;background:var(--parch2);border:3px solid var(--line);box-shadow:10px 10px 0 rgba(43,32,20,.18);
  padding:66px 100px;display:flex;flex-direction:column}
.no{font-size:22px;letter-spacing:.3em;color:var(--faint)}
.h{font-size:96px;font-weight:700;letter-spacing:.06em;margin:14px 0 8px}
.h b{color:var(--ox)}
.cols{display:flex;gap:44px;flex:1;margin-top:36px}
.card{flex:1;border:3px solid var(--line);background:var(--parch);padding:44px 48px;display:flex;flex-direction:column;align-items:center;text-align:center}
.card.first{background:var(--ink);color:var(--parch);border-color:var(--ink)}
.plate{display:inline-block;border:3px double var(--ox);color:var(--ox);font-family:'Special Elite',monospace;font-size:22px;
  letter-spacing:.2em;padding:12px 26px;transform:rotate(-3deg)}
.card.first .plate{border-color:#d9b48a;color:#d9b48a}
.big{font-size:120px;font-weight:700;line-height:1;margin:20px 0 4px}
.card.first .big{color:#d9b48a}
.ct{font-size:40px;font-weight:700;margin-top:6px}
.cd{font-size:27px;font-style:italic;color:var(--faint);line-height:1.5;margin-top:12px;max-width:560px}
.card.first .cd{color:rgba(240,230,207,.75)}
.foot{display:flex;justify-content:space-between;font-size:25px;color:var(--faint);padding-top:34px}
.foot b{color:var(--ox)}
</style></head><body><div class="stage"><div class="sheet">
  <div class="no te">AMENDMENT TO THE SPECIFICATION · ART. VI-a &amp; VII · IN FORCE NOW</div>
  <div class="h">333 plates. <b>Then never again.</b></div>
  <div class="cols">
    <div class="card first">
      <div class="plate te">FIRST SERIES · PATENT PLATE</div>
      <div class="big">+0.2×</div>
      <div class="ct">Machines No. 1 – 333</div>
      <div class="cd">A permanent print-weight bonus, stamped forever into the first 333 machines ever wound. It cannot be bought later — at any price. Only wound early.</div>
      <div class="cd" style="margin-top:auto;font-style:normal;font-family:'Special Elite',monospace;font-size:22px;letter-spacing:.14em;color:#d9b48a">STAMPED AT THE WIND · IRREVOCABLE</div>
    </div>
    <div class="card">
      <div class="plate te">★ THE GOLDEN TAPE · REWEIGHTED</div>
      <div class="big" style="color:var(--ox)">2.2×</div>
      <div class="ct">Odds now follow the gauge</div>
      <div class="cd">The 10% bonus draw on every print is no longer flat — it scales with print weight. A fully overwound First Series machine is drawn <b style="color:var(--ink);font-style:normal">more than twice as often</b> as a fresh one.</div>
      <div class="cd" style="font-style:normal;font-family:'Special Elite',monospace;font-size:22px;letter-spacing:.08em;color:var(--ox);margin-top:22px">OVERWIND = BASE SHARE ↑ + LOTTERY ODDS ↑</div>
    </div>
  </div>
  <div class="foot te"><span>◆ WIND EARLY. OVERWIND OFTEN. THE PLATES RUN OUT AT No. 333.</span><span><b>$TAPE LIVE · tickersonrh.xyz</b></span></div>
</div></div></body></html>`;

fs.writeFileSync(path.join(OUT, 'tickers-firstseries.html'), html);
console.log('wrote tickers-firstseries');
