/* eslint-disable @next/next/no-img-element */


'use client';

import { useEffect, useState } from 'react';
import MetricsStrip from '@/components/MetricsStrip';
import StatusStrip from '@/components/StatusStrip';
import GoldTicker from '@/components/GoldTicker';
import ClaimsStripLite from '@/components/ClaimsStripLite';

type VaultStats = {
  tvl?: number;
  activeVaults?: number;
  apr?: number;    // average or flagship APR
  stakers?: number;
};

const STAKE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://stake.basereserve.gold';

export default function Page() {
  // optional: live stats from the staking app
  const STATS_URL = process.env.NEXT_PUBLIC_STAKING_STATS_URL || '';

  const DEX = process.env.NEXT_PUBLIC_DEX_URL || '#';
  const BASESCAN = process.env.NEXT_PUBLIC_BASESCAN_URL || '#';
  const CONTRACT =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000';

  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [vault, setVault] = useState<VaultStats>({});

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!STATS_URL) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(STATS_URL, { cache: 'no-store' });
        const j = await r.json();
        if (cancelled) return;
        const tvl = Number(j?.tvl ?? NaN);
        const activeVaults = Number(j?.activeVaults ?? NaN);
        const apr = Number(j?.apr ?? NaN);
        const stakers = Number(j?.stakers ?? NaN);
        setVault({
          tvl: isNaN(tvl) ? undefined : tvl,
          activeVaults: isNaN(activeVaults) ? undefined : activeVaults,
          apr: isNaN(apr) ? undefined : apr,
          stakers: isNaN(stakers) ? undefined : stakers,
        });
      } catch { /* noop */ }
    };
    tick();
    const id = setInterval(tick, 45_000);
    return () => { clearInterval(id); cancelled = true; };
  }, [STATS_URL]);

  const money = (n?: number, digits = 0) =>
    n == null || !Number.isFinite(n)
      ? '—'
      : n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: digits });

  const pct = (n?: number) =>
    n == null || !Number.isFinite(n) ? '—' : (n < 1 ? n.toFixed(2) : n.toFixed(1)) + '%';

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
     
      

      {/* MAIN */}
      <main className="pt-[32px] text-white">
        {/* HERO */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-24 pb-10 text-center">
            <img
              src="/logos/bgld-seal-transparent.png"
              alt="Base Gold seal"
              className="mx-auto mb-6 h-64 w-64"
            />
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide">
              <span className="text-[#0AA0FF]">BASE</span>{' '}
              <span className="text-amber-300">GOLD</span>
            </h1>
            <p className="mt-3 text-lg md:text-xl text-white/90">
              The Digital Reserve of Base —{' '}
              <span className="text-amber-300">Staking Vaults are Live</span>.
            </p>
          </div>
          <GoldTicker />

          {/* Dexscreener-fed chips (shared component used in staking app) */}
          <div className="mx-auto max-w-6xl px-4 pb-6">
            <ClaimsStripLite className="mt-6" />
            <MetricsStrip />
          </div>

          {/* HERO CTAs */}
          <div className="mx-auto max-w-6xl px-4 pb-8 text-center">
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={STAKE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black shadow-lg hover:bg-amber-300"
              >
                Stake Now
              </a>
              <a
                href={DEX}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                Buy $BGLD
              </a>
              <a
                href={BASESCAN}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                View on BaseScan
              </a>
              <button
                onClick={copyAddress}
                className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 font-semibold text-amber-200 hover:bg-amber-400/15"
              >
                {copied ? 'Copied ✓' : 'Copy Contract'}
              </button>
            </div>
          </div>
        </section>

        {/* UTILITY */}
        <section id="utility" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-bold tracking-wide text-amber-300">
              Utility — Digital Staking Vault Reserve Model
            </h2>
            <p className="mt-3 text-center text-white/75 max-w-3xl mx-auto">
              A On-Chain Gold Reserve for Base: scarce supply, transparent ledgers,
              and culture-grade collateral—built for on-chain life.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Reserve Unit',
                  headline: '$BGLD',
                  body: 'Digital Gold Reserve token on Base.',
                },
                {
                  title: 'Vaults',
                  headline: 'Stake & Earn',
                  body: 'Flexible + time-locked positions earning Massive Rewards.',
                },
                {
                  title: 'Certificates',
                  headline: 'Reserve NFTs',
                  body: 'Engraved notes Coming Soon.',
                },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm uppercase tracking-widest text-white/60">
                    {c.title}
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-amber-300">
                    {c.headline}
                  </div>
                  <p className="mt-2 text-white/80 text-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STAKING VAULTS — LIVE */}
        <section id="vault" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-wide text-amber-300">
              Base Gold Staking Vaults — Earn Huge Rewards over 1000% APR
            </h2>

            {/* Matched copy tone from staking site */}
            <div className="mt-3 max-w-3xl text-white/85 space-y-3">
              <p>
                Stake <strong>$BGLD</strong> in On-Chain Gold vaults designed for Base. Choose{' '}
                <em>flexible time-locked</em> positions
                for boosted yields of over 1000% APR. Compounding Rewards manually or automatic is available for maximizing  gold stake; standard gas/fees apply.
              </p>
              <p>
                Each vault publishes its own parameters (APR, fees, lock length, early-exit
                penalties apply). Rewards and positions are visible in your Gold Vault wallet and
                on-chain at all times. No custodians—just you and the base gold vault.
              </p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>• Live vault list with per-vault APR and terms</li>
                <li>• Claim, restake, or exit directly from your wallet</li>
                <li>• Clear early-exit logic on lock vaults</li>
                <li>• APR Rates up to 1200%</li>
              </ul>
            </div>

            <StatusStrip className="mt-6" />

            {/* Primary actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={STAKE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black hover:bg-amber-300"
              >
                Go to Staking
              </a>
              <a
                href={`${STAKE_URL}/positions`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                View Vaults
              </a>
              <a
                href="/how-to"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                How to Stake
              </a>
            </div>
          </div>
        </section>

        {/* TOKENOMICS */}
        <section id="tokenomics" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-bold tracking-wide text-amber-300">
              $BGLD Safu Tokenomics
            </h2>
            <p className="mt-2 text-center text-white/75">
              CA: 0x0bBcAA0921da25ef216739e8dBbFD988875E81B4
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              {[
                { h: '1,000,000,000', s: 'Total Supply', b: 'Fixed gold supply on Base.' },
                { h: '0%', s: 'Tax', b: 'No buy/sell tax.' },
                { h: 'LP Locked', s: 'Liquidity', b: 'Transparency first.' },
                { h: 'Renounced', s: 'Ownership', b: 'Immutable core.' },
              ].map((k) => (
                <div key={k.s} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-2xl font-extrabold text-amber-300">{k.h}</div>
                  <div className="mt-2 text-sm text-white/65">{k.s}</div>
                  <p className="mt-3 text-sm text-white/80">{k.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HISTORY */}
        <section id="history" className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 className="text-center text-2xl font-bold tracking-wide text-amber-300">
              History & Trust — Gold Reserves ↔ Base
            </h2>
            <div className="mt-8 space-y-6">
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  Why a “digital reserve”?
                </summary>
                <p className="mt-2 text-white/80">
                  Classic Gold reserves using Gold vault ledgers and metal scarcity. On Base, transparent
                  contracts and Digital Gold Reserve Vaults model Use discipline without Trading Risk, Stake and Earn Passive Income while Holding in Gold Vaults.
                </p>
              </details>
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  What backs the system?
                </summary>
                <p className="mt-2 text-white/80">
                  Culture, participation, and Reward Staking Model: a community narrative with Base on-chain
                  proofs, framed in Base Gold Reserve Lore.
                </p>
              </details>
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  Why Base?
                </summary>
                <p className="mt-2 text-white/80">
                  Low fees, throughput, and thriving culture — perfect rails for a living, meme-native
                  Gold Reserve Model.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 rounded-full border border-amber-400/40 bg-amber-400/20 p-3 text-amber-200 backdrop-blur-sm transition-all hover:bg-amber-400/30 hover:text-amber-50 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5l-6 6m6-6l6 6M12 5v14"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
