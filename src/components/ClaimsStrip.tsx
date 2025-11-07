'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';

function money(n?: number | null, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}
function num(n?: number | null, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return Number(n).toPrecision(6);
}
function fromUnitsStr(amount?: string | null, decimals = 18): number | null {
  if (!amount) return null;
  try {
    const s = formatUnits(BigInt(amount), decimals);
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

const LS_KEY = 'bgld_rewards_last_nonzero';

export default function ClaimsStrip({ className = '' }: { className?: string }) {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [tvlBgld, setTvlBgld] = useState<number | null>(null);
  const [totalStakes, setTotalStakes] = useState<number | null>(null);

  // Rewards (live) + sticky (last good > 0), persisted in localStorage
  const [rewardsBgld, setRewardsBgld] = useState<number | null>(null);
  const [sticky, setSticky] = useState<number | null>(null);

  // Load sticky from localStorage once
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const n = parseFloat(saved);
        if (Number.isFinite(n) && n > 0) {
          setSticky(n);
          setRewardsBgld(n);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        const [dex, metrics, rewards, withdrawals] = await Promise.all([
          fetch('/api/bgld-dex', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/api/vault-metrics', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/api/vault-rewards', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
          fetch('/api/vault-withdrawals', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        ]);
        if (cancel) return;

        // Price
        if (dex?.priceUsd != null && Number.isFinite(dex.priceUsd)) {
          setPriceUsd(dex.priceUsd);
        }

        // TVL + Total Stakes
        if (metrics?.ok) {
          const mDec = Number(metrics.decimals ?? 18) || 18;
          setTvlBgld(fromUnitsStr(metrics.tvlBgld, mDec));
          setTotalStakes(metrics.totalStakes != null ? Number(metrics.totalStakes) : null);
        }

        // Rewards candidates
        const exact = rewards?.ok ? fromUnitsStr(rewards.rewardsPaid, 18) : null;
        const wdDec = Number(withdrawals?.decimals ?? 18) || 18;
        const wd    = withdrawals?.ok ? fromUnitsStr(withdrawals.withdrawalsToUsers, wdDec) : null;

        // Choose best: prefer exact > 0, else withdrawals > 0, else null (unknown)
        const candidate =
          (exact != null && exact > 0) ? exact :
          (wd    != null && wd    > 0) ? wd    :
          null;

        // Update logic:
        // - If we got a positive candidate, adopt it and persist.
        // - If candidate is null/0 and we have a prior sticky > 0, keep sticky.
        // - If no sticky yet, fall back to 0 (so UI can show "pending").
        if (candidate != null && candidate > 0) {
          setRewardsBgld(candidate);
          setSticky(candidate);
          try { localStorage.setItem(LS_KEY, String(candidate)); } catch {}
        } else if (sticky != null && sticky > 0) {
          setRewardsBgld(sticky);
        } else {
          setRewardsBgld(0);
        }
      } catch {
        // On error, keep sticky if present
        if (sticky != null && sticky > 0) {
          setRewardsBgld(sticky);
        }
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => { cancel = true; clearInterval(id); };
  }, [sticky]);

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

  const rewardsIsPositive = (rewardsBgld ?? 0) > 0;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      <Card
        label="Staked BGLD Vaults"
        value={totalStakes != null ? totalStakes.toLocaleString() : '—'}
      />

      <Card
        label="Total Staked"
        value={tvlBgld != null ? `${num(tvlBgld, 2)} BGLD` : '—'}
        sub={tvlUsd != null ? money(tvlUsd, tvlUsd >= 1 ? 0 : 2) : undefined}
      />

      <Card
        label="Pending Rewards"
        value={rewardsIsPositive ? `${num(rewardsBgld, 2)} BGLD` : 'First claims pending'}
        sub={rewardsIsPositive && rewardsUsd != null ? money(rewardsUsd, rewardsUsd >= 1 ? 0 : 2) : undefined}
      />
    </div>
  );
}
