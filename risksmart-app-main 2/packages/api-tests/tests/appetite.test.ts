import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  buildAppetite,
  buildAppetiteParent,
  buildChildAppetite,
} from '../data/appetite';
import { buildContributor } from '../data/contributor';
import { buildImpactBackend } from '../data/impact';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { AppetiteStatusEnum, AppetiteTypeEnum } from '../generated/graphql';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('appetite', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords appetites where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        const { appetite: appetites } = await apiClient.getAllAppetites(
          {},
          {
            user,
          }
        );
        expect(appetites.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords appetites where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        const { appetite: appetites } = await apiClient.getAllAppetites(
          {},
          {
            user,
          }
        );
        expect(appetites.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords appetites where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [
                buildAppetiteParent(
                  buildAppetiteParent({ ParentId: risk.Id! })
                ),
              ],
            },
          }),
        });

        const { appetite: appetites } = await apiClient.getAllAppetites(
          {},
          {
            user,
          }
        );
        expect(appetites.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it('deleting an active appetite sets the next most recent appetite to be active', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      const firstAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: null,
      });
      await apiClient.insertAppetites({ objects: firstAppetite });
      const latestAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: null,
      });
      await apiClient.insertAppetites({ objects: latestAppetite });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        {},
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(2);
      expect(
        appetite_parent.find((ap) => ap.Id === latestAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
      expect(
        appetite_parent.find((ap) => ap.Id === firstAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);

      await apiClient.deleteAppetite(
        { appetiteId: latestAppetite.Id! },
        { user: riskManagerUser1 }
      );

      const { appetite_parent: afterDeleteAppetites } =
        await apiClient.getAppetiteParents({}, { user: riskManagerUser1 });
      expect(afterDeleteAppetites.length).toEqual(1);

      expect(
        afterDeleteAppetites.find((ap) => ap.Id === firstAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
    });

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey delete $expectedRecords appetites where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { delete_appetite } = await apiClient.deleteAppetite(
          { appetiteId: insert_appetite?.returning[0].Id },
          {
            user,
          }
        );
        expect(delete_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords appetites where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { delete_appetite } = await apiClient.deleteAppetite(
          { appetiteId: insert_appetite?.returning[0].Id },
          {
            user,
          }
        );
        expect(delete_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords appetites where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { delete_appetite } = await apiClient.deleteAppetite(
          { appetiteId: insert_appetite?.returning[0].Id },
          {
            user,
          }
        );
        expect(delete_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it('updating an active appetites effective date to before the effective date of another appetite of the risk should sets its status to archived, and the most recent effective date to active', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      const firstAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: '2021-01-01',
      });
      await apiClient.insertAppetites({ objects: firstAppetite });
      const latestAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: '2022-01-01',
      });
      await apiClient.insertAppetites({ objects: latestAppetite });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        {},
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(2);
      expect(
        appetite_parent.find((ap) => ap.Id === latestAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
      expect(
        appetite_parent.find((ap) => ap.Id === firstAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);

      await apiClient.updateAppetite(
        {
          Id: latestAppetite.Id!,
          set: {
            EffectiveDate: '2020-01-01',
          },
        },
        { user: riskManagerUser1 }
      );

      const { appetite_parent: afterUpdateAppetites } =
        await apiClient.getAppetiteParents({}, { user: riskManagerUser1 });
      expect(afterUpdateAppetites.length).toEqual(2);

      expect(
        afterUpdateAppetites.find((ap) => ap.Id === latestAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);
      expect(
        afterUpdateAppetites.find((ap) => ap.Id === firstAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
    });

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey updates $expectedRecords appetites where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { update_appetite } = await apiClient.updateAppetite(
          {
            Id: insert_appetite?.returning[0].Id,
            set: { Statement: 'updated' },
          },
          {
            user,
          }
        );
        expect(update_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey updates $expectedRecords appetites where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });

        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { update_appetite } = await apiClient.updateAppetite(
          {
            Id: insert_appetite?.returning[0].Id,
            set: { Statement: 'updated' },
          },
          {
            user,
          }
        );
        expect(update_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey updates $expectedRecords appetites where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insert_appetite } = await apiClient.insertAppetites({
          objects: buildAppetite({
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        });
        if (!insert_appetite?.returning[0].Id) {
          throw new Error('Appetite not inserted');
        }

        const { update_appetite } = await apiClient.updateAppetite(
          {
            Id: insert_appetite?.returning[0].Id,
            set: { Statement: 'updated' },
          },
          {
            user,
          }
        );
        expect(update_appetite?.affected_rows).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it('first inserted impact appetite of a risk/impact combination has a status of active', async () => {
      const risk = buildRisk({});
      const impact1 = buildImpactBackend();
      const impact2 = buildImpactBackend();
      await apiClient.insertRisk({ objects: risk });
      await apiClient.insertImpactBackend({ objects: [impact1, impact2] });

      await apiClient.insertAppetites({
        objects: [
          buildAppetite({
            AppetiteType: AppetiteTypeEnum.Impact,
            ImpactId: impact1.Id,
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
          buildAppetite({
            AppetiteType: AppetiteTypeEnum.Impact,
            ImpactId: impact2.Id,
            parents: {
              data: [buildAppetiteParent({ ParentId: risk.Id! })],
            },
          }),
        ],
      });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        { where: { ParentId: { _eq: risk.Id! } } },
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(2);
      expect(appetite_parent[0].Status).toEqual(AppetiteStatusEnum.Active);
      expect(appetite_parent[1].Status).toEqual(AppetiteStatusEnum.Active);
    });

    it('latest inserted impact appetite of a risk/impact combination has a status of active', async () => {
      const risk = buildRisk({});
      const impact1 = buildImpactBackend();
      const impact2 = buildImpactBackend();
      await apiClient.insertRisk({ objects: risk });
      await apiClient.insertImpactBackend({ objects: [impact1, impact2] });
      const impact1AppetiteFirst = buildAppetite({
        AppetiteType: AppetiteTypeEnum.Impact,
        ImpactId: impact1.Id,
        parents: {
          data: [buildAppetiteParent({ ParentId: risk.Id! })],
        },
      });
      const impact2AppetiteFirst = buildAppetite({
        AppetiteType: AppetiteTypeEnum.Impact,
        ImpactId: impact2.Id,
        parents: {
          data: [buildAppetiteParent({ ParentId: risk.Id! })],
        },
      });
      await apiClient.insertAppetites({
        objects: [impact1AppetiteFirst, impact2AppetiteFirst],
      });

      const impact1AppetiteLatest = buildAppetite({
        AppetiteType: AppetiteTypeEnum.Impact,
        ImpactId: impact1.Id,
        parents: {
          data: [buildAppetiteParent({ ParentId: risk.Id! })],
        },
      });

      await apiClient.insertAppetites({ objects: [impact1AppetiteLatest] });

      const { appetite_parent } = await apiClient.getAppetiteParents(
        { where: { ParentId: { _eq: risk.Id! } } },
        { user: riskManagerUser1 }
      );
      console.log(appetite_parent);
      expect(appetite_parent.length).toEqual(3);
      expect(
        appetite_parent.find((a) => a.Id == impact1AppetiteFirst.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);
      expect(
        appetite_parent.find((a) => a.Id == impact1AppetiteLatest.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
      expect(
        appetite_parent.find((a) => a.Id == impact2AppetiteFirst.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
    });

    it('first inserted appetite of a risk has a status of active', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      await apiClient.insertAppetites({
        objects: buildAppetite({
          parents: {
            data: [buildAppetiteParent({ ParentId: risk.Id! })],
          },
        }),
      });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        {},
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(1);
      expect(appetite_parent[0].Status).toEqual(AppetiteStatusEnum.Active);
    });

    it('latest inserted appetite of a risk has a status of active (when no effective dates)', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      const firstAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: null,
      });
      await apiClient.insertAppetites({ objects: firstAppetite });
      const latestAppetite = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: null,
      });
      await apiClient.insertAppetites({ objects: latestAppetite });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        {},
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(2);
      expect(
        appetite_parent.find((ap) => ap.Id === latestAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Active);
      expect(
        appetite_parent.find((ap) => ap.Id === firstAppetite.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);
    });

    it('appetite with most recent effective date for a risk has a status of active', async () => {
      const risk = buildRisk({});
      await apiClient.insertRisk({ objects: risk });

      const mostRecentEffectiveDate = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: '2021-01-01',
      });
      await apiClient.insertAppetites({ objects: mostRecentEffectiveDate });
      const olderEffectiveDate = buildAppetite({
        parents: { data: [buildAppetiteParent({ ParentId: risk.Id! })] },
        EffectiveDate: '2020-01-01',
      });
      await apiClient.insertAppetites({ objects: olderEffectiveDate });
      const { appetite_parent } = await apiClient.getAppetiteParents(
        {},
        { user: riskManagerUser1 }
      );
      expect(appetite_parent.length).toEqual(2);
      expect(
        appetite_parent.find((ap) => ap.Id === mostRecentEffectiveDate.Id)
          ?.Status
      ).toEqual(AppetiteStatusEnum.Active);
      expect(
        appetite_parent.find((ap) => ap.Id === olderEffectiveDate.Id)?.Status
      ).toEqual(AppetiteStatusEnum.Archived);
    });

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey inserts appetites where they are not the Owner or contributor of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        const { insertChildAppetite } = await apiClient.insertChildAppetite(
          buildChildAppetite({
            ParentRiskId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(insertChildAppetite?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert an appetite where they are not the Owner or contributor of the parent risk',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertChildAppetite(
            buildChildAppetite({
              ParentRiskId: risk.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey inserts appetites where they are the owner of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insertChildAppetite } = await apiClient.insertChildAppetite(
          buildChildAppetite({
            ParentRiskId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(insertChildAppetite?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey updates appetites where they are a contributor of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { insertChildAppetite } = await apiClient.insertChildAppetite(
          buildChildAppetite({
            ParentRiskId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(insertChildAppetite?.Id).toBeDefined();
      }
    );
  });
});
