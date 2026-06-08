import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteApproval,
  getApprovals,
  insertApproval,
} from '../clients/approvalClient';
import { insertDocument } from '../clients/documentClient';
import { buildApproval } from '../data/approval';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildOwner } from '../data/owner';
import {
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

describe('approval', () => {
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
      '$RoleKey should see $expectedRecords approvals where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
        });
        await insertApproval(approval);

        const approvals = await getApprovals({
          user,
        });
        expect(approvals.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords approvals where they ARE the owner of the parent document',
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
        });
        await insertApproval(approval);

        const approvals = await getApprovals({
          user,
        });
        expect(approvals.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords approvals where they ARE a contributor of the parent document',
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
        });
        await insertApproval(approval);

        const approvals = await getApprovals({
          user,
        });
        expect(approvals.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords approvals where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
        });
        await insertApproval(approval);

        const result = await deleteApproval(
          { Id: approval.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approval?.affected_rows).toEqual(
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
      '$RoleKey should delete $expectedRecords approvals where they ARE the owner of the parent document',
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
        });
        await insertApproval(approval);

        const result = await deleteApproval(
          { Id: approval.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approval?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords approvals where they ARE a contributor of the parent document',
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
        });
        await insertApproval(approval);

        const result = await deleteApproval(
          { Id: approval.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_approval?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords approvals where they are NOT the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          Id: undefined,
          CreatedByUser: undefined,
          OrgKey: undefined,
          ModifiedByUser: undefined,
        });

        const result = await insertApproval(approval, {
          user,
        });
        expect(result.data?.insert_approval?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      standardUser1,
      // TODO: enable when we have a single hasura role
      // readOnlyUser1
    ])(
      '$RoleKey should not insert approvals where they are NOT the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          Id: undefined,
          CreatedByUser: undefined,
          OrgKey: undefined,
          ModifiedByUser: undefined,
        });

        await expect(
          insertApproval(approval, {
            user,
          })
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
      // TODO: enable when we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should insert $expectedRecords approvals where they ARE the owner of the parent document',
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
          Id: undefined,
          CreatedByUser: undefined,
          OrgKey: undefined,
          ModifiedByUser: undefined,
        });

        const result = await insertApproval(approval, {
          user,
        });
        expect(result.data?.insert_approval?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey should insert global approval process',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const globalApproval = buildApproval({
          Workflow: approvalWorkflow,
          CreatedByUser: undefined,
          CreatedAtTimestamp: undefined,
          ModifiedAtTimestamp: undefined,
          ModifiedByUser: undefined,
          OrgKey: undefined,
          Id: undefined,
        });

        const result = await insertApproval(globalApproval, {
          user,
        });

        expect(result.data?.insert_approval?.affected_rows).toEqual(1);
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey should insert approvals where they ARE a contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          Id: undefined,
          CreatedByUser: undefined,
          OrgKey: undefined,
          ModifiedByUser: undefined,
        });

        const result = await insertApproval(approval, {
          user,
        });
        expect(result.data?.insert_approval?.affected_rows).toEqual(1);
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: enable when we have a single hasura role
      // readOnlyUser1
    ])(
      '$RoleKey should fail insert $expectedRecords approvals where they ARE a contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const approval = buildApproval({
          Workflow: approvalWorkflow,
          ParentId: document.Id,
          Id: undefined,
          CreatedByUser: undefined,
          OrgKey: undefined,
          ModifiedByUser: undefined,
        });

        await expect(
          insertApproval(approval, {
            user,
          })
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );
  });
});
