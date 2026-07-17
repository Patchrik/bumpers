# {{projectName}} — Agent Instructions

## Agent Entry Points

- Codex reads this `AGENTS.md` directly.
- Claude Code loads `CLAUDE.md`, which imports this file.
- Cursor and Copilot use thin adapters that point here.
- This file is the canonical project contract; keep shared guidance here rather than duplicating it.

## Change Loop

1. Inspect nearby code, existing patterns, and the runtime boundary involved.
2. Identify the observable behavior and meaningful regression risk.
3. Add or update focused verification when it can catch that regression.
4. Make the smallest correct change without weakening guardrails.
5. Run the relevant checks and report what was and was not verified.

## Architecture

This is an **Electron desktop application** with the following structure:

| Layer | Path | Runtime |
|---|---|---|
| Main process | `src/main/` | Node.js (Electron main) |
| Preload bridge | `src/preload/` | Isolated context |
| Renderer (React) | `src/renderer/src/` | Chromium (DOM) |
| Shared types | `shared/` | Imported by all layers |

IPC channels are defined in `shared/ipc-channels.ts`. Types flow through `shared/ipc-types.ts`.

### Runtime Boundaries

- Renderer code must not import Electron or Node APIs; use the typed preload API on `window.electronAPI`.
- Preload exposes narrow, least-privilege capabilities rather than raw Electron primitives.
- Main owns filesystem, process, native module, and other privileged side effects.
- Treat renderer IPC input as untrusted. Validate it in the main process before performing privileged work.

---

## Risk-Based Testing

Testing is a spectrum, not a file-count rule. Test-first work should clarify the architecture, observable behavior, and regression risk before implementation. It does not mean every source file needs a test.

Invest most in tests for:
- Business rules, validation, state transitions, and error paths
- Electron security settings, IPC, preload APIs, native modules, and other process boundaries
- Components with many dependencies, complex interactions, or many consumers across the app
- Critical user journeys and previously reported regressions

Usually skip tests that only restate framework behavior, route/root composition, provider wiring, static configuration, declarations, re-exports, generated code, or trivial presentation. Prefer deleting a low-value test over maintaining assertions that cannot catch a meaningful regression.

When a test is valuable, add or update it before implementation when practical. Otherwise add it with the behavior change. Co-locate unit tests with their source; keep E2E tests under `e2e/`.

---

## Testing Patterns

### Unit tests (Vitest)
- **Renderer**: Use `@testing-library/react` — `render()`, `screen.getByRole()`, user events
- **Main process**: Mock `electron` module, test pure functions directly
- **Preload**: Mock `contextBridge` and `ipcRenderer`, verify API shape

### E2E tests (Playwright)
- Launch Electron via `_electron.launch({ args: ['.'] })`
- Always `npm run build` before E2E (Playwright needs compiled app)
- Use `data-testid` attributes for reliable selectors
- Screenshot tests: `await expect(page).toHaveScreenshot('name.png')`

### Storybook Stories
- Stories live co-located with the component: `Component.stories.tsx` next to `Component.tsx`
- Add stories for reusable visual components and meaningful states such as loading, error, empty, with data, and interactive
- **Storybook + Electron:** Storybook runs in a regular browser, NOT inside Electron. `window.electronAPI` is automatically mocked via `.storybook/mocks/electronAPI.ts`. If your component needs specific IPC responses, create story-level decorators that override the mock.
- Never import from `electron` directly in renderer components — always go through `window.electronAPI`

---

## Coverage Rules

- Minimum **80% project-wide** (lines, functions, branches, statements)
- Run `npm run test:coverage` to check
- Never reduce thresholds in `vitest.config.ts`

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Electron in dev mode |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:colocate` | Verify source structure |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Biome |
| `npm run format:check` | Check formatting |
| `npm run storybook` | Launch Storybook |

---

## Conventions

- **TypeScript**: Strict mode, no `any`, no unused variables
- **Commits**: Conventional commits (enforced by commitlint)
  - `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
- **IPC naming**: `domain:action` (e.g., `example:list`, `users:create`)
- **File naming**: kebab-case for files, PascalCase for components
- **Test co-location**: Keep valuable unit tests next to the source they validate

---

## Native Modules

Native modules are externalized from the Vite bundle and rebuilt for Electron by the `postinstall` script. Keep their use in main-process boundaries and mock them in focused unit tests.
