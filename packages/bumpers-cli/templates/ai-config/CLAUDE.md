# {{projectName}} — Claude Instructions

> **Read `AGENTS.md` first** for full architecture and testing details.

## The One Rule

**One prompt → five artifacts.** Every UI component change produces:
1. Component (`.tsx`)
2. Unit test (`.test.tsx`)
3. Story (`.stories.tsx`)
4. E2E test (`e2e/*.spec.ts`)
5. Screenshot (auto-generated)

For non-component code: source + unit test (minimum 2 artifacts).

## What NOT to Test

- `node_modules/`, `dist/`, config files
- Type declarations (`*.d.ts`, `types.ts`)
- Entry points (`index.ts`, `main.tsx`)
- Barrel/re-export files

## Pre-Commit Checklist

Before committing, ensure:
- [ ] `npm run test` — all unit tests pass
- [ ] `npm run lint` — zero errors
- [ ] `npm run format:check` — formatting clean
- [ ] `npm run test:colocate` — all source files have tests
- [ ] New component? All 5 artifacts present
- [ ] Commit message follows conventional commits (`feat:`, `fix:`, etc.)
