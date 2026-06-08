import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertApproval } from '../clients/approvalClient';
import { getAllChangeRequests } from '../clients/changeRequestClient';
import { buildAcceptance, buildUpdateAcceptance } from '../data/acceptance';
import {
  buildApprovalWorkflow,
  changeRequestRequiredError,
} from '../data/approval';
import { buildContributor } from '../data/contributor';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { AcceptanceStatusEnum, ApprovalStatusEnum } from '../generated/graphql';
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

describe('acceptance', () => {
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
      '$RoleKey should see $expectedRecords acceptances where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        const result = await apiClient.getAllAcceptances(
          {},
          {
            user,
          }
        );
        expect(result.acceptance.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords acceptances where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        const result = await apiClient.getAllAcceptances(
          {},
          {
            user,
          }
        );
        expect(result.acceptance.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords acceptances where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        const result = await apiClient.getAllAcceptances(
          {},
          {
            user,
          }
        );
        expect(result.acceptance.length).toEqual(expectedRecords);
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
      "$RoleKey - require approval when there is a 'delete-acceptance' workflow in place for any user",
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const result = await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        const workflow = buildApprovalWorkflow('delete-acceptance', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await expect(
          apiClient.deleteAcceptance(
            {
              Id: result.insert_acceptance_one!.Id,
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
      '$RoleKey - dont delete acceptance when a delete request is submitted for it',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const result = await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        const workflow = buildApprovalWorkflow('delete-acceptance', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await apiClient.deleteAcceptance(
          {
            Id: result.insert_acceptance_one!.Id,
          },
          {
            user,
            confirmChangeRequest: true,
          }
        );

        const acceptanceCheck = await apiClient.getAcceptanceById({
          Id: result.insert_acceptance_one!.Id,
        });
        expect(
          acceptanceCheck?.acceptance_by_pk?.Id ===
            result?.insert_acceptance_one?.Id
        ).toBeTruthy();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      'When $RoleKey tries to delete a control, it denies permission',
      async (user) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });
        const acceptance = await apiClient.insertAcceptance(
          buildAcceptance({ ParentId: risk.Id! })
        );

        await expect(
          apiClient.deleteAcceptance(
            {
              Id: acceptance.insert_acceptance_one!.Id,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey delete $expectedRecords acceptances where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          })
        );

        if (!acceptance?.insert_acceptance_one) {
          throw new Error('Acceptance not inserted');
        }

        const result = await apiClient.deleteAcceptance(
          { Id: acceptance?.insert_acceptance_one?.Id },
          {
            user,
          }
        );
        expect(result?.deleteAcceptancesById?.affected_rows).toEqual(
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
      '$RoleKey delete $expectedRecords acceptances where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          })
        );

        if (!acceptance?.insert_acceptance_one) {
          throw new Error('Acceptance not inserted');
        }

        const result = await apiClient.deleteAcceptance(
          { Id: acceptance?.insert_acceptance_one?.Id },
          {
            user,
          }
        );
        expect(result?.deleteAcceptancesById?.affected_rows).toEqual(
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
      '$RoleKey delete $expectedRecords acceptances where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          })
        );

        if (!acceptance?.insert_acceptance_one) {
          throw new Error('Acceptance not inserted');
        }

        const result = await apiClient.deleteAcceptance(
          { Id: acceptance?.insert_acceptance_one?.Id },
          {
            user,
          }
        );
        expect(result?.deleteAcceptancesById?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey updates $expectedRecords acceptances where they are not the Owner or contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk();
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          { user }
        );

        if (!acceptance?.insertChildAcceptance) {
          throw new Error('Acceptance not inserted');
        }

        const insertedAcceptance = await apiClient.getAcceptanceById({
          Id: acceptance.insertChildAcceptance.Id,
        });

        const result = await apiClient.updateAcceptance(
          buildUpdateAcceptance({
            Id: acceptance.insertChildAcceptance.Id,
            Title: 'updated',
            LatestModifiedAtTimestamp:
              insertedAcceptance.acceptance_by_pk?.ModifiedAtTimestamp,
          }),
          {
            user,
          }
        );
        expect(result?.updateChildAcceptance?.affected_rows).toEqual(
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
      '$RoleKey updates $expectedRecords acceptances where they are the owner of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          { user }
        );

        if (!acceptance?.insertChildAcceptance) {
          throw new Error('Acceptance not inserted');
        }

        const insertedAcceptance = await apiClient.getAcceptanceById({
          Id: acceptance.insertChildAcceptance.Id,
        });

        const result = await apiClient.updateAcceptance(
          buildUpdateAcceptance({
            Id: acceptance.insertChildAcceptance.Id,
            Title: 'updated',
            LatestModifiedAtTimestamp:
              insertedAcceptance.acceptance_by_pk?.ModifiedAtTimestamp,
          }),
          {
            user,
          }
        );
        expect(result?.updateChildAcceptance?.affected_rows).toEqual(
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
      '$RoleKey updates $expectedRecords acceptances where they are a contributor of the parent risk',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const acceptance = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          { user }
        );
        if (!acceptance?.insertChildAcceptance) {
          throw new Error('Acceptance not inserted');
        }

        const insertedAcceptance = await apiClient.getAcceptanceById({
          Id: acceptance.insertChildAcceptance.Id,
        });

        const result = await apiClient.updateAcceptance(
          buildUpdateAcceptance({
            Id: acceptance.insertChildAcceptance.Id,
            Title: 'updated',
            LatestModifiedAtTimestamp:
              insertedAcceptance?.acceptance_by_pk!.ModifiedAtTimestamp,
          }),
          {
            user,
          }
        );
        expect(result?.updateChildAcceptance?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([standardUser1])(
      '$RoleKey inserts acceptance for approval',
      async (user) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await insertApproval(
          buildApprovalWorkflow(
            'open-acceptance',
            [[{ UserId: riskManagerUser1.Id }]],
            risk.Id!
          )
        );

        const result = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
            Status: AcceptanceStatusEnum.Open,
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAcceptance?.Id).toBeDefined();

        const acceptance = await apiClient.getAcceptanceById({
          Id: result.insertChildAcceptance!.Id,
        });
        expect(
          acceptance.acceptance_by_pk?.Status === AcceptanceStatusEnum.Pending
        ).toBeTruthy();

        const changeRequests = await getAllChangeRequests();
        const pending = changeRequests.find(
          (cr) =>
            cr.ParentId === result.insertChildAcceptance!.Id &&
            cr.ChangeRequestStatus === ApprovalStatusEnum.Pending
        );
        expect(pending?.RequestedChanges).toEqual(
          expect.objectContaining({ Status: AcceptanceStatusEnum.Open })
        );
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey inserts acceptances where they are not the Owner or contributor of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        const result = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAcceptance?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert an acceptance where they are not the Owner or contributor of the parent risk',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.insertChildAcceptance(
            buildAcceptance({
              ParentId: risk.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey inserts acceptances where they are the owner of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const result = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAcceptance?.Id).toBeDefined();
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey updates acceptances where they are a contributor of the parent risk',
      async ({ ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const result = await apiClient.insertChildAcceptance(
          buildAcceptance({
            ParentId: risk.Id!,
          }),
          {
            user,
          }
        );
        expect(result?.insertChildAcceptance?.Id).toBeDefined();
      }
    );
  });
});
