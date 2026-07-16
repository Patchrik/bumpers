import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies, addScripts } from '../utils/pkg.js';
import { REACT_SCRIPT_CMDS, SCRIPT_KEYS, SCRIPT_CMDS, TEAMS_TAB_SCRIPT_CMDS } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installEslint: Installer = {
  name: 'Configuring ESLint (strict, type-aware)...',
  phase: InstallerPhase.QUALITY,
  run: async (opts) => {
    const { projectDir, template } = opts;
    const ignoreRouteTree = template === 'react' && opts.reactOptions?.router === 'tanstack';

    const scriptCmds =
      template === 'teams-tab' ? TEAMS_TAB_SCRIPT_CMDS
      : template === 'react' ? REACT_SCRIPT_CMDS
      : SCRIPT_CMDS;

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      'eslint': VERSIONS.eslint,
      '@eslint/js': VERSIONS.eslintJs,
      'typescript-eslint': VERSIONS.typescriptEslint,
      'eslint-plugin-react-hooks': VERSIONS.eslintPluginReactHooks,
      'eslint-plugin-react-refresh': VERSIONS.eslintPluginReactRefresh,
      'globals': VERSIONS.globals,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.LINT]: scriptCmds.LINT,
      [SCRIPT_KEYS.LINT_FIX]: scriptCmds.LINT_FIX,
    });

    await writePackageJson(projectDir, pkg);

    // eslint.config.js (flat config)
    await fs.writeFile(
      path.join(projectDir, 'eslint.config.js'),
      `import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'out', 'node_modules', 'coverage', 'storybook-static', 'e2e'${ignoreRouteTree ? ", 'src/routeTree.gen.ts'" : ''}] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
`,
    );
  },
};
