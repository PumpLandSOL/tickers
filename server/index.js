// TICKERS ($TAPE) — 3,333 Edison stock tickers under glass domes.
// Burn $TAPE to wind a ticker. Wound tickers print tape: creator fees fill the pot,
// and every time the pot clears the threshold it buys the next tokenized stock in
// the rotation, split equally across every wound ticker's vault.
// Mechanism family: QUOTRONS (Robinhood) → OTC Desks (Solana) → TICKERS.
// Dependency-free Node. State is simulated until TAPE_MINT is set (live:false).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8192;
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data.json');
const TAPE_MINT = process.env.TAPE_MINT || '';            // set at launch — lights the CA bar
const LIVE = !!TAPE_MINT;

// ── protocol constants ────────────────────────────────────────────────────────
const CAP = 3333;                    // total tickers ever
const SUPPLY = 1_000_000_000;        // $TAPE supply
const WIND_BURN = 300_000;           // $TAPE burned per wind (mint)
const WIND_ETH = 0.02;               // ETH surcharge per wind (Robinhood Chain)
const WIND_TO_POT = 0.9;             // share of surcharge → pot (0.018 ETH)
const FEE_TO_POT = 0.80;             // creator-fee share → pot (20% protocol)
const POT_TRIGGER = 0.05;            // ETH — pot spends ALL when it clears this
// the rotation: 12 tokenized equities (Robinhood Chain tokenized equities) + $TAPE itself closing the loop
const ROTATION = [
  { sym: 'NVDA', name: 'NVIDIA' }, { sym: 'AAPL', name: 'Apple' },
  { sym: 'TSLA', name: 'Tesla' }, { sym: 'SPY', name: 'S&P 500' },
  { sym: 'GME', name: 'GameStop' }, { sym: 'PLTR', name: 'Palantir' },
  { sym: 'MSTR', name: 'Strategy' }, { sym: 'HOOD', name: 'Robinhood' },
  { sym: 'COIN', name: 'Coinbase' }, { sym: 'NFLX', name: 'Netflix' },
  { sym: 'GLD', name: 'Gold' }, { sym: 'TAPE', name: 'TICKERS' },
];

