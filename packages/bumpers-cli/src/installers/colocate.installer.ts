import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addScripts } from '../utils/pkg.js';
import { readTemplate } from '../utils/templates.js';
import { FILES, REACT_FILES, REACT_SCRIPT_CMDS, SCRIPT_KEYS, SCRIPT_CMDS } from '../shared/constants.js';

export const installColocate: Installer = {
  name: 'Adding test co-location enforcement...',
  phase: InstallerPhase.ENFORCEMENT,
  run: async (opts) => {
    const { projectDir } = opts;
    const scriptPath = opts.template === 'react' ? REACT_FILES.COLOCATE_SCRIPT : FILES.COLOCATE_SCRIPT;
    const scriptCommand = opts.template === 'react' ? REACT_SCRIPT_CMDS.TEST_COLOCATE : SCRIPT_CMDS.TEST_COLOCATE;

    const pkg = await readPackageJson(projectDir);
    addScripts(pkg, {
      [SCRIPT_KEYS.TEST_COLOCATE]: scriptCommand,
    });
    await writePackageJson(projectDir, pkg);

    await fs.mkdirp(path.join(projectDir, 'scripts'));

    // Copy template — no double-escaped regex, it's a real .mjs file
    const script = await readTemplate('colocate/check-test-files.mjs', {
      reactRouteTreeGenExclude:
        opts.template === 'react' && opts.reactOptions?.router === 'tanstack'
          ? ", 'routeTree.gen.ts'"
          : '',
    });
    await fs.writeFile(path.join(projectDir, scriptPath), script);
  },
};
