import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getIngestionConfigs } from '../clients/ingestionConfigClient';
import { buildIngestionConfig } from '../data/ingestionConfig';
import {
  customerSupportUser1,
  internalAuditUser1,
  publicUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
  thirdPartyRespondent1,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('ingestionConfig', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords ingestion configs',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertIngestionConfigs({
          objects: [buildIngestionConfig()],
        });

        const data = await getIngestionConfigs({ user });
        expect(data.data?.ingestion_config?.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...readOnlyUser1 },
      { ...publicUser1 },
      { ...internalAuditUser1 },
      { ...thirdPartyRespondent1 },
    ])(
      '$RoleKey should not be able to see ingestion configs',
      async ({ ...user }) => {
        const data = await getIngestionConfigs({ user });
        expect(data.data).toEqual(undefined);
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1, customerSupportUser1])(
      '$RoleKey should be able to insert an ingestion config',
      async ({ ...user }) => {
        const result = apiClient.insertRestAPIIngestionConfig(
          {
            object: {
              IngestionConfig: {},
            },
          },
          { user }
        );

        await expect(result).resolves.toBeDefined();
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      readOnlyUser1,
      publicUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])(
      '$RoleKey should NOT be able to insert an ingestion config',
      async (user) => {
        await expect(
          apiClient.insertRestAPIIngestionConfig(
            {
              object: {
                IngestionConfig: {},
              },
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insertChildIngestionConfig' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([riskManagerUser1, customerSupportUser1])(
      '$RoleKey should be able to update an ingestion config',
      async ({ ...user }) => {
        const inserted = await apiClient.insertRestAPIIngestionConfig(
          {
            object: {
              IngestionConfig: {},
            },
          },
          { user }
        );

        const ingestionConfigId = inserted.insertChildIngestionConfig!.Id;

        const ingestionConfigs = await getIngestionConfigs({ user });
        const record = ingestionConfigs.data.ingestion_config.find(
          (c) => c.Id === ingestionConfigId
        );

        const result = apiClient.updateRestAPIIngestionConfig(
          {
            object: {
              Id: ingestionConfigId,
              IngestionConfig: { updated: true },
              OriginalTimestamp: record!.ModifiedAtTimestamp,
            },
          },
          { user }
        );

        await expect(result).resolves.toBeDefined();
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      readOnlyUser1,
      publicUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])(
      '$RoleKey should NOT be able to update an ingestion config',
      async (user) => {
        await expect(
          apiClient.updateRestAPIIngestionConfig(
            {
              object: {
                Id: '00000000-0000-0000-0000-000000000000',
                IngestionConfig: {},
                OriginalTimestamp: new Date().toISOString(),
              },
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'updateChildIngestionConfig' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('delete', () => {
    it.each([riskManagerUser1, customerSupportUser1])(
      '$RoleKey should be able to delete an ingestion config',
      async ({ ...user }) => {
        const inserted = await apiClient.insertRestAPIIngestionConfig(
          {
            object: {
              IngestionConfig: {},
            },
          },
          { user }
        );

        const ingestionConfigId = inserted.insertChildIngestionConfig!.Id;

        const result = apiClient.deleteRestAPIIngestionConfig(
          {
            object: {
              Id: ingestionConfigId,
            },
          },
          { user }
        );

        await expect(result).resolves.toBeDefined();
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      readOnlyUser1,
      publicUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])(
      '$RoleKey should NOT be able to delete an ingestion config',
      async (user) => {
        await expect(
          apiClient.deleteRestAPIIngestionConfig(
            {
              object: {
                Id: '00000000-0000-0000-0000-000000000000',
              },
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'deleteChildIngestionConfig' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
