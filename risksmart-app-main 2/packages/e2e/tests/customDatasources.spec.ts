import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import {
  getDocumentFileByDocumentTitle,
  insertAttestationRecords,
} from '../apiClient';
import { test } from '../base';
import { AttestationRecordStatusEnum } from '../generated/graphql';
import { buildRiskRatingFindingFormValues } from '../testData/findingFormValuesBuilder';
import { buildTestResultFormValues } from '../testData/testResultFormValuesBuilder';
import { users } from '../users';

[users.standard].forEach((user) => {
  test.describe(`Receive access denied when attempting to view custom datasources page`, () => {
    // set failOnJSError=false, as access denied is currently logged to console.
    test.use({ user, failOnJSError: false });

    test(user.role, async ({ page }) => {
      await updateOrganisationFeatures(['multi_reporting']);
      await page.goto('/custom-datasources');
      const heading = page.getByRole('heading');
      await expect(heading).toHaveText('Access denied');
    });
  });
});

test(`Can create a custom data source`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.customDatasourceScenarios.createCustomDatasource({
    title: 'My data source',
    dataSource: { type: 'Risks', fields: [{ defaultLabel: 'Risk name' }] },
  });

  await app.customDatasourcesPage.table.expectRowToContain(1, {
    Title: 'My data source',
  });
});

test(`Displays "Not found" page when navigating to custom datasource that does not exist`, async ({
  page,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/custom-datasources/65f135cb-90bd-49a2-8554-dbab42799229');

  await expect(
    page.getByText('Go manage risk with confid- wait, what?')
  ).toBeVisible();
});

test(`Can update custom data source`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const datasourceTitle = 'My data source';
  await app.customDatasourceScenarios.createCustomDatasource({
    title: datasourceTitle,
    dataSource: { type: 'Risks', fields: [{ defaultLabel: 'Risk name' }] },
  });
  await app.customDatasourcesPage.table.expectRowToContain(1, {
    Title: datasourceTitle,
  });
  await app.customDatasourcesPage.table.clickCellLink('Title', 1);
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    datasourceTitle
  );

  await app.customDatasourceDetailsPage.editButton.click();

  await app.customDatasourceUpdatePage.form.fillFormAndClickSave({
    title: 'New title',
  });

  await app.customDatasourceUpdatePage.notificationBanner.expectNotification(
    'Datasource updated successfully'
  );
  await expect(app.customDatasourcesPage.header.title).toHaveText(
    'Custom Datasources'
  );
  await app.customDatasourcesPage.table.expectRowCount(1);
  await app.customDatasourcesPage.table.expectRowToContain(1, {
    Title: 'New title',
  });
});

test(`Delete a custom data source`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');
  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );
  const datasourceTitle = 'My data source';
  await app.customDatasourceUpdatePage.form.fillFormAndClickSave({
    title: datasourceTitle,
    dataSource: { type: 'Risks', fields: [{ defaultLabel: 'Risk name' }] },
  });

  await app.customDatasourceUpdatePage.notificationBanner.expectNotification(
    'Datasource added successfully'
  );
  await expect(app.customDatasourcesPage.header.title).toHaveText(
    'Custom Datasources'
  );
  await app.customDatasourcesPage.table.expectRowCount(1);
  await app.customDatasourcesPage.table.expectRowToContain(1, {
    Title: datasourceTitle,
  });
  await app.customDatasourcesPage.table.clickCellLink('Title', 1);
  await expect(app.customDatasourceDetailsPage.header.title).toHaveText(
    datasourceTitle
  );
  await app.customDatasourceDetailsPage.editButton.click();

  await app.customDatasourceUpdatePage.deleteButton.click();
  await app.customDatasourceUpdatePage.deleteModal.confirmButton.click();
  await app.customDatasourceUpdatePage.notificationBanner.expectNotification(
    'Datasource deleted successfully'
  );
  await expect(app.customDatasourcesPage.header.title).toHaveText(
    'Custom Datasources'
  );
  await app.customDatasourcesPage.table.expectRowCount(0);
});

