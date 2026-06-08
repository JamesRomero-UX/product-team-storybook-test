#!/usr/bin/env node

/**
 * Seed script to prime the Knock dev environment with notification data.
 *
 * Triggers every workflow key used in the app across multiple recipients,
 * generating messages on email, in-app, and chat channels so the
 * Notification History admin UI has realistic data to display.
 *
 * Usage:
 *   node scripts/seed-knock-dev.mjs
 *
 * Environment:
 *   Reads KNOCK_SECRET_KEY from the repo root .env file.
 *   Optionally set KNOCK_HOST to override the API base (defaults to https://api.knock.app).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
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

// The tenant that the local dev tRPC layer sends to Knock.
// The JWT tenant claim is lowercased in context.ts, so this must match.
// Override with KNOCK_TENANT_OVERRIDE env var if your setup differs.
const TENANT = process.env.KNOCK_TENANT_OVERRIDE || 'multitenant';

// Local dev user IDs (from packages/e2e/users.ts)
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
  // User with an invalid email to trigger bounced/undelivered statuses
  bounceTest: {
    id: 'seed-bounce-test-user',
    email: 'bounce@simulator.amazonses.com',
    name: 'Bounce Test User',
  },
};

// User groups (objects in the Org-user-groups collection)
const USER_GROUPS = [
  {
    collection: 'Org-user-groups',
    id: `${TENANT}-seed-group-risk-team`,
    name: 'Risk Management Team',
    email: 'risk-team@example.com',
  },
  {
    collection: 'Org-user-groups',
    id: `${TENANT}-seed-group-compliance`,
    name: 'Compliance Team',
    email: 'compliance@example.com',
  },
];

// ---------------------------------------------------------------------------
// Workflow definitions — every workflow key used in the app
// ---------------------------------------------------------------------------

const WORKFLOWS = [
  // Actions
  { key: 'action-insert', data: { objectTitle: 'Quarterly security review' } },
  { key: 'action-update', data: { objectTitle: 'Quarterly security review (updated)' } },
  { key: 'action-delete', data: { objectTitle: 'Deprecated action item' } },
  { key: 'action-due', data: { objectTitle: 'Submit compliance report', objectTimeStamp: '28 Feb 2026, 17:00' } },
  { key: 'action-overdue', data: { objectTitle: 'Overdue: Vendor risk assessment', objectTimeStamp: '15 Jan 2026, 09:00' } },

  // Controls
  { key: 'control-insert', data: { objectTitle: 'Access control policy enforcement' } },
  { key: 'control-update', data: { objectTitle: 'Firewall rule change monitoring' } },
  { key: 'control-delete', data: { objectTitle: 'Retired legacy control' } },
  { key: 'control-test-due', data: { objectTitle: 'Annual penetration test', objectTimeStamp: '01 Mar 2026, 09:00' } },
  { key: 'control-test-overdue', data: { objectTitle: 'Overdue: SOC 2 evidence collection', objectTimeStamp: '31 Dec 2025, 17:00' } },

  // Risks
  { key: 'risk-insert', data: { objectTitle: 'Data breach via phishing' } },
  { key: 'risk-update', data: { objectTitle: 'Supply chain disruption risk (revised)' } },
  { key: 'risk-delete', data: { objectTitle: 'Decommissioned system risk' } },
  { key: 'risk-assessment-due', data: { objectTitle: 'Cyber risk assessment Q1', objectTimeStamp: '15 Mar 2026, 09:00' } },
  { key: 'risk-assessment-overdue', data: { objectTitle: 'Overdue: Operational risk review', objectTimeStamp: '01 Jan 2026, 09:00' } },

  // Issues
  { key: 'issue-insert', data: { objectTitle: 'Unauthorized access detected' } },
  { key: 'issue-update', data: { objectTitle: 'Data quality issue in reports' } },
  { key: 'issue-delete', data: { objectTitle: 'Resolved false positive' } },
  { key: 'issue-due', data: { objectTitle: 'Remediate audit finding #42', objectTimeStamp: '10 Mar 2026, 17:00' } },
  { key: 'issue-overdue', data: { objectTitle: 'Overdue: GDPR compliance gap', objectTimeStamp: '15 Feb 2026, 09:00' } },

  // Documents / Policies
  { key: 'document-insert', data: { objectTitle: 'Information Security Policy v3' } },
  { key: 'document-update', data: { objectTitle: 'Acceptable Use Policy (revised)' } },
  { key: 'document-delete', data: { objectTitle: 'Superseded BCP document' } },
  { key: 'document-due', data: { objectTitle: 'Policy annual review due', objectTimeStamp: '01 Apr 2026, 09:00' } },
  { key: 'document-overdue', data: { objectTitle: 'Overdue: Privacy policy review', objectTimeStamp: '01 Dec 2025, 09:00' } },
  { key: 'policy-approver', data: { objectTitle: 'Data Retention Policy' } },
  { key: 'policy-attestation-reminder', data: { objectTitle: 'Annual policy attestation' } },
  { key: 'policy-document-version-review-due', data: { objectTitle: 'IT Security Policy v2.1' } },
  { key: 'policy-document-version-review-upcoming', data: { objectTitle: 'HR Policy v4 review window opens' } },

  // Indicators
  { key: 'indicator-due', data: { objectTitle: 'KRI: Failed login attempts threshold', objectTimeStamp: '28 Feb 2026, 09:00' } },
  { key: 'indicator-overdue', data: { objectTitle: 'Overdue: System uptime SLA metric', objectTimeStamp: '15 Jan 2026, 09:00' } },

  // Attestations
  { key: 'attestation-record-insert', data: { objectTitle: 'Code of Conduct attestation' } },

  // Change Requests
  { key: 'change-request-insert', data: { objectTitle: 'Change request: Update risk appetite' } },
  { key: 'change-request-rejected', data: { objectTitle: 'Rejected: Control removal request' } },

  // Third Party
  { key: 'third-party-new-questionnaire', data: { objectTitle: 'Vendor due diligence questionnaire' } },
  { key: 'third-party-password-reset', data: { objectTitle: 'Third party portal password reset' } },
  { key: 'third-party-recall-questionnaire', data: { objectTitle: 'Recalled: Outdated vendor questionnaire' } },
  { key: 'third-party-response-submitted', data: { objectTitle: 'Acme Corp submitted questionnaire response' } },
  { key: 'third-party-response-update-status', data: { objectTitle: 'Vendor response status updated to approved' } },
  { key: 'third-party-set-password', data: { objectTitle: 'Set password for third party portal' } },

  // NOTE: Digest workflow is seeded separately in Step 6 below with realistic
  // multi-activity data (sourceWorkflowKey, sourceVerb, etc.) so the batch
  // accumulates child activities that the admin UI can expand.
];

// ---------------------------------------------------------------------------
// Digest activity definitions — simulates what individual workflows pass
// to the digest workflow via trigger_workflow steps. Each entry becomes one
// activity inside the digest batch so the admin UI has realistic expandable
// rows to test.
// ---------------------------------------------------------------------------

const DIGEST_ACTIVITIES = [
  {
    sourceWorkflowKey: 'risk-insert',
    sourceWorkflowCategoriesName: 'risks',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-risk-digest-001',
      objectTitle: 'Data breach via third-party vendor',
      objectSequenceId: 'RSK-4201',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'risk-update',
    sourceWorkflowCategoriesName: 'risks',
    sourceVerb: 'updated',
    sourceData: {
      objectId: 'seed-risk-digest-002',
      objectTitle: 'Supply chain disruption risk',
      objectSequenceId: 'RSK-4202',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'risk-assessment-due',
    sourceWorkflowCategoriesName: 'risks',
    sourceVerb: 'is due',
    sourceData: {
      objectId: 'seed-risk-digest-003',
      objectTitle: 'Cyber risk assessment Q1 2026',
      objectSequenceId: 'RSK-4203',
      objectTimeStamp: '15 Mar 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'action-insert',
    sourceWorkflowCategoriesName: 'actions',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-action-digest-001',
      objectTitle: 'Implement MFA for admin accounts',
      objectSequenceId: 'ACT-3301',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'action-due',
    sourceWorkflowCategoriesName: 'actions',
    sourceVerb: 'is due',
    sourceData: {
      objectId: 'seed-action-digest-002',
      objectTitle: 'Submit quarterly compliance report',
      objectSequenceId: 'ACT-3302',
      objectTimeStamp: '28 Feb 2026, 17:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'action-overdue',
    sourceWorkflowCategoriesName: 'actions',
    sourceVerb: 'is overdue',
    sourceData: {
      objectId: 'seed-action-digest-003',
      objectTitle: 'Vendor risk assessment follow-up',
      objectSequenceId: 'ACT-3303',
      objectTimeStamp: '15 Jan 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'control-insert',
    sourceWorkflowCategoriesName: 'controls',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-control-digest-001',
      objectTitle: 'Firewall rule change monitoring',
      objectSequenceId: 'CTL-2201',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'control-test-due',
    sourceWorkflowCategoriesName: 'controls',
    sourceVerb: 'is due',
    sourceData: {
      objectId: 'seed-control-digest-002',
      objectTitle: 'Annual penetration test',
      objectSequenceId: 'CTL-2202',
      objectTimeStamp: '01 Mar 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'issue-insert',
    sourceWorkflowCategoriesName: 'issues',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-issue-digest-001',
      objectTitle: 'Unauthorized access detected in staging',
      objectSequenceId: 'ISS-1101',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'issue-overdue',
    sourceWorkflowCategoriesName: 'issues',
    sourceVerb: 'is overdue',
    sourceData: {
      objectId: 'seed-issue-digest-002',
      objectTitle: 'GDPR compliance gap remediation',
      objectSequenceId: 'ISS-1102',
      objectTimeStamp: '15 Feb 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'document-insert',
    sourceWorkflowCategoriesName: 'documents',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-doc-digest-001',
      objectTitle: 'Information Security Policy v3',
      objectSequenceId: 'DOC-5501',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'document-due',
    sourceWorkflowCategoriesName: 'documents',
    sourceVerb: 'is due for review',
    sourceData: {
      objectId: 'seed-doc-digest-002',
      objectTitle: 'Acceptable Use Policy annual review',
      objectSequenceId: 'DOC-5502',
      objectTimeStamp: '01 Apr 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'indicator-due',
    sourceWorkflowCategoriesName: 'indicators',
    sourceVerb: 'is due',
    sourceData: {
      objectId: 'seed-indicator-digest-001',
      objectTitle: 'KRI: Failed login attempts threshold',
      objectSequenceId: 'IND-6601',
      objectTimeStamp: '28 Feb 2026, 09:00',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'third-party-response-submitted',
    sourceWorkflowCategoriesName: 'third_party',
    sourceVerb: 'submitted',
    sourceData: {
      objectId: 'seed-tp-digest-001',
      objectTitle: 'Acme Corp questionnaire response',
      objectSequenceId: 'TP-7701',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
  {
    sourceWorkflowKey: 'change-request-insert',
    sourceWorkflowCategoriesName: 'change_requests',
    sourceVerb: 'created',
    sourceData: {
      objectId: 'seed-cr-digest-001',
      objectTitle: 'Change request: Update risk appetite statement',
      objectSequenceId: 'CR-8801',
      deepLinkBaseUrl: 'http://localhost:3000',
      deepLinkOrgId: TENANT,
    },
  },
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Identify (upsert) a user in Knock so they can be used as actor/recipient.
 */
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
    throw new Error(`Failed to identify user ${user.email}: ${response.status} ${text}`);
  }
  return response.json();
}

