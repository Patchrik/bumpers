import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { buildInstallerPipeline } from '../../src/commands/up.js';
import { runInstallers } from '../../src/installers/index.js';
import type { InstallerOptions } from '../../src/installers/index.js';
import {
  SCRIPT_KEYS,
  TEAMS_TAB_SCRIPT_CMDS,
  TEAMS_TAB_FILES,
  TEAMS_TAB_DIRS,
  TEAMS_TAB_TEST_IDS,
  TEAMS_TAB_STORYBOOK_GLOBS,
} from '../../src/shared/constants.js';

describe('Teams Tab scaffold integration', () => {
  let projectDir: string;
  const projectName = 'test-teams-tab';

  beforeAll(async () => {
    projectDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-tab-')), projectName);
    await fs.mkdirp(projectDir);

    const opts: InstallerOptions = {
      projectName,
      projectDir,
      template: 'teams-tab',
      packageManager: 'npm',
      cliVersion: '0.1.0',
    };

    // Use the real pipeline but filter out validate (needs npm install, too slow for unit test)
    const fullPipeline = buildInstallerPipeline({ template: 'teams-tab' });
    const installers = fullPipeline.filter((i) => i.name !== 'Installing dependencies and running validation...');

    await runInstallers(installers, opts);
  }, 120_000);

  afterAll(() => {
    if (projectDir) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  // --- Foundation files ---
  it('creates package.json with Teams Tab scripts', async () => {
    const pkgPath = path.join(projectDir, 'package.json');
    expect(await fs.pathExists(pkgPath)).toBe(true);
    const pkg = await fs.readJson(pkgPath);
    expect(pkg.scripts.dev).toBe(TEAMS_TAB_SCRIPT_CMDS.DEV);
    expect(pkg.scripts[SCRIPT_KEYS.DEV_LOCAL]).toBe(TEAMS_TAB_SCRIPT_CMDS.DEV_LOCAL);
    expect(pkg.scripts[SCRIPT_KEYS.DEV_TEAMS]).toBe(TEAMS_TAB_SCRIPT_CMDS.DEV_TEAMS);
    expect(pkg.scripts[SCRIPT_KEYS.DEV_SETUP]).toBe(TEAMS_TAB_SCRIPT_CMDS.DEV_SETUP);
    expect(pkg.scripts.build).toBe('tsc --noEmit && vite build');
    expect(pkg.scripts.test).toBe(TEAMS_TAB_SCRIPT_CMDS.TEST);
    expect(pkg.scripts.lint).toContain('eslint');
    expect(pkg.scripts['format:check']).toBe(TEAMS_TAB_SCRIPT_CMDS.FORMAT_CHECK);
    expect(pkg.scripts['test:e2e']).toBe(TEAMS_TAB_SCRIPT_CMDS.TEST_E2E);
    expect(pkg.scripts['test:colocate']).toContain('check-test-files.mjs');
    expect(pkg.scripts.storybook).toBe(TEAMS_TAB_SCRIPT_CMDS.STORYBOOK);
  });

  it('creates tsconfig.json', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true);
  });

  it('creates .gitignore', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(true);
    const content = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    expect(content.split('\n')).toContain('storybook-static/');
  });

  // --- Teams Tab files ---
  it('creates Teams manifest in appPackage/', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.MANIFEST))).toBe(true);
  });

  it('creates placeholder icons', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.COLOR_ICON))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.OUTLINE_ICON))).toBe(true);
  });

  it('creates env files', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.ENV_DEV))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.ENV_LOCAL))).toBe(true);
  });

  it('creates Teams dev runner script', async () => {
    const scriptPath = path.join(projectDir, 'scripts/dev.mjs');
    expect(await fs.pathExists(scriptPath)).toBe(true);
    const content = await fs.readFile(scriptPath, 'utf-8');
    expect(content).toContain("import { createServer } from 'vite'");
    expect(content).toContain('devtunnel');
    expect(content).toContain('--allow-anonymous');
    expect(content).toContain('--protocol');
    expect(content).toContain('--https-auto');
    expect(content).toContain('--setup-cert');
    expect(content).toContain('--teams');
    expect(content).toContain('--local-http');
    expect(content).toContain('TAB_ENDPOINT');
    expect(content).toContain('TAB_DOMAIN');
    expect(content).toContain('BUMPERS_TEAMS_HTTPS');
    expect(content).toContain("host: '127.0.0.1'");
    expect(content).toContain('port: 53000');
  });

  it('creates reusable Teams package script', async () => {
    const scriptPath = path.join(projectDir, TEAMS_TAB_FILES.PACKAGE_SCRIPT);
    expect(await fs.pathExists(scriptPath)).toBe(true);
    const content = await fs.readFile(scriptPath, 'utf-8');
    expect(content).toContain('export function packageTeamsApp');
    expect(content).toContain("pathToFileURL(process.argv[1])");
    expect(content).toContain("env/.env.local");
  });

  it('does NOT create the old standalone certificate setup script', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'scripts/setup-dev-cert.mjs'))).toBe(false);
  });

  it('creates vite.config.ts', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.VITE_CONFIG))).toBe(true);
  });

  it('creates index.html at project root', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.HTML))).toBe(true);
  });

  it('creates React source files', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.APP))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.MAIN))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.CSS))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.ENV_DTS))).toBe(true);
  });

  it('has react and @microsoft/teams-js in dependencies', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
    expect(pkg.dependencies['@microsoft/teams-js']).toBeDefined();
  });

  it('has vite and typescript in devDependencies', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.devDependencies.typescript).toBeDefined();
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined();
  });

  // --- NO Electron artifacts ---
  it('does NOT have Electron-specific files', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'electron.vite.config.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'electron-builder.yml'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/main'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/preload'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'shared'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, '__mocks__/electron.ts'))).toBe(false);
  });

  it('does NOT have Electron in dependencies', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies?.['electron']).toBeUndefined();
    expect(pkg.devDependencies?.['electron']).toBeUndefined();
    expect(pkg.devDependencies?.['electron-vite']).toBeUndefined();
    expect(pkg.devDependencies?.['electron-builder']).toBeUndefined();
  });

  it('does NOT have postinstall script (Electron-specific)', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.scripts?.postinstall).toBeUndefined();
  });

  // --- NO bot artifacts ---
  it('does NOT have bot-related files or deps', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'src/bot'))).toBe(false);
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies?.['@microsoft/teams.apps']).toBeUndefined();
  });

  // --- Manifest content validation ---
  it('manifest.json has staticTabs but NO bots section', async () => {
    const manifest = await fs.readJson(path.join(projectDir, TEAMS_TAB_FILES.MANIFEST));
    expect(manifest.staticTabs).toBeDefined();
    expect(manifest.staticTabs.length).toBeGreaterThan(0);
    expect(manifest.bots).toBeUndefined();
    expect(manifest.composeExtensions).toBeUndefined();
    expect(manifest.manifestVersion).toBe('1.26');
  });

  it('manifest.json has project name', async () => {
    const manifest = await fs.readJson(path.join(projectDir, TEAMS_TAB_FILES.MANIFEST));
    expect(manifest.name.short).toBe(projectName);
  });

  // --- Test files ---
  it('creates @microsoft/teams-js mock', async () => {
    const mockPath = path.join(projectDir, '__mocks__/@microsoft/teams-js.ts');
    expect(await fs.pathExists(mockPath)).toBe(true);
    const content = await fs.readFile(mockPath, 'utf-8');
    expect(content).toContain('app');
    expect(content).toContain('initialize');
    expect(content).toContain('getContext');
  });

  it('creates vitest config with single jsdom environment', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'vitest.config.ts'))).toBe(true);
    const content = await fs.readFile(path.join(projectDir, 'vitest.config.ts'), 'utf-8');
    expect(content).toContain("environment: 'jsdom'");
    expect(content).toContain('coverage');
    expect(content).toContain('autoUpdate: true');
    expect(content).toContain('lines: 100');
    expect(content).toContain('functions: 100');
    expect(content).toContain('branches: 100');
    expect(content).toContain('statements: 100');
    expect(content).toContain('scripts/**');
    expect(content).toContain("'build'");
    expect(content).toContain("'coverage'");
    expect(content).toContain("'storybook-static'");
    // Should NOT have dual projects like Electron
    expect(content).not.toContain("environment: 'node'");
  });

  it('creates co-located App test', async () => {
    const testPath = path.join(projectDir, 'src/App.test.tsx');
    expect(await fs.pathExists(testPath)).toBe(true);
    const content = await fs.readFile(testPath, 'utf-8');
    expect(content).toContain(projectName);
  });

  it('creates co-located TeamsContextPanel test', async () => {
    const testPath = path.join(projectDir, 'src/Components/TeamsContextPanel/TeamsContextPanel.test.tsx');
    expect(await fs.pathExists(testPath)).toBe(true);
    const content = await fs.readFile(testPath, 'utf-8');
    expect(content).toContain("@microsoft/teams-js");
    expect(content).toContain('shows Teams context values');
    expect(content).toContain('uses default Teams context values');
    expect(content).toContain('shows standalone mode when Teams initialization fails');
  });

  it('creates playwright config with Vite dev server', async () => {
    const content = await fs.readFile(path.join(projectDir, 'playwright.config.ts'), 'utf-8');
    expect(content).toContain('webServer');
    expect(content).toContain("command: 'npm run dev:local'");
    expect(content).toContain("url: 'http://127.0.0.1:53000'");
    expect(content).toContain('reuseExistingServer: false');
    expect(content).toContain('chromium');
    // Should NOT have Electron launch
    expect(content).not.toContain('_electron');
  });

  it('creates E2E test for Teams Tab', async () => {
    const content = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');
    expect(content).toContain("page.goto('/')");
    expect(content).toContain(TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT);
    expect(content).toContain('await page.screenshot({ fullPage: true })');
    expect(content).toContain('screenshot.byteLength');
    expect(content).not.toContain('toHaveScreenshot');
    // Should NOT have Electron launch
    expect(content).not.toContain('electron.launch');
  });

  // --- Storybook ---
  it('creates storybook config with flat src/ paths', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.storybook/main.ts'))).toBe(true);
    const content = await fs.readFile(path.join(projectDir, '.storybook/main.ts'), 'utf-8');
    expect(content).toContain(TEAMS_TAB_STORYBOOK_GLOBS.STORIES);
  });

  it('creates storybook preview without electronAPI mock', async () => {
    const content = await fs.readFile(path.join(projectDir, '.storybook/preview.ts'), 'utf-8');
    expect(content).not.toContain('electronAPI');
    expect(content).not.toContain('mockElectronAPI');
  });

  it('creates TeamsContextPanel story with the component', async () => {
    expect(
      await fs.pathExists(path.join(projectDir, 'src/Components/TeamsContextPanel/TeamsContextPanel.stories.tsx')),
    ).toBe(true);
  });

  it('does NOT create .storybook/mocks/electronAPI.ts', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.storybook/mocks/electronAPI.ts'))).toBe(false);
  });

  // --- Lint & Format ---
  it('creates eslint config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'eslint.config.js'))).toBe(true);
  });

  it('creates biome config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'biome.json'))).toBe(true);
  });

  it('lint command targets src/ only (no shared/)', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.scripts.lint).toContain('eslint src/');
    expect(pkg.scripts.lint).not.toContain('shared/');
  });

  // --- Enforcement ---
  it('creates co-location check script', async () => {
    expect(await fs.pathExists(path.join(projectDir, TEAMS_TAB_FILES.COLOCATE_SCRIPT))).toBe(true);
  });

  it('creates lefthook config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'lefthook.yml'))).toBe(true);
  });

  it('creates commitlint config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'commitlint.config.js'))).toBe(true);
  });

  // --- CI ---
  it('creates GitHub Actions CI workflow (ubuntu-only)', async () => {
    const ciPath = path.join(projectDir, '.github/workflows/ci.yml');
    expect(await fs.pathExists(ciPath)).toBe(true);
    const content = await fs.readFile(ciPath, 'utf-8');
    expect(content).toContain('ubuntu-latest');
    // Teams Tab CI should NOT have multi-OS matrix
    expect(content).not.toContain('matrix');
    expect(content).not.toContain('windows-latest');
    expect(content).not.toContain('macos-latest');
  });

  // --- AI Config ---
  it('creates Teams Tab AGENTS.md', async () => {
    const content = await fs.readFile(path.join(projectDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('Five-Artifact Rule');
    expect(content).toContain(projectName);
    expect(content).toContain('Teams Tab');
    expect(content).toContain('@microsoft/teams-js');
  });

  it('creates Teams Tab CLAUDE.md', async () => {
    const content = await fs.readFile(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('five artifacts');
    expect(content).toContain('teams-js');
  });

  it('creates Teams Tab .cursorrules', async () => {
    const content = await fs.readFile(path.join(projectDir, '.cursorrules'), 'utf-8');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('teams-js');
  });

  it('creates Teams Tab copilot instructions', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.github/copilot-instructions.md'))).toBe(true);
  });

  // --- Git ---
  it('initializes git repository', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.git'))).toBe(true);
  });

  // --- Content validation ---
  it('tsconfig.json has DOM lib and jsx', async () => {
    const tsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.lib).toContain('DOM');
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
    // Should NOT have references (flat project, no sub-tsconfigs)
    expect(tsconfig.references).toBeUndefined();
  });

  it('vite.config.ts has react plugin', async () => {
    const content = await fs.readFile(path.join(projectDir, TEAMS_TAB_FILES.VITE_CONFIG), 'utf-8');
    expect(content).toContain('react()');
    expect(content).toContain("process.env.BUMPERS_TEAMS_HTTPS === '1'");
    expect(content).toContain('mkcert()');
    expect(content).toContain("host: '127.0.0.1'");
    expect(content).toContain('strictPort: true');
    expect(content).toContain('53000');
  });

  it('TeamsContextPanel.tsx uses @microsoft/teams-js', async () => {
    const content = await fs.readFile(
      path.join(projectDir, 'src/Components/TeamsContextPanel/TeamsContextPanel.tsx'),
      'utf-8',
    );
    expect(content).toContain("@microsoft/teams-js");
    expect(content).toContain('.initialize()');
    expect(content).toContain(`data-testid="${TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT}"`);
    expect(content).toContain('function TeamsContextPanel()');
    expect(content).not.toContain('JSX.Element');
  });

  it('README.md has Teams development section', async () => {
    const content = await fs.readFile(path.join(projectDir, 'README.md'), 'utf-8');
    expect(content).toContain(projectName);
    expect(content).toContain('Teams');
    expect(content).toContain('npm run dev');
    expect(content).toContain('npm run dev:setup');
    expect(content).toContain('npm run dev:teams');
    expect(content).not.toContain('npm run dev:local');
    // Should NOT have Electron native module section
    expect(content).not.toContain('Native Modules');
    expect(content).not.toContain('electron-builder');
  });

  // --- Cross-installer contract assertions ---
  it('TeamsContextPanel.tsx and E2E spec agree on data-testid', async () => {
    const componentContent = await fs.readFile(
      path.join(projectDir, 'src/Components/TeamsContextPanel/TeamsContextPanel.tsx'),
      'utf-8',
    );
    const e2eContent = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');

    const testId = TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT;
    expect(componentContent).toContain(`data-testid="${testId}"`);
    expect(e2eContent).toContain(`data-testid="${testId}"`);
  });

  // --- DevDependency assertions ---
  it('has all critical devDependencies', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const devDeps = pkg.devDependencies;

    // Build
    expect(devDeps.vite).toBeDefined();
    expect(devDeps.typescript).toBeDefined();
    expect(devDeps['@vitejs/plugin-react']).toBeDefined();

    // Testing
    expect(devDeps.vitest).toBeDefined();
    expect(devDeps['@vitest/coverage-v8']).toBeDefined();
    expect(devDeps['@testing-library/react']).toBeDefined();
    expect(devDeps['@playwright/test']).toBeDefined();
    expect(devDeps['@types/node']).toBeDefined();
    expect(devDeps.storybook).toBeDefined();

    // Quality
    expect(devDeps.eslint).toBeDefined();
    expect(devDeps['@biomejs/biome']).toBeDefined();

    // Enforcement
    expect(devDeps.lefthook).toBeDefined();
    expect(devDeps['@commitlint/cli']).toBeDefined();
  });
});
