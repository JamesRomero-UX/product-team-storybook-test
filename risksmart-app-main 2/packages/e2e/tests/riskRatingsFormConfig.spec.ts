import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

test.describe('Risk Rating Form Configuration', () => {
  test('Can save a risk rating without likelihood, impact or rating', async ({
    page,
    app,
  }) => {
    await page.goto('/');
    await app.riskScenarios.createRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await app.riskDetailsPage.ratingsTab.selectTab();
    await app.riskDetailsPage.ratingsTab.addButton.click();

    const ratingForm = app.riskDetailsPage.ratingsTab.ratingModal.ratingForm;
    await ratingForm.formSettingsButton.openAndClickItem('Edit form');

    await app.customAttributeScenarios.editField(ratingForm.fields.impact, {
      required: false,
    });
    await app.customAttributeScenarios.editField(ratingForm.fields.likelihood, {
      required: false,
    });

    await app.customAttributeScenarios.editField(ratingForm.fields.rating, {
      required: false,
    });

    await app.customisableFieldModal.customisableFieldForm.saveFormConfigurationButton.click();

    await ratingForm.saveButton.click();
    await app.riskDetailsPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  });

  test('Can add a custom attribute', async ({ page, app }) => {
    await page.goto('/');
    await app.riskScenarios.createRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await app.riskDetailsPage.ratingsTab.selectTab();
    await app.riskDetailsPage.ratingsTab.addButton.click();

    const ratingForm = app.riskDetailsPage.ratingsTab.ratingModal.ratingForm;
    await ratingForm.formSettingsButton.openAndClickItem('Add custom field');

    await app.addCustomFieldModal.addCustomFieldForm.fillFormAndClickSave({
      fieldType: 'Text',
      label: 'New Field 1',
      description: 'New Field Description 1',
    });

    await app.riskDetailsPage.notificationBanner.expectNotification(
      'Custom field added successfully'
    );
  });

  test('Cannot set result type and risk as unrequired or add conditions', async ({
    app,
    page,
  }) => {
    await updateOrganisationFeatures(['conditional_fields']);
    await page.goto('/');
    await app.riskScenarios.createRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await app.riskDetailsPage.ratingsTab.selectTab();
    await app.riskDetailsPage.ratingsTab.addButton.click();

    const form = app.riskDetailsPage.ratingsTab.ratingModal.ratingForm;
    const requiredFields = [form.fields.controlType, form.fields.risks];

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

  test('Can set assessments, rating, likelihood, impact, rationale, result date and attach files as unrequired', async ({
    app,
    page,
  }) => {
    await updateOrganisationFeatures(['conditional_fields']);
    await page.goto('/');
    await app.riskScenarios.createRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await app.riskDetailsPage.ratingsTab.selectTab();
    await app.riskDetailsPage.ratingsTab.addButton.click();

    const form = app.riskDetailsPage.ratingsTab.ratingModal.ratingForm;
    const unrequiredFields = [
      form.fields.assessments,
      form.fields.rating,
      form.fields.likelihood,
      form.fields.impact,
      form.fields.rationale,
      form.fields.resultDate,
      form.fields.attachFiles,
    ];

    await app.customAttributeScenarios.bulkEditFields(form, [
      ...unrequiredFields.map((field) => ({
        field,
        values: { required: false },
      })),
    ]);
    await form.fillFormAndClickSave({});
    await app.riskDetailsPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  });

  test('Can add conditions on likelihood, impact, rationale, result date and attach files', async ({
    app,
    page,
  }) => {
    await updateOrganisationFeatures(['conditional_fields']);
    await page.goto('/');
    await app.riskScenarios.createRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await app.riskDetailsPage.ratingsTab.selectTab();
    await app.riskDetailsPage.ratingsTab.addButton.click();

    const form = app.riskDetailsPage.ratingsTab.ratingModal.ratingForm;

    const conditionalFields = [
      form.fields.likelihood,
      form.fields.impact,
      form.fields.rationale,
      form.fields.resultDate,
      form.fields.attachFiles,
    ];

    await form.formSettingsButton.openAndClickItem('Edit form');

    for (const field of conditionalFields) {
      await app.customAttributeScenarios.editField(field, {
        conditions: {
          label: 'Result type',
          operator: '=',
          value: 'Residual',
          type: 'dropdown',
        },
      });
    }
    await form.saveFormConfigurationButton.click();

    for (const field of conditionalFields) {
      await field.expectIsVisible(false);
    }

    await form.fillForm({ controlType: 'Residual' });
    for (const field of conditionalFields) {
      await field.expectIsVisible(true);
    }

    await form.fillFormAndClickSave({
      controlType: 'Inherent',
      rating: 'Low',
    });
    await app.riskDetailsPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  });
});
