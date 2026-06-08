import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import {
  buildAcceptance,
  buildRisk,
  insertAcceptance,
  insertRisk,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('acceptance', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('insert', () => {
    it('should insert an acceptance with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.acceptance.insert.mutate({
        ParentId: parentRisk.Id,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Test Acceptance',
        Details: 'Test acceptance details',
        Status: AcceptanceStatus.Open,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an acceptance with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.acceptance.insert.mutate({
        ParentId: parentRisk.Id,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Risk Acceptance for Q1',
        Details: 'We accept this risk for Q1 due to budget constraints',
        Status: AcceptanceStatus.Open,
        CustomAttributeData: { customField: 'value' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an acceptance with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.acceptance.insert.mutate({
        ParentId: parentRisk.Id,
        DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
        DateAcceptedTo: '2026-12-31T00:00:00.000Z',
        Title: 'Null optional fields test',
        Details: 'Testing null optional fields',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: null,
        RequestedByUser: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with an invalid UUID for ParentId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.insert.mutate({
          ParentId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an acceptance with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.acceptance.insert.mutate(
        {
          ParentId: parentRisk.Id,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Original Title',
          Details: 'Original details',
          Status: AcceptanceStatus.Open,
        }
      );

      const response = await trpcClient.frontend.acceptance.update.mutate({
        Id: insertResponse.Id,
        DateAcceptedFrom: '2026-03-01T00:00:00.000Z',
        DateAcceptedTo: '2026-09-30T00:00:00.000Z',
        Title: 'Updated Acceptance Title',
        Details: 'Updated details',
        Status: AcceptanceStatus.Open,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update an acceptance with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.acceptance.insert.mutate(
        {
          ParentId: parentRisk.Id,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Original Title',
          Details: 'Original details',
          Status: AcceptanceStatus.Open,
        }
      );

      const response = await trpcClient.frontend.acceptance.update.mutate({
        Id: insertResponse.Id,
        DateAcceptedFrom: '2026-03-01T00:00:00.000Z',
        DateAcceptedTo: '2026-09-30T00:00:00.000Z',
        Title: 'Fully Updated Acceptance',
        Details: 'Updated details for the acceptance',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: userId,
        RequestedByUser: userId,
        CustomAttributeData: { customField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();

      const acceptances = await trpcClient.frontend.acceptance.getById.query({
        id: response.Id,
      });
      expect(acceptances).toHaveLength(1);
      expect(acceptances[0]?.Title).toBe('Fully Updated Acceptance');
      expect(acceptances[0]?.Details).toBe(
        'Updated details for the acceptance'
      );
      expect(acceptances[0]?.Status).toBe(AcceptanceStatus.Open);
    });

    it('should update an acceptance with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.acceptance.insert.mutate(
        {
          ParentId: parentRisk.Id,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Original Title',
          Details: 'Original details',
          Status: AcceptanceStatus.Open,
        }
      );

      const response = await trpcClient.frontend.acceptance.update.mutate({
        Id: insertResponse.Id,
        DateAcceptedFrom: '2026-03-01T00:00:00.000Z',
        DateAcceptedTo: '2026-09-30T00:00:00.000Z',
        Title: 'Cleared acceptance',
        Details: 'Cleared details',
        Status: AcceptanceStatus.Closed,
        ApprovedByUser: null,
        ApprovedByUserGroup: null,
        RequestedByUser: null,
        RequestedByUserGroup: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject update with an invalid UUID for Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          DateAcceptedFrom: '2026-03-01T00:00:00.000Z',
          DateAcceptedTo: '2026-09-30T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toThrow();
    });

    it('should reject update with a non-existent acceptance Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.update.mutate({
          Id: randomUUID(),
          DateAcceptedFrom: '2026-03-01T00:00:00.000Z',
          DateAcceptedTo: '2026-09-30T00:00:00.000Z',
          Title: 'Test',
          Details: 'Test',
          Status: AcceptanceStatus.Open,
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single acceptance', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.acceptance.insert.mutate(
        {
          ParentId: parentRisk.Id,
          DateAcceptedFrom: '2026-01-01T00:00:00.000Z',
          DateAcceptedTo: '2026-12-31T00:00:00.000Z',
          Title: 'Acceptance to delete',
          Details: 'This acceptance will be deleted',
          Status: AcceptanceStatus.Open,
        }
      );

      expect(insertResponse.Id).toBeDefined();

      const deleteResponse = await trpcClient.frontend.acceptance.delete.mutate(
        {
          ids: [insertResponse.Id],
        }
      );

      expect(deleteResponse).toBe('');
    });

    it('should batch delete multiple acceptances', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const acceptance1 = buildAcceptance({ orgKey, userId });
      const acceptance2 = buildAcceptance({ orgKey, userId });
      const inserted1 = await insertAcceptance(acceptance1);
      const inserted2 = await insertAcceptance(acceptance2);

      if (!inserted1 || !inserted2) {
        throw new Error('Failed to insert acceptances');
      }

      const deleteResponse = await trpcClient.frontend.acceptance.delete.mutate(
        {
          ids: [inserted1.Id, inserted2.Id],
        }
      );

      expect(deleteResponse).toBe('');
    });

    it('should throw when deleting a non-existent acceptance', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.delete.mutate({
          ids: [randomUUID()],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an invalid UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.delete.mutate({
          ids: ['not-a-uuid'],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an empty ids array', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.acceptance.delete.mutate({
          ids: [],
        })
      ).rejects.toThrow();
    });
  });
});
