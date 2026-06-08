import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import createIndicatorAction from '../../src/actions/create_indicator.js';
import createRiskAction from '../../src/actions/create_risk.js';
import deleteIndicatorAction from '../../src/actions/delete_indicator.js';
import deleteRiskAction from '../../src/actions/delete_risk.js';
import updateIndicatorAction from '../../src/actions/update_indicator.js';
import findIndicatorSearch from '../../src/searches/find_indicator.js';
import listIndicatorsSearch from '../../src/searches/list_indicators.js';
import {
  appTester,
  authBundle,
  initSession,
  ownerId,
  TEST_PREFIX,
} from './helpers.js';

describe('Indicator lifecycle (integration)', () => {
  let parentRiskId: string;
  let indicatorId: string;
  let needsIndicatorCleanup = false;
  let needsRiskCleanup = false;

  beforeAll(async () => {
    await initSession();
  });

  afterAll(async () => {
    // Clean up in reverse order: indicator first, then parent risk
    if (needsIndicatorCleanup && indicatorId) {
      try {
        await appTester(
          deleteIndicatorAction.operation.perform,
          authBundle({ id: indicatorId })
        );
      } catch {
        // Best-effort cleanup
      }
    }
    if (needsRiskCleanup && parentRiskId) {
      try {
        await appTester(
          deleteRiskAction.operation.perform,
          authBundle({ id: parentRiskId })
        );
      } catch {
        // Best-effort cleanup
      }
    }
  });

  it('creates a parent risk for the indicator', async () => {
    const result = await appTester(
      createRiskAction.operation.perform,
      authBundle({
        title: `${TEST_PREFIX} Indicator Parent Risk`,
        owners: [ownerId()],
        tier: 1,
      })
    );

    expect(result).toHaveProperty('id');
    parentRiskId = result.id as string;
    needsRiskCleanup = true;
  });

  it('creates an indicator linked to the parent risk', async () => {
    const result = await appTester(
      createIndicatorAction.operation.perform,
      authBundle({
        title: `${TEST_PREFIX} Test Indicator`,
        type: 'number',
        owners: [ownerId()],
        parentId: parentRiskId,
        description: 'Created by Zapier integration tests',
        unit: '%',
      })
    );

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    indicatorId = result.id as string;
    needsIndicatorCleanup = true;
  });

  it('finds the created indicator by ID', async () => {
    const results = await appTester(
      findIndicatorSearch.operation.perform,
      authBundle({ id: indicatorId })
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('id', indicatorId);
    expect(results[0].title).toContain(TEST_PREFIX);
  });

  it('lists indicators and finds the created one', async () => {
    const result = await appTester(
      listIndicatorsSearch.operation.perform,
      authBundle({ page_size: 100 })
    );

    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);

    const found = result.results.find(
      (r: Record<string, unknown>) => r.id === indicatorId
    );
    expect(found).toBeDefined();
  });

  it('updates the indicator title', async () => {
    const result = await appTester(
      updateIndicatorAction.operation.perform,
      authBundle({
        id: indicatorId,
        title: `${TEST_PREFIX} Updated Indicator`,
        type: 'number',
        owners: [ownerId()],
      })
    );

    expect(result).toHaveProperty('id', indicatorId);
  });

  it('deletes the indicator', async () => {
    const result = await appTester(
      deleteIndicatorAction.operation.perform,
      authBundle({ id: indicatorId })
    );

    expect(result).toHaveProperty('id');
    needsIndicatorCleanup = false;
  });

  it('deletes the parent risk', async () => {
    const result = await appTester(
      deleteRiskAction.operation.perform,
      authBundle({ id: parentRiskId })
    );

    expect(result).toHaveProperty('id');
    needsRiskCleanup = false;
  });
});
