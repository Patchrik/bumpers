import type {
  DataFetchingOption,
  HttpClientOption,
  ReactOptions,
  RouterOption,
  StateOption,
  StylingOption,
} from './index.js';
import { readTemplate } from '../utils/templates.js';

type Rule = {
  rule: string;
  why: string;
};

function buildStackSummary(ro: ReactOptions): string {
  const routerLabels: Record<RouterOption, string> = {
    tanstack: 'TanStack Router in `src/routes/`.',
    'react-router': 'React Router with declarative route setup.',
    wouter: 'Wouter with lightweight route components.',
    none: 'No routing library scaffolded.',
  };
  const stateLabels: Record<StateOption, string> = {
    zustand: 'Zustand state in `src/store/`.',
    jotai: 'Jotai atoms in `src/store/atoms.ts`.',
    'redux-toolkit': 'Redux Toolkit state in `src/store/`.',
    none: 'No shared state library scaffolded.',
  };
  const dataLabels: Record<DataFetchingOption, string> = {
    'tanstack-query': 'TanStack Query for server state.',
    swr: 'SWR for remote data reads.',
    'rtk-query': 'RTK Query for data fetching in the Redux store.',
    none: 'No data-fetching layer scaffolded.',
  };
  const httpLabels: Record<HttpClientOption, string> = {
    axios: 'Axios in `src/lib/api.ts`.',
    ky: 'ky in `src/lib/api.ts`.',
    fetch: 'Native Fetch API.',
  };
  const stylingLabels: Record<StylingOption, string> = {
    tailwind: 'Tailwind CSS v4 in `src/index.css`.',
    'css-modules': 'CSS Modules for component-level styles.',
    none: 'Plain CSS.',
  };

  return [
    `- Router: ${routerLabels[ro.router]}`,
    `- State: ${stateLabels[ro.stateManagement]}`,
    `- Data fetching: ${dataLabels[ro.dataFetching]}`,
    `- HTTP: ${httpLabels[ro.httpClient]}`,
    `- Styling: ${stylingLabels[ro.styling]}`,
  ].join('\n');
}

function getHardRules(): Rule[] {
  return [
    {
      rule: 'Read the project instructions before making changes.',
      why: 'Project rules override generic model habits.',
    },
    {
      rule: 'Use test-first thinking for risky behavior and regressions.',
      why: 'Tests should clarify architecture and protect meaningful behavior, not satisfy an artifact quota.',
    },
    {
      rule: 'Prefer the smallest correct change.',
      why: 'Extra code increases maintenance cost, review surface, and bug risk.',
    },
    {
      rule: 'Keep units small and single-purpose.',
      why: 'Smaller files are easier to read, test, and change safely.',
    },
    {
      rule: 'Keep state at the narrowest level that owns the behavior. Lift state only when multiple consumers need shared coordination.',
      why: 'Local state reduces coupling; shared state should exist only for shared behavior.',
    },
    {
      rule: 'Prefer pure functions for business logic and test them directly.',
      why: 'Pure logic is easier to verify than UI-bound logic.',
    },
    {
      rule: 'Isolate side effects and inject dependencies when that materially improves testability.',
      why: 'Hidden dependencies make tests brittle and push logic into integration-only paths.',
    },
    {
      rule: 'Do not introduce abstractions until duplication or complexity clearly justifies them.',
      why: 'Premature abstraction usually creates more code and more coupling.',
    },
    {
      rule: 'Reuse existing components, helpers, and patterns before creating new ones.',
      why: 'Duplication fragments the codebase and weakens maintainability.',
    },
    {
      rule: 'Do not weaken tests, coverage, lint rules, or type checks to make a change pass.',
      why: 'Guardrails are part of the product, not temporary obstacles.',
    },
  ];
}

function formatHardRules(): string {
  return getHardRules()
    .map((item, index) => `${index + 1}. ${item.rule}\n   Why: ${item.why}`)
    .join('\n\n');
}

