import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { getAuthFile, test } from '../base';
import { App } from '../models/App';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildObligationFormValues } from '../testData/obligationFormValuesBuilder';
import { users } from '../users';

[users.riskManager].forEach((user) => {
  test.describe(`New standard obligation shown in register`, () => {
    test.use({ user });
    test(`${user.role}`, async ({ page, app }) => {
      await updateOrganisationFeatures(['compliance']);
      await page.goto('/');
      const obligation = buildObligationFormValues();
      await app.obligationScenarios.createObligation(obligation);
      await app.complianceRegisterPage.navigateToAndAssertTitle();
      await app.complianceRegisterPage.table.expectRowCount(1);
      await app.complianceRegisterPage.table.toggleAllColumnsToBeVisible();
      const obligationRow =
        await app.complianceRegisterPage.table.getRowAsObject(1);

      expect(obligationRow).toEqual(
        expect.objectContaining({
          ID: 'O-1',
          'Obligation title': 'Obligation 1',
          Parent: '-',
          Type: 'High-level standard',
          Owners: [users.riskManager.friendlyName],
          Contributors: [users.public.friendlyName],
          Rating: 'Unrated',
          'Assessment status': 'Not started',
          Controls: '0',
          Breaches: '0',
          Tags: '',
          Departments: '',
          'Created on': expect.any(String),
          'Updated on': expect.any(String),
          Description: '-',
          Guid: expect.any(String),
          'Created by': user.friendlyName,
          'Updated by': user.friendlyName,
          'Associated obligation ID': '-',
          'Latest rating date': '-',
          'Next test Date': '-',
          'Assessment frequency': 'Weekly',
        })
      );
    });
  });
});

test(`Standard user able to create child obligation on owner parent`, async ({
  page,
  browser,
  app,
}) => {
  await updateOrganisationFeatures(['compliance']);
  await page.goto('/');
  const parentTitle = 'Parent 1';
  await app.obligationScenarios.createObligation({
    title: parentTitle,
    interpretation: 'Interpretation 1',
    adherence: 'Flexible',
    owners: ['Standard1'],
    contributors: [users.public.friendlyName],
    testFrequency: 'Weekly',
    type: 'High-level standard',
  });
  const standardAuth = await getAuthFile({ browser, user: users.standard });

  const standardContext = await browser.newContext({
    storageState: standardAuth,
  });

  const standardPage = await standardContext.newPage();

  await standardPage.goto('/');
  const standardApp = new App(standardPage);
  await standardApp.obligationScenarios.createObligation({
    title: 'Child',
    interpretation: 'Interpretation 2',
    adherence: 'Flexible',
    owners: ['Standard1'],
    contributors: [users.public.friendlyName],
    testFrequency: 'Weekly',
    parent: parentTitle,
    type: 'Chapter',
  });
});

[users.riskManager].forEach((user) => {
  test.describe(`Can update an obligation`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await updateOrganisationFeatures(['compliance']);
      await page.goto('/');
      const title = 'Obligation 1';
      await app.obligationScenarios.createObligation({
        title,
        interpretation: 'Interpretation 1',
        adherence: 'Flexible',
        owners: ['ReadOnly1'],
        contributors: ['Standard1'],
        testFrequency: 'Weekly',
        type: 'High-level standard',
      });

      await app.obligationDetailsPage.detailsTab.obligationForm.fillFormAndClickSave(
        {
          title: 'Obligation 1 updated',
          interpretation: 'Interpretation 1 updated',
          adherence: 'Advised',
          owners: ['Standard1'],
          contributors: ['ReadOnly1'],
          testFrequency: 'Daily',
          type: 'High-level standard',
        }
      );
      await app.obligationDetailsPage.notificationBanner.expectNotification(
        'Obligation updated successfully'
      );

      await app.complianceRegisterPage.navigateToAndAssertTitle();
      await app.complianceRegisterPage.table.expectRowCount(1);
      await app.complianceRegisterPage.table.toggleAllColumnsToBeVisible();
      const obligationRow =
        await app.complianceRegisterPage.table.getRowAsObject(1);

      expect(obligationRow).toEqual(
        expect.objectContaining({
          ID: 'O-1',
          'Obligation title': 'Obligation 1 updated',
          Parent: '-',
          Type: 'High-level standard',
          Owners: ['Standard1'],
          Contributors: ['ReadOnly1'],
          Rating: 'Unrated',
          'Assessment status': 'Not started',
          Controls: '0',
          Breaches: '0',
          Tags: '',
          Departments: '',
          'Created on': expect.any(String),
          'Updated on': expect.any(String),
          Description: '-',
          Guid: expect.any(String),
          'Created by': user.friendlyName,
          'Updated by': user.friendlyName,
          'Associated obligation ID': '-',
          'Latest rating date': '-',
          'Next test Date': '-',
          'Assessment frequency': 'Daily',
        })
      );
    });
  });
});

