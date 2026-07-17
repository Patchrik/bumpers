import { execSync } from 'node:child_process';
import pc from 'picocolors';
import { InstallerPhase } from './index.js';
import type { Installer } from './index.js';
import { SCRIPT_KEYS } from '../shared/constants.js';

interface StepResult {
  name: string;
  passed: boolean;
  detail?: string;
}

function runStep(name: string, command: string, cwd: string): StepResult {
  try {
    const output = execSync(command, { cwd, stdio: 'pipe', timeout: 300_000 }).toString();
    return { name, passed: true, detail: output.trim() };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name, passed: false, detail: msg.slice(0, 200) };
  }
}

export const installValidate: Installer = {
  name: 'Installing dependencies and running validation...',
  phase: InstallerPhase.VALIDATE,
  run: async (opts) => {
    const { projectDir, projectName, packageManager, template } = opts;

    // Step 1: Install dependencies
    const installCmd =
      packageManager === 'pnpm' ? 'pnpm install' :
      packageManager === 'bun' ? 'bun install' :
      'npm install';

    try {
      execSync(installCmd, { cwd: projectDir, stdio: 'pipe', timeout: 300_000 });
    } catch (error) {
      const msg = error instanceof Error ? error.message.slice(0, 300) : String(error);
      throw new Error(
        `Dependency installation failed (${installCmd}).\n` +
        `This is a fatal error — the scaffolded project cannot work without dependencies.\n` +
        `Try running "${installCmd}" manually in ${projectDir}.\n` +
        `Error: ${msg}`
      );
    }

    // Step 2: Install Playwright browsers
    try {
      execSync('npx playwright install --with-deps', {
        cwd: projectDir,
        stdio: 'pipe',
        timeout: 300_000,
      });
    } catch {
      // Non-critical — user can install later
    }

    // Step 3: Run validation checks
    const results: StepResult[] = [];

    results.push(runStep('Unit tests', `npm run ${SCRIPT_KEYS.TEST}`, projectDir));
    results.push(runStep('Lint', `npm run ${SCRIPT_KEYS.LINT}`, projectDir));
    results.push(runStep('Format', `npm run ${SCRIPT_KEYS.FORMAT_CHECK}`, projectDir));
    results.push(runStep('Source structure', `npm run ${SCRIPT_KEYS.TEST_COLOCATE}`, projectDir));

    // Parse test results
    const testResult = results.find((r) => r.name === 'Unit tests');
    let testSummary = '';
    if (testResult?.passed && testResult.detail) {
      const passMatch = testResult.detail.match(/(\d+) passed/);
      const fileMatch = testResult.detail.match(/(\d+) passed \((\d+)\)/);
      if (passMatch) {
        testSummary = `${passMatch[1]} unit tests passing`;
      }
      if (fileMatch) {
        testSummary = `${fileMatch[1]} tests passing across ${fileMatch[2]} files`;
      }
    }

    const lintResult = results.find((r) => r.name === 'Lint');
    const lintSummary = lintResult?.passed ? '0 lint warnings' : 'lint issues found';

    // Step 4: Print summary
    const templateDescMap: Record<string, string> = {
      'electron': 'Electron + React + TypeScript',
      'teams-tab': 'Microsoft Teams Tab — React + Vite + TypeScript',
      'react': 'React SPA',
    };
    const templateDesc = templateDescMap[template] ?? 'TypeScript';
    const ciSummary = template === 'react' || template === 'teams-tab'
      ? 'GitHub Actions CI on Ubuntu'
      : 'GitHub Actions CI on 3 OSes';

    console.log('');
    console.log(pc.cyan(`  ┌  bumpers v${opts.cliVersion}`));
    console.log(pc.cyan('  │'));
    console.log(pc.cyan(`  ◇  Scaffolded ${pc.bold(projectName)} (${templateDesc})`));
    console.log(pc.cyan('  │'));
    console.log(pc.cyan('  │  Tools configured:'));
    console.log(pc.cyan('  │    Vitest         Unit tests + project coverage'));
    console.log(pc.cyan('  │    Playwright     E2E + screenshot tests'));
    console.log(pc.cyan('  │    Storybook      Component stories'));
    console.log(pc.cyan('  │    ESLint         Linting (strict, type-aware)'));
    console.log(pc.cyan('  │    Biome          Formatting'));
    console.log(pc.cyan('  │    Lefthook       Git hooks (pre-commit, pre-push)'));
    console.log(pc.cyan('  │    Commitlint     Conventional commits'));
    console.log(pc.cyan(`  │    ${ciSummary}`));
    console.log(pc.cyan('  │'));

    const checks = results.map((r) => (r.passed ? pc.green('✔') : pc.red('✖')) + ' ' + r.name);
    console.log(pc.cyan(`  │  ${checks.join('  |  ')}`));

    if (testSummary) {
      console.log(pc.cyan(`  │  ${testSummary} | ${lintSummary}`));
    }

    console.log(pc.cyan('  │'));
    console.log(pc.cyan('  │  AI config: AGENTS.md teaches risk-based testing'));
    console.log(pc.cyan('  │    Protect boundaries, shared behavior, and regressions'));
    console.log(pc.cyan('  │'));
    console.log(pc.cyan('  │  Add your own stack — the guardrails will follow.'));
    console.log(pc.cyan('  │'));
    console.log(pc.cyan(`  └  cd ${projectName} && npm run dev`));
    console.log('');
  },
};
