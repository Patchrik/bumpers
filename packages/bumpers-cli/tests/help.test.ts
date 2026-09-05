import { describe, expect, it } from 'vitest';
import { createProgram } from '../src/index.js';
import { TOP_LEVEL_HELP_NOTE, formatUpHelpText } from '../src/shared/help.js';

describe('CLI help text', () => {
  it('keeps top-level help concise and points to up help for details', () => {
    const program = createProgram();

    const help = program.helpInformation();

    expect(help).toContain('Usage: bumpers [options] [command]');
    expect(help).toContain('up [project-name] [options]');
    expect(TOP_LEVEL_HELP_NOTE).toContain('bumpers up --help');
    expect(help).not.toContain('@playwright/test');
  });

  it('shows detailed up help with examples and scaffold defaults', () => {
    const program = createProgram();
    const upCommand = program.commands.find((command) => command.name() === 'up');

    expect(upCommand).toBeDefined();

    const help = `${upCommand?.helpInformation() ?? ''}\n${formatUpHelpText()}`;

    expect(help).toContain('bumpers up my-electron-app --electron');
    expect(help).toContain('bumpers up my-teams-app --teams-tab --display-name "My Teams App"');
    expect(help).toContain('bumpers up my-react-app --react --pm pnpm');
    expect(help).toContain('bumpers up my-react-app --react --router react-router --state jotai');
    expect(help).toContain('Flags `--electron`, `--teams-tab`, and `--react` are mutually exclusive.');
    expect(help).toContain('Run `bumpers up` for the complete interactive wizard.');
    expect(help).toContain('`--display-name` only applies to `--teams-tab`.');
    expect(help).toContain('--router: tanstack, react-router, wouter, none. Default: tanstack.');
    expect(help).toContain('--state: zustand, jotai, redux-toolkit, none. Default: zustand.');
    expect(help).toContain('Vitest (vitest, @vitest/coverage-v8)');
    expect(help).toContain('Playwright (@playwright/test)');
    expect(help).toContain('Storybook (storybook, @storybook/react-vite, @storybook/addon-essentials, @storybook/test)');
    expect(help).toContain('ESLint (eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals)');
    expect(help).toContain('Biome (@biomejs/biome)');
    expect(help).toContain('Git hooks (lefthook, @commitlint/cli, @commitlint/config-conventional)');
    expect(help).toContain('Electron');
    expect(help).toContain('@electron-toolkit/utils');
    expect(help).toContain('Teams Tab');
    expect(help).toContain('@microsoft/teams-js');
    expect(help).toContain('React SPA');
    expect(help).toContain('@tanstack/react-router');
  });
});
