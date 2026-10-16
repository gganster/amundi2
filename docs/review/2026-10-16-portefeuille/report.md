---
type: review
slug: portefeuille
title: Revue de feat/portefeuille contre main (PR #4)
created: 2026-10-16
scope: branche feat/portefeuille contre main (server/, src/, prisma/, package.json)
angles: bugs, security, simplicity, performance, consistency
readers: Claude Code, review:review-reader x5, modèle de la session
dropped: 3
---

# Revue de feat/portefeuille contre main (PR #4)

Analyse de l'auth JWT, des positions et de la page portefeuille. Un point majeur (secret JWT de repli en production), le reste est mineur ; aucune faille d'isolation entre comptes trouvée.

## Points

- [ ] R01 [major] `server/config.ts:17` Le refus d'un `JWT_SECRET` absent dépend de `NODE_ENV=production`, que le script `serve:ssr:amundi2` ne positionne pas : un démarrage sans variables retombe sur un secret public du dépôt (jetons forgeables, cookies sans `Secure`). Proof: `package.json:13` `"serve:ssr:amundi2": "node dist/amundi2/server/server.mjs"` sans `NODE_ENV`, aucun fichier de déploiement dans le dépôt ; `config.ts` ne fait qu'un `console.warn` en dev. -> ship
- [ ] R02 [minor] `src/app/auth/auth.guard.ts:11` La garde appelle `/api/auth/me` (requête en base) à chaque navigation et ignore `AuthService.user()` ; au chargement de `/portefeuille`, `AppComponent` (`app.component.ts:21`) fait le même appel en parallèle. Proof: les deux `me()` sont inconditionnels ; l'intercepteur gère déjà un 401 tardif. -> ship
- [ ] R03 [minor] `src/app/auth/auth.guard.ts:13` Toute erreur de `me()` (500, réseau) redirige vers `/connexion`, pas seulement un 401. Proof: `catchError(() => of(router.parseUrl('/connexion')))` sans test de `err.status` ; l'intercepteur ignore `/api/auth/*`. -> ship
- [ ] R04 [minor] `src/app/portfolio/portfolio.component.ts:70` Une requête de cours par ticker distinct, sans plafond, avec `range=1mo` alors que seuls `price` et `currency` servent ; la clé de cache serveur (`symbol:range`) ne partage rien avec les pages graphique (`3mo`). Proof: `loadPrices` boucle sur `new Set(...)` ; `quotes.ts:66` cache par `${symbol}:${range}` ; `portfolio.ts` ne limite pas le nombre de positions. -> issue
- [ ] R05 [minor] `server/api/portfolio.ts:65` `PUT` relit la ligne par `findUnique` sans tester `null` : si la position est supprimée entre les deux requêtes, réponse 200 avec corps `null`, et le client remplace la ligne par `null` (le gabarit plante sur `r.position.id`). Proof: `res.json(await prisma.position.findUnique({ where: { id } }))` ; `portfolio.component.ts:100` `p.id === id ? saved : p`. -> ship
- [ ] R06 [minor] `src/app/portfolio/portfolio.component.ts:91` `save()` n'a pas de garde « en cours » : double clic ou Entrée puis clic envoie deux POST et crée un doublon. Proof: bouton désactivé seulement sur `f.invalid` ; formulaire vidé dans le callback de succès ; pas de contrainte d'unicité côté base. Les formulaires de connexion/inscription ont `busy()`. -> ship
- [ ] R07 [minor] `src/app/portfolio/portfolio.component.ts:42` Les cours en pence (`GBp`, symboles `.L` acceptés par la regex) sont affichés comme des livres, 100 fois trop haut, et forment un total à part. Proof: vérifié avec `node -e` : `Intl.NumberFormat('fr-FR',{style:'currency',currency:'GBp'}).format(1234)` donne `1 234,00 £GB`. -> issue
- [ ] R08 [minor] `src/app/app.component.ts:25` `logout()` s'abonne sans gestionnaire d'erreur : si le POST échoue, l'utilisateur reste affiché, sans navigation ni message. Proof: `subscribe(() => ...)` seul ; `user.set(null)` est dans un `tap` exécuté au succès uniquement. -> ship
- [ ] R09 [minor] `src/app/portfolio/portfolio.component.ts:73` Le type de la réponse de cours est écrit en ligne alors que `Price` (même forme) est déjà importé. Proof: `this.http.get<{ price: number; currency: string }>` vs `Record<string, Price | null>` ligne 24. -> ship
- [ ] R10 [minor] `src/app/portfolio/valuation.ts:16` Le champ `cost` de `ValuedPosition` n'est lu nulle part. Proof: le gabarit ne lit que `r.position.*`, `r.price`, `r.value`, `r.gain`, `r.gainPct` ; `r.cost` n'apparaît pas (seul `t.cost` des totaux, ligne 88). -> ship

## Ce qui n'est pas logique

- [ ] R11 [minor] La quantité accepte 0 côté client (`portfolio.component.html:14` `min="0"`) mais le serveur et AC4 exigent `> 0` (`server/api/portfolio.ts:20`) : le navigateur valide un formulaire que le serveur refuse avec le message générique. -> ship
- [ ] R12 [minor] Le drapeau « partiel » confond cours en chargement et cours indisponible (`valuation.ts:48`, `undefined` et `null` traités pareil) : le titre « des cours sont indisponibles » s'affiche pendant le chargement, alors que le gabarit distingue déjà les deux (`portfolio.component.html:72`). AC7 ne vise que l'indisponibilité. -> ship
- [ ] R13 [minor] Le client et le serveur ordonnent différemment : le serveur trie par date d'achat décroissante (`portfolio.ts:28`), le client met la nouvelle ligne en tête ou garde l'ancien rang (`portfolio.component.ts:100`) ; l'ordre change au rechargement. -> ship
- [ ] R14 [minor] `server/CLAUDE.md:7` n'est pas à jour : `config.ts` y est décrit sans `jwtSecret`/`secureCookies` (qui fait échouer le démarrage en production) et `middleware/` n'est pas listé, alors que c'est le « premier vrai besoin » qu'il prévoit. -> ship

## Vérification

18 points remontés par les 5 relecteurs, 3 écartés, 14 retenus après fusion de 2 doublons (garde et `me()` en double). Tous confirmés par lecture du code ; R07 aussi par une commande. Écartés : `luxon` inutilisé (déjà présent sur `main`, hors branche) ; absence de limitation des tentatives de connexion / coût de bcryptjs (risque déjà accepté en 7 de la proposition) ; regex de ticker dupliquée (duplication décidée dans la proposition, avec commentaire). Fichiers `quotes.ts`, `stock-chart/` et `libs/ui/` non modifiés par la branche (`git diff --stat` vide). Les versions `jose` ^6.2.12 et `bcryptjs` ^3.0.3 n'ont pas été comparées aux avis de sécurité (non vérifié). GitNexus non utilisé (index périmé) ; recherche et lecture directes.
