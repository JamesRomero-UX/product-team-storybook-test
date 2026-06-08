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

test.describe('Compliance Monitoring Findings', () => {
  test.setTimeout(120_000);

  test.describe('Taxonomy Ratings', () => {
    test('Created finding shown in findings tab and findings register', async ({
      app,
      page,
    }) => {
      await updateOrganisationFeatures(['compliance', 'compliance_monitoring']);
      await page.goto('/');

      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const assessmentName = 'Compliance Assessment 1';
      await app.complianceAssessmentRegisterPage.navigateTo();
      await app.complianceAssessmentRegisterPage.addButton.click();
      await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
        {
          title: assessmentName,
          summary: 'Compliance assessment summary',
        }
      );
      await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
        'Monitoring assessment added successfully'
      );

      await app.complianceAssessmentFindingScenarios.createFindingFromComplianceAssessmentPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Likely',
          impact: 'Moderate',
          rating: 'Moderate',
          controlType: 'Inherent',
        })
      );

      await app.complianceAssessmentDetailsPage.findingsTab.table.expectRowCount(
        1
      );
      await expect(
        await app.complianceAssessmentDetailsPage.findingsTab.table.getBodyCell(
          'Type',
          1
        )
      ).toHaveText('Risk - Inherent');

      await app.complianceMonitoringFindingsRegisterPage.navigateToAndAssertTitle();
      await app.complianceMonitoringFindingsRegisterPage.table.expectRowCount(
        1
      );

      await app.complianceMonitoringFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.complianceMonitoringFindingsRegisterPage.table.getRowAsObject(
          1
        );
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
      await updateOrganisationFeatures([
        'compliance',
        'compliance_monitoring',
        'scoring_settings_data',
      ]);
      await page.goto('/');

      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const assessmentName = 'Compliance Assessment 1';
      await app.complianceAssessmentRegisterPage.navigateTo();
      await app.complianceAssessmentRegisterPage.addButton.click();
      await app.addComplianceAssessmentPage.complianceAssessmentForm.fillFormAndClickSave(
        {
          title: assessmentName,
          summary: 'Compliance assessment summary',
        }
      );
      await app.addComplianceAssessmentPage.notificationBanner.expectNotification(
        'Monitoring assessment added successfully'
      );

      await app.complianceAssessmentFindingScenarios.createFindingFromComplianceAssessmentPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Expected',
          impact: 'Significant',
          rating: 'Orange',
          controlType: 'Inherent',
        })
      );

      await app.complianceAssessmentDetailsPage.findingsTab.table.expectRowCount(
        1
      );
      await expect(
        await app.complianceAssessmentDetailsPage.findingsTab.table.getBodyCell(
          'Type',
          1
        )
      ).toHaveText('Risk - Inherent');

      await app.complianceMonitoringFindingsRegisterPage.navigateToAndAssertTitle();
      await app.complianceMonitoringFindingsRegisterPage.table.expectRowCount(
        1
      );

      await app.complianceMonitoringFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.complianceMonitoringFindingsRegisterPage.table.getRowAsObject(
          1
        );
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
