# {{projectName}} — Agent Instructions

## Architecture

This is an **Electron desktop application** with the following structure:

| Layer | Path | Runtime |
|---|---|---|
| Main process | `src/main/` | Node.js (Electron main) |
| Preload bridge | `src/preload/` | Isolated context |
| Renderer (React) | `src/renderer/src/` | Chromium (DOM) |
| Shared types | `shared/` | Imported by all layers |

IPC channels are defined in `shared/ipc-channels.ts`. Types flow through `shared/ipc-types.ts`.

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

This project uses `electron-builder install-app-deps` as a postinstall script to automatically
rebuild native Node.js modules (C/C++ addons) against Electron's embedded Node.js version.

**When adding a native module** (e.g., `better-sqlite3`, `sharp`, `serialport`):
1. Install it as a regular dependency: `npm install better-sqlite3`
2. The `postinstall` script runs automatically and rebuilds it for Electron
3. Native modules are automatically externalized from the Vite bundle by `externalizeDepsPlugin()`
4. Add `@types/...` if available
5. Add focused boundary tests when the module affects application behavior; mock it in unit tests

**If the postinstall fails** on a native module:
- Ensure you have C++ build tools installed (Xcode Command Line Tools on macOS, Visual C++ Build Tools on Windows, `build-essential` on Linux)
- Try `npx electron-rebuild -f -w <module-name>` to rebuild just that module
- Check if the module publishes Electron-specific prebuilds (faster, no compiler needed)
