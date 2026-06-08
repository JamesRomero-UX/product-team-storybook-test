# packages/knock

Knock notification workflow definitions and management.

## Commands

```bash
pnpm --filter @risksmart-app/knock run knock:pull           # Sync workflows from Knock cloud
pnpm --filter @risksmart-app/knock run knock:push           # Deploy workflows to Knock cloud
```

## Architecture

- `workflows/` - ~40 notification workflow definitions (each has workflow.json + channel content files)
- `partials/` - Reusable template fragments (deep-link-partial-email)
- `knock_scripts/` - Node.js utility scripts for preference management

## Key Patterns

- **Deep linking**: `deep-link-partial-email` maps workflow IDs to app route segments (e.g., `action-insert` -> `/actions`). Update this when adding new workflows.
- Templates use Liquid syntax. Each workflow produces email, chat, and in-app notifications.
- Requires Knock CLI authentication before push/pull operations.
