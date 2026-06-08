import {
  buildApproval,
  buildRisk,
  insertApproval,
  insertRisk,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('approval', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('globalApprovals query should return global approvals (no parentId)', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Insert a global approval (no ParentId)
    const globalApproval = buildApproval({
      orgKey,
      userId,
      overrides: { ParentId: null, Workflow: 'risk' },
    });
    const insertedApproval = await insertApproval(globalApproval);

    if (!insertedApproval) {
      throw new Error('Failed to insert global approval');
    }

    // Use a random parentId since we're querying global approvals
    const response = await trpcClient.frontend.approval.globalApprovals.query({
      isGlobal: true,
      parentId: crypto.randomUUID(),
    });

    expect(response).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Id: insertedApproval.Id,
          Workflow: 'risk',
          ParentId: null,
        }),
      ])
    );
  });

  it('globalApprovals query should return approval matching specific parentId', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Insert a risk to use as parent
    const risk = buildRisk({ orgKey, userId });
    const insertedRisk = await insertRisk(risk);

    if (!insertedRisk) {
      throw new Error('Failed to insert risk');
    }

    // Insert an approval with this parentId
    const parentedApproval = buildApproval({
      orgKey,
      userId,
      overrides: { ParentId: insertedRisk.Id, Workflow: 'risk' },
    });
    const insertedApproval = await insertApproval(parentedApproval);

    if (!insertedApproval) {
      throw new Error('Failed to insert parented approval');
    }

    const response = await trpcClient.frontend.approval.globalApprovals.query({
      isGlobal: true,
      parentId: insertedRisk.Id,
    });

    // The parented approval matching the parentId should be included
    expect(response).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Id: insertedApproval.Id,
          ParentId: insertedRisk.Id,
        }),
      ])
    );
  });

  it('globalApprovals query should return empty array when no approvals exist', async () => {
    const { trpcClient } = context;

    const response = await trpcClient.frontend.approval.globalApprovals.query({
      isGlobal: true,
      parentId: crypto.randomUUID(),
    });

    expect(response).toEqual([]);
  });

  it('globalApprovals query should include createdBy and levels relations', async () => {
    const { orgKey, userId, trpcClient } = context;

    const globalApproval = buildApproval({
      orgKey,
      userId,
      overrides: { ParentId: null, Workflow: 'risk' },
    });
    const insertedApproval = await insertApproval(globalApproval);

    if (!insertedApproval) {
      throw new Error('Failed to insert global approval');
    }

    const response = await trpcClient.frontend.approval.globalApprovals.query({
      isGlobal: true,
      parentId: crypto.randomUUID(),
    });

    const found = response.find((a) => a.Id === insertedApproval.Id);
    expect(found).toBeDefined();
    expect(found).toHaveProperty('createdBy');
    expect(found).toHaveProperty('levels');
    expect(found?.createdBy).toEqual(expect.objectContaining({ Id: userId }));
    expect(found?.levels).toEqual([]);
  });
});
