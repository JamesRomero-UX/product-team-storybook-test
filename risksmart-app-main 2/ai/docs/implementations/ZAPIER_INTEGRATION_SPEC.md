# Zapier Integration Platform Spec

> **Status:** Active — Closed Beta
> **Author:** Rich / Claude
> **Date:** 2026-02-13
> **Last Updated:** 2026-02-16

## 1. Overview

RiskSmart will embed Zapier into the web app to offer customers a self-service integration marketplace. The goal is to let customer tenants connect RiskSmart with their existing tools (Jira, Slack, AWS, GitHub, etc.) via pre-built and custom workflows, while keeping the experience on-brand and tenant-isolated.

### Goals

- Offer 8,000+ app connections via Zapier embed with minimal engineering
- Provide pre-built Zap templates for common GRC workflows
- Brand the experience as RiskSmart (not "go use Zapier")
- Maintain strict multi-tenant isolation (Tenant A never sees Tenant B's data or Zaps)
- Support webhook-based triggers (outbound) and REST API actions (inbound)
- Build toward AI agents that pull data from multiple sources and update the platform

### Non-Goals (Phase 1)

- Replacing Zapier with a fully custom integration engine
- Building native integrations for cloud providers (Phase 2)
- AI agents (Phase 3)

---

## 1A. Current State — Closed Beta (Phase 1a Complete)

> **As of 2026-02-16.** This section documents what was actually built and shipped in the closed beta. All file paths reference real files in the codebase.

### Zapier App (`packages/zapier-app`)

- **App ID:** 199655, registered on Zapier Developer Platform as "RiskSmart (Dev)" (Private)
- **Auth:** Session-based — client key + secret → token exchange via `/api/v1/auth/token` (defined in `src/authentication.ts`)
- **6 actions** (registered as `creates` in `src/index.ts`):
  - `createRisk`, `updateRisk`, `deleteRisk`
  - `createIndicator`, `updateIndicator`, `deleteIndicator`
  - Implementations in `src/actions/` (8 files including shared utilities)
- **28 searches** (registered in `src/index.ts`):
  - Find-by-ID (12 entities): risks, indicators, controls, actions, issues, policies, assessments, obligations, third-parties, enterprise-risks, impacts, users
  - List (11 entities): risks, indicators, controls, actions, issues, policies, assessments, obligations, third-parties, enterprise-risks, impacts
  - Find-by-owner (3): actions, issues, risks
  - Enrichment (2): `getRiskOverview`, `getIssueDetails`
  - Implementations in `src/searches/` (30 files)
- **0 triggers** — the `triggers` object in `src/index.ts` is empty
- **Dynamic custom fields** via `src/fields/custom-fields.ts`
- **Rate-aware request wrapper** at `src/utils/rate-aware-request.ts`
- **API contract snapshot validation** — `api-contract.snapshot.json` (283KB, checked in)
- **Full test suite** — actions, searches, auth, fields, utils, contract validation (in `test/`)

### Frontend (`packages/web`)

- **`/automations` page** (`src/pages/automations/Page.tsx`) with 4 integration cards:
  - **Zapier** — opens `ZapierIntegrationModal` (link to zapier.com in pre-embed mode)
  - **MCP Server** — opens `MpcServerModal` with info + external link
  - **REST API** — opens `RestApiModal` with info + external link
  - **Slack** — shows "Coming Soon" badge (sub-module disabled by default)
- **Module system** controls visibility:
  - `integrations` parent module in `defaultModules` (`src/context/moduleContext.tsx`)
  - Sub-modules: `zapier`, `mcp_server`, `rest_api`, `slack`
  - Each card reads from `useModulesStore` with key path like `'integrations.subModules.zapier'`
  - Page checks `useIsFeatureVisibleToOrg('integrations')` before rendering
- **ZapierEmbed component** (`src/pages/automations/components/ZapierEmbed.tsx`):
  - Loads `zapier-workflow` web component via Zapier Partner SDK from CDN
  - Reads `REACT_APP_ZAPIER_CLIENT_ID` env var
  - Currently shows fallback UI (link to zapier.com) when no client ID is set
  - When client ID is available: renders full `<zapier-workflow>` element with `theme="auto"`
  - Error state for script load failures
- **`useZapierConnection` hook** (`src/pages/automations/hooks/useZapierConnection.ts`):
  - Listens for `zap:unpause`, `zap:pause`, and their `:done`/`:fail` postMessage events from the Zapier Workflow Element iframe
- **`AutomationCard` component** (`src/pages/automations/components/AutomationCard.tsx`) — reusable card with icon, title, description, badge, and action button

### Infrastructure

- **`integrations` feature flag** in `featureFlags.ts` — type `'module'`, gated by `moduleKey: 'integrations'`
- **Module system integration** — `integrations` in `defaultModules` with sub-module toggles

### What Was NOT Built (Deferred from Original Spec)

The following items were described in the original spec but intentionally deferred:

- No webhook/outbound event system (§3 — deferred to Phase 2)
- No polling triggers (§4.2, §4.5 — `triggers` object is empty)
- No OAuth-based auth (§2.3 — using session/API key auth instead per §2.5)
- No `zapier-auth.middleware.ts` (§2.5.4 — API key → Cognito JWT proxy not yet needed)
- No `zapier_user_tokens` table (§2.2)
- No `automations` cache table (§6.6 Phase 2)
- No automation-sync Lambda (§6.7)
- No My Automations / All Automations table register views (§6.5 — using card-based UI instead)
- No Settings tab with credential management (§6.5 Tab 3)
- No Quick Account Creation (QuAC) — requires Zapier embed client ID
- No Zap templates — requires published app (Beta+)
- No Super Zaps registry file (§17.4 — `src/super-zaps/registry.ts` does not exist; enrichment searches exist as regular searches in `src/searches/`)
- No `src/types/` directory (§14 — types are inline or via `zapier-platform-core`)

---

## 1B. Phase 1B — Powered by Zapier Embed + Two-Mode Auth

> **Status:** Next milestone. Blocked on Zapier app review and embed client ID issuance.

This phase unlocks the full embedded Zapier experience inside the RiskSmart `/automations` page and delivers **both auth modes** for connecting users to Zapier. It activates the scaffolding already built in Phase 1a (the `ZapierEmbed` component, `useZapierConnection` hook, and module system).

### Two Auth Modes

Phase 1b delivers two ways for users to connect RiskSmart to Zapier:

- **Mode 1 (BYOA):** Available immediately once the app goes public in the Zapier App Directory. Users with their own Zapier accounts can find "RiskSmart" on zapier.com and connect using their existing External API credentials. No embed or backend changes needed — just a published app.
- **Mode 2 (Managed):** Activates when the embed `client_id` is received. RiskSmart creates/links Zapier accounts via the `/v2/authorize` OAuth flow and programmatically bridges the RiskSmart authentication using `POST /v2/authentications`. Users click "Connect Zapier" in the `/automations` page and get a fully connected experience.

See §2.3 for the full two-mode authentication architecture.

### Prerequisites (Must Complete Before Embed Work)

1. **Submit Zapier app for review** — promote from Private → Beta in the Zapier Developer Platform (`developer.zapier.com/app/199655/publishing`). Ensure all 6 actions and 28 searches pass `zapier validate`.
2. **Receive Zapier `client_id` for embed** — separate from the app ID (199655). Available from **Embed > Settings > Credentials** in the Developer Platform, only after the app reaches Beta+ status.
3. **Whitelist RiskSmart domains** — in the Zapier Developer Platform under Embed > Settings, add `app.risksmart.com`, `*.risksmart.com`, and a tunnel URL for local dev.
4. **Create and submit Zap templates** — required before the Workflow Element can be embedded. Create at least 5 starter templates via `developer.zapier.com/zap-templates`.

### Workflow Element Embed (`<zapier-workflow>`)

- **Already scaffolded** in `src/pages/automations/components/ZapierEmbed.tsx`
- Currently shows fallback UI (link to zapier.com) when `REACT_APP_ZAPIER_CLIENT_ID` is not set
- Once client ID is available: renders the full Zapier Workflow Element (discover, create, manage Zaps)
- Theming: `theme="auto"` already configured
- postMessage events already handled by `useZapierConnection` hook

### Quick Account Creation (QuAC)

- Add `sign-up-email`, `sign-up-first-name`, `sign-up-last-name` attributes to the `<zapier-workflow>` element in `ZapierEmbed.tsx`
- Source values from Auth0 user profile (already available via `useAuth0()` in `AuthProvider` context)
- Eliminates Zapier signup friction — users go straight to the Zap editor without creating a separate Zapier account

### Zap Templates

- Define 10–20 pre-built templates for common GRC workflows (see §5.1 for candidates)
- Templates submitted via Zapier Developer Platform (`developer.zapier.com/zap-templates`)
- Surfaced automatically in the Workflow Element once approved
- Pre-filled Zaps: use URL format with `steps[n][params][field]=value` for contextual Zap creation from entity detail pages

### Phase 1B Deliverables

1. Set `REACT_APP_ZAPIER_CLIENT_ID` env var once issued by Zapier
2. Add QuAC attributes to `ZapierEmbed` component (email, first name, last name from Auth0)
3. Replace `ZapierIntegrationModal` content with the embedded Workflow Element (full Zap creation/management inline)
4. Create 10+ Zap templates and submit for review on Zapier Developer Platform
5. Add pre-filled Zap links from entity detail pages (e.g., "Automate this risk" button)
6. Wire up postMessage events for Zap status changes (`zap:unpause:done`, `zap:pause:done`, `zap:error`) to show toast notifications
7. **Mode 2:** Build OAuth callback endpoint (`/api/v1/automations/zapier/callback`) for exchanging `/v2/authorize` codes for access tokens
8. **Mode 2:** Create `zapier_user_tokens` table (org_id, user_id, zapier_access_token, created_at)
9. **Mode 2:** Implement "Connect Zapier" popup flow using Zapier `/v2/authorize` with pre-filled user info from Auth0
10. **Mode 2:** Bridge RiskSmart auth via `POST /v2/authentications` so users see RiskSmart as "Connected" in the Workflow Element

---

## 1C. Phase 2 Feature: Pre-Filled Zaps & Managed Authentication

> **Status:** Future. Builds on Phase 1b Mode 2 infrastructure.

This section covers Phase 2 features that leverage the Zapier Workflow API to create a seamless automation experience from entity detail pages.

### Pre-Filled Zap Authentication (Workflow API)

Once a user has connected via Mode 2 (§2.3.2), RiskSmart holds their Zapier OAuth access token. This enables programmatic management of their RiskSmart connection on Zapier:

- **`POST /v2/authentications`** creates a RiskSmart authentication on the user's Zapier account
- Passes:
  - `app`: RiskSmart app ID (199655)
  - `title`: e.g. `"RiskSmart — john@company.com"`
  - `authentication_fields`: `{ client_key, client_secret, api_base_url }` (from the user's External API credentials)
- Requires: the user's Zapier OAuth access token (from Mode 2 `/v2/authorize` flow)
- Result: when the user opens the Zap editor, RiskSmart shows as "Connected" with a green checkmark — no manual credential entry needed

### Pre-Filled Zap Templates (URL Parameters)

Zap template `create_url` values support `steps[n][params][field]=value` query parameters for pre-filling trigger/action inputs:

- From entity detail pages (e.g., risk detail), an "Automate this risk" button opens a Zap template URL pre-filled with the entity ID
- Example: `https://api.zapier.com/v1/embed/risksmart/create/12345?steps[0][params][risk_id]=risk_abc123`
- Works with **both Mode 1 and Mode 2** — URL-based, no OAuth token needed
- Templates define which fields can be pre-filled (trigger inputs, action inputs)

### Programmatic Zap Creation (Workflow API)

For "one-click automation" from entity detail pages:

- **`POST /v2/zaps`** creates a complete Zap with steps, authentication, and inputs already configured
- Example: user clicks "Create Jira sync for this risk" → RiskSmart creates a Zap with:
  - Step 1 (trigger): RiskSmart "Risk Updated" trigger, pre-filled with risk ID
  - Step 2 (action): Jira "Create Issue" action
  - Auth: RiskSmart connection already linked (via `POST /v2/authentications`)
- Requires **Mode 2** (OAuth access token needed to create Zaps on behalf of the user)
- User is redirected to the Zap editor to review and enable the Zap

### Phase 2 Deliverables

1. Implement `POST /v2/authentications` bridge for Mode 2 users (auto-create RiskSmart connection on Zapier)
2. Build pre-filled Zap template URL generator for entity detail pages
3. Add "Automate this [entity]" buttons to risk, control, action, and issue detail pages
4. Implement programmatic Zap creation via `POST /v2/zaps` for one-click automation scenarios
5. Build Zap template registry mapping entity types to relevant templates

---

## 2. Architecture

### 2.1 How Zapier Embed Works

Zapier offers two embed approaches. We will start with the **Workflow Element** (Phase 1) and migrate to the **Workflow API** (Phase 4) for full branding control.

| Approach | Description | Branding | Effort |
|----------|-------------|----------|--------|
| **Workflow Element** | Drop-in iframe component. 2-3 lines of code. Full Zapier UX embedded. | Partial — Zapier UI visible, can customise colours/logo | Low (days) |
| **Workflow API** | Full REST API. You build the entire UI. | Full — no Zapier visible to user | High (weeks) |

### 2.2 User Model & Tenant Isolation

RiskSmart supports two modes for connecting users to Zapier. The mode determines who owns the Zapier account and who pays, but **data isolation is identical in both modes**.

#### Two-Mode Auth Decision Table

| | **Mode 1: BYOA** | **Mode 2: Managed** |
|---|---|---|
| **What the user does** | Finds "RiskSmart" in the Zapier App Directory on zapier.com, connects with their External API credentials (client key + secret) | Clicks "Connect Zapier" in `/automations` page, completes OAuth popup |
| **Zapier account** | User's own (they already have one or create one on zapier.com) | Created/linked by RiskSmart via `/v2/authorize` OAuth flow |
| **RiskSmart auth on Zapier** | User enters client key + secret manually in Zapier's connection form | RiskSmart bridges auth automatically via `POST /v2/authentications` |
| **What RiskSmart builds** | Maintain public Zapier app. Zero new backend infrastructure. | OAuth callback endpoint, `zapier_user_tokens` table, `/v2/authentications` bridge |
| **Billing** | User pays for their own Zapier subscription | RiskSmart pays for Zapier task usage (commercial deal required) |
| **Scope control** | Controlled by the External API credential's scopes (admin-managed in Settings → External API) | Same — uses the user's existing External API credentials |
| **Best for** | Power users, technical teams, customers who already use Zapier | All users — seamless embedded experience, no Zapier knowledge needed |

#### Mode 2 Token Storage

For Mode 2, RiskSmart stores the Zapier OAuth access token to manage the user's Zapier account:

```
zapier_user_tokens table
┌─────────┬──────────┬─────────────────────────┬────────────┐
│ org_id  │ user_id  │ zapier_access_token      │ created_at │
├─────────┼──────────┼─────────────────────────┼────────────┤
│ acme    │ user_1   │ zap_tok_abc...           │ 2026-02-16 │
│ acme    │ user_2   │ zap_tok_def...           │ 2026-02-16 │
│ globex  │ user_3   │ zap_tok_ghi...           │ 2026-02-17 │
└─────────┴──────────┴─────────────────────────┴────────────┘
```

This table is only populated for Mode 2 users. Mode 1 users have no RiskSmart-side token storage — their Zapier account and connections are entirely self-managed.

#### Tenant Isolation (Both Modes)

Data isolation is unchanged and enforced at the API level regardless of auth mode:

- RiskSmart's REST API enforces `org_id` and `tenant_id` from the JWT on every request
- A Zap authenticated as a Tenant A user can only read/write Tenant A data
- Enforced by row-level security (RLS) in PostgreSQL — the `org_key` column on every table
- The External API credential's scopes further restrict which resources and operations are available
- A user in Tenant B has zero visibility into Tenant A's data or Zaps

### 2.3 Two-Mode Authentication Architecture

RiskSmart supports two authentication modes for Zapier integration. Both modes use the same underlying RiskSmart REST API auth (session-based: client key + secret → token exchange via `/api/v1/auth/token`), but differ in how the Zapier account and connection are set up.

#### 2.3.1 Mode 1: BYOA (Bring Your Own Account)

The simplest path. The user already has (or creates) their own Zapier account and connects to RiskSmart using credentials they already have.

```
User creates External API credentials in RiskSmart
  (existing feature: Settings → External API)
       │
       ▼
User goes to zapier.com and finds "RiskSmart" in the App Directory
  (requires RiskSmart app to be public/Beta+)
       │
       ▼
User clicks "Connect" → Zapier shows RiskSmart auth form
  (session auth: client key + client secret fields)
       │
       ▼
Zapier calls POST /api/v1/auth/token with credentials
  → receives session token
  → connection marked as active (green checkmark)
       │
       ▼
User creates and manages Zaps on zapier.com
  → user pays for their own Zapier subscription
  → user manages their own Zaps, connections, and billing
```

**RiskSmart responsibility:** Maintain the public Zapier app (triggers, actions, searches). Zero new backend infrastructure required for Mode 1.

**Scope control:** The External API credential already has admin-assigned scopes (e.g., `risks:read`, `actions:write`). These scopes are enforced by the REST API on every request, regardless of what the Zap tries to do.

#### 2.3.2 Mode 2: Managed Accounts (Powered by Zapier)

The seamless embedded experience. RiskSmart creates/links the user's Zapier account and pre-configures the RiskSmart connection automatically.

```
User clicks "Connect Zapier" on the /automations page
       │
       ▼
RiskSmart opens popup to Zapier /v2/authorize:
  GET https://api.zapier.com/v2/authorize
    ?client_id={ZAPIER_EMBED_CLIENT_ID}
    &redirect_uri={RISKSMART_CALLBACK_URL}
    &response_type=code
    &scope=zap:write authentication:write
  Pre-filled sign-up info (from Auth0 via useAuth0()):
    &first_name={user.given_name}
    &last_name={user.family_name}
    &email={user.email}
       │
       ▼
New Zapier users: consent page → account created → redirect back
Existing Zapier users: login → consent → redirect back
       │
       ▼
Redirect returns to RiskSmart callback with authorization code:
  GET /api/v1/automations/zapier/callback?code={auth_code}
       │
       ▼
RiskSmart backend exchanges code for access token (within 2 minutes):
  POST https://api.zapier.com/v2/oauth/token
    { grant_type: "authorization_code", code, redirect_uri, client_id, client_secret }
       │
       ▼
Token stored in zapier_user_tokens table:
  { org_id, user_id, zapier_access_token, created_at }
       │
       ▼
RiskSmart bridges auth via Workflow API:
  POST https://api.zapier.com/v2/authentications
    Authorization: Bearer {zapier_access_token}
    {
      app: 199655,  // RiskSmart app ID
      title: "RiskSmart — john@company.com",
      authentication_fields: {
        client_key: "{user's External API client key}",
        client_secret: "{user's External API client secret}",
        api_base_url: "https://api.risksmart.com"
      }
    }
       │
       ▼
User sees embedded Workflow Element with RiskSmart already connected ✓
  → RiskSmart pays for Zapier task usage (commercial deal required)
```

**Key requirement:** The user must have existing External API credentials (Settings → External API) before connecting via Mode 2. The `/v2/authentications` call passes these credentials to Zapier so the Zap can authenticate against the RiskSmart REST API.

#### 2.3.3 Auth Flow Comparison Table

| Aspect | Mode 1 (BYOA) | Mode 2 (Managed) |
|--------|---------------|-------------------|
| **What user does** | Goes to zapier.com, finds RiskSmart, enters client key + secret | Clicks "Connect Zapier" in `/automations`, completes OAuth popup |
| **Zapier account ownership** | User's own account | Created/linked by RiskSmart via `/v2/authorize` |
| **RiskSmart connection setup** | User manually enters credentials in Zapier | Automatic via `POST /v2/authentications` |
| **What RiskSmart builds** | Nothing new (just maintain public app) | OAuth callback, token storage, `/v2/authentications` bridge |
| **Billing** | User pays their own Zapier costs | RiskSmart pays (partner pricing deal) |
| **Embed required?** | No — works on zapier.com directly | Yes — requires embed `client_id` |
| **Scope control** | External API credential scopes | Same — uses External API credentials |
| **User deprovisioning** | User manages their own Zapier account | Admin can revoke External API credential; Zapier token can be deleted |

#### 2.3.4 Tenant Isolation (Both Modes)

Data isolation is identical regardless of which auth mode is used:

- The RiskSmart REST API enforces `org_id` and `tenant_id` from the JWT on every request
- The JWT is obtained by exchanging the External API client key + secret (session auth via `/api/v1/auth/token`)
- PostgreSQL row-level security (RLS) ensures a Zap authenticated as Tenant A can only read/write Tenant A data
- The External API credential's scopes further restrict which resources and operations are available
- Zapier's per-user account model provides additional isolation: each user's Zaps and connections are scoped to their Zapier account

#### 2.3.5 What Was Removed from the Original Spec

Sections §2.3–§2.5 originally specified a complex authentication system including:

- **Auth0 OAuth per-user tokens** (original §2.3): OAuth2 authorization code flow with Auth0, SSO HRD problem/solution, post-OAuth org resolution, connection fields for org picker, Auth0 Action for claims injection, token lifecycle management
- **System architecture diagram** (original §2.4): Showed `zapier_user_tokens`, `tenant_integrations` cache, and `webhook_subs` tables
- **Cognito admin-assigned credential system** (original §2.5): `rs_zap_` API keys, admin credential creation/assignment UI, `zapier-auth.middleware.ts` proxy (API key → Cognito JWT), DynamoDB storage with KMS encryption, credential request/approval flow with Knock notifications, multi-credential support per user, programmatic key delivery to Zapier embed

This has been replaced by the simpler two-mode approach above. The original sections are archived in git history.

---
## 3. Outbound Webhook System

> **Deferred to Phase 2.** The outbound webhook/event system (EventBridge → HTTP dispatcher, webhook subscriptions, HMAC signing) is needed for Zapier **triggers** (e.g., "When a new risk is created...") but is NOT required for Phase 1. Phase 1 focuses on Zapier **actions** (Zapier → RiskSmart) and uses Zapier's **polling triggers** as an interim solution (Zapier periodically polls `GET /api/v1/risks?sort=-createdAt&limit=5` to detect new records). The full webhook system will be designed and built in Phase 2.

---

## 4. Zapier Integration App

Published on the Zapier Developer Platform. Built with Zapier CLI (`zapier-platform-core`).

### 4.1 Authentication Definition

> **Updated: Now uses API Key auth (see §2.5 for rationale)**

```js
// authentication.js — Zapier CLI app
// Uses "API Key" auth type — simplest model
// The API key (rs_zap_...) is resolved server-side to a Cognito JWT
module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'string',
      required: true,
      helpText:
        'Your RiskSmart automation API key. Found in RiskSmart → Automations → Settings.',
    },
  ],
  test: {
    url: '{{process.env.RISKSMART_API_URL}}/api/v1/auth/me',
    headers: {
      Authorization: 'Bearer {{bundle.authData.api_key}}',
    },
  },
  connectionLabel: (z, bundle) => {
    // /auth/me returns { org_name, user_email }
    return `${bundle.inputData.org_name} (${bundle.inputData.user_email})`;
  },
};

// All triggers/actions automatically include the API key header:
// In beforeRequest middleware (index.js):
const addApiKeyToHeader = (request, z, bundle) => {
  request.headers.Authorization = `Bearer ${bundle.authData.api_key}`;
  return request;
};
```

<details>
<summary>Previous approach: Auth0 OAuth2 (retained for reference)</summary>

```js
// authentication.js (DEPRECATED — Auth0 OAuth approach)
// See §2.3 for the full Auth0 OAuth flow design.
// Replaced by API Key auth (§2.5) due to token lifecycle fragility,
// SSO complications, and user deprovisioning risks.
module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: 'https://{{bundle.inputData.auth0_domain}}/authorize',
      params: {
        client_id: '{{process.env.AUTH0_ZAPIER_CLIENT_ID}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
        scope: 'openid profile email offline_access',
        audience: '{{process.env.AUTH0_API_INTEGRATIONS_AUDIENCE}}',
      },
    },
    getAccessToken: { /* Auth0 token exchange */ },
    refreshAccessToken: { /* Auth0 refresh */ },
    autoRefresh: true,
  },
  test: { url: '{{process.env.RISKSMART_API_URL}}/api/v1/users/me' },
};
```
</details>

### 4.2 Triggers

Each trigger uses the REST Hook subscription pattern:

```js
// triggers/risk_created.js
module.exports = {
  key: 'risk_created',
  noun: 'Risk',
  display: {
    label: 'New Risk Created',
    description: 'Triggers when a new risk is created in RiskSmart.',
  },
  operation: {
    type: 'hook',
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        method: 'POST',
        url: `${process.env.RISKSMART_API_URL}/api/v1/webhooks`,
        body: {
          target_url: bundle.targetUrl,
          event_types: ['risk.created'],
        },
      });
      return response.data;
    },
    performUnsubscribe: async (z, bundle) => {
      await z.request({
        method: 'DELETE',
        url: `${process.env.RISKSMART_API_URL}/api/v1/webhooks/${bundle.subscribeData.id}`,
      });
    },
    perform: async (z, bundle) => {
      // Zapier sends the webhook payload here
      return [bundle.cleanedRequest];
    },
    performList: async (z, bundle) => {
      // Fallback: fetch recent risks for Zap setup preview
      const response = await z.request({
        url: `${process.env.RISKSMART_API_URL}/api/v1/risks`,
        params: { limit: 3, sort: '-createdAt' },
      });
      return response.data;
    },
    sample: {
      id: 'risk_abc123',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to customer data',
      status: 'Open',
      likelihood: 3,
      impact: 4,
      owner: 'jane@example.com',
      createdAt: '2026-02-13T10:00:00Z',
    },
  },
};
```

### 4.3 Actions

```js
// actions/create_risk.js
module.exports = {
  key: 'create_risk',
  noun: 'Risk',
  display: {
    label: 'Create Risk',
    description: 'Creates a new risk in RiskSmart.',
  },
  operation: {
    inputFields: [
      { key: 'title', label: 'Title', type: 'string', required: true },
      { key: 'description', label: 'Description', type: 'text', required: false },
      { key: 'status', label: 'Status', type: 'string', choices: ['Open', 'In Treatment', 'Closed'], default: 'Open' },
      { key: 'likelihood', label: 'Likelihood', type: 'integer', helpText: '1-5 scale' },
      { key: 'impact', label: 'Impact', type: 'integer', helpText: '1-5 scale' },
      { key: 'owner', label: 'Owner Email', type: 'string', required: false },
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        method: 'POST',
        url: `${process.env.RISKSMART_API_URL}/api/v1/risks`,
        body: {
          title: bundle.inputData.title,
          description: bundle.inputData.description,
          status: bundle.inputData.status,
          likelihood: bundle.inputData.likelihood,
          impact: bundle.inputData.impact,
          owner: bundle.inputData.owner,
        },
      });
      return response.data;
    },
    sample: {
      id: 'risk_abc123',
      title: 'Sample Risk',
      status: 'Open',
      createdAt: '2026-02-13T10:00:00Z',
    },
  },
};
```

### 4.4 Searches

```js
// searches/find_risk.js
module.exports = {
  key: 'find_risk',
  noun: 'Risk',
  display: {
    label: 'Find Risk',
    description: 'Finds a risk by title or ID.',
  },
  operation: {
    inputFields: [
      { key: 'query', label: 'Search Query', type: 'string', required: true,
        helpText: 'Risk title or ID to search for' },
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        url: `${process.env.RISKSMART_API_URL}/api/v1/risks`,
        params: { search: bundle.inputData.query, limit: 1 },
      });
      return response.data;
    },
  },
};
```

### 4.5 Full Trigger/Action/Search List

> **Note:** This section lists the originally planned full catalogue. See §1A for what was actually built in Phase 1a. Triggers are deferred to Phase 2.

**Triggers (Phase 2 — not yet built):**
- `risk_created` — New Risk Created
- `risk_updated` — Risk Updated
- `risk_status_changed` — Risk Status Changed
- `control_created` — New Control Created
- `control_updated` — Control Updated
- `control_evidence_added` — Evidence Added to Control
- `issue_created` — New Issue Created
- `issue_resolved` — Issue Resolved
- `action_created` — New Action Item
- `action_completed` — Action Completed
- `action_overdue` — Action Overdue
- `assessment_completed` — Assessment Completed
- `third_party_risk_changed` — Third-Party Risk Score Changed
- `policy_published` — Policy Published
- `indicator_threshold_breached` — Indicator Threshold Breached

**Actions (6 shipped in Phase 1a, remainder planned for Phase 2):**
- `create_risk` — Create Risk ✅
- `update_risk` — Update Risk ✅
- `delete_risk` — Delete Risk ✅
- `create_indicator` — Create Indicator ✅
- `update_indicator` — Update Indicator ✅
- `delete_indicator` — Delete Indicator ✅
- `create_control` — Create Control (Phase 2)
- `update_control` — Update Control (Phase 2)
- `create_action` — Create Action Item (Phase 2)
- `create_issue` — Create Issue (Phase 2)
- `add_evidence` — Add Evidence to Control (Phase 2)
- `update_assessment` — Update Assessment (Phase 2)
- `create_third_party` — Create Third-Party Record (Phase 2)

**Searches (28 shipped in Phase 1a):**
- Find-by-ID (12): risks, indicators, controls, actions, issues, policies, assessments, obligations, third-parties, enterprise-risks, impacts, users ✅
- List (11): risks, indicators, controls, actions, issues, policies, assessments, obligations, third-parties, enterprise-risks, impacts ✅
- Find-by-owner (3): actions, issues, risks ✅
- Enrichment (2): `getRiskOverview`, `getIssueDetails` ✅

---

## 5. Pre-Built Zap Templates

Templates are published on Zapier and surfaced in the Workflow Element. Each is a ready-to-use Zap that users activate with a few clicks.

### 5.1 Priority Templates (Phase 1 — ship 20)

**Notifications:**
1. New Risk Created → Slack channel notification
2. New Risk Created → Microsoft Teams notification
3. Action Overdue → Slack DM to owner
4. Action Overdue → Email notification
5. Issue Created → Slack channel notification
6. Indicator Threshold Breached → PagerDuty incident
7. Policy Published → Email to all stakeholders

**Ticketing:**
8. New Jira Issue → Create RiskSmart Action
9. RiskSmart Issue Created → Create Jira Ticket
10. RiskSmart Action Created → Create Jira Task
11. ServiceNow Incident → Create RiskSmart Issue
12. Asana Task Completed → Complete RiskSmart Action

**Documents & Evidence:**
13. New Google Drive file in folder → Add Evidence to Control
14. New SharePoint file → Add Evidence to Control
15. New Confluence page → Add Evidence to Control

**Data Sync:**
16. New Google Form response → Create RiskSmart Third-Party Record
17. New Typeform response → Create RiskSmart Assessment
18. Updated Airtable record → Update RiskSmart Risk
19. New Salesforce account → Create RiskSmart Third-Party Record

**DevOps:**
20. GitHub Security Alert → Create RiskSmart Issue

---

## 6. Frontend Implementation: Automations Page

The Automations page is a **top-level main menu item** (not buried in settings). It uses the standard register/table pattern already established across the app (same as Risks, Controls, Actions, etc.) with three tabs for different user views.

### 6.1 Navigation Menu Item

Add to `useNavItems.tsx` alongside the existing menu items:

```typescript
// In useNavItems.tsx — after Actions, before Indicators
if (canViewAutomations) {
  navItems.push({
    type: 'link',
    text: t('automationsTitle'),  // "Automations"
    href: automationsUrl(),       // '/automations'
    icon: <Zap />,                // from @untitled-ui/icons-react (or Lightning01)
  });
}
```

**Visibility check:**
```typescript
const { hasPermission: canViewAutomations } = useHasPermissionQuery(
  'read:automation',
  undefined,
  true  // canHaveAccessAsContributor — all users can see their own
);
const automationsVisible = canViewAutomations && automationsEnabled;
```

### 6.2 Route Configuration

```typescript
// routes/automationRoutes.config.tsx
import { RouteObject } from 'react-router-dom';
import { AutomationsPage } from '@/pages/automations/Page';

export const automationRoutes: RouteObject = {
  path: 'automations',
  children: [
    {
      path: '',
      element: (
        <ProtectedRoute permission={'read:automation'} canHaveAccessAsContributor={true}>
          <AutomationsPage activeTabId={'my-automations'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'all',
      element: (
        <ProtectedRoute permission={'read:automation'}>
          <AutomationsPage activeTabId={'all-automations'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'settings',
      element: (
        <ProtectedRoute permission={'update:automation'}>
          <AutomationsPage activeTabId={'settings'} />
        </ProtectedRoute>
      ),
    },
  ],
};
```

### 6.3 Page Structure

```
packages/web/src/pages/automations/
├── Page.tsx                        # Main page with tabs
├── config.tsx                      # Table column definitions
├── tabs/
│   ├── MyAutomationsTab.tsx        # "My Automations" — user's own Zaps
│   ├── AllAutomationsTab.tsx       # "All Automations" — org-wide (RiskManager/Tech only)
│   └── SettingsTab.tsx             # "Settings" — connection management (RiskManager/Tech only)
├── modals/
│   ├── CreateAutomationModal.tsx   # "Add New Automation" — template picker + Zapier embed
│   └── ZapierConnectModal.tsx      # First-time Zapier OAuth flow
├── hooks/
│   ├── useZapier.ts               # Zapier OAuth + token management (based on useSlack.ts)
│   ├── useAutomations.ts          # Fetch automations from backend cache
│   └── useZapierConnection.ts     # Check if user has connected Zapier account
├── providers/
│   └── AutomationsProvider.tsx    # Context provider for Zapier state
└── components/
    ├── AutomationStatusBadge.tsx   # Status indicator (Active/Paused/Error)
    ├── ConnectedAppIcons.tsx       # App icon display for Zap steps
    └── ZapierEmbed.tsx             # Wrapper around Zapier Workflow Element
```

### 6.4 Page Layout (Page.tsx)

Follows the standard PageLayout + ControlledTabs pattern:

```tsx
// pages/automations/Page.tsx
export const AutomationsPage = ({ activeTabId }: { activeTabId: string }) => {
  const { t } = useTranslation();
  const { hasPermission: isRiskManagerOrTech } = useHasPermissionQuery('update:automation');
  const { isConnected, connect } = useZapierConnection();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tabs = [
    {
      id: 'my-automations',
      label: t('automations.myAutomations'),          // "My Automations"
      href: '/automations',
      content: <MyAutomationsTab />,
    },
    // Only visible to RiskManager / Tech roles
    ...(isRiskManagerOrTech ? [{
      id: 'all-automations',
      label: t('automations.allAutomations'),          // "All Automations"
      href: '/automations/all',
      content: <AllAutomationsTab />,
    }] : []),
    ...(isRiskManagerOrTech ? [{
      id: 'settings',
      label: t('automations.settings'),                // "Settings"
      href: '/automations/settings',
      content: <SettingsTab />,
    }] : []),
  ];

  return (
    <PageLayout
      title={t('automations.pageTitle')}               // "Automations"
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission permission={'insert:automation'} canHaveAccessAsContributor={true}>
            <Button
              variant={'primary'}
              onClick={() => {
                if (!isConnected) {
                  // First time — trigger Zapier auth flow
                  connect();
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
            >
              {t('automations.addNewButton')}           // "Add New Automation"
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
      />
      {isCreateModalOpen && (
        <CreateAutomationModal
          onDismiss={() => setIsCreateModalOpen(false)}
        />
      )}
    </PageLayout>
  );
};
```

### 6.5 Tabs Detail

#### Tab 1: "My Automations" (all users)

Shows automations created by the currently logged-in user. Uses the standard table register pattern.

**Who sees it:** Any user with `read:automation` permission (all roles including Standard, ReadOnly as contributor).

**Data source (Phase 1 — live API):** Fetched directly from the Zapier API via `GET /v2/zaps` using the user's stored Zapier access token. No local cache table in Phase 1 — keeps it simple. The `useAutomations` hook calls the Zapier API on page load and maps the response into table rows.

```typescript
// hooks/useAutomations.ts — Phase 1 (live API)
// Calls Zapier GET /v2/zaps via a backend proxy endpoint
// Backend proxy: GET /api/v1/automations/mine
//   → reads user's zapier_access_token from zapier_user_tokens
//   → forwards to Zapier API GET /v2/zaps
//   → maps response into AutomationRow[]
//   → returns to frontend
```

**Table columns:**

| Column | Field | Zapier API Source | Type | Description |
|--------|-------|-------------------|------|-------------|
| Name | `title` | `data[].title` | Link | Automation name, clickable to open Zapier editor (`data[].links.html_editor`) |
| Status | `status` | `data[].is_enabled` | Badge | Active (green) if `is_enabled=true`, Paused (grey) if `false` |
| Trigger | `trigger` | `data[].steps[0]` | Text + icon | First step: app name + action title (parsed from V1 `steps[0].app.title` + `steps[0].type_of`) |
| Action | `action` | `data[].steps[1]` | Text + icon | Second step: app name + action title |
| Last Run | `lastRun` | `data[].last_successful_run_date` | Relative time | e.g., "2 hours ago", "Never" |
| Updated | `updatedAt` | `data[].updated_at` | Date | Last modified |

**Row actions (multi-select + header buttons — follows app pattern):**
- Select rows via checkboxes (`selectionType={'multi'}`)
- **Delete button** in header (enabled when rows selected) — opens `DeleteModal` with confirmation: "Are you sure you want to delete X automation(s)? This will permanently disable these Zaps."
- **Name column is clickable** — opens Zapier editor URL (`data[].links.html_editor`) in a new tab
- **Enable / Disable** — `ActionsButton` dropdown in header with "Enable Selected" / "Disable Selected" options, calls Zapier API to toggle `is_enabled`

```tsx
// Follows the ActionsTab.tsx multi-select + DeleteModal pattern:
const [selectedAutomations, setSelectedAutomations] = useState<AutomationRow[]>([]);
const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

<Table
  selectionType={canDeleteAutomation ? 'multi' : undefined}
  selectedItems={selectedAutomations}
  trackBy={'id'}
  onSelectionChange={({ detail }) => setSelectedAutomations(detail.selectedItems)}
  header={
    <SpaceBetween direction={'horizontal'} size={'xs'}>
      <ActionsButton
        buttonText={'Actions'}
        items={[
          { id: 'enable', text: 'Enable Selected', onItemClick: handleEnable },
          { id: 'disable', text: 'Disable Selected', onItemClick: handleDisable },
        ]}
        disabled={!selectedAutomations.length}
      />
      <Button
        disabled={!selectedAutomations.length}
        onClick={() => setIsDeleteModalVisible(true)}
      >
        {t('delete')}
      </Button>
    </SpaceBetween>
  }
/>

<DeleteModal
  loading={deleteLoading}
  isVisible={isDeleteModalVisible}
  header={t('automations.deleteHeader')}
  onDelete={handleDelete}
  onDismiss={() => setIsDeleteModalVisible(false)}
>
  {t('automations.confirmDeleteMessage', { count: selectedAutomations.length })}
</DeleteModal>
```

**Empty state:** "You haven't created any automations yet. Click 'Add New Automation' to connect RiskSmart with your favourite tools."

#### Tab 2: "All Automations" (RiskManager / Tech only)

Shows all automations across the entire tenant/organisation. This is the governance view.

**Who sees it:** Users with `update:automation` permission (RiskManager, Admin roles).

**Data source (Phase 1 — live API, aggregated):** Backend endpoint `GET /api/v1/automations/all` iterates over all `zapier_user_tokens` for the org, calls Zapier API per user, and merges results. Each result is annotated with the RiskSmart user who owns it. This is slower than a cache but acceptable for Phase 1 admin use.

> **Phase 2 optimisation:** Introduce the `automations` cache table and sync Lambda (see §6.7) so this tab loads instantly from the local DB.

**Table columns (same as My Automations plus Owner):**

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| Name | `title` | Link | Automation name (clickable → Zapier editor) |
| Owner | `owner_name` | Text | RiskSmart user who created the automation |
| Status | `status` | Badge | Active / Paused / Error |
| Trigger | `trigger` | Text + icon | Trigger step description |
| Action | `action` | Text + icon | Action step description |
| Connected Apps | `connectedApps` | Icon list | Icons of all apps in the Zap steps |
| Last Run | `lastRun` | Relative time | Last successful execution |
| Updated | `updatedAt` | Date | Last modified |

**Row actions:** Same multi-select + header buttons + DeleteModal pattern as My Automations. Admin can disable any user's automation.

**Filters (property filter ribbon):**
- Status: Active / Paused / Error
- Owner: user picker
- Connected App: app picker
- Created: date range

**Admin actions:**
- Disable any user's automation (with audit log entry)
- View run history for any automation
- Export automations list

#### Tab 3: "Settings" (RiskManager / Tech only)

Connection management and integration governance.

**Who sees it:** Users with `update:automation` permission.

**Sections:**

**Connected Accounts:**
Table showing all users in the org who have connected Zapier accounts:

| Column | Description |
|--------|-------------|
| User | Name + email |
| Connected | Date Zapier account was linked |
| Active Automations | Count of active Zaps |
| Last Activity | Last Zap execution timestamp |
| Actions | Revoke connection |

**Integration Policies:**
- Toggle: Allow all users to create automations (vs restrict to RiskManager only)
- Toggle: Require admin approval for new automations
- Allowed apps whitelist (optional — restrict which third-party apps can be connected)
- Task usage alerts (notify admin when org approaches Zapier task limits)

**Zapier Marketplace Embed:**
Zapier Workflow Element showing available templates and app directory for discovery:

```tsx
<zapier-workflow-element
  client-id="{ZAPIER_CLIENT_ID}"
  theme="light"
  sign-up-email="{user.email}"
  sign-up-first-name="{user.firstName}"
  sign-up-last-name="{user.lastName}"
/>
```

### 6.6 Data Model

#### Phase 1: Live Zapier API Calls (No Local Cache)

In Phase 1, we do NOT cache Zap data locally. The frontend fetches automation data live from Zapier via a backend proxy. This keeps the first iteration simple — no sync Lambda, no cache invalidation, no stale data.

**Backend proxy endpoints:**

```
GET /api/v1/automations/mine     → Fetch current user's Zaps from Zapier API
GET /api/v1/automations/all      → Fetch all org users' Zaps (admin only, iterates tokens)
PATCH /api/v1/automations/:id    → Toggle enable/disable (proxies to Zapier API)
DELETE /api/v1/automations/:id   → Delete a Zap (proxies to Zapier API)
```

Each endpoint reads the user's `zapier_access_token` from `zapier_user_tokens`, calls Zapier's `GET /v2/zaps`, and returns a mapped response.

**Zapier API response → Table row mapping:**

```typescript
interface AutomationRow {
  id: string;                    // from data[].id (Zapier zap UUID)
  title: string;                 // from data[].title
  isEnabled: boolean;            // from data[].is_enabled
  status: 'active' | 'paused';  // derived from is_enabled
  trigger: {                     // from data[].steps[0]
    appName: string;
    appIcon: string;
    event: string;
  };
  action: {                      // from data[].steps[1]
    appName: string;
    appIcon: string;
    event: string;
  };
  connectedApps: Array<{         // from all steps
    name: string;
    icon: string;
  }>;
  lastRun: string | null;        // from data[].last_successful_run_date
  updatedAt: string;             // from data[].updated_at
  editorUrl: string;             // from data[].links.html_editor
  ownerName?: string;            // added by backend for "All Automations" tab
  ownerUserId?: string;          // RiskSmart user_id who owns this Zap
}
```

#### Phase 2+: `automations` Cache Table (Future Optimisation)

When the live API approach becomes too slow (many users per org, Zapier rate limits), introduce the local cache table and sync Lambda. This is our local cache of Zapier Zap data, synced periodically. We store this locally so we can query across users for the admin view without needing every user's Zapier token at query time.

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL,                    -- risksmart user_id
  created_by_name TEXT,                        -- cached display name

  -- Zapier data (synced from Zapier API)
  zapier_zap_id TEXT NOT NULL UNIQUE,          -- Zapier's zap UUID
  title TEXT NOT NULL,                         -- Zap name
  status TEXT NOT NULL DEFAULT 'paused',       -- 'active' | 'paused' | 'error'
  is_enabled BOOLEAN DEFAULT false,

  -- Trigger step info (first step of the Zap)
  trigger_app_name TEXT,                       -- e.g., "RiskSmart"
  trigger_app_icon TEXT,                       -- URL to app icon
  trigger_event TEXT,                          -- e.g., "New Risk Created"

  -- Action step info (second step of the Zap)
  action_app_name TEXT,                        -- e.g., "Slack"
  action_app_icon TEXT,                        -- URL to app icon
  action_event TEXT,                           -- e.g., "Send Channel Message"

  -- All connected apps (for filtering + display)
  connected_apps JSONB DEFAULT '[]',           -- [{name, icon, slug}]
  step_count INTEGER DEFAULT 2,                -- total steps in the Zap

  -- Execution metrics
  last_successful_run_at TIMESTAMPTZ,
  task_count_30d INTEGER DEFAULT 0,            -- tasks consumed in rolling 30 days
  error_message TEXT,                          -- last error if status = 'error'

  -- Metadata
  zapier_editor_url TEXT,                      -- deep link to edit in Zapier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),         -- last sync from Zapier API

  CONSTRAINT fk_org FOREIGN KEY (org_id) REFERENCES auth.organisation(org_key)
);

