import { expect } from '@playwright/test';

import {
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import { AddRiskPage } from '../models/AddRiskPage';
import { DashboardPage } from '../models/DashboardPage';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { CustomisableFieldModal } from '../models/modals/CustomisableFieldModal';
import { RiskDetailsPage } from '../models/RiskDetailsPage';
import { RiskRegisterPage } from '../models/RiskRegisterPage';
import { ImpactRatingScenarios } from '../scenarios/impactRatingsScenarios';
import { RiskScenarios } from '../scenarios/riskScenarios';
import {
  buildRequiredRiskFormValues,
  buildRiskFormValues,
} from '../testData/riskFormValuesBuilder';

test('Validation error shown when creating a risk without a name', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await app.addRiskPage.detailsTab.riskForm.saveButton.click();
  const errors = await app.addRiskPage.detailsTab.riskForm.getErrors();
  expect(errors).toEqual({
    riskName: 'Required',
    description: 'Required',
  });
});

test('Saved risk details shown in form', async ({ page, app }) => {
  await insertTagTypes([
    { Name: 'Tag 1', Description: 'Tag 1 description' },
    { Name: 'Tag 2', Description: 'Tag 2 description' },
  ]);
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
    { Name: 'Department 2', Description: 'Department 2 description' },
  ]);
  await page.goto('/');

  const risk = buildRiskFormValues({
    tags: ['Tag 1', 'Tag 2'],
    departments: ['Department 1', 'Department 2'],
  });

  await app.riskScenarios.createRisk(risk);

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.clickCellLink('Risk name', 1);

  await app.riskDetailsPage.detailsTab.riskForm.expectValues({
    ...risk,
    timeToCompleteValue: risk.timeToCompleteValue.toString(),
    nextTestDue: '2023-10-01',
    nextTestOverdue: '2023-10-03',
  });
});

test('New risk shown with custom attributes in register', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await app.customAttributeScenarios.addCustomAttribute(
    app.riskDetailsPage.detailsTab.riskForm,
    {
      label: 'Custom field 1',
      fieldType: 'Text',
    }
  );
  const risk = buildRiskFormValues();
  await app.riskScenarios.createRisk(risk, [
    { label: 'Custom field 1', type: 'Text', value: 'Custom field 1 value' },
  ]);

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Risk name': risk.riskName,
    'Parent risk': 'None',
    'Risk tier': risk.tier,
    'Risk treatment': risk.treatment,
    'Risk status': risk.status,
    Owners: ['ReadOnly1'],
    Contributors: ['Standard1'],
    'Linked controls': '0',
    'Lower appetite': '',
    'Upper appetite': '',
    'Risk description': risk.description,
    'Created by ID': 'auth0|644151efc3a961d2784456d9',
    'Associated risk ID': '-',
    'Created by': 'RiskManager1',
    'Latest rating date': '-',
    'Next test date': '1 Oct 2023',
    'Assessment frequency': 'Weekly',
    'Custom field 1': 'Custom field 1 value',
  });
});

test('Can filter register by ID', async ({ page, app }) => {
  await page.goto('/');
  const risk1 = buildRequiredRiskFormValues();
  await app.riskScenarios.createRisk(risk1);
  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput('ID=R-1');
  await app.riskRegisterPage.table.toggleColumnVisibilityFromTable('ID', true);

  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Risk name': 'Risk 1',
  });
});

test('Can clear filters', async ({ page, app }) => {
  await page.goto('/');
  const risk1 = buildRequiredRiskFormValues();
  await app.riskScenarios.createRisk(risk1);
  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput('ID=R-1');
  await app.riskRegisterPage.table.expectRowCount(1);

  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(2);
});

test('Sort remembered when navigating between pages', async ({ page, app }) => {
  await page.goto('/');
  const risk1 = buildRequiredRiskFormValues();
  await app.riskScenarios.createRisk(risk1);
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();

  await app.riskRegisterPage.table.sortColumn('Risk name');

  await expect(
    await app.riskRegisterPage.table.getAscSortedColumn()
  ).toHaveText('Risk name');
  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await app.riskRegisterPage.navigateToAndAssertTitle();

  await expect(
    await app.riskRegisterPage.table.getAscSortedColumn()
  ).toHaveText('Risk name');
});

test('Columns remembered when navigating between pages', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.riskRegisterPage.navigateToAndAssertTitle();

  await app.riskRegisterPage.table.toggleVisibleColumns(['ID']);

  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await app.riskRegisterPage.navigateToAndAssertTitle();

  const visibleColumns = await app.riskRegisterPage.table.getVisibleColumns();

  expect(visibleColumns).toEqual(['ID']);
});

