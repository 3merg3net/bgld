'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

function Chip({
  children,
  href,
  tone = 'gold',
}: {
  children: React.ReactNode;
  href?: string;
  tone?: 'gold' | 'blue' | 'neutral';
}) {
  const tones = {
    gold: 'border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15',
    blue: 'border-sky-400/30 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15',
    neutral: 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
  }[tone];

  const cls =
    `inline-flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold ` +
    `tracking-wide ${tones} transition-colors`;

  return href ? (
    <Link href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export default function HeaderMarketing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Fixed header */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${
          scrolled
            ? 'bg-[#0B0F14]/85 backdrop-blur-md border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,.25)]'
            : 'bg-[#0B0F14]/70 backdrop-blur-sm border-b border-white/10'
        }`}
        
      >
        
        {/* Top row: logo + nav + CTA */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: logo */}
            <Link href="/" className="flex items-center gap-3">
              <span className="relative block h-8 w-8">
                <Image src="/logos/bgld-seal.png" alt="BGLD" fill className="object-contain" />
              </span>
              <span className="font-extrabold tracking-wide">
                <span className="text-sky-400">BASE</span> <span className="text-amber-300">GOLD</span>
              </span>
            </Link>
            

            {/* Center: nav (hidden on small) */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="#utility" className="text-white/70 hover:text-amber-300">
                Utility
              </Link>
              <Link href="#vault" className="text-white/70 hover:text-amber-300">
                Vault
              </Link>
              <Link href="#tokenomics" className="text-white/70 hover:text-amber-300">
                Tokenomics
              </Link>
              <Link href="#history" className="text-white/70 hover:text-amber-300">
                History
              </Link>
            </nav>

            {/* Right: primary action */}
            <div className="flex items-center gap-3">
              <Link
                href="https://stake.basereserve.gold"
                target="_blank"
                className="inline-flex h-10 items-center rounded-xl bg-amber-400/90 px-4 text-sm font-semibold text-black hover:bg-amber-300"
              >
                Stake BGLD
              </Link>
            </div>
          </div>
        </div>

        {/* Chips row: perfectly aligned, consistent height */}
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip tone="gold" href="https://stake.basereserve.gold" >
              Staking Live
            </Chip>
            <Chip tone="neutral" href="https://stake.basereserve.gold/how-it-works">
              Mechanics
            </Chip>
            <Chip tone="neutral" href="https://basescan.org/token/0x0bBcAA0921da25ef216739e8dBbFD988875E81B4">
              Contract
            </Chip>
            <Chip tone="blue" href="https://dexscreener.com/base/0xc4e41df25e2ce0d134333d0109116a982863d5bf">
              DEXScreener
            </Chip>
          </div>
        </div>
      </header>

      {/* Spacer so content starts below fixed header */}
      <div aria-hidden className="h-[76px]" />
    </>
  );
  
}
