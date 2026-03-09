/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useState } from 'react';
import MetricsStrip from '@/components/MetricsStrip';
import GoldTicker from '@/components/GoldTicker';

export default function Page() {
  const DEX = process.env.NEXT_PUBLIC_DEX_URL || '#';
  const BASESCAN = process.env.NEXT_PUBLIC_BASESCAN_URL || '#';
  const CONTRACT =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000';

  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
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
              <span className="text-amber-300">scarce, liquid, and on-chain</span>.
            </p>
          </div>

          <GoldTicker />

          <div className="mx-auto max-w-6xl px-4 pb-6">
            <MetricsStrip />
          </div>

          {/* HERO CTAs */}
          <div className="mx-auto max-w-6xl px-4 pb-8 text-center">
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={DEX}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black shadow-lg hover:bg-amber-300"
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
              Utility — Digital Reserve Model
            </h2>

            <p className="mt-3 mx-auto max-w-3xl text-center text-white/75">
              Base Gold is built as a culture-native reserve asset for Base:
              scarce supply, transparent ledgers, deep meme identity, and clean
              on-chain accessibility.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  title: 'Reserve Unit',
                  headline: '$BGLD',
                  body: 'A digital reserve asset designed for Base.',
                },
                {
                  title: 'Liquidity',
                  headline: 'Trade Freely',
                  body: 'Accessible on-chain with transparent market rails and live price discovery.',
                },
                {
                  title: 'Certificates',
                  headline: 'Reserve NFTs',
                  body: 'Engraved note-style collectibles and ecosystem artifacts coming soon.',
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-sm uppercase tracking-widest text-white/60">
                    {c.title}
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-amber-300">
                    {c.headline}
                  </div>
                  <p className="mt-2 text-sm text-white/80">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section id="ecosystem" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-bold tracking-wide text-amber-300">
              Base Gold Reserve Ecosystem
            </h2>

            <div className="mt-3 max-w-3xl space-y-3 text-white/85">
              <p>
                <strong>$BGLD</strong> is positioned as a digital reserve asset
                for the Base ecosystem — a liquid symbol of scarcity, culture,
                and on-chain permanence.
              </p>
              <p>
                The focus of the main Base Gold site is simple: clear token
                identity, transparent supply, accessible market links, and a
                strong reserve narrative that feels native to Base.
              </p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li>• Transparent contract and public on-chain visibility</li>
                <li>• Clear market access through supported trading links</li>
                <li>• Reserve-themed brand identity and collectible expansion</li>
                <li>• Built for long-term ecosystem recognition on Base</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={DEX}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black hover:bg-amber-300"
              >
                Trade $BGLD
              </a>

              <a
                href={BASESCAN}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                Explore Contract
              </a>

              <a
                href="/how-it-works"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
              >
                How It Works
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
                {
                  h: '1,000,000,000',
                  s: 'Total Supply',
                  b: 'Fixed gold supply on Base.',
                },
                { h: '0%', s: 'Tax', b: 'No buy/sell tax.' },
                { h: 'LP Locked', s: 'Liquidity', b: 'Transparency first.' },
                { h: 'Renounced', s: 'Ownership', b: 'Immutable core.' },
              ].map((k) => (
                <div
                  key={k.s}
                  className="rounded-xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-2xl font-extrabold text-amber-300">
                    {k.h}
                  </div>
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
                  Traditional gold reserves relied on scarcity, ledgers, and
                  trust in durable stores of value. On Base, those ideas evolve
                  into transparent contracts, public wallets, and an always-on
                  digital market.
                </p>
              </details>

              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  What backs the system?
                </summary>
                <p className="mt-2 text-white/80">
                  Culture, participation, liquidity, and on-chain transparency.
                  Base Gold is backed by its public market structure, visible
                  token rails, and the strength of its community narrative.
                </p>
              </details>

              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  Why Base?
                </summary>
                <p className="mt-2 text-white/80">
                  Low fees, fast settlement, and a thriving culture layer make
                  Base strong ground for a living, meme-native digital reserve.
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
          showTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 pointer-events-none translate-y-3'
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