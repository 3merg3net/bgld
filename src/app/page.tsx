"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  // ---- External links & embeds (set these in .env.local) ----
  const DEX = process.env.NEXT_PUBLIC_DEX_URL || "#";
  const BASESCAN = process.env.NEXT_PUBLIC_BASESCAN_URL || "#";
  const DEXSCREENER = process.env.NEXT_PUBLIC_DEXSCREENER_URL || ""; // e.g. https://dexscreener.com/base/<pair>?embed=1&theme=dark
  const SWAP_IFRAME = process.env.NEXT_PUBLIC_SWAP_IFRAME_URL || ""; // e.g. https://app.uniswap.org/#/swap?...&embed=1
  const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  // ---- UI state ----
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setShowTop(y > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Optional local banknote-style font. Place /public/fonts/federal.ttf */}
      <style jsx global>{`
  @font-face {
    font-family: "CashCurrency";
    src: url("/fonts/cash-currency.ttf") format("truetype");
    font-weight: 400 800;
    font-style: normal;
    font-display: swap;
  }
  .currency-font {
    font-family: "CashCurrency", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    letter-spacing: 0.02em;
  }
  .glow-gold {
    text-shadow: 0 0 10px rgba(255, 200, 0, 0.35), 0 0 22px rgba(255, 200, 0, 0.25);
  }
  .glow-blue {
    text-shadow: 0 0 10px rgba(0, 112, 255, 0.35), 0 0 22px rgba(0, 112, 255, 0.25);
  }
`}</style>


      {/* GLOBAL BACKDROP */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[#0B0F14]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,75,0.08)_0%,rgba(11,15,20,0.9)_55%,rgba(11,15,20,1)_100%)]" />
        <img
          src="/textures/guilloche.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-12 mix-blend-overlay"
        />
      </div>

      {/* NAVBAR (transparent at top, fades in on scroll) */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#0B0F14]/85 backdrop-blur-md border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
            : "bg-transparent border-b-0"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-medium text-white">
          <div className="flex items-center gap-3">
            <img src="/logos/bgld-seal.png" alt="Base Gold emblem" className="h-7 w-7" />
            <span className="tracking-wider">
              <span className="currency-font text-[1.05rem] font-semibold">
                <span className="text-[#0AA0FF] glow-blue">BASE</span>{" "}
                <span className="text-amber-300 glow-gold">GOLD</span>
              </span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            <a href="#utility" className="hover:text-amber-300">Utility</a>
            <a href="#vault" className="hover:text-amber-300">Staking Vault</a>
            <a href="#nfts" className="hover:text-amber-300">Certificates</a>
            <a href="#tokenomics" className="hover:text-amber-300">Tokenomics</a>
            <a href="#history" className="hover:text-amber-300">History</a>
            <a
              href={DEX}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-amber-400/90 px-3 py-1.5 font-semibold text-black hover:bg-amber-300"
            >
              Buy $BGLD
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Open menu"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </nav>

        {/* Slide-in drawer */}
        <div
          className={`fixed inset-y-0 right-0 z-[60] w-72 transform bg-[#0B0F14]/98 backdrop-blur-md border-l border-white/10 transition-transform duration-300 md:hidden ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logos/bgld-seal.png" alt="BGLD" className="h-6 w-6" />
              <span className="currency-font text-amber-300 font-semibold">BASE GOLD</span>
            </div>
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6l-12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col px-4 py-3 text-white">
            {[
              ["#utility", "Utility"],
              ["#vault", "Staking Vault"],
              ["#nfts", "Certificates"],
              ["#tokenomics", "Tokenomics"],
              ["#history", "History"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="py-3 border-b border-white/10 hover:text-amber-300"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 flex gap-3">
              <a
                href={DEX}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-lg bg-amber-400/90 px-3 py-2 text-center font-semibold text-black hover:bg-amber-300"
              >
                Buy $BGLD
              </a>
              <a
                href={BASESCAN}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center font-semibold hover:bg-white/10"
              >
                BaseScan
              </a>
            </div>
          </nav>
        </div>
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>

      <main className="pt-24 text-white">
        {/* TOP TITLE (no banner) */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:py-20 text-center">
            <img
              src="/logos/bgld-seal-transparent.png"
              alt="Base Gold seal"
              className="mx-auto mb-6 h-44 w-44"
            />
            <h1 className="currency-font text-4xl md:text-6xl font-extrabold tracking-wide">
              <span className="text-[#0AA0FF] glow-blue">BASE</span>{" "}
              <span className="text-amber-300 glow-gold">GOLD</span>
            </h1>
            <p className="mt-3 text-lg md:text-xl text-white/90">
              The Digital Reserve of Base — <span className="text-amber-300 glow-gold">Backed OnChain</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={DEX}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-amber-400/90 px-5 py-3 font-semibold text-black shadow-lg shadow-amber-400/25 hover:bg-amber-300"
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
                {copied ? "Copied ✓" : "Copy Contract"}
              </button>
            </div>
          </div>
        </section>

        {/* UTILITY */}
        <section id="utility" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="currency-font text-center text-2xl font-bold tracking-wide text-amber-300 glow-gold">
              Utility — Digital Reserve Model
            </h2>
            <p className="mt-3 text-center text-white/75 max-w-3xl mx-auto">
              A reserve metaphor for Base: scarce supply, transparent ledgers, and culture-grade collateral—built for on-chain life.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { title: "Reserve Unit", headline: "$BGLD", body: "Programmable reserve token on Base." },
                { title: "Leaderboard", headline: "Bars & Ranks", body: "Snapshot prestige + allowlists." },
                { title: "Certificates", headline: "NFT Notes", body: "Engraved Reserve NFTs (soon)." },
              ].map((c, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm uppercase tracking-widest text-white/60">{c.title}</div>
                  <div className="currency-font mt-2 text-2xl font-extrabold text-amber-300 glow-gold">
                    {c.headline}
                  </div>
                  <p className="mt-2 text-white/80 text-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STAKING VAULT — stacked widgets */}
        <section id="vault" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="currency-font text-2xl font-bold tracking-wide text-amber-300 glow-gold">Staking Vault (Coming Soon)</h2>
            <p className="mt-3 text-white/80 max-w-3xl">
              Lock $BGLD into the **Vault** to earn status and unlock collectible utilities. Epochs, bars, ceremonial unlocks, and a
              Reserve dashboard for clean on-chain proofs.
            </p>
            <ul className="mt-5 space-y-2 text-white/80">
              <li>• Epoch-based staking windows</li>
              <li>• Cosmetic perks & allowlist privileges</li>
              <li>• On-chain proofs + Reserve UI</li>
            </ul>

            {/* Dexscreener (stacked) */}
            <div className="mt-10">
              <div className="mb-2 text-sm text-white/70">Market — Dexscreener</div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                {DEXSCREENER ? (
                  <iframe
                    src={DEXSCREENER}
                    title="Dexscreener"
                    className="h-[400px] w-full rounded-lg"
                    allow="clipboard-write; clipboard-read; fullscreen"
                  />
                ) : (
                  <div className="h-[120px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                    Set <code>NEXT_PUBLIC_DEXSCREENER_URL</code> to embed Dexscreener here.
                  </div>
                )}
              </div>
            </div>

            {/* Swap (smaller height) */}
            <div className="mt-8">
              <div className="mb-2 text-sm text-white/70">Swap</div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                {SWAP_IFRAME ? (
                  <iframe
                    src={SWAP_IFRAME}
                    title="Swap"
                    className="h-[360px] w-full rounded-lg"
                    allow="clipboard-write; clipboard-read; fullscreen; payment *"
                  />
                ) : (
                  <div className="h-[120px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                    Set <code>NEXT_PUBLIC_SWAP_IFRAME_URL</code> to embed a swap widget here (Uniswap/Aerodrome).
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={DEX}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-amber-400/90 px-4 py-2 font-semibold text-black hover:bg-amber-300"
                >
                  Open DEX
                </a>
                <button
                  onClick={copyAddress}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 font-semibold text-amber-200 hover:bg-amber-400/15"
                >
                  {copied ? "Address Copied ✓" : "Copy Contract"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* NFT CERTIFICATES */}
        <section id="nfts" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <img
                    src="/nft/certificate-reserve.png"
                    alt="Digital gold certificate banner"
                    className="mx-auto w-full rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="currency-font text-2xl font-bold tracking-wide text-amber-300 glow-gold">
                  Reserve Certificates (NFTs) — Launching Soon
                </h2>
                <p className="mt-3 text-white/80">
                  Engraved, serialized **Reserve Notes** on Base. Claim windows reference snapshots of vault participation
                  and on-chain activity.
                </p>
                <ul className="mt-5 space-y-2 text-white/80">
                  <li>• Engraved note design • unique serials</li>
                  <li>• Snapshot-based claim logic</li>
                  <li>• Display in your Vault profile</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TOKENOMICS */}
        <section id="tokenomics" className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="currency-font text-center text-2xl font-bold tracking-wide text-amber-300 glow-gold">Tokenomics</h2>
            <p className="mt-2 text-center text-white/75">Reserve-inspired issuance with transparent rails.</p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              {[
                { h: "1,000,000,000", s: "Total Supply", b: "Fixed supply on Base." },
                { h: "0%", s: "Tax", b: "No buy/sell tax." },
                { h: "LP Locked", s: "Liquidity", b: "Transparency first." },
                { h: "Renounced", s: "Ownership", b: "Immutable core." },
              ].map((k, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="currency-font text-2xl font-extrabold text-amber-300 glow-gold">{k.h}</div>
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
            <h2 className="currency-font text-center text-2xl font-bold tracking-wide text-amber-300 glow-gold">
              History & Parallels — Gold Reserves ↔ Base
            </h2>
            <div className="mt-8 space-y-6">
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">Why a “digital reserve”?</summary>
                <p className="mt-2 text-white/80">
                  Classic reserves used vault ledgers and metal scarcity. On Base, transparent contracts and programmatic
                  policy model similar discipline—without trucks or vaults.
                </p>
              </details>
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">What backs the system?</summary>
                <p className="mt-2 text-white/80">
                  Culture, participation, and programmable rules: a community narrative with on-chain proofs,
                  framed in Reserve iconography.
                </p>
              </details>
              <details className="group rounded-xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer list-none font-semibold">Why Base?</summary>
                <p className="mt-2 text-white/80">
                  Low fees, throughput, and thriving culture — perfect rails for a living, meme-native Reserve metaphor.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logos/bgld-seal.png" alt="Base Gold emblem" className="h-9 w-9" />
              <div className="text-sm text-white/70">© {new Date().getFullYear()} Base Reserve</div>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <a href="https://x.com/basereservegold" target="_blank" rel="noreferrer" className="hover:text-white">X / Twitter</a>
              <a href="https://t.me/BaseReserveGold" target="_blank" rel="noreferrer" className="hover:text-white">Telegram</a>
              <a href={BASESCAN} target="_blank" rel="noreferrer" className="hover:text-white">BaseScan</a>
            </div>
          </div>
          <p className="px-4 pb-8 text-center text-white/65 text-xs max-w-3xl mx-auto">
            For informational and entertainment purposes only. Nothing here is an offer, solicitation, or financial advice.
          </p>
        </footer>
      </main>

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 rounded-full border border-amber-400/40 bg-amber-400/20 p-3 text-amber-200 backdrop-blur-sm transition-all hover:bg-amber-400/30 hover:text-amber-50 ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5l-6 6m6-6l6 6M12 5v14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
