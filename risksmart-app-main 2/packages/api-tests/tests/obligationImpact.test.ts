import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertObligation } from '../clients/obligationClient';
import {
  deleteObligationImpact,
  getObligationImpacts,
  insertObligationImpact,
  updateObligationImpact,
} from '../clients/obligationImpact';
import { buildContributor } from '../data/contributor';
import { buildObligation } from '../data/obligation';
import { buildObligationImpact } from '../data/obligationImpact';
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

describe('obligationImpact', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 10000);

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
      '$RoleKey should see $expectedRecords obligation impacts where they are not the Owner or contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        await insertObligation(
          buildObligation({
            impacts: {
              data: [buildObligationImpact({})],
            },
          })
        );

        const obligationImpacts = await getObligationImpacts({
          user,
        });
        expect(obligationImpacts.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligation impacts where they are the owner of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        await insertObligationImpact(
          buildObligationImpact({
            ParentObligationId: obligation.Id,
          })
        );

        const obligationImpacts = await getObligationImpacts({
          user,
        });
        expect(obligationImpacts.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords obligations where they are a contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await insertObligation(obligation);
        await insertObligationImpact(
          buildObligationImpact({
            ParentObligationId: obligation.Id,
          })
        );

        const obligationImpacts = await getObligationImpacts({
          user,
        });
        expect(obligationImpacts.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation impact, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({});
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);

        const { data } = await deleteObligationImpact(
          {
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_obligation_impact?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation impact where they are the owner of the parent obligation, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);
        const { data } = await deleteObligationImpact(
          {
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_obligation_impact?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an obligation impact where they are a contributor of the parent obligation, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);

        const { data } = await deleteObligationImpact(
          {
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_obligation_impact?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords obligation impacts when they are the Owner of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const { data } = await insertObligationImpact(
          buildObligationImpact({
            ParentObligationId: obligation.Id,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),

          {
            user,
          }
        );
        expect(data?.insert_obligation_impact?.affected_rows).toEqual(
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
      '$RoleKey can insert $expectedRecords obligation impacts when they are the contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const { data } = await insertObligationImpact(
          buildObligationImpact({
            ParentObligationId: obligation.Id,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),

          {
            user,
          }
        );
        expect(data?.insert_obligation_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords obligation impacts when they are not the Owner or contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({});
        await insertObligation(obligation);
        const { data } = await insertObligationImpact(
          buildObligationImpact({
            ParentObligationId: obligation.Id,
            OrgKey: undefined,
            Id: undefined,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
          }),

          {
            user,
          }
        );
        expect(data?.insert_obligation_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      {
        ...readOnlyUser1,
        message:
          "field 'insert_obligation_impact' not found in type: 'mutation_root'",
      },
      {
        ...standardUser1,
        message: 'check constraint of an insert/update permission has failed',
      },
      {
        ...standardEnhancedUser1,
        message: 'check constraint of an insert/update permission has failed',
      },
      {
        ...internalAuditUser1,
        message: 'check constraint of an insert/update permission has failed',
      },
    ])(
      '$RoleKey cannot insert obligation impacts when they are not the Owner or contributor of the parent obligation',
      async ({ message, ...user }) => {
        const obligation = buildObligation({});
        await insertObligation(obligation);
        await expect(
          insertObligationImpact(
            buildObligationImpact({
              ParentObligationId: obligation.Id!,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),

            {
              user,
            }
          )
        ).rejects.toThrow(message);
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords obligation impacts when NOT owner or contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({});
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);
        const description = 'updated description';
        const { data } = await updateObligationImpact(
          {
            Description: description,
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );
        expect(data?.update_obligation_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords obligation impacts if they are the owner of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);
        const description = 'updated description';
        const { data } = await updateObligationImpact(
          {
            Description: description,
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );
        expect(data?.update_obligation_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: introduce when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords obligation impacts if they are the contributor of the parent obligation',
      async ({ expectedRecords, ...user }) => {
        const obligation = buildObligation({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertObligation(obligation);
        const obligationImpact = buildObligationImpact({
          ParentObligationId: obligation.Id,
        });
        await insertObligationImpact(obligationImpact);
        const description = 'updated description';

        const { data } = await updateObligationImpact(
          {
            Description: description,
            Id: obligationImpact.Id!,
          },
          {
            user,
          }
        );

        expect(data?.update_obligation_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
