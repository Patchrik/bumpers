import { describe, expect, it } from 'vitest';
import type { ReactOptions } from '../src/installers/index.js';
import {
  buildReactAgentsMd,
  buildReactClaudeMd,
  buildReactCopilotMd,
  buildReactCursorrules,
} from '../src/installers/react-ai-config.js';

const reactOptions: ReactOptions = {
  router: 'tanstack',
  stateManagement: 'zustand',
  httpClient: 'axios',
  dataFetching: 'tanstack-query',
  styling: 'tailwind',
};

const minimalistReactOptions: ReactOptions = {
  router: 'none',
  stateManagement: 'none',
  httpClient: 'fetch',
  dataFetching: 'none',
  styling: 'css-modules',
};

const reactRouterOptions: ReactOptions = {
  router: 'react-router',
  stateManagement: 'zustand',
  httpClient: 'axios',
  dataFetching: 'tanstack-query',
  styling: 'tailwind',
};

const wouterOptions: ReactOptions = {
  router: 'wouter',
  stateManagement: 'jotai',
  httpClient: 'axios',
  dataFetching: 'tanstack-query',
  styling: 'tailwind',
};

const reduxToolkitOptions: ReactOptions = {
  router: 'react-router',
  stateManagement: 'redux-toolkit',
  httpClient: 'fetch',
  dataFetching: 'rtk-query',
  styling: 'tailwind',
};

describe('buildReactAgentsMd', () => {
  it('includes the React architecture and stack details', async () => {
    const content = await buildReactAgentsMd('test-react', reactOptions);

    expect(content).toContain('# test-react — Agent Instructions');
    expect(content).toContain('## Hard Rules');
    expect(content).toContain('Use test-first thinking for risky behavior and regressions.');
    expect(content).toContain('## Testing Contract');
    expect(content).toContain('## Verification Contract');
    expect(content).toContain('TanStack Router');
    expect(content).toContain('Zustand');
    expect(content).toContain('Axios');
    expect(content).toContain('TanStack Query');
    expect(content).toContain('Tailwind CSS v4');
    expect(content).toContain('src/routeTree.gen.ts');
    expect(content).not.toContain('Five-Artifact Rule');
    expect(content).not.toContain('Electron desktop application');
    expect(content).not.toContain('Teams Tab');
    expect(content).toMatchSnapshot();
  });
});

describe('buildReactClaudeMd', () => {
  it('is self-contained for Claude Code with stack-aware guidance', async () => {
    const content = await buildReactClaudeMd('test-react', reactOptions);

    expect(content).toContain('Use test-first thinking for risky behavior and regressions.');
    expect(content).toContain('Before claiming work is complete:');
    expect(content).toContain('TanStack Router');
    expect(content).toContain('Zustand');
    expect(content).toContain('TanStack Query');
    expect(content).toContain('Axios');
    expect(content).toContain('src/routeTree.gen.ts');
    expect(content).not.toContain('Follow `AGENTS.md` for the full architecture, testing, and verification contract.');
    expect(content).not.toContain('Teams Tab');
    expect(content).not.toContain('@microsoft/teams-js');
    expect(content).toMatchSnapshot();
  });
});

describe('buildReactCursorrules', () => {
  it('is self-contained for Cursor with stack-aware constraints and commands', async () => {
    const content = await buildReactCursorrules('test-react', reactOptions);

    expect(content).toContain('Use test-first thinking');
    expect(content).toContain('Keep state at the narrowest level');
    expect(content).toContain('Before claiming work is complete:');
    expect(content).toContain('TanStack Router');
    expect(content).toContain('src/routes/');
    expect(content).toContain('src/routeTree.gen.ts');
    expect(content).toContain('npm run generate-routes');
    expect(content).not.toContain('five artifacts');
    expect(content).not.toContain('electronAPI');
    expect(content).toMatchSnapshot();
  });
});

describe('buildReactCopilotMd', () => {
  it('is self-contained for Copilot with stack-aware testing and verification guidance', async () => {
    const content = await buildReactCopilotMd('test-react', reactOptions);

    expect(content).toContain('Use test-first thinking');
    expect(content).toContain('Do not weaken tests, coverage, lint rules, or type checks');
    expect(content).toContain('Before claiming work is complete:');
    expect(content).toContain('TanStack Query');
    expect(content).toContain('Zustand');
    expect(content).toContain('src/routeTree.gen.ts');
    expect(content).not.toContain('Teams iframe');
    expect(content).toMatchSnapshot();
  });
});

