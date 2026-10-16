# Yahoo Finance — endpoint `chart` (usage docs)

Provider de données de marché **gratuit, sans clé API**. API non officielle (pas de SLA, pas de doc publique) : le format peut changer, prévoir une erreur 502 propre côté backend. Vérifié le 2026-10-16.

## Requête

```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}
```

| Param      | Valeurs                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `symbol`   | `AMUN.PA` = Amundi S.A. (Euronext Paris, EUR)                            |
| `range`    | `1d 5d 1mo 3mo 6mo 1y 2y 5y 10y ytd max`                                 |
| `interval` | `1m 2m 5m 15m 30m 60m 90m 1h 1d 5d 1wk 1mo 3mo` (1m limité à 7 jours)    |

- Header `User-Agent` navigateur recommandé (sans UA, Yahoo peut répondre 429).
- Pas d'authentification, pas de cookie requis pour cet endpoint (testé avec `curl`).
- Appeler **depuis le backend uniquement** (pas de CORS côté navigateur, et on garde la main sur le format).

```
curl -A "Mozilla/5.0" "https://query1.finance.yahoo.com/v8/finance/chart/AMUN.PA?range=1mo&interval=1d"
```

## Réponse (extrait)

```json
{
  "chart": {
    "result": [{
      "meta": {
        "currency": "EUR", "symbol": "AMUN.PA", "longName": "Amundi S.A.",
        "exchangeName": "PAR", "timezone": "CEST", "gmtoffset": 7200,
        "regularMarketPrice": 88.8, "chartPreviousClose": 90.75,
        "fiftyTwoWeekHigh": 97.7, "fiftyTwoWeekLow": 60.9
      },
      "timestamp": [1789020000, 1789106400],
      "indicators": {
        "quote": [{
          "open": [90.65, 90.95], "high": [91.45, 92.5],
          "low":  [90.1, 90.8],   "close": [90.75, 92.25],
          "volume": [112345, 98765]
        }],
        "adjclose": [{ "adjclose": [90.75, 92.25] }]
      }
    }],
    "error": null
  }
}
```

- `timestamp` : secondes UNIX (UTC), tableau parallèle à `open/high/low/close/volume`.
- **Les valeurs OHLC peuvent être `null`** (jour sans cotation) : filtrer avant d'afficher.
- Erreur : `chart.result = null` et `chart.error = { code, description }` (ex. `Not Found: No data found, symbol may be delisted`), HTTP 404.
- `range` invalide : HTTP 400.

## Notes d'usage

- Cache côté backend conseillé (quelques dizaines de secondes) pour limiter les appels et éviter le rate-limiting.
- Les cours sont différés (~15 min) ; ne pas présenter comme du temps réel.

## Retrouver le ticker d'une société — endpoint `search`

```
curl -A "Mozilla/5.0" "https://query1.finance.yahoo.com/v1/finance/search?q=TotalEnergies&quotesCount=5&newsCount=0"
```

- `quotes[]` : `symbol` (ex. `TTE.PA`), `longname`, `quoteType` (`EQUITY` à retenir), `exchange` / `exchDisp` (`PAR` / `Paris`).
- Une même société a souvent plusieurs cotations (`TTE` NYSE, `TTE.PA` Paris, `FP.VI` Vienne…) : privilégier la place d'origine.
- Symbole inconnu sur `chart` : HTTP 404 (vérifié le 2026-10-16 avec `ZZZZNOPE.PA`).
- `meta.longName` peut manquer sur certains titres : repli sur `meta.shortName`.
