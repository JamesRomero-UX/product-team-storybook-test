/**
 * Local Secrets Manager mock.
 *
 * Implements the subset of the AWS Secrets Manager API used by this codebase:
 *   - secretsmanager.GetSecretValue
 *   - secretsmanager.CreateSecret
 *   - secretsmanager.PutSecretValue
 *
 * Secrets are pre-seeded from a JSON file written by dev.js and can also be
 * created/updated at runtime.
 *
 * AWS SDK v3 uses JSON 1.1 protocol over HTTP POST with an X-Amz-Target
 * header, same pattern as SSM.
 *
 * Usage:
 *   SECRETS_MANAGER_MOCK_PORT=3013 SECRETS_PARAMS_FILE=/path/to/secrets.json node secrets-manager-mock.js
 */

import http from 'http';
import fs from 'fs';

const PORT = parseInt(process.env.SECRETS_MANAGER_MOCK_PORT || '3013', 10);
const PARAMS_FILE = process.env.SECRETS_PARAMS_FILE || '';

// In-memory secret store: { name → { SecretString, VersionId } }
const store = new Map();

// Seed from file if provided
if (PARAMS_FILE && fs.existsSync(PARAMS_FILE)) {
  const seed = JSON.parse(fs.readFileSync(PARAMS_FILE, 'utf8'));
  for (const [name, value] of Object.entries(seed)) {
    store.set(name, {
      SecretString: typeof value === 'string' ? value : JSON.stringify(value),
      VersionId: 'local-v1',
    });
  }
  console.log(`Secrets Manager mock: loaded ${store.size} secret(s) from ${PARAMS_FILE}`);
}

const handleGetSecretValue = (body) => {
  const secretId = body.SecretId;
  if (!secretId) {
    return { status: 400, body: { __type: 'InvalidParameterException', message: 'SecretId is required' } };
  }

  const secret = store.get(secretId);
  if (!secret) {
    return {
      status: 400,
      body: { __type: 'ResourceNotFoundException', message: `Secrets Manager can't find the specified secret: ${secretId}` },
    };
  }

  return {
    status: 200,
    body: {
      ARN: `arn:aws:secretsmanager:eu-west-2:000000000000:secret:${secretId}`,
      Name: secretId,
      VersionId: secret.VersionId,
      SecretString: secret.SecretString,
      CreatedDate: Date.now() / 1000,
    },
  };
};

const handleCreateSecret = (body) => {
  const name = body.Name;
  const secretString = body.SecretString;
  if (!name) {
    return { status: 400, body: { __type: 'InvalidParameterException', message: 'Name is required' } };
  }

  if (store.has(name)) {
    return {
      status: 400,
      body: { __type: 'ResourceExistsException', message: `The operation failed because the secret ${name} already exists.` },
    };
  }

  store.set(name, {
    SecretString: secretString || '',
    VersionId: 'local-v1',
  });

  return {
    status: 200,
    body: {
      ARN: `arn:aws:secretsmanager:eu-west-2:000000000000:secret:${name}`,
      Name: name,
      VersionId: 'local-v1',
    },
  };
};

const handlePutSecretValue = (body) => {
  const secretId = body.SecretId;
  const secretString = body.SecretString;
  if (!secretId) {
    return { status: 400, body: { __type: 'InvalidParameterException', message: 'SecretId is required' } };
  }

  const existing = store.get(secretId);
  const version = existing
    ? `local-v${parseInt(existing.VersionId.replace('local-v', ''), 10) + 1}`
    : 'local-v1';

  store.set(secretId, {
    SecretString: secretString || '',
    VersionId: version,
  });

  return {
    status: 200,
    body: {
      ARN: `arn:aws:secretsmanager:eu-west-2:000000000000:secret:${secretId}`,
      Name: secretId,
      VersionId: version,
    },
  };
};

const HANDLERS = {
  'secretsmanager.GetSecretValue': handleGetSecretValue,
  'secretsmanager.CreateSecret': handleCreateSecret,
  'secretsmanager.PutSecretValue': handlePutSecretValue,
};

const server = http.createServer((req, res) => {
  // Health check endpoint (used by Docker Compose healthcheck)
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', secrets: store.size }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    const target = req.headers['x-amz-target'];
    const handler = HANDLERS[target];

    if (!handler) {
      res.writeHead(400, { 'Content-Type': 'application/x-amz-json-1.1' });
      res.end(JSON.stringify({ __type: 'InvalidAction', message: `Unsupported target: ${target}` }));
      return;
    }

    let body;
    try {
      body = JSON.parse(data);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/x-amz-json-1.1' });
      res.end(JSON.stringify({ __type: 'SerializationException', message: 'Invalid JSON' }));
      return;
    }

    const result = handler(body);
    const action = target.replace('secretsmanager.', '');
    const key = body.SecretId || body.Name || '?';
    console.log(`${action} ${key} → ${result.status}${result.status === 200 ? '' : ' ' + JSON.stringify(result.body)}`);
    res.writeHead(result.status, { 'Content-Type': 'application/x-amz-json-1.1' });
    res.end(JSON.stringify(result.body));
  });
});

server.listen(PORT, () => {
  console.log(`Secrets Manager mock: listening on :${PORT}`);
});
