'use client';

import { useEffect, useMemo, useState } from 'react';

/** ---------- Types for existing API routes ---------- */
type DexData = {
  priceUsd?: number;
};

type MetricsData = {
  ok?: boolean;
  decimals?: number;
  tvlBgld?: string;            // integer string in token smallest units
  totalStakes?: number | string;
};

/** Optional: present only if you add /api/vault-withdrawals */
type WithdrawalsData = {
  ok?: boolean;
  decimals?: number;
  withdrawalsToUsers?: string; // integer string in token smallest units
  partial?: boolean;
};

/** ---------- Small helpers ---------- */
function money(n?: number | null, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}

function num(n?: number | null, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(6);
}

/** Convert integer token-unit string → JS number (for display) */
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

/** ---------- UI ---------- */
export default function ClaimsStripLite({ className = '' }: { className?: string }) {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [tvlBgld, setTvlBgld] = useState<number | null>(null);
  const [totalStakes, setTotalStakes] = useState<number | null>(null);
  const [rewardsBgld, setRewardsBgld] = useState<number | null>(null); // optional

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [dexRes, metRes] = await Promise.all([
          fetch('/api/bgld-dex', { cache: 'no-store' }),
          fetch('/api/vault-metrics', { cache: 'no-store' }),
        ]);

        // Dex
        if (dexRes.ok) {
          const dexJson = (await dexRes.json()) as DexData;
          if (Number.isFinite(dexJson?.priceUsd ?? NaN)) {
            setPriceUsd(dexJson.priceUsd as number);
          }
        }

        // Metrics (TVL + Total Stakes)
        if (metRes.ok) {
          const metJson = (await metRes.json()) as MetricsData;
          if (metJson?.ok) {
            const dec = Number(metJson.decimals ?? 18) || 18;
            setTvlBgld(fromUnitsStr(metJson.tvlBgld, dec));
            setTotalStakes(
              metJson.totalStakes != null ? Number(metJson.totalStakes) : null
            );
          }
        }

        // OPTIONAL: Rewards via withdrawals endpoint (ignore if missing)
       // Rewards Paid (uses /api/vault-withdrawals if present)
try {
  const wdRes = await fetch('/api/vault-withdrawals', { cache: 'no-store' });
  if (wdRes.ok) {
    const wdJson = await wdRes.json() as WithdrawalsData;
    console.log('Vault withdrawals JSON:', wdJson);

    // Check for numeric string value
    const raw = wdJson?.withdrawalsToUsers;
    if (raw && /^\d+$/.test(raw)) {
      const dec = Number(wdJson.decimals ?? 18) || 18;
      const parsed = fromUnitsStr(raw, dec);
      if (parsed && parsed > 0) {
        setRewardsBgld(parsed);
      }
    }
  } else {
    console.warn('Withdrawals route not OK:', wdRes.status);
  }
} catch (e) {
  console.warn('Withdrawals route failed:', e);
}

      } catch {
        // swallow — keep last known values
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
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
        label="Total Vaults"
        value={totalStakes != null ? totalStakes.toLocaleString() : '—'}
      />

      <Card
        label="TVL"
        value={tvlBgld != null ? `${num(tvlBgld, 2)} BGLD` : '—'}
        sub={tvlUsd != null ? money(tvlUsd, tvlUsd >= 1 ? 0 : 2) : undefined}
      />

      <Card
  label="Rewards Paid"
  value={
    rewardsBgld != null
      ? `${num(rewardsBgld, 2)} BGLD`
      : '—'
  }
  sub={
    rewardsBgld != null && priceUsd != null
      ? money(rewardsBgld * priceUsd, (rewardsBgld * priceUsd) >= 1 ? 0 : 2)
      : undefined
  }
      />
    </div>
  );
}
