# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Angular 21 (standalone components, no NgModules; upgraded from 17) with SSR via `@angular/ssr` + Express 4. pnpm. Tailwind 4 (`.postcssrc.json`) + spartan-ng (shadcn-like; generated components in `libs/ui`, config in `components.json`). Prisma 7 + SQLite (`prisma/schema.prisma`, client generated to `server/generated`, `better-sqlite3` kept external in `angular.json`). ESLint via angular-eslint. Karma/Jasmine for tests.

## Commands

- `pnpm start` — dev server on :4200 (client + SSR render, **but `server.ts` is not executed**, so custom Express routes don't respond here)
- `pnpm build` — production build to `dist/amundi2/{browser,server}`
- `pnpm serve:ssr:amundi2` — run the built Express server on :4000 (`PORT` env to override); required to exercise `/api/*` routes
- `pnpm test` — Karma in watch mode; single run: `npx ng test --watch=false`; one spec: `npx ng test --include='src/app/app.component.spec.ts'`

- `pnpm lint` — ESLint on `src/`, `server/`, `server.ts` (`libs/` and `server/generated/` ignored)
- `pnpm prisma migrate dev --name <n>` — change schema; `pnpm prisma generate` runs on `postinstall`
- Add a UI component: `pnpm ng g @spartan-ng/cli:ui <name> --no-interactive`

## Architecture

Two entry points, merged config:
- Browser: `src/main.ts` → `src/app/app.config.ts` (router + `provideClientHydration`)
- Server: `src/main.server.ts` → `src/app/app.config.server.ts` (merges `appConfig` with `provideServerRendering`)

Add providers shared by both sides to `app.config.ts`; server-only ones to `app.config.server.ts`.

`server.ts` (repo root) is the Express server that renders pages with `CommonEngine` (`AngularNodeAppEngine` is the newer API; migrate if needed). SSR only accepts hosts listed in `ALLOWED_HOSTS` (default `localhost`). It is the place for a BFF/API: declare `/api/*` routes **before** the catch-all `server.get('*')`, otherwise Angular's renderer swallows them. `server.ts` is compiled into the server bundle by the build — it is not run directly.

During SSR, `HttpClient` calls need absolute URLs.

## Documentation externe

`docs/external/` contient les docs d'usage des librairies (récupérées via `ctx7`) : `angular.md` (angular.dev, version récente — le projet est en 17.3), `prisma.md`, `tailwind.md` (v4), `spartan.md`. À consulter avant d'écrire du code qui les utilise. Attention : `angular.md` couvre des APIs absentes d'Angular 17 (ex. `resource()`).
