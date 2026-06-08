#!/usr/bin/env node
import { spawn, execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

/**
 * Local Development Workflow (SAM + CDK)
 *
 * 1. Initialize local AWS services (DynamoDB, S3, SQS)
 * 2. Run `cdk synth` to generate CloudFormation templates
 * 3. Parse templates to discover API Gateways and EventBridge rules
 * 4. Start SAM local processes (one per API, one for all event Lambdas)
 * 5. Start local event router + Firehose mock
 *
 * CDK is the single source of truth — everything is discovered from synth output.
 *
 * Prerequisites:
 *   - Docker services running: pnpm run api:v3
 *   - AWS SAM CLI: Don't use brew, use AWS installer
 *
 * Usage:
 *   node dev.js [--init] [--skip-synth] [--no-watch]
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load the repo root .env file into process.env (without overwriting existing vars).
// dev.js is invoked directly (not via Turborepo/dotenv), so env vars like
// LANGSMITH_API_KEY won't be set unless we load them ourselves.
(function loadRootEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
})();
/**
 * Warn if no .env file exists at the repo root.
 * dev.js loads it manually via dotenv.parse, so if it's missing locally some
 * env vars may be unset. In CI, env vars are injected via other means
 * so a missing .env is not fatal.
 */
function checkEnvFileExists() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    console.log(
      '\x1b[33m WARNING: .env file not found at repo root.\x1b[0m\n' +
        '  Some env vars may be missing. For local dev, copy .env.example:\n' +
        '    cp .env.example .env\n'
    );
  }
}

/**
 * Validate environment variables against the CDK-synthesized templates.
 *
 * Scans every Lambda function's Environment.Variables in the synth output
 * and reports variables whose values are:
 *   - Empty strings (CDK could not resolve them — likely missing from .env)
 *   - CloudFormation intrinsics (objects like { Ref }, { Fn::Join } etc.)
 *     that SAM/local dev cannot evaluate
 *
 * Env vars that injectLambdaEnvVars() will overwrite are excluded — those
 * are always set correctly by dev.js itself.
 *
 * Call this AFTER injectLambdaEnvVars — it reads the final merged templates
 * and skips any keys that dev.js explicitly injects (those are always correct).
 */
function validateCdkEnvVars(injectedKeys) {
  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.endsWith('.template.json') &&
        !f.startsWith('_split.') &&
        f !== 'event-lambdas.template.json'
    );

  // Collect problems: key → { stacks: Set<string>, reason: string }
  const problems = new Map();

  for (const file of templateFiles) {
    const template = JSON.parse(
      fs.readFileSync(path.join(CDK_OUT, file), 'utf8')
    );
    const stackName = file
      .replace('.template.json', '')
      .replace(/^tech-admin-risksmartApp-/, '');

    for (const [, resource] of Object.entries(template.Resources || {})) {
      if (resource.Type !== 'AWS::Lambda::Function') continue;

      const vars = resource.Properties?.Environment?.Variables || {};
      for (const [key, value] of Object.entries(vars)) {
        // Skip vars that dev.js will overwrite in injectLambdaEnvVars
        if (injectedKeys.has(key)) continue;

        let reason = null;
        if (value === '') {
          reason = 'empty';
        } else if (value !== null && typeof value === 'object') {
          reason = 'unresolved intrinsic';
        }
        if (!reason) continue;

        if (!problems.has(key)) {
          problems.set(key, { stacks: new Set(), reason });
        }
        problems.get(key).stacks.add(stackName);
      }
    }
  }

  if (problems.size === 0) return;

  // Sort by key name for stable output
  const sorted = [...problems.entries()].sort(([a], [b]) => a.localeCompare(b));

  const empty = sorted.filter(([, v]) => v.reason === 'empty');
  const intrinsics = sorted.filter(
    ([, v]) => v.reason === 'unresolved intrinsic'
  );

  console.log(
    `\x1b[33m WARNING: ${problems.size} Lambda env var(s) in CDK output may not be set correctly:\x1b[0m`
  );

  if (empty.length > 0) {
    console.log('  Empty (set in .env or shell before running dev.js):');
    for (const [key, { stacks }] of empty) {
      console.log(`    - ${key}  (${[...stacks].join(', ')})`);
    }
  }

  if (intrinsics.length > 0) {
    console.log(
      '  Unresolved CloudFormation intrinsics (may not work locally):'
    );
    for (const [key, { stacks }] of intrinsics) {
      console.log(`    - ${key}  (${[...stacks].join(', ')})`);
    }
  }

  console.log();
}

const CDK_DIR = path.join(ROOT, 'cdk-stack');
const CDK_OUT = path.join(CDK_DIR, 'cdk.out');

const EVENT_ROUTER_PORT = 3010;
const SSM_MOCK_PORT = 3012;
const SECRETS_MANAGER_MOCK_PORT = 3013;
const LAMBDA_ENDPOINT_PORT = 3100;
const API_BASE_PORT = 3001;

/**
 * Resolve the hostname that Docker containers use to reach the host machine.
 * - macOS/Windows (Docker Desktop): `host.docker.internal` works natively
 * - Linux (CI): `host.docker.internal` doesn't resolve; use the Docker bridge gateway IP
 */
let _dockerHost;
function getDockerHost() {
  if (_dockerHost) return _dockerHost;

  if (process.platform !== 'linux') {
    _dockerHost = 'host.docker.internal';
    return _dockerHost;
  }

  try {
    const gateway = execSync(
      "docker network inspect risksmart-app_default --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}'",
      { stdio: 'pipe', encoding: 'utf8' }
    ).trim();
    if (gateway) {
      console.log(` Docker host address: ${gateway} (Linux bridge gateway)`);
      _dockerHost = gateway;
      return _dockerHost;
    }
  } catch {
    // Network may not exist yet
  }

  _dockerHost = '172.17.0.1';
  console.log(` Docker host address: ${_dockerHost} (Linux default)`);
  return _dockerHost;
}

const processes = [];

// ─── Utilities ───────────────────────────────────────────────────

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function spawnProcess(command, args, options = {}) {
  const prefix = options.prefix;
  const child = spawn(command, args, {
    stdio: prefix ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    cwd: options.cwd || ROOT,
    env: {
      ...process.env,
      IS_LOCAL: 'true',
      AWS_REGION: process.env.AWS_REGION || 'eu-west-2',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'test',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      ...options.env,
      AUTH0_MANAGEMENT_CLIENT_SECRET:
        process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
    },
  });

  // Prefix each output line with a colored tag for easy filtering
  if (prefix) {
    const color = options.prefixColor || COLORS.gray;
    const tag = `${color}[${prefix}]${COLORS.reset} `;

    const pipeLine = (stream, out) => {
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line in buffer
        for (const line of lines) {
          if (line.trim()) out.write(tag + line + '\n');
        }
      });
      stream.on('end', () => {
        if (buffer.trim()) out.write(tag + buffer + '\n');
      });
    };

    pipeLine(child.stdout, process.stdout);
    pipeLine(child.stderr, process.stderr);
  }

  child.on('error', (err) => {
    console.error(`Process error (${command}):`, err.message);
  });

  processes.push(child);
  return child;
}

function checkPrerequisites() {
  try {
    execSync('sam --version', { stdio: 'pipe' });
  } catch {
    console.error(
      'AWS SAM CLI not found. Install it: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html'
    );
    process.exit(1);
  }

  try {
    // DynamoDB Local returns 400 on unauthenticated requests — that means it's running
    const status = execSync(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null',
      { stdio: 'pipe', encoding: 'utf8' }
    ).trim();
    if (status !== '400' && status !== '200') throw new Error();
  } catch {
    console.error(
      'DynamoDB Local not running. Start Docker services: pnpm run api:v3'
    );
    process.exit(1);
  }
}

// ─── CDK Synth + Discovery ──────────────────────────────────────

/**
 * Stacks to synth locally. Only Lambda service stacks — not tenant/domain/cert stacks
 * which require VPC lookups and ACM certificates that don't exist locally.
 */
const LOCAL_STACKS = [
  'tech-admin-risksmartApp-CDKEventStack',
  'tech-admin-risksmartApp-RequestStateApiStack',
  'tech-admin-risksmartApp-DataLayerStack',
  'tech-admin-risksmartApp-PermissionsStack',
  'tech-admin-risksmartApp-RulebookIngestionStack',
  'tech-admin-risksmartApp-CDKGlobalTenantConfigStack',
  'tech-admin-risksmartApp-CDKGlobalTenantConfigFunctionsStack',
  'tech-admin-risksmartApp-AiFeedbackIngestionStack',
];

const TENANT_DEPLOYER_DIR = path.join(ROOT, 'packages', 'tenant-deployer');

