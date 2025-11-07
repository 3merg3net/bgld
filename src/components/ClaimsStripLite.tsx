'use client';

import { useEffect, useMemo, useState } from 'react';

type DexData = { priceUsd?: number };
type MetricsData = { ok?: boolean; decimals?: number; tvlBgld?: string; totalStakes?: number | string };
type WithdrawalsData = { ok?: boolean; decimals?: number; withdrawalsToUsers?: string; partial?: boolean };

function money(n?: number | null, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function num(n?: number | null, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(6);
}
function fromUnitsStr(amount: string | undefined, decimals: number): number | null {
  if (!amount) return null;
  try {
    const raw = BigInt(amount);
    const base = BigInt(10) ** BigInt(decimals);
    const whole = Number(raw / base);
    const frac = Number(raw % base) / Number(base);
    const out = whole + frac;
    return Number.isFinite(out) ? out : null;
  } catch {
    return null;
  }
}

export default function ClaimsStripLite({ className = '' }: { className?: string }) {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [tvlBgld, setTvlBgld] = useState<number | null>(null);
  const [totalStakes, setTotalStakes] = useState<number | null>(null);
  const [rewardsBgld, setRewardsBgld] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;

    const loadDex = async () => {
      try {
        const r = await fetch('/api/bgld-dex', { cache: 'no-store' });
        if (!r.ok) return;
        const j = (await r.json()) as DexData;
        if (!stopped && Number.isFinite(j?.priceUsd)) setPriceUsd(j.priceUsd!);
      } catch {/* keep last */}
    };

    const loadMetrics = async () => {
      try {
        const r = await fetch('/api/vault-metrics', { cache: 'no-store' });
        if (!r.ok) return;
        const j = (await r.json()) as MetricsData;
        if (!stopped && j?.ok) {
          const dec = Number(j.decimals ?? 18) || 18;
          const tvl = fromUnitsStr(j.tvlBgld, dec);
          if (tvl != null) setTvlBgld(tvl);
          if (j.totalStakes != null) setTotalStakes(Number(j.totalStakes));
        }
      } catch {/* keep last */}
    };

    const loadWithdrawals = async () => {
      try {
        const r = await fetch('/api/vault-withdrawals', { cache: 'no-store' });
        if (!r.ok) return;
        const j = (await r.json()) as WithdrawalsData;
        const raw = j?.withdrawalsToUsers;
        if (!stopped && raw && /^\d+$/.test(raw)) {
          const dec = Number(j.decimals ?? 18) || 18;
          const n = fromUnitsStr(raw, dec);
          // only set if we parsed a finite number; do NOT clear previous good value on failure
          if (n != null && Number.isFinite(n)) setRewardsBgld(prev => (n > 0 ? n : prev));
        }
      } catch {/* keep last */}
    };

    // Fire them independently
    loadDex(); loadMetrics(); loadWithdrawals();
    const id = setInterval(() => { loadDex(); loadMetrics(); loadWithdrawals(); }, 60_000);

    return () => { stopped = true; clearInterval(id); };
  }, []);

  const tvlUsd = useMemo(
    () => (tvlBgld != null && priceUsd != null ? tvlBgld * priceUsd : null),
    [tvlBgld, priceUsd]
  );
  const rewardsUsd = useMemo(
    () => (rewardsBgld != null && priceUsd != null ? rewardsBgld * priceUsd : null),
    [rewardsBgld, priceUsd]
  );

  const Card = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 text-lg sm:text-xl font-semibold tabular-nums flex flex-wrap items-baseline gap-x-2">
        <span>{value}</span>
        {sub ? <span className="text-amber-200/90 font-semibold">• {sub}</span> : null}
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      <Card
        label="Total Staked Vaults"
        value={totalStakes != null ? totalStakes.toLocaleString() : '—'}
      />
      <Card
        label="Vaults TVL"
        value={tvlBgld != null ? `${num(tvlBgld, 2)} BGLD` : '—'}
        sub={tvlUsd != null ? money(tvlUsd, tvlUsd >= 1 ? 0 : 2) : undefined}
      />
      <Card
        label="Pending Rewards"
        value={rewardsBgld != null ? `${num(rewardsBgld, 2)} BGLD` : '—'}
        sub={rewardsUsd != null ? money(rewardsUsd, rewardsUsd >= 1 ? 0 : 2) : undefined}
      />
    </div>
  );
}
