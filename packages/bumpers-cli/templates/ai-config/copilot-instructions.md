# {{projectName}} — Copilot Instructions

Read AGENTS.md for full details.

## Testing Policy
- Testing is risk-based, not one test per file.
- Use test-first thinking to define architecture, observable behavior, and regression risk.
- Prioritize Electron boundaries, business rules, error paths, dependency-heavy components, and widely reused code.
- Skip trivial rendering, framework wiring, static config, re-exports, and generated code.
- Use E2E for critical journeys and stories for reusable visual components with meaningful states.

## Testing Stack
- Unit: Vitest + @testing-library/react
- E2E: Playwright with Electron
- Stories: Storybook
- Coverage: 80% project-wide minimum

## Before Committing
- npm run test (unit tests pass)
- npm run lint (zero errors)
- npm run format:check (clean)
- npm run test:colocate (source structure is valid)