/**
 * Shared CDK synth env vars.
 *
 * Loads cdk-stack/.env values last so they win over any identically named
 * vars that the root .env loader put into process.env (e.g.,
 * EXTAPI_STACK_CONFIG may be a stub in the root .env but needs the full
 * JSON from cdk-stack/.env for CDK synth to succeed).
 */
function cdkSynthEnv() {
  // Parse cdk-stack/.env so its values override process.env in the child
  const cdkEnvPath = path.join(CDK_DIR, '.env');
  const cdkEnvOverrides = fs.existsSync(cdkEnvPath)
    ? dotenv.parse(fs.readFileSync(cdkEnvPath, 'utf-8'))
    : {};

  return {
    ...process.env,
    ...cdkEnvOverrides,
    IS_LOCAL: 'true',
    AWS_REGION: process.env.AWS_REGION || 'eu-west-2',
    CDK_DEFAULT_REGION: process.env.AWS_REGION || 'eu-west-2',
    AWS_DEFAULT_REGION: process.env.AWS_REGION || 'eu-west-2',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'test',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    AWS_ACCOUNT_ID: '000000000000',
  };
}

/**
 * Run `cdk synth` for both CDK apps:
 * 1. cdk-stack/ — global service stacks (DataLayer, RequestState, Permissions, etc.)
 * 2. packages/tenant-deployer/ — per-tenant stacks (TenantEventStack, AiFeedbackStack)
 */
