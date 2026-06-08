import {
  buildRiskAssessmentResultConfigAudit,
  insertRiskAssessmentResultConfigAudit,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('risk assessment result config audit', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('should return risk assessment result config audit record for a given id', async () => {
    const { orgKey, userId, trpcClient } = context;

    const id = randomUUID();
    const record = buildRiskAssessmentResultConfigAudit(orgKey, userId, {
      Id: id,
      Action: 'INSERT',
      Version: 1,
      Config: { foo: 'bar' },
    });

    await insertRiskAssessmentResultConfigAudit(record);

    const response =
      await trpcClient.frontend.riskAssessmentResultConfigAudit.getById.query({
        id: id,
      });

    expect(response.length).toEqual(1);

    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: id,
        Action: 'INSERT',
        Version: 1,
        IsLatest: true,
        Config: { foo: 'bar' },
        CreatedByUser: userId,
        ModifiedByUser: userId,
      })
    );
  });
});
