import {
  buildAcceptanceAudit,
  buildActionAudit,
  insertAcceptanceAudit,
  insertActionAudit,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('audit', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getAcceptanceAuditById', () => {
    it('should return acceptance audit record for a given id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const id = randomUUID();
      const record = buildAcceptanceAudit({
        orgKey,
        userId,
        overrides: {
          Id: id,
          Action: 'INSERT',
        },
      });

      await insertAcceptanceAudit(record);

      const response =
        await trpcClient.frontend.audit.getAcceptanceAuditById.query({ id });

      expect(response.length).toEqual(1);

      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: id,
          Title: record.Title,
          Details: record.Details,
          Status: record.Status,
          Action: 'INSERT',
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should return empty array for non-existent id', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.audit.getAcceptanceAuditById.query({
          id: randomUUID(),
        });

      expect(response).toEqual([]);
    });
  });

  describe('getActionAuditById', () => {
    it('should return action audit record for a given id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const id = randomUUID();
      const record = buildActionAudit({
        orgKey,
        userId,
        overrides: {
          Id: id,
          Action: 'INSERT',
        },
      });

      await insertActionAudit(record);

      const response = await trpcClient.frontend.audit.getActionAuditById.query(
        { id }
      );

      expect(response.length).toEqual(1);

      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: id,
          Title: record.Title,
          Description: record.Description,
          Status: record.Status,
          Priority: record.Priority,
          Action: 'INSERT',
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should return empty array for non-existent id', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.audit.getActionAuditById.query(
        {
          id: randomUUID(),
        }
      );

      expect(response).toEqual([]);
    });
  });
});
