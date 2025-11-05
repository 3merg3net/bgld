'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Price = { ok: boolean; price?: number; changePct?: number; symbol?: string; currency?: string };
type NewsItem = { title: string; link: string };

export default function GoldTicker({ className = '' }: { className?: string }) {
  const [price, setPrice] = useState<Price | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const [pR, nR] = await Promise.all([
          fetch('/api/gold', { cache: 'no-store' }),
          fetch('/api/gold-news', { cache: 'no-store' }),
        ]);
        const pj = await pR.json();
        const nj = await nR.json();
        if (!cancel) {
          setPrice(pj?.ok ? pj : null);
          setNews(nj?.ok ? nj.items ?? [] : []);
        }
      } catch {
        if (!cancel) { setPrice(null); setNews([]); }
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { cancel = true; clearInterval(id); };
  }, []);

  const up = (price?.changePct ?? 0) >= 0;
  const delta = price?.changePct != null
    ? (price.changePct).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%'
    : '—';
  const spot = price?.price != null
    ? (price.price).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '—';

  return (
    <div className={`w-full border-b border-white/10 bg-[#0B0F14]/80 backdrop-blur headerGlass`}>
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-2 text-xs">
          {/* left: price chip */}
          <div className={`rounded-full px-3 py-1 border ${up ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>
            <span className="font-semibold">Gold</span>{' '}
            <span className="tabular-nums">{spot}</span>{' '}
            <span className="tabular-nums">{delta}</span>
          </div>

          {/* divider */}
          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* right: news scroller */}
          <div className="relative overflow-hidden flex-1">
            <div className="whitespace-nowrap animate-[ticker_30s_linear_infinite]">
              {(news.length ? news : [{ title: 'Gold market headlines loading…', link: '#' }]).map((n, i) => (
                <Link
                  key={i}
                  href={n.link || '#'}
                  target={n.link ? '_blank' : undefined}
                  className="inline-block px-3 text-white/70 hover:text-amber-300 transition-colors"
                >
                  • {n.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ticker keyframes */}
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
