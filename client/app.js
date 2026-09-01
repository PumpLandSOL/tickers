// The Exchange Floor — client for TICKERS ($TAPE)
'use strict';
const $ = (id) => document.getElementById(id);

function ago(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

// small seeded engraving of each machine, varied by serial
function machineSvg(serial) {
  const domes = ['M30 96 Q30 26 75 23 Q120 26 120 96', 'M32 96 Q26 30 75 20 Q124 30 118 96', 'M30 96 Q34 34 75 26 Q116 34 120 96'];
  const d = domes[serial % domes.length];
  const wheel = 6 + (serial % 4);
  return '<svg width="150" height="112" viewBox="0 0 150 112">' +
    '<g stroke="#2b2014" fill="none" stroke-width="1.6">' +
    '<path d="' + d + '"/>' +
    '<line x1="20" y1="96" x2="130" y2="96"/><rect x="18" y="96" width="114" height="8" fill="#e8dcc0"/><rect x="18" y="96" width="114" height="8"/>' +
    '<rect x="49" y="58" width="52" height="18" rx="2" fill="#e8dcc0"/><rect x="49" y="58" width="52" height="18" rx="2"/>' +
    '<circle cx="75" cy="50" r="' + wheel + '"/>' +
    '<path d="M101 65 L118 61 L118 69 L101 70 Z" fill="#e8dcc0"/><path d="M101 65 L118 61 L118 69 L101 70 Z"/>' +
    '<ellipse cx="75" cy="84" rx="18" ry="5"/>' +
    '</g>' +
    '<text x="75" y="110" text-anchor="middle" font-family="Special Elite" font-size="8" fill="#6b5a41">No. ' + serial + '</text></svg>';
}

let lastPayload = '';
async function refresh() {
  try {
    const s = await (await fetch('/api/state')).json();
    const g = await (await fetch('/api/tickers')).json();
    const payload = JSON.stringify([s.wound, s.burned, s.pot, s.potSpentTotal, s.rotationIdx, g.tickers]);
    if (payload === lastPayload) return;   // nothing changed — leave the DOM alone
    lastPayload = payload;
    $('wound').textContent = s.wound.toLocaleString() + ' / ' + s.cap.toLocaleString();
    $('remaining').textContent = s.remaining.toLocaleString() + ' remain unwound';
    $('burned').textContent = (s.burned / 1e6).toFixed(1) + 'M';
    $('burnedPct').textContent = s.burnedPct + '% of supply destroyed';
    $('pot').textContent = s.pot.toFixed(4);
    $('spent').textContent = s.potSpentTotal.toFixed(2);
    $('rounds').textContent = (s.rounds.length ? s.rounds[0].n : 0) + ' prints to date';
    if (s.live && s.mint) $('ca').textContent = '$TAPE CONTRACT — ' + s.mint;

    $('rot').innerHTML = s.rotation.map((r, i) =>
      '<span class="' + (i === s.rotationIdx ? 'next' : i < s.rotationIdx ? 'done' : '') + '">' + r.sym + '</span>').join('');

    if (s.rounds.length) {
      $('ledger').innerHTML = s.rounds.map((r) =>
        '<tr><td>' + r.n + '</td><td><b>' + r.sym + '</b> ' + r.name + '</td><td>' + r.sol.toFixed(4) +
        '</td><td>' + r.perTicker.toFixed(6) + '</td><td>' +
        (r.goldenSerial ? '<b>★ No. ' + r.goldenSerial + '</b> +' + r.golden.toFixed(4) : '—') +
        '</td><td>' + r.tickers + '</td><td>' + ago(r.at) + '</td></tr>').join('');
    }

    $('gallery').innerHTML = g.tickers.length ? g.tickers.slice().reverse().map((t) =>
      '<div class="machine">' + machineSvg(t.serial) +
      '<div class="serial">TICKER No. ' + t.serial + '</div>' +
      '<div class="traits">' + t.traits.wood + ' base · ' + t.traits.brass + '<br>' + t.traits.glass +
        (t.traits.quirk !== 'none' ? ' · ' + t.traits.quirk : '') + '</div>' +
      '<div class="gauge">' + (t.firstSeries ? '<span style="color:#6e2b1e">FIRST SERIES +0.2×</span> · ' : '') +
        'PRINTS AT ' + (t.weight || t.gauge).toFixed(1) + '×' +
        (t.goldenHits ? ' · ★ ' + t.goldenHits + ' golden' : '') + '</div>' +
      '<div class="vault">VAULT ≈ ' + t.vaultSol.toFixed(4) + ' ETH in stock</div>' +
      (t.gauge < (s.gaugeMax || 2)
        ? '<button class="ow" data-id="' + t.id + '">OVERWIND — BURN 100,000 $TAPE (+0.1×)</button>'
        : '<div class="gauge" style="color:#6e2b1e">FULLY WOUND · 2.0×</div>') +
      '</div>').join('')
      : '<div style="font-style:italic;color:#6b5a41">No machines wound yet. Be the first on the floor.</div>';

    document.querySelectorAll('.ow').forEach((b) => b.addEventListener('click', async () => {
      b.disabled = true;
      try {
        const r = await (await fetch('/api/overwind', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: b.dataset.id }),
        })).json();
        if (r.ok) { toast('OVERWOUND — No. ' + r.serial + ' NOW PRINTS AT ' + r.gauge.toFixed(1) + '×. 100,000 MORE $TAPE DESTROYED.'); lastPayload = ''; refresh(); }
        else toast((r.error || 'the overwind failed').toUpperCase());
      } catch (e) { toast('THE WIRE IS DOWN — TRY AGAIN'); }
    }));
  } catch (e) {}
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// when the treasury is armed, the 0.02 ETH surcharge is a real on-chain payment
let CFG = null;
async function config() { if (!CFG) CFG = await (await fetch('/api/config')).json(); return CFG; }

