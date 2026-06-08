import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { buildObligationFormValues } from '../testData/obligationFormValuesBuilder';

test('Can create an obligation impact', async ({ page, app }) => {
  await updateOrganisationFeatures(['compliance']);
  await page.goto('/');
  const obligation = buildObligationFormValues();
  await app.obligationScenarios.createObligation(obligation);

  await app.obligationDetailsPage.impactsTab.selectTab();
  await expect(app.obligationDetailsPage.impactsTab.title).toHaveText(
    'Impacts'
  );
  await app.obligationDetailsPage.impactsTab.addButton.click();
  await app.obligationDetailsPage.impactsTab.impactModal.obligationImpactForm.fillFormAndClickSave(
    {
      impactOfNonAdherence: 'Impact of non adherence text',
      impact: 'Low',
    }
  );
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Impact added successfully'
  );
  await app.obligationDetailsPage.impactsTab.table.expectRowCount(1);
  await app.obligationDetailsPage.impactsTab.table.expectRowToContain(1, {
    'Impact of non-adherence': 'Impact of non adherence text',
    Impact: 'Low',
  });
});

test('Can delete an obligation impact', async ({ page, app }) => {
  await updateOrganisationFeatures(['compliance']);
  await page.goto('/');
  const obligation = buildObligationFormValues();
  await app.obligationScenarios.createObligation(obligation);

  await app.obligationDetailsPage.impactsTab.selectTab();
  await expect(app.obligationDetailsPage.impactsTab.title).toHaveText(
    'Impacts'
  );
  await app.obligationDetailsPage.impactsTab.addButton.click();
  await app.obligationDetailsPage.impactsTab.impactModal.obligationImpactForm.fillFormAndClickSave(
    {
      impactOfNonAdherence: 'Impact of non adherence text',
      impact: 'Low',
    }
  );
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Impact added successfully'
  );
  await app.obligationDetailsPage.impactsTab.table.expectRowCount(1);

  await app.obligationDetailsPage.impactsTab.table.checkRow(1);
  await app.obligationDetailsPage.impactsTab.deleteButton.click();
  await app.obligationDetailsPage.deleteModal.confirmButton.click();
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Impact deleted successfully'
  );
  await app.obligationDetailsPage.impactsTab.table.expectRowCount(0);
});

test('Cannot set impact or impact of non adherence as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'compliance']);
  await page.goto('/');
  const obligation = buildObligationFormValues();
  await app.obligationScenarios.createObligation(obligation);

  await app.obligationDetailsPage.impactsTab.selectTab();
  await expect(app.obligationDetailsPage.impactsTab.title).toHaveText(
    'Impacts'
  );
  await app.obligationDetailsPage.impactsTab.addButton.click();

  const form =
    app.obligationDetailsPage.impactsTab.impactModal.obligationImpactForm;
  const requiredFields = [form.fields.impact, form.fields.impactOfNonAdherence];

  await form.formSettingsButton.openAndClickItem('Edit form');

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
