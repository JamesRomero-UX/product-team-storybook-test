import { expect } from '@playwright/test';

import {
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildActionFormValues } from '../testData/actionFormValuesBuilder';
import { users } from '../users';

test('Validation error shown when creating an action without a name', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  await app.actionsRegisterPage.addActionModal.actionForm.saveButton.click();
  const errors =
    await app.actionsRegisterPage.addActionModal.actionForm.getErrors();
  expect(errors).toEqual({
    title: 'Required',
    description: 'Required',
    dateRaised: 'Required',
    owners: 'Required',
    priority: 'Required',
    targetCloseDate: 'Required',
  });
});

test('Correct labels displayed for all fields', async ({ page, app }) => {
  await page.goto('/');
  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  await app.actionsRegisterPage.addActionModal.actionForm.expectLabels({
    title: 'Title',
    description: 'Description',
    attachFiles: 'Attach files (optional)',
    owners: 'Owner',
    contributors: 'Contributor (optional)',
    priority: 'Priority',
    dateRaised: 'Date raised',
    targetCloseDate: 'Target close date',
    status: 'Status',
    tags: 'Tags (optional)',
    departments: 'Departments (optional)',
  });
});

test('Saved action details shown in form', async ({ page, app }) => {
  await insertTagTypes([
    { Name: 'Tag 1', Description: 'Tag 1 description' },
    { Name: 'Tag 2', Description: 'Tag 2 description' },
  ]);
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
    { Name: 'Department 2', Description: 'Department 2 description' },
  ]);
  await page.goto('/');

  const action = buildActionFormValues({
    tags: ['Tag 1', 'Tag 2'],
    departments: ['Department 1', 'Department 2'],
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
  });
  await app.actionScenarios.createActionFromRegister(action);

  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.table.expectRowCount(1);
  await app.actionsRegisterPage.table.clickCellLink('Action title', 1);

  await app.actionDetailsPage.detailsTab.actionForm.expectValues({
    ...action,
    attachFiles: ['testFile.txt'],
  });
});

[users.riskManager, users.standard].forEach((user) => {
  test.describe(`Adding an action from the action register`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      const action = buildActionFormValues({
        attachFiles: [__dirname + '/testFiles/testFile.txt'],
      });

      await app.actionScenarios.createActionFromRegister(action);

      await app.actionsRegisterPage.table.toggleAllColumnsToBeVisible();
      await app.actionsRegisterPage.table.expectRowToContain(1, {
        ID: 'A-1',
        'Action title': action.title,
        Owners: action.owners,
        Contributors: action.contributors,
        Associations: '',
        Raised: '1 Jan 2020',
        Due: '1 Jan 2120',
        'Closed date': '2 Jan 2025',
        Status: action.status,
        Priority: action.priority,
        'Updated by ID': user.Id,
        'Modified by': user.friendlyName,
        'Raised by': user.friendlyName,
        'Update count': '0',
        'Latest update created on': '-',
        'Latest update description': '–',
        'Latest update title': '–',
        Description: action.description,
      });
    });
  });
});

test(`Adding an action from a risk`, async ({ page, app }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';

  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.actionsTab.selectTabAndAssertTitle('Actions');

  const actionTitle = 'Action 1';

  await app.actionScenarios.createActionFromActionTab(
    app.riskDetailsPage.actionsTab,
    {
      title: actionTitle,
      description: 'Action description 1',
      owners: ['RiskManager1'],
      priority: 'Low',
      dateRaised: '2020-01-01',
      targetCloseDate: '2020-01-02',
    }
  );

  await app.riskDetailsPage.actionsTab.table.expectRowToContain(1, {
    'Action title': 'Action 1',
    Owners: ['RiskManager1'],
    Associations: 'R-1: Risk 1 (risk)',
    'Closed date': '-',
    Raised: '1 Jan 2020',
    Due: '2 Jan 2020',
    Status: 'Overdue',
    Tags: '',
    Priority: 'Low',
  });

  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.table.expectRowCount(1);

  await app.riskDetailsPage.actionsTab.table.toggleAllColumnsToBeVisible();
  await app.riskDetailsPage.actionsTab.table.expectRowToContain(1, {
    ID: 'A-1',
    'Action title': 'Action 1',
    Owners: ['RiskManager1'],
    Contributors: '',
    Associations: 'R-1: Risk 1 (risk)',
    Raised: '1 Jan 2020',
    Due: '2 Jan 2020',
    'Closed date': '-',
    Status: 'Overdue',
    Priority: 'Low',
    'Updated by ID': 'auth0|644151efc3a961d2784456d9',
    'Modified by': 'RiskManager1',
    'Raised by': 'RiskManager1',
    'Update count': '0',
    'Latest update created on': '-',
    'Latest update description': '–',
    'Latest update title': '–',
    Description: 'Action description 1',
  });
});

