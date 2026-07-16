import type { Command } from 'commander';
import path from 'node:path';
import fs from 'fs-extra';
import pc from 'picocolors';
import { validateProjectName } from '../utils/validate.js';
import { runInstallers } from '../installers/index.js';
import type {
  Installer,
  InstallerOptions,
  RouterOption,
  StateOption,
  TemplateType,
} from '../installers/index.js';
import { installBase } from '../installers/base.installer.js';
import { installElectron } from '../installers/electron.installer.js';
import { installTeamsTab } from '../installers/teams-tab.installer.js';
import { installReact } from '../installers/react.installer.js';
import { installVitest } from '../installers/vitest.installer.js';
import { installPlaywright } from '../installers/playwright.installer.js';
import { installStorybook } from '../installers/storybook.installer.js';
import { installEslint } from '../installers/eslint.installer.js';
import { installBiome } from '../installers/biome.installer.js';
import { installColocate } from '../installers/colocate.installer.js';
import { installHooks } from '../installers/hooks.installer.js';
import { installGit } from '../installers/git.installer.js';
import { installGithubActions } from '../installers/github-actions.installer.js';
import { installAiConfig } from '../installers/ai-config.installer.js';
import { installValidate } from '../installers/validate.installer.js';
import { runUpPrompts } from '../prompts/up.prompts.js';
import { formatUpHelpText } from '../shared/help.js';

export const DEFAULT_REACT_OPTIONS: InstallerOptions['reactOptions'] = {
  router: 'tanstack',
  stateManagement: 'zustand',
  httpClient: 'axios',
  dataFetching: 'tanstack-query',
  styling: 'tailwind',
};

const ROUTER_OPTIONS = ['tanstack', 'react-router', 'wouter', 'none'] as const;
const STATE_OPTIONS = ['zustand', 'jotai', 'redux-toolkit', 'none'] as const;

type UpCommandFlags = {
  electron: boolean;
  teamsTab: boolean;
  react: boolean;
  displayName?: string;
  pm: string;
  router?: string;
  state?: string;
};

function isRouterOption(value: string): value is RouterOption {
  return ROUTER_OPTIONS.includes(value as RouterOption);
}

function isStateOption(value: string): value is StateOption {
  return STATE_OPTIONS.includes(value as StateOption);
}

function resolveReactOptions(flags: {
  router?: string;
  state?: string;
}): InstallerOptions['reactOptions'] {
  const router = flags.router ?? DEFAULT_REACT_OPTIONS.router;
  const stateManagement = flags.state ?? DEFAULT_REACT_OPTIONS.stateManagement;

  if (!isRouterOption(router)) {
    console.error(pc.red(`✖ Invalid --router "${router}". Expected one of: ${ROUTER_OPTIONS.join(', ')}.`));
    process.exit(1);
  }

  if (!isStateOption(stateManagement)) {
    console.error(pc.red(`✖ Invalid --state "${stateManagement}". Expected one of: ${STATE_OPTIONS.join(', ')}.`));
    process.exit(1);
  }

  return {
    ...DEFAULT_REACT_OPTIONS,
    router,
    stateManagement,
    ...(stateManagement === 'redux-toolkit'
      ? {
          httpClient: 'fetch',
          dataFetching: 'rtk-query',
        }
      : {}),
  };
}

/**
 * Build the installer pipeline for the given options.
 * Exported for testing — the real pipeline is this function's output.
 */
export function buildInstallerPipeline(opts: {
  template: TemplateType;
}): Installer[] {
  return [
    installBase,
    ...(opts.template === 'electron' ? [installElectron] : []),
    ...(opts.template === 'teams-tab' ? [installTeamsTab] : []),
    ...(opts.template === 'react' ? [installReact] : []),
    installVitest,
    installPlaywright,
    installStorybook,
    installEslint,
    installBiome,
    installColocate,
    installHooks,
    installGithubActions,
    installAiConfig,
    // --- Runtime installers (run commands, not just write files) ---
    installValidate,  // npm install + run tests + print summary
    installGit,       // MUST BE LAST — git init + first commit + lefthook install
  ];
}

