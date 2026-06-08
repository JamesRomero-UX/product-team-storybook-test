# packages/integrations

n8n workflow automation nodes for RiskSmart API integration.

## Commands

```bash
pnpm --filter n8n-nodes-risksmart run start                # Docker compose up (local n8n for testing)
pnpm --filter n8n-nodes-risksmart run stop                 # Docker compose down
```

## Key Patterns

- **CommonJS module** (not ESM) - required by n8n plugin system.
- Node implementations in `src/nodes/`: GetUser, InsertIssue, UpdateIssue, GetExpandedRisks, JiraIntegrationV2, etc.
- Auth0 token caching at module level with 300-second buffer before JWT expiration.
- n8n discovers credentials and nodes via `package.json` `"n8n"` key from `dist/` artifacts.
