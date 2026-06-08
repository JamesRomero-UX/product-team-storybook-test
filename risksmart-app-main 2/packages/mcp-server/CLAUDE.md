# packages/mcp-server

Authenticated MCP server exposing RiskSmart GRC data to AI clients (Claude, ChatGPT, VS Code Copilot, Cursor) via FastMCP TypeScript.

## Architecture

- `src/auth/` - JWT validation, DCR proxy, Auth0 Management API client
- `src/tools/` - Tool registry (maps MCP tools to tRPC procedures) and executor
- `src/utils/` - Logger, environment helpers
- `src/server.ts` - FastMCP server definition with tools and OAuth metadata routes
- `src/app.ts` - Entry point

## Key Patterns

- **Authentication**: JWT validation using the same `JWT_SECRET_CONFIG` as the tRPC server. Returns `McpSession` with org/user/tenant context.
- **Feature gate**: Requires `integrations.subModules.mcp_server_integrations` or `mcp_personal` to be enabled in the org's module settings (`organisation_module` table). Checked via tRPC call, cached per org (5-minute TTL).
- **Tool execution**: Makes HTTP calls to the tRPC service (`TRPC_SERVICE_BASE_URL`), forwarding the user's JWT. No in-process tRPC dependencies — the MCP server is a thin protocol adapter.
- **DCR proxy**: Dynamic Client Registration via Auth0 Management API for MCP client OAuth flows.
- **Read-only**: Initial tool set is read-only queries. All tools have `readOnlyHint: true`.

## Local Development

```bash
# Start with Docker (opt-in profile)
docker compose --profile mcp up --build mcp-server

# Direct dev server
pnpm --filter @risksmart-app/mcp-server run dev:server
```

### Prerequisites

1. **Auth0 Management API credentials** in `.env`:
   - `AUTH0_MANAGEMENT_CLIENT_ID` — from the "RiskSmart Rest API" M2M client in Auth0
   - `AUTH0_MANAGEMENT_CLIENT_SECRET` — the client secret (also stored as SST secret `AUTH0_CLIENT_SECRET`)
2. **MCP module enabled** for your organization. The `integrations` module must be enabled with either `mcp_server_integrations` or `mcp_personal` sub-module toggled on in the admin UI (Settings → Modules). Without this, authentication will succeed but the server returns 401 with "MCP not enabled for this organization".

