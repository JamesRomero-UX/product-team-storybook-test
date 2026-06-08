import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IMutationClient } from '../../clients/mutation-client.interface';
import {
  InvalidRiskTierError,
  RiskMutationError,
  RiskNotFoundError,
  RiskValidationError,
} from '../../errors/risk.errors';
import { UserValidationError } from '../../errors/user.errors';
import type {
  DeleteRiskMutation,
  InsertRiskMutation,
  UpdateRiskMutation,
} from '../../generated/graphql';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateRiskRequest,
  UpdateRiskRequest,
} from '../../schemas/risks/risk-mutate-request.schema';
import type { SchemaService } from '../common/schema.service';
import type { UsersService } from '../users/users.service';
import { riskMutationService } from './risk-mutation.service';
import type { RisksService } from './risks.service';

const mockRiskId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockParentRiskId = '4fa85f64-5717-4562-b3fc-2c963f66afa6';

const mockCreateRiskInput: CreateRiskRequest = {
  title: 'Test Risk',
  description: 'A test risk',
  treatment: RiskTreatmentType.Treat,
  status: RiskStatusType.Active,
  owners: ['provider|user-1'],
};

const mockUpdateRiskInput: UpdateRiskRequest = {
  title: 'Updated Risk',
  description: 'An updated risk',
  treatment: RiskTreatmentType.Tolerate,
  status: RiskStatusType.Active,
  owners: ['provider|user-2'],
};

const mockContext: MutateServiceContext = {
  orgId: 'org-123',
  tenantId: 'tenant-456',
  authToken: 'mock-auth-token',
};

const mockMutCtx = { orgId: 'org-123', tenantId: 'tenant-456' };

type GetRiskByIdResult = NonNullable<
  Awaited<ReturnType<RisksService['getRiskById']>>
>;

const mockExistingRisk = {
  data: {
    Id: mockRiskId,
    Title: 'Existing Risk',
    Tier: 1,
    Description: null,
    Status: null,
    ParentRiskId: null,
    schedule: null,
  },
  form_configuration: null,
} as unknown as GetRiskByIdResult;

const mockTier2ParentRisk = {
  data: { Id: mockParentRiskId, Title: 'Tier 2 Parent Risk', Tier: 2 },
  form_configuration: null,
} as GetRiskByIdResult;

const mockTier3ParentRisk = {
  data: { Id: mockParentRiskId, Title: 'Tier 3 Parent Risk', Tier: 3 },
  form_configuration: null,
} as GetRiskByIdResult;

const insertSuccessResponse = {
  data: {
    insertChildRisk: { Id: mockRiskId },
  } as InsertRiskMutation,
  errors: undefined,
};

const updateSuccessResponse = {
  data: {
    updateChildRisk: { Id: mockRiskId },
  } as UpdateRiskMutation,
  errors: undefined,
};

const deleteSuccessResponse = {
  data: {
    deleteRiskById: { affected_rows: 1 },
  } as DeleteRiskMutation,
  errors: undefined,
};

