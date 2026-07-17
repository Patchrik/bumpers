import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies, addScripts } from '../utils/pkg.js';
import { writeTemplateFile } from '../utils/templates.js';
import {
  FILES,
  IPC,
  TEST_IDS,
  SCRIPT_KEYS,
  SCRIPT_CMDS,
  TEST_GLOBS,
  PACKAGES,
  REACT_FILES,
  REACT_TEST_GLOBS,
  REACT_TEST_IDS,
  TEAMS_TAB_FILES,
  TEAMS_TAB_TEST_GLOBS,
  TEAMS_TAB_TEST_IDS,
} from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

function getReactTestScript(command: string, router: string | undefined): string {
  return router === 'tanstack' ? `tsr generate && ${command}` : command;
}

export const installVitest: Installer = {
  name: 'Configuring Vitest (unit tests + coverage)...',
  phase: InstallerPhase.TESTING,
  run: async (opts) => {
    const { projectDir, projectName } = opts;

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      'vitest': VERSIONS.vitest,
      '@vitest/coverage-v8': VERSIONS.vitestCoverageV8,
      '@testing-library/react': VERSIONS.testingLibraryReact,
      '@testing-library/jest-dom': VERSIONS.testingLibraryJestDom,
      'jsdom': VERSIONS.jsdom,
    });
    if (opts.template === 'react') {
      const router = opts.reactOptions?.router ?? 'tanstack';
      addDevDependencies(pkg, {
        '@testing-library/user-event': VERSIONS.testingLibraryUserEvent,
      });
    }

    addScripts(pkg, {
      [SCRIPT_KEYS.TEST]:
        opts.template === 'react'
          ? getReactTestScript('vitest run', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST,
      [SCRIPT_KEYS.TEST_WATCH]:
        opts.template === 'react'
          ? getReactTestScript('vitest', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST_WATCH,
      [SCRIPT_KEYS.TEST_COVERAGE]:
        opts.template === 'react'
          ? getReactTestScript('vitest run --coverage', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST_COVERAGE,
    });

    await writePackageJson(projectDir, pkg);

    if (opts.template === 'react') {
      const router = opts.reactOptions?.router ?? 'tanstack';
      const stateManagement = opts.reactOptions?.stateManagement ?? 'zustand';
      const httpClient = opts.reactOptions?.httpClient ?? 'axios';
      const vars = {
        projectName,
        reactCounterIncrementTestId: REACT_TEST_IDS.COUNTER_INCREMENT,
        reactCounterTestId: REACT_TEST_IDS.COUNTER,
        reactHeadingTestId: REACT_TEST_IDS.HEADING,
        reactMainFile: REACT_FILES.MAIN,
        reactNavAboutTestId: REACT_TEST_IDS.NAV_ABOUT,
        reactNavHomeTestId: REACT_TEST_IDS.NAV_HOME,
        reactTestGlobInclude: REACT_TEST_GLOBS.JSDOM_INCLUDES[0],
        reactRouteTreeGenExclude:
          router === 'tanstack' ? `        '${REACT_FILES.ROUTE_TREE_GEN}',\n` : '',
      };
      const templateFiles: Array<[outputPath: string, templatePath: string]> = [
        ['vitest.config.ts', 'vitest/react/vitest.config.ts'],
        ['vitest.setup.ts', 'vitest/react/vitest.setup.ts'],
      ];

      if (stateManagement === 'zustand') {
        templateFiles.push(
          ['src/store/counter.test.ts', 'vitest/react/src/store/counter.test.ts'],
          ['src/Components/Counter/Counter.test.tsx', 'vitest/react/src/Components/Counter/Counter.test.tsx'],
        );
      } else if (stateManagement === 'jotai') {
        templateFiles.push(
          ['src/store/atoms.test.ts', 'vitest/react/state-jotai/src/store/atoms.test.ts'],
          ['src/Components/Counter/Counter.test.tsx', 'vitest/react/state-jotai/src/Components/Counter/Counter.test.tsx'],
        );
      } else if (stateManagement === 'redux-toolkit') {
        templateFiles.push(
          ['src/store/store.test.ts', 'vitest/react/state-redux-toolkit/src/store/store.test.ts'],
          ['src/store/slices/counterSlice.test.ts', 'vitest/react/state-redux-toolkit/src/store/slices/counterSlice.test.ts'],
          ['src/store/services/api.test.ts', 'vitest/react/state-redux-toolkit/src/store/services/api.test.ts'],
          ['src/Components/Counter/Counter.test.tsx', 'vitest/react/state-redux-toolkit/src/Components/Counter/Counter.test.tsx'],
        );
      } else {
        templateFiles.push(
          ['src/Components/Counter/Counter.test.tsx', 'vitest/react/state-none/src/Components/Counter/Counter.test.tsx'],
        );
      }

      if (httpClient === 'axios') {
        templateFiles.push(['src/lib/api.test.ts', 'vitest/react/src/lib/api.test.ts']);
      }

      for (const [outputPath, templatePath] of templateFiles) {
        await writeTemplateFile(projectDir, outputPath, templatePath, vars);
      }
    } else if (opts.template === 'teams-tab') {
      const displayName = opts.displayName?.trim() || projectName;
      const vars = {
        displayName,
        teamsContextTestId: TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT,
        teamsMainFile: TEAMS_TAB_FILES.MAIN,
        teamsTestGlobInclude: TEAMS_TAB_TEST_GLOBS.JSDOM_INCLUDES[0],
      };
      const templateFiles: Array<[outputPath: string, templatePath: string]> = [
        ['vitest.config.ts', 'vitest/teams-tab/vitest.config.ts'],
        ['vitest.setup.ts', 'vitest/teams-tab/vitest.setup.ts'],
        ['__mocks__/@microsoft/teams-js.ts', 'vitest/teams-tab/__mocks__/@microsoft/teams-js.ts'],
        [
          'src/Components/TeamsContextPanel/TeamsContextPanel.test.tsx',
          'vitest/teams-tab/src/Components/TeamsContextPanel/TeamsContextPanel.test.tsx',
        ],
      ];

      for (const [outputPath, templatePath] of templateFiles) {
        await writeTemplateFile(projectDir, outputPath, templatePath, vars);
      }
    } else {
      // --- Electron: dual node+jsdom environments, mock electron ---
      // vitest.config.ts
      await fs.writeFile(
        path.join(projectDir, 'vitest.config.ts'),
        `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ${JSON.stringify(TEST_GLOBS.NODE_INCLUDES)},
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ${JSON.stringify(TEST_GLOBS.JSDOM_INCLUDES)},
        },
      },
    ],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'node_modules',
        'dist',
        'out',
        '.storybook',
        'e2e',
        'scripts/**',
        '**/*.config.*',
        '**/*.stories.*',
        '${FILES.RENDERER_ENTRY}',
        '**/*.d.ts',
      ],
    },
  },
});
`,
      );

      // vitest.setup.ts
      await fs.writeFile(
        path.join(projectDir, 'vitest.setup.ts'),
        `import '@testing-library/jest-dom/vitest';
`,
      );

      // --- Centralized Electron mock for all tests ---
      // Vitest resolves __mocks__/<module>.ts at the project root for node_modules mocks
      await fs.mkdirp(path.join(projectDir, '__mocks__'));

      await fs.writeFile(
        path.join(projectDir, '__mocks__/electron.ts'),
        `import { vi } from 'vitest';

export const app = {
  getPath: vi.fn().mockReturnValue('/tmp/test-app'),
  requestSingleInstanceLock: vi.fn().mockReturnValue(true),
  whenReady: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  quit: vi.fn(),
};

export const BrowserWindow = vi.fn().mockImplementation(() => ({
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  on: vi.fn(),
  webContents: {
    openDevTools: vi.fn(),
    setWindowOpenHandler: vi.fn(),
  },
}));

export const ipcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
};

export const ipcRenderer = {
  invoke: vi.fn(),
  on: vi.fn(),
  send: vi.fn(),
};

export const contextBridge = {
  exposeInMainWorld: vi.fn(),
};

export const shell = {
  openExternal: vi.fn(),
};
`,
      );

      // --- Example test files (co-located with source) ---

      // src/main/window.test.ts
      await fs.writeFile(
        path.join(projectDir, 'src/main/window.test.ts'),
        `import { describe, it, expect, vi } from 'vitest';

vi.mock('electron');
vi.mock('${PACKAGES.ELECTRON_TOOLKIT_UTILS}', () => ({
  is: { dev: true },
}));

describe('window', () => {
  it('exports createMainWindow as a function', async () => {
    const { createMainWindow } = await import('./window.js');
    expect(typeof createMainWindow).toBe('function');
  });

  it('creates a BrowserWindow with secure defaults', async () => {
    const { BrowserWindow } = await import('electron');
    const { createMainWindow } = await import('./window.js');
    createMainWindow();
    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        webPreferences: expect.objectContaining({
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        }),
      })
    );
  });
});
`,
      );

      // src/main/ipc/example.ipc.test.ts
      await fs.writeFile(
        path.join(projectDir, 'src/main/ipc/example.ipc.test.ts'),
        `import { describe, it, expect, vi } from 'vitest';

vi.mock('electron');

import { getExampleItems, getExampleItem } from './example.ipc.js';

describe('example IPC handlers', () => {
  it('getExampleItems returns an array', () => {
    const items = getExampleItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('getExampleItems returns 3 items', () => {
    const items = getExampleItems();
    expect(items).toHaveLength(3);
  });

  it('getExampleItem returns item by id', () => {
    const item = getExampleItem(1);
    expect(item).toBeDefined();
    expect(item?.id).toBe(1);
    expect(item?.title).toBe('First Item');
  });

  it('getExampleItem returns undefined for unknown id', () => {
    const item = getExampleItem(999);
    expect(item).toBeUndefined();
  });
});
`,
      );

      // src/preload/index.test.ts
      await fs.writeFile(
        path.join(projectDir, 'src/preload/index.test.ts'),
        `import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron');

describe('preload', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exposes electronAPI via contextBridge', async () => {
    const { contextBridge } = await import('electron');
    await import('./index.js');
    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      '${IPC.BRIDGE_NAME}',
      expect.objectContaining({
        getExampleItems: expect.any(Function),
        getExampleItem: expect.any(Function),
      })
    );
  });
});
`,
      );

      // src/renderer/src/App.test.tsx
      await fs.writeFile(
        path.join(projectDir, 'src/renderer/src/App.test.tsx'),
        `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.js';

// Mock the electronAPI
beforeEach(() => {
  window.${IPC.BRIDGE_NAME} = {
    getExampleItems: vi.fn().mockResolvedValue([]),
    getExampleItem: vi.fn().mockResolvedValue(undefined),
  };
});

describe('App', () => {
  it('renders the heading with project name', async () => {
    render(<App />);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('${projectName}');
  });
});
`,
      );

      await fs.mkdirp(path.join(projectDir, 'src/renderer/src/Components/ExampleItems'));
      await fs.writeFile(
        path.join(projectDir, 'src/renderer/src/Components/ExampleItems/ExampleItems.test.tsx'),
        `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExampleItems from './ExampleItems.js';

beforeEach(() => {
  window.${IPC.BRIDGE_NAME} = {
    getExampleItems: vi.fn().mockResolvedValue([
      { id: 1, title: 'First Item', status: 'active', created_at: '2024-01-01' },
    ]),
    getExampleItem: vi.fn().mockResolvedValue(undefined),
  };
});

describe('ExampleItems', () => {
  it('renders items from the Electron API', async () => {
    render(<ExampleItems />);

    expect(await screen.findByTestId('${TEST_IDS.EXAMPLE_ITEM}')).toHaveTextContent('First Item');
  });
});
`,
      );
    }
  },
};
