import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies, addScripts } from '../utils/pkg.js';
import { readTemplate } from '../utils/templates.js';
import {
  TEST_IDS,
  SCRIPT_KEYS,
  SCRIPT_CMDS,
  REACT_DEV_SERVER,
  REACT_TEST_IDS,
  TEAMS_TAB_TEST_IDS,
  TEAMS_TAB_DEV_SERVER,
} from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

function getReactE2EScript(command: string, router: string | undefined): string {
  return router === 'tanstack' ? `tsr generate && ${command}` : command;
}

export const installPlaywright: Installer = {
  name: 'Configuring Playwright (E2E + screenshot tests)...',
  phase: InstallerPhase.TESTING,
  run: async (opts) => {
    const { projectDir, packageManager } = opts;
    const runPrefix = packageManager === 'npm' ? 'npm run' : packageManager;

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      '@playwright/test': VERSIONS.playwright,
      '@types/node': VERSIONS.typesNode,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.TEST_E2E]:
        opts.template === 'react'
          ? getReactE2EScript('playwright test', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST_E2E,
      [SCRIPT_KEYS.TEST_E2E_HEADED]:
        opts.template === 'react'
          ? getReactE2EScript('playwright test --headed', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST_E2E_HEADED,
      [SCRIPT_KEYS.TEST_E2E_UPDATE]:
        opts.template === 'react'
          ? getReactE2EScript('playwright test --update-snapshots', opts.reactOptions?.router)
          : SCRIPT_CMDS.TEST_E2E_UPDATE,
    });

    await writePackageJson(projectDir, pkg);

    // e2e directory
    await fs.mkdirp(path.join(projectDir, 'e2e'));

    const templateDir = `playwright/${opts.template}`;
    const baseUrl =
      opts.template === 'react' ? REACT_DEV_SERVER.URL
      : opts.template === 'teams-tab' ? TEAMS_TAB_DEV_SERVER.LOCAL_HTTP_URL
      : '';
    const vars = {
      baseUrl,
      exampleItemTestId: TEST_IDS.EXAMPLE_ITEM,
      projectName: opts.projectName,
      reactCounterIncrementTestId: REACT_TEST_IDS.COUNTER_INCREMENT,
      reactCounterTestId: REACT_TEST_IDS.COUNTER,
      reactHeadingTestId: REACT_TEST_IDS.HEADING,
      reactNavAboutTestId: REACT_TEST_IDS.NAV_ABOUT,
      runPrefix,
      teamsContextTestId: TEAMS_TAB_TEST_IDS.TEAMS_CONTEXT,
    };

    await fs.writeFile(
      path.join(projectDir, 'playwright.config.ts'),
      await readTemplate(`${templateDir}/playwright.config.ts`, vars),
    );
    const reactE2ETemplate =
      opts.template === 'react'
        ? opts.reactOptions?.router === 'none'
          ? 'playwright/react/router-none/e2e/app.spec.ts'
          : 'playwright/react/router-with-nav/e2e/app.spec.ts'
        : `${templateDir}/e2e/app.spec.ts`;

    await fs.writeFile(
      path.join(projectDir, 'e2e/app.spec.ts'),
      await readTemplate(reactE2ETemplate, vars),
    );
  },
};
