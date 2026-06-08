import { expect } from '@playwright/test';

import {
  insertScoringSettings,
  refreshRiskScores,
  updateOrganisationFeatures,
  upsertAggregation,
} from '../apiClient';
import { test } from '../base';
import { RiskScoringModelEnum } from '../generated/graphql';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildScoringConfig } from '../testData/riskAssessmentResultConfig';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Appetites Register heading is "Appetites Register"`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.appetitesRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test(`Can create a risk impact appetite`, async ({ page, app }) => {
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

  await app.appetiteScenarios.createAppetiteFromRiskDetails({
    effectiveDate: '2021-01-01',
    impact: 'Impact 1',
    appetiteType: 'Impact',
    impactAppetite: 'Critical',
  });

  await app.riskDetailsPage.riskAppetiteTab.table.expectRowToContain(1, {
    'Appetite Type': 'Impact',
    'Effective date': '1 Jan 2021',
    ID: 'APT-1',
    Impact: 'Impact 1',
    'Likelihood appetite': '',
    Status: 'Active',
    'Impact appetite': 'Critical',
  });
});

test(`Can create a risk appetite and see it in the register`, async ({
  page,
  app,
}) => {
  await page.goto('/');
  const riskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName,
    description: 'Risk 1 description',
  });

  await app.appetiteScenarios.createAppetiteFromRiskDetails({
    effectiveDate: '2021-01-01',
  });

  await app.riskDetailsPage.riskAppetiteTab.table.expectRowToContain(1, {
    'Appetite Type': 'Risk',
    'Effective date': '1 Jan 2021',
    ID: 'APT-1',
    'Lower appetite': 'Minimal',
    Status: 'Active',
    'Upper appetite': 'Minimal',
  });

  await app.appetitesRegisterPage.navigateToAndAssertTitle();
  await app.appetitesRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.appetitesRegisterPage.table.expectRowCount(1);
  await app.appetitesRegisterPage.table.expectRowToContain(1, {
    'Appetite performance': '-',
    'Contributors (risk)': '',
    'Created on': expect.anything(),
    'Effective date': '1 Jan 2021',
    Guid: expect.anything(),
    ID: 'APT-1',
    'Lower appetite': 'Minimal',
    'Owners (risk)': ['RiskManager1'],
    'Parent risk ID': 'R-1',
    'Parent risk guid': expect.anything(),
    'Residual rating': 'Unrated',
    'Risk name (risk)': 'Risk 1',
    Statement: '',
    'Risk tier (risk)': 'Tier 1',
    'Updated by': 'RiskManager1',
    'Updated by ID': 'auth0|644151efc3a961d2784456d9',
    'Updated on': expect.anything(),
    'Upper appetite': 'Minimal',
  });
});

[
  {
    lowerAppetite: 'Minimal',
    upperAppetite: 'Minimal',
    rating: 'Low',
    expectedAppetitePerformance: 'Outside',
  },
  {
    lowerAppetite: 'Low',
    upperAppetite: 'Low',
    rating: 'Low',
    expectedAppetitePerformance: 'Inside',
  },
].forEach(
  ({ lowerAppetite, upperAppetite, rating, expectedAppetitePerformance }) => {
    test(`Appetite performance ${expectedAppetitePerformance} if rating ${rating}, lower appetite ${lowerAppetite}, and upper appetite ${upperAppetite}`, async ({
      page,
      app,
    }) => {
      await page.goto('/');
      const riskName = 'Risk 1';
      await app.riskScenarios.createRisk({
        riskName,
        description: 'Risk 1 description',
      });

      await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
        resultDate: '2021-01-01',
        controlType: 'Residual',
        likelihood: 'Likely',
        impact: 'Low',
        rating,
      });

      await refreshRiskScores();

      await app.appetiteScenarios.createAppetiteFromRiskDetails({
        effectiveDate: '2021-01-01',
        lowerAppetite: lowerAppetite,
        upperAppetite: upperAppetite,
      });

      await app.riskDetailsPage.riskAppetiteTab.table.expectRowToContain(1, {
        'Appetite Type': 'Risk',
        'Effective date': '1 Jan 2021',
        ID: 'APT-1',
        'Lower appetite': lowerAppetite,
        Status: 'Active',
        'Upper appetite': upperAppetite,
      });

      await app.appetitesRegisterPage.navigateToAndAssertTitle();
      await app.appetitesRegisterPage.table.toggleAllColumnsToBeVisible();
      await app.appetitesRegisterPage.table.expectRowCount(1);
      await app.appetitesRegisterPage.table.expectRowToContain(1, {
        'Appetite performance': expectedAppetitePerformance,
        'Lower appetite': lowerAppetite,
        'Upper appetite': upperAppetite,
      });
    });
  }
);

test.describe('Scoring Settings', () => {
  test('Appetite register shows scoring settings rating label and correct performance', async ({
    page,
    app,
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

    // Residual: Doubtful(2) × Marginal(2) → Yellow (value 2)
    await app.riskRatingScenarios.createRiskRatingFromRiskDetailsPage({
      resultDate: '2021-01-01',
      controlType: 'Residual',
      likelihood: 'Doubtful',
      impact: 'Marginal',
    });

    await refreshRiskScores();

    // Lower=Low(2), Upper=Low(2) → Yellow(2) is inside [2,2]
    await app.appetiteScenarios.createAppetiteFromRiskDetails({
      effectiveDate: '2021-01-01',
      lowerAppetite: 'Low',
      upperAppetite: 'Low',
    });

    await app.appetitesRegisterPage.navigateToAndAssertTitle();
    await app.appetitesRegisterPage.table.toggleAllColumnsToBeVisible();
    await app.appetitesRegisterPage.table.expectRowCount(1);
    await app.appetitesRegisterPage.table.expectRowToContain(1, {
      'Residual rating': 'Yellow',
      'Appetite performance': 'Inside',
      'Lower appetite': 'Low',
      'Upper appetite': 'Low',
    });
  });
});

test(`Can delete a risk appetite`, async ({ page, app }) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.appetiteScenarios.createAppetiteFromRiskDetails({
    effectiveDate: '2021-01-01',
  });

  await app.riskDetailsPage.riskAppetiteTab.table.checkRow(1);
  await app.riskDetailsPage.riskAppetiteTab.deleteButton.click();
  await app.riskDetailsPage.riskAppetiteTab.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Appetite deleted successfully'
  );
  await app.riskDetailsPage.riskAppetiteTab.table.expectRowCount(0);
});

test('Cannot set lower appetite or upper appetite as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const riskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName,
    description: 'Risk 1 description',
  });
  const appetitesTab = app.riskDetailsPage.riskAppetiteTab;
  await appetitesTab.selectTabAndAssertTitle('Appetite');

  await appetitesTab.addButton.click();
  await expect(app.appetiteDetailsPage.header.title).toHaveText('Add Appetite');

  const appetiteForm = app.appetiteDetailsPage.detailsTab.appetiteForm;

  const requiredFields = [
    appetiteForm.fields.lowerAppetite,
    appetiteForm.fields.upperAppetite,
  ];

  await appetiteForm.formSettingsButton.openAndClickItem('Edit form');

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

test('Can set appetite statement, files and effective date as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const riskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName,
    description: 'Risk 1 description',
  });
  const appetitesTab = app.riskDetailsPage.riskAppetiteTab;
  await appetitesTab.selectTabAndAssertTitle('Appetite');

  await appetitesTab.addButton.click();
  await expect(app.appetiteDetailsPage.header.title).toHaveText('Add Appetite');

  const appetiteForm = app.appetiteDetailsPage.detailsTab.appetiteForm;

  const unrequiredFields = [
    appetiteForm.fields.appetiteStatement,
    appetiteForm.fields.files,
    appetiteForm.fields.effectiveDate,
  ];

  await app.customAttributeScenarios.bulkEditFields(appetiteForm, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await appetiteForm.fillFormAndClickSave({
    lowerAppetite: 'Low',
    upperAppetite: 'Low',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Appetite added successfully'
  );
});

test('Can add conditions on appetite statement, files and effective date', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const riskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName,
    description: 'Risk 1 description',
  });
  const appetitesTab = app.riskDetailsPage.riskAppetiteTab;
  await appetitesTab.selectTabAndAssertTitle('Appetite');

  await appetitesTab.addButton.click();
  await expect(app.appetiteDetailsPage.header.title).toHaveText('Add Appetite');

  const appetiteForm = app.appetiteDetailsPage.detailsTab.appetiteForm;

  const conditionalFields = [
    appetiteForm.fields.appetiteStatement,
    appetiteForm.fields.files,
    appetiteForm.fields.effectiveDate,
  ];
  await appetiteForm.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: {
        label: 'Lower appetite',
        operator: '=',
        value: 'High',
        type: 'dropdown',
      },
    });
  }
  await appetiteForm.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await appetiteForm.fillForm({
    lowerAppetite: 'High',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await appetiteForm.fillFormAndClickSave({
    lowerAppetite: 'Low',
    upperAppetite: 'High',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Appetite added successfully'
  );
});

test('Updated appetite field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');

  const riskName = 'Risk 1';
  await app.riskScenarios.createRisk({
    riskName,
    description: 'Risk 1 description',
  });
  const appetitesTab = app.riskDetailsPage.riskAppetiteTab;
  await appetitesTab.selectTabAndAssertTitle('Appetite');

  await appetitesTab.addButton.click();
  await expect(app.appetiteDetailsPage.header.title).toHaveText('Add Appetite');

  const form = app.appetiteDetailsPage.detailsTab.appetiteForm;
  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.appetiteStatement,
      newLabel: 'New appetite statement',
    },
    {
      field: form.fields.lowerAppetite,
      newLabel: 'New lower appetite',
    },
    {
      field: form.fields.upperAppetite,
      newLabel: 'New upper appetite',
    },
    {
      field: form.fields.effectiveDate,
      newLabel: 'New effective date',
    },
    {
      field: form.fields.files,
      newLabel: 'New files',
      notInRegister: true,
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave({
    lowerAppetite: 'Low',
    upperAppetite: 'High',
    appetiteStatement: 'Hello',
    effectiveDate: '2021-01-01',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Appetite added successfully'
  );

  await app.appetitesRegisterPage.navigateToAndAssertTitle();
  await app.appetitesRegisterPage.table.expectRowCount(1);
  await app.appetitesRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.appetitesRegisterPage.table.expectRowToContain(1, {
    'New appetite statement': 'Hello',
    'New effective date': '1 Jan 2021',
    'New lower appetite': 'Low',
    'New upper appetite': 'High',
  });
});
