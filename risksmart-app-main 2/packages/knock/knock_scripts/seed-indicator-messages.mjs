#!/usr/bin/env node

/**
 * Seed Knock with notification messages for a specific indicator object.
 *
 * Triggers indicator-specific, change-request, and CRUD (insert/update/delete)
 * workflows so the entity notification history tab has realistic data for local dev.
 *
 * Note: There are no indicator-insert, indicator-update, or indicator-delete
 * workflows in Knock — indicators only have due/overdue. The insert/update/delete
 * workflows below use the generic entity workflow keys that fire when an
 * indicator's parent entities change (e.g. risk-insert when a risk linked to
 * the indicator is created). These are included to exercise the full range of
 * workflow types that could appear in an entity's notification history.
 *
 * Usage:
 *   node packages/knock/knock_scripts/seed-indicator-messages.mjs [indicatorId]
 *
 * Arguments:
 *   indicatorId  - (optional) UUID override. Defaults to seed indicator
 *                  "Counting Sheep" (b8694ef8-2f4c-4b41-9c77-60fb44163736)
 *
 * Environment:
 *   Reads KNOCK_SECRET_KEY from the repo root .env file.
 *   Optionally set KNOCK_HOST to override the API base.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = resolve(__dirname, '..', '..', '..', '.env');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

const dotenv = loadEnv();

const KNOCK_SECRET_KEY =
  process.env.KNOCK_SECRET_KEY || dotenv.KNOCK_SECRET_KEY;
const KNOCK_HOST =
  process.env.KNOCK_HOST || dotenv.KNOCK_HOST || 'https://api.knock.app';

if (!KNOCK_SECRET_KEY) {
  console.error('KNOCK_SECRET_KEY is required. Set it in .env or as env var.');
  process.exit(1);
}

// Seed indicator from api-stack/hasura/seeds/default/1694532234502_Indicators.sql
const DEFAULT_INDICATOR_ID = 'b8694ef8-2f4c-4b41-9c77-60fb44163736';
const INDICATOR_TITLE = 'Counting Sheep';

const indicatorId = process.argv[2] || DEFAULT_INDICATOR_ID;

// Tenant & users matching seed-knock-dev.mjs / Hasura seeds
// In local dev the JWT's x-hasura-tenant-name is "multitenant", which the
// tRPC getKnockTenant() helper passes through to the Knock Messages API.
// The seed must use the same tenant so filtered queries match.
const TENANT = process.env.KNOCK_TENANT_OVERRIDE || dotenv.KNOCK_TENANT_OVERRIDE || 'org_Qshp7tYsxxAWwhVa';

const USERS = {
  riskManager: {
    id: 'auth0|644151efc3a961d2784456d9',
    email: 'user1@user.com',
    name: 'Risk Manager 1',
  },
  standard: {
    id: 'auth0|644152102c766a09dd585d2e',
    email: 'user2@user.com',
    name: 'Standard User 1',
  },
};

// ---------------------------------------------------------------------------
// Workflows to trigger for this indicator
// ---------------------------------------------------------------------------

const WORKFLOWS = [
  // Indicator-specific
  {
    key: 'indicator-due',
    label: 'Indicator due',
    data: { objectTimeStamp: '28 Feb 2026, 09:00' },
  },
  {
    key: 'indicator-overdue',
    label: 'Indicator overdue',
    data: { objectTimeStamp: '15 Jan 2026, 09:00' },
  },

  // Change requests (indicator as parent object)
  {
    key: 'change-request-insert',
    label: 'Change request submitted',
    data: {},
  },
  {
    key: 'change-request-rejected',
    label: 'Change request rejected',
    data: {},
  },

  // Insert / update / delete — use risk-* workflows as proxies to generate
  // messages with the indicator's objectId so they appear in its history.
  {
    key: 'risk-insert',
    label: 'Insert (risk-insert proxy)',
    data: { objectTitle: `${INDICATOR_TITLE} — linked risk created` },
  },
  {
    key: 'risk-update',
    label: 'Update (risk-update proxy)',
    data: { objectTitle: `${INDICATOR_TITLE} — linked risk updated` },
  },
  {
    key: 'risk-delete',
    label: 'Delete (risk-delete proxy)',
    data: { objectTitle: `${INDICATOR_TITLE} — linked risk deleted` },
  },
];

// ---------------------------------------------------------------------------
// API helpers (mirrors seed-knock-dev.mjs)
// ---------------------------------------------------------------------------

async function identifyUser(user) {
  const url = `${KNOCK_HOST}/v1/users/${user.id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KNOCK_SECRET_KEY}`,
    },
    body: JSON.stringify({ name: user.name, email: user.email }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to identify user ${user.email}: ${response.status} ${text}`
    );
  }
  return response.json();
}

async function triggerWorkflow(workflow, recipient, actor) {
  const url = `${KNOCK_HOST}/v1/workflows/${workflow.key}/trigger`;

  const body = {
    recipients: [recipient.id],
    actor: { id: actor.id, name: actor.name, email: actor.email },
    tenant: TENANT,
    data: {
      org_id: TENANT,
      objectId: indicatorId,
      objectTitle: workflow.data?.objectTitle ?? INDICATOR_TITLE,
      objectSequenceId: `IND-${Math.floor(Math.random() * 9000) + 1000}`,
      objectTimeStamp:
        workflow.data?.objectTimeStamp ?? new Date().toLocaleString('en-GB'),
      objectParent: {
        id: indicatorId,
        title: INDICATOR_TITLE,
        sequenceId: 'IND-001',
        url: `/indicators/${indicatorId}`,
      },
      orgName: 'Test Organization 1',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
      ...workflow.data,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KNOCK_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `${response.status}: ${text}` };
    }

    const result = await response.json();
    return { ok: true, workflowRunId: result.workflow_run_id };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seed Indicator Notification Messages');
  console.log('====================================');
  console.log(`API Base:      ${KNOCK_HOST}`);
  console.log(`Tenant:        ${TENANT}`);
  console.log(`Indicator ID:  ${indicatorId}`);
  console.log(`Indicator:     ${INDICATOR_TITLE}`);
  console.log(`Workflows:     ${WORKFLOWS.length}`);
  console.log(
    `Recipients:    ${Object.values(USERS).map((u) => u.email).join(', ')}`
  );
  console.log('');

  // Step 1: Identify users in Knock
  console.log('Identifying users in Knock...');
  for (const user of Object.values(USERS)) {
    try {
      await identifyUser(user);
      console.log(`  [OK] Identified ${user.email} (${user.id})`);
    } catch (err) {
      console.error(`  [FAIL] ${err.message}`);
      process.exit(1);
    }
  }
  console.log('');

  // Step 2: Trigger each workflow for both recipients
  console.log('Triggering workflows...');
  const recipients = [USERS.riskManager, USERS.standard];
  let successCount = 0;
  let failCount = 0;

  for (const workflow of WORKFLOWS) {
    for (const recipient of recipients) {
      const actor =
        recipient === USERS.riskManager ? USERS.standard : USERS.riskManager;

      const result = await triggerWorkflow(workflow, recipient, actor);

      if (result.ok) {
        successCount++;
        console.log(
          `  [OK]   ${workflow.key.padEnd(30)} -> ${recipient.email.padEnd(20)} (${workflow.label})`
        );
      } else {
        failCount++;
        console.log(
          `  [FAIL] ${workflow.key.padEnd(30)} -> ${recipient.email.padEnd(20)}: ${result.error}`
        );
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log('');
  console.log('Done!');
  console.log(`  Triggered: ${successCount + failCount}`);
  console.log(`  Success:   ${successCount}`);
  console.log(`  Failed:    ${failCount}`);
  console.log('');
  console.log(
    'Knock processes workflows asynchronously. Messages should appear'
  );
  console.log('in the Notification History tab within a few seconds.');
  console.log('');
  console.log('Verify with:');
  console.log(
    `  node packages/knock/knock_scripts/test-messages-list.mjs ${indicatorId} ${TENANT}`
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
