# {{projectName}} — Agent Instructions

## Agent Entry Points

- Codex reads this `AGENTS.md` directly.
- Claude Code loads `CLAUDE.md`, which imports this file.
- Cursor and Copilot use thin adapters that point here.
- This file is the canonical project contract; keep shared guidance here rather than duplicating it.

## Change Loop

1. Inspect nearby code, existing patterns, and the platform boundary involved.
2. Identify the observable behavior and meaningful regression risk.
3. Add or update focused verification when it can catch that regression.
4. Make the smallest correct change without weakening guardrails.
5. Run the relevant checks and report what was and was not verified.

## Architecture

This is a **Microsoft Teams Tab application** with the following structure:

| Layer | Path | Runtime |
|---|---|---|
| React app | `src/` | Browser (DOM) |
| Teams manifest | `appPackage/` | Teams platform |
| Environment config | `env/` | Build-time variables |

The app uses `@microsoft/teams-js` SDK to interact with the Teams platform.
It runs as a web page inside a Teams iframe.

### Platform Boundaries

- Keep `@microsoft/teams-js` access at a narrow integration boundary instead of spreading SDK calls through UI components.
- Preserve standalone behavior when Teams initialization or context loading is unavailable.
- Treat theme and context values as platform input and provide safe defaults.
- Make manifest changes intentionally when routes or exposed capabilities change.

---

## Risk-Based Testing

Testing is a spectrum, not a file-count rule. Use test-first thinking to define architecture, observable behavior, and regression risk; do not create a test for every source file.

Invest most in business rules, validation, state transitions, Teams SDK boundaries, standalone/error behavior, dependency-heavy components, widely reused modules, critical user journeys, and prior regressions. Usually skip tests for route/root composition, provider wiring, static configuration, declarations, re-exports, generated code, and trivial presentation.

Co-locate valuable unit tests and stories with their source. Add stories for reusable visual components with meaningful states. Keep E2E tests under `e2e/` and reserve them for critical journeys or cross-boundary behavior.

Coverage has an 80% project-wide floor for lines, functions, branches, and statements.

---

## Testing Patterns

### Unit Tests (Vitest + jsdom)
- Mock `@microsoft/teams-js` with `vi.mock('@microsoft/teams-js')`
- Use `@testing-library/react` for component tests
- Single jsdom environment (no Node process tests needed)

### E2E Tests (Playwright)
- Standard browser testing with the local Vite dev server
- `baseURL: 'http://127.0.0.1:53000'`
- Playwright uses `npm run dev:local`; do not make E2E depend on Dev Tunnels
- No Electron launch — just `page.goto('/')`

### Storybook
- Stories live next to components in `src/Components/<Name>/`
- Teams-js is mocked automatically in Storybook context

---

## Teams-Specific Patterns

- **Initialize Teams SDK** at app startup: `app.initialize()` then `app.getContext()`
- **Handle standalone mode**: App should work outside Teams for development
- **Theme support**: Read `context.app.theme` ('default', 'dark', 'contrast')
- **Manifest**: `appPackage/manifest.json` — update `staticTabs` for new pages
- **No server needed**: This is a client-side-only Tab (no bot, no API)

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the standard local HTTPS Teams tab workflow |
| `npm run dev:setup` | Run one-time local HTTPS certificate/bootstrap setup |
| `npm run dev:teams` | Start the real Teams tunnel + packaging workflow |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with project coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | ESLint |
| `npm run format:check` | Biome format check |
| `npm run test:colocate` | Verify source structure |
| `npm run storybook` | Start Storybook |

## Teams Dev Workflow

- Use `npm run dev` for normal local HTTPS development and `npm run dev:teams` only for real Teams integration.
- `npm run dev:local` is the internal Playwright server; E2E must not depend on Dev Tunnels.
- Do not commit `env/.env.local` or `build/`.
