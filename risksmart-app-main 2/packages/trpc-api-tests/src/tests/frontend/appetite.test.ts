import {
  AppetiteStatus,
  AppetiteType,
} from '@risksmart-app/domain/src/types/consts';
import {
  buildAppetite,
  buildAppetiteParent,
  buildImpact,
  buildRisk,
  insertAppetite,
  insertAppetiteParent,
  insertImpact,
  insertRisk,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('appetite', () => {
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
    it('should return empty list when no appetites exist', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.appetite.register.query();

      expect(response.appetite_parent).toEqual([]);
    });

    it('should return active risk appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk to attach appetite to
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an appetite
      const appetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          AppetiteType: AppetiteType.Risk,
        },
      });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      // Link appetite to risk via appetite_parent
      const appetiteParentInput = buildAppetiteParent({
        orgKey,
        userId,
        appetiteId: insertedAppetite.Id,
        parentId: insertedRisk.Id,
        overrides: {
          Status: AppetiteStatus.Active,
        },
      });
      await insertAppetiteParent(appetiteParentInput);

      const response = await trpcClient.frontend.appetite.register.query();

      expect(response.appetite_parent.length).toEqual(1);
      expect(response.appetite_parent[0]).toEqual(
        expect.objectContaining({
          Id: insertedAppetite.Id,
          ParentId: insertedRisk.Id,
          Status: AppetiteStatus.Active,
        })
      );
      expect(response.appetite_parent[0]?.appetite).toEqual(
        expect.objectContaining({
          Id: insertedAppetite.Id,
          Statement: appetiteInput.Statement,
          LowerAppetite: appetiteInput.LowerAppetite,
          UpperAppetite: appetiteInput.UpperAppetite,
        })
      );
    });

    it('should not return archived appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an older appetite (will be archived by trigger)
      const olderDate = new Date();
      olderDate.setDate(olderDate.getDate() - 1);
      const olderAppetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          EffectiveDate: olderDate.toISOString(),
        },
      });
      const olderAppetite = await insertAppetite(olderAppetiteInput);

      if (!olderAppetite) {
        throw new Error('Failed to insert older appetite');
      }

      // Create a newer appetite (will be active)
      const newerAppetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          EffectiveDate: new Date().toISOString(),
        },
      });
      const newerAppetite = await insertAppetite(newerAppetiteInput);

      if (!newerAppetite) {
        throw new Error('Failed to insert newer appetite');
      }

      // Link both appetites to the same risk
      // The trigger will automatically archive the older one
      await insertAppetiteParent(
        buildAppetiteParent({
          orgKey,
          userId,
          appetiteId: olderAppetite.Id,
          parentId: insertedRisk.Id,
        })
      );

      await insertAppetiteParent(
        buildAppetiteParent({
          orgKey,
          userId,
          appetiteId: newerAppetite.Id,
          parentId: insertedRisk.Id,
        })
      );

      const response = await trpcClient.frontend.appetite.register.query();

      // Only the newer (active) appetite should be returned
      expect(response.appetite_parent.length).toEqual(1);
      expect(response.appetite_parent[0]).toEqual(
        expect.objectContaining({ Id: newerAppetite.Id })
      );
      // The older (archived) appetite should not be returned
      expect(response.appetite_parent).not.toContainEqual(
        expect.objectContaining({ Id: olderAppetite.Id })
      );
    });
  });

  describe('getById', () => {
    it('should return appetite by id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const appetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          LowerAppetite: 1,
          UpperAppetite: 5,
          Statement: 'Test statement for getById',
        },
      });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      const response = await trpcClient.frontend.appetite.getById.query({
        id: insertedAppetite.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedAppetite.Id,
          Statement: appetiteInput.Statement,
          LowerAppetite: appetiteInput.LowerAppetite,
          UpperAppetite: appetiteInput.UpperAppetite,
        })
      );
    });

    it('should return empty array for non-existent appetite', async () => {
      const { trpcClient } = context;
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await trpcClient.frontend.appetite.getById.query({
        id: nonExistentId,
      });

      expect(response).toEqual([]);
    });

    it('should return appetite with linked impact', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
        overrides: {
          Name: 'Test Impact',
        },
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create an appetite linked to the impact
      const appetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          ImpactId: insertedImpact.Id,
        },
      });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      const response = await trpcClient.frontend.appetite.getById.query({
        id: insertedAppetite.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]?.impact).toEqual(
        expect.objectContaining({
          Id: insertedImpact.Id,
          Name: impactInput.Name,
        })
      );
    });
  });

  describe('appetitesByRiskId', () => {
    it('should return appetites linked to a specific risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an appetite
      const appetiteInput = buildAppetite({ orgKey, userId });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      // Link appetite to risk
      const appetiteParentInput = buildAppetiteParent({
        orgKey,
        userId,
        appetiteId: insertedAppetite.Id,
        parentId: insertedRisk.Id,
      });
      await insertAppetiteParent(appetiteParentInput);

      const response =
        await trpcClient.frontend.appetite.appetitesByRiskId.query({
          riskId: insertedRisk.Id,
        });

      expect(response.appetite_parent.length).toEqual(1);
      expect(response.appetite_parent[0]).toEqual(
        expect.objectContaining({
          Id: insertedAppetite.Id,
          ParentId: insertedRisk.Id,
        })
      );
    });

    it('should return empty list when risk has no appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk with no appetites
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response =
        await trpcClient.frontend.appetite.appetitesByRiskId.query({
          riskId: insertedRisk.Id,
        });

      expect(response.appetite_parent).toEqual([]);
    });
  });

  describe('activeAppetitesByParentId', () => {
    it('should return only active appetites for parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an older appetite (will be archived by trigger)
      const olderDate = new Date();
      olderDate.setDate(olderDate.getDate() - 1);
      const olderAppetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          EffectiveDate: olderDate.toISOString(),
        },
      });
      const olderAppetite = await insertAppetite(olderAppetiteInput);

      if (!olderAppetite) {
        throw new Error('Failed to insert older appetite');
      }

      // Create a newer appetite (will be active)
      const newerAppetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          EffectiveDate: new Date().toISOString(),
        },
      });
      const newerAppetite = await insertAppetite(newerAppetiteInput);

      if (!newerAppetite) {
        throw new Error('Failed to insert newer appetite');
      }

      // Link both appetites to the same risk
      // The trigger will automatically archive the older one
      await insertAppetiteParent(
        buildAppetiteParent({
          orgKey,
          userId,
          appetiteId: olderAppetite.Id,
          parentId: insertedRisk.Id,
        })
      );

      await insertAppetiteParent(
        buildAppetiteParent({
          orgKey,
          userId,
          appetiteId: newerAppetite.Id,
          parentId: insertedRisk.Id,
        })
      );

      const response =
        await trpcClient.frontend.appetite.activeAppetitesByParentId.query({
          parentId: insertedRisk.Id,
        });

      // Only the newer (active) appetite should be returned
      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: newerAppetite.Id,
          Status: AppetiteStatus.Active,
        })
      );
    });

    it('should return appetite with impact details', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk
      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
        overrides: {
          Name: 'Financial Impact',
        },
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create an appetite linked to impact
      const appetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          ImpactId: insertedImpact.Id,
        },
      });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      // Link appetite to risk
      await insertAppetiteParent(
        buildAppetiteParent({
          orgKey,
          userId,
          appetiteId: insertedAppetite.Id,
          parentId: insertedRisk.Id,
        })
      );

      const response =
        await trpcClient.frontend.appetite.activeAppetitesByParentId.query({
          parentId: insertedRisk.Id,
        });

      expect(response.length).toEqual(1);
      expect(response[0]?.appetite?.impact).toEqual(
        expect.objectContaining({
          Id: insertedImpact.Id,
          Name: impactInput.Name,
        })
      );
    });
  });

  describe('getAppetitesGroupedByImpact', () => {
    it('should return empty list when no impacts exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.appetite.getAppetitesGroupedByImpact.query();

      expect(response).toEqual([]);
    });

    it('should return impacts with their appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
        overrides: {
          Name: 'Reputational Impact',
        },
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create an appetite linked to this impact
      const appetiteInput = buildAppetite({
        orgKey,
        userId,
        overrides: {
          ImpactId: insertedImpact.Id,
          Statement: 'Reputational appetite statement',
        },
      });
      const insertedAppetite = await insertAppetite(appetiteInput);

      if (!insertedAppetite) {
        throw new Error('Failed to insert appetite');
      }

      const response =
        await trpcClient.frontend.appetite.getAppetitesGroupedByImpact.query();

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedImpact.Id,
        })
      );
      expect(response[0]?.appetites.length).toEqual(1);
      expect(response[0]?.appetites[0]).toEqual(
        expect.objectContaining({
          Id: insertedAppetite.Id,
          Statement: appetiteInput.Statement,
        })
      );
    });

    it('should return multiple impacts with their appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create first impact
      const impact1Input = buildImpact({
        orgKey,
        userId,
        overrides: {
          Name: 'Financial Impact',
        },
      });
      const insertedImpact1 = await insertImpact(impact1Input);

      // Create second impact
      const impact2Input = buildImpact({
        orgKey,
        userId,
        overrides: {
          Name: 'Operational Impact',
        },
      });
      const insertedImpact2 = await insertImpact(impact2Input);

      if (!insertedImpact1 || !insertedImpact2) {
        throw new Error('Failed to insert impacts');
      }

      // Create appetite for first impact
      await insertAppetite(
        buildAppetite({
          orgKey,
          userId,
          overrides: {
            ImpactId: insertedImpact1.Id,
          },
        })
      );

      // Create appetite for second impact
      await insertAppetite(
        buildAppetite({
          orgKey,
          userId,
          overrides: {
            ImpactId: insertedImpact2.Id,
          },
        })
      );

      const response =
        await trpcClient.frontend.appetite.getAppetitesGroupedByImpact.query();

      expect(response.length).toEqual(2);
      const impactIds = response.map((i) => i.Id);
      expect(impactIds).toContain(insertedImpact1.Id);
      expect(impactIds).toContain(insertedImpact2.Id);
    });
  });

  describe('insert', () => {
    it('should insert a risk appetite with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a risk appetite with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
        Statement: 'We accept moderate risk exposure',
        EffectiveDate: '2026-01-01T00:00:00.000Z',
        LowerAppetite: 1,
        UpperAppetite: 5,
        CustomAttributeData: { customField: 'value' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a risk appetite with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
        Statement: null,
        EffectiveDate: null,
        LowerAppetite: null,
        UpperAppetite: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an impact appetite', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const impactInput = buildImpact({ orgKey, userId });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Impact,
        ParentIds: [insertedRisk.Id],
        ImpactAppetite: 3,
        ImpactId: insertedImpact.Id,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a likelihood appetite', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Likelihood,
        ParentIds: [insertedRisk.Id],
        LikelihoodAppetite: 2,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a likelihood appetite with null LikelihoodAppetite', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Likelihood,
        ParentIds: [insertedRisk.Id],
        LikelihoodAppetite: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert an appetite with multiple parent IDs', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk1Input = buildRisk({ orgKey, userId });
      const insertedRisk1 = await insertRisk(risk1Input);

      const risk2Input = buildRisk({ orgKey, userId });
      const insertedRisk2 = await insertRisk(risk2Input);

      if (!insertedRisk1 || !insertedRisk2) {
        throw new Error('Failed to insert parent risks');
      }

      const response = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk1.Id, insertedRisk2.Id],
      });

      expect(response.Id).toBeDefined();
    });

    it('should verify created risk appetite data via getById', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
        Statement: 'Verifiable statement',
        LowerAppetite: 2,
        UpperAppetite: 5,
      });

      expect(insertResponse.Id).toBeDefined();

      const appetites = await trpcClient.frontend.appetite.getById.query({
        id: insertResponse.Id,
      });

      expect(appetites).toHaveLength(1);
      expect(appetites[0]).toEqual(
        expect.objectContaining({
          Id: insertResponse.Id,
          AppetiteType: AppetiteType.Risk,
          Statement: 'Verifiable statement',
          LowerAppetite: 2,
          UpperAppetite: 5,
        })
      );
    });

    it('should reject insert with an empty ParentIds array', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.insert.mutate({
          AppetiteType: AppetiteType.Risk,
          ParentIds: [],
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid UUID in ParentIds', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.insert.mutate({
          AppetiteType: AppetiteType.Risk,
          ParentIds: [
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          ],
        })
      ).rejects.toThrow();
    });

    it('should reject insert with UpperAppetite out of range (> 5)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      await expect(
        trpcClient.frontend.appetite.insert.mutate({
          AppetiteType: AppetiteType.Risk,
          ParentIds: [insertedRisk.Id],
          LowerAppetite: 1,
          UpperAppetite: 8,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with LowerAppetite out of range (< 1)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      await expect(
        trpcClient.frontend.appetite.insert.mutate({
          AppetiteType: AppetiteType.Risk,
          ParentIds: [insertedRisk.Id],
          LowerAppetite: 0,
          UpperAppetite: 3,
        })
      ).rejects.toThrow();
    });

    it('should reject impact type insert without ImpactAppetite', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const impactInput = buildImpact({ orgKey, userId });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      const missingImpactAppetiteInput = JSON.parse(
        JSON.stringify({
          AppetiteType: AppetiteType.Impact,
          ParentIds: [insertedRisk.Id],
          ImpactId: insertedImpact.Id,
        })
      ) as Parameters<typeof trpcClient.frontend.appetite.insert.mutate>[0];

      await expect(
        trpcClient.frontend.appetite.insert.mutate(missingImpactAppetiteInput)
      ).rejects.toThrow();
    });

    it('should reject impact type insert without ImpactId', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const missingImpactIdInput = JSON.parse(
        JSON.stringify({
          AppetiteType: AppetiteType.Impact,
          ParentIds: [insertedRisk.Id],
          ImpactAppetite: 3,
        })
      ) as Parameters<typeof trpcClient.frontend.appetite.insert.mutate>[0];

      await expect(
        trpcClient.frontend.appetite.insert.mutate(missingImpactIdInput)
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an appetite with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
      });

      const response = await trpcClient.frontend.appetite.update.mutate({
        Id: insertResponse.Id,
        AppetiteType: AppetiteType.Risk,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update an appetite with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const impactInput = buildImpact({ orgKey, userId });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      const insertResponse = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
      });

      const response = await trpcClient.frontend.appetite.update.mutate({
        Id: insertResponse.Id,
        AppetiteType: AppetiteType.Risk,
        Statement: 'Updated statement',
        EffectiveDate: '2026-06-01T00:00:00.000Z',
        LowerAppetite: 2,
        UpperAppetite: 4,
        ImpactAppetite: null,
        LikelihoodAppetite: null,
        ImpactId: null,
        CustomAttributeData: { updatedField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();

      const appetites = await trpcClient.frontend.appetite.getById.query({
        id: response.Id,
      });
      expect(appetites).toHaveLength(1);
      expect(appetites[0]?.Statement).toBe('Updated statement');
      expect(appetites[0]?.LowerAppetite).toBe(2);
      expect(appetites[0]?.UpperAppetite).toBe(4);
    });

    it('should update an appetite with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
        Statement: 'Original statement',
        LowerAppetite: 1,
        UpperAppetite: 3,
      });

      const response = await trpcClient.frontend.appetite.update.mutate({
        Id: insertResponse.Id,
        AppetiteType: AppetiteType.Risk,
        Statement: null,
        EffectiveDate: null,
        LowerAppetite: null,
        UpperAppetite: null,
        ImpactAppetite: null,
        LikelihoodAppetite: null,
        ImpactId: null,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject update with an invalid UUID for Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          AppetiteType: AppetiteType.Risk,
        })
      ).rejects.toThrow();
    });

    it('should reject update with a non-existent appetite Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.update.mutate({
          Id: randomUUID(),
          Statement: 'This appetite does not exist',
          AppetiteType: AppetiteType.Risk,
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single appetite', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({ orgKey, userId });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const insertResponse = await trpcClient.frontend.appetite.insert.mutate({
        AppetiteType: AppetiteType.Risk,
        ParentIds: [insertedRisk.Id],
      });

      expect(insertResponse.Id).toBeDefined();

      const deleteResponse = await trpcClient.frontend.appetite.delete.mutate({
        ids: [insertResponse.Id],
      });

      expect(deleteResponse).toBe('');
    });

    it('should batch delete multiple appetites', async () => {
      const { orgKey, userId, trpcClient } = context;

      const appetite1 = buildAppetite({ orgKey, userId });
      const appetite2 = buildAppetite({ orgKey, userId });
      const inserted1 = await insertAppetite(appetite1);
      const inserted2 = await insertAppetite(appetite2);

      if (!inserted1 || !inserted2) {
        throw new Error('Failed to insert appetites');
      }

      const deleteResponse = await trpcClient.frontend.appetite.delete.mutate({
        ids: [inserted1.Id, inserted2.Id],
      });

      expect(deleteResponse).toBe('');
    });

    it('should throw when deleting a non-existent appetite', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.delete.mutate({
          ids: [randomUUID()],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an invalid UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.delete.mutate({
          ids: ['not-a-uuid'],
        })
      ).rejects.toThrow();
    });

    it('should reject delete with an empty ids array', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.appetite.delete.mutate({
          ids: [],
        })
      ).rejects.toThrow();
    });
  });
});
