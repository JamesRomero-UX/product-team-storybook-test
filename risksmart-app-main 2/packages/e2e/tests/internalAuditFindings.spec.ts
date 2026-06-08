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

test.describe('Internal Audit Findings', () => {
  test.setTimeout(120_000);

  test.describe('Taxonomy Ratings', () => {
    test('Created finding shown in findings tab and findings register', async ({
      app,
      page,
    }) => {
      await updateOrganisationFeatures(['internal_audit']);
      await page.goto('/');

      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const reportName = 'Internal Audit Report 1';
      await app.internalAuditScenarios.navigateToAddReportPage();
      await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
        {
          title: reportName,
          summary: 'Internal audit report summary',
        }
      );
      await app.addInternalAuditReportPage.notificationBanner.expectNotification(
        'Report added successfully'
      );

      await app.internalAuditFindingScenarios.createFindingFromInternalAuditReportPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Likely',
          impact: 'Moderate',
          rating: 'Moderate',
          controlType: 'Inherent',
        })
      );

      await app.internalAuditReportDetailsPage.findingsTab.table.expectRowCount(
        1
      );
      await expect(
        await app.internalAuditReportDetailsPage.findingsTab.table.getBodyCell(
          'Type',
          1
        )
      ).toHaveText('Risk - Inherent');

      await app.internalAuditFindingsRegisterPage.navigateToAndAssertTitle();
      await app.internalAuditFindingsRegisterPage.table.expectRowCount(1);

      await app.internalAuditFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.internalAuditFindingsRegisterPage.table.getRowAsObject(1);
      expect(row).toEqual(
        expect.objectContaining({
          Title: reportName,
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
        'internal_audit',
        'scoring_settings_data',
      ]);
      await page.goto('/');

      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      const reportName = 'Internal Audit Report 1';
      await app.internalAuditScenarios.navigateToAddReportPage();
      await app.addInternalAuditReportPage.internalAuditReportForm.fillFormAndClickSave(
        {
          title: reportName,
          summary: 'Internal audit report summary',
        }
      );
      await app.addInternalAuditReportPage.notificationBanner.expectNotification(
        'Report added successfully'
      );

      await app.internalAuditFindingScenarios.createFindingFromInternalAuditReportPage(
        buildRiskRatingFindingFormValues({
          risks: [riskName],
          likelihood: 'Expected',
          impact: 'Significant',
          rating: 'Orange',
          controlType: 'Inherent',
        })
      );

      await app.internalAuditReportDetailsPage.findingsTab.table.expectRowCount(
        1
      );
      await expect(
        await app.internalAuditReportDetailsPage.findingsTab.table.getBodyCell(
          'Type',
          1
        )
      ).toHaveText('Risk - Inherent');

      await app.internalAuditFindingsRegisterPage.navigateToAndAssertTitle();
      await app.internalAuditFindingsRegisterPage.table.expectRowCount(1);

      await app.internalAuditFindingsRegisterPage.table.toggleAllColumnsToBeVisible();

      const row =
        await app.internalAuditFindingsRegisterPage.table.getRowAsObject(1);
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
