# {{projectName}} — Copilot Instructions

Read AGENTS.md for full details.

## Testing Policy
- Testing is risk-based, not one test per file.
- Use test-first thinking to define architecture, observable behavior, and regression risk.
- Prioritize Teams SDK boundaries, business rules, error paths, dependency-heavy components, and widely reused code.
- Skip trivial rendering, framework wiring, static config, re-exports, and generated code.
- Use E2E for critical journeys and stories for reusable visual components with meaningful states.

## Testing Stack
- Unit: Vitest + @testing-library/react
- E2E: Playwright (browser, not Electron) using `npm run dev:local`
- Stories: Storybook
- Coverage: 80% project-wide minimum

## Teams Tab Specifics
- React + Vite web app inside Teams iframe
- Mock @microsoft/teams-js in tests
- Handle standalone mode outside Teams
- User-facing components live in src/Components/<Name>/<Name>.tsx
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
- npm run test:colocate (source structure is valid)
