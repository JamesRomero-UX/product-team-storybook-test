import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildContributor } from '../data/contributor';
import {
  buildInsertChildObligation,
  buildObligation,
  buildUpdateChildObligation,
} from '../data/obligation';
import { buildOwner } from '../data/owner';
import {
  ObligationTypeEnum,
  ObligationTypeEnumAction,
} from '../generated/graphql';
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

const mapToActionType = (
  type: ObligationTypeEnum
): ObligationTypeEnumAction => {
  switch (type) {
    case ObligationTypeEnum.Standard:
      return ObligationTypeEnumAction.Standard;
    case ObligationTypeEnum.Chapter:
      return ObligationTypeEnumAction.Chapter;
    case ObligationTypeEnum.Rule:
      return ObligationTypeEnumAction.Rule;
    case ObligationTypeEnum.Task:
      return ObligationTypeEnumAction.Task;
    default:
      throw new Error(`Unsupported obligation type: ${type}`);
  }
};

describe('obligation', () => {
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
      '$RoleKey should see $expectedRecords obligations where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({});
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { obligation: obligations } = await apiClient.getObligations(
          {},
          {
            user,
          }
        );
        expect(obligations.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligations where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { obligation: obligations } = await apiClient.getObligations(
          {},
          {
            user,
          }
        );
        expect(obligations.length).toEqual(expectedRecords);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should see child obligations where they are the owner of the parent',
      async ({ ...user }) => {
        const parentObligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: parentObligation,
        });

        const childObligation = buildObligation({
          ParentId: parentObligation.Id,
        });

        await apiClient.insertObligations({
          objects: childObligation,
        });

        const { obligation: obligations } = await apiClient.getObligations(
          {},
          {
            user,
          }
        );
        expect(obligations.length).toEqual(2);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligations where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { obligation: obligations } = await apiClient.getObligations(
          {},
          {
            user,
          }
        );
        expect(obligations.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      { ...internalAuditUser1, deletedRecords: 0 },
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({});
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { delete_obligation } = await apiClient.deleteObligation(
          {
            Id: obligation.Id!,
          },
          {
            user,
          }
        );
        expect(delete_obligation?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation where they are the owner, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { delete_obligation } = await apiClient.deleteObligation(
          {
            Id: obligation.Id!,
          },
          {
            user,
          }
        );
        expect(delete_obligation?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can delete an obligation where they are the owner of the parent',
      async ({ ...user }) => {
        const parentObligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: parentObligation,
        });

        const childObligation = buildObligation({
          ParentId: parentObligation.Id,
        });

        await apiClient.insertObligations({
          objects: childObligation,
        });

        const { delete_obligation } = await apiClient.deleteObligation(
          {
            Id: childObligation.Id!,
          },
          {
            user,
          }
        );
        expect(delete_obligation?.affected_rows).toEqual(1);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      'When $RoleKey deletes an obligation, it should clear the parent of its children',
      async (user) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const childObligation = buildObligation({
          ParentId: obligation.Id,
        });
        await apiClient.insertObligations({
          objects: childObligation,
        });

        await apiClient.deleteObligation(
          {
            Id: obligation.Id!,
          },
          {
            user,
          }
        );
        const { obligation: obligations } = await apiClient.getObligations({});
        const savedChildObligation = obligations.find(
          (o) => o.Id === childObligation.Id
        );
        expect(savedChildObligation?.ParentId).toEqual(null);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation where they are a contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const { delete_obligation } = await apiClient.deleteObligation(
          {
            Id: obligation.Id!,
          },
          {
            user,
          }
        );
        expect(delete_obligation?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      riskManagerUser1,
      readOnlyUser1,
    ])('$RoleKey cannot insert obligations (backend only)', async (user) => {
      const obligation = buildObligation({});
      await apiClient.insertObligations({
        objects: obligation,
      });
      await expect(
        apiClient.insertObligations(
          {
            objects: [
              buildObligation({
                OrgKey: undefined,
                Id: undefined,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
              }),
            ],
          },
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'insert_obligation' not found in type: 'mutation_root'"
      );
    });
  });

  describe('insert child', () => {
    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])('$RoleKey cannot insert standard obligations', async (user) => {
      await expect(
        apiClient.insertChildObligation(
          {
            object: buildInsertChildObligation({
              Type: ObligationTypeEnumAction.Standard,
            }),
          },
          {
            user,
          }
        )
      ).rejects.toThrow('Access denied');
    });

    it.each([riskManagerUser1])(
      '$RoleKey can insert standard obligations',
      async (user) => {
        const result = await apiClient.insertChildObligation(
          {
            object: buildInsertChildObligation({
              Type: ObligationTypeEnumAction.Standard,
            }),
          },
          {
            user,
          }
        );
        expect(result.insertChildObligation?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1, standardUser1, standardEnhancedUser1])(
      '$RoleKey can insert chapter obligations under an owned obligation',
      async (user) => {
        const parentObligation = buildObligation({
          Type: ObligationTypeEnum.Standard,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: parentObligation,
        });

        const result = await apiClient.insertChildObligation(
          {
            object: buildInsertChildObligation({
              Type: ObligationTypeEnumAction.Chapter,
              ParentId: parentObligation.Id,
            }),
          },
          {
            user,
          }
        );
        expect(result.insertChildObligation?.Id).toBeDefined();
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - cannot update obligation directory (backend only)',
      async (user) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          Type: ObligationTypeEnum.Standard,
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const childObligation = buildObligation({
          ParentId: obligation.Id,
        });
        await apiClient.insertObligations({
          objects: childObligation,
        });

        await expect(
          apiClient.updateObligation(
            {
              Id: obligation.Id!,
              Title: 'updated',
              Type: ObligationTypeEnum.Chapter,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_obligation' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update child', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - child obligation has parent cleared when type changed',
      async (user) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          Type: ObligationTypeEnum.Standard,
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const childObligation = buildObligation({
          ParentId: obligation.Id,
        });
        await apiClient.insertObligations({
          objects: childObligation,
        });

        const newParentObligation = buildObligation({
          Type: ObligationTypeEnum.Standard,
        });
        await apiClient.insertObligations({
          objects: newParentObligation,
        });
        await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Id: obligation.Id!,
              Title: 'updated',
              Type: ObligationTypeEnumAction.Chapter,
              ParentId: newParentObligation.Id,
            }),
          },
          {
            user,
          }
        );
        const { obligation: obligations } = await apiClient.getObligations({});
        const savedChildObligation = obligations.find(
          (o) => o.Id === childObligation.Id
        );
        expect(savedChildObligation?.ParentId).toEqual(null);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - child obligation parent NOT cleared when type NOT changed',
      async (user) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          Type: ObligationTypeEnum.Standard,
        });
        await apiClient.insertObligations({
          objects: obligation,
        });

        const childObligation = buildObligation({
          ParentId: obligation.Id,
        });
        await apiClient.insertObligations({
          objects: childObligation,
        });

        await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Id: obligation.Id!,
              Title: 'updated',
              Type: mapToActionType(obligation.Type!),
            }),
          },
          {
            user,
          }
        );
        const { obligation: obligations } = await apiClient.getObligations({});
        const savedChildObligation = obligations.find(
          (o) => o.Id === childObligation.Id
        );
        expect(savedChildObligation?.ParentId).toEqual(obligation.Id!);
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey can update an obligation when NOT owner or contributor',
      async (user) => {
        const obligation = buildObligation({});
        await apiClient.insertObligations({
          objects: obligation,
        });
        const updatedTitle = 'updated title';
        const { updateChildObligation } = await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Title: updatedTitle,
              Id: obligation.Id!,
              Type: mapToActionType(obligation.Type!),
            }),
          },
          {
            user,
          }
        );
        expect(updateChildObligation?.Id).toBeDefined();
      }
    );
    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey cannot update an obligation when NOT owner or contributor',
      async (user) => {
        const obligation = buildObligation({});
        await apiClient.insertObligations({
          objects: obligation,
        });
        const updatedTitle = 'updated title';

        await expect(
          apiClient.updateChildObligation(
            {
              object: buildUpdateChildObligation({
                Title: updatedTitle,
                Id: obligation.Id!,
                Type: mapToActionType(obligation.Type!),
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          'You do not have permission to perform this action'
        );
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: enable when we have a single hasura role
      //readOnlyUser1,
    ])(
      '$RoleKey can update an obligation if they are the owner',
      async (user) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });
        const updatedTitle = 'updated title';
        const { updateChildObligation } = await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Title: updatedTitle,
              Id: obligation.Id!,
              Type: mapToActionType(obligation.Type!),
            }),
          },
          {
            user,
          }
        );
        expect(updateChildObligation?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can update an obligation if they are the owner of its parent',
      async (user) => {
        const parentObligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: parentObligation,
        });

        const childObligation = buildObligation({
          ParentId: parentObligation.Id,
        });
        await apiClient.insertObligations({
          objects: childObligation,
        });

        const updatedTitle = 'updated title';
        const { updateChildObligation } = await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Title: updatedTitle,
              Id: childObligation.Id!,
              Type: mapToActionType(childObligation.Type!),
            }),
          },
          {
            user,
          }
        );
        expect(updateChildObligation?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey can update an obligation if they are the contributor',
      async (user) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });
        const updatedTitle = 'updated title';
        const { updateChildObligation } = await apiClient.updateChildObligation(
          {
            object: buildUpdateChildObligation({
              Title: updatedTitle,
              Id: obligation.Id!,
              Type: mapToActionType(obligation.Type!),
            }),
          },
          {
            user,
          }
        );
        expect(updateChildObligation?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1 },
    ])(
      '$RoleKey cannot update an obligation if they are the contributor',
      async (user) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertObligations({
          objects: obligation,
        });
        const updatedTitle = 'updated title';

        await expect(
          apiClient.updateChildObligation(
            {
              object: buildUpdateChildObligation({
                Title: updatedTitle,
                Id: obligation.Id!,
                Type: mapToActionType(obligation.Type!),
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          'You do not have permission to perform this action'
        );
      }
    );
  });
});
