import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CauseFields } from '../models/forms/CauseForm';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildIssueFormValues } from '../testData/issueFormValuesBuilder';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Causes Register heading is "Causes Register"`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      await app.causesRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test('Can create an issue cause and see it in the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  await app.issueDetailsPage.causesTab.causeModal.causeForm.fillFormAndClickSave(
    cause
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
  await app.issueDetailsPage.causesTab.table.expectRowToContain(1, {
    Title: cause.title,
    Description: cause.description,
    Significance: cause.significance,
  });
});

// Skipping as this functionality not yet implemented

test.skip('Relabelled cause fields shown in tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  const causesForm = await app.issueDetailsPage.causesTab.causeModal.causeForm;
  await causesForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(causesForm.fields.title, {
    enableCustomLabel: true,
    label: 'New Title',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.significance, {
    enableCustomLabel: true,
    label: 'New Significance',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.description, {
    enableCustomLabel: true,
    label: 'New Description',
  });
  await causesForm.saveFormConfigurationButton.click();
  await causesForm.fillFormAndClickSave(cause);
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
  await app.issueDetailsPage.causesTab.table.expectRowToContain(1, {
    'New Title': cause.title,
    'New Description': cause.description,
    'New Significance': cause.significance,
  });
});

test('Relabelled cause fields shown in register', async ({ app, page }) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  const causesForm = await app.issueDetailsPage.causesTab.causeModal.causeForm;
  await causesForm.formSettingsButton.openAndClickItem('Edit form');

  await app.customAttributeScenarios.editField(causesForm.fields.title, {
    enableCustomLabel: true,
    label: 'New Title',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.significance, {
    enableCustomLabel: true,
    label: 'New Significance',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.description, {
    enableCustomLabel: true,
    label: 'New Description',
  });
  await causesForm.saveFormConfigurationButton.click();
  await causesForm.fillFormAndClickSave(cause);
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.causesRegisterPage.navigateToAndAssertTitle();
  await app.causesRegisterPage.table.expectRowCount(1);
  await app.causesRegisterPage.table.toggleVisibleColumns([
    'New Title',
    'New Description',
    'New Significance',
  ]);
  await app.causesRegisterPage.table.expectRowToContain(1, {
    'New Title': cause.title,
    'New Description': cause.description,
    'New Significance': cause.significance,
  });
});

test('Relabelled cause fields shown in custom datasource', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTab();
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  const causesForm = await app.issueDetailsPage.causesTab.causeModal.causeForm;
  await causesForm.formSettingsButton.openAndClickItem('Edit form');

  await app.customAttributeScenarios.editField(causesForm.fields.title, {
    enableCustomLabel: true,
    label: 'New Title',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.significance, {
    enableCustomLabel: true,
    label: 'New Significance',
  });
  await app.customAttributeScenarios.editField(causesForm.fields.description, {
    enableCustomLabel: true,
    label: 'New Description',
  });
  await causesForm.saveFormConfigurationButton.click();
  await causesForm.fillFormAndClickSave(cause);
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Causes data source',
    dataSource: {
      type: 'Causes',
      fields: [
        { defaultLabel: 'New Title' },
        { defaultLabel: 'New Description' },
        { defaultLabel: 'New Significance' },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.causesRegisterPage.table.expectRowToContain(1, {
    'New Title': cause.title,
    'New Description': cause.description,
    'New Significance': cause.significance,
  });
});

test('Can update an issue cause and see it in updated in the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  await app.issueDetailsPage.causesTab.causeModal.causeForm.fillFormAndClickSave(
    cause
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
  await app.issueDetailsPage.causesTab.table.clickCellLink('Title', 1);
  const updatedCause: CauseFields = {
    title: 'Cause 1 updated',
    description: 'Cause 1 description updated',
    significance: 'Certain',
  };
  await app.issueDetailsPage.causesTab.causeModal.causeForm.fillFormAndClickSave(
    updatedCause
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause updated successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
  await app.issueDetailsPage.causesTab.table.expectRowToContain(1, {
    Title: updatedCause.title,
    Description: updatedCause.description,
    Significance: updatedCause.significance,
  });
});

test('Can delete an issue cause and see it in removed from the tab table', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const cause: CauseFields = {
    title: 'Cause 1',
    description: 'Cause 1 description',
    significance: 'Likely',
  };
  await app.issueDetailsPage.causesTab.causeModal.causeForm.fillFormAndClickSave(
    cause
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
  await app.issueDetailsPage.causesTab.table.checkRow(1);
  await app.issueDetailsPage.causesTab.deleteButton.click();
  await app.issueDetailsPage.causesTab.deleteModal.confirmButton.click();
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause deleted successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(0);
});

test('Can set description and significance as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.causesRegisterPage.navigateToAndAssertTitle();
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const causeForm = app.issueDetailsPage.causesTab.causeModal.causeForm;
  const unrequiredFields = [
    causeForm.fields.description,
    causeForm.fields.significance,
  ];

  await app.customAttributeScenarios.bulkEditFields(causeForm, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);
  await causeForm.fillFormAndClickSave({
    title: 'Cause with just title',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );
  await app.issueDetailsPage.causesTab.table.expectRowCount(1);
});

test('Cannot set title as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const causeForm = app.issueDetailsPage.causesTab.causeModal.causeForm;
  const requiredFields = [causeForm.fields.title];

  await causeForm.formSettingsButton.openAndClickItem('Edit form');

  for (const field of requiredFields) {
    await field.editFieldButton.click();
    await expect(app.editFieldModal.header).toHaveText('Edit');
    await app.editFieldModal.editFieldForm.fields.conditions.expectIsVisible(
      false
    );
    await app.editFieldModal.editFieldForm.fields.required.expectToBeDisabled(
      true
    );
  }
});

test('Can add conditions on description and significance', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const causeForm = app.issueDetailsPage.causesTab.causeModal.causeForm;
  const conditionalFields = [
    causeForm.fields.description,
    causeForm.fields.significance,
  ];

  await app.customAttributeScenarios.bulkEditFields(causeForm, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Title=test' },
    })),
  ]);

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await causeForm.fillForm({
    title: 'test',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }
});

test('Updated cause field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.causesTab.selectTabAndAssertTitle('Causes');
  await app.issueDetailsPage.causesTab.addButton.click();
  const causeForm = app.issueDetailsPage.causesTab.causeModal.causeForm;

  await causeForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: causeForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: causeForm.fields.significance,
      newLabel: 'New significance',
    },
    {
      field: causeForm.fields.description,
      newLabel: 'New description',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await causeForm.saveFormConfigurationButton.click();

  await causeForm.fillFormAndClickSave({
    title: 'Cause 1',
    significance: 'Certain',
    description: 'Description',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Cause added successfully'
  );

  await app.causesRegisterPage.navigateToAndAssertTitle();
  await app.causesRegisterPage.table.expectRowCount(1);
  await app.causesRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.causesRegisterPage.table.expectRowToContain(1, {
    'New title': 'Cause 1',
    'New significance': 'Certain',
    'New description': 'Description',
  });
});
