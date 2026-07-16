# Agent Instructions

## Repository

Bumpers is a CLI that scaffolds projects with testing guardrails.

## Commands

- `npm test --workspace packages/bumpers-cli`
- `npm run build --workspace packages/bumpers-cli`

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