test('Filters remembered when navigating between pages', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput('ID=R-1');
  await app.riskRegisterPage.table.toggleColumnVisibilityFromTable('ID', true);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Risk name': 'Risk 1',
  });

  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.toggleColumnVisibilityFromTable('ID', true);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Risk name': 'Risk 1',
  });
});

test('Deleted risk not shown in risk register', async ({ page, app }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await expect(app.riskRegisterPage.header.count).toHaveText(`(0)`);

  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.deleteButton.click();
  await app.riskDetailsPage.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk deleted successfully'
  );

  await expect(app.riskRegisterPage.header.title).toHaveText('Risk Register', {
    timeout: 10000,
  });

  await expect(
    page.locator(
      app.riskRegisterPage.table.tableWrapper.findLoadingText().toSelector()
    )
  ).toHaveCount(0);

  await expect(app.riskRegisterPage.header.count).toHaveText(`(0)`);
});

test('updated risk name shown in register', async ({ page }) => {
  await page.goto('/');
  const updatedRiskName = 'Risk 2';

  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.detailsTab.riskForm.fillFormAndClickSave({
    riskName: updatedRiskName,
  });

  await riskDetailsPage.notificationBanner.expectNotification(
    'Risk updated successfully'
  );

  const riskRegister = new RiskRegisterPage(page);
  await expect(riskRegister.header.title).toHaveText(`Risk Register`);

  await expect(await riskRegister.table.getBodyCell('Risk name', 1)).toHaveText(
    updatedRiskName
  );
});

test('Risk ratings tab table is sorted by result date desc', async ({
  page,
}) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';

  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.ratingsTab.selectTab();
  await expect(
    await riskDetailsPage.ratingsTab.riskRatingTable.getDescSortedColumn()
  ).toHaveText('Rating date');
});

test('Risk appetites tab table is sorted by effective date desc', async ({
  page,
}) => {
  await page.goto('/');
  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.riskAppetiteTab.selectTab();
  await expect(
    await riskDetailsPage.riskAppetiteTab.table.getDescSortedColumn()
  ).toHaveText('Effective date');
});

test('Risk actions tab table is sorted by effective date desc', async ({
  page,
}) => {
  await page.goto('/');
  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.actionsTab.selectTabAndAssertTitle('Actions');
  await expect(
    await riskDetailsPage.actionsTab.table.getDescSortedColumn()
  ).toHaveText('Raised');
});

test('Risk indicators tab table is sorted by latest result date desc', async ({
  page,
}) => {
  await page.goto('/');
  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.indicatorsTab.selectTabAndAssertTitle('Indicators');
  await expect(
    await riskDetailsPage.indicatorsTab.table.getDescSortedColumn()
  ).toHaveText('Latest result date');
});

test('Risk acceptances tab table is sorted by effective date desc', async ({
  page,
}) => {
  await page.goto('/');
  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.riskAcceptancesTab.selectTab();
  await riskDetailsPage.riskAcceptancesTab.table.toggleColumnVisibilityFromTable(
    'Updated on'
  );
  await expect(
    await riskDetailsPage.riskAcceptancesTab.table.getDescSortedColumn()
  ).toHaveText('Updated on');
});

test('Can set default value for risk Title that is automatically populated when creating a new risk', async ({
  page,
}) => {
  await page.goto('/');
  const riskRegister = new RiskRegisterPage(page);
  await riskRegister.navigateToAndAssertTitle();
  await riskRegister.addButton.click();

  const addRiskPage = new AddRiskPage(page);
  await expect(addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = addRiskPage.detailsTab.riskForm;
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.fields.riskName.editFieldButton.click();

  const customisableFieldModal = new CustomisableFieldModal(page);
  await customisableFieldModal.customisableFieldForm.fillFormAndClickSave({
    setDefaultValue: true,
    defaultValue: 'Risk 101',
  });

  await addRiskPage.notificationBanner.expectNotification(
    'Custom field updated successfully'
  );

  await riskRegister.navigateToAndAssertTitle();
  await riskRegister.addButton.click();
  await expect(
    await addRiskPage.detailsTab.riskForm.fields.riskName.getValue()
  ).toEqual('Risk 101');
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

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
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
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 7,
  });

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
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
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'weeks',
    timeToCompleteValue: 9999,
  });

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Test schedule status': 'Due',
  });
});

