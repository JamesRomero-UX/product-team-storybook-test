import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildAssessmentFormValues } from '../testData/assessmentFormValuesBuilder';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Created assessment name shown in details page header (${user.role})`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      const newAssessmentName = 'Assessment 1';

      await app.assessmentScenarios.createAssessment({
        title: newAssessmentName,
        summary: 'Assessment 1 summary text',
      });
      await expect(app.assessmentDetailsPage.header.title).toHaveText(
        newAssessmentName
      );
    });
  });
});

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Created assessment shown in register`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await page.goto('/');
      const newAssessmentName = 'Assessment 1';

      await app.assessmentScenarios.createAssessment({
        title: newAssessmentName,
        summary: 'Assessment 1 summary text',
        completedBy: 'RiskManager1',
        startDate: '2021-02-02',
        targetCompletionDate: '2021-03-02',
        nextAssessmentDate: '2021-04-04',
        actualCompletionDate: '2025-01-01',
        status: 'Not started',
        assessmentOutcome: 'Satisfactory',
        owners: ['Standard1'],
      });

      await app.addAssessmentPage.assessmentForm.cancelButton.click();

      await app.assessmentRegisterPage.table.expectRowCount(1);
      await expect(app.assessmentRegisterPage.header.count).toHaveText(`(1)`);
      await app.assessmentRegisterPage.table.toggleAllColumnsToBeVisible();
      await app.assessmentRegisterPage.table.expectRowToContain(1, {
        Title: newAssessmentName,
        Status: 'Not started',
        'Start date': '2 Feb 2021',
        Owners: ['Standard1'],
        'Completion date': '1 Jan 2025',
        'Assessment outcome': 'Satisfactory',
        'Completed by': 'RiskManager1',
        ID: 'ASMT-1',
        'Next assessment date': '4 Apr 2021',
        'Target completion date': '2 Mar 2021',
      });
    });
  });
});

test('Updated assessment field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');

  const assessment = buildAssessmentFormValues({
    actualCompletionDate: '2025-01-01',
    completedBy: 'RiskManager1',
    nextAssessmentDate: '2021-04-04',
    owners: ['Standard1'],
    contributors: ['RiskManager1'],
    startDate: '2021-02-02',
    targetCompletionDate: '2021-03-02',
    status: 'Not started',
    assessmentOutcome: 'Satisfactory',
  });
  await app.assessmentRegisterPage.navigateToAndAssertTitle();

  await app.assessmentRegisterPage.addButton.click();

  await expect(app.addAssessmentPage.header.title).toHaveText(`Add Assessment`);

  const assessmentForm = app.addAssessmentPage.assessmentForm;
  await assessmentForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: assessmentForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: assessmentForm.fields.summary,
      newLabel: 'New summary',
      notInRegister: true,
    },
    {
      field: assessmentForm.fields.completedBy,
      newLabel: 'New completed by',
    },
    {
      field: assessmentForm.fields.startDate,
      newLabel: 'New start date',
    },
    {
      field: assessmentForm.fields.targetCompletionDate,
      newLabel: 'New target completion date',
    },
    {
      field: assessmentForm.fields.actualCompletionDate,
      newLabel: 'New actual completion date',
    },
    {
      field: assessmentForm.fields.nextAssessmentDate,
      newLabel: 'New next assessment date',
    },
    {
      field: assessmentForm.fields.status,
      newLabel: 'New status',
    },
    {
      field: assessmentForm.fields.assessmentOutcome,
      newLabel: 'New assessment outcome',
    },
    {
      field: assessmentForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: assessmentForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: assessmentForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: assessmentForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await assessmentForm.saveFormConfigurationButton.click();

  await assessmentForm.fillFormAndClickSave(assessment);
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Assessment added successfully'
  );

  await app.assessmentRegisterPage.navigateToAndAssertTitle();
  await app.assessmentRegisterPage.table.expectRowCount(1);
  await app.assessmentRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.assessmentRegisterPage.table.expectRowToContain(1, {
    'New title': assessment.title,
    'New status': assessment.status,
    'New start date': '2 Feb 2021',
    'New owners': ['Standard1'],
    'New actual completion date': '1 Jan 2025',
    'New assessment outcome': assessment.assessmentOutcome,
    'New completed by': 'RiskManager1',
    'New next assessment date': '4 Apr 2021',
    'New target completion date': '2 Mar 2021',
  });
});

