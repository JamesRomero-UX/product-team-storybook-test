import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { DashboardPage } from '../models/DashboardPage';
import { EnterpriseRiskDetailsPage } from '../models/EnterpriseRiskDetailsPage';
import { EnterpriseRiskRegisterPage } from '../models/EnterpriseRiskRegisterPage';
import { EnterpriseRiskScenarios } from '../scenarios/enterpriseRiskScenarios';
import { RiskScenarios } from '../scenarios/riskScenarios';

test('New enterprise risk shown in register', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
    treatment: 'Terminate',
    tier: 'Tier 1',
  });
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await enterpriseRiskRegister.table.expectRowCount(1);
  await enterpriseRiskRegister.table.toggleAllColumnsToBeVisible();
  await enterpriseRiskRegister.table.expectRowToContain(1, {
    'Created by ID': 'RiskManager1',
    'Created on': expect.any(String),
    Guid: expect.any(String),
    ID: 'ER-1',
    'Parent risk': '-',
    'Risk description': 'Risk 1 description',
    'Risk tier': 'Tier 1',
    'Risk treatment': 'Terminate',
    Title: 'Risk 1',
    'Updated by ID': 'RiskManager1',
    'Updated on': expect.any(String),
  });
});

test('Can filter register by ID', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await enterpriseRiskRegister.table.expectRowCount(2);

  await enterpriseRiskRegister.table.setFilterInput('ID=ER-1');
  await enterpriseRiskRegister.table.toggleColumnVisibilityFromTable(
    'ID',
    true
  );

  await enterpriseRiskRegister.table.expectRowToContain(1, {
    ID: 'ER-1',
    Title: 'Risk 1',
  });
});

test('Can clear filters', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await enterpriseRiskRegister.table.expectRowCount(2);

  await enterpriseRiskRegister.table.setFilterInput('ID=ER-1');
  await enterpriseRiskRegister.table.expectRowCount(1);

  await enterpriseRiskRegister.table.clearFiltersButton.click();
  await enterpriseRiskRegister.table.expectRowCount(2);
});

test('Sort remembered when navigating between pages', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();

  await enterpriseRiskRegister.table.sortColumn('Title');

  await expect(
    await enterpriseRiskRegister.table.getAscSortedColumn()
  ).toHaveText('Title');

  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await enterpriseRiskRegister.navigateToAndAssertTitle();

  await expect(
    await enterpriseRiskRegister.table.getAscSortedColumn()
  ).toHaveText('Title');
});

test('Columns remembered when navigating between pages', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();

  await enterpriseRiskRegister.table.toggleVisibleColumns(['ID']);

  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await enterpriseRiskRegister.navigateToAndAssertTitle();

  const visibleColumns = await enterpriseRiskRegister.table.getVisibleColumns();

  expect(visibleColumns).toEqual(['ID']);
});

test('Filters remembered when navigating between pages', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 2',
    description: 'Risk 2 description',
  });
  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await enterpriseRiskRegister.table.expectRowCount(2);

  await enterpriseRiskRegister.table.setFilterInput('ID=ER-1');
  await enterpriseRiskRegister.table.toggleColumnVisibilityFromTable(
    'ID',
    true
  );
  await enterpriseRiskRegister.table.expectRowCount(1);
  await enterpriseRiskRegister.table.expectRowToContain(1, {
    ID: 'ER-1',
    Title: 'Risk 1',
  });
  const dashboard = new DashboardPage(page);
  await dashboard.navigateToAndAssertTitle('Dashboard');

  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await enterpriseRiskRegister.table.toggleColumnVisibilityFromTable(
    'ID',
    true
  );
  await enterpriseRiskRegister.table.expectRowCount(1);
  await enterpriseRiskRegister.table.expectRowToContain(1, {
    ID: 'ER-1',
    Title: 'Risk 1',
  });
});

test('Deleted enterprise risk not shown in enterprise risk register', async ({
  page,
}) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const newRiskName = 'Risk 1';

  const enterpriseRiskRegister = new EnterpriseRiskRegisterPage(page);
  await enterpriseRiskRegister.navigateToAndAssertTitle();
  await expect(enterpriseRiskRegister.header.count).toHaveText(`(0)`);

  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });

  const enterpriseRiskDetailsPage = new EnterpriseRiskDetailsPage(page);

  await enterpriseRiskDetailsPage.deleteButton.click();
  await enterpriseRiskDetailsPage.deleteModal.confirmButton.click();
  await enterpriseRiskDetailsPage.notificationBanner.expectNotification(
    'Enterprise risk deleted successfully'
  );

  await expect(enterpriseRiskRegister.header.title).toHaveText(
    'Enterprise Risk Register',
    {
      timeout: 10000,
    }
  );

  await expect(
    page.locator(
      enterpriseRiskRegister.table.tableWrapper.findLoadingText().toSelector()
    )
  ).toHaveCount(0);

  await expect(enterpriseRiskRegister.header.count).toHaveText(`(0)`);
});

