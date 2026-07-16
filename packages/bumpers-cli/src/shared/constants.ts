/**
 * Shared constants used across multiple installers.
 *
 * IMPORTANT: These values are referenced by generated template files across
 * many installers. Changing a value here changes the scaffolded output.
 * Always search for usages before modifying.
 *
 * This file exists because the brittleness audit found magic strings that
 * must match across installer files. Without this file, a rename in one
 * installer silently breaks another — no compiler error, no test failure,
 * just a broken scaffolded project.
 */

// ─── Directory paths (relative to scaffolded project root) ──────────────
export const DIRS = {
  /** Electron main process source */
  MAIN: 'src/main',
  /** Electron preload source */
  PRELOAD: 'src/preload',
  /** React renderer root (contains index.html) */
  RENDERER_ROOT: 'src/renderer',
  /** React renderer source files (components, tests, stories live here) */
  RENDERER_SRC: 'src/renderer/src',
  /** Shared types between main ↔ renderer */
  SHARED: 'shared',
  /** Playwright E2E tests */
  E2E: 'e2e',
  /** Utility scripts */
  SCRIPTS: 'scripts',
  /** Storybook config */
  STORYBOOK: '.storybook',
} as const;

// ─── Key file paths (relative to scaffolded project root) ───────────────
export const FILES = {
  MAIN_ENTRY: `${DIRS.MAIN}/index.ts`,
  MAIN_WINDOW: `${DIRS.MAIN}/window.ts`,
  MAIN_IPC_REGISTER: `${DIRS.MAIN}/ipc/register.ts`,
  MAIN_IPC_EXAMPLE: `${DIRS.MAIN}/ipc/example.ipc.ts`,
  PRELOAD_ENTRY: `${DIRS.PRELOAD}/index.ts`,
  RENDERER_ENTRY: `${DIRS.RENDERER_SRC}/main.tsx`,
  RENDERER_APP: `${DIRS.RENDERER_SRC}/App.tsx`,
  RENDERER_CSS: `${DIRS.RENDERER_SRC}/App.css`,
  RENDERER_HTML: `${DIRS.RENDERER_ROOT}/index.html`,
  RENDERER_ENV_DTS: `${DIRS.RENDERER_SRC}/env.d.ts`,
  IPC_CHANNELS: `${DIRS.SHARED}/ipc-channels.ts`,
  IPC_TYPES: `${DIRS.SHARED}/ipc-types.ts`,
  COLOCATE_SCRIPT: `${DIRS.SCRIPTS}/check-test-files.mjs`,
  ELECTRON_VITE_CONFIG: 'electron.vite.config.ts',
  ELECTRON_BUILDER_YML: 'electron-builder.yml',
  VITEST_CONFIG: 'vitest.config.ts',
  VITEST_SETUP: 'vitest.setup.ts',
  PLAYWRIGHT_CONFIG: 'playwright.config.ts',
  ESLINT_CONFIG: 'eslint.config.js',
  BIOME_CONFIG: 'biome.json',
  LEFTHOOK_CONFIG: 'lefthook.yml',
  COMMITLINT_CONFIG: 'commitlint.config.js',
} as const;

// ─── IPC constants ──────────────────────────────────────────────────────
export const IPC = {
  /** The name used in contextBridge.exposeInMainWorld() and window[NAME] */
  BRIDGE_NAME: 'electronAPI',
  /** Channel name constants — must match shared/ipc-channels.ts output */
  CHANNELS: {
    EXAMPLE_LIST: 'example:list',
    EXAMPLE_GET: 'example:get',
  },
} as const;

// ─── Test selectors (data-testid values) ────────────────────────────────
export const TEST_IDS = {
  /** Used in App.tsx <li> and playwright E2E locator */
  EXAMPLE_ITEM: 'example-item',
} as const;

// ─── npm script keys ────────────────────────────────────────────────────
// These are the keys in package.json "scripts". Hooks, CI, and validate
// reference these by name — they MUST match what the respective installer adds.
export const SCRIPT_KEYS = {
  DEV: 'dev',
  DEV_LOCAL: 'dev:local',
  DEV_SETUP: 'dev:setup',
  DEV_TEAMS: 'dev:teams',
  BUILD: 'build',
  START: 'start',
  PREVIEW: 'preview',
  GENERATE_ROUTES: 'generate-routes',
  TEST: 'test',
  TEST_WATCH: 'test:watch',
  TEST_COVERAGE: 'test:coverage',
  TEST_E2E: 'test:e2e',
  TEST_E2E_HEADED: 'test:e2e:headed',
  TEST_E2E_UPDATE: 'test:e2e:update-screenshots',
  TEST_COLOCATE: 'test:colocate',
  LINT: 'lint',
  LINT_FIX: 'lint:fix',
  FORMAT: 'format',
  FORMAT_CHECK: 'format:check',
  STORYBOOK: 'storybook',
  BUILD_STORYBOOK: 'build-storybook',
  POSTINSTALL: 'postinstall',
  TEAMS_PACKAGE: 'teams:package',
} as const;

