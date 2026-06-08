import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteDataImport,
  getDataImports,
  insertDataImport,
  startDataImport,
  updateDataImport,
} from '../clients/dataImport';
import { getDefaultOrgId } from '../clients/defaults';
import { buildDataImport } from '../data/dataImport';
import { DataImportStatusEnum } from '../generated/graphql';
import {
  customerSupportUser1,
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

describe('data import', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('startImport', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
    ])('$RoleKey cannot start an import', async ({ ...user }) => {
      const dataImport = buildDataImport({
        Status: DataImportStatusEnum.Valid,
      });
      await insertDataImport({ objects: [dataImport] });
      await expect(
        startDataImport(
          {
            Id: dataImport.Id!,
          },
          { user }
        )
      ).rejects.toThrow(
        `field 'dataImportStartImport' not found in type: 'mutation_root'`
      );
    });

    it('sets data import status to InitiatingImport', async () => {
      const dataImport = buildDataImport({
        Status: DataImportStatusEnum.Valid,
      });
      await insertDataImport({ objects: [dataImport] });
      await startDataImport(
        {
          Id: dataImport.Id!,
        },
        { user: customerSupportUser1 }
      );
      const results = await getDataImports({
        orgId: getDefaultOrgId(),
        user: customerSupportUser1,
      });
      expect(results.data.data_import.length).toEqual(1);
      const dataImportResult = results.data.data_import[0];
      expect(dataImportResult.Status).toEqual(
        DataImportStatusEnum.InitiatingImport
      );
    });

    it('cannot start an import that does not exist', async () => {
      await expect(
        startDataImport(
          {
            Id: '0496a4ed-4357-4a4b-b933-5b87756e20b5',
          },
          { user: customerSupportUser1 }
        )
      ).rejects.toThrow('Data import not found');
    });

    it('cannot start an import that is not valid', async () => {
      const dataImport = buildDataImport({
        Status: DataImportStatusEnum.Failed,
      });
      await insertDataImport({ objects: [dataImport] });
      await expect(
        startDataImport(
          {
            Id: dataImport.Id!,
          },
          { user: customerSupportUser1 }
        )
      ).rejects.toThrow('Data import must be valid before starting import');
    });
  });

  describe('query', () => {
    it.each([
      {
        ...riskManagerUser1,
        expectedRecords: undefined,
        errorMessage: `field 'data_import' not found in type: 'query_root'`,
      },
      {
        ...standardUser1,
        expectedRecords: undefined,
        errorMessage: `field 'data_import' not found in type: 'query_root'`,
      },
      {
        ...readOnlyUser1,
        expectedRecords: undefined,
        errorMessage: `field 'data_import' not found in type: 'query_root'`,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: undefined,
        errorMessage: `field 'data_import' not found in type: 'query_root'`,
      },
      { ...customerSupportUser1, expectedRecords: 1, errorMessage: undefined },
    ])(
      '$RoleKey should see $expectedRecords data imports',
      async ({ expectedRecords, errorMessage, ...user }) => {
        await insertDataImport({ objects: [buildDataImport({})] });

        const dataImports = await getDataImports({
          user,
        });
        expect(dataImports.errors?.[0]?.message).toEqual(errorMessage);
        expect(dataImports.data?.data_import?.length).toEqual(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      customerSupportUser1,
    ])(
      '$RoleKey should not be able to update directly',
      async ({ ...user }) => {
        let errorMessage = '';
        const dataImport = buildDataImport({});
        await insertDataImport({ objects: [dataImport] });
        try {
          await updateDataImport(
            {
              Id: dataImport.Id!,
              Status: DataImportStatusEnum.Valid,
            },
            {
              user,
            }
          );
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMessage = (e as any).message;
        }
        expect(errorMessage).toEqual(
          `field 'update_data_import' not found in type: 'mutation_root'`
        );
      }
    );
  });

  describe('delete', () => {
    it.each([
      {
        ...riskManagerUser1,
        expectedRecords: undefined,
        errorMessage: `field 'delete_data_import' not found in type: 'mutation_root'`,
      },
      {
        ...standardUser1,
        expectedRecords: undefined,
        errorMessage: `field 'delete_data_import' not found in type: 'mutation_root'`,
      },
      {
        ...readOnlyUser1,
        expectedRecords: undefined,
        errorMessage: `field 'delete_data_import' not found in type: 'mutation_root'`,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: undefined,
        errorMessage: `field 'delete_data_import' not found in type: 'mutation_root'`,
      },
      { ...customerSupportUser1, expectedRecords: 1, errorMessage: undefined },
    ])(
      '$RoleKey should see $expectedRecords data imports',
      async ({ expectedRecords, errorMessage, ...user }) => {
        const dataImport = buildDataImport({});
        await insertDataImport({ objects: [dataImport] });
        try {
          const result = await deleteDataImport(dataImport.Id!, {
            user,
          });
          expect(result.data?.delete_data_import?.affected_rows).toEqual(
            expectedRecords
          );
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expect((e as any).message).toEqual(errorMessage);
        }
      }
    );
  });
});
