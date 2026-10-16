---
type: tasks
slug: portefeuille
source_brief: docs/brief/portefeuille/brief.md
---

# Tasks: Gestion du portefeuille (CRM interne)

## Relevant Files

- `prisma/schema.prisma` - contient seulement le modèle `Note` de démonstration ; accueille `User` et `Position`.
- `server/api/index.ts` - monte les routers par domaine ; y brancher `auth` et `portfolio` (avant le catch-all SSR).
- `server/api/quotes.ts` - fournit les cours réutilisés pour la valeur courante ; ne pas modifier.
- `server/config.ts` - seul endroit qui lit l'environnement (ex. secret de session).
- `src/app/app.routes.ts` - routes Angular à compléter (connexion, inscription, portefeuille, garde d'accès).
- `src/app/app.component.html` - menu de navigation : entrée « Portefeuille », connexion/déconnexion.
- `src/app/stock-page/stock-page.component.ts` - cible des liens depuis une position (AC10).

## Tasks

Ordered. Each task closes the acceptance criteria it names.

## T01 - Comptes et session [#1](https://github.com/gganster/amundi2/issues/1)

Closes: AC1, AC2, AC3, AC9

- [ ] Un visiteur crée un compte et se connecte ; e-mail en double refusé
- [ ] Mot de passe haché en base, jamais renvoyé par l'API
- [ ] Déconnexion possible ; l'API protégée répond 401 sans session
- [ ] Pages de connexion/inscription et garde d'accès côté Angular (redirection vers la connexion)
- [ ] Comptes conservés après redémarrage du serveur

## T02 - Positions du portefeuille (CRUD) [#2](https://github.com/gganster/amundi2/issues/2)

Closes: AC4, AC5, AC8, AC9

- [ ] Ajout d'une position avec validation (ticker, quantité > 0, prix ≥ 0, date)
- [ ] Modification et suppression (avec confirmation) d'une position
- [ ] Chaque requête est filtrée par l'utilisateur de la session ; la position d'autrui renvoie 404
- [ ] Positions conservées après redémarrage du serveur

## T03 - Valorisation et affichage [#3](https://github.com/gganster/amundi2/issues/3)

Closes: AC6, AC7, AC10

- [ ] Page portefeuille : liste avec quantité, prix de revient, cours, valeur et plus ou moins-value (montant et %)
- [ ] Totaux du portefeuille
- [ ] Cours indisponible : position visible, indicateur affiché, totaux signalés comme partiels
- [ ] Lien vers la page graphique pour Amundi et TotalEnergies
- [ ] Entrée « Portefeuille » dans le menu
