#!/usr/bin/env node
/**
 * setDefaultTenantPreferenceSet.mjs
 *
 * Usage:
 *  pnpm --filter @risksmart-app/knock run knock:set-tenant-pref -- --org-id ORG_123
 *  or from repo root:
 *  pnpm -F @risksmart-app/knock knock:set-tenant-pref -- --org-id ORG_123
 *
 * Required env:
 *  KNOCK_API_KEY=sk_... (service token with tenant write scope)
 *  (Optionally loaded from .env in monorepo root or package directory)
 */
import 'dotenv/config';

const args = process.argv.slice(2);
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--org-id') { out.orgId = argv[++i]; }
    else if (a === '--dry-run') { out.dryRun = true; }
    else if (a === '--endpoint') { out.endpoint = argv[++i]; }
    else if (a === '--skip-fetch-current') { out.skipFetchCurrent = true; }
    else if (a === '--verbose') { out.verbose = true; }
    else if (a === '--create-tenant') { out.createTenant = true; }
    else if (a === '--tenant-name') { out.tenantName = argv[++i]; }
    // (deprecated flags --use-set-endpoint / --apply-method removed in cleanup)
  }
  return out;
}

const { orgId, dryRun = false, endpoint = 'https://api.knock.app/v1', skipFetchCurrent = false, verbose = false, createTenant = false, tenantName } = parseArgs(args);

if (!orgId) {
  console.error('Missing required --org-id <tenant_id> argument');
  process.exit(1);
}

let apiKey = process.env.KNOCK_API_KEY || process.env.KNOCK_SERVICE_TOKEN || process.env.KNOCK_TOKEN;
if (!apiKey) {
  console.error('Missing Knock API key. Set KNOCK_API_KEY in environment or .env file.');
  process.exit(1);
}
apiKey = apiKey.trim();
if (apiKey.startsWith('=')) {
  console.warn('[WARN] API key appears to start with an = (possible formatting issue in .env). Stripping leading = for request.');
  apiKey = apiKey.replace(/^=+/, '');
}

