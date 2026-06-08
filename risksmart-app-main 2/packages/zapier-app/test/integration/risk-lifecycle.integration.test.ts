import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import createRiskAction from '../../src/actions/create_risk.js';
import deleteRiskAction from '../../src/actions/delete_risk.js';
import updateRiskAction from '../../src/actions/update_risk.js';
import findRiskSearch from '../../src/searches/find_risk.js';
import getRiskOverviewSearch from '../../src/searches/get_risk_overview.js';
import listRisksSearch from '../../src/searches/list_risks.js';
import {
  appTester,
  authBundle,
  initSession,
  ownerId,
  TEST_PREFIX,
} from './helpers.js';

describe('Risk lifecycle (integration)', () => {
  // Track the risk ID across the lifecycle. `needsCleanup` stays true
  // until the delete test succeeds, ensuring afterAll cleans up on failure.
  let riskId: string;
  let needsCleanup = false;

  beforeAll(async () => {
    await initSession();
  });

  afterAll(async () => {
    if (needsCleanup && riskId) {
      try {
        await appTester(
          deleteRiskAction.operation.perform,
          authBundle({ id: riskId })
        );
      } catch {
        // Best-effort cleanup
      }
    }
  });

  it('creates a risk', async () => {
    const result = await appTester(
      createRiskAction.operation.perform,
      authBundle({
        title: `${TEST_PREFIX} Integration Test Risk`,
        owners: [ownerId()],
        tier: 1,
        description: 'Created by Zapier integration tests',
        status: 'active',
        treatment: 'treat',
      })
    );

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    riskId = result.id as string;
    needsCleanup = true;
  });

  it('finds the created risk by ID', async () => {
    const results = await appTester(
      findRiskSearch.operation.perform,
      authBundle({ id: riskId })
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('id', riskId);
    expect(results[0].title).toContain(TEST_PREFIX);
  });

  it('lists risks and finds the created one', async () => {
    const result = await appTester(
      listRisksSearch.operation.perform,
      authBundle({ page_size: 100 })
    );

    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);

    const found = result.results.find(
      (r: Record<string, unknown>) => r.id === riskId
    );
    expect(found).toBeDefined();
    expect(found).toHaveProperty('_zapierLabel');
  });

  it('updates the risk title', async () => {
    const updatedTitle = `${TEST_PREFIX} Updated Risk`;
    const result = await appTester(
      updateRiskAction.operation.perform,
      authBundle({
        id: riskId,
        title: updatedTitle,
        owners: [ownerId()],
        tier: 1,
      })
    );

    expect(result).toHaveProperty('id', riskId);
  });

  it('finds the updated risk and verifies title change', async () => {
    const results = await appTester(
      findRiskSearch.operation.perform,
      authBundle({ id: riskId })
    );

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe(`${TEST_PREFIX} Updated Risk`);
  });

  it('gets risk overview with sub-resources', async () => {
    const results = await appTester(
      getRiskOverviewSearch.operation.perform,
      authBundle({ id: riskId })
    );

    expect(results).toHaveLength(1);
    const overview = results[0] as Record<string, unknown>;
    expect(overview).toHaveProperty('id', riskId);
    // Overview includes sub-resource arrays (may be empty for a fresh risk)
    expect(overview).toHaveProperty('controls');
    expect(overview).toHaveProperty('actions');
    expect(overview).toHaveProperty('ratings');
    expect(Array.isArray(overview.controls)).toBe(true);
    expect(Array.isArray(overview.actions)).toBe(true);
    expect(Array.isArray(overview.ratings)).toBe(true);
  });

  it('deletes the risk', async () => {
    const result = await appTester(
      deleteRiskAction.operation.perform,
      authBundle({ id: riskId })
    );

    expect(result).toHaveProperty('id');
    needsCleanup = false;
  });

  it('confirms the deleted risk returns empty', async () => {
    const results = await appTester(
      findRiskSearch.operation.perform,
      authBundle({ id: riskId })
    );

    expect(results).toEqual([]);
  });
});