[users.riskManager].forEach((user) => {
  test.describe(`Deleted obligation not shown in compliance register `, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await updateOrganisationFeatures(['compliance']);
      await page.goto('/');

      await app.obligationScenarios.createObligation({
        title: 'Obligation 1',
        interpretation: 'Interpretation 1',
        adherence: 'Flexible',
        owners: ['ReadOnly1'],
        contributors: ['Standard1'],
        testFrequency: 'Weekly',
        type: 'High-level standard',
      });

      await app.obligationDetailsPage.deleteButton.click();
      await app.obligationDetailsPage.deleteModal.confirmButton.click();
      await app.obligationDetailsPage.notificationBanner.expectNotification(
        'Obligation deleted successfully'
      );

      await expect(app.complianceRegisterPage.header.title).toHaveText(
        'Compliance Register',
        {
          timeout: 10000,
        }
      );

      await expect(
        page.locator(
          app.complianceRegisterPage.table.tableWrapper
            .findLoadingText()
            .toSelector()
        )
      ).toHaveCount(0);

      await expect(app.complianceRegisterPage.header.count).toHaveText(`(0)`);
      await app.complianceRegisterPage.table.expectRowCount(0);
    });
  });
});

test('Obligation next test date updated when adding a rating', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['compliance']);
  await page.goto('/');
  const title = 'Obligation 1';
  await app.obligationScenarios.createObligation({
    title,
    interpretation: 'Interpretation 1',
    adherence: 'Flexible',
    owners: ['ReadOnly1'],
    contributors: ['Standard1'],
    testFrequency: 'Weekly',
    testScheduleStartDate: '2021-01-01',
    type: 'High-level standard',
  });
  await app.complianceRegisterPage.navigateToAndAssertTitle();
  await app.complianceRegisterPage.table.expectRowCount(1);
  await app.complianceRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.complianceRegisterPage.table.expectRowToContain(1, {
    'Latest rating date': '-',
    'Next test Date': '1 Jan 2021',
  });

  await app.complianceRegisterPage.table.clickCellText(
    'Obligation title',
    1,
    title
  );

  await app.obligationDetailsPage.ratingsTab.selectTab();
  await app.obligationDetailsPage.ratingsTab.addButton.click();
  await app.obligationDetailsPage.ratingsTab.ratingModal.ratingForm.fillFormAndClickSave(
    {
      rating: 'Non-compliant',
      rationale: 'Rationale...',
      resultDate: '2021-02-03',
    }
  );

  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Finding added successfully'
  );
  await app.obligationDetailsPage.ratingsTab.table.expectRowCount(1);
  await app.obligationDetailsPage.ratingsTab.table.expectRowToContain(1, {
    'Result date': '3 Feb 2021',
    'Title (assessment)': '-',
    Rating: 'Non-compliant',
    Status: '',
    'Completion date (assessment)': '-',
    'Next assessment date (assessment)': '-',
  });

  await app.complianceRegisterPage.navigateToAndAssertTitle();
  await app.complianceRegisterPage.table.expectRowToContain(1, {
    'Latest rating date': '3 Feb 2021',
    'Next test Date': '5 Feb 2021',
  });
});

