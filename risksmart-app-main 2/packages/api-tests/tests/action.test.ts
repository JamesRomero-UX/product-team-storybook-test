import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertAssessment } from '../clients/assessmentClient';
import { insertDocument } from '../clients/documentClient';
import { insertObligation } from '../clients/obligationClient';
import { buildAction } from '../data/action';
import { buildActionParent } from '../data/actionParent';
import { buildAssessment } from '../data/assessment';
import { buildChildAction } from '../data/childAction';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildIssue } from '../data/issue';
import { buildObligation } from '../data/obligation';
import { buildOwner } from '../data/owner';
import { ActionStatusEnum } from '../generated/graphql';
import {
  anotherUser,
  internalAuditUser1,
  publicUser1,
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

describe('action', () => {
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
      '$RoleKey should see $expectedRecords actions where they are not the Owner or contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            actions: {
              data: [buildActionParent({ action: { data: buildAction({}) } })],
            },
          })
        );

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are the owner of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [buildActionParent({ action: { data: buildAction({}) } })],
            },
          })
        );

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          }),
        });

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are the owner of the parent issue',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [buildActionParent({ action: { data: buildAction({}) } })],
            },
          }),
        });

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [buildActionParent({ action: { data: buildAction({}) } })],
            },
          })
        );
        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are a contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            actions: {
              data: [buildActionParent({ action: { data: buildAction({}) } })],
            },
          })
        );

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: buildAction({
                      contributors: {
                        data: [buildContributor({ UserId: user.Id })],
                      },
                    }),
                  },
                }),
              ],
            },
          })
        );

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords actions where they are a owner',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: buildAction({
                      owners: {
                        data: [buildOwner({ UserId: user.Id })],
                      },
                    }),
                  },
                }),
              ],
            },
          })
        );

        const result = await apiClient.getAllActions(
          {},
          {
            user,
          }
        );
        expect(result.action.length).toEqual(expectedRecords);
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
      'When $RoleKey deletes an action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const action = buildAction({});
        await insertObligation(
          buildObligation({
            actions: {
              data: [buildActionParent({ action: { data: action } })],
            },
          })
        );

        if (deletedRecords !== 0) {
          const data = await apiClient.deleteAction(
            { Id: action.Id! },
            {
              user,
            }
          );
          expect(data?.deleteActionsById?.affected_rows).toEqual(
            deletedRecords
          );
        } else {
          await expect(
            apiClient.deleteAction(
              { Id: action.Id! },
              {
                user,
              }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        }
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
      'When $RoleKey deletes an action where they are the owner of the parent obligation, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const action = buildAction({});
        await insertObligation(
          buildObligation({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: action,
                  },
                }),
              ],
            },
          })
        );

        if (deletedRecords !== 0) {
          const data = await apiClient.deleteAction(
            { Id: action.Id! },
            {
              user,
            }
          );
          expect(data?.deleteActionsById?.affected_rows).toEqual(
            deletedRecords
          );
        } else {
          await expect(
            await apiClient.deleteAction(
              { Id: action.Id! },
              {
                user,
              }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        }
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
      'When $RoleKey deletes an action where they are a contributor of the parent obligation, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const action = buildAction({});
        await insertObligation(
          buildObligation({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: action,
                  },
                }),
              ],
            },
          })
        );

        const data = await apiClient.deleteAction(
          { Id: action.Id! },
          {
            user,
          }
        );
        expect(data?.deleteActionsById?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insertChildAction', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey CANNOT insert an action under another action',
      async ({ ...user }) => {
        const parent = buildAction({});
        await apiClient.insertActions({ objects: parent });

        await expect(
          apiClient.insertChildAction(
            buildChildAction({
              ParentId: parent.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError('Invalid parent type');
      }
    );

    it.each([
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey CANNOT insert an action when NOT owner or contributor of the parent obligation',
      async ({ ...user }) => {
        const parent = buildObligation({});
        await insertObligation(parent);

        await expect(
          apiClient.insertChildAction(
            buildChildAction({
              ParentId: parent.Id!,
              OwnerUserIds: [anotherUser.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError('Access denied');
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey CAN insert an action when NOT owner or contributor of the parent obligation',
      async ({ ...user }) => {
        const parent = buildObligation({});
        await insertObligation(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert an action when they are owner of the parent obligation',
      async ({ ...user }) => {
        const parent = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertObligation(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert an action when they are the contributor of the parent obligation',
      async ({ ...user }) => {
        const parent = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertObligation(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey CAN insert an action when NOT owner or contributor of the parent assessment',
      async ({ ...user }) => {
        const parent = buildAssessment({});
        await insertAssessment(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert an action when they are owner of the parent assessment',
      async ({ ...user }) => {
        const parent = buildAssessment({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessment(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert an action when they are the contributor of the parent assessment',
      async ({ ...user }) => {
        const parent = buildAssessment({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertAssessment(parent);

        const result = await apiClient.insertChildAction(
          buildChildAction({
            ParentId: parent.Id!,
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert a standalone action with themselves as owner',
      async ({ ...user }) => {
        const result = await apiClient.insertChildAction(
          buildChildAction({
            OwnerUserIds: [user.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      riskManagerUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey CAN insert a standalone action without being an owner',
      async ({ ...user }) => {
        const result = await apiClient.insertChildAction(
          buildChildAction({
            OwnerUserIds: [anotherUser.Id!],
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAction?.Id).toBeDefined();
      }
    );

    it.each([readOnlyUser1, publicUser1])(
      '$RoleKey CANNOT insert a standalone action',
      async ({ ...user }) => {
        await expect(
          apiClient.insertChildAction(
            buildChildAction({
              OwnerUserIds: [anotherUser.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError(
          "field 'insertChildAction' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('updateChildAction', () => {
    it('Does not update if action timestamp does not match that of request', async () => {
      const action = buildAction({});

      await insertObligation(
        buildObligation({
          actions: {
            data: [
              buildActionParent({
                action: {
                  data: action,
                },
              }),
            ],
          },
        })
      );

      await expect(
        apiClient.updateChildAction(
          {
            ...action,
            OriginalTimestamp: '2024-01-01',
            DateDue: action.DateDue ?? new Date().toISOString(),
            Status: action.Status ?? ActionStatusEnum.Open,
            Priority: action.Priority,
            DateRaised: action.DateRaised ?? new Date().toISOString(),
            Title: 'updated title',
            Id: action.Id!,
          },
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrowError(
        'Item has been modified since last viewed. Please refresh page and try again'
      );
    });

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords actions when NOT owner or contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({});

        await insertObligation(
          buildObligation({
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: action,
                  },
                }),
              ],
            },
          })
        );

        if (expectedRecords !== 0) {
          const data = await apiClient.updateChildAction(
            {
              ...action,
              OriginalTimestamp: action.ModifiedAtTimestamp!,
              DateDue: action.DateDue ?? new Date().toISOString(),
              Status: action.Status ?? ActionStatusEnum.Open,
              Priority: action.Priority,
              DateRaised: action.DateRaised ?? new Date().toISOString(),
              Title: 'updated title',
              Id: action.Id!,
            },
            {
              user,
            }
          );
          expect(data?.updateChildAction?.affected_rows).toEqual(
            expectedRecords
          );
        } else {
          await expect(
            apiClient.updateChildAction(
              {
                ...action,
                OriginalTimestamp: action.ModifiedAtTimestamp!,
                DateDue: action.DateDue ?? new Date().toISOString(),
                Status: action.Status ?? ActionStatusEnum.Open,
                Priority: action.Priority,
                DateRaised: action.DateRaised ?? new Date().toISOString(),
                Title: 'updated title',
                Id: action.Id!,
              },
              {
                user,
              }
            )
          ).rejects.toThrowError(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords actions if they are the owner of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({});
        await insertObligation(
          buildObligation({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: action,
                  },
                }),
              ],
            },
          })
        );

        const data = await apiClient.updateChildAction(
          {
            ...action,
            OriginalTimestamp: action.ModifiedAtTimestamp!,
            DateDue: action.DateDue ?? new Date().toISOString(),
            Status: action.Status ?? ActionStatusEnum.Open,
            Priority: action.Priority,
            DateRaised: action.DateRaised ?? new Date().toISOString(),
            Title: 'updated title',
            Id: action.Id!,
          },
          {
            user,
          }
        );
        expect(data?.updateChildAction?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords actions if they are the contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({});
        await insertObligation(
          buildObligation({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            actions: {
              data: [
                buildActionParent({
                  action: {
                    data: action,
                  },
                }),
              ],
            },
          })
        );

        const data = await apiClient.updateChildAction(
          {
            ...action,
            OriginalTimestamp: action.ModifiedAtTimestamp!,
            DateDue: action.DateDue ?? new Date().toISOString(),
            Status: action.Status ?? ActionStatusEnum.Open,
            Priority: action.Priority,
            DateRaised: action.DateRaised ?? new Date().toISOString(),
            Title: 'updated title',
            Id: action.Id!,
          },
          {
            user,
          }
        );

        expect(data?.updateChildAction?.affected_rows).toEqual(expectedRecords);
      }
    );
  });
});
