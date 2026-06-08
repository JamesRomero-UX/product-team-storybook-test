import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IMutationClient } from '../../clients/mutation-client.interface';
import {
  IssueMutationError,
  IssueNotFoundError,
  IssueValidationError,
} from '../../errors/issue.errors';
import {
  IssueAssessmentMutationError,
  IssueAssessmentValidationError,
} from '../../errors/issue-assessment.errors';
import { UserValidationError } from '../../errors/user.errors';
import type {
  DeleteIssuesMutation,
  InsertIssueAssessmentMutation,
  InsertIssueMutation,
  UpdateIssueAssessmentMutation,
  UpdateIssueMutation,
} from '../../generated/graphql';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../../schemas/issues/issue-assessment-mutate-request.schema';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../../schemas/issues/issue-mutate-request.schema';
import type { SchemaService } from '../common/schema.service';
import type { UsersService } from '../users/users.service';
import { issueMutationService } from './issue-mutation.service';
import type { IssuesService } from './issues.service';

const mockIssueId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockAssessmentId = 'aabbccdd-0000-1111-2222-333344445555';

const mockCreateIssueInput: CreateIssueRequest = {
  title: 'Test Issue',
  description: 'A test issue',
  dateIdentified: '2024-01-15T00:00:00Z',
  dateOccurred: '2024-01-10T00:00:00Z',
  impactsCustomer: true,
  isExternalIssue: false,
  owners: ['provider|user-1'],
};

const mockUpdateIssueInput: UpdateIssueRequest = {
  title: 'Updated Issue',
  description: 'An updated issue',
  dateIdentified: '2024-02-15T00:00:00Z',
  dateOccurred: '2024-02-10T00:00:00Z',
  impactsCustomer: false,
  isExternalIssue: true,
  owners: ['provider|user-2'],
};

const mockContext: MutateServiceContext = {
  orgId: 'org-123',
  tenantId: 'tenant-456',
  authToken: 'mock-auth-token',
};

const mockMutCtx = { orgId: 'org-123', tenantId: 'tenant-456' };

type GetIssueByIdResult = NonNullable<
  Awaited<ReturnType<IssuesService['getIssueById']>>
>;

const mockExistingIssue = {
  data: {
    Id: mockIssueId,
    Title: 'Existing Issue',
    ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
    CreatedAtTimestamp: '2023-12-01T00:00:00Z',
  },
  form_configuration: null,
} as GetIssueByIdResult;

const mockExistingIssueNullModified = {
  data: {
    Id: mockIssueId,
    Title: 'Existing Issue',
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: '2023-12-01T00:00:00Z',
  },
  form_configuration: null,
} as unknown as GetIssueByIdResult;

const mockExistingIssueBothTimestampsNull = {
  data: {
    Id: mockIssueId,
    Title: 'Existing Issue',
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: null,
  },
  form_configuration: null,
} as unknown as GetIssueByIdResult;

type GetIssueAssessmentResult = NonNullable<
  Awaited<ReturnType<IssuesService['getIssueAssessment']>>
>;

const nullAssessmentDbFields = {
  IssueType: null,
  Severity: null,
  TargetCloseDate: null,
  ActualCloseDate: null,
  CertifiedIndividual: null,
  RegulatoryBreach: null,
  RegulationsBreached: null,
  Reportable: null,
  Rationale: null,
  IssueCausedByThirdParty: null,
  ThirdPartyResponsible: null,
  IssueCausedBySystemIssue: null,
  SystemResponsible: null,
  PolicyBreach: null,
  PoliciesBreached: null,
  PolicyOwner: null,
  PolicyOwnerCommentary: null,
};

const mockExistingAssessment = {
  data: {
    Id: mockAssessmentId,
    ModifiedAtTimestamp: '2024-02-01T00:00:00Z',
    CreatedAtTimestamp: '2024-01-01T00:00:00Z',
    ...nullAssessmentDbFields,
  },
  form_configuration: null,
} as unknown as GetIssueAssessmentResult;

