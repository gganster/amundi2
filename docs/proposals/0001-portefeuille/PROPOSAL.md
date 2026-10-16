---
proposal_id: "0001"
slug: "portefeuille"
title: "Portefeuille personnel : authentification JWT et positions"
status: Accepted
format: propose
author: "gganster"
created: "2026-10-16"
updated: "2026-10-16"
stepsCompleted: [context, interview, design, risks, plan]
scope_path: "/"
source_brief: "docs/brief/portefeuille/"
auto_mode: false
skip_review: true
vcs: git
base: main
branch: feat/portefeuille
---

# 0001 : Portefeuille personnel : authentification JWT et positions

## 1. Résumé

Le brief `docs/brief/portefeuille/` demande un portefeuille tenu à la main, privé par utilisateur. Cette proposition retient : un JWT HS256 (`jose`) dans un cookie `httpOnly` valable 7 jours, des mots de passe hachés avec `bcryptjs`, une garde d'accès côté client seulement, et une valorisation calculée dans le navigateur à partir de `/api/quotes` sans modifier ce router. Impact : 2 modèles Prisma, 2 routers Express, un middleware, 2 dépendances, une page de connexion/inscription et une page portefeuille. Les quatre choix techniques (jeton, rendu SSR, durée, hachage) viennent du demandeur ; leurs conséquences sont en 7.

## 3. Problème et motivation

Voir le brief. Le code actuel n'a ni utilisateur ni donnée métier : Prisma ne contient que le modèle de démonstration `Note`, et l'API n'expose que `/api/quotes/:symbol` (cours Yahoo, cache 60 s) et `/api/notes`.

## 4. Objectifs et non-objectifs

Objectifs et non-objectifs : ceux du brief (AC1 à AC10, section Out-of-scope). Non-objectif ajouté ici : aucune révocation de session côté serveur.

## 5. Alternatives envisagées

| Décision | Retenu | Écarté | Pourquoi |
|---|---|---|---|
| Session | JWT sans état dans un cookie | Session serveur en table SQLite ; `express-session` + store | Choix du demandeur. Contrepartie : pas de révocation avant expiration (voir 7). |
| Rendu SSR des pages protégées | Garde côté client | Garde aussi côté serveur (cookie lu par le SSR, 302) | Choix du demandeur. Évite de transmettre la requête Express au moteur SSR et le cookie aux appels `HttpClient` serveur ; même schéma que le graphique existant. |
| Durée du jeton | 7 jours, sans renouvellement | 1 jour ; jeton court + refresh | Choix du demandeur. Un refresh token ramènerait une table de sessions. |
| Hachage | `bcryptjs` | `scrypt` de `node:crypto` ; `argon2` natif | Choix du demandeur. Pur JS, rien à compiler. Limite de 72 octets gérée en 6. |
| Valorisation | Côté navigateur via `/api/quotes` | Côté serveur dans `portfolio.ts` | `quotes.ts` est hors périmètre et un router n'importe pas un autre router (`server/CLAUDE.md`) ; extraire un service de cours serait un refactor séparé. |
| Statu quo | Aucun portefeuille | | Ne répond pas au brief. |

## 6. Conception retenue

### Données (`prisma/schema.prisma`)

```prisma
model User {
  id           Int        @id @default(autoincrement())
  email        String     @unique   // stocké en minuscules, sans espaces
  passwordHash String
  createdAt    DateTime   @default(now())
  positions    Position[]
}

model Position {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ticker      String
  quantity    Float
  unitCost    Float
  purchasedAt DateTime
  createdAt   DateTime @default(now())
  @@index([userId])
}
```

`Note` reste en place (hors périmètre). Migration : `pnpm prisma migrate dev --name auth_portfolio`. `Float` pour les montants : suffisant pour un suivi personnel sans conversion (voir 7).

### Serveur

