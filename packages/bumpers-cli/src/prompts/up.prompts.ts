import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { ReactOptions, TemplateType } from '../installers/index.js';

const BANNER = `
 ___ _   _ __  __ ___ ___ ___  ___
| _ ) | | |  \\/  | _ \\ __| _ \\/ __|
| _ \\ |_| | |\\/| |  _/ _||   /\\__ \\
|___/\\___/|_|  |_|_| |___|_|_\\|___/
`;

interface PromptResult {
  template: TemplateType;
  packageManager: string;
  reactOptions?: ReactOptions;
}

interface RunUpPromptsOptions {
  preselectedTemplate?: TemplateType;
}

async function promptForReactOptions(): Promise<ReactOptions | null> {
  const router = await p.select({
    message: 'Router:',
    options: [
      { value: 'tanstack' as const, label: 'TanStack Router', hint: 'recommended' },
      { value: 'react-router' as const, label: 'React Router' },
      { value: 'wouter' as const, label: 'Wouter' },
      { value: 'none' as const, label: 'None' },
    ],
  });

  if (p.isCancel(router)) {
    p.cancel('Cancelled.');
    return null;
  }

  const stateManagement = await p.select({
    message: 'State management:',
    options: [
      { value: 'zustand' as const, label: 'Zustand', hint: 'recommended' },
      { value: 'jotai' as const, label: 'Jotai' },
      { value: 'redux-toolkit' as const, label: 'Redux Toolkit' },
      { value: 'none' as const, label: 'None' },
    ],
  });

  if (p.isCancel(stateManagement)) {
    p.cancel('Cancelled.');
    return null;
  }

  let httpClient: 'axios' | 'fetch';
  let dataFetching: 'tanstack-query' | 'rtk-query';

  if (stateManagement === 'redux-toolkit') {
    p.note('Redux Toolkit uses RTK Query with fetchBaseQuery. HTTP client and data fetching were set automatically.');
    httpClient = 'fetch';
    dataFetching = 'rtk-query';
  } else {
    const selectedHttpClient = await p.select({
      message: 'HTTP client:',
      options: [
        { value: 'axios' as const, label: 'Axios', hint: 'recommended' },
      ],
    });

    if (p.isCancel(selectedHttpClient)) {
      p.cancel('Cancelled.');
      return null;
    }

    httpClient = selectedHttpClient;

    const selectedDataFetching = await p.select({
      message: 'Data fetching:',
      options: [
        { value: 'tanstack-query' as const, label: 'TanStack Query', hint: 'recommended' },
      ],
    });

    if (p.isCancel(selectedDataFetching)) {
      p.cancel('Cancelled.');
      return null;
    }

    dataFetching = selectedDataFetching;
  }

  const styling = await p.select({
    message: 'Styling:',
    options: [
      { value: 'tailwind' as const, label: 'Tailwind CSS v4', hint: 'recommended' },
    ],
  });

  if (p.isCancel(styling)) {
    p.cancel('Cancelled.');
    return null;
  }

  return {
    router,
    stateManagement,
    httpClient,
    dataFetching,
    styling,
  };
}

export async function runUpPrompts(
  projectName: string,
  version?: string,
  options?: RunUpPromptsOptions,
): Promise<PromptResult | null> {
  console.log(pc.cyan(BANNER));
  p.intro(`bumpers v${version ?? '0.1.0'}`);

  const confirmed = await p.confirm({
    message: `Scaffold project "${projectName}"?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel('Cancelled.');
    return null;
  }

  let template: TemplateType;
  if (options?.preselectedTemplate) {
    template = options.preselectedTemplate;
  } else {
    const selectedTemplate = await p.select({
      message: 'Select a template:',
      options: [
        { value: 'electron' as const, label: 'Electron Desktop App', hint: 'React + TypeScript' },
        { value: 'teams-tab' as const, label: 'Microsoft Teams Tab', hint: 'React + Vite + TypeScript' },
        { value: 'react' as const, label: 'React SPA', hint: 'TanStack Router + Zustand + Tailwind' },
      ],
    });

    if (p.isCancel(selectedTemplate)) {
      p.cancel('Cancelled.');
      return null;
    }

    template = selectedTemplate;
  }

  const packageManager = await p.select({
    message: 'Package manager:',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'bun' },
    ],
  });

  if (p.isCancel(packageManager)) {
    p.cancel('Cancelled.');
    return null;
  }

  const reactOptions = template === 'react' ? await promptForReactOptions() : undefined;
  if (template === 'react' && !reactOptions) {
    return null;
  }

  p.outro('Scaffolding...');

  return {
    template,
    packageManager: packageManager as string,
    reactOptions,
  };
}
