import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import type { CandlestickData, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

interface Quote {
  name: string;
  symbol: string;
  currency: string;
  price: number;
  previousClose: number;
  candles: (Omit<CandlestickData, 'time'> & { time: number })[];
}

const RANGES = [
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1A' },
  { value: '5y', label: '5A' },
];

// Same colors as the reference screenshot (green = up, red = down).
const UP = '#3f9f22';
const DOWN = '#e2001a';

@Component({
  selector: 'app-stock-chart',
  imports: [HlmButtonImports],
  templateUrl: './stock-chart.component.html',
})
export class StockChartComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('chart');

  readonly symbol = input.required<string>();
  readonly label = input<string>();

  readonly ranges = RANGES;
  readonly range = signal('3mo');
  readonly quote = signal<Quote | null>(null);
  readonly error = signal(false);

  readonly change = computed(() => {
    const q = this.quote();
    return q ? ((q.price - q.previousClose) / q.previousClose) * 100 : 0;
  });

  private chart?: IChartApi;
  private series?: ISeriesApi<'Candlestick'>;

  constructor() {
    // Chart is client-side only: afterNextRender never runs during SSR.
    afterNextRender(async () => {
      const { createChart, CandlestickSeries } = await import('lightweight-charts');
      this.chart = createChart(this.host().nativeElement, {
        autoSize: true,
        layout: { background: { color: 'transparent' }, textColor: '#6b7280', attributionLogo: false },
        grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
      });
      this.series = this.chart.addSeries(CandlestickSeries, {
        upColor: UP, borderUpColor: UP, wickUpColor: UP,
        downColor: DOWN, borderDownColor: DOWN, wickDownColor: DOWN,
      });
      this.load(this.range());
    });
  }

  load(range: string) {
    this.range.set(range);
    this.http.get<Quote>(`/api/quotes/${encodeURIComponent(this.symbol())}`, { params: { range } }).subscribe({
      next: (q) => {
        this.error.set(false);
        this.quote.set(q);
        this.series?.setData(q.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
        this.chart?.timeScale().fitContent();
      },
      error: () => this.error.set(true),
    });
  }

  ngOnDestroy() {
    this.chart?.remove();
  }
}