-- RLS: tenant isolation
CREATE POLICY automation_tenant_isolation ON automations
  USING (org_id = current_setting('risksmart.org_key'));

-- Indexes
CREATE INDEX idx_automations_org ON automations(org_id);
CREATE INDEX idx_automations_user ON automations(org_id, created_by);
CREATE INDEX idx_automations_status ON automations(org_id, status);
```

### 6.7 Sync Strategy: Zapier → Local Cache

```
┌─────────────────────────────────────────────────────────┐
│  Automation Sync Lambda (runs every 5 minutes)          │
│                                                          │
│  1. Query zapier_user_tokens for all active tokens       │
│  2. For each token:                                      │
│     GET /v2/zaps (Zapier API, scoped to that user)      │
│  3. Upsert into automations table:                       │
│     - Map zapier_zap_id → existing row or INSERT         │
│     - Update status, last_successful_run_at, title       │
│     - Parse steps array → trigger/action info            │
│     - Set synced_at = NOW()                              │
│  4. Mark any automations not returned as 'deleted'       │
│  5. Aggregate task_count_30d from Zapier usage API       │
│                                                          │
│  Error handling:                                         │
│  - If token expired → mark connection as needs_reauth    │
│  - If rate limited → backoff and retry next cycle        │
│  - If Zapier down → keep stale data, set synced_at flag  │
└─────────────────────────────────────────────────────────┘
```

### 6.8 Permissions Model

```typescript
// New permission strings for automations
type AutomationPermissions =
  | 'read:automation'      // View own automations (all roles w/ contributor)
  | 'insert:automation'    // Create new automations (Standard, RiskManager)
  | 'update:automation'    // Edit/disable any automation + admin tabs (RiskManager)
  | 'delete:automation';   // Delete automations (RiskManager)

