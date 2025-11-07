// src/app/api/vault-rewards/route.ts
import { NextResponse } from 'next/server';
import { keccak256, stringToBytes } from 'viem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase();
const ETHERSCAN_KEY = (process.env.ETHERSCAN_API_KEY || '').trim();
const DEPLOY_BLOCK  = process.env.STAKING_DEPLOY_BLOCK ? BigInt(process.env.STAKING_DEPLOY_BLOCK) : BigInt(0);

const CHUNK = BigInt(process.env.REWARDS_BLOCK_CHUNK || '150000');
const LOOKBACK = BigInt(process.env.REWARDS_LOOKBACK_BLOCKS || '300000');
const TIME_BUDGET_MS = Number(process.env.REWARDS_TIME_BUDGET_MS || 3500);

// 🔁 V2 base + chainid
const ES_V2 = 'https://api.etherscan.io/v2/api';
const BASE_CHAINID = '8453';

const TOPIC_WITHDRAWN = keccak256(stringToBytes('Withdrawn(uint256,address,uint256,uint256,uint256)'));
const TOPIC_EMERGENCY = keccak256(stringToBytes('EmergencyExit(uint256,address,uint256,uint256,uint32)'));

function slot32(dataHex: string, idx: number) {
  const start = 2 + idx * 64;
  const end   = start + 64;
  if (!dataHex || dataHex.length < end) return BigInt(0);
  return BigInt('0x' + dataHex.slice(start, end));
}

async function getLatestBlock(): Promise<bigint> {
  const u = new URL(ES_V2);
  u.searchParams.set('module', 'proxy');
  u.searchParams.set('action', 'eth_blockNumber');
  u.searchParams.set('chainid', BASE_CHAINID);
  if (ETHERSCAN_KEY) u.searchParams.set('apikey', ETHERSCAN_KEY);
  const r = await fetch(u.toString(), { cache: 'no-store' });
  const j = await r.json();
  if (!j?.result) throw new Error('etherscan v2 latest missing result');
  return BigInt(j.result); // hex
}

async function getLogs(from: bigint, to: bigint, topic0: `0x${string}`) {
  const u = new URL(ES_V2);
  u.searchParams.set('module', 'logs');
  u.searchParams.set('action', 'getLogs');
  u.searchParams.set('chainid', BASE_CHAINID);         // V2 param
  u.searchParams.set('address', STAKING);
  u.searchParams.set('fromBlock', from.toString());    // decimal in V2
  u.searchParams.set('toBlock', to.toString());
  u.searchParams.set('topic0', topic0);
  if (ETHERSCAN_KEY) u.searchParams.set('apikey', ETHERSCAN_KEY);
  const r = await fetch(u.toString(), { cache: 'no-store' });
  const j = await r.json();
  if (j?.status === '0' && j?.message !== 'No records found') {
    throw new Error(j?.result || 'etherscan v2 logs error');
  }
  return Array.isArray(j?.result) ? j.result : [];
}

export async function GET() {
  if (!STAKING) return NextResponse.json({ ok:false, error:'Missing NEXT_PUBLIC_STAKING_ADDRESS' }, { status:400 });
  if (!ETHERSCAN_KEY) {
    return NextResponse.json({ ok:true, partial:true, decimals:18, rewardsPaid:'0', closedCount:'0', note:'Set ETHERSCAN_API_KEY' });
  }

  try {
    const latest = await getLatestBlock();

    let from = DEPLOY_BLOCK > BigInt(0) ? DEPLOY_BLOCK : (latest > LOOKBACK ? latest - LOOKBACK : BigInt(0));

    const t0 = Date.now();
    let rewards = BigInt(0);
    let closed  = 0;
    let processedTo = from;
    let partial = false;

    while (processedTo <= latest) {
      const end = processedTo + CHUNK > latest ? latest : processedTo + CHUNK;

      const [w, e] = await Promise.all([
        getLogs(processedTo, end, TOPIC_WITHDRAWN),
        getLogs(processedTo, end, TOPIC_EMERGENCY),
      ]);

      for (const l of w) rewards += slot32(l.data as string, 1); // Withdrawn.rewards
      for (const l of e) rewards += slot32(l.data as string, 1); // EmergencyExit.rewardsPaid
      closed += w.length + e.length;

      if (Date.now() - t0 > TIME_BUDGET_MS) { partial = true; processedTo = end; break; }
      processedTo = end + BigInt(1);
    }

    return NextResponse.json({
      ok: true,
      partial,
      decimals: 18,
      rewardsPaid: rewards.toString(),
      closedCount: String(closed),
    });
  } catch (e: any) {
    return NextResponse.json({ ok:true, partial:true, decimals:18, rewardsPaid:'0', closedCount:'0', note: e?.message || String(e) });
  }
}
