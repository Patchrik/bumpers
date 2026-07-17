# {{projectName}} — Claude Instructions

> **Read `AGENTS.md` first** for full architecture and testing details.

## Testing Policy

Testing is a risk-based spectrum, not an artifact quota. Use test-first thinking to identify architecture, observable behavior, and regression risk before implementation.

- Prioritize business rules, state transitions, Teams SDK boundaries, standalone/error behavior, dependency-heavy components, and widely reused code.
- Add regression tests for bugs and E2E tests for critical user journeys.
- Do not test every file. Skip trivial rendering, framework wiring, static config, declarations, re-exports, and generated code.
- Co-locate valuable unit tests with their source. Add stories only for reusable visual components with meaningful states.
- Keep project-wide line, function, branch, and statement coverage at or above 80%; run `npm run test:coverage`.

## Teams Tab Specifics

- This is a React + Vite web app running inside a Microsoft Teams iframe
- Mock `@microsoft/teams-js` in unit tests with `vi.mock('@microsoft/teams-js')`
- The app should gracefully handle running outside Teams (standalone mode)
- User-facing components live in `src/Components/<Name>/<Name>.tsx`
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
- [ ] `npm run test:colocate` — source structure is valid
- [ ] Tests protect the highest-risk behavior changed
- [ ] Commit message follows conventional commits (`feat:`, `fix:`, etc.)
