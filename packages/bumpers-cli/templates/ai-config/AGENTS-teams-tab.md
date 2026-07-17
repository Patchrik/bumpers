# {{projectName}} — Agent Instructions

## Architecture

This is a **Microsoft Teams Tab application** with the following structure:

| Layer | Path | Runtime |
|---|---|---|
| React app | `src/` | Browser (DOM) |
| Teams manifest | `appPackage/` | Teams platform |
| Environment config | `env/` | Build-time variables |

The app uses `@microsoft/teams-js` SDK to interact with the Teams platform.
It runs as a web page inside a Teams iframe.

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

- `npm run dev` is the normal daily Teams tab workflow on `https://localhost`.
- The first run may prompt for one-time local certificate trust or bootstrap.
- If local HTTPS setup fails, run `npm run dev:setup` and then rerun `npm run dev`.
- `npm run dev:teams` starts local HTTP Vite, opens a Microsoft Dev Tunnel, writes ignored `env/.env.local`, and creates ignored `build/appPackage.zip`.
- `npm run dev:local` is an internal script used by Playwright; do not present it as the normal user workflow.
- Do not commit `env/.env.local` or `build/`.
- The default tunnel workflow uses anonymous tunnel access so Teams can load the iframe URL. Anyone with the tunnel URL can access the local dev server while it is running.
