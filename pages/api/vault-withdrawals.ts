import type { NextApiRequest, NextApiResponse } from 'next';

type EtherscanTokenTx = {
  from: string;
  to: string;
  value: string;             // integer string in token's smallest unit
  contractAddress: string;
  txreceipt_status?: string; // '1' success, '0' fail
  isError?: string;          // '1' error, '0' ok
};

type EtherscanAccountTxResp = {
  status?: string;
  message?: string;
  result?: EtherscanTokenTx[];
};

const ES_V2 = 'https://api.etherscan.io/v2/api';
const BASE_CHAINID = '8453';

const PAGE_SIZE = 100;
const TIME_BUDGET_MS = 3500;

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase();
  const BGLD    = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase();
  const ETHERSCAN_KEY = (process.env.ETHERSCAN_API_KEY || '').trim();
  const DEPLOY_BLOCK  = process.env.STAKING_DEPLOY_BLOCK ? Number(process.env.STAKING_DEPLOY_BLOCK) : 0;

  if (!STAKING || !BGLD) {
    res.status(400).json({ ok: false, error: 'Missing NEXT_PUBLIC_STAKING_ADDRESS or NEXT_PUBLIC_BGLD_ADDRESS' });
    return;
  }
  if (!ETHERSCAN_KEY) {
    res.status(200).json({ ok: true, partial: true, decimals: 18, withdrawalsToUsers: '0', note: 'Set ETHERSCAN_API_KEY' });
    return;
  }

  const started = Date.now();
  let page = 1;
  let totalOut = BigInt(0);
  let transfersCount = 0;
  let partial = false;

  try {
    while (true) {
      const url = new URL(ES_V2);
      url.searchParams.set('module', 'account');
      url.searchParams.set('action', 'tokentx');
      url.searchParams.set('chainid', BASE_CHAINID);
      url.searchParams.set('address', STAKING);
      url.searchParams.set('contractaddress', BGLD);
      if (DEPLOY_BLOCK > 0) url.searchParams.set('startblock', String(DEPLOY_BLOCK));
      url.searchParams.set('endblock', '999999999');
      url.searchParams.set('page', String(page));
      url.searchParams.set('offset', String(PAGE_SIZE));
      url.searchParams.set('sort', 'asc');
      url.searchParams.set('apikey', ETHERSCAN_KEY);

      const resp = await fetch(url.toString(), { cache: 'no-store' });
      if (!resp.ok) throw new Error(`etherscan v2 http ${resp.status}`);
      const json = (await resp.json()) as EtherscanAccountTxResp;

      if (json.status === '0' && json.message === 'No transactions found') break;
      const rows: EtherscanTokenTx[] = Array.isArray(json.result) ? json.result : [];
      if (rows.length === 0) break;

      for (const tx of rows) {
        if ((tx.from || '').toLowerCase() !== STAKING) continue;
        if (tx.txreceipt_status === '0' || tx.isError === '1') continue;
        if ((tx.contractAddress || '').toLowerCase() !== BGLD) continue;
        const valStr = tx.value;
        if (!/^\d+$/.test(valStr)) continue;

        totalOut += BigInt(valStr);
        transfersCount += 1;
      }

      if (Date.now() - started > TIME_BUDGET_MS) { partial = true; break; }
      if (rows.length < PAGE_SIZE) break;
      page += 1;
    }

    res.status(200).json({
      ok: true,
      partial,
      decimals: 18,                // adjust if your token is not 18
      transfersCount,
      totalOut: totalOut.toString(),
      totalToFeeSink: '0',
      withdrawalsToUsers: totalOut.toString(),
    });
  } catch (e) {
    res.status(200).json({ ok: true, partial: true, decimals: 18, withdrawalsToUsers: '0', note: (e as Error).message });
  }
}
