'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-12 text-center relative overflow-hidden">
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
        <p className="text-[13px] sm:text-sm tracking-wide text-amber-300/90 font-semibold uppercase">
          The Digital Fort Knox of Base — Join the Vault
        </p>

        {/* Logo */}
        <Link
          href="https://stake.basereserve.gold"
          className="group relative w-16 h-16 sm:w-20 sm:h-20"
        >
          <Image
            src="/logo.png"
            alt="Base Gold"
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          />
        </Link>

        {/* Contact + Copyright */}
        <div className="text-sm text-white/60 leading-relaxed">
          <p>
            © {year}{' '}
            <a
              href="mailto:BaseReserveGold@gmail.com"
              className="text-amber-300 font-semibold hover:text-amber-200 transition-colors"
            >
              BaseReserveGold@gmail.com
            </a>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Built on Base • Powered by ETH • Secured by the Vault
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs text-white/50">
          <Link
            href="https://basescan.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition-colors"
          >
            BaseScan
          </Link>
          <Link
            href="https://x.com/BaseReserveGold"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition-colors"
          >
            X (Twitter)
          </Link>
          <Link
            href="https://stake.basereserve.gold/terms"
            target="_blank"
            className="hover:text-amber-300 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="https://stake.basereserve.gold/how-it-works"
            target="_blank"
            className="hover:text-amber-300 transition-colors"
          >
            Mechanics
          </Link>
        </div>
      </div>
    </footer>
  );
}
