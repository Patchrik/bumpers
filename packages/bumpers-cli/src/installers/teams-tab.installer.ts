import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDependencies, addDevDependencies, addScripts } from '../utils/pkg.js';
import { readTemplate, TEMPLATES_DIR, writeTemplateFile } from '../utils/templates.js';
import { TEAMS_TAB_DIRS, TEAMS_TAB_FILES, TEAMS_TAB_SCRIPT_CMDS, TEAMS_TAB_TEST_IDS, SCRIPT_KEYS } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installTeamsTab: Installer = {
  name: 'Setting up Microsoft Teams Tab + React + Vite...',
  phase: InstallerPhase.SCAFFOLD,
  run: async (opts) => {
    const { projectDir, projectName } = opts;
    const displayName = opts.displayName?.trim() || projectName;

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDependencies(pkg, {
      '@microsoft/teams-js': VERSIONS.teamsJs,
      'react': VERSIONS.react,
      'react-dom': VERSIONS.reactDom,
    });

    addDevDependencies(pkg, {
      'typescript': VERSIONS.typescript,
      '@types/react': VERSIONS.typesReact,
      '@types/react-dom': VERSIONS.typesReactDom,
      '@vitejs/plugin-react': VERSIONS.vitejsPluginReact,
      'vite-plugin-mkcert': VERSIONS.vitejsPluginMkcert,
      'vite': VERSIONS.vite,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.DEV]: TEAMS_TAB_SCRIPT_CMDS.DEV,
      [SCRIPT_KEYS.DEV_LOCAL]: TEAMS_TAB_SCRIPT_CMDS.DEV_LOCAL,
      [SCRIPT_KEYS.DEV_SETUP]: TEAMS_TAB_SCRIPT_CMDS.DEV_SETUP,
      [SCRIPT_KEYS.DEV_TEAMS]: TEAMS_TAB_SCRIPT_CMDS.DEV_TEAMS,
      [SCRIPT_KEYS.BUILD]: TEAMS_TAB_SCRIPT_CMDS.BUILD,
      [SCRIPT_KEYS.PREVIEW]: TEAMS_TAB_SCRIPT_CMDS.PREVIEW,
      [SCRIPT_KEYS.TEAMS_PACKAGE]: TEAMS_TAB_SCRIPT_CMDS.TEAMS_PACKAGE,
    });

    await writePackageJson(projectDir, pkg);

    // --- Directories ---
    await fs.mkdirp(path.join(projectDir, TEAMS_TAB_DIRS.SRC));
    await fs.mkdirp(path.join(projectDir, TEAMS_TAB_DIRS.APP_PACKAGE));
    await fs.mkdirp(path.join(projectDir, TEAMS_TAB_DIRS.ENV));
    await fs.mkdirp(path.join(projectDir, TEAMS_TAB_DIRS.SCRIPTS));

    // --- Teams manifest ---
    const manifest = await readTemplate('teams-tab/manifest.json', {
      projectName,
      displayName,
      appId: randomUUID(),
    });
    await fs.writeFile(path.join(projectDir, TEAMS_TAB_FILES.MANIFEST), manifest);

    // --- Icons (copy from templates) ---
    await fs.copy(
      path.join(TEMPLATES_DIR, 'teams-tab/color.png'),
      path.join(projectDir, TEAMS_TAB_FILES.COLOR_ICON),
    );
    await fs.copy(
      path.join(TEMPLATES_DIR, 'teams-tab/outline.png'),
      path.join(projectDir, TEAMS_TAB_FILES.OUTLINE_ICON),
    );

    // --- Environment files ---
    await fs.writeFile(
      path.join(projectDir, TEAMS_TAB_FILES.ENV_DEV),
      `# Teams Tab development environment
TAB_ENDPOINT=https://localhost:53000
TAB_DOMAIN=localhost
`,
    );

    await fs.writeFile(
      path.join(projectDir, TEAMS_TAB_FILES.ENV_LOCAL),
      `# Local overrides (not committed)
# TAB_ENDPOINT=https://localhost:53000
# TAB_DOMAIN=localhost
`,
    );

    // --- TypeScript config updates ---
    const rootTsconfig = await fs.readJson(path.join(projectDir, 'tsconfig.json'));
    rootTsconfig.compilerOptions = {
      ...rootTsconfig.compilerOptions,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      jsx: 'react-jsx',
    };
    // Teams Tab has no sub-projects — remove references
    delete rootTsconfig.references;
    await fs.writeJson(path.join(projectDir, 'tsconfig.json'), rootTsconfig, { spaces: 2 });

    const vars = {
      projectName,
      displayName,
      teamsContextTestId: TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT,
    };

    const templateFiles: Array<[outputPath: string, templatePath: string]> = [
      [TEAMS_TAB_FILES.VITE_CONFIG, 'teams-tab/vite.config.ts'],
      [TEAMS_TAB_FILES.HTML, 'teams-tab/index.html'],
      [TEAMS_TAB_FILES.MAIN, 'teams-tab/src/main.tsx'],
      ['src/Root.tsx', 'teams-tab/src/Root.tsx'],
      [TEAMS_TAB_FILES.APP, 'teams-tab/src/App.tsx'],
      ['src/Components/TeamsContextPanel/TeamsContextPanel.tsx', 'teams-tab/src/Components/TeamsContextPanel/TeamsContextPanel.tsx'],
      [TEAMS_TAB_FILES.CSS, 'teams-tab/src/App.css'],
      [TEAMS_TAB_FILES.ENV_DTS, 'teams-tab/src/env.d.ts'],
      [TEAMS_TAB_FILES.DEV_SCRIPT, 'teams-tab/scripts/dev.mjs'],
      [TEAMS_TAB_FILES.PACKAGE_SCRIPT, 'teams-tab/scripts/package-teams-app.mjs'],
    ];

    for (const [outputPath, templatePath] of templateFiles) {
      await writeTemplateFile(projectDir, outputPath, templatePath, vars);
    }
  },
};