function runCdkSynth() {
  // Remove stale cdk.out dirs to force a full rebundle of all Lambda assets.
  // CDK caches bundled assets by hash and may not detect changes in
  // transitive dependencies (e.g., a schema file imported by a handler).
  const tenantOut = path.join(TENANT_DEPLOYER_DIR, 'cdk.out');
  for (const dir of [CDK_OUT, tenantOut]) {
    if (fs.existsSync(dir)) {
      console.log(` Cleaning stale ${path.relative(ROOT, dir)}/...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log('\n Running cdk synth (service stacks)...');
  const stackArgs = LOCAL_STACKS.join(' ');
  execSync(`npx cdk synth ${stackArgs} --output cdk.out --quiet 2>&1`, {
    stdio: 'inherit',
    cwd: CDK_DIR,
    env: cdkSynthEnv(),
  });

  console.log(' Running cdk synth (tenant stacks)...');
  execSync('npx cdk synth --all --output cdk.out --quiet 2>&1', {
    stdio: 'inherit',
    cwd: TENANT_DEPLOYER_DIR,
    env: {
      ...cdkSynthEnv(),
      APP_NAME: 'risksmartApp',
      STAGE: 'tech-admin',
      TENANT_NAME: 'multitenant',
      SENTRY_RELEASE: 'local-dev',
      VPC_ID: 'vpc-dummy',
      PRIVATE_SUBNET_IDS: 'subnet-dummy1,subnet-dummy2',
      PUBLIC_SUBNET_IDS: 'subnet-dummy3,subnet-dummy4',
      ISOLATED_SUBNET_IDS: 'subnet-dummy5,subnet-dummy6',
      VPC_CIDR_BLOCK: '10.0.0.0/16',
      AVAILABILITY_ZONES: 'eu-west-2a,eu-west-2b',
    },
  });

  // Copy tenant-deployer templates into the main cdk.out so discovery finds them
  if (fs.existsSync(tenantOut)) {
    const templates = fs
      .readdirSync(tenantOut)
      .filter((f) => f.endsWith('.template.json'));
    for (const t of templates) {
      fs.copyFileSync(path.join(tenantOut, t), path.join(CDK_OUT, t));
    }
  }

  console.log(' CDK synth complete.\n');
}

/**
 * Check if an object tree contains a Ref or Fn::GetAtt to a target logical ID.
 */
function deepContainsRef(obj, targetId) {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj))
    return obj.some((item) => deepContainsRef(item, targetId));
  if (obj['Ref'] === targetId) return true;
  if (obj['Fn::GetAtt'] && obj['Fn::GetAtt'][0] === targetId) return true;
  return Object.values(obj).some((value) => deepContainsRef(value, targetId));
}

/**
 * Extract all Ref/Fn::GetAtt targets from an object tree.
 */
function extractRefs(obj) {
  const refs = [];
  if (!obj || typeof obj !== 'object') return refs;
  if (obj['Ref']) refs.push(obj['Ref']);
  if (obj['Fn::GetAtt']) refs.push(obj['Fn::GetAtt'][0]);
  if (Array.isArray(obj)) {
    for (const item of obj) refs.push(...extractRefs(item));
  } else {
    for (const value of Object.values(obj)) refs.push(...extractRefs(value));
  }
  return refs;
}

/**
 * Split a CloudFormation template with multiple API Gateways into
 * separate per-API templates. Each template contains only the resources
 * for one API Gateway plus its Lambda handler.
 *
 * Returns null if only one (or zero) API Gateways exist.
 */
function splitStackByApi(templatePath, stackName, template) {
  const resources = template.Resources || {};

  // Find all RestApi resources
  const restApis = [];
  for (const [logicalId, resource] of Object.entries(resources)) {
    if (resource.Type === 'AWS::ApiGateway::RestApi') {
      restApis.push({
        logicalId,
        name: resource.Properties?.Name || logicalId,
      });
    }
  }

  if (restApis.length <= 1) return null;

  const results = [];

  for (const api of restApis) {
    const perApiResources = {};

    // Include the RestApi itself
    perApiResources[api.logicalId] = resources[api.logicalId];

    // Find all resources that reference this RestApi (Methods, Resources, Deployments, Stages)
    for (const [logicalId, resource] of Object.entries(resources)) {
      if (logicalId === api.logicalId) continue;
      if (deepContainsRef(resource.Properties, api.logicalId)) {
        perApiResources[logicalId] = resource;
      }
    }

    // From Method resources, follow Lambda references (Alias → Function)
    for (const [, resource] of Object.entries({ ...perApiResources })) {
      if (resource.Type !== 'AWS::ApiGateway::Method') continue;
      const uri = resource.Properties?.Integration?.Uri;
      if (!uri) continue;

      for (const refId of extractRefs(uri)) {
        const refResource = resources[refId];
        if (!refResource) continue;

        perApiResources[refId] = refResource;

        // Follow Alias/Version → Lambda chain
        if (
          refResource.Type === 'AWS::Lambda::Alias' ||
          refResource.Type === 'AWS::Lambda::Version'
        ) {
          const fnRef = refResource.Properties?.FunctionName;
          if (fnRef?.['Ref'] && resources[fnRef['Ref']]) {
            perApiResources[fnRef['Ref']] = resources[fnRef['Ref']];
          }
        }
      }
    }

    // Write per-API template
    const perApiTemplate = {
      AWSTemplateFormatVersion:
        template.AWSTemplateFormatVersion || '2010-09-09',
      Resources: perApiResources,
    };

    const perApiPath = path.join(
      CDK_OUT,
      `_split.${stackName}.${api.logicalId}.template.json`
    );
    fs.writeFileSync(perApiPath, JSON.stringify(perApiTemplate, null, 2));

    results.push({
      apiName: api.name,
      apiLogicalId: api.logicalId,
      templatePath: perApiPath,
    });
  }

  console.log(
    ` Split ${stackName} into ${results.length} per-API templates: ${results.map((r) => r.apiName).join(', ')}`
  );
  return results;
}

/**
 * Parse CloudFormation templates from cdk.out/ to discover:
 * - Individual API Gateway RestApi resources (split multi-API stacks)
 * - EventBridge rules with patterns and Lambda targets
 */
function discoverFromCdkOutput() {
  // Clean up previously generated templates from prior runs
  const oldGenerated = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) => f.startsWith('_split.') || f === 'event-lambdas.template.json'
    );
  for (const f of oldGenerated) {
    fs.unlinkSync(path.join(CDK_OUT, f));
  }

  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter((f) => f.endsWith('.template.json'));

  const apiStacks = [];
  const eventRules = [];
  const sqsMappings = [];

  for (const file of templateFiles) {
    const templatePath = path.join(CDK_OUT, file);
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const resources = template.Resources || {};
    const stackName = file.replace('.template.json', '');

    // Find API Gateway RestApi resources
    const restApis = Object.entries(resources).filter(
      ([, r]) => r.Type === 'AWS::ApiGateway::RestApi'
    );

    if (restApis.length === 1) {
      // Single API — use the full template
      const apiName = restApis[0][1].Properties?.Name || stackName;
      apiStacks.push({
        stackName,
        apiName,
        templatePath,
        port: getSamPort(apiName, stackName),
      });
    } else if (restApis.length > 1) {
      // Multiple APIs — split into per-API templates
      const perApiTemplates = splitStackByApi(
        templatePath,
        stackName,
        template
      );
      if (perApiTemplates) {
        for (const api of perApiTemplates) {
          apiStacks.push({
            stackName,
            apiName: api.apiName,
            templatePath: api.templatePath,
            port: getSamPort(api.apiName, stackName),
          });
        }
      }
    }

    // Find EventBridge rules
    for (const [logicalId, resource] of Object.entries(resources)) {
      if (resource.Type !== 'AWS::Events::Rule') continue;

      const props = resource.Properties || {};
      const eventPattern = props.EventPattern;
      if (!eventPattern) continue;

      // Find the target Lambda function name
      let targetFunctionName = null;
      let lambdaLogicalId = null;
      const targets = props.Targets || [];
      for (const target of targets) {
        const arn = target.Arn;
        if (!arn || typeof arn !== 'object') continue;

        if (arn['Fn::GetAtt']) {
          // Direct Lambda function reference
          lambdaLogicalId = arn['Fn::GetAtt'][0];
          const lambdaResource = resources[lambdaLogicalId];
          if (lambdaResource?.Properties?.FunctionName) {
            targetFunctionName = lambdaResource.Properties.FunctionName;
          } else {
            targetFunctionName = lambdaLogicalId;
          }
        } else if (arn['Ref']) {
          // Resolve Ref — may point to a Lambda Alias or Version
          const refLogicalId = arn['Ref'];
          const refResource = resources[refLogicalId];
          if (
            refResource?.Type === 'AWS::Lambda::Alias' ||
            refResource?.Type === 'AWS::Lambda::Version'
          ) {
            // Follow the chain: Alias/Version → FunctionName → Ref → Lambda
            const fnRef = refResource.Properties?.FunctionName;
            if (fnRef && typeof fnRef === 'object' && fnRef['Ref']) {
              lambdaLogicalId = fnRef['Ref'];
            } else if (typeof fnRef === 'string') {
              targetFunctionName = fnRef;
            }
          }

          if (!targetFunctionName && lambdaLogicalId) {
            const lambdaResource = resources[lambdaLogicalId];
            if (lambdaResource?.Properties?.FunctionName) {
              targetFunctionName = lambdaResource.Properties.FunctionName;
            } else {
              targetFunctionName = lambdaLogicalId;
            }
          }
        }
      }

      if (targetFunctionName) {
        eventRules.push({
          name: logicalId,
          stackName,
          templatePath,
          lambdaLogicalId,
          eventPattern,
          samFunctionName: targetFunctionName,
        });
      }
    }

    // Find SQS → Lambda event source mappings
    for (const [logicalId, resource] of Object.entries(resources)) {
      if (resource.Type !== 'AWS::Lambda::EventSourceMapping') continue;

      const props = resource.Properties || {};

      // Resolve the SQS queue name from EventSourceArn
      let queueName = null;
      const eventSourceArn = props.EventSourceArn;
      if (eventSourceArn?.['Fn::GetAtt']) {
        const queueLogicalId = eventSourceArn['Fn::GetAtt'][0];
        const queueResource = resources[queueLogicalId];
        if (queueResource?.Type === 'AWS::SQS::Queue') {
          queueName = queueResource.Properties?.QueueName;
        }
      }

      // Resolve the Lambda function name
      let functionName = null;
      let lambdaLogicalId = null;
      const fnRef = props.FunctionName;
      if (fnRef?.['Ref']) {
        lambdaLogicalId = fnRef['Ref'];
        const lambdaResource = resources[lambdaLogicalId];
        if (lambdaResource?.Properties?.FunctionName) {
          functionName = lambdaResource.Properties.FunctionName;
        } else {
          functionName = lambdaLogicalId;
        }
      }

      if (queueName && functionName) {
        sqsMappings.push({
          name: logicalId,
          stackName,
          templatePath,
          lambdaLogicalId,
          queueName,
          functionName,
          batchSize: props.BatchSize || 1,
        });
      }
    }
  }

  return { apiStacks, eventRules, sqsMappings };
}

// ─── File Watcher (hot reload) ───────────────────────────────────

/**
 * Watches Lambda source directories for changes and restarts SAM processes.
 * Debounces rapid changes to avoid thrashing.
 */
/**
 * Discover Lambda asset entries and build a reverse index from every bundled
 * source file to the asset(s) that include it.
 *
 * Uses source maps inside each CDK asset directory to:
 * 1. Find the TypeScript handler entry point for esbuild.
 * 2. Resolve all local (non-node_modules) source paths so we can later
 *    map a changed file to only the assets that need rebundling.
 *
 * Returns { assetEntries, reverseIndex }
 *   assetEntries:  Array<{ entryPoint: string, assetDir: string }>
 *   reverseIndex:  Map<absoluteSourcePath, assetEntry[]>
 */
function discoverAssetEntryPoints() {
  const assetDirs = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.startsWith('asset.') &&
        fs.statSync(path.join(CDK_OUT, f)).isDirectory()
    );

  // Map<entryPoint → assetDir[]> — groups all CDK asset dirs sharing the same handler
  const entryToAssetDirs = new Map();
  // Map<absolute source path → Set<entryPoint>> — tracks which entry points each source affects
  const affectedEntryPoints = new Map();

  for (const d of assetDirs) {
    const assetPath = path.join(CDK_OUT, d);
    if (!fs.existsSync(path.join(assetPath, 'index.js'))) continue;

    const mapFile = path.join(assetPath, 'index.js.map');
    if (!fs.existsSync(mapFile)) continue;

    try {
      const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
      const sources = map.sources || [];

      // Find the handler entry point — a local .ts file under a handlers/ directory.
      const entrySource = sources.find(
        (s) =>
          s.startsWith('../') &&
          !s.includes('node_modules') &&
          s.includes('/handlers/') &&
          s.endsWith('.ts')
      );
      if (!entrySource) continue;

      const entryAbsolute = path.resolve(assetPath, entrySource);
      if (!fs.existsSync(entryAbsolute)) continue;

      // Group asset directories by entry point — multiple CDK assets may
      // share the same handler source (e.g., different stack copies).
      if (!entryToAssetDirs.has(entryAbsolute)) {
        entryToAssetDirs.set(entryAbsolute, []);
      }
      entryToAssetDirs.get(entryAbsolute).push(assetPath);

      // Index all local sources → this entry point
      for (const src of sources) {
        if (!src.startsWith('../') || src.includes('node_modules')) continue;
        const absSource = path.resolve(assetPath, src);
        if (!affectedEntryPoints.has(absSource)) {
          affectedEntryPoints.set(absSource, new Set());
        }
        affectedEntryPoints.get(absSource).add(entryAbsolute);
      }
    } catch {
      // Malformed source map — skip
    }
  }

  // Build deduplicated asset entries (one per unique entry point, with all asset dirs)
  const assetEntries = [...entryToAssetDirs.entries()].map(
    ([entryPoint, assetDirs]) => ({ entryPoint, assetDirs })
  );

  // Build reverse index: source file → asset entries that need rebundling
  const reverseIndex = new Map();
  for (const [sourcePath, entryPoints] of affectedEntryPoints) {
    const entries = assetEntries.filter((e) => entryPoints.has(e.entryPoint));
    if (entries.length > 0) {
      reverseIndex.set(sourcePath, entries);
    }
  }

  return { assetEntries, reverseIndex };
}

/**
 * Rebundle Lambda assets in parallel using the esbuild Node API,
 * matching CDK NodejsFunction settings.
 *
 * Builds each unique entry point once, then copies the output into every
 * CDK asset directory that shares that entry point.
 * Returns the number of entry points successfully rebundled.
 */
async function rebundleAssets(assetEntries) {
  const esbuild = await import('esbuild');

  const results = await Promise.allSettled(
    assetEntries.map(async ({ entryPoint, assetDirs }) => {
      // Build into the first asset dir
      const primaryDir = assetDirs[0];
      const outfile = path.join(primaryDir, 'index.js');
      await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        platform: 'node',
        target: 'es2022',
        minify: true,
        sourcemap: true,
        outfile,
        external: ['@aws-sdk/*'],
        logLevel: 'silent',
      });

      // Copy output to any additional asset dirs that share this entry point
      for (let i = 1; i < assetDirs.length; i++) {
        fs.copyFileSync(outfile, path.join(assetDirs[i], 'index.js'));
        fs.copyFileSync(
          outfile + '.map',
          path.join(assetDirs[i], 'index.js.map')
        );
      }
    })
  );

  let rebundled = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      rebundled++;
    } else {
      const entry = path.relative(ROOT, assetEntries[i].entryPoint);
      console.error(` Failed to bundle ${entry}: ${results[i].reason.message}`);
    }
  }
  return rebundled;
}

function startFileWatcher(restartSamFn) {
  const watchDirs = [
    path.join(ROOT, 'services'),
    path.join(ROOT, 'packages', 'events', 'src'),
    path.join(ROOT, 'packages', 'domain', 'src'),
    path.join(ROOT, 'packages', 'shared', 'src'),
  ];

  // Discover entry → asset mapping and reverse index once at startup
  const { assetEntries, reverseIndex } = discoverAssetEntryPoints();
  console.log(
    ` Discovered ${assetEntries.length} Lambda entry point(s) for hot reload (${reverseIndex.size} source files indexed)`
  );

  let debounceTimer = null;
  let isRestarting = false;
  // Accumulate changed files during debounce window
  const pendingChanges = new Set();

  const flushChanges = async () => {
    isRestarting = true;
    const changedFiles = [...pendingChanges];
    pendingChanges.clear();

    // Resolve changed files to affected asset entries via reverse index
    const affectedSet = new Set();
    for (const absPath of changedFiles) {
      const affected = reverseIndex.get(absPath);
      if (affected) {
        for (const entry of affected) affectedSet.add(entry);
      }
    }

    // Deduplicate by entryPoint (reverse index may map multiple sources to the same asset)
    const seen = new Set();
    const toRebuild = [...affectedSet].filter((e) => {
      if (seen.has(e.entryPoint)) return false;
      seen.add(e.entryPoint);
      return true;
    });

    if (toRebuild.length === 0) {
      // Changed file not in any source map — rebuild all as fallback
      console.log(
        `\n File change detected (not in source index — rebuilding all)`
      );
      const count = await rebundleAssets(assetEntries);
      console.log(` Rebundled ${count} asset(s)`);
    } else {
      const names = toRebuild
        .map((e) => path.relative(ROOT, e.entryPoint))
        .join(', ');
      console.log(
        `\n File change detected — rebundling ${toRebuild.length} affected asset(s): ${names}`
      );
      const count = await rebundleAssets(toRebuild);
      console.log(` Rebundled ${count} asset(s)`);
    }

    console.log(' Restarting SAM processes...\n');

    try {
      await restartSamFn();
    } catch (err) {
      console.error(' SAM restart failed:', err.message);
    }

    isRestarting = false;
  };

  const handleChange = (watchDir, filename) => {
    if (isRestarting) return;

    const absPath = path.join(watchDir, filename);
    pendingChanges.add(absPath);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushChanges, 1500);
  };

  for (const dir of watchDirs) {
    if (!fs.existsSync(dir)) continue;

    fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (
        filename &&
        filename.endsWith('.ts') &&
        !filename.endsWith('.test.ts') &&
        !filename.endsWith('.d.ts')
      ) {
        handleChange(dir, filename);
      }
    });
  }

  console.log(' File watcher active — SAM will restart on source changes.');
}

/**
 * Generate a combined SAM template containing all event-targeted Lambda functions.
 * Includes functions triggered by EventBridge rules AND SQS event source mappings.
 * `sam local start-lambda` can only load one template, but these Lambdas
 * may span multiple CDK stacks (e.g., DataLayerStack, PermissionsStack).
 */
function generateEventLambdaTemplate(eventRules, sqsMappings = []) {
  const combined = {
    AWSTemplateFormatVersion: '2010-09-09',
    Resources: {},
  };

  const seen = new Set();

  // Add all event-triggered and SQS-triggered Lambda functions.
  // Some functions may also appear in start-api templates (e.g., RequestHandler
  // is both an API Gateway handler and an EventBridge target). This is intentional —
  // start-api serves HTTP requests while start-lambda serves event invocations.
  const allTargets = [...eventRules, ...sqsMappings];

  for (const rule of allTargets) {
    if (!rule.lambdaLogicalId || !rule.templatePath) continue;
    const key = `${rule.templatePath}:${rule.lambdaLogicalId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const template = JSON.parse(fs.readFileSync(rule.templatePath, 'utf8'));
    const lambdaResource = template.Resources[rule.lambdaLogicalId];
    if (lambdaResource) {
      combined.Resources[rule.lambdaLogicalId] = lambdaResource;
    }
  }

  const combinedPath = path.join(CDK_OUT, 'event-lambdas.template.json');
  fs.writeFileSync(combinedPath, JSON.stringify(combined, null, 2));
  console.log(
    ` Generated combined event Lambda template with ${Object.keys(combined.Resources).length} function(s)`
  );
  return combinedPath;
}

/**
 * Generate elasticmq.conf from all AWS::SQS::Queue resources in CDK output.
 * Replaces the manually maintained config with one derived from CDK.
 */
function generateElasticMqConfig() {
  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.endsWith('.template.json') &&
        !f.startsWith('_split.') &&
        f !== 'event-lambdas.template.json'
    );

  const queues = [];

  for (const file of templateFiles) {
    const templatePath = path.join(CDK_OUT, file);
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const resources = template.Resources || {};

    for (const [, resource] of Object.entries(resources)) {
      if (resource.Type !== 'AWS::SQS::Queue') continue;

      const props = resource.Properties || {};
      const name = props.QueueName;
      if (!name) continue;

      queues.push({
        name,
        fifo: !!props.FifoQueue,
        contentBasedDeduplication: !!props.ContentBasedDeduplication,
        visibilityTimeout: props.VisibilityTimeout || 30,
        delay: props.DelaySeconds || 0,
        receiveMessageWait: props.ReceiveMessageWaitTimeSeconds || 0,
      });
    }
  }

  // Sort for stable output
  queues.sort((a, b) => a.name.localeCompare(b.name));

  const queueBlocks = queues.map((q) => {
    const lines = [
      `  "${q.name}" {`,
      `    defaultVisibilityTimeout = ${q.visibilityTimeout} seconds`,
      `    delay = ${q.delay} seconds`,
      `    receiveMessageWait = ${q.receiveMessageWait} seconds`,
    ];
    if (q.fifo) lines.push('    fifo = true');
    if (q.contentBasedDeduplication)
      lines.push('    contentBasedDeduplication = true');
    lines.push('  }');
    return lines.join('\n');
  });

  const config = `# Auto-generated from CDK synth output by dev.js
# Do not edit manually — re-run dev.js to regenerate.

include classpath("application.conf")

node-address {
  protocol = http
  host = "*"
  port = 9324
  context-path = ""
}

rest-sqs {
  enabled = true
  bind-port = 9324
  bind-hostname = "0.0.0.0"
  sqs-limits = strict
}

rest-stats {
  enabled = true
  bind-port = 9325
  bind-hostname = "0.0.0.0"
}

queues {
${queueBlocks.join('\n\n')}
}
`;

  const confPath = path.join(ROOT, 'scripts', 'elasticmq.conf');
  fs.writeFileSync(confPath, config);
  console.log(` Generated elasticmq.conf with ${queues.length} queue(s)`);

  // Restart ElasticMQ so it picks up the new config (it only reads at startup)
  try {
    execSync('docker compose --profile v3 restart elasticmq', {
      stdio: 'pipe',
      cwd: ROOT,
    });
    console.log(' Restarted ElasticMQ with new queue config');
  } catch {
    // ElasticMQ may not be running yet (first startup) — that's fine,
    // it will read the config when it starts
  }
}

// ─── SAM Processes ──────────────────────────────────────────────

/** Track SAM processes separately so we can restart just them. */
const samProcesses = [];

/**
 * Kill any process listening on the given port.
 * Uses lsof to find PIDs and sends SIGKILL.
 */
const killProcessOnPort = (port) => {
  try {
    const output = execSync(`lsof -ti tcp:${port}`, { stdio: 'pipe' })
      .toString()
      .trim();
    if (output) {
      const pids = output.split('\n').filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
          console.log(`\x1b[33m Killed process ${pid} on port ${port}\x1b[0m`);
        } catch {
          // Process may have already exited
        }
      }
    }
  } catch {
    // No process found on port — that's fine
  }
};

