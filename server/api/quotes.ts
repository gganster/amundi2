import { Router } from 'express';

// Provider: Yahoo Finance chart endpoint, no API key. See docs/external/yahoo-finance-chart.md
const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const SYMBOL = 'AMUN.PA';
const CACHE_MS = 60_000;

// Allowed ranges -> Yahoo interval (whitelist: the value is forwarded to a third party).
const INTERVALS: Record<string, string> = { '1mo': '1d', '3mo': '1d', '6mo': '1d', '1y': '1d', '5y': '1wk' };

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }
interface Quote { symbol: string; name: string; currency: string; price: number; previousClose: number; candles: Candle[] }

// ponytail: in-memory per-process cache, fine for one instance; use a shared cache if scaled out.
const cache = new Map<string, { at: number; data: Quote }>();

async function fetchQuote(range: string): Promise<Quote> {
  const res = await fetch(`${YAHOO_URL}/${SYMBOL}?range=${range}&interval=${INTERVALS[range]}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);

  const result = (await res.json()).chart?.result?.[0];
  if (!result) throw new Error('Yahoo Finance returned no result');

  const { open, high, low, close, volume } = result.indicators.quote[0];
  const candles: Candle[] = [];
  (result.timestamp as number[]).forEach((time, i) => {
    // Yahoo returns null OHLC for days without trading: skip them.
    if (open[i] == null || high[i] == null || low[i] == null || close[i] == null) return;
    candles.push({ time, open: open[i], high: high[i], low: low[i], close: close[i], volume: volume[i] ?? 0 });
  });

  const { meta } = result;
  return {
    symbol: meta.symbol,
    name: meta.longName,
    currency: meta.currency,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    candles,
  };
}

export const quotes = Router();

quotes.get('/amundi', async (req, res) => {
  const range = String(req.query['range'] ?? '3mo');
  if (!Object.hasOwn(INTERVALS, range)) {
    res.status(400).json({ error: `range must be one of ${Object.keys(INTERVALS).join(', ')}` });
    return;
  }

  const hit = cache.get(range);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    res.json(hit.data);
    return;
  }

  try {
    const data = await fetchQuote(range);
    cache.set(range, { at: Date.now(), data });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Market data provider unavailable' });
  }
});
