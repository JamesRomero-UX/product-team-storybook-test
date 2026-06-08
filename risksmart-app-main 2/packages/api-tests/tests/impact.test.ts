import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { deleteImpact, getAllImpacts } from '../clients/impactClient';
import { buildInsertImpactApi, buildUpdateImpactApi } from '../data/impact';
import {
  internalAuditUser1,
  publicUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
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

describe('impact', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords impacts',
      async ({ expectedRecords, ...user }) => {
        const impact = buildInsertImpactApi({});
        await apiClient.insertImpact(
          {
            object: impact,
          },
          {
            user: riskManagerUser1,
          }
        );

        const { data } = await getAllImpacts({
          user,
        });
        expect(data.impact.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should be able to delete $expectedRecords impacts',
      async ({ expectedRecords, ...user }) => {
        const { insertImpactApi } = await apiClient.insertImpact(
          {
            object: buildInsertImpactApi(),
          },
          {
            user: riskManagerUser1,
          }
        );

        const result = await deleteImpact(
          {
            Id: insertImpactApi!.Id,
          },
          { user }
        );
        expect(result?.data?.delete_impact?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      readOnlyUser1,
      standardUser1,
      publicUser1,
      internalAuditUser1,
    ])('$RoleKey cannot update impacts directly', async (user) => {
      const { insertImpactApi } = await apiClient.insertImpact(
        {
          object: buildInsertImpactApi(),
        },
        {
          user: riskManagerUser1,
        }
      );

      await expect(
        apiClient.updateImpact(
          {
            Id: insertImpactApi!.Id,
            Name: 'Updated',
          },
          { user }
        )
      ).rejects.toThrow(
        `field 'update_impact' not found in type: 'mutation_root'`
      );
    });
  });

  describe('updateImpactApi', () => {
    it.each([
      { ...riskManagerUser1, hasAccess: true },
      { ...readOnlyUser1, hasAccess: false },
      { ...standardUser1, hasAccess: false },
      { ...publicUser1, hasAccess: false },

      { ...internalAuditUser1, hasAccess: false },
    ])(
      '$RoleKey hasAccess=$hasAccess to update impacts',
      async ({ hasAccess, ...user }) => {
        const { insertImpactApi } = await apiClient.insertImpact(
          {
            object: buildInsertImpactApi(),
          },
          {
            user: riskManagerUser1,
          }
        );

        const update = apiClient.updateImpactApi(
          {
            object: buildUpdateImpactApi({
              Id: insertImpactApi!.Id,
              Name: 'Updated',
            }),
          },
          { user }
        );
        if (hasAccess) {
          const response = await update;
          expect(response?.updateImpactApi?.affected_rows).toEqual(1);
        } else {
          await expect(update).rejects.toThrow('Access denied');
        }
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert an impact',
      async (user) => {
        const { insertImpactApi } = await apiClient.insertImpact(
          {
            object: buildInsertImpactApi(),
          },
          {
            user,
          }
        );
        expect(insertImpactApi?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, publicUser1, internalAuditUser1])(
      '$RoleKey cannot insert an impact',
      async (user) => {
        await expect(
          apiClient.insertImpact(
            {
              object: buildInsertImpactApi(),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );
  });
});
