/**
 * Central dependency version manifest.
 *
 * Every dependency version used by any installer lives here.
 * Update versions in ONE place, not 8 installer files.
 */
export const VERSIONS = {
  // Electron
  electron: '^34.0.0',
  electronVite: '^3.0.0',
  electronBuilder: '^25.1.8',
  electronToolkitUtils: '^3.0.0',
  vitejsPluginReact: '^4.3.4',

  // React
  react: '^19.0.0',
  reactDom: '^19.0.0',
  typesReact: '^19.0.0',
  typesReactDom: '^19.0.0',

  // TypeScript
  typescript: '^5.7.3',
  typesNode: '^22.12.0',

  // Testing
  vitest: '^3.1.1',
  vitestCoverageV8: '^3.1.1',
  testingLibraryReact: '^16.2.0',
  testingLibraryJestDom: '^6.6.3',
  jsdom: '^26.0.0',
  playwright: '^1.50.1',

  // Storybook
  storybook: '^8.6.4',
  storybookReactVite: '^8.6.4',
  storybookAddonEssentials: '^8.6.4',
  storybookTest: '^8.6.4',

  // Quality
  eslint: '^9.20.0',
  eslintJs: '^9.20.0',
  typescriptEslint: '^8.24.0',
  eslintPluginReactHooks: '^5.1.0',
  eslintPluginReactRefresh: '^0.4.18',
  globals: '^15.14.0',
  biome: '^1.9.0',

  // Enforcement
  lefthook: '^1.10.10',
  commitlintCli: '^19.6.1',
  commitlintConfigConventional: '^19.6.0',

  // Teams Tab
  teamsJs: '^2.52.0',          // @microsoft/teams-js (tab client SDK)
  vite: '^6.0.0',              // standalone Vite (not electron-vite)
  vitejsPluginMkcert: '^1.17.6',  // creates locally-trusted certs via mkcert CA

  // React template
  tanstackRouter: '^1.168.0',
  tanstackRouterPlugin: '^1.167.0',
  tanstackRouterDevtools: '^1.166.0',
  tanstackRouterCli: '^1.166.0',
  reactRouter: '^7.14.0',
  wouter: '^3.9.0',
  zustand: '^5.0.0',
  jotai: '^2.12.5',
  reduxToolkit: '^2.8.2',
  reactRedux: '^9.2.0',
  axios: '1.14.0',
  tanstackQuery: '^5.99.0',
  tanstackQueryDevtools: '^5.99.0',
  tailwindcss: '^4.2.0',
  tailwindcssVite: '^4.2.0',
  testingLibraryUserEvent: '^14.6.1',
} as const;
