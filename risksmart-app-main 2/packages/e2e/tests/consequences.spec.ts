import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { ConsequenceFields } from '../models/forms/ConsequenceForm';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildIssueFormValues } from '../testData/issueFormValuesBuilder';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Consequences Register heading is "Consequences Register"`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      await app.consequencesRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test('Can create an issue consequence and see it in the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();
  const consequence: ConsequenceFields = {
    title: 'Consequence 1',
    description: 'Consequence 1 description',
    type: 'Customer',
    criticality: 'High',
    costType: 'Hours',
    costValue: '210',
  };
  await app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm.fillFormAndClickSave(
    consequence
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );
  await app.issueDetailsPage.consequencesTab.table.expectRowCount(1);
  await app.issueDetailsPage.consequencesTab.table.expectRowToContain(1, {
    Title: consequence.title,
    Description: consequence.description,
    'Cost type': consequence.costType,
    'Cost value': consequence.costValue,
    Criticality: consequence.criticality,
  });
});

test('Can update an issue consequence and see it in the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();
  const consequence: ConsequenceFields = {
    title: 'Consequence 1',
    description: 'Consequence 1 description',
    type: 'Customer',
    criticality: 'High',
    costType: 'Hours',
    costValue: '210',
  };
  await app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm.fillFormAndClickSave(
    consequence
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );
  await app.issueDetailsPage.consequencesTab.table.expectRowCount(1);
  await app.issueDetailsPage.consequencesTab.table.clickCellLink('Title', 1);

  const consequenceUpdated: ConsequenceFields = {
    title: 'Updated Consequence 1',
    description: 'Updated Consequence 1 description',
    type: 'Operational',
    criticality: 'Low',
    costType: 'Number',
    costValue: '110',
  };
  await app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm.fillFormAndClickSave(
    consequenceUpdated
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence updated successfully'
  );
  await app.issueDetailsPage.consequencesTab.table.expectRowToContain(1, {
    Title: consequenceUpdated.title,
    Description: consequenceUpdated.description,
    'Cost type': consequenceUpdated.costType,
    'Cost value': consequenceUpdated.costValue,
    Criticality: consequenceUpdated.criticality,
  });
});

test('Can delete an issue consequence and see it in removed from the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();
  const consequence: ConsequenceFields = {
    title: 'Consequence 1',
    description: 'Consequence 1 description',
    type: 'Customer',
    criticality: 'High',
    costType: 'Hours',
    costValue: '210',
  };
  await app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm.fillFormAndClickSave(
    consequence
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );
  await app.issueDetailsPage.consequencesTab.table.expectRowCount(1);
  await app.issueDetailsPage.consequencesTab.table.checkRow(1);
  await app.issueDetailsPage.consequencesTab.deleteButton.click();
  await app.issueDetailsPage.consequencesTab.deleteModal.confirmButton.click();
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence deleted successfully'
  );
  await app.issueDetailsPage.consequencesTab.table.expectRowCount(0);
});

test('Cannot set title, cost type, cost value as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();

  const consequenceForm =
    app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm;

  const requiredFields = [
    consequenceForm.fields.title,
    consequenceForm.fields.costType,
    consequenceForm.fields.costValue,
  ];

  await consequenceForm.formSettingsButton.openAndClickItem('Edit form');

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

test('Can set type, criticality and description as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();

  const consequenceForm =
    app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm;

  const unrequiredFields = [
    consequenceForm.fields.type,
    consequenceForm.fields.criticality,
    consequenceForm.fields.description,
  ];

  await app.customAttributeScenarios.bulkEditFields(consequenceForm, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);
  await consequenceForm.fillFormAndClickSave({
    title: 'Title',
    costType: 'Hours',
    costValue: '1',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );
  await app.issueRegisterPage.table.expectRowCount(1);
});

test('Can add conditions on type, criticality and description', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();

  const consequenceForm =
    app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm;

  const conditionalFields = [
    consequenceForm.fields.type,
    consequenceForm.fields.criticality,
    consequenceForm.fields.description,
  ];

  await app.customAttributeScenarios.bulkEditFields(consequenceForm, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Title=test' },
    })),
  ]);

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await consequenceForm.fillForm({
    title: 'test',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await consequenceForm.fillFormAndClickSave({
    title: 'Title',
    costType: 'Hours',
    costValue: '1',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );
});

test('Updated consequence field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');

  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();
  const consequenceForm =
    app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm;

  await consequenceForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: consequenceForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: consequenceForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: consequenceForm.fields.criticality,
      newLabel: 'New criticality',
    },
    {
      field: consequenceForm.fields.costValue,
      newLabel: 'New cost value',
    },
    {
      field: consequenceForm.fields.costType,
      newLabel: 'New cost type',
    },
    {
      field: consequenceForm.fields.description,
      newLabel: 'New description',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await consequenceForm.saveFormConfigurationButton.click();

  await consequenceForm.fillFormAndClickSave({
    title: 'Consequence 1',
    type: 'Customer',
    criticality: 'Low',
    costType: 'Hours',
    costValue: '100',
    description: 'Description',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );

  await app.consequencesRegisterPage.navigateToAndAssertTitle();
  await app.consequencesRegisterPage.table.expectRowCount(1);
  await app.consequencesRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.consequencesRegisterPage.table.expectRowToContain(1, {
    'New title': 'Consequence 1',
    'New type': 'Customer',
    'New criticality': 'Low',
    'New cost type': 'Hours',
    'New cost value': '100.00',
    'New description': 'Description',
  });
});

test('Updated consequence field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.consequencesTab.selectTabAndAssertTitle(
    'Consequences'
  );
  await app.issueDetailsPage.consequencesTab.addButton.click();
  const consequenceForm =
    app.issueDetailsPage.consequencesTab.consequenceModal.consequenceForm;

  await consequenceForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: consequenceForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: consequenceForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: consequenceForm.fields.criticality,
      newLabel: 'New criticality',
    },
    {
      field: consequenceForm.fields.costValue,
      newLabel: 'New cost value',
    },
    {
      field: consequenceForm.fields.costType,
      newLabel: 'New cost type',
    },
    {
      field: consequenceForm.fields.description,
      newLabel: 'New description',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await consequenceForm.saveFormConfigurationButton.click();

  await consequenceForm.fillFormAndClickSave({
    title: 'Consequence 1',
    type: 'Customer',
    criticality: 'Low',
    costType: 'Hours',
    costValue: '100',
    description: 'Description',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Consequence added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Consequences data source',
    dataSource: {
      type: 'Consequences',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    'New title': 'Consequence 1',
    'New type': 'Customer',
    'New criticality': 'Low',
    'New cost type': 'Hours',
    'New cost value': '100.00',
    'New description': 'Description',
  });
});
