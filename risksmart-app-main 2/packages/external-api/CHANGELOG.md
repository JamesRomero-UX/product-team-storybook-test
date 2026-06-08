# @risksmart-app/external-api

## 0.43.0

### Minor Changes

- Adds read endpoints for department groups, list users, and tags.

## 0.42.0

### Minor Changes

- Adds custom fields mutations to resource endpoints.

## 0.41.0

### Minor Changes

- Adds department read endpoints

## 0.40.0

### Minor Changes

- Adds user-groups list and get endpoints to the API.

## 0.39.0

### Minor Changes

- Adds get /schema endpoints to resources that return custom field configurations.

## 0.38.1

### Patch Changes

- Introduces a mutation transformer layer for PUT endpoints to map default data on update.

## 0.38.0

### Minor Changes

- Adds /account endpoint to return current api account details.
- Makes the `status` field required (previously optional/nullish) on issue assessment POST and PUT endpoints introduced in 0.36.0.

## 0.37.2

### Patch Changes

- Updates OpenAPI examples and descriptions for API facing schemas

## 0.37.1

### Patch Changes

- Updated mutation owners verification to make single filtered user list call to tRPC.

## 0.37.0

### Minor Changes

- Removes tier field from risk mutations and instead derives it from parentRiskId.

## 0.36.0

### Minor Changes

- Adds issue assessment post and put endpoints.

## 0.35.0

### Minor Changes

- Adds action mutation & issue action create endpoints.

## 0.34.3

### Patch Changes

- Removes js file suffix from imports and updates eslint rule to match.

## 0.34.2

### Patch Changes

- Bugfix: New credential with the same name as deleted returns error.

## 0.34.1

### Patch Changes

- Bugfix: Adds user scopes for new api credentials.

## 0.34.0

### Minor Changes

- Adds indicator results mutation endpoints (create, update, delete).
- Adds create endpoint for risk indicators.

## 0.33.0

### Minor Changes

- Adds issue mutation endpoints for create, update, and delete.

## 0.32.2

### Patch Changes

- Cleans up base error handling & adds an owner user ID check to risk mutations.

## 0.32.1

### Patch Changes

- Updates graphQL request header for tenant-name and refactors graphQL client layer.

## 0.32.0

### Minor Changes

- Adds indicators mutation endpoints POST, PUT, & DELETE

## 0.31.1

### Patch Changes

- Adds Risk mutation schemas to openapi spec & docs.

## 0.31.0

### Minor Changes

- Adds mutation endpoints put & delete for risks resources.

## 0.30.0

### Minor Changes

- Updates custom fields schema structure.

## 0.29.0

### Minor Changes

- Adds POST api/v1/risks endpoint and graphql data service.

## 0.28.2

### Patch Changes

- fixes bugs found in GET reponses for impacts, assessments, issues, and risks.

## 0.28.1

### Patch Changes

- Updated API docs with auth token endpoint, customFields responses, and rate limit info.

## 0.28.0

### Minor Changes

- Adds profile based rate limiters for API endpoints.

## 0.27.1

### Patch Changes

- Updated app client endpoints to support web app.

## 0.27.0

### Minor Changes

- Updates upstream validation error handling responses.

## 0.26.0

### Minor Changes

- Adds Updates API documentation page.

## 0.25.0

### Minor Changes

- Updates build script to use tsup.

## 0.24.4

### Patch Changes

- Adds rate limit profile default to new clients and rl_profile claim to jwt tokens.

## 0.24.3

### Patch Changes

- Updates new cognito client to have default scopes assigned.

## 0.24.2

### Patch Changes

- Updates container deploy permissions.

## 0.24.1

### Patch Changes

- Updates endpoint permission scopes implementation.

## 0.24.0

### Minor Changes

- Updates api/v1/docs endpoint to accept signed urls

## 0.23.0

### Minor Changes

- Adds API client management endpoints for user based tokens.

## 0.22.1

### Patch Changes

- Adds compression to the API endpoint responses.

## 0.22.0

### Minor Changes

- Updates client endpoints to use auth0 tokens as jwt provider.

## 0.21.7

### Patch Changes

- updated api internal structure

## 0.21.4

### Patch Changes

- Logging updated to stream via datadog.

## 0.21.3

### Patch Changes

- Updates accepted string formats for provider & user ids in responses.

## 0.21.2

### Patch Changes

- Updates user id fields to accept "provider|id", uuid, or "SYSTEM" string formats.

## 0.21.1

### Patch Changes