/**
 * Check if a port is currently in use.
 */
const isPortInUse = (port) => {
  try {
    const output = execSync(`lsof -ti tcp:${port}`, { stdio: 'pipe' })
      .toString()
      .trim();
    return output.length > 0;
  } catch {
    return false;
  }
};

/**
 * Wait until a port is free, with a timeout.
 * Returns true if port became free, false if timed out.
 */
const waitForPortFree = async (port, timeoutMs = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!isPortInUse(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

/**
 * Deterministic port map — each API gets a stable port based on its short name.
 * This avoids port conflicts when APIs are discovered in a different order across
 * cdk synth runs, and makes port assignments predictable.
 */
const samPortMap = new Map();

const getSamPort = (apiName, stackName) => {
  const shortName = (apiName || stackName)
    .replace(/^tech-admin-risksmartApp-/, '')
    .replace(/-api$/, '');

  if (samPortMap.has(shortName)) return samPortMap.get(shortName);

  // Assign next available port starting from API_BASE_PORT
  const usedPorts = new Set(samPortMap.values());
  let port = API_BASE_PORT;
  while (usedPorts.has(port)) port++;
  samPortMap.set(shortName, port);
  return port;
};

function startSamApi(stack, { isRetry = false } = {}) {
  const shortName = (stack.apiName || stack.stackName)
    .replace(/^tech-admin-risksmartApp-/, '')
    .replace(/-api$/, '');
  console.log(
    ` SAM API: ${shortName} on :${stack.port}${isRetry ? ' (retry)' : ''}`
  );

  const child = spawnProcess(
    'sam',
    [
      'local',
      'start-api',
      '--template',
      stack.templatePath,
      '--warm-containers',
      'EAGER',
      '--docker-network',
      'risksmart-app_default',
      '--skip-pull-image',
      '--host',
      '0.0.0.0',
      '--port',
      String(stack.port),
    ],
    { cwd: CDK_DIR, prefix: `sam:${stack.port}`, prefixColor: COLORS.green }
  );

  child.on('exit', (code) => {
    if (code && code !== 0 && !isRetry) {
      console.error(
        `\x1b[31m SAM API ${shortName} (:${stack.port}) exited with code ${code} — cleaning up and retrying...\x1b[0m`
      );
      // Remove the failed process from tracking arrays
      const samIdx = samProcesses.indexOf(child);
      if (samIdx !== -1) samProcesses.splice(samIdx, 1);
      const procIdx = processes.indexOf(child);
      if (procIdx !== -1) processes.splice(procIdx, 1);

      // Kill whatever is holding the port
      killProcessOnPort(stack.port);

      // Kill any orphaned SAM Lambda containers that may hold conflicting ports
      try {
        execSync(
          'docker ps --format "{{.ID}} {{.Image}}" | grep "public.ecr.aws/lambda\\|public.ecr.aws/sam\\|samcli" | awk \'{print $1}\' | xargs -r docker rm -f 2>/dev/null',
          { stdio: 'pipe' }
        );
      } catch {
        // No containers to kill
      }

      // Retry after a short delay to let ports be released
      setTimeout(() => startSamApi(stack, { isRetry: true }), 5000);
    } else if (code && code !== 0 && isRetry) {
      console.error(
        `\x1b[31m SAM API ${shortName} (:${stack.port}) failed again on retry (exit code ${code}). Manual intervention required.\x1b[0m`
      );
    }
  });

  samProcesses.push(child);
  return child;
}

function startSamLambda(templatePath) {
  console.log(` SAM Lambda endpoint on :${LAMBDA_ENDPOINT_PORT}`);

  const child = spawnProcess(
    'sam',
    [
      'local',
      'start-lambda',
      '--template',
      templatePath,
      '--warm-containers',
      'EAGER',
      '--docker-network',
      'risksmart-app_default',
      '--skip-pull-image',
      '--host',
      '0.0.0.0',
      '--port',
      String(LAMBDA_ENDPOINT_PORT),
    ],
    {
      cwd: CDK_DIR,
      prefix: `sam:${LAMBDA_ENDPOINT_PORT}`,
      prefixColor: COLORS.green,
    }
  );

  samProcesses.push(child);
  return child;
}

/**
 * Kill all SAM processes and their warm Docker containers.
 */
async function killSamProcesses() {
  // Collect the ports we need to free
  const portsToFree = [...samPortMap.values(), LAMBDA_ENDPOINT_PORT];

  // Kill SAM CLI processes
  for (const child of samProcesses) {
    child.kill('SIGTERM');
  }
  samProcesses.length = 0;

  // Remove killed processes from the global list
  for (let i = processes.length - 1; i >= 0; i--) {
    if (processes[i].killed || processes[i].exitCode !== null) {
      processes.splice(i, 1);
    }
  }

  // Kill SAM's warm Lambda Docker containers (they persist after SAM exits)
  try {
    execSync(
      'docker ps --format "{{.ID}} {{.Image}}" | grep "public.ecr.aws/lambda\\|public.ecr.aws/sam\\|samcli" | awk \'{print $1}\' | xargs -r docker rm -f 2>/dev/null',
      { stdio: 'pipe' }
    );
  } catch {
    // No containers to kill
  }

  // Wait for all SAM ports to be released (force-kill stragglers)
  for (const port of portsToFree) {
    const freed = await waitForPortFree(port, 5000);
    if (!freed) {
      console.warn(
        `\x1b[33m Port ${port} still in use after 5s — force-killing...\x1b[0m`
      );
      killProcessOnPort(port);
      await waitForPortFree(port, 3000);
    }
  }
}

// ─── Event Router + Mocks ───────────────────────────────────────

/**
 * Write discovered EventBridge rules to routes.json for the event router.
 */
function writeEventRouterConfig(eventRules) {
  const routesPath = path.join(__dirname, 'local-event-router', 'routes.json');
  const config = {
    _generated: new Date().toISOString(),
    _source: 'Generated from cdk synth output by dev.js',
    rules: eventRules.map((rule) => ({
      name: rule.name,
      eventPattern: rule.eventPattern,
      samFunctionName: rule.samFunctionName,
    })),
  };

  fs.writeFileSync(routesPath, JSON.stringify(config, null, 2));
  console.log(
    ` Generated ${eventRules.length} event routing rule(s) in routes.json`
  );
}

/**
 * Inject local development environment variables into all Lambda functions
 * across CDK-synthesized CloudFormation templates.
 *
 * SAM Lambda containers run inside Docker, so they reference other Docker
 * services by container name (e.g., dynamodb-local:8000) and the host
 * machine via host.docker.internal.
 *
 * API URLs are populated based on the discovered stack → port mapping
 * so that inter-service calls (e.g., tRPC → data-layer) resolve correctly.
 */
function injectLambdaEnvVars(apiStacks) {
  // Build a map of API/stack name keywords → host.docker.internal:port
  const apiUrlByKeyword = {};
  for (const stack of apiStacks) {
    // Index by API name (more specific, handles multi-API stacks)
    const apiKey = (stack.apiName || stack.stackName).toLowerCase();
    apiUrlByKeyword[apiKey] = `http://${getDockerHost()}:${stack.port}`;
    // Also index by stack name for backward compatibility
    const stackKey = stack.stackName.toLowerCase();
    if (!apiUrlByKeyword[stackKey]) {
      apiUrlByKeyword[stackKey] = `http://${getDockerHost()}:${stack.port}`;
    }
  }

  // Resolve well-known API URLs from discovered stacks/APIs
  const findUrl = (keyword) => {
    for (const [name, url] of Object.entries(apiUrlByKeyword)) {
      if (name.includes(keyword)) return url;
    }
    return null;
  };

  const env = {
    IS_LOCAL: 'true',
    STAGE: 'tech-admin',
    APP_NAME: 'risksmartApp',
    AWS_REGION: 'eu-west-2',
    // Override SAM's fake credentials — DynamoDB Local rejects session tokens
    AWS_ACCESS_KEY_ID: 'local',
    AWS_SECRET_ACCESS_KEY: 'local',
    AWS_SESSION_TOKEN: '',
    TENANT_CONFIG_TABLE: 'TenantConfig',
    TENANT_REQUEST_EVENT_TABLE_NAME: 'RequestEventTable',
    // Docker service endpoints (Lambda containers → other Docker containers)
    AWS_ENDPOINT_URL_DYNAMODB: 'http://dynamodb-local:8000',
    LOCAL_DATABASE_CONNECTION_STRING:
      'postgres://postgres:postgrespassword@postgres:5432/postgres',
    PDP_ENDPOINT: process.env.PDP_ENDPOINT || 'http://pdp:7000',
    PERMIT_API_URL: process.env.PERMIT_API_URL || 'https://api.permit.io',
    // PERMIT_SECRET_NAME is set by CDK in the synthesized templates
    // AWS service mock endpoints (Lambda containers → host mocks)
    EVENT_BUS_NAME: 'local',
    AWS_ENDPOINT_URL_EVENTBRIDGE: `http://${getDockerHost()}:${EVENT_ROUTER_PORT}`,
    AWS_ENDPOINT_URL_S3: 'http://rustfs:9000',
    AWS_ENDPOINT_URL_SQS: 'http://elasticmq:9324',
    AWS_ENDPOINT_URL_FIREHOSE: `http://${getDockerHost()}:3011`,
    SYNC_QUEUE_URL:
      'http://elasticmq:9324/000000000000/eu-west-2-tech-admin-tenant-sync-queue.fifo',
    // Misc
    SENTRY_RELEASE: 'local-dev',
    NODE_ENV: 'development',
    POWERTOOLS_DEV: 'true',
  };

  // AWS mock endpoints — mocks run as Docker Compose services (ssm-mock,
  // secrets-manager-mock) and expose ports on the host. SAM Lambda containers
  // reach them via host.docker.internal since they're on a different network.
  env.AWS_ENDPOINT_URL_SSM = `http://${getDockerHost()}:${SSM_MOCK_PORT}`;
  env.AWS_ENDPOINT_URL_SECRETS_MANAGER = `http://${getDockerHost()}:${SECRETS_MANAGER_MOCK_PORT}`;

  // Inject env vars directly into CDK templates — more reliable than SAM --env-vars
  // which has format/compatibility issues with CDK-generated templates.
  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter((f) => f.endsWith('.template.json'));

  let functionCount = 0;
  for (const file of templateFiles) {
    const templatePath = path.join(CDK_OUT, file);
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    let modified = false;

    for (const [, resource] of Object.entries(template.Resources || {})) {
      if (resource.Type !== 'AWS::Lambda::Function') continue;

      if (!resource.Properties) resource.Properties = {};
      if (!resource.Properties.Environment)
        resource.Properties.Environment = {};
      if (!resource.Properties.Environment.Variables)
        resource.Properties.Environment.Variables = {};

      // Overwrite env vars with local values — this ensures correct URLs
      // even when re-running with --skip-synth or when CDK sets CFN intrinsics
      for (const [key, value] of Object.entries(env)) {
        resource.Properties.Environment.Variables[key] = value;
      }
      modified = true;
      functionCount++;
    }

    if (modified) {
      fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    }
  }

  // Also set in process.env so SAM CLI (spawned as a child process) inherits
  // the correct values. SAM passes its host env vars to Lambda containers,
  // which can override template values. Without this, .env values like
  // DYNAMODB_ENDPOINT=http://localhost:8000 leak into Lambda containers.
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }

  console.log(
    ` Injected local env vars into ${functionCount} Lambda function(s) across ${templateFiles.length} templates`
  );

  return new Set(Object.keys(env));
}

/**
 * Known suffixes for env vars that hold references to external stores
 * (SSM Parameter Store or Secrets Manager). Stripping the suffix gives
 * the base env var name whose value in process.env is the actual content.
 */
const REFERENCE_SUFFIXES = ['_SSM_PARAM', '_PARAM_NAME', '_SECRET_NAME'];

/**
 * Strip the reference suffix from an env var key to derive the base name.
 * e.g. DATA_LAYER_CLIENT_API_URL_SSM_PARAM → DATA_LAYER_CLIENT_API_URL
 *      AI_FEEDBACK_LANGSMITH_CONFIG_PARAM_NAME → AI_FEEDBACK_LANGSMITH_CONFIG
 *      PERMIT_SECRET_NAME → PERMIT
 */
function stripReferenceSuffix(key) {
  for (const suffix of REFERENCE_SUFFIXES) {
    if (key.endsWith(suffix)) return key.slice(0, -suffix.length);
  }
  return key;
}

/**
 * Build SSM parameter and Secrets Manager seed maps from CDK synth output.
 *
 * Uses a single unified scan of all Lambda env vars:
 *
 * 1. URL parameters — scans AWS::SSM::Parameter resources whose Value
 *    references an AWS::ApiGateway::RestApi and maps to discovered local ports.
 *
 * 2. All other references — scans Lambda env vars, strips known suffixes
 *    (_SSM_PARAM, _PARAM_NAME, _SECRET_NAME) to derive the base env var,
 *    and looks up its value in process.env. The reference VALUE determines
 *    which mock gets seeded:
 *      - Starts with "/" → SSM parameter path → seed SSM mock
 *      - Otherwise → secret name → seed Secrets Manager mock
 */
function buildMockSeeds(apiStacks) {
  const dockerHost = getDockerHost();
  const ssmParams = {};
  const secrets = {};

  // Build RestApi name → local URL index from discovered API stacks
  const apiUrlByName = {};
  for (const stack of apiStacks) {
    const name = (stack.apiName || stack.stackName).toLowerCase();
    apiUrlByName[name] = `http://${dockerHost}:${stack.port}`;
  }

  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.endsWith('.template.json') &&
        !f.startsWith('_split.') &&
        f !== 'event-lambdas.template.json'
    );

  // Collect all reference env vars: referenceValue → envKey
  const referenceVars = new Map();

  for (const file of templateFiles) {
    const template = JSON.parse(
      fs.readFileSync(path.join(CDK_OUT, file), 'utf8')
    );
    const resources = template.Resources || {};

    // --- URL parameters: AWS::SSM::Parameter → RestApi mapping ---
    for (const [, resource] of Object.entries(resources)) {
      if (resource.Type !== 'AWS::SSM::Parameter') continue;
      const props = resource.Properties || {};
      const paramName = props.Name;
      if (!paramName || typeof paramName !== 'string') continue;

      const val = props.Value;
      if (!val || typeof val !== 'object' || !val['Fn::Join']) continue;

      const joinParts = val['Fn::Join'][1] || [];
      for (const part of joinParts) {
        if (!part || typeof part !== 'object' || !part['Ref']) continue;
        const refId = part['Ref'];
        const refResource = resources[refId];
        if (!refResource || refResource.Type !== 'AWS::ApiGateway::RestApi')
          continue;

        const apiName = (refResource.Properties?.Name || refId).toLowerCase();
        if (apiUrlByName[apiName]) {
          ssmParams[paramName] = apiUrlByName[apiName];
        }
      }
    }

    // --- All reference env vars from Lambda functions ---
    for (const [, resource] of Object.entries(resources)) {
      if (resource.Type !== 'AWS::Lambda::Function') continue;
      const envVars = resource.Properties?.Environment?.Variables || {};
      for (const [envKey, envValue] of Object.entries(envVars)) {
        if (
          typeof envValue !== 'string' ||
          !envValue ||
          envKey === stripReferenceSuffix(envKey) // no suffix matched
        ) {
          continue;
        }
        if (!referenceVars.has(envValue)) {
          referenceVars.set(envValue, envKey);
        }
      }
    }
  }

  // Known aliases: when the base key derived from suffix-stripping doesn't
  // match the .env var name, map it here. e.g., PERMIT_SECRET_NAME strips
  // _SECRET_NAME suffix to PERMIT, but .env uses PDP_API_KEY for the same value.
  const BASE_KEY_ALIASES = {
    PERMIT: 'PDP_API_KEY',
  };

  // Resolve each reference to an actual value from process.env
  const unseeded = [];
  for (const [refValue, envKey] of referenceVars) {
    const baseKey = stripReferenceSuffix(envKey);

    // Skip URL parameters already seeded from AWS::SSM::Parameter resources
    if (ssmParams[refValue]) continue;

    // Look up the base env var in process.env (with alias fallback)
    const envValue =
      process.env[baseKey] || process.env[BASE_KEY_ALIASES[baseKey]];
    if (envValue) {
      if (refValue.startsWith('/')) {
        ssmParams[refValue] = envValue;
      } else {
        secrets[refValue] = envValue;
      }
      continue;
    }

    unseeded.push({ refValue, baseKey, isSsm: refValue.startsWith('/') });
  }

  if (unseeded.length > 0) {
    console.log(` References not seeded (set env var in .env if needed):`);
    for (const { refValue, baseKey, isSsm } of unseeded) {
      const type = isSsm ? 'SSM' : 'Secret';
      console.log(`    [${type}] ${refValue}  (set ${baseKey} in .env)`);
    }
  }

  return { ssmParams, secrets };
}