// Role mapping
const automationRolePermissions = {
  ReadOnly:         ['read:automation'],   // view own only (via contributor flag)
  Standard:         ['read:automation', 'insert:automation'],
  StandardEnhanced: ['read:automation', 'insert:automation'],
  RiskManager:      ['read:automation', 'insert:automation', 'update:automation', 'delete:automation'],
  CustomerSupport:  ['read:automation', 'update:automation'],
};
```

### 6.9 First-Time User Experience (Detailed UX Walkthrough)

This section describes exactly what the user sees and does when they use Automations for the first time.

#### Screen 1: Empty Automations Page

User clicks "Automations" in the left nav. They land on `/automations` with the "My Automations" tab active.

**What they see:**
- Page title: "Automations"
- "Add New Automation" primary button (top right)
- Empty state in the table: illustration + "You haven't created any automations yet. Click 'Add New Automation' to connect RiskSmart with your favourite tools."
- The "All Automations" and "Settings" tabs are only visible if the user is a RiskManager or Tech role

#### Screen 2: User Has No Credential (not enabled by admin)

User clicks "Add New Automation". The system checks whether this user has any automation credentials (`useZapierCredentials` calls `GET /api/v1/automations/my-credentials`).

**If the user has NO credentials assigned:**
→ "Add New Automation" button is disabled (greyed out)
→ Empty state with:
  - Message: "Automations haven't been enabled for your account yet."
  - **"Request Access" button** — opens RequestAccessModal where the user can write a short message to their admin explaining why they need automation access
  - On submit: backend stores the request and sends a Knock notification (email + in-app) to all RiskManager users in the org
  - Empty state updates to: "Access requested — waiting for admin approval."
→ If user is a RiskManager/Tech, they also see: "Go to Settings to create credentials for yourself or your team."

**If the user HAS one or more credentials assigned:**
→ Skip to Screen 3 (credential picker / template picker).

#### Screen 2b: Admin Creates Credential (Settings tab)

This is the admin-side flow. A RiskManager or Tech user navigates to **Automations → Settings**.

**What they see:**
- **"Pending Requests" section** (only shown if requests exist):
  - Table with columns: **User** | **Requested** | **Message**
  - Each row has "Approve" and "Deny" buttons
  - "Approve" opens the CreateAutomationCredentialModal pre-filled with the requesting user
  - "Deny" opens a small modal for an optional reason, then notifies the user via Knock
- **"Automation Credentials" table** (same Cloudscape table pattern as External API):
  - Columns: **User** | **Scopes** (summarised) | **Status** | **Created** | **Last Used**
  - Each row = one user's credential (a user may have multiple rows)
- "Add Automation Credential" button (top right, disabled if at org limit)

**Admin clicks "Add Automation Credential" (or "Approve" on a request):**
- `CreateAutomationCredentialModal` opens (same modal pattern as External API)
- **User picker dropdown** (required) — lists all org members. Pre-filled if approving a request.
- **Scope selector** — identical to the existing External API scope UI:
  - Quick actions: "Read All Resources" / "Write All Resources"
  - Or "Configure Custom" → ResourceSelector + ResourceActions with per-resource checkboxes (list, get, create, update, delete) and nested resource expandable sections
- Admin clicks "Create Credential"

**What happens behind the scenes:**
1. `POST /api/v1/automations/credentials` with `{ userId, scopes }`
2. Backend creates Cognito User Pool Client (`zapier-${orgId}-${userId}-${credentialIndex}`, admin-selected scopes)
3. Backend stores record in DynamoDB with user assignment
4. Backend generates `rs_zap_<random>` API key (hashed and stored; raw key available only to the assigned user)
5. If approving a request: request record updated to 'approved', Knock notification sent to user ("Your automation access has been approved")
6. Modal shows success: "Automation credential created for Jane Smith. They can now set up automations from their Automations page."
7. **Admin does NOT see the API key.** The key is only visible to the assigned user in their own credentials view.

**The assigned user's experience changes immediately:**
- Next time they visit Automations → "Add New Automation" is now enabled
- They can see and copy their API key(s) from their credentials section (see Screen 2c)
- Clicking "Add New Automation" initialises the Zapier embed

#### Screen 2c: User Views Their Connections (name + permissions only)

A "Your Connections" info panel appears above the automations table when the user has one or more credentials. This is read-only — the user sees friendly names and permission summaries, never raw keys.

**What they see:**
```
┌───────────────────────────────────────────────────────────┐
│  Your Automation Connections                              │
│                                                            │
│  ┌──────────┬────────────────────────────────┬────────┐  │
│  │ Name     │ Permissions                    │ Status │  │
│  ├──────────┼────────────────────────────────┼────────┤  │
│  │ Default  │ Risks (read), Actions          │ Active │  │
│  │          │ (read, write)                  │        │  │
│  ├──────────┼────────────────────────────────┼────────┤  │
│  │ Full Sync│ All resources (read, write)    │ Active │  │
│  └──────────┴────────────────────────────────┴────────┘  │
│                                                            │
│  ℹ️ Each connection has different permissions. When you    │
│     create an automation, you'll choose which one to use. │
│     Contact your admin to change permissions or add more. │
└───────────────────────────────────────────────────────────┘
```

No API keys. No reveal buttons. No copy buttons. No secrets of any kind.
The scopes are shown in human-readable format (not raw scope strings).

#### Screen 3: Connection Picker (if user has multiple credentials)

If the user has **exactly one** credential → skip this screen, auto-select it.

If the user has **multiple credentials** → show a picker before the template gallery:

**What they see:**
```
┌──────────────────────────────────────────────────────────┐
│  Choose a Connection                                     │
│                                                           │
│  Each connection has different permissions, which         │
│  determines what your automation can do.                  │
│                                                           │
│  ○ Default                                               │
│    Risks (read), Actions (read, write)                   │
│                                                           │
│  ○ Full Sync                                             │
│    All resources (read, write)                            │
│                                                           │
│  [ Cancel ]                              [ Continue ]     │
└──────────────────────────────────────────────────────────┘
```

User picks a **name** — they never see or think about API keys. Behind the scenes, the frontend calls `POST /api/v1/automations/init-embed` with the selected credential ID. The backend decrypts the API key, creates/retrieves a Zapier connection via the Workflow API, and returns an embed session. The Zapier Workflow Element opens with the RiskSmart connection already configured (see §2.5.8 for the full flow).

The selected credential determines which RiskSmart triggers/actions are available in the Zap editor. A read-only credential won't show write actions.

#### Screen 4: CreateAutomationModal (template picker)

After credential selection (or auto-selection), the template gallery opens.

**What they see:**
- Modal title: "Create New Automation"
- Search bar at top
- Category tabs: "All", "Notifications", "Ticketing", "Documents", "Data Sync", "DevOps"
- Grid of template cards, each showing:
  - Two app icons (e.g., RiskSmart logo + Slack logo)
  - Template name: "Notify Slack when a new risk is created"
  - Short description
  - "Use this" button
- Templates filtered to show only those compatible with the selected credential's scopes (e.g., if the credential only has `risks:read`, templates requiring `risks:write` are hidden or greyed out)
- At the bottom: "Build custom automation" link for advanced users
- The Zapier Workflow Element embed handles all of this rendering

#### Screen 5: Zap Editor (embedded Zapier)

User clicks "Use this" on a template (e.g., "New Jira issue → Create RiskSmart Action").

**What they see:**
The Zapier editor opens in a modal (or expands inline). It shows the Zap steps:

- **Step 1 (Trigger):** "Jira — New Issue" — user clicks "Connect Jira account" if not already connected. Zapier handles the entire Jira OAuth flow (popup → Jira login → consent → done). RiskSmart does NOT need to handle Jira auth.
- **Step 2 (Action):** "RiskSmart — Create Action" — already connected (green checkmark, labelled "Default" or whichever connection name the user selected). Shows pre-filled field mappings:
  - Action Title ← `{{Jira Issue Summary}}`
  - Description ← `{{Jira Issue Description}}`
  - Due Date ← `{{Jira Issue Due Date}}`
  - User can edit these mappings
- If the user has multiple credentials, a "Change connection" link lets them switch to a different one

- **"Turn on Zap" button** at the bottom

#### Screen 6: Automation Active

User clicks "Turn on Zap".

**What they see:**
- Success toast: "Automation created! New Jira issues will now create actions in RiskSmart."
- Modal closes
- The Automations table now shows 1 row:
  | Name | Status | Trigger | Action | Last Run | Updated |
  |------|--------|---------|--------|----------|---------|
  | New Jira issue → RiskSmart Action | Active (green badge) | Jira — New Issue | RiskSmart — Create Action | Never | Just now |

**Subsequent visits:** User returns to /automations and sees their automations listed. Clicking "Add New Automation" goes straight to Screen 4 (template picker) — no auth needed.

### 6.10 JWT Flow: How Zapier Calls tRPC (and why it works)

When a Zap fires and calls the RiskSmart REST API, the API key obtained during the setup flow (Screen 2 above) is resolved server-side to a Cognito JWT that flows through to the tRPC service. Here's the complete chain:

```
Zapier fires a Zap step (e.g., "Create Action in RiskSmart")
       │
       │  Uses the stored API key from the connect flow
       │
       ▼
HTTP Request:
  POST https://api.risksmart.com/api/v1/actions
  Authorization: Bearer rs_zap_a1b2c3d4...  ← RiskSmart API key
  Content-Type: application/json
  Body: { title: "Fix vulnerability", description: "..." }
       │
       ▼
┌─ External REST API (packages/external-api) ─────────────────┐
│                                                                │
│  1. NEW: zapier-auth.middleware.ts (runs before express-jwt)  │
│     - Detects rs_zap_ prefix on Bearer token                 │
│     - Looks up API key in DynamoDB:                           │
│       { api_key: "rs_zap_a1b2c3d4",                          │
│         org_id: "org_acme123",                                │
│         tenant_id: "acme",                                    │
│         user_id: "auth0|user456",                             │
│         cognito_client_id: "abc...",                          │
│         cognito_client_secret: "<encrypted>" }                │
│     - Exchanges cognito credentials for a fresh JWT:          │
│       POST {cognito_token_url} (client_credentials grant)     │
│       → Cognito pre-token Lambda injects org_id, tenant_id,  │
│         permissions, role, rl_profile claims                  │
│     - JWT cached server-side (1hr TTL, matching token expiry) │
│     - Replaces the rs_zap_ token with the real Cognito JWT   │
│       on req.headers.authorization                            │
│     - Injects user_id from API key lookup into req headers    │
│                                                                │
│  2. express-jwt middleware validates the Cognito JWT           │
│     - Checks signature against Cognito JWKS endpoint          │
│     - Verifies expiry, issuer                                 │
│     - Attaches decoded payload to req.auth                    │
│                                                                │
│  3. route-wrapper.auth.ts extracts claims:                    │
│     req.auth = {                                               │
│       org_id: "org_acme123",                                  │
│       tenant_id: "acme",                                      │
│       permissions: "risks:read,risks:write,actions:read,...", │
│       role: "rs-external",                                    │
│       rl_profile: "cruise",                                   │
│       source_service: "external-api"                          │
│     }                                                          │
│     ⚠️ If org_id OR tenant_id is missing → 401 Unauthorized  │
│                                                                │
│  4. service-context.ts builds the service context:            │
│     {                                                          │
│       actorId: "auth0|user456",  ← from API key user_id      │
│       orgId: "org_acme123",                                   │
│       tenantId: "acme",                                       │
│       authToken: "Bearer eyJhbG..."  ← Cognito JWT forwarded │
│     }                                                          │
│                                                                │
│  5. Route handler calls tRPC client:                          │
│     trpcClient.action.createAction.mutate(data, { context })  │
│                                                                │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ HTTP request to tRPC server
                         │ Authorization: Bearer eyJhbG... (Cognito JWT)
                         │
                         ▼
┌─ tRPC Service (packages/trpc) ──────────────────────────────┐
│                                                                │
│  6. context.ts decodes the JWT (jwtDecode, NOT re-validation) │
│     Extracts:                                                  │
│       ctx.user.orgId    = "org_acme123"                       │
│       ctx.user.userId   = "auth0|user456" (from header)      │
│       ctx.user.tenant   = "acme"                              │
│       ctx.user.isBackend = true (role: rs-external)           │
│                                                                │
│  7. tRPC resolver executes the mutation                       │
│     - Uses ctx.user.orgId for all data operations             │
│     - Hasura/PostgreSQL enforces RLS via org_key              │
│     - Action created in Acme's tenant only                    │
│                                                                │
│  RESULT: The action is created with full tenant isolation,    │
│  attributed to the correct user, in the correct org.          │
│  The Zapier user can only affect data in their own tenant.    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key points:**

1. **The API key is a thin proxy to Cognito.** The `zapier-auth.middleware.ts` transparently resolves `rs_zap_` API keys into real Cognito JWTs. From step 2 onwards, the request is indistinguishable from a normal external-api client_credentials request — all existing middleware works unchanged.

2. **The Cognito JWT contains everything needed.** The pre-token-generation Lambda injects `org_id`, `tenant_id`, `permissions`, `role`, and `rl_profile` into every Cognito JWT. This is the same claim structure all external-api requests use.

3. **Per-user attribution is preserved.** Even though the Cognito credential is org-level, each API key has a `user_id` associated. The middleware injects this into the request so `service-context.ts` can set `actorId` correctly. Audit logs show which user's Zap triggered the action.

4. **The REST API forwards the full Cognito JWT to tRPC.** `service-context.ts` extracts the `Authorization` header and passes it through. The tRPC HTTP link client sets `authorization: context.authorization` on every request.

