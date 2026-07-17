import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildInstallerPipeline } from '../../src/commands/up.js';
import { runInstallers } from '../../src/installers/index.js';
import type { InstallerOptions, ReactOptions, RouterOption, StateOption } from '../../src/installers/index.js';
import {
  REACT_DIRS,
  REACT_FILES,
  REACT_STORYBOOK_GLOBS,
  REACT_TEST_GLOBS,
  REACT_TEST_IDS,
} from '../../src/shared/constants.js';

type RouterFixture = {
  router: RouterOption;
  projectDir: string;
};

type StateFixture = {
  router: RouterOption;
  stateManagement: StateOption;
  projectDir: string;
};

const projectName = 'test-react-app';

const sharedReactOptions = {
  stateManagement: 'zustand' as const,
  httpClient: 'axios' as const,
  dataFetching: 'tanstack-query' as const,
  styling: 'tailwind' as const,
};

const routerFixtures: RouterFixture[] = [];
const stateFixtures: StateFixture[] = [];

function getRouterFixture(router: RouterOption) {
  const fixture = routerFixtures.find((item) => item.router === router);
  if (!fixture) {
    throw new Error(`Missing fixture for router ${router}`);
  }

  return fixture;
}

function getStateFixture(router: RouterOption, stateManagement: StateOption) {
  const fixture = stateFixtures.find(
    (item) => item.router === router && item.stateManagement === stateManagement,
  );
  if (!fixture) {
    throw new Error(`Missing fixture for router ${router} and state ${stateManagement}`);
  }

  return fixture;
}