/**
 * Seed the SSM and Secrets Manager mocks (running in Docker Compose)
 * with values discovered from CDK synth output and .env.
 */
async function seedMocks(apiStacks) {
  const { ssmParams, secrets } = buildMockSeeds(apiStacks);

  // Seed SSM mock
  console.log(
    ` Seeding SSM mock on :${SSM_MOCK_PORT} (${Object.keys(ssmParams).length} parameter(s))`
  );
  for (const [name, value] of Object.entries(ssmParams)) {
    const display = value.length > 60 ? value.substring(0, 57) + '...' : value;
    console.log(`    ${name} = ${display}`);
  }

  for (const [name, value] of Object.entries(ssmParams)) {
    const body = JSON.stringify({
      Name: name,
      Value: value,
      Type: 'String',
      Overwrite: true,
    });
    try {
      const res = await fetch(`http://localhost:${SSM_MOCK_PORT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AmazonSSM.PutParameter',
        },
        body,
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`   Failed to seed SSM param ${name}: ${err}`);
      }
    } catch (err) {
      console.error(`   Failed to reach SSM mock for ${name}: ${err.message}`);
    }
  }

  // Seed Secrets Manager mock
  console.log(
    ` Seeding Secrets Manager mock on :${SECRETS_MANAGER_MOCK_PORT} (${Object.keys(secrets).length} secret(s))`
  );
  for (const [name, value] of Object.entries(secrets)) {
    const display =
      String(value).length > 60
        ? String(value).substring(0, 57) + '...'
        : value;
    console.log(`    ${name} = ${display}`);
  }

  for (const [name, value] of Object.entries(secrets)) {
    const body = JSON.stringify({ SecretId: name, SecretString: value });
    try {
      const res = await fetch(`http://localhost:${SECRETS_MANAGER_MOCK_PORT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'secretsmanager.PutSecretValue',
        },
        body,
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`   Failed to seed secret ${name}: ${err}`);
      }
    } catch (err) {
      console.error(
        `   Failed to reach Secrets Manager mock for ${name}: ${err.message}`
      );
    }
  }
}

