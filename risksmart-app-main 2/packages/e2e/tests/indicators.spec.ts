import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { buildIndicatorFormValues } from '../testData/indicatorFormValuesBuilder';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Indicators heading is "Indicators"`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.indicatorsRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test('Can save an risk indicator', async ({ page, app }) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  const indicatorName = 'Indicator 1';
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: indicatorName,
    indicatorType: 'Number',
    unit: 'dogs',
    lowerTolerance: -10,
    lowerAppetite: -5,
    upperAppetite: 5,
    upperTolerance: 10,
    details: 'Indicator details',
    owners: ['RiskManager1'],
  });

  const indicatorsTab = app.riskDetailsPage.indicatorsTab;

  await indicatorsTab.table.expectRowToContain(1, {
    Name: indicatorName,
    Conformance: 'Not set',
    Frequency: '-',
    'Latest result': '-',
  });
});

test('Indicator register refreshed after deleting an indicator result', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const indicatorName = 'Indicator 1';
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: indicatorName,
    owners: ['CustomerSupport1'],
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  const indicatorsTab = app.riskDetailsPage.indicatorsTab;

  await indicatorsTab.table.expectRowCount(1);
  await indicatorsTab.table.expectRowToContain(1, {
    Conformance: 'Not set',
    Frequency: 'Weekly',
    'Latest result': '-',
    'Latest result date': '-',
    Name: indicatorName,
  });

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    ID: 'IN-1',
    'Latest result date': '-',
  });

  await app.indicatorsRegisterPage.table.clickCellText(
    'Name',
    1,
    indicatorName
  );

  await app.indicatorDetailsPage.resultsTab.selectTab();
  await app.indicatorDetailsPage.resultsTab.addButton.click();
  const indicatorResultForm =
    app.indicatorDetailsPage.resultsTab.indicatorResultModal
      .indicatorResultForm;
  await indicatorResultForm.fillFormAndClickSave({
    result: '1',
    details: 'Test 1 details',
    date: '2021-02-10',
  });
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Result added successfully'
  );
  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    ID: 'IN-1',
    'Latest result date': '10 Feb 2021',
    'Latest result': '1',
  });

  await app.indicatorsRegisterPage.table.clickCellLink('Name', 1);

  await app.indicatorDetailsPage.resultsTab.selectTab();
  await app.indicatorDetailsPage.resultsTab.table.checkRow(1);
  await app.indicatorDetailsPage.resultsTab.deleteButton.click();
  await app.indicatorDetailsPage.resultsTab.deleteModal.confirmButton.click();
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Result deleted successfully'
  );
  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    ID: 'IN-1',
    'Latest result date': '-',
    'Latest result': '-',
  });
});

test('Can update a risk indicator', async ({ page, app }) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const indicatorName = 'Indicator 1';
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: indicatorName,
    owners: ['CustomerSupport1'],
    testFrequency: 'Daily',
  });

  const indicatorsTab = app.riskDetailsPage.indicatorsTab;

  await indicatorsTab.table.expectRowCount(1);
  await indicatorsTab.table.expectRowToContain(1, {
    Conformance: 'Not set',
    Frequency: 'Daily',
    'Latest result': '-',
    'Latest result date': '-',
    Name: 'Indicator 1',
  });

  await (await indicatorsTab.table.getBodyCell('Name', 1)).click();

  await app.indicatorDetailsPage.indicatorForm.fillFormAndClickSave({
    name: 'Updated indicator 1',
    testFrequency: 'Monthly',
  });
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Indicator updated successfully'
  );
  await indicatorsTab.table.expectRowCount(1);
  await indicatorsTab.table.expectRowToContain(1, {
    Conformance: 'Not set',
    Frequency: 'Monthly',
    'Latest result': '-',
    'Latest result date': '-',
    Name: 'Updated indicator 1',
  });
});

test('Indicator next test date updated when creating result', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const indicatorName = 'Indicator 1';
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: indicatorName,
    owners: ['CustomerSupport1'],
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  const indicatorsTab = app.riskDetailsPage.indicatorsTab;

  await indicatorsTab.table.expectRowCount(1);
  await indicatorsTab.table.expectRowToContain(1, {
    Conformance: 'Not set',
    Frequency: 'Weekly',
    'Latest result': '-',
    'Latest result date': '-',
    Name: indicatorName,
  });

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    ID: 'IN-1',
    'Latest result date': '-',
    'Next test date': '2 Feb 2021', // start date
    'Next test overdue': '12 Feb 2021', //Next test date + 10 days
  });

  await app.indicatorsRegisterPage.table.clickCellText(
    'Name',
    1,
    indicatorName
  );

  await app.indicatorDetailsPage.resultsTab.selectTab();
  await app.indicatorDetailsPage.resultsTab.addButton.click();
  const indicatorResultForm =
    app.indicatorDetailsPage.resultsTab.indicatorResultModal
      .indicatorResultForm;
  await indicatorResultForm.fillFormAndClickSave({
    result: '1',
    details: 'Test 1 details',
    date: '2021-02-10',
  });
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Result added successfully'
  );
  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    ID: 'IN-1',
    'Latest result date': '10 Feb 2021',
    // TODO: Currently backend events update these fields, so in order for the test to pass, these need to be updated syncrounously or get events
    // working for e2e
    // 'Next test date': '9 Feb 2021', // start date plus 2 weeks (as 1 week test performed)
    // 'Next test overdue': '19 Feb 2021',
  });
});

test('Updated indicator field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const indicator = buildIndicatorFormValues({});

  const tab = app.riskDetailsPage.indicatorsTab;

  const form = tab.indicatorModal.indicatorForm;
  await tab.selectTabAndAssertTitle('Indicators');
  await tab.addButton.click();
  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.name,
      newLabel: 'New name',
    },
    {
      field: form.fields.indicatorType,
      newLabel: 'New type',
      notInRegister: true,
    },
    {
      field: form.fields.unit,
      newLabel: 'New unit',
      notInRegister: true,
    },
    {
      field: form.fields.lowerTolerance,
      newLabel: 'New lower tolerance',
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
      field: form.fields.upperTolerance,
      newLabel: 'New upper tolerance',
    },
    {
      field: form.fields.details,
      newLabel: 'New details',
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

  await form.fillFormAndClickSave(indicator);
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Indicator added successfully'
  );

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    'New name': indicator.name,
    'New lower tolerance': indicator.lowerTolerance!.toString(),
    'New lower appetite': indicator.lowerAppetite!.toString(),
    'New upper appetite': indicator.upperAppetite!.toString(),
    'New upper tolerance': indicator.upperTolerance!.toString(),
    'New owners': ['CustomerSupport1'],
    'New contributors': '',
    'New tags': '',
    'New departments': '',
  });
});

test('Test schedule status shows "-" when no schedule is configured', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: 'Indicator 1',
    owners: ['CustomerSupport1'],
  });

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    'Test schedule status': '-',
  });
});

test('Test schedule status shows "Overdue" when overdue date has passed', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: 'Indicator 1',
    owners: ['CustomerSupport1'],
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 7,
  });

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    'Test schedule status': 'Overdue',
  });
});

test('Test schedule status shows "Due" when due date has passed but overdue date has not', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.indicatorScenarios.createIndicatorFromRiskDetails({
    name: 'Indicator 1',
    owners: ['CustomerSupport1'],
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'weeks',
    timeToCompleteValue: 9999,
  });

  await app.indicatorsRegisterPage.navigateToAndAssertTitle();
  await app.indicatorsRegisterPage.table.expectRowCount(1);
  await app.indicatorsRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.indicatorsRegisterPage.table.expectRowToContain(1, {
    'Test schedule status': 'Due',
  });
});

test('Updated indicator field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const indicator = buildIndicatorFormValues({});

  const tab = app.riskDetailsPage.indicatorsTab;

  const form = tab.indicatorModal.indicatorForm;
  await tab.selectTabAndAssertTitle('Indicators');
  await tab.addButton.click();
  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.name,
      newLabel: 'New name',
    },
    {
      field: form.fields.indicatorType,
      newLabel: 'New type',
      notInRegister: true,
    },
    {
      field: form.fields.unit,
      newLabel: 'New unit',
      notInRegister: true,
    },
    {
      field: form.fields.lowerTolerance,
      newLabel: 'New lower tolerance',
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
      field: form.fields.upperTolerance,
      newLabel: 'New upper tolerance',
    },
    {
      field: form.fields.details,
      newLabel: 'New details',
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

  await form.fillFormAndClickSave(indicator);
  await app.indicatorDetailsPage.notificationBanner.expectNotification(
    'Indicator added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Indicators data source',
    dataSource: {
      type: 'Indicators',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
    'New name': indicator.name,
    'New details': indicator.details,
    'New lower tolerance': '-10.0',
    'New lower appetite': '-5.0',
    'New upper appetite': '5.0',
    'New upper tolerance': '10.0',
    'New owners': ['CustomerSupport1'],
    'New contributors': '',
    'New tags': '',
    'New departments': '',
    'New type': 'Number',
    'New unit': indicator.unit,
  });
});
