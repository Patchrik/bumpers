# {{projectName}} — Claude Instructions

> **Read `AGENTS.md` first** for full architecture and testing details.

## The One Rule

**One prompt → five artifacts.** Every UI component change produces:
1. Component (`.tsx`)
2. Unit test (`.test.tsx`)
3. Story (`.stories.tsx`)
4. E2E test (`e2e/*.spec.ts`)
5. Screenshot (auto-generated)

For non-component code: source + unit test (minimum 2 artifacts).

## What NOT to Test

- `node_modules/`, `dist/`, config files
- Type declarations (`*.d.ts`)
- Entry points (`main.tsx`)
- Barrel/re-export files

## Teams Tab Specifics

- This is a React + Vite web app running inside a Microsoft Teams iframe
- Mock `@microsoft/teams-js` in unit tests with `vi.mock('@microsoft/teams-js')`
- The app should gracefully handle running outside Teams (standalone mode)
- User-facing components live in `src/Components/<Name>/<Name>.tsx` with matching tests and stories
- `npm run dev` is the standard local HTTPS Teams tab workflow
- If local HTTPS setup fails, run `npm run dev:setup` and then rerun `npm run dev`
- `npm run dev:teams` is the tunnel-backed integration workflow for real Teams testing
- `npm run dev:local` is the internal browser-only path for Playwright E2E
- Do not make Playwright depend on Dev Tunnels
- Do not commit `env/.env.local` or `build/`

## Pre-Commit Checklist

Before committing, ensure:
- [ ] `npm run test` — all unit tests pass
- [ ] `npm run lint` — zero errors
- [ ] `npm run format:check` — formatting clean
- [ ] `npm run test:colocate` — all source files have tests
- [ ] New component? All 5 artifacts present
- [ ] Commit message follows conventional commits (`feat:`, `fix:`, etc.)
