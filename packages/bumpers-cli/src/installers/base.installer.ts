import path from 'node:path';
import fs from 'fs-extra';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { writePackageJson } from '../utils/pkg.js';
import type { PackageJson } from '../utils/pkg.js';

export const installBase: Installer = {
  name: 'Setting up project foundation...',
  phase: InstallerPhase.FOUNDATION,
  run: async (opts) => {
    const { projectDir, projectName } = opts;

    // package.json
    const pkg: PackageJson = {
      name: projectName,
      version: '0.1.0',
      type: 'module',
      private: true,
      scripts: {},
      dependencies: {},
      devDependencies: {},
    };
    await writePackageJson(projectDir, pkg);

    // tsconfig.json
    const tsconfig = {
      compilerOptions: {
        strict: true,
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        isolatedModules: true,
      },
      references: [],
    };
    if (opts.template === 'teams-tab' || opts.template === 'react') {
      tsconfig.compilerOptions = {
        ...tsconfig.compilerOptions,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        jsx: 'react-jsx',
      };
      delete (tsconfig as { references?: unknown[] }).references;
    }
    await fs.writeJson(path.join(projectDir, 'tsconfig.json'), tsconfig, { spaces: 2 });

    // .gitignore
    const gitignoreEntries = [
      'node_modules',
      'dist',
      'out',
      'coverage',
      '.env',
      '*.db',
      'e2e/__screenshots__/',
      'storybook-static/',
      'playwright-report/',
      'test-results/',
    ];
    if (opts.template === 'teams-tab') {
      gitignoreEntries.push(
        'build/',
        'env/.env.local',
        'env/.env.*.local',
      );
    } else if (opts.template === 'react' && opts.reactOptions?.router === 'tanstack') {
      gitignoreEntries.push('src/routeTree.gen.ts');
    }
    const gitignore = gitignoreEntries.join('\n');
    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore + '\n');

    // .env.example
    const envExample = [
      '# Environment variables',
      '# Copy this file to .env and fill in the values',
      '',
      '# NODE_ENV=development',
    ].join('\n');
    await fs.writeFile(path.join(projectDir, '.env.example'), envExample + '\n');

    // README.md
    const installLine =
      opts.packageManager === 'pnpm' ? 'pnpm install'
      : opts.packageManager === 'bun' ? 'bun install'
      : 'npm install';
    const runPrefix = opts.packageManager === 'npm' ? 'npm run' : opts.packageManager;

    const readmeLines = [
      `# ${projectName}`,
      '',
      '> Scaffolded with [Bumpers](https://github.com/Patchrik/bumpers) — testing guardrails baked in.',
      '',
      '## Getting Started',
      '',
      '```bash',
      installLine,
      `${runPrefix} dev`,
      '```',
      '',
      '## Scripts',
      '',
      '<!-- Scripts will be populated by installers -->',
      '',
    ];

    if (opts.template === 'electron') {
      readmeLines.push(
        '## Adding Native Modules',
        '',
        'This project automatically rebuilds native Node.js modules for Electron via a postinstall script.',
        '',
        '```bash',
        '# Just install normally — the postinstall handles the rest',
        'npm install better-sqlite3',
        'npm install @types/better-sqlite3 --save-dev',
        '```',
        '',
        'If the postinstall fails, ensure you have C++ build tools:',
        '- **macOS:** `xcode-select --install`',
        '- **Windows:** Install [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)',
        '- **Linux:** `sudo apt-get install build-essential`',
        '',
      );
    } else if (opts.template === 'teams-tab') {
      readmeLines.push(
        '## Teams Development',
        '',
        'This is a Microsoft Teams Tab app.',
        '',
        '```bash',
        `${runPrefix} dev`,
        '```',
        '',
        'The standard dev command starts the local Teams tab workflow on `https://localhost`.',
        'The first run may prompt for one-time local certificate trust/bootstrap.',
        '',
        'If local HTTPS setup cannot complete automatically:',
        '',
        '```bash',
        `${runPrefix} dev:setup`,
        `${runPrefix} dev`,
        '```',
        '',
        '### Real Teams integration',
        '',
        '```bash',
        `${runPrefix} dev:teams`,
        '```',
        '',
        'This starts a public Dev Tunnel, updates `env/.env.local`, and writes `build/appPackage.zip`.',
        '',
        'Upload `build/appPackage.zip` in Teams:',
        '',
        'Apps -> Manage your apps -> Upload a custom app',
        '',
        '### First-time Dev Tunnel setup',
        '',
        'Install the `devtunnel` CLI, then log in:',
        '',
        '```bash',
        'devtunnel user login',
        '```',
        '',
        'Install options:',
        '',
        '- macOS: `brew install --cask devtunnel`',
        '- Windows: `winget install Microsoft.devtunnel`',
        '- Linux/macOS script: `curl -sL https://aka.ms/DevTunnelCliInstall | bash`',
        '',
        '`build/` and `env/.env.local` are generated runtime outputs and should not be committed.',
        'The tunnel workflow uses anonymous access so Teams can load the tab URL. Anyone with the tunnel URL can access your local dev server while it is running.',
        '',
      );
    } else if (opts.template === 'react') {
      readmeLines.push(
        '## React Development',
        '',
        'This is a standalone React SPA scaffolded by Bumpers.',
        '',
        '```bash',
        `${runPrefix} test`,
        `${runPrefix} storybook`,
        '```',
        '',
      );
    }

    const readme = readmeLines.join('\n');
    await fs.writeFile(path.join(projectDir, 'README.md'), readme);
  },
};
