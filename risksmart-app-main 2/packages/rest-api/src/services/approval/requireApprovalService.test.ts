import {
  ApprovalStatusEnum,
  IssueAssessmentStatusEnum,
} from 'generated/graphql';
import { workflows } from 'src/approval-workflows/workflows';
import { checkWorkflow } from 'src/services/approval/workflowUtils';
import type { CreateChangeRequestInput } from 'src/services/change-request/change-request.service';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { IssueAssessmentService } from 'src/services/issue-assessment/issue-assessment.service';
import { vi } from 'vitest';

vi.mock('src/services/change-request/change-request.service');
vi.mock('src/services/approval/approval.service');
vi.mock('src/services/approval/workflowUtils');
vi.mock('src/services/issue-assessment/issue-assessment.service');

const changeRequestServiceMock = vi.mocked(ChangeRequestService);
const adminChangeRequestServiceMock = vi.mocked(ChangeRequestService);
const checkWorkflowMock = vi.mocked(checkWorkflow);
const issueAssessmentServiceMock = vi.mocked(IssueAssessmentService);

const mockRequest = {
  session_variables: {
    'x-hasura-org-id': 'acme corp',
    'x-hasura-user-id': 'roadrunner',
  },
  action: {
    name: '',
  },
  input: {
    id: 'issue-assessment-id-1',
    data: {
      Id: 'issue-assessment-id-1',
      OriginalTimestamp: '2021-01-01T00:00:00Z',
      Status: IssueAssessmentStatusEnum.Closed,
      ParentIssueId: 'parent-issue-id-1',
      TagTypeIds: [],
      tags: [],
      DepartmentTypeIds: [],
      departments: [],
      ParentIds: [],
      parents: [],
    },
  },
  event: {
    version: '',
    isBase64Encoded: false,
    routeKey: '',
    rawPath: '',
    rawQueryString: '',
    headers: {},
    requestContext: {
      routeKey: '',
      stage: '',
      time: '',
      timeEpoch: 123,
      accountId: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
        method: 'POST',
        path: '',
        protocol: '',
        sourceIp: '',
        userAgent: '',
      },
      requestId: '',
    },
  },
  tenant: 'tenant',
};

const createIssueAssessmentMock = vi.fn();
const updateIssueAssessmentMock = vi.fn();
const deleteChangeRequestMock = vi.fn();
const createChangeRequestMock = vi.fn();
const updateChangeRequestMock = vi.fn();

