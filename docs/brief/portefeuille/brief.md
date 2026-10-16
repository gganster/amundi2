---
type: brief
slug: portefeuille
title: Gestion du portefeuille (CRM interne)
status: ready
created: 2026-10-16
next_action: ajouter authentification et portefeuille personnel (lignes saisies à la main) à l'application
resume_cmd: /ship docs/brief/portefeuille
base: main
branch: feat/portefeuille
issues: "#1-#3"
---

# Gestion du portefeuille (CRM interne)

## Problem

Le dashboard affiche des cours (Amundi, TotalEnergies) mais l'utilisateur ne peut pas y consigner ce qu'il détient. Il n'a aucun endroit dans l'application pour suivre ses positions, leur valeur et sa plus ou moins-value.

## Users

- Investisseur individuel qui tient à jour son portefeuille à la main, comme une fiche CRM. Il ne passe aucun ordre et n'est relié à aucun courtier.

## Goals

- Se créer un compte et se connecter ; chaque utilisateur ne voit et ne modifie que son propre portefeuille.
- Tenir à jour ses positions (ajout, modification, suppression) sans quitter l'application.
- Voir la valeur courante et la plus ou moins-value de chaque position et du total.

## Acceptance criteria

- AC1 Un visiteur peut créer un compte (e-mail + mot de passe) puis se connecter ; un e-mail déjà utilisé est refusé avec un message clair.
- AC2 Sans être connecté, la page portefeuille et ses données sont inaccessibles (redirection vers la connexion ; l'API répond 401).
- AC3 Un utilisateur connecté peut se déconnecter ; après cela, AC2 s'applique de nouveau.
- AC4 Un utilisateur connecté peut ajouter une position : ticker, quantité (> 0), prix de revient unitaire (≥ 0), date d'achat. Un ticker au format invalide est refusé.
- AC5 Il peut modifier et supprimer une position existante ; la suppression demande une confirmation.
- AC6 La liste affiche, par position, quantité, prix de revient, cours actuel, valeur courante et plus ou moins-value (montant et %), plus les totaux du portefeuille.
- AC7 Si le cours d'un ticker est indisponible, la position reste affichée avec ses données saisies et un indicateur « cours indisponible » ; elle est exclue des totaux de valeur courante, qui le signalent.
- AC8 Deux utilisateurs ne voient jamais les positions l'un de l'autre, même en appelant l'API directement avec l'identifiant d'une position d'autrui (réponse 404).
- AC9 Les données (comptes, positions) survivent à un redémarrage du serveur.
- AC10 Une position dont le ticker est Amundi ou TotalEnergies propose un lien vers sa page de graphique existante.

## Success metrics

Un nouvel utilisateur crée son compte, saisit deux positions et voit leurs plus ou moins-values en moins de deux minutes, sans aide. Pas de métrique chiffrée plus fine : outil personnel.

## Out-of-scope

- Passage d'ordres, connexion à un courtier ou à une banque, import de relevés : aucune écriture vers l'extérieur.
- Historique de transactions (achats/ventes datés) : une ligne représente l'état courant d'une position.
- Plusieurs portefeuilles par utilisateur, partage de portefeuille, rôles ou administration.
- Réinitialisation de mot de passe par e-mail, vérification d'e-mail, connexion sociale (OAuth).
- Multi-devises : les montants sont affichés dans la devise du cours ; pas de conversion.
- Graphiques d'évolution de la valeur du portefeuille dans le temps.

## Constraints and assumptions

- Seule connexion externe conservée : la lecture des cours Yahoo existante (`server/api/quotes.ts`), pour la valeur courante uniquement. À confirmer : si zéro appel externe est exigé, la valeur ne se calcule que sur les prix saisis.
- Hypothèse (non précisée par le demandeur) : inscription libre par e-mail + mot de passe, session par cookie côté serveur. À revoir si les comptes doivent être créés par un administrateur.
- Les comptes et positions vivent dans la base SQLite via Prisma ; le modèle `Note` de démonstration peut être remplacé.
- Les mots de passe ne sont jamais stockés en clair ni renvoyés par l'API.
- Tout endpoint portefeuille filtre par utilisateur authentifié côté serveur, jamais d'après un identifiant fourni par le client.
- Décisions techniques ouvertes (mécanisme de session, algorithme de hachage) : traitées au moment de l'implémentation ou par une proposition.

## Boundary

Owns:
- `prisma/`
- `server/api/auth.ts`
- `server/api/portfolio.ts`
- `src/app/auth/`
- `src/app/portfolio/`

Must not touch:
- `server/api/quotes.ts`
- `src/app/stock-chart/`
- `libs/ui/`
