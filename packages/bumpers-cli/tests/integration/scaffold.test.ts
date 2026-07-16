import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { buildInstallerPipeline } from '../../src/commands/up.js';
import { installGit } from '../../src/installers/git.installer.js';
import { runInstallers } from '../../src/installers/index.js';
import type { InstallerOptions } from '../../src/installers/index.js';
import { SCRIPT_CMDS, FILES, IPC, TEST_IDS } from '../../src/shared/constants.js';

describe('full scaffold integration', () => {
  let projectDir: string;
  const projectName = 'test-scaffold';

  beforeAll(async () => {
    projectDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-int-')), projectName);
    await fs.mkdirp(projectDir);

    const opts: InstallerOptions = {
      projectName,
      projectDir,
      template: 'electron',
      packageManager: 'npm',
      cliVersion: '0.1.0',
    };

    // Use the real pipeline but filter out validate (needs npm install, too slow for unit test)
    const fullPipeline = buildInstallerPipeline({ template: 'electron' });
    const installers = fullPipeline.filter((i) => i.name !== 'Installing dependencies and running validation...');

    await runInstallers(installers, opts);
  }, 120_000);

  afterAll(() => {
    if (projectDir) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  // --- Foundation files ---
  it('creates package.json with expected script values', async () => {
    const pkgPath = path.join(projectDir, 'package.json');
    expect(await fs.pathExists(pkgPath)).toBe(true);
    const pkg = await fs.readJson(pkgPath);
    expect(pkg.scripts.dev).toBe(SCRIPT_CMDS.DEV);
    expect(pkg.scripts.build).toBe(SCRIPT_CMDS.BUILD);
    expect(pkg.scripts.test).toBe(SCRIPT_CMDS.TEST);
    expect(pkg.scripts.lint).toContain('eslint');
    expect(pkg.scripts['format:check']).toBe(SCRIPT_CMDS.FORMAT_CHECK);
    expect(pkg.scripts['test:e2e']).toBe(SCRIPT_CMDS.TEST_E2E);
    expect(pkg.scripts['test:colocate']).toContain(FILES.COLOCATE_SCRIPT);
    expect(pkg.scripts.storybook).toBe(SCRIPT_CMDS.STORYBOOK);
    expect(pkg.scripts.postinstall).toBe(SCRIPT_CMDS.POSTINSTALL);
  });

  it('creates tsconfig.json', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.json'))).toBe(true);
  });

  it('creates .gitignore', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(true);
    const content = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    expect(content.split('\n')).toContain('storybook-static/');
  });

  // --- Electron files ---
  it('creates electron.vite.config.ts', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'electron.vite.config.ts'))).toBe(true);
  });

  it('has react in dependencies (not just devDependencies)', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
  });

  it('electron.vite.config.ts uses externalizeDepsPlugin with rollupOptions', async () => {
    const content = await fs.readFile(path.join(projectDir, 'electron.vite.config.ts'), 'utf-8');
    expect(content).toContain('externalizeDepsPlugin');
    expect(content).toContain('rollupOptions');
  });

  it('creates main process files', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'src/main/index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main/window.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main/ipc/register.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main/ipc/example.ipc.ts'))).toBe(true);
  });

  it('creates preload files', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'src/preload/index.ts'))).toBe(true);
  });

  it('creates renderer files', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/src/App.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/src/main.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/index.html'))).toBe(true);
  });

  it('renderer App does not depend on the global JSX namespace', async () => {
    const content = await fs.readFile(path.join(projectDir, 'src/renderer/src/App.tsx'), 'utf-8');
    expect(content).toContain('function App()');
    expect(content).not.toContain('JSX.Element');
  });

  it('creates shared types', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'shared/ipc-channels.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'shared/ipc-types.ts'))).toBe(true);
  });

  // --- Test files ---
  it('creates centralized electron mock file', async () => {
    const mockPath = path.join(projectDir, '__mocks__/electron.ts');
    expect(await fs.pathExists(mockPath)).toBe(true);
    const content = await fs.readFile(mockPath, 'utf-8');
    expect(content).toContain('BrowserWindow');
    expect(content).toContain('ipcMain');
    expect(content).toContain('contextBridge');
  });

  it('creates vitest config and test files', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'vitest.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main/window.test.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/main/ipc/example.ipc.test.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/preload/index.test.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/src/App.test.tsx'))).toBe(true);
  });

  it('creates playwright config and E2E tests', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'playwright.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'e2e/app.spec.ts'))).toBe(true);
  });

  it('playwright.config.ts includes webServer build step', async () => {
    const content = await fs.readFile(path.join(projectDir, 'playwright.config.ts'), 'utf-8');
    expect(content).toContain('webServer');
    expect(content).toContain("command: 'npm run build'");
  });

  it('e2e/app.spec.ts uses resolve for launch path', async () => {
    const content = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');
    expect(content).toContain("resolve(__dirname, '..')");
    expect(content).toContain('waitForLoadState');
  });

  // --- Storybook ---
  it('creates storybook config and stories', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.storybook/main.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, '.storybook/preview.ts'))).toBe(true);
    expect(
      await fs.pathExists(
        path.join(projectDir, 'src/renderer/src/Components/ExampleItems/ExampleItems.stories.tsx'),
      ),
    ).toBe(true);
  });

  it('creates Storybook electronAPI mock', async () => {
    const mockPath = path.join(projectDir, '.storybook/mocks/electronAPI.ts');
    expect(await fs.pathExists(mockPath)).toBe(true);
    const content = await fs.readFile(mockPath, 'utf-8');
    expect(content).toContain('mockElectronAPI');
    expect(content).toContain('getExampleItems');
  });

  it('storybook preview.ts imports the electronAPI mock', async () => {
    const content = await fs.readFile(path.join(projectDir, '.storybook/preview.ts'), 'utf-8');
    expect(content).toContain('mockElectronAPI');
    expect(content).toContain('window.electronAPI');
  });

  // --- Lint & Format ---
  it('creates eslint config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'eslint.config.js'))).toBe(true);
  });

  it('creates biome config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'biome.json'))).toBe(true);
  });

  // --- Enforcement ---
  it('creates co-location check script (cross-platform Node.js)', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'scripts/check-test-files.mjs'))).toBe(true);
    const content = await fs.readFile(path.join(projectDir, 'scripts/check-test-files.mjs'), 'utf-8');
    expect(content).toContain('readdirSync');
    expect(content).toContain('__mocks__');
  });

  it('creates lefthook config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'lefthook.yml'))).toBe(true);
  });

  it('creates commitlint config', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'commitlint.config.js'))).toBe(true);
  });

  // --- CI ---
  it('creates GitHub Actions CI workflow', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.github/workflows/ci.yml'))).toBe(true);
  });

  // --- AI Config ---
  it('creates AGENTS.md with Five-Artifact Rule', async () => {
    const agentsPath = path.join(projectDir, 'AGENTS.md');
    expect(await fs.pathExists(agentsPath)).toBe(true);
    const content = await fs.readFile(agentsPath, 'utf-8');
    expect(content).toContain('Five-Artifact Rule');
    expect(content).toContain(projectName);
  });

  it('creates CLAUDE.md', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'CLAUDE.md'))).toBe(true);
  });

  it('creates .cursorrules', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.cursorrules'))).toBe(true);
  });

  it('creates copilot instructions', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.github/copilot-instructions.md'))).toBe(true);
  });

  // --- Git ---
  it('initializes git repository', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.git'))).toBe(true);
  });

  // --- Content validation for critical files ---

  it('tsconfig.json has strict mode enabled', async () => {
    const tsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(tsconfig.references).toBeDefined();
  });

  it('vitest.config.ts has coverage thresholds and dual environments', async () => {
    const content = await fs.readFile(path.join(projectDir, 'vitest.config.ts'), 'utf-8');
    expect(content).toContain('coverage');
    expect(content).toContain('autoUpdate: true');
    expect(content).toContain('perFile: true');
    expect(content).toContain('scripts/**');
    expect(content).toContain("environment: 'node'");
    expect(content).toContain("environment: 'jsdom'");
  });

  it('lefthook.yml has pre-commit, commit-msg, and pre-push hooks', async () => {
    const content = await fs.readFile(path.join(projectDir, 'lefthook.yml'), 'utf-8');
    expect(content).toContain('pre-commit');
    expect(content).toContain('commit-msg');
    expect(content).toContain('pre-push');
    expect(content).toContain('commitlint');
  });

  it('CI workflow runs on 3 OSes with all quality gates', async () => {
    const content = await fs.readFile(path.join(projectDir, '.github/workflows/ci.yml'), 'utf-8');
    expect(content).toContain('ubuntu-latest');
    expect(content).toContain('windows-latest');
    expect(content).toContain('macos-latest');
    expect(content).toContain('npm run test:coverage');
    expect(content).toContain('npm run test:e2e');
    expect(content).toContain('npm run test:colocate');
    expect(content).toContain('npm run lint');
  });

  it('CLAUDE.md references AGENTS.md', async () => {
    const content = await fs.readFile(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('five artifacts');
  });

  it('.cursorrules references AGENTS.md', async () => {
    const content = await fs.readFile(path.join(projectDir, '.cursorrules'), 'utf-8');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('Five-Artifact Rule');
  });

  it('creates .env.example', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.env.example'))).toBe(true);
  });

  it('creates README.md with project name', async () => {
    const content = await fs.readFile(path.join(projectDir, 'README.md'), 'utf-8');
    expect(content).toContain(projectName);
    expect(content).toContain('Bumpers');
  });

  it('creates electron-builder.yml', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'electron-builder.yml'))).toBe(true);
  });

  it('creates tsconfig.main.json and tsconfig.renderer.json', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.main.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'tsconfig.renderer.json'))).toBe(true);
  });

  it('creates vitest.setup.ts', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'vitest.setup.ts'))).toBe(true);
  });

  it('creates renderer CSS and env declaration', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/src/App.css'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/renderer/src/env.d.ts'))).toBe(true);
  });

  it('shared/ipc-channels.ts has channel constants', async () => {
    const content = await fs.readFile(path.join(projectDir, 'shared/ipc-channels.ts'), 'utf-8');
    expect(content).toContain('EXAMPLE_LIST');
    expect(content).toContain('EXAMPLE_GET');
  });

  it('shared/ipc-types.ts has IElectronAPI interface', async () => {
    const content = await fs.readFile(path.join(projectDir, 'shared/ipc-types.ts'), 'utf-8');
    expect(content).toContain('IElectronAPI');
    expect(content).toContain('ExampleItem');
  });

  // --- Step 5.2: devDependency assertions ---

  it('has all critical devDependencies', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const devDeps = pkg.devDependencies;

    // Electron
    expect(devDeps.electron).toBeDefined();
    expect(devDeps['electron-vite']).toBeDefined();
    expect(devDeps['electron-builder']).toBeDefined();
    expect(devDeps.typescript).toBeDefined();

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

  // --- Step 5.3: config content assertions ---

  it('eslint.config.js imports typescript-eslint', async () => {
    const content = await fs.readFile(path.join(projectDir, 'eslint.config.js'), 'utf-8');
    expect(content).toContain('typescript-eslint');
    expect(content).toContain('react-hooks');
  });

  it('biome.json has expected formatter settings', async () => {
    const biome = await fs.readJson(path.join(projectDir, 'biome.json'));
    expect(biome.formatter.indentStyle).toBe('space');
    expect(biome.formatter.indentWidth).toBe(2);
    expect(biome.linter.enabled).toBe(false);
  });

  it('lefthook.yml has vitest related in pre-commit', async () => {
    const content = await fs.readFile(path.join(projectDir, 'lefthook.yml'), 'utf-8');
    expect(content).toContain('vitest related');
  });

  it('electron-builder.yml has platform targets', async () => {
    const content = await fs.readFile(path.join(projectDir, 'electron-builder.yml'), 'utf-8');
    expect(content).toContain('mac:');
    expect(content).toContain('win:');
    expect(content).toContain('linux:');
  });

  it('electron.vite.config.ts has react plugin for renderer', async () => {
    const content = await fs.readFile(path.join(projectDir, 'electron.vite.config.ts'), 'utf-8');
    expect(content).toContain('plugins: [react()]');
  });

  it('vitest.config.ts has coverage line threshold of 80', async () => {
    const content = await fs.readFile(path.join(projectDir, 'vitest.config.ts'), 'utf-8');
    expect(content).toContain('lines: 80');
  });

  // --- Step 5.4: missing file existence checks ---

  it('creates .github/CODEOWNERS', async () => {
    expect(await fs.pathExists(path.join(projectDir, '.github/CODEOWNERS'))).toBe(true);
  });

  // --- Step 5.5: cross-installer contract assertions ---

  it('ExampleItems.tsx and Playwright spec agree on data-testid', async () => {
    const componentContent = await fs.readFile(
      path.join(projectDir, 'src/renderer/src/Components/ExampleItems/ExampleItems.tsx'),
      'utf-8',
    );
    const e2eContent = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');

    const testId = TEST_IDS.EXAMPLE_ITEM;
    expect(componentContent).toContain(`data-testid="${testId}"`);
    expect(e2eContent).toContain(`data-testid="${testId}"`);
  });

  it('preload and storybook agree on electronAPI bridge name', async () => {
    const preloadContent = await fs.readFile(path.join(projectDir, 'src/preload/index.ts'), 'utf-8');
    const previewContent = await fs.readFile(path.join(projectDir, '.storybook/preview.ts'), 'utf-8');

    const bridgeName = IPC.BRIDGE_NAME;
    expect(preloadContent).toContain(`'${bridgeName}'`);
    expect(previewContent).toContain(bridgeName);
  });

  it('shared/ipc-types.ts defines getExampleItems and getExampleItem', async () => {
    const content = await fs.readFile(path.join(projectDir, 'shared/ipc-types.ts'), 'utf-8');
    expect(content).toContain('getExampleItems');
    expect(content).toContain('getExampleItem');
  });
});
