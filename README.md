# Bumpers

> Scaffold apps with testing guardrails baked in.

Bumpers is an orchestrator CLI. It calls real npm/npx tools (Vitest, Playwright, Storybook, ESLint, etc.), writes their config files, writes example source + test files, writes AI instruction files (AGENTS.md), and initializes a git repo.

**It does NOT reimplement any testing tool.** It wires them together so every project starts with the full test pyramid.

## Install

Bumpers is distributed from GitHub Releases rather than the public npm registry.

```bash
# install globally
npm install -g https://github.com/Patchrik/bumpers/releases/download/v0.1.0/bumpers-0.1.0.tgz

# or run without a global install
npx --yes --package=https://github.com/Patchrik/bumpers/releases/download/v0.1.0/bumpers-0.1.0.tgz -- bumpers up my-app --electron
```

The package itself is fetched from GitHub and is not searchable on npmjs.com. Its installation and generated projects may still download dependencies from npm.

## Quick Start

Use Bumpers in either non-interactive headless mode or interactive wizard mode.

Headless mode is best for repeatable setup, scripts, CI, and LLM/agent-driven workflows. Pass an explicit template flag so Bumpers can scaffold without prompts:

```bash
# headless mode: recommended for LLMs, agents, scripts, and CI
bumpers up my-app --electron
cd my-app
npm run dev
```

Interactive mode is best when a human wants to choose options in a terminal wizard. Omit the template flag to launch prompts:

```bash
# interactive mode: prompts for template and template options
bumpers up my-app
```

For the React SPA template, the non-interactive flags and interactive flow let you choose:

- `--router`: `tanstack`, `react-router`, `wouter`, or `none`
- `--state`: `zustand`, `jotai`, `redux-toolkit`, or `none`
- Data layer:
  - default stacks use Axios + TanStack Query
  - Redux Toolkit stacks automatically use Fetch + RTK Query

## What You Get

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests + project-level coverage (80%) |
| **Playwright** | E2E + screenshot tests for Electron |
| **Storybook** | Component stories |
| **ESLint** | Strict, type-aware linting |
| **Biome** | Formatting + import sorting |
| **Lefthook** | Git hooks (pre-commit, pre-push) |
| **Commitlint** | Conventional commit enforcement |
| **GitHub Actions** | CI on 3 OSes (Ubuntu, Windows, macOS) |

## React SPA Template

The React template is no longer a single fixed stack. It scaffolds a router and state-management variant on top of the same guardrails, tests, Storybook setup, and AI/editor instructions.

### Default React stack

- Router: TanStack Router
- State: Zustand
- HTTP client: Axios
- Data fetching: TanStack Query
- Styling: Tailwind CSS v4

### Additional built-in options

- Routers: TanStack Router, React Router, Wouter, or no router
- State: Zustand, Jotai, Redux Toolkit, or no shared state library
- Redux Toolkit path:
  - skips separate HTTP/data prompts in the wizard
  - uses Fetch + RTK Query automatically
  - scaffolds a Redux store, typed hooks, slices, and RTK Query service files
- `none` state path:
  - uses local component state
  - omits generated shared store files

### Example React combinations

```bash
# default non-interactive React scaffold
bumpers up my-react-app --react

# non-interactive React scaffold with explicit options
bumpers up my-react-app --react --router react-router --state jotai

# interactive React scaffold with router/state selection
bumpers up my-react-app
```

Valid values:

- `--router`: `tanstack`, `react-router`, `wouter`, `none`
- `--state`: `zustand`, `jotai`, `redux-toolkit`, `none`

If omitted, `--router` defaults to `tanstack` and `--state` defaults to `zustand`.

When `--state redux-toolkit` is selected, Bumpers uses Fetch + RTK Query automatically.

## Risk-Based Testing

Scaffolded projects use tests to protect behavior and architecture, not to create one test per file.

- Test business rules, validation, state transitions, error paths, platform boundaries, and regressions.
- Give strong coverage to dependency-heavy components and shared code imported throughout the app.
- Use E2E tests for critical user journeys and cross-boundary behavior.
- Avoid tests that only repeat framework wiring, static configuration, re-exports, or trivial rendering.
- Co-locate unit tests and stories with their source when they add value; keep E2E tests under `e2e/`.

Generated agent instructions document this testing spectrum for each scaffold.

## Agent Instructions

Each scaffold uses `AGENTS.md` as its canonical project contract. Codex reads it directly, `CLAUDE.md` imports it, and the Cursor and Copilot files are thin adapters. Shared architecture, testing, and verification guidance lives in one place to reduce startup context and prevent policy drift.

## Available Scripts (Scaffolded Project)

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
| `npm run format:check` | Check formatting with Biome |
| `npm run storybook` | Launch Storybook dev server |

## Development

```bash
# Clone and install
git clone <repo-url>
cd bumpers
npm install

# Build the CLI
cd packages/bumpers-cli
npm run build

# Run CLI self-tests
npm run test

# Verify the packed CLI in a clean consumer
npm run test:pack

# Run the complete release-quality gate
npm run test:release

# Return to the repository root and run the Linux Actions preflight locally
cd ../..
npm run test:actions

# Test a scaffold
node packages/bumpers-cli/dist/index.js up test-output --electron
```

Releases are run manually from the `main` branch in GitHub Actions. Select `initial`, `patch`, `minor`, or `major`, optionally provide a committed version override, and use `publish: false` for a hosted dry run before publishing.

## Architecture

```
packages/
  bumpers-cli/
    src/
      commands/       # CLI commands (up)
      installers/     # Installer modules (one per tool)
      prompts/        # Interactive prompts (@clack/prompts)
      utils/          # Shared utilities (pkg, validate, git)
    templates/        # Template files
    tests/            # CLI self-tests
```

Each installer follows the same pattern:
1. Read/modify `package.json` (add deps, scripts)
2. Write config files
3. Write example source/test files

The installers run in a strict pipeline order, with `installGit` always last.

## License

MIT
