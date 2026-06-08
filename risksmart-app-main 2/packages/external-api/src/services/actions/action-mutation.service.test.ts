import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IMutationClient } from '../../clients/mutation-client.interface';
import {
  ActionMutationError,
  ActionNotFoundError,
  ActionValidationError,
} from '../../errors/action.errors';
import { UserValidationError } from '../../errors/user.errors';
import type {
  DeleteActionsMutation,
  InsertChildActionMutation,
  UpdateActionMutation,
} from '../../generated/graphql';
import type {
  CreateActionRequest,
  UpdateActionRequest,
} from '../../schemas/actions/action-mutate-request.schema';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type { SchemaService } from '../common/schema.service';
import type { IssuesService } from '../issues/issues.service';
import type { UsersService } from '../users/users.service';
import { actionMutationService } from './action-mutation.service';
import type { ActionsService } from './actions.service';

const mockActionId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockIssueId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const mockCreateActionInput: CreateActionRequest = {
  title: 'Test Action',
  status: ActionStatus.Open,
  dateRaised: '2024-01-10T00:00:00Z',
  dateDue: '2024-03-10T00:00:00Z',
  description: 'A test action',
  priority: 2,
  closedDate: null,
  owners: ['provider|user-1'],
  parentId: null,
};

const mockCreateActionInputWithParent: CreateActionRequest = {
  ...mockCreateActionInput,
  parentId: mockIssueId,
};

const mockUpdateActionInput: UpdateActionRequest = {
  title: 'Updated Action',
  status: ActionStatus.Pending,
  dateRaised: '2024-02-10T00:00:00Z',
  dateDue: '2024-04-10T00:00:00Z',
  description: 'An updated action',
  priority: 1,
  closedDate: null,
  owners: ['provider|user-2'],
};

const mockContext: MutateServiceContext = {
  orgId: 'org-123',
  tenantId: 'tenant-456',
  authToken: 'mock-auth-token',
};

const mockMutCtx = { orgId: 'org-123', tenantId: 'tenant-456' };

type GetActionByIdResult = NonNullable<
  Awaited<ReturnType<ActionsService['getActionById']>>
>;

const mockExistingAction = {
  data: {
    Id: mockActionId,
    Title: 'Existing Action',
    ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
    CreatedAtTimestamp: '2023-12-01T00:00:00Z',
    ClosedDate: null,
    Description: null,
  },
  form_configuration: null,
} as unknown as GetActionByIdResult;

const mockExistingActionNullModified = {
  data: {
    Id: mockActionId,
    Title: 'Existing Action',
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: '2023-12-01T00:00:00Z',
  },
  form_configuration: null,
} as unknown as GetActionByIdResult;

const mockExistingActionBothTimestampsNull = {
  data: {
    Id: mockActionId,
    Title: 'Existing Action',
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: null,
  },
  form_configuration: null,
} as unknown as GetActionByIdResult;

type GetIssueByIdResult = NonNullable<
  Awaited<ReturnType<IssuesService['getIssueById']>>
>;

const mockExistingIssue = {
  data: { Id: mockIssueId },
  form_configuration: null,
} as unknown as GetIssueByIdResult;

const insertActionSuccessResponse = {
  data: {
    insertChildAction: { Id: mockActionId },
  } as InsertChildActionMutation,
  errors: undefined,
};

const updateActionSuccessResponse = {
  data: {
    updateChildAction: { affected_rows: 1, change_request_id: null },
  } as UpdateActionMutation,
  errors: undefined,
};

const deleteActionSuccessResponse = {
  data: {
    deleteActionsById: { affected_rows: 1 },
  } as DeleteActionsMutation,
  errors: undefined,
};

