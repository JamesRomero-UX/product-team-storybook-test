import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getTaxonomyAudit } from '../clients/taxonomyAuditClient';
import { buildTaxonomy } from '../data/taxonomy';
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

describe('taxonomy audit', () => {
  const taxonomyId = randomUUID();
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });
  afterEach(async () => {
    await apiClient.deleteTaxonomyOrgByTaxonomyId({
      Id: taxonomyId,
    });
    await apiClient.deleteTaxonomy({ Id: taxonomyId });
  });

  describe('query', () => {
    it.each([{ ...customerSupportUser1 }])(
      '$RoleKey should see $expectedRecords taxonomy audit records',
      async ({ ...user }) => {
        // Automatically creates audit record
        await apiClient.insertTaxonomy({
          objects: [
            buildTaxonomy({
              Id: taxonomyId,
            }),
          ],
        });

        const taxonomyAuditRecords = await getTaxonomyAudit({
          user,
        });
        expect(taxonomyAuditRecords.length).toBeGreaterThan(0);
      }
    );
  });

  it.each([
    riskManagerUser1,
    standardUser1,
    readOnlyUser1,
    publicUser1,
    internalAuditUser1,
  ])('$RoleKey cannot view taxonomy audit records', async (user) => {
    // Automatically creates audit record
    await apiClient.insertTaxonomy({
      objects: [
        buildTaxonomy({
          Id: taxonomyId,
        }),
      ],
    });

    const taxonomyAuditRecords = await getTaxonomyAudit({
      user,
    });
    expect(taxonomyAuditRecords).toBeUndefined();
  });
});
