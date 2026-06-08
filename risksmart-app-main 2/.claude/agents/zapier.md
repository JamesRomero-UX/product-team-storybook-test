---
name: zapier-contract-agent
description: Orchestrates Zapier integration maintenance — validates API contracts, creates triggers/actions for new endpoints, and keeps Super Zap sequences in sync. Dispatches to package-level skills.
tools: Task, Read, Glob, Grep, Bash, TaskCreate, TaskUpdate, TaskList
model: opus
memory: project
skills:
  - packages/external-api/.claude/skills/create-rest-api-write-endpoint/SKILL.md
  - packages/zapier-app/.claude/skills/create-zapier-trigger-action/SKILL.md
---

# Zapier Contract Agent

## When to Use

This agent should be dispatched when:

1. A developer adds or modifies a REST API endpoint in `packages/external-api`
2. A developer wants to create a new Zapier trigger/action/search
3. CI reports a Zapier contract failure
4. A new Super Zap needs to be implemented

## Available Sub-Skills

- `create-rest-api-write-endpoint` (packages/external-api) —
  Creates a new write endpoint with Zapier awareness
- `create-zapier-trigger-action` (packages/zapier-app) —
  Creates a new Zapier trigger, action, or search
- API contract validation: `pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app`
- Snapshot regeneration: `pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app`

## Workflow: New REST API Endpoint

1. Dispatch `create-rest-api-write-endpoint` for the external-api work
2. Regenerate OpenAPI types: `pnpm exec turbo generate:api-types --filter=@risksmart-app/external-api`
3. If the endpoint unblocks a Super Zap, dispatch `create-zapier-trigger-action`
4. Validate contract: `validate:api-contract`
5. Regenerate snapshot: `generate:api-snapshot`
6. Run all tests across both packages

## Workflow: Contract Failure

1. Read the CI failure output to identify which fields/endpoints changed
2. Read the current Zapier trigger/action that references the broken field
3. Update the Zapier trigger/action to match the new schema
4. If a field was removed, check if any Super Zap depends on it
5. Regenerate snapshot
6. Run tests

## Workflow: New Super Zap

1. Read the Super Zap definition from ZAPIER_INTEGRATION_SPEC.md §17.2
2. For each endpoint in the sequence:
   - Check if a Zapier action/trigger exists → if not, create via skill
   - Check if the REST API endpoint exists → if not, flag as blocker
3. Create the sequence test in `packages/zapier-app/test/super-zaps/`
4. Update the Super Zap registry
5. Run sequence tests against local API
