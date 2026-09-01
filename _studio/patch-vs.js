'use strict';
const fs = require('fs');
let s = fs.readFileSync(__dirname + '/vs.js', 'utf8');
const NL = '\n';
const rows = [
  "    ${row('The burn', 'once, at hardwire', 'once, at mint', 'never stops — overwind to 2.0×', true)}",
  "    ${row('First Series plate', '—', '—', 'No. 1–333: +0.2× forever', false)}",
  "    ${row('Lottery moment', '—', '—', '★ Golden Tape · every print · gauge-weighted', true)}",
  "    ${row('Jackpot cadence', '—', '—', '◆◆ Double Print: 2× pot + 20% ★ each revolution', true)}",
  "    ${row('Print frequency', '—', 'every 0.1 SOL', '2× as often · every 0.05 ETH', false)}",
  "    ${row('Wheel buys the coin back', '—', '—', 'stop 12 = $TAPE buyback & burn', false)}",
  '    ${row(\'The machine\', \'1968 terminal\', \'an OTC desk\', "1871 — Edison\'s original", false)}',
].join(NL);
const start = s.indexOf("    ${row('The burn'");
const end = s.indexOf('</div>', s.indexOf("Edison's original"));
if (start < 0 || end < 0) { console.error('anchors not found'); process.exit(1); }
const tail = s.slice(end);
const endOfRows = s.lastIndexOf('}', end) + 1;
s = s.slice(0, start) + rows + NL + '  ' + s.slice(endOfRows + 1);
s = s.replace('They proved it. <b>We improved it.</b>', 'They proved it. <b>We out-built it.</b>');
fs.writeFileSync(__dirname + '/vs.js', s);
console.log('patched');