function startEventRouter() {
  console.log(` Event router on :${EVENT_ROUTER_PORT}`);

  return spawnProcess(
    'node',
    [path.join(__dirname, 'local-event-router', 'index.js')],
    {
      prefix: 'events',
      prefixColor: COLORS.cyan,
      env: {
        EVENT_ROUTER_PORT: String(EVENT_ROUTER_PORT),
        SAM_LAMBDA_ENDPOINT: `http://localhost:${LAMBDA_ENDPOINT_PORT}`,
      },
    }
  );
}

/**
 * Discover Lambda env vars from CDK templates that the tRPC Docker
 * container also needs (SSM parameter paths, secret names, etc.).
 *
 * Scans all Lambda functions for env vars whose values look like
 * SSM paths (start with "/") or whose keys end in _SECRET_NAME.
 * Returns a deduplicated map of envKey → value.
 */
function discoverTrpcEnvVarsFromCdk() {
  const envVars = {};

  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.endsWith('.template.json') &&
        !f.startsWith('_split.') &&
        f !== 'event-lambdas.template.json'
    );

  const isRefEnvVar = (key, value) => {
    if (typeof value !== 'string') return false;
    return (
      (value.startsWith('/') &&
        (key.endsWith('_SSM_PARAM') || key.endsWith('_PARAM_NAME'))) ||
      key.endsWith('_SECRET_NAME')
    );
  };

  for (const file of templateFiles) {
    const template = JSON.parse(
      fs.readFileSync(path.join(CDK_OUT, file), 'utf8')
    );
    const resources = template.Resources || {};

    for (const [, resource] of Object.entries(resources)) {
      // Scan Lambda function env vars
      if (resource.Type === 'AWS::Lambda::Function') {
        const vars = resource.Properties?.Environment?.Variables || {};
        for (const [key, value] of Object.entries(vars)) {
          if (isRefEnvVar(key, value)) envVars[key] = value;
        }
      }

      // Scan ECS task definition env vars (tRPC runs as ECS Fargate in production)
      if (resource.Type === 'AWS::ECS::TaskDefinition') {
        for (const containerDef of resource.Properties?.ContainerDefinitions ||
          []) {
          for (const { Name: key, Value: value } of containerDef.Environment ||
            []) {
            if (isRefEnvVar(key, value)) envVars[key] = value;
          }
        }
      }
    }
  }

  return envVars;
}