// ─── npm script commands (values) ───────────────────────────────────────
export const SCRIPT_CMDS = {
  DEV: 'env -u ELECTRON_RUN_AS_NODE electron-vite dev',
  BUILD: 'electron-vite build',
  PREVIEW: 'env -u ELECTRON_RUN_AS_NODE electron-vite preview',
  START: 'env -u ELECTRON_RUN_AS_NODE electron .',
  TEST: 'vitest run',
  TEST_WATCH: 'vitest',
  TEST_COVERAGE: 'vitest run --coverage',
  TEST_E2E: 'playwright test',
  TEST_E2E_HEADED: 'playwright test --headed',
  TEST_E2E_UPDATE: 'playwright test --update-snapshots',
  TEST_COLOCATE: `node ${FILES.COLOCATE_SCRIPT}`,
  LINT: `eslint src/ ${DIRS.SHARED}/`,
  LINT_FIX: `eslint src/ ${DIRS.SHARED}/ --fix`,
  FORMAT: 'biome format --write .',
  FORMAT_CHECK: 'biome format .',
  STORYBOOK: 'storybook dev -p 6006',
  BUILD_STORYBOOK: 'storybook build',
  POSTINSTALL: 'electron-builder install-app-deps',
} as const;

// ─── Vitest glob patterns ───────────────────────────────────────────────
export const TEST_GLOBS = {
  /** Node environment test files (main + preload) */
  NODE_INCLUDES: [
    `${DIRS.MAIN}/**/*.test.ts`,
    `${DIRS.PRELOAD}/**/*.test.ts`,
  ],
  /** jsdom environment test files (renderer) */
  JSDOM_INCLUDES: [
    `${DIRS.RENDERER_ROOT}/**/*.test.{ts,tsx}`,
  ],
} as const;

// ─── Storybook globs ────────────────────────────────────────────────────
export const STORYBOOK_GLOBS = {
  /** Story discovery glob (relative to .storybook/) */
  STORIES: `../${DIRS.RENDERER_SRC}/**/*.stories.@(ts|tsx)`,
  /** CSS import from preview.ts (relative to .storybook/) */
  CSS_IMPORT: `../${FILES.RENDERER_CSS}`,
} as const;

// ─── Package names used in both deps and mocks ──────────────────────────
export const PACKAGES = {
  ELECTRON_TOOLKIT_UTILS: '@electron-toolkit/utils',
} as const;

// NOTE: The colocate script (check-test-files.mjs) also hardcodes 'register.ts'
// as an excluded filename. This matches FILES.MAIN_IPC_REGISTER's basename.
// When the script is extracted to a template file, this should be parameterized.

// ═══════════════════════════════════════════════════════════════════════════
// Teams Tab constants — a Teams Tab is a flat React/Vite web app with
// @microsoft/teams-js for Teams context. Much simpler than Electron:
// single test environment (jsdom), flat src/, no main/preload split.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Teams Tab directory paths ─────────────────────────────────────────
export const TEAMS_TAB_DIRS = {
  /** React source files */
  SRC: 'src',
  /** Teams app manifest and icons */
  APP_PACKAGE: 'appPackage',
  /** Environment variable files */
  ENV: 'env',
  /** Playwright E2E tests */
  E2E: 'e2e',
  /** Utility scripts */
  SCRIPTS: 'scripts',
  /** Storybook config */
  STORYBOOK: '.storybook',
  /** Build output (resolved manifest + app package zip) */
  BUILD: 'build',
} as const;

