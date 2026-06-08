import { expect } from '@playwright/test';

import { test } from '../base';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.use({ user });
  test(`Risk Dashboard heading is "Risk Dashboard" (${user.role})`, async ({
    page,
    app,
  }) => {
    await page.goto('/');
    await app.riskDashboardPage.navigateToAndAssertTitle();
  });
});

test(`Add Tier 1 shown in dashboard`, async ({ page, app }) => {
  await page.goto('/');
  await app.riskDashboardPage.navigateToAndAssertTitle();

  let items = await page.locator(
    app.riskDashboardPage.tier1Cards.findItems().toSelector()
  );
  await expect(items).toHaveCount(0);

  await app.riskDashboardPage.addButton.click();

  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  await app.addRiskPage.detailsTab.riskForm.fillFormAndClickSave({
    riskName: 'Risk 123',
    description: 'Risk 1 description',
  });

  await app.addRiskPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 123');
  await app.addRiskPage.detailsTab.riskForm.cancelButton.click();
  await expect(app.riskDashboardPage.header.title).toHaveText(`Risk Dashboard`);

  items = await page.locator(
    app.riskDashboardPage.tier1Cards.findItems().toSelector()
  );
  await expect(items).toHaveCount(1);
});