/**
 * Set (upsert) an object in a Knock collection.
 */
async function setObject(collection, objectId, properties) {
  const url = `${KNOCK_HOST}/v1/objects/${collection}/${objectId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KNOCK_SECRET_KEY}`,
    },
    body: JSON.stringify(properties),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to set object ${collection}/${objectId}: ${response.status} ${text}`);
  }
  return response.json();
}

async function triggerWorkflow(workflow, recipient, actor) {
  const url = `${KNOCK_HOST}/v1/workflows/${workflow.key}/trigger`;

  // Object recipients need collection + id, user recipients just need id
  const recipientRef = recipient.collection
    ? { collection: recipient.collection, id: recipient.id }
    : recipient.id;

  const body = {
    recipients: [recipientRef],
    actor: { id: actor.id, name: actor.name, email: actor.email },
    tenant: TENANT,
    data: {
      org_id: TENANT,
      objectId: `seed-${workflow.key}-${Date.now()}`,
      objectTitle: workflow.data?.objectTitle ?? workflow.key,
      objectSequenceId: `SEED-${Math.floor(Math.random() * 9000) + 1000}`,
      objectTimeStamp:
        workflow.data?.objectTimeStamp ?? new Date().toLocaleString('en-GB'),
      objectParent: {
        id: 'seed-parent-001',
        title: 'Seed Parent Object',
        sequenceId: 'PARENT-001',
        url: '/risks/seed-parent-001',
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

/**
 * Trigger the digest workflow with source data that mirrors what individual
 * workflows pass via their trigger_workflow step. Each call adds one activity
 * to the recipient's digest batch.
 */
async function triggerDigestActivity(activity, recipient, actor) {
  const url = `${KNOCK_HOST}/v1/workflows/digest/trigger`;

  const body = {
    recipients: [recipient.id],
    actor: { id: actor.id, name: actor.name, email: actor.email },
    tenant: TENANT,
    data: {
      org_id: TENANT,
      orgName: 'Test Organization 1',
      sourceWorkflowKey: activity.sourceWorkflowKey,
      sourceWorkflowCategoriesName: activity.sourceWorkflowCategoriesName,
      sourceVerb: activity.sourceVerb,
      sourceData: {
        ...activity.sourceData,
        org_id: TENANT,
        orgName: 'Test Organization 1',
      },
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
  console.log('Knock Dev Seed Script');
  console.log('=====================');
  console.log(`API Base:  ${KNOCK_HOST}`);
  console.log(`Tenant:    ${TENANT}`);
  console.log(`Workflows: ${WORKFLOWS.length}`);
  console.log(`Recipients: ${Object.values(USERS).map((u) => u.email).join(', ')}`);
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

  // Step 2: Trigger workflows for normal recipients
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
          `  [OK]   ${workflow.key.padEnd(45)} -> ${recipient.email} (run: ${result.workflowRunId})`
        );
      } else {
        failCount++;
        console.log(
          `  [FAIL] ${workflow.key.padEnd(45)} -> ${recipient.email}: ${result.error}`
        );
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // Step 3: Trigger a few workflows to the bounce test user to produce
  // bounced/undelivered statuses in the notification history.
  console.log('');
  console.log('Triggering bounce test workflows...');
  const bounceWorkflows = WORKFLOWS.slice(0, 5); // First 5 workflows
  for (const workflow of bounceWorkflows) {
    const result = await triggerWorkflow(
      workflow,
      USERS.bounceTest,
      USERS.riskManager
    );

    if (result.ok) {
      successCount++;
      console.log(
        `  [OK]   ${workflow.key.padEnd(45)} -> ${USERS.bounceTest.email} (run: ${result.workflowRunId})`
      );
    } else {
      failCount++;
      console.log(
        `  [FAIL] ${workflow.key.padEnd(45)} -> ${USERS.bounceTest.email}: ${result.error}`
      );
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  // Step 4: Create user group objects in Knock
  console.log('');
  console.log('Creating user group objects in Knock...');
  for (const group of USER_GROUPS) {
    try {
      await setObject(group.collection, group.id, {
        name: group.name,
        email: group.email,
      });
      console.log(`  [OK] Created ${group.collection}/${group.id} (${group.name})`);
    } catch (err) {
      console.error(`  [FAIL] ${err.message}`);
    }
  }

  // Step 5: Trigger a few workflows to user group recipients
  console.log('');
  console.log('Triggering workflows to user group recipients...');
  const groupWorkflows = WORKFLOWS.slice(0, 8); // First 8 workflows
  for (const workflow of groupWorkflows) {
    for (const group of USER_GROUPS) {
      const result = await triggerWorkflow(
        workflow,
        group,
        USERS.riskManager
      );

      if (result.ok) {
        successCount++;
        console.log(
          `  [OK]   ${workflow.key.padEnd(45)} -> ${group.name} (run: ${result.workflowRunId})`
        );
      } else {
        failCount++;
        console.log(
          `  [FAIL] ${workflow.key.padEnd(45)} -> ${group.name}: ${result.error}`
        );
      }

      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // Step 6: Seed digest workflow with multiple activities per recipient.
  // Each trigger adds one activity to the digest batch. The batch has a 24h
  // window, so all triggers land in the same digest message. This produces
  // digest messages with expandable child rows in the admin UI.
  console.log('');
  console.log('Seeding digest activities...');
  console.log(`  Activities per recipient: ${DIGEST_ACTIVITIES.length}`);
  const digestRecipients = [USERS.riskManager, USERS.standard];

  for (const recipient of digestRecipients) {
    for (const activity of DIGEST_ACTIVITIES) {
      // Alternate actors so digests show different people
      const actor =
        recipient === USERS.riskManager ? USERS.standard : USERS.riskManager;

      const result = await triggerDigestActivity(activity, recipient, actor);

      if (result.ok) {
        successCount++;
        console.log(
          `  [OK]   digest <- ${activity.sourceWorkflowKey.padEnd(38)} -> ${recipient.email} (run: ${result.workflowRunId})`
        );
      } else {
        failCount++;
        console.log(
          `  [FAIL] digest <- ${activity.sourceWorkflowKey.padEnd(38)} -> ${recipient.email}: ${result.error}`
        );
      }

      // Minimal delay — we want all activities in the same batch window
      await new Promise((r) => setTimeout(r, 50));
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
  console.log(
    'in the Notification History tab within a few seconds.'
  );
  console.log(
    'Digest messages batch over a 24h window — child activities will be'
  );
  console.log(
    'visible when you expand the digest row in the admin UI.'
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
