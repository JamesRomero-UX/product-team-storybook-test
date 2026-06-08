#!/usr/bin/env node
/**
 * setUserPreferencesBulk.mjs
 *
 * Purpose: Initialize (or overwrite) a standard preference set for many existing users so they
 * start with organisation-enforced defaults. Intended to be run after establishing the tenant-level
 * preference baseline.
 *
 * Usage examples:
 *  pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_123 --users-file ./users.txt
 *  pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_123 --user-id user_a --user-id user_b
 *  pnpm -F @risksmart-app/knock knock:set-user-prefs-bulk -- --org-id ORG_123 --users-file users.csv --dry-run
 *
 * Required env:
 *  KNOCK_API_KEY=sk_... (service token with user preferences write scope)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function parseArgs(argv){
  const out = { userIds: [] };
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(a === '--org-id'){ out.orgId = argv[++i]; }
    else if(a === '--users-file'){ out.usersFile = argv[++i]; }
    else if(a === '--user-id'){ out.userIds.push(argv[++i]); }
    else if(a === '--endpoint'){ out.endpoint = argv[++i]; }
    else if(a === '--concurrency'){ out.concurrency = parseInt(argv[++i],10); }
    else if(a === '--dry-run'){ out.dryRun = true; }
    else if(a === '--verbose'){ out.verbose = true; }
  else if(a === '--skip-invalid'){ out.skipInvalid = true; }
  else if(a === '--csv-column'){ out.csvColumn = argv[++i]; }
  else if(a === '--email-column'){ out.emailColumn = argv[++i]; }
  else if(a === '--ensure-user'){ out.ensureUser = true; }
  }
  return out;
}

const {
  orgId,
  usersFile,
  userIds = [],
  endpoint = 'https://api.knock.app/v1',
  concurrency = 5,
  dryRun = false,
  verbose = false,
  skipInvalid = false,
  csvColumn,
  emailColumn,
  ensureUser = false,
} = parseArgs(args);

if(!orgId){
  console.error('Missing required --org-id');
  process.exit(1);
}

let apiKey = process.env.KNOCK_API_KEY || process.env.KNOCK_SERVICE_TOKEN || process.env.KNOCK_TOKEN;
if(!apiKey){
  console.error('Missing Knock API key (KNOCK_API_KEY)');
  process.exit(1);
}
apiKey = apiKey.trim();
if(apiKey.startsWith('=')){
  console.warn('[WARN] API key appeared to have leading =, stripping.');
  apiKey = apiKey.replace(/^=+/, '');
}

function loadUsers(){
  const records = [];
  // Seed from direct flags
  userIds.forEach(id => { if(id) records.push({ id }); });
  if (usersFile) {
    // no-dd-sa:javascript-node-security/detect-non-literal-fs-filename
    const filePath = path.resolve(process.cwd(), usersFile);
    if(!filePath.startsWith(process.cwd() + path.sep)){
      console.error('Invalid users file path:', filePath);
      process.exit(1);
    }
    if (path.relative(process.cwd(), filePath).includes('..')) {
      console.error('Path traversal detected in users file path:', filePath);
      process.exit(1);
    }
    if(!fs.existsSync(filePath)){
      console.error('Users file not found:', filePath);
      process.exit(1);
    }
    if (path.relative(process.cwd(), filePath).startsWith('..') || path.isAbsolute(usersFile)) {
      console.error('Path traversal detected in users file path:', filePath);
      process.exit(1);
    }
    if (usersFile.includes('..') || path.isAbsolute(usersFile)) {
      console.error('Path traversal detected in users file path:', usersFile);
      process.exit(1);
    }
    if (path.relative(process.cwd(), filePath).includes('..') || usersFile.includes('..')) {
      console.error('Path traversal detected in users file path:', filePath);
      process.exit(1);
    }
    if (path.relative(process.cwd(), filePath).includes('..') || usersFile.includes('..') || !filePath.startsWith(process.cwd() + path.sep)) {
      console.error('Path traversal detected in users file path:', filePath);
      process.exit(1);
    }
    if (!/^[\w\-. ]+$/.test(path.basename(usersFile))) {
      console.error('Invalid characters in users file name:', usersFile);
      process.exit(1);
    }
    // no-dd-sa:javascript-node-security/detect-non-literal-fs-filename
    const raw = fs.readFileSync(filePath,'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    if(!lines.length) return records;
    const first = lines[0];
    const looksCsv = first.includes(',');
    if(looksCsv){
      const headerParts = first.split(',').map(h => h.trim());
      let idColIndex = 0;
      let emailColIndex = -1;
      // Determine header usage
      const hasHeaderIndicators = headerParts.some(h => /^(user_?id|userid|user|id|email)$/i.test(h));
      if(hasHeaderIndicators){
        // treat first as header
        const headerMap = headerParts;
        if(csvColumn){
          const idx = headerMap.indexOf(csvColumn);
          if(idx === -1){
            console.error(`Specified --csv-column '${csvColumn}' not found in header: ${headerMap.join(', ')}`);
            process.exit(1);
          }
          idColIndex = idx;
        } else {
          // pick first header that matches id-ish pattern
          const idMatchIdx = headerMap.findIndex(h => /^(user_?id|userid|id)$/i.test(h));
          if(idMatchIdx !== -1) idColIndex = idMatchIdx; else idColIndex = 0;
        }
        if(emailColumn){
          emailColIndex = headerMap.indexOf(emailColumn);
        } else {
          const emailIdx = headerMap.findIndex(h => /^email$/i.test(h));
          if(emailIdx !== -1) emailColIndex = emailIdx;
        }
        // remove header
        lines.shift();
      }
      lines.forEach(line => {
        const cells = line.split(',');
        const idVal = (cells[idColIndex] || '').trim();
        if(!idVal) return;
        const rec = { id: idVal };
        if(emailColIndex >= 0) rec.email = (cells[emailColIndex] || '').trim();
        records.push(rec);
      });
    } else {
      // single column list (maybe header on first line)
      const possibleHeader = /^(user_?id|userid|user|id|email)$/i.test(first.trim());
      const startIndex = possibleHeader ? 1 : 0;
      for(let i=startIndex;i<lines.length;i++){
        const val = lines[i].trim();
        if(val) records.push({ id: val });
      }
    }
  }
  // de-dup by id
  const dedupMap = new Map();
  for(const r of records){ if(!dedupMap.has(r.id)) dedupMap.set(r.id, r); }
  return Array.from(dedupMap.values());
}

// Define the user preference payload. ASSUMPTION: For users, the same structure under settings.preference_set
// can be applied via PUT to /users/{user_id}/preferences (If Knock uses another endpoint, adjust accordingly).
// This mirrors the enforced tenant defaults; depending on Knock behaviour, user-level PUT may only store non-enforced
// overrides. Adjust if the API expects a different key structure.
const userPreferencePayload = {
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
        categories: null,
        workflows: null
    }
  }
};

async function ensureUserExists(user){
  if(!ensureUser) return;
  const url = `${endpoint.replace(/\/$/,'')}/users/${encodeURIComponent(user.id)}`;
  const body = { id: user.id };
  if(user.email) body.email = user.email;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  if(!res.ok && res.status !== 200){
    const text = await res.text().catch(()=>'<no body>');
    throw new Error(`Failed to ensure user ${user.id}: ${res.status} ${res.statusText} ${text.slice(0,200)}`);
  }
}

async function applyPreference(user){
    // Single canonical endpoint including org/tenant context segment.
    const url = `${endpoint.replace(/\/$/, '')}/users/${encodeURIComponent(user.id)}/preferences/${encodeURIComponent(orgId)}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(userPreferencePayload)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '<no body>');
        throw new Error(`HTTP ${res.status} ${res.statusText} on ${url}: ${text.slice(0, 300)}`);
  }
    return res.json().catch(() => ({}));
}

async function run(){
  const users = loadUsers();
  if(users.length === 0){
    console.error('No users provided via --users-file or --user-id');
    process.exit(1);
  }

  console.log(`[INFO] Preparing to apply preference set to ${users.length} users (tenant/org context: ${orgId}).`);
  if(dryRun){
    console.log('[DRY RUN] User count:', users.length);
    console.log('[DRY RUN] First 10 users:', users.slice(0,10).map(u=>u.id));
    console.log('[DRY RUN] Payload preview:\n', JSON.stringify(userPreferencePayload, null, 2));
    return;
  }

  let active = 0;
  let index = 0;
  const results = { success: 0, failed: 0, failures: [] };
  const queue = [];

  const next = () => {
    while(active < concurrency && index < users.length){
      const user = users[index++];
      active++;
      const p = (async () => { if(ensureUser) { await ensureUserExists(user); } return applyPreference(user); })()
        .then(() => {
          results.success++;
          if(verbose) console.log(`[OK] ${user.id}`);
        })
        .catch(err => {
          results.failed++;
          const msg = `[FAIL] ${user.id}: ${err.message}`;
          if(skipInvalid){
            console.warn(msg);
          } else {
            console.error(msg);
          }
          results.failures.push({ userId: user.id, error: err.message });
        })
        .finally(() => {
          active--;
          next();
        });
      queue.push(p);
    }
  };
  next();
  await Promise.all(queue);

  console.log('\n[SUMMARY]');
  console.log(' Total users:', users.length);
  console.log(' Succeeded  :', results.success);
  console.log(' Failed     :', results.failed);
  if(results.failed){
    console.log(' Failure samples:', results.failures.slice(0,5));
  }
  if(results.failed && !skipInvalid){
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Unexpected fatal error', err);
  process.exit(1);
});