test('Can create a risk with an adhoc next test date', async ({ page }) => {
  await page.goto('/');
  const newRiskName = 'Risk 1';

  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
    testFrequency: 'Ad Hoc',
    nextTestDue: '2020-01-01',
    timeToCompleteUnit: 'weeks',
    timeToCompleteValue: 2,
  });

  const riskRegister = new RiskRegisterPage(page);
  await riskRegister.navigateToAndAssertTitle();
  await riskRegister.table.expectRowCount(1);
  await riskRegister.table.toggleAllColumnsToBeVisible();
  await riskRegister.table.expectRowToContain(1, {
    ID: 'R-1',
    'Latest rating date': '-',
    'Next test date': '1 Jan 2020',
    'Next test overdue': '15 Jan 2020',
  });
});

test('Risk next test date updated when creating a risk rating', async ({
  page,
}) => {
  test.slow();
  const newRiskName = 'Risk 1';
  await page.goto('/');
  const riskScenarios = new RiskScenarios(page);
  await riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  const riskRegister = new RiskRegisterPage(page);
  await riskRegister.navigateToAndAssertTitle();
  await riskRegister.table.expectRowCount(1);
  await riskRegister.table.toggleAllColumnsToBeVisible();
  await riskRegister.table.expectRowToContain(1, {
    ID: 'R-1',
    'Latest rating date': '-',
    'Next test date': '2 Feb 2021', // start date as no tests yet
    'Next test overdue': '12 Feb 2021',
  });

  await riskRegister.table.clickCellText('Risk name', 1, newRiskName);

  const riskDetailsPage = new RiskDetailsPage(page);
  await riskDetailsPage.ratingsTab.selectTab();
  await riskDetailsPage.ratingsTab.addButton.click();
  await riskDetailsPage.ratingsTab.ratingModal.ratingForm.fillFormAndClickSave({
    likelihood: 'Likely',
    impact: 'Moderate',
    rating: 'High',
    resultDate: '2021-02-10',
  });

  await riskDetailsPage.notificationBanner.expectNotification(
    'Finding added successfully'
  );
  await riskDetailsPage.ratingsTab.riskRatingTable.expectRowCount(1);
  await riskDetailsPage.ratingsTab.riskRatingTable.expectRowToContain(1, {
    'Assessment status': '',
    Impact: 'Moderate',
    Likelihood: 'Likely',
    'Linked assessment': '-',
    Rating: 'High',
    'Rating date': '10 Feb 2021',
    'Result type': 'Inherent',
  });
  await riskRegister.navigateToAndAssertTitle();
  await riskRegister.table.expectRowCount(1);
  await riskRegister.table.toggleAllColumnsToBeVisible();
  await riskRegister.table.expectRowToContain(1, {
    ID: 'R-1',
    'Latest rating date': '10 Feb 2021',
    'Next test date': '16 Feb 2021', // start date plus 2 weeks (as 1 week test performed)
    'Next test overdue': '26 Feb 2021', //Next test date + 10 days
  });
});

test('Risk next test date updated when rating impacts', async ({
  page,
  app,
}) => {
  const newRiskName = 'Risk 1';
  await updateOrganisationFeatures(['impacts']);
  await page.goto('/');

  await app.impactScenarios.createImpact({
    name: 'Impact 1',
    rationale: 'Rationale 1',
  });

  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
    testFrequency: 'Weekly',
    timeToCompleteUnit: 'days',
    timeToCompleteValue: 10,
    testScheduleStartDate: '2021-02-02',
  });

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Latest rating date': '-',
    'Next test date': '2 Feb 2021', // start date as no tests yet
    'Next test overdue': '12 Feb 2021',
  });

  await app.riskRegisterPage.table.clickCellText('Risk name', 1, newRiskName);

  const impactRatingScenarios = new ImpactRatingScenarios(page);
  await impactRatingScenarios.createImpactRatingFromRiskDetailPage({
    likelihood: '1',
    ratings: ['1'],
    ratingDate: '2021-02-10',
  });

  await app.riskDetailsPage.impactsTab.table.expectRowToContain(1, {
    'Completed by': 'RiskManager1',
    Likelihood: '',
    'Likelihood performance': 'Unrated',
    Name: 'Impact 1',
    'Performance rating': '',
    'Performance score': '',
    'Rating date': '10 Feb 2021',
    'Rating score': '1',
    Rationale: 'Rationale 1',
    Status: 'Active',
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.riskRegisterPage.table.expectRowToContain(1, {
    ID: 'R-1',
    'Latest rating date': '10 Feb 2021',
    'Next test date': '16 Feb 2021', // start date plus 2 weeks (as 1 week test performed)
    'Next test overdue': '26 Feb 2021', //Next test date + 10 days
  });
});