describe('actionMutationService', () => {
  let mockMutationClient: IMutationClient;
  let mockActionsService: ActionsService;
  let mockIssuesService: IssuesService;
  let mockUsersService: UsersService;
  let mockSchemaService: SchemaService;
  let service: ReturnType<typeof actionMutationService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutationClient = {
      insertAction: vi.fn(),
      updateAction: vi.fn(),
      deleteActions: vi.fn(),
    } as unknown as IMutationClient;

    mockActionsService = {
      getActionById: vi.fn(),
    } as unknown as ActionsService;

    mockIssuesService = {
      getIssueById: vi.fn(),
    } as unknown as IssuesService;

    mockUsersService = {
      getUserById: vi.fn(),
      validateUserIds: vi.fn(),
    } as unknown as UsersService;

    vi.mocked(mockUsersService.validateUserIds).mockResolvedValue([
      'provider|user-1',
    ]);

    mockSchemaService = {
      getResourceSchema: vi.fn().mockResolvedValue([]),
      validateAndTransformCustomFields: vi.fn().mockResolvedValue(null),
      resolveUpdateCustomAttributeData: vi.fn().mockResolvedValue(null),
    } as unknown as SchemaService;

    service = actionMutationService({
      mutationClient: mockMutationClient,
      actionsService: mockActionsService,
      issuesService: mockIssuesService,
      usersService: mockUsersService,
      schemaService: mockSchemaService,
    });
  });

  describe('createAction', () => {
    it('should create action without parentId successfully', async () => {
      vi.mocked(mockMutationClient.insertAction).mockResolvedValue(
        insertActionSuccessResponse
      );

      const result = await service.createAction({
        item: mockCreateActionInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockActionId } });
      expect(mockMutationClient.insertAction).toHaveBeenCalledExactlyOnceWith(
        { ...mockCreateActionInput, customAttributeData: null },
        mockMutCtx
      );
    });

    it('should validate parent when parentId is provided', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.insertAction).mockResolvedValue(
        insertActionSuccessResponse
      );

      const result = await service.createAction({
        item: mockCreateActionInputWithParent,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockActionId } });
      expect(mockIssuesService.getIssueById).toHaveBeenCalledExactlyOnceWith(
        mockIssueId,
        mockContext
      );
    });

    it('should throw ActionValidationError when parentId is invalid', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.createAction({
          item: mockCreateActionInputWithParent,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionValidationError);

      await expect(
        service.createAction({
          item: mockCreateActionInputWithParent,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Parent with ID ${mockIssueId} not found`);
    });

    it('should not call mutation when parentId is invalid', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.createAction({
          item: mockCreateActionInputWithParent,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.insertAction).not.toHaveBeenCalled();
    });

    it('should throw ActionMutationError when no ID returned', async () => {
      vi.mocked(mockMutationClient.insertAction).mockResolvedValue({
        data: {
          insertChildAction: null,
        } as unknown as InsertChildActionMutation,
        errors: undefined,
      });

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow(ActionMutationError);

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create action: no ID returned');
    });

    it('should propagate UserValidationError when owner is not found', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow('Owner users with IDs provider|user-1 not found');
    });

    it('should throw ActionValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.insertAction).mockResolvedValue({
        data: null,
        errors: [{ message: 'Constraint violation' }],
      });

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow(ActionValidationError);

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create action: Constraint violation');
    });

    it('should propagate network errors from mutation client', async () => {
      vi.mocked(mockMutationClient.insertAction).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createAction({ item: mockCreateActionInput, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateAction', () => {
    it('should update action successfully', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingAction
      );
      vi.mocked(mockMutationClient.updateAction).mockResolvedValue(
        updateActionSuccessResponse
      );

      const result = await service.updateAction({
        itemIds: { id: mockActionId },
        item: mockUpdateActionInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockActionId } });
      expect(mockMutationClient.updateAction).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateActionInput,
          id: mockActionId,
          originalTimestamp: '2024-01-01T00:00:00Z',
          customAttributeData: null,
          existingOwnership: {
            ownerGroupIds: [],
            contributorUserIds: [],
            contributorGroupIds: [],
            tagTypeIds: [],
            departmentTypeIds: [],
          },
        },
        mockMutCtx
      );
    });

    it('should throw ActionValidationError when id is empty', async () => {
      await expect(
        service.updateAction({
          itemIds: { id: '' },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionValidationError);

      await expect(
        service.updateAction({
          itemIds: { id: '' },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Missing Action ID');
    });

    it('should throw ActionNotFoundError when action does not exist', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(null);

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionNotFoundError);

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Action with ID ${mockActionId} not found`);
    });

    it('should fall back to CreatedAtTimestamp when ModifiedAtTimestamp is null', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingActionNullModified
      );
      vi.mocked(mockMutationClient.updateAction).mockResolvedValue(
        updateActionSuccessResponse
      );

      await service.updateAction({
        itemIds: { id: mockActionId },
        item: mockUpdateActionInput,
        ctx: mockContext,
      });

      expect(mockMutationClient.updateAction).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateActionInput,
          id: mockActionId,
          originalTimestamp: '2023-12-01T00:00:00Z',
          customAttributeData: null,
          existingOwnership: {
            ownerGroupIds: [],
            contributorUserIds: [],
            contributorGroupIds: [],
            tagTypeIds: [],
            departmentTypeIds: [],
          },
        },
        mockMutCtx
      );
    });

    it('should throw ActionMutationError when both timestamps are null', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingActionBothTimestampsNull
      );

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionMutationError);

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        `Failed to update action: missing original timestamp for action ID ${mockActionId}`
      );
    });

    it('should propagate UserValidationError when owner validation fails', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingAction
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(UserValidationError);
    });

    it('should throw ActionValidationError when mutation returns errors', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingAction
      );
      vi.mocked(mockMutationClient.updateAction).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionValidationError);

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update action: Title must be unique');
    });

    it('should throw ActionNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingAction
      );
      vi.mocked(mockMutationClient.updateAction).mockResolvedValue({
        data: {
          updateChildAction: { affected_rows: 0 },
        } as UpdateActionMutation,
        errors: undefined,
      });

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(ActionNotFoundError);
    });

    it('should propagate network errors from mutation client', async () => {
      vi.mocked(mockActionsService.getActionById).mockResolvedValue(
        mockExistingAction
      );
      vi.mocked(mockMutationClient.updateAction).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateAction({
          itemIds: { id: mockActionId },
          item: mockUpdateActionInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('deleteAction', () => {
    it('should delete action successfully', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockResolvedValue(
        deleteActionSuccessResponse
      );

      const result = await service.deleteAction({
        id: mockActionId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockActionId } });
      expect(mockMutationClient.deleteActions).toHaveBeenCalledExactlyOnceWith(
        { ids: [mockActionId] },
        mockMutCtx
      );
    });

    it('should throw ActionValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockResolvedValue({
        data: null,
        errors: [{ message: 'Permission denied' }],
      });

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow(ActionValidationError);

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete action: Permission denied');
    });

    it('should throw ActionNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockResolvedValue({
        data: {
          deleteActionsById: { affected_rows: 0 },
        } as DeleteActionsMutation,
        errors: undefined,
      });

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow(ActionNotFoundError);

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow(`Action with ID ${mockActionId} not found`);
    });

    it('should throw ActionNotFoundError when data is null', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow(ActionNotFoundError);
    });

    it('should throw ActionNotFoundError when data is undefined', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow(ActionNotFoundError);
    });

    it('should propagate network errors from mutation client', async () => {
      vi.mocked(mockMutationClient.deleteActions).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.deleteAction({ id: mockActionId, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });
  });
});
