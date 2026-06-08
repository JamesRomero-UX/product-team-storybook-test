import {
  buildOrganisationModule,
  insertOrganisationModule,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('organisation-module', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getByOrgId', () => {
    it('should return null when no organisation module exists', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).toBeNull();
    });

    it('should return organisation module for the org', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildOrganisationModule({ orgKey, userId });
      await insertOrganisationModule(input);

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).not.toBeNull();
      expect(response?.organisationModule).toBeDefined();
    });

    it('should return organisation module with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const moduleSettings = { modules: ['risk', 'compliance'] };
      const input = buildOrganisationModule({
        orgKey,
        userId,
        overrides: { ModuleSettings: moduleSettings },
      });
      await insertOrganisationModule(input);

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).not.toBeNull();
      expect(response?.organisationModule).toEqual(
        expect.objectContaining({
          ModuleSettings: moduleSettings,
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should not return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildOrganisationModule({ orgKey, userId });
      await insertOrganisationModule(input);

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).not.toBeNull();
      expect(response?.organisationModule).not.toHaveProperty('OrgKey');
    });

    it('should return createdByUser and modifiedByUser relations', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildOrganisationModule({ orgKey, userId });
      await insertOrganisationModule(input);

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).not.toBeNull();
      expect(response?.organisationModule).toHaveProperty('createdByUser');
      expect(response?.organisationModule).toHaveProperty('modifiedByUser');
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const input = buildOrganisationModule({ orgKey, userId });
      await insertOrganisationModule(input);

      const response =
        await trpcClient.frontend.organisationModule.getByOrgId.query();

      expect(response).not.toBeNull();
      expect(response?.organisationModule?.CreatedAtTimestamp).toBeDefined();
      expect(response?.organisationModule?.ModifiedAtTimestamp).toBeDefined();
    });
  });
});
