import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { users } from '../users';

[users.riskManager].forEach((user) => {
  test.describe(`Impact Ratings heading is "Impact ratings"`, () => {
    test.use({ user });

    test(user.role, async ({ app, page }) => {
      await updateOrganisationFeatures(['impacts']);
      await page.goto('/');
      await app.impactRatingsRegisterPage.navigateTo();
      await expect(app.impactRatingsRegisterPage.header.title).toHaveText(
        `Impact ratings`
      );
    });
  });
});

test('Add impact rating', async ({ app, page }) => {
  await updateOrganisationFeatures(['impacts']);
  await page.goto('/');
  await app.impactScenarios.createImpact({
    name: 'Impact 1',
    rationale: 'Rationale 1',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.impactRatingScenarios.createImpactRatingFromRiskDetailPage({
    likelihood: '1',
    ratings: ['1'],
  });

  await app.riskDetailsPage.impactsTab.table.expectRowCount(1);

  await app.riskDetailsPage.impactsTab.table.expectRowToContain(1, {
    'Completed by': 'RiskManager1',
    Likelihood: '',
    'Likelihood performance': 'Unrated',
    Name: 'Impact 1',
    'Performance rating': '',
    'Performance score': '',
    'Rating score': '1',
    Rationale: 'Rationale 1',
    Status: 'Active',
  });
});

test('Older ratings are archived (if two created with same test date)', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['impacts']);
  await page.goto('/');
  await app.impactScenarios.createImpact({
    name: 'Impact 1',
    rationale: 'Rationale 1',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.impactRatingScenarios.createImpactRatingFromRiskDetailPage({
    likelihood: '1',
    ratings: ['1'],
  });

  await app.riskDetailsPage.impactsTab.table.expectRowCount(1);

  await app.impactRatingScenarios.createImpactRatingFromRiskDetailPage({
    likelihood: '2',
    ratings: ['2'],
  });

  await app.riskDetailsPage.impactsTab.table.expectRowCount(2);

  await app.riskDetailsPage.impactsTab.table.expectRowToContain(1, {
    Name: 'Impact 1',
    'Rating score': '2',
    Status: 'Active',
  });

  await app.riskDetailsPage.impactsTab.table.expectRowToContain(2, {
    Name: 'Impact 1',
    'Rating score': '1',
    Status: 'Archived',
  });
});
