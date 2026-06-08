import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { InternalAuditReportRegisterPage } from '../models/InternalAuditReportRegisterPage';
import { buildAssessmentFormValues } from '../testData/assessmentFormValuesBuilder';

test(`compliance monitoring assessment Register heading is "Monitoring Assessments Register"`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateToAndAssertTitle();
});

test('Create a new compliance monitoring assessment page heading is "Add Monitoring assessment"', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();

  await expect(app.addComplianceAssessmentPage.header.title).toHaveText(
    `Add Monitoring assessment`
  );
});

test('Created compliance monitoring assessment name shown in details page header', async ({
  page,
  app,
}) => {
  const newComplianceAssessmentName = 'Compliance monitoring assessment 1';
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();

  await expect(app.addComplianceAssessmentPage.header.title).toHaveText(
    'Add Monitoring assessment'
  );
  await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
    {
      title: newComplianceAssessmentName,
      summary: 'Assessment 1 summary text',
    }
  );
  await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
    'Monitoring assessment added successfully'
  );

  await expect(app.complianceAssessmentDetailsPage.header.title).toHaveText(
    newComplianceAssessmentName
  );
});

test('Created compliance monitoring assessment name shown in register', async ({
  page,
  app,
}) => {
  const newComplianceAssessmentName = 'Compliance monitoring assessment 1';
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();

  await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
    {
      title: newComplianceAssessmentName,
      summary: 'Assessment 1 summary text',
    }
  );
  await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
    'Monitoring assessment added successfully'
  );

  await app.addComplianceAssessmentPage.complianceAssessmentForm.cancelButton.click();

  await expect(app.complianceAssessmentRegisterPage.header.count).toHaveText(
    `(1)`
  );
  await expect(
    await app.complianceAssessmentRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(newComplianceAssessmentName);
});

test('Created compliance monitoring assessment not shown in other assessment registers', async ({
  page,
  app,
}) => {
  const newComplianceAssessmentName = 'Compliance monitoring assessment 1';
  await updateOrganisationFeatures([
    'compliance',
    'compliance_monitoring',
    'internal_audit',
  ]);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();

  await expect(app.addComplianceAssessmentPage.header.title).toHaveText(
    'Add Monitoring assessment'
  );

  await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
    {
      title: newComplianceAssessmentName,
      summary: 'Assessment 1 summary text',
    }
  );

  await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
    'Monitoring assessment added successfully'
  );
  await app.addComplianceAssessmentPage.complianceAssessmentForm.cancelButton.click();

  await expect(app.complianceAssessmentRegisterPage.header.count).toHaveText(
    `(1)`
  );
  await expect(
    await app.complianceAssessmentRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(newComplianceAssessmentName);

  await app.complianceAssessmentRegisterPage.clickExpandableParentNavigation();

  const internalAuditReportRegisterPage = new InternalAuditReportRegisterPage(
    page
  );
  await internalAuditReportRegisterPage.navigateToAndAssertTitle();
  await expect(internalAuditReportRegisterPage.header.count).toHaveText(`(0)`);

  await internalAuditReportRegisterPage.clickExpandableParentNavigation();

  await app.assessmentRegisterPage.navigateTo();
  await expect(app.assessmentRegisterPage.header.count).toHaveText(`(0)`);
});

test('Created compliance assessment activity name shown in register', async ({
  page,
  app,
}) => {
  const newComplianceAssessmentName = 'Compliance monitoring assessment 1';
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();

  await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
    {
      title: newComplianceAssessmentName,
      summary: 'Assessment 1 summary text',
    }
  );
  await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
    'Monitoring assessment added successfully'
  );

  await app.complianceAssessmentDetailsPage.activitiesTab.selectTab();
  await app.complianceAssessmentDetailsPage.activitiesTab.addButton.click();
  const assessmentActivityForm =
    app.complianceAssessmentDetailsPage.activitiesTab.assessmentActivityForm;

  const newAssessmentActivityName = 'Compliance assessment activity 1 title';
  await assessmentActivityForm.fillFormAndClickSave({
    title: newAssessmentActivityName,
    summary: 'Compliance assessment activity 1 summary text',
  });
  await app.complianceAssessmentDetailsPage.notificationBanner.expectNotification(
    'Activity added successfully'
  );

  await app.complianceAssessmentDetailsPage.activitiesTab.table.expectRowCount(
    1
  );
  await expect(
    await app.complianceAssessmentDetailsPage.activitiesTab.table.getBodyCell(
      'Activity title',
      1
    )
  ).toHaveText(newAssessmentActivityName);
});

test('Updated assessment field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
  await page.goto('/');

  await app.complianceAssessmentRegisterPage.navigateTo();
  await app.complianceAssessmentRegisterPage.addButton.click();
  const form = app.addComplianceAssessmentPage.complianceAssessmentForm;

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

  const assessment = buildAssessmentFormValues();
  await form.fillFormAndClickSave(assessment);
  await app.complianceAssessmentDetailsPage.notificationBanner.expectNotification(
    'Monitoring assessment added successfully'
  );

  await app.complianceAssessmentRegisterPage.navigateToAndAssertTitle();
  await app.complianceAssessmentRegisterPage.table.expectRowCount(1);
  await app.complianceAssessmentRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.complianceAssessmentRegisterPage.table.expectRowToContain(1, {
    'New actual completion date': '-',
    'New assessment outcome': '',
    'New completed by': '',
    'New contributors': '',
    'New departments': '',
    'New next assessment date': '-',
    'New owners': ['RiskManager1'],
    'New start date': '-',
    'New status': 'Not started',
    'New tags': '',
    'New target completion date': '-',
    'New title': 'Assessment 1',
  });
});
