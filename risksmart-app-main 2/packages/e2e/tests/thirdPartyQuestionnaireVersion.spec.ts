import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { CloudscapeSelectWrapper } from '../models/forms/fields/Select';

test(`Can add a questionnaire version`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyQuestionnaireScenarios.createThirdPartyQuestionnaire({
    title: 'Questionnaire 1',
    owners: ['RiskManager1'],
  });

  await app.thirdPartyQuestionnaireVersionScenarios.createThirdPartyQuestionnaireVersionFromDetailsPage(
    {
      version: '1a',
    },
    [
      {
        section: { title: 'Section 1' },
        fields: [
          {
            fieldTitle: 'Field 1a',
            placeholderText: 'Field 1a placeholder',
            guidance: 'Field 1a guidance',
            fieldType: 'Text',
          },
          {
            fieldTitle: 'Field 1b',
            placeholderText: 'Field 1b placeholder',
            guidance: 'Field 1b guidance',
            fieldType: 'Dropdown',
            options: ['1b.1', '1b.2'],
          },
        ],
      },
      {
        section: { title: 'Section 2' },
        fields: [
          {
            fieldTitle: 'Field 2a',
            placeholderText: 'Field 2a placeholder',
            guidance: 'Field 2a guidance',
            fieldType: 'Text',
          },
          {
            fieldTitle: 'Field 2b',
            placeholderText: 'Field 2b placeholder',
            guidance: 'Field 2b guidance',
            fieldType: 'Dropdown',
            options: ['2b.1', '2b.2'],
          },
        ],
      },
    ]
  );

  await app.questionnaireDetailsPage.versionsTab.table.expectRowCount(1);
});

test(`Can preview a questionnaire version and test validation`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyQuestionnaireScenarios.createThirdPartyQuestionnaire({
    title: 'Questionnaire 1',
    owners: ['RiskManager1'],
  });

  await app.thirdPartyQuestionnaireVersionScenarios.previewThirdPartyQuestionnaireVersionFromDetailsPage(
    {
      version: '1a',
    },
    [
      {
        section: { title: 'Section 1' },
        fields: [
          {
            fieldTitle: 'Field 1a',
            placeholderText: 'Field 1a placeholder',
            guidance: 'Field 1a guidance',
            fieldType: 'Text',
          },
          {
            fieldTitle: 'Field 1b',
            placeholderText: 'Field 1b placeholder',
            guidance: 'Field 1b guidance',
            fieldType: 'Dropdown',
            options: ['1b.1', '1b.2'],
          },
        ],
      },
    ]
  );

  const previewForm =
    app.questionnaireVersionDetailsPage.previewModal.previewForm;
  await previewForm.testValidationButton.click();

  const field1 = await previewForm.getFormField(0, 0);
  await expect(
    previewForm.page.locator(field1.findLabel().toSelector())
  ).toHaveText('Field 1a*');
  await expect(
    previewForm.page.locator(field1.findError().toSelector())
  ).toHaveText('is a required property');

  const field2 = await previewForm.getFormField(0, 1);
  await expect(
    previewForm.page.locator(field2.findLabel().toSelector())
  ).toHaveText('Field 1b*');
  await expect(
    previewForm.page.locator(field2.findError().toSelector())
  ).toHaveText('is a required property');

  const field1Input = previewForm.page.locator(
    field1.findControl().findInput().findNativeInput().toSelector()
  );
  await field1Input.fill('Answer 1');

  await new CloudscapeSelectWrapper(
    previewForm.page,
    field2.findControl().findSelect()
  ).selectOptionByText('1b.2');

  await expect(
    previewForm.page.locator(field1.findError().toSelector())
  ).toHaveCount(0);
  await expect(
    previewForm.page.locator(field2.findError().toSelector())
  ).toHaveCount(0);
});
