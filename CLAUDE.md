# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Angular 21 (standalone components, no NgModules; upgraded from 17) with SSR via `@angular/ssr` + Express 4. pnpm. Tailwind 4 (`.postcssrc.json`) + spartan-ng (shadcn-like; generated components in `libs/ui`, config in `components.json`). Prisma 7 + SQLite (`prisma/schema.prisma`, client generated to `server/generated`, `better-sqlite3` kept external in `angular.json`). ESLint via angular-eslint. Karma/Jasmine for tests.

## Commands

- `pnpm start` — full dev: `concurrently` runs `ng build --watch` (rebuilds the server bundle), `node --watch` on the built Express server (:4000, API + SSR) and `ng serve` (:4200, live reload; `/api` proxied to :4000 via `proxy.conf.json`). The first seconds show API errors until the first build finishes. `pnpm start:web` = `ng serve` only (no `/api`)
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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **amundi2** (242 symbols, 337 relationships, 6 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/amundi2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/amundi2/clusters` | All functional areas |
| `gitnexus://repo/amundi2/processes` | All execution flows |
| `gitnexus://repo/amundi2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
