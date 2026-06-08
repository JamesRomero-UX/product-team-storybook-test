import { expect } from '@playwright/test';

import {
  insertScoringSettings,
  refreshRiskScores,
  updateOrganisationFeatures,
  upsertAggregation,
} from '../apiClient';
import { test } from '../base';
import { RiskScoringModelEnum } from '../generated/graphql';
import { buildScoringConfig } from '../testData/riskAssessmentResultConfig';

test.describe('Risk Ratings', () => {
  test.describe('Taxonomy Ratings', () => {
    test.describe('CRUD', () => {
      test('Can add an inherent risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await page.goto('/');
        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Likely',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            'Assessment status': '',
            Impact: 'Low',
            Likelihood: 'Likely',
            'Linked assessment': '-',
            Rating: 'Low',
            'Rating date': '1 Jan 2021',
            'Result type': 'Inherent',
          }
        );
      });

      test('Can add a residual risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await page.goto('/');
        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Likely',
          resultDate: '2021-01-01',
          controlType: 'Residual',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            'Assessment status': '',
            Impact: 'Low',
            Likelihood: 'Likely',
            'Linked assessment': '-',
            Rating: 'Low',
            'Rating date': '1 Jan 2021',
            'Result type': 'Residual',
          }
        );
      });

      test('Can delete a risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await page.goto('/');
        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Likely',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            Impact: 'Low',
            Likelihood: 'Likely',
            Rating: 'Low',
            'Result type': 'Inherent',
          }
        );

        await app.riskDetailsPage.ratingsTab.riskRatingTable.checkRow(1);
        await app.riskDetailsPage.ratingsTab.deleteButton.click();
        await app.riskDetailsPage.ratingsTab.deleteModal.confirmButton.click();
        await app.riskDetailsPage.notificationBanner.expectNotification(
          'Finding deleted successfully'
        );
        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowCount(0);
      });
    });

    test.describe('Default Scoring Model', () => {
      test('Can see the latest scores in the risk register and risk details page', async ({
        page,
        app,
      }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await page.goto('/');
        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        // --- Add inherent and residual ratings ---

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Likely',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            'Assessment status': '',
            Impact: 'Low',
            Likelihood: 'Likely',
            'Linked assessment': '-',
            Rating: 'Low',
            'Rating date': '1 Jan 2021',
            'Result type': 'Inherent',
          }
        );

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Moderate',
          likelihood: 'Certain',
          resultDate: '2021-02-02',
          controlType: 'Residual',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            'Assessment status': '',
            Impact: 'Moderate',
            Likelihood: 'Certain',
            'Linked assessment': '-',
            Rating: 'High',
            'Rating date': '2 Feb 2021',
            'Result type': 'Residual',
          }
        );

        // --- Verify scores in risk register ---

        await refreshRiskScores();

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'ID',
          'Risk name',
          'Inherent score',
          'Inherent impact',
          'Inherent impact score',
          'Inherent likelihood',
          'Inherent likelihood score',
          'Inherent rating',

          'Residual score',
          'Residual impact',
          'Residual impact score',
          'Residual likelihood',
          'Residual likelihood score',
          'Residual rating',
        ]);
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          ID: 'R-1',

          'Inherent impact': 'Low', //2
          'Inherent likelihood': 'Likely', //3
          'Inherent impact score': '2.0',
          'Inherent likelihood score': '3.0',
          'Inherent rating': 'Low',
          'Inherent score': '6.0', // 2 * 3

          'Residual impact': 'Moderate', // 3
          'Residual impact score': '3.0',
          'Residual likelihood': 'Certain', //5
          'Residual likelihood score': '5.0',
          'Residual rating': 'High',
          'Residual score': '15.0', // 3 & 5
        });

        // --- Verify scores on risk details page ---

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'ID',
          columnValue: 'R-1',
        });
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.inherentRating.container
        ).toBeVisible();
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.inherentRating.title
        ).toHaveText('Inherent');
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.inherentRating.resultDate
        ).toHaveText('1 Jan 2021');
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.inherentRating.rating
        ).toHaveText('Low');

        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.residualRating.title
        ).toHaveText('Residual');
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.residualRating.resultDate
        ).toHaveText('2 Feb 2021');
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.residualRating.rating
        ).toHaveText('High');
      });
    });

    test.describe('Control Effectiveness Averages Model', () => {
      test('Can see the latest scores in the risk register', async ({
        page,
        app,
      }) => {
        test.slow();
        await upsertAggregation(
          RiskScoringModelEnum.ControlEffectivenessAverages
        );
        await page.goto('/');

        const risk1Title = 'Risk 1';
        const risk21Title = 'Risk 2/1';
        const risk22Title = 'Risk 2/2';
        const risk31Title = 'Risk 3/1';
        const risk32Title = 'Risk 3/2';
        const risk33Title = 'Risk 3/3';

        const control31Title = 'Control 3/1';
        const control32Title = 'Control 3/2';
        const control33Title = 'Control 3/3';

        // --- Create risk hierarchy with inherent ratings ---
        // Tier 1: Risk 1
        // ├── Tier 2: Risk 2/1 (direct rating: Low×Unlikely, overridden by aggregation)
        // │   ├── Tier 3: Risk 3/1 (Moderate×Very Likely = 12.0)
        // │   └── Tier 3: Risk 3/2 (Low×Unlikely = 4.0)
        // └── Tier 2: Risk 2/2
        //     └── Tier 3: Risk 3/3 (High×Certain = 20.0)

        await app.riskScenarios.createRisk({
          riskName: risk1Title,
          description: 'Risk 1 description',
          tier: 'Tier 1',
        });

        await app.riskScenarios.createRisk({
          riskName: risk21Title,
          description: 'Risk 2/1 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Unlikely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk22Title,
          description: 'Risk 2/2 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskScenarios.createRisk({
          riskName: risk31Title,
          description: 'Risk 3/1 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Moderate',
          likelihood: 'Very Likely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk32Title,
          description: 'Risk 3/2 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Unlikely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk33Title,
          description: 'Risk 3/3 description',
          tier: 'Tier 3',
          parentRiskTitle: risk22Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'High',
          likelihood: 'Certain',
          resultDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify inherent scores aggregate across tiers ---

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Inherent score',
          'Inherent rating',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Inherent rating': 'Moderate',
          'Inherent score': '12.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Inherent rating': 'Low',
          'Inherent score': '4.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Inherent rating': 'High',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 2 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Inherent rating': 'Moderate',
          'Inherent score': '8.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Inherent rating': 'High',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 1 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Inherent rating': 'High',
          'Inherent score': '14.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // --- Add controls with test results to Tier 3 risks ---

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk31Title,
          clearExistingRegisterFilters: false,
        });

        await app.controlScenarios.createControlFromRiskDetails({
          title: control31Title,
          description: 'Control 3/1',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control31Title
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '1st line',
          title: 'Test result',
          testResult: 'Mostly effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk32Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control32Title,
          description: 'Control 3/2',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control32Title,
          true
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '2nd line',
          title: 'Test result',
          testResult: 'Moderately effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk33Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control33Title,
          description: 'Control 3/3',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control33Title,
          true
        );

        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '3rd line',
          title: 'Test result',
          testResult: 'Partially effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify residual scores aggregate across tiers ---

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Residual rating': 'Low',
          'Residual score': '2.4',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Residual rating': 'Minimal',
          'Residual score': '1.8',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Residual rating': 'High',
          'Residual score': '15.0',
        });

        // Tier 2 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Residual rating': 'Low',
          'Residual score': '2.1',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Residual rating': 'High',
          'Residual score': '15.0',
        });

        // Tier 1 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Residual rating': 'Moderate',
          'Residual score': '8.6',
        });
      });
    });

    test.describe('TCEA Model', () => {
      test('Can see the latest scores in the risk register', async ({
        page,
        app,
      }) => {
        test.slow();
        await upsertAggregation(
          RiskScoringModelEnum.TypedControlEffectivenessAverages
        );
        await page.goto('/');

        const risk1Title = 'Risk 1';
        const risk21Title = 'Risk 2/1';
        const risk22Title = 'Risk 2/2';
        const risk31Title = 'Risk 3/1';
        const risk32Title = 'Risk 3/2';
        const risk33Title = 'Risk 3/3';

        const control31Title = 'Control 3/1';
        const control32Title = 'Control 3/2';
        const control33Title = 'Control 3/3';

        // --- Create risk hierarchy with inherent ratings ---
        // Tier 1: Risk 1
        // ├── Tier 2: Risk 2/1 (direct rating: Low×Unlikely, overridden by aggregation)
        // │   ├── Tier 3: Risk 3/1 (Moderate×Very Likely = 12.0)
        // │   └── Tier 3: Risk 3/2 (Low×Unlikely = 4.0)
        // └── Tier 2: Risk 2/2
        //     └── Tier 3: Risk 3/3 (High×Certain = 20.0)

        await app.riskScenarios.createRisk({
          riskName: risk1Title,
          description: 'Risk 1 description',
          tier: 'Tier 1',
        });

        await app.riskScenarios.createRisk({
          riskName: risk21Title,
          description: 'Risk 2/1 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Unlikely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk22Title,
          description: 'Risk 2/2 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskScenarios.createRisk({
          riskName: risk31Title,
          description: 'Risk 3/1 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Moderate',
          likelihood: 'Very Likely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk32Title,
          description: 'Risk 3/2 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Low',
          likelihood: 'Unlikely',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk33Title,
          description: 'Risk 3/3 description',
          tier: 'Tier 3',
          parentRiskTitle: risk22Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'High',
          likelihood: 'Certain',
          resultDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify inherent scores aggregate across tiers ---
        // Inherent scores are identical to CEA (same input data, same aggregation)

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Inherent score',
          'Inherent rating',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Inherent rating': 'Moderate',
          'Inherent score': '12.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Inherent rating': 'Low',
          'Inherent score': '4.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Inherent rating': 'High',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 2 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Inherent rating': 'Moderate',
          'Inherent score': '8.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Inherent rating': 'High',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 1 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Inherent rating': 'High',
          'Inherent score': '14.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // --- Add controls with test results to Tier 3 risks ---
        // Each risk gets one Directive control with a different test type and effectiveness.
        // TCEA computes residual via per-type L/I mitigation (not direct score multiplication).

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk31Title,
          clearExistingRegisterFilters: false,
        });

        await app.controlScenarios.createControlFromRiskDetails({
          title: control31Title,
          description: 'Control 3/1',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control31Title
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '1st line',
          title: 'Test result',
          testResult: 'Mostly effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk32Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control32Title,
          description: 'Control 3/2',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control32Title,
          true
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '2nd line',
          title: 'Test result',
          testResult: 'Moderately effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk33Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control33Title,
          description: 'Control 3/3',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control33Title,
          true
        );

        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '3rd line',
          title: 'Test result',
          testResult: 'Partially effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify residual scores aggregate across tiers ---
        // TCEA residual differs from CEA: uses L/I mitigation per control type,
        // so residual L/I are derived from inherent L/I × mitigation multiplier.

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Residual rating': 'Minimal',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Residual rating': 'Minimal',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Residual rating': 'Moderate',
          'Residual score': '12.0',
        });

        // Tier 2 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Residual rating': 'Minimal',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Residual rating': 'Moderate',
          'Residual score': '12.0',
        });

        // Tier 1 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Residual rating': 'Low',
          'Residual score': '6.5',
        });
      });
    });
  });

  test.describe('Scoring Settings', () => {
    test.describe('CRUD', () => {
      test('Can add an inherent risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await insertScoringSettings(buildScoringConfig());
        await updateOrganisationFeatures(['scoring_settings_data']);
        await page.goto('/');

        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Significant',
          likelihood: 'Expected',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            Impact: 'Significant',
            Likelihood: 'Expected',
            Rating: 'Orange',
            'Result type': 'Inherent',
          }
        );
      });

      test('Can add a residual risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await insertScoringSettings(buildScoringConfig());
        await updateOrganisationFeatures(['scoring_settings_data']);
        await page.goto('/');

        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Marginal',
          likelihood: 'Doubtful',
          resultDate: '2021-01-01',
          controlType: 'Residual',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            Impact: 'Marginal',
            Likelihood: 'Doubtful',
            Rating: 'Yellow',
            'Result type': 'Residual',
          }
        );
      });

      test('Can delete a risk rating', async ({ page, app }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await insertScoringSettings(buildScoringConfig());
        await updateOrganisationFeatures(['scoring_settings_data']);
        await page.goto('/');

        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Significant',
          likelihood: 'Expected',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(
          1,
          {
            Impact: 'Significant',
            Likelihood: 'Expected',
            Rating: 'Orange',
            'Result type': 'Inherent',
          }
        );

        await app.riskDetailsPage.ratingsTab.riskRatingTable.checkRow(1);
        await app.riskDetailsPage.ratingsTab.deleteButton.click();
        await app.riskDetailsPage.ratingsTab.deleteModal.confirmButton.click();
        await app.riskDetailsPage.notificationBanner.expectNotification(
          'Finding deleted successfully'
        );
        await app.riskDetailsPage.ratingsTab.riskRatingTable.expectRowCount(0);
      });
    });

    test.describe('Default Scoring Model', () => {
      test('Can see the latest scores in the risk register and risk details page', async ({
        page,
        app,
      }) => {
        await upsertAggregation(RiskScoringModelEnum.Default);
        await insertScoringSettings(buildScoringConfig());
        await updateOrganisationFeatures(['scoring_settings_data']);
        await page.goto('/');

        await app.riskScenarios.createRisk({
          riskName: 'Risk 1',
          description: 'Risk 1 description',
        });

        // --- Add inherent and residual ratings ---

        // Inherent: Expected(4) × Significant(3) → Orange (score 12)
        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Significant',
          likelihood: 'Expected',
          resultDate: '2021-01-01',
          controlType: 'Inherent',
        });

        // Residual: Inevitable(5) × Catastrophic(5) → Red (score 25)
        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Catastrophic',
          likelihood: 'Inevitable',
          resultDate: '2021-02-02',
          controlType: 'Residual',
        });

        // --- Verify scores in risk register ---

        await refreshRiskScores();

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'ID',
          'Risk name',
          'Inherent score',
          'Inherent impact',
          'Inherent likelihood',
          'Inherent rating',
          'Residual score',
          'Residual impact',
          'Residual likelihood',
          'Residual rating',
        ]);
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Inherent impact': 'Significant',
          'Inherent likelihood': 'Expected',
          'Inherent rating': 'Orange',
          'Inherent score': '12.0',
          'Residual impact': 'Catastrophic',
          'Residual likelihood': 'Inevitable',
          'Residual rating': 'Red',
          'Residual score': '25.0',
        });

        // --- Verify scores on risk details page ---

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'ID',
          columnValue: 'R-1',
        });

        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.inherentRating.rating
        ).toHaveText('Orange');
        await expect(
          app.riskDetailsPage.detailsTab.riskRatings.residualRating.rating
        ).toHaveText('Red');
      });
    });

    test.describe('TCEA Model', () => {
      test('Can see the latest scores in the risk register', async ({
        page,
        app,
      }) => {
        test.slow();
        await upsertAggregation(
          RiskScoringModelEnum.TypedControlEffectivenessAverages
        );
        await insertScoringSettings(buildScoringConfig());
        await updateOrganisationFeatures(['scoring_settings_data']);
        await page.goto('/');

        const risk1Title = 'Risk 1';
        const risk21Title = 'Risk 2/1';
        const risk22Title = 'Risk 2/2';
        const risk31Title = 'Risk 3/1';
        const risk32Title = 'Risk 3/2';
        const risk33Title = 'Risk 3/3';

        const control31Title = 'Control 3/1';
        const control32Title = 'Control 3/2';
        const control33Title = 'Control 3/3';

        // --- Create risk hierarchy with inherent ratings ---
        // Same hierarchy as taxonomy TCEA, but using scoring settings labels.
        // Tier 1: Risk 1
        // ├── Tier 2: Risk 2/1 (direct rating: Marginal×Doubtful, overridden by aggregation)
        // │   ├── Tier 3: Risk 3/1 (Significant×Expected = 12.0)
        // │   └── Tier 3: Risk 3/2 (Marginal×Doubtful = 4.0)
        // └── Tier 2: Risk 2/2
        //     └── Tier 3: Risk 3/3 (Serious×Inevitable = 20.0)

        await app.riskScenarios.createRisk({
          riskName: risk1Title,
          description: 'Risk 1 description',
          tier: 'Tier 1',
        });

        await app.riskScenarios.createRisk({
          riskName: risk21Title,
          description: 'Risk 2/1 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Marginal',
          likelihood: 'Doubtful',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk22Title,
          description: 'Risk 2/2 description',
          tier: 'Tier 2',
          parentRiskTitle: risk1Title,
        });

        await app.riskScenarios.createRisk({
          riskName: risk31Title,
          description: 'Risk 3/1 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Significant',
          likelihood: 'Expected',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk32Title,
          description: 'Risk 3/2 description',
          tier: 'Tier 3',
          parentRiskTitle: risk21Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Marginal',
          likelihood: 'Doubtful',
          resultDate: '2024-01-01',
        });

        await app.riskScenarios.createRisk({
          riskName: risk33Title,
          description: 'Risk 3/3 description',
          tier: 'Tier 3',
          parentRiskTitle: risk22Title,
        });

        await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
          impact: 'Serious',
          likelihood: 'Inevitable',
          resultDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify inherent scores aggregate across tiers ---

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Inherent score',
          'Inherent rating',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Inherent rating': 'Orange',
          'Inherent score': '12.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Inherent rating': 'Yellow',
          'Inherent score': '4.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Inherent rating': 'Red',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 2 (averaged L/I from children, looked up in scoring settings matrix)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Inherent rating': 'Orange',
          'Inherent score': '8.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Inherent rating': 'Red',
          'Inherent score': '20.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // Tier 1 (averaged L/I from children, looked up in scoring settings matrix)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Inherent rating': 'Red',
          'Inherent score': '14.0',
          'Residual rating': 'Unrated',
          'Residual score': 'Unrated',
        });

        // --- Add controls with test results to Tier 3 risks ---
        // Each risk gets one Directive control with a different test type and effectiveness.
        // TCEA computes residual via per-type L/I mitigation (not direct score multiplication).

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk31Title,
          clearExistingRegisterFilters: false,
        });

        await app.controlScenarios.createControlFromRiskDetails({
          title: control31Title,
          description: 'Control 3/1',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control31Title
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '1st line',
          title: 'Test result',
          testResult: 'Mostly effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk32Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control32Title,
          description: 'Control 3/2',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control32Title,
          true
        );
        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '2nd line',
          title: 'Test result',
          testResult: 'Moderately effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await app.riskScenarios.navigateToRiskDetailsByRegisterColumnName({
          columnName: 'Risk name',
          columnValue: risk33Title,
          clearExistingRegisterFilters: true,
        });
        await app.controlScenarios.createControlFromRiskDetails({
          title: control33Title,
          description: 'Control 3/3',
          owners: ['RiskManager1'],
          type: 'Directive',
        });
        await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
          'Title',
          control33Title,
          true
        );

        await app.testResultScenarios.createTestResultFromControlDetails({
          testType: '3rd line',
          title: 'Test result',
          testResult: 'Partially effective',
          controlTestDetails: 'Test result details',
          performedBy: 'RiskManager1',
          testDate: '2024-01-01',
        });

        await refreshRiskScores();

        // --- Verify residual scores aggregate across tiers ---
        // TCEA residual uses L/I mitigation, so residual L/I are looked up
        // in the scoring settings matrix to determine the rating label.

        await app.riskRegisterPage.navigateToAndAssertTitle();
        await app.riskRegisterPage.table.toggleVisibleColumns([
          'Risk name',
          'Residual score',
          'Residual rating',
        ]);

        // Tier 3
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk31Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk31Title,
          'Residual rating': 'Green',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk32Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk32Title,
          'Residual rating': 'Green',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk33Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk33Title,
          'Residual rating': 'Orange',
          'Residual score': '12.0',
        });

        // Tier 2 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk21Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk21Title,
          'Residual rating': 'Green',
          'Residual score': '1.0',
        });
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk22Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk22Title,
          'Residual rating': 'Orange',
          'Residual score': '12.0',
        });

        // Tier 1 (averaged from children)
        await app.riskRegisterPage.table.clearFiltersButton.click();
        await app.riskRegisterPage.table.setFilterInputByNameAndValue(
          'Risk name',
          risk1Title
        );
        await app.riskRegisterPage.table.expectRowCount(1);
        await app.riskRegisterPage.table.expectRowToContain(1, {
          'Risk name': risk1Title,
          'Residual rating': 'Yellow',
          'Residual score': '6.5',
        });
      });
    });
  });
});
