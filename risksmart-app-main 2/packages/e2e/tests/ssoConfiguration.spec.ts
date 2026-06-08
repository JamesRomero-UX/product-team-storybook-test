import { expect } from '@playwright/test';

import {
  deleteSsoConfigurations,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import { users } from '../users';

test.describe('SSO Configuration - Happy Path', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ user: users.customerSupport });

  test.beforeEach(async () => {
    await deleteSsoConfigurations();
  });

  test.afterEach(async () => {
    await deleteSsoConfigurations();
  });

  test(`Can navigate to SSO configuration tab`, async ({ app }) => {
    await updateOrganisationFeatures(['sso_configuration']);
    await app.settingsPage.ssoConfigurationTab.navigateTo();
    await expect(app.settingsPage.ssoConfigurationTab.tabLink).toBeVisible();
  });

  test(`Can select LDAP provider and see configuration form`, async ({
    app,
  }) => {
    await updateOrganisationFeatures(['sso_configuration']);
    await app.settingsPage.ssoConfigurationTab.navigateTo();

    await app.settingsPage.ssoConfigurationTab.adProviderCard.click();

    await expect(
      app.settingsPage.ssoConfigurationTab.ldapDomainInput
    ).toBeVisible();
    await expect(
      app.settingsPage.ssoConfigurationTab.clientIdInput
    ).toBeVisible();
    await expect(
      app.settingsPage.ssoConfigurationTab.clientSecretInput
    ).toBeVisible();
  });

  test(`Can save an LDAP SSO configuration with SSO disabled`, async ({
    app,
  }) => {
    await updateOrganisationFeatures(['sso_configuration']);
    await app.settingsPage.ssoConfigurationTab.navigateTo();

    // Select LDAP provider
    await app.settingsPage.ssoConfigurationTab.adProviderCard.click();

    // Fill in form with credentials — name includes '-e2e-' for cleanup filtering
    await app.settingsPage.ssoConfigurationTab.fillLdapForm({
      domain: 'e2e-test.example.com',
      clientId: 'rs-e2e-client-id',
      clientSecret: 'rs-e2e-client-secret',
    });

    // Save configuration (SSO toggle should be off by default)
    await app.settingsPage.ssoConfigurationTab.saveButton.click();

    await app.settingsPage.notificationBanner.expectNotification(
      'SSO configuration saved successfully'
    );
  });

  test(`Can enable SSO toggle and re-save`, async ({ app }) => {
    await updateOrganisationFeatures(['sso_configuration']);
    await app.settingsPage.ssoConfigurationTab.navigateTo();

    // Select LDAP provider and fill form
    await app.settingsPage.ssoConfigurationTab.adProviderCard.click();

    await app.settingsPage.ssoConfigurationTab.fillLdapForm({
      domain: 'e2e-test.example.com',
      clientId: 'rs-e2e-client-id',
      clientSecret: 'rs-e2e-client-secret',
    });

    // First save with SSO disabled
    await app.settingsPage.ssoConfigurationTab.saveButton.click();
    await app.settingsPage.notificationBanner.expectNotification(
      'SSO configuration saved successfully'
    );

    await app.settingsPage.ssoConfigurationTab.fillLdapForm({
      clientSecret: 'rs-e2e-client-secret',
    });

    // Enable SSO toggle
    await app.settingsPage.ssoConfigurationTab.enableSsoToggle.click();

    // Save again with SSO enabled
    await app.settingsPage.notificationBanner.expectNotification(
      'SSO connection enabled successfully'
    );
  });

  test(`Can verify saved configuration persists on reload`, async ({
    page,
    app,
  }) => {
    await updateOrganisationFeatures(['sso_configuration']);
    await app.settingsPage.ssoConfigurationTab.navigateTo();

    // Select LDAP provider and fill form
    await app.settingsPage.ssoConfigurationTab.adProviderCard.click();

    await app.settingsPage.ssoConfigurationTab.fillLdapForm({
      domain: 'e2e-test.example.com',
      clientId: 'rs-e2e-client-id',
      clientSecret: 'rs-e2e-client-secret',
    });

    // Save configuration
    await app.settingsPage.ssoConfigurationTab.saveButton.click();
    await app.settingsPage.notificationBanner.expectNotification(
      'SSO configuration saved successfully'
    );

    // Reload and navigate back
    await page.reload();
    await app.settingsPage.ssoConfigurationTab.navigateTo();

    // Verify clientId is pre-populated
    await expect(
      app.settingsPage.ssoConfigurationTab.clientIdInput
    ).toHaveValue('rs-e2e-client-id', { timeout: 10000 });
  });
});

test.describe('SSO Configuration - Invalid Permissions', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ user: users.riskManager });
  test(`Can't navigate to SSO configuration tab with incorrect permissions`, async ({
    page,
    app,
  }) => {
    await page.goto('/');

    await app.settingsPage.navigateToAndAssertTitle();
    await expect(
      app.settingsPage.ssoConfigurationTab.tabLink
    ).not.toBeVisible();
  });
});