export function registerUpCommand(program: Command): void {
  program
    .command('up <project-name>')
    .description('Scaffold a new project with testing guardrails')
    .option('--electron', 'Scaffold an Electron desktop app', false)
    .option('--teams-tab', 'Scaffold a Microsoft Teams Tab app', false)
    .option('--react', 'Scaffold a React SPA', false)
    .option('--display-name <name>', 'User-facing display name for Microsoft Teams Tab apps')
    .option('--pm <manager>', 'Package manager to use', 'npm')
    .option('--router <router>', 'React router: tanstack, react-router, wouter, none')
    .option('--state <state>', 'React state management: zustand, jotai, redux-toolkit, none')
    .addHelpText('afterAll', formatUpHelpText())
    .action(async (
      projectName: string,
      flags: UpCommandFlags,
    ) => {
      const validation = validateProjectName(projectName);
      if (!validation.valid) {
        console.error(pc.red(`✖ ${validation.message}`));
        process.exit(1);
      }

      const cliVersion = program.version() ?? '0.1.0';

      const selectedTemplateFlags = [flags.electron, flags.teamsTab, flags.react].filter(Boolean).length;
      if (selectedTemplateFlags > 1) {
        console.error(pc.red('✖ Cannot combine template flags. Pick one of --electron, --teams-tab, or --react.'));
        process.exit(1);
      }

      if (flags.displayName !== undefined && flags.displayName.trim().length === 0) {
        console.error(pc.red('✖ --display-name must not be empty'));
        process.exit(1);
      }

      if (flags.displayName !== undefined && !flags.teamsTab) {
        console.error(pc.red('✖ --display-name can only be used with --teams-tab'));
        process.exit(1);
      }

      const hasTemplateFlag = flags.electron || flags.teamsTab || flags.react;
      const hasHeadlessTemplateOptions = flags.router !== undefined || flags.state !== undefined;

      if (hasHeadlessTemplateOptions && !hasTemplateFlag) {
        console.error(pc.red('✖ --router and --state require an explicit template flag. Currently use --react.'));
        process.exit(1);
      }

      if (hasHeadlessTemplateOptions && !flags.react) {
        console.error(pc.red('✖ --router and --state are only supported with --react.'));
        process.exit(1);
      }

      let template: TemplateType = flags.electron ? 'electron' : flags.teamsTab ? 'teams-tab' : flags.react ? 'react' : 'electron';
      let packageManager = flags.pm;
      let reactOptions: InstallerOptions['reactOptions'];

      if (!hasTemplateFlag) {
        const result = await runUpPrompts(projectName, cliVersion);
        if (!result) {
          process.exit(0);
        }
        template = result.template;
        packageManager = result.packageManager;
        reactOptions = result.reactOptions;
      } else if (flags.react) {
        reactOptions = resolveReactOptions(flags);
      }

      const projectDir = path.resolve(process.cwd(), projectName);

      console.log('');
      console.log(pc.cyan(`  Scaffolding ${pc.bold(projectName)}...`));
      console.log('');

      await fs.mkdirp(projectDir);

      const opts: InstallerOptions = {
        projectName,
        projectDir,
        template,
        packageManager,
        cliVersion: cliVersion ?? '0.1.0',
        displayName: template === 'teams-tab' ? flags.displayName?.trim() ?? projectName : undefined,
        reactOptions,
      };

      const installers = buildInstallerPipeline({ template });

      await runInstallers(installers, opts);

      console.log('');
      console.log(pc.green(`  ✔ ${pc.bold(projectName)} scaffolded successfully!`));
      console.log('');
      console.log(`  ${pc.dim('Next steps:')}`);
      console.log(`  ${pc.dim('$')} cd ${projectName}`);
      console.log('');
    });
}
