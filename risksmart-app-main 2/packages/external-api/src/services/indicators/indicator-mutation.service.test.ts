import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IMutationClient } from '../../clients/mutation-client.interface';
import {
  IndicatorMutationError,
  IndicatorNotFoundError,
  IndicatorValidationError,
  InvalidIndicatorResultError,
} from '../../errors/indicator.errors';
import { UserValidationError } from '../../errors/user.errors';
import type {
  DeleteIndicatorResultsMutation,
  DeleteIndicatorsMutation,
  InsertIndicatorMutation,
  InsertIndicatorResultMutation,
  UpdateIndicatorMutation,
  UpdateIndicatorResultMutation,
} from '../../generated/graphql';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../../schemas/indicators/indicator-mutate-request.schema';
import type { CreateIndicatorResultRequest } from '../../schemas/indicators/indicator-result-mutate-request.schema';
import type { SchemaService } from '../common/schema.service';
import type { ControlsService } from '../risks/controls.service';
import type { RisksService } from '../risks/risks.service';
import type { UsersService } from '../users/users.service';
import { indicatorMutationService } from './indicator-mutation.service';
import type { IndicatorsService } from './indicators.service';

const mockIndicatorId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockParentRiskId = '4fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockResultId = '5fa85f64-5717-4562-b3fc-2c963f66afa6';

const mockCreateInput: CreateIndicatorRequest = {
  title: 'Test Indicator',
  description: 'A test indicator',
  type: IndicatorType.Number,
  unit: 'kg',
  upperTolerance: 100,
  lowerTolerance: 10,
  upperAppetite: 80,
  lowerAppetite: 20,
  parentId: mockParentRiskId,
  owners: ['provider|user-1'],
};

const mockUpdateInput: UpdateIndicatorRequest = {
  title: 'Updated Indicator',
  description: 'An updated indicator',
  targetValue: 'On track',
  owners: ['provider|user-2'],
};

const mockContext: MutateServiceContext = {
  orgId: 'org-123',
  tenantId: 'tenant-456',
  authToken: 'mock-auth-token',
};

const mockMutCtx = { orgId: 'org-123', tenantId: 'tenant-456' };

type GetIndicatorByIdResult = NonNullable<
  Awaited<ReturnType<IndicatorsService['getIndicatorById']>>
>;

type GetIndicatorResultByIdResult = NonNullable<
  Awaited<ReturnType<IndicatorsService['getIndicatorResultById']>>
>;

type GetRiskByIdResult = NonNullable<
  Awaited<ReturnType<RisksService['getRiskById']>>
>;

type GetControlByIdResult = NonNullable<
  Awaited<ReturnType<ControlsService['getControlById']>>
>;

const mockExistingIndicator = {
  data: { Id: mockIndicatorId, Title: 'Existing Indicator', Type: 'number' },
  form_configuration: null,
} as GetIndicatorByIdResult;

const mockExistingTextIndicator = {
  data: { Id: mockIndicatorId, Title: 'Text Indicator', Type: 'text' },
  form_configuration: null,
} as GetIndicatorByIdResult;

const mockExistingResult = {
  data: { Id: mockResultId, parent: { Id: mockIndicatorId } },
  form_configuration: null,
} as GetIndicatorResultByIdResult;

const mockExistingRisk = {
  data: { Id: mockParentRiskId, Title: 'Parent Risk' },
  form_configuration: null,
} as GetRiskByIdResult;

const mockExistingControl = {
  data: { Id: mockParentRiskId, Title: 'Parent Control' },
  form_configuration: null,
} as GetControlByIdResult;

const insertSuccessResponse = {
  data: {
    insertChildIndicator: { Id: mockIndicatorId },
  } as InsertIndicatorMutation,
  errors: undefined,
};

const updateSuccessResponse = {
  data: {
    updateChildIndicator: { Id: mockIndicatorId },
  } as UpdateIndicatorMutation,
  errors: undefined,
};

const deleteSuccessResponse = {
  data: {
    delete_indicator_result: { affected_rows: 3 },
    delete_indicator: { affected_rows: 1 },
  } as DeleteIndicatorsMutation,
  errors: undefined,
};

const mockCreateResultInput: CreateIndicatorResultRequest = {
  resultDate: '2024-01-15T10:30:00.000Z',
  description: 'Q1 result',
  targetValueNum: 42.5,
};

const mockUpdateResultInput: CreateIndicatorResultRequest = {
  resultDate: '2024-02-15T10:30:00.000Z',
  description: 'Updated result',
  targetValueNum: 50,
};

const mockCreateTextResultInput: CreateIndicatorResultRequest = {
  resultDate: '2024-01-15T10:30:00.000Z',
  description: 'Q1 result',
  targetValueTxt: 'On track',
};

