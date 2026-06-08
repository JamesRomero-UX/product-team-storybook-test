import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment helper
vi.mock('../utils/environment', () => ({
  getEnv: vi.fn().mockReturnValue('http://trpc.local:3000'),
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { isMcpEnabledForOrg } from '../auth/module-checker';

const buildTrpcResponse = (moduleSettings: unknown) =>
  JSON.stringify({
    result: {
      data: {
        json: {
          organisationModule: { ModuleSettings: moduleSettings },
        },
      },
    },
  });

describe('isMcpEnabledForOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module-level cache between tests by re-importing would be
    // complex, so we use unique orgIds per test to avoid cache collisions.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when mcp_server_integrations is enabled', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: true,
            subModules: { mcp_server_integrations: { enabled: true } },
          },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-server-int', 'token');

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('returns true when mcp_personal is enabled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: true,
            subModules: { mcp_personal: { enabled: true } },
          },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-personal', 'token');

    expect(result).toBe(true);
  });

  it('returns true when both sub-modules are enabled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: true,
            subModules: {
              mcp_server_integrations: { enabled: true },
              mcp_personal: { enabled: true },
            },
          },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-both', 'token');

    expect(result).toBe(true);
  });

  it('returns false when integrations module is disabled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: false,
            subModules: { mcp_server_integrations: { enabled: true } },
          },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-int-disabled', 'token');

    expect(result).toBe(false);
  });

  it('returns false when no sub-modules are enabled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: true,
            subModules: {
              mcp_server_integrations: { enabled: false },
              mcp_personal: { enabled: false },
            },
          },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-no-sub', 'token');

    expect(result).toBe(false);
  });

  it('returns false when integrations key is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(buildTrpcResponse({}), { status: 200 })
    );

    const result = await isMcpEnabledForOrg('org-no-int', 'token');

    expect(result).toBe(false);
  });

  it('returns false when organisationModule is null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          result: { data: { json: { organisationModule: null } } },
        }),
        { status: 200 }
      )
    );

    const result = await isMcpEnabledForOrg('org-null-module', 'token');

    expect(result).toBe(false);
  });

  it('returns false when response body has unexpected shape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ unexpected: 'shape' }), { status: 200 })
    );

    const result = await isMcpEnabledForOrg('org-bad-shape', 'token');

    expect(result).toBe(false);
  });

  it('returns false on HTTP error (fail-closed)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', { status: 500 })
    );

    const result = await isMcpEnabledForOrg('org-500', 'token');

    expect(result).toBe(false);
  });

  it('returns false on 403 response (fail-closed)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    );

    const result = await isMcpEnabledForOrg('org-403', 'token');

    expect(result).toBe(false);
  });

  it('returns false on network error (fail-closed)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const result = await isMcpEnabledForOrg('org-network-err', 'token');

    expect(result).toBe(false);
  });

  it('returns cached result within TTL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        buildTrpcResponse({
          integrations: {
            enabled: true,
            subModules: { mcp_server_integrations: { enabled: true } },
          },
        }),
        { status: 200 }
      )
    );

    // First call — populates cache
    const result1 = await isMcpEnabledForOrg('org-cache-hit', 'token');
    expect(result1).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance time by 2 minutes (within 5-minute TTL)
    vi.advanceTimersByTime(2 * 60 * 1000);

    // Second call — should use cache
    const result2 = await isMcpEnabledForOrg('org-cache-hit', 'token');
    expect(result2).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // No additional fetch
  });

  it('re-fetches after cache TTL expires', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          buildTrpcResponse({
            integrations: {
              enabled: true,
              subModules: { mcp_server_integrations: { enabled: true } },
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          buildTrpcResponse({
            integrations: {
              enabled: false,
              subModules: { mcp_server_integrations: { enabled: true } },
            },
          }),
          { status: 200 }
        )
      );

    // First call — returns true
    const result1 = await isMcpEnabledForOrg('org-cache-expire', 'token');
    expect(result1).toBe(true);

    // Advance time past 5-minute TTL
    vi.advanceTimersByTime(6 * 60 * 1000);

    // Second call — should re-fetch and return false (integrations disabled)
    const result2 = await isMcpEnabledForOrg('org-cache-expire', 'token');
    expect(result2).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not cache error responses', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('Service Unavailable', { status: 503 })
      )
      .mockResolvedValueOnce(
        new Response(
          buildTrpcResponse({
            integrations: {
              enabled: true,
              subModules: { mcp_server_integrations: { enabled: true } },
            },
          }),
          { status: 200 }
        )
      );

    // First call — error, returns false, not cached
    const result1 = await isMcpEnabledForOrg('org-no-cache-err', 'token');
    expect(result1).toBe(false);

    // Second call — should re-fetch (error was not cached)
    const result2 = await isMcpEnabledForOrg('org-no-cache-err', 'token');
    expect(result2).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('passes Bearer token in authorization header', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(buildTrpcResponse({}), { status: 200 }));

    await isMcpEnabledForOrg('org-auth-header', 'my-secret-token');

    const [, options] = fetchSpy.mock.calls[0]! as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer my-secret-token');
  });

  it('constructs correct tRPC URL', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(buildTrpcResponse({}), { status: 200 }));

    await isMcpEnabledForOrg('org-url-check', 'token');

    const [url] = fetchSpy.mock.calls[0]! as [string, RequestInit];
    expect(url).toContain('/trpc/organisationModule.getByOrgId?input=');
    expect(url).toContain('http://trpc.local:3000');
  });
});
