import { beforeEach, describe, expect, it } from 'vitest';

import findActionsByOwner from '../../src/searches/find_actions_by_owner.js';
import findIssuesByOwner from '../../src/searches/find_issues_by_owner.js';
import findRisksByOwner from '../../src/searches/find_risks_by_owner.js';
import getIssueDetails from '../../src/searches/get_issue_details.js';
import getRiskOverview from '../../src/searches/get_risk_overview.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const singlePageResponse = (data: Record<string, unknown>[]) =>
  mockResponse(200, {
    data,
    pageInfo: { hasMore: false, afterCursor: null },
  });

const multiPageResponse = (
  data: Record<string, unknown>[],
  afterCursor: string
) =>
  mockResponse(200, {
    data,
    pageInfo: { hasMore: true, afterCursor },
  });

describe('find_actions_by_owner', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns actions matching owner_id', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], status: 'open' },
        { id: '2', owners: ['auth0|def'], status: 'open' },
        { id: '3', owners: ['auth0|abc', 'auth0|def'], status: 'closed' },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findActionsByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc'], status: 'open' },
      { id: '3', owners: ['auth0|abc', 'auth0|def'], status: 'closed' },
    ]);
  });

  it('applies optional status filter', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], status: 'open' },
        { id: '2', owners: ['auth0|abc'], status: 'closed' },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc', status: 'open' });
    const result = await findActionsByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc'], status: 'open' },
    ]);
  });

  it('paginates across pages before filtering', async () => {
    z.request
      .mockResolvedValueOnce(
        multiPageResponse(
          [{ id: '1', owners: ['auth0|abc'] }],
          'cursor-1'
        )
      )
      .mockResolvedValueOnce(
        singlePageResponse([{ id: '2', owners: ['auth0|abc'] }])
      );

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findActionsByOwner.operation.perform(z, bundle);

    expect(result).toHaveLength(2);
    expect(z.request).toHaveBeenCalledTimes(2);
  });

  it('returns empty array when no actions match', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([{ id: '1', owners: ['auth0|other'] }])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findActionsByOwner.operation.perform(z, bundle);

    expect(result).toEqual([]);
  });
});

describe('find_issues_by_owner', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns issues matching owner_id', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'] },
        { id: '2', owners: ['auth0|def'] },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findIssuesByOwner.operation.perform(z, bundle);

    expect(result).toEqual([{ id: '1', owners: ['auth0|abc'] }]);
  });

  it('returns empty array when no issues match', async () => {
    z.request.mockResolvedValue(singlePageResponse([]));

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findIssuesByOwner.operation.perform(z, bundle);

    expect(result).toEqual([]);
  });
});

describe('find_risks_by_owner', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns risks matching owner_id', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
        { id: '2', owners: ['auth0|def'], tier: 2, status: 'active' },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findRisksByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
    ]);
  });

  it('applies optional status filter', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
        { id: '2', owners: ['auth0|abc'], tier: 1, status: 'retired' },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc', status: 'active' });
    const result = await findRisksByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
    ]);
  });

  it('applies optional tier filter', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
        { id: '2', owners: ['auth0|abc'], tier: 2, status: 'active' },
        { id: '3', owners: ['auth0|abc'], tier: 3, status: 'active' },
      ])
    );

    const bundle = createBundle({ owner_id: 'auth0|abc', tier: '2' });
    const result = await findRisksByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '2', owners: ['auth0|abc'], tier: 2, status: 'active' },
    ]);
  });

  it('applies both status and tier filters', async () => {
    z.request.mockResolvedValue(
      singlePageResponse([
        { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
        { id: '2', owners: ['auth0|abc'], tier: 2, status: 'active' },
        { id: '3', owners: ['auth0|abc'], tier: 1, status: 'retired' },
      ])
    );

    const bundle = createBundle({
      owner_id: 'auth0|abc',
      status: 'active',
      tier: '1',
    });
    const result = await findRisksByOwner.operation.perform(z, bundle);

    expect(result).toEqual([
      { id: '1', owners: ['auth0|abc'], tier: 1, status: 'active' },
    ]);
  });

  it('returns empty array when no risks match', async () => {
    z.request.mockResolvedValue(singlePageResponse([]));

    const bundle = createBundle({ owner_id: 'auth0|abc' });
    const result = await findRisksByOwner.operation.perform(z, bundle);

    expect(result).toEqual([]);
  });
});

