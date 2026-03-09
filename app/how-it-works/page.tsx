/* eslint-disable @next/next/no-img-element */

'use client';

import Link from 'next/link';

export default function HowItWorksPage() {
  const DEX = process.env.NEXT_PUBLIC_DEX_URL || '#';
  const BASESCAN = process.env.NEXT_PUBLIC_BASESCAN_URL || '#';

  return (
    <main className="min-h-screen bg-[#0B0F14] pt-28 text-white">
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300/80">
            Base Gold
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-wide md:text-5xl">
            How It Works
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/75 md:text-lg">
            Base Gold is a digital reserve asset on Base built around scarcity,
            transparency, liquidity, and culture-native identity.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: '1. Fixed Supply',
              body: 'BGLD is designed as a scarce digital reserve unit with transparent on-chain visibility.',
            },
            {
              title: '2. On-Chain Access',
              body: 'Anyone can verify the contract, track activity, and interact through Base-native market rails.',
            },
            {
              title: '3. Reserve Narrative',
              body: 'The project frames BGLD as a digital reserve for Base: simple, visible, and culturally strong.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-xl font-bold text-amber-300">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-amber-300">
            What gives Base Gold value?
          </h2>
          <div className="mt-4 space-y-4 text-white/80">
            <p>
              Base Gold is not positioned as a claim on physical gold. Its value
              comes from market participation, on-chain transparency, fixed
              supply structure, liquidity, and the strength of its brand and
              community.
            </p>
            <p>
              In that sense, it acts more like a digital reserve symbol for the
              Base ecosystem: easy to verify, easy to access, and easy to
              understand.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-amber-300">
            Why Base?
          </h2>
          <p className="mt-4 text-white/80">
            Base offers low fees, fast settlement, and strong cultural momentum.
            That makes it a natural home for a reserve-style digital asset that
            wants clean on-chain visibility and broad accessibility.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={DEX}
            target="_blank"
            className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black shadow-lg hover:bg-amber-300"
          >
            Buy $BGLD
          </Link>
          <Link
            href={BASESCAN}
            target="_blank"
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            View on BaseScan
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}