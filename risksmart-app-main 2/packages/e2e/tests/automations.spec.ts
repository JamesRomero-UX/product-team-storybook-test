import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

test.describe('Automations page', () => {
  test('Displays all integration cards when integrations feature is enabled', async ({
    page,
    app,
  }) => {
    await updateOrganisationFeatures(['integrations']);
    await page.goto('/');
    await app.automationsPage.navigateToAndAssertTitle();

    // Verify all 6 integration cards are visible
    await app.automationsPage.expectCardCount(6);
    await app.automationsPage.expectCardVisible('Zapier (Self-Managed)');
    await app.automationsPage.expectCardVisible('Zapier by RiskSmart');
    await app.automationsPage.expectCardVisible('MCP Server for Integrations');
    await app.automationsPage.expectCardVisible('MCP Personal');
    await app.automationsPage.expectCardVisible('REST API');
    await app.automationsPage.expectCardVisible('Slack App');
  });

  test('Opens dialog when clicking an enabled integration card', async ({
    page,
    app,
  }) => {
    await updateOrganisationFeatures(['integrations']);
    await page.goto('/');
    await app.automationsPage.navigateToAndAssertTitle();

    // Click the Zapier (Self-Managed) card
    await app.automationsPage.clickCard('Zapier (Self-Managed)');
    await app.automationsPage.expectDialogVisible('Zapier (Self-Managed)');

    // Verify dialog has external action buttons
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Create a Zap')).toBeVisible();
    await expect(dialog.getByText('Browse Apps')).toBeVisible();

    // Close the dialog
    await app.automationsPage.closeDialog();
    await expect(dialog).not.toBeVisible();
  });

  test('Shows Coming Soon badge on Slack card', async ({ page, app }) => {
    await updateOrganisationFeatures(['integrations']);
    await page.goto('/');
    await app.automationsPage.navigateToAndAssertTitle();

    // Slack card should show Coming Soon badge
    const slackCard = page.getByText('Slack App').locator('../../..');
    await expect(slackCard.getByText('Coming Soon')).toBeVisible();
  });

  test('Automations nav item is hidden when feature is disabled', async ({
    page,
  }) => {
    await updateOrganisationFeatures([]);
    await page.goto('/');

    // The Automations nav item should not be present
    const nav = page.getByTestId('navigation');
    await expect(nav.getByText('Automations')).not.toBeVisible();
  });
});
