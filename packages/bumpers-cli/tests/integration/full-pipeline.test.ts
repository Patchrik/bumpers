import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { buildInstallerPipeline } from '../../src/commands/up.js';
import { runInstallers } from '../../src/installers/index.js';
import type { InstallerOptions } from '../../src/installers/index.js';

// Skip unless explicitly enabled — this test runs npm install and takes minutes
const ENABLED = process.env.FULL_INTEGRATION === '1';

describe.skipIf(!ENABLED)('full pipeline integration (slow)', () => {
  let projectDir: string;
  const projectName = 'full-test';

  beforeAll(async () => {
    projectDir = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-full-')),
      projectName,
    );
    await fs.mkdirp(projectDir);

    const opts: InstallerOptions = {
      projectName,
      projectDir,
      template: 'electron',
      packageManager: 'npm',
      cliVersion: '0.1.0',
    };

    // Run the REAL pipeline including installValidate
    const installers = buildInstallerPipeline({ template: 'electron' });
    await runInstallers(installers, opts);
  }, 600_000); // 10 minute timeout

  afterAll(() => {
    if (projectDir) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  it('node_modules exists (npm install succeeded)', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'node_modules'))).toBe(true);
  });

  it('TypeScript compiles the main process without errors', () => {
    // Check main process tsconfig (Node.js target) — this is the most
    // likely to break from template changes. Renderer check is skipped
    // because vitest types (jest-dom matchers) need vitest's type setup
    // which tsc alone doesn't load.
    const result = execSync('npx tsc -p tsconfig.main.json --noEmit', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    });
    expect(result).toBeDefined();
  });

  it('generated unit tests pass', () => {
    const output = execSync('npm run test', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();
    expect(output).toContain('passed');
  });

  it('build succeeds', () => {
    const result = execSync('npm run build', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    });
    expect(result).toBeDefined();
  });

  it('ESLint passes', () => {
    execSync('npm run lint', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('Biome format check passes', () => {
    execSync('npm run format:check', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('co-location check passes', () => {
    execSync('npm run test:colocate', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('git repo has one commit', () => {
    const log = execSync('git log --oneline', {
      cwd: projectDir,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    const commits = log.split('\n');
    expect(commits.length).toBe(1);
    expect(commits[0]).toContain('initial scaffold via bumpers');
  });

  it('package.json has the correct name', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe(projectName);
  });
});

describe.skipIf(!ENABLED)('full pipeline integration — Teams Tab (slow)', () => {
  let projectDir: string;
  const projectName = 'full-test-tab';

  beforeAll(async () => {
    projectDir = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-full-tab-')),
      projectName,
    );
    await fs.mkdirp(projectDir);

    const opts: InstallerOptions = {
      projectName,
      projectDir,
      template: 'teams-tab',
      packageManager: 'npm',
      cliVersion: '0.1.0',
    };

    const installers = buildInstallerPipeline({ template: 'teams-tab' });
    await runInstallers(installers, opts);
  }, 600_000);

  afterAll(() => {
    if (projectDir) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  it('node_modules exists (npm install succeeded)', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'node_modules'))).toBe(true);
  });

  it('TypeScript compiles without errors', () => {
    const result = execSync('npx tsc --noEmit', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    });
    expect(result).toBeDefined();
  });

  it('generated unit tests pass', () => {
    const output = execSync('npm run test', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();
    expect(output).toContain('passed');
  });

  it('ESLint passes', () => {
    execSync('npm run lint', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('Biome format check passes', () => {
    execSync('npm run format:check', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('co-location check passes', () => {
    execSync('npm run test:colocate', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('git repo has one commit', () => {
    const log = execSync('git log --oneline', {
      cwd: projectDir,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    const commits = log.split('\n');
    expect(commits.length).toBe(1);
    expect(commits[0]).toContain('initial scaffold via bumpers');
  });

  it('package.json has the correct name', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe(projectName);
  });
});

describe.skipIf(!ENABLED)('full pipeline integration — React (slow)', () => {
  let projectDir: string;
  const projectName = 'full-test-react';

  beforeAll(async () => {
    projectDir = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-full-react-')),
      projectName,
    );
    await fs.mkdirp(projectDir);

    const opts: InstallerOptions = {
      projectName,
      projectDir,
      template: 'react',
      packageManager: 'npm',
      cliVersion: '0.1.0',
      reactOptions: {
        router: 'tanstack',
        stateManagement: 'zustand',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    };

    const installers = buildInstallerPipeline({ template: 'react' });
    await runInstallers(installers, opts);
  }, 600_000);

  afterAll(() => {
    if (projectDir) {
      fs.removeSync(path.dirname(projectDir));
    }
  });

  it('node_modules exists (npm install succeeded)', async () => {
    expect(await fs.pathExists(path.join(projectDir, 'node_modules'))).toBe(true);
  });

  it('TypeScript compiles without errors', () => {
    const result = execSync('npx tsc --noEmit', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    });
    expect(result).toBeDefined();
  });

  it('generated unit tests pass', () => {
    const output = execSync('npm run test', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();
    expect(output).toContain('passed');
    expect(output).not.toContain('does not export a Route');
    expect(output).not.toContain('Conflicting configuration paths');
  });

  it('build succeeds without route scanner warnings or conflicts', () => {
    const output = execSync('npm run build 2>&1', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();
    expect(output).not.toContain('Conflicting configuration paths');
    expect(output).not.toContain('does not export a Route');
  });

  it('generated Playwright E2E passes out of the box', () => {
    const output = execSync('npm run test:e2e', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 180_000,
    }).toString();

    expect(output).toContain('2 passed');
  });

  it('ESLint passes', () => {
    execSync('npm run lint', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('Biome format check passes', () => {
    execSync('npm run format:check', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('co-location check passes', () => {
    execSync('npm run test:colocate', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 60_000,
    });
  });

  it('git repo has one commit', () => {
    const log = execSync('git log --oneline', {
      cwd: projectDir,
      stdio: 'pipe',
    })
      .toString()
      .trim();
    const commits = log.split('\n');
    expect(commits.length).toBe(1);
    expect(commits[0]).toContain('initial scaffold via bumpers');
  });

  it('package.json has the correct name', async () => {
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe(projectName);
  });
});
