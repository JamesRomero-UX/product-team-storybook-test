import { expect } from '@playwright/test';

import { test } from '../base';
import { users } from '../users';

test.use({ user: users.customerSupport });

test(`Can download users form template`, async ({ page, app }) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  const templateContent = await app.dataImportDetailsPage
    .getDownloadLink('users')
    .downloadAndReturnContent();
  expect(templateContent).toEqual('id,userName,firstName,lastName,email');
});

test(`Can download contributors form template`, async ({ page, app }) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  const templateContent = await app.dataImportDetailsPage
    .getDownloadLink('contributors')
    .downloadAndReturnContent();
  expect(templateContent).toEqual('parentId,parentType,ownerId');
});

test(`Can download a non-customized risk form template`, async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  const templateContent = await app.dataImportDetailsPage
    .getDownloadLink('risks')
    .downloadAndReturnContent();
  expect(templateContent).toEqual(
    'id,title,description,tier,parentRiskId,status,treatment'
  );
});

test(`Can download a customized risk form template`, async ({ page, app }) => {
  await page.goto('/');
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  await app.addRiskPage.detailsTab.riskForm.formSettingsButton.openAndClickItem(
    'Add custom field'
  );
  await app.editFieldModal.editFieldForm.fillFormAndClickSave({
    label: 'New Field',
    fieldType: 'Text',
  });

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  const templateContent = await app.dataImportDetailsPage
    .getDownloadLink('risks')
    .downloadAndReturnContent();
  expect(templateContent).toEqual(
    'id,title,description,tier,parentRiskId,status,treatment,"New Field"'
  );
});

test(`Can start uploading risks`, async ({ page, app }) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  await app.dataImportDetailsPage.dataImportForm.fillFormAndClickSave({
    selectFilesButton: [__dirname + '/testFiles/riskUploadTest/risks.csv'],
  });

  await app.dataImportDetailsPage.notificationBanner.expectNotification(
    'Data import added successfully'
  );
  await app.dataImportDetailsPage.dataImportResultsTab.table.expectRowCount(0);

  await app.dataImportDetailsPage.dataImportResultsTab.startImportButton.click();

  await expect(
    app.dataImportDetailsPage.dataImportResultsTab.statusBadge
  ).toHaveText('Importing');
});

test(`Can view validation errors`, async ({ page, app }) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  await app.dataImportDetailsPage.dataImportForm.fillFormAndClickSave({
    selectFilesButton: [
      __dirname + '/testFiles/invalidUserUploadTest/users.csv',
    ],
  });

  await app.dataImportDetailsPage.notificationBanner.expectNotification(
    'Data import added successfully'
  );

  await app.dataImportDetailsPage.dataImportResultsTab.table.expectRowCount(1);

  const row =
    await app.dataImportDetailsPage.dataImportResultsTab.table.getRowAsObject(
      1
    );
  expect(row).toEqual({
    'Import object': 'users.csv',
    Message: 'Invalid Record Length: columns length is 5, got 7 on line 2',
    'Row number': '2',
  });
});

test(`Can delete a data import`, async ({ page, app }) => {
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.dataImportTab.selectTabAndAssertTitle('Data Import');
  await expect(app.settingsPage.dataImportTab.title).toHaveText('Data Import');
  await app.settingsPage.dataImportTab.createButton.click();

  await app.dataImportDetailsPage.dataImportForm.fillFormAndClickSave({
    selectFilesButton: [__dirname + '/testFiles/riskUploadTest/risks.csv'],
  });
  await app.dataImportDetailsPage.notificationBanner.expectNotification(
    'Data import added successfully'
  );
  await app.dataImportDetailsPage.deleteButton.click();
  await app.dataImportDetailsPage.deleteModal.confirmButton.click();

  await app.dataImportDetailsPage.dataImportResultsTab.table.expectRowCount(0);
});
