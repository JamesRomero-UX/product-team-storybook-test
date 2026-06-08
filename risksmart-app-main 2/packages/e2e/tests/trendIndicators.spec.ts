import { expect } from '@playwright/test';

import { refreshRiskScores, upsertAggregation } from '../apiClient';
import { test } from '../base';
import { RiskScoringModelEnum } from '../generated/graphql';

test.describe('Risk rating trend columns', () => {
  test('should display inherent rating trend in the risk register after multiple ratings', async ({
    page,
    app,
  }) => {
    await upsertAggregation(RiskScoringModelEnum.Default);
    await page.goto('/');

    // Create a risk
    await app.riskScenarios.createRisk({
      riskName: 'Trend Test Risk',
      description: 'Risk to test trend indicators',
    });

    // Create first inherent rating (higher)
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'High',
      likelihood: 'Certain',
      resultDate: '2024-01-01',
      controlType: 'Inherent',
    });

    // Create second inherent rating (lower) - should result in "Decreased" trend
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'Low',
      likelihood: 'Unlikely',
      resultDate: '2024-02-01',
      controlType: 'Inherent',
    });

    // Refresh scores to compute trends
    await refreshRiskScores();

    // Navigate to risk register and verify trend column
    await page.goto('/risks');
    await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register');
    await app.riskRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Risk name',
      'Inherent rating',
      'Inherent risk rating trend',
    ]);

    await app.riskRegisterPage.table.expectRowCount(1);
    await app.riskRegisterPage.table.expectRowToContain(1, {
      'Risk name': 'Trend Test Risk',
      'Inherent rating': 'Low',
      'Inherent risk rating trend': 'Decreased',
    });
  });

  test('should display residual rating trend in the risk register after multiple ratings', async ({
    page,
    app,
  }) => {
    await upsertAggregation(RiskScoringModelEnum.Default);
    await page.goto('/');

    // Create a risk
    await app.riskScenarios.createRisk({
      riskName: 'Residual Trend Test Risk',
      description: 'Risk to test residual trend indicators',
    });

    // Create first residual rating (lower)
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'Low',
      likelihood: 'Unlikely',
      resultDate: '2024-01-01',
      controlType: 'Residual',
    });

    // Create second residual rating (higher) - should result in "Increased" trend
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'High',
      likelihood: 'Certain',
      resultDate: '2024-02-01',
      controlType: 'Residual',
    });

    // Refresh scores to compute trends
    await refreshRiskScores();

    // Navigate to risk register and verify trend column
    await page.goto('/risks');
    await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register');
    await app.riskRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Risk name',
      'Residual rating',
      'Residual risk rating trend',
    ]);

    await app.riskRegisterPage.table.expectRowCount(1);
    await app.riskRegisterPage.table.expectRowToContain(1, {
      'Risk name': 'Residual Trend Test Risk',
      'Residual rating': 'High',
      'Residual risk rating trend': 'Increased',
    });
  });

  test('should display "-" for trend when only one rating exists', async ({
    page,
    app,
  }) => {
    await upsertAggregation(RiskScoringModelEnum.Default);
    await page.goto('/');

    // Create a risk
    await app.riskScenarios.createRisk({
      riskName: 'Single Rating Risk',
      description: 'Risk with only one rating',
    });

    // Create only one inherent rating
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'Moderate',
      likelihood: 'Likely',
      resultDate: '2024-01-01',
      controlType: 'Inherent',
    });

    // Refresh scores
    await refreshRiskScores();

    // Navigate to risk register and verify trend column shows "-"
    await page.goto('/risks');
    await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register');
    await app.riskRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Risk name',
      'Inherent rating',
      'Inherent risk rating trend',
    ]);

    await app.riskRegisterPage.table.expectRowCount(1);
    await app.riskRegisterPage.table.expectRowToContain(1, {
      'Risk name': 'Single Rating Risk',
      'Inherent risk rating trend': '-',
    });
  });

  test('should display "Stable" trend when consecutive ratings have same score', async ({
    page,
    app,
  }) => {
    await upsertAggregation(RiskScoringModelEnum.Default);
    await page.goto('/');

    // Create a risk
    await app.riskScenarios.createRisk({
      riskName: 'Stable Trend Risk',
      description: 'Risk with stable trend',
    });

    // Create first inherent rating
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'Moderate',
      likelihood: 'Likely',
      resultDate: '2024-01-01',
      controlType: 'Inherent',
    });

    // Create second inherent rating with same impact/likelihood - should result in "Stable" trend
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      impact: 'Moderate',
      likelihood: 'Likely',
      resultDate: '2024-02-01',
      controlType: 'Inherent',
    });

    // Refresh scores to compute trends
    await refreshRiskScores();

    // Navigate to risk register and verify trend column
    await page.goto('/risks');
    await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register');
    await app.riskRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Risk name',
      'Inherent rating',
      'Inherent risk rating trend',
    ]);

    await app.riskRegisterPage.table.expectRowCount(1);
    await app.riskRegisterPage.table.expectRowToContain(1, {
      'Risk name': 'Stable Trend Risk',
      'Inherent risk rating trend': 'Stable',
    });
  });
});

