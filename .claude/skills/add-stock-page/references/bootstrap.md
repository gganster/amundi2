# Bootstrap : rendre graphique, API et menu génériques (une seule fois)

À appliquer seulement si `StockChartComponent` n'a pas d'input `symbol`. Amundi devient la première entrée du registre ; son rendu ne doit pas changer. Vérifier l'état réel des fichiers avant chaque édition (le code a pu évoluer).

## 1. API — `server/api/quotes.ts`

- Supprimer `const SYMBOL = 'AMUN.PA'`. `fetchQuote(symbol: string, range: string)` utilise `symbol` dans l'URL (`encodeURIComponent`).
- Clé de cache : `` `${symbol}:${range}` `` au lieu de `range`.
- `name: meta.longName ?? meta.shortName`.
- Yahoo répond 404 pour un symbole inconnu : lever `UnknownSymbolError` (`class UnknownSymbolError extends Error {}`) quand `res.status === 404`.
- Remplacer `quotes.get('/amundi', …)` par `quotes.get('/:symbol', …)` :

```ts
// Symbol goes into a third-party URL: strict format check (AMUN.PA, AAPL, BRK-B).
const SYMBOL_RE = /^[A-Z0-9-]{1,10}(\.[A-Z]{1,3})?$/;

const symbol = String(req.params['symbol']).toUpperCase();
if (!SYMBOL_RE.test(symbol)) {
  res.status(400).json({ error: 'invalid symbol' });
  return;
}
```

  et dans le `catch` : `if (err instanceof UnknownSymbolError) { res.status(404).json({ error: 'Unknown symbol' }); return; }` avant le 502.

## 2. Graphique — `src/app/stock-chart/`

- `stock-chart.component.ts` : `import { input } from '@angular/core'` ; `readonly symbol = input.required<string>();` `readonly label = input<string>();` ; dans `load`, URL `` `/api/quotes/${encodeURIComponent(this.symbol())}` ``.
- `stock-chart.component.html` : `{{ quote()?.name ?? label() }}` et `{{ quote()?.symbol ?? symbol() }}` à la place de `'Amundi'` / `'AMUN.PA'`.

## 3. Page partagée — `src/app/stock-page/stock-page.component.ts`

```ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StockChartComponent } from '../stock-chart/stock-chart.component';

@Component({
  selector: 'app-stock-page',
  imports: [StockChartComponent],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Tableau de bord — action {{ label }}</h1>
    <app-stock-chart [symbol]="symbol" [label]="label" />
  `,
})
export class StockPageComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly symbol: string = this.data['symbol'];
  readonly label: string = this.data['label'];
}
```

Chaque entrée de route est une instance distincte : pas besoin de réagir aux changements de paramètres.

## 4. Routes et menu

`src/app/app.routes.ts` :

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'amundi' },
  { path: 'amundi', component: StockPageComponent, data: { symbol: 'AMUN.PA', label: 'Amundi' } },
];
```

`src/app/app.component.ts` : retirer `StockChartComponent` ; imports `RouterOutlet, RouterLink, RouterLinkActive, HlmButtonImports` ; ajouter
`readonly links = routes.filter((r) => r.data).map((r) => ({ path: r.path!, label: r.data!['label'] as string }));`

`src/app/app.component.html` :

```html
<nav class="border-b">
  <ul class="mx-auto flex max-w-5xl flex-wrap gap-1 p-2">
    @for (l of links; track l.path) {
      <li><a hlmBtn variant="ghost" size="sm" [routerLink]="l.path" routerLinkActive="bg-accent">{{ l.label }}</a></li>
    }
  </ul>
</nav>
<main class="mx-auto max-w-5xl p-6"><router-outlet /></main>
```

`src/app/app.component.spec.ts` : le `h1` n'existe plus dans `AppComponent` ; remplacer le test « should render title » par `expect(compiled.querySelectorAll('nav a').length).toBeGreaterThan(0)`.

## 5. Vérifier que Amundi est inchangé

`/amundi` rend le même prix, les mêmes chandeliers et couleurs qu'avant (capture avant/après), `curl localhost:4000/api/quotes/AMUN.PA?range=1mo` renvoie des `candles`, `curl -i localhost:4000/api/quotes/ZZZZNOPE.PA` renvoie 404, `curl -i "localhost:4000/api/quotes/bad%20sym"` renvoie 400, `pnpm lint` et `npx ng test --watch=false` passent.
