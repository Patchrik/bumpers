type HelpRow = {
  label: string;
  packages?: readonly string[];
  note?: string;
};

type HelpSection = {
  heading: string;
  rows: readonly HelpRow[];
};

const HELP_INDENT = '  ';

export const TOP_LEVEL_HELP_NOTE =
  'Run `bumpers up --help` to see template examples and the default tooling included in each scaffold.';

export const UP_HELP_EXAMPLES = [
  'bumpers up my-electron-app --electron',
  'bumpers up my-teams-app --teams-tab --display-name "My Teams App"',
  'bumpers up my-react-app --react --pm pnpm',
  'bumpers up my-react-app --react --router react-router --state jotai',
] as const;

export const SHARED_SCAFFOLD_DEFAULTS: HelpSection = {
  heading: 'Included in every scaffold',
  rows: [
    { label: 'Vitest', packages: ['vitest', '@vitest/coverage-v8'] },
    { label: 'Playwright', packages: ['@playwright/test'] },
    {
      label: 'Storybook',
      packages: [
        'storybook',
        '@storybook/react-vite',
        '@storybook/addon-essentials',
        '@storybook/test',
      ],
    },
    {
      label: 'ESLint',
      packages: [
        'eslint',
        '@eslint/js',
        'typescript-eslint',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        'globals',
      ],
    },
    { label: 'Biome', packages: ['@biomejs/biome'] },
    {
      label: 'Git hooks',
      packages: ['lefthook', '@commitlint/cli', '@commitlint/config-conventional'],
    },
    {
      label: 'Testing helpers',
      packages: ['@testing-library/react', '@testing-library/jest-dom', 'jsdom'],
      note: 'React scaffolds also add @testing-library/user-event.',
    },
    {
      label: 'AI/editor guardrails',
      packages: ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.github/copilot-instructions.md'],
    },
    {
      label: 'CI and enforcement',
      note: 'GitHub Actions CI and the co-located test enforcement script.',
    },
  ],
};

export const TEMPLATE_DEFAULTS: readonly HelpSection[] = [
  {
    heading: 'Electron',
    rows: [
      { label: 'React', packages: ['react', 'react-dom'] },
      {
        label: 'Electron',
        packages: ['electron', 'electron-vite', 'electron-builder', '@electron-toolkit/utils'],
      },
      { label: 'TypeScript', packages: ['typescript', '@types/react', '@types/react-dom'] },
    ],
  },
  {
    heading: 'Teams Tab',
    rows: [
      { label: 'React', packages: ['react', 'react-dom'] },
      { label: 'Microsoft Teams SDK', packages: ['@microsoft/teams-js'] },
      { label: 'Vite', packages: ['vite', '@vitejs/plugin-react', 'vite-plugin-mkcert'] },
      { label: 'TypeScript', packages: ['typescript', '@types/react', '@types/react-dom'] },
    ],
  },
  {
    heading: 'React SPA',
    rows: [
      { label: 'React', packages: ['react', 'react-dom'] },
      {
        label: 'TanStack Router',
        packages: [
          '@tanstack/react-router',
          '@tanstack/router-plugin',
          '@tanstack/router-cli',
          '@tanstack/react-router-devtools',
        ],
      },
      {
        label: 'State/data layer',
        packages: ['zustand', 'axios', '@tanstack/react-query', '@tanstack/react-query-devtools'],
      },
      { label: 'Styling', packages: ['tailwindcss', '@tailwindcss/vite'] },
      {
        label: 'TypeScript',
        packages: ['typescript', '@types/react', '@types/react-dom', 'vite', '@vitejs/plugin-react'],
      },
    ],
  },
] as const;

function formatRow(row: HelpRow): string[] {
  const detail = row.packages?.length ? `${row.label} (${row.packages.join(', ')})` : row.label;
  const lines = [`${HELP_INDENT}- ${detail}`];

  if (row.note) {
    lines.push(`${HELP_INDENT}  ${row.note}`);
  }

  return lines;
}

function formatSection(section: HelpSection): string[] {
  const lines = [section.heading, ''];

  for (const row of section.rows) {
    lines.push(...formatRow(row));
  }

  return lines;
}

export function formatUpHelpText(): string {
  const templateSelection = [
    'Template selection',
    '',
    `${HELP_INDENT}- Flags \`--electron\`, \`--teams-tab\`, and \`--react\` are mutually exclusive.`,
    `${HELP_INDENT}- Omit template flags to use the interactive prompt flow.`,
    `${HELP_INDENT}- \`--display-name\` only applies to \`--teams-tab\`.`,
  ];

  const reactHeadlessOptions = [
    'React headless options',
    '',
    `${HELP_INDENT}- --router: tanstack, react-router, wouter, none. Default: tanstack.`,
    `${HELP_INDENT}- --state: zustand, jotai, redux-toolkit, none. Default: zustand.`,
    `${HELP_INDENT}- Redux Toolkit state automatically uses Fetch + RTK Query.`,
  ];

  const examples = [
    'Examples',
    '',
    ...UP_HELP_EXAMPLES.map((example) => `${HELP_INDENT}$ ${example}`),
  ];

  const templateDefaults = ['Template defaults', ''];
  TEMPLATE_DEFAULTS.forEach((section, index) => {
    templateDefaults.push(...formatSection(section));
    if (index < TEMPLATE_DEFAULTS.length - 1) {
      templateDefaults.push('');
    }
  });

  return [
    '',
    ...examples,
    '',
    ...templateSelection,
    '',
    ...reactHeadlessOptions,
    '',
    ...formatSection(SHARED_SCAFFOLD_DEFAULTS),
    '',
    ...templateDefaults,
    '',
  ].join('\n');
}
