import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const RPC = (process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org').trim();
  const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim();

  try {
    const client = createPublicClient({ transport: http(RPC) });
    const chainId = await client.getChainId();
    const block = await client.getBlockNumber();

    return NextResponse.json({
      ok: true,
      rpc: RPC ? (RPC.includes('alchemy') || RPC.includes('infura') ? 'custom' : 'public') : 'missing',
      chainId,
      block: block.toString(),
      stakingSet: Boolean(STAKING),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: 'rpc failed',
      message: e?.shortMessage || e?.message || String(e),
      rpc: RPC.slice(0, 60) + (RPC.length > 60 ? '…' : ''),
    }, { status: 502 });
  }
}
