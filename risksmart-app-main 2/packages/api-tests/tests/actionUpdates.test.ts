import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { insertObligation } from '../clients/obligationClient';
import { buildAction } from '../data/action';
import { buildActionUpdate } from '../data/actionUpdate';
import { buildContributor } from '../data/contributor';
import { buildObligation } from '../data/obligation';
import { buildOwner } from '../data/owner';
import { ParentTypeEnum } from '../generated/graphql';
import {
  anotherUser,
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

describe('action updates', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 30000);

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
      '$RoleKey should see $expectedRecords action updates where they are not the Owner or contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            updates: {
              data: [buildActionUpdate({})],
            },
          }),
        });

        const actionUpdates = await apiClient.getActionUpdates(
          {},
          {
            user,
          }
        );
        expect(actionUpdates.action_update.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are the owner of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            updates: {
              data: [buildActionUpdate({})],
            },
          }),
        });

        const actionUpdates = await apiClient.getActionUpdates(
          {},
          {
            user,
          }
        );
        expect(actionUpdates.action_update.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are a contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            updates: {
              data: [buildActionUpdate({})],
            },
          }),
        });

        const actionUpdates = await apiClient.getActionUpdates(
          {},
          {
            user,
          }
        );
        expect(actionUpdates.action_update.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      { ...standardEnhancedUser1, deletedRecords: 0 },
      { ...internalAuditUser1, deletedRecords: 0 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an action update where they are not a contributor/owner of a parent, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.deleteActionUpdate(
          { Id: actionUpdate.Id! },
          {
            user,
          }
        );
        expect(data?.delete_action_update?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an action update where they are the owner of the parent action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.deleteActionUpdate(
          { Id: actionUpdate.Id! },
          {
            user,
          }
        );
        expect(data?.delete_action_update?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an action update where they are a contributor of the parent action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.deleteActionUpdate(
          { Id: actionUpdate.Id! },
          {
            user,
          }
        );
        expect(data?.delete_action_update?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords action updates when not the contributor/owner of parent action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction();
        await apiClient.insertActions({ objects: action });
        const data = await apiClient.insertActionUpdates(
          {
            objects: buildActionUpdate({
              ParentActionId: action.Id,
              OrgKey: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(data?.insert_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      standardUser1,
      // TODO: enable when readonly used same hasura role as standard
      //readOnlyUser1
    ])(
      '$RoleKey cannot insert action updates when not the contributor/owner of parent action',
      async (user) => {
        const action = buildAction();
        await apiClient.insertActions({ objects: action });
        await expect(
          apiClient.insertActionUpdates(
            {
              objects: buildActionUpdate({
                ParentActionId: action.Id,
                OrgKey: undefined,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords action updates is contributor of parent action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertActions({ objects: action });
        const data = await apiClient.insertActionUpdates(
          {
            objects: buildActionUpdate({
              ParentActionId: action.Id,
              OrgKey: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(data?.insert_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords action updates is owner of parent action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertActions({ objects: action });
        const data = await apiClient.insertActionUpdates(
          {
            objects: buildActionUpdate({
              ParentActionId: action.Id,
              OrgKey: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(data?.insert_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords action updates when NOT owner or contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.updateActionUpdate(
          {
            Title: 'updated title',
            Id: actionUpdate.Id!,
          },
          {
            user,
          }
        );
        expect(data?.update_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords action updates if they are the contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await insertObligation(
          buildObligation({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            actions: {
              data: [
                {
                  ModifiedByUser: anotherUser.Id,
                  CreatedByUser: anotherUser.Id,
                  OrgKey: getDefaultOrgId(),
                  ParentType: ParentTypeEnum.Action,
                  action: {
                    data: buildAction({
                      updates: {
                        data: [actionUpdate],
                      },
                    }),
                  },
                },
              ],
            },
          })
        );

        const data = await apiClient.updateActionUpdate(
          {
            Title: 'updated title',
            Id: actionUpdate.Id!,
          },
          {
            user,
          }
        );
        expect(data?.update_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords action updates if they are the owner of the parent action',
      async ({ expectedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.updateActionUpdate(
          {
            Title: 'updated title',
            Id: actionUpdate.Id!,
          },
          {
            user,
          }
        );
        expect(data?.update_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords action updates if they are the contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        const actionUpdate = buildActionUpdate({});
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            updates: {
              data: [actionUpdate],
            },
          }),
        });

        const data = await apiClient.updateActionUpdate(
          {
            Title: 'updated title',
            Id: actionUpdate.Id!,
          },
          {
            user,
          }
        );

        expect(data?.update_action_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