// ─── Teams Tab file paths ──────────────────────────────────────────────
export const TEAMS_TAB_FILES = {
  APP: `${TEAMS_TAB_DIRS.SRC}/App.tsx`,
  MAIN: `${TEAMS_TAB_DIRS.SRC}/main.tsx`,
  CSS: `${TEAMS_TAB_DIRS.SRC}/App.css`,
  ENV_DTS: `${TEAMS_TAB_DIRS.SRC}/env.d.ts`,
  HTML: 'index.html',
  VITE_CONFIG: 'vite.config.ts',
  MANIFEST: `${TEAMS_TAB_DIRS.APP_PACKAGE}/manifest.json`,
  COLOR_ICON: `${TEAMS_TAB_DIRS.APP_PACKAGE}/color.png`,
  OUTLINE_ICON: `${TEAMS_TAB_DIRS.APP_PACKAGE}/outline.png`,
  ENV_DEV: `${TEAMS_TAB_DIRS.ENV}/.env.dev`,
  ENV_LOCAL: `${TEAMS_TAB_DIRS.ENV}/.env.local`,
  VITEST_CONFIG: 'vitest.config.ts',
  VITEST_SETUP: 'vitest.setup.ts',
  PLAYWRIGHT_CONFIG: 'playwright.config.ts',
  ESLINT_CONFIG: 'eslint.config.js',
  BIOME_CONFIG: 'biome.json',
  COLOCATE_SCRIPT: `${TEAMS_TAB_DIRS.SCRIPTS}/check-test-files.mjs`,
  DEV_SCRIPT: `${TEAMS_TAB_DIRS.SCRIPTS}/dev.mjs`,
  PACKAGE_SCRIPT: `${TEAMS_TAB_DIRS.SCRIPTS}/package-teams-app.mjs`,
} as const;

// ─── Teams Tab dev server ─────────────────────────────────────────────
export const TEAMS_TAB_DEV_SERVER = {
  LOCAL_HTTP_URL: 'http://127.0.0.1:53000',
  LOCAL_HTTPS_URL: 'https://localhost:53000',
  PORT: 53000,
} as const;

// ─── Teams Tab npm script commands ─────────────────────────────────────
export const TEAMS_TAB_SCRIPT_CMDS = {
  DEV: `node ${TEAMS_TAB_FILES.DEV_SCRIPT} --https-auto`,
  DEV_LOCAL: `node ${TEAMS_TAB_FILES.DEV_SCRIPT} --local-http`,
  DEV_SETUP: `node ${TEAMS_TAB_FILES.DEV_SCRIPT} --setup-cert`,
  DEV_TEAMS: `node ${TEAMS_TAB_FILES.DEV_SCRIPT} --teams`,
  BUILD: 'tsc --noEmit && vite build',
  PREVIEW: 'vite preview',
  TEST: 'vitest run',
  TEST_WATCH: 'vitest',
  TEST_COVERAGE: 'vitest run --coverage',
  TEST_E2E: 'playwright test',
  TEST_E2E_HEADED: 'playwright test --headed',
  TEST_E2E_UPDATE: 'playwright test --update-snapshots',
  TEST_COLOCATE: `node ${TEAMS_TAB_FILES.COLOCATE_SCRIPT}`,
  LINT: `eslint ${TEAMS_TAB_DIRS.SRC}/`,
  LINT_FIX: `eslint ${TEAMS_TAB_DIRS.SRC}/ --fix`,
  FORMAT: 'biome format --write .',
  FORMAT_CHECK: 'biome format .',
  STORYBOOK: 'storybook dev -p 6006',
  BUILD_STORYBOOK: 'storybook build',
  TEAMS_PACKAGE: `node ${TEAMS_TAB_FILES.PACKAGE_SCRIPT}`,
} as const;

// ─── Teams Tab Vitest glob patterns ────────────────────────────────────
export const TEAMS_TAB_TEST_GLOBS = {
  /** jsdom environment test files (all tests — no Node env needed) */
  JSDOM_INCLUDES: [
    `${TEAMS_TAB_DIRS.SRC}/**/*.test.{ts,tsx}`,
  ],
} as const;

// ─── Teams Tab Storybook globs ─────────────────────────────────────────
export const TEAMS_TAB_STORYBOOK_GLOBS = {
  /** Story discovery glob (relative to .storybook/) */
  STORIES: `../${TEAMS_TAB_DIRS.SRC}/**/*.stories.@(ts|tsx)`,
  /** CSS import from preview.ts (relative to .storybook/) */
  CSS_IMPORT: `../${TEAMS_TAB_FILES.CSS}`,
} as const;

