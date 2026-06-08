import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildAssessmentFormValues } from '../testData/assessmentFormValuesBuilder';
import { users } from '../users';

test('Created internal audit report name shown in details page header', async ({
  app,
  page,
}) => {
  const newInternalAuditReportName = 'Internal audit report 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
    {
      title: newInternalAuditReportName,
      summary: 'Internal Audit Report 1 summary text',
    }
  );
  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );

  await expect(app.internalAuditReportDetailsPage.header.title).toHaveText(
    newInternalAuditReportName
  );
});

test('Created internal audit report name shown in register', async ({
  app,
  page,
}) => {
  const newInternalAuditReportName = 'Internal Audit Report 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
    {
      title: newInternalAuditReportName,
      summary: 'Internal Audit Report 1 summary text',
    }
  );
  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );

  await app.addInternalAuditReportPage.internalAuditReportForm.cancelButton.click();
  await expect(app.internalAuditReportRegisterPage.header.count).toHaveText(
    `(1)`
  );
  await expect(
    await app.internalAuditReportRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(newInternalAuditReportName);
});

test('Created internal audit report not shown in other assessment registers', async ({
  app,
  page,
}) => {
  const newInternalAuditReportName = 'Internal Audit Report 1';
  await updateOrganisationFeatures([
    'internal_audit',
    'compliance',
    'compliance_monitoring',
  ]);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
    {
      title: newInternalAuditReportName,
      summary: 'Internal Audit Report 1 summary text',
    }
  );

  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );

  await app.addInternalAuditReportPage.internalAuditReportForm.cancelButton.click();
  await expect(app.internalAuditReportRegisterPage.header.count).toHaveText(
    `(1)`
  );
  await expect(
    await app.internalAuditReportRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(newInternalAuditReportName);
  await app.internalAuditReportRegisterPage.clickExpandableParentNavigation();

  await app.assessmentRegisterPage.navigateTo();
  await expect(app.assessmentRegisterPage.header.count).toHaveText(`(0)`);
  await app.assessmentRegisterPage.clickExpandableParentNavigation();

  await app.complianceAssessmentRegisterPage.navigateTo();
  await expect(app.complianceAssessmentRegisterPage.header.count).toHaveText(
    `(0)`
  );
});

test('Created internal audit assessment activity name shown in register', async ({
  app,
  page,
}) => {
  const newInternalAuditReportName = 'Internal Audit Report 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
    {
      title: newInternalAuditReportName,
      summary: 'Internal Audit Report 1 summary text',
    }
  );
  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );

  await app.internalAuditReportDetailsPage.activitiesTab.selectTab();
  await app.internalAuditReportDetailsPage.activitiesTab.addButton.click();
  const assessmentActivityForm =
    app.internalAuditReportDetailsPage.activitiesTab.assessmentActivityForm;

  const newAssessmentActivityName = 'Internal audit report activity 1 title';
  await assessmentActivityForm.fillFormAndClickSave({
    title: newAssessmentActivityName,
    summary: 'Internal audit report activity 1 summary text',
  });
  await app.internalAuditReportDetailsPage.notificationBanner.expectNotification(
    'Activity added successfully'
  );
  await app.internalAuditReportDetailsPage.activitiesTab.table.expectRowCount(
    1
  );
  await expect(
    await app.internalAuditReportDetailsPage.activitiesTab.table.getBodyCell(
      'Activity title',
      1
    )
  ).toHaveText(newAssessmentActivityName);
});

test('Can created an internal audit report from internal audit page', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');

  await app.internalAuditScenarios.createInternalAudit({
    title: 'Internal audit 1',
    description: 'Internal Audit  1 summary text',
    businessArea: 'Technology',
  });
  await app.internalAuditDetailsPage.reportsTab.selectTab();
  await app.internalAuditDetailsPage.reportsTab.table.expectRowCount(0);
  await app.internalAuditDetailsPage.reportsTab.addButton.click();
  await app.internalAuditDetailsPage.reportsTab.reportModal.reportForm.fillFormAndClickSave(
    {
      title: 'Report 1',
      summary: 'Internal Audit Report 1 summary text',
    }
  );

  await app.internalAuditDetailsPage.notificationBanner.expectNotification(
    'Report added successfully'
  );
  await app.internalAuditDetailsPage.reportsTab.table.expectRowCount(1);
});

test('Cannot set title, status or owners as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'internal_audit']);
  await page.goto('/');
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  const issueForm = app.addInternalAuditReportPage.internalAuditReportForm;
  const requiredFields = [
    issueForm.fields.title,
    issueForm.fields.status,
    issueForm.fields.owners,
  ];

  await issueForm.formSettingsButton.openAndClickItem('Edit form');

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

test('Can set summary, completed by, start date, target completion date, actual completion date, next audit date, report outcome, contributor, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  const form = app.addInternalAuditReportPage.internalAuditReportForm;
  const unrequiredFields = [
    form.fields.summary,
    form.fields.completedBy,
    form.fields.startDate,
    form.fields.targetCompletionDate,
    form.fields.actualCompletionDate,
    form.fields.nextAssessmentDate,
    form.fields.assessmentOutcome,
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
    status: 'Complete',
    owners: [users.riskManager.friendlyName],
  });

  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );
});

test('Can add conditions on summary, completed by, start date, target completion date, actual completion date, next audit date, report outcome, contributor, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddReportPage();

  const form = app.addInternalAuditReportPage.internalAuditReportForm;

  const conditionalFields = [
    form.fields.summary,
    form.fields.completedBy,
    form.fields.startDate,
    form.fields.targetCompletionDate,
    form.fields.actualCompletionDate,
    form.fields.nextAssessmentDate,
    form.fields.assessmentOutcome,
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
    status: 'Complete',
    owners: [users.riskManager.friendlyName],
  });

  await app.addInternalAuditReportPage.notificationBanner.expectNotification(
    'Report added successfully'
  );
});

test('Updated internal audit field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['internal_audit']);
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
  await app.internalAuditScenarios.navigateToAddReportPage();

  const form = app.addInternalAuditReportPage.internalAuditReportForm;
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
  await app.internalAuditReportDetailsPage.notificationBanner.expectNotification(
    'Report added successfully'
  );

  await app.internalAuditReportRegisterPage.navigateToAndAssertTitle();
  await app.internalAuditReportRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.internalAuditReportRegisterPage.table.expectRowToContain(1, {
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