function getArchitectureLines(ro: ReactOptions): string[] {
  const lines = [
    'Routes coordinate page composition, data loading triggers, and shared layout. Keep dense business logic out of route bodies.',
    'Reusable user-facing UI belongs in `src/Components/`.',
    'Business and domain logic belongs in feature modules or `src/lib/`, not inline in route JSX.',
    'Side-effectful code should stay at the boundary around API calls, browser APIs, timers, and navigation.',
    'Parent components own shared hydration, cross-child coordination, shared filters, and route-level composition.',
    'Child components own local UI behavior such as sort state, inline control state, row expansion, button interactions, and transient input state.',
    'Do not hoist local interaction state unless another consumer actually needs it.',
    'When a file starts combining multiple responsibilities, split it.',
    'Simplicity means the smallest correct behavior with the fewest moving parts. Avoid speculative extensibility and ornamental indirection.',
    'Prefer duplication over the wrong abstraction. Extract shared code only when the duplication is meaningful.',
  ];

  if (ro.stateManagement !== 'none') {
    lines.push('Store logic should stay focused on state transitions and orchestration, not transport details or router concerns.');
  }

  if (ro.stateManagement === 'jotai') {
    lines.push('Keep Jotai atoms small, composable, and colocated around the shared behaviors they coordinate.');
  } else if (ro.stateManagement === 'redux-toolkit') {
    lines.push('Redux Toolkit state should be organized around the store, typed hooks, slices, and RTK Query services.');
  }

  if (ro.router === 'tanstack') {
    lines.push('File-based routes live in `src/routes/`. Treat `src/routeTree.gen.ts` as generated output and never edit it manually.');
  } else if (ro.router === 'react-router') {
    lines.push('React Router route declarations live in `src/App.tsx`; move substantial page UI into `src/Components/<Name>/<Name>.tsx`.');
    lines.push('Navigation uses `<Link to="...">`, nested route composition uses `<Outlet />`, and programmatic navigation uses `useNavigate()`.');
  } else if (ro.router === 'wouter') {
    lines.push('Wouter route declarations live in `src/App.tsx`; move substantial page UI into `src/Components/<Name>/<Name>.tsx`.');
    lines.push('Navigation uses `<Link href="...">`, and programmatic navigation uses `const [, setLocation] = useLocation()`.');
  }

  return lines;
}

function formatBullets(lines: string[], limit?: number): string {
  const selected = typeof limit === 'number' ? lines.slice(0, limit) : lines;
  return selected.map((line) => `- ${line}`).join('\n');
}

function getTestingLines(): string[] {
  return [
    'Testing is a spectrum. Use test-first thinking to define architecture, observable behavior, and regression risk before implementation.',
    'Prioritize business rules, validation, state transitions, error paths, dependency-heavy components, and code imported throughout the app.',
    'Add regression tests for bugs and tests at API, browser, storage, and state-management boundaries.',
    'Do not add tests solely for route/root composition, provider wiring, static configuration, declarations, re-exports, generated code, or trivial presentation.',
    'Co-locate valuable unit tests with the source they validate.',
    'Use Storybook for reusable visual components with meaningful states.',
    'Use E2E tests for critical user journeys and cross-boundary regressions, not every small component interaction.',
    'Coverage has an 80% project-wide floor; never inflate it with assertions that cannot catch a meaningful regression.',
  ];
}

function buildVerificationContract(): string {
  return [
    'Before claiming work is complete:',
    '- run the relevant tests for the change',
    '- run the required lint, type, and build checks for the template',
    '- report what you verified and what you did not verify',
    '- say explicitly when a verification step could not be run',
  ].join('\n');
}

