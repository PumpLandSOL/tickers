'use strict';
// tickers-vs.png — head-to-head vs QUOTRONS ($15M ATH) and OTC Desks ($5M ATH).
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Special+Elite&display=swap" rel="stylesheet">`;

const row = (label, q, o, t, big) => `<div style="display:grid;grid-template-columns:1.9fr 1fr 1fr 1.25fr;align-items:stretch;border-top:1px solid rgba(58,44,28,.45)">
  <div style="font-size:${big ? 31 : 28}px;padding:27px 30px;font-weight:${big ? 700 : 400};display:flex;align-items:center">${label}</div>
  <div style="font-size:26px;color:#6b5a41;padding:27px 18px;text-align:center;border-left:1px solid rgba(58,44,28,.35);display:flex;align-items:center;justify-content:center">${q}</div>
  <div style="font-size:26px;color:#6b5a41;padding:27px 18px;text-align:center;border-left:1px solid rgba(58,44,28,.35);display:flex;align-items:center;justify-content:center">${o}</div>
  <div style="font-size:26px;color:#f0e6cf;font-weight:700;padding:27px 18px;text-align:center;background:#2b2014;display:flex;align-items:center;justify-content:center">${t}</div></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
:root{--parch:#f0e6cf;--parch2:#e8dcc0;--ink:#2b2014;--faint:#6b5a41;--ox:#6e2b1e;--line:#3a2c1c}
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:'Old Standard TT',serif;color:var(--ink);background:var(--parch)}
.stage{position:relative;width:2400px;height:1350px;overflow:hidden;background:var(--parch)}
.ruled{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(58,44,28,.06) 28px)}
.te{font-family:'Special Elite',monospace}
.sheet{position:absolute;inset:56px;background:var(--parch2);border:3px solid var(--line);box-shadow:10px 10px 0 rgba(43,32,20,.18);padding:64px 96px;display:flex;flex-direction:column}
.no{font-size:22px;letter-spacing:.3em;color:var(--faint)}
.h{font-size:88px;font-weight:700;letter-spacing:.06em;margin:10px 0 30px}
.h b{color:var(--ox)}
.tbl{border:2px solid var(--line);background:var(--parch)}
.hd{display:grid;grid-template-columns:1.9fr 1fr 1fr 1.25fr}
.hd .c{padding:20px 30px;font-weight:700;font-size:30px}
.hd .anc{text-align:center;color:var(--faint);border-left:1px solid rgba(58,44,28,.35);font-size:28px}
.hd .us{text-align:center;background:var(--ink);color:var(--parch);font-size:30px}
.ath{display:block;font-family:'Special Elite',monospace;font-size:19px;font-weight:400;color:var(--ox);margin-top:3px;letter-spacing:.06em}
.hd .us .ath{color:#d9b48a}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-size:25px;color:var(--faint);padding-top:26px}
</style></head><body><div class="stage"><div class="ruled"></div><div class="sheet">
  <div class="no te">THE LINEAGE, EXAMINED · SAME ENGINE, OLDER MACHINE, SHARPER WORKS</div>
  <div class="h" style="margin-bottom:40px">They proved it. <b>We improved it.</b></div>
  <div class="tbl">
    <div class="hd">
      <div class="c">&nbsp;</div>
      <div class="c anc">QUOTRONS<span class="ath">$15M ATH</span></div>
      <div class="c anc">OTC DESKS<span class="ath">$5M ATH</span></div>
      <div class="c us">TICKERS<span class="ath">LIVE NOW</span></div>
    </div>
    ${row('The burn', 'once, at hardwire', 'once, at mint', 'never stops — overwind forever ', true)}
    ${row('Yield boost for conviction', '—', '—', 'Gauge: up to 2.0× print weight', false)}
    ${row('Max $TAPE dead per machine', 'fixed', '100k – 1M', '1,300,000 fully wound', false)}
    ${row('Print frequency', '—', 'every 0.1 SOL', '2× as often · every 0.05 ETH', false)}
    ${row('Lottery moment', '—', '—', '★ Golden Tape · 10% draw every print', true)}
    ${row('Wheel buys the coin back', '—', '—', 'stop 12 = $TAPE buyback & burn', false)}
    ${row('The machine', '1968 terminal', 'an OTC desk', "1871 — Edison's original", false)}
  </div>
  <div class="foot te"><span>◆ NOT AFFILIATED · ATH FIGURES PER EACH PROJECT · LINEAGE HONORED, WORKS OUR OWN</span><span style="color:var(--ox);font-weight:700">$TAPE LIVE · CA 0x966EAdb63A937C29D9A5FA442aFa292b5502ba92</span></div>
</div></div></body></html>`;

fs.writeFileSync(path.join(OUT, 'tickers-vs.html'), html);
console.log('wrote tickers-vs');
