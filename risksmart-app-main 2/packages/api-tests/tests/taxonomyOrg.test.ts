import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getAnotherOrgId, getDefaultOrgId } from '../clients/defaults';
import { buildTaxonomy } from '../data/taxonomy';
import { buildTaxonomyOrg } from '../data/taxonomyOrg';
import type { TaxonomyInsertInput } from '../generated/graphql';
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

describe('taxonomyOrg', () => {
  let taxonomy: TaxonomyInsertInput;
  beforeEach(async () => {
    await setup(mockedDefaults);
    taxonomy = buildTaxonomy({});
    await apiClient.insertTaxonomy({ objects: [taxonomy] });
  });
  afterEach(async () => {
    await teardown();
    await apiClient.deleteTaxonomyOrgByTaxonomyId({
      Id: taxonomy.Id!,
    });
    await apiClient.deleteTaxonomy({ Id: taxonomy.Id! });
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see orgs  taxonomy org records',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertTaxonomyOrg({
          objects: [
            buildTaxonomyOrg({
              TaxonomyId: taxonomy.Id,
              OrgKey: getDefaultOrgId(),
            }),
          ],
        });

        const taxonomyOrg = await apiClient.getTaxonomyOrg(
          {},
          {
            user,
          }
        );
        expect(taxonomyOrg.taxonomy_org.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 0 },
      { ...customerSupportUser1, expectedRecords: 0 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...publicUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey not should see other orgs taxonomy org records',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertTaxonomyOrg({
          objects: [
            buildTaxonomyOrg({
              TaxonomyId: taxonomy.Id,
              OrgKey: getAnotherOrgId(),
            }),
          ],
        });

        const taxonomyOrg = await apiClient.getTaxonomyOrg(
          {},
          {
            user,
          }
        );
        expect(taxonomyOrg.taxonomy_org.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...customerSupportUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords taxonomy org records',
      async ({ expectedRecords, ...user }) => {
        const taxonomyOrg = buildTaxonomyOrg({
          TaxonomyId: taxonomy.Id,
          CreatedByUser: undefined,
          ModifiedByUser: undefined,
          CreatedAtTimestamp: undefined,
          ModifiedAtTimestamp: undefined,
          Id: undefined,
          OrgKey: undefined,
        });
        const result = await apiClient.insertTaxonomyOrg(
          { objects: [taxonomyOrg] },
          {
            user,
          }
        );

        expect(result?.insert_taxonomy_org?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey should not be able to insert taxonomy org records',
      async ({ ...user }) => {
        const taxonomyOrg = buildTaxonomyOrg({ TaxonomyId: taxonomy.Id });
        await expect(
          apiClient.insertTaxonomyOrg(
            { objects: [taxonomyOrg] },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_taxonomy_org' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('delete', () => {
    it.each([{ ...customerSupportUser1, expectedRecords: 1 }])(
      '$RoleKey should delete $expectedRecords taxonomy org records',
      async ({ expectedRecords, ...user }) => {
        const taxonomyOrg = buildTaxonomyOrg({ TaxonomyId: taxonomy.Id });
        await apiClient.insertTaxonomyOrg({
          objects: [taxonomyOrg],
        });

        const result = await apiClient.deleteTaxonomyOrg(
          { Id: taxonomyOrg.Id! },
          {
            user,
          }
        );
        expect(result?.delete_taxonomy_org?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
    ])('$RoleKey cannot delete', async (user) => {
      const taxonomyOrg = buildTaxonomyOrg({ TaxonomyId: taxonomy.Id });
      await apiClient.insertTaxonomyOrg({
        objects: [taxonomyOrg],
      });

      await expect(
        apiClient.deleteTaxonomyOrg(
          { Id: taxonomyOrg.Id! },
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'delete_taxonomy_org' not found in type: 'mutation_root'"
      );
    });
  });
});
