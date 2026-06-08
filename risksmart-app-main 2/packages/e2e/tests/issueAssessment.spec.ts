import { expect } from '@playwright/test';

import {
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import type { IssueAssessmentFormFields } from '../models/forms/IssueAssessmentForm';
import { buildDocumentFormValues } from '../testData/documentFormValuesBuilder';
import { buildIssueFormValues } from '../testData/issueFormValuesBuilder';
import { users } from '../users';

test('Issue assessment form details are saved', async ({ page, app }) => {
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Description 1' },
    { Name: 'Department 2', Description: 'Description 2' },
  ]);
  await insertTagTypes([
    { Name: 'tag1', Description: 'Tag 1 description' },
    { Name: 'tag2', Description: 'Tag 2 description' },
  ]);
  await page.goto('/');
  const issueTitle = 'Issue 1';

  await app.issueScenarios.createIssue({
    title: issueTitle,
    details: 'Issue description 1',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );

  const issueAssessment: Partial<IssueAssessmentFormFields> = {
    issueType: 'Material Impact',
    severity: 'High',
    status: 'Pending',
    targetCloseDate: '2024-12-31',
    certifiedIndividual: 'RiskManager1',
    regulatoryBreach: 'Yes',
    regulationsBreached: 'Regulation 1, Regulation 2',
    issueCausedByThirdParty: 'Yes',
    thirdPartyResponsible: 'Third Party 1',
    issueCausedBySystemIssue: 'Yes',
    systemResponsible: 'System 1',
    policyBreach: 'Yes',
    policiesBreached: 'Policy 1, Policy 2',
    policyOwner: 'RiskManager1',
    policyOwnerCommentary: 'Policy owner commentary',
    tags: ['tag1', 'tag2'],
    departments: ['Department 1'],
    reportable: 'Yes',
    rationale: 'Rationale for assessment',
  };

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
    issueAssessment
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );
  // Navigates back to details
  await expect(app.issueDetailsPage.issueDetailsTab.title).toHaveText(
    'Details'
  );

  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.expectValues(
    issueAssessment
  );
});

test('Issue assessment cancel navigates to details', async ({ page, app }) => {
  await page.goto('/');
  const issueTitle = 'Issue 1';
  await app.issueScenarios.createIssue({
    title: issueTitle,
    details: 'Issue description 1',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });

  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);
  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );
  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.cancelButton.click();
  await expect(app.issueDetailsPage.activeTab).toHaveText('Details');
});

test('Issue register shows correct policy breaches', async ({ page, app }) => {
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');

  // Create an issue
  await app.issueScenarios.createIssue(buildIssueFormValues());

  // Create policies
  await app.policyScenarios.createDocument(
    buildDocumentFormValues({
      title: 'Document A',
    })
  );

  await app.policyScenarios.createDocument(
    buildDocumentFormValues({
      title: 'Document B',
    })
  );

  // Go to issue details page -> assessment tab
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueAssessmentScenarios.createIssueAssessmentFromIssueDetails({
    policyBreach: 'Yes',
    policiesBreachedIds: ['Document A', 'Document B'],
  });

  // Go back to the register and check the breached columns
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.table.expectRowCount(1);
  await app.issueRegisterPage.table.toggleColumnVisibilityFromTable(
    'Policies breached (issue assessment)'
  );
  await app.issueRegisterPage.table.expectRowToContain(1, {
    'Policies breached (issue assessment)': 'Document A, Document B',
  });
});

