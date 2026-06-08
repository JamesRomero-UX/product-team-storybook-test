import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildCustomDatasource } from '../data/customDatasource';
import {
  customerSupportUser1,
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

describe('custom datasource', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...riskManagerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertCustomDatasources({
          objects: buildCustomDatasource({}),
        });
        const result = await apiClient.getAllCustomDatasources(
          {},
          {
            user,
          }
        );
        expect(result.custom_datasource.length).toEqual(expectedRecords);
      }
    );

    it.each([
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey cannot access custom data sources', async ({ ...user }) => {
      await apiClient.insertCustomDatasources({
        objects: buildCustomDatasource({}),
      });
      await expect(
        apiClient.getAllCustomDatasources(
          {},
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'custom_datasource' not found in type: 'query_root'"
      );
    });
  });

  describe('delete', () => {
    it.each([
      { ...customerSupportUser1, deletedRecords: 1 },
      { ...riskManagerUser1, deletedRecords: 1 },
    ])(
      'When $RoleKey deletes a custom datasource, it deletes $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const customDatasource = buildCustomDatasource({});
        await apiClient.insertCustomDatasources({ objects: customDatasource });

        const data = await apiClient.deleteCustomDatasource(
          {
            Id: customDatasource.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_custom_datasource?.affected_rows).toEqual(
          deletedRecords
        );
      }
    );

    it.each([standardUser1])(
      'When $RoleKey tries to delete a custom data source, it denies permission',
      async (user) => {
        const customDatasource = buildCustomDatasource({});
        await apiClient.insertCustomDatasources({ objects: customDatasource });

        await expect(
          apiClient.deleteCustomDatasource(
            {
              Id: customDatasource.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'delete_custom_datasource' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords custom data source',
      async ({ expectedRecords, ...user }) => {
        const customDatasource = buildCustomDatasource({});
        await apiClient.insertCustomDatasources({ objects: customDatasource });

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateCustomDatasource(
              {
                where: {
                  Id: { _eq: customDatasource.Id! },
                },
                set: { Title: 'Updated' },
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            "field 'update_custom_datasource' not found in type: 'mutation_root'"
          );

          return;
        }

        const data = await apiClient.updateCustomDatasource(
          {
            where: {
              Id: { _eq: customDatasource.Id! },
            },
            set: { Title: 'Updated' },
          },
          {
            user,
          }
        );

        expect(data?.update_custom_datasource?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
