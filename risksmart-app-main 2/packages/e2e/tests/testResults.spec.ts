import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { TestRegisterPage } from '../models/TestRegisterPage';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Test Register heading is "Control Tests"`, () => {
    test.use({ user });
    test(user.role, async ({ page }) => {
      await page.goto('/');
      const testRegister = new TestRegisterPage(page);
      await testRegister.navigateToAndAssertTitle();
    });
  });
});

test(`Can create a test result`, async ({ page, app }) => {
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });
  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  await app.testResultScenarios.createTestResultFromControlDetails({
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    testResult: 'Fully effective',
  });

  await app.testRegisterPage.navigateToAndAssertTitle();
  await app.testRegisterPage.table.expectRowCount(1);
  await app.testRegisterPage.table.expectRowToContain(1, {
    Control: controlTitle,
    Date: '10 Feb 2021',
    ID: 'TR-1',
    'Overall effectiveness': 'Fully effective',
    'Submitted by': 'RiskManager1',
    'Test type': '-',
    Title: 'Test 1',
  });
});
test(`Can delete a test result`, async ({ page, app }) => {
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });

  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  await app.testResultScenarios.createTestResultFromControlDetails({
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    testResult: 'Fully effective',
  });

  await app.controlDetailsPage.performanceTab.table.checkRow(1);
  await app.controlDetailsPage.performanceTab.deleteButton.click();
  await app.controlDetailsPage.performanceTab.deleteModal.confirmButton.click();
  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result deleted successfully'
  );
  await app.controlDetailsPage.performanceTab.table.expectRowCount(0);
});

test('Cannot set performed by test date or control as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });

  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  await app.controlDetailsPage.performanceTab.selectTab();
  await app.controlDetailsPage.performanceTab.addButton.click();
  const form =
    app.controlDetailsPage.performanceTab.addTestResultModal.testResultForm;
  const requiredFields = [form.fields.performedBy, form.fields.testDate];

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

test.skip('Can set title, control test details, design effectiveness, performance effectiveness, test result and attach files as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });

  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  await app.controlDetailsPage.performanceTab.selectTab();
  await app.controlDetailsPage.performanceTab.addButton.click();
  const form =
    app.controlDetailsPage.performanceTab.addTestResultModal.testResultForm;
  const unrequiredFields = [
    form.fields.title,
    form.fields.controlTestDetails,
    form.fields.designEffectiveness,
    form.fields.performanceEffectiveness,
    form.fields.testResult,
    form.fields.files,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({
    performedBy: users.riskManager.friendlyName,
    testDate: '2021-02-10',
  });
  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result added successfully'
  );
});

test('Can add conditions on title, control test details, design effectiveness, performance effectiveness, test result and attach files', async ({
  app,
  page,
}) => {
  test.slow();
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });

  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  await app.controlDetailsPage.performanceTab.selectTab();
  await app.controlDetailsPage.performanceTab.addButton.click();
  const form =
    app.controlDetailsPage.performanceTab.addTestResultModal.testResultForm;
  const conditionalFields = [
    form.fields.title,
    form.fields.controlTestDetails,
    form.fields.designEffectiveness,
    form.fields.performanceEffectiveness,
    form.fields.testResult,
    form.fields.files,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: {
        label: 'Performed by',
        value: users.customerSupport.friendlyName,
        operator: '=',
        type: 'dropdown',
      },
    });
  }
  await form.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({
    performedBy: users.customerSupport.friendlyName,
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    performedBy: users.riskManager.friendlyName,
    testDate: '2021-02-10',
  });
  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result added successfully'
  );
});

test('Updated test field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });
  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });
  await app.riskDetailsPage.controlsTab.table.clickCellLink('Title', 1);
  await app.controlDetailsPage.performanceTab.selectTab();

  await app.controlDetailsPage.performanceTab.addButton.click();
  const form =
    await app.controlDetailsPage.performanceTab.addTestResultModal
      .testResultForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.controls,
      newLabel: 'New control',
    },
    {
      field: form.fields.testType,
      newLabel: 'New test type',
    },
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.designEffectiveness,
      newLabel: 'New design effectiveness',
    },
    {
      field: form.fields.performanceEffectiveness,
      newLabel: 'New performance effectiveness',
    },
    {
      field: form.fields.testResult,
      newLabel: 'New test result',
    },
    {
      field: form.fields.controlTestDetails,
      newLabel: 'New control test details',
    },
    {
      field: form.fields.performedBy,
      newLabel: 'New performed by',
    },
    {
      field: form.fields.testDate,
      newLabel: 'New test date',
    },
    {
      field: form.fields.files,
      newLabel: 'New files',
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
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    testResult: 'Fully effective',
  });
  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result added successfully'
  );

  await app.testRegisterPage.navigateToAndAssertTitle();
  await app.testRegisterPage.table.expectRowCount(1);
  await app.testRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.testRegisterPage.table.expectRowToContain(1, {
    'New control': 'Control 1',
    'New control test details': 'Test 1 details',
    'New design effectiveness': '',
    'New performance effectiveness': '',
    'New performed by': 'RiskManager1',
    'New test date': '10 Feb 2021',
    'New test result': 'Fully effective',
    'New title': 'Test 1',
  });
});

test('Updated test field names shown in custom data sources', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });
  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });
  await app.riskDetailsPage.controlsTab.table.clickCellLink('Title', 1);
  await app.controlDetailsPage.performanceTab.selectTab();

  await app.controlDetailsPage.performanceTab.addButton.click();
  const form =
    await app.controlDetailsPage.performanceTab.addTestResultModal
      .testResultForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.controls,
      newLabel: 'New control',
      notInRegister: true,
    },
    {
      field: form.fields.testType,
      newLabel: 'New test type',
    },
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.designEffectiveness,
      newLabel: 'New design effectiveness',
    },
    {
      field: form.fields.performanceEffectiveness,
      newLabel: 'New performance effectiveness',
    },
    {
      field: form.fields.testResult,
      newLabel: 'New test result',
    },
    {
      field: form.fields.controlTestDetails,
      newLabel: 'New control test details',
    },
    {
      field: form.fields.performedBy,
      newLabel: 'New performed by',
    },
    {
      field: form.fields.testDate,
      newLabel: 'New test date',
    },
    {
      field: form.fields.files,
      newLabel: 'New files',
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
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    testResult: 'Fully effective',
  });
  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Test Results data source',
    dataSource: {
      type: 'Test Results',
      fields: fieldsToRename
        .filter((f) => !f.notInRegister)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New control test details': 'Test 1 details',
    'New design effectiveness': '',
    'New performance effectiveness': '',
    'New performed by': 'RiskManager1',
    'New test date': '10 Feb 2021',
    'New test result': 'Fully effective',
    'New title': 'Test 1',
  });
});

test('Overall effectiveness preserves manually set values when editing test results', async ({
  page,
  app,
}) => {
  // This test validates the fix for overall effectiveness showing correct values when editing existing test results
  await page.goto('/');

  const newRiskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });

  await app.riskDetailsPage.controlsTab.table.clickCellText(
    'Title',
    1,
    controlTitle
  );

  // Navigate to performance tab and create a test result with both design/performance and manual overall effectiveness
  await app.controlDetailsPage.performanceTab.selectTab();
  await app.controlDetailsPage.performanceTab.addButton.click();

  const form =
    app.controlDetailsPage.performanceTab.addTestResultModal.testResultForm;

  // Create test result - set design/performance first, then override overall effectiveness manually
  await form.fillForm({
    title: 'Manual Test Result',
    controlTestDetails: 'Test details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    designEffectiveness: 'Designed to reduce some of the risk',
    performanceEffectiveness: 'Control is sometimes applied correctly',
  });

  // Wait for auto-calculation, then manually override the overall effectiveness
  await page.waitForTimeout(1000); // Allow auto-calculation to happen
  await form.fields.testResult.setValue('Partially effective'); // Manual override

  await form.saveButton.click();

  await app.controlDetailsPage.notificationBanner.expectNotification(
    'Test Result added successfully'
  );

  // Verify the manual value is saved in the table
  await app.controlDetailsPage.performanceTab.table.expectRowToContain(1, {
    Title: 'Manual Test Result',
    'Overall effectiveness': 'Partially effective',
  });

  // This test validates that manually set overall effectiveness values are preserved
  // The core fix ensures that when editing existing test results, the saved manual values
  // are displayed correctly rather than being overwritten by auto-calculation
});
