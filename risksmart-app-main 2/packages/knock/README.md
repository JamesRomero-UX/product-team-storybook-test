<!-- knock cli setup -->

# Knock Package

## Knock CLI Setup

### Install Knock CLI

```bash
npm install -g @knocklabs/cli
```

### Setup Knock CLI

#### Authentication

If you are running on mac or linux, you can use the helper script `./configure-knock.sh`
to setup your service token.

Ask your friendly neighbourhood Knock admin for a service token. then run the following command:

```bash
> pnpm run knock:configure

== KNOCK CONFIGURATION ==
Note: this script only works with mac or linux.

SERVICE TOKEN: myservicetoken
```

#### Manual Setup

The Knock CLI relies on a service token to authenticate and make requests to your Knock account. You can specify a service token in all CLI calls, or you can optionally use a configuration file to authenticate all requests.

[Knock CLI Authentication Docs](https://docs.knock.app/cli#authentication)

### Pull workflows & partials

```bash
# Workflows
knock workflow pull --all --workflows-dir=./workflows
# Partials
knock partial pull --all --partials-dir=./partials
```

or

```bash
pnpm run knock:pull
```

### Push workflows & partials

```bash
# Workflows
knock workflow push --all --workflows-dir=./workflows
# Partials
knock partial push --all --partials-dir=./partials
```

or

```bash
pnpm run knock:push
```

### Directory Structure

```text
packages/knock/
  workflows/   # Knock workflows managed via CLI
  partials/    # Knock partials (reusable blocks) managed via CLI
```

Add new partial definitions inside `partials/` then run `pnpm run knock:push` to sync.

### Set default tenant preference set

Creates or overwrites an organisation-level (tenant) preference set in Knock with enforced (replace) strategies for categories and workflows.

By default the script first fetches and logs the existing tenant settings (if the tenant exists) before applying the new set. Use `--skip-fetch-current` to bypass this step.

Environment:

```bash
KNOCK_API_KEY=sk_...  # service token with tenant write permissions
```

Dry run:

```bash
pnpm -F @risksmart-app/knock knock:set-tenant-pref -- --org-id ORG_TEST --dry-run
```

Execute (will call Knock API):

```bash
pnpm -F @risksmart-app/knock knock:set-tenant-pref -- --org-id ORG_TEST
```

Optional flags:

```text
--endpoint https://api.knock.app/v1   # override base endpoint (e.g. for staging)
--dry-run                             # print payload only; still fetches current unless skipped
--skip-fetch-current                  # do not GET existing tenant settings first
```

### Bulk initialize existing user preference sets

Purpose: ensure all existing users start with the standard enforced preference structure (e.g., after introducing notification preferences). This script applies the same preference payload used at tenant level to each listed user.

Usage (users file newline-delimited or CSV first column):

```bash
pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_TEST --users-file ./users.txt
```

Specify users inline (repeat flag):

```bash
pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_TEST --user-id user_a --user-id user_b
```

Dry run (no writes, shows plan + payload):

```bash
pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_TEST --users-file ./users.txt --dry-run
```

Flags:

```text
--org-id <id>          (required) tenant/org context (informational only; user endpoint does not embed org)
--users-file <path>    newline or CSV list of user IDs (first column used)
--user-id <id>         specify a single user (repeatable)
--csv-column <name>    when a header row exists, choose which column contains the user id (default: first column or auto-detected if header includes user/id/email)
--email-column <name>  optional email column name (if present) used when ensuring user creation
--ensure-user          PUT /users/{id} (and email if available) before applying preferences (idempotent)
--endpoint <url>       override API base (default https://api.knock.app/v1)
--concurrency <n>      parallel requests (default 5)
--dry-run              show actions without applying
--verbose              log each success
--skip-invalid         continue on failures and exit 0 (otherwise exit 1 if any fail)
```

Exit codes:

```text
0 = all succeeded (or only failures but --skip-invalid supplied)
1 = validation error or at least one failure without --skip-invalid
```

NOTE: Endpoint path used: PUT /users/{user_id}/preferences with a preference_set payload. Adjust the script if your Knock workspace uses a different user preference write endpoint.
If that endpoint returns 404, the script now attempts alternative candidates (/users/{id}/preference_set, /users/{id}/preferences/set) before failing.

## Deep Link Context in Notifications

Workflow trigger payloads now include two optional top-level `data` fields plus a per-recipient field to help construct tenant-aware links directly in Knock templates:

| Field | Purpose |
|-------|---------|
| `deepLinkBaseUrl` | Organisation-specific base URL (`organisation.Meta.baseUrl`) if defined. |
| `deepLinkOrgId` | Organisation key (always present) for `org_id` query param. |
| `recipient.connection` | (Per recipient) Auth0 connection name for that user when available. |

When `deepLinkBaseUrl` is undefined the template should fall back to the standard environment web app URL. A reusable helper also exists in code: `@risksmart-app/shared/links/buildDeepLink`.