describe('React AI config option variants', () => {
  it('renders router-specific guidance for React Router stacks', async () => {
    const claude = await buildReactClaudeMd('react-router-app', reactRouterOptions);
    const cursor = await buildReactCursorrules('react-router-app', reactRouterOptions);

    expect(claude).toContain('React Router');
    expect(claude).toContain('src/App.tsx');
    expect(claude).toContain('src/Components/<Name>/<Name>.tsx');
    expect(claude).toContain('Link to="/about"');
    expect(claude).not.toContain('src/routeTree.gen.ts');

    expect(cursor).toContain('React Router');
    expect(cursor).toContain('src/App.tsx');
    expect(cursor).toContain('src/Components/<Name>/<Name>.tsx');
    expect(cursor).toContain('useNavigate()');
    expect(cursor).not.toContain('npm run generate-routes');
  });

  it('renders router-specific guidance for Wouter stacks', async () => {
    const claude = await buildReactClaudeMd('wouter-app', wouterOptions);
    const copilot = await buildReactCopilotMd('wouter-app', wouterOptions);

    expect(claude).toContain('Wouter');
    expect(claude).toContain('src/App.tsx');
    expect(claude).toContain('src/Components/<Name>/<Name>.tsx');
    expect(claude).toContain('Link href="/about"');
    expect(claude).toContain('Jotai atoms in `src/store/atoms.ts`.');
    expect(claude).toContain('Jotai atoms belong in `src/store/atoms.ts`, and atom tests should stay isolated.');
    expect(claude).not.toContain('src/routeTree.gen.ts');

    expect(copilot).toContain('Wouter');
    expect(copilot).toContain('useLocation()');
    expect(copilot).toContain('href');
    expect(copilot).toContain('Jotai');
    expect(copilot).not.toContain('npm run generate-routes');
  });

  it('renders Redux Toolkit and RTK Query specific guidance without Axios or TanStack Query guidance', async () => {
    const agents = await buildReactAgentsMd('redux-app', reduxToolkitOptions);
    const claude = await buildReactClaudeMd('redux-app', reduxToolkitOptions);
    const cursor = await buildReactCursorrules('redux-app', reduxToolkitOptions);
    const copilot = await buildReactCopilotMd('redux-app', reduxToolkitOptions);

    for (const content of [agents, claude, cursor, copilot]) {
      expect(content).toContain('Redux Toolkit state in `src/store/`.');
      expect(content).toContain('RTK Query for data fetching in the Redux store.');
      expect(content).toContain('Native Fetch API.');
      expect(content).toContain('React Router');
      expect(content).not.toContain('Axios in `src/lib/api.ts`.');
      expect(content).not.toContain('TanStack Query for server state.');
    }

    expect(agents).toContain('Store logic should stay focused on state transitions and orchestration');
    expect(claude).toContain('typed hooks');
    expect(claude).toContain('slices');
    expect(claude).toContain('RTK Query');
    expect(cursor).toContain('store');
    expect(copilot).toContain('RTK Query');
  });

  it('renders standalone secondary files for simpler React stacks too', async () => {
    const claude = await buildReactClaudeMd('minimal-react', minimalistReactOptions);
    const cursor = await buildReactCursorrules('minimal-react', minimalistReactOptions);
    const copilot = await buildReactCopilotMd('minimal-react', minimalistReactOptions);

    expect(claude).toContain('No routing library scaffolded.');
    expect(claude).toContain('No shared state library scaffolded.');
    expect(claude).toContain('Native Fetch API.');
    expect(claude).toContain('CSS Modules');
    expect(claude).not.toContain('src/routeTree.gen.ts');

    expect(cursor).toContain('No routing library scaffolded.');
    expect(cursor).toContain('No shared state library scaffolded.');
    expect(cursor).toContain('Native Fetch API.');
    expect(cursor).not.toContain('npm run generate-routes');

    expect(copilot).toContain('No data-fetching layer scaffolded.');
    expect(copilot).toContain('CSS Modules');
    expect(copilot).not.toContain('src/routeTree.gen.ts');
  });
});
