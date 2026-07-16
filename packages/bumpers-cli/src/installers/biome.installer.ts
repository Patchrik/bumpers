import path from 'node:path';
import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { readPackageJson, writePackageJson, addDevDependencies, addScripts } from '../utils/pkg.js';
import { SCRIPT_KEYS, SCRIPT_CMDS } from '../shared/constants.js';
import { VERSIONS } from '../shared/versions.js';

export const installBiome: Installer = {
  name: 'Configuring Biome (formatting)...',
  phase: InstallerPhase.QUALITY,
  run: async (opts) => {
    const { projectDir } = opts;
    const ignoreRouteTree = opts.template === 'react' && opts.reactOptions?.router === 'tanstack';

    // Update package.json
    const pkg = await readPackageJson(projectDir);

    addDevDependencies(pkg, {
      '@biomejs/biome': VERSIONS.biome,
    });

    addScripts(pkg, {
      [SCRIPT_KEYS.FORMAT]: SCRIPT_CMDS.FORMAT,
      [SCRIPT_KEYS.FORMAT_CHECK]: SCRIPT_CMDS.FORMAT_CHECK,
    });

    await writePackageJson(projectDir, pkg);

    // biome.json
    await fs.writeJson(
      path.join(projectDir, 'biome.json'),
      {
        $schema: 'https://biomejs.dev/schemas/1.9.0/schema.json',
        organizeImports: { enabled: true },
        javascript: {
          formatter: {
            quoteStyle: 'single',
          },
        },
        json: {
          formatter: {
            trailingCommas: 'none',
          },
        },
        formatter: {
          indentStyle: 'space',
          indentWidth: 2,
          lineWidth: 100,
        },
        linter: { enabled: false },
        files: {
          ignore: [
            'dist',
            'out',
            'node_modules',
            'coverage',
            'storybook-static',
            'playwright-report',
            'test-results',
            ...(ignoreRouteTree ? ['src/routeTree.gen.ts'] : []),
          ],
        },
      },
      { spaces: 2 },
    );

    // Install biome and auto-format all scaffolded files so format:check passes out of the box
    try {
      const biomeVersion = VERSIONS.biome;
      const installCmd =
        opts.packageManager === 'pnpm'
          ? `pnpm add -D @biomejs/biome@${biomeVersion}`
          : opts.packageManager === 'bun'
            ? `bun add -D @biomejs/biome@${biomeVersion}`
            : `npm install --save-dev @biomejs/biome@${biomeVersion}`;

      const runCmd =
        opts.packageManager === 'pnpm'
          ? 'pnpm exec biome'
          : opts.packageManager === 'bun'
            ? 'bunx biome'
            : 'npx biome';

      execSync(installCmd, { cwd: projectDir, stdio: 'pipe' });
      execSync(`${runCmd} format --write .`, { cwd: projectDir, stdio: 'pipe' });
    } catch {
      // Non-critical: biome can be installed and format run manually.
      // The full install in validate.installer will install biome anyway.
    }
  },
};