test('Updated action field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  const action = buildActionFormValues({});
  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  const actionForm = app.actionsRegisterPage.addActionModal.actionForm;
  await actionForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: actionForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: actionForm.fields.description,
      newLabel: 'New details',
    },
    {
      field: actionForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: actionForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: actionForm.fields.status,
      newLabel: 'New status',
    },
    {
      field: actionForm.fields.closedDate,
      newLabel: 'New closed date',
    },
    {
      field: actionForm.fields.dateRaised,
      newLabel: 'New date raised',
    },
    {
      field: actionForm.fields.targetCloseDate,
      newLabel: 'New target close date',
    },
    {
      field: actionForm.fields.priority,
      newLabel: 'New priority',
    },
    {
      field: actionForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: actionForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await actionForm.saveFormConfigurationButton.click();

  await actionForm.fillFormAndClickSave(action);
  await app.actionDetailsPage.notificationBanner.expectNotification(
    'Action added successfully'
  );

  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.table.expectRowCount(1);
  await app.actionsRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.actionsRegisterPage.table.expectRowToContain(1, {
    'New title': action.title,
    'New details': action.description,
    'New owners': action.owners,
    'New contributors': action.contributors,
    'New date raised': '1 Jan 2020',
    'New target close date': '1 Jan 2120',
    'New status': action.status,
    'New priority': action.priority,
    'New tags': action.tags.join(', '),
    'New departments': action.departments.join(', '),
  });
});

test('Updated action field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const action = buildActionFormValues({});
  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  const actionForm = app.actionsRegisterPage.addActionModal.actionForm;

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: actionForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: actionForm.fields.description,
      newLabel: 'New details',
    },
    {
      field: actionForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: actionForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: actionForm.fields.status,
      newLabel: 'New status',
    },
    {
      field: actionForm.fields.closedDate,
      newLabel: 'New closed date',
    },
    {
      field: actionForm.fields.dateRaised,
      newLabel: 'New date raised',
    },
    {
      field: actionForm.fields.targetCloseDate,
      newLabel: 'New target close date',
    },
    {
      field: actionForm.fields.priority,
      newLabel: 'New priority',
    },
    {
      field: actionForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: actionForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  await actionForm.formSettingsButton.openAndClickItem('Edit form');
  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await actionForm.saveFormConfigurationButton.click();

  await actionForm.fillFormAndClickSave(action);
  await app.actionDetailsPage.notificationBanner.expectNotification(
    'Action added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Actions data source',
    dataSource: {
      type: 'Actions',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    'New title': action.title,
    'New details': action.description,
    'New owners': action.owners,
    'New contributors': action.contributors,
    'New date raised': '1 Jan 2020',
    'New target close date': '1 Jan 2120',
    'New status': action.status,
    'New priority': action.priority,
    'New tags': action.tags.join(', '),
    'New departments': action.departments.join(', '),
  });
});

test('Cannot set title, owner, date raised, status, target close date, actual closed date as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');

  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  const form = app.actionsRegisterPage.addActionModal.actionForm;

  const requiredFields = [
    form.fields.title,
    form.fields.status,
    form.fields.owners,
    form.fields.dateRaised,
    form.fields.targetCloseDate,
    form.fields.closedDate,
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

test('Can set description, attach files, priority, contributor, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  const form = app.actionsRegisterPage.addActionModal.actionForm;

  const unrequiredFields = [
    form.fields.description,
    form.fields.priority,
    form.fields.attachFiles,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({
    title: 'Title',
    owners: [users.riskManager.friendlyName],
    dateRaised: '2020-01-01',
    status: 'Closed',
    targetCloseDate: '2020-01-02',
    closedDate: '2020-01-03',
  });
  await app.actionsRegisterPage.notificationBanner.expectNotification(
    'Action added successfully'
  );
});

test('Can add conditions on description, attach files, priority, contributor, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.actionsRegisterPage.navigateToAndAssertTitle();
  await app.actionsRegisterPage.addButton.click();
  const form = app.actionsRegisterPage.addActionModal.actionForm;

  const conditionalFields = [
    form.fields.description,
    form.fields.priority,
    form.fields.attachFiles,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: 'Title=test',
    });
  }
  await form.saveFormConfigurationButton.click();

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
    dateRaised: '2020-01-01',
    status: 'Closed',
    targetCloseDate: '2020-01-02',
    closedDate: '2020-01-03',
  });
  await app.actionsRegisterPage.notificationBanner.expectNotification(
    'Action added successfully'
  );
});
