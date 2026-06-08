#!/usr/bin/env node
/**
 * Test script to validate Knock Messages List API filtering by trigger_data.
 *
 * Usage:
 *   pnpm --filter @risksmart-app/knock node knock_scripts/test-messages-list.mjs [objectId] [tenant]
 *
 * If no args are provided, fetches the first page of messages unfiltered
 * to help you find valid objectId/tenant values.
 *
 * Examples:
 *   # List recent messages (unfiltered) to find IDs
 *   node packages/knock/knock_scripts/test-messages-list.mjs
 *
 *   # Filter by objectId only
 *   node packages/knock/knock_scripts/test-messages-list.mjs <objectId>
 *
 *   # Filter by objectId + tenant (org key)
 *   node packages/knock/knock_scripts/test-messages-list.mjs <objectId> <tenant>
 */
import 'dotenv/config';

const ENDPOINT = 'https://api.knock.app/v1';

let apiKey = process.env.KNOCK_SECRET_KEY || process.env.KNOCK_API_KEY;
if (!apiKey) {
  console.error('KNOCK_SECRET_KEY or KNOCK_API_KEY not found. Set in packages/knock/.env');
  process.exit(1);
}
apiKey = apiKey.trim().replace(/^=+/, '');

const objectId = process.argv[2];
const tenant = process.argv[3];

async function listMessages(params) {
  const url = new URL(`${ENDPOINT}/messages`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object') {
      // trigger_data needs to be serialized as trigger_data[key]=value
      for (const [k, v] of Object.entries(value)) {
        url.searchParams.append(`trigger_data[${k}]`, String(v));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  console.log('GET', url.toString(), '\n');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '<no body>');
    console.error(`API error: ${res.status} ${res.statusText}`);
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  return res.json();
}

async function main() {
  console.log('=== Knock Messages List API Test ===\n');

  if (!objectId) {
    // Unfiltered: show recent messages to inspect
    console.log('No objectId provided. Fetching recent messages to inspect...\n');
    const result = await listMessages({ page_size: 5 });
    for (const msg of result.items) {
      console.log({
        id: msg.id,
        workflow: msg.source?.key,
        status: msg.status,
        tenant: msg.tenant,
        inserted_at: msg.inserted_at,
        data_objectId: msg.data?.objectId,
        data_objectTitle: msg.data?.objectTitle,
        recipient: typeof msg.recipient === 'string' ? msg.recipient : msg.recipient?.id,
      });
      console.log('---');
    }
    console.log(`\nTotal items returned: ${result.items.length}`);
    console.log('\nRe-run with an objectId to test trigger_data filtering:');
    console.log('  node packages/knock/knock_scripts/test-messages-list.mjs <objectId> [tenant]');
    return;
  }

  // Test trigger_data filtering
  const params = {
    page_size: 10,
    trigger_data: { objectId },
  };
  if (tenant) {
    params.tenant = tenant;
  }

  console.log('Filter:', JSON.stringify(params, null, 2), '\n');

  const result = await listMessages(params);

  console.log(`Messages found: ${result.items.length}\n`);

  for (const msg of result.items) {
    console.log({
      id: msg.id,
      workflow: msg.source?.key,
      status: msg.status,
      tenant: msg.tenant,
      inserted_at: msg.inserted_at,
      data_objectId: msg.data?.objectId,
      data_objectTitle: msg.data?.objectTitle,
      recipient: typeof msg.recipient === 'string' ? msg.recipient : msg.recipient?.id,
    });
    console.log('---');
  }

  // Also test with source filter if we got results
  if (result.items.length > 0) {
    const firstWorkflow = result.items[0].source?.key;
    if (firstWorkflow) {
      console.log(`\n=== Also filtering by source: "${firstWorkflow}" ===\n`);
      const filtered = await listMessages({ ...params, source: firstWorkflow });
      console.log(`Messages found with source filter: ${filtered.items.length}`);
      for (const msg of filtered.items) {
        console.log({
          id: msg.id,
          workflow: msg.source?.key,
          status: msg.status,
          inserted_at: msg.inserted_at,
          recipient: typeof msg.recipient === 'string' ? msg.recipient : msg.recipient?.id,
        });
      }
    }
  }

  console.log('\n=== Test complete ===');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
