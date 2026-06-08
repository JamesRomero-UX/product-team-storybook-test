import { buildThirdParty, insertThirdParty } from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Third Party', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('register query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const thirdPartyId = randomUUID();
    const thirdParty = buildThirdParty(orgKey, userId, { Id: thirdPartyId });
    await insertThirdParty(thirdParty);
    await insertThirdParty(buildThirdParty(orgKey, userId));

    const response = await trpcClient.frontend.thirdParty.register.query();

    expect(response.third_party.length).toEqual(2);
    expect(response.third_party).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Id: thirdPartyId,
          Title: thirdParty.Title,
          CompanyName: thirdParty.CompanyName,
          Type: thirdParty.Type,
          Status: thirdParty.Status,
          Criticality: thirdParty.Criticality,
          contributorGroups: [],
          contributors: [],
          departments: [],
          ownerGroups: [],
          owners: [],
          tags: [],
        }),
      ])
    );
  });

  it('register query should return empty array for new org', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response = await trpcClient.frontend.thirdParty.register.query();

    expect(response.third_party).toEqual([]);
  });

  it('getById query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    const thirdPartyId = randomUUID();
    const thirdParty = buildThirdParty(orgKey, userId, { Id: thirdPartyId });
    await insertThirdParty(thirdParty);

    const response = await trpcClient.frontend.thirdParty.getById.query({
      thirdPartyId,
    });

    expect(response).toEqual(
      expect.objectContaining({
        Id: thirdPartyId,
        Title: thirdParty.Title,
        CompanyName: thirdParty.CompanyName,
        Description: thirdParty.Description,
        Type: thirdParty.Type,
        Status: thirdParty.Status,
        Criticality: thirdParty.Criticality,
        ancestorContributors: [],
        contributorGroups: [],
        contributors: [],
        departments: [],
        files: [],
        ownerGroups: [],
        owners: [],
        tags: [],
      })
    );
  });

  it('getById query should throw for non-existent id', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    await expect(
      trpcClient.frontend.thirdParty.getById.query({
        thirdPartyId: randomUUID(),
      })
    ).rejects.toThrow();
  });
});
