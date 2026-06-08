# Local Auth Provider

A development mock OAuth 2.0 server for testing authentication flows in the RiskSmart application. This service provides a lightweight OAuth 2.0/OpenID Connect server using the [oauth2-mock-server](https://github.com/axa-group/oauth2-mock-server) library.

## Overview

The local auth provider is designed for development and testing purposes only. It provides a fully functional OAuth 2.0 server that can issue JWT tokens with customizable claims, including Hasura GraphQL Engine claims, making it ideal for local development and integration testing.

**⚠️ Warning:** This is not intended for production use. It's designed specifically for development and testing environments.

## How to Generate JWT Tokens with Hasura Claims

### Minimal Token Request

For basic testing with default claims:

```bash
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

This generates a token with defaults:

- `client_id`: `client-one`
- `user_id`: `auth0|test_user_123`
- `org_id`: `org_test`
- `scope`: `openid offline_access`
- `exp_hours`: `8`
- Default Hasura feature flags

### Full Token Request with Custom Claims

For comprehensive testing with all available parameters:

```bash
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=my-app&user_id=auth0|custom_user_456&org_id=org_production&scope=read:risks write:assessments&exp_hours=24&hasura_feature_flags=notifications,reports,compliance,custom-feature"
```

This generates a token with:

- Custom client ID, user ID, and organization
- Specific scopes and expiration
- Custom Hasura feature flags
- Full Hasura claims namespace

## Token Validation Using JWK Endpoint

To validate a generated token, fetch the public key from the JWK endpoint:

```javascript
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'http://localhost:3232/jwks',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify token
jwt.verify(
  token,
  getKey,
  {
    audience: 'your-client-id',
    issuer: 'http://localhost:3232',
    algorithms: ['RS256'],
  },
  (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
    } else {
      console.log('Token verified:', decoded);
      // Access Hasura claims
      console.log('Hasura claims:', decoded['https://hasura.io/jwt/claims']);
    }
  }
);
```

## Using in Vitest Testing

For testing with Vitest, you can generate JWT tokens programmatically:

```javascript
import { describe, it, expect } from 'vitest';

// Helper function to generate test token
async function generateTestToken(claims = {}) {
  const defaultClaims = {
    grant_type: 'client_credentials',
    client_id: 'test-client',
    user_id: 'auth0|test_user_123',
    org_id: 'org_test',
    scope: 'read:risks write:assessments',
    exp_hours: 1,
    ...claims,
  };

  const response = await fetch('http://localhost:3232/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(defaultClaims).toString(),
  });

  const data = await response.json();
  return data.access_token;
}

