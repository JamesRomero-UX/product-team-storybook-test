import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildControlFormValues } from '../testData/controlFormValuesBuilder';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Control Register heading is "Control Register"`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.controlRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test('Can create a control', async ({ page, app }) => {
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
  await app.riskDetailsPage.controlsTab.table.expectRowToContain(1, {
    'Overall Effectiveness': 'Unrated',
    Owners: ['RiskManager1'],
    Title: 'Control 1',
    Type: 'Directive',
  });

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.controlRegisterPage.table.expectRowToContain(1, {
    ID: 'C-1',
    Title: 'Control 1',
    Type: 'Directive',
    Associations: 'R-1: Risk 1 (risk)',
    Owners: ['RiskManager1'],
    Contributors: '',
    'Design effectiveness': 'Unrated',
    'Performance effectiveness': 'Unrated',
    'Overall Effectiveness': 'Unrated',
    'Overall Effectiveness History': '',
    'Open issues': '0',
    Issues: '0',
    'Open actions': '0',
    Tags: '',
    Departments: '',
    'Created on': expect.any(String),
    'Control description': 'Control description 1',
    Guid: expect.any(String),
    'Test frequency': '-',
    'Updated on': expect.any(String),
    'Created by ID': 'auth0|644151efc3a961d2784456d9',
    'Created by': 'RiskManager1',
    'Latest rating date': '-',
    'Next test date': '-',
  });
});

test('Can create a control with an ad-hoc next test date', async ({
  page,
  app,
}) => {
  const newRiskName = 'Risk 1';
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  await app.controlScenarios.createControlFromRiskDetails({
    title: 'Control 1',
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'weeks',
    timeToCompleteValue: 2,
  });

  await app.riskDetailsPage.controlsTab.table.expectRowToContain(1, {
    'Overall Effectiveness': 'Unrated',
    Owners: ['RiskManager1'],
    Title: 'Control 1',
    Type: 'Directive',
  });

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.controlRegisterPage.table.expectRowToContain(1, {
    ID: 'C-1',
    'Latest rating date': '-',
    'Next test date': '1 Jan 2020',
    'Next test overdue': '15 Jan 2020',
  });
});

test('Control next test date updated when creating test', async ({
  page,
  app,
}) => {
  const newRiskName = 'Risk 1';
  await page.goto('/');
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
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  await app.riskDetailsPage.controlsTab.table.expectRowToContain(1, {
    'Overall Effectiveness': 'Unrated',
    Owners: ['RiskManager1'],
    Title: controlTitle,
    Type: 'Directive',
  });

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.controlRegisterPage.table.expectRowToContain(1, {
    ID: 'C-1',
    'Latest rating date': '-',
    'Next test date': '2 Feb 2021', // start date (as know tests yet)
    'Next test overdue': '12 Feb 2021', //Next test date + 10 days
  });

  await app.controlRegisterPage.table.clickCellText('Title', 1, controlTitle);

  await app.testResultScenarios.createTestResultFromControlDetails({
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2021-02-10',
    performedBy: 'RiskManager1',
    testResult: 'Fully effective',
  });

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.controlRegisterPage.table.expectRowToContain(1, {
    ID: 'C-1',
    'Latest rating date': '10 Feb 2021',
    'Next test date': '16 Feb 2021', // start date plus 2 weeks (as 1 week test performed)
    'Next test overdue': '26 Feb 2021', //Next test date + 10 days
  });
});

test('Updated control field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.addControlOption.click();

  const controlForm =
    app.riskDetailsPage.controlsTab.addControlModal.controlForm;

  const control = buildControlFormValues({});

  await controlForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: controlForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: controlForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: controlForm.fields.description,
      newLabel: 'New control description',
    },
    {
      field: controlForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: controlForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: controlForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: controlForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await controlForm.saveFormConfigurationButton.click();

  await controlForm.fillFormAndClickSave(control);
  await app.actionDetailsPage.notificationBanner.expectNotification(
    'Control added successfully'
  );

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.controlRegisterPage.table.expectRowToContain(1, {
    'New title': control.title,
    'New type': control.type,
    'New owners': control.owners,
    'New contributors': '',
    'New control description': control.description,
    'New tags': '',
    'New departments': '',
  });
});

test('Updated control field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.addControlOption.click();

  const controlForm =
    app.riskDetailsPage.controlsTab.addControlModal.controlForm;

  const control = buildControlFormValues({});

  await controlForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: controlForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: controlForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: controlForm.fields.description,
      newLabel: 'New control description',
    },
    {
      field: controlForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: controlForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: controlForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: controlForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await controlForm.saveFormConfigurationButton.click();

  await controlForm.fillFormAndClickSave(control);
  await app.actionDetailsPage.notificationBanner.expectNotification(
    'Control added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Controls data source',
    dataSource: {
      type: 'Controls',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.controlRegisterPage.table.expectRowToContain(1, {
    'New title': control.title,
    'New type': control.type,
    'New owners': control.owners,
    'New contributors': '',
    'New control description': control.description,
    'New tags': '',
    'New departments': '',
  });
});

test('Cannot set title or owner as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.addControlOption.click();

  const form = app.riskDetailsPage.controlsTab.addControlModal.controlForm;
  const requiredFields = [form.fields.title, form.fields.owners];

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

test('Can set description, type, contributor, tags and departments as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.addControlOption.click();

  const form = app.riskDetailsPage.controlsTab.addControlModal.controlForm;
  const unrequiredFields = [
    form.fields.description,
    form.fields.type,
    form.fields.contributors,
    form.fields.tags,
    form.fields.departments,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Title',
    owners: [users.riskManager.friendlyName],
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Control added successfully'
  );
});

test('Can add conditions on description, type, contributor, tags and departments ', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.addControlOption.click();

  const form = app.riskDetailsPage.controlsTab.addControlModal.controlForm;
  const conditionalFields = [
    form.fields.description,
    form.fields.type,
    form.fields.contributors,
    form.fields.tags,
    form.fields.departments,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Control title=test' },
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
    title: 'Title',
    owners: [users.riskManager.friendlyName],
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Control added successfully'
  );
});

test('Can link an existing control', async ({ app, page }) => {
  await page.goto('/');
  const firstRiskName = 'Risk 1';
  const secondRiskName = 'Risk 2';
  const controlTitle = 'Control 2';

  await app.riskScenarios.createRisk({
    riskName: firstRiskName,
    description: 'Risk 1 description',
  });

  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 2',
    owners: ['RiskManager1'],
    type: 'Directive',
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'weeks',
    timeToCompleteValue: 2,
  });

  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: secondRiskName,
    description: 'Risk 2 description',
  });

  await app.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
  await app.riskDetailsPage.controlsTab.actionsMenuButton.click();
  await app.riskDetailsPage.controlsTab.linkControlOption.click();

  await app.riskDetailsPage.controlsTab.linkControlModal.linkedItemForm.fillFormAndClickSave(
    {
      targetTitle: controlTitle,
    }
  );

  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Linked item added successfully'
  );

  await app.riskDetailsPage.controlsTab.table.expectRowCount(1);
});
