import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertApproval } from '../clients/approvalClient';
import {
  deleteApprover,
  getApprovers,
  insertApprover,
  updateApprover,
} from '../clients/approverClient';
import { insertDocument } from '../clients/documentClient';
import { buildApproval } from '../data/approval';
import { buildApprovalLevel } from '../data/approvalLevel';
import { buildApprover } from '../data/approver';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildOwner } from '../data/owner';
import {
  anotherUser,
  approvalWorkflow,
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

describe('approver', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords approvers where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [
                    buildApprover({
                      UserId: anotherUser.Id,
                    }),
                  ],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const approvers = await getApprovers({
          user,
        });
        expect(approvers.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords approvers where they ARE the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [
                    buildApprover({
                      UserId: anotherUser.Id,
                    }),
                  ],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const approvers = await getApprovers({
          user,
        });
        expect(approvers.length).toEqual(expectedRecords);
      }
    );

    it('Should fail when attempting to create an approver WITH user ID and owner field set', async () => {
      const approval = buildApproval({
        Workflow: approvalWorkflow,
        levels: {
          data: [
            buildApprovalLevel({
              approvers: {
                data: [
                  buildApprover({
                    UserId: anotherUser.Id,
                    OwnerApprover: true,
                  }),
                ],
              },
            }),
          ],
        },
      });

      await expect(insertApproval(approval)).rejects.toThrow(
        'Check constraint violation. new row for relation "approver" violates check constraint "user_id_xor_group_xor_owner_approver"'
      );
    });

    it('Should fail when attempting to create an approver WITHOUT user ID or owner field set', async () => {
      const approval = buildApproval({
        Workflow: approvalWorkflow,
        levels: {
          data: [
            buildApprovalLevel({
              approvers: {
                data: [buildApprover({})],
              },
            }),
          ],
        },
      });

      await expect(insertApproval(approval)).rejects.toThrow(
        'Check constraint violation. new row for relation "approver" violates check constraint "user_id_xor_group_xor_owner_approver"'
      );
    });

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords approvers where they ARE a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [
                    buildApprover({
                      UserId: anotherUser.Id,
                    }),
                  ],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const approvers = await getApprovers({
          user,
        });
        expect(approvers.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords approvers where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await deleteApprover(
          { Id: approver.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords approvers where they ARE the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await deleteApprover(
          { Id: approver.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // enable when we have a single hasura role
      //  { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords approvers where they ARE a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await deleteApprover(
          { Id: approver.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approver?.affected_rows).toEqual(
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
      // enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords approvers where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await updateApprover(
          { Id: approver.Id!, UserId: anotherUser.Id! },
          {
            user,
          }
        );
        expect(result.data?.update_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords approvers where they ARE the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await updateApprover(
          { Id: approver.Id!, UserId: anotherUser.Id! },
          {
            user,
          }
        );
        expect(result.data?.update_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // enable when we have a single hasura role
      //  { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords approvers where they ARE a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approver = buildApprover({
          UserId: anotherUser.Id,
        });
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [
              buildApprovalLevel({
                approvers: {
                  data: [approver],
                },
              }),
            ],
          },
        });
        await insertApproval(approval);

        const result = await updateApprover(
          { Id: approver.Id!, UserId: anotherUser.Id! },
          {
            user,
          }
        );
        expect(result.data?.update_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1])(
      '$RoleKey should insert approvers where they are NOT the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        const level = buildApprovalLevel({});
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [level],
          },
        });
        await insertApproval(approval);

        const approver = buildApprover({
          UserId: anotherUser.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          LevelId: level.Id,
        });

        const result = await insertApprover(approver, {
          user,
        });
        expect(result.data?.insert_approver?.affected_rows).toEqual(1);
      }
    );
    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // enable when we have a single hasura role
      // readOnlyUser1,
    ])(
      '$RoleKey should insert approvers where they are NOT the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        const level = buildApprovalLevel({});
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [level],
          },
        });
        await insertApproval(approval);

        const approver = buildApprover({
          UserId: anotherUser.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          LevelId: level.Id,
        });

        await expect(
          insertApprover(approver, {
            user,
          })
        ).rejects.toThrowError(
          'check constraint of an insert/update permission has failed'
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should insert $expectedRecords approvers where they ARE the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const level = buildApprovalLevel({});
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [level],
          },
        });
        await insertApproval(approval);

        const approver = buildApprover({
          UserId: anotherUser.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          LevelId: level.Id,
        });

        const result = await insertApprover(approver, {
          user,
        });
        expect(result.data?.insert_approver?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey should insert  approvers where they ARE a contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const level = buildApprovalLevel({});
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [level],
          },
        });
        await insertApproval(approval);

        const approver = buildApprover({
          UserId: anotherUser.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          LevelId: level.Id,
        });

        const result = await insertApprover(approver, {
          user,
        });
        expect(result.data?.insert_approver?.affected_rows).toEqual(1);
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // enable when we have a single hasura role
      //  { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should not insert approvers where they ARE a contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const level = buildApprovalLevel({});
        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          levels: {
            data: [level],
          },
        });
        await insertApproval(approval);

        const approver = buildApprover({
          UserId: anotherUser.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
          LevelId: level.Id,
        });

        await expect(
          insertApprover(approver, {
            user,
          })
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );
  });
});