describe('API with JWT authentication', () => {
  it('should authenticate with valid token', async () => {
    // Generate token for testing
    const token = await generateTestToken({
      client_id: 'vitest-client',
      org_id: 'org_vitest',
      hasura_feature_flags: 'reports,compliance',
    });

    // Use token in your API calls
    const response = await fetch('http://your-api/endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
  });
});
```

**Note:** Ensure the local auth provider is running on `localhost:3232` before running your tests. You can start it with `pnpm dev:mock-auth` or include it in your test setup.

## Features

- Full OAuth 2.0/OpenID Connect compliance
- JWT token generation with RS256 signing
- Customizable token claims and expiration including Hasura GraphQL claims
- JWK endpoint for token verification
- Support for multiple grant types
- Hasura feature flags configuration
- Docker containerization

## Quick Start

### Using Docker

The service is containerized and can be started using Docker:

```bash
# Build the container
docker build -t mock-auth-provider .

# Run the container
docker run -p 3232:3232 mock-auth-provider
```

### Using npm scripts

```bash
# Development mode with hot reload
pnpm dev:mock-auth

# Build and start
pnpm build:mock-auth
node dist/local-auth-provider/index.js
```

## Configuration

The service can be configured using environment variables:

| Variable         | Default | Description                     |
| ---------------- | ------- | ------------------------------- |
| `MOCK_AUTH_PORT` | `3232`  | Port the mock server listens on |

## API Endpoints

The mock local OAuth provider exposes the following standard OAuth 2.0 endpoints:

### OpenID Configuration

```bash
curl http://localhost:3232/.well-known/openid-configuration
```

Returns the OpenID Connect discovery document with all available endpoints.

### JSON Web Key Set (JWK)

```bash
curl http://localhost:3232/jwks
```

Returns the public keys used to verify JWT tokens. This endpoint is essential for validating tokens issued by the local auth provider.

### Token Endpoint

```bash
# Basic token request
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=your-client-id"

# Token request with custom parameters
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=my-app&scope=read:risks write:risks&org_id=org_123&exp_hours=24"
```

### Authorization Endpoint

```bash
curl "http://localhost:3232/authorize?response_type=code&client_id=your-client-id&redirect_uri=http://localhost:3000/callback&scope=openid"
```

### User Info Endpoint

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3232/userinfo
```

### Token Introspection

```bash
curl -X POST http://localhost:3232/introspect \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_ACCESS_TOKEN"
```

### Token Revocation

```bash
curl -X POST http://localhost:3232/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_ACCESS_TOKEN"
```

## JWT Token Customization

The local auth provider allows comprehensive customization of JWT tokens through request parameters, including Hasura GraphQL Engine claims:

### Available Parameters

| Parameter              | Default                 | Description                          |
| ---------------------- | ----------------------- | ------------------------------------ | --------------- |
| `scope`                | `openid offline_access` | Space-separated list of scopes       |
| `client_id`            | `client-one`            | Client identifier                    |
| `user_id`              | `auth0                  | test_user_123`                       | User identifier |
| `org_id`               | `org_test`              | Organization identifier              |
| `exp_hours`            | `8`                     | Token expiration time in hours       |
| `hasura_feature_flags` | Default feature set     | Comma-separated Hasura feature flags |

### Default Hasura Feature Flags

The following features are enabled by default:

- `notifications`, `reports`, `compliance`, `policy`
- `settings`, `notification-preferences`, `impacts`, `approvers`
- `attestations`, `internal_audit`, `compliance_monitoring`
- `multi_reporting`, `enterprise_risk`
- `permit`, `aie_chat`, `modules`, `trpc`

### Generated Token Claims

The local auth provider generates tokens with both standard OAuth claims and Hasura-specific claims:

#### Standard Claims

- `aud`: Client ID (audience)
- `sub`: User ID (subject)
- `exp`: Expiration timestamp
- `token_use`: Always set to `access`
- `scope`: Requested scopes
- `tenant_id` / `org_id`: Organization identifier
- `azp`: Authorized party (client ID)
- `claims_roles`: Array of user roles

#### Hasura Claims Namespace

Under `https://hasura.io/jwt/claims`:

- `x-hasura-allowed-roles`: `["RiskManager"]`
- `x-hasura-default-role`: `"RiskManager"`
- `x-hasura-user-id`: User identifier
- `x-hasura-org-id`: Organization identifier
- `x-hasura-tenant-name`: `"MultiTenant"`
- `x-hasura-logo`: `"default"`
- `x-hasura-taxonomy`: `"default"`
- `x-hasura-features`: Comma-separated feature flags

### Example Token Request with Custom Claims

```bash
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=my-application&user_id=auth0|custom_user&scope=read:risks write:assessments&org_id=org_production&exp_hours=12&hasura_feature_flags=reports,compliance,custom-feature"
```

This will generate a JWT token with:

- `aud`: `my-application`
- `sub`: `auth0|custom_user`
- `scope`: `read:risks write:assessments`
- `org_id`: `org_production`
- `exp`: Current time + 12 hours
- `token_use`: `access`
- Hasura claims with custom feature flags
- `claims_roles`: `["RiskManager"]`

## User Management

The mock OAuth provider doesn't require explicit user creation. It automatically handles authentication requests for any client_id provided. However, you can simulate different users by varying the `client_id` parameter:

### Creating Different User Contexts

```bash
# User 1
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=user-admin&scope=admin:all&org_id=org_123"

# User 2 (read-only)
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=user-readonly&scope=read:risks&org_id=org_123"

# Service account
curl -X POST http://localhost:3232/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=service-account&scope=service:api&org_id=org_system"
```

Each request will generate a unique token with the specified `client_id` as both the audience (`aud`) and subject (`sub`).

## JWK and Token Verification

### How JWK Works

The mock server automatically generates RSA key pairs using the RS256 algorithm when started. These keys are used to:

1. **Sign JWT tokens** - The private key signs all issued tokens
2. **Provide public keys** - The public key is exposed via the `/jwks` endpoint for verification

### Key Storage and Setup

- **Key Generation**: Keys are generated in-memory when the server starts using `server.issuer.keys.generate('RS256')`
- **Key Rotation**: Keys are regenerated on each server restart (suitable for development)
- **Key Format**: Uses RSA with SHA-256 (RS256) algorithm
- **Key Exposure**: Public keys are available at the `/jwks` endpoint in JWK format

### Verifying Tokens

Applications can verify tokens by:

1. Fetching the public key from `/jwks`
2. Using the key to verify the JWT signature
3. Checking token claims (exp, aud, etc.)

Example using a JWT library:

```javascript
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'http://localhost:3232/jwks',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify token
jwt.verify(
  token,
  getKey,
  {
    audience: 'your-client-id',
    issuer: 'http://localhost:3232',
    algorithms: ['RS256'],
  },
  (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
    } else {
      console.log('Token verified:', decoded);
    }
  }
);
```

## Supported Grant Types

The mock server supports multiple OAuth 2.0 grant types:

- **Client Credentials** - For service-to-service authentication
- **Authorization Code** - For web applications (with PKCE support)
- **Resource Owner Password Credentials** - For trusted applications
- **Refresh Token** - For token renewal
- **No Authentication** - For development/testing

## Development

### Project Structure

```
packages/local-auth-provider/
├── src/
│   ├── index.ts               # Server implementation
│   └── utils/
│       └── logger.js          # Logging utilities
├── Dockerfile                 # Container configuration (if present)
└── README.md                 # This documentation
```

### Building and Running Locally

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev:mock-auth

# Build TypeScript
pnpm build:mock-auth

# Run built version
node dist/local-auth-provider/index.js
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
MOCK_AUTH_PORT=3232
```

## Integration with RiskSmart

The local auth provider is configured to work seamlessly with the RiskSmart application and Hasura GraphQL Engine. The default configuration provides:

- **Default scope**: `openid offline_access` for OpenID Connect compatibility
- **Default client**: `client-one` for simple testing
- **Default user**: `auth0|test_user_123` for consistent user context
- **Default organization**: `org_test` for isolated testing
- **Default role**: `RiskManager` with full feature access
- **Reasonable expiration**: 8 hours for development workflows
- **Hasura integration**: Full claims namespace with feature flags

This allows developers to quickly test authentication flows and Hasura permissions without complex setup.

## Troubleshooting

### Common Issues

1. **Port already in use**: Change `MOCK_AUTH_PORT` to a different port
2. **Token verification fails**: Ensure your application is fetching keys from the correct `/jwks` endpoint
3. **Docker build fails**: Check that Docker has access to the workspace files

### Debugging

Enable debug logging by setting the environment variable:

```bash
DEBUG=oauth2-mock-server:* pnpm dev:mock-auth
```

### Health Check

Verify the server is running:

```bash
curl http://localhost:3232/.well-known/openid-configuration
```

Should return a JSON response with the server configuration.
