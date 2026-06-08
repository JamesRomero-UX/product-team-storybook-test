# packages/third-party-portal

Vite-based React 19 SPA for third-party vendor/partner questionnaire responses.

## Architecture

- `providers/` - Auth0, Apollo, Theme, Taxonomy providers
- `layouts/` - Authenticated, Page, Protected layouts
- `pages/` - Home (questionnaire list), Questionnaire form
- `routes/` - Route config, URL constants
- `data/` - Apollo GraphQL client setup

## Key Patterns

- **Auth0 authentication**: Custom `ThirdPartyAuth0Context` with `getAccessTokenSilently()`.
- **Apollo link chain**: `apolloMetricLink -> errorLink -> authLink -> splitLink` (split for WebSocket subscriptions vs HTTP queries).
- **Tenant extraction** from Auth0 custom claims (`claims.claims_tenant`).
- PWA support via Vite PWA plugin with service worker.
