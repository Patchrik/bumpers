import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readTemplate } from '../utils/templates.js';

export const installGithubActions: Installer = {
  name: 'Adding GitHub Actions CI pipeline...',
  phase: InstallerPhase.ENFORCEMENT,
  run: async (opts) => {
    const { projectDir, packageManager } = opts;

    await fs.mkdirp(path.join(projectDir, '.github/workflows'));

    const pmCache = packageManager === 'bun' ? '' : packageManager;
    const installCmd =
      packageManager === 'pnpm'
        ? 'pnpm install --frozen-lockfile'
        : packageManager === 'bun'
          ? 'bun install --frozen-lockfile'
          : 'npm ci';
    const runPrefix =
      packageManager === 'npm' ? 'npm run' : packageManager;

    const ciTemplatePath =
      opts.template === 'teams-tab' ? 'github-actions/ci-teams-tab.yml'
      : opts.template === 'react' ? 'github-actions/ci-react.yml'
      : 'github-actions/ci.yml';

    const ciTemplate = await readTemplate(ciTemplatePath, {
      pmCache,
      installCmd,
      runPrefix,
    });
    await fs.writeFile(
      path.join(projectDir, '.github/workflows/ci.yml'),
      ciTemplate,
    );

    await fs.writeFile(
      path.join(projectDir, '.github/CODEOWNERS'),
      `# Code owners — add your team here\n# * @your-org/your-team\n`,
    );
  },
};