5. **tRPC decodes (doesn't re-validate) the JWT.** The tRPC service trusts the REST API's validation and just decodes the token. Safe because the REST API validated the signature against Cognito's JWKS.

6. **Tenant isolation is enforced at every layer.** PostgreSQL RLS (`risksmart.org_key`) provides a final safety net — queries can only return data matching the session's org_key.

7. **Token refresh is invisible and automatic.** The server-side JWT cache (1hr TTL) means most requests use the cached token. When it expires, the middleware silently exchanges the Cognito credentials for a new one. No refresh token needed. No 90-day cliff. The API key never expires unless explicitly revoked.

**What about token expiry?** Unlike Auth0 OAuth where expired refresh tokens break Zaps, Cognito client_credentials tokens are re-fetched server-side on demand. The API key itself has no expiry — it lives until an admin revokes it. This eliminates the #1 support issue with Zapier integrations (stale tokens).

### 6.11 Feature Flag

```typescript
// Feature flag: 'automations'
// Registered in module settings (same as other feature modules)
// Gate: canViewAutomations && automationsEnabled && modulesEnabled
```

### 6.12 Key Patterns to Follow

| Pattern | Reference File | What to Copy |
|---------|---------------|-------------|
| Navigation menu item | `useNavItems.tsx` | Permission check + feature flag + icon |
| Page layout with table | `pages/actions/Page.tsx` | PageLayout + table + add button |
| Table column config | `pages/risks/config.tsx` | Field definitions, cell renderers |
| Tab system | `pages/controls/update/Page.tsx` | ControlledTabs with permission-gated tabs |
| Permission component | `rbac/Permission.tsx` | Conditional rendering by permission |
| OAuth hook | `hooks/useSlack.ts` | Nonce, authorize URL, callback, token exchange |
| Context provider | `providers/ExternalApiProvider.tsx` | API state management, token handling |
| Modal form | `pages/actions/ActionModal.tsx` | Modal wrapper + form pattern |
| Property filter | `utils/table/hooks/useGetStatelessTableProps.tsx` | Filtering, sorting, pagination |

---

## 7. Backend Implementation

### 7.1 New Packages/Files

```
packages/external-api/src/
├── routes/
│   ├── automations.routes.ts          # All automation endpoints (see below)
│   └── webhooks.routes.ts             # POST/DELETE/GET webhook subscriptions (Phase 2)
├── middleware/
│   └── zapier-auth.middleware.ts       # rs_zap_ API key → Cognito JWT resolver
├── services/
│   └── automations/
│       ├── automations.service.ts      # Credential CRUD, request handling
│       └── automations-knock.service.ts # Knock notification triggers

packages/drizzle/src/schema/
├── automations.ts             # Drizzle schema for automations cache table (Phase 2)

services/
├── webhook-dispatcher/        # Phase 2: EventBridge → HTTP webhook delivery
│   ├── handler.ts
│   ├── dispatcher.ts
│   └── signing.ts
├── automation-sync/           # Phase 2: Zapier API → automations table sync
│   ├── handler.ts
│   └── sync.ts

packages/web/src/
├── pages/automations/         # New top-level Automations page (see §6.3)
│   ├── Page.tsx
│   ├── config.tsx
│   ├── tabs/
│   │   ├── MyAutomationsTab.tsx
│   │   ├── AllAutomationsTab.tsx
│   │   └── SettingsTab.tsx
│   ├── modals/
│   │   ├── CreateAutomationCredentialModal.tsx  # Admin: user + scopes form
│   │   ├── RequestAccessModal.tsx               # User: request + message form
│   │   └── CredentialPickerModal.tsx            # User: multi-credential picker
│   ├── hooks/
│   │   ├── useZapierCredentials.ts    # Fetch user's credentials
│   │   ├── useZapierEmbed.ts          # Zapier Workflow Element init
│   │   └── useAccessRequests.ts       # Admin: pending requests
│   ├── providers/
│   │   └── AutomationsProvider.tsx    # State management (like ExternalApiProvider)
│   └── components/
│       ├── UserCredentialsPanel.tsx    # Screen 2c: user's connections (name + permissions, read-only)
│       └── PendingRequestsPanel.tsx   # Admin: request approval queue
```

**New REST API endpoints:**

```
# Admin credential management (requires RiskManager/Tech role)
POST   /api/v1/automations/credentials           # Create credential for a user
GET    /api/v1/automations/credentials            # List all org credentials (Settings table)
DELETE /api/v1/automations/credentials/:id        # Revoke a user's credential

# User self-service
GET    /api/v1/automations/my-credentials         # Fetch current user's credentials (name + scopes, NO keys)
POST   /api/v1/automations/init-embed             # Initialise Zapier embed for a credential (passes key programmatically)
POST   /api/v1/automations/request-access         # Submit access request + notify admins
GET    /api/v1/automations/request-status          # Check own request status

# Admin request handling
GET    /api/v1/automations/requests               # List pending requests (admin only)
POST   /api/v1/automations/requests/:id/deny      # Deny request + notify user

# Zapier auth (used by zapier-auth.middleware.ts internally)
GET    /api/v1/automations/me                     # Test endpoint for Zapier connection test
```

**Knock notification workflows (new):**

```yaml
# Knock workflow: automation-access-requested
# Triggered when: user submits access request
# Recipients: all RiskManager users in the org
# Channels: email, in-app (if configured)
# Template:
#   Subject: "{{user_name}} requested automation access"
#   Body: includes user name, email, message, deep link to Settings tab

# Knock workflow: automation-access-approved
# Triggered when: admin creates credential (approving a request)
# Recipients: the requesting user
# Channels: email, in-app
# Template:
#   Subject: "Your automation access has been approved"
#   Body: includes admin name, link to Automations page

# Knock workflow: automation-access-denied
# Triggered when: admin denies a request
# Recipients: the requesting user
# Channels: email, in-app
# Template:
#   Subject: "Automation access request update"
#   Body: includes optional denial reason, suggestion to contact admin
```

### 7.2 Infrastructure (CDK/SST)

```typescript
// stacks/EventStack.ts — add webhook dispatcher
const webhookDispatcher = new Function(stack, 'WebhookDispatcher', {
  handler: 'services/webhook-dispatcher/handler.main',
  timeout: '30 seconds',
  environment: {
    WEBHOOK_SUBSCRIPTIONS_TABLE: '...', // or use PostgreSQL directly
  },
});

// Subscribe to all DataChanged events
eventBus.addRule('WebhookDispatcherRule', {
  pattern: { detailType: ['DataChanged'] },
  targets: [new LambdaFunction(webhookDispatcher)],
});

// Dead letter queue for failed deliveries
const webhookDLQ = new Queue(stack, 'WebhookDLQ', {
  retentionPeriod: '14 days',
});
```

### 7.3 Zapier Credential Storage (DynamoDB)

> **Updated: Per-user credentials with admin-assigned scopes (see §2.5.3)**

```typescript
// Extends the EXISTING external-api DynamoDB table (same table, new sort key prefix)
// Each record = one user's automation credential (Cognito client + API key)

interface ZapierCredentialRecord {
  pk: string;      // #${tenantId}#${orgId}  — same partition as external-api creds
  sk: string;      // #zapier#${cognitoClientId}

  // User assignment (NEW — external-api creds don't have this)
  userId: string;       // Auth0 user ID of the assigned user
  userName: string;     // Cached display name (for admin table)
  userEmail: string;    // Cached email (for Zapier QuAC)

  // Cognito client (same pattern as external-api)
  cognitoClientId: string;
  cognitoClientSecret: string;  // encrypted (KMS)
  clientName: string;           // "zapier-${orgId}-${userId}"

  // API key (what Zapier holds — user never sees it)
  apiKeyEncrypted: string;  // KMS-encrypted rs_zap_<random> (decryptable for Workflow API delivery)
  apiKeyHash: string;       // SHA-256 hash of rs_zap_<random> (for fast GSI lookup on inbound requests)
  // NOTE: raw API key is NEVER shown to any user. It is decrypted server-side
  // only when creating/refreshing a Zapier connection via the Workflow API (§2.5.8).

  // Scopes (admin-selected)
  scopes: string;       // comma-separated, e.g., "risks:read,actions:write"

  // Metadata
  status: 'active' | 'revoked';
  role: 'rs-external';
  rateLimitProfile: 'cruise' | 'turbo';
  createdAt: number;
  createdBy: string;    // Admin who created this credential
  lastUsedAt: number;   // Updated by zapier-auth.middleware.ts
  revokedAt?: number;
  revokedBy?: string;

  // GSI for API key lookup (hot path on every Zap request)
  gsi_1_pk: string;     // "active" (or "revoked")
  gsi_1_sk: string;     // apiKeyHash
}

// GSI query on every inbound Zapier request (zapier-auth.middleware.ts):
//   gsi_1_pk = "active" AND gsi_1_sk = SHA256(rs_zap_xxx)
//   → Returns: cognitoClientId, cognitoClientSecret, userId, orgId, tenantId, scopes
//
// Programmatic key delivery (init-embed endpoint, §2.5.8):
//   Reads apiKeyEncrypted → KMS.decrypt → passes raw key to Zapier Workflow API
//   → Creates/refreshes Zapier connection with key pre-filled

// Admin list query (Settings tab):
//   pk = "#${tenantId}#${orgId}" AND sk BEGINS_WITH "#zapier#"
//   → Returns all automation credentials for this org
```

**Server-side JWT cache:**
```typescript
// In-memory cache (e.g., node-cache or Map with TTL)
// Key: cognitoClientId (each user has their own Cognito client)
// Value: { jwt: string, expiresAt: number }
// TTL: 55 minutes (5 min before 1hr token expiry)
// Each user's JWT is cached independently (different scopes per user)
```

---

## 8. Zapier Developer Platform Setup

### 8.1 Prerequisites

1. Apply to the [Zapier Integration Partner Program](https://zapier.com/developer-platform)
2. Create the RiskSmart integration app on Zapier
3. Pass Zapier's app review process (Beta → Public)
4. Create and publish Zap templates
5. Get embed domains approved (app.risksmart.com, *.risksmart.com)

### 8.2 Zapier App Configuration

```yaml
# zapier-app/.zapierapprc
name: RiskSmart
description: Enterprise GRC platform for governance, risk, and compliance management.
category: Business Intelligence
logo: risksmart-logo.png

authentication:
  type: custom  # API key auth (see §2.5 and §4.1)
  # API key is resolved server-side to Cognito JWT
  # No OAuth flow, no token refresh needed on Zapier side

triggers: 0   # Phase 1a: none. Phase 2: polling triggers planned.
actions: 6    # Phase 1a: create/update/delete for risks + indicators.
searches: 28  # Phase 1a: find-by-ID, list, find-by-owner, enrichment.
```

### 8.3 Embed Configuration

```yaml
# Workflow Element config (from Zapier Developer Platform settings)
client_id: {provided by Zapier}
allowed_domains:
  - app.risksmart.com
  - *.risksmart.com
  - localhost:3000  # development
branding:
  primary_color: "#1A73E8"  # RiskSmart blue
  logo: risksmart-logo.svg
quick_account_creation: enabled
```

### 8.3.1 Embed Setup TODO

As of Feb 2026, the RiskSmart (Dev) integration (app ID `199655`) is **Private**. All three Zapier embed approaches require the integration to be published before credentials are available. The embed page is at `developer.zapier.com/app/199655/embed`.

#### Current State

The `ZapierEmbed` component (`packages/web/src/pages/automations/components/ZapierEmbed.tsx`) has three modes:
1. **No `REACT_APP_ZAPIER_CLIENT_ID`** (current) — Shows a placeholder with a "Create Zap on Zapier.com" button that opens the Zapier editor in a new tab. Users search for "RiskSmart (Dev)" to build Zaps. This works now with a Private integration (users must be invited via the Sharing page).
2. **`REACT_APP_ZAPIER_CLIENT_ID` set** — Loads the Zapier Partner SDK and renders the `<zapier-workflow>` Workflow Element inline.
3. **Script load failure** — Shows an error message.

The `useZapierConnection` hook listens for `zap:unpause`, `zap:pause`, and their `:done`/`:fail` postMessage events from the Workflow Element.

#### Embed Approach Options (review when ready to publish)

| Approach | Auth | Requires Published App | Complexity | Notes |
|----------|------|----------------------|------------|-------|
| **Workflow Element** | `client-id` only (no backend) | Beta+ | Low | Drop-in `<zapier-workflow>` web component. Generated via code generator at `zapier.com/partner/embed/workflow`. Requires Zap Templates. |
| **Workflow API** | `client_id` + `client_secret` + full OAuth 2.0 auth code flow | Public | High | Custom UI, server-side token exchange (`api.zapier.com/v2/authorize` → `zapier.com/oauth/token/`). Tokens expire 10h, refresh tokens must be stored server-side (HTTPOnly cookies or DB). Scopes: `zap`, `zap:write`, `authentication`. |
| **Client ID query param** | `client-id` as `?client_id=` | Public | Low | Limited to read-only endpoints (zap-templates only). Not sufficient for Zap creation. |

All credentials (`client_id`, `client_secret`) are found under **Embed > Settings > Credentials** in the Zapier Developer Platform, only available after publishing.

**Recommendation:** Start with the Workflow Element (simplest). Upgrade to Workflow API only if deeper UI customisation is needed.

#### Steps to Unblock Embed

- [ ] **Publish the integration to Beta** — Navigate to `developer.zapier.com/app/199655/publishing` and submit for review. Ensure all 6 actions and 28 searches pass `zapier validate` before submitting.
- [ ] **Create Zap Templates** — Required before the Workflow Element can be embedded. Create at least 5 starter templates via `developer.zapier.com/zap-templates`:
  - New Risk → Slack notification
  - New Issue → Jira ticket
  - New Action → Microsoft Teams message
  - New Control test failure → Email alert
  - Weekly risk summary → Google Sheets row
- [ ] **Retrieve the embed `client-id`** — Once published (Beta+), revisit `developer.zapier.com/app/199655/embed`. The Workflow Element code generator will show the `client-id`. Store as `REACT_APP_ZAPIER_CLIENT_ID` in `packages/web/.env`.
- [ ] **Allowlist embed domains** — In the Developer Platform under Embed > Settings, add:
  - `app.risksmart.com` (production)
  - `*.risksmart.com` (staging/dev)
  - Use an ngrok or tunnel URL for local development (localhost is not supported by Zapier)
- [ ] **Test the embedded Workflow Element** — Set `REACT_APP_ZAPIER_CLIENT_ID` in `.env`. The `ZapierEmbed` component will automatically switch from the placeholder to the real `<zapier-workflow>` element. Verify Zap creation and postMessage events (`zap:unpause:done`, `zap:pause:done`) work end-to-end.
- [ ] **Decide on Workflow API upgrade** — If the Workflow Element is too limited (e.g. need custom Zap creation UI, programmatic Zap management), plan the OAuth 2.0 server-side integration. This requires backend changes (token exchange endpoint, refresh token storage in DynamoDB).

### 8.4 Pre-Development Zapier Account Setup Checklist

Before writing any code, complete these steps on the Zapier test account:

#### Step 1: Developer Platform Access (Day 1)

1. Log into the test Zapier account at zapier.com
2. Navigate to **developer.zapier.com** (or Profile → Developer Platform)
3. Click **"Create an App"**:
   - Name: `RiskSmart (Dev)`
   - Description: `Enterprise GRC platform — development build`
   - Category: `Business Intelligence`
   - Logo: Upload RiskSmart logo (PNG, min 256×256)
4. Note the **App ID** (auto-generated) — store in `.env` as `ZAPIER_APP_ID`

#### Step 2: Deploy Key for CLI (Day 1)

1. Go to **developer.zapier.com/partner-settings/deploy-keys**
2. Click **"Create Deploy Key"**
3. Copy and store securely — this authenticates the Zapier CLI
4. Store as `ZAPIER_DEPLOY_KEY` in a team secrets vault (not `.env` — it's personal)

#### Step 3: Install & Authenticate Zapier CLI (Day 1)

```bash
# Install globally (Node.js 20+ required — matches our runtime)
npm install -g zapier-platform-cli

# Authenticate (uses deploy key from Step 2)
zapier login
# Enter deploy key when prompted

# Verify
zapier whoami
```

#### Step 4: Scaffold the Integration App (Day 1)

```bash
# Create the Zapier app as a monorepo package
mkdir -p packages/zapier-app && cd packages/zapier-app
zapier init . --template=minimal

# Replace npm with pnpm (monorepo convention)
rm package-lock.json
pnpm install

# Update package.json name to match monorepo scope
# "name": "@risksmart-app/zapier-app"

# Link to the app created in Step 1
zapier link
# Select the "RiskSmart (Dev)" app from the list

# Verify
zapier describe
```

> **Repo decision:** The Zapier integration app lives inside the monorepo as
> `packages/zapier-app` (scoped as `@risksmart-app/zapier-app`). This gives us:
>
> - **Shared types:** Import API response schemas from `@risksmart-app/shared`
>   so trigger/action output shapes stay in sync with the REST API.
> - **Shared test data:** Reuse builders from `@risksmart-app/test-data` for
>   Zapier app tests.
> - **Atomic PRs:** An API contract change + the matching Zapier trigger update
>   ship in a single PR — no cross-repo coordination.
> - **Turborepo dependency graph:** `zapier-app` declares `@risksmart-app/shared`
>   as a dependency → Turborepo rebuilds it when shared types change.
> - **Consistent tooling:** Same pnpm, Vitest, TypeScript config, lint rules.
> - **Precedent:** `packages/integrations` (n8n) already follows this pattern.
>
> The Zapier CLI (`zapier push`) runs from the package directory. Zapier's
> infrastructure executes the uploaded bundle in Node.js v22 — this is fine
> because `zapier push` bundles the package into a standalone archive.

#### Step 5: Configure Authentication (Day 1–2)

In the Zapier app project, configure `authentication` in `index.js`:

```javascript
// index.js (Zapier app entry point)
const authentication = {
  type: 'custom',
  test: {
    url: '{{bundle.authData.api_base_url}}/api/v1/me',
    method: 'GET',
    headers: {
      'x-api-key': '{{bundle.authData.api_key}}',
    },
  },
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'password',
      required: true,
      helpText:
        'Your RiskSmart automation API key. Go to **Automations** in RiskSmart — your key is configured automatically when you connect.',
    },
    {
      key: 'api_base_url',
      label: 'API Base URL',
      type: 'string',
      required: true,
      default: 'https://api.risksmart.com',
      helpText: 'Leave as default unless instructed otherwise.',
    },
  ],
  connectionLabel: (z, bundle) => {
    return bundle.inputData.name || 'RiskSmart';
  },
};
```

Test locally:
```bash
# Set up local auth data in .env for testing
zapier invoke auth start
# Enter: api_key=rs_zap_test123, api_base_url=http://localhost:3200

# Test auth
zapier invoke auth test
```

#### Step 6: Create First Trigger (Day 2)

```javascript
// triggers/new_risk.js
const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.api_base_url}/api/v1/risks`,
    method: 'GET',
    headers: { 'x-api-key': bundle.authData.api_key },
    params: {
      sort: '-CreatedAtTimestamp',
      limit: 100,
    },
  });
  return response.data.data; // Array of risks
};

