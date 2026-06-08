import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql';
import { IssueAssessmentService } from 'src/services/issue-assessment/issue-assessment.service';
import { vi } from 'vitest';

import { workflows } from './workflows';

vi.mock('src/services/issue-assessment/issue-assessment.service');

const issueAssessmentServiceMock = vi.mocked(IssueAssessmentService);
const createIssueAssessmentMock = vi.fn();
const updateIssueAssessmentMock = vi.fn();

const workflow = workflows['close-issue-assessment']('tenant');

describe('close-issue-assessment.workflow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('appovalCheck', () => {
    it.each([
      IssueAssessmentStatusEnum.Awaitingclosure,
      IssueAssessmentStatusEnum.Closed,
      IssueAssessmentStatusEnum.Declined,
      IssueAssessmentStatusEnum.Firstlineapproval,
      IssueAssessmentStatusEnum.Open,
      IssueAssessmentStatusEnum.Pending,
    ])(
      'returns false when the status is unchanged, regardless of what the status is (%s)',
      async (status) => {
        issueAssessmentServiceMock.mockReturnValue({
          create: createIssueAssessmentMock,
          update: updateIssueAssessmentMock,
          delete: vi.fn(),
          findById: vi.fn().mockResolvedValue({
            Status: status,
            Type: ParentTypeEnum.IssueAssessment,
          }),
        });

        const result = await workflow.config.approvalCheck?.('tenant')?.({
          id: 'id',
          orgKey: 'orgKey',
          userId: 'userId',
          data: {
            Id: 'issue-assessment-id-1',
            OriginalTimestamp: '2021-01-01T00:00:00Z',
            ParentIssueId: 'parent-issue-id-1',
            TagTypeIds: [],
            tags: [],
            DepartmentTypeIds: [],
            departments: [],
            ParentIds: [],
            parents: [],
            Status: status,
          },
        });

        expect(result).toBe(false);
      }
    );

    it.each([
      IssueAssessmentStatusEnum.Awaitingclosure,
      IssueAssessmentStatusEnum.Closed,
      IssueAssessmentStatusEnum.Declined,
      IssueAssessmentStatusEnum.Firstlineapproval,
      IssueAssessmentStatusEnum.Open,
      IssueAssessmentStatusEnum.Pending,
    ])(
      'returns false when the type is not issueAssessment, regardless of what the status is (%s)',
      async (status) => {
        issueAssessmentServiceMock.mockReturnValue({
          create: createIssueAssessmentMock,
          update: updateIssueAssessmentMock,
          delete: vi.fn(),
          findById: vi.fn().mockResolvedValue({
            Status: status,
            Type: ParentTypeEnum.IssueAssessmentBreachLog,
          }),
        });

        const result = await workflow.config.approvalCheck?.('tenant')?.({
          id: 'id',
          orgKey: 'orgKey',
          userId: 'userId',
          data: {
            Id: 'issue-assessment-id-1',
            OriginalTimestamp: '2021-01-01T00:00:00Z',
            ParentIssueId: 'parent-issue-id-1',
            TagTypeIds: [],
            tags: [],
            DepartmentTypeIds: [],
            departments: [],
            ParentIds: [],
            parents: [],
            Status: IssueAssessmentStatusEnum.Pending,
          },
        });

        expect(result).toBe(false);
      }
    );

    it.each([
      IssueAssessmentStatusEnum.Awaitingclosure,
      IssueAssessmentStatusEnum.Declined,
      IssueAssessmentStatusEnum.Firstlineapproval,
      IssueAssessmentStatusEnum.Open,
      IssueAssessmentStatusEnum.Pending,
    ])(
      'returns true when the status has changed (%s) vs Closed',
      async (status) => {
        issueAssessmentServiceMock.mockReturnValue({
          create: createIssueAssessmentMock,
          update: updateIssueAssessmentMock,
          delete: vi.fn(),
          findById: vi.fn().mockResolvedValue({
            Status: status,
            Type: ParentTypeEnum.IssueAssessment,
          }),
        });

        const result = await workflow.config.approvalCheck?.('tenant')?.({
          id: 'id',
          orgKey: 'orgKey',
          userId: 'userId',
          data: {
            Id: 'issue-assessment-id-1',
            OriginalTimestamp: '2021-01-01T00:00:00Z',
            ParentIssueId: 'parent-issue-id-1',
            TagTypeIds: [],
            tags: [],
            DepartmentTypeIds: [],
            departments: [],
            ParentIds: [],
            parents: [],
            Status: IssueAssessmentStatusEnum.Closed,
          },
        });

        expect(result).toBe(true);
      }
    );
  });
});