// Preference set payload (organisation-controlled defaults)
const preferenceSet = {
  settings: {
    preference_set: {
      __persistence_strategy__: 'replace',
      channel_types: {
        chat: true,
        email: true,
        in_app_feed: true,
        push: false,
        sms: false
      },
      // NOTE: categories and workflows maintained in pure alphabetical order.
      categories: {
        actions: { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        attestations: { channel_types: { email: false, in_app_feed: false } },
        requests: { channel_types: { email: false, in_app_feed: true } },
        controls: { channel_types: { email: false, in_app_feed: false } },
        documents: { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        indicators: { channel_types: { email: false, in_app_feed: false } },
        issues: { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        policy: { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        risks: { channel_types: { email: false, in_app_feed: false } },
        'third-party': { channel_types: { email: false, in_app_feed: false } }
      },
      workflows: {
        'action-delete': { channel_types: { email: false, in_app_feed: false } },
        'action-due': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'action-insert': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'action-overdue': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'action-update': { channel_types: { email: false, in_app_feed: false } },
        'change-request-insert': { channel_types: { email: false, in_app_feed: false } },
        'change-request-rejected': { channel_types: { email: false, in_app_feed: false } },
        'control-delete': { channel_types: { email: false, in_app_feed: false } },
        'control-insert': { channel_types: { email: false, in_app_feed: false } },
        'control-test-due': { channel_types: { email: false, in_app_feed: false } },
        'control-test-overdue': { channel_types: { email: false, in_app_feed: false } },
        'control-update': { channel_types: { email: false, in_app_feed: false } },
        'document-delete': { channel_types: { email: false, in_app_feed: false } },
        'document-due': { channel_types: { email: false, in_app_feed: false } },
        'document-insert': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'document-overdue': { channel_types: { email: false, in_app_feed: false } },
        'document-update': { channel_types: { email: false, in_app_feed: false } },
        'indicator-due': { channel_types: { email: false, in_app_feed: false } },
        'issue-delete': { channel_types: { email: false, in_app_feed: false } },
        'issue-due': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'issue-insert': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'issue-overdue': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'issue-update': { channel_types: { email: false, in_app_feed: false } },
        'policy-approver': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'policy-document-version-review-due': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'policy-document-version-review-upcoming': { __strategy__: 'replace', channel_types: { email: true, in_app_feed: true } },
        'risk-assessment-due': { channel_types: { email: false, in_app_feed: false } },
        'risk-assessment-overdue': { channel_types: { email: false, in_app_feed: false } },
        'risk-delete': { channel_types: { email: false, in_app_feed: false } },
        'risk-insert': { channel_types: { email: false, in_app_feed: false } },
        'risk-update': { channel_types: { email: false, in_app_feed: false } },
        'third-party-response-submitted': { channel_types: { email: false, in_app_feed: false } }
      }
    }
  }
};

async function fetchCurrent() {
  if (skipFetchCurrent) {
    console.log('[INFO] Skipping fetch of current tenant settings (--skip-fetch-current supplied)');
    return null;
  }
  const getUrl = `${endpoint.replace(/\/$/, '')}/tenants/${encodeURIComponent(orgId)}`;
  try {
    if (verbose) {
      console.log('[VERBOSE] GET', getUrl);
    }
    const r = await fetch(getUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!r.ok) {
      console.warn(`[WARN] Failed to fetch current tenant (${r.status} ${r.statusText}). Proceeding with set.`);
      if (verbose) {
        const hdrs = {};
        r.headers.forEach((v, k) => { hdrs[k] = v; });
        console.log('[VERBOSE] GET response headers:', hdrs);
        const bodyText = await r.text().catch(() => '<unavailable>');
        console.log('[VERBOSE] GET response body snippet:', bodyText.slice(0, 400));
      }
      if (r.status === 404) {
        return { __notFound: true };
      }
      return null;
    }
    const data = await r.json().catch(() => null);
    console.log('[CURRENT TENANT SETTINGS]');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.warn('[WARN] Error fetching current tenant settings:', e.message);
    return null;
  }
}

async function createTenantIfNeeded(notFoundResult) {
  if (!createTenant) {
    if (notFoundResult && notFoundResult.__notFound) {
      console.error('Tenant does not exist (404). Re-run with --create-tenant to create it automatically before setting preferences.');
    }
    return;
  }
  if (notFoundResult && notFoundResult.__notFound) {
    const putUrl = `${endpoint.replace(/\/$/, '')}/tenants/${encodeURIComponent(orgId)}`;
    const payload = { name: tenantName || orgId, properties: { display_name: tenantName || orgId } };
    if (verbose) {
      console.log('[VERBOSE] PUT (create tenant)', putUrl, JSON.stringify(payload));
    } else {
      console.log('[INFO] Creating tenant', orgId);
    }
    const r = await fetch(putUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '<no body>');
      console.error('Failed to create tenant:', r.status, r.statusText);
      if (verbose) {
        console.error(text);
      }
      process.exit(1);
    }
    console.log('[INFO] Tenant created successfully.');
  }
}

async function main() {
  // Always attempt to show existing (unless skipped) even in dry-run to aid comparison
  const current = await fetchCurrent();
  if (current && current.__notFound) {
    await createTenantIfNeeded(current);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Would send preference set for tenant', orgId);
    console.log(JSON.stringify(preferenceSet, null, 2));
    return;
  }

  // Apply preference set (idempotent upsert) via PUT /tenants/{id}
  const applyUrl = `${endpoint.replace(/\/$/, '')}/tenants/${encodeURIComponent(orgId)}`;
  if (verbose) {
    console.log('[VERBOSE] PUT (apply preference set)', applyUrl);
  }
  const res = await fetch(applyUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(preferenceSet),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to set tenant preference set:', res.status, res.statusText);
    if (verbose) {
      const hdrs = {}; res.headers.forEach((v, k) => { hdrs[k] = v; });
      console.error('[VERBOSE] PUT response headers:', hdrs);
      console.error('[VERBOSE] PUT response body:', text);
    } else {
      console.error(text.slice(0, 500));
    }
    if (res.status === 404) {
      console.error('[HINT] 404 Not Found. Ensure tenant exists (use --create-tenant) and that your API key has tenant write scope.');
    }
    process.exit(1);
  }

  const json = await res.json().catch(() => ({}));
  console.log('Preference set applied successfully for tenant', orgId);
  if (Object.keys(json || {}).length) {
    console.log(JSON.stringify(json, null, 2));
  }
}

main().catch(err => {
  console.error('Unexpected error', err);
  process.exit(1);
});