describe('get_issue_details', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns enriched issue with causes, consequences, and linked items', async () => {
    const issueId = 'issue-123';

    z.request
      // Main issue fetch
      .mockResolvedValueOnce(
        mockResponse(200, { id: issueId, title: 'Test Issue' })
      )
      // causes
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'cause-1', title: 'Root cause' }])
      )
      // consequences
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'cons-1', title: 'Impact' }])
      )
      // linked-items
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'link-1', title: 'Related' }])
      );

    const bundle = createBundle({ id: issueId });
    const result = await getIssueDetails.operation.perform(z, bundle);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: issueId,
      title: 'Test Issue',
      causes: [{ id: 'cause-1', title: 'Root cause' }],
      consequences: [{ id: 'cons-1', title: 'Impact' }],
      linkedItems: [{ id: 'link-1', title: 'Related' }],
    });
  });

  it('returns empty array on 404', async () => {
    z.request.mockResolvedValue(
      mockResponse(404, { message: 'Not found' })
    );

    const bundle = createBundle({ id: 'nonexistent' });
    const result = await getIssueDetails.operation.perform(z, bundle);

    expect(result).toEqual([]);
  });

  it('fetches sub-resources from correct URLs', async () => {
    const issueId = 'issue-456';

    z.request
      .mockResolvedValueOnce(
        mockResponse(200, { id: issueId, title: 'Issue' })
      )
      .mockResolvedValueOnce(singlePageResponse([]))
      .mockResolvedValueOnce(singlePageResponse([]))
      .mockResolvedValueOnce(singlePageResponse([]));

    const bundle = createBundle({ id: issueId });
    await getIssueDetails.operation.perform(z, bundle);

    // Main entity request
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/issues/${issueId}`,
      })
    );

    // Sub-resource requests
    const urls = z.request.mock.calls.map(
      (call: unknown[]) => (call[0] as { url?: string; params?: unknown }).url
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/issues/${issueId}/causes`
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/issues/${issueId}/consequences`
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/issues/${issueId}/linked-items`
    );
  });
});

describe('get_risk_overview', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('returns enriched risk with controls, actions, and ratings', async () => {
    const riskId = 'risk-123';

    z.request
      // Main risk fetch
      .mockResolvedValueOnce(
        mockResponse(200, { id: riskId, title: 'Test Risk', tier: 1 })
      )
      // controls
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'ctrl-1', title: 'Firewall' }])
      )
      // actions
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'act-1', title: 'Implement MFA' }])
      )
      // ratings
      .mockResolvedValueOnce(
        singlePageResponse([{ id: 'rat-1', likelihood: 3, impact: 4 }])
      );

    const bundle = createBundle({ id: riskId });
    const result = await getRiskOverview.operation.perform(z, bundle);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: riskId,
      title: 'Test Risk',
      tier: 1,
      controls: [{ id: 'ctrl-1', title: 'Firewall' }],
      actions: [{ id: 'act-1', title: 'Implement MFA' }],
      ratings: [{ id: 'rat-1', likelihood: 3, impact: 4 }],
    });
  });

  it('returns empty array on 404', async () => {
    z.request.mockResolvedValue(
      mockResponse(404, { message: 'Not found' })
    );

    const bundle = createBundle({ id: 'nonexistent' });
    const result = await getRiskOverview.operation.perform(z, bundle);

    expect(result).toEqual([]);
  });

  it('fetches sub-resources from correct URLs', async () => {
    const riskId = 'risk-789';

    z.request
      .mockResolvedValueOnce(
        mockResponse(200, { id: riskId, title: 'Risk' })
      )
      .mockResolvedValueOnce(singlePageResponse([]))
      .mockResolvedValueOnce(singlePageResponse([]))
      .mockResolvedValueOnce(singlePageResponse([]));

    const bundle = createBundle({ id: riskId });
    await getRiskOverview.operation.perform(z, bundle);

    // Main entity request
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks/${riskId}`,
      })
    );

    // Sub-resource requests
    const urls = z.request.mock.calls.map(
      (call: unknown[]) => (call[0] as { url?: string; params?: unknown }).url
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/risks/${riskId}/controls`
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/risks/${riskId}/actions`
    );
    expect(urls).toContain(
      `${TEST_BASE_URL}/api/v1/risks/${riskId}/ratings`
    );
  });
});
