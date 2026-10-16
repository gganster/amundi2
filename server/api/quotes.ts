import { Router } from 'express';

// Provider: Yahoo Finance chart endpoint, no API key. See docs/external/yahoo-finance-chart.md
const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const CACHE_MS = 60_000;

// Symbol goes into a third-party URL: strict format check (AMUN.PA, AAPL, BRK-B).
const SYMBOL_RE = /^[A-Z0-9-]{1,10}(\.[A-Z]{1,3})?$/;

class UnknownSymbolError extends Error {}

// Allowed ranges -> Yahoo interval (whitelist: the value is forwarded to a third party).
const INTERVALS: Record<string, string> = { '1mo': '1d', '3mo': '1d', '6mo': '1d', '1y': '1d', '5y': '1wk' };

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }
interface Quote { symbol: string; name: string; currency: string; price: number; previousClose: number; candles: Candle[] }

// ponytail: in-memory per-process cache, fine for one instance; use a shared cache if scaled out.
const cache = new Map<string, { at: number; data: Quote }>();

async function fetchQuote(symbol: string, range: string): Promise<Quote> {
  const res = await fetch(`${YAHOO_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${INTERVALS[range]}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) throw new UnknownSymbolError(symbol);
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
    name: meta.longName ?? meta.shortName,
    currency: meta.currency,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    candles,
  };
}

export const quotes = Router();

quotes.get('/:symbol', async (req, res) => {
  const symbol = String(req.params['symbol']).toUpperCase();
  if (!SYMBOL_RE.test(symbol)) {
    res.status(400).json({ error: 'invalid symbol' });
    return;
  }

  const range = String(req.query['range'] ?? '3mo');
  if (!Object.hasOwn(INTERVALS, range)) {
    res.status(400).json({ error: `range must be one of ${Object.keys(INTERVALS).join(', ')}` });
    return;
  }

  const key = `${symbol}:${range}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    res.json(hit.data);
    return;
  }

  try {
    const data = await fetchQuote(symbol, range);
    cache.set(key, { at: Date.now(), data });
    res.json(data);
  } catch (err) {
    if (err instanceof UnknownSymbolError) {
      res.status(404).json({ error: 'Unknown symbol' });
      return;
    }
    console.error(err);
    res.status(502).json({ error: 'Market data provider unavailable' });
  }
});
