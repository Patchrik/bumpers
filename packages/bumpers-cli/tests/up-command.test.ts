import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { registerUpCommand } from '../src/commands/up.js';
import { runInstallers } from '../src/installers/index.js';
import { runUpPrompts } from '../src/prompts/up.prompts.js';

vi.mock('../src/installers/index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/installers/index.js')>();
  return {
    ...actual,
    runInstallers: vi.fn(),
  };
});

vi.mock('../src/prompts/up.prompts.js', () => ({
  runUpPrompts: vi.fn(),
}));

describe('up command template flags', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bumpers-up-command-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    vi.mocked(runInstallers).mockResolvedValue(undefined);
    vi.mocked(runUpPrompts).mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(tempDir);
    vi.restoreAllMocks();
  });

  async function runCommand(args: string[]): Promise<void> {
    const program = new Command();
    program.version('0.1.0');
    program.exitOverride();
    registerUpCommand(program);
    await program.parseAsync(['node', 'bumpers', ...args]);
  }

  function mockProcessExit(): void {
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit ${code}`);
    });
  }

  it('uses default React options without prompts when --react is provided', async () => {
    await runCommand(['up', 'react-app', '--react', '--pm', 'npm']);

    expect(runUpPrompts).not.toHaveBeenCalled();
    expect(runInstallers).toHaveBeenCalledOnce();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      projectName: 'react-app',
      template: 'react',
      packageManager: 'npm',
      reactOptions: {
        router: 'tanstack',
        stateManagement: 'zustand',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });
  });

  it('uses the provided package manager when --react and --pm are provided', async () => {
    await runCommand(['up', 'react-app', '--react', '--pm', 'pnpm']);

    expect(runUpPrompts).not.toHaveBeenCalled();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      template: 'react',
      packageManager: 'pnpm',
    });
  });

  it('uses provided React router and state without prompts', async () => {
    await runCommand([
      'up',
      'react-app',
      '--react',
      '--router',
      'react-router',
      '--state',
      'jotai',
      '--pm',
      'npm',
    ]);

    expect(runUpPrompts).not.toHaveBeenCalled();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      projectName: 'react-app',
      template: 'react',
      reactOptions: {
        router: 'react-router',
        stateManagement: 'jotai',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });
  });

  it('keeps default state when only React router is provided', async () => {
    await runCommand(['up', 'react-app', '--react', '--router', 'wouter']);

    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      reactOptions: {
        router: 'wouter',
        stateManagement: 'zustand',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });
  });

  it('keeps default router when only React state is provided', async () => {
    await runCommand(['up', 'react-app', '--react', '--state', 'none']);

    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      reactOptions: {
        router: 'tanstack',
        stateManagement: 'none',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });
  });

  it('sets Fetch and RTK Query when state is Redux Toolkit', async () => {
    await runCommand(['up', 'react-app', '--react', '--router', 'wouter', '--state', 'redux-toolkit']);

    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      reactOptions: {
        router: 'wouter',
        stateManagement: 'redux-toolkit',
        httpClient: 'fetch',
        dataFetching: 'rtk-query',
        styling: 'tailwind',
      },
    });
  });

  it('keeps --electron and --teams-tab non-interactive', async () => {
    await runCommand(['up', 'electron-app', '--electron']);
    await runCommand(['up', 'teams-app', '--teams-tab']);

    expect(runUpPrompts).not.toHaveBeenCalled();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      template: 'electron',
      packageManager: 'npm',
      reactOptions: undefined,
    });
    expect(vi.mocked(runInstallers).mock.calls[1]?.[1]).toMatchObject({
      template: 'teams-tab',
      packageManager: 'npm',
      reactOptions: undefined,
    });
  });

  it('passes --display-name through for Teams Tab apps', async () => {
    await runCommand(['up', 'teams-app', '--teams-tab', '--display-name', 'TimeTiles', '--pm', 'npm']);

    expect(runUpPrompts).not.toHaveBeenCalled();
    expect(runInstallers).toHaveBeenCalledOnce();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      projectName: 'teams-app',
      template: 'teams-tab',
      displayName: 'TimeTiles',
      packageManager: 'npm',
    });
  });

  it('rejects --display-name without --teams-tab', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'react-app', '--react', '--display-name', 'TimeTiles']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--display-name can only be used with --teams-tab'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('rejects blank --display-name values', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'teams-app', '--teams-tab', '--display-name', '   ']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--display-name must not be empty'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('rejects React options without an explicit template flag', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'react-app', '--router', 'react-router']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('require an explicit template flag'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('rejects React options with unsupported templates', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'electron-app', '--electron', '--state', 'jotai']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('only supported with --react'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('rejects invalid router values', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'react-app', '--react', '--router', 'next']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid --router "next"'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('rejects invalid state values', async () => {
    mockProcessExit();

    await expect(runCommand(['up', 'react-app', '--react', '--state', 'mobx']))
      .rejects.toThrow('process.exit 1');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid --state "mobx"'));
    expect(runInstallers).not.toHaveBeenCalled();
  });

  it('uses prompts when no template flag is provided', async () => {
    vi.mocked(runUpPrompts).mockResolvedValue({
      template: 'react',
      packageManager: 'bun',
      reactOptions: {
        router: 'tanstack',
        stateManagement: 'zustand',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });

    await runCommand(['up', 'prompted-app']);

    expect(runUpPrompts).toHaveBeenCalledOnce();
    expect(vi.mocked(runInstallers).mock.calls[0]?.[1]).toMatchObject({
      template: 'react',
      packageManager: 'bun',
      reactOptions: {
        router: 'tanstack',
        stateManagement: 'zustand',
        httpClient: 'axios',
        dataFetching: 'tanstack-query',
        styling: 'tailwind',
      },
    });
  });
});
