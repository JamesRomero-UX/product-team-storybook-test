import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { buildEnterpriseRisk } from '../data/enterpriseRisk';
import { buildEntity } from '../data/entity';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
  thirdPartyRespondent1,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('Enterprise Risk', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to insert $expectedRecords enterprise risk',
      async ({ expectedRecords, ...user }) => {
        const enterpriseRisk = {
          ...buildEnterpriseRisk(),
          Id: undefined,
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.insertEnterpriseRisk(
              {
                object: enterpriseRisk,
              },
              { user }
            )
          ).rejects.toThrowError('Access denied');
        } else {
          const response = await apiClient.insertEnterpriseRisk(
            {
              object: enterpriseRisk,
            },
            { user }
          );
          expect(response.insertChildEnterpriseRisk?.Id).toBeDefined();
        }
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to update $expectedRecords enterprise risk',
      async ({ expectedRecords, ...user }) => {
        const enterpriseRisk = buildEnterpriseRisk();

        await apiClient.insertEnterpriseRiskInput({
          objects: [
            {
              ...enterpriseRisk,
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: user.Id,
              ModifiedByUser: user.Id,
              ModifiedAtTimestamp: new Date().toUTCString(),
            },
          ],
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateEnterpriseRisk(
              {
                object: { ...enterpriseRisk, Title: 'Updated title' },
              },
              { user }
            )
          ).rejects.toThrowError('Access denied');
        } else {
          const response = await apiClient.updateEnterpriseRisk(
            {
              object: { ...enterpriseRisk, Title: 'Updated title' },
            },
            { user }
          );
          expect(response.updateChildEnterpriseRisk?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to delete $expectedRecords enterprise risk',
      async ({ expectedRecords, ...user }) => {
        const enterpriseRisk = buildEnterpriseRisk();

        await apiClient.insertEnterpriseRiskInput({
          objects: [
            {
              ...enterpriseRisk,
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: user.Id,
              ModifiedByUser: user.Id,
              ModifiedAtTimestamp: new Date().toUTCString(),
            },
          ],
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.deleteEnterpriseRisk({ Id: enterpriseRisk.Id }, { user })
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        } else {
          const response = await apiClient.deleteEnterpriseRisk(
            {
              Id: enterpriseRisk.Id,
            },
            { user }
          );
          expect(response.deleteChildEnterpriseRisk?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to query $expectedRecords enterprise risk',
      async ({ expectedRecords, ...user }) => {
        const enterpriseRisk = buildEnterpriseRisk();

        await apiClient.insertEnterpriseRiskInput({
          objects: [
            {
              ...enterpriseRisk,
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: user.Id,
              ModifiedByUser: user.Id,
              ModifiedAtTimestamp: new Date().toUTCString(),
            },
          ],
        });

        const enterpriseRisks = await apiClient.getEnterpriseRisk(
          { where: {} },
          { user }
        );
        expect(enterpriseRisks.enterprise_risk).toHaveLength(expectedRecords);
      }
    );
  });

  describe('instantiate', () => {
    it('creates a risk instance for each enterprise risk for each department', async () => {
      const enterpriseRisk1 = buildEnterpriseRisk({ Tier: 1, Title: 'ER 1' });
      const enterpriseRisk21 = buildEnterpriseRisk({
        Tier: 2,
        Title: 'ER 2.1',
      });
      const enterpriseRisk22 = buildEnterpriseRisk({
        Tier: 2,
        Title: 'ER 2.2',
      });
      const enterpriseRisk31 = buildEnterpriseRisk({
        Tier: 3,
        Title: 'ER 3.1',
      });
      const enterpriseRisk32 = buildEnterpriseRisk({
        Tier: 3,
        Title: 'ER 3.2',
      });
      const enterpriseRisk33 = buildEnterpriseRisk({
        Tier: 3,
        Title: 'ER 3.3',
      });

      const entities = buildEntity({
        Name: 'Entity 1',
        OrgKey: getDefaultOrgId(),
        CreatedAtTimestamp: new Date().toUTCString(),
        CreatedByUser: getDefaultUserId(),
        ModifiedByUser: getDefaultUserId(),
        ModifiedAtTimestamp: new Date().toUTCString(),
        owners: { data: [buildOwner({ UserId: riskManagerUser1.Id })] },
        children: {
          data: [
            buildEntity({
              Name: 'Entity 2',
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: getDefaultUserId(),
              ModifiedByUser: getDefaultUserId(),
              ModifiedAtTimestamp: new Date().toUTCString(),
              owners: { data: [buildOwner({ UserId: readOnlyUser1.Id })] },
              children: {
                data: [
                  buildEntity({
                    Name: 'Entity 3',
                    OrgKey: getDefaultOrgId(),
                    CreatedAtTimestamp: new Date().toUTCString(),
                    CreatedByUser: getDefaultUserId(),
                    ModifiedByUser: getDefaultUserId(),
                    ModifiedAtTimestamp: new Date().toUTCString(),
                    owners: {
                      data: [buildOwner({ UserId: standardEnhancedUser1.Id })],
                    },
                  }),
                  buildEntity({
                    Name: 'Entity 4',
                    OrgKey: getDefaultOrgId(),
                    CreatedAtTimestamp: new Date().toUTCString(),
                    CreatedByUser: getDefaultUserId(),
                    ModifiedByUser: getDefaultUserId(),
                    ModifiedAtTimestamp: new Date().toUTCString(),
                    owners: {
                      data: [buildOwner({ UserId: standardUser1.Id })],
                    },
                  }),
                ],
              },
            }),
          ],
        },
      });

      await apiClient.insertEntity({ object: entities });

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk1,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
            children: {
              data: [
                {
                  ...enterpriseRisk21,
                  OrgKey: getDefaultOrgId(),
                  CreatedAtTimestamp: new Date().toUTCString(),
                  CreatedByUser: getDefaultUserId(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toUTCString(),
                  children: {
                    data: [
                      {
                        ...enterpriseRisk31,
                        OrgKey: getDefaultOrgId(),
                        CreatedAtTimestamp: new Date().toUTCString(),
                        CreatedByUser: getDefaultUserId(),
                        ModifiedByUser: getDefaultUserId(),
                        ModifiedAtTimestamp: new Date().toUTCString(),
                      },
                    ],
                  },
                },
                {
                  ...enterpriseRisk22,
                  OrgKey: getDefaultOrgId(),
                  CreatedAtTimestamp: new Date().toUTCString(),
                  CreatedByUser: getDefaultUserId(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toUTCString(),
                  children: {
                    data: [
                      {
                        ...enterpriseRisk32,
                        OrgKey: getDefaultOrgId(),
                        CreatedAtTimestamp: new Date().toUTCString(),
                        CreatedByUser: getDefaultUserId(),
                        ModifiedByUser: getDefaultUserId(),
                        ModifiedAtTimestamp: new Date().toUTCString(),
                      },
                      {
                        ...enterpriseRisk33,
                        OrgKey: getDefaultOrgId(),
                        CreatedAtTimestamp: new Date().toUTCString(),
                        CreatedByUser: getDefaultUserId(),
                        ModifiedByUser: getDefaultUserId(),
                        ModifiedAtTimestamp: new Date().toUTCString(),
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });

      await apiClient.instantiateEnterpriseRisk(
        {
          object: {
            EnterpriseRiskIds: [enterpriseRisk31.Id, enterpriseRisk33.Id],
            Entities: [entities.Id as string],
          },
        },
        {
          user: riskManagerUser1,
        }
      );

      const risks = await apiClient.getAllRisksWithOwnersAndEntities(
        {},
        { user: riskManagerUser1 }
      );

      const tierOneRisks = risks.risk.filter((risk) => risk.Tier === 1);
      tierOneRisks.sort((a, b) => {
        if (
          !a.enterpriseRiskInstance?.entity?.Name ||
          !b.enterpriseRiskInstance?.entity?.Name
        ) {
          return 0;
        }

        return a.enterpriseRiskInstance.entity.Name >
          b.enterpriseRiskInstance.entity.Name
          ? 1
          : -1;
      });
      const tierTwoRisks = risks.risk.filter((risk) => risk.Tier === 2);
      const tierThreeRisks = risks.risk.filter((risk) => risk.Tier === 3);

      expect(risks.risk).toHaveLength(10);

      expect(tierOneRisks).toHaveLength(2);
      expect(tierOneRisks[0].Title).toEqual(enterpriseRisk1.Title);
      expect(tierOneRisks[0].owners.map((o) => o.user?.Id)).toEqual(
        expect.arrayContaining([
          riskManagerUser1.Id,
          readOnlyUser1.Id,
          standardEnhancedUser1.Id,
        ])
      );
      expect(tierOneRisks[0].enterpriseRiskInstance?.entity?.Name).toEqual(
        'Entity 3'
      );
      expect(
        tierOneRisks[0].enterpriseRiskInstance?.enterpriseRisk?.Title
      ).toEqual('ER 1');

      expect(tierOneRisks[1].Title).toEqual(enterpriseRisk1.Title);
      expect(tierOneRisks[1].owners.map((o) => o.user?.Id)).toEqual(
        expect.arrayContaining([
          riskManagerUser1.Id,
          readOnlyUser1.Id,
          standardUser1.Id,
        ])
      );
      expect(tierOneRisks[1].enterpriseRiskInstance?.entity?.Name).toEqual(
        'Entity 4'
      );
      expect(
        tierOneRisks[1].enterpriseRiskInstance?.enterpriseRisk?.Title
      ).toEqual('ER 1');

      expect(tierTwoRisks).toHaveLength(4);
      expect(tierThreeRisks).toHaveLength(4);
    });
  });

  describe('link', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey can/cannot link a risk to an enterprise risk',
      async ({ expectedRecords, ...user }) => {
        const enterpriseRisk = buildEnterpriseRisk();

        await apiClient.insertEnterpriseRiskInput({
          objects: [
            {
              ...enterpriseRisk,
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: user.Id,
              ModifiedByUser: user.Id,
              ModifiedAtTimestamp: new Date().toUTCString(),
            },
          ],
        });

        const risk = buildRisk();

        await apiClient.insertRisk({
          objects: [
            {
              ...risk,
              OrgKey: getDefaultOrgId(),
              CreatedAtTimestamp: new Date().toUTCString(),
              CreatedByUser: user.Id,
              ModifiedByUser: user.Id,
              ModifiedAtTimestamp: new Date().toUTCString(),
            },
          ],
        });

        const entity = buildEntity();

        await apiClient.insertEntity({
          object: {
            ...entity,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: user.Id,
            ModifiedByUser: user.Id,
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.addRiskToEnterpriseRisk(
              {
                objects: [
                  {
                    RiskId: risk.Id!,
                    EnterpriseRiskId: enterpriseRisk.Id,
                    EntityId: entity.Id!,
                  },
                ],
              },
              { user }
            )
          ).rejects.toThrowError('Access denied');
        } else {
          await expect(
            apiClient.addRiskToEnterpriseRisk(
              {
                objects: [
                  {
                    RiskId: risk.Id!,
                    EnterpriseRiskId: enterpriseRisk.Id,
                    EntityId: entity.Id!,
                  },
                ],
              },
              { user }
            )
          ).resolves.toEqual(
            expect.objectContaining({
              addRiskToEnterpriseRisk: expect.objectContaining({
                affected_rows: expectedRecords,
              }),
            })
          );
        }
      }
    );

    it('re-links a risk to a different entity', async () => {
      const enterpriseRisk = buildEnterpriseRisk();
      const risk = buildRisk();
      const entity1 = buildEntity();
      const entity2 = buildEntity();

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertRisk({
        objects: [
          {
            ...risk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertEntity({
        object: {
          ...entity1,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });
      await apiClient.insertEntity({
        object: {
          ...entity2,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk.Id,
              EntityId: entity1.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      const relink = await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk.Id,
              EntityId: entity2.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );
      expect(
        relink.addRiskToEnterpriseRisk?.affected_rows
      ).toBeGreaterThanOrEqual(0);

      const risks = await apiClient.getAllRisksWithOwnersAndEntities(
        {},
        { user: riskManagerUser1 }
      );
      const linked = risks.risk.find((r) => r.Id === risk.Id);
      expect(linked?.enterpriseRiskInstance?.entity?.Id).toEqual(entity2.Id);
    });

    it('re-links a risk to a different enterprise risk', async () => {
      const enterpriseRisk1 = buildEnterpriseRisk();
      const enterpriseRisk2 = buildEnterpriseRisk();
      const risk = buildRisk();
      const entity = buildEntity();

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk1,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
          {
            ...enterpriseRisk2,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertRisk({
        objects: [
          {
            ...risk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertEntity({
        object: {
          ...entity,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk1.Id,
              EntityId: entity.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk2.Id,
              EntityId: entity.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      const risks = await apiClient.getAllRisksWithOwnersAndEntities(
        {},
        { user: riskManagerUser1 }
      );
      const linked = risks.risk.find((r) => r.Id === risk.Id);
      expect(linked?.enterpriseRiskInstance?.enterpriseRisk?.Id).toEqual(
        enterpriseRisk2.Id
      );
    });

    it('changes both entity and enterprise risk simultaneously', async () => {
      const enterpriseRisk1 = buildEnterpriseRisk();
      const enterpriseRisk2 = buildEnterpriseRisk();
      const risk = buildRisk();
      const entity1 = buildEntity();
      const entity2 = buildEntity();

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk1,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
          {
            ...enterpriseRisk2,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertRisk({
        objects: [
          {
            ...risk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertEntity({
        object: {
          ...entity1,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });
      await apiClient.insertEntity({
        object: {
          ...entity2,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk1.Id,
              EntityId: entity1.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk2.Id,
              EntityId: entity2.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      const risks = await apiClient.getAllRisksWithOwnersAndEntities(
        {},
        { user: riskManagerUser1 }
      );
      const linked = risks.risk.find((r) => r.Id === risk.Id);
      expect(linked?.enterpriseRiskInstance?.entity?.Id).toEqual(entity2.Id);
      expect(linked?.enterpriseRiskInstance?.enterpriseRisk?.Id).toEqual(
        enterpriseRisk2.Id
      );
    });

    it('clears EnterpriseRiskId while updating EntityId', async () => {
      const enterpriseRisk = buildEnterpriseRisk();
      const risk = buildRisk();
      const entity1 = buildEntity();
      const entity2 = buildEntity();

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertRisk({
        objects: [
          {
            ...risk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertEntity({
        object: {
          ...entity1,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });
      await apiClient.insertEntity({
        object: {
          ...entity2,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: enterpriseRisk.Id,
              EntityId: entity1.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      await apiClient.addRiskToEnterpriseRisk(
        {
          objects: [
            {
              RiskId: risk.Id!,
              EnterpriseRiskId: null,
              EntityId: entity2.Id!,
            },
          ],
        },
        { user: riskManagerUser1 }
      );

      const risks = await apiClient.getAllRisksWithOwnersAndEntities(
        {},
        { user: riskManagerUser1 }
      );
      const linked = risks.risk.find((r) => r.Id === risk.Id);
      expect(linked?.enterpriseRiskInstance?.entity?.Id).toEqual(entity2.Id);
      expect(linked?.enterpriseRiskInstance?.enterpriseRisk).toBeNull();
    });

    it('no-op upsert (same values) does not return an error', async () => {
      const enterpriseRisk = buildEnterpriseRisk();
      const risk = buildRisk();
      const entity = buildEntity();

      await apiClient.insertEnterpriseRiskInput({
        objects: [
          {
            ...enterpriseRisk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertRisk({
        objects: [
          {
            ...risk,
            OrgKey: getDefaultOrgId(),
            CreatedAtTimestamp: new Date().toUTCString(),
            CreatedByUser: getDefaultUserId(),
            ModifiedByUser: getDefaultUserId(),
            ModifiedAtTimestamp: new Date().toUTCString(),
          },
        ],
      });
      await apiClient.insertEntity({
        object: {
          ...entity,
          OrgKey: getDefaultOrgId(),
          CreatedAtTimestamp: new Date().toUTCString(),
          CreatedByUser: getDefaultUserId(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toUTCString(),
        },
      });

      const linkArgs = {
        objects: [
          {
            RiskId: risk.Id!,
            EnterpriseRiskId: enterpriseRisk.Id,
            EntityId: entity.Id!,
          },
        ],
      };

      await apiClient.addRiskToEnterpriseRisk(linkArgs, {
        user: riskManagerUser1,
      });

      // Re-submit same values — should succeed without throwing
      await expect(
        apiClient.addRiskToEnterpriseRisk(linkArgs, { user: riskManagerUser1 })
      ).resolves.toBeDefined();
    });
  });
});
