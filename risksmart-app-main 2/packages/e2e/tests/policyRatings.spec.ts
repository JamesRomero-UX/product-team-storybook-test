import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { buildDocumentFormValues } from '../testData/documentFormValuesBuilder';

test('Can add a policy rating', async ({ page, app }) => {
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');
  const document = buildDocumentFormValues();
  await app.policyScenarios.createDocument(document);

  await app.policyScenarios.createDocumentRatingFromDocumentDetailPage({
    rating: 'Non-compliant',
    rationale: 'Rationale...',
    resultDate: '2021-02-03',
  });

  await app.documentDetailsPage.ratingsTab.table.expectRowCount(1);
});

test('Can delete a policy rating', async ({ page, app }) => {
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');
  const document = buildDocumentFormValues();
  await app.policyScenarios.createDocument(document);

  await app.policyScenarios.createDocumentRatingFromDocumentDetailPage({
    rating: 'Non-compliant',
    rationale: 'Rationale...',
    resultDate: '2021-02-03',
  });

  await app.documentDetailsPage.ratingsTab.table.expectRowCount(1);
  await app.documentDetailsPage.ratingsTab.table.checkRow(1);
  await app.documentDetailsPage.ratingsTab.deleteButton.click();
  await app.documentDetailsPage.ratingsTab.deleteModal.confirmButton.click();
  await app.documentDetailsPage.notificationBanner.expectNotification(
    'Rating deleted successfully'
  );
  await app.documentDetailsPage.ratingsTab.table.expectRowCount(0);
});

test('Cannot set documents as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  const document = buildDocumentFormValues();
  await app.policyScenarios.createDocument(document);
  await app.documentDetailsPage.ratingsTab.selectTab();
  await app.documentDetailsPage.ratingsTab.addButton.click();

  const form = app.documentDetailsPage.ratingsTab.ratingModal.ratingForm;
  const requiredFields = [form.fields.documents];

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

test('Can set rating, result date, rationale, attach files and assessment as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  const document = buildDocumentFormValues();
  await app.policyScenarios.createDocument(document);
  await app.documentDetailsPage.ratingsTab.selectTab();
  await app.documentDetailsPage.ratingsTab.addButton.click();

  const form = app.documentDetailsPage.ratingsTab.ratingModal.ratingForm;
  const unrequiredFields = [
    form.fields.rating,
    form.fields.resultDate,
    form.fields.rationale,
    form.fields.attachFiles,
    form.fields.assessment,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({});
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Finding added successfully'
  );
});

test('Can add conditions on rationale, attach files', async ({ app, page }) => {
  await updateOrganisationFeatures(['conditional_fields', 'policy']);
  await page.goto('/');
  const document = buildDocumentFormValues();
  await app.policyScenarios.createDocument(document);
  await app.documentDetailsPage.ratingsTab.selectTab();
  await app.documentDetailsPage.ratingsTab.addButton.click();

  const form = app.documentDetailsPage.ratingsTab.ratingModal.ratingForm;

  const conditionalFields = [form.fields.rationale, form.fields.attachFiles];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: {
        label: 'Rating',
        operator: '=',
        value: 'Compliant',
        type: 'dropdown',
      },
    });
  }
  await form.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({ rating: 'Compliant' });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    rating: 'Non-compliant',
  });
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Finding added successfully'
  );
});