## Testing with AI Clients

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "risksmart-local": {
      "command": "/path/to/.nvm/versions/node/v22.x.x/bin/npx",
      "args": ["mcp-remote", "http://localhost:8022/mcp"],
      "env": {
        "PATH": "/path/to/.nvm/versions/node/v22.x.x/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

`mcp-remote` bridges Claude Desktop's stdio transport to the server's Streamable HTTP transport and handles the OAuth flow automatically.

### curl

```bash
# Health check
curl http://localhost:8022/health

# OAuth metadata
curl http://localhost:8022/.well-known/oauth-protected-resource

# Authorization server metadata (proxied from Auth0 with overrides)
curl http://localhost:8022/.well-known/oauth-authorization-server

# DCR (creates client via Auth0 Management API)
curl -X POST http://localhost:8022/register \
  -H 'Content-Type: application/json' \
  -d '{"client_name":"test","redirect_uris":["http://localhost:3000/callback"]}'
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect to `http://localhost:8022/mcp` using Streamable HTTP transport.

## Troubleshooting

### ChatGPT "unsafe URL" / "does not implement OAuth" with localhost

ChatGPT requires HTTPS URLs for MCP server connections. When running locally, you need to expose the server via an HTTPS tunnel and set `MCP_SERVER_URL` so the OAuth metadata endpoints return the tunnel URL instead of `localhost`.

**Using VS Code port forwarding:**

1. Forward port `8022` in the VS Code Ports panel
2. Set visibility to **Public**
3. Start Docker with the tunnel URL:

```bash
MCP_SERVER_URL=https://<your-tunnel>.devtunnels.ms docker compose --profile v3 --profile mcp up --build mcp-server trpc
```

**Using ngrok:**

```bash
ngrok http 8022
MCP_SERVER_URL=https://<id>.ngrok-free.app docker compose --profile v3 --profile mcp up --build mcp-server trpc
```

Without `MCP_SERVER_URL`, the OAuth metadata (`.well-known/oauth-protected-resource`, `.well-known/oauth-authorization-server`) returns `http://localhost:8022` which ChatGPT rejects.

### `mcp-remote` crashes with `ReferenceError: File is not defined`

`mcp-remote` requires Node.js 20+. Claude Desktop may default to an older Node version via nvm. Fix by specifying the full path to a Node 22+ `npx` binary in `claude_desktop_config.json` and setting `PATH` in `env` to ensure child processes also use Node 22+. Clear the stale npx cache if needed: `rm -rf ~/.npm/_npx/`.

### `ServerError` at `registerClient`

`mcp-remote` is calling Auth0's native OIDC registration endpoint instead of our DCR proxy. The MCP server serves `/.well-known/oauth-authorization-server` with `registration_endpoint` overridden to point to our `/register`. This only works if `authorizationServers` in the protected resource metadata points to the MCP server itself (not directly to Auth0), so that `mcp-remote` fetches AS metadata from us.

### `ECONNRESET` connecting to MCP server in Docker

FastMCP defaults to binding on `localhost` (127.0.0.1) inside the container. Docker port mapping requires `0.0.0.0`. The `host` option in `httpStream` config is set to `0.0.0.0` for this reason.

### `could not decode token` / opaque token from Auth0

Auth0 returns an opaque access token (not a JWT) when no `audience` parameter is included in the authorize request. `mcp-remote` doesn't add an `audience` by default. The MCP server works around this by embedding `?audience=<AUTH0_API_AUDIENCE>` in the `authorization_endpoint` URL returned in the AS metadata. Ensure `AUTH0_API_AUDIENCE` is set in the environment.

### `MCP not enabled for this organization`

The organisation must have the MCP module enabled in its module settings (`organisation_module` table). Enable either `integrations.subModules.mcp_server_integrations` or `mcp_personal` via the admin UI (Settings → Modules). The server checks this via a tRPC call to `organisationModule.getByOrgId`, with results cached for 5 minutes per org.

### `mcp-remote` reuses stale credentials

`mcp-remote` caches OAuth client registrations in `~/.mcp-auth/`. After changing DCR configuration or switching between local mock and real Auth0, clear this cache: `rm -rf ~/.mcp-auth`.

### MCP tools return empty results (permissions)

The tRPC service uses Permit.io for ABAC permissions filtering. If the PDP has no policy data synced for your user, all items are filtered out and tools return empty arrays.

**Option 1: Use the stub PDP (bypasses permissions, easiest for testing)**

Point the tRPC service at the stub PDP which always returns `allow: true`:

```bash
PDP_ENDPOINT=http://stub-pdp:8010 MCP_SERVER_URL=https://<your-tunnel>.devtunnels.ms docker compose --profile v3 --profile mcp up --build trpc mcp-server -d
```

**Option 2: Sync the real PDP**

Requires LocalStack with `DataLayerStack` and `PermissionsStack` deployed:

```bash
pnpm run sync-permit
```

This invokes the `tenant-sync-poller` Lambda which syncs users, resource instances, roles, and relationships to Permit.io.

**Note:** The `.env` file sets `PDP_ENDPOINT=http://localhost:8000` for local non-Docker development. When running in Docker, the tRPC container must reach the PDP via its service name, so override with `PDP_ENDPOINT=http://pdp:7000` (or `http://stub-pdp:8010` for the stub).

### Docker build fails with `not found` for `packages/mcp-server`

The root `.dockerignore` excludes all `packages/` by default. Ensure `!packages/mcp-server` is in the allowlist.
