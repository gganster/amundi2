# server/

Code Express (BFF/API + SSR) importé par `../server.ts`, qui reste le point d'entrée (`angular.json` → `ssr.entry`). Voir le `CLAUDE.md` racine pour la stack et les commandes.

## Layout

- `config.ts` — chemins dist (`browserDistFolder`, `indexHtml`), `port`, `allowedHosts` (SSR, env `ALLOWED_HOSTS`), `databaseUrl` (env `DATABASE_URL`), `secureCookies` (vrai si `NODE_ENV=production`), `jwtSecret` (env `JWT_SECRET`, 32 caractères minimum, **obligatoire** : le démarrage échoue sans lui ; `pnpm start` le lit dans `.env.development`). Seul endroit qui lit `import.meta.url` / `process.env`.
- `db.ts` — singleton `prisma` (Prisma 7 + adapter `better-sqlite3`). Schéma dans `../prisma/schema.prisma`.
- `generated/` — client Prisma généré (gitignoré, recréé par `postinstall`). Ne pas éditer ni linter.
- `ssr.ts` — handler Angular `CommonEngine` (catch-all).
- `middleware/auth.ts` — session JWT (cookie `session`, HS256, 7 j) : `signSession`, `set/clearSessionCookie`, `requireAuth` (pose `res.locals.userId`, sinon 401). Partagé par `api/auth.ts` et `api/portfolio.ts`.
- `api/index.ts` — `Router` monté sur `/api`; un fichier par domaine (`api/<domaine>.ts`), enregistré via `api.use('/<domaine>', router)`.

## Conventions

- **Ordre dans `server.ts`** : `/api` → statiques → `ssrHandler`. Toute route doit être déclarée avant le catch-all `*`, sinon Angular l'avale.
- **Entrée unique** : `server.ts` ne contient que le câblage (`app()` + `listen`). Pas de logique métier dedans.
- **Un fichier = un domaine** ; un router n'importe jamais un autre router. Créer `middleware/` ou `services/` seulement au premier vrai besoin.
- **Config centralisée** : lire env et chemins via `config.ts`, pas de `process.env` éparpillé.
- **Imports** : chemins relatifs, sans extension, `import type` pour les types seuls.
- **Base de données** : importer `prisma` depuis `../db`, jamais `new PrismaClient()` ailleurs. `better-sqlite3` reste externe au bundle (`externalDependencies` dans `angular.json`). Lancer le serveur depuis la racine du repo (URL SQLite relative au cwd).
- **Réponses API** : JSON uniquement ; erreurs via `next(err)` (pas de `res.send` d'une stack).
- **Pas de Node-only dans `src/`** : le code Angular ne doit pas importer depuis `server/` (et inversement, seul `ssr.ts` importe `src/main.server`).
- `server/` est compilé dans le bundle serveur par le build : pas de lancement direct avec `node`/`ts-node`.

## Tester

`pnpm start` n'exécute pas ce code. Utiliser :

```
pnpm build && JWT_SECRET=<32+ caractères> PORT=4011 pnpm serve:ssr:amundi2
curl localhost:4011/api/health
```
