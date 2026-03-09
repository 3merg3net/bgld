'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-black/80 py-12 text-center backdrop-blur-md">
      {/* Gold ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-25 blur-3xl"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(400px 120px at 50% 100%, rgba(212,175,55,0.25), transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center justify-center space-y-5">
        {/* Tagline */}
        <p className="text-[13px] font-semibold uppercase tracking-wide text-amber-300/90 sm:text-sm">
          The Digital Reserve of Base
        </p>

        {/* Logo */}
        <Link href="/" className="group relative h-16 w-16 sm:h-20 sm:w-20">
          <Image
            src="/logo.png"
            alt="Base Gold"
            fill
            className="object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Contact + Copyright */}
        <div className="leading-relaxed text-sm text-white/60">
          <p>
            © {year}{' '}
            <a
              href="mailto:BaseReserveGold@gmail.com"
              className="font-semibold text-amber-300 transition-colors hover:text-amber-200"
            >
              BaseReserveGold@gmail.com
            </a>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Built on Base • Powered by ETH • Transparent on-chain
          </p>
        </div>

        {/* Links */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
          <Link
            href="https://basescan.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-amber-300"
          >
            BaseScan
          </Link>
          <Link
            href="https://x.com/BaseReserveGold"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-amber-300"
          >
            X (Twitter)
          </Link>
          <Link
            href="/how-it-works"
            className="transition-colors hover:text-amber-300"
          >
            How It Works
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_DEX_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-amber-300"
          >
            Buy $BGLD
          </Link>
        </div>
      </div>
    </footer>
  );
}