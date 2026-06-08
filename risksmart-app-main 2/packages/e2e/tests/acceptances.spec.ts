import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Acceptance Register heading is "Acceptance Register"`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      await app.acceptancesRegisterPage.navigateToAndAssertTitle();
      await expect(app.acceptancesRegisterPage.header.count).toHaveText(`(0)`);
    });
  });
});

test('Can add an acceptance to a risk', async ({ app, page }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });
  await app.acceptanceScenarios.createAcceptanceFromRiskDetails({
    title: 'Title 1',
    details: 'Details 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
  });

  await app.riskDetailsPage.riskAcceptancesTab.table.expectRowToContain(1, {
    'Acceptance title': 'Title 1',
    'Accepted from': '1 Jan 2021',
    'Accepted to': '2 Jan 2021',
    Associations: 'Risk 1 (Risk)',
    Details: 'Details 1',
    'Owners (risk)': ['RiskManager1'],
    Status: 'Draft',
    'Risk tier (risk)': 'Tier 1',
  });
});

test('Saved acceptance details shown in form', async ({ app, page }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });
  await app.acceptanceScenarios.createAcceptanceFromRiskDetails({
    title: 'Title 1',
    details: 'Details 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
    requestedBy: 'RiskManager1',
    approvedBy: 'Standard1',
    status: 'Closed',
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
  });
  await app.acceptancesRegisterPage.navigateToAndAssertTitle();
  await app.acceptancesRegisterPage.table.clickCellLink('Acceptance title', 1);
  await app.acceptanceDetailsPage.acceptanceForm.expectValues({
    title: 'Title 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
    status: 'Closed',
    details: 'Details 1',
    attachFiles: ['testFile.txt'],
    requestedBy: 'RiskManager1',
    approvedBy: 'Standard1',
  });
});

test('Can delete an acceptance from details page', async ({ app, page }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const acceptanceTitle = 'Title 1';
  await app.acceptanceScenarios.createAcceptanceFromRiskDetails({
    title: 'Title 1',
    details: 'Details 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
  });

  await app.riskDetailsPage.riskAcceptancesTab.table.clickCellText(
    'Acceptance title',
    1,
    acceptanceTitle
  );
  await app.acceptanceDetailsPage.deleteButton.click();
  await app.acceptanceDetailsPage.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Acceptance deleted successfully'
  );
  await app.riskDetailsPage.riskAcceptancesTab.table.expectRowCount(0);
});

test('Can delete an acceptance from risk acceptances tab', async ({
  app,
  page,
}) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  await app.acceptanceScenarios.createAcceptanceFromRiskDetails({
    title: 'Title 1',
    details: 'Details 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
  });
  await app.riskDetailsPage.riskAcceptancesTab.table.checkRow(1);
  await app.riskDetailsPage.riskAcceptancesTab.deleteButton.click();
  await app.riskDetailsPage.riskAcceptancesTab.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Acceptance deleted successfully'
  );
  await app.riskDetailsPage.riskAcceptancesTab.table.expectRowCount(0);
});

test('Can update an acceptance status to open without a parent that has a "Open Acceptance" workflow setup', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['approvers']);
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
    owners: ['CustomerSupport1'],
  });

  const acceptanceTitle = 'Title 1';
  await app.acceptanceScenarios.createAcceptanceFromRiskDetails({
    title: 'Title 1',
    details: 'Details 1',
    dateAcceptedFrom: '2021-01-01',
    dateAcceptedTo: '2021-01-02',
  });

  // Setting up approval after acceptance created so we don't need to approve on creation as new acceptance defaults to open.
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.approvalsTab.selectTab();
  await app.settingsPage.approvalsTab.addButton.click();
  await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
    {
      workflow: 'Open Acceptance',
      requireOwnerApprovalAtThisLevel: true,
    }
  );
  await app.settingsPage.notificationBanner.expectNotification(
    'Approval added successfully'
  );

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.clickCellText('Risk name', 1, newRiskName);
  await app.riskDetailsPage.detailsTab.selectTab();
  await app.riskDetailsPage.deleteButton.click();
  await app.riskDetailsPage.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk deleted successfully'
  );
  await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register');

  await app.acceptancesRegisterPage.navigateToAndAssertTitle();
  await app.acceptancesRegisterPage.table.expectRowCount(1);
  await app.acceptancesRegisterPage.table.clickCellText(
    'Acceptance title',
    1,
    acceptanceTitle
  );
  await app.acceptanceDetailsPage.acceptanceForm.fillFormAndClickSave({
    status: 'Closed',
  });

  await app.acceptanceDetailsPage.notificationBanner.expectNotification(
    'Acceptance updated successfully'
  );
  await app.acceptancesRegisterPage.table.expectRowCount(1);
  await app.acceptancesRegisterPage.table.clickCellText(
    'Acceptance title',
    1,
    acceptanceTitle
  );
  await app.acceptanceDetailsPage.acceptanceForm.fillFormAndClickSave({
    status: 'Open',
  });

  await app.acceptanceDetailsPage.notificationBanner.expectNotification(
    'Acceptance updated successfully'
  );
});

test.describe(`Can open help content"`, () => {
  test.use({ user: users.customerSupport });
  test(users.customerSupport.role, async ({ app, page }) => {
    await page.goto('/');
    await app.acceptancesRegisterPage.navigateToAndAssertTitle();
    await expect(
      app.acceptancesRegisterPage.helpPanel.component
    ).not.toBeVisible();
    await app.acceptancesRegisterPage.header.helpButton.click();
    await expect(app.acceptancesRegisterPage.helpPanel.component).toBeVisible();
  });
});

test('Cannot set title, date accepted from, date accepted to and status as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const acceptancesTab = app.riskDetailsPage.riskAcceptancesTab;
  await acceptancesTab.selectTabAndAssertTitle('Acceptances');
  await acceptancesTab.addButton.click();
  await expect(app.acceptanceDetailsPage.header.title).toHaveText(
    'Add Acceptance'
  );

  const form = app.acceptanceDetailsPage.acceptanceForm;
  const requiredFields = [
    form.fields.title,
    form.fields.dateAcceptedFrom,
    form.fields.dateAcceptedTo,
    form.fields.status,
  ];

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

test('Can set details and attached files as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const acceptancesTab = app.riskDetailsPage.riskAcceptancesTab;
  await acceptancesTab.selectTabAndAssertTitle('Acceptances');
  await acceptancesTab.addButton.click();
  await expect(app.acceptanceDetailsPage.header.title).toHaveText(
    'Add Acceptance'
  );

  const form = app.acceptanceDetailsPage.acceptanceForm;
  const unrequiredFields = [form.fields.details, form.fields.attachFiles];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Title',
    dateAcceptedFrom: '2020-01-01',
    dateAcceptedTo: '2020-01-01',
    status: 'Draft',
  });
  await app.acceptanceDetailsPage.notificationBanner.expectNotification(
    'Acceptance added successfully'
  );
});

test('Can add conditions on details and attached files', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const acceptancesTab = app.riskDetailsPage.riskAcceptancesTab;
  await acceptancesTab.selectTabAndAssertTitle('Acceptances');
  await acceptancesTab.addButton.click();
  await expect(app.acceptanceDetailsPage.header.title).toHaveText(
    'Add Acceptance'
  );

  const form = app.acceptanceDetailsPage.acceptanceForm;
  const conditionalFields = [form.fields.details, form.fields.attachFiles];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Title=test' },
    })),
  ]);

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({
    title: 'test',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    title: 'minimal test',
    dateAcceptedFrom: '2020-01-01',
    dateAcceptedTo: '2020-01-01',
    status: 'Draft',
  });
  await app.acceptanceDetailsPage.notificationBanner.expectNotification(
    'Acceptance added successfully'
  );
});

test('Updated acceptance field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const acceptancesTab = app.riskDetailsPage.riskAcceptancesTab;
  await acceptancesTab.selectTabAndAssertTitle('Acceptances');
  await acceptancesTab.addButton.click();
  await expect(app.acceptanceDetailsPage.header.title).toHaveText(
    'Add Acceptance'
  );

  const form = app.acceptanceDetailsPage.acceptanceForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.dateAcceptedFrom,
      newLabel: 'New date accepted from',
    },
    {
      field: form.fields.dateAcceptedTo,
      newLabel: 'New date accepted to',
    },
    {
      field: form.fields.requestedBy,
      newLabel: 'New requested by',
    },
    {
      field: form.fields.approvedBy,
      newLabel: 'New approved by',
    },
    {
      field: form.fields.status,
      newLabel: 'New status',
    },
    {
      field: form.fields.details,
      newLabel: 'New details',
    },
    {
      field: form.fields.attachFiles,
      newLabel: 'New attached files',
      notInRegister: true,
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave({
    title: 'minimal test',
    dateAcceptedFrom: '2020-01-01',
    dateAcceptedTo: '2020-01-01',
    status: 'Draft',
    details: 'Details',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Acceptance added successfully'
  );

  await app.acceptancesRegisterPage.navigateToAndAssertTitle();
  await app.acceptancesRegisterPage.table.expectRowCount(1);
  await app.acceptancesRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.acceptancesRegisterPage.table.expectRowToContain(1, {
    'New approved by': '–',
    'New date accepted from': '1 Jan 2020',
    'New date accepted to': '1 Jan 2020',
    'New details': 'Details',
    'New requested by': '–',
    'New status': 'Draft',
    'New title': 'minimal test',
  });
});

test('Updated acceptance field names shown in custom data source', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const acceptancesTab = app.riskDetailsPage.riskAcceptancesTab;
  await acceptancesTab.selectTabAndAssertTitle('Acceptances');
  await acceptancesTab.addButton.click();
  await expect(app.acceptanceDetailsPage.header.title).toHaveText(
    'Add Acceptance'
  );

  const form = app.acceptanceDetailsPage.acceptanceForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInCds?: boolean;
  }[] = [
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.dateAcceptedFrom,
      newLabel: 'New date accepted from',
    },
    {
      field: form.fields.dateAcceptedTo,
      newLabel: 'New date accepted to',
    },
    {
      field: form.fields.requestedBy,
      newLabel: 'New requested by',
      notInCds: true,
    },
    {
      field: form.fields.approvedBy,
      newLabel: 'New approved by',
      notInCds: true,
    },
    {
      field: form.fields.status,
      newLabel: 'New status',
    },
    {
      field: form.fields.details,
      newLabel: 'New details',
    },
    {
      field: form.fields.attachFiles,
      newLabel: 'New attached files',
      notInCds: true,
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave({
    title: 'minimal test',
    dateAcceptedFrom: '2020-01-01',
    dateAcceptedTo: '2020-01-01',
    status: 'Draft',
    details: 'Details',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Acceptance added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Acceptances data source',
    dataSource: {
      type: 'Acceptances',
      fields: fieldsToRename
        .filter((f) => !f.notInCds)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New date accepted from': '1 Jan 2020',
    'New date accepted to': '1 Jan 2020',
    'New details': 'Details',
    'New status': 'Draft',
    'New title': 'minimal test',
  });
});
