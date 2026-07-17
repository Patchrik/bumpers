import { describe, expect, it } from 'vitest';
import type { ReactOptions } from '../src/installers/index.js';
import {
  buildReactAgentsMd,
  buildReactClaudeMd,
  buildReactCopilotMd,
  buildReactCursorrules,
} from '../src/installers/react-ai-config.js';

const options: ReactOptions = {
  router: 'tanstack',
  stateManagement: 'zustand',
  httpClient: 'axios',
  dataFetching: 'tanstack-query',
  styling: 'tailwind',
};

describe('React AI config', () => {
  it('builds a canonical, stack-aware AGENTS.md', async () => {
    const content = await buildReactAgentsMd('test-react', options);

    expect(content).toContain('## Agent Entry Points');
    expect(content).toContain('Codex reads this `AGENTS.md` directly.');
    expect(content).toContain('## Change Loop');
    expect(content).toContain('Use test-first thinking for risky behavior and regressions.');
    expect(content).toContain('TanStack Router');
    expect(content).toContain('Zustand');
    expect(content).toContain('Axios');
    expect(content).toContain('TanStack Query');
    expect(content).toContain('src/routeTree.gen.ts');
  });

  it('builds thin tool adapters', async () => {
    const [claude, cursor, copilot] = await Promise.all([
      buildReactClaudeMd('test-react', options),
      buildReactCursorrules('test-react', options),
      buildReactCopilotMd('test-react', options),
    ]);

    expect(claude).toContain('@AGENTS.md');
    expect(cursor).toContain('`AGENTS.md` is the canonical project contract.');
    expect(copilot).toContain('`AGENTS.md` is the canonical project contract.');

    for (const adapter of [claude, cursor, copilot]) {
      expect(adapter).not.toContain('TanStack Router');
      expect(adapter).not.toContain('## Testing Contract');
      expect(adapter.length).toBeLessThan(600);
    }
  });

  it.each([
    ['react-router', 'React Router', 'src/App.tsx'],
    ['wouter', 'Wouter', 'useLocation()'],
    ['none', 'No routing library scaffolded.', 'No shared state library scaffolded.'],
  ] as const)('keeps %s guidance in AGENTS.md only', async (router, expected, detail) => {
    const agents = await buildReactAgentsMd('variant', {
      ...options,
      router,
      stateManagement: router === 'none' ? 'none' : options.stateManagement,
    });

    expect(agents).toContain(expected);
    expect(agents).toContain(detail);
    expect(agents).not.toContain(router === 'none' ? 'src/routeTree.gen.ts' : 'No routing library scaffolded.');
  });

  it('keeps Redux Toolkit boundaries in canonical instructions', async () => {
    const agents = await buildReactAgentsMd('redux-app', {
      ...options,
      router: 'react-router',
      stateManagement: 'redux-toolkit',
      httpClient: 'fetch',
      dataFetching: 'rtk-query',
    });

    expect(agents).toContain('Redux Toolkit state in `src/store/`.');
    expect(agents).toContain('RTK Query for data fetching in the Redux store.');
    expect(agents).toContain('typed hooks');
    expect(agents).not.toContain('Axios in `src/lib/api.ts`.');
  });
});
