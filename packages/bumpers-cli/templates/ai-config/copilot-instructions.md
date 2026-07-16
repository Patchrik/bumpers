# {{projectName}} — Copilot Instructions

Read AGENTS.md for full details.

## Key Rule: Five Artifacts per Component
Every UI component change must produce:
1. Component (.tsx)
2. Unit test (.test.tsx)
3. Storybook story (.stories.tsx)
4. E2E test (e2e/*.spec.ts)
5. Screenshot test (auto-generated)

## Testing Stack
- Unit: Vitest + @testing-library/react
- E2E: Playwright with Electron
- Stories: Storybook
- Coverage: 80% minimum per file, auto-ratchet

## Before Committing
- npm run test (unit tests pass)
- npm run lint (zero errors)
- npm run format:check (clean)
- npm run test:colocate (all files have tests)