async function payTreasury(cfg) {
  const eth = window.ethereum;
  if (!eth) { toast('NO WALLET FOUND — INSTALL METAMASK OR RABBY'); return null; }
  const acc = await eth.request({ method: 'eth_requestAccounts' });
  if (!acc || !acc.length) { toast('CONNECT A WALLET TO WIND'); return null; }
  try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1237' }] }); } catch (e) {}
  const wei = '0x' + (BigInt(Math.round(cfg.windEth * 1e6)) * 10n ** 12n).toString(16);
  toast('CONFIRM THE 0.02 ETH SURCHARGE IN YOUR WALLET…');
  const hash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from: acc[0], to: cfg.treasury, value: wei }],
  });
  toast('PAID — WAITING FOR THE CHAIN TO CONFIRM…');
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const rc = await eth.request({ method: 'eth_getTransactionReceipt', params: [hash] }).catch(() => null);
    if (rc && rc.status === '0x1') return { from: acc[0], hash };
    if (rc && rc.status === '0x0') { toast('THE PAYMENT FAILED ON-CHAIN'); return null; }
  }
  toast('STILL CONFIRMING — TRY THE WIND AGAIN IN A MOMENT');
  return null;
}

$('windBtn').addEventListener('click', async () => {
  $('windBtn').disabled = true;
  try {
    const cfg = await config();
    let owner = $('owner').value || 'anonymous', tx;
    if (cfg.treasury) {
      const paid = await payTreasury(cfg);
      if (!paid) { $('windBtn').disabled = false; return; }
      owner = paid.from; tx = paid.hash;
    }
    const r = await (await fetch('/api/wind', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ owner, tx }),
    })).json();
    if (r.ok) { toast('WOUND — TICKER No. ' + r.ticker.serial + ' IS PRINTING. 300,000 $TAPE DESTROYED.'); lastPayload = ''; refresh(); }
    else toast((r.error || 'the wind failed').toUpperCase());
  } catch (e) { toast('THE WIRE IS DOWN — TRY AGAIN'); }
  $('windBtn').disabled = false;
});

refresh();
setInterval(refresh, 8000);
