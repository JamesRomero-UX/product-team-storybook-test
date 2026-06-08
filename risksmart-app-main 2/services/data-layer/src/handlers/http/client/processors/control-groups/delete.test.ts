import { NotFound } from 'http-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ControlGroupRepository } from '../../../../../repositories/control-group-repository';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor, type ProcessorDependencies } from './delete';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

const mockParams = {
  id: '123e4567-e89b-12d3-a456-426614174000',
};

const mockBody = {
  OriginalTimestamp: '2026-01-12T10:00:00Z',
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockDelete = vi.fn<ControlGroupRepository['delete']>();

describe('delete control group processor', () => {
  const deps: ProcessorDependencies = {
    deleteControlGroup: mockDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the control group', async () => {
    mockDelete.mockResolvedValue(1);

    const processor = createProcessor(deps);
    await processor({
      id: mockParams.id,
      body: mockBody,
      context: mockContext,
    });

    expect(mockDelete).toHaveBeenCalledWith({
      id: mockParams.id,
      modifiedAtTimestamp: mockBody.OriginalTimestamp,
    });
  });

  it('throws NotFound when no rows are affected (concurrency conflict or non-existent)', async () => {
    mockDelete.mockResolvedValue(0);

    const processor = createProcessor(deps);

    await expect(
      processor({ id: mockParams.id, body: mockBody, context: mockContext })
    ).rejects.toThrow(NotFound);

    await expect(
      processor({ id: mockParams.id, body: mockBody, context: mockContext })
    ).rejects.toThrow('Control group not found');
  });

  it('uses the OriginalTimestamp from body for optimistic locking', async () => {
    mockDelete.mockResolvedValue(1);

    const processor = createProcessor(deps);
    await processor({
      id: mockParams.id,
      body: mockBody,
      context: mockContext,
    });

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockParams.id,
        modifiedAtTimestamp: mockBody.OriginalTimestamp,
      })
    );
  });
});