test('updated enterprise risk name shown in register', async ({ page }) => {
  await updateOrganisationFeatures(['enterprise_risk']);

  await page.goto('/');
  const updatedRiskName = 'Risk 2';

  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createEnterpriseRisk({
    riskName: 'Risk 1',
    description: 'Risk 1 description',
  });

  const enterpriseRiskDetailsPage = new EnterpriseRiskDetailsPage(page);
  await enterpriseRiskDetailsPage.detailsTab.riskForm.fillFormAndClickSave({
    riskName: updatedRiskName,
  });
  await enterpriseRiskDetailsPage.notificationBanner.expectNotification(
    'Enterprise risk updated successfully'
  );

  const riskRegister = new EnterpriseRiskRegisterPage(page);
  await expect(riskRegister.header.title).toHaveText(
    `Enterprise Risk Register`
  );

  await expect(await riskRegister.table.getBodyCell('Title', 1)).toHaveText(
    updatedRiskName
  );
});

test('add enterprise risk to entity creates a copy for each entity selected', async ({
  page,
}) => {
  const enterpriseRiskScenarios = new EnterpriseRiskScenarios(page);
  await enterpriseRiskScenarios.createDefaultEnterpriseRisksEntitiesAndRisks();

  const riskScenarios = new RiskScenarios(page);

  await page.goto('/risks');

  await riskScenarios.riskRegister.table.toggleVisibleColumns([
    'Entity',
    'Enterprise risk',
    'Owners',
    'Risk name',
  ]);

  await riskScenarios.riskRegister.table.expectRowCount(8);

  await riskScenarios.riskRegister.table.setFilterInput('Risk name=Risk 1');
  await riskScenarios.riskRegister.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    Owners: ['RiskManager1'],
    Entity: 'New Zealand',
    'Enterprise risk': 'Enterprise',
  });
  await riskScenarios.riskRegister.table.expectRowToContain(2, {
    'Risk name': 'Risk 1',
    Owners: ['RiskManager1'],
    Entity: 'Australia',
    'Enterprise risk': 'Enterprise',
  });

  await riskScenarios.riskRegister.table.clearFiltersButton.click();
  await riskScenarios.riskRegister.table.setFilterInput('Risk name=Risk 2');
  await riskScenarios.riskRegister.table.expectRowToContain(1, {
    'Risk name': 'Risk 2',
    Owners: '',
    Entity: 'New Zealand',
    'Enterprise risk': 'Enterprise',
  });
  await riskScenarios.riskRegister.table.expectRowToContain(2, {
    'Risk name': 'Risk 2',
    Owners: '',
    Entity: 'Australia',
    'Enterprise risk': 'Enterprise',
  });

  await riskScenarios.riskRegister.table.clearFiltersButton.click();
  await riskScenarios.riskRegister.table.setFilterInput('Risk name=Risk 3 - 2');
  await riskScenarios.riskRegister.table.expectRowToContain(1, {
    'Risk name': 'Risk 3 - 2',
    Owners: '',
    Entity: 'New Zealand',
    'Enterprise risk': 'Enterprise',
  });
  await riskScenarios.riskRegister.table.expectRowToContain(2, {
    'Risk name': 'Risk 3 - 2',
    Owners: '',
    Entity: 'Australia',
    'Enterprise risk': 'Enterprise',
  });

  await riskScenarios.riskRegister.table.clearFiltersButton.click();
  await riskScenarios.riskRegister.table.setFilterInput('Risk name=Risk 3 - 1');
  await riskScenarios.riskRegister.table.expectRowToContain(1, {
    'Risk name': 'Risk 3 - 1',
    Owners: '',
    Entity: 'New Zealand',
    'Enterprise risk': 'Enterprise',
  });
  await riskScenarios.riskRegister.table.expectRowToContain(2, {
    'Risk name': 'Risk 3 - 1',
    Owners: '',
    Entity: 'Australia',
    'Enterprise risk': 'Enterprise',
  });
});
