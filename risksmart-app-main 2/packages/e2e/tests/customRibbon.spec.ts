import { test } from '../base';

test('Can update a custom ribbon on the risk register', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.ribbon.clickEditFilters();
  await app.riskRegisterPage.ribbon.ribbonModal.ribbonForm.saveButton.click();
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Ribbon updated successfully'
  );
});
