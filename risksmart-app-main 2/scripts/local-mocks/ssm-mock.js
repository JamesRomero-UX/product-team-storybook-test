/**
 * Local SSM Parameter Store mock.
 *
 * Implements the subset of the AWS SSM API used by this codebase:
 *   - AmazonSSM.GetParameter
 *   - AmazonSSM.PutParameter
 *
 * Parameters are pre-seeded from a JSON file written by dev.js (service
 * discovery URLs, LangSmith config, etc.) and can also be written at runtime
 * (e.g., SCIM token management).
 *
 * AWS SDK v2 and v3 both use the same JSON 1.1 protocol over HTTP POST with
 * an X-Amz-Target header, so this mock serves both.
 *
 * Usage:
 *   SSM_MOCK_PORT=3012 SSM_PARAMS_FILE=/path/to/params.json node ssm-mock.js
 */

import http from 'http';
import fs from 'fs';

const PORT = parseInt(process.env.SSM_MOCK_PORT || '3012', 10);
const PARAMS_FILE = process.env.SSM_PARAMS_FILE || '';

// In-memory parameter store: { name → { Value, Type, Version } }
const store = new Map();

// Seed from file if provided
if (PARAMS_FILE && fs.existsSync(PARAMS_FILE)) {
  const seed = JSON.parse(fs.readFileSync(PARAMS_FILE, 'utf8'));
  for (const [name, value] of Object.entries(seed)) {
    store.set(name, {
      Value: typeof value === 'string' ? value : JSON.stringify(value),
      Type: 'String',
      Version: 1,
    });
  }
  console.log(`SSM mock: loaded ${store.size} parameter(s) from ${PARAMS_FILE}`);
}

const handleGetParameter = (body) => {
  const name = body.Name;
  if (!name) {
    return { status: 400, body: { __type: 'ValidationException', message: 'Name is required' } };
  }

  const param = store.get(name);
  if (!param) {
    return {
      status: 400,
      body: { __type: 'ParameterNotFound', message: `Parameter ${name} not found.` },
    };
  }

  return {
    status: 200,
    body: {
      Parameter: {
        ARN: `arn:aws:ssm:eu-west-2:000000000000:parameter${name}`,
        DataType: 'text',
        LastModifiedDate: Date.now() / 1000,
        Name: name,
        Type: param.Type,
        Value: param.Value,
        Version: param.Version,
      },
    },
  };
};

const handlePutParameter = (body) => {
  const name = body.Name;
  const value = body.Value;
  if (!name || value === undefined) {
    return { status: 400, body: { __type: 'ValidationException', message: 'Name and Value are required' } };
  }

  const existing = store.get(name);
  const version = existing ? existing.Version + 1 : 1;

  if (existing && !body.Overwrite) {
    return {
      status: 400,
      body: { __type: 'ParameterAlreadyExists', message: `Parameter ${name} already exists.` },
    };
  }

  store.set(name, {
    Value: value,
    Type: body.Type || 'String',
    Version: version,
  });

  return { status: 200, body: { Version: version } };
};

const HANDLERS = {
  'AmazonSSM.GetParameter': handleGetParameter,
  'AmazonSSM.PutParameter': handlePutParameter,
};

const server = http.createServer((req, res) => {
  // Health check endpoint (used by Docker Compose healthcheck)
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', parameters: store.size }));
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
    const action = target.replace('AmazonSSM.', '');
    const key = body.Name || '?';
    console.log(`${action} ${key} → ${result.status}${result.status === 200 ? '' : ' ' + JSON.stringify(result.body)}`);
    res.writeHead(result.status, { 'Content-Type': 'application/x-amz-json-1.1' });
    res.end(JSON.stringify(result.body));
  });
});

server.listen(PORT, () => {
  console.log(`SSM mock: listening on :${PORT}`);
});
