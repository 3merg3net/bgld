'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';

// ---------- ENV ----------
const BGLD = (process.env.NEXT_PUBLIC_BGLD_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '').trim().toLowerCase();
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || '').trim().toLowerCase(); // optional, for TVL


// Minimal chain (we only need rpc url; viem will still work for read)
const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org';
const client = createPublicClient({ transport: http(baseRpc) });

// ---------- ABIs (views only) ----------
const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

const STAKING_ABI = [
  { type: 'function', name: 'bgldBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

// ---------- Helpers ----------
function money(n?: number | null, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function fmtToken(v?: bigint, decimals = 18, digits = 0) {
  if (v == null) return '—';
  const n = Number(formatUnits(v, decimals));
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

// ---------- Component ----------
export default function StatusStrip({ className = '' }: { className?: string }) {
  const [decimals, setDecimals] = useState<number>(18);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [tvlBgld, setTvlBgld] = useState<bigint | null>(null);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);

  // price from your existing /api/bgld-dex
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/bgld-dex', { cache: 'no-store' });
        const j = await r.json();
        if (!cancelled) setPriceUsd(j?.priceUsd ?? null);
      } catch {
        if (!cancelled) setPriceUsd(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // on-chain reads via viem (no wagmi)
  useEffect(() => {
    let cancelled = false;
    if (!BGLD) return;

    (async () => {
      try {
        const [dec, supply] = await Promise.all([
          client.readContract({ address: BGLD as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' }),
          client.readContract({ address: BGLD as `0x${string}`, abi: ERC20_ABI, functionName: 'totalSupply' }),
        ]);
        if (!cancelled) {
          setDecimals(Number(dec as number));
          setTotalSupply(supply as bigint);
        }
      } catch {
        if (!cancelled) {
          setDecimals(18);
          setTotalSupply(null);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // staking TVL (optional; only if env set)
  useEffect(() => {
    let cancelled = false;
    if (!STAKING) return;

    (async () => {
      try {
        const tvl = await client.readContract({
          address: STAKING as `0x${string}`,
          abi: STAKING_ABI,
          functionName: 'bgldBalance',
        });
        if (!cancelled) setTvlBgld(tvl as bigint);
      } catch {
        if (!cancelled) setTvlBgld(null);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const tvlUsd = useMemo(() => {
    if (!priceUsd || tvlBgld == null) return null;
    const tvl = Number(formatUnits(tvlBgld, decimals));
    return tvl * priceUsd;
  }, [tvlBgld, decimals, priceUsd]);

  const mcapUsd = useMemo(() => {
    if (!priceUsd || totalSupply == null) return null;
    const supply = Number(formatUnits(totalSupply, decimals));
    return supply * priceUsd;
  }, [totalSupply, decimals, priceUsd]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-white/60">TVL - Total Gold Staked in Vaults</div>
        <div className="mt-0.5 text-xl font-semibold text-amber-200 tabular-nums">
          {tvlBgld != null ? `${fmtToken(tvlBgld, decimals, 2)} BGLD` : '—'}
        </div>
        <div className="text-xs text-white/50 mt-0.5">
          {tvlUsd != null ? `${money(tvlUsd, tvlUsd >= 1 ? 0 : 2)} approx` : '—'}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-white/60">Market Cap</div>
        <div className="mt-0.5 text-xl font-semibold text-amber-200 tabular-nums">
          {mcapUsd != null ? money(mcapUsd, mcapUsd >= 1 ? 0 : 2) : '—'}
        </div>
        <div className="text-xs text-white/50 mt-0.5">Supply × Price</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-white/60">Supply</div>
        <div className="mt-0.5 text-xl font-semibold text-amber-200 tabular-nums">
          {totalSupply != null ? `${fmtToken(totalSupply, decimals, 0)} BGLD` : '—'}
        </div>
        <div className="text-xs text-white/50 mt-0.5">Token totalSupply()</div>
      </div>
    </div>
  );
}