- Fixes customFields bug where entries are skipped from response due to malformed metadata properties. Updates risks responses with schedule & riskScore fields

## 0.21.0

### Minor Changes

- Adds indicator schedule info to response and indicator results nested endpoints.

## 0.20.0

### Minor Changes

- Adds endpoints for issues nested resources: updates, causes, consequences, assessments, and actions.

## 0.19.1

### Patch Changes

- Updates ext-api container monitoring.

## 0.19.0

### Minor Changes

- Adds endpoints for enterprise risks nested risks list (/api/v1/enterprise-risks/:id/risks).

## 0.18.0

### Minor Changes

- Adds /linked-items read endpoint to resources: actions, controls, indicators, obligations, policies, third-parties, risks, and issues

## 0.17.0

### Minor Changes

- Adds endpoints for risk approvals (/api/v1/risks/:risk-id/approvals & /api/v1/risks/:risk-id/approvals/:approval-id).

## 0.16.1

### Patch Changes

- Updates application configuration

## 0.16.0

### Minor Changes

- Adds endpoints for risk acceptances (/api/v1/risks/:risk-id/acceptances & /api/v1/risks/:risk-id/acceptances/:acceptance-id).

## 0.15.0

### Minor Changes

- Adds endpoints for impacts (/api/v1/impacts & /api/v1/impacts/:impact-id) and risk impacts (~/risks/:risk-id/impacts).

## 0.14.0

### Minor Changes

- Added endpoint for risk ratings list (~/risks/:risk-id/rating) and rating by id (~/risks/:risk-id/ratings/:rating-id).

## 0.13.0

### Minor Changes

- Added endpoint for risk indicators (~/risks/:risk-id/appetites) and appetite by id (~/risks/:risk-id/appetites/:appetite-id).

## 0.12.0

### Minor Changes

- Added endpoint for risk indicators (~/risks/:risk-id/indicators).

## 0.11.0

### Minor Changes

- Added endpoint for risk actions (~/risks/:risk-id/actions).

## 0.10.0

### Minor Changes

- Added endpoint for risk controls (~/risks/:risk-id/controls).

## 0.9.0

### Minor Changes

- Adds enterprise risks read endpoints

## 0.8.0

### Minor Changes

- Adds new read endpoints for assessments, indicators, obligations, third party, users (by Id only).

## 0.7.0

### Minor Changes

- Adds basic read issues & policies endpoints.

## 0.6.0

### Minor Changes

- Adds compat versioning via account pinning, or request "Risksmart-Version" header value.

## 0.5.1

### Patch Changes

- App structure cleanup and improved request error handling.

## 0.5.0

### Minor Changes

- Adds actions list and actions by id endpoints (readonly) to the API.

## 0.4.0

### Minor Changes

- Adds an expandable customFields attribute to the risks/<id> & controls/<id> endpoints response json.

## 0.3.1

### Patch Changes

- Fixes minor bug in scope parsing.

## 0.3.0

### Minor Changes

- Adds cursor based pagination options & page size to list endpoints. Additionally updates list response body with pageInfo object.

## 0.2.2

### Patch Changes

- Updated API documentation with Risksmart branding and styles. Added docs-as-markdown route for llm usage.

## 0.2.1

### Patch Changes

- Adds controls routes to API resources.

## 0.2.0

### Minor Changes

- Adds get risk list & risk by id endpoint content.

## 0.1.7

### Patch Changes

- Fixes config defaults and adds routes base path ("/api/v1") to app config options.

## 0.1.6

### Patch Changes

- updates endpoint permissions to use JWT scopes

## 0.1.5

### Patch Changes

- default org auth client limit max 10.

## 0.1.4

### Patch Changes

- fixes pre-token lambda custom claims response

## 0.1.3

### Patch Changes

- updates token lambda and auth breaker config

## 0.1.2

### Patch Changes

- fix for container build

## 0.1.1

### Patch Changes

- Adds access token endpoint

## 0.1.0

### Minor Changes

- 9b592f4: Removed references to deprecated types.

## 0.0.8

### Patch Changes

- Updates config loading

## 0.0.7

### Patch Changes

- fixes container deploy issues

## 0.0.6

### Patch Changes

- Adds POST v1/app-client endpoint

## 0.0.5

### Patch Changes

- adds pre token permissions

## 0.0.4

### Patch Changes

- updated eternal-api infra

## 0.0.3

### Patch Changes

- Added infrastructure for external-api deploy.

## 0.0.2

### Patch Changes

- setting up version changesets for external-api
