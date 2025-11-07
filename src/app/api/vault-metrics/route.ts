// src/app/api/vault-metrics/route.ts
import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BGLD = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || '').trim() as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim() as `0x${string}`;
const RPC = (process.env.NEXT_PUBLIC_BASE_RPC || '').trim();

const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { type: 'function', name: 'nextId', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

export async function GET() {
  if (!BGLD || !STAKING) {
    return NextResponse.json({ ok: false, error: 'Missing NEXT_PUBLIC_BGLD_ADDRESS or NEXT_PUBLIC_STAKING_ADDRESS' }, { status: 400 });
  }

  try {
    const client = createPublicClient({
      chain: base,
      transport: http(RPC || 'https://base.meowrpc.com', { timeout: 10_000 }),
    });

    const [decimalsRaw, tvlBgldRaw, nextIdRaw] = await Promise.all([
      client.readContract({ address: BGLD, abi: ERC20_ABI, functionName: 'decimals' }),
      client.readContract({ address: BGLD, abi: ERC20_ABI, functionName: 'balanceOf', args: [STAKING] }),
      client.readContract({ address: STAKING, abi: STAKING_ABI, functionName: 'nextId' }),
    ]);

    const decimals = typeof decimalsRaw === 'number' ? decimalsRaw : Number(decimalsRaw);
    const tvlBgld = (tvlBgldRaw as bigint).toString();
    const nextId = typeof nextIdRaw === 'bigint' ? Number(nextIdRaw) : Number(nextIdRaw);
    const totalStakes = Math.max(0, nextId - 1); // all-time positions created

    return NextResponse.json({
      ok: true,
      decimals,
      tvlBgld,        // string in token smallest units
      totalStakes,    // number
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
