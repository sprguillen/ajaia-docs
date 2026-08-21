# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint against the project (flat config in `eslint.config.mjs`)

There is no test runner wired up yet. `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` are installed as devDependencies, but there is no `vitest.config.*`, no `test` script in `package.json`, and no test files anywhere in the repo. Set up the runner config before writing the first test.

There is a `.git` directory and one scaffold commit so far; `.gitignore` already covers `.env*` and build output.

## Architecture

- Next.js 16 (App Router, under `app/`), React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`; theme tokens defined with `@theme inline` in `app/globals.css`).
- Path alias `@/*` resolves to the project root (`tsconfig.json`).
- `app/layout.tsx` and `app/page.tsx` are still the unmodified `create-next-app` scaffold — placeholder content, not yet customized into the dashboard.
- `app/documents/[id]/page.tsx` is a route stub (renders the raw id, no data loading yet) for the future document editor screen.
- `components/` holds unimplemented stubs (`DocumentList`, `RichTextEditor`, `ShareDialog`, `ImportDialog`, `UserSwitcher`) — each returns `null` with a `TODO` comment marking the feature it will hold.
- `lib/types.ts` defines the application-layer domain types (`User`, `Document`, `DocumentShare`, `DocumentSummary`) in **camelCase**. `lib/supabase.ts` owns the Supabase client plus the only data-access functions that exist so far: `getUsers`, `getDocumentsForUser`, `createDocument`, `getDocumentById`.
- **camelCase/snake_case boundary**: the app layer (`lib/types.ts` and everything above it) is camelCase. The Supabase schema is snake_case. `lib/supabase.ts` is the only file that should reference snake_case column names — it keeps private `UserRow`/`DocumentRow` interfaces and `toUser`/`toDocument` mappers to convert raw query results into the camelCase types before returning them. Don't let `owner_id`-style keys leak past this file.
- No generated Supabase `Database` types (no `supabase gen types` codegen wired up) — the client is untyped and query results are cast by hand through the `*Row` interfaces. Reasonable for the schema's current size; revisit if it grows.
- The Tiptap packages (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`) are installed but not yet referenced anywhere — `RichTextEditor` is still a stub.

## Data model (Supabase)

Schema lives in the Supabase project itself — there's no `supabase/` directory, migration files, or schema SQL checked into this repo yet.

- `users` — `id uuid pk`, `name text`, `email text unique`, `created_at timestamptz`. Seeded with three mock users (Simon, Alice, Bob) — there is no real authentication, just a user switcher (not yet built) that picks one of these as "current user."
- `documents` — `id uuid pk`, `title text`, `content jsonb` (Tiptap doc JSON, defaults to `{"type":"doc","content":[{"type":"paragraph"}]}`), `owner_id uuid references users(id)`, `created_at`, `updated_at`.
- `document_shares` — `id uuid pk`, `document_id uuid references documents(id)`, `user_id uuid references users(id)`, `created_at`, unique on `(document_id, user_id)`. Join table for owner-based sharing; access control (`getDocumentById`) checks ownership first, then falls back to a lookup here.
- Local Supabase credentials go in `.env.local` (gitignored) as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — see `.env.local.example` for the expected keys.

## Gotchas

- Don't bump `eslint` past `^9`. `eslint-config-next@16.3.1` (pinned to the installed Next version) bundles `eslint-plugin-react`, which calls a context API that ESLint 10 removed — installing `eslint@10` makes `npm run lint` fail outright with `contextOrFilename.getFilename is not a function`. `eslint@9.39.5` is the last 9.x release and is EOL, so `npm install` will always print an "is no longer supported" deprecation warning for it — that's cosmetic and unavoidable until Next.js ships an ESLint-10-compatible `eslint-config-next`.
- The Supabase JS client has no `Database` generic here, so embedded-relation selects (e.g. `document_shares.select("documents(*)")` in `getDocumentsForUser`) come back typed as `{ documents: any[] }[]` regardless of actual cardinality. Cast through `unknown` first (as `getDocumentsForUser` does) rather than casting directly — TS rejects the direct cast as non-overlapping.
