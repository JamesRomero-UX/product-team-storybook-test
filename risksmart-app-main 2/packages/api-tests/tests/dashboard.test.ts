import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteDashboard,
  getDashboards,
  insertChildDashboard,
  insertDashboard,
  updateChildDashboard,
  updateDashboard,
} from '../clients/dashboardClient';
import { buildContributor } from '../data/contributor';
import { buildChildDashboard, buildDashboard } from '../data/dashboard';
import { buildOwner } from '../data/owner';
import {
  DashboardSharingTypeEnum,
  DashboardSharingTypeEnumAction,
} from '../generated/graphql';
import {
  anotherUser,
  customerSupportUser1,
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

describe('dashboard', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should not see dashboards owned by other users if Sharing is set to UserOnly',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.UserOnly,
        });
        await insertDashboard(dashboard);

        const dashboards = await getDashboards({
          user,
        });
        expect(dashboards.length).toEqual(0);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should see owned dashboards if Sharing is set to UserOnly',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: user.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.UserOnly,
        });
        await insertDashboard(dashboard);

        const dashboards = await getDashboards({
          user,
        });
        expect(dashboards.length).toEqual(1);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should see dashboards owned by other users if Sharing is set to Organisation',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.Organisation,
        });
        await insertDashboard(dashboard);

        const dashboards = await getDashboards({
          user,
        });
        expect(dashboards.length).toEqual(1);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should not see dashboards owned by other users if Sharing is set to Custom and they are not in the user list',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.Custom,
        });
        await insertDashboard(dashboard);

        const dashboards = await getDashboards({
          user,
        });
        expect(dashboards.length).toEqual(0);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should see dashboards owned by other users if Sharing is set to Custom and they are a contributor',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.Custom,
          contributors: {
            data: [buildContributor({ UserId: user.Id! })],
          },
        });
        await insertDashboard(dashboard);

        const dashboards = await getDashboards({
          user,
        });
        expect(dashboards.length).toEqual(1);
      }
    );
  });

  describe('delete', () => {
    it.each([riskManagerUser1, standardUser1, readOnlyUser1])(
      '$RoleKey cannot delete other users dashboards',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
        });
        await insertDashboard(dashboard);

        const result = await deleteDashboard(
          { Id: dashboard.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_dashboard?.affected_rows).toEqual(0);
      }
    );

    it.each([riskManagerUser1, standardUser1, readOnlyUser1])(
      '$RoleKey can delete owned dashboard',
      async ({ ...user }) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: user.Id! })],
          },
        });
        await insertDashboard(dashboard);

        const result = await deleteDashboard(
          { Id: dashboard.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_dashboard?.affected_rows).toEqual(1);
      }
    );
  });

  describe('update action', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey should be able to update owned dashboard', async (user) => {
      const dashboard = buildDashboard({
        owners: {
          data: [buildOwner({ UserId: user.Id! })],
        },
      });
      await insertDashboard(dashboard);

      const result = await updateChildDashboard(
        {
          Id: dashboard.Id!,
          Sharing:
            dashboard.Sharing! as unknown as DashboardSharingTypeEnumAction,
          Content: dashboard.Content!,
          Name: 'Updated',
          ContributorGroupIds: [],
          ContributorUserIds: [],
        },
        {
          user,
        }
      );
      expect(result.data?.updateChildDashboard?.Id).toBeDefined();
    });

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should NOT be able to update other users dashboards',
      async (user) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.Organisation,
        });
        await insertDashboard(dashboard);

        await expect(
          updateChildDashboard(
            {
              Id: dashboard.Id!,
              Sharing:
                dashboard.Sharing! as unknown as DashboardSharingTypeEnumAction,
              Content: dashboard.Content!,
              Name: 'Updated',
              ContributorGroupIds: [],
              ContributorUserIds: [],
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      customerSupportUser1,
    ])(
      '$RoleKey cannot update dashboard directly (should be backend only)',
      async (user) => {
        const dashboard = buildDashboard({
          owners: {
            data: [buildOwner({ UserId: anotherUser.Id! })],
          },
          Sharing: DashboardSharingTypeEnum.Organisation,
        });
        await insertDashboard(dashboard);

        await expect(
          updateDashboard(
            { Id: dashboard.Id!, Name: 'updated' },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_dashboard' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insert', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      customerSupportUser1,
    ])(
      '$RoleKey cannot insert dashboard directly (should be backend only)',
      async (user) => {
        const dashboard = buildDashboard({
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          Sharing: DashboardSharingTypeEnum.UserOnly,
        });

        await expect(
          insertDashboard(dashboard, {
            user,
          })
        ).rejects.toThrow(
          "field 'insert_dashboard' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insert child action', () => {
    it.each([riskManagerUser1, standardUser1, standardEnhancedUser1])(
      '$RoleKey should be able to insert dashboards that are private',
      async (user) => {
        const dashboard = buildChildDashboard({
          Sharing: DashboardSharingTypeEnumAction.UserOnly,
        });

        const result = await insertChildDashboard(dashboard, {
          user,
        });
        expect(result.data?.insertChildDashboard?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey should be able insert dashboards that are shared',
      async (user) => {
        const dashboard = buildChildDashboard({
          Sharing: DashboardSharingTypeEnumAction.Organisation,
        });

        const result = await insertChildDashboard(dashboard, {
          user,
        });
        expect(result.data?.insertChildDashboard?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1])(
      '$RoleKey should NOT be able insert dashboards where that are shared',
      async (user) => {
        const dashboard = buildChildDashboard({
          Sharing: DashboardSharingTypeEnumAction.Organisation,
        });

        await expect(
          insertChildDashboard(dashboard, {
            user,
          })
        ).rejects.toThrowError('Access denied');
      }
    );
  });
});
