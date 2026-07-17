# {{projectName}} — Agent Instructions

## Agent Entry Points

- Codex reads this `AGENTS.md` directly.
- Claude Code loads `CLAUDE.md`, which imports this file.
- Cursor and Copilot use thin adapters that point here.
- This file is the canonical project contract; keep shared guidance here rather than duplicating it.

## Project Identity

This is a React + Vite + TypeScript application scaffolded by Bumpers.

{{stackSummary}}

## Change Loop

1. Inspect nearby code, existing patterns, and the boundary involved.
2. Identify the observable behavior and meaningful regression risk.
3. Add or update focused verification when it can catch that regression.
4. Make the smallest correct change without weakening guardrails.
5. Run the relevant checks and report what was and was not verified.

## Hard Rules

{{hardRules}}

## Architecture Boundaries

{{architectureBoundaries}}

## Testing Contract

{{testingContract}}

## Verification Contract

{{verificationContract}}

## File-Specific Conventions

{{fileSpecificConventions}}

## Commands

{{commands}}
