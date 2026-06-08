import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertApproval } from '../clients/approvalClient';
import {
  buildApprovalWorkflow,
  changeRequestRequiredError,
} from '../data/approval';
import {
  buildInsertChildControl,
  buildUpdateChildControl,
} from '../data/childControl';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
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

describe('control', () => {
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
      '$RoleKey should see $expectedRecords controls where they are NOT the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({}),
        });
        const result = await apiClient.getAllControls(
          {},
          {
            user,
          }
        );
        expect(result.control.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords controls where they ARE the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          }),
        });

        const result = await apiClient.getAllControls(
          {},
          {
            user,
          }
        );
        expect(result.control.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords controls where they ARE a contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
          }),
        });

        const result = await apiClient.getAllControls(
          {},
          {
            user,
          }
        );
        expect(result.control.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      "$RoleKey - require approval when there is a 'delete-control' workflow in place for any user",
      async (user) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });

        const workflow = buildApprovalWorkflow('delete-control', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await expect(
          apiClient.deleteControl(
            {
              Id: control.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(changeRequestRequiredError);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - dont delete control when a delete request is submitted for it',
      async (user) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });

        const workflow = buildApprovalWorkflow('delete-control', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await apiClient.deleteControl(
          {
            Id: control.Id!,
          },
          {
            user,
            confirmChangeRequest: true,
          }
        );

        const allControls = await apiClient.getAllControls();
        const controlCheck = allControls.control.find(
          (c) => c.Id === control.Id!
        );
        expect(controlCheck?.Id === control.Id).toBeTruthy();
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      // TODO: add once we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a control, it deletes $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });

        const data = await apiClient.deleteControl(
          {
            Id: control.Id!,
          },
          {
            user,
          }
        );
        expect(data?.deleteControlsById?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([standardUser1])(
      'When $RoleKey tries to delete a control, it denies permission',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });

        await expect(
          apiClient.deleteControl(
            {
              Id: control.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: add once we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an control where they are the owner, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });

        const data = await apiClient.deleteControl(
          {
            Id: control.Id!,
          },
          {
            user,
          }
        );
        expect(data?.deleteControlsById?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: add once we have a single hasura role
      //  { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an control where they are a contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const control = buildControl({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });

        const data = await apiClient.deleteControl(
          {
            Id: control.Id!,
          },
          {
            user,
          }
        );
        expect(data?.deleteControlsById?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insertChildControl', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert controls when they are not the owner/contributor of the parent risk',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const data = await apiClient.insertChildControl(
          {
            object: buildInsertChildControl({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildControl?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert $expectedRecords controls when they ARE an owner of the parent risk',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const data = await apiClient.insertChildControl(
          {
            object: buildInsertChildControl({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildControl?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert $expectedRecords controls when they ARE a contributor of the parent risk',
      async (user) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const data = await apiClient.insertChildControl(
          {
            object: buildInsertChildControl({
              ParentId: risk.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
          },
          {
            user,
          }
        );
        expect(data?.insertChildControl?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent risk',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        await expect(
          apiClient.insertChildControl(
            {
              object: buildInsertChildControl({
                ParentId: risk.Id!,
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent risk',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        await expect(
          apiClient.insertChildControl(
            {
              object: buildInsertChildControl({
                ParentId: risk.Id!,
                OwnerUserIds: [anotherUser.Id!],
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insertChildControl' not found in type: 'mutation_root'"
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
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords control when NOT owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const updatedTitle = 'updated title';

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateChildControl(
              {
                object: buildUpdateChildControl({
                  OriginalTimestamp: control.ModifiedAtTimestamp!,
                  Title: updatedTitle,
                  Id: control.Id!,
                  Type: control.Type as string,
                }),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );

          return;
        }

        const data = await apiClient.updateChildControl(
          {
            object: buildUpdateChildControl({
              OriginalTimestamp: control.ModifiedAtTimestamp!,
              Title: updatedTitle,
              Id: control.Id!,
              Type: control.Type as string,
            }),
          },
          {
            user,
          }
        );
        expect(data?.updateChildControl?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it('Does not update if control timestamp does not match that of request', async () => {
      const control = buildControl({});
      await apiClient.insertControl({ objects: control });
      const updatedTitle = 'updated title';

      await expect(
        apiClient.updateChildControl(
          {
            object: buildUpdateChildControl({
              OriginalTimestamp: '2024-10-18T09:57:08Z',
              Title: updatedTitle,
              Id: control.Id!,
              Type: control.Type as string,
            }),
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        'Item has been modified since last viewed. Please refresh page and try again'
      );
    });

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords control if they are the owner',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });
        const updatedTitle = 'updated title';

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateChildControl(
              {
                object: buildUpdateChildControl({
                  OriginalTimestamp: control.ModifiedAtTimestamp!,
                  Title: updatedTitle,
                  Id: control.Id!,
                  Type: control.Type as string,
                }),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );

          return;
        }

        const data = await apiClient.updateChildControl(
          {
            object: buildUpdateChildControl({
              OriginalTimestamp: control.ModifiedAtTimestamp!,
              Title: updatedTitle,
              Id: control.Id!,
              Type: control.Type as string,
            }),
          },
          {
            user,
          }
        );
        expect(data?.updateChildControl?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords control(s) if they are the contributor',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });
        const updatedTitle = 'updated title';

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateChildControl(
              {
                object: buildUpdateChildControl({
                  OriginalTimestamp: control.ModifiedAtTimestamp!,
                  Title: updatedTitle,
                  Id: control.Id!,
                  Type: control.Type as string,
                }),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );

          return;
        }

        const data = await apiClient.updateChildControl(
          {
            object: buildUpdateChildControl({
              OriginalTimestamp: control.ModifiedAtTimestamp!,
              Title: updatedTitle,
              Id: control.Id!,
              Type: control.Type as string,
            }),
          },
          {
            user,
          }
        );
        expect(data?.updateChildControl?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
