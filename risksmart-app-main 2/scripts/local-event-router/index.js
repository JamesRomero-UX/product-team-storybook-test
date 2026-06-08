#!/usr/bin/env node

/**
 * Local Event Router
 *
 * Replaces AWS EventBridge for local development and CI.
 * Implements the EventBridge PutEvents wire protocol so the AWS SDK v3
 * can send events here via AWS_ENDPOINT_URL_EVENTBRIDGE.
 *
 * Routes events to Lambda functions via SAM's local invoke endpoint
 * or directly to HTTP targets, based on pattern matching rules.
 *
 * Usage:
 *   node scripts/local-event-router/index.js
 *
 * Environment variables:
 *   EVENT_ROUTER_PORT      (default: 3010)
 *   SAM_LAMBDA_ENDPOINT    (default: http://localhost:3100)
 */

import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { matchesPattern } from './pattern-matcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.EVENT_ROUTER_PORT || '3010', 10);
const SAM_LAMBDA_ENDPOINT =
  process.env.SAM_LAMBDA_ENDPOINT || 'http://localhost:3100';

/**
 * Load routing rules from routes.json.
 */
function loadRules() {
  const routesPath = path.join(__dirname, 'routes.json');
  const routesConfig = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  console.log(
    `Loaded ${routesConfig.rules.length} event rules from routes.json`
  );
  return routesConfig.rules;
}

const rules = loadRules();

console.log(
  `Event routing rules: ${rules.map((r) => r.name).join(', ')}`
);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

/**
 * Converts a PutEvents entry into an EventBridgeEvent object.
 */
function toEventBridgeEvent(entry) {
  const detail =
    typeof entry.Detail === 'string' ? JSON.parse(entry.Detail) : entry.Detail;

  return {
    version: '0',
    id: crypto.randomUUID(),
    source: entry.Source || 'local',
    account: '000000000000',
    time: new Date().toISOString(),
    region: process.env.AWS_REGION || 'eu-west-2',
    resources: [],
    'detail-type': entry.DetailType || '',
    detail,
  };
}

/**
 * Invokes a Lambda function via SAM's local invoke endpoint.
 *
 * SAM exposes: POST /2015-03-31/functions/{functionName}/invocations
 * at the --port specified for `sam local start-lambda`.
 */
async function invokeSamLambda(functionName, event) {
  const url = `${SAM_LAMBDA_ENDPOINT}/2015-03-31/functions/${functionName}/invocations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`SAM invoke ${functionName} failed: ${response.status}`);
  }

  return response;
}

/**
 * Delivers an event to a target.
 * If the target is a function name (no http), invoke via SAM.
 * If the target is an HTTP URL, POST directly.
 */
async function deliverToTarget(rule, eventBridgeEvent) {
  const target = rule.target;

  try {
    if (rule.samFunctionName) {
      // Invoke via SAM's Lambda endpoint
      await invokeSamLambda(rule.samFunctionName, eventBridgeEvent);
      console.log(
        `  Delivered to ${rule.name} via SAM (${rule.samFunctionName})`
      );
    } else if (target.startsWith('http')) {
      // Direct HTTP POST (fallback for non-SAM targets)
      const response = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventBridgeEvent),
      });

      if (!response.ok) {
        console.error(
          `  Failed to deliver to ${rule.name} (${target}): ${response.status}`
        );
      } else {
        console.log(`  Delivered to ${rule.name} (${target})`);
      }
    }
  } catch (error) {
    console.error(
      `  Error delivering to ${rule.name}:`,
      error.message
    );
  }
}

/**
 * Routes a single PutEvents entry to all matching targets.
 */
async function routeEntry(entry) {
  const eventBridgeEvent = toEventBridgeEvent(entry);

  const matchedRules = rules.filter((rule) =>
    matchesPattern(eventBridgeEvent, rule.eventPattern)
  );

  if (matchedRules.length === 0) {
    console.log(
      `  No matching rules for source=${entry.Source} detail-type=${entry.DetailType}`
    );
    return;
  }

  // Send to all matched targets (fire-and-forget, like real EventBridge)
  await Promise.allSettled(
    matchedRules.map((rule) => deliverToTarget(rule, eventBridgeEvent))
  );
}

/**
 * Handles the PutEvents API call.
 */
async function handlePutEvents(body) {
  const parsed = JSON.parse(body);
  const entries = parsed.Entries || [];

  console.log(`\nRouting ${entries.length} event(s):`);

  for (const entry of entries) {
    console.log(
      `  Event: source=${entry.Source} detail-type=${entry.DetailType}`
    );
    await routeEntry(entry);
  }

  return {
    FailedEntryCount: 0,
    Entries: entries.map(() => ({ EventId: crypto.randomUUID() })),
  };
}

async function handleRequest(req, res) {
  if (req.url === '/healthz' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'local-event-router' }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readBody(req);

    const target = req.headers['x-amz-target'] || '';
    if (target === 'AWSEvents.PutEvents' || req.url === '/') {
      const result = await handlePutEvents(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Unknown action: ${target}` }));
  } catch (error) {
    console.error('Event router error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  }
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Local Event Router listening on http://localhost:${PORT}`);
  console.log(`SAM Lambda endpoint: ${SAM_LAMBDA_ENDPOINT}`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
