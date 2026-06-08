import { test } from '../base';

test(`Can create a new tag and see it in tag selectors`, async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.tagsTab.selectTabAndAssertTitle('Tags');
  await app.settingsPage.tagsTab.table.expectRowCount(0);
  await app.settingsPage.tagsTab.addButton.click();
  await app.settingsPage.tagsTab.addTagModal.tagForm.fillFormAndClickSave({
    name: 'Test Tag',
    description: 'This is a test tag',
  });

  await app.settingsPage.notificationBanner.expectNotification(
    'Tag added successfully'
  );

  await app.settingsPage.tagsTab.table.expectRowCount(1);
  await app.settingsPage.tagsTab.table.expectRowToContain(1, {
    Name: 'Test Tag',
    Description: 'This is a test tag',
  });

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await app.addRiskPage.detailsTab.riskForm.fillForm({
    tags: ['Test Tag'],
  });
});

test(`Can update a tag`, async ({ page, app }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.tagsTab.selectTabAndAssertTitle('Tags');
  await app.settingsPage.tagsTab.table.expectRowCount(0);
  await app.settingsPage.tagsTab.addButton.click();
  await app.settingsPage.tagsTab.addTagModal.tagForm.fillFormAndClickSave({
    name: 'Test Tag',
    description: 'This is a test tag',
  });

  await app.settingsPage.notificationBanner.expectNotification(
    'Tag added successfully'
  );

  await app.settingsPage.tagsTab.table.expectRowCount(1);

  await app.settingsPage.tagsTab.table.clickCellLink('Name', 1);
  await app.settingsPage.tagsTab.addTagModal.tagForm.fillFormAndClickSave({
    name: 'Updated Tag',
    description: 'This is an updated test tag',
  });

  await app.settingsPage.notificationBanner.expectNotification(
    'Tag updated successfully'
  );

  await app.settingsPage.tagsTab.table.expectRowToContain(1, {
    Name: 'Updated Tag',
    Description: 'This is an updated test tag',
  });
});

test(`Can delete a tag`, async ({ page, app }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.tagsTab.selectTabAndAssertTitle('Tags');
  await app.settingsPage.tagsTab.table.expectRowCount(0);
  await app.settingsPage.tagsTab.addButton.click();
  await app.settingsPage.tagsTab.addTagModal.tagForm.fillFormAndClickSave({
    name: 'Test Tag',
    description: 'This is a test tag',
  });

  await app.settingsPage.notificationBanner.expectNotification(
    'Tag added successfully'
  );

  await app.settingsPage.tagsTab.table.expectRowCount(1);
  await app.settingsPage.tagsTab.table.checkRow(1);
  await app.settingsPage.tagsTab.deleteButton.click();
  await app.settingsPage.tagsTab.deleteModal.confirmButton.click();
  await app.settingsPage.notificationBanner.expectNotification(
    'Tag deleted successfully'
  );
  await app.settingsPage.tagsTab.table.expectRowCount(0);
});