test(`Can preview a table of risks`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: { type: 'Risks', fields: [{ defaultLabel: 'Risk name' }] },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
  });
});

test('Can view test results for a controls (including controls without test results)', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.controlScenarios.createControlFromRiskDetails({
    title: 'Control 1',
    description: 'Control 1 description',
    owners: ['RiskManager1'],
  });
  await app.controlScenarios.createControlFromRiskDetails({
    title: 'Control 2',
    description: 'Control 2 description',
    owners: ['RiskManager1'],
  });
  await app.riskDetailsPage.controlsTab.table.clickCellLink('Title', 1);
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 1',
      testDate: '2023-01-01',
    })
  );
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 2',
      testDate: '2023-01-02',
    })
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Controls',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        {
          type: 'Test Results (child)',
          fields: [{ defaultLabel: 'Title' }],
          leftJoin: true,
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(3);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-1',
    Title: 'Test Result 1',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-1',
    Title: 'Test Result 2',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-2',
    Title: '',
  });
});

test('Can view test results for a controls', async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.controlScenarios.createControlFromRiskDetails({
    title: 'Control 1',
    description: 'Control 1 description',
    owners: ['RiskManager1'],
  });
  await app.riskDetailsPage.controlsTab.table.clickCellLink('Title', 1);
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 1',
      testDate: '2023-01-01',
    })
  );
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 2',
      testDate: '2023-01-02',
    })
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Controls',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        { type: 'Test Results (child)', fields: [{ defaultLabel: 'Title' }] },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(2);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-1',
    Title: 'Test Result 1',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-1',
    Title: 'Test Result 2',
  });
});

test('Can view latest test results for a controls', async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.controlScenarios.createControlFromRiskDetails({
    title: 'Control 1',
    description: 'Control 1 description',
    owners: ['RiskManager1'],
  });
  await app.riskDetailsPage.controlsTab.table.clickCellLink('Title', 1);
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 1',
      testDate: '2023-01-01',
    })
  );
  await app.testResultScenarios.createTestResultFromControlDetails(
    buildTestResultFormValues({
      title: 'Test Result 2',
      testDate: '2023-01-02',
    })
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Controls',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        {
          type: 'Test Results (child)',
          fields: [{ defaultLabel: 'Title' }],
          latestOnly: true,
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'C-1',
    Title: 'Test Result 2',
  });
});

test('Latest only option not available for test results without a parent', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Test Results',
    },
  });
  const latestOnlyCheckboxVisible = await app.customDatasourceUpdatePage.form
    .getLatestOnlyCheckbox()
    .isVisible();
  expect(latestOnlyCheckboxVisible).toBe(false);
});

test('Can rename fields', async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Risks',
      fields: [{ defaultLabel: 'ID', customLabel: 'Custom ID' }],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'Custom ID': 'R-1',
  });
});

test('Can view risk assessment results for risks (including risks without risk assessment results)', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Critical',
    resultDate: '2021-02-03',
    controlType: 'Inherent',
  });
  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Low',
    resultDate: '2021-03-03',
    controlType: 'Residual',
  });

  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Risks',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        {
          type: 'Risk assessment results (child)',
          fields: [{ defaultLabel: 'Result type' }],
          leftJoin: true,
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(3);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'R-1',
    'Result type': 'Inherent',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'R-1',
    'Result type': 'Residual',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'R-2',
    'Result type': '',
  });
});

test('Can view the latest risk assessment results (both residual and inherent) for risks', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Critical',
    resultDate: '2021-02-03',
    controlType: 'Inherent',
  });
  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Critical',
    resultDate: '2021-02-09',
    controlType: 'Inherent',
  });
  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Low',
    resultDate: '2021-03-03',
    controlType: 'Residual',
  });
  await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'Low',
    resultDate: '2021-04-03',
    controlType: 'Residual',
  });

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Risks',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        {
          type: 'Risk assessment results (child)',
          fields: [
            { defaultLabel: 'Result type' },
            { defaultLabel: 'Result date' },
          ],
          latestOnly: true,
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(2);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'R-1',
    'Result type': 'Residual',
    'Result date': '3 Apr 2021',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'R-1',
    'Result type': 'Inherent',
    'Result date': '9 Feb 2021',
  });
});