/**
 * Restart the tRPC Docker container with CDK-discovered env vars.
 *
 * The mock endpoints (SSM, Secrets Manager) are configured in
 * docker-compose.yml. This function injects SSM parameter paths
 * and secret names discovered from CDK synth so they don't need
 * to be hardcoded in docker-compose.
 */
function restartTrpc() {
  const cdkEnvVars = discoverTrpcEnvVarsFromCdk();

  console.log(` Restarting tRPC container with CDK-discovered env vars:`);
  for (const [key, value] of Object.entries(cdkEnvVars)) {
    console.log(`   ${key}=${value}`);
  }

  try {
    // --force-recreate ensures Docker Compose creates a new container with the
    // updated env vars. Without it, Compose may reuse the existing container
    // (from the base services step) which had empty ${VAR:-} defaults.
    execSync(
      'docker compose --profile v3 up -d --no-deps --force-recreate trpc',
      {
        stdio: 'inherit',
        cwd: ROOT,
        env: {
          ...process.env,
          ...cdkEnvVars,
        },
      }
    );
  } catch (error) {
    console.error(' Failed to restart tRPC:', error.message);
  }
}

function startSqsPoller(sqsMappings) {
  if (sqsMappings.length === 0) {
    console.log(' No SQS → Lambda mappings discovered — skipping poller');
    return;
  }

  // Build queue URL → function name mappings for the poller
  const queueMappings = sqsMappings.map((m) => ({
    queueUrl: `http://localhost:9324/000000000000/${m.queueName}`,
    queueArn: `arn:aws:sqs:eu-west-2:000000000000:${m.queueName}`,
    functionName: m.functionName,
    batchSize: m.batchSize,
  }));

  console.log(` SQS poller: ${queueMappings.length} queue(s)`);
  for (const m of queueMappings) {
    console.log(`   ${m.queueUrl.split('/').pop()} → ${m.functionName}`);
  }

  return spawnProcess(
    'node',
    [
      '-e',
      `import('${path.join(__dirname, 'local-mocks', 'sqs-poller.js').replace(/\\/g, '/')}').then(m => m.startSqsPoller());`,
    ],
    {
      prefix: 'sqs-poller',
      prefixColor: COLORS.magenta,
      env: {
        SQS_ENDPOINT: 'http://localhost:9324',
        SAM_LAMBDA_ENDPOINT: `http://localhost:${LAMBDA_ENDPOINT_PORT}`,
        QUEUE_MAPPINGS: JSON.stringify(queueMappings),
      },
    }
  );
}

function startFirehoseMock() {
  console.log(' Firehose mock on :3011');

  return spawnProcess(
    'node',
    [
      '-e',
      `import('${path.join(__dirname, 'local-mocks', 'firehose-mock.js').replace(/\\/g, '/')}').then(m => m.startFirehoseMock());`,
    ],
    {
      prefix: 'firehose',
      prefixColor: COLORS.yellow,
      env: {
        S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
        AWS_ACCESS_KEY_ID: 'local',
        AWS_SECRET_ACCESS_KEY: 'local',
      },
    }
  );
}

// ─── Container Naming ────────────────────────────────────────────

/**
 * Return the IDs and current names of all running SAM Lambda containers
 * that haven't already been renamed.
 */
function getUnrenamedSamContainers() {
  try {
    const output = execSync(
      'docker ps --format "{{.ID}} {{.Names}} {{.Image}}" | grep "public.ecr.aws/lambda" 2>/dev/null',
      { stdio: 'pipe', encoding: 'utf8' }
    ).trim();
    if (!output) return [];

    return output
      .split('\n')
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return { id: parts[0], name: parts[1] };
      })
      .filter(({ name }) => name && !name.startsWith('sam-'));
  } catch {
    return [];
  }
}

/**
 * Build a lookup from Lambda logical ID → short stack name by scanning CDK templates.
 * Used to prefix container names with their owning stack for easy identification.
 */
function buildLogicalIdToStackMap() {
  const map = new Map();
  const templateFiles = fs
    .readdirSync(CDK_OUT)
    .filter(
      (f) =>
        f.endsWith('.template.json') &&
        !f.startsWith('_split.') &&
        f !== 'event-lambdas.template.json'
    );

  for (const file of templateFiles) {
    const stackName = file
      .replace('.template.json', '')
      .replace(/^tech-admin-risksmartApp-/, '');
    try {
      const template = JSON.parse(
        fs.readFileSync(path.join(CDK_OUT, file), 'utf8')
      );
      for (const [logicalId, resource] of Object.entries(
        template.Resources || {}
      )) {
        if (resource.Type === 'AWS::Lambda::Function') {
          // First stack wins — avoids overwriting with less-specific stack names
          if (!map.has(logicalId)) {
            map.set(logicalId, stackName);
          }
        }
      }
    } catch {
      // Template read failed — skip
    }
  }
  return map;
}

/**
 * Rename SAM warm containers to meaningful names based on their Lambda function name
 * and owning CDK stack. Format: sam-{StackName}-{LogicalId}
 *
 * Polls until containers appear (up to 60s), since SAM creates them asynchronously
 * and the exact startup time varies per machine.
 */
