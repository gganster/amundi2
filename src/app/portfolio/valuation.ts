export interface Position {
  id: number;
  ticker: string;
  quantity: number;
  unitCost: number;
  purchasedAt: string;
}

export interface Price {
  price: number;
  currency: string;
}

export interface ValuedPosition {
  position: Position;
  // Undefined when no quote is available for the ticker.
  currency?: string;
  price?: number;
  value?: number;
  gain?: number;
  gainPct?: number;
}

export interface CurrencyTotal {
  currency: string;
  cost: number;
  value: number;
  gain: number;
  gainPct: number;
}

export interface Valuation {
  rows: ValuedPosition[];
  totals: CurrencyTotal[];
  // True when at least one quote is unavailable and its position is left out of the totals.
  partial: boolean;
}

// No currency conversion: totals are kept per quote currency, and unit cost is assumed to be in that currency.
export function valuePositions(positions: Position[], prices: Record<string, Price | null | undefined>): Valuation {
  const totals = new Map<string, CurrencyTotal>();
  let partial = false;

  const rows = positions.map((position): ValuedPosition => {
    const cost = position.quantity * position.unitCost;
    const quote = prices[position.ticker];
    if (!quote) {
      // null: quote unavailable (flagged partial); undefined: still loading (not flagged).
      if (quote === null) partial = true;
      return { position };
    }
    const value = position.quantity * quote.price;
    const gain = value - cost;
    const total = totals.get(quote.currency) ?? { currency: quote.currency, cost: 0, value: 0, gain: 0, gainPct: 0 };
    total.cost += cost;
    total.value += value;
    totals.set(quote.currency, total);
    return { position, currency: quote.currency, price: quote.price, value, gain, gainPct: cost > 0 ? (gain / cost) * 100 : undefined };
  });

  for (const t of totals.values()) {
    t.gain = t.value - t.cost;
    t.gainPct = t.cost > 0 ? (t.gain / t.cost) * 100 : 0;
  }
  return { rows, totals: [...totals.values()], partial };
}
