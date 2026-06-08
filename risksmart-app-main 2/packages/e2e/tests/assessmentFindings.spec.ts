import { expect } from '@playwright/test';

import {
  insertScoringSettings,
  updateOrganisationFeatures,
  upsertAggregation,
} from '../apiClient';
import { test } from '../base';
import { RiskScoringModelEnum } from '../generated/graphql';
import { buildRiskRatingFindingFormValues } from '../testData/findingFormValuesBuilder';
import { buildScoringConfig } from '../testData/riskAssessmentResultConfig';

test.describe('Assessment Findings', () => {
  test.describe('Taxonomy Ratings', () => {
    test('Created finding shown in findings tab and findings register', async ({
      app,
      page,
    }) => {
      await page.goto('/');
      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const assessmentName = 'Assessment 1';
      await app.assessmentScenarios.createAssessment({
        title: assessmentName,
        summary: 'Assessment 1 summary text',
      });

      await app.assessmentFindingScenarios.createFindingFromAssessmentPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Likely',
          impact: 'Moderate',
          rating: 'Moderate',
          controlType: 'Inherent',
        })
      );
      await app.assessmentDetailsPage.findingsTab.table.expectRowCount(1);

      await expect(
        await app.assessmentDetailsPage.findingsTab.table.getBodyCell('Type', 1)
      ).toHaveText('Risk - Inherent');

      await app.assessmentFindingsRegisterPage.navigateToAndAssertTitle();
      await app.assessmentFindingsRegisterPage.table.expectRowCount(1);

      await app.assessmentFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.assessmentFindingsRegisterPage.table.getRowAsObject(1);
      expect(row).toEqual(
        expect.objectContaining({
          Title: assessmentName,
          Type: 'Risk - Inherent',
          'Assessed item': riskName,
          Likelihood: 'Likely',
          Impact: 'Moderate',
          Result: 'Moderate',
        })
      );
    });
  });

  test.describe('Scoring Settings', () => {
    test('Created finding shown in findings tab and findings register', async ({
      app,
      page,
    }) => {
      await upsertAggregation(RiskScoringModelEnum.Default);
      await insertScoringSettings(buildScoringConfig());
      await updateOrganisationFeatures(['scoring_settings_data']);
      await page.goto('/');

      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const assessmentName = 'Assessment 1';
      await app.assessmentScenarios.createAssessment({
        title: assessmentName,
        summary: 'Assessment 1 summary text',
      });

      await app.assessmentFindingScenarios.createFindingFromAssessmentPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Expected',
          impact: 'Significant',
          rating: 'Orange',
          controlType: 'Inherent',
        })
      );

      await app.assessmentDetailsPage.findingsTab.table.expectRowCount(1);

      await expect(
        await app.assessmentDetailsPage.findingsTab.table.getBodyCell('Type', 1)
      ).toHaveText('Risk - Inherent');

      await app.assessmentFindingsRegisterPage.navigateToAndAssertTitle();
      await app.assessmentFindingsRegisterPage.table.expectRowCount(1);

      await app.assessmentFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.assessmentFindingsRegisterPage.table.getRowAsObject(1);
      expect(row).toEqual(
        expect.objectContaining({
          Impact: 'Significant',
          Likelihood: 'Expected',
          Result: 'Orange',
        })
      );
    });
  });
});

test(`Creating an assessment action finding doesn't require optional attachments (see RSP-1801)`, async ({
  app,
  page,
}) => {
  await page.goto('/');

  const assessmentName = 'Assessment 1';
  await app.assessmentScenarios.createAssessment({
    title: assessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.findingsTab.selectTab();
  await app.assessmentDetailsPage.findingsTab.addButton.click();

  await app.findingPage.findingForm.fillFormAndClickSave({
    type: 'Action',
    title: '', // Omit required field to trigger validation
    description: 'Test Action Description',
    owners: ['RiskManager1'],
    status: 'Open',
    priority: 'Low',
    dateRaised: '2025-01-01',
    targetCloseDate: '2025-01-02',
  });

  const errors = await app.findingPage.findingForm.getErrors();
  expect(errors).toEqual({ title: 'Required' });
});