function getFileSpecificConventionLines(ro: ReactOptions): string[] {
  const lines = [
    'Keep tests co-located with the source they validate.',
    'Reusable UI belongs in `src/Components/`.',
    'Use `src/test-utils.tsx` for provider-aware rendering in tests.',
    'TypeScript strictness, project-level coverage thresholds, lint rules, and source-structure checks stay on.',
  ];

  if (ro.router === 'tanstack') {
    lines.push('Route files in `src/routes/` should stay thin and focused on composition.');
    lines.push('`src/routeTree.gen.ts` is generated. Do not edit it, test it directly, or lower guardrails to accommodate it.');
  } else if (ro.router === 'react-router') {
    lines.push('Keep route declarations in `src/App.tsx`; move substantial page UI into `src/Components/<Name>/<Name>.tsx`.');
    lines.push('Use `<Link to="...">`, `useNavigate()`, and `useParams()` consistently with React Router patterns.');
  } else if (ro.router === 'wouter') {
    lines.push('Keep Wouter route declarations in `src/App.tsx`; move substantial page UI into `src/Components/<Name>/<Name>.tsx`.');
    lines.push('Use `<Link href="...">` for navigation and `useLocation()` for imperative route changes.');
  }

  if (ro.stateManagement !== 'none') {
    lines.push('Shared state belongs in `src/store/` only when multiple consumers need coordinated behavior.');
  }

  if (ro.stateManagement === 'jotai') {
    lines.push('Jotai atoms live in `src/store/atoms.ts`; keep atom tests isolated and reset atom-backed state between tests.');
  } else if (ro.stateManagement === 'redux-toolkit') {
    lines.push('Redux Toolkit uses `src/store/store.ts`, typed hooks in `src/store/hooks.ts`, slices in `src/store/slices/`, and RTK Query services in `src/store/services/`.');
    lines.push('Redux-aware tests should create a fresh store per render and pass `preloadedState` through `src/test-utils.tsx` when state setup matters.');
  }

  if (ro.dataFetching === 'rtk-query') {
    lines.push('RTK Query owns server-state fetching for Redux stacks; do not add Axios clients or TanStack Query providers alongside it unless the architecture explicitly changes.');
  } else if (ro.httpClient !== 'fetch' || ro.dataFetching !== 'none') {
    lines.push('Keep API clients and side-effectful data access in `src/lib/`. Prefer pure helpers for response shaping and validation.');
  }

  return lines;
}

function buildCommands(ro: ReactOptions): string {
  const commands = [
    '- `npm run dev`',
    ro.router === 'tanstack' ? '- `npm run generate-routes`' : '',
    '- `npm run build`',
    '- `npm run test`',
    '- `npm run test:coverage`',
    '- `npm run test:e2e`',
    '- `npm run test:colocate`',
    '- `npm run lint`',
    '- `npm run format:check`',
    '- `npm run storybook`',
  ];

  return commands.filter(Boolean).join('\n');
}

function buildTemplateVars(ro: ReactOptions) {
  return {
    stackSummary: buildStackSummary(ro),
    hardRules: formatHardRules(),
    architectureBoundaries: formatBullets(getArchitectureLines(ro)),
    testingContract: formatBullets(getTestingLines()),
    verificationContract: buildVerificationContract(),
    fileSpecificConventions: formatBullets(getFileSpecificConventionLines(ro)),
    commands: buildCommands(ro),
  };
}

export async function buildReactAgentsMd(name: string, ro: ReactOptions): Promise<string> {
  return readTemplate('ai-config/react/AGENTS.md', {
    projectName: name,
    ...buildTemplateVars(ro),
  });
}

export async function buildReactClaudeMd(name: string, _ro: ReactOptions): Promise<string> {
  return readTemplate('ai-config/react/CLAUDE.md', { projectName: name });
}

export async function buildReactCursorrules(name: string, _ro: ReactOptions): Promise<string> {
  return readTemplate('ai-config/react/cursorrules.txt', { projectName: name });
}

export async function buildReactCopilotMd(name: string, _ro: ReactOptions): Promise<string> {
  return readTemplate('ai-config/react/copilot-instructions.md', { projectName: name });
}
