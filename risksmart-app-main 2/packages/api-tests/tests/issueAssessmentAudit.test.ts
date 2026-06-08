import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getIssueAssessmentAudits } from '../clients/issueAssessmentAuditsClient';
import { insertIssueAssessment } from '../clients/issueAssessmentClient';
import { buildIssue } from '../data/issue';
import { buildIssueAssessment } from '../data/issueAssessment';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
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

describe('issueAssessmentAudit', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issue assessment audit records where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await insertIssueAssessment(
          buildIssueAssessment({
            ParentIssueId: issue.Id,
          })
        );

        const issueAssessmentsAudits = await getIssueAssessmentAudits({
          user,
        });
        expect(issueAssessmentsAudits.length).toEqual(expectedRecords);
      }
    );
  });
});