module.exports = {
  key: 'new_risk',
  noun: 'Risk',
  display: {
    label: 'New Risk',
    description: 'Triggers when a new risk is created.',
  },
  operation: {
    perform,
    sample: {
      id: 'sample-risk-id',
      title: 'Sample Risk',
      description: 'A sample risk for testing',
      treatment: 'Mitigate',
      tier: 1,
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
};
```

Test locally:
```bash
zapier invoke trigger new_risk
```

#### Step 7: Deploy to Zapier (Day 2)

```bash
# Validate the app
zapier validate

# Push to Zapier (creates a new version)
zapier push

# Promote to make available for testing
zapier promote 1.0.0

# Invite test users (by email)
zapier users:add user@risksmart.com --version=1.0.0
```

#### Step 8: Workflow Element / Embed Setup (Week 3+)

> **Important:** The Workflow Element requires the app to be **published**
> (at minimum Beta stage). This means completing Zapier's app review process.

1. Submit app for review: `zapier promote 1.0.0` → Zapier reviews (1–2 weeks)
2. Once approved as **Beta**, go to Developer Platform → **Embed** → **Settings**
3. Note the **Client ID** and **Client Secret** (for Workflow API OAuth)
4. Add **Redirect URIs**: `https://app.risksmart.com/automations/callback`, `http://localhost:3000/automations/callback`
5. Add **Allowed Domains**: `app.risksmart.com`, `*.risksmart.com`, `localhost:3000`
6. Store credentials:
   ```
   ZAPIER_EMBED_CLIENT_ID=<from Embed settings>
   ZAPIER_EMBED_CLIENT_SECRET=<from Embed settings>
   ```

#### Step 9: Zap Templates (Week 3+)

1. In developer.zapier.com → **Templates**
2. Create templates using the published triggers/actions
3. Submit each template for review (Zapier reviews template quality)
4. Templates become available in the Workflow Element once approved

### 8.5 Environment Variables Summary (New)

Add to `.env.example`:

```bash
# --- Zapier Integration ---
# Zapier Developer Platform
ZAPIER_APP_ID=                          # From developer.zapier.com (auto-generated)

# Workflow Element / Embed (available after app is published as Beta)
ZAPIER_EMBED_CLIENT_ID=                 # From Developer Platform → Embed → Settings
ZAPIER_EMBED_CLIENT_SECRET=             # From Developer Platform → Embed → Settings

# Zapier Credential Encryption (KMS key for API key encryption/decryption)
ZAPIER_KMS_KEY_ARN=                     # AWS KMS key ARN for encrypting rs_zap_ API keys

# DynamoDB Table (reuses existing pattern)
ZAPIER_CREDENTIALS_TABLE=zapier-credentials-tbl

# Knock Notification Workflows (IDs from Knock dashboard)
KNOCK_WORKFLOW_ZAP_CRED_REQUESTED=zapier-credential-requested
KNOCK_WORKFLOW_ZAP_CRED_APPROVED=zapier-credential-approved
KNOCK_WORKFLOW_ZAP_CRED_DENIED=zapier-credential-denied
```

---

## 9. Implementation Phases

### Phase 1a: Closed Beta ✅ (Complete)

**Delivered:** Zapier app + Automations page + module system.

| Deliverable | Status |
|-------------|--------|
| Zapier app registered on Developer Platform (App ID 199655, Private) | ✅ Complete |
| Session-based auth (client key + secret → token exchange) | ✅ Complete |
| 6 actions: create/update/delete for risks and indicators | ✅ Complete |
| 28 searches: find-by-ID, list, find-by-owner, enrichment | ✅ Complete |
| Dynamic custom fields (`src/fields/custom-fields.ts`) | ✅ Complete |
| Rate-aware request wrapper (`src/utils/rate-aware-request.ts`) | ✅ Complete |
| API contract snapshot validation (`api-contract.snapshot.json`) | ✅ Complete |
| Full test suite (actions, searches, auth, fields, utils, contract) | ✅ Complete |
| `/automations` page with 4 integration cards (Zapier, MCP, REST API, Slack) | ✅ Complete |
| `integrations` module in module system with sub-module toggles | ✅ Complete |
| `ZapierEmbed` component scaffolded (fallback mode, ready for client ID) | ✅ Complete |
| `useZapierConnection` hook (postMessage event handling) | ✅ Complete |

**Phase 1a Exit Criteria (all met):**
- [x] Zapier app registered and functional on Zapier Developer Platform
- [x] 6 actions and 28 searches working end-to-end
- [x] `/automations` page live with card-based integration hub
- [x] Module system controlling feature visibility per-org
- [x] ZapierEmbed component ready for client ID activation
- [x] API contract snapshot tracked and validated in CI

### Phase 1b: Powered by Zapier Embed + Two-Mode Auth (Next)

**Goal:** Activate the full embedded Zapier experience with both auth modes. See §1B and §2.3 for full details.

| Task | Owner | Dependencies |
|------|-------|-------------|
| Submit Zapier app for Beta review | Product | Ensure `zapier validate` passes |
| Receive embed `client_id` from Zapier | Product | App reaches Beta+ status |
| Whitelist RiskSmart domains in Zapier Developer Platform | Product | Embed credentials available |
| **Mode 1 (BYOA):** Make app public in Zapier App Directory | Product | App approved as Beta+ |
| **Mode 1 (BYOA):** Verify session auth works from zapier.com (no embed needed) | QA | App public |
| Set `REACT_APP_ZAPIER_CLIENT_ID` env var | DevOps | Client ID received |
| Add QuAC attributes to `ZapierEmbed` component | Frontend | Client ID set |
| Replace `ZapierIntegrationModal` with embedded Workflow Element | Frontend | Client ID set |
| **Mode 2 (Managed):** Build OAuth callback endpoint (`/api/v1/automations/zapier/callback`) | Backend | Embed client ID |
| **Mode 2 (Managed):** Build `zapier_user_tokens` table (org_id, user_id, zapier_access_token) | Backend | None |
| **Mode 2 (Managed):** Implement `/v2/authorize` popup flow in `/automations` page | Frontend | OAuth callback ready |
| **Mode 2 (Managed):** Bridge RiskSmart auth via `POST /v2/authentications` | Backend | OAuth token stored |
| Create 10+ Zap templates and submit for review | Product | App in Beta |
| Add pre-filled Zap links from entity detail pages | Frontend | Templates approved |
| Wire up postMessage events for toast notifications | Frontend | Embed working |

**Phase 1b Exit Criteria:**
- [ ] Zapier app approved as Beta (or Public) in App Directory
- [ ] **Mode 1:** Users can find RiskSmart on zapier.com and connect with External API credentials
- [ ] **Mode 2:** "Connect Zapier" flow creates/links Zapier account via `/v2/authorize`
- [ ] **Mode 2:** `POST /v2/authentications` bridges RiskSmart connection automatically
- [ ] Embed `client_id` set and Workflow Element rendering inline
- [ ] QuAC working — users create Zaps without separate Zapier signup
- [ ] 10+ Zap templates published and surfaced in embed
- [ ] Pre-filled Zap links on entity detail pages
- [ ] postMessage events triggering toast notifications for Zap status changes

### Phase 2: Pre-Filled Zaps + Polling Triggers + Webhook System

| Task | Owner |
|------|-------|
| **Pre-filled Zaps:** Use `POST /v2/authentications` to pre-configure RiskSmart connections | Backend |
| **Pre-filled Zaps:** Build pre-filled Zap template URLs with entity context from detail pages | Frontend |
| **Pre-filled Zaps:** Programmatic Zap creation via `POST /v2/zaps` (one-click automation) | Backend |
| Build polling triggers for key entity types (risks, controls, actions, issues, indicators) | Backend |
| Re-enable `dynamic` dropdown fields on all searches and actions (commented out — requires polling triggers to exist, see D005) | Backend |
| Design and build outbound webhook system (EventBridge → HTTP dispatcher, HMAC signing) | Backend |
| Build `automations` cache table (PostgreSQL) and automation-sync Lambda | Backend |
| Build My Automations / All Automations table register views | Frontend |
| Add write endpoints for remaining entities (actions, issues, third-parties, assessments) | Backend |
| Build Super Zap templates (multi-step orchestrated workflows per §17) | Backend |

### Phase 3: Native Deep Integrations

| Task | Owner |
|------|-------|
| Integration framework: OAuth token vault, Lambda scheduler, evidence ingestion pipeline | Backend |
| Cloud integrations: AWS Security Hub, Azure Defender, GCP Security Command Center | Backend |
| Identity + DevOps: Okta, Entra ID, GitHub, Jira native integrations | Backend |
| Integration management UI, sync status dashboards, evidence mapping config | Frontend |

### Phase 4: AI Agents + Workflow API (Fully Branded UI)

| Task | Owner |
|------|-------|
| Agent orchestration framework: Step Functions, MCP tool definitions, approval workflow | Backend |
| Evidence Collector agent + Compliance Monitor agent | AI/ML |
| Risk Assessor agent + Vendor Risk Analyst agent | AI/ML |
| Agent dashboard UI, activity logs, approval queues, customer pilot | Frontend |
| Migrate from Workflow Element to Workflow API for fully branded UI (if needed) | Full-stack |
| Integration analytics, usage dashboards, billing integration | Full-stack |

---

## 10. Pricing Considerations

### Zapier Costs

- **Zapier Partner Embed** pricing is per-customer, based on task volume
- Each customer's free Zapier account has limited tasks/month
- Need to negotiate **partner pricing** with Zapier sales for volume discounts
- Options:
  - **Pass-through:** Customer pays for their own Zapier plan (lowest risk for RiskSmart)
  - **Bundled:** RiskSmart pays Zapier, bundles cost into subscription tiers (better UX)
  - **Hybrid:** Include X tasks/month free, customer upgrades Zapier for more

### Action Item

Contact Zapier partner sales with:
- Estimated customer count (current + projected)
- Estimated tasks/month per customer
- Request partner pricing for bundled embed

---

## 11. Security Considerations

- **Webhook HMAC signing:** All outbound webhooks signed with per-subscriber secret
- **Token encryption:** Zapier access tokens encrypted at rest in database
- **JWT scope enforcement:** REST API enforces org_id/tenant_id from JWT on every request
- **RLS isolation:** PostgreSQL row-level security prevents cross-tenant data access
- **Webhook URL validation:** Only accept HTTPS URLs for webhook subscriptions
- **Rate limiting:** Existing rate limiting on REST API applies to Zapier traffic
- **Audit logging:** All webhook subscriptions and Zap connections logged in audit trail
- **Token revocation:** Admins can revoke Zapier connections via Auth0 app management

---

## 12. Competitive Positioning vs Complyance

| Capability | Complyance | RiskSmart (Post Phase 4) |
|-----------|-----------|--------------------------|
| Native integrations | ~100 deep integrations | 8–10 deep + 8,000 via Zapier |
| Integration breadth | Limited to built integrations | Unlimited via Zapier ecosystem |
| AI Agents | 30+ domain-specific agents | 5 high-value agents (expandable) |
| Setup friction | Connect + auto-evidence | Connect via Zapier (1-click) + native |
| Customisation | Pre-built only | Pre-built templates + fully custom Zaps |
| Pricing | Included in subscription | TBD (negotiate Zapier partner pricing) |
| Time to market | Already live | Phase 1: 6 weeks, Full: 28 weeks |

**RiskSmart's advantage:** Zapier gives instant access to 8,000+ apps that Complyance would need to build individually. The trade-off is depth — Complyance's native integrations pull richer evidence data. Our hybrid strategy (Zapier for breadth + native for depth) covers both.

---

## 13. Open Questions

### Resolved (Phase 1a)

- [x] **Auth approach (Phase 1a):** Decided on session-based auth (client key + secret → token exchange via `/api/v1/auth/token`) for the Zapier app itself. This is what users enter in Zapier to connect to RiskSmart.
- [x] **Auth approach (Phase 1b):** Decided on two-mode auth — Mode 1 (BYOA: user's own Zapier account + existing External API credentials) and Mode 2 (Managed: RiskSmart creates Zapier accounts via `/v2/authorize` OAuth, bridges RiskSmart auth via `POST /v2/authentications`). Replaces the original Cognito admin-assigned credential system (§2.5). See §2.3 for full details.
- [x] **Frontend page structure:** Card-based integration hub with 4 cards (Zapier, MCP Server, REST API, Slack) rather than the table-register + tabs approach from §6.3–6.5. Simpler first pass.
- [x] **Module system vs feature flag:** Using the `integrations` module in the module system with sub-modules per integration type, not a simple feature flag. More granular per-org control.
- [x] **REST API write endpoints (Phase 1):** Shipped create/update/delete for risks and indicators. Other entities deferred to Phase 2.
- [x] **Zapier app location:** Monorepo package at `packages/zapier-app` (confirmed, working well).

### Open — Phase 1b (Embed + Two-Mode Auth)

- [ ] **Zapier app review timeline:** How long will Private → Beta review take? Submit and track. Typically 2–4 weeks.
- [ ] **Zap template strategy:** Which 10–20 templates should we create first? Need to align with customer use cases. See §5.1 for candidates.
- [ ] **QuAC user data sourcing:** Confirm Auth0 `useAuth0()` hook provides `email`, `given_name`, `family_name` in all cases (including SSO users). Check edge cases.
- [ ] **Embed domain setup:** Confirm `*.risksmart.com` wildcard works in Zapier's domain allowlist, or if each subdomain needs explicit registration.
- [ ] **Zapier commercial deal for Mode 2 billing:** Mode 2 (Managed) means RiskSmart pays for Zapier task usage. Need to negotiate a partner pricing agreement with Zapier sales before launching Mode 2.
- [ ] **`POST /v2/authentications` field format:** Can `POST /v2/authentications` accept session auth fields (`client_key` + `client_secret` + `api_base_url`) or only simple API key style fields? Need to verify against the Workflow API docs and test with our app's auth configuration.

### Open — Longer Term

- [ ] **AI agent LLM costs:** What's the per-tenant cost of running background agents? Need to model.
- [ ] **Workflow API vs Element:** At what point does the branding trade-off justify the Workflow API investment? Revisit after Phase 1b.
- [ ] **Native integration priority:** Which evidence sources matter most for ISO 27001 / SOC 2 / NIST compliance?
- [ ] **MCP server alignment:** How do we ensure the existing MCP server capabilities align with AI agent tool needs?
- [ ] **Super Zap priority:** Which of the 6 Super Zaps (§17.2) are most valuable to customers? Validate with customer interviews.
- [ ] **Custom field performance:** Does `?expand=customFields` on large orgs (1000+ risks, 50+ custom fields) perform acceptably for Zapier polling triggers? Load test needed.
- [ ] **Rate limit profile for Zapier:** Should Zapier credentials default to `cruise` or should admins choose per-credential?
- [ ] **`openapi-typescript` for auto-generated types (post-Phase-1b):** Evaluated and recommended for adoption after Phase 1b ships. Would replace ~150 lines of `Record<string, unknown>` with generated types from the OpenAPI spec. Complements (does not replace) the existing contract snapshot validation. Setup ~2-4h, refactoring ~4-8h. Revisit before triggers ship (Phase 2) since triggers add complex bidirectional typing.

---

## 14. Key Files in Codebase

Reference these when implementing:

### Existing files to reference (patterns to follow)

| Area | File | Why It Matters |
|------|------|----------------|
| Navigation menu | `packages/web/src/routes/useNavItems.tsx` | Add Automations nav item here — follow permission + feature flag pattern |
| Route config | `packages/web/src/routes/routes.config.tsx` | Add automationRoutes here |
| Example route config | `packages/web/src/routes/actionRoutes.config.tsx` | Pattern for sub-routes with tabs |
| Table register page | `packages/web/src/pages/actions/Page.tsx` | Pattern for PageLayout + table + add button |
| Table register page | `packages/web/src/pages/risks/Page.tsx` | Pattern for table with property filter ribbon |
| Table column config | `packages/web/src/pages/risks/config.tsx` | Pattern for field definitions + cell renderers |
| Tab system | `packages/web/src/hooks/useTabs.tsx` | Tab definitions + feature flags |
| Detail page with tabs | `packages/web/src/pages/controls/update/Page.tsx` | ControlledTabs pattern |
| Modal form | `packages/web/src/pages/actions/ActionModal.tsx` | Modal wrapper + form pattern |
| Table props | `packages/web/src/utils/table/hooks/useGetStatelessTableProps.tsx` | Filtering, sorting, pagination |
| OAuth hook | `packages/web/src/hooks/useSlack.ts` | OAuth flow pattern (nonce, authorize, callback) |
| Context provider | `packages/web/src/providers/ExternalApiProvider.tsx` | API state management, token handling |
| Permission component | `packages/web/src/rbac/Permission.tsx` | Conditional rendering by permission |
| Permission hook | `packages/web/src/rbac/useHasPermission.ts` | `useHasPermissionQuery()` |
| Roles | `packages/web/src/rbac/roles.ts` | Role definitions |
| Auth0 frontend | `packages/web/src/AuthProvider.tsx` | Auth0 React provider config |
| REST API entry | `packages/external-api/src/app.ts` | API routing, middleware |
| Auth | `packages/external-api/src/auth/client-jwt.auth.ts` | JWT validation, multi-issuer |
| API routes | `packages/external-api/src/routes/` | All REST endpoints |
| External API tab | `packages/web/src/pages/settings/tabs/external-api/` | Existing API credential mgmt |
| Event infrastructure | `stacks/EventStack.ts` | EventBridge rules + Lambda targets |
| DB schema | `packages/drizzle/src/schema.ts` | Drizzle ORM schema definitions |
| Env config | `.env.example` | All environment variables |

### New files to create

| Area | File | Purpose |
|------|------|---------|
| Route config | `packages/web/src/routes/automationRoutes.config.tsx` | Route definitions for /automations/* |
| Main page | `packages/web/src/pages/automations/Page.tsx` | PageLayout + ControlledTabs (3 tabs) |
| Table config | `packages/web/src/pages/automations/config.tsx` | Column definitions for automations table |
| My Automations tab | `packages/web/src/pages/automations/tabs/MyAutomationsTab.tsx` | User's own Zaps table register |
| All Automations tab | `packages/web/src/pages/automations/tabs/AllAutomationsTab.tsx` | Org-wide Zaps (admin) |
| Settings tab | `packages/web/src/pages/automations/tabs/SettingsTab.tsx` | Connection mgmt + policies |
| Create modal | `packages/web/src/pages/automations/modals/CreateAutomationModal.tsx` | Template picker + Zapier embed |
| Connect modal | `packages/web/src/pages/automations/modals/ZapierConnectModal.tsx` | First-time OAuth flow |
| Zapier hook | `packages/web/src/pages/automations/hooks/useZapier.ts` | Zapier OAuth (based on useSlack) |
| Connection hook | `packages/web/src/pages/automations/hooks/useZapierConnection.ts` | Check/manage Zapier connection |
| Automations hook | `packages/web/src/pages/automations/hooks/useAutomations.ts` | Fetch automations from backend |
| Provider | `packages/web/src/pages/automations/providers/AutomationsProvider.tsx` | Zapier state context |
| Status badge | `packages/web/src/pages/automations/components/AutomationStatusBadge.tsx` | Active/Paused/Error badge |
| App icons | `packages/web/src/pages/automations/components/ConnectedAppIcons.tsx` | Connected app icon display |
| Zapier embed | `packages/web/src/pages/automations/components/ZapierEmbed.tsx` | Workflow Element wrapper |
| DB schema | `packages/drizzle/src/schema/automations.ts` | Automations table (Drizzle) |
| DB schema | `packages/drizzle/src/schema/zapier-tokens.ts` | Zapier user tokens (Drizzle) |
| REST route | `packages/external-api/src/routes/automations.ts` | GET automations endpoint |
| Sync Lambda | `services/automation-sync/handler.ts` | Scheduled Zapier → DB sync |
| Webhook route | `packages/external-api/src/routes/webhooks.ts` | Webhook subscription endpoints |
| Dispatcher Lambda | `services/webhook-dispatcher/handler.ts` | EventBridge → HTTP fan-out |
| **Zapier App** | `packages/zapier-app/` | **Monorepo package** — Zapier integration app |
| Zapier entry | `packages/zapier-app/src/index.ts` | App definition (auth + actions + searches) |
| Zapier action | `packages/zapier-app/src/actions/` | Action implementations (create/update/delete risk + indicator) |
| Zapier search | `packages/zapier-app/src/searches/` | Search implementations (28 searches) |
| Zapier fields | `packages/zapier-app/src/fields/custom-fields.ts` | Dynamic custom field resolver |
| Zapier tests | `packages/zapier-app/test/` | Vitest tests |

---

## 15. Local Development & Testing Strategy

### 15.1 Local Dev Environment for Zapier Integration

#### Docker Profile Additions

The Zapier integration extends the existing `external-api` Docker profile. No new Docker services are needed — the integration reuses:

- **DynamoDB Local** (already in `v3` profile) — DynamoDB for `zapier-credentials-tbl`
- **Mock Auth Provider** (already in `external-api` profile) — issues test JWTs that mimic Cognito `client_credentials`
- **tRPC** (already in `v3` profile) — backend API serving Zapier-initiated requests
- **External API** (already in `external-api` profile) — REST endpoints that Zapier calls

Start command: `pnpm run api:v3` (or `pnpm run api:external` if only testing external API)

#### DynamoDB Local Table

Add the Zapier credentials table schema to `dynamo/schemas/`:

```json
// dynamo/schemas/zapier-credentials-tbl.json
{
  "TableName": "zapier-credentials-tbl",
  "KeySchema": [
    { "AttributeName": "pk", "KeyType": "HASH" },
    { "AttributeName": "sk", "KeyType": "RANGE" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "pk", "AttributeType": "S" },
    { "AttributeName": "sk", "AttributeType": "S" },
    { "AttributeName": "gsi_1_pk", "AttributeType": "S" },
    { "AttributeName": "gsi_1_sk", "AttributeType": "S" }
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "gsi_1",
      "KeySchema": [
        { "AttributeName": "gsi_1_pk", "KeyType": "HASH" },
        { "AttributeName": "gsi_1_sk", "KeyType": "RANGE" }
      ],
      "Projection": { "ProjectionType": "ALL" },
      "ProvisionedThroughput": { "ReadCapacityUnits": 5, "WriteCapacityUnits": 5 }
    }
  ],
  "ProvisionedThroughput": { "ReadCapacityUnits": 5, "WriteCapacityUnits": 5 }
}
```

The `init-local-aws.js` script auto-creates tables from `dynamo/schemas/*.json` — no manual table creation needed.

#### Mock Cognito for Local Testing

The mock auth provider at `http://localhost:3232` already supports issuing JWTs with custom claims. For Zapier credential testing, the flow is:

1. Create a credential via the admin API → stores in DynamoDB with a `cognitoClientId`
2. The `zapier-auth.middleware.ts` resolves the API key → looks up the DynamoDB record → calls the mock auth provider's `/token` endpoint with `client_credentials` grant
3. Mock auth provider returns a JWT with injected claims (org_id, tenant_id, permissions)
4. tRPC validates the JWT against the mock auth provider's JWKS endpoint

This means the full Zapier auth flow (API key → JWT proxy) works locally without any AWS Cognito dependency.

#### Zapier CLI Local Testing (Without Zapier Infrastructure)

For testing the Zapier app's triggers and actions against the local API:

```bash
# In packages/zapier-app
# Set local auth data
echo 'API_KEY=rs_zap_local_test_key_1' > .env
echo 'API_BASE_URL=http://localhost:3200' >> .env

# Test a trigger against local external API
zapier invoke trigger new_risk

# Test an action
zapier invoke create risk --inputData '{"title":"Test Risk","description":"From Zapier CLI"}'
```

> **Note:** The Zapier CLI runs triggers/actions as standalone Node.js functions.
> It does NOT require a running Zapier infrastructure. This means you can test
> the data transformation logic without Zapier's servers.

#### Tunnelling for End-to-End Embed Testing

When testing the Workflow Element embed locally, Zapier's iframe needs to reach your local server. Use a tunnel:

```bash
# Option 1: ngrok (recommended for development)
ngrok http 3000
# Add the ngrok URL to Zapier's Allowed Domains in Embed settings

# Option 2: Zapier CLI built-in tunnel (for trigger/action testing only)
zapier invoke trigger new_risk --remote
```

### 15.2 Test Coverage Plan

The testing strategy mirrors existing project patterns, following three tiers: unit tests (Vitest), integration tests (Vitest + Docker), and E2E tests (Playwright).

#### Tier 1: Unit Tests

Framework: **Vitest** with `vi.mock()`, matching `packages/external-api` and `packages/trpc` patterns.

**15.2.1 zapier-auth.middleware.ts**

Test file: `packages/external-api/src/middleware/__tests__/zapier-auth.middleware.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockResponse } from '../../testing/test-utils';

// Mock DynamoDB client (follows cognito-app-client.auth.test.ts pattern)
const mockDynamoClient = {
  query: vi.fn(),
  updateItem: vi.fn(),
};

// Mock Cognito token exchange
const mockGetClientAccessToken = vi.fn();

vi.mock('../../aws/dynamo-client', () => ({
  getDynamoClient: () => mockDynamoClient,
}));

vi.mock('../../aws/cognito-client', () => ({
  getCognitoClient: () => ({
    getClientAccessToken: mockGetClientAccessToken,
  }),
}));

describe('zapier-auth.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API key resolution', () => {
    it('should pass through non-rs_zap_ requests unchanged', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer normal-jwt-token' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await zapierAuthMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockDynamoClient.query).not.toHaveBeenCalled();
    });

    it('should resolve rs_zap_ key to Cognito JWT', async () => {
      const apiKey = 'rs_zap_abc123def456';
      const req = createMockRequest({
        headers: { 'x-api-key': apiKey },
      });
      const res = createMockResponse();
      const next = vi.fn();

      mockDynamoClient.query.mockResolvedValueOnce([{
        cognitoClientId: 'client-123',
        cognitoClientSecret: 'encrypted-secret',
        status: 'active',
        userId: 'user-1',
        orgId: 'org-1',
        tenantId: 'tenant-1',
        scopes: 'risks:read,actions:write',
      }]);

      mockGetClientAccessToken.mockResolvedValueOnce({
        access_token: 'fresh-cognito-jwt',
        expires_in: 3600,
      });

      await zapierAuthMiddleware(req, res, next);

      expect(req.headers.authorization).toBe('Bearer fresh-cognito-jwt');
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 for revoked API key', async () => {
      const req = createMockRequest({
        headers: { 'x-api-key': 'rs_zap_revoked_key' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      mockDynamoClient.query.mockResolvedValueOnce([]); // No active record

      await zapierAuthMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should cache JWT and reuse within TTL', async () => {
      // First request — cache miss
      const apiKey = 'rs_zap_cached_key';
      const req1 = createMockRequest({ headers: { 'x-api-key': apiKey } });

      mockDynamoClient.query.mockResolvedValue([{ /* credential record */ }]);
      mockGetClientAccessToken.mockResolvedValue({
        access_token: 'cached-jwt',
        expires_in: 3600,
      });

      await zapierAuthMiddleware(req1, createMockResponse(), vi.fn());

      // Second request — should use cache, no new Cognito call
      const req2 = createMockRequest({ headers: { 'x-api-key': apiKey } });
      await zapierAuthMiddleware(req2, createMockResponse(), vi.fn());

      expect(mockGetClientAccessToken).toHaveBeenCalledTimes(1); // Only once
    });

    it('should update lastUsedAt on successful resolution', async () => {
      const apiKey = 'rs_zap_track_usage';
      const req = createMockRequest({ headers: { 'x-api-key': apiKey } });

      mockDynamoClient.query.mockResolvedValueOnce([{ /* credential */ }]);
      mockGetClientAccessToken.mockResolvedValueOnce({ access_token: 'jwt' });

      await zapierAuthMiddleware(req, createMockResponse(), vi.fn());

      expect(mockDynamoClient.updateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          updateExpression: expect.stringContaining('lastUsedAt'),
        })
      );
    });
  });
});
```

**15.2.2 automations.service.ts (Credential CRUD)**

Test file: `packages/external-api/src/services/automations/__tests__/automations.service.test.ts`

```
Tests to cover:
├── createAutomationCredential
│   ├── should create Cognito client with correct scopes
│   ├── should store encrypted API key + hash in DynamoDB
│   ├── should assign credential to specified user
│   ├── should enforce per-org credential limit
│   ├── should reject duplicate credential name for same user
│   └── should rollback Cognito client on DynamoDB write failure
├── revokeAutomationCredential
│   ├── should mark credential as revoked in DynamoDB
│   ├── should delete Cognito client
│   ├── should send Knock revocation notification to user
│   └── should prevent revoking already-revoked credential
├── getOrgAutomationCredentials
│   ├── should return all credentials for org (admin view)
│   ├── should include user name, scopes, status, lastUsedAt
│   └── should NOT include raw API key or encrypted key
├── getUserAutomationCredentials
│   ├── should return only the requesting user's credentials
│   ├── should include name + scopes only (no key material)
│   └── should return empty array for user with no credentials
├── initEmbed
│   ├── should decrypt API key from DynamoDB using KMS
│   ├── should call Zapier Workflow API to create connection
│   ├── should return embed session config (no raw key)
│   └── should handle Zapier API errors gracefully
├── requestAccess
│   ├── should create pending request record
│   ├── should send Knock notification to org admins
│   └── should prevent duplicate pending requests
├── approveRequest
│   ├── should create credential and notify user
│   └── should reject already-processed requests
└── denyRequest
    ├── should mark request as denied
    └── should send denial notification to user
