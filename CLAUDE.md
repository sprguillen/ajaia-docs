# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint against the project (flat config in `eslint.config.mjs`)

There is no test runner wired up yet. `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` are installed as devDependencies, but there is no `vitest.config.*`, no `test` script in `package.json`, and no test files anywhere in the repo. Set up the runner config before writing the first test.

This directory is not a git repository (no `.git`); `.gitignore` is present in anticipation of one.

## Architecture

- Next.js 16 (App Router, under `app/`), React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`; theme tokens defined with `@theme inline` in `app/globals.css`).
- Path alias `@/*` resolves to the project root (`tsconfig.json`).
- `app/layout.tsx` and `app/page.tsx` are still the unmodified `create-next-app` scaffold — placeholder content, not yet customized.
- `@supabase/supabase-js` and the Tiptap packages (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`) are installed but not yet referenced anywhere in `app/` — no Supabase client/config and no editor component exist yet. This points toward a Supabase-backed rich-text editing feature that hasn't been started.

## Gotchas

- Don't bump `eslint` past `^9`. `eslint-config-next@16.3.1` (pinned to the installed Next version) bundles `eslint-plugin-react`, which calls a context API that ESLint 10 removed — installing `eslint@10` makes `npm run lint` fail outright with `contextOrFilename.getFilename is not a function`. `eslint@9.39.5` is the last 9.x release and is EOL, so `npm install` will always print an "is no longer supported" deprecation warning for it — that's cosmetic and unavoidable until Next.js ships an ESLint-10-compatible `eslint-config-next`.
