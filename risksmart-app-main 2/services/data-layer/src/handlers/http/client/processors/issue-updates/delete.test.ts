import { NotFound } from 'http-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor, type ProcessorDependencies } from './delete';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

const mockBody = {
  Ids: [
    '123e4567-e89b-12d3-a456-426614174000',
    '223e4567-e89b-12d3-a456-426614174001',
  ],
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockDeleteIssueUpdates =
  vi.fn<ProcessorDependencies['deleteIssueUpdates']>();

describe('delete issue updates processor', () => {
  const deps: ProcessorDependencies = {
    deleteIssueUpdates: mockDeleteIssueUpdates,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the issue updates', async () => {
    mockDeleteIssueUpdates.mockResolvedValue(2);

    const processor = createProcessor(deps);
    await processor({
      body: mockBody,
      context: mockContext,
    });

    expect(mockDeleteIssueUpdates).toHaveBeenCalledWith(mockBody.Ids);
  });

  it('throws NotFound when no rows are affected (non-existent)', async () => {
    mockDeleteIssueUpdates.mockResolvedValue(0);

    const processor = createProcessor(deps);

    await expect(
      processor({ body: mockBody, context: mockContext })
    ).rejects.toThrow(NotFound);

    await expect(
      processor({ body: mockBody, context: mockContext })
    ).rejects.toThrow('Issue updates not found');
  });

  it('deletes a single issue update', async () => {
    const singleBody = {
      Ids: ['123e4567-e89b-12d3-a456-426614174000'],
    };
    mockDeleteIssueUpdates.mockResolvedValue(1);

    const processor = createProcessor(deps);
    await processor({
      body: singleBody,
      context: mockContext,
    });

    expect(mockDeleteIssueUpdates).toHaveBeenCalledWith(singleBody.Ids);
  });

  it('throws when fewer rows are deleted than requested (partial delete)', async () => {
    mockDeleteIssueUpdates.mockResolvedValue(1);

    const processor = createProcessor(deps);

    await expect(
      processor({ body: mockBody, context: mockContext })
    ).rejects.toThrow();

    expect(mockDeleteIssueUpdates).toHaveBeenCalledWith(mockBody.Ids);
  });
});
