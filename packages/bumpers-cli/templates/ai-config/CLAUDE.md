# {{projectName}} — Claude Instructions

> **Read `AGENTS.md` first** for full architecture and testing details.

## Testing Policy

Testing is a risk-based spectrum, not an artifact quota. Use test-first thinking to identify architecture, observable behavior, and regression risk before implementation.

- Prioritize business rules, state transitions, error paths, Electron boundaries, dependency-heavy components, and widely reused code.
- Add regression tests for bugs and E2E tests for critical user journeys.
- Do not test every file. Skip trivial rendering, framework wiring, static config, declarations, re-exports, and generated code.
- Co-locate valuable unit tests with their source. Add stories only for reusable visual components with meaningful states.
- Keep project-wide line, function, branch, and statement coverage at or above 80%; run `npm run test:coverage`.

## Pre-Commit Checklist

Before committing, ensure:
- [ ] `npm run test` — all unit tests pass
- [ ] `npm run lint` — zero errors
- [ ] `npm run format:check` — formatting clean
- [ ] `npm run test:colocate` — source structure is valid
- [ ] Tests protect the highest-risk behavior changed
- [ ] Commit message follows conventional commits (`feat:`, `fix:`, etc.)