```

Pattern: Follow `packages/external-api/src/services/app-clients/app-clients.service.ts` test structure — mock DynamoDB client, mock Cognito client, mock KMS client, verify call arguments.

**15.2.3 automations-knock.service.ts (Notifications)**

Test file: `packages/external-api/src/services/automations/__tests__/automations-knock.service.test.ts`

```
Tests to cover:
├── sendCredentialRequestedNotification
│   ├── should call Knock API with correct workflow ID
│   ├── should include requester name + requested scopes in payload
│   └── should send to all org admins (not just Risk Admins)
├── sendCredentialApprovedNotification
│   ├── should notify the requesting user
│   ├── should include credential name + granted scopes
│   └── should include link to Automations page
└── sendCredentialDeniedNotification
    ├── should notify the requesting user
    └── should include denial reason if provided
```

**15.2.4 Frontend Components**

Test files in `packages/web/src/pages/automations/__tests__/`

Following the project's existing Testing Library + Vitest pattern:

```
UserCredentialsPanel.test.tsx
├── should render "No connections" state with Request Access button
├── should render credential names and scope badges
├── should NOT render any API key material anywhere
├── should call requestAccess mutation on button click
└── should show pending request status

CredentialPickerModal.test.tsx
├── should render list of user's credentials by name
├── should call initEmbed with selected credential ID on confirm
├── should disable confirm when nothing selected
└── should show scope summary for each credential

PendingRequestsPanel.test.tsx (admin)
├── should render pending requests with user name + requested scopes
├── should call approveRequest on approve button
├── should call denyRequest on deny button
└── should remove request from list after action

CreateAutomationCredentialModal.test.tsx (admin)
├── should render user picker dropdown
├── should render scope selector (matching ApiClientForm pattern)
├── should validate at least one scope selected
├── should call createCredential mutation on submit
└── should show success toast (no key displayed)
```

**15.2.5 Zapier App Unit Tests (packages/zapier-app)**

Using Zapier's built-in test framework (Jest, bundled with `zapier-platform-core`):

```javascript
// triggers/new_risk.test.js
const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject(); // Load .env

describe('new_risk trigger', () => {
  it('should return an array of risks', async () => {
    const bundle = {
      authData: {
        api_key: process.env.API_KEY,
        api_base_url: process.env.API_BASE_URL || 'http://localhost:3200',
      },
    };
    const results = await appTester(
      App.triggers.new_risk.operation.perform,
      bundle
    );
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('title');
  });

  it('should return 401 with invalid API key', async () => {
    const bundle = {
      authData: {
        api_key: 'rs_zap_invalid_key',
        api_base_url: process.env.API_BASE_URL || 'http://localhost:3200',
      },
    };
    await expect(
      appTester(App.triggers.new_risk.operation.perform, bundle)
    ).rejects.toThrow();
  });
});

// authentication.test.js
describe('authentication', () => {
  it('should validate a valid API key', async () => {
    const bundle = {
      authData: {
        api_key: process.env.API_KEY,
        api_base_url: process.env.API_BASE_URL || 'http://localhost:3200',
      },
    };
    const result = await appTester(
      App.authentication.test,
      bundle
    );
    expect(result.status).toBe(200);
  });
});
```

Run with: `zapier test` (uses Jest under the hood)

#### Tier 2: Integration Tests

Framework: **Vitest** with Docker (`docker compose --profile v3 up`), matching `packages/external-api-tests` patterns.

**15.2.6 Credential Lifecycle Integration Tests**

Test file: `packages/external-api-tests/src/tests/automations/credentials.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestContext, TestContext } from '../../utils/test-context';

describe('Zapier Automation Credentials', () => {
  let adminContext: TestContext;
  let userContext: TestContext;

  beforeAll(async () => {
    // Admin with credential management permissions
    adminContext = await createTestContext('automations:admin');
    // Regular user
    userContext = await createTestContext('risks:read,actions:read');
  });

  describe('POST /api/v1/automations/credentials', () => {
    it('admin should create a credential for a user', async () => {
      const response = await adminContext.httpClient.post(
        '/automations/credentials',
        {
          userId: userContext.userId,
          name: 'Risk Monitoring',
          scopes: ['risks:read', 'risks:list'],
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: 'Risk Monitoring',
        userId: userContext.userId,
        scopes: ['risks:read', 'risks:list'],
        status: 'active',
      });
      // CRITICAL: No API key in response
      expect(response.data).not.toHaveProperty('apiKey');
      expect(response.data).not.toHaveProperty('apiKeyEncrypted');
      expect(response.data).not.toHaveProperty('apiKeyHash');
    });

    it('non-admin should receive 403', async () => {
      const response = await userContext.httpClient.post(
        '/automations/credentials',
        {
          userId: userContext.userId,
          name: 'Unauthorized',
          scopes: ['risks:read'],
        }
      );
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/automations/credentials', () => {
    it('admin should see all org credentials', async () => {
      const response = await adminContext.httpClient.get(
        '/automations/credentials'
      );
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      // Each record should have name, scopes, userName — no key material
      response.data.forEach((cred: any) => {
        expect(cred).toHaveProperty('name');
        expect(cred).toHaveProperty('scopes');
        expect(cred).not.toHaveProperty('apiKeyEncrypted');
        expect(cred).not.toHaveProperty('cognitoClientSecret');
      });
    });
  });

  describe('POST /api/v1/automations/credentials/:id/init-embed', () => {
    it('should return embed session without exposing key', async () => {
      // First create a credential
      const createResp = await adminContext.httpClient.post(
        '/automations/credentials',
        {
          userId: userContext.userId,
          name: 'Embed Test',
          scopes: ['risks:read'],
        }
      );
      const credentialId = createResp.data.id;

      // User calls init-embed
      const response = await userContext.httpClient.post(
        `/automations/credentials/${credentialId}/init-embed`,
        {}
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('embedUrl');
      expect(response.data).not.toHaveProperty('apiKey');
    });
  });

  describe('DELETE /api/v1/automations/credentials/:id', () => {
    it('should revoke credential and return 204', async () => {
      const createResp = await adminContext.httpClient.post(
        '/automations/credentials',
        {
          userId: userContext.userId,
          name: 'To Be Revoked',
          scopes: ['risks:read'],
        }
      );

      const response = await adminContext.httpClient.delete(
        `/automations/credentials/${createResp.data.id}`
      );
      expect(response.status).toBe(204);

      // Verify it's gone from active list
      const listResp = await adminContext.httpClient.get(
        '/automations/credentials'
      );
      const revoked = listResp.data.find(
        (c: any) => c.id === createResp.data.id
      );
      expect(revoked?.status).toBe('revoked');
    });
  });
});
```

**15.2.7 API Key → JWT Proxy Integration Tests**

Test file: `packages/external-api-tests/src/tests/automations/auth-proxy.test.ts`

```
Tests to cover (run against real Docker services):
├── API key resolves to valid JWT
│   ├── should accept rs_zap_ prefixed key in x-api-key header
│   ├── should resolve to JWT with correct org_id claim
│   ├── should resolve to JWT with correct tenant_id claim
│   ├── should resolve to JWT with correct permissions (matching scopes)
│   └── should allow the resolved JWT to access scoped resources
├── Security boundaries
│   ├── should reject invalid rs_zap_ key with 401
│   ├── should reject revoked credential's key with 401
│   ├── should enforce scope boundaries (risks:read cannot write)
│   └── should isolate tenants (org A key cannot access org B data)
├── Performance
│   ├── should cache JWT (second request faster than first)
│   └── should refresh cache when JWT expires
└── Concurrent requests
    ├── should handle multiple simultaneous API key resolutions
    └── should not corrupt cache under concurrent access
```

**15.2.8 Request/Approval Flow Integration Tests**

Test file: `packages/external-api-tests/src/tests/automations/request-flow.test.ts`

```
Tests to cover:
├── POST /api/v1/automations/request-access
│   ├── user can submit access request
│   ├── duplicate request returns 409
│   └── request appears in admin's pending list
├── POST /api/v1/automations/requests/:id/approve
│   ├── admin approval creates credential
│   ├── approval with scopes creates correctly scoped credential
│   └── user's credential list updates after approval
├── POST /api/v1/automations/requests/:id/deny
│   ├── admin denial marks request as denied
│   └── user can submit new request after denial
└── GET /api/v1/automations/request-status
    ├── returns 'none' when no request exists
    ├── returns 'pending' when request awaits approval
    └── returns 'approved' with credential info after approval
```

#### Tier 3: E2E Tests (Playwright)

Test file: `packages/e2e/tests/automations.spec.ts`

Following existing patterns from `controls.spec.ts`, `risks.spec.ts`:

```typescript
import { test, expect } from '../base';
import { users } from '../users';

test.describe('Automations Page', () => {

  test('regular user sees empty state with Request Access button', async ({
    page,
    app,
  }) => {
    await page.goto('/automations');
    await expect(page.getByText('Automations')).toBeVisible();
    await expect(page.getByText('Request Access')).toBeVisible();
    await expect(page.getByText('No automation connections')).toBeVisible();
  });

  test.describe('Admin credential management', () => {
    test.use({ user: users.riskManager });

    test('admin can navigate to Settings tab and see credential table', async ({
      page,
      app,
    }) => {
      await page.goto('/automations');
      await page.getByRole('tab', { name: 'Settings' }).click();
      await expect(page.getByText('Automation Credentials')).toBeVisible();
    });

    test('admin can create credential for a user', async ({ page, app }) => {
      await page.goto('/automations');
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.getByRole('button', { name: 'Create Credential' }).click();

      // Fill modal form
      await page.getByLabel('User').click();
      await page.getByText('Standard1').click();
      await page.getByLabel('Name').fill('Risk Monitoring');
      await page.getByLabel('Risks').check();
      await page.getByRole('button', { name: 'Create' }).click();

      // Verify in table — no key shown
      await expect(page.getByText('Risk Monitoring')).toBeVisible();
      await expect(page.getByText('Standard1')).toBeVisible();
      // Ensure no API key material visible anywhere
      await expect(page.getByText('rs_zap_')).not.toBeVisible();
    });
  });

  test('user can see their connections (name + permissions only)', async ({
    page,
    app,
  }) => {
    // Pre-condition: admin has created a credential for this user
    // (use API client to seed test data, following apiClient.ts pattern)

    await page.goto('/automations');
    await expect(page.getByText('Your Automation Connections')).toBeVisible();
    await expect(page.getByText('Risk Monitoring')).toBeVisible();
    await expect(page.getByText('risks:read')).toBeVisible();
    // No key material
    await expect(page.getByText('rs_zap_')).not.toBeVisible();
    await expect(page.getByText('Reveal')).not.toBeVisible();
  });

  // Parameterized role access tests (follows existing pattern)
  [users.standard, users.riskManager].forEach((user) => {
    test.describe(`Automations page access for ${user.role}`, () => {
      test.use({ user });
      test('can access automations page', async ({ page }) => {
        await page.goto('/automations');
        await expect(page.getByText('Automations')).toBeVisible();
      });
    });
  });

  test.describe('Settings tab visibility', () => {
    test.use({ user: users.standard });
    test('standard user cannot see Settings tab', async ({ page }) => {
      await page.goto('/automations');
      await expect(
        page.getByRole('tab', { name: 'Settings' })
      ).not.toBeVisible();
    });
  });
});
```

#### Tier 4: Zapier App Tests (packages/zapier-app)

Run via Turborepo (uses `zapier test` under the hood, which runs Jest):

```
packages/zapier-app/
├── src/
│   ├── triggers/
│   │   ├── new_risk.ts
│   │   ├── updated_risk.ts
│   │   ├── new_action.ts
│   │   ├── new_control.ts
│   │   └── new_assessment.ts
│   ├── actions/
│   │   ├── create_risk.ts
│   │   ├── update_risk.ts
│   │   ├── create_action.ts
│   │   └── create_control.ts
│   ├── searches/
│   │   ├── find_risk.ts
│   │   └── find_control.ts
│   └── index.ts            # Zapier app entry point
├── test/
│   ├── triggers/
│   │   ├── new_risk.test.ts
│   │   ├── updated_risk.test.ts
│   │   ├── new_action.test.ts
│   │   ├── new_control.test.ts
│   │   └── new_assessment.test.ts
│   ├── actions/
│   │   ├── create_risk.test.ts
│   │   ├── update_risk.test.ts
│   │   ├── create_action.test.ts
│   │   └── create_control.test.ts
│   ├── searches/
│   │   ├── find_risk.test.ts
│   │   └── find_control.test.ts
│   └── authentication.test.ts
├── package.json            # @risksmart-app/zapier-app, depends on @risksmart-app/shared
└── tsconfig.json           # Extends root tsconfig
```

Each trigger/action test hits the local external API (`http://localhost:3200`) with a pre-seeded test credential from `@risksmart-app/test-data`.

**package.json:**

```json
{
  "name": "@risksmart-app/zapier-app",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test:unit": "zapier test",
    "lint": "eslint src/",
    "push": "zapier push",
    "validate": "zapier validate",
    "describe": "zapier describe"
  },
  "dependencies": {
    "zapier-platform-core": "^15.0.0",
    "@risksmart-app/shared": "workspace:*"
  },
  "devDependencies": {
    "zapier-platform-cli": "^15.0.0",
    "typescript": "^5.0.0"
  },
  "zapier": {
    "id": "ZAPIER_APP_ID_HERE"
  }
}
```

### 15.3 Test Data Builders (New)

Following the existing `packages/test-data/src/builders/` pattern:

```typescript
// packages/test-data/src/builders/zapierCredential.ts
import { randomUUID, randomBytes, createHash } from 'crypto';

export interface ZapierCredentialTestData {
  pk: string;
  sk: string;
  orgId: string;
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  cognitoClientId: string;
  cognitoClientSecret: string;
  clientName: string;
  apiKeyRaw: string;         // Only in test data — never in prod
  apiKeyEncrypted: string;   // Simulated encryption for tests
  apiKeyHash: string;
  scopes: string;
  status: 'active' | 'revoked';
  role: 'rs-external';
  rateLimitProfile: 'cruise' | 'turbo';
  createdAt: number;
  createdBy: string;
  lastUsedAt: number;
  gsi_1_pk: string;
  gsi_1_sk: string;
}

export const buildZapierCredential = (overrides: {
  orgId: string;
  tenantId: string;
  userId: string;
  userName?: string;
  scopes?: string;
} & Partial<ZapierCredentialTestData>): ZapierCredentialTestData => {
  const credentialId = overrides.sk?.replace('#zapier#', '') || randomUUID();
  const apiKeyRaw = `rs_zap_${randomBytes(24).toString('base64url')}`;
  const apiKeyHash = createHash('sha256').update(apiKeyRaw).digest('hex');

  return {
    pk: `#${overrides.tenantId}#${overrides.orgId}`,
    sk: `#zapier#${credentialId}`,
    orgId: overrides.orgId,
    tenantId: overrides.tenantId,
    userId: overrides.userId,
    userName: overrides.userName || 'Test User',
    userEmail: 'testuser@risksmart.com',
    cognitoClientId: `cognito-${randomUUID().slice(0, 8)}`,
    cognitoClientSecret: `encrypted:${randomBytes(32).toString('hex')}`,
    clientName: `zapier-${overrides.orgId}-${overrides.userId}`,
    apiKeyRaw,
    apiKeyEncrypted: `encrypted:${apiKeyRaw}`, // Simplified for tests
    apiKeyHash,
    scopes: overrides.scopes || 'risks:read',
    status: 'active',
    role: 'rs-external',
    rateLimitProfile: 'cruise',
    createdAt: Date.now(),
    createdBy: 'admin-user-id',
    lastUsedAt: 0,
    gsi_1_pk: 'active',
    gsi_1_sk: apiKeyHash,
    ...overrides,
  };
};
```

Insert helper:
```typescript
// packages/test-data/src/clients/zapierCredentialClient.ts
import { getDynamoClient } from './shared-dynamo';

export const insertZapierCredential = async (
  credential: ZapierCredentialTestData
) => {
  const dynamo = await getDynamoClient();
  await dynamo.putItem({
    tableName: process.env.ZAPIER_CREDENTIALS_TABLE || 'zapier-credentials-tbl',
    item: credential,
  });
  return credential;
};
```

### 15.4 Test Coverage Targets

| Layer | Package | Coverage Target | Rationale |
|-------|---------|----------------|-----------|
| Unit | `external-api` (middleware) | 90%+ line coverage | Auth middleware is security-critical |
| Unit | `external-api` (services) | 85%+ line coverage | Credential CRUD, KMS encryption |
| Unit | `web` (components) | 80%+ line coverage | UI components, modals, panels |
| Unit | `web` (hooks) | 85%+ line coverage | useZapier, useAutomations |
| Integration | `external-api-tests` | All happy + unhappy paths | End-to-end credential lifecycle |
| Integration | `external-api-tests` | Auth proxy paths | API key → JWT resolution |
| E2E | `e2e` | Critical user journeys | Request access, admin create, embed launch |
| Zapier App | `zapier-app` | All triggers + actions | Data transformation + API contract |

Run commands (matching existing project patterns):

```bash
# Unit tests (scoped — never run root-level)
pnpm exec turbo test:unit --filter=@risksmart-app/external-api
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/pages/automations/

# Integration tests (requires Docker)
pnpm exec turbo test:unit --filter=@risksmart-app/external-api-tests -- src/tests/automations/

# E2E tests
pnpm exec turbo test:e2e --filter=@risksmart-app/e2e -- tests/automations.spec.ts

# Zapier app tests (monorepo package — uses zapier test under the hood)
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
```

### 15.5 CI Pipeline Additions

Add to the existing Turborepo CI configuration:

```yaml
# .github/workflows/ci.yml (additions)
jobs:
  test-zapier-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16.11
      dynamodb-local:
        image: amazon/dynamodb-local:latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec turbo test:unit --filter=@risksmart-app/external-api
      - run: docker compose --profile v3 up -d --wait
      - run: pnpm exec turbo test:unit --filter=@risksmart-app/external-api-tests -- src/tests/automations/

  test-zapier-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
      - run: pnpm exec turbo validate --filter=@risksmart-app/zapier-app  # zapier validate
```

### 15.6 Mocking Strategy Summary

| External Dependency | Unit Test Mock | Integration Test | E2E |
|-------------------|---------------|-----------------|-----|
| DynamoDB | `vi.mock()` on DynamoDB client | Real DynamoDB Local | Real DynamoDB Local |
| Cognito | `vi.mock()` on CognitoAuthClient | Mock Auth Provider (port 3232) | Mock Auth Provider |
| KMS (encryption) | `vi.mock()` — return `encrypted:${input}` | Use a local KMS stub or mock | Use mock or skip |
| Knock (notifications) | `vi.mock()` — verify call args | Mock HTTP server or skip | Skip (no visual assertion) |
| Zapier Workflow API | `vi.mock()` — return embed config | Mock HTTP server | Mock or stub iframe |
| PostgreSQL | Not used (DynamoDB credentials) | Real Docker PostgreSQL | Real Docker PostgreSQL |
| Hasura | Not directly used | Real Docker Hasura | Real Docker Hasura |

---

## 16. REST API Surface & Contract Sync

### 16.1 REST API Reference for Zapier

The external API already serves an OpenAPI spec at `GET /api/v1/docs/openapi.json` (generated from Zod schemas via `@asteasolutions/zod-to-openapi`). This is the single source of truth for all Zapier trigger/action shapes.

#### Available Resources (76 endpoints, 11 resources)

| Resource | Endpoints | Write? | Custom Fields? | Linked Items? |
|----------|-----------|--------|---------------|---------------|
| Risks | 16 (CRUD + ratings, impacts, appetites, acceptances, approvals, linked-items) | Yes (create, update, delete) | Yes (`?expand=customFields`) | Yes |
| Controls | 3 (list, get, linked-items) | No (read-only) | Yes | Yes |
| Actions | 3 (list, get, linked-items) | No (read-only) | Yes | Yes |
| Indicators | 5 (CRUD + results, linked-items) | Yes (create, update, delete) | Yes | Yes |
| Issues | 10 (list, get + causes, consequences, updates, actions, assessment, linked-items) | No (read-only) | Yes | Yes |
| Obligations | 3 (list, get, linked-items) | No (read-only) | Yes | Yes |
| Policies | 3 (list, get, linked-items) | No (read-only) | Yes | Yes |
| Third Parties | 3 (list, get, linked-items) | No (read-only) | Yes | Yes |
| Enterprise Risks | 3 (list, get, child risks) | No (read-only) | Yes | No |
| Assessments | 2 (list, get) | No (read-only) | Yes | No |
| Impacts | 2 (list, get) | No (read-only) | No | No |

#### Pagination

Cursor-based pagination (not offset). All list endpoints return:

```typescript
{
  data: T[],
  pageInfo: {
    count: number,
    hasMore: boolean,
    beforeCursor: string | null,   // base64url-encoded
    afterCursor: string | null,
    prevPage: string | null,       // full URL
    nextPage: string | null        // full URL
  }
}
```

Query parameters: `page_size` (1–250), `start_after`, `ending_before` (mutually exclusive cursors).

**Zapier implication:** Zapier polling triggers must implement deduplication (by `id`). The cursor-based pagination means triggers should sort by `createdAt` descending and use the `id` field for dedup — Zapier handles this natively if each result has a unique `id` field.

#### Rate Limiting

Four profiles, four tiers per profile:

| Profile | T1 (auth) | T2 (delete/batch) | T3 (mutation) | T4 (read) |
|---------|-----------|-------------------|---------------|-----------|
| **chill** | 5/min | 10/min | 20/min | — |
| **cruise** | 10/min | 60/min | 300/min | 1500/min |
| **turbo** | 10/min | 120/min | 600/min | 3000/min |
| **fullSend** | 10/min | 360/min | 1800/min | 9000/min |

Zapier credentials should use the **cruise** profile by default. Headers returned: `X-RateLimit-Consumed`, `X-RateLimit-Remaining`, `X-RateLimit-Profile`, `Retry-After`.

**Zapier implication:** Zapier has built-in retry with `Retry-After` header support. The Zapier app must set `z.request()` to honour `429` responses. At **cruise** profile, a user gets 1500 reads/min — sufficient for polling triggers (which run every 1–15 min) and typical action volumes. Super Zaps (§17) that chain multiple calls must respect per-minute budgets.

#### Custom Fields

Custom fields are dynamic, per-org, per-entity-type attributes. Stored as JSONB on each entity record.

**Schema:** Each custom field has a 13-digit millisecond timestamp ID. The field data shape:

```json
{
  "customFields": {
    "schemaUpdatedAt": "2026-01-15T10:30:00Z",
    "fields": {
      "1701234567890": {
        "data": { "id": "1701234567890", "value": "High", "label": "Risk Category" },
        "metadata": {
          "kind": "select",
          "description": "Custom risk category",
          "hidden": false,
          "readOnly": false,
          "required": true,
          "defaultValue": null,
          "enum": ["Low", "Medium", "High", "Critical"]
        }
      }
    }
  }
}
```

**Expansion:** `GET /risks?expand=customFields` includes metadata (kind, enum, required, etc.). Without expansion, only data (id + value) is returned.

**Zapier implication:** This is the most complex part of the Zapier integration:

1. **Trigger output fields must be dynamic.** Custom fields vary per org. Zapier supports this via `outputFields` functions that fetch the org's field schema at setup time and return the field definitions dynamically.
2. **Action input fields must also be dynamic.** When creating/updating a risk, the Zapier action must present the org's custom fields as input fields. Use Zapier's `inputFields` function to fetch and render them.
3. **Field type mapping:**

   | RiskSmart Kind | Zapier Field Type |
   |---------------|-------------------|
   | `text` | `string` |
   | `textarea` | `text` |
   | `number` | `number` |
   | `date` | `datetime` |
   | `checkbox` | `boolean` |
   | `select` | `string` with `choices` |
   | `multiselect` | `string` with `choices` + `list: true` |
   | `user-single-select` | `string` (user ID) |
   | `user-multiselect` | `string` (comma-separated user IDs) |

4. **Schema change detection:** The `schemaUpdatedAt` field allows Zapier to cache field definitions and refresh only when the schema changes. The Zapier app should store `schemaUpdatedAt` per org and re-fetch `?expand=customFields` when it changes.

#### Linked Items

Linked items are many-to-many relationships between entities. Three relationship types: `parent_child`, `child_parent` (auto-generated reverse), `sibling`.

**Endpoint:** `GET /{resource}/:id/linked-items` returns:

```json
{
  "data": [
    {
      "id": "link-uuid",
      "linkedItemId": "target-entity-uuid",
      "linkedItemTitle": "Control #42 - Access Management",
      "linkedItemType": "control",
      "relationshipType": "parent_child",
      "createdAt": "2026-01-10T09:00:00Z",
      "links": {
        "linkedItem": { "href": "/api/v1/controls/target-entity-uuid" }
      }
    }
  ]
}
```

**Zapier implication:** Linked items are critical for Super Zaps (§17) — e.g., "Create a risk AND link it to an existing control." The Zapier app needs:

1. A `find_linked_items` search that returns linked items for any entity.
2. Actions that support a `linkedItemIds` input field for link-on-create.
3. Separate `link_items` / `unlink_items` actions for managing relationships post-creation.

#### API Versioning

The API supports schema versioning via `risksmart_version` query parameter. Zod schemas transform responses between versions. The Zapier app should pin to a specific API version and include it in all requests:

```javascript
// In every Zapier request
z.request({
  url: `${bundle.authData.api_base_url}/api/v1/risks`,
  params: { risksmart_version: '2026-01' },
});
```

This ensures the Zapier app's output field definitions remain stable even if the API evolves.

### 16.2 API Contract Sync: Keeping Zapier in Sync with REST API Changes

Since `packages/zapier-app` lives in the monorepo, we can enforce contract compatibility at build time.

#### Approach: OpenAPI Snapshot Diffing

The REST API already generates an OpenAPI JSON spec from Zod schemas. We snapshot this spec and diff it on every PR to detect breaking changes that would affect Zapier.

#### 16.2.1 Snapshot Generation

```typescript
// packages/zapier-app/scripts/generate-api-snapshot.ts
import { DocumentationService } from '@risksmart-app/external-api/services/documentation';

const docsService = new DocumentationService(/* config */);
const spec = docsService.getOpenApiDocument('latest');

// Extract only the shapes Zapier cares about
const zapierContract = {
  version: spec.info.version,
  generatedAt: new Date().toISOString(),
  triggers: extractTriggerSchemas(spec),   // GET list endpoints → output fields
  actions: extractActionSchemas(spec),     // POST/PUT endpoints → input + output fields
  searches: extractSearchSchemas(spec),    // GET by-id endpoints → output fields
  customFields: spec.components?.schemas?.CustomAttributesResponseExpandedSchema,
  linkedItems: spec.components?.schemas?.LinkedItemBaseSchema,
  pagination: spec.components?.schemas?.PageInfo,
};

writeFileSync(
  'packages/zapier-app/api-contract.snapshot.json',
  JSON.stringify(zapierContract, null, 2)
);
```

#### 16.2.2 Contract Validation (CI)

```typescript
// packages/zapier-app/scripts/validate-api-contract.ts
import previousSnapshot from './api-contract.snapshot.json';

// Generate current snapshot from live Zod schemas
const currentSnapshot = generateSnapshot();

const breakingChanges = detectBreakingChanges(previousSnapshot, currentSnapshot);

interface BreakingChange {
  type: 'removed_field' | 'type_changed' | 'required_added' | 'endpoint_removed';
  path: string;          // e.g., "triggers.new_risk.output.riskScore.residualScore"
  description: string;
  severity: 'error' | 'warning';
}

function detectBreakingChanges(prev: Snapshot, curr: Snapshot): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // 1. Removed fields (trigger outputs that Zapier users might depend on)
  for (const [endpoint, schema] of Object.entries(prev.triggers)) {
    for (const field of Object.keys(schema.outputFields)) {
      if (!(field in curr.triggers[endpoint]?.outputFields)) {
        changes.push({
          type: 'removed_field',
          path: `triggers.${endpoint}.output.${field}`,
          description: `Field "${field}" removed from ${endpoint} trigger output`,
          severity: 'error',
        });
      }
    }
  }

  // 2. Type changes (e.g., number → string)
  // 3. New required input fields on actions
  // 4. Endpoint removals
  // 5. Pagination shape changes
  // 6. Custom field schema shape changes

  return changes;
}

