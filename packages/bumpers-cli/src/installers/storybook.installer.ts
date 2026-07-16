import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies, addScripts } from '../utils/pkg.js';
import { writeTemplateFile } from '../utils/templates.js';
import {
  IPC,
  SCRIPT_KEYS,
  SCRIPT_CMDS,
  STORYBOOK_GLOBS,
  REACT_STORYBOOK_GLOBS,
  TEAMS_TAB_STORYBOOK_GLOBS,
} from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installStorybook: Installer = {
  name: 'Configuring Storybook (component stories)...',
  phase: InstallerPhase.TESTING,
  run: async (opts) => {
    const { projectDir } = opts;

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      'storybook': VERSIONS.storybook,
      '@storybook/react-vite': VERSIONS.storybookReactVite,
      '@storybook/addon-essentials': VERSIONS.storybookAddonEssentials,
      '@storybook/test': VERSIONS.storybookTest,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.STORYBOOK]: SCRIPT_CMDS.STORYBOOK,
      [SCRIPT_KEYS.BUILD_STORYBOOK]: SCRIPT_CMDS.BUILD_STORYBOOK,
    });

    await writePackageJson(projectDir, pkg);

    // .storybook directory
    await fs.mkdirp(path.join(projectDir, '.storybook'));

    if (opts.template === 'react') {
      const stateManagement = opts.reactOptions?.stateManagement ?? 'zustand';
      const dataFetching = opts.reactOptions?.dataFetching ?? 'tanstack-query';
      const vars = {
        reactStorybookCssImport: REACT_STORYBOOK_GLOBS.CSS_IMPORT,
        reactStorybookStoriesGlob: REACT_STORYBOOK_GLOBS.STORIES,
      };
      const previewTemplatePath =
        stateManagement === 'redux-toolkit'
          ? 'storybook/react/redux/.storybook/preview.ts'
          : dataFetching === 'tanstack-query'
            ? 'storybook/react/.storybook/preview.ts'
            : 'storybook/react/.storybook/preview-basic.ts';
      const templateFiles: Array<[outputPath: string, templatePath: string]> = [
        ['.storybook/main.ts', 'storybook/react/.storybook/main.ts'],
        ['.storybook/preview.ts', previewTemplatePath],
        ['src/Components/Counter/Counter.stories.tsx', 'storybook/react/src/Components/Counter/Counter.stories.tsx'],
      ];

      for (const [outputPath, templatePath] of templateFiles) {
        await writeTemplateFile(projectDir, outputPath, templatePath, vars);
      }
    } else if (opts.template === 'teams-tab') {
      // --- Teams Tab: mock @microsoft/teams-js, flat src/ paths ---

      // .storybook/main.ts
      await fs.writeFile(
        path.join(projectDir, '.storybook/main.ts'),
        `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['${TEAMS_TAB_STORYBOOK_GLOBS.STORIES}'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  addons: ['@storybook/addon-essentials'],
};

export default config;
`,
      );

      // .storybook/preview.ts — mock teams-js for Storybook
      await fs.writeFile(
        path.join(projectDir, '.storybook/preview.ts'),
        `import type { Preview } from '@storybook/react';
import '${TEAMS_TAB_STORYBOOK_GLOBS.CSS_IMPORT}';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
`,
      );

      // Example story — Teams Tab
      await fs.writeFile(
        path.join(projectDir, 'src/Components/TeamsContextPanel/TeamsContextPanel.stories.tsx'),
        `import type { Meta, StoryObj } from '@storybook/react';
import TeamsContextPanel from './TeamsContextPanel';

const meta: Meta<typeof TeamsContextPanel> = {
  component: TeamsContextPanel,
  title: 'Components/TeamsContextPanel',
};

export default meta;
type Story = StoryObj<typeof TeamsContextPanel>;

export const Default: Story = {};
`,
      );
    } else {
      // --- Electron: mock electronAPI, nested renderer paths ---

      // Create mocks directory for Storybook
      await fs.mkdirp(path.join(projectDir, '.storybook/mocks'));

      // Mock electronAPI for Storybook (runs in browser, not Electron)
      await fs.writeFile(
        path.join(projectDir, '.storybook/mocks/electronAPI.ts'),
        `import type { IElectronAPI } from '../../shared/ipc-types';

// Mock IPC API for Storybook — Storybook runs in a browser, not Electron,
// so window.electronAPI does not exist. This mock provides sample data.
export const mockElectronAPI: IElectronAPI = {
  getExampleItems: async () => [
    { id: 1, title: 'Storybook Example Item', status: 'active', created_at: new Date().toISOString() },
    { id: 2, title: 'Another Item', status: 'inactive', created_at: new Date().toISOString() },
  ],
  getExampleItem: async (id: number) => ({
    id,
    title: \`Item \${id}\`,
    status: 'active',
    created_at: new Date().toISOString(),
  }),
};
`,
      );

      // .storybook/main.ts
      await fs.writeFile(
        path.join(projectDir, '.storybook/main.ts'),
        `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['${STORYBOOK_GLOBS.STORIES}'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  addons: ['@storybook/addon-essentials'],
};

export default config;
`,
      );

      // .storybook/preview.ts — injects the electronAPI mock globally
      await fs.writeFile(
        path.join(projectDir, '.storybook/preview.ts'),
        `import type { Preview } from '@storybook/react';
import '${STORYBOOK_GLOBS.CSS_IMPORT}';
import { mockElectronAPI } from './mocks/electronAPI';

// Stub window.electronAPI for Storybook (no Electron preload script in browser)
if (typeof window !== 'undefined' && !window.${IPC.BRIDGE_NAME}) {
  (window as any).${IPC.BRIDGE_NAME} = mockElectronAPI;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
`,
      );

      // Example story — Electron
      await fs.mkdirp(path.join(projectDir, 'src/renderer/src/Components/ExampleItems'));
      await fs.writeFile(
        path.join(projectDir, 'src/renderer/src/Components/ExampleItems/ExampleItems.stories.tsx'),
        `import type { Meta, StoryObj } from '@storybook/react';
import ExampleItems from './ExampleItems';

// window.electronAPI is automatically mocked via .storybook/preview.ts
// No per-story decorator needed for the default IPC mock.

const meta: Meta<typeof ExampleItems> = {
  component: ExampleItems,
  title: 'Components/ExampleItems',
};

export default meta;
type Story = StoryObj<typeof ExampleItems>;

export const Default: Story = {};
`,
      );
    }
  },
};