test('Updated issue assessment field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');
  const issue = buildIssueFormValues({});
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
    'Assessment'
  );

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.formSettingsButton.openAndClickItem(
    'Edit form'
  );

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    expectedColumnName: string;
    notInRegister?: boolean;
  }[] = [
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueType,
      newLabel: 'New issue type',
      expectedColumnName: 'New issue type (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .severity,
      newLabel: 'New severity',
      expectedColumnName: 'New severity (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .status,
      newLabel: 'New status',
      expectedColumnName: 'New status (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .targetCloseDate,
      newLabel: 'New target close date',
      expectedColumnName: 'New target close date (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .certifiedIndividual,
      newLabel: 'New certified individual',
      expectedColumnName: 'New certified individual (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .regulatoryBreach,
      newLabel: 'New regulatory breach',
      expectedColumnName: 'New regulatory breach (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .departments,
      newLabel: 'New departments',
      expectedColumnName: 'New departments (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyBreach,
      newLabel: 'New policy breach',
      expectedColumnName: 'New policy breach (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policiesBreached,
      newLabel: 'New policies breached',
      expectedColumnName: 'New policies breached (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyOwner,
      newLabel: 'New policy owner',
      expectedColumnName: 'New policy owner (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyOwnerCommentary,
      newLabel: 'New policy owner commentary',
      expectedColumnName: 'New policy owner commentary (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueCausedBySystemIssue,
      newLabel: 'New issue caused by system issue',
      expectedColumnName: 'New issue caused by system issue (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .systemResponsible,
      newLabel: 'New system responsible',
      expectedColumnName: 'New system responsible (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueCausedByThirdParty,
      newLabel: 'New issue caused by third party',
      expectedColumnName: 'New issue caused by third party (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .thirdPartyResponsible,
      newLabel: 'New third party responsible',
      expectedColumnName: 'New third party responsible (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .rationale,
      newLabel: 'New rationale',
      expectedColumnName: 'New rationale (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .reportable,
      newLabel: 'New reportable',
      expectedColumnName: 'New reportable (issue assessment)',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .actualCloseDate,
      newLabel: 'New actual close date',
      expectedColumnName: 'New actual close date (issue assessment)',
    },
  ];
  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.saveFormConfigurationButton.click();
  const issueAssessment: Partial<IssueAssessmentFormFields> = {
    issueType: 'Near Miss',
    severity: 'Minimal',
    status: 'Closed',
    targetCloseDate: '2024-12-31',
    actualCloseDate: '2025-12-31',
    certifiedIndividual: 'RiskManager1',
    regulatoryBreach: 'Yes',
    issueCausedBySystemIssue: 'Yes',
    systemResponsible: 'System 1',
    policyBreach: 'Yes',
    policyOwner: 'RiskManager1',
    policyOwnerCommentary: 'Policy owner commentary',

    issueCausedByThirdParty: 'Yes',
    thirdPartyResponsible: 'Third Party 1',
    policiesBreached: 'Document A, Document B',
    rationale: 'Rationale for assessment',
    reportable: 'Yes',
  };
  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
    issueAssessment
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );
  // Navigates back to details
  await expect(app.issueDetailsPage.issueDetailsTab.title).toHaveText(
    'Details'
  );

  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.table.expectRowCount(1);
  await app.issueRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.map((f) => f.expectedColumnName)
  );
  await app.issueRegisterPage.table.expectRowToContain(1, {
    'New issue type (issue assessment)': issueAssessment.issueType,
    'New severity (issue assessment)': issueAssessment.severity,
    'New status (issue assessment)': issueAssessment.status,
    'New target close date (issue assessment)': '31 Dec 2024',
    'New certified individual (issue assessment)':
      issueAssessment.certifiedIndividual,
    'New regulatory breach (issue assessment)':
      issueAssessment.regulatoryBreach,
    'New departments (issue assessment)': '',
    'New policy breach (issue assessment)': issueAssessment.policyBreach,
    'New policies breached (issue assessment)':
      issueAssessment.policiesBreached,
    // Ui shows id, but should probaly be updated to show name
    'New policy owner (issue assessment)': users.riskManager.Id,
    'New policy owner commentary (issue assessment)':
      issueAssessment.policyOwnerCommentary,
    'New issue caused by system issue (issue assessment)':
      issueAssessment.issueCausedBySystemIssue,
    'New system responsible (issue assessment)':
      issueAssessment.systemResponsible,
    'New issue caused by third party (issue assessment)':
      issueAssessment.issueCausedByThirdParty,
    'New third party responsible (issue assessment)':
      issueAssessment.thirdPartyResponsible,
    'New reportable (issue assessment)': issueAssessment.reportable,
    'New rationale (issue assessment)': issueAssessment.rationale,
    'New actual close date (issue assessment)': '31 Dec 2025',
  });
});

