# {{projectName}} — Copilot Instructions

Read AGENTS.md for full details.

## Key Rule: Five Artifacts per Component
Every UI component change must produce:
1. Component (.tsx)
2. Unit test (.test.tsx)
3. Storybook story (.stories.tsx)
4. E2E test (e2e/*.spec.ts)
5. Screenshot test (auto-generated)

## Testing Stack
- Unit: Vitest + @testing-library/react
- E2E: Playwright (browser, not Electron) using `npm run dev:local`
- Stories: Storybook
- Coverage: 80% minimum per file, auto-ratchet

## Teams Tab Specifics
- React + Vite web app inside Teams iframe
- Mock @microsoft/teams-js in tests
- Handle standalone mode outside Teams
- User-facing components live in src/Components/<Name>/<Name>.tsx with matching tests and stories
- `npm run dev` is the standard local HTTPS Teams tab workflow
- If local HTTPS setup fails, run `npm run dev:setup` and then rerun `npm run dev`
- `npm run dev:teams` is the tunnel-backed integration workflow for real Teams testing
- `npm run dev:local` is the internal browser-only path for E2E
- Do not make Playwright depend on Dev Tunnels
- Do not commit `env/.env.local` or `build/`

## Before Committing
- npm run test (unit tests pass)
- npm run lint (zero errors)
- npm run format:check (clean)
- npm run test:colocate (all files have tests)
