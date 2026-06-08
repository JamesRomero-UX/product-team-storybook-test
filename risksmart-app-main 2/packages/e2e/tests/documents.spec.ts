import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildDocumentFormValues } from '../testData/documentFormValuesBuilder';
import { users } from '../users';

test('Can use a non owner/contributor group as a group that is required to attest', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['policy', 'attestations']);
  await page.goto('/');
  await app.groupScenarios.createGroupWithUsers(
    {
      name: 'Group 1',
      description: 'Group 1 description',
      ownerContributor: 'No',
    },
    ['RiskManager1']
  );

  await app.policyRegisterPage.navigateToAndAssertTitle();
  await app.policyRegisterPage.addButton.click();

  await expect(app.addDocumentPage.header.title).toHaveText(`Add Document`);
  await app.addDocumentPage.detailsTab.documentForm.fillForm({
    attestationGroups: ['Group 1'],
  });
});

test('Document next test date updated when creating rating', async ({
  page,
  app,
}) => {
  const newDocumentTitle = 'Doc 1';
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');

  await app.policyScenarios.createDocument({
    title: newDocumentTitle,
    purpose: 'Document 1 description',
    type: 'Policy',
    owners: ['RiskManager1'],
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  await app.policyRegisterPage.navigateToAndAssertTitle();
  await app.policyRegisterPage.table.expectRowCount(1);
  await app.policyRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.policyRegisterPage.table.expectRowToContain(1, {
    ID: 'D-1',
    'Latest rating date': '-',
    'Next test date': '2 Feb 2021', // start date as no tests yet
    'Next test overdue': '12 Feb 2021',
  });

  await app.policyRegisterPage.table.clickCellText(
    'Title',
    1,
    newDocumentTitle
  );

  await app.policyScenarios.createDocumentRatingFromDocumentDetailPage({
    rating: 'Non-compliant',
    rationale: 'Rationale...',
    resultDate: '2021-02-03',
  });

  await app.documentDetailsPage.ratingsTab.table.expectRowToContain(1, {
    'Completion date (assessment)': '-',
    'Title (assessment)': '-',
    'Next assessment date (assessment)': '-',
    Rating: 'Non-compliant',
    'Result date': '3 Feb 2021',
    Status: '',
  });
  await app.policyRegisterPage.navigateToAndAssertTitle();
  await app.policyRegisterPage.table.expectRowCount(1);
  await app.policyRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.policyRegisterPage.table.expectRowToContain(1, {
    ID: 'D-1',
    'Latest rating date': '3 Feb 2021',
    'Next test date': '9 Feb 2021', // start date plus 2 weeks (as 1 week test performed)
    'Next test overdue': '19 Feb 2021',
  });
});

test('Updated document field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');

  const document = buildDocumentFormValues({});
  await app.policyScenarios.navigateToAddDocumentPage();
  const documentForm = app.addDocumentPage.detailsTab.documentForm;
  await documentForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: documentForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: documentForm.fields.purpose,
      newLabel: 'New purpose',
      notInRegister: true,
    },
    {
      field: documentForm.fields.parent,
      newLabel: 'New parent',
    },
    {
      field: documentForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: documentForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: documentForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: documentForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: documentForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await documentForm.saveFormConfigurationButton.click();

  await documentForm.fillFormAndClickSave(document);
  await app.documentDetailsPage.notificationBanner.expectNotification(
    'Document added successfully'
  );

  await app.policyRegisterPage.navigateToAndAssertTitle();
  await app.policyRegisterPage.table.expectRowCount(1);
  await app.policyRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.policyRegisterPage.table.expectRowToContain(1, {
    'New title': document.title,
    'New parent': '–',
    'New type': document.type,
    'New owners': document.owners,
    'New contributors': '',
    'New tags': '',
    'New departments': '',
  });
});

test('Updated document field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['policy', 'multi_reporting']);
  await page.goto('/');

  const document = buildDocumentFormValues({});
  await app.policyScenarios.navigateToAddDocumentPage();
  const documentForm = app.addDocumentPage.detailsTab.documentForm;
  await documentForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: documentForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: documentForm.fields.purpose,
      newLabel: 'New purpose',
    },
    {
      field: documentForm.fields.parent,
      newLabel: 'New parent',
      notInRegister: true,
    },
    {
      field: documentForm.fields.type,
      newLabel: 'New type',
    },
    {
      field: documentForm.fields.owners,
      newLabel: 'New owners',
      notInRegister: true,
    },
    {
      field: documentForm.fields.contributors,
      newLabel: 'New contributors',
      notInRegister: true,
    },
    {
      field: documentForm.fields.tags,
      newLabel: 'New tags',
      notInRegister: true,
    },
    {
      field: documentForm.fields.departments,
      newLabel: 'New departments',
      notInRegister: true,
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await documentForm.saveFormConfigurationButton.click();

  await documentForm.fillFormAndClickSave(document);
  await app.documentDetailsPage.notificationBanner.expectNotification(
    'Document added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Documents data source',
    dataSource: {
      type: 'Documents',
      fields: fieldsToRename
        .filter((f) => !f.notInRegister)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New title': document.title,
    'New purpose': document.purpose,
    'New type': document.type,
  });
});

test('Cannot set title, type or owner as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.navigateToAddDocumentPage();

  const form = app.addDocumentPage.detailsTab.documentForm;
  const requiredFields = [
    form.fields.title,
    form.fields.owners,
    form.fields.type,
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

test('Can set purpose, parent, contributor, linked documents, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.navigateToAddDocumentPage();
  const form = app.addDocumentPage.detailsTab.documentForm;

  const unrequiredFields = [
    form.fields.purpose,
    form.fields.parent,
    form.fields.linkedDocuments,
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
    type: 'Standard',
    title: 'Document 1',
    owners: [users.riskManager.friendlyName],
  });
  await app.documentDetailsPage.notificationBanner.expectNotification(
    'Document added successfully'
  );
});

test('Can add conditions on purpose, contributor, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  await app.policyScenarios.navigateToAddDocumentPage();
  const form = app.addDocumentPage.detailsTab.documentForm;

  const conditionalFields = [
    form.fields.purpose,
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
    type: 'Standard',
    title: 'Document 1',
    owners: [users.riskManager.friendlyName],
  });
  await app.documentDetailsPage.notificationBanner.expectNotification(
    'Document added successfully'
  );
});
