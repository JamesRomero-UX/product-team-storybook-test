/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  buildEnterpriseRisk,
  insertEnterpriseRisk,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('enterprise-risk', () => {
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
    it('should return all enterprise risks the user has access to', async () => {
      const { orgKey, userId, trpcClient } = context;

      const { Meta, OrgKey, ...insertedEnterpriseRiskProps } =
        buildEnterpriseRisk({
          orgKey,
          userId,
        });
      await insertEnterpriseRisk({
        Meta,
        OrgKey,
        ...insertedEnterpriseRiskProps,
      });

      const response =
        await trpcClient.frontend.enterpriseRisk.register.query();

      expect(response.enterprise_risk.length).toEqual(1);
      expect(response.enterprise_risk[0]).toEqual(
        expect.objectContaining({
          ...insertedEnterpriseRiskProps,
          CreatedAtTimestamp: expect.any(String),
          ModifiedAtTimestamp: expect.any(String),
          createdByUser: expect.any(Object),
          modifiedByUser: expect.any(Object),
          score: null,
        })
      );
    });
  });

  describe('getById', () => {
    it('should return the enterprise risk for the given id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const { Id, OrgKey, ...insertedEnterpriseRiskProps } =
        buildEnterpriseRisk({
          orgKey,
          userId,
        });
      await insertEnterpriseRisk({
        Id,
        OrgKey,
        ...insertedEnterpriseRiskProps,
      });

      const response = await trpcClient.frontend.enterpriseRisk.getById.query({
        id: Id,
      });

      expect(response[0]).toEqual(
        expect.objectContaining({
          ...insertedEnterpriseRiskProps,
          Id,
          CreatedAtTimestamp: expect.any(String),
          ModifiedAtTimestamp: expect.any(String),
          CustomAttributeData: null,
          createdByUser: {
            FriendlyName: 'Test User',
          },
          modifiedByUser: {
            FriendlyName: 'Test User',
          },
          score: null,
          parent: null,
          children: [],
        })
      );
    });
  });

  describe('getByTier', () => {
    it('should return the enterprise risks for the given tier', async () => {
      const { orgKey, userId, trpcClient } = context;

      const { Id: parentId, ...parentEnterpriseRiskProps } =
        buildEnterpriseRisk({
          orgKey,
          userId,
        });
      await insertEnterpriseRisk({
        ...parentEnterpriseRiskProps,
        Id: parentId,
        OrgKey: orgKey,
      });

      const { Tier, ...insertedEnterpriseRiskProps } = buildEnterpriseRisk({
        orgKey,
        userId,
        overrides: { Tier: 2, ParentId: parentId },
      });
      await insertEnterpriseRisk({
        ...insertedEnterpriseRiskProps,
        Tier,
        OrgKey: orgKey,
      });

      const response = await trpcClient.frontend.enterpriseRisk.getByTier.query(
        {
          tier: 2,
        }
      );

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedEnterpriseRiskProps.Id,
          Title: insertedEnterpriseRiskProps.Title,
        })
      );
    });
  });
});
