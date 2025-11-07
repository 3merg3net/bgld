// src/app/api/vault-withdrawals/route.ts
import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase() as `0x${string}`;
const BGLD    = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim().toLowerCase() as `0x${string}`;
const RPC     = (process.env.NEXT_PUBLIC_BASE_RPC || '').trim();
const ETHERSCAN_KEY = (process.env.ETHERSCAN_API_KEY || '').trim();
const DEPLOY_BLOCK  = process.env.STAKING_DEPLOY_BLOCK ? Number(process.env.STAKING_DEPLOY_BLOCK) : 0;

// Tunables
const ES_V2 = 'https://api.etherscan.io/v2/api';
const BASE_CHAINID = '8453';
const PAGE_SIZE = Number(process.env.WD_PAGE_SIZE || 100);
const TIME_BUDGET_MS = Number(process.env.WD_TIME_BUDGET_MS || 3500);

// Minimal ABIs
const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;
const STAKING_ABI = [
  { type: 'function', name: 'feeSink', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }
] as const;

export async function GET() {
  if (!STAKING || !BGLD) {
    return NextResponse.json({ ok:false, error:'Missing NEXT_PUBLIC_STAKING_ADDRESS or NEXT_PUBLIC_BGLD_ADDRESS' }, { status:400 });
  }
  if (!ETHERSCAN_KEY) {
    return NextResponse.json({
      ok:true, partial:true, decimals:18,
      withdrawalsToUsers:'0', totalOut:'0', totalToFeeSink:'0',
      note:'Set ETHERSCAN_API_KEY'
    });
  }

  try {
    // Read token decimals + optional feeSink via RPC (precise)
    let decimals = 18;
    let feeSink: string | null = null;
    if (RPC) {
      const client = createPublicClient({ transport: http(RPC, { timeout: 10_000 }) });
      try { decimals = Number(await client.readContract({ address: BGLD, abi: ERC20_ABI, functionName: 'decimals' })) || 18; } catch {}
      try { feeSink  = (await client.readContract({ address: STAKING, abi: STAKING_ABI, functionName: 'feeSink' }) as `0x${string}`)?.toLowerCase?.() || null; } catch {}
    }

    const t0 = Date.now();
    let page = 1;
    let totalOut = 0n;
    let toFeeSink = 0n;
    let count = 0;
    let partial = false;

    while (true) {
      const url = new URL(ES_V2);
      url.searchParams.set('module', 'account');
      url.searchParams.set('action', 'tokentx');
      url.searchParams.set('chainid', BASE_CHAINID);
      url.searchParams.set('address', STAKING);       // only staking acct activity
      url.searchParams.set('contractaddress', BGLD);  // only BGLD
      if (DEPLOY_BLOCK > 0) url.searchParams.set('startblock', String(DEPLOY_BLOCK));
      url.searchParams.set('endblock', '999999999');
      url.searchParams.set('page', String(page));
      url.searchParams.set('offset', String(PAGE_SIZE));
      url.searchParams.set('sort', 'asc');
      url.searchParams.set('apikey', ETHERSCAN_KEY);

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`etherscan v2 http ${res.status}`);
      const j = await res.json();

      if (j?.status === '0' && j?.message === 'No transactions found') break;
      if (!Array.isArray(j?.result)) throw new Error(j?.result || 'etherscan v2 format error');

      const rows: any[] = j.result;

      for (const tx of rows) {
        // Only confirmed, successful transfers OUT of staking
        if ((tx.from || '').toLowerCase() !== STAKING) continue;
        if (tx.txreceipt_status === '0' || tx.isError === '1') continue;

        // Sanity: ensure it's the same token (some APIs include extra rows)
        if ((tx.contractAddress || '').toLowerCase() !== BGLD) continue;

        // Etherscan returns "value" as decimal string in token's smallest unit (not wei, token units)
        const valStr = tx.value as string;
        if (!/^\d+$/.test(valStr)) continue;
        const value = BigInt(valStr);

        totalOut += value;
        count += 1;

        const to = (tx.to || '').toLowerCase();
        if (feeSink && to === feeSink) toFeeSink += value;
      }

      if (Date.now() - t0 > TIME_BUDGET_MS) { partial = true; break; }
      if (rows.length < PAGE_SIZE) break;
      page += 1;
    }

    const withdrawalsToUsers = totalOut - toFeeSink;

    return NextResponse.json({
      ok: true,
      partial,
      decimals,                             // <— return actual token decimals
      transfersCount: count,
      totalOut: totalOut.toString(),
      totalToFeeSink: toFeeSink.toString(),
      withdrawalsToUsers: withdrawalsToUsers.toString(),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok:true, partial:true, decimals:18,
      withdrawalsToUsers:'0', totalOut:'0', totalToFeeSink:'0',
      note: e?.message || String(e),
    });
  }
}
