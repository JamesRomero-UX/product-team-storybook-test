import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { buildTaxonomy } from '../data/taxonomy';
import { buildTaxonomyOrg } from '../data/taxonomyOrg';
import {
  customerSupportUser1,
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

describe('taxonomy', () => {
  let taxonomyId: string;
  beforeEach(async () => {
    taxonomyId = randomUUID();
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await apiClient.deleteTaxonomyOrgByTaxonomyId({
      Id: taxonomyId,
    });
    await apiClient.deleteTaxonomy({
      Id: taxonomyId,
    });
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 0 },
      { ...customerSupportUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey cannot view taxonomy that is not associated with an org',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertTaxonomy({
          objects: [
            buildTaxonomy({
              Id: taxonomyId,
            }),
          ],
        });

        const result = await apiClient.getTaxonomy(
          {},
          {
            user,
          }
        );
        expect(result.taxonomy.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to view taxonomy records associated to users org',
      async ({ expectedRecords, ...user }) => {
        const taxonomy = buildTaxonomy({
          Id: taxonomyId,
        });
        await apiClient.insertTaxonomy({ objects: [taxonomy] });
        await apiClient.insertTaxonomyOrg({
          objects: [
            buildTaxonomyOrg({
              TaxonomyId: taxonomy.Id,
              OrgKey: getDefaultOrgId(),
            }),
          ],
        });

        const result = await apiClient.getTaxonomy(
          {},
          {
            user,
          }
        );
        expect(result.taxonomy.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...customerSupportUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords taxonomy records',
      async ({ expectedRecords, ...user }) => {
        const taxonomy = buildTaxonomy({
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          CreatedAtTimestamp: undefined,
          ModifiedAtTimestamp: undefined,
          Id: undefined,
        });
        const result = await apiClient.insertTaxonomy(
          { objects: [taxonomy] },
          {
            user,
          }
        );

        expect(result?.insert_taxonomy?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey should not be able to insert taxonomy records',
      async ({ ...user }) => {
        const taxonomy = buildTaxonomy({
          Id: taxonomyId,
        });
        await expect(
          apiClient.insertTaxonomy(
            { objects: [taxonomy] },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_taxonomy' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([{ ...customerSupportUser1, expectedRecords: 1 }])(
      '$RoleKey should update $expectedRecords taxonomy records',
      async ({ expectedRecords, ...user }) => {
        const taxonomy = buildTaxonomy({
          Id: taxonomyId,
        });
        await apiClient.insertTaxonomy({ objects: [taxonomy] });

        const result = await apiClient.updateTaxonomy(
          {
            Id: taxonomy.Id!,
            Rating: {},
            Library: {},
            Common: {},
            Taxonomy: {},
            InternalAuditRating: {},
          },
          {
            user,
          }
        );
        expect(result?.update_taxonomy?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1 },

      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey should see $expectedRecords taxonomy records',
      async ({ ...user }) => {
        const taxonomy = buildTaxonomy({
          Id: taxonomyId,
        });
        await apiClient.insertTaxonomy({ objects: [taxonomy] });

        await expect(
          apiClient.updateTaxonomy(
            {
              Id: taxonomy.Id!,
              Rating: {},
              Library: {},
              Common: {},
              Taxonomy: {},
              InternalAuditRating: {},
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_taxonomy' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('delete', () => {
    it.each([{ ...customerSupportUser1, expectedRecords: 1 }])(
      '$RoleKey should delete $expectedRecords taxonomy records',
      async ({ expectedRecords, ...user }) => {
        const taxonomy = buildTaxonomy({
          Id: taxonomyId,
        });
        await apiClient.insertTaxonomy({ objects: [taxonomy] });

        const result = await apiClient.deleteTaxonomy(
          { Id: taxonomy.Id! },
          {
            user,
          }
        );
        expect(result?.delete_taxonomy?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
    ])('$RoleKey cannot delete', async (user) => {
      const taxonomy = buildTaxonomy({
        Id: taxonomyId,
      });
      await apiClient.insertTaxonomy({ objects: [taxonomy] });

      await expect(
        apiClient.deleteTaxonomy(
          { Id: taxonomy.Id! },
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'delete_taxonomy' not found in type: 'mutation_root'"
      );
    });
  });
});