test('Updated assessment field names shown in custom data source', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const assessment = buildAssessmentFormValues({
    actualCompletionDate: '2025-01-01',
    completedBy: 'RiskManager1',
    nextAssessmentDate: '2021-04-04',
    owners: ['Standard1'],
    contributors: ['RiskManager1'],
    startDate: '2021-02-02',
    targetCompletionDate: '2021-03-02',
    status: 'Not started',
    assessmentOutcome: 'Satisfactory',
  });
  await app.assessmentScenarios.navigateToAddAssessmentPage();

  const form = app.addAssessmentPage.assessmentForm;
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
      field: form.fields.summary,
      newLabel: 'New summary',
      notInRegister: true,
    },
    {
      field: form.fields.completedBy,
      newLabel: 'New completed by',
    },
    {
      field: form.fields.startDate,
      newLabel: 'New start date',
    },
    {
      field: form.fields.targetCompletionDate,
      newLabel: 'New target completion date',
    },
    {
      field: form.fields.actualCompletionDate,
      newLabel: 'New actual completion date',
    },
    {
      field: form.fields.nextAssessmentDate,
      newLabel: 'New next assessment date',
    },
    {
      field: form.fields.status,
      newLabel: 'New status',
    },
    {
      field: form.fields.assessmentOutcome,
      newLabel: 'New assessment outcome',
    },
    {
      field: form.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: form.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: form.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: form.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave(assessment);
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Assessment added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Assessment data source',
    dataSource: {
      type: 'Assessments',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.assessmentRegisterPage.table.expectRowToContain(1, {
    'New title': assessment.title,
    'New status': assessment.status,
    'New start date': '2 Feb 2021',
    'New owners': ['Standard1'],
    'New actual completion date': '1 Jan 2025',
    'New assessment outcome': assessment.assessmentOutcome,
    'New completed by': 'RiskManager1',
    'New next assessment date': '4 Apr 2021',
    'New target completion date': '2 Mar 2021',
  });
});

test('Cannot set title, status and owners as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.assessmentScenarios.navigateToAddAssessmentPage();

  const form = app.assessmentDetailsPage.assessmentForm;
  const requiredFields = [
    form.fields.title,
    form.fields.status,
    form.fields.owners,
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

test('Can set summary, completed by, start date, target completion date, actual completion date, tags, departments, next assessment date, assessment outcome, contributors as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.assessmentScenarios.navigateToAddAssessmentPage();

  const form = app.assessmentDetailsPage.assessmentForm;
  const unrequiredFields = [
    form.fields.summary,
    form.fields.completedBy,
    form.fields.startDate,
    form.fields.targetCompletionDate,
    form.fields.actualCompletionDate,
    form.fields.tags,
    form.fields.departments,
    form.fields.nextAssessmentDate,
    form.fields.assessmentOutcome,
    form.fields.contributors,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Title',
    status: 'Not started',
    owners: [users.riskManager.friendlyName],
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Assessment added successfully'
  );
});

test('Can add conditions on summary, completed by, start date, target completion date, actual completion date, tags, departments, next assessment date, assessment outcome, contributors', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.assessmentScenarios.navigateToAddAssessmentPage();

  const form = app.assessmentDetailsPage.assessmentForm;
  const conditionalFields = [
    form.fields.summary,
    form.fields.completedBy,
    form.fields.startDate,
    form.fields.targetCompletionDate,
    form.fields.actualCompletionDate,
    form.fields.tags,
    form.fields.departments,
    form.fields.nextAssessmentDate,
    form.fields.assessmentOutcome,
    form.fields.contributors,
  ];

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
    title: 'Title',
    status: 'Not started',
    owners: [users.riskManager.friendlyName],
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Assessment added successfully'
  );
});