test.describe('Control effectiveness trend column', () => {
  test('should display control test trend in the control register after multiple test results', async ({
    page,
    app,
  }) => {
    await page.goto('/');

    // Create a risk first
    await app.riskScenarios.createRisk({
      riskName: 'Risk for Control Trend',
      description: 'Risk to test control trends',
    });

    // Create a control
    await app.controlScenarios.createControlFromRiskDetails({
      title: 'Trend Test Control',
      description: 'Control to test effectiveness trend',
      owners: ['RiskManager1'],
      type: 'Directive',
    });

    // Navigate to control details
    await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
      'Title',
      'Trend Test Control'
    );

    // Create first test result (lower effectiveness)
    await app.testResultScenarios.createTestResultFromControlDetails({
      title: 'Test 1',
      controlTestDetails: 'First test',
      testDate: '2024-01-01',
      performedBy: 'RiskManager1',
      testResult: 'Not effective',
    });

    // Create second test result (higher effectiveness) - should result in "Increased" trend
    await app.testResultScenarios.createTestResultFromControlDetails({
      title: 'Test 2',
      controlTestDetails: 'Second test',
      testDate: '2024-02-01',
      performedBy: 'RiskManager1',
      testResult: 'Fully effective',
    });

    // Navigate to control register and verify trend column
    await page.goto('/controls');
    await expect(app.controlRegisterPage.header.title).toHaveText(
      'Control Register'
    );
    await app.controlRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Title',
      'Overall Effectiveness',
      'Control test trend',
    ]);

    await app.controlRegisterPage.table.expectRowCount(1);
    await app.controlRegisterPage.table.expectRowToContain(1, {
      Title: 'Trend Test Control',
      'Overall Effectiveness': 'Fully effective',
      'Control test trend': 'Increased',
    });
  });

  test('should display "-" for control trend when only one test result exists', async ({
    page,
    app,
  }) => {
    await page.goto('/');

    // Create a risk first
    await app.riskScenarios.createRisk({
      riskName: 'Risk for Single Test Control',
      description: 'Risk to test control with single test',
    });

    // Create a control
    await app.controlScenarios.createControlFromRiskDetails({
      title: 'Single Test Control',
      description: 'Control with only one test result',
      owners: ['RiskManager1'],
      type: 'Directive',
    });

    // Navigate to control details
    await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
      'Title',
      'Single Test Control'
    );

    // Create only one test result
    await app.testResultScenarios.createTestResultFromControlDetails({
      title: 'Test 1',
      controlTestDetails: 'Only test',
      testDate: '2024-01-01',
      performedBy: 'RiskManager1',
      testResult: 'Fully effective',
    });

    // Navigate to control register and verify trend column shows "-"
    await page.goto('/controls');
    await expect(app.controlRegisterPage.header.title).toHaveText(
      'Control Register'
    );
    await app.controlRegisterPage.table.toggleVisibleColumns([
      'ID',
      'Title',
      'Overall Effectiveness',
      'Control test trend',
    ]);

    await app.controlRegisterPage.table.expectRowCount(1);
    await app.controlRegisterPage.table.expectRowToContain(1, {
      Title: 'Single Test Control',
      'Control test trend': '-',
    });
  });
});