describe('requireApprovalService', () => {
  const workflow = workflows['close-issue-assessment']('tenant');

  beforeEach(() => {
    vi.resetAllMocks();

    changeRequestServiceMock.mockReturnValue({
      findActiveChangeRequest: vi.fn(),
      findById: vi.fn(),
      create: createChangeRequestMock,
      merge: vi.fn(),
      amendChanges: updateChangeRequestMock,
      delete: vi.fn(),
      getActiveLevelId: vi.fn(),
      getWorkflow: vi.fn(),
      updateStatus: vi.fn(),
      findContributors: vi.fn(),
    });

    adminChangeRequestServiceMock.mockReturnValue({
      findActiveChangeRequest: vi.fn(),
      findById: vi.fn(),
      create: createChangeRequestMock,
      merge: vi.fn(),
      amendChanges: updateChangeRequestMock,
      delete: deleteChangeRequestMock,
      getActiveLevelId: vi.fn(),
      getWorkflow: vi.fn(),
      updateStatus: vi.fn(),
      findContributors: vi.fn(),
    });

    issueAssessmentServiceMock.mockReturnValue({
      create: createIssueAssessmentMock,
      update: updateIssueAssessmentMock,
      delete: vi.fn(),
      findById: vi.fn(),
    });
  });

  it('creates a change request when required', async () => {
    const mockChangeRequest: CreateChangeRequestInput = {
      approvalParentId: 'issue-assessment-id-1',
      objectId: 'issue-assessment-id-1',
      workflow: 'close-issue-assessment',
      changes: {
        data: undefined,
        id: 'issue-assessment-id-1',
        orgKey: 'acme corp',
        userId: 'roadrunner',
      },
    };

    checkWorkflowMock.mockResolvedValue({
      result: 'change-request-required',
      data: {
        type: 'update',
        config: workflow.config,
        data: {
          approvalParentId: 'issue-assessment-id-1',
          objectId: 'issue-assessment-id-1',
          workflow: 'close-issue-assessment',
          changes: {
            id: 'issue-assessment-id-1',
            userId: 'roadrunner',
            orgKey: 'acme corp',
            data: undefined,
          },
        },
      },
      extra: {},
    });

    await workflow.execute(mockRequest)({
      id: 'issue-assessment-id-1',
      orgKey: 'acme corp',
      userId: 'roadrunner',
      data: {
        Id: 'issue-assessment-id-1',
        OriginalTimestamp: '2021-01-01T00:00:00Z',
        Status: IssueAssessmentStatusEnum.Closed,
        ParentIssueId: 'parent-issue-id-1',
        TagTypeIds: [],
        tags: [],
        DepartmentTypeIds: [],
        departments: [],
        ParentIds: [],
        parents: [],
      },
    });

    expect(createChangeRequestMock).toHaveBeenCalledWith(
      mockChangeRequest,
      'update'
    );
  });

  it('updates a change request when required', async () => {
    const actionParams = {
      id: 'change-request-id-1',
      orgKey: 'acme corp',
      userId: 'roadrunner',
      data: undefined,
    };
    checkWorkflowMock.mockResolvedValue({
      result: 'amend-change-request',
      data: {
        userId: 'roadrunner',
        changes: actionParams,
        changeRequest: {
          Id: 'change-request-id-1',
          ParentId: 'issue-assessment-id-1',
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
          OrgKey: 'acme corp',
          CreatedAtTimestamp: '2021-09-01T00:00:00Z',
          RequestedChanges: {},
          responses: [],
          CreatedByUser: 'roadrunner',
          ActionUserId: 'roadrunner',
          Comment: '',
        },
        approvalConfig: workflow.config,
      },
      extra: {},
    });

    await workflow.execute(mockRequest)({
      id: 'issue-assessment-id-1',
      orgKey: 'acme corp',
      userId: 'roadrunner',
      data: {
        Id: 'issue-assessment-id-1',
        OriginalTimestamp: '2021-01-01T00:00:00Z',
        Status: IssueAssessmentStatusEnum.Closed,
        ParentIssueId: 'parent-issue-id-1',
        TagTypeIds: [],
        tags: [],
        DepartmentTypeIds: [],
        departments: [],
        ParentIds: [],
        parents: [],
      },
    });

    expect(updateChangeRequestMock).toHaveBeenCalledWith(
      {
        Id: 'change-request-id-1',
        ParentId: 'issue-assessment-id-1',
        ChangeRequestStatus: ApprovalStatusEnum.Pending,
        OrgKey: 'acme corp',
        CreatedAtTimestamp: '2021-09-01T00:00:00Z',
        RequestedChanges: {},
        responses: [],
        CreatedByUser: 'roadrunner',
        Comment: '',
        ActionUserId: 'roadrunner',
      },
      'roadrunner',
      actionParams
    );
  });

  it('deletes change request when no active level and triggers the requested action', async () => {
    checkWorkflowMock.mockResolvedValue({
      result: 'success',
      data: { id: '1', userId: '2', orgKey: '3', data: undefined },
      extra: {
        deleteChangeRequestId: 'change-request-id-1',
      },
    });

    await workflows['close-issue-assessment']('tenant').execute(mockRequest)({
      id: 'issue-assessment-id-1',
      orgKey: 'acme corp',
      userId: 'roadrunner',
      data: {
        Id: 'issue-assessment-id-1',
        OriginalTimestamp: '2021-01-01T00:00:00Z',
        Status: IssueAssessmentStatusEnum.Closed,
        ParentIssueId: 'parent-issue-id-1',
        TagTypeIds: [],
        tags: [],
        DepartmentTypeIds: [],
        departments: [],
        ParentIds: [],
        parents: [],
      },
    });

    expect(deleteChangeRequestMock).toHaveBeenCalledWith('change-request-id-1');
    expect(updateIssueAssessmentMock).toHaveBeenCalledWith(
      'issue-assessment-id-1',
      'roadrunner',
      {
        DepartmentTypeIds: [],
        Id: 'issue-assessment-id-1',
        OriginalTimestamp: '2021-01-01T00:00:00Z',
        ParentIds: [],
        ParentIssueId: 'parent-issue-id-1',
        Status: 'closed',
        TagTypeIds: [],
        departments: [],
        parents: [],
        tags: [],
      }
    );
  });
});
