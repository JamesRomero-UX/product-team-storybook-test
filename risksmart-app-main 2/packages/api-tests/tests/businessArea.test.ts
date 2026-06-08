import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteBusinessArea,
  getBusinessAreas,
  insertBusinessArea,
  updateBusinessArea,
} from '../clients/businessAreaClient';
import { buildBusinessArea } from '../data/businessArea';
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

describe('businessArea', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
        error: "field 'business_area' not found in type: 'query_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        error: "field 'business_area' not found in type: 'query_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        error: "field 'business_area' not found in type: 'query_root'",
      },
      { ...riskManagerUser1, expectedRecords: 1, error: undefined },
      { ...internalAuditUser1, expectedRecords: 1, error: undefined },
    ])(
      '$RoleKey should see $expectedRecords business areas',
      async ({ expectedRecords, error, ...user }) => {
        await insertBusinessArea(buildBusinessArea());

        const data = await getBusinessAreas({
          user,
        });
        if (error) {
          expect(data.errors![0].message).toEqual(error);
          expect(data.data).toBeUndefined();
        } else {
          expect(data.data.business_area.length).toEqual(expectedRecords);
        }
      }
    );
  });

  describe('insert', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'insert_business_area' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'insert_business_area' not found in type: 'mutation_root'",
      },
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
    ])(
      '$RoleKey should be able to insert $expectedRecords business areas',
      async ({ expectedRecords, exception, ...user }) => {
        if (exception) {
          await expect(
            insertBusinessArea(
              buildBusinessArea({
                OrgKey: undefined,
                Id: undefined,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
              }),
              { user }
            )
          ).rejects.toThrow(exception);
        } else {
          await insertBusinessArea(
            buildBusinessArea({
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),
            { user }
          );
          const data = await getBusinessAreas({
            user,
          });
          expect(data.data.business_area.length).toEqual(expectedRecords);
        }
      }
    );
  });

  describe('update', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'update_business_area' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'update_business_area' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'update_business_area' not found in type: 'mutation_root'",
      },
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
    ])(
      '$RoleKey should update $expectedRecords business areas',
      async ({ expectedRecords, exception, ...user }) => {
        const businessArea = buildBusinessArea();
        await insertBusinessArea(businessArea);

        const payload = {
          Id: businessArea.Id!,
          Title: 'updated',
        };

        if (exception) {
          await expect(
            updateBusinessArea(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await updateBusinessArea(payload, {
            user,
          });
          expect(result.data?.update_business_area?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_business_area' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_business_area' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_business_area' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords business areas',
      async ({ expectedRecords, exception, ...user }) => {
        const businessArea = buildBusinessArea();
        await insertBusinessArea(buildBusinessArea(businessArea));

        const payload = {
          Id: businessArea.Id!,
        };

        if (exception) {
          await expect(
            deleteBusinessArea(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteBusinessArea(payload, {
            user,
          });
          expect(result.data?.delete_business_area?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });
});
