import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ControlGroupRepository } from '../../../../../repositories/control-group-repository';
import type { CreateControlGroupRequest } from '../../../../../schemas/control-group';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor, type ProcessorDependencies } from './create';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

const mockPayload: CreateControlGroupRequest = {
  Title: 'Example Control Group',
  Description: 'Example description',
  Owner: 'owner-123',
  CustomAttributeData: { riskLevel: 'high' },
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockInsert = vi.fn<ControlGroupRepository['insert']>();

const mockControlGroupRepository: ControlGroupRepository = {
  insert: mockInsert,
  delete: vi.fn(),
};

describe('create control group processor', () => {
  const deps: ProcessorDependencies = {
    controlGroupRepository: mockControlGroupRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the control group', async () => {
    const insertedRecord = {
      Id: 'control-group-123',
      Title: mockPayload.Title,
    } as InferSelectModel<'control_group'>;

    mockInsert.mockResolvedValue([insertedRecord]);

    const processor = createProcessor(deps);
    const result = await processor({
      payload: mockPayload,
      context: mockContext,
    });

    expect(result).toBe(insertedRecord);

    expect(mockInsert).toHaveBeenCalledWith({
      ...mockPayload,
      CreatedByUser: mockContext.userId,
      ModifiedByUser: mockContext.userId,
      OrgKey: mockContext.orgKey,
      CustomAttributeData: mockPayload.CustomAttributeData,
    });
  });

  it('throws when the repository insert fails', async () => {
    const error = new Error('database unavailable');

    mockInsert.mockRejectedValue(error);

    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('database unavailable');
  });

  it('throws when the inserted record has no Id', async () => {
    mockInsert.mockResolvedValue([{} as InferSelectModel<'control_group'>]);
    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Failed to retrieve created control group');
  });
});
