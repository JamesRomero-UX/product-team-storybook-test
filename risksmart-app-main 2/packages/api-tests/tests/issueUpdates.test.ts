import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteIssueUpdate,
  getIssueUpdates,
  updateIssueUpdate,
} from '../clients/issueUpdateClient';
import { buildContributor } from '../data/contributor';
import { buildIssue } from '../data/issue';
import { buildIssueUpdate } from '../data/issueUpdate';
import { buildOwner } from '../data/owner';
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

describe('issue updates', () => {
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
      '$RoleKey should see $expectedRecords issue updates where they are not the Owner or contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            updates: {
              data: [buildIssueUpdate({})],
            },
          }),
        });

        const issueUpdates = await getIssueUpdates({
          user,
        });
        expect(issueUpdates.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issues where they are the owner of the parent issue',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            updates: {
              data: [buildIssueUpdate({})],
            },
          }),
        });

        const issueUpdates = await getIssueUpdates({
          user,
        });
        expect(issueUpdates.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issues where they are a contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            updates: {
              data: [buildIssueUpdate({})],
            },
          }),
        });

        const issueUpdates = await getIssueUpdates({
          user,
        });
        expect(issueUpdates.length).toEqual(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 0 },
      { ...standardEnhancedUser1, updatedRecords: 0 },
      { ...internalAuditUser1, updatedRecords: 0 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey updates an issue update where they are NOT the owner or parent, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await updateIssueUpdate(issueUpdate.Id!, 'Updated', {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
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
      'When $RoleKey updates an issue update where they are the owner of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await updateIssueUpdate(issueUpdate.Id!, 'Updated', {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
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
      'When $RoleKey updates an issue update where they are a contributor of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [
                buildContributor({
                  UserId: user.Id,
                }),
              ],
            },
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await updateIssueUpdate(issueUpdate.Id!, 'Updated', {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, updatedRecords: 1 },
      { ...standardUser1, updatedRecords: 0 },
      { ...standardEnhancedUser1, updatedRecords: 0 },
      { ...internalAuditUser1, updatedRecords: 0 },
      // TODO: reintroduce when we have a single hasura role
      // { ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an issue update where they are NOT the owner or parent, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await deleteIssueUpdate(issueUpdate.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
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
      'When $RoleKey deletes an issue update where they are the owner of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await deleteIssueUpdate(issueUpdate.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
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
      'When $RoleKey deletes an issue update where they are a contributor of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const issueUpdate = buildIssueUpdate({});
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [
                buildContributor({
                  UserId: user.Id,
                }),
              ],
            },
            updates: {
              data: [issueUpdate],
            },
          }),
        });

        const result = await deleteIssueUpdate(issueUpdate.Id!, {
          user,
        });
        expect(result?.affected_rows).toEqual(updatedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords issue updates when not the owner or contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const result = await apiClient.InsertIssueUpdate(
          {
            objects: buildIssueUpdate({
              ParentIssueId: issue.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_issue_update?.affected_rows).toEqual(
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
      '$RoleKey can insert $expectedRecords issue updates when the owner of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const result = await apiClient.InsertIssueUpdate(
          {
            objects: buildIssueUpdate({
              ParentIssueId: issue.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_issue_update?.affected_rows).toEqual(
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
      '$RoleKey can insert $expectedRecords issue updates when the contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const result = await apiClient.InsertIssueUpdate(
          {
            objects: buildIssueUpdate({
              ParentIssueId: issue.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
          },
          {
            user,
          }
        );
        expect(result?.insert_issue_update?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert issue updates when not the owner or parent of the issue',
      async (user) => {
        const issue = buildIssue({});
        await expect(
          apiClient.InsertIssueUpdate(
            {
              objects: buildIssueUpdate({
                ParentIssueId: issue.Id!,
                OrgKey: undefined,
                Id: undefined,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_issue_update' not found in type: 'mutation_root'"
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert issue updates when not the owner or contributor of the parent issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          apiClient.InsertIssueUpdate(
            {
              objects: buildIssueUpdate({
                ParentIssueId: issue.Id!,
                OrgKey: undefined,
                Id: undefined,
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
  });
});
