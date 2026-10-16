---
name: add-stock-page
description: Ajoute une entreprise cotée au dashboard : résout le ticker Yahoo Finance, ajoute une route Angular avec le graphique en chandeliers (style Amundi), l'entrée du menu, puis teste dans le navigateur. Utiliser pour « ajoute <société> au dashboard », « affiche le cours de <société> », nouvelle action.
---

# Ajouter une société cotée au dashboard

**Registre : LOW freedom** pour le câblage (une seule route, rien d'autre à créer) ; **HIGH freedom** pour la résolution du ticker et la lecture du rendu.

Principe : une société = **une entrée dans `src/app/app.routes.ts`**. Le graphique (`StockChartComponent`), la page (`StockPageComponent`), l'API (`/api/quotes/:symbol`) et le menu (dérivé des routes) sont partagés, donc le style Amundi (chandeliers `lightweight-charts`, vert `#3f9f22` / rouge `#e2001a`, composants spartan `hlm*`, tokens Tailwind) est identique par construction. Ne pas dupliquer de composant ni de CSS par société.

## 0. Prérequis (une seule fois)

Lire `src/app/stock-chart/stock-chart.component.ts`. Si `symbol = input` est absent (code encore codé en dur sur Amundi), appliquer d'abord `references/bootstrap.md`, puis continuer.

## 1. Résoudre le ticker

Interroger l'endpoint `search` décrit dans `docs/external/yahoo-finance-chart.md`, retenir `quoteType: EQUITY` sur la place d'origine de la société (`.PA` pour Paris, aucun suffixe pour NYSE/Nasdaq). Plusieurs cotations plausibles : prendre la place d'origine et le dire dans le compte rendu, ne pas bloquer.

Valider ensuite le symbole sur `chart` (`curl -A "Mozilla/5.0" ".../v8/finance/chart/<SYMBOL>?range=1mo&interval=1d"`) : HTTP 200, `meta.currency` et `meta.longName` présents (sinon `shortName`), `timestamp` non vide.

## 2. Ajouter la route

Dans `src/app/app.routes.ts`, ajouter après les routes existantes :

```ts
{ path: '<slug>', component: StockPageComponent, data: { symbol: '<SYMBOL>', label: '<Nom court>' } },
```

`<slug>` : nom en minuscules, sans accent ni espace (`totalenergies`). Le menu et le titre se mettent à jour seuls ; aucun autre fichier ne change.

## 3. Tester dans le navigateur

1. Serveur : `pnpm start` (laisser tourner, premières secondes d'erreurs API normales). Si `/api/*` répond 404 ou du HTML, reconstruire (`pnpm build`) et lancer `pnpm serve:ssr:amundi2`.
2. API : `curl localhost:4000/api/quotes/<SYMBOL>?range=1mo` → JSON avec `candles` non vide.
3. UI, avec Claude in Chrome (sinon Puppeteer) sur `http://localhost:4200/<slug>` :
   - `[data-testid=price]` affiche un prix et une variation ; `[data-testid=chart] canvas` existe ;
   - cliquer chaque bouton de période (1M…5A) : le graphique se redessine, aucune erreur console (`read_console_messages`) ;
   - le lien du menu est actif et les autres sociétés restent accessibles ;
   - capture d'écran comparée à la page Amundi : mêmes couleurs, même cadre, même densité.
4. Contrôles statiques : `pnpm lint` et `npx ng test --watch=false`.

## Exemple (illustratif)

> « Ajoute TotalEnergies. »
> Search `TotalEnergies` → `TTE` (NYSE) et `TTE.PA` (Paris) → retenu `TTE.PA`, EUR.
> `chart/TTE.PA` → 200, `longName: TotalEnergies SE`.
> Route : `{ path: 'totalenergies', component: StockPageComponent, data: { symbol: 'TTE.PA', label: 'TotalEnergies' } }`.
> Test : `/totalenergies` affiche 79.43 EUR, chandeliers, 5 périodes, 0 erreur console.
> Compte rendu : ticker retenu et pourquoi, fichier modifié, preuves du test.

## Critères de fin

- `git diff` ne touche que `src/app/app.routes.ts` (hors bootstrap).
- La réponse de `/api/quotes/<SYMBOL>` a été relue (pas seulement un 200) : `candles` non vide, devise cohérente avec la place.
- Le rendu de la page a été regardé (capture) et la console relue après avoir cliqué toutes les périodes.
- `pnpm lint` et les tests passent.
- Le compte rendu nomme le ticker retenu et signale toute cotation alternative écartée.