// ── state ─────────────────────────────────────────────────────────────────────
let S = null;
function fresh() {
  return {
    burned: 0,                        // $TAPE destroyed by winding
    pot: 0,                           // ETH waiting to be spent
    potSpentTotal: 0,                 // ETH ever pushed through the rotation
    rotationIdx: 0,
    rounds: [],                       // { n, sym, sol, perTicker, at, tickers }
    tickers: [],                      // { id, serial, owner, woundAt, vault:{SYM:amt} }
    feesSeen: 0,
    startedAt: Date.now(),
  };
}
function load() {
  try { S = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch (e) { S = fresh(); }
}
let saveT = null;
function save() {
  if (saveT) return;
  saveT = setTimeout(() => {
    saveT = null;
    try { fs.writeFileSync(DATA_PATH, JSON.stringify(S)); } catch (e) {}
  }, 500);
}
load();

// ── engraving: deterministic per-serial machine traits ────────────────────────
function traits(serial) {
  const h = crypto.createHash('sha256').update('tickers:' + serial).digest();
  const woods = ['walnut', 'mahogany', 'oak', 'ebony', 'rosewood'];
  const brasses = ['polished brass', 'aged brass', 'gunmetal', 'nickel', 'gilt'];
  const glass = ['clear dome', 'smoked dome', 'beveled dome', 'leaded dome'];
  const quirks = ['double wheel', 'patent plate', 'telegraph key', 'ink-stained tape',
    'exchange seal', 'broken hour hand', 'operator initials', 'none'];
  return {
    wood: woods[h[0] % woods.length],
    brass: brasses[h[1] % brasses.length],
    glass: glass[h[2] % glass.length],
    quirk: quirks[h[3] % quirks.length],
  };
}

// ── the works: fees drip in, pot winds up, rotation fires ────────────────────
function dripFees() {
  // simulated creator-fee flow while pre-launch; replaced by the real
  // creator-fee collector once TAPE_MINT is live.
  if (LIVE) return;
  const drip = 0.0015 + Math.random() * 0.004;    // ETH per tick
  S.feesSeen += drip;
  S.pot += drip * FEE_TO_POT;
  spinIfWound();
  save();
}
function spinIfWound() {
  while (S.pot >= POT_TRIGGER && S.tickers.length > 0) {
    const spend = S.pot;
    S.pot = 0;
    S.potSpentTotal += spend;
    const stock = ROTATION[S.rotationIdx % ROTATION.length];
    S.rotationIdx++;
    const per = spend / S.tickers.length;
    for (const t of S.tickers) t.vault[stock.sym] = +((t.vault[stock.sym] || 0) + per).toFixed(9);
    S.rounds.unshift({
      n: S.rounds.length + 1, sym: stock.sym, name: stock.name,
      sol: +spend.toFixed(4), perTicker: +per.toFixed(6),
      tickers: S.tickers.length, at: Date.now(),
    });
    if (S.rounds.length > 200) S.rounds.length = 200;
  }
}
setInterval(dripFees, 15_000);

// ── http ──────────────────────────────────────────────────────────────────────
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch (e) { resolve({}); } });
  });
}
function state() {
  return {
    live: LIVE, mint: TAPE_MINT || null,
    cap: CAP, supply: SUPPLY, windBurn: WIND_BURN, windEth: WIND_ETH,
    potTrigger: POT_TRIGGER, feeToPot: FEE_TO_POT,
    wound: S.tickers.length, remaining: CAP - S.tickers.length,
    burned: S.burned, burnedPct: +((S.burned / SUPPLY) * 100).toFixed(3),
    pot: +S.pot.toFixed(5), potSpentTotal: +S.potSpentTotal.toFixed(4),
    nextStock: ROTATION[S.rotationIdx % ROTATION.length],
    rotation: ROTATION, rotationIdx: S.rotationIdx % ROTATION.length,
    rounds: S.rounds.slice(0, 30), feesSeen: +S.feesSeen.toFixed(4),
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/api/state') return json(res, 200, state());

  if (p === '/api/tickers') {
    const list = S.tickers.map((t) => ({
      id: t.id, serial: t.serial, owner: t.owner, woundAt: t.woundAt,
      traits: traits(t.serial),
      vaultSol: +Object.values(t.vault).reduce((a, b) => a + b, 0).toFixed(6),
    }));
    return json(res, 200, { tickers: list });
  }

  if (p.startsWith('/api/ticker/')) {
    const t = S.tickers.find((x) => x.id === p.split('/')[3]);
    if (!t) return json(res, 404, { error: 'no such ticker' });
    return json(res, 200, { ...t, traits: traits(t.serial) });
  }

  if (p === '/api/wind' && req.method === 'POST') {
    const body = await readBody(req);
    if (S.tickers.length >= CAP) return json(res, 400, { error: 'all 3,333 tickers are wound' });
    const owner = String(body.owner || 'anonymous').slice(0, 64);
    const serial = S.tickers.length + 1;
    const t = {
      id: crypto.randomBytes(6).toString('hex'),
      serial, owner, woundAt: Date.now(), vault: {},
    };
    // the burn happens inside the wind — the $TAPE is gone before the ticker exists
    S.burned += WIND_BURN;
    S.pot += WIND_ETH * WIND_TO_POT;
    S.tickers.push(t);
    spinIfWound();
    save();
    return json(res, 200, { ok: true, ticker: { ...t, traits: traits(serial) } });
  }

  // static
  let file = p === '/' ? 'landing.html' : p === '/app' ? 'index.html' : p === '/docs' ? 'docs.html' : p.slice(1);
  const fp = path.join(__dirname, '..', 'client', file);
  if (!fp.startsWith(path.join(__dirname, '..', 'client'))) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'text/plain' });
    res.end(data);
  });
});
server.listen(PORT, () => console.log(
  'TICKERS ($TAPE) on :' + PORT + ' — ' + CAP + ' machines, wind burns ' +
  WIND_BURN.toLocaleString() + ' $TAPE, pot trigger ' + POT_TRIGGER + ' ETH' +
  (LIVE ? ' [LIVE]' : ' [pre-launch]')));
