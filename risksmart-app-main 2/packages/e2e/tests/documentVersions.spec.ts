import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

test('Can create a new document version', async ({ page, app }) => {
  const newDocumentTitle = 'Document 2';
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');
  await app.policyScenarios.createDocument({
    title: newDocumentTitle,
    purpose: 'Document 1 description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();

  await app.documentVersionPage.detailsTab.form.fillFormAndClickSave({
    versionNumber: '1.0',
    summary: 'Summary 1',
    type: 'Link',
    link: 'http://www.google.com',
  });

  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );
  await app.documentDetailsPage.versionTab.table.expectRowCount(1);
  const row = await app.documentDetailsPage.versionTab.table.getRowAsObject(1);
  expect(row).toEqual(
    expect.objectContaining({
      'Last reviewed date': '-',
      'Next review due': '-',
      'Reviewed by': '-',
      Status: 'Draft',
      Type: 'Link',
      Version: '1.0',
    })
  );
});

test('Cannot set version or status as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.createDocument({
    title: 'Doc 1',
    purpose: 'Document 1 description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();

  const form = app.documentVersionPage.detailsTab.form;
  const requiredFields = [form.fields.versionNumber, form.fields.status];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of requiredFields) {
    await field.editFieldButton.click();
    await expect(app.editFieldModal.header).toHaveText('Edit');
    await app.editFieldModal.editFieldForm.fields.conditions.expectIsVisible(
      false
    );
    await app.editFieldModal.editFieldForm.fields.required.expectToBeDisabled(
      true
    );
    await app.editFieldModal.editFieldForm.cancelButton.click();
  }
});

test('Can set summary, type, reason for review, review date, next review date, and reviewed by as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.createDocument({
    title: 'Doc 1',
    purpose: 'Document 1 description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();

  const form = app.documentVersionPage.detailsTab.form;

  const unrequiredFields = [
    form.fields.summary,
    form.fields.type, // currently we have one custom that has hidden this field
    form.fields.reasonForReview,
    form.fields.reviewDate,
    form.fields.nextReviewDate,
    form.fields.reviewedBy,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({
    versionNumber: '1.0',
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
  });
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );
  await app.documentDetailsPage.versionTab.table.expectRowCount(1);
});

test('Can add conditions on summary', async ({ app, page }) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.createDocument({
    title: 'Doc 1',
    purpose: 'Document 1 description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();

  const form = app.documentVersionPage.detailsTab.form;
  const conditionalFields = [form.fields.summary];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: 'Version number=1',
    });
  }
  await form.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({
    versionNumber: '1',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    versionNumber: '2',
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
  });
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );
});

test('Can submit a document version with an attachment for approval', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['policy', 'approvers']);
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.approvalsTab.selectTab();
  await app.settingsPage.approvalsTab.addButton.click();
  await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
    {
      workflow: 'Publish Version',
      approvers: ['RiskManager1'],
    }
  );
  await app.settingsPage.notificationBanner.expectNotification(
    'Approval added successfully'
  );

  const documentTitle = 'Document for Approval';
  await app.policyScenarios.createDocument({
    title: documentTitle,
    purpose: 'Document for approval description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();

  const form = app.documentVersionPage.detailsTab.form;
  const testFileName = 'testFile.txt';
  const testFilePath = __dirname + '/testFiles/' + testFileName;

  await form.fillForm({
    versionNumber: '1.0',
    attachFiles: [testFilePath],
  });

  await form.saveButton.click();
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );

  await app.documentDetailsPage.versionTab.table.expectRowCount(1);
  await app.documentDetailsPage.versionTab.table.clickCellLink('Version', 1);

  const testFile2Name = 'testFile2.txt';
  const testFile2Path = __dirname + '/testFiles/' + testFile2Name;

  await form.fillForm({
    versionNumber: '1.0',
    attachFiles: [testFile2Path],
  });

  await form.submitForApprovalButton.click();
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version updated successfully'
  );

  await app.requestsPage.navigateToAndAssertTitle();

  await app.requestsPage.table.toggleAllColumnsToBeVisible();
  await app.requestsPage.table.clearFiltersButton.click();
  await app.requestsPage.table.expectRowCount(1);
  await app.requestsPage.table.clickCellLink('Parent Name', 1);

  await expect(
    page.getByText('You are viewing unapproved changes')
  ).toBeVisible();

  await expect(
    app.documentVersionPage.detailsTab.form.fields.attachFiles.getValue()
  ).resolves.toEqual([testFile2Name]);
});
