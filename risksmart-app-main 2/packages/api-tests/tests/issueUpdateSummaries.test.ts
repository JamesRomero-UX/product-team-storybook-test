import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getIssueUpdateSummaries } from '../clients/issueUpdateSummaryClient';
import { buildIssue } from '../data/issue';
import { buildIssueUpdate } from '../data/issueUpdate';
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

describe('issueUpdateSummaries', () => {
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
      const issue = buildIssue();
      await apiClient.insertIssues({ objects: issue });
      await apiClient.InsertIssueUpdate({
        objects: buildIssueUpdate({ ParentIssueId: issue.Id! }),
      });

      const summaries = await getIssueUpdateSummaries({
        user,
      });
      expect(summaries.length).toEqual(expectedRecords);
    }
  );

  it('should return the number of updates associated with an action', async () => {
    const issue1 = buildIssue();
    const issue2 = buildIssue();
    await apiClient.insertIssues({ objects: issue1 });
    await apiClient.insertIssues({ objects: issue2 });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({ ParentIssueId: issue1.Id! }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({ ParentIssueId: issue1.Id! }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({ ParentIssueId: issue1.Id! }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({ ParentIssueId: issue2.Id! }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({ ParentIssueId: issue2.Id! }),
    });

    const summaries = await getIssueUpdateSummaries({
      user: riskManagerUser1,
    });
    expect(summaries.length).toEqual(2);

    const issue1UpdatesSummary = summaries.find((s) => s.IssueId == issue1.Id);
    const issue2UpdatesSummary = summaries.find((s) => s.IssueId == issue2.Id);
    expect(issue1UpdatesSummary?.Count).toEqual(3);
    expect(issue2UpdatesSummary?.Count).toEqual(2);
  });
  it('should return the title, date and description of the most recent update', async () => {
    const issue1 = buildIssue();

    await apiClient.insertIssues({ objects: issue1 });

    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({
        ParentIssueId: issue1.Id!,
        CreatedAtTimestamp: '2021-01-01',
        Description: 'Not most recent',
        Title: 'Not most recent',
      }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({
        ParentIssueId: issue1.Id!,
        CreatedAtTimestamp: '2022-01-01',
        Description: 'Most recent description',
        Title: 'Most recent title',
      }),
    });
    await apiClient.InsertIssueUpdate({
      objects: buildIssueUpdate({
        ParentIssueId: issue1.Id!,
        CreatedAtTimestamp: '2020-01-01',
        Description: 'Not most recent',
        Title: 'Not most recent',
      }),
    });

    const summaries = await getIssueUpdateSummaries({
      user: riskManagerUser1,
    });
    expect(summaries.length).toEqual(1);

    const issue1UpdatesSummary = summaries.find((s) => s.IssueId == issue1.Id);

    expect(issue1UpdatesSummary?.Count).toEqual(3);
    expect(issue1UpdatesSummary?.LatestTitle).toEqual('Most recent title');
    expect(issue1UpdatesSummary?.LatestDescription).toEqual(
      'Most recent description'
    );
    expect(issue1UpdatesSummary?.LatestCreatedAtTimestamp).toEqual(
      '2022-01-01T00:00:00+00:00'
    );
  });
});