test('Can add a linked item', async ({ page, app }) => {
  await page.goto('/');

  await app.issueScenarios.createIssue({
    title: 'Issue 1',
    details: 'Issue description 1',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.linkedItemsTab.selectTabAndAssertTitle(
    'Linked items'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(0);
  await app.riskDetailsPage.linkedItemsTab.linkItemsButton.click();
  await app.riskDetailsPage.linkedItemsTab.linkItemsModal.linkedItemForm.fillFormAndClickSave(
    {
      type: 'Issue',
      targetTitle: 'Issue 1',
    }
  );

  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Linked item added successfully'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(1);
  await app.riskDetailsPage.linkedItemsTab.table.expectRowToContain(1, {
    ID: 'I-1',
    Name: 'Issue 1',
    Type: 'Issue',
  });
});

test('Can remove a linked item', async ({ page, app }) => {
  await page.goto('/');
  await app.issueScenarios.createIssue({
    title: 'Issue 1',
    details: 'Issue description 1',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  await app.riskDetailsPage.linkedItemsTab.selectTabAndAssertTitle(
    'Linked items'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(0);
  await app.riskDetailsPage.linkedItemsTab.linkItemsButton.click();
  await app.riskDetailsPage.linkedItemsTab.linkItemsModal.linkedItemForm.fillFormAndClickSave(
    {
      type: 'Issue',
      targetTitle: 'Issue 1',
    }
  );

  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Linked item added successfully'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(1);
  await app.riskDetailsPage.linkedItemsTab.table.expectRowToContain(1, {
    ID: 'I-1',
    Name: 'Issue 1',
    Type: 'Issue',
  });

  await app.riskDetailsPage.linkedItemsTab.table.checkRow(1);
  await app.riskDetailsPage.linkedItemsTab.unlinkButton.click();
  await app.riskDetailsPage.linkedItemsTab.removeLinkModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Linked item removed successfully'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(0);
});

test('Parent risk is disabled when already linked to a risk in linked items', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.riskScenarios.createRisk({
    riskName: 'Unlinked Risk',
    description: 'Unlinked Risk description',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Linked Risk 1',
    description: 'Linked Risk 1 description',
  });
  await app.riskScenarios.createRisk({
    riskName: 'Linked Risk 2',
    description: 'Linked Risk 2 description',
  });

  await app.riskDetailsPage.linkedItemsTab.selectTabAndAssertTitle(
    'Linked items'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(0);
  await app.riskDetailsPage.linkedItemsTab.linkItemsButton.click();
  await app.riskDetailsPage.linkedItemsTab.linkItemsModal.linkedItemForm.fillFormAndClickSave(
    {
      type: 'Risk',
      targetTitle: 'Linked Risk 1',
    }
  );

  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Linked item added successfully'
  );
  await app.riskDetailsPage.linkedItemsTab.table.expectRowCount(1);
  await app.riskDetailsPage.linkedItemsTab.table.expectRowToContain(1, {
    ID: 'R-2',
    Name: 'Linked Risk 1',
    Type: 'Risk',
  });

  await app.riskDetailsPage.detailsTab.selectTab();
  await app.riskDetailsPage.detailsTab.riskForm.fields.tier.setValue('Tier 2');

  await app.riskDetailsPage.detailsTab.riskForm.fields.parentRiskTitle.formField.click();

  const linkedRisk1Option = page.getByRole('option', { name: 'Linked Risk 1' });
  const unlinkedRiskOption = page.getByRole('option', {
    name: 'Unlinked Risk',
  });

  await expect(linkedRisk1Option).toBeDisabled();
  await expect(unlinkedRiskOption).toBeEnabled();
});

test('Cannot change the Required, Hidden, Read only, of risk Title', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['multi_reporting']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.fields.riskName.editFieldButton.click();

  await app.editFieldModal.editFieldForm.expectDisabledFieldState({
    description: false,
    enableCustomLabel: false,
    readonly: true,
    required: true,
    hidden: true,
    setDefaultValue: false,
  });
});

test('Can set the description field to be read only', async ({ page, app }) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.fields.description.editFieldButton.click();

  await app.editFieldModal.editFieldForm.expectDisabledFieldState({
    description: false,
    enableCustomLabel: false,
    readonly: false,
    required: false,
    hidden: false,
  });
  await app.editFieldModal.editFieldForm.fillFormAndClickSave({
    readonly: true,
  });
  await app.addRiskPage.notificationBanner.expectNotification(
    'Custom field updated successfully'
  );
  await riskForm.expectDisabledFieldState(
    expect.objectContaining({
      riskName: false,
      description: true,
    })
  );

  await riskForm.fields.description.editFieldButton.click();
  await app.editFieldModal.editFieldForm.expectValues({
    description: '',
    enableCustomLabel: false,
    readonly: true,
    required: false,
    hidden: false,
  });
});

test('Updated risk field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  const risk = buildRiskFormValues({});
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = app.addRiskPage.detailsTab.riskForm;
  await riskForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: riskForm.fields.riskName,
      newLabel: 'New title',
    },
    {
      field: riskForm.fields.description,
      newLabel: 'New description',
    },
    {
      field: riskForm.fields.tier,
      newLabel: 'New tier',
    },
    {
      field: riskForm.fields.treatment,
      newLabel: 'New treatment',
    },
    {
      field: riskForm.fields.status,
      newLabel: 'New status',
    },
    {
      field: riskForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: riskForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: riskForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: riskForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await riskForm.saveFormConfigurationButton.click();

  await riskForm.fillFormAndClickSave(risk);
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'New title': risk.riskName,
    'New description': risk.description,
    'New tier': risk.tier,
    'New treatment': risk.treatment,
    'New status': risk.status,
    'New owners': ['ReadOnly1'],
    'New contributors': ['Standard1'],
    'New tags': '',
    'New departments': '',
  });
});

