import { Position, valuePositions } from './valuation';

const pos = (id: number, ticker: string, quantity: number, unitCost: number): Position => ({ id, ticker, quantity, unitCost, purchasedAt: '2026-01-01' });

describe('valuePositions', () => {
  it('computes value and gain per position', () => {
    const { rows, partial } = valuePositions([pos(1, 'AMUN.PA', 10, 50)], { 'AMUN.PA': { price: 60, currency: 'EUR' } });
    expect(rows[0].value).toBe(600);
    expect(rows[0].gain).toBe(100);
    expect(rows[0].gainPct).toBe(20);
    expect(partial).toBeFalse();
  });

  it('keeps one total per currency, without conversion', () => {
    const { totals } = valuePositions(
      [pos(1, 'AMUN.PA', 10, 50), pos(2, 'TTE.PA', 2, 100), pos(3, 'AAPL', 1, 100)],
      { 'AMUN.PA': { price: 60, currency: 'EUR' }, 'TTE.PA': { price: 50, currency: 'EUR' }, AAPL: { price: 150, currency: 'USD' } },
    );
    expect(totals.map((t) => [t.currency, t.cost, t.value, t.gain])).toEqual([
      ['EUR', 700, 700, 0],
      ['USD', 100, 150, 50],
    ]);
  });

  it('excludes a position without quote from the totals and flags them partial', () => {
    const { rows, totals, partial } = valuePositions([pos(1, 'AMUN.PA', 10, 50), pos(2, 'XXX', 5, 10)], { 'AMUN.PA': { price: 60, currency: 'EUR' }, XXX: null });
    expect(rows[1].value).toBeUndefined();
    expect(totals).toEqual([{ currency: 'EUR', cost: 500, value: 600, gain: 100, gainPct: 20 }]);
    expect(partial).toBeTrue();
  });
});
