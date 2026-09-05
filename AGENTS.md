# Agent Instructions

## Repository

Bumpers is a CLI that scaffolds projects with testing guardrails.

## Commands

- `npm test --workspace packages/bumpers-cli`
- `npm run build --workspace packages/bumpers-cli`
- `npm run test:pack --workspace packages/bumpers-cli` — verify the packed CLI in a clean consumer
- `npm run test:release --workspace packages/bumpers-cli` — run the full release-quality gate
- `npm run release:check -- --type initial --override 0.1.0` — validate release version inputs locally
- `npm run test:actions` — run the Linux GitHub Actions preflight locally with Act and Docker

## Installer Template Pattern

Large generated file contents belong in installer-owned template folders under `packages/bumpers-cli/templates/`.

Examples:
- `templates/playwright/...`
- `templates/storybook/...`
- `templates/electron/...`

Installer TypeScript should orchestrate:
- package metadata updates
- dependency/script changes
- directory creation
- template selection
- explicit placeholder values

Do not add large inline `fs.writeFile(..., \`...\`)` strings for generated source, config, or test files when a real template file can be used.

## Verification

After changing generated installer output, run focused scaffold tests for the affected template.
