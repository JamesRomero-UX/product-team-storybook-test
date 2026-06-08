import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { users } from '../users';

test.use({ user: users.customerSupport });

test(`New entity is shown in the register`, async ({ page, app }) => {
  await updateOrganisationFeatures(['enterprise_risk']);
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.entitiesTab.selectTab();
  await expect(app.settingsPage.entitiesTab.title).toHaveText('Entities');

  await app.settingsPage.entitiesTab.createButton.click();
  await app.settingsPage.entitiesTab.detailModal.entityForm.fillFormAndClickSave(
    {
      name: 'New Zealand',
      description: 'Where the kiwis live',
      weight: '1.5',
      owners: ['RiskManager1'],
    }
  );
  await app.settingsPage.notificationBanner.expectNotification(
    'Object updated successfully'
  );

  await app.settingsPage.entitiesTab.table.setFilterInput('Name=New Zealand');
  await app.settingsPage.entitiesTab.table.expectRowCount(1);
  const row = await app.settingsPage.entitiesTab.table.getRowAsObject(1);

  expect(row).toEqual(expect.objectContaining({ Name: 'New Zealand' }));
});
