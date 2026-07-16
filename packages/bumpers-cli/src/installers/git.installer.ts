import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { gitInit, gitAdd, gitCommit, lefthookInstall } from '../utils/git.js';

export const installGit: Installer = {
  name: 'Initializing git repository...',
  phase: InstallerPhase.GIT,
  run: async (opts) => {
    const { projectDir } = opts;

    gitInit(projectDir);
    gitAdd(projectDir);
    gitCommit(projectDir, 'chore: initial scaffold via bumpers');
    lefthookInstall(projectDir);
  },
};