describe('riskMutationService', () => {
  let mockMutationClient: IMutationClient;
  let mockRisksService: RisksService;
  let mockUsersService: UsersService;
  let mockSchemaService: SchemaService;
  let service: ReturnType<typeof riskMutationService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutationClient = {
      insertRisk: vi.fn(),
      updateRisk: vi.fn(),
      deleteRisk: vi.fn(),
    } as unknown as IMutationClient;

    mockRisksService = {
      getRiskById: vi.fn(),
    } as unknown as RisksService;

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

    service = riskMutationService({
      mutationClient: mockMutationClient,
      risksService: mockRisksService,
      usersService: mockUsersService,
      schemaService: mockSchemaService,
    });
  });

  describe('createRisk', () => {
    describe('tier derivation', () => {
      it('should derive tier 1 when no parentRiskId is provided', async () => {
        vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
          insertSuccessResponse
        );

        await service.createRisk({
          item: mockCreateRiskInput,
          ctx: mockContext,
        });

        expect(mockMutationClient.insertRisk).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 1 }),
          mockMutCtx
        );
        expect(mockRisksService.getRiskById).not.toHaveBeenCalled();
      });

      it('should derive tier 2 when parent is tier 1', async () => {
        const inputWithParent: CreateRiskRequest = {
          ...mockCreateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
          mockExistingRisk
        );
        vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
          insertSuccessResponse
        );

        await service.createRisk({ item: inputWithParent, ctx: mockContext });

        expect(mockMutationClient.insertRisk).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 2 }),
          mockMutCtx
        );
      });

      it('should derive tier 3 when parent is tier 2', async () => {
        const inputWithParent: CreateRiskRequest = {
          ...mockCreateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
          mockTier2ParentRisk
        );
        vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
          insertSuccessResponse
        );

        await service.createRisk({ item: inputWithParent, ctx: mockContext });

        expect(mockMutationClient.insertRisk).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 3 }),
          mockMutCtx
        );
      });

      it('should throw InvalidRiskTierError when parent is tier 3', async () => {
        const inputWithParent: CreateRiskRequest = {
          ...mockCreateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
          mockTier3ParentRisk
        );

        await expect(
          service.createRisk({ item: inputWithParent, ctx: mockContext })
        ).rejects.toThrow(InvalidRiskTierError);

        await expect(
          service.createRisk({ item: inputWithParent, ctx: mockContext })
        ).rejects.toThrow(
          'Cannot assign a tier 3 risk as parent. Maximum tier depth is 3.'
        );

        expect(mockMutationClient.insertRisk).not.toHaveBeenCalled();
      });

      it('should throw RiskNotFoundError when parentRiskId does not exist', async () => {
        const inputWithParent: CreateRiskRequest = {
          ...mockCreateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);

        await expect(
          service.createRisk({ item: inputWithParent, ctx: mockContext })
        ).rejects.toThrow(RiskNotFoundError);

        expect(mockMutationClient.insertRisk).not.toHaveBeenCalled();
      });
    });

    it('should call insertRisk with request data and derived tier', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
        insertSuccessResponse
      );

      await service.createRisk({ item: mockCreateRiskInput, ctx: mockContext });

      expect(mockMutationClient.insertRisk).toHaveBeenCalledExactlyOnceWith(
        { ...mockCreateRiskInput, tier: 1, customAttributeData: null },
        mockMutCtx
      );
    });

    it('should return the created risk id on success', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
        insertSuccessResponse
      );

      const result = await service.createRisk({
        item: mockCreateRiskInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockRiskId } });
    });

    it('should throw RiskValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(RiskValidationError);

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create risk: Title must be unique');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create risk: First error');
    });

    it('should throw RiskMutationError when insertChildRisk is null', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: { insertChildRisk: null } as unknown as InsertRiskMutation,
        errors: undefined,
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(RiskMutationError);

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create risk: no ID returned');
    });

    it('should throw RiskMutationError when data is null', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(RiskMutationError);

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create risk: no ID returned');
    });

    it('should throw RiskMutationError when data is undefined', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(RiskMutationError);
    });

    it('should prioritise validation errors over missing ID', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(RiskValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });

    it('should call validateUserIds with the owner ids before creating risk', async () => {
      vi.mocked(mockMutationClient.insertRisk).mockResolvedValue(
        insertSuccessResponse
      );

      await service.createRisk({ item: mockCreateRiskInput, ctx: mockContext });

      expect(mockUsersService.validateUserIds).toHaveBeenCalledWith(
        mockCreateRiskInput.owners,
        mockContext
      );
    });

    it('should throw UserValidationError when owner does not exist', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Owner users with IDs provider|user-1 not found');
    });

    it('should not call mutation client when owner validation fails', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow();

      expect(mockMutationClient.insertRisk).not.toHaveBeenCalled();
    });

    it('should throw UserValidationError when one of multiple owners is not found', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-missing not found'
        )
      );

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('Owner users with IDs provider|user-missing not found');
    });

    it('should propagate errors thrown by usersService.validateUserIds', async () => {
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new Error('User service unavailable')
      );

      await expect(
        service.createRisk({ item: mockCreateRiskInput, ctx: mockContext })
      ).rejects.toThrow('User service unavailable');
    });
  });

  describe('updateRisk', () => {
    describe('tier derivation', () => {
      it('should derive tier 1 when no parentRiskId is provided', async () => {
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
          mockExistingRisk
        );
        vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
          updateSuccessResponse
        );

        await service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        });

        expect(mockMutationClient.updateRisk).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 1 }),
          mockMutCtx
        );
      });

      it('should derive tier 2 when parentRiskId points to a tier 1 risk', async () => {
        const inputWithParent: UpdateRiskRequest = {
          ...mockUpdateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockImplementation((id) => {
          if (id === mockRiskId) {
            return Promise.resolve(mockExistingRisk);
          }

          return Promise.resolve(mockExistingRisk); // parent is also tier 1
        });
        vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
          updateSuccessResponse
        );

        await service.updateRisk({
          itemIds: { id: mockRiskId },
          item: inputWithParent,
          ctx: mockContext,
        });

        expect(mockMutationClient.updateRisk).toHaveBeenCalledWith(
          expect.objectContaining({ tier: 2 }),
          mockMutCtx
        );
      });

      it('should throw InvalidRiskTierError when parent is tier 3', async () => {
        const inputWithParent: UpdateRiskRequest = {
          ...mockUpdateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockImplementation((id) => {
          if (id === mockRiskId) {
            return Promise.resolve(mockExistingRisk);
          }

          return Promise.resolve(mockTier3ParentRisk);
        });

        await expect(
          service.updateRisk({
            itemIds: { id: mockRiskId },
            item: inputWithParent,
            ctx: mockContext,
          })
        ).rejects.toThrow(InvalidRiskTierError);

        expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
      });

      it('should throw RiskNotFoundError when parentRiskId does not exist', async () => {
        const inputWithParent: UpdateRiskRequest = {
          ...mockUpdateRiskInput,
          parentRiskId: mockParentRiskId,
        };
        vi.mocked(mockRisksService.getRiskById).mockImplementation((id) => {
          if (id === mockRiskId) {
            return Promise.resolve(mockExistingRisk);
          }

          return Promise.resolve(null); // parent not found
        });

        await expect(
          service.updateRisk({
            itemIds: { id: mockRiskId },
            item: inputWithParent,
            ctx: mockContext,
          })
        ).rejects.toThrow(RiskNotFoundError);

        expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
      });

      it('should throw InvalidRiskTierError when parentRiskId equals the risk id', async () => {
        vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
          mockExistingRisk
        );

        await expect(
          service.updateRisk({
            itemIds: { id: mockRiskId },
            item: { ...mockUpdateRiskInput, parentRiskId: mockRiskId },
            ctx: mockContext,
          })
        ).rejects.toThrow(InvalidRiskTierError);

        await expect(
          service.updateRisk({
            itemIds: { id: mockRiskId },
            item: { ...mockUpdateRiskInput, parentRiskId: mockRiskId },
            ctx: mockContext,
          })
        ).rejects.toThrow('A risk cannot be set as its own parent');

        expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
      });
    });

    it('should call updateRisk with request data including id, derived tier, and context', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateRisk({
        itemIds: { id: mockRiskId },
        item: mockUpdateRiskInput,
        ctx: mockContext,
      });

      // parentRiskId and schedule not added since existing values are null (no parent, no schedule)
      expect(mockMutationClient.updateRisk).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateRiskInput,
          id: mockRiskId,
          tier: 1,
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

    it('should verify the risk exists before calling mutation', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateRisk({
        itemIds: { id: mockRiskId },
        item: mockUpdateRiskInput,
        ctx: mockContext,
      });

      expect(mockRisksService.getRiskById).toHaveBeenCalledWith(
        mockRiskId,
        mockContext
      );
    });

    it('should return the updated risk id on success', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
        updateSuccessResponse
      );

      const result = await service.updateRisk({
        itemIds: { id: mockRiskId },
        item: mockUpdateRiskInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockRiskId } });
    });

    it('should throw RiskValidationError when id is empty', async () => {
      await expect(
        service.updateRisk({
          itemIds: { id: '' },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskValidationError);

      await expect(
        service.updateRisk({
          itemIds: { id: '' },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Missing Risk ID');
    });

    it('should not call mutation client when id is empty', async () => {
      await expect(
        service.updateRisk({
          itemIds: { id: '' },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
      expect(mockRisksService.getRiskById).not.toHaveBeenCalled();
    });

    it('should throw RiskNotFoundError when risk does not exist', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskNotFoundError);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Risk with ID ${mockRiskId} not found`);
    });

    it('should not call mutation client when risk does not exist', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
    });

    it('should throw RiskValidationError when mutation returns errors', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskValidationError);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update risk: Title must be unique');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update risk: First error');
    });

    it('should throw RiskMutationError when updateChildRisk is null', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: {
          updateChildRisk: null,
        } as unknown as UpdateRiskMutation,
        errors: undefined,
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskMutationError);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update risk: no ID returned');
    });

    it('should throw RiskMutationError when data is null', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskMutationError);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update risk: no ID returned');
    });

    it('should throw RiskMutationError when data is undefined', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskMutationError);
    });

    it('should prioritise validation errors over missing ID', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(RiskValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });

    it('should propagate errors thrown by getRiskById', async () => {
      vi.mocked(mockRisksService.getRiskById).mockRejectedValue(
        new Error('Service unavailable')
      );

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Service unavailable');
    });

    it('should call validateUserIds with the owner ids before updating risk', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockMutationClient.updateRisk).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateRisk({
        itemIds: { id: mockRiskId },
        item: mockUpdateRiskInput,
        ctx: mockContext,
      });

      expect(mockUsersService.validateUserIds).toHaveBeenCalledWith(
        mockUpdateRiskInput.owners,
        mockContext
      );
    });

    it('should throw UserValidationError when owner does not exist', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Owner users with IDs provider|user-2 not found');
    });

    it('should not call mutation client when owner validation fails', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateRisk).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by usersService.validateUserIds', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new Error('User service unavailable')
      );

      await expect(
        service.updateRisk({
          itemIds: { id: mockRiskId },
          item: mockUpdateRiskInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('User service unavailable');
    });
  });

  describe('deleteRisk', () => {
    it('should call deleteRisk with id and context', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue(
        deleteSuccessResponse
      );

      await service.deleteRisk({ id: mockRiskId, ctx: mockContext });

      expect(mockMutationClient.deleteRisk).toHaveBeenCalledExactlyOnceWith(
        { id: mockRiskId },
        mockMutCtx
      );
    });

    it('should return the deleted risk id on success', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue(
        deleteSuccessResponse
      );

      const result = await service.deleteRisk({
        id: mockRiskId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockRiskId } });
    });

    it('should throw RiskValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'Permission denied' }],
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(RiskValidationError);

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete risk: Permission denied');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete risk: First error');
    });

    it('should throw RiskNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: {
          deleteRiskById: { affected_rows: 0 },
        } as DeleteRiskMutation,
        errors: undefined,
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(RiskNotFoundError);

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(`Risk with ID ${mockRiskId} not found`);
    });

    it('should throw RiskNotFoundError when data is null', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(RiskNotFoundError);
    });

    it('should throw RiskNotFoundError when data is undefined', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(RiskNotFoundError);
    });

    it('should prioritise validation errors over zero affected rows', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockResolvedValue({
        data: {
          deleteRiskById: { affected_rows: 0 },
        } as DeleteRiskMutation,
        errors: [{ message: 'Constraint violation' }],
      });

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow(RiskValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockMutationClient.deleteRisk).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.deleteRisk({ id: mockRiskId, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });
  });
});
