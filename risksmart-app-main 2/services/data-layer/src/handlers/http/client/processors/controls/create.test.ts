import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ControlRepository } from '../../../../../repositories/control-repository';
import type { ServiceContext } from '../../../../../types/service-context';
import {
  type CreateControlRequest,
  createProcessor,
  type ProcessorDependencies,
} from './create';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

const mockPayload: CreateControlRequest = {
  ParentId: '00000000-0000-0000-0000-000000000001',
  Title: 'Example Control',
  Description: 'Example description',
  Type: 'Preventive',
  CustomAttributeData: { riskLevel: 'high' },
  OwnerUserIds: ['owner-1'],
  OwnerGroupIds: [],
  ContributorUserIds: [],
  ContributorGroupIds: [],
  TagTypeIds: [],
  DepartmentTypeIds: [],
  Schedule: null,
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockInsertWithRelationships =
  vi.fn<ControlRepository['insertWithRelationships']>();

const mockControlRepository: ControlRepository = {
  insertWithRelationships: mockInsertWithRelationships,
};

describe('create control processor', () => {
  const deps: ProcessorDependencies = {
    controlRepository: mockControlRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the control with relationships', async () => {
    const insertedRecord = {
      Id: 'control-123',
      Title: mockPayload.Title,
    } as InferSelectModel<'control'>;

    mockInsertWithRelationships.mockResolvedValue(insertedRecord);

    const processor = createProcessor(deps);
    const result = await processor({
      payload: mockPayload,
      context: mockContext,
    });

    expect(result).toBe(insertedRecord);

    expect(mockInsertWithRelationships).toHaveBeenCalledWith(
      {
        Title: mockPayload.Title,
        Description: mockPayload.Description,
        Type: mockPayload.Type,
        CreatedByUser: mockContext.userId,
        ModifiedByUser: mockContext.userId,
        OrgKey: mockContext.orgKey,
        CustomAttributeData: mockPayload.CustomAttributeData,
      },
      {
        parentId: mockPayload.ParentId,
        ownerUserIds: mockPayload.OwnerUserIds,
        ownerGroupIds: mockPayload.OwnerGroupIds,
        contributorUserIds: mockPayload.ContributorUserIds,
        contributorGroupIds: mockPayload.ContributorGroupIds,
        tagTypeIds: mockPayload.TagTypeIds,
        departmentTypeIds: mockPayload.DepartmentTypeIds,
        schedule: null,
        scheduleState: null,
      },
      mockContext
    );
  });

  it('throws when the repository insert fails', async () => {
    const error = new Error('database unavailable');

    mockInsertWithRelationships.mockRejectedValue(error);

    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('database unavailable');
  });

  it('throws when the inserted record has no Id', async () => {
    mockInsertWithRelationships.mockResolvedValue(
      {} as InferSelectModel<'control'>
    );
    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Failed to retrieve created control');
  });

  it('defaults Description to empty string when not provided', async () => {
    const payloadWithoutDescription: CreateControlRequest = {
      ...mockPayload,
      Description: undefined,
    };

    const insertedRecord = {
      Id: 'control-456',
      Title: mockPayload.Title,
    } as InferSelectModel<'control'>;

    mockInsertWithRelationships.mockResolvedValue(insertedRecord);

    const processor = createProcessor(deps);
    await processor({
      payload: payloadWithoutDescription,
      context: mockContext,
    });

    expect(mockInsertWithRelationships).toHaveBeenCalledWith(
      expect.objectContaining({
        Description: '',
      }),
      expect.anything(),
      mockContext
    );
  });
});