const mockUpdateTextResultInput: CreateIndicatorResultRequest = {
  resultDate: '2024-02-15T10:30:00.000Z',
  description: 'Updated result',
  targetValueTxt: 'Updated',
};

const insertResultSuccessResponse = {
  data: {
    insert_indicator_result_one: { Id: mockResultId },
  } as InsertIndicatorResultMutation,
  errors: undefined,
};

const updateResultSuccessResponse = {
  data: {
    update_indicator_result: {
      returning: [{ Id: mockResultId }],
    },
  } as UpdateIndicatorResultMutation,
  errors: undefined,
};

const deleteResultSuccessResponse = {
  data: {
    delete_indicator_result: { affected_rows: 1 },
  } as DeleteIndicatorResultsMutation,
  errors: undefined,
};

describe('indicatorMutationService', () => {
  let mockMutationClient: IMutationClient;
  let mockIndicatorsService: IndicatorsService;
  let mockRisksService: RisksService;
  let mockControlsService: ControlsService;
  let mockUsersService: UsersService;
  let mockSchemaService: SchemaService;
  let service: ReturnType<typeof indicatorMutationService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMutationClient = {
      insertIndicator: vi.fn(),
      updateIndicator: vi.fn(),
      deleteIndicator: vi.fn(),
      insertIndicatorResult: vi.fn(),
      updateIndicatorResult: vi.fn(),
      deleteIndicatorResult: vi.fn(),
    } as unknown as IMutationClient;

    mockIndicatorsService = {
      getIndicatorById: vi.fn(),
      getIndicatorResultById: vi.fn(),
    } as unknown as IndicatorsService;

    mockRisksService = {
      getRiskById: vi.fn(),
    } as unknown as RisksService;

    mockControlsService = {
      getControlById: vi.fn(),
    } as unknown as ControlsService;

    mockUsersService = {
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

    service = indicatorMutationService({
      mutationClient: mockMutationClient,
      indicatorsService: mockIndicatorsService,
      risksService: mockRisksService,
      controlsService: mockControlsService,
      usersService: mockUsersService,
      schemaService: mockSchemaService,
    });
  });

  describe('createIndicator', () => {
    it('should call insertIndicator with request data and context', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue(
        insertSuccessResponse
      );

      await service.createIndicator({
        item: mockCreateInput,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.insertIndicator
      ).toHaveBeenCalledExactlyOnceWith(
        { ...mockCreateInput, customAttributeData: null },
        mockMutCtx
      );
    });

    it('should return the created indicator id on success', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue(
        insertSuccessResponse
      );

      const result = await service.createIndicator({
        item: mockCreateInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIndicatorId } });
    });

    it('should resolve parent as control when risk not found', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(
        mockExistingControl
      );
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue(
        insertSuccessResponse
      );

      const result = await service.createIndicator({
        item: mockCreateInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIndicatorId } });
    });

    it('should throw IndicatorValidationError when parent not found', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(
        `Parent with ID ${mockParentRiskId} not found. Indicators must belong to a risk or control`
      );
    });

    it('should not call mutation client when parent not found', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(null);
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow();

      expect(mockMutationClient.insertIndicator).not.toHaveBeenCalled();
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create indicator: Title must be unique');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create indicator: First error');
    });

    it('should throw IndicatorMutationError when insertChildIndicator is null', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: {
          insertChildIndicator: null,
        } as unknown as InsertIndicatorMutation,
        errors: undefined,
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create indicator: no ID returned');
    });

    it('should throw IndicatorMutationError when data is null', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Failed to create indicator: no ID returned');
    });

    it('should throw IndicatorMutationError when data is undefined', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorMutationError);
    });

    it('should prioritise validation errors over missing ID', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(IndicatorValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });

    it('should call validateUserIds with the owner ids before creating indicator', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockMutationClient.insertIndicator).mockResolvedValue(
        insertSuccessResponse
      );

      await service.createIndicator({
        item: mockCreateInput,
        ctx: mockContext,
      });

      expect(mockUsersService.validateUserIds).toHaveBeenCalledWith(
        mockCreateInput.owners,
        mockContext
      );
    });

    it('should propagate UserValidationError when owner is not found', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow('Owner users with IDs provider|user-1 not found');
    });

    it('should not call mutation client when owner validation fails', async () => {
      vi.mocked(mockRisksService.getRiskById).mockResolvedValue(
        mockExistingRisk
      );
      vi.mocked(mockControlsService.getControlById).mockResolvedValue(null);
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-1 not found'
        )
      );

      await expect(
        service.createIndicator({ item: mockCreateInput, ctx: mockContext })
      ).rejects.toThrow();

      expect(mockMutationClient.insertIndicator).not.toHaveBeenCalled();
    });
  });

  describe('updateIndicator', () => {
    it('should call updateIndicator with request data including id and context', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIndicator({
        itemIds: { id: mockIndicatorId },
        item: mockUpdateInput,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.updateIndicator
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateInput,
          id: mockIndicatorId,
          type: IndicatorType.Number,
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

    it('should not resolve parent when updating', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIndicator({
        itemIds: { id: mockIndicatorId },
        item: mockUpdateInput,
        ctx: mockContext,
      });

      expect(mockRisksService.getRiskById).not.toHaveBeenCalled();
      expect(mockControlsService.getControlById).not.toHaveBeenCalled();
    });

    it('should verify the indicator exists before calling mutation', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIndicator({
        itemIds: { id: mockIndicatorId },
        item: mockUpdateInput,
        ctx: mockContext,
      });

      expect(
        mockIndicatorsService.getIndicatorById
      ).toHaveBeenCalledExactlyOnceWith(mockIndicatorId, mockContext);
    });

    it('should return the updated indicator id on success', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue(
        updateSuccessResponse
      );

      const result = await service.updateIndicator({
        itemIds: { id: mockIndicatorId },
        item: mockUpdateInput,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIndicatorId } });
    });

    it('should throw IndicatorValidationError when id is empty', async () => {
      await expect(
        service.updateIndicator({
          itemIds: { id: '' },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.updateIndicator({
          itemIds: { id: '' },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Missing Indicator ID');
    });

    it('should not call mutation client when id is empty', async () => {
      await expect(
        service.updateIndicator({
          itemIds: { id: '' },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicator).not.toHaveBeenCalled();
      expect(mockIndicatorsService.getIndicatorById).not.toHaveBeenCalled();
    });

    it('should throw IndicatorNotFoundError when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorNotFoundError);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Indicator with ID ${mockIndicatorId} not found`);
    });

    it('should not call mutation client when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicator).not.toHaveBeenCalled();
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'Title must be unique' }],
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update indicator: Title must be unique');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update indicator: First error');
    });

    it('should throw IndicatorMutationError when updateChildIndicator is null', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: {
          updateChildIndicator: null,
        } as unknown as UpdateIndicatorMutation,
        errors: undefined,
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update indicator: no ID returned');
    });

    it('should throw IndicatorMutationError when data is null', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to update indicator: no ID returned');
    });

    it('should throw IndicatorMutationError when data is undefined', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorMutationError);
    });

    it('should prioritise validation errors over missing ID', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });

    it('should propagate errors thrown by getIndicatorById', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockRejectedValue(
        new Error('Service unavailable')
      );

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Service unavailable');
    });

    it('should call validateUserIds with the owner ids before updating indicator', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.updateIndicator).mockResolvedValue(
        updateSuccessResponse
      );

      await service.updateIndicator({
        itemIds: { id: mockIndicatorId },
        item: mockUpdateInput,
        ctx: mockContext,
      });

      expect(mockUsersService.validateUserIds).toHaveBeenCalledWith(
        mockUpdateInput.owners,
        mockContext
      );
    });

    it('should propagate UserValidationError when owner is not found', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow(UserValidationError);

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow('Owner users with IDs provider|user-2 not found');
    });

    it('should not call mutation client when owner validation fails', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockUsersService.validateUserIds).mockRejectedValue(
        new UserValidationError(
          'Owner users with IDs provider|user-2 not found'
        )
      );

      await expect(
        service.updateIndicator({
          itemIds: { id: mockIndicatorId },
          item: mockUpdateInput,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicator).not.toHaveBeenCalled();
    });
  });

  describe('deleteIndicator', () => {
    it('should call deleteIndicator with ids array and context', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue(
        deleteSuccessResponse
      );

      await service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext });

      expect(
        mockMutationClient.deleteIndicator
      ).toHaveBeenCalledExactlyOnceWith({ ids: [mockIndicatorId] }, mockMutCtx);
    });

    it('should return the deleted indicator id on success', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue(
        deleteSuccessResponse
      );

      const result = await service.deleteIndicator({
        id: mockIndicatorId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockIndicatorId } });
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'Permission denied' }],
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete indicator: Permission denied');
    });

    it('should use the first error message when multiple errors are returned', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: null,
        errors: [{ message: 'First error' }, { message: 'Second error' }],
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow('Failed to delete indicator: First error');
    });

    it('should throw IndicatorNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: {
          delete_indicator_result: { affected_rows: 0 },
          delete_indicator: { affected_rows: 0 },
        } as DeleteIndicatorsMutation,
        errors: undefined,
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(IndicatorNotFoundError);

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(`Indicator with ID ${mockIndicatorId} not found`);
    });

    it('should throw IndicatorNotFoundError when data is null', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should throw IndicatorNotFoundError when data is undefined', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: undefined,
        errors: undefined,
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should prioritise validation errors over zero affected rows', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockResolvedValue({
        data: {
          delete_indicator_result: { affected_rows: 0 },
          delete_indicator: { affected_rows: 0 },
        } as DeleteIndicatorsMutation,
        errors: [{ message: 'Constraint violation' }],
      });

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow(IndicatorValidationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockMutationClient.deleteIndicator).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.deleteIndicator({ id: mockIndicatorId, ctx: mockContext })
      ).rejects.toThrow('Network error');
    });
  });

  describe('createIndicatorResult', () => {
    it('should call insertIndicatorResult with request data and context', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockResolvedValue(
        insertResultSuccessResponse
      );

      await service.createIndicatorResult({
        item: mockCreateResultInput,
        ctx: mockContext,
        indicatorId: mockIndicatorId,
      });

      expect(
        mockMutationClient.insertIndicatorResult
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockCreateResultInput,
          indicatorId: mockIndicatorId,
          customAttributeData: null,
        },
        mockMutCtx
      );
    });

    it('should return the created result id on success', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockResolvedValue(
        insertResultSuccessResponse
      );

      const result = await service.createIndicatorResult({
        item: mockCreateResultInput,
        ctx: mockContext,
        indicatorId: mockIndicatorId,
      });

      expect(result).toEqual({ data: { id: mockResultId } });
    });

    it('should throw IndicatorNotFoundError when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should not call mutation client when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.insertIndicatorResult).not.toHaveBeenCalled();
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockResolvedValue({
        data: null,
        errors: [{ message: 'Invalid result date' }],
      });

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(
        'Failed to create indicator result: Invalid result date'
      );
    });

    it('should throw IndicatorMutationError when no ID returned', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockResolvedValue({
        data: {
          insert_indicator_result_one: null,
        } as unknown as InsertIndicatorResultMutation,
        errors: undefined,
      });

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow('Failed to create indicator result: no ID returned');
    });

    it('should throw IndicatorMutationError when data is null', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(IndicatorMutationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockMutationClient.insertIndicatorResult).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.createIndicatorResult({
          item: mockCreateResultInput,
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow('Network error');
    });

    it('should throw InvalidIndicatorResultError when number indicator missing targetValueNum', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );

      await expect(
        service.createIndicatorResult({
          item: { ...mockCreateTextResultInput },
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(InvalidIndicatorResultError);

      await expect(
        service.createIndicatorResult({
          item: { ...mockCreateTextResultInput },
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(
        'targetValueNum is required for number type indicator results'
      );
    });

    it('should throw InvalidIndicatorResultError when text indicator missing targetValueTxt', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingTextIndicator
      );

      await expect(
        service.createIndicatorResult({
          item: { ...mockCreateResultInput },
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(InvalidIndicatorResultError);

      await expect(
        service.createIndicatorResult({
          item: { ...mockCreateResultInput },
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow(
        'targetValueTxt is required for text type indicator results'
      );
    });

    it('should not call mutation client when type validation fails', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingTextIndicator
      );

      await expect(
        service.createIndicatorResult({
          item: { ...mockCreateResultInput },
          ctx: mockContext,
          indicatorId: mockIndicatorId,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.insertIndicatorResult).not.toHaveBeenCalled();
    });
  });

  describe('updateIndicatorResult', () => {
    it('should call updateIndicatorResult with request data and context', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockResolvedValue(
        updateResultSuccessResponse
      );

      await service.updateIndicatorResult({
        item: mockUpdateResultInput,
        ctx: mockContext,
        itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
      });

      expect(
        mockMutationClient.updateIndicatorResult
      ).toHaveBeenCalledExactlyOnceWith(
        {
          ...mockUpdateResultInput,
          resultId: mockResultId,
          customAttributeData: null,
        },
        mockMutCtx
      );
    });

    it('should return the updated result id on success', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockResolvedValue(
        updateResultSuccessResponse
      );

      const result = await service.updateIndicatorResult({
        item: mockUpdateResultInput,
        ctx: mockContext,
        itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
      });

      expect(result).toEqual({ data: { id: mockResultId } });
    });

    it('should throw IndicatorValidationError when resultId is empty', async () => {
      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: '' },
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: '' },
        })
      ).rejects.toThrow('Missing Indicator Result ID');
    });

    it('should not call mutation client when resultId is empty', async () => {
      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: '' },
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicatorResult).not.toHaveBeenCalled();
    });

    it('should throw IndicatorNotFoundError when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should throw IndicatorNotFoundError when result does not belong to indicator', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        null
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(IndicatorNotFoundError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(
        `Indicator result with ID ${mockResultId} not found for indicator ${mockIndicatorId}`
      );
    });

    it('should not call mutation client when result ownership check fails', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        null
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicatorResult).not.toHaveBeenCalled();
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockResolvedValue({
        data: null,
        errors: [{ message: 'Validation failed' }],
      });

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow('Failed to update indicator result: Validation failed');
    });

    it('should throw IndicatorMutationError when no ID returned', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockResolvedValue({
        data: {
          update_indicator_result: { returning: [] },
        } as unknown as UpdateIndicatorResultMutation,
        errors: undefined,
      });

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(IndicatorMutationError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow('Failed to update indicator result: no ID returned');
    });

    it('should throw IndicatorMutationError when data is null', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(IndicatorMutationError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.updateIndicatorResult).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow('Network error');
    });

    it('should throw InvalidIndicatorResultError when number indicator missing targetValueNum', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateTextResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(InvalidIndicatorResultError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateTextResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(
        'targetValueNum is required for number type indicator results'
      );
    });

    it('should throw InvalidIndicatorResultError when text indicator missing targetValueTxt', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingTextIndicator
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(InvalidIndicatorResultError);

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow(
        'targetValueTxt is required for text type indicator results'
      );
    });

    it('should not call mutation client when type validation fails', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingTextIndicator
      );

      await expect(
        service.updateIndicatorResult({
          item: mockUpdateResultInput,
          ctx: mockContext,
          itemIds: { indicatorId: mockIndicatorId, resultId: mockResultId },
        })
      ).rejects.toThrow();

      expect(mockMutationClient.updateIndicatorResult).not.toHaveBeenCalled();
    });
  });

  describe('deleteIndicatorResult', () => {
    it('should call deleteIndicatorResult with ids array and context', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockResolvedValue(
        deleteResultSuccessResponse
      );

      await service.deleteIndicatorResult({
        indicatorId: mockIndicatorId,
        resultId: mockResultId,
        ctx: mockContext,
      });

      expect(
        mockMutationClient.deleteIndicatorResult
      ).toHaveBeenCalledExactlyOnceWith({ ids: [mockResultId] }, mockMutCtx);
    });

    it('should return the deleted result id on success', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockResolvedValue(
        deleteResultSuccessResponse
      );

      const result = await service.deleteIndicatorResult({
        indicatorId: mockIndicatorId,
        resultId: mockResultId,
        ctx: mockContext,
      });

      expect(result).toEqual({ data: { id: mockResultId } });
    });

    it('should throw IndicatorNotFoundError when indicator does not exist', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(null);

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should throw IndicatorNotFoundError when result does not belong to indicator', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        null
      );

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorNotFoundError);

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(
        `Indicator result with ID ${mockResultId} not found for indicator ${mockIndicatorId}`
      );
    });

    it('should not call mutation client when result ownership check fails', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        null
      );

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow();

      expect(mockMutationClient.deleteIndicatorResult).not.toHaveBeenCalled();
    });

    it('should throw IndicatorValidationError when mutation returns errors', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockResolvedValue({
        data: null,
        errors: [{ message: 'Permission denied' }],
      });

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorValidationError);

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Failed to delete indicator result: Permission denied');
    });

    it('should throw IndicatorNotFoundError when affected_rows is 0', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockResolvedValue({
        data: {
          delete_indicator_result: { affected_rows: 0 },
        } as DeleteIndicatorResultsMutation,
        errors: undefined,
      });

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorNotFoundError);

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(`Indicator result with ID ${mockResultId} not found`);
    });

    it('should throw IndicatorNotFoundError when data is null', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockResolvedValue({
        data: null,
        errors: undefined,
      });

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow(IndicatorNotFoundError);
    });

    it('should propagate errors thrown by the mutation client', async () => {
      vi.mocked(mockIndicatorsService.getIndicatorById).mockResolvedValue(
        mockExistingIndicator
      );
      vi.mocked(mockIndicatorsService.getIndicatorResultById).mockResolvedValue(
        mockExistingResult
      );
      vi.mocked(mockMutationClient.deleteIndicatorResult).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.deleteIndicatorResult({
          indicatorId: mockIndicatorId,
          resultId: mockResultId,
          ctx: mockContext,
        })
      ).rejects.toThrow('Network error');
    });
  });
});