describe('React scaffold integration', () => {
  beforeAll(async () => {
    const fullPipeline = buildInstallerPipeline({ template: 'react' });
    const installers = fullPipeline.filter((i) => i.name !== 'Installing dependencies and running validation...');

    for (const router of ['tanstack', 'react-router', 'wouter', 'none'] as const) {
      const projectDir = path.join(
        fs.mkdtempSync(path.join(os.tmpdir(), `bumpers-react-${router}-`)),
        projectName,
      );
      await fs.mkdirp(projectDir);

      const opts: InstallerOptions = {
        projectName,
        projectDir,
        template: 'react',
        packageManager: 'npm',
        cliVersion: '0.1.0',
        reactOptions: {
          router,
          ...sharedReactOptions,
        },
      };

      await runInstallers(installers, opts);
      routerFixtures.push({ router, projectDir });
    }

    const stateCases: ReactOptions[] = [
      {
        router: 'react-router',
        stateManagement: 'redux-toolkit',
        httpClient: 'fetch',
        dataFetching: 'rtk-query',
        styling: 'tailwind',
      },
      {
        router: 'wouter',
        stateManagement: 'jotai',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
      {
        router: 'none',
        stateManagement: 'none',
        httpClient: 'fetch',
        dataFetching: 'none',
        styling: 'tailwind',
      },
    ];

    for (const reactOptions of stateCases) {
      const projectDir = path.join(
        fs.mkdtempSync(
          path.join(
            os.tmpdir(),
            `bumpers-react-${reactOptions.router}-${reactOptions.stateManagement}-`,
          ),
        ),
        projectName,
      );
      await fs.mkdirp(projectDir);

      const opts: InstallerOptions = {
        projectName,
        projectDir,
        template: 'react',
        packageManager: 'npm',
        cliVersion: '0.1.0',
        reactOptions,
      };

      await runInstallers(installers, opts);
      stateFixtures.push({
        router: reactOptions.router,
        stateManagement: reactOptions.stateManagement,
        projectDir,
      });
    }
  }, 240_000);

  afterAll(() => {
    for (const { projectDir } of routerFixtures) {
      fs.removeSync(path.dirname(projectDir));
    }

    for (const { projectDir } of stateFixtures) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  it('creates shared React foundation files for every router variant', async () => {
    for (const { projectDir } of routerFixtures) {
      const tsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'));
      const readme = await fs.readFile(path.join(projectDir, 'README.md'), 'utf-8');

      expect(tsconfig.compilerOptions.lib).toContain('DOM');
      expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
      expect(tsconfig.references).toBeUndefined();
      expect(readme).toContain('React Development');
      expect(readme).toContain('This is a standalone React SPA scaffolded by Bumpers.');
      expect(readme).not.toContain('TanStack Router, Zustand, Axios, TanStack Query, and Tailwind CSS v4');
      expect(readme).not.toContain('Native Modules');
      expect(readme).not.toContain('Teams');

      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.HTML))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.MAIN))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.INDEX_CSS))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.API_CLIENT))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.QUERY_CLIENT))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.COUNTER_STORE))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.COUNTER_COMPONENT))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.TEST_UTILS))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, REACT_FILES.ENV_DTS))).toBe(true);
    }
  });

  it('keeps TanStack as the only router variant with generated route tooling', async () => {
    const tanstackDir = getRouterFixture('tanstack').projectDir;
    const tanstackPkg = await fs.readJson(path.join(tanstackDir, 'package.json'));
    const tanstackGitignore = await fs.readFile(path.join(tanstackDir, '.gitignore'), 'utf-8');
    const tanstackViteConfig = await fs.readFile(path.join(tanstackDir, REACT_FILES.VITE_CONFIG), 'utf-8');
    const tanstackTsrConfig = await fs.readFile(path.join(tanstackDir, REACT_FILES.TSR_CONFIG), 'utf-8');

    expect(tanstackPkg.dependencies['@tanstack/react-router']).toBeDefined();
    expect(tanstackPkg.devDependencies['@tanstack/router-plugin']).toBeDefined();
    expect(tanstackPkg.devDependencies['@tanstack/router-cli']).toBeDefined();
    expect(tanstackPkg.devDependencies['@tanstack/react-router-devtools']).toBeDefined();
    expect(tanstackPkg.scripts['generate-routes']).toBe('tsr generate');
    expect(tanstackPkg.scripts.postinstall).toBe('tsr generate');
    expect(tanstackGitignore).toContain(REACT_FILES.ROUTE_TREE_GEN);
    expect(await fs.pathExists(path.join(tanstackDir, REACT_FILES.TSR_CONFIG))).toBe(true);
    expect(await fs.pathExists(path.join(tanstackDir, REACT_FILES.ROOT_ROUTE))).toBe(true);
    expect(await fs.pathExists(path.join(tanstackDir, REACT_FILES.INDEX_ROUTE))).toBe(true);
    expect(await fs.pathExists(path.join(tanstackDir, REACT_FILES.ABOUT_ROUTE))).toBe(true);
    expect(await fs.pathExists(path.join(tanstackDir, 'src/routeTree.gen.d.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(tanstackDir, REACT_FILES.ROUTE_TREE_GEN))).toBe(false);
    expect(tanstackViteConfig).toContain('TanStackRouterVite');
    expect(tanstackTsrConfig).toContain('routeFileIgnorePattern');
  });

  it('scaffolds React Router without TanStack route files or scripts', async () => {
    const projectDir = getRouterFixture('react-router').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const gitignore = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    const main = await fs.readFile(path.join(projectDir, REACT_FILES.MAIN), 'utf-8');
    const app = await fs.readFile(path.join(projectDir, REACT_FILES.APP), 'utf-8');

    expect(pkg.dependencies['react-router']).toBeDefined();
    expect(pkg.dependencies['@tanstack/react-router']).toBeUndefined();
    expect(pkg.scripts['generate-routes']).toBeUndefined();
    expect(pkg.scripts.postinstall).toBeUndefined();
    expect(gitignore).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.TSR_CONFIG))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.ROOT_ROUTE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.INDEX_ROUTE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.ABOUT_ROUTE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/routeTree.gen.d.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.APP))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/pages/Home.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/pages/About.tsx'))).toBe(true);
    expect(main).toContain('BrowserRouter');
    expect(app).toContain('Routes');
    expect(app).toContain('Link to="/about"');
  });

  it('scaffolds Wouter without TanStack route files or scripts', async () => {
    const projectDir = getRouterFixture('wouter').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const gitignore = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    const main = await fs.readFile(path.join(projectDir, REACT_FILES.MAIN), 'utf-8');
    const app = await fs.readFile(path.join(projectDir, REACT_FILES.APP), 'utf-8');

    expect(pkg.dependencies.wouter).toBeDefined();
    expect(pkg.dependencies['@tanstack/react-router']).toBeUndefined();
    expect(pkg.scripts['generate-routes']).toBeUndefined();
    expect(pkg.scripts.postinstall).toBeUndefined();
    expect(gitignore).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.TSR_CONFIG))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/pages/Home.tsx'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src/pages/About.tsx'))).toBe(true);
    expect(main).not.toContain('BrowserRouter');
    expect(app).toContain('Switch');
    expect(app).toContain('Link href="/about"');
  });

  it('scaffolds the no-router variant as a single-page app', async () => {
    const projectDir = getRouterFixture('none').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const gitignore = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8');
    const app = await fs.readFile(path.join(projectDir, REACT_FILES.APP), 'utf-8');

    expect(pkg.dependencies['@tanstack/react-router']).toBeUndefined();
    expect(pkg.dependencies['react-router']).toBeUndefined();
    expect(pkg.dependencies.wouter).toBeUndefined();
    expect(pkg.scripts['generate-routes']).toBeUndefined();
    expect(pkg.scripts.postinstall).toBeUndefined();
    expect(gitignore).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.TSR_CONFIG))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/pages'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'src/routes'))).toBe(false);
    expect(app).not.toContain(REACT_TEST_IDS.NAV_HOME);
    expect(app).not.toContain(REACT_TEST_IDS.NAV_ABOUT);
    expect(app).toContain(REACT_TEST_IDS.HEADING);
  });

  it('configures focused Vitest coverage per router', async () => {
    for (const { router, projectDir } of routerFixtures) {
      const vitestConfig = await fs.readFile(path.join(projectDir, 'vitest.config.ts'), 'utf-8');
      const vitestSetup = await fs.readFile(path.join(projectDir, 'vitest.setup.ts'), 'utf-8');

      expect(vitestConfig).toContain("environment: 'jsdom'");
      expect(vitestConfig).toContain(REACT_TEST_GLOBS.JSDOM_INCLUDES[0]);
      expect(vitestConfig).toContain(REACT_FILES.MAIN);
      expect(vitestConfig).toContain('scripts/**');
      expect(vitestConfig).toContain('lines: 80');
      expect(vitestConfig).toContain('functions: 80');
      expect(vitestConfig).toContain('branches: 80');
      expect(vitestConfig).toContain('statements: 80');
      expect(vitestConfig).not.toContain('perFile');
      expect(vitestConfig).not.toContain('autoUpdate');
      expect(vitestSetup).toContain("Object.defineProperty(window, 'scrollTo'");
      expect(await fs.pathExists(path.join(projectDir, 'src/lib/api.test.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, 'src/store/counter.test.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, 'src/Components/Counter/Counter.test.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, 'src/test-utils.test.tsx'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'src/App.test.tsx'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'src/Root.test.tsx'))).toBe(false);

      if (router === 'tanstack') {
        expect(vitestConfig).toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(await fs.pathExists(path.join(projectDir, 'src/routes/__root.test.tsx'))).toBe(false);
        expect(await fs.pathExists(path.join(projectDir, 'src/routes/index.test.tsx'))).toBe(false);
        expect(await fs.pathExists(path.join(projectDir, 'src/routes/about.test.tsx'))).toBe(false);
      } else if (router === 'none') {
        expect(vitestConfig).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(await fs.pathExists(path.join(projectDir, 'src/pages/Home.test.tsx'))).toBe(false);
        expect(await fs.pathExists(path.join(projectDir, 'src/pages/About.test.tsx'))).toBe(false);
      } else {
        expect(vitestConfig).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(await fs.pathExists(path.join(projectDir, 'src/pages/Home.test.tsx'))).toBe(false);
        expect(await fs.pathExists(path.join(projectDir, 'src/pages/About.test.tsx'))).toBe(false);
      }
    }
  });

  it('configures Playwright E2E per router mode', async () => {
    for (const { router, projectDir } of routerFixtures) {
      const config = await fs.readFile(path.join(projectDir, 'playwright.config.ts'), 'utf-8');
      const e2e = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');

      expect(config).toContain("url: 'http://localhost:5173'");
      expect(config).toContain("command: 'npm run dev'");
      expect(config).not.toContain('_electron');
      expect(e2e).toContain(REACT_TEST_IDS.HEADING);
      expect(e2e).toContain(REACT_TEST_IDS.COUNTER_INCREMENT);
      expect(e2e).toContain('await page.screenshot({ fullPage: true })');
      expect(e2e).toContain('screenshot.byteLength');

      if (router === 'none') {
        expect(e2e).not.toContain(REACT_TEST_IDS.NAV_ABOUT);
        expect(e2e).not.toContain("await page.goto('/about')");
      } else {
        expect(e2e).toContain(REACT_TEST_IDS.NAV_ABOUT);
        expect(e2e).toContain("await page.goto('/about')");
      }
    }
  });

  it('creates Storybook config and CI workflow for every router variant', async () => {
    for (const { projectDir } of routerFixtures) {
      const main = await fs.readFile(path.join(projectDir, '.storybook/main.ts'), 'utf-8');
      const preview = await fs.readFile(path.join(projectDir, '.storybook/preview.ts'), 'utf-8');
      const ci = await fs.readFile(path.join(projectDir, '.github/workflows/ci.yml'), 'utf-8');

      expect(main).toContain(REACT_STORYBOOK_GLOBS.STORIES);
      expect(preview).toContain('QueryClientProvider');
      expect(preview).toContain(REACT_STORYBOOK_GLOBS.CSS_IMPORT);
      expect(await fs.pathExists(path.join(projectDir, 'src/Components/Counter/Counter.stories.tsx'))).toBe(true);
      expect(ci).toContain('ubuntu-latest');
      expect(await fs.pathExists(path.join(projectDir, '.git'))).toBe(true);
    }
  });

  it('scaffolds Redux Toolkit with router-specific providers and no axios/react-query files', async () => {
    const projectDir = getStateFixture('react-router', 'redux-toolkit').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const main = await fs.readFile(path.join(projectDir, REACT_FILES.MAIN), 'utf-8');
    const testUtils = await fs.readFile(path.join(projectDir, REACT_FILES.TEST_UTILS), 'utf-8');
    const preview = await fs.readFile(path.join(projectDir, '.storybook/preview.ts'), 'utf-8');
    const aiConfig = await fs.readFile(path.join(projectDir, 'AGENTS.md'), 'utf-8');

    expect(pkg.dependencies['@reduxjs/toolkit']).toBeDefined();
    expect(pkg.dependencies['react-redux']).toBeDefined();
    expect(pkg.dependencies.zustand).toBeUndefined();
    expect(pkg.dependencies.jotai).toBeUndefined();
    expect(pkg.dependencies.axios).toBeUndefined();
    expect(pkg.dependencies['@tanstack/react-query']).toBeUndefined();
    expect(pkg.devDependencies['@tanstack/react-query-devtools']).toBeUndefined();

    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.REDUX_STORE))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.REDUX_HOOKS))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.COUNTER_SLICE))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.RTK_QUERY_API))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.API_CLIENT))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.QUERY_CLIENT))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.COUNTER_STORE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.ATOMS))).toBe(false);

    expect(main).toContain('Provider');
    expect(main).toContain('store');
    expect(testUtils).toContain('preloadedState');
    expect(testUtils).toContain('setupStore');
    expect(preview).toContain('Provider');
    expect(preview).toContain('store');
    expect(aiConfig).toContain('typed hooks');
    expect(aiConfig).toContain('RTK Query');
  });

  it('scaffolds Jotai with atoms and without Redux artifacts', async () => {
    const projectDir = getStateFixture('wouter', 'jotai').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const counter = await fs.readFile(path.join(projectDir, REACT_FILES.COUNTER_COMPONENT), 'utf-8');
    const agents = await fs.readFile(path.join(projectDir, 'AGENTS.md'), 'utf-8');

    expect(pkg.dependencies.jotai).toBeDefined();
    expect(pkg.dependencies.zustand).toBeUndefined();
    expect(pkg.dependencies['@reduxjs/toolkit']).toBeUndefined();
    expect(pkg.dependencies['react-redux']).toBeUndefined();

    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.ATOMS))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.COUNTER_STORE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.REDUX_STORE))).toBe(false);
    expect(counter).toContain('useAtom');
    expect(agents).toContain('Jotai atoms in `src/store/atoms.ts`.');
  });

  it('scaffolds the no-state variant with local component state only', async () => {
    const projectDir = getStateFixture('none', 'none').projectDir;
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    const counter = await fs.readFile(path.join(projectDir, REACT_FILES.COUNTER_COMPONENT), 'utf-8');

    expect(pkg.dependencies.zustand).toBeUndefined();
    expect(pkg.dependencies.jotai).toBeUndefined();
    expect(pkg.dependencies['@reduxjs/toolkit']).toBeUndefined();
    expect(pkg.dependencies['react-redux']).toBeUndefined();

    expect(await fs.pathExists(path.join(projectDir, REACT_DIRS.STORE))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.API_CLIENT))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, REACT_FILES.QUERY_CLIENT))).toBe(false);
    expect(counter).toContain('useState');
  });

  it('references routeTree.gen.ts only for TanStack across lint, format, colocate, and AI config', async () => {
    for (const { router, projectDir } of routerFixtures) {
      const eslintConfig = await fs.readFile(path.join(projectDir, 'eslint.config.js'), 'utf-8');
      const biomeConfig = await fs.readFile(path.join(projectDir, 'biome.json'), 'utf-8');
      const colocateScript = await fs.readFile(path.join(projectDir, 'scripts/check-test-files.mjs'), 'utf-8');
      const agents = await fs.readFile(path.join(projectDir, 'AGENTS.md'), 'utf-8');
      const claude = await fs.readFile(path.join(projectDir, 'CLAUDE.md'), 'utf-8');
      const cursor = await fs.readFile(path.join(projectDir, '.cursorrules'), 'utf-8');
      const copilot = await fs.readFile(path.join(projectDir, '.github/copilot-instructions.md'), 'utf-8');

      expect(biomeConfig).toContain('test-results');
      expect(agents).toContain('## Hard Rules');
      expect(agents).toContain('Use test-first thinking for risky behavior and regressions.');
      expect(claude).toContain('Before claiming work is complete:');
      expect(cursor).toContain('Use test-first thinking');
      expect(copilot).toContain('Do not weaken tests, coverage, lint rules, or type checks');

      if (router === 'tanstack') {
        expect(eslintConfig).toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(biomeConfig).toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(colocateScript).toContain('routeTree.gen.ts');
        expect(agents).toContain('TanStack Router');
        expect(claude).toContain('src/routeTree.gen.ts');
        expect(cursor).toContain('npm run generate-routes');
      } else {
        expect(eslintConfig).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(biomeConfig).not.toContain(REACT_FILES.ROUTE_TREE_GEN);
        expect(colocateScript).not.toContain('routeTree.gen.ts');
        expect(claude).not.toContain('src/routeTree.gen.ts');
        expect(cursor).not.toContain('npm run generate-routes');
      }
    }
  });

  it('keeps shared test ids aligned across generated React files', async () => {
    for (const { router, projectDir } of routerFixtures) {
      const component = await fs.readFile(path.join(projectDir, REACT_FILES.COUNTER_COMPONENT), 'utf-8');
      const e2e = await fs.readFile(path.join(projectDir, 'e2e/app.spec.ts'), 'utf-8');

      expect(component).toContain(`data-testid="${REACT_TEST_IDS.COUNTER}"`);
      expect(component).toContain(`data-testid="${REACT_TEST_IDS.COUNTER_INCREMENT}"`);
      expect(e2e).toContain(REACT_TEST_IDS.COUNTER_INCREMENT);

      if (router === 'tanstack') {
        const rootRoute = await fs.readFile(path.join(projectDir, REACT_FILES.ROOT_ROUTE), 'utf-8');
        expect(rootRoute).toContain(`data-testid="${REACT_TEST_IDS.NAV_ABOUT}"`);
        expect(e2e).toContain(REACT_TEST_IDS.NAV_ABOUT);
      } else if (router === 'none') {
        expect(e2e).not.toContain(REACT_TEST_IDS.NAV_ABOUT);
      } else {
        const app = await fs.readFile(path.join(projectDir, REACT_FILES.APP), 'utf-8');
        expect(app).toContain(`data-testid="${REACT_TEST_IDS.NAV_ABOUT}"`);
        expect(e2e).toContain(REACT_TEST_IDS.NAV_ABOUT);
      }
    }
  });

  it('does not create Electron or Teams-specific artifacts in any router variant', async () => {
    for (const { projectDir } of routerFixtures) {
      expect(await fs.pathExists(path.join(projectDir, 'electron.vite.config.ts'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'electron-builder.yml'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'src/main'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'src/preload'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'shared'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'appPackage'))).toBe(false);
      expect(await fs.pathExists(path.join(projectDir, 'env/.env.dev'))).toBe(false);

      const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
      expect(pkg.dependencies?.['@microsoft/teams-js']).toBeUndefined();
      expect(pkg.devDependencies?.electron).toBeUndefined();
      expect(pkg.devDependencies?.['electron-vite']).toBeUndefined();
    }
  });

  it('generated co-location validator rejects React folder contract violations', async () => {
    const projectDir = getRouterFixture('none').projectDir;
    const looseComponent = path.join(projectDir, 'src/LoosePanel.tsx');
    await fs.writeFile(looseComponent, 'export default function LoosePanel() { return <div />; }\n');

    try {
      expect(() =>
        execSync('npm run test:colocate', {
          cwd: projectDir,
          stdio: 'pipe',
        }),
      ).toThrow(/loose component file/);
    } finally {
      await fs.remove(looseComponent);
    }
  });

  it('generated structure validator allows untested sources and enforces flat-first folders', async () => {
    const projectDir = getRouterFixture('none').projectDir;
    const untestedSource = path.join(projectDir, 'src/lib/new-behavior.ts');
    const prematureFolder = path.join(projectDir, 'src/lib/feature');
    await fs.writeFile(untestedSource, 'export const newBehavior = () => true;\n');

    expect(() =>
      execSync('npm run test:colocate', {
        cwd: projectDir,
        stdio: 'pipe',
      }),
    ).not.toThrow();

    await fs.mkdirp(prematureFolder);
    await fs.writeFile(path.join(prematureFolder, 'helper.ts'), 'export const helper = () => true;\n');

    try {
      expect(() =>
        execSync('npm run test:colocate', {
          cwd: projectDir,
          stdio: 'pipe',
        }),
      ).toThrow(/flat-first rule/);
    } finally {
      await fs.remove(untestedSource);
      await fs.remove(prematureFolder);
    }
  });
});
