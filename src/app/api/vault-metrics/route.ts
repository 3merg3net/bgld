import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim() as `0x${string}`;
const RPC     = (process.env.NEXT_PUBLIC_BASE_RPC || '').trim();

const ABI_NEXTID = [
  { type: 'function', name: 'nextId',      stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;
const ABI_TVL = [
  { type: 'function', name: 'bgldBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

export async function GET() {
  if (!STAKING || !RPC) {
    return NextResponse.json({ ok: false, error: 'Missing STAKING or RPC' }, { status: 400 });
  }
  try {
    const client = createPublicClient({ transport: http(RPC, { timeout: 10_000 }) });

    const [nid, tvlWei] = await Promise.all([
      client.readContract({ address: STAKING, abi: ABI_NEXTID, functionName: 'nextId' }) as Promise<bigint>,
      client.readContract({ address: STAKING, abi: ABI_TVL,   functionName: 'bgldBalance' }) as Promise<bigint>,
    ]);

    const totalStakes = nid > BigInt(0) ? nid - BigInt(1) : BigInt(0);

    return NextResponse.json({
      ok: true,
      partial: true, // only minimal data here by design
      decimals: 18,
      totalStakes: totalStakes.toString(),
      tvlBgld: tvlWei.toString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'rpc read failed', message: e?.message || String(e) }, { status: 502 });
  }
}
