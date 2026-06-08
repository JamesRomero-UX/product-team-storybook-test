import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteConsequence,
  getConsequences,
  insertConsequence,
  updateConsequence,
} from '../clients/consequenceClient';
import { buildConsequence } from '../data/consequence';
import { buildContributor } from '../data/contributor';
import { buildIssue } from '../data/issue';
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

describe('consequences', () => {
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
      '$RoleKey should see $expectedRecords consequences where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            consequences: {
              data: [buildConsequence()],
            },
          }),
        });

        const consequences = await getConsequences({
          user,
        });
        expect(consequences.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords consequences where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            consequences: {
              data: [buildConsequence()],
            },
          }),
        });

        const consequences = await getConsequences({
          user,
        });
        expect(consequences.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords consequences where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            consequences: {
              data: [buildConsequence()],
            },
          }),
        });

        const consequences = await getConsequences({
          user,
        });
        expect(consequences.length).toEqual(expectedRecords);
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
      'When $RoleKey updates a consequence where they are NOT the owner or parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await updateConsequence(
          { Id: consequence.Id!, Title: 'Updated' },
          {
            user,
          }
        );
        expect(result?.data?.update_consequence?.affected_rows).toEqual(
          updatedRecords
        );
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
      'When $RoleKey updates a consequence result where they are the owner of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await updateConsequence(
          { Id: consequence.Id!, Title: 'Updated' },
          {
            user,
          }
        );
        expect(result?.data?.update_consequence?.affected_rows).toEqual(
          updatedRecords
        );
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
      'When $RoleKey updates a consequence where they are a contributor of the parent issue, it should update $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await updateConsequence(
          { Id: consequence.Id!, Title: 'Updated' },
          {
            user,
          }
        );
        expect(result?.data?.update_consequence?.affected_rows).toEqual(
          updatedRecords
        );
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
      'When $RoleKey deletes a consequence where they are NOT the owner or parent issue, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await deleteConsequence(consequence.Id!, {
          user,
        });
        expect(result?.data?.delete_consequence?.affected_rows).toEqual(
          updatedRecords
        );
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
      'When $RoleKey deletes a consequence result where they are the owner of the parent issue, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await deleteConsequence(consequence.Id!, {
          user,
        });
        expect(result?.data?.delete_consequence?.affected_rows).toEqual(
          updatedRecords
        );
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
      'When $RoleKey deletes a consequence where they are a contributor of the parent issue, it should delete $updatedRecords records',
      async ({ updatedRecords, ...user }) => {
        const consequence = buildConsequence();
        await apiClient.insertIssues({
          objects: buildIssue({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            consequences: {
              data: [consequence],
            },
          }),
        });

        const result = await deleteConsequence(consequence.Id!, {
          user,
        });
        expect(result?.data?.delete_consequence?.affected_rows).toEqual(
          updatedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords consequences when not the owner or contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const result = await insertConsequence(
          buildConsequence({
            ParentIssueId: issue.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.data?.insert_consequence?.affected_rows).toEqual(
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
      '$RoleKey can insert $expectedRecords consequences when the owner of the parent issue',
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
        const result = await insertConsequence(
          buildConsequence({
            ParentIssueId: issue.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.data?.insert_consequence?.affected_rows).toEqual(
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
      '$RoleKey can insert $expectedRecords consequences when the contributor of the parent issue',
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
        const result = await insertConsequence(
          buildConsequence({
            ParentIssueId: issue.Id!,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),
          {
            user,
          }
        );
        expect(result?.data?.insert_consequence?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert consequences when not the owner or parent of the issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          insertConsequence(
            buildConsequence({
              ParentIssueId: issue.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_consequence' not found in type: 'mutation_root'"
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert consequences when not the owner or parent of the parent issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          insertConsequence(
            buildConsequence({
              ParentIssueId: issue.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
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
