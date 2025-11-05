import { NextResponse } from 'next/server';

const RSS = 'https://news.google.com/rss/search?q=gold+price+OR+XAUUSD&hl=en-US&gl=US&ceid=US:en';

export async function GET() {
  try {
    const r = await fetch(RSS, { cache: 'no-store' });
    if (!r.ok) throw new Error(`rss ${r.status}`);
    const xml = await r.text();

    // super-lightweight RSS parsing (top 6 items)
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 6)
      .map(m => {
        const block = m[1];
        const title = (block.match(/<title><\!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/) || [])[1] || (block.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const link = (block.match(/<link>(.*?)<\/link>/) || [])[1] || '';
        return { title: title.replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, '&'), link };
      })
      .filter(x => x.title && x.link);

    return NextResponse.json({ ok: true, items, source: 'Google News' });
  } catch {
    return NextResponse.json({ ok: false, items: [] });
  }
}
