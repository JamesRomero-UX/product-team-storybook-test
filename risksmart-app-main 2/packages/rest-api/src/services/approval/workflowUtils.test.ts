import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';
import { Unauthorized } from 'http-errors';
import { it, vi } from 'vitest';

import { ApprovalInFlightEditRuleEnum } from '../../../generated/graphql';
import type { ActionInput } from '../../hasuraActionHelpers';
import { stub } from '../../testing/stub';
import { ChangeRequestService } from '../change-request/change-request.service';
import { NodeService } from '../node/node.service';
import { ApprovalService } from './approval.service';
import { checkWorkflow } from './workflowUtils';

vi.mock('../change-request/change-request.service');
vi.mock('./approval.service');
vi.mock('../node/node.service');
const mockedChangeRequestService = vi.mocked(ChangeRequestService);
const mockedApprovalService = vi.mocked(ApprovalService);
const mockedNodeService = vi.mocked(NodeService);

const changeRequestRequiredError =
  'You need to create a change request to perform this action.' as const;

const mockChangeRequestService = {
  findActiveChangeRequest: vi.fn(),
  amendChanges: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  getActiveLevelId: vi.fn(),
  getWorkflow: vi.fn(),
  updateStatus: vi.fn(),
  merge: vi.fn(),
  findContributors: vi.fn(),
};

const mockApprovalService = {
  enabledForOrg: vi.fn(),
  findLevelsForObject: vi.fn(),
  findApproversForParentApprovalObject: vi.fn(),
};

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const tenant = 'tenant1';
const request = stub<ActionInput<unknown>>({
  session_variables: {
    'x-hasura-org-id': 'org1',
    'x-hasura-user-id': 'user1',
  },
  event: {
    headers: {},
  },
});

const config = {
  approvalParentId: vi.fn(),
  approvalCheck: vi.fn(),
};
const workflow: WorkflowId = 'publish-document-version';
const type = 'create';

const args = { id: 'object1', orgKey: '', userId: '', data: '' };

describe('checkWorkflow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedChangeRequestService.mockReturnValue(mockChangeRequestService);
    mockedApprovalService.mockReturnValue(mockApprovalService);
    mockedNodeService.mockReturnValue(mockNodeService);
    request.event.headers['x-confirm-change-request'] = undefined;
    request.event.headers['x-requester-comment'] = undefined;
  });

  it('should throw Unauthorized if existing change request and user cannot edit', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
        approval: { InFlightEditRule: ApprovalInFlightEditRuleEnum.Approvers },
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue({
      Id: 'change1',
    });
    mockChangeRequestService.getActiveLevelId.mockReturnValue('level1');

    await expect(
      checkWorkflow({
        tenant,
        request,
        config,
        workflow,
        type,
        actionParams: args,
      })
    ).rejects.toThrow(Unauthorized);
  });

  it('should return amend-change-request if user can edit existing change request', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user1' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user1' }],
        approval: { InFlightEditRule: ApprovalInFlightEditRuleEnum.Approvers },
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue({
      Id: 'change1',
    });
    mockChangeRequestService.getActiveLevelId.mockReturnValue('level1');

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result).toEqual({
      result: 'amend-change-request',
      data: {
        userId: 'user1',
        changeRequest: { Id: 'change1' },
        changes: args,
        approvalConfig: config,
      },
      extra: {},
    });
  });

  it('should return amend-change-request if user can edit existing change request via a group', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user1' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ group: { users: [{ UserId: 'user1' }] } }],
        approval: { InFlightEditRule: ApprovalInFlightEditRuleEnum.Approvers },
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue({
      Id: 'change1',
    });
    mockChangeRequestService.getActiveLevelId.mockReturnValue('level1');

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result).toEqual({
      result: 'amend-change-request',
      data: {
        userId: 'user1',
        changeRequest: { Id: 'change1' },
        changes: args,
        approvalConfig: config,
      },
      extra: {},
    });
  });

  it('should return change-request-required if confirmation is required', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = 'true';

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result).toEqual({
      result: 'change-request-required',
      data: {
        data: {
          workflow,
          approvalParentId: 'parent1',
          objectId: 'object1',
          changes: args,
          requesterComment: undefined,
        },
        type,
        config,
      },
      extra: {},
    });
  });

  it('should decode requester comment header and include in change-request-required result', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = 'true';
    request.event.headers['x-requester-comment'] = encodeURIComponent(
      'Updating risk after Q1 review'
    );

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result).toEqual({
      result: 'change-request-required',
      data: {
        data: {
          workflow,
          approvalParentId: 'parent1',
          objectId: 'object1',
          changes: args,
          requesterComment: 'Updating risk after Q1 review',
        },
        type,
        config,
      },
      extra: {},
    });
  });

  it('should return undefined requester comment when header is missing', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = 'true';

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result.result).toBe('change-request-required');
    if (result.result === 'change-request-required') {
      expect(result.data.data.requesterComment).toBeUndefined();
    }
  });

  it('should decode special characters in requester comment header correctly', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = 'true';
    const originalComment = 'Line 1\nLine 2 — "quoted" <brackets>';
    request.event.headers['x-requester-comment'] =
      encodeURIComponent(originalComment);

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result.result).toBe('change-request-required');
    if (result.result === 'change-request-required') {
      expect(result.data.data.requesterComment).toBe(originalComment);
    }
  });

  it('should return undefined requester comment when header is malformed', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = 'true';
    request.event.headers['x-requester-comment'] = '%E0%A4%';

    const result = await checkWorkflow({
      tenant,
      request,
      config,
      workflow,
      type,
      actionParams: args,
    });

    expect(result.result).toBe('change-request-required');
    if (result.result === 'change-request-required') {
      expect(result.data.data.requesterComment).toBeUndefined();
    }
  });

  it('should throw unauthorised if confirmation is required, but not given', async () => {
    config.approvalParentId.mockReturnValue(async () => 'parent1');
    config.approvalCheck.mockReturnValue(async () => true);
    mockNodeService.findObjectOwners.mockResolvedValue([{ UserId: 'user2' }]);
    mockApprovalService.findLevelsForObject.mockResolvedValue([
      {
        Id: 'level1',
        approvers: [{ UserId: 'user2' }],
      },
    ]);
    mockChangeRequestService.findActiveChangeRequest.mockResolvedValue(null);
    request.event.headers['x-confirm-change-request'] = undefined;

    await expect(
      checkWorkflow({
        tenant,
        request,
        config,
        workflow,
        type,
        actionParams: args,
      })
    ).rejects.toThrow(changeRequestRequiredError);
  });
});