- `server/config.ts` : ajoute `jwtSecret` (env `JWT_SECRET`, 32 caractères minimum) et `secureCookies` (vrai si `NODE_ENV=production`). En production, un secret absent fait échouer le démarrage ; en développement, un secret fixe avec un avertissement console.
- `server/middleware/auth.ts` (premier besoin d'un middleware partagé, que `server/CLAUDE.md` prévoit) : `signSession(userId)` (`SignJWT`, `HS256`, `sub`, `exp` 7 j), `setSessionCookie` / `clearSessionCookie` (nom `session`, `httpOnly`, `sameSite: 'lax'`, `secure` selon la config, `path: '/'`, `maxAge` 7 j) et `requireAuth`. `requireAuth` lit l'en-tête `Cookie` (petite fonction, pas de `cookie-parser`), appelle `jwtVerify` avec `algorithms: ['HS256']` explicite, pose `res.locals.userId`, sinon répond 401 JSON.
- `server/api/index.ts` : `api.use(express.json())` avant les routers, puis `api.use('/auth', auth)` et `api.use('/portfolio', portfolio)`.
- `server/api/auth.ts` :
  - `POST /register` : e-mail valide, mot de passe de 8 caractères minimum et 72 octets maximum (`bcrypt.truncates`, sinon 400 plutôt qu'une troncature silencieuse). Hash `bcrypt.hash(password, 12)`. E-mail déjà pris : 409. Succès : 201 + cookie.
  - `POST /login` : si l'utilisateur est inconnu, on compare quand même avec un hash factice pour garder un temps de réponse comparable ; réponse 401 « identifiants invalides » identique dans les deux cas. Succès : 200 + cookie.
  - `POST /logout` : supprime le cookie, 204.
  - `GET /me` : `requireAuth`, puis relit l'utilisateur en base ; s'il n'existe plus, 401. Renvoie `{ id, email }`.
- `server/api/portfolio.ts` (tout derrière `requireAuth`) :
  - `GET /positions` ; `POST /positions` ; `PUT /positions/:id` ; `DELETE /positions/:id`.
  - Le filtre par utilisateur est dans la requête elle-même : `updateMany` / `deleteMany` avec `where: { id, userId }`, puis 404 si `count === 0`. Une position d'autrui est indiscernable d'une position inexistante (AC8).
  - Validation : `ticker` avec la même expression que `quotes.ts` (`^[A-Z0-9-]{1,10}(\.[A-Z]{1,3})?$`, dupliquée avec un commentaire car `quotes.ts` ne doit pas être modifié), `quantity > 0` fini, `unitCost >= 0` fini, `purchasedAt` date valide, `:id` entier.
- CSRF : cookie `SameSite=Lax` et corps JSON uniquement. `express.json` ignore les autres types de contenu, donc un formulaire inter-sites produit un corps vide rejeté par la validation (400), et un `fetch` JSON inter-sites exige un preflight CORS que l'API ne répond pas.

### Client (`src/app/`)

- `auth/auth.service.ts` : signal `user`, `me()`, `login()`, `register()`, `logout()`.
- `auth/auth.guard.ts` : `CanActivateFn`. Côté serveur (`isPlatformServer`), retourne `true` : la page est rendue sans données privées. Côté navigateur, appelle `me()` et retourne un `UrlTree` vers `/connexion` en cas de 401.
- `auth/auth.interceptor.ts` (ajouté dans `app.config.ts`) : sur un 401 d'une route protégée (jeton expiré), vide `user` et redirige vers `/connexion`.
- `auth/login.component.ts`, `auth/register.component.ts` : formulaires `@angular/forms`, erreurs de validation et de serveur visibles.
- `portfolio/portfolio.component.ts` : charge les positions dans `afterNextRender` (jamais pendant le SSR), puis un appel `/api/quotes/:symbol?range=1mo` par ticker distinct, en parallèle ; une erreur sur un ticker le marque « cours indisponible » sans bloquer les autres (AC7). Ajout/modification par un formulaire en ligne ; suppression après `window.confirm` (pas de nouveau composant dans `libs/ui`, hors périmètre).
- `portfolio/valuation.ts` : fonction pure `valuePositions(positions, prices)` renvoyant, par position, valeur et plus ou moins-value, et les totaux **par devise** (devise du cours, sans conversion). Positions sans cours exclues des totaux, avec un drapeau « partiel » (AC6, AC7). Testée par un spec Karma.
- `app.routes.ts` : `connexion`, `inscription`, et `portefeuille` (`canActivate: [authGuard]`, `data: { label: 'Portefeuille' }` pour apparaître dans le menu). `app.component.*` : bouton Déconnexion et e-mail courant.
- Lien vers le graphique (AC10) : la correspondance ticker → route se déduit de `routes` (`data.symbol`), sans dupliquer `AMUN.PA` ni `TTE.PA`.

## 7. Inconvénients et risques

- **Pas de révocation.** Un jeton volé reste valable 7 jours ; seul le changement de `JWT_SECRET` invalide tout (déconnecte tous les utilisateurs). Accepté par le demandeur. Un utilisateur supprimé garde un jeton valide, mais `/me` relit la base, donc la garde le refuse.
- **Pas de limitation de tentatives de connexion.** `bcryptjs` à coût 12 occupe le processus plusieurs centaines de millisecondes par essai (estimation non mesurée) ; un attaquant peut le saturer. À ajouter (limiteur en mémoire par IP) avant toute exposition publique. Question ouverte, propriétaire : le demandeur, avant la mise en ligne.
- **Limite de 72 octets de bcrypt** : mots de passe plus longs refusés explicitement. La fonction `truncates()` est documentée dans `bcryptjs`.
- **Coût de bcrypt** : OWASP place le minimum à 10 d'après des sources secondaires (la fiche OWASP elle-même n'a pas été relue) ; coût 12 retenu, constante unique à ajuster après mesure.
- **Clignotement** pour un visiteur non connecté avant la redirection (garde client uniquement).
- **Devises** : pas de conversion, totaux séparés par devise. Le prix de revient est supposé exprimé dans la devise du cours ; une ligne AAPL saisie en euros serait fausse. À documenter dans l'interface.
- **Flottants** pour les montants : écarts d'arrondi possibles, d'où un arrondi à l'affichage uniquement.
- **Appels aux cours** : un appel par ticker distinct à chaque ouverture ; atténué par le cache de 60 s de `quotes.ts`.
- **E-mail déjà pris** : le 409 révèle l'existence d'un compte, assumé par AC1.
- **Retour arrière** : la migration est additive (nouvelles tables). Un revert du code suffit ; ne supprimer les tables que par une migration inverse.

## 9. Recommandation et justification

Suivre cette conception telle quelle. Confiance : moyenne à haute pour un usage personnel. Réexaminer si l'application est exposée sur Internet (limitation de tentatives, révocation, garde SSR), si plusieurs devises deviennent courantes (conversion, type décimal), ou si la révocation de session devient nécessaire (session serveur).

## 10. Plan d'implémentation

Boundary — Owns : `prisma/`, `server/middleware/`, `server/api/auth.ts`, `server/api/portfolio.ts`, `src/app/auth/`, `src/app/portfolio/`. Modifications minimales de fichiers partagés : `server/api/index.ts`, `server/config.ts`, `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/app.component.ts` et `.html`, `package.json` / `pnpm-lock.yaml` (ajout de `jose` et `bcryptjs`, dernières versions au moment de l'installation). Must not touch : `server/api/quotes.ts`, `src/app/stock-chart/`, `libs/ui/`.

| ID | Title | Files | Depends on | Effort |
|---|---|---|---|---|
| P01 | Modèles `User` et `Position` + migration | `prisma/schema.prisma`, `prisma/migrations/` | - | S |
| P02 | Auth serveur : config, middleware, routes `/api/auth/*`, `express.json` | `server/config.ts`, `server/middleware/auth.ts`, `server/api/auth.ts`, `server/api/index.ts`, `package.json` | P01 | M |
| P03 | Auth Angular : service, garde, intercepteur, pages connexion/inscription, menu | `src/app/auth/`, `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/app.component.*` | P02 | M |
| P04 | API positions scopée par utilisateur | `server/api/portfolio.ts`, `server/api/index.ts` | P01, P02 | S |
| P05 | Page portefeuille : CRUD, valorisation, totaux par devise, liens graphique | `src/app/portfolio/`, `src/app/app.routes.ts` | P03, P04 | M |

Correspondance avec les tâches du brief : T01 = P01 + P02 + P03 (issue #1) ; T02 = P04 (issue #2) ; T03 = P05 (issue #3).

Vérification :
- P02, P04 : `pnpm build && PORT=4011 pnpm serve:ssr:amundi2`, puis `curl` (inscription, connexion avec `-c`/`-b` pour le cookie, 401 sans cookie, 404 sur la position d'un autre compte, redémarrage du serveur). `pnpm start` n'exécute pas le serveur compilé (`server/CLAUDE.md`).
- P03, P05 : parcours dans le navigateur ; spec Karma de `valuation.ts` (totaux par devise, position sans cours exclue, totaux marqués partiels) ; `npx ng test --watch=false` et `pnpm lint`.
