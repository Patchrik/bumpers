import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as p from '@clack/prompts';
import { runUpPrompts } from '../src/prompts/up.prompts.js';

vi.mock('@clack/prompts', () => ({
  confirm: vi.fn(),
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
  intro: vi.fn(),
  note: vi.fn(),
  outro: vi.fn(),
}));

describe('runUpPrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(p.confirm).mockResolvedValue(true as never);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(p.select).mockImplementation(async (args) => {
      const valueByMessage: Record<string, string> = {
        'Package manager:': 'npm',
        'Router:': 'tanstack',
        'State management:': 'zustand',
        'HTTP client:': 'axios',
        'Data fetching:': 'tanstack-query',
        'Styling:': 'tailwind',
      };

      return valueByMessage[args.message] as never;
    });
  });

  it('asks for every React stack option when the interactive prompt flow preselects React', async () => {
    const result = await runUpPrompts('demo', '0.1.0', {
      preselectedTemplate: 'react',
    });

    expect(result).toEqual({
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

    const selectCalls = vi.mocked(p.select).mock.calls.map(([args]) => args);
    expect(selectCalls.map((args) => args.message)).toEqual([
      'Package manager:',
      'Router:',
      'State management:',
      'HTTP client:',
      'Data fetching:',
      'Styling:',
    ]);

    for (const message of [
      'HTTP client:',
      'Data fetching:',
      'Styling:',
    ]) {
      const call = selectCalls.find((args) => args.message === message);
      expect(call?.options).toHaveLength(1);
    }

    const stateCall = selectCalls.find((args) => args.message === 'State management:');
    expect(stateCall?.options).toEqual([
      { value: 'zustand', label: 'Zustand', hint: 'recommended' },
      { value: 'jotai', label: 'Jotai' },
      { value: 'redux-toolkit', label: 'Redux Toolkit' },
      { value: 'none', label: 'None' },
    ]);

    const routerCall = selectCalls.find((args) => args.message === 'Router:');
    expect(routerCall?.options).toEqual([
      { value: 'tanstack', label: 'TanStack Router', hint: 'recommended' },
      { value: 'react-router', label: 'React Router' },
      { value: 'wouter', label: 'Wouter' },
      { value: 'none', label: 'None' },
    ]);
  });

  it('skips HTTP and data-fetching prompts for the Redux Toolkit stack', async () => {
    vi.mocked(p.note).mockImplementation(vi.fn() as never);
    vi.mocked(p.select).mockImplementation(async (args) => {
      const valueByMessage: Record<string, string> = {
        'Package manager:': 'npm',
        'Router:': 'react-router',
        'State management:': 'redux-toolkit',
        'Styling:': 'tailwind',
      };

      return valueByMessage[args.message] as never;
    });

    const result = await runUpPrompts('demo', '0.1.0', {
      preselectedTemplate: 'react',
    });

    expect(result).toEqual({
      template: 'react',
      packageManager: 'npm',
      reactOptions: {
        router: 'react-router',
        stateManagement: 'redux-toolkit',
        httpClient: 'fetch',
        dataFetching: 'rtk-query',
        styling: 'tailwind',
      },
    });

    const selectMessages = vi.mocked(p.select).mock.calls.map(([args]) => args.message);
    expect(selectMessages).toEqual([
      'Package manager:',
      'Router:',
      'State management:',
      'Styling:',
    ]);
    expect(selectMessages).not.toContain('HTTP client:');
    expect(selectMessages).not.toContain('Data fetching:');
    expect(p.note).toHaveBeenCalled();
  });
});