async function renameSamContainers() {
  const MAX_WAIT_MS = 60_000;
  const POLL_INTERVAL_MS = 3_000;
  const startTime = Date.now();

  // Wait for at least one unrenamed SAM container to appear
  let containers = [];
  while (Date.now() - startTime < MAX_WAIT_MS) {
    containers = getUnrenamedSamContainers();
    if (containers.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  if (containers.length === 0) return;

  // SAM starts containers in waves — keep polling until no new ones appear
  let previousCount = 0;
  while (
    containers.length > previousCount &&
    Date.now() - startTime < MAX_WAIT_MS
  ) {
    previousCount = containers.length;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    containers = getUnrenamedSamContainers();
  }

  const logicalIdToStack = buildLogicalIdToStackMap();
  let totalRenamed = 0;
  const attempted = new Set();
  const usedNames = new Set();

  // Rename in passes — after each pass, check for stragglers that
  // appeared while we were renaming (e.g., start-lambda containers
  // launching after start-api containers).
  while (Date.now() - startTime < MAX_WAIT_MS) {
    const toRename = containers.filter(({ id }) => !attempted.has(id));
    if (toRename.length === 0) break;

    for (const { id, name } of toRename) {
      attempted.add(id);
      try {
        const funcName = execSync(
          `docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' ${id}`,
          { stdio: 'pipe', encoding: 'utf8' }
        )
          .split('\n')
          .find((l) => l.startsWith('AWS_LAMBDA_FUNCTION_NAME='))
          ?.split('=')[1]
          ?.trim();

        if (!funcName) continue;

        const stackPrefix = logicalIdToStack.get(funcName) || 'unknown';
        let newName = `sam-${stackPrefix}-${funcName}`.replace(
          /[^a-zA-Z0-9_.-]/g,
          '-'
        );
        // Handle duplicate function names across SAM processes (e.g., start-api and start-lambda)
        if (usedNames.has(newName)) {
          let suffix = 2;
          while (usedNames.has(`${newName}-${suffix}`)) suffix++;
          newName = `${newName}-${suffix}`;
        }
        usedNames.add(newName);
        execSync(`docker rename ${id} ${newName}`, { stdio: 'pipe' });
        console.log(` Renamed container: ${name} → ${newName}`);
        totalRenamed++;
      } catch {
        // Individual container rename failed — non-fatal
      }
    }

    // Check for any new containers that appeared during this pass
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    containers = getUnrenamedSamContainers();
  }

  if (totalRenamed > 0) {
    console.log(` Renamed ${totalRenamed} SAM container(s)`);
  }
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const forceInit = args.includes('--init');
  const skipSynth = args.includes('--skip-synth');
  const noWatch = args.includes('--no-watch');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Local Development Workflow (SAM + CDK)

Usage: node dev.js [options]

Options:
  --init          Re-run DynamoDB/S3 initialization (normally handled by Docker Compose)
  --skip-synth    Skip cdk synth (use existing cdk.out/)
  --no-watch      Disable file watcher (used in CI)
  --help, -h      Show this help message

Prerequisites:
  1. Docker services running: pnpm run api:v3
     (This automatically initializes DynamoDB tables and S3 buckets)
  2. AWS SAM CLI installed: Don't use brew, use AWS installer

CDK is the single source of truth — API stacks, Lambda functions, and
EventBridge rules are all discovered from the cdk synth output.
`);
    process.exit(0);
  }

  console.log('Local Development Workflow (SAM + CDK)');
  console.log('======================================\n');

  checkEnvFileExists();
  checkPrerequisites();

  // Ensure cdk-stack/.env exists (gitignored, needed for CDK synth)
  // Prefer .env.ci (CI-specific defaults) over .env.example (local dev defaults)
  const cdkEnv = path.join(CDK_DIR, '.env');
  if (!fs.existsSync(cdkEnv)) {
    const cdkEnvCi = path.join(CDK_DIR, '.env.ci');
    const cdkEnvExample = path.join(CDK_DIR, '.env.example');
    const source = fs.existsSync(cdkEnvCi) ? cdkEnvCi : cdkEnvExample;
    if (source && fs.existsSync(source)) {
      fs.copyFileSync(source, cdkEnv);
      console.log(` Created cdk-stack/.env from ${path.basename(source)}`);
    }
  }

  // Step 1: Init local AWS services
  // Docker Compose runs the aws-init container automatically before trpc starts.
  // Use --init to run it again from the host (e.g., after wiping volumes).
  if (forceInit) {
    console.log('\n Running local AWS service initialization...');
    execSync('node scripts/init-local-aws.js', {
      stdio: 'inherit',
      cwd: ROOT,
      env: {
        ...process.env,
        DYNAMODB_ENDPOINT:
          process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
        S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
        SQS_ENDPOINT: process.env.SQS_ENDPOINT || 'http://localhost:9324',
        AWS_REGION: process.env.AWS_REGION || 'eu-west-2',
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'local',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'local',
      },
    });
  }

  // Step 2: CDK synth
  if (!skipSynth) {
    runCdkSynth();
  }

  // Step 3: Discover APIs, event rules, and SQS mappings from synth output
  const { apiStacks, eventRules, sqsMappings } = discoverFromCdkOutput();

  console.log(`Discovered from CDK:`);
  console.log(`  ${apiStacks.length} API Gateway(s)`);
  for (const s of apiStacks) {
    console.log(`    - ${s.apiName || s.stackName} → :${s.port}`);
  }
  console.log(`  ${eventRules.length} EventBridge rule(s)`);
  for (const r of eventRules) {
    console.log(`    - ${r.name} → ${r.samFunctionName}`);
  }
  console.log(`  ${sqsMappings.length} SQS → Lambda mapping(s)`);
  for (const m of sqsMappings) {
    console.log(`    - ${m.queueName} → ${m.functionName}`);
  }
  console.log();

  // Step 4: Generate configs from discovered data
  const injectedKeys = injectLambdaEnvVars(apiStacks);
  validateCdkEnvVars(injectedKeys);
  generateElasticMqConfig();
  if (eventRules.length > 0) {
    writeEventRouterConfig(eventRules);
  }

  // Step 5: Start SAM API processes
  for (const stack of apiStacks) {
    startSamApi(stack);
  }

  // Step 6: Start SAM Lambda endpoint for event/SQS-triggered functions
  // Generate a combined template with all event-targeted Lambda functions
  // (they may span multiple CDK stacks: DataLayerStack, PermissionsStack, etc.)
  let eventLambdaTemplate;
  if (eventRules.length > 0 || sqsMappings.length > 0) {
    eventLambdaTemplate = generateEventLambdaTemplate(eventRules, sqsMappings);
  } else {
    eventLambdaTemplate =
      apiStacks.length > 0
        ? apiStacks[0].templatePath
        : path.join(
            CDK_OUT,
            fs.readdirSync(CDK_OUT).find((f) => f.endsWith('.template.json')) ||
              ''
          );
  }
  startSamLambda(eventLambdaTemplate);

  // Step 7: Seed AWS mocks (running in Docker Compose) + start event router + mocks
  await seedMocks(apiStacks);
  startEventRouter();
  startSqsPoller(sqsMappings);
  startFirehoseMock();

  // Step 8: Restart tRPC container to pick up seeded parameters
  restartTrpc();

  // Step 9: Rename SAM containers with meaningful names
  await renameSamContainers();

  // Step 10: Start file watcher for hot reload (skip in CI with --no-watch)
  if (!noWatch) {
    startFileWatcher(async () => {
      await killSamProcesses();
      for (const stack of apiStacks) {
        startSamApi(stack);
      }
      startSamLambda(eventLambdaTemplate);
      await renameSamContainers();
    });
  }

  console.log('\n All services started. CDK is the source of truth.');
  if (noWatch) console.log('   File watcher disabled (--no-watch).');
  console.log('   Press Ctrl+C to stop.\n');

  // Graceful shutdown — kill child processes and SAM Docker containers
  const shutdown = () => {
    console.log('\n Stopping all services...');
    for (const child of processes) {
      child.kill('SIGINT');
    }

    // Clean up SAM's Docker containers (they persist after SAM exits)
    try {
      const ids = execSync(
        'docker ps -q --filter "ancestor=public.ecr.aws/sam/emulation-nodejs20.x" --filter "ancestor=public.ecr.aws/lambda/nodejs:20" 2>/dev/null',
        { stdio: 'pipe', encoding: 'utf8' }
      ).trim();

      if (!ids) {
        // Broader fallback — match by image name pattern
        execSync(
          'docker ps --format "{{.ID}} {{.Image}}" | grep "public.ecr.aws/lambda\\|public.ecr.aws/sam\\|samcli" | awk \'{print $1}\' | xargs docker rm -f 2>/dev/null',
          { stdio: 'pipe' }
        );
      } else {
        execSync(`docker rm -f ${ids.split('\n').join(' ')} 2>/dev/null`, {
          stdio: 'pipe',
        });
      }

      console.log(' Cleaned up SAM Docker containers');
    } catch {
      // No containers to clean up
    }

    setTimeout(() => process.exit(0), 2000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  setInterval(() => {}, 60000);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
