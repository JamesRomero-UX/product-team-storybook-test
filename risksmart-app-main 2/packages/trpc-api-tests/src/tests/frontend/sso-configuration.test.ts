import { createTestContext } from 'src/utils/test-context';
import { describe, expect, it } from 'vitest';

describe('sso-configuration', () => {
  it('should create a new SSO configuration', async () => {
    const { trpcClient } = await createTestContext();
    const createResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'waad',
        domain: 'example.com',
        clientId: 'client-123',
        clientSecret: 'secret-abc',
        addOrgConnection: false,
      }
    );

    expect(createResult).toMatchObject({
      Strategy: 'waad',
      Action: 'created',
      IsOrgConnected: false,
      Enabled: true,
    });

    // Verify it exists with the correct ClientId
    const configs = await trpcClient.frontend.ssoConfiguration.list.query();
    expect(
      configs.some(
        (c) => c.ConnectionId === createResult.Id && c.ClientId === 'client-123'
      )
    ).toBe(true);
  });

  it('should create a connection without org connection, then enable it and reflect updated state via list', async () => {
    const { trpcClient } = await createTestContext();

    // Step 1: Create SSO config without org connection
    const createResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'waad',
        domain: 'org-test.com',
        clientId: 'client-org-456',
        clientSecret: 'secret-org-xyz',
        addOrgConnection: false,
      }
    );

    expect(createResult).toMatchObject({
      Strategy: 'waad',
      Action: 'created',
      IsOrgConnected: false,
      Enabled: true,
    });

    // Step 2: Verify the record is present in the DB via list with IsOrganizationConnected false
    const configsAfterCreate =
      await trpcClient.frontend.ssoConfiguration.list.query();
    const recordAfterCreate = configsAfterCreate.find(
      (c) => c.ConnectionId === createResult.Id
    );

    expect(recordAfterCreate).toBeDefined();
    expect(recordAfterCreate).toMatchObject({
      ConnectionId: createResult.Id,
      ClientId: 'client-org-456',
      Strategy: 'waad',
      Domain: 'org-test.com',
      IsOrganizationConnected: false,
    });

    // Step 3: Update to enable the org connection
    const updateResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'waad',
        domain: 'org-test.com',
        clientId: 'client-org-456',
        clientSecret: 'secret-org-xyz',
        addOrgConnection: true,
        connectionId: createResult.Id,
      }
    );

    expect(updateResult).toMatchObject({
      Action: 'updated_org_connection',
      IsOrgConnected: true,
    });

    // Step 4: Verify IsOrganizationConnected is now true via list
    const configsAfterUpdate =
      await trpcClient.frontend.ssoConfiguration.list.query();
    const recordAfterUpdate = configsAfterUpdate.find(
      (c) => c.ConnectionId === createResult.Id
    );

    expect(recordAfterUpdate).toBeDefined();
    expect(recordAfterUpdate).toMatchObject({
      ConnectionId: createResult.Id,
      ClientId: 'client-org-456',
      IsOrganizationConnected: true,
    });

    // Cleanup
    await trpcClient.frontend.ssoConfiguration.delete.mutate({
      connectionId: createResult.Id,
    });
  });

  it('should create a connection, enable org connection, then disable it and reflect updated state via list', async () => {
    const { trpcClient } = await createTestContext();

    // Step 1: Create SSO config without org connection
    const createResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'waad',
        domain: 'toggle-test.com',
        clientId: 'client-toggle-789',
        clientSecret: 'secret-toggle-xyz',
        addOrgConnection: false,
      }
    );

    expect(createResult).toMatchObject({
      Action: 'created',
      IsOrgConnected: false,
    });

    // Step 2: Enable the org connection
    const enableResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'waad',
        domain: 'toggle-test.com',
        clientId: 'client-toggle-789',
        clientSecret: 'secret-toggle-xyz',
        addOrgConnection: true,
        connectionId: createResult.Id,
      }
    );

    expect(enableResult).toMatchObject({
      Action: 'updated_org_connection',
      IsOrgConnected: true,
    });

    // Verify org connection is enabled in list
    const configsAfterEnable =
      await trpcClient.frontend.ssoConfiguration.list.query();
    const recordAfterEnable = configsAfterEnable.find(
      (c) => c.ConnectionId === createResult.Id
    );

    expect(recordAfterEnable).toBeDefined();
    expect(recordAfterEnable).toMatchObject({
      ConnectionId: createResult.Id,
      ClientId: 'client-toggle-789',
      IsOrganizationConnected: true,
    });

    // Step 3: Disable the org connection
    const disableResult =
      await trpcClient.frontend.ssoConfiguration.save.mutate({
        strategy: 'waad',
        domain: 'toggle-test.com',
        clientId: 'client-toggle-789',
        clientSecret: 'secret-toggle-xyz',
        addOrgConnection: false,
        connectionId: createResult.Id,
      });

    expect(disableResult).toMatchObject({
      Action: 'updated_org_connection',
      IsOrgConnected: false,
    });

    // Step 4: Verify IsOrganizationConnected is false again via list
    const configsAfterDisable =
      await trpcClient.frontend.ssoConfiguration.list.query();
    const recordAfterDisable = configsAfterDisable.find(
      (c) => c.ConnectionId === createResult.Id
    );

    expect(recordAfterDisable).toBeDefined();
    expect(recordAfterDisable).toMatchObject({
      ConnectionId: createResult.Id,
      ClientId: 'client-toggle-789',
      IsOrganizationConnected: false,
    });

    // Cleanup
    await trpcClient.frontend.ssoConfiguration.delete.mutate({
      connectionId: createResult.Id,
    });
  });

  it('should replace an existing connection when a new one is created', async () => {
    const { trpcClient } = await createTestContext();

    // Step 1: Create the initial SSO config
    const firstResult = await trpcClient.frontend.ssoConfiguration.save.mutate({
      strategy: 'waad',
      domain: 'first-connection.com',
      clientId: 'client-first-111',
      clientSecret: 'secret-first-aaa',
      addOrgConnection: false,
    });

    expect(firstResult).toMatchObject({
      Action: 'created',
      IsOrgConnected: false,
    });

    // Verify the first connection is present
    const configsAfterFirst =
      await trpcClient.frontend.ssoConfiguration.list.query();
    const recordFirst = configsAfterFirst.find(
      (c) => c.ConnectionId === firstResult.Id
    );
    expect(recordFirst).toBeDefined();
    expect(recordFirst).toMatchObject({ ClientId: 'client-first-111' });

    // Step 2: Create a second SSO config — this should replace the first
    const secondResult = await trpcClient.frontend.ssoConfiguration.save.mutate(
      {
        strategy: 'okta',
        domain: 'second-connection.com',
        clientId: 'client-second-222',
        clientSecret: 'secret-second-bbb',
        addOrgConnection: false,
      }
    );

    expect(secondResult).toMatchObject({
      Action: 'created',
      IsOrgConnected: false,
    });

    // Step 3: Verify only one config exists, the old one is gone, and the new one is present
    const configsAfterSecond =
      await trpcClient.frontend.ssoConfiguration.list.query();

    expect(configsAfterSecond).toHaveLength(1);

    const recordAfterSecond = configsAfterSecond.find(
      (c) => c.ConnectionId === secondResult.Id
    );
    expect(recordAfterSecond).toBeDefined();
    expect(recordAfterSecond).toMatchObject({ ClientId: 'client-second-222' });

    // Assert the clientIds are different and the old one is no longer present
    expect(recordAfterSecond!.ClientId).not.toBe(recordFirst!.ClientId);
    expect(
      configsAfterSecond.some((c) => c.ConnectionId === firstResult.Id)
    ).toBe(false);

    // Cleanup
    await trpcClient.frontend.ssoConfiguration.delete.mutate({
      connectionId: secondResult.Id,
    });
  });
});
