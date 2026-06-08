import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { users } from '../users';

[users.customerSupport].forEach((user) => {
  test.describe(`Module settings`, () => {
    test.use({ user });

    test(`Can turn on and off risk module`, async ({ app, page }) => {
      await updateOrganisationFeatures(['modules']);

      await page.goto('/');
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.modulesTab.selectTab();
      await expect(app.settingsPage.modulesTab.title).toHaveText('Modules');
    });
  });
});
