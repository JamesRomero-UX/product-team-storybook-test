import {
  buildObligation,
  buildObligationChange,
  insertObligation,
  insertObligationChange,
} from '@risksmart-app/test-data';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('obligation-change', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('register', () => {
    it('should return obligation changes in the register', async () => {
      const { orgKey, userId, trpcClient } = context;

      const obligation = await insertObligation(
        buildObligation({ orgKey, userId })
      );

      const { OrgKey, ...insertedProps } = buildObligationChange({
        orgKey,
        userId,
        overrides: { ObligationId: obligation?.Id },
      });
      await insertObligationChange({ OrgKey, ...insertedProps });

      const response =
        await trpcClient.frontend.obligationChange.register.query();

      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: insertedProps.Id,
            ExternalId: insertedProps.ExternalId,
          }),
        ])
      );
    });

    it('should return an empty array when no obligation changes exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.obligationChange.register.query();

      expect(response).toEqual([]);
    });

    it('should include related obligation data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const obligation = await insertObligation(
        buildObligation({
          orgKey,
          userId,
          overrides: { Title: 'Related Obligation' },
        })
      );

      await insertObligationChange(
        buildObligationChange({
          orgKey,
          userId,
          overrides: { ObligationId: obligation?.Id },
        })
      );

      const response =
        await trpcClient.frontend.obligationChange.register.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.obligation?.Title).toBe('Related Obligation');
    });

    it('should include owners and contributors arrays', async () => {
      const { orgKey, userId, trpcClient } = context;

      await insertObligationChange(buildObligationChange({ orgKey, userId }));

      const response =
        await trpcClient.frontend.obligationChange.register.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.owners).toEqual([]);
      expect(response[0]?.contributors).toEqual([]);
      expect(response[0]?.ownerGroups).toEqual([]);
      expect(response[0]?.contributorGroups).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return an obligation change by id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const built = buildObligationChange({ orgKey, userId });
      const id = built.Id ?? '';
      await insertObligationChange(built);

      const response = await trpcClient.frontend.obligationChange.getById.query(
        { id }
      );

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: id,
          ExternalId: built.ExternalId,
          DescriptionBefore: built.DescriptionBefore,
          DescriptionAfter: built.DescriptionAfter,
        })
      );
    });

    it('should return an empty array for a non-existent id', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.obligationChange.getById.query(
        {
          id: '00000000-0000-0000-0000-000000000000',
        }
      );

      expect(response).toEqual([]);
    });

    it('should include related obligation data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const obligation = await insertObligation(
        buildObligation({
          orgKey,
          userId,
          overrides: { Title: 'Parent Obligation' },
        })
      );

      const built = buildObligationChange({
        orgKey,
        userId,
        overrides: { ObligationId: obligation?.Id },
      });
      const id = built.Id ?? '';
      await insertObligationChange(built);

      const response = await trpcClient.frontend.obligationChange.getById.query(
        { id }
      );

      expect(response).toHaveLength(1);
      expect(response[0]?.obligation?.Title).toBe('Parent Obligation');
    });

    it('should include attestations array', async () => {
      const { orgKey, userId, trpcClient } = context;

      const built = buildObligationChange({ orgKey, userId });
      const id = built.Id ?? '';
      await insertObligationChange(built);

      const response = await trpcClient.frontend.obligationChange.getById.query(
        { id }
      );

      expect(response).toHaveLength(1);
      expect(response[0]?.attestations).toEqual([]);
    });
  });
});
