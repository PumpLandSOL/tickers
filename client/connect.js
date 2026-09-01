// Wallet connect — Robinhood Chain (chainId 4663, ETH gas)
'use strict';
(function () {
  const CHAIN_HEX = '0x1237'; // 4663
  const CHAIN = {
    chainId: CHAIN_HEX, chainName: 'Robinhood Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  };
  const btn = document.getElementById('tbConnect');
  if (!btn) return;
  const short = (a) => a.slice(0, 5) + '…' + a.slice(-4);
  function setLive(addr) { btn.textContent = short(addr).toUpperCase(); btn.classList.add('live'); }

  async function ensureChain(eth) {
    try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] }); }
    catch (e) {
      if (e && e.code === 4902) { try { await eth.request({ method: 'wallet_addEthereumChain', params: [CHAIN] }); } catch (e2) {} }
    }
  }
  async function connect(eager) {
    const eth = window.ethereum;
    if (!eth) { if (!eager) alert('No EVM wallet found — install MetaMask or Rabby to connect.'); return; }
    try {
      const acc = await eth.request({ method: eager ? 'eth_accounts' : 'eth_requestAccounts' });
      if (!acc || !acc.length) return;
      if (!eager) await ensureChain(eth);
      localStorage.tickersConnected = '1';
      setLive(acc[0]);
    } catch (e) {}
  }
  btn.addEventListener('click', () => { if (!btn.classList.contains('live')) connect(false); });
  if (window.ethereum && window.ethereum.on) window.ethereum.on('accountsChanged', (a) => { if (a && a.length) setLive(a[0]); });
  if (localStorage.tickersConnected === '1') connect(true);
})();