// Fail CI if any breaking changes detected
if (breakingChanges.some(c => c.severity === 'error')) {
  console.error('BREAKING API CHANGES DETECTED:');
  breakingChanges.forEach(c => console.error(`  ${c.severity}: ${c.path} — ${c.description}`));
  console.error('\nTo fix: update the Zapier trigger/action definitions to match the new API shape,');
  console.error('then run: pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app');
  process.exit(1);
}
```

#### 16.2.3 Turborepo Integration

```json
// turbo.json (additions)
{
  "tasks": {
    "generate:api-snapshot": {
      "dependsOn": ["@risksmart-app/external-api#build"],
      "outputs": ["api-contract.snapshot.json"]
    },
    "validate:api-contract": {
      "dependsOn": ["generate:api-snapshot"],
      "inputs": ["api-contract.snapshot.json", "src/**"]
    }
  }
}
```

```json
// packages/zapier-app/package.json (additions to scripts)
{
  "scripts": {
    "generate:api-snapshot": "tsx scripts/generate-api-snapshot.ts",
    "validate:api-contract": "tsx scripts/validate-api-contract.ts",
    "pretest": "pnpm run validate:api-contract"
  }
}
```

#### 16.2.4 Developer Workflow

When a developer modifies a REST API Zod schema:

1. Turborepo sees `external-api` changed → re-runs `zapier-app` build
2. `validate:api-contract` runs → diffs current schemas against snapshot
3. If breaking: **CI fails** with a clear message listing the breaking fields
4. Developer choices:
   - **Update the Zapier app** to handle the schema change (update trigger/action output fields)
   - **Add a version transform** in the REST API so the pinned Zapier version still works
   - **Regenerate snapshot** after updating: `pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app`

This ensures no REST API change can silently break a Zapier trigger/action.

#### 16.2.5 What Counts as Breaking

| Change | Breaking? | Why |
|--------|-----------|-----|
| Remove a response field | **Yes** | Zapier users may have mapped it in Zaps |
| Rename a response field | **Yes** | Same as remove + add |
| Change field type (number → string) | **Yes** | Zap steps expecting a number will fail |
| Add a new optional response field | No | Zapier ignores unknown fields |
| Add a new required input field | **Yes** | Existing Zaps won't provide it |
| Add a new optional input field | No | Existing Zaps continue to work |
| Change pagination shape | **Yes** | Triggers may fail to paginate |
| Change custom field envelope | **Yes** | Dynamic field resolution breaks |
| Deprecate an endpoint | **Warning** | Existing Zaps still work until removed |
| Remove an endpoint | **Yes** | Zapier trigger/action will 404 |

---

## 17. Super Zaps: Multi-Step Orchestrated Workflows

### 17.1 What Are Super Zaps?

Super Zaps are pre-built Zapier templates that chain multiple RiskSmart API calls in a specific sequence to perform complex GRC operations that would be tedious to configure manually. Unlike simple triggers/actions, Super Zaps encode domain logic — the correct sequence of API calls, required linked items, and custom field handling.

### 17.2 Super Zap Catalogue

#### SZ-1: Complete Risk Registration

**Use case:** "When a risk is identified in Jira/Slack/email, create a fully formed risk in RiskSmart with all required fields, linked controls, and initial rating."

```
Step 1: Trigger — New Jira issue with label "risk" (or Slack message, email, etc.)
Step 2: Search — Find existing controls by keyword (GET /controls?search=...)
Step 3: Action — Create risk (POST /risks) with:
         - title, description, tier, treatment, status
         - Custom fields (dynamic, per-org)
         - parentId (links to enterprise risk if specified)
Step 4: Action — Link risk to controls found in Step 2 (POST /risks/:id/linked-items)
Step 5: Action — Create initial risk rating (POST /risks/:id/ratings)
Step 6: Search — Verify risk created successfully (GET /risks/:id)
```

**Rate budget:** 5 API calls per execution → well within cruise profile (300 mutations/min, 1500 reads/min).

#### SZ-2: Incident → Issue with Root Cause

**Use case:** "When a PagerDuty/Opsgenie incident resolves, create an issue in RiskSmart with causes, consequences, and linked risks."

```
Step 1: Trigger — PagerDuty incident resolved
Step 2: Action — Create issue (POST /issues, when write support added)
Step 3: Action — Add cause (POST /issues/:id/causes)
Step 4: Action — Add consequence (POST /issues/:id/consequences)
Step 5: Search — Find related risks by keyword (GET /risks)
Step 6: Action — Link issue to risks (POST /issues/:id/linked-items)
```

#### SZ-3: Compliance Evidence Collection

**Use case:** "On a schedule (daily/weekly), pull data from an external system (AWS Security Hub, GitHub, etc.) and create/update indicator results in RiskSmart."

```
Step 1: Trigger — Schedule (daily at 09:00)
Step 2: Action — Fetch from external API (AWS Security Hub findings, GitHub audit log, etc.)
Step 3: Search — Find the target indicator in RiskSmart (GET /indicators)
Step 4: Action — Create indicator result (POST /indicators/:id/results) with:
         - value, testDate, notes
         - Attach evidence reference (URL to source)
Step 5: Conditional — If result breaches threshold, trigger Slack/Teams alert
```

#### SZ-4: Third-Party Risk Assessment Kickoff

**Use case:** "When a new vendor is added in procurement tool, create a third-party record with linked obligations and kick off an assessment."

```
Step 1: Trigger — New vendor in procurement tool (SAP Ariba, Coupa, etc.)
Step 2: Action — Create third party (POST /third-parties, when write support added)
Step 3: Search — Find relevant obligations (GET /obligations)
Step 4: Action — Link obligations to third party (POST /third-parties/:id/linked-items)
Step 5: Action — Create assessment (POST /assessments, when write support added)
Step 6: Action — Send notification to risk owner (Slack/email)
```

#### SZ-5: Risk Review Digest

**Use case:** "Weekly, pull all risks with residual score above threshold and post a summary to Slack/Teams/email for the risk committee."

```
Step 1: Trigger — Schedule (weekly, Monday 08:00)
Step 2: Search — List all risks (GET /risks)
Step 3: Filter — Filter risks where residualScore > threshold
Step 4: Formatter — Build markdown table: risk title, score, owner, last updated
Step 5: Action — Post to Slack channel / Send email
```

#### SZ-6: Control Test Result → Action Item

**Use case:** "When a control test result is marked as failed, create an action item, link it to the failing control, and assign to the control owner."

```
Step 1: Trigger — New risk rating with failed status (polling GET /risks/:id/ratings)
Step 2: Search — Get the parent control (GET /controls/:id)
Step 3: Action — Create action (POST /actions, when write support added)
Step 4: Action — Link action to control (POST /actions/:id/linked-items)
Step 5: Action — Assign to control owner (from Step 2 owner field)
Step 6: Action — Notify owner via Slack/email
```

### 17.3 Custom Field Handling in Super Zaps

Custom fields are the hardest part. Each org has different custom fields per entity type. Super Zap templates must handle this gracefully.

#### Dynamic Input Fields

The Zapier app's `inputFields` function fetches the org's custom field schema at Zap setup time:

```javascript
// In packages/zapier-app/src/fields/custom-fields.ts
const getCustomFields = async (z, bundle, entityType) => {
  const response = await z.request({
    url: `${bundle.authData.api_base_url}/api/v1/${entityType}`,
    params: { expand: 'customFields', page_size: 1 },
    headers: { 'x-api-key': bundle.authData.api_key },
  });

  const entity = response.data.data[0];
  if (!entity?.customFields?.fields) return [];

  return Object.entries(entity.customFields.fields).map(([fieldId, field]) => {
    const meta = field.metadata;
    const base = {
      key: `custom_${fieldId}`,
      label: field.data.label || `Custom Field ${fieldId}`,
      helpText: meta?.description || '',
      required: meta?.required || false,
    };

    // Map RiskSmart field kind → Zapier field type
    switch (meta?.kind) {
      case 'select':
        return { ...base, choices: meta.enum || [] };
      case 'multiselect':
        return { ...base, choices: meta.enum || [], list: true };
      case 'number':
        return { ...base, type: 'number' };
      case 'date':
        return { ...base, type: 'datetime' };
      case 'checkbox':
        return { ...base, type: 'boolean' };
      default:
        return { ...base, type: 'string' };
    }
  });
};

// Used in trigger/action definitions:
module.exports = {
  key: 'create_risk',
  operation: {
    inputFields: [
      { key: 'title', required: true, type: 'string' },
      { key: 'description', type: 'text' },
      { key: 'tier', required: true, type: 'integer', choices: [1, 2, 3] },
      { key: 'treatment', required: true, choices: ['Mitigate', 'Accept', 'Transfer', 'Avoid'] },
      // Dynamic custom fields — fetched per-org at Zap setup time
      async (z, bundle) => getCustomFields(z, bundle, 'risks'),
    ],
  },
};
```

#### Dynamic Output Fields

Trigger outputs also include custom fields dynamically:

```javascript
// Trigger outputFields function
const getOutputFields = async (z, bundle) => {
  const staticFields = [
    { key: 'id', label: 'Risk ID' },
    { key: 'title', label: 'Title' },
    { key: 'tier', label: 'Tier', type: 'integer' },
    // ... standard fields
  ];

  const customFields = await getCustomFields(z, bundle, 'risks');
  return [...staticFields, ...customFields];
};
```

### 17.4 Linked Item Handling in Super Zaps

Linking is a two-step process: create the entity, then link it. Super Zaps encode this sequence.

#### Link-on-Create Pattern

For triggers/actions that need to create + link in one user-facing step:

```javascript
// packages/zapier-app/src/actions/create_risk_with_links.ts
const perform = async (z, bundle) => {
  // Step 1: Create the risk
  const riskResponse = await z.request({
    url: `${bundle.authData.api_base_url}/api/v1/risks`,
    method: 'POST',
    body: {
      title: bundle.inputData.title,
      description: bundle.inputData.description,
      tier: bundle.inputData.tier,
      treatment: bundle.inputData.treatment,
      parentId: bundle.inputData.parentId, // Links to parent entity
      // Custom fields mapped from input
      customAttributeData: mapCustomFields(bundle.inputData),
    },
  });

  const risk = riskResponse.data;

  // Step 2: Link to controls (if provided)
  if (bundle.inputData.controlIds?.length > 0) {
    for (const controlId of bundle.inputData.controlIds) {
      await z.request({
        url: `${bundle.authData.api_base_url}/api/v1/risks/${risk.id}/linked-items`,
        method: 'POST',
        body: {
          targetId: controlId,
          targetType: 'control',
        },
      });
    }
  }

  // Step 3: Create initial rating (if provided)
  if (bundle.inputData.likelihood && bundle.inputData.impact) {
    await z.request({
      url: `${bundle.authData.api_base_url}/api/v1/risks/${risk.id}/ratings`,
      method: 'POST',
      body: {
        likelihood: bundle.inputData.likelihood,
        impact: bundle.inputData.impact,
        controlType: bundle.inputData.controlType || 'inherent',
        ratingType: 'initial',
      },
    });
  }

  // Return the complete risk (re-fetch to include linked items)
  const fullRisk = await z.request({
    url: `${bundle.authData.api_base_url}/api/v1/risks/${risk.id}?expand=customFields`,
  });
  return fullRisk.data;
};
```

#### Search-and-Link Pattern

For finding existing entities and linking them:

```javascript
// packages/zapier-app/src/searches/find_and_link.ts
// Input: sourceId, sourceType, searchQuery, targetType
// 1. Search for targets matching query
// 2. Return list for user to pick (or auto-link first match)
// 3. Create the link
```

### 17.5 Super Zap Contract Testing

Super Zaps encode specific API call sequences. If any endpoint in the sequence changes, the Super Zap breaks. The contract sync (§16.2) handles field-level changes, but Super Zaps also need **sequence-level** testing.

#### Sequence Test Definitions

```typescript
// packages/zapier-app/test/super-zaps/sz-1-complete-risk-registration.test.ts
import { describe, it, expect } from 'vitest';
import { SuperZapSequence } from '../utils/super-zap-tester';

describe('SZ-1: Complete Risk Registration', () => {
  const sequence = new SuperZapSequence([
    { method: 'GET',  path: '/api/v1/controls',                  expect: 200 },
    { method: 'POST', path: '/api/v1/risks',                     expect: 201 },
    { method: 'POST', path: '/api/v1/risks/:id/linked-items',    expect: 201 },
    { method: 'POST', path: '/api/v1/risks/:id/ratings',         expect: 201 },
    { method: 'GET',  path: '/api/v1/risks/:id',                 expect: 200 },
  ]);

  it('all endpoints in sequence exist in API snapshot', () => {
    const snapshot = loadApiSnapshot();
    const missing = sequence.validateEndpointsExist(snapshot);
    expect(missing).toEqual([]);
  });

  it('request bodies match current input schemas', () => {
    const snapshot = loadApiSnapshot();
    const mismatches = sequence.validateRequestSchemas(snapshot);
    expect(mismatches).toEqual([]);
  });

  it('response bodies match expected output fields', () => {
    const snapshot = loadApiSnapshot();
    const mismatches = sequence.validateResponseSchemas(snapshot);
    expect(mismatches).toEqual([]);
  });

  it('executes end-to-end against local API', async () => {
    // Integration test — requires Docker (pnpm run api:v3)
    const result = await sequence.execute({
      apiBaseUrl: 'http://localhost:3200',
      apiKey: process.env.TEST_API_KEY,
      inputData: {
        title: 'SZ-1 Test Risk',
        tier: 2,
        treatment: 'Mitigate',
      },
    });

    expect(result.steps.every(s => s.success)).toBe(true);
    expect(result.finalEntity.id).toBeDefined();
  });
});
```

#### Super Zap Registry (Phase 2 — Not Yet Built)

> **Note:** This registry file does not exist in the codebase yet. The enrichment searches (`getRiskOverview`, `getIssueDetails`) are implemented as regular searches in `src/searches/`. This registry is planned for Phase 2 when Super Zap templates are built.

```typescript
// packages/zapier-app/src/super-zaps/registry.ts (planned — does not exist yet)
export const SUPER_ZAP_REGISTRY = {
  'sz-1': {
    name: 'Complete Risk Registration',
    endpoints: [
      'GET /api/v1/controls',
      'POST /api/v1/risks',
      'POST /api/v1/risks/:id/linked-items',
      'POST /api/v1/risks/:id/ratings',
      'GET /api/v1/risks/:id',
    ],
    requiredScopes: ['controls:list', 'risks:create', 'risks:read'],
  },
  'sz-2': {
    name: 'Incident to Issue with Root Cause',
    endpoints: [
      'POST /api/v1/issues',
      'POST /api/v1/issues/:id/causes',
      'POST /api/v1/issues/:id/consequences',
      'GET /api/v1/risks',
      'POST /api/v1/issues/:id/linked-items',
    ],
    requiredScopes: ['issues:create', 'risks:list'],
  },
  // ... etc for all Super Zaps
} as const;
```

The contract validator (§16.2.2) also checks every endpoint in the Super Zap registry exists in the current API snapshot. If a developer removes `POST /risks/:id/ratings`, CI fails with: "Super Zap SZ-1 requires endpoint POST /risks/:id/ratings which no longer exists."

### 17.6 REST API Write Endpoint Gaps

The current REST API is **read-heavy** — most resources only support GET. For Super Zaps to work, we need write endpoints. Current state and requirements:

| Resource | Current Write Support | Needed for Super Zaps |
|----------|----------------------|----------------------|
| Risks | Create, Update, Delete | ✅ Sufficient |
| Indicators | Create, Update, Delete | ✅ Sufficient |
| Risk Ratings | — | **Need POST** (SZ-1) |
| Risk Linked Items | — | **Need POST/DELETE** (SZ-1, SZ-6) |
| Controls | — | Read-only is OK for Phase 1 |
| Actions | — | **Need POST** (SZ-6) |
| Issues | — | **Need POST** (SZ-2) |
| Issue Causes | — | **Need POST** (SZ-2) |
| Issue Consequences | — | **Need POST** (SZ-2) |
| Third Parties | — | **Need POST** (SZ-4) |
| Assessments | — | **Need POST** (SZ-4) |
| Indicator Results | — | **Need POST** (SZ-3) |

**Phase 1 priority:** Add write endpoints for linked items and risk ratings (enables SZ-1, the most valuable Super Zap). Other write endpoints can follow in Phase 2.

### 17.7 Rate Budget Calculator

Each Super Zap has a predictable API call count. At the **cruise** rate limit profile:

| Super Zap | Reads | Mutations | Total Calls | Max Executions/min |
|-----------|-------|-----------|-------------|-------------------|
| SZ-1: Risk Registration | 2 | 3 + N links | 5 + N | ~60 (at N=0) |
| SZ-2: Incident → Issue | 1 | 4 + N links | 5 + N | ~60 (at N=0) |
| SZ-3: Evidence Collection | 2 | 1 | 3 | ~500 |
| SZ-4: Third-Party Assessment | 1 | 3 + N links | 4 + N | ~75 (at N=0) |
| SZ-5: Risk Digest | 1 | 0 | 1 | ~1500 |
| SZ-6: Control → Action | 2 | 2 + N links | 4 + N | ~75 (at N=0) |

If a customer runs multiple Super Zaps concurrently, the shared rate budget could be an issue. The Zapier app should include a rate-aware wrapper:

```javascript
// packages/zapier-app/src/utils/rate-aware-request.ts
const rateAwareRequest = async (z, requestOptions) => {
  try {
    return await z.request(requestOptions);
  } catch (error) {
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      // Zapier's built-in retry handles this, but log for debugging
      z.console.log(`Rate limited. Retry after ${retryAfter}s`);
      throw new z.errors.RefreshAuthError(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
      );
    }
    throw error;
  }
};
```

---

## 18. Claude Code Integration: Zapier-Aware Development

The RiskSmart monorepo uses Claude Code with a mature skill/agent architecture (5 orchestrator agents, 20+ skills across 4 layers). This section defines the CLAUDE.md additions, new skills, and tooling that ensure every REST API change automatically triggers Zapier contract awareness.

### 18.1 CLAUDE.md Additions

#### 18.1.1 Root CLAUDE.md Addition

Add to the end of the root `/CLAUDE.md`:

```markdown
## Zapier Integration Contract

