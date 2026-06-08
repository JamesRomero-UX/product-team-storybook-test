import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { users } from '../users';

[users.riskManager].forEach((user) => {
  test.describe(`Impacts Register heading is "Impact register"`, () => {
    test.use({ user });
    test(user.role, async ({ app, page }) => {
      await updateOrganisationFeatures(['impacts']);
      await page.goto('/');
      await app.impactsRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test(`Add an impact`, async ({ app, page }) => {
  await updateOrganisationFeatures(['impacts']);
  await page.goto('/');
  await app.impactScenarios.createImpact({
    name: 'Impact 1',
    rationale: 'Rationale 1',
  });
  await app.impactsRegisterPage.table.expectRowCount(1);
  const rowData = await app.impactsRegisterPage.table.getRowAsObject(1);
  expect(rowData).toEqual({
    Name: 'Impact 1',
    Owners: '',
    'Rated items': '',
    Rationale: 'Rationale 1',
  });
});

test('Updated impact field names shown in register', async ({ page, app }) => {
  await updateOrganisationFeatures(['impacts']);
  await page.goto('/');

  await app.impactsRegisterPage.navigateToAndAssertTitle();
  await app.impactsRegisterPage.addImpactButton.click();

  const form = app.impactsRegisterPage.addImpactModal.impactForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.name,
      newLabel: 'New title',
    },
    {
      field: form.fields.rationale,
      newLabel: 'New rationale',
    },
    {
      field: form.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: form.fields.likelihoodAppetite,
      newLabel: 'New likelihood appetite',
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

  await app.impactsRegisterPage.addImpactModal.impactForm.fillFormAndClickSave({
    name: 'Impact 1',
    rationale: 'Rationale 1',
  });

  await app.impactsRegisterPage.notificationBanner.expectNotification(
    'Impact added successfully'
  );

  await app.impactsRegisterPage.navigateToAndAssertTitle();
  await app.impactsRegisterPage.table.expectRowCount(1);
  await app.impactsRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.impactsRegisterPage.table.expectRowToContain(1, {
    'New rationale': 'Rationale 1',
    'New title': 'Impact 1',
    'New owners': '',
  });
});
