import { createSpinner } from 'nanospinner';

export type TemplateType = 'electron' | 'teams-tab' | 'react';

export type RouterOption = 'tanstack' | 'react-router' | 'wouter' | 'none';
export type StateOption = 'zustand' | 'jotai' | 'redux-toolkit' | 'none';
export type HttpClientOption = 'axios' | 'ky' | 'fetch';
export type DataFetchingOption = 'tanstack-query' | 'swr' | 'rtk-query' | 'none';
export type StylingOption = 'tailwind' | 'css-modules' | 'none';

export interface ReactOptions {
  router: RouterOption;
  stateManagement: StateOption;
  httpClient: HttpClientOption;
  dataFetching: DataFetchingOption;
  styling: StylingOption;
}

export interface InstallerOptions {
  projectName: string;
  projectDir: string;
  template: TemplateType;
  packageManager: string;
  cliVersion: string;
  displayName?: string;
  reactOptions?: ReactOptions;
}

/**
 * Installer phases — executed in this order. runInstallers validates
 * that no installer runs in a phase earlier than the previous installer's phase.
 *
 * WARNING TO AI AGENTS: Do not reorder these enum values. The numeric
 * ordering IS the execution contract.
 */
export enum InstallerPhase {
  /** Foundation files (package.json, tsconfig) — must run first */
  FOUNDATION = 0,
  /** App scaffold (Electron, React, source files) */
  SCAFFOLD = 1,
  /** Testing tools (Vitest, Playwright, Storybook) */
  TESTING = 2,
  /** Code quality (ESLint, Biome) */
  QUALITY = 3,
  /** Enforcement (co-location, hooks, CI, AI config) */
  ENFORCEMENT = 4,
  /** Runtime validation (npm install, test runs) — must run after all file-writing */
  VALIDATE = 5,
  /** Git init + commit — must run last */
  GIT = 6,
}

export type Installer = {
  name: string;
  phase: InstallerPhase;
  run: (opts: InstallerOptions) => Promise<void>;
};

export async function runInstallers(
  installers: Installer[],
  opts: InstallerOptions,
): Promise<void> {
  // Validate phase ordering — catch pipeline misordering at runtime
  for (let i = 1; i < installers.length; i++) {
    const prev = installers[i - 1];
    const curr = installers[i];
    if (curr.phase < prev.phase) {
      throw new Error(
        `Installer ordering violation: "${curr.name}" (phase ${InstallerPhase[curr.phase]}) ` +
        `cannot run after "${prev.name}" (phase ${InstallerPhase[prev.phase]}). ` +
        `Check the installer array in up.ts.`
      );
    }
  }

  for (const installer of installers) {
    const spinner = createSpinner(installer.name).start();
    try {
      await installer.run(opts);
      spinner.success({ text: installer.name });
    } catch (error) {
      spinner.error({ text: `${installer.name} failed` });
      throw error;
    }
  }
}