The Zapier integration app lives in `packages/zapier-app`. It depends on the
REST API schemas in `packages/external-api/src/schemas/`. A contract snapshot
(`packages/zapier-app/api-contract.snapshot.json`) tracks which API response
shapes Zapier triggers/actions depend on.

**If you modify any Zod schema in `packages/external-api/src/schemas/`:**

1. Run `pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app`
2. If it fails, the Zapier app needs updating. See §16.2 in ZAPIER_INTEGRATION_SPEC.md.
3. After updating Zapier trigger/action definitions, regenerate the snapshot:
   `pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app`

**If you add a new REST API write endpoint (POST/PUT/DELETE):**

1. Consider adding a matching Zapier action in `packages/zapier-app/src/actions/`.
2. If the entity has custom fields, the Zapier action must use dynamic `inputFields`
   (see `packages/zapier-app/src/fields/custom-fields.ts`).

**If you add a new Knock notification workflow:**

1. Update `packages/knock/partials/deep-link-partial-email` with the route mapping.
```

#### 18.1.2 packages/external-api/CLAUDE.md Addition

Add to the end of `packages/external-api/CLAUDE.md`:

```markdown
## Zapier Contract Dependency

This package's Zod schemas (`schemas/`) are the source of truth for the Zapier
integration app (`packages/zapier-app`). Changes to response schemas can break
Zapier triggers that users have already configured.

**Breaking changes to watch for:**

- Removing or renaming a field in any response schema (e.g., `RiskSchema`,
  `LinkedItemBaseSchema`, `CustomAttributesResponseExpandedSchema`)
- Changing a field's type (e.g., `number` → `string`)
- Adding a new required field to a request schema (existing Zaps won't provide it)
- Changing pagination shape (`PageInfo`)
- Modifying the custom fields envelope (`CustomFieldData`, `CustomFieldMetadata`)
- Removing or renaming an endpoint in `routes/`

**When adding a new REST endpoint:**

1. Add OpenAPI registration via `registerCrudResource()` or individual path registrations
2. Define Zod request/response schemas in `schemas/`
3. Run: `pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app`
4. If the endpoint is a write (POST/PUT/DELETE), consider creating a matching
   Zapier action — see `packages/zapier-app/CLAUDE.md`

**Rate limiting for Zapier traffic:**

Zapier credentials use the `cruise` rate profile by default (300 mutations/min,
1500 reads/min). Super Zaps chain 3-6 API calls per execution. Monitor
`X-RateLimit-Remaining` headers in Zapier middleware logs.
```

#### 18.1.3 packages/zapier-app/CLAUDE.md (New File)

```markdown
# packages/zapier-app

Zapier integration app for RiskSmart. Defines triggers, actions, and searches
that run on Zapier's infrastructure. Built with `zapier-platform-core`.

## Architecture

- `src/actions/` - Create/update/delete actions for risks and indicators
- `src/searches/` - Find-by-ID, list, find-by-owner, and enrichment searches (28 total)
- `src/fields/` - Dynamic field resolvers (custom fields)
- `src/utils/` - Rate-aware request wrapper, field type mapping
- `src/authentication.ts` - Session-based auth (client key + secret → token)
- `src/index.ts` - Zapier app entry point (registers all actions + searches)
- `test/` - Vitest test suite
- `api-contract.snapshot.json` - Frozen API schema snapshot for contract validation

## Commands

```bash
# Validate API contract hasn't broken
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app

# Regenerate snapshot after updating triggers/actions
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app

# Run Zapier tests (Jest)
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app

# Validate Zapier app structure
pnpm exec turbo validate --filter=@risksmart-app/zapier-app

# Deploy to Zapier (from package directory)
cd packages/zapier-app && zapier push
```

## Key Patterns

- **Dynamic fields:** Custom fields are per-org, per-entity-type. All triggers
  and actions that touch entities with custom fields MUST use the dynamic
  `inputFields`/`outputFields` pattern from `src/fields/custom-fields.ts`.
  Never hardcode custom field definitions.

- **Linked items:** Creating an entity + linking it requires multiple sequential
  API calls. Use the "create with links" compound action pattern from
  `src/actions/create_risk_with_links.ts`.

- **API versioning:** All requests MUST include `risksmart_version` query param
  pinned to the version matching the snapshot. Never use "latest".

- **Rate limiting:** Use `src/utils/rate-aware-request.ts` for all API calls.
  Handles 429 responses with Zapier's retry mechanism.

- **Contract snapshot:** `api-contract.snapshot.json` is checked in and validated
  on every CI run. If `packages/external-api` schemas change in a breaking way,
  CI fails until the Zapier app is updated. See §16.2 in ZAPIER_INTEGRATION_SPEC.md.

## Adding a New Trigger (Phase 2)

> Note: No triggers exist yet. `src/triggers/` directory does not exist. When adding the first trigger, create the directory and follow the polling trigger pattern.

1. Create `src/triggers/{entity}.ts`
2. Register in `src/index.ts` under `triggers`
3. If entity has custom fields, add dynamic `outputFields` function
4. Add `test/triggers/{entity}.test.ts`
5. Update `api-contract.snapshot.json` to include the new trigger's output schema

## Adding a New Action

1. Create `src/actions/{verb}_{entity}.ts` following existing action patterns in `src/actions/`
2. If entity supports custom fields, add dynamic `inputFields` from `src/fields/`
3. If entity supports linked items, consider a compound variant with linking support
4. Register in `src/index.ts` under `creates`
5. Add corresponding test in `test/`
6. Update `api-contract.snapshot.json`

## Dependencies

- `@risksmart-app/shared` (workspace:*) — shared types, hierarchy definitions
- `zapier-platform-core` — Zapier runtime
```

#### 18.1.4 packages/test-data/CLAUDE.md Addition

Add to the end of `packages/test-data/CLAUDE.md`:

```markdown
## Zapier Test Data

- **Builder**: `buildZapierCredential({ orgId, tenantId, userId, scopes? })` — creates
  a DynamoDB-shaped credential record with encrypted API key, Cognito client ID, and GSI fields.
- **Client**: `insertZapierCredential(credential)` — writes to DynamoDB `zapier-credentials-tbl`.

Import:
```typescript
import { buildZapierCredential } from '@risksmart-app/test-data/builders'
import { insertZapierCredential } from '@risksmart-app/test-data/clients'
```
```

#### 18.1.5 packages/knock/CLAUDE.md Addition

Add to the end of `packages/knock/CLAUDE.md`:

```markdown
## Zapier Credential Workflows

Three Knock workflows for the Zapier automation credential lifecycle:

| Workflow ID | Trigger | Recipients | Channel |
|---|---|---|---|
| `zapier-credential-requested` | User requests automation access | Org admins (RiskManager+) | Email + In-App |
| `zapier-credential-approved` | Admin approves request | Requesting user | Email + In-App |
| `zapier-credential-denied` | Admin denies request | Requesting user | Email + In-App |

When adding these workflows, update `deep-link-partial-email` with:
- `zapier-credential-requested` → `/automations` (admin Settings tab)
- `zapier-credential-approved` → `/automations` (user Connections panel)
- `zapier-credential-denied` → `/automations` (user can re-request)
```

#### 18.1.6 packages/events/CLAUDE.md Addition

Add to the end of `packages/events/CLAUDE.md`:

```markdown
## Zapier-Related Event Types

When adding Zapier credential lifecycle events, add to the EventType enum:

- `ZapierCredentialCreated` — Admin creates credential for a user
- `ZapierCredentialRevoked` — Admin revokes a credential
- `ZapierCredentialRequested` — User requests automation access
- `ZapierCredentialApproved` — Admin approves a request
- `ZapierCredentialDenied` — Admin denies a request

These must also be registered in:
- `services/permissions/handlers/event-router.ts` (exhaustive switch)
- `services/request-state-api/event-routing.ts` (if async tracking needed)
```

### 18.2 New Claude Code Skill: `create-rest-api-write-endpoint`

This skill orchestrates the full workflow for adding a new write endpoint to the external API, including the Zapier contract step.

#### Skill Definition

File: `packages/external-api/.claude/skills/create-rest-api-write-endpoint/SKILL.md`

```markdown
---
name: create-rest-api-write-endpoint
description: Creates a new write endpoint (POST/PUT/DELETE) in the external
  REST API with Zod schemas, route handler, service, OpenAPI registration,
  tests, and Zapier contract validation. Follows the existing external-api
  patterns and ensures the Zapier integration contract is updated.
argument-hint: <http-method> <entity-name> (e.g., POST risks, PUT issues, DELETE actions)
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Task
---

## Required Arguments

- `$1` (http-method): HTTP method — `POST`, `PUT`, or `DELETE`
- `$2` (entity-name): Plural kebab-case entity name matching the
  route file (e.g., `risks`, `issues`, `actions`, `third-parties`)

## Argument Validation

Check both args are present. If missing, STOP and tell the user:

> Usage: `create-rest-api-write-endpoint <POST|PUT|DELETE> <entity-name>`
> Example: `create-rest-api-write-endpoint POST issues`

## Steps

### 1. Derive naming conventions

From the arguments, derive:

- **route file**: `packages/external-api/src/routes/{entity-name}.routes.ts`
- **service file**: `packages/external-api/src/services/{entity-name}/{entity-name}.service.ts`
- **schema dir**: `packages/external-api/src/schemas/{entity-name}/`
- **test dir**: `packages/external-api/src/services/{entity-name}/__tests__/`
- **PascalCase**: e.g., `issues` → `Issue`, `third-parties` → `ThirdParty`
- **method-specific names**:
  - POST → `Create{Pascal}Schema`, `create{Pascal}`, `registerResourceCreatePath`
  - PUT → `Update{Pascal}Schema`, `update{Pascal}`, `registerResourceUpdatePath`
  - DELETE → `delete{Pascal}`, `registerResourceDeletePath`

### 2. Research existing patterns

Read the existing route, service, and schema files for this entity
to understand what already exists.

Also read a reference write endpoint that already works:

```
packages/external-api/src/routes/risks.routes.ts    # POST/PUT/DELETE exist
packages/external-api/src/services/risks/            # Full CRUD service
packages/external-api/src/schemas/risks/             # Create/Update schemas
```

### 3. Check for entity-specific considerations

Read the entity's Drizzle table schema to understand:
- Required fields vs nullable
- Custom attributes column (JSONB)?
- Linked items support?
- Audit trail implications

```bash
grep -r "entity_name" packages/drizzle/src/schema.ts
```

### 4. Create the request schema

In `packages/external-api/src/schemas/{entity}/`:

Create `{entity}-mutate-request.schema.ts` with:
- Zod schema extending or picking from the response schema
- Omit auto-generated fields: `id`, `createdAt`, `updatedAt`, `createdBy`,
  `updatedBy`, `sequentialId`, `links`, `owners`, `contributors`, `tags`
- Include `customAttributeData` if entity has custom attributes
- Include `parentId` if entity supports linked items on create
- Register with OpenAPI via `extendZodWithOpenApi`

Follow the pattern in:
`packages/external-api/src/schemas/risks/risk-mutate-request.schema.ts`

### 5. Create the service method

In `packages/external-api/src/services/{entity}/{entity}.service.ts`:

Add the write method following the risks service pattern:
- Accept request body validated by the Zod schema
- Call internal tRPC client (wrapped in circuit breaker)
- Return the created/updated entity
- Handle custom attribute data mapping if applicable

### 6. Create the route handler

In `packages/external-api/src/routes/{entity}.routes.ts`:

Add the route using `createAsyncAuthedHandler()`:
- Validate request body with Zod schema
- Check required scopes (e.g., `{entity}:create`, `{entity}:update`)
- Call service method
- Return appropriate status code (201 for POST, 200 for PUT, 204 for DELETE)

### 7. Register OpenAPI documentation

Using the helpers from `schemas/openapi/`:
- POST: `registerResourceCreatePath(registry, config)`
- PUT: `registerResourceUpdatePath(registry, config)`
- DELETE: `registerResourceDeletePath(registry, config)`

### 8. Create unit tests

In `packages/external-api/src/services/{entity}/__tests__/`:

Follow existing test patterns:
- Mock tRPC client
- Test happy path (valid input → correct tRPC call)
- Test validation (invalid input → 400)
- Test auth (missing/wrong scope → 403)
- Test custom attribute data mapping if applicable

### 9. Zapier contract check ← CRITICAL

Run the Zapier API contract validator:

```bash
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app
```

**If it passes**: The new endpoint doesn't conflict with existing Zapier triggers/actions. Proceed.

**If it fails**: A response schema change broke an existing Zapier definition.
Fix the Zapier trigger/action definitions before committing.

### 10. Consider Zapier action

Check if this new endpoint should have a matching Zapier action:

1. Check ZAPIER_INTEGRATION_SPEC.md §17.6 (Write Endpoint Gaps table)

2. Consider creating a Zapier action at `packages/zapier-app/src/actions/{verb}_{entity}.ts`:
   - If the entity has custom fields, use dynamic `inputFields` from `src/fields/custom-fields.ts`
   - If the entity supports linked items, consider a compound "with links" variant

3. If the user wants the Zapier action, create it following the patterns
   in `packages/zapier-app/CLAUDE.md`.

### 11. Regenerate API snapshot

```bash
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app
```

This updates `api-contract.snapshot.json` to include the new endpoint.

### 12. Run lint + tests

```bash
pnpm exec turbo lint --filter=@risksmart-app/external-api
pnpm exec turbo test:unit --filter=@risksmart-app/external-api
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
```
```

### 18.3 New Claude Code Skill: `create-zapier-trigger-action`

File: `packages/zapier-app/.claude/skills/create-zapier-trigger-action/SKILL.md`

```markdown
---
name: create-zapier-trigger-action
description: Creates a new Zapier trigger or action with dynamic custom fields,
  linked item support, tests, and contract snapshot update. Reads the REST API
  schema to generate correct input/output field definitions.
argument-hint: <trigger|action|search> <entity-name> (e.g., trigger risks, action create_risk)
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

## Required Arguments

- `$1` (type): `trigger`, `action`, or `search`
- `$2` (name): kebab-case name (e.g., `new-risk`, `create-risk`, `find-control`)

## Steps

### 1. Read the REST API schema for this entity

Extract entity name from `$2` (e.g., `new-risk` → `risks`, `create-risk` → `risks`).

Read:
- `packages/external-api/src/schemas/{entity}/{entity}.schema.ts` — response shape
- `packages/external-api/src/schemas/{entity}/{entity}-mutate-request.schema.ts` — request shape (actions only)
- `packages/external-api/src/schemas/common/custom-fields.schema.ts` — custom field structure
- `packages/external-api/src/schemas/common/linked-item.schema.ts` — linked item structure

### 2. Check entity capabilities

Determine from the schema:
- Has custom fields? → Need dynamic `inputFields`/`outputFields`
- Has linked items? → Need compound "with links" variant for actions
- Has child resources? → List the available sub-routes (e.g., `/risks/:id/ratings`)

### 3. Generate static fields

Map the Zod schema fields to Zapier field definitions:

| Zod Type | Zapier Type |
|----------|-------------|
| `z.string()` | `{ type: 'string' }` |
| `z.string().min(1)` | `{ type: 'string', required: true }` |
| `z.number()` | `{ type: 'number' }` |
| `z.number().int()` | `{ type: 'integer' }` |
| `z.boolean()` | `{ type: 'boolean' }` |
| `isoDateTimeValue` | `{ type: 'datetime' }` |
| `z.string().nullable()` | `{ type: 'string', required: false }` |

### 4. Generate dynamic field loader (if custom fields)

If the entity has custom fields, create a dynamic field loader:
- Import `getCustomFields` from `src/fields/custom-fields.ts`
- Add as the last element in `inputFields` (actions) or `outputFields` (triggers)

### 5. Create the trigger/action/search file

In `packages/zapier-app/src/{type}s/{name}.ts`:
- Export `key`, `noun`, `display`, `operation`
- Use `rate-aware-request.ts` for all API calls
- Include `risksmart_version` query param
- Include `sample` with realistic test data

### 6. Register in index.ts

Add to the appropriate section in `packages/zapier-app/src/index.ts`.

### 7. Create test

In `packages/zapier-app/test/{type}s/{name}.test.ts`:
- Test happy path against local API
- Test with invalid API key (401)
- Test dynamic fields resolve correctly (if custom fields)

### 8. Update API contract snapshot

```bash
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app
```

### 10. Run tests

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app
```
```

### 18.4 Claude Code Agent: `zapier-contract-agent`

File: `.claude/agents/zapier.md`

```markdown
---
name: zapier-contract-agent
description: Orchestrates Zapier integration maintenance — validates API
  contracts, creates triggers/actions for new endpoints, and keeps Super Zap
  sequences in sync. Dispatches to package-level skills.
allowed-tools: Task, Read, Glob, Grep, Bash, TaskCreate, TaskUpdate, TaskList
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
2. If the endpoint unblocks a Super Zap, dispatch `create-zapier-trigger-action`
3. Validate contract: `validate:api-contract`
4. Regenerate snapshot: `generate:api-snapshot`
5. Run all tests across both packages

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
```

### 18.5 Turborepo Task Dependency Graph

The Zapier contract validation plugs into the existing Turborepo pipeline:

```
┌─────────────────────┐
│  external-api#build  │  ← Zod schemas compiled
└──────────┬──────────┘
           │ depends on
           ▼
┌──────────────────────────────────┐
│  zapier-app#generate:api-snapshot │  ← Extract schemas Zapier depends on
└──────────┬───────────────────────┘
           │ depends on
           ▼
┌──────────────────────────────────┐
│  zapier-app#validate:api-contract │  ← Diff current vs snapshot → FAIL on break
└──────────┬───────────────────────┘
           │ depends on
           ▼
┌──────────────────────────┐
│  zapier-app#test:unit     │  ← Zapier trigger/action tests
└──────────────────────────┘
```

```json
// turbo.json (complete Zapier task additions)
{
  "tasks": {
    "generate:api-snapshot": {
      "dependsOn": ["@risksmart-app/external-api#build"],
      "outputs": ["api-contract.snapshot.json"],
      "cache": false
    },
    "validate:api-contract": {
      "dependsOn": ["generate:api-snapshot"],
      "inputs": [
        "api-contract.snapshot.json",
        "src/triggers/**",
        "src/actions/**",
        "src/searches/**",
        "src/super-zaps/registry.ts"
      ]
    },
    "validate": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

### 18.6 Pre-Commit Hook (Optional)

For developers who want immediate feedback before pushing:

```bash
# .husky/pre-commit (addition)
# Check if external-api schemas were modified
if git diff --cached --name-only | grep -q "packages/external-api/src/schemas/"; then
  echo "📋 External API schemas modified — validating Zapier contract..."
  pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app
fi
```

### 18.7 Summary: What Fires When

| Developer Action | What Happens Automatically |
|-----------------|---------------------------|
| Modify a Zod response schema in `external-api` | Turborepo runs `validate:api-contract` → **CI fails** if breaking change |
| Add a new REST write endpoint | Skill prompts: "This unblocks Super Zap SZ-N — create Zapier action?" |
| Create a Zapier trigger/action | Skill reads REST API schema → generates fields → runs contract validation |
| Push without updating Zapier app | Pre-commit hook (if enabled) catches it; CI always catches it |
| Remove a REST endpoint | Contract validator flags every Zapier trigger/action referencing it |
| Add a custom field type | Zapier's dynamic `inputFields` handles it automatically (no code change) |
| Change pagination shape | Contract validator flags `PageInfo` schema change |
| Run `create-rest-api-write-endpoint` skill | Steps 9-11 automatically validate + snapshot + check Super Zaps |
