import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IndicatorResultRepository } from '../../../../../repositories/indicator-result-repository';
import type { CreateIndicatorResultRequest } from '../../../../../schemas/indicator-result';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor, type ProcessorDependencies } from './create';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

const mockPayload: CreateIndicatorResultRequest = {
  IndicatorId: 'indicator-123',
  ResultDate: '2026-01-08T12:00:00.000Z',
  Description: 'Example indicator result',
  TargetValueNum: 100,
  TargetValueTxt: 'On target',
  CustomAttributeData: { source: 'manual' },
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockInsert = vi.fn<IndicatorResultRepository['insert']>();

const mockIndicatorResultRepository: IndicatorResultRepository = {
  insert: mockInsert,
  getLatestByIndicatorId: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
};

describe('create indicator result processor', () => {
  const deps: ProcessorDependencies = {
    indicatorResultRepository: mockIndicatorResultRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the indicator result', async () => {
    const insertedRecord = {
      Id: 'indicator-result-123',
      IndicatorId: mockPayload.IndicatorId,
    } as InferSelectModel<'indicator_result'>;

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
    mockInsert.mockResolvedValue([{} as InferSelectModel<'indicator_result'>]);
    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Failed to retrieve created indicator result');
  });

  it('handles null CustomAttributeData', async () => {
    const payloadWithoutCustomData: CreateIndicatorResultRequest = {
      IndicatorId: 'indicator-456',
      ResultDate: '2026-01-08T12:00:00.000Z',
      TargetValueNum: 50,
    };

    const insertedRecord = {
      Id: 'indicator-result-456',
      IndicatorId: payloadWithoutCustomData.IndicatorId,
    } as InferSelectModel<'indicator_result'>;

    mockInsert.mockResolvedValue([insertedRecord]);

    const processor = createProcessor(deps);
    await processor({
      payload: payloadWithoutCustomData,
      context: mockContext,
    });

    expect(mockInsert).toHaveBeenCalledWith({
      ...payloadWithoutCustomData,
      CreatedByUser: mockContext.userId,
      ModifiedByUser: mockContext.userId,
      OrgKey: mockContext.orgKey,
      CustomAttributeData: null,
    });
  });
});
