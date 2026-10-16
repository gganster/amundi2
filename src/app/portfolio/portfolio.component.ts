import { HttpClient } from '@angular/common/http';
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { routes } from '../app.routes';
import { Position, Price, valuePositions } from './valuation';

// ticker -> chart route, derived from the routes (no duplicated symbols).
const chartPaths = new Map(routes.filter((r) => r.data?.['symbol']).map((r) => [r.data!['symbol'] as string, r.path!]));

// Same order as the server (purchase date, then id, newest first), so the list does not move on reload.
const sortPositions = (list: Position[]) => [...list].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt) || b.id - a.id);

const emptyForm = () => ({ ticker: '', quantity: null as number | null, unitCost: null as number | null, purchasedAt: '' });

@Component({
  selector: 'app-portfolio',
  imports: [FormsModule, RouterLink, HlmButtonImports],
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent {
  private readonly http = inject(HttpClient);

  readonly positions = signal<Position[]>([]);
  // undefined: still loading, null: quote unavailable.
  readonly prices = signal<Record<string, Price | null>>({});
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly formError = signal('');
  readonly editingId = signal<number | null>(null);
  form = emptyForm();

  readonly valuation = computed(() => valuePositions(this.positions(), this.prices()));

  constructor() {
    // Private data and quotes are client-side only: afterNextRender never runs during SSR.
    afterNextRender(() => this.load());
  }

  chartPath(ticker: string) {
    return chartPaths.get(ticker);
  }

  money(n: number, currency?: string) {
    if (!currency) return n.toFixed(2);
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(n);
    } catch {
      return `${n.toFixed(2)} ${currency}`;
    }
  }

  pct(n: number) {
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)} %`;
  }

  private load() {
    this.http.get<Position[]>('/api/portfolio/positions').subscribe({
      next: (list) => {
        this.positions.set(sortPositions(list));
        this.loading.set(false);
        this.loadPrices(list);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Impossible de charger le portefeuille.');
      },
    });
  }

  // One request per distinct ticker, in parallel; a failure only marks that ticker unavailable.
  private loadPrices(list: Position[]) {
    for (const ticker of new Set(list.map((p) => p.ticker))) {
      if (this.prices()[ticker]) continue;
      this.http.get<Price>(`/api/quotes/${encodeURIComponent(ticker)}`, { params: { range: '1mo' } }).subscribe({
        next: (q) => this.prices.update((p) => ({ ...p, [ticker]: { price: q.price, currency: q.currency } })),
        error: () => this.prices.update((p) => ({ ...p, [ticker]: null })),
      });
    }
  }

  edit(p: Position) {
    this.editingId.set(p.id);
    this.form = { ticker: p.ticker, quantity: p.quantity, unitCost: p.unitCost, purchasedAt: p.purchasedAt.slice(0, 10) };
  }

  cancel() {
    this.editingId.set(null);
    this.form = emptyForm();
    this.formError.set('');
  }

  save() {
    const id = this.editingId();
    const body = { ...this.form, ticker: this.form.ticker.trim().toUpperCase() };
    this.formError.set('');
    this.saving.set(true);
    const req = id === null
      ? this.http.post<Position>('/api/portfolio/positions', body)
      : this.http.put<Position>(`/api/portfolio/positions/${id}`, body);
    req.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.positions.update((list) => sortPositions(id === null ? [saved, ...list] : list.map((p) => (p.id === id ? saved : p))));
        this.loadPrices([saved]);
        this.cancel();
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(e.status === 400 ? 'Valeurs invalides : vérifiez le symbole (ex. AMUN.PA), la quantité (> 0), le prix (≥ 0) et la date.' : 'Enregistrement impossible, réessayez plus tard.');
      },
    });
  }

  remove(p: Position) {
    if (!window.confirm(`Supprimer la position ${p.ticker} (${p.quantity}) ?`)) return;
    this.http.delete(`/api/portfolio/positions/${p.id}`).subscribe({
      next: () => this.positions.update((list) => list.filter((x) => x.id !== p.id)),
      error: () => this.error.set('Suppression impossible, réessayez plus tard.'),
    });
  }
}