const mockExistingAssessmentNullModified = {
  data: {
    Id: mockAssessmentId,
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: '2024-01-01T00:00:00Z',
    ...nullAssessmentDbFields,
  },
  form_configuration: null,
} as unknown as GetIssueAssessmentResult;

const mockExistingAssessmentBothTimestampsNull = {
  data: {
    Id: mockAssessmentId,
    ModifiedAtTimestamp: null,
    CreatedAtTimestamp: null,
    ...nullAssessmentDbFields,
  },
  form_configuration: null,
} as unknown as GetIssueAssessmentResult;

type GetUserByIdResult = NonNullable<
  Awaited<ReturnType<UsersService['getUserById']>>
>;

const mockUser = {
  data: { Id: 'provider|user-1' },
  form_configuration: null,
} as GetUserByIdResult;

const insertSuccessResponse = {
  data: {
    insertChildIssue: { Id: mockIssueId, SequentialId: 1 },
  } as InsertIssueMutation,
  errors: undefined,
};

const updateSuccessResponse = {
  data: {
    updateIssueApi: { affected_rows: 1 },
  } as UpdateIssueMutation,
  errors: undefined,
};

const deleteSuccessResponse = {
  data: {
    deleteIssuesById: { affected_rows: 1 },
  } as DeleteIssuesMutation,
  errors: undefined,
};

