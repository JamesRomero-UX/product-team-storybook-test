import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertApproval } from '../clients/approvalClient';
import {
  buildApprovalWorkflow,
  changeRequestRequiredError,
} from '../data/approval';
import { buildChildIssue } from '../data/childIssue';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildIssue, buildUpdateIssue } from '../data/issue';
import { buildIssueParent } from '../data/issueParent';
import { buildOwner } from '../data/owner';
import {
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

describe('issue', () => {
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
      '$RoleKey should see $expectedRecords issues where they are not the Owner or contributor of the parent control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: buildIssue({}),
                  },
                }),
              ],
            },
          }),
        });

        const issues = await apiClient.getIssues(
          {},
          {
            user,
          }
        );
        expect(issues.issue.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issues where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          }),
        });

        const issues = await apiClient.getIssues(
          {},
          {
            user,
          }
        );
        expect(issues.issue.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issues where they are the owner of the parent control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: buildIssue({}),
                  },
                }),
              ],
            },
          }),
        });

        const issues = await apiClient.getIssues(
          {},
          {
            user,
          }
        );
        expect(issues.issue.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issues where they are a contributor of the parent control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: buildIssue({}),
                  },
                }),
              ],
            },
          }),
        });

        const issues = await apiClient.getIssues(
          {},
          {
            user,
          }
        );
        expect(issues.issue.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insertChild', () => {
    it.each([riskManagerUser1])(
      '$RoleKey should be able to insert an issue when not the owner/contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        const result = await apiClient.insertChildIssue(
          {
            object: buildChildIssue({
              ParentId: control.Id,
            }),
          },
          { user }
        );

        expect(result?.insertChildIssue?.Id).toBeDefined();
      }
    );

    it.each([
      publicUser1,
      standardUser1,
      standardEnhancedUser1,
      riskManagerUser1,
    ])(
      '$RoleKey should be able to insert an issue without a parent',
      async ({ ...user }) => {
        const result = await apiClient.insertChildIssue(
          {
            object: buildChildIssue({
              ParentId: null,
            }),
          },
          { user }
        );

        expect(result?.insertChildIssue?.Id).toBeDefined();
        expect(result?.insertChildIssue?.SequentialId).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey should NOT be able to insert an issue when not the owner/contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        await expect(
          apiClient.insertChildIssue(
            {
              object: buildChildIssue({
                ParentId: control.Id,
              }),
            },
            { user }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey should NOT be able to insert an issue when not the owner/contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        await expect(
          apiClient.insertChildIssue(
            {
              object: buildChildIssue({
                ParentId: control.Id,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insertChildIssue' not found in type: 'mutation_root'"
        );
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should be able to insert an issue when they are the  owner of the parent control',
      async ({ ...user }) => {
        const control = buildControl({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });
        const result = await apiClient.insertChildIssue(
          {
            object: buildChildIssue({
              ParentId: control.Id,
            }),
          },
          { user }
        );

        expect(result?.insertChildIssue?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should be able to insert an issue when they are a contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertControl({ objects: control });
        const result = await apiClient.insertChildIssue(
          {
            object: buildChildIssue({
              ParentId: control.Id,
            }),
          },
          { user }
        );

        expect(result?.insertChildIssue?.Id).toBeDefined();
      }
    );
  });

  describe('insert', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      publicUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should not be able to insert issues directly',
      async (user) => {
        await expect(
          apiClient.insertIssues(
            {
              objects: buildIssue({
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
              }),
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insert_issue' not found in type: 'mutation_root'"
        );
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
      "$RoleKey - require approval when there is a 'delete-issue' workflow in place for any user",
      async (user) => {
        const issue = buildIssue({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });

        const workflow = buildApprovalWorkflow('delete-issue', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await expect(
          apiClient.deleteIssue(
            {
              Id: issue.Id!,
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
      '$RoleKey - dont delete issue when a delete request is submitted for it',
      async (user) => {
        const issue = buildIssue({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });

        const workflow = buildApprovalWorkflow('delete-issue', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await apiClient.deleteIssue(
          {
            Id: issue.Id!,
          },
          {
            user,
            confirmChangeRequest: true,
          }
        );

        const allIssues = await apiClient.getIssues();
        const issueCheck = allIssues.issue.find((i) => i.Id === issue.Id!);
        expect(issueCheck?.Id === issue.Id).toBeTruthy();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      'When $RoleKey tries to delete a issue, it denies permission',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });

        await expect(
          apiClient.deleteIssue(
            {
              Id: issue.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an issue where they are NOT the owner or contributor, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });

        const result = await apiClient.deleteIssue(
          { Id: issue.Id! },
          {
            user,
          }
        );
        expect(result?.deleteIssuesById?.affected_rows).toEqual(updatedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 1 },
      { ...standardEnhancedUser1, updatedRecords: 1 },
      { ...internalAuditUser1, updatedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an issue where they are the owner of the parent control, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });

        const result = await apiClient.deleteIssue(
          { Id: issue.Id! },
          {
            user,
          }
        );
        expect(result?.deleteIssuesById?.affected_rows).toEqual(updatedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 1 },
      { ...standardEnhancedUser1, updatedRecords: 1 },
      { ...internalAuditUser1, updatedRecords: 1 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, updatedRecords: 0 },
    ])(
      'When $RoleKey deletes an issue where they are a contributor of the parent control, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });

        const result = await apiClient.deleteIssue(
          { Id: issue.Id! },
          {
            user,
          }
        );
        expect(result?.deleteIssuesById?.affected_rows).toEqual(updatedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])('$RoleKey cannot update issues directly', async (user) => {
      const issue = buildIssue({});
      await apiClient.insertControl({
        objects: buildControl({
          issues: {
            data: [
              buildIssueParent({
                issue: {
                  data: issue,
                },
              }),
            ],
          },
        }),
      });

      await expect(
        apiClient.updateIssue(
          { Id: issue.Id!, Title: 'Updated' },
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'update_issue' not found in type: 'mutation_root'"
      );
    });
  });

  describe('updateIssueApi', () => {
    it.each([
      { ...riskManagerUser1, hasAccess: true },
      { ...standardUser1, hasAccess: false },
      { ...standardEnhancedUser1, hasAccess: false },
      { ...internalAuditUser1, hasAccess: false },
      { ...readOnlyUser1, hasAccess: false },
    ])(
      '$RoleKey hasAccess=$hasAccess to update an issue where they are NOT the owner or contributor',
      async ({ hasAccess, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });
        const savedIssues = await apiClient.getIssues({});
        const savedIssue = savedIssues.issue.find((i) => i.Id === issue.Id);
        if (!savedIssue) {
          throw new Error('Saved issue not found');
        }

        const updateIssue = apiClient.updateIssueApi(
          {
            object: buildUpdateIssue({
              Id: issue.Id!,
              Title: 'Updated',
              OriginalTimestamp: savedIssue.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        if (hasAccess) {
          const result = await updateIssue;
          expect(result?.updateIssueApi?.affected_rows).toEqual(1);
        } else {
          await expect(updateIssue).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, hasAccess: true },
      { ...standardUser1, hasAccess: true },
      { ...standardEnhancedUser1, hasAccess: true },
      { ...internalAuditUser1, hasAccess: true },
      { ...readOnlyUser1, hasAccess: false },
    ])(
      '$RoleKey hasAccess=$hasAccess to update an issue where they are the owner of the parent control',
      async ({ hasAccess, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });

        const savedIssues = await apiClient.getIssues({});
        const savedIssue = savedIssues.issue.find((i) => i.Id === issue.Id);
        if (!savedIssue) {
          throw new Error('Saved issue not found');
        }

        const updateIssue = apiClient.updateIssueApi(
          {
            object: buildUpdateIssue({
              Id: issue.Id!,
              Title: 'Updated',
              OriginalTimestamp: savedIssue.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        if (hasAccess) {
          const result = await updateIssue;
          expect(result?.updateIssueApi?.affected_rows).toEqual(1);
        } else {
          await expect(updateIssue).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, hasAccess: true },
      { ...standardUser1, hasAccess: true },
      { ...standardEnhancedUser1, hasAccess: true },
      { ...internalAuditUser1, hasAccess: true },
      { ...readOnlyUser1, hasAccess: false },
    ])(
      '$RoleKey hasAccess=$hasAccess to update an issue where they are a contributor of the parent control',
      async ({ hasAccess, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: {
                    data: issue,
                  },
                }),
              ],
            },
          }),
        });

        const savedIssues = await apiClient.getIssues({});
        const savedIssue = savedIssues.issue.find((i) => i.Id === issue.Id);
        if (!savedIssue) {
          throw new Error('Saved issue not found');
        }

        const updateIssue = apiClient.updateIssueApi(
          {
            object: buildUpdateIssue({
              Id: issue.Id!,
              Title: 'Updated',
              OriginalTimestamp: savedIssue.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        if (hasAccess) {
          const result = await updateIssue;
          expect(result?.updateIssueApi?.affected_rows).toEqual(1);
        } else {
          await expect(updateIssue).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );
  });
});