// ─── Teams Tab test selectors ──────────────────────────────────────────
export const TEAMS_TAB_TEST_IDS = {
  /** Used in App.tsx and playwright E2E locator */
  TEAMS_CONTEXT: 'teams-context',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// React SPA constants — standalone React + Vite app with file-based routing.
// ═══════════════════════════════════════════════════════════════════════════

export const REACT_DIRS = {
  SRC: 'src',
  ROUTES: 'src/routes',
  PAGES: 'src/pages',
  LIB: 'src/lib',
  STORE: 'src/store',
  COMPONENTS: 'src/Components',
  E2E: 'e2e',
  SCRIPTS: 'scripts',
  STORYBOOK: '.storybook',
} as const;

export const REACT_FILES = {
  MAIN: `${REACT_DIRS.SRC}/main.tsx`,
  ROOT: `${REACT_DIRS.SRC}/Root.tsx`,
  APP: `${REACT_DIRS.SRC}/App.tsx`,
  INDEX_CSS: `${REACT_DIRS.SRC}/index.css`,
  APP_CSS: `${REACT_DIRS.SRC}/App.css`,
  ENV_DTS: `${REACT_DIRS.SRC}/env.d.ts`,
  TEST_UTILS: `${REACT_DIRS.SRC}/test-utils.tsx`,
  HTML: 'index.html',
  VITE_CONFIG: 'vite.config.ts',
  TSR_CONFIG: 'tsr.config.json',
  COLOCATE_SCRIPT: `${REACT_DIRS.SCRIPTS}/check-test-files.mjs`,
  ROUTE_TREE_GEN: `${REACT_DIRS.SRC}/routeTree.gen.ts`,
  API_CLIENT: `${REACT_DIRS.LIB}/api.ts`,
  QUERY_CLIENT: `${REACT_DIRS.LIB}/query-client.ts`,
  COUNTER_STORE: `${REACT_DIRS.STORE}/counter.ts`,
  ATOMS: `${REACT_DIRS.STORE}/atoms.ts`,
  REDUX_STORE: `${REACT_DIRS.STORE}/store.ts`,
  REDUX_HOOKS: `${REACT_DIRS.STORE}/hooks.ts`,
  COUNTER_SLICE: `${REACT_DIRS.STORE}/slices/counterSlice.ts`,
  RTK_QUERY_API: `${REACT_DIRS.STORE}/services/api.ts`,
  COUNTER_COMPONENT: `${REACT_DIRS.COMPONENTS}/Counter/Counter.tsx`,
  HOME_PAGE: `${REACT_DIRS.PAGES}/Home.tsx`,
  ABOUT_PAGE: `${REACT_DIRS.PAGES}/About.tsx`,
  ROOT_ROUTE: `${REACT_DIRS.ROUTES}/__root.tsx`,
  INDEX_ROUTE: `${REACT_DIRS.ROUTES}/index.tsx`,
  ABOUT_ROUTE: `${REACT_DIRS.ROUTES}/about.tsx`,
} as const;

export const REACT_DEV_SERVER = {
  URL: 'http://localhost:5173',
  PORT: 5173,
} as const;

export const REACT_SCRIPT_CMDS = {
  GENERATE_ROUTES: 'tsr generate',
  DEV: 'vite',
  BUILD: 'tsr generate && tsc --noEmit && vite build',
  PREVIEW: 'vite preview',
  TEST: 'tsr generate && vitest run',
  TEST_WATCH: 'tsr generate && vitest',
  TEST_COVERAGE: 'tsr generate && vitest run --coverage',
  TEST_E2E: 'tsr generate && playwright test',
  TEST_E2E_HEADED: 'tsr generate && playwright test --headed',
  TEST_E2E_UPDATE: 'tsr generate && playwright test --update-snapshots',
  TEST_COLOCATE: `node ${REACT_FILES.COLOCATE_SCRIPT}`,
  LINT: `eslint ${REACT_DIRS.SRC}/`,
  LINT_FIX: `eslint ${REACT_DIRS.SRC}/ --fix`,
  FORMAT: 'biome format --write .',
  FORMAT_CHECK: 'biome format .',
  STORYBOOK: 'storybook dev -p 6006',
  BUILD_STORYBOOK: 'storybook build',
} as const;

export const REACT_TEST_GLOBS = {
  JSDOM_INCLUDES: [
    `${REACT_DIRS.SRC}/**/*.test.{ts,tsx}`,
  ],
} as const;

export const REACT_STORYBOOK_GLOBS = {
  STORIES: `../${REACT_DIRS.SRC}/**/*.stories.@(ts|tsx)`,
  CSS_IMPORT: `../${REACT_FILES.INDEX_CSS}`,
} as const;

export const REACT_TEST_IDS = {
  HEADING: 'app-heading',
  NAV_HOME: 'nav-home',
  NAV_ABOUT: 'nav-about',
  COUNTER: 'counter-value',
  COUNTER_INCREMENT: 'counter-increment',
} as const;