test('Can view the latest residual and inherent risk assessment results for each risk within an assessment', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });

  await app.assessmentScenarios.createAssessment({
    title: 'Assessment 1',
    summary: 'Assessment 1 summary',
  });

  await app.assessmentFindingScenarios.createFindingFromAssessmentPage(
    buildRiskRatingFindingFormValues({
      resultDate: '2021-02-03',
      controlType: 'Inherent',
      risks: ['Risk 1', 'Risk 2'],
    })
  );
  await app.assessmentFindingScenarios.createFindingFromAssessmentPage(
    buildRiskRatingFindingFormValues({
      resultDate: '2021-03-03',
      controlType: 'Residual',
      risks: ['Risk 1', 'Risk 2'],
    })
  );
  // Two residual ratings per risk to show latest filtering works
  await app.assessmentFindingScenarios.createFindingFromAssessmentPage(
    buildRiskRatingFindingFormValues({
      resultDate: '2021-04-03',
      controlType: 'Residual',
      risks: ['Risk 1', 'Risk 2'],
    })
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'My data source',
    dataSource: {
      type: 'Assessments',
      fields: [{ defaultLabel: 'ID' }],
      children: [
        {
          type: 'Risk assessment results (child)',
          latestOnly: true,
          fields: [
            { defaultLabel: 'Result type' },
            { defaultLabel: 'Result date' },
          ],
          children: [
            {
              type: 'Risks (parent)',
              fields: [{ defaultLabel: 'Risk name' }],
            },
          ],
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(4);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'ASMT-1',
    'Result type': 'Residual',
    'Result date': '3 Apr 2021',
    'Risk name': 'Risk 1',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'ASMT-1',
    'Result type': 'Inherent',
    'Result date': '3 Feb 2021',
    'Risk name': 'Risk 1',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'ASMT-1',
    'Result type': 'Residual',
    'Result date': '3 Apr 2021',
    'Risk name': 'Risk 2',
  });
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    ID: 'ASMT-1',
    'Result type': 'Inherent',
    'Result date': '3 Feb 2021',
    'Risk name': 'Risk 2',
  });
});

test('Can view document version, document details and attestations', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures([
    'multi_reporting',
    'attestations',
    'policy',
  ]);
  await page.goto('/');

  const newDocumentTitle = 'Attestation Document';
  await app.policyScenarios.createDocument({
    title: newDocumentTitle,
    purpose: 'Attestation document description',
    type: 'Policy',
    owners: ['RiskManager1'],
  });

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();
  await app.documentVersionPage.detailsTab.form.fillFormAndClickSave({
    versionNumber: '1.0',
    summary: 'Summary 1',
    type: 'Link',
    link: 'http://www.google.com',
  });
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );

  // Manually create an attestation record as events not supported in e2e tests
  const documentFile = await getDocumentFileByDocumentTitle(newDocumentTitle);
  await insertAttestationRecords([
    {
      UserId: users.riskManager.Id,
      AttestationStatus: AttestationRecordStatusEnum.Pending,
      NodeId: documentFile.Id,
    },
  ]);

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Attestations data source',
    dataSource: {
      type: 'Attestations',
      fields: [
        { defaultLabel: 'User' },
        { defaultLabel: 'Attestation status' },
      ],
      children: [
        {
          type: 'Document versions (parent)',
          fields: [
            { defaultLabel: 'Version number' },
            { defaultLabel: 'Link' },
            { defaultLabel: 'Guid', customLabel: 'Version Guid' },
          ],
          children: [
            {
              type: 'Documents (parent)',
              fields: [
                { defaultLabel: 'Title' },
                { defaultLabel: 'Guid', customLabel: 'Document Guid' },
              ],
            },
          ],
        },
      ],
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    'Attestation status': 'Pending',
    User: 'RiskManager1',
    'Version number': '1.0',
    Link: 'http://www.google.com',
    'Version Guid': documentFile.Id,
    'Document Guid': documentFile.parent?.Id,
    Title: newDocumentTitle,
  });
});