test('Updated risk field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const risk = buildRiskFormValues({});
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = app.addRiskPage.detailsTab.riskForm;
  await riskForm.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: riskForm.fields.riskName,
      newLabel: 'New title',
    },
    {
      field: riskForm.fields.description,
      newLabel: 'New description',
    },
    {
      field: riskForm.fields.tier,
      newLabel: 'New tier',
    },
    {
      field: riskForm.fields.treatment,
      newLabel: 'New treatment',
    },
    {
      field: riskForm.fields.status,
      newLabel: 'New status',
    },
    {
      field: riskForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: riskForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: riskForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: riskForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await riskForm.saveFormConfigurationButton.click();

  await riskForm.fillFormAndClickSave(risk);
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Risks data source',
    dataSource: {
      type: 'Risks',
      fields: fieldsToRename.map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    'New title': risk.riskName,
    'New description': risk.description,
    'New tier': risk.tier,
    'New treatment': risk.treatment,
    'New status': risk.status,
    'New owners': ['ReadOnly1'],
    'New contributors': ['Standard1'],
    'New tags': '',
    'New departments': '',
  });
});

test('Cannot set risk name, status, owner, risk tier of parent risk as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = app.addRiskPage.detailsTab.riskForm;
  await riskForm.formSettingsButton.openAndClickItem('Edit form');

  const requiredFields = [
    riskForm.fields.riskName,
    riskForm.fields.owners,
    riskForm.fields.tier,
    riskForm.fields.parentRiskTitle,
  ];

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

test('Can set description, risks status, risk treatment, contributor, tags and department as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');

  const risk = buildRequiredRiskFormValues({
    description: undefined,
    status: undefined,
    treatment: undefined,
    contributors: undefined,
    tags: undefined,
    departments: undefined,
  });
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const unrequiredFields = [
    riskForm.fields.description,
    riskForm.fields.status,
    riskForm.fields.treatment,
    riskForm.fields.contributors,
    riskForm.fields.tags,
    riskForm.fields.departments,
  ];

  await app.customAttributeScenarios.bulkEditFields(riskForm, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await riskForm.fillFormAndClickSave(risk);
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
});

test('Can add conditions on description, risks status, risk treatment, contributor, tags and department', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);
  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const conditionalFields = [
    riskForm.fields.description,
    riskForm.fields.status,
    riskForm.fields.treatment,
    riskForm.fields.contributors,
    riskForm.fields.tags,
    riskForm.fields.departments,
  ];

  await riskForm.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: 'Risk name=test',
    });
  }
  await riskForm.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }
  const risk = buildRequiredRiskFormValues({
    riskName: 'test',
    description: undefined,
    status: undefined,
    treatment: undefined,
    contributors: undefined,
    tags: undefined,
    departments: undefined,
  });

  await riskForm.fillForm(risk);
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await riskForm.fillFormAndClickSave({
    riskName: 'minimal test',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await app.riskRegisterPage.navigateToAndAssertTitle();
  await app.riskRegisterPage.table.expectRowCount(1);
});