test('Cannot set title, type, parent obligation, adherence or owner as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'compliance']);
  await page.goto('/');
  await app.obligationScenarios.navigateToCreateObligationPage();

  const form = app.obligationDetailsPage.detailsTab.obligationForm;
  const requiredFields = [
    form.fields.title,
    form.fields.type,
    form.fields.parent,
    form.fields.adherence,
    form.fields.owners,
  ];

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

test('Can set interpretation, contributors, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'compliance']);
  await page.goto('/');
  await app.obligationScenarios.navigateToCreateObligationPage();

  const form = app.obligationDetailsPage.detailsTab.obligationForm;

  const unrequiredFields = [
    form.fields.description,
    form.fields.interpretation,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Onligation 1',
    adherence: 'Flexible',
    owners: ['Standard1'],
    type: 'High-level standard',
  });
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Obligation added successfully'
  );
});

test('Can add conditions on interpretation, contributors, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'compliance']);
  await page.goto('/');
  await app.obligationScenarios.navigateToCreateObligationPage();

  const form = app.obligationDetailsPage.detailsTab.obligationForm;

  const conditionalFields = [
    form.fields.interpretation,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Title=test' },
    })),
  ]);

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({
    title: 'test',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    title: 'Onligation 1',
    adherence: 'Flexible',
    owners: ['Standard1'],
    type: 'High-level standard',
  });
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Obligation added successfully'
  );
});

test('Updated issue field names shown in register', async ({ page, app }) => {
  test.slow();
  await updateOrganisationFeatures(['compliance']);
  await page.goto('/');

  const obligation = buildObligationFormValues();
  await app.obligationScenarios.navigateToCreateObligationPage();

  const form = app.obligationDetailsPage.detailsTab.obligationForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.type,
      newLabel: 'New type',
    },
    {
      field: form.fields.interpretation,
      newLabel: 'New interpretation',
      notInRegister: true,
    },
    {
      field: form.fields.adherence,
      newLabel: 'New adherence',
      notInRegister: true,
    },
    {
      field: form.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: form.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: form.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: form.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave(obligation);
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Obligation added successfully'
  );

  await app.complianceRegisterPage.navigateToAndAssertTitle();
  await app.complianceRegisterPage.table.expectRowCount(1);
  await app.complianceRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.complianceRegisterPage.table.expectRowToContain(1, {
    'New contributors': ['Public1'],
    'New departments': '',
    'New owners': ['RiskManager1'],
    'New tags': '',
    'New title': 'Obligation 1',
    'New type': 'High-level standard',
  });
});

test('Updated issue field names shown in custom data source', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['compliance', 'multi_reporting']);
  await page.goto('/');

  const obligation = buildObligationFormValues();
  await app.obligationScenarios.navigateToCreateObligationPage();

  const form = app.obligationDetailsPage.detailsTab.obligationForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.type,
      newLabel: 'New type',
    },
    {
      field: form.fields.interpretation,
      newLabel: 'New interpretation',
      notInRegister: true,
    },
    {
      field: form.fields.adherence,
      newLabel: 'New adherence',
      notInRegister: true,
    },
    {
      field: form.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: form.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: form.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: form.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave(obligation);
  await app.obligationDetailsPage.notificationBanner.expectNotification(
    'Obligation added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Obligation data source',
    dataSource: {
      type: 'Obligations',
      fields: fieldsToRename
        .filter((f) => !f.notInRegister)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New contributors': ['Public1'],
    'New departments': '',
    'New owners': ['RiskManager1'],
    'New tags': '',
    'New title': 'Obligation 1',
    'New type': 'High-level standard',
  });
});
