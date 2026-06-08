import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getActionUpdateSummaries } from '../clients/actionUpdateSummaryClient';
import { apiClient } from '../clients/apiClient';
import { buildAction } from '../data/action';
import { buildActionUpdate } from '../data/actionUpdate';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('actionUpdateSummaries', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  it.each([
    { ...riskManagerUser1, expectedRecords: 1 },
    { ...standardUser1, expectedRecords: 0 },
    { ...readOnlyUser1, expectedRecords: 1 },
    { ...standardEnhancedUser1, expectedRecords: 1 },
    { ...internalAuditUser1, expectedRecords: 1 },
  ])(
    '$RoleKey should see $expectedRecords action update summaries where they are not the Owner or contributor of the parent action',
    async ({ expectedRecords, ...user }) => {
      const action = buildAction();
      await apiClient.insertActions({ objects: action });
      await apiClient.insertActionUpdates({
        objects: buildActionUpdate({ ParentActionId: action.Id! }),
      });

      const summaries = await getActionUpdateSummaries({
        user,
      });
      expect(summaries.length).toEqual(expectedRecords);
    }
  );

  it('should return the number of updates associated with an action', async () => {
    const action1 = buildAction();
    const action2 = buildAction();
    await apiClient.insertActions({ objects: action1 });
    await apiClient.insertActions({ objects: action2 });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({ ParentActionId: action1.Id! }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({ ParentActionId: action1.Id! }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({ ParentActionId: action1.Id! }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({ ParentActionId: action2.Id! }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({ ParentActionId: action2.Id! }),
    });

    const summaries = await getActionUpdateSummaries({
      user: riskManagerUser1,
    });
    expect(summaries.length).toEqual(2);

    const action1UpdatesSummary = summaries.find(
      (s) => s.ActionId == action1.Id
    );
    const action2UpdatesSummary = summaries.find(
      (s) => s.ActionId == action2.Id
    );
    expect(action1UpdatesSummary?.Count).toEqual(3);
    expect(action2UpdatesSummary?.Count).toEqual(2);
  });
  it('should return the title, date and description of the most recent update', async () => {
    const action1 = buildAction();

    await apiClient.insertActions({ objects: action1 });

    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({
        ParentActionId: action1.Id!,
        CreatedAtTimestamp: '2021-01-01',
        Description: 'Not most recent',
        Title: 'Not most recent',
      }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({
        ParentActionId: action1.Id!,
        CreatedAtTimestamp: '2022-01-01',
        Description: 'Most recent description',
        Title: 'Most recent title',
      }),
    });
    await apiClient.insertActionUpdates({
      objects: buildActionUpdate({
        ParentActionId: action1.Id!,
        CreatedAtTimestamp: '2020-01-01',
        Description: 'Not most recent',
        Title: 'Not most recent',
      }),
    });

    const summaries = await getActionUpdateSummaries({
      user: riskManagerUser1,
    });
    expect(summaries.length).toEqual(1);

    const action1UpdatesSummary = summaries.find(
      (s) => s.ActionId == action1.Id
    );

    expect(action1UpdatesSummary?.Count).toEqual(3);
    expect(action1UpdatesSummary?.LatestTitle).toEqual('Most recent title');
    expect(action1UpdatesSummary?.LatestDescription).toEqual(
      'Most recent description'
    );
    expect(action1UpdatesSummary?.LatestCreatedAtTimestamp).toEqual(
      '2022-01-01T00:00:00+00:00'
    );
  });
});