describe('issueMutationService', () => {
  let mockMutationClient: IMutationClient;
  let mockIssuesService: IssuesService;
  let mockUsersService: UsersService;
  let mockSchemaService: SchemaService;
  let service: ReturnType<typeof issueMutationService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutationClient = {
      insertIssue: vi.fn(),
      updateIssue: vi.fn(),
      deleteIssue: vi.fn(),
      insertIssueAssessment: vi.fn(),
      updateIssueAssessment: vi.fn(),
    } as unknown as IMutationClient;

    mockIssuesService = {
      getIssueById: vi.fn(),
      getIssueAssessment: vi.fn(),
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

    service = issueMutationService({
      mutationClient: mockMutationClient,
      issuesService: mockIssuesService,
      usersService: mockUsersService,
      schemaService: mockSchemaService,
    });
  });

  describe('createIssue', () => {
    it('should call insertIssue with request data and context', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue(
        insertSuccessResponse
      );

      await service.createIssue({
        item: mockCreateIssueInput,
        ctx: mockContext,
      });

      expect(mockMutationClient.insertIssue).toHaveBeenCalledExactlyOnceWith(
        { ...mockCreateIssueInput, type: 'issue', customAttributeData: null },
        mockMutCtx
      );
    });

    it('should return the created issue id on success', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue(
        insertSuccessResponse
      );

      const result = await service.createIssue({
        item: mockCreateIssueInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIssueId } });
    });

    it('should throw IssueValidationError when mutation returns errors', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(IssueValidationError);

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create issue: Title must be unique');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create issue: First error');
    });

    it('should throw IssueMutationError when insertChildIssue is null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: {
          insertChildIssue: null,
        } as unknown as InsertIssueMutation,
        errors: undefined,
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(IssueMutationError);

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create issue: no ID returned');
    });

    it('should throw IssueMutationError when data is null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(IssueMutationError);

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create issue: no ID returned');
    });

    it('should throw IssueMutationError when data is undefined', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(IssueMutationError);
    });

    it('should prioritise validation errors over missing ID', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(IssueValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockMutationClient.insertIssue).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });

    it('should propagate UserValidationError when owner is not found', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow('Owner users with IDs provider|user-1 not found');
    });

    it('should not call mutation client when owner validation fails', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createIssue({ item: mockCreateIssueInput, ctx: mockContext })
      ).rejects.toThrow();

      expect(mockMutationClient.insertIssue).not.toHaveBeenCalled();
    });
  });

  describe('updateIssue', () => {
    it('should call updateIssue with request data including id, originalTimestamp and context', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIssue({
        itemIds: { id: mockIssueId },
        item: mockUpdateIssueInput,
        ctx: mockContext,
      });

      expect(mockMutationClient.updateIssue).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateIssueInput,
          id: mockIssueId,
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

    it('should verify the issue exists before calling mutation', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIssue({
        itemIds: { id: mockIssueId },
        item: mockUpdateIssueInput,
        ctx: mockContext,
      });

      expect(mockIssuesService.getIssueById).toHaveBeenCalledExactlyOnceWith(
        mockIssueId,
        mockContext
      );
    });

    it('should return the updated issue id on success', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue(
        updateSuccessResponse
      );

      const result = await service.updateIssue({
        itemIds: { id: mockIssueId },
        item: mockUpdateIssueInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIssueId } });
    });

    it('should throw IssueValidationError when id is empty', async () => {
      await expect(
        service.updateIssue({
          itemIds: { id: '' },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueValidationError);

      await expect(
        service.updateIssue({
          itemIds: { id: '' },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Missing Issue ID');
    });

    it('should not call mutation client when id is empty', async () => {
      await expect(
        service.updateIssue({
          itemIds: { id: '' },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIssue).not.toHaveBeenCalled();
      expect(mockIssuesService.getIssueById).not.toHaveBeenCalled();
    });

    it('should throw IssueNotFoundError when issue does not exist', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Issue with ID ${mockIssueId} not found`);
    });

    it('should not call mutation client when issue does not exist', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIssue).not.toHaveBeenCalled();
    });

    it('should throw IssueValidationError when mutation returns errors', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueValidationError);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update issue: Title must be unique');
    });

    it('should throw IssueNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue({
        data: {
          updateIssueApi: { affected_rows: 0 },
        } as UpdateIssueMutation,
        errors: undefined,
      });

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Issue with ID ${mockIssueId} not found`);
    });

    it('should throw IssueNotFoundError when data is null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockMutationClient.updateIssue).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });

    it('should propagate errors thrown by getIssueById', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockRejectedValue(
        new Error('Service unavailable')
      );

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Service unavailable');
    });

    it('should propagate UserValidationError when owner validation fails', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Owner users with IDs provider|user-2 not found');
    });

    it('should fall back to CreatedAtTimestamp when ModifiedAtTimestamp is null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssueNullModified
      );
      vi.mocked(mockMutationClient.updateIssue).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIssue({
        itemIds: { id: mockIssueId },
        item: mockUpdateIssueInput,
        ctx: mockContext,
      });

      expect(mockMutationClient.updateIssue).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateIssueInput,
          id: mockIssueId,
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

    it('should throw IssueMutationError when both timestamps are null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssueBothTimestampsNull
      );

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueMutationError);

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        `Failed to update issue: missing original timestamp for issue ID ${mockIssueId}`
      );
    });

    it('should not call mutation client when both timestamps are null', async () => {
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(mockUser);
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssueBothTimestampsNull
      );

      await expect(
        service.updateIssue({
          itemIds: { id: mockIssueId },
          item: mockUpdateIssueInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIssue).not.toHaveBeenCalled();
    });
  });

  describe('deleteIssue', () => {
    it('should call deleteIssue with ids and context', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue(
        deleteSuccessResponse
      );

      await service.deleteIssue({ id: mockIssueId, ctx: mockContext });

      expect(mockMutationClient.deleteIssue).toHaveBeenCalledExactlyOnceWith(
        { ids: [mockIssueId] },
        mockMutCtx
      );
    });

    it('should return the deleted issue id on success', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue(
        deleteSuccessResponse
      );

      const result = await service.deleteIssue({
        id: mockIssueId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIssueId } });
    });

    it('should throw IssueValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'Permission denied' }],
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(IssueValidationError);

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete issue: Permission denied');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete issue: First error');
    });

    it('should throw IssueNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: {
          deleteIssuesById: { affected_rows: 0 },
        } as DeleteIssuesMutation,
        errors: undefined,
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(`Issue with ID ${mockIssueId} not found`);
    });

    it('should throw IssueNotFoundError when data is null', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(IssueNotFoundError);
    });

    it('should throw IssueNotFoundError when data is undefined', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(IssueNotFoundError);
    });

    it('should prioritise validation errors over zero affected rows', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockResolvedValue({
        data: {
          deleteIssuesById: { affected_rows: 0 },
        } as DeleteIssuesMutation,
        errors: [{ message: 'Constraint violation' }],
      });

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow(IssueValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockMutationClient.deleteIssue).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.deleteIssue({ id: mockIssueId, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });
  });

  describe('createIssueAssessment', () => {
    const mockCreateAssessmentInput: CreateIssueAssessmentRequest = {
      issueType: 'near-miss',
      severity: 3,
      status: 'open',
      regulatoryBreach: false,
      reportable: false,
      issueCausedByThirdParty: false,
      issueCausedBySystemIssue: false,
      policyBreach: false,
    };

    const insertAssessmentSuccessResponse = {
      data: {
        insertChildIssueAssessment: { Id: mockAssessmentId },
      } as InsertIssueAssessmentMutation,
      errors: undefined,
    };

    it('should call insertIssueAssessment with request data and context', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIssueAssessment).mockResolvedValue(
        insertAssessmentSuccessResponse
      );

      await service.createIssueAssessment({
        item: mockCreateAssessmentInput,
        issueId: mockIssueId,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.insertIssueAssessment
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockCreateAssessmentInput,
          parentIssueId: mockIssueId,
          customAttributeData: null,
        },
        mockMutCtx
      );
    });

    it('should return the created assessment id on success', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIssueAssessment).mockResolvedValue(
        insertAssessmentSuccessResponse
      );

      const result = await service.createIssueAssessment({
        item: mockCreateAssessmentInput,
        issueId: mockIssueId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockAssessmentId } });
    });

    it('should throw IssueNotFoundError when issue does not exist', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Issue with ID ${mockIssueId} not found`);
    });

    it('should throw IssueAssessmentValidationError when assessment already exists', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('An assessment already exists for this issue');
    });

    it('should throw IssueAssessmentValidationError when certifiedIndividual is not found', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(null);

      await expect(
        service.createIssueAssessment({
          item: {
            ...mockCreateAssessmentInput,
            certifiedIndividual: 'provider|user-1',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);

      await expect(
        service.createIssueAssessment({
          item: {
            ...mockCreateAssessmentInput,
            certifiedIndividual: 'provider|user-1',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        'certifiedIndividual with ID provider|user-1 not found'
      );
    });

    it('should throw IssueAssessmentValidationError when policyOwner is not found', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(null);

      await expect(
        service.createIssueAssessment({
          item: {
            ...mockCreateAssessmentInput,
            policyOwner: 'provider|user-2',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);

      await expect(
        service.createIssueAssessment({
          item: {
            ...mockCreateAssessmentInput,
            policyOwner: 'provider|user-2',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('policyOwner with ID provider|user-2 not found');
    });

    it('should throw IssueAssessmentValidationError when mutation returns errors', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIssueAssessment).mockResolvedValue({
        data: null,
        errors: [{ message: 'Constraint violation' }],
      });

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        'Failed to create issue assessment: Constraint violation'
      );
    });

    it('should throw IssueAssessmentMutationError when no ID returned', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIssueAssessment).mockResolvedValue({
        data: {
          insertChildIssueAssessment: null,
        } as unknown as InsertIssueAssessmentMutation,
        errors: undefined,
      });

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentMutationError);

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to create issue assessment: no ID returned');
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIssueAssessment).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createIssueAssessment({
          item: mockCreateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('updateIssueAssessment', () => {
    const mockUpdateAssessmentInput: UpdateIssueAssessmentRequest = {
      issueType: 'compliance-finding',
      severity: 4,
      status: 'closed',
    };

    const mergedNullAssessmentFields = {
      targetCloseDate: null,
      actualCloseDate: null,
      certifiedIndividual: null,
      regulatoryBreach: null,
      regulationsBreached: null,
      reportable: null,
      rationale: null,
      issueCausedByThirdParty: null,
      thirdPartyResponsible: null,
      issueCausedBySystemIssue: null,
      systemResponsible: null,
      policyBreach: null,
      policiesBreached: null,
      policyOwner: null,
      policyOwnerCommentary: null,
    };

    const updateAssessmentSuccessResponse = {
      data: {
        updateChildIssueAssessment: { Id: mockAssessmentId },
      } as UpdateIssueAssessmentMutation,
      errors: undefined,
    };

    it('should call updateIssueAssessment with request data, assessmentId, originalTimestamp and context', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockResolvedValue(
        updateAssessmentSuccessResponse
      );

      await service.updateIssueAssessment({
        item: mockUpdateAssessmentInput,
        issueId: mockIssueId,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.updateIssueAssessment
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateAssessmentInput,
          ...mergedNullAssessmentFields,
          id: mockAssessmentId,
          originalTimestamp: '2024-02-01T00:00:00Z',
          customAttributeData: null,
          existingDepartmentTypeIds: [],
        },
        mockMutCtx
      );
    });

    it('should return the assessment id on success', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockResolvedValue(
        updateAssessmentSuccessResponse
      );

      const result = await service.updateIssueAssessment({
        item: mockUpdateAssessmentInput,
        issueId: mockIssueId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockAssessmentId } });
    });

    it('should throw IssueNotFoundError when issue does not exist', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(null);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Issue with ID ${mockIssueId} not found`);
    });

    it('should throw IssueNotFoundError when assessment does not exist', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(null);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueNotFoundError);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        `Issue assessment for issue ID ${mockIssueId} not found`
      );
    });

    it('should fall back to CreatedAtTimestamp when ModifiedAtTimestamp is null', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessmentNullModified
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockResolvedValue(
        updateAssessmentSuccessResponse
      );

      await service.updateIssueAssessment({
        item: mockUpdateAssessmentInput,
        issueId: mockIssueId,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.updateIssueAssessment
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateAssessmentInput,
          ...mergedNullAssessmentFields,
          id: mockAssessmentId,
          originalTimestamp: '2024-01-01T00:00:00Z',
          customAttributeData: null,
          existingDepartmentTypeIds: [],
        },
        mockMutCtx
      );
    });

    it('should throw IssueAssessmentMutationError when both timestamps are null', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessmentBothTimestampsNull
      );

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentMutationError);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        `Failed to update issue assessment: missing original timestamp for issue ID ${mockIssueId}`
      );
    });

    it('should throw IssueAssessmentValidationError when certifiedIndividual is not found', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(null);

      await expect(
        service.updateIssueAssessment({
          item: {
            ...mockUpdateAssessmentInput,
            certifiedIndividual: 'provider|user-1',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);
    });

    it('should throw IssueAssessmentValidationError when policyOwner is not found', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockUsersService.getUserById).mockResolvedValue(null);

      await expect(
        service.updateIssueAssessment({
          item: {
            ...mockUpdateAssessmentInput,
            policyOwner: 'provider|user-2',
          },
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);
    });

    it('should throw IssueAssessmentValidationError when mutation returns errors', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockResolvedValue({
        data: null,
        errors: [{ message: 'Update failed' }],
      });

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentValidationError);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update issue assessment: Update failed');
    });

    it('should throw IssueAssessmentMutationError when no ID returned', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockResolvedValue({
        data: {
          updateChildIssueAssessment: null,
        } as unknown as UpdateIssueAssessmentMutation,
        errors: undefined,
      });

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IssueAssessmentMutationError);

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update issue assessment: no ID returned');
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIssuesService.getIssueById).mockResolvedValue(
        mockExistingIssue
      );
      vi.mocked(mockIssuesService.getIssueAssessment).mockResolvedValue(
        mockExistingAssessment
      );
      vi.mocked(mockMutationClient.updateIssueAssessment).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateIssueAssessment({
          item: mockUpdateAssessmentInput,
          issueId: mockIssueId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });
  });
});
