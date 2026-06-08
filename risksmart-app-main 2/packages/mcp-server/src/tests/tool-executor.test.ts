import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpSession } from '../auth/authenticate';
import {
  AuthenticationError,
  ExternalServiceError,
  ValidationError,
} from '../errors';
import type { ToolDefinition } from '../tools/registry';
import { executeTrpcTool } from '../tools/tool-executor';

const mockSession: McpSession = {
  authType: 'oauth',
  orgId: 'org_123',
  userId: 'user-1',
  tenant: 'testtenant',
  accessToken: 'test-jwt-token',
};

const mockToolDef: ToolDefinition = {
  name: 'list_risks',
  description: 'List risks',
  procedurePath: 'frontend.risk.register',
  parameters: {} as never,
  availableVia: 'all',
};

describe('executeTrpcTool (tRPC executor)', () => {
  beforeEach(() => {
    process.env.TRPC_SERVICE_BASE_URL = 'http://trpc:2021';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the correct tRPC URL for a no-input procedure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: { json: [{ id: '1', name: 'Risk A' }] } },
        }),
    } as Response);

    await executeTrpcTool(mockToolDef, {}, mockSession);

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const expectedArgs = expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        authorization: 'Bearer test-jwt-token',
      }),
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    expect(fetch).toHaveBeenCalledWith(
      'http://trpc:2021/trpc/frontend.risk.register?input=%7B%22json%22%3A%7B%7D%7D',
      expectedArgs
    );
  });

  it('does not send content-type header on GET request', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: { json: [] } },
        }),
    } as Response);

    await executeTrpcTool(mockToolDef, {}, mockSession);

    const callArgs = vi.mocked(fetch).mock.calls[0]![1] as RequestInit;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers).not.toHaveProperty('content-type');
  });

  it('includes AbortSignal timeout on fetch call', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: { json: [] } },
        }),
    } as Response);

    await executeTrpcTool(mockToolDef, {}, mockSession);

    const callArgs = vi.mocked(fetch).mock.calls[0]![1] as RequestInit;
    expect(callArgs.signal).toBeDefined();
  });

  it('encodes input as superjson query parameter', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: { json: { id: '1' } } },
        }),
    } as Response);

    const toolWithInput: ToolDefinition = {
      name: 'get_risk_by_id',
      description: 'Get risk',
      procedurePath: 'frontend.risk.riskById',
      parameters: {} as never,
      availableVia: 'all',
    };

    await executeTrpcTool(toolWithInput, { riskId: 'abc-123' }, mockSession);

    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    const calledUrl = `${vi.mocked(fetch).mock.calls[0]![0]}`;
    expect(calledUrl).toContain('frontend.risk.riskById?input=');

    // Decode the input parameter
    const inputParam = decodeURIComponent(calledUrl.split('?input=')[1]!);
    const parsed = JSON.parse(inputParam) as unknown;
    expect(parsed).toEqual({ json: { riskId: 'abc-123' } });
  });

  it('throws ValidationError when input is too large', async () => {
    const largeInput: Record<string, unknown> = {
      data: 'x'.repeat(15_000),
    };

    await expect(
      executeTrpcTool(mockToolDef, largeInput, mockSession)
    ).rejects.toThrow(ValidationError);
  });

  it('returns JSON string of the result data', async () => {
    const mockData = [
      { id: '1', name: 'Risk A' },
      { id: '2', name: 'Risk B' },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: { json: mockData } },
        }),
    } as Response);

    const result = await executeTrpcTool(mockToolDef, {}, mockSession);
    expect(JSON.parse(result)).toEqual(mockData);
  });

  it('throws AuthenticationError on 401 HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Unauthorized'),
    } as Response);

    await expect(executeTrpcTool(mockToolDef, {}, mockSession)).rejects.toThrow(
      AuthenticationError
    );
  });

  it('throws ExternalServiceError on 5xx HTTP response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: () => Promise.resolve('Bad Gateway'),
    } as Response);

    await expect(executeTrpcTool(mockToolDef, {}, mockSession)).rejects.toThrow(
      ExternalServiceError
    );
  });

  it('falls back to result.data when json field is missing', async () => {
    const mockData = { count: 5 };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: { data: mockData },
        }),
    } as Response);

    const result = await executeTrpcTool(mockToolDef, {}, mockSession);
    expect(JSON.parse(result)).toEqual(mockData);
  });
});
