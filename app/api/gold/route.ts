import { NextResponse } from 'next/server';

const YF_SYMBOLS = ['XAUUSD=X', 'GC=F']; // spot first, then futures fallback

async function fetchYF(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`yf ${r.status}`);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  const meta = res?.meta;
  const close = res?.indicators?.quote?.[0]?.close;
  const last = Array.isArray(close) ? close.filter((v: number) => Number.isFinite(v)).pop() : null;
  const prevClose = Number(meta?.previousClose);
  const price = Number(last ?? meta?.regularMarketPrice ?? meta?.chartPreviousClose);
  const change = Number.isFinite(price) && Number.isFinite(prevClose) ? price - prevClose : null;
  const changePct = change != null && prevClose ? (change / prevClose) * 100 : null;
  return { ok: true, symbol, price, change, changePct, currency: meta?.currency || 'USD' };
}

export async function GET() {
  for (const sym of YF_SYMBOLS) {
    try {
      const data = await fetchYF(sym);
      if (data?.ok && Number.isFinite(data.price)) {
        return NextResponse.json({  ...data, source: 'Yahoo Finance' });
      }
    } catch { /* try next */ }
  }
  return NextResponse.json({ ok: false, error: 'Price unavailable' }, { status: 502 });
}
