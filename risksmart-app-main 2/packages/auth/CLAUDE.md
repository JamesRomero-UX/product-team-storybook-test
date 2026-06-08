# packages/auth

Auth0 tenant configuration, actions, database rules, and email templates.

## Commands

```bash
pnpm --filter @risksmart-app/auth0-stack run import               # Deploy to Auth0 (REQUIRES npm, not pnpm)
pnpm --filter @risksmart-app/auth0-stack run export               # Export config from Auth0
```

## Architecture

- `actions/` - Auth0 post-login action hooks
- `databases/` - Username-Password database rule scripts
- `emailTemplates/` - Handlebars email templates
- `config/` - Auth0 tenant YAML configs per environment

## Key Patterns

- **Post-login orchestration**: The "Create Risksmart User" action is the primary hook - creates/updates org, upserts user, manages org membership, sets Hasura JWT claims.
- Actions call Hasura directly via axios with admin secret.
- **Feature flags** controlled via Auth0 organization metadata (`metadata.features`).
- **Role hierarchy**: Public -> Standard -> RiskManager -> StandardEnhanced -> InternalAudit. Special handling for ThirdPartyRespondent and NoAccess.

## Gotchas

- Auth0 CLI requires **npm**, not pnpm.
- Manual steps required post-deployment (branding reapply, settings recheck).
- DEV_TENANT_ID has special bypass handling in development.
