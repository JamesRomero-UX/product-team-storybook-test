import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpSession } from '../auth/authenticate';
import {
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '../errors';
import type { ToolDefinition } from '../tools/registry';
import { endpointMap, executeRestTool } from '../tools/rest-executor';

const mockSession: McpSession = {
  authType: 'credentials',
  orgId: 'org_123',
  tenant: 'testtenant',
  accessToken: 'cognito-jwt-token',
};

const BASE_URL = 'https://api.example.com';

const getCalledUrl = (callIndex = 0): string =>
  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
  `${vi.mocked(fetch).mock.calls[callIndex]![0]}`;

const makeToolDef = (
  overrides: Partial<ToolDefinition> = {}
): ToolDefinition => ({
  name: 'list_risks',
  description: 'List risks',
  procedurePath: 'frontend.risk.register',
  parameters: {} as never,
  availableVia: 'all',
  ...overrides,
});

const makeListResponse = (
  data: unknown[],
  hasMore = false,
  nextPage: string | null = null
) => ({
  data,
  pageInfo: {
    count: data.length,
    hasMore,
    nextPage,
    prevPage: null,
    beforeCursor: null,
    afterCursor: null,
  },
});

describe('executeRestTool (REST executor)', () => {
  beforeEach(() => {
    process.env.EXTERNAL_API_BASE_URL = BASE_URL;
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.EXTERNAL_API_BASE_URL;
  });

  // --- Auth header ---

  it('sends Authorization Bearer header with session access token', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeListResponse([{ id: '1' }])),
    } as Response);

    await executeRestTool(makeToolDef(), {}, mockSession);

    const callArgs = vi.mocked(fetch).mock.calls[0]![1] as RequestInit;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer cognito-jwt-token');
  });

  // --- Endpoint mapping: list endpoints ---

  describe.each([
    ['frontend.risk.register', '/api/v1/risks'],
    ['frontend.control.register', '/api/v1/controls'],
    ['frontend.action.register', '/api/v1/actions'],
    ['frontend.issue.register', '/api/v1/issues'],
    ['frontend.obligation.register', '/api/v1/compliance/obligations'],
    ['frontend.thirdParty.register', '/api/v1/third-parties'],
    ['frontend.enterpriseRisk.register', '/api/v1/enterprise-risks'],
    ['frontend.indicator.register', '/api/v1/indicators'],
    ['frontend.document.register', '/api/v1/policies'],
    ['frontend.assessment.register', '/api/v1/assessments'],
  ])('list endpoint %s', (procedurePath, expectedPath) => {
    it(`calls ${expectedPath} with page_size=250`, async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeListResponse([{ id: '1' }])),
      } as Response);

      const toolDef = makeToolDef({
        name: `list_${procedurePath.split('.')[1]}`,
        procedurePath,
      });

      await executeRestTool(toolDef, {}, mockSession);

      const calledUrl = getCalledUrl();
      expect(calledUrl).toBe(`${BASE_URL}${expectedPath}?page_size=250`);
    });

    it('returns flat array (unwrapped from data envelope)', async () => {
      const items = [
        { id: '1', title: 'Item A' },
        { id: '2', title: 'Item B' },
      ];
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeListResponse(items)),
      } as Response);

      const toolDef = makeToolDef({
        name: `list_${procedurePath.split('.')[1]}`,
        procedurePath,
      });

      const result = await executeRestTool(toolDef, {}, mockSession);
      expect(JSON.parse(result)).toEqual(items);
    });
  });

  // --- Endpoint mapping: get-by-ID endpoints ---

  describe.each([
    [
      'frontend.risk.riskById',
      '/api/v1/risks/:riskId',
      { riskId: 'abc-123' },
      '/api/v1/risks/abc-123',
    ],
    [
      'frontend.control.controlById',
      '/api/v1/controls/:controlId',
      { controlId: 'def-456' },
      '/api/v1/controls/def-456',
    ],
    [
      'frontend.action.actionById',
      '/api/v1/actions/:id',
      { id: 'ghi-789' },
      '/api/v1/actions/ghi-789',
    ],
    [
      'frontend.issue.issueById',
      '/api/v1/issues/:id',
      { id: 'jkl-012' },
      '/api/v1/issues/jkl-012',
    ],
  ])(
    'get-by-ID endpoint %s',
    (procedurePath, _template, input, expectedPath) => {
      it(`calls ${expectedPath} without page_size`, async () => {
        vi.mocked(fetch).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '1', title: 'Item' }),
        } as Response);

        const toolDef = makeToolDef({
          name: `get_${procedurePath.split('.')[1]}_by_id`,
          procedurePath,
        });

        await executeRestTool(toolDef, input, mockSession);

        const calledUrl = getCalledUrl();
        expect(calledUrl).toBe(`${BASE_URL}${expectedPath}`);
        expect(calledUrl).not.toContain('page_size');
      });

      it('wraps single item in array to match tRPC output', async () => {
        const item = { id: '1', title: 'Item', description: 'Details' };
        vi.mocked(fetch).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(item),
        } as Response);

        const toolDef = makeToolDef({
          name: `get_${procedurePath.split('.')[1]}_by_id`,
          procedurePath,
        });

        const result = await executeRestTool(toolDef, input, mockSession);
        expect(JSON.parse(result)).toEqual([item]);
      });
    }
  );

  // --- Linked items ---

  describe('get_linked_items', () => {
    const linkedItemsToolDef = makeToolDef({
      name: 'get_linked_items',
      procedurePath: 'frontend.linkedItem.linkedItems',
    });

    it('builds entity-scoped URL when entityType is provided', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            makeListResponse([{ id: 'li-1', linkedItemId: 'r-1' }])
          ),
      } as Response);

      await executeRestTool(
        linkedItemsToolDef,
        { id: 'abc-123', entityType: 'risks' },
        mockSession
      );

      const calledUrl = getCalledUrl();
      expect(calledUrl).toBe(
        `${BASE_URL}/api/v1/risks/abc-123/linked-items?page_size=250`
      );
    });

    it('returns error when entityType is missing', async () => {
      await expect(
        executeRestTool(linkedItemsToolDef, { id: 'abc-123' }, mockSession)
      ).rejects.toThrow(ValidationError);

      await expect(
        executeRestTool(linkedItemsToolDef, { id: 'abc-123' }, mockSession)
      ).rejects.toThrow(/entityType/);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns flat array from data envelope', async () => {
      const linkedItems = [
        { id: 'li-1', linkedItemId: 'r-1', linkedItemType: 'control' },
        { id: 'li-2', linkedItemId: 'r-2', linkedItemType: 'action' },
      ];
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeListResponse(linkedItems)),
      } as Response);

      const result = await executeRestTool(
        linkedItemsToolDef,
        { id: 'abc-123', entityType: 'controls' },
        mockSession
      );

      expect(JSON.parse(result)).toEqual(linkedItems);
    });
  });

  // --- Pagination ---

  describe('pagination', () => {
    it('fetches single page when hasMore is false', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            makeListResponse([{ id: '1' }, { id: '2' }], false, null)
          ),
      } as Response);

      const result = await executeRestTool(makeToolDef(), {}, mockSession);
      expect(JSON.parse(result)).toHaveLength(2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('follows nextPage to fetch all pages', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeListResponse(
                [{ id: '1' }],
                true,
                '/api/v1/risks?page_size=250&start_after=cursor1'
              )
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeListResponse(
                [{ id: '2' }],
                true,
                '/api/v1/risks?page_size=250&start_after=cursor2'
              )
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(makeListResponse([{ id: '3' }], false, null)),
        } as Response);

      const result = await executeRestTool(makeToolDef(), {}, mockSession);
      const parsed = JSON.parse(result) as unknown[];
      expect(parsed).toHaveLength(3);
      expect(fetch).toHaveBeenCalledTimes(3);

      // Second call should use the nextPage URL prepended with base URL
      const secondUrl = getCalledUrl(1);
      expect(secondUrl).toBe(
        `${BASE_URL}/api/v1/risks?page_size=250&start_after=cursor1`
      );
    });

    it('stops at MAX_PAGES limit and returns partial results', async () => {
      // Mock 51 pages — should stop at 50
      vi.mocked(fetch).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              makeListResponse(
                [{ id: 'item' }],
                true,
                '/api/v1/risks?page_size=250&start_after=next'
              )
            ),
        } as Response)
      );

      const result = await executeRestTool(makeToolDef(), {}, mockSession);
      const parsed = JSON.parse(result) as unknown[];
      expect(parsed).toHaveLength(50);
      expect(fetch).toHaveBeenCalledTimes(50);
    });
  });

  // --- Error handling ---

  describe('error handling', () => {
    it('throws AuthenticationError for 401 response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('{"error":{"message":"Invalid token"}}'),
      } as Response);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(/Authentication failed/);
    });

    it('throws AuthorizationError for 403 response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('{"error":{"message":"Forbidden"}}'),
      } as Response);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(AuthorizationError);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(/Access denied/);
    });

    it('throws NotFoundError for 404 response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('{"error":{"message":"Risk not found"}}'),
      } as Response);

      const toolDef = makeToolDef({
        name: 'get_risk_by_id',
        procedurePath: 'frontend.risk.riskById',
      });

      await expect(
        executeRestTool(toolDef, { riskId: 'nonexistent' }, mockSession)
      ).rejects.toThrow(NotFoundError);

      await expect(
        executeRestTool(toolDef, { riskId: 'nonexistent' }, mockSession)
      ).rejects.toThrow(/Not found.*Risk not found/);
    });

    it('throws RateLimitError for 429 response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('{}'),
      } as Response);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(RateLimitError);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(/Rate limit exceeded/);
    });

    it('throws ExternalServiceError for 500 response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () =>
          Promise.resolve('{"error":{"message":"Something went wrong"}}'),
      } as Response);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(ExternalServiceError);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(/temporarily unavailable/);
    });

    it('throws ExternalServiceError for non-JSON error bodies', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: () => Promise.resolve('Bad Gateway'),
      } as Response);

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow(ExternalServiceError);
    });

    it('propagates fetch network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(
        executeRestTool(makeToolDef(), {}, mockSession)
      ).rejects.toThrow('ECONNREFUSED');
    });
  });

  // --- Unknown procedure path ---

  it('throws AuthorizationError for unmapped procedure path', async () => {
    const toolDef = makeToolDef({
      name: 'unknown_tool',
      procedurePath: 'frontend.unknown.procedure',
    });

    await expect(executeRestTool(toolDef, {}, mockSession)).rejects.toThrow(
      AuthorizationError
    );

    await expect(executeRestTool(toolDef, {}, mockSession)).rejects.toThrow(
      /unknown_tool/
    );
  });

  // --- Filter warnings ---

  describe('unsupported filters', () => {
    it('returns results even when unsupported filters are provided', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(makeListResponse([{ id: '1', title: 'Action' }])),
      } as Response);

      const toolDef = makeToolDef({
        name: 'list_actions',
        procedurePath: 'frontend.action.register',
      });

      const result = await executeRestTool(
        toolDef,
        { parentId: 'some-id', tagTypeIds: ['tag-1'] },
        mockSession
      );

      const parsed = JSON.parse(result) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it('does not include unsupported filter params in the URL', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeListResponse([])),
      } as Response);

      const toolDef = makeToolDef({
        name: 'list_issues',
        procedurePath: 'frontend.issue.register',
      });

      await executeRestTool(
        toolDef,
        { issueType: 'issue', tagTypeIds: ['t-1'] },
        mockSession
      );

      const calledUrl = getCalledUrl();
      expect(calledUrl).not.toContain('issueType');
      expect(calledUrl).not.toContain('tagTypeIds');
    });
  });

  // --- Endpoint map coverage ---

  it('has mappings for all 15 REST-available tools', () => {
    const expectedProcedures = [
      'frontend.risk.register',
      'frontend.risk.riskById',
      'frontend.control.register',
      'frontend.control.controlById',
      'frontend.action.register',
      'frontend.action.actionById',
      'frontend.issue.register',
      'frontend.issue.issueById',
      'frontend.obligation.register',
      'frontend.thirdParty.register',
      'frontend.enterpriseRisk.register',
      'frontend.indicator.register',
      'frontend.document.register',
      'frontend.assessment.register',
      'frontend.linkedItem.linkedItems',
    ];

    for (const proc of expectedProcedures) {
      expect(endpointMap).toHaveProperty(proc);
    }
    expect(Object.keys(endpointMap)).toHaveLength(15);
  });

  // --- SSRF protection ---

  describe('nextPage origin validation', () => {
    it('stops pagination when nextPage points to external origin', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve(
            makeListResponse(
              [{ id: '1' }],
              true,
              'https://evil.com/steal?token=leaked'
            )
          ),
      } as Response);

      const result = await executeRestTool(makeToolDef(), {}, mockSession);
      const parsed = JSON.parse(result) as unknown[];
      // Should return data from first page only, not follow external nextPage
      expect(parsed).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('stops pagination when nextPage uses userinfo SSRF trick', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve(
            makeListResponse(
              [{ id: '1' }],
              true,
              'https://api.example.com@attacker.com/steal'
            )
          ),
      } as Response);

      const result = await executeRestTool(makeToolDef(), {}, mockSession);
      const parsed = JSON.parse(result) as unknown[];
      expect(parsed).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  // --- Unresolved path parameters ---

  describe('missing path parameters', () => {
    it('throws ValidationError when required path param is missing', async () => {
      const toolDef = makeToolDef({
        name: 'get_risk_by_id',
        procedurePath: 'frontend.risk.riskById',
      });

      // Call without providing riskId
      await expect(executeRestTool(toolDef, {}, mockSession)).rejects.toThrow(
        ValidationError
      );

      await expect(executeRestTool(toolDef, {}, mockSession)).rejects.toThrow(
        /riskId/
      );

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // --- compliance/obligations encoding ---

  describe('multi-segment entityType encoding', () => {
    it('preserves slash in compliance/obligations path', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeListResponse([{ id: 'li-1' }])),
      } as Response);

      const toolDef = makeToolDef({
        name: 'get_linked_items',
        procedurePath: 'frontend.linkedItem.linkedItems',
      });

      await executeRestTool(
        toolDef,
        { id: 'obl-123', entityType: 'compliance/obligations' },
        mockSession
      );

      const calledUrl = getCalledUrl();
      expect(calledUrl).toContain('/compliance/obligations/obl-123/');
      expect(calledUrl).not.toContain('%2F');
    });
  });

  // --- Accept header ---

  it('sends Accept: application/json header', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeListResponse([{ id: '1' }])),
    } as Response);

    await executeRestTool(makeToolDef(), {}, mockSession);

    const callArgs = vi.mocked(fetch).mock.calls[0]![1] as RequestInit;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers.accept).toBe('application/json');
  });

  // --- Error during pagination ---

  it('throws ExternalServiceError when a paginated request fails mid-pagination', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve(
            makeListResponse(
              [{ id: '1' }],
              true,
              '/api/v1/risks?page_size=250&start_after=cursor1'
            )
          ),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"error":{"message":"DB timeout"}}'),
      } as Response);

    await expect(
      executeRestTool(makeToolDef(), {}, mockSession)
    ).rejects.toThrow(ExternalServiceError);
  });
});
