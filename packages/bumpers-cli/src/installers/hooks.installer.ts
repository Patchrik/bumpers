import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies } from '../utils/pkg.js';
import { readTemplate } from '../utils/templates.js';
import { SCRIPT_KEYS } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installHooks: Installer = {
  name: 'Configuring git hooks (Lefthook + Commitlint)...',
  phase: InstallerPhase.ENFORCEMENT,
  run: async (opts) => {
    const { projectDir, packageManager } = opts;

    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      'lefthook': VERSIONS.lefthook,
      '@commitlint/cli': VERSIONS.commitlintCli,
      '@commitlint/config-conventional': VERSIONS.commitlintConfigConventional,
    });

    await writePackageJson(projectDir, pkg);

    const exec =
      packageManager === 'pnpm' ? 'pnpm exec'
      : packageManager === 'bun' ? 'bunx'
      : 'npx';
    const runPrefix = packageManager === 'npm' ? 'npm run' : packageManager;

    // lefthook.yml — read from template file, substitute script names + exec
    const lefthookYml = await readTemplate('hooks/lefthook.yml', {
      exec,
      runPrefix,
      scriptTest: SCRIPT_KEYS.TEST,
      scriptTestColocate: SCRIPT_KEYS.TEST_COLOCATE,
      scriptBuild: SCRIPT_KEYS.BUILD,
    });
    await fs.writeFile(path.join(projectDir, 'lefthook.yml'), lefthookYml);

    // commitlint.config.js
    await fs.writeFile(
      path.join(projectDir, 'commitlint.config.js'),
      `export default { extends: ['@commitlint/config-conventional'] };\n`,
    );
  },
};