test('Updated issue assessment field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');
  const issue = buildIssueFormValues({});
  await app.issueScenarios.createIssue(issue);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.issueAssessmentTab.selectTab();

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.formSettingsButton.openAndClickItem(
    'Edit form'
  );

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInCds?: boolean;
  }[] = [
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueType,
      newLabel: 'New issue type',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .severity,
      newLabel: 'New severity',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .status,
      newLabel: 'New status',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .targetCloseDate,
      newLabel: 'New target close date',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .certifiedIndividual,
      newLabel: 'New certified individual',
      notInCds: true,
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .regulatoryBreach,
      newLabel: 'New regulatory breach',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .departments,
      newLabel: 'New departments',
      notInCds: true,
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyBreach,
      newLabel: 'New policy breach',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policiesBreached,
      newLabel: 'New policies breached',
      notInCds: true,
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyOwner,
      newLabel: 'New policy owner',
      notInCds: true,
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .policyOwnerCommentary,
      newLabel: 'New policy owner commentary',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueCausedBySystemIssue,
      newLabel: 'New issue caused by system issue',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .systemResponsible,
      newLabel: 'New system responsible',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .issueCausedByThirdParty,
      newLabel: 'New issue caused by third party',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .thirdPartyResponsible,
      newLabel: 'New third party responsible',
      notInCds: true,
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .rationale,
      newLabel: 'New rationale',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .reportable,
      newLabel: 'New reportable',
    },
    {
      field:
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fields
          .actualCloseDate,
      newLabel: 'New actual close date',
    },
  ];
  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.saveFormConfigurationButton.click();
  const issueAssessment: Partial<IssueAssessmentFormFields> = {
    issueType: 'Near Miss',
    severity: 'Minimal',
    status: 'Closed',
    targetCloseDate: '2024-12-31',
    actualCloseDate: '2025-12-31',
    certifiedIndividual: 'RiskManager1',
    regulatoryBreach: 'Yes',
    issueCausedBySystemIssue: 'Yes',
    systemResponsible: 'System 1',
    policyBreach: 'Yes',
    policyOwner: 'RiskManager1',
    policyOwnerCommentary: 'Policy owner commentary',

    issueCausedByThirdParty: 'Yes',
    thirdPartyResponsible: 'Third Party 1',
    policiesBreached: 'Document A, Document B',
    rationale: 'Rationale for assessment',
    reportable: 'Yes',
  };
  await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
    issueAssessment
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Issue assessment data source',
    dataSource: {
      type: 'Issues',
      fields: fieldsToRename
        .filter((f) => !f.notInCds)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New issue type': issueAssessment.issueType,
    'New severity': issueAssessment.severity,
    'New status': issueAssessment.status,
    'New target close date': '31 Dec 2024',
    'New regulatory breach': issueAssessment.regulatoryBreach,
    'New policy breach': issueAssessment.policyBreach,
    // Ui shows id, but should probaly be updated to show name
    'New policy owner commentary': issueAssessment.policyOwnerCommentary,
    'New issue caused by system issue':
      issueAssessment.issueCausedBySystemIssue,
    'New system responsible': issueAssessment.systemResponsible,
    'New issue caused by third party': issueAssessment.issueCausedByThirdParty,
    'New reportable': issueAssessment.reportable,
    'New rationale': issueAssessment.rationale,
    'New actual close date': '31 Dec 2025',
  });
});
