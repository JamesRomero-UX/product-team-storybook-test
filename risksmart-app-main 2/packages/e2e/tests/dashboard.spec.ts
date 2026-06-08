import { expect } from '@playwright/test';
import path from 'path';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { CustomDatasourceWidget } from '../models/components/widgets/CustomDatasourceWidget';
import { DashboardPage } from '../models/DashboardPage';
import { ActionScenarios } from '../scenarios/actionScenarios';
import { CustomDatasourceScenarios } from '../scenarios/customDatasourceScenarios';
import { RiskScenarios } from '../scenarios/riskScenarios';
import { users } from '../users';

test(`Clearing dashboard`, async ({ page, app }) => {
  await page.goto('/');
  await app.dashboardPage.navigateToAndAssertTitle('Dashboard');
  await app.dashboardPage.menu.openAndClickItem('Clear');
  await expect(app.dashboardPage.emptyDashboardMessage).toBeVisible();
});

test(`Add a widget`, async ({ page, app }) => {
  await app.dashboardScenarios.addSmartWidgetToDashboard({
    dataSource: 'Risks',
    chartType: 'Bar Chart',
    category: 'Risk tier',
  });

  await expect(page.getByText('Risks by Risk tier')).toBeVisible();
});

test(`Download all widgets`, async ({ page, app }) => {
  await app.dashboardScenarios.addSmartWidgetToDashboard({
    dataSource: 'Risks',
    chartType: 'Bar Chart',
    category: 'Risk tier',
  });

  await expect(page.getByText('Risks by Risk tier')).toBeVisible();
  await app.dashboardScenarios.downloadAllWidgets();
});

test.skip('when clicking a clickthrough filter on a widget on a data source with a 0 value rating the correct filter is applied on the register', async ({
  page,
  app,
}) => {
  test.slow();
  await page.goto('/');
  const newRiskName = 'Risk 1';

  await app.riskScenarios.createRisk({
    riskName: newRiskName,
    description: 'Risk 1 description',
  });
  const controlTitle = 'Control 1';
  await app.controlScenarios.createControlFromRiskDetails({
    title: controlTitle,
    description: 'Control description 1',
    owners: ['RiskManager1'],
    type: 'Directive',
  });
  await app.riskDetailsPage.controlsTab.table.expectRowToContain(1, {
    'Overall Effectiveness': 'Unrated',
    Owners: ['RiskManager1'],
    Title: 'Control 1',
    Type: 'Directive',
  });

  await app.controlRegisterPage.navigateToAndAssertTitle();
  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlScenarios.navigateToControlDetailsByRegisterColumnName(
    'Title',
    controlTitle
  );
  await app.testResultScenarios.createTestResultFromControlDetails({
    title: 'Test 1',
    controlTestDetails: 'Test 1 details',
    testDate: '2025-01-01',
    performedBy: 'RiskManager1',
    testResult: 'Not effective',
  });

  await app.dashboardScenarios.addSmartWidgetToDashboard({
    dataSource: 'Controls',
    chartType: 'Pie Chart',
    category: 'Overall Effectiveness',
  });

  await expect(
    page.getByText('Controls by Overall Effectiveness')
  ).toBeVisible();

  await app.dashboardScenarios.clickOnPieChartSegment('Not eff');
  await expect(page).toHaveURL(/.*\/controls/);

  await app.controlRegisterPage.table.expectRowCount(1);
  await app.controlRegisterPage.table.expectRowToContain(1, {
    Title: controlTitle,
    'Overall Effectiveness': 'Not effective',
  });
});

[users.customerSupport].forEach((user) => {
  test.use({ user });
  test(`Add a custom data source tile widget`, async ({ page }) => {
    await updateOrganisationFeatures(['multi_reporting']);
    await page.goto('/');
    const customDatasourceScenarios = new CustomDatasourceScenarios(page);
    const customDatasourceTitle = 'My data source';
    await customDatasourceScenarios.createCustomDatasource({
      title: customDatasourceTitle,
      dataSource: {
        type: 'Risks',
        fields: [{ defaultLabel: 'Risk name' }],
      },
    });

    const dashboard = new DashboardPage(page);
    await dashboard.navigateToAndAssertTitle('Dashboard');
    await dashboard.menu.openAndClickItem('Clear');
    await expect(dashboard.emptyDashboardMessage).toBeVisible();
    await dashboard.addWidgetButton.click();

    await dashboard.dragWidgetOnToBoard('Custom Data Source Widget');
    await expect(dashboard.emptyDashboardMessage).not.toBeVisible();

    const customDatasourceWidget = new CustomDatasourceWidget(page);
    await customDatasourceWidget.configureWidgetButton.click();
    await customDatasourceWidget.settingsForm.fillFormAndClickSave({
      dataSource: customDatasourceTitle,
      chartType: 'Tile',
      aggregationType: 'Count',
    });

    await dashboard.notificationBanner.expectNotification(
      'Widget added successfully'
    );

    await expect(customDatasourceWidget.kpiValue).toHaveText('0');
  });

  test(`Custom datasource "not found" message displayed on widget after datasource deleted`, async ({
    page,
  }) => {
    await updateOrganisationFeatures(['multi_reporting']);
    await page.goto('/');
    const customDatasourceScenarios = new CustomDatasourceScenarios(page);
    const customDatasourceTitle = 'My data source';
    await customDatasourceScenarios.createCustomDatasource({
      title: customDatasourceTitle,
      dataSource: {
        type: 'Risks',
        fields: [{ defaultLabel: 'Risk name' }],
      },
    });

    const dashboard = new DashboardPage(page);
    await dashboard.navigateToAndAssertTitle('Dashboard');
    await dashboard.menu.openAndClickItem('Clear');
    await expect(dashboard.emptyDashboardMessage).toBeVisible();
    await dashboard.addWidgetButton.click();

    await dashboard.dragWidgetOnToBoard('Custom Data Source Widget');
    await expect(dashboard.emptyDashboardMessage).not.toBeVisible();

    const customDatasourceWidget = new CustomDatasourceWidget(page);
    await customDatasourceWidget.configureWidgetButton.click();
    await customDatasourceWidget.settingsForm.fillFormAndClickSave({
      dataSource: customDatasourceTitle,
      chartType: 'Table',
    });

    await dashboard.notificationBanner.expectNotification(
      'Widget added successfully'
    );

    await customDatasourceScenarios.deleteCustomDatasourceByTitle(
      customDatasourceTitle
    );

    await dashboard.navigateToAndAssertTitle('Dashboard');
    await expect(customDatasourceWidget.alertContent).toHaveText(
      'Custom datasource not found'
    );
  });

  test(`Add a custom data source table widget`, async ({ page }) => {
    await updateOrganisationFeatures(['multi_reporting']);
    await page.goto('/');
    const customDatasourceScenarios = new CustomDatasourceScenarios(page);
    const riskScenarios = new RiskScenarios(page);

    await riskScenarios.createRisk({
      tier: 'Tier 1',
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    const customDatasourceTitle = 'My data source';
    await customDatasourceScenarios.createCustomDatasource({
      title: customDatasourceTitle,
      dataSource: {
        type: 'Risks',
        fields: [{ defaultLabel: 'Risk name' }],
      },
    });

    const dashboard = new DashboardPage(page);
    await dashboard.navigateToAndAssertTitle('Dashboard');
    await dashboard.menu.openAndClickItem('Clear');
    await expect(dashboard.emptyDashboardMessage).toBeVisible();
    await dashboard.addWidgetButton.click();

    await dashboard.dragWidgetOnToBoard('Custom Data Source Widget');
    await expect(dashboard.emptyDashboardMessage).not.toBeVisible();

    const customDatasourceWidget = new CustomDatasourceWidget(page);
    await customDatasourceWidget.configureWidgetButton.click();
    await customDatasourceWidget.settingsForm.fillFormAndClickSave({
      dataSource: customDatasourceTitle,
      chartType: 'Table',
    });
    await dashboard.notificationBanner.expectNotification(
      'Widget added successfully'
    );
    await customDatasourceWidget.table.expectRowCount(1);
    await customDatasourceWidget.table.expectRowToContain(1, {
      'Risk name': 'Risk 1',
    });
  });

  test.skip(`Add a custom data source bar chart widget`, async ({ page }) => {
    await updateOrganisationFeatures(['multi_reporting']);
    await page.goto('/');
    const customDatasourceScenarios = new CustomDatasourceScenarios(page);
    const riskScenarios = new RiskScenarios(page);

    await riskScenarios.createRisk({
      tier: 'Tier 1',
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    const customDatasourceTitle = 'My data source';
    await customDatasourceScenarios.createCustomDatasource({
      title: customDatasourceTitle,
      dataSource: {
        type: 'Risks',
        fields: [{ defaultLabel: 'Risk name' }],
      },
    });

    const dashboard = new DashboardPage(page);
    await dashboard.navigateToAndAssertTitle('Dashboard');
    await dashboard.menu.openAndClickItem('Clear');
    await expect(dashboard.emptyDashboardMessage).toBeVisible();
    await dashboard.addWidgetButton.click();

    await dashboard.dragWidgetOnToBoard('Custom Data Source Widget');
    await expect(dashboard.emptyDashboardMessage).not.toBeVisible();

    const customDatasourceWidget = new CustomDatasourceWidget(page);
    await customDatasourceWidget.configureWidgetButton.click();
    await customDatasourceWidget.settingsForm.fillFormAndClickSave({
      dataSource: customDatasourceTitle,
      chartType: 'Bar Chart',
      category: 'Risks / Risk name',
      aggregationType: 'Count',
    });

    await dashboard.notificationBanner.expectNotification(
      'Widget added successfully'
    );

    await expect(
      page.locator(
        customDatasourceWidget.barChartWrapper.findXTicks().toSelector()
      )
    ).toBeVisible();
    await expect(page).toHaveScreenshot({
      stylePath: path.join(__dirname, '../screenshot.css'),
    });
  });
});

[users.customerSupport, users.riskManager].forEach((user) => {
  test.describe('Tier 1 risk checks', () => {
    test.use({ user });
    test(`Toggle dashboard type for ${user.role}`, async ({ page }) => {
      await page.goto('/');
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToAndAssertTitle('My Items');

      await dashboard.toggleDashboardType('Dashboard');
      await expect(dashboard.header.title).toHaveText('Dashboard');

      await dashboard.toggleDashboardType('My Items');
      await expect(dashboard.header.title).toHaveText('My Items');
    });

    test(`Ribbon correctly displayed for ${user.role}`, async ({ page }) => {
      await page.goto('/');
      const riskScenarios = new RiskScenarios(page);
      await riskScenarios.createRisk({
        riskName: `Risk for ${user.friendlyName}`,
        description: `Risk description for ${user.friendlyName}`,
        status: 'Active',
        treatment: 'Terminate',
        owners: [user.friendlyName],
        tier: 'Tier 1',
      });
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToAndAssertTitle('My Items');

      await dashboard.filterDropdown.selectOptionsByValue('owner');

      const ribbonItem = dashboard.ribbon.getRibbonItem('My Risks');
      await expect(ribbonItem).toBeVisible();
      await expect(ribbonItem.locator('h1')).toHaveText('1');
    });
  });
});

[users.standard].forEach((user) => {
  test.describe('Action checks', () => {
    test.use({ user });
    test(`Toggle dashboard type for ${user.role}`, async ({ page }) => {
      await page.goto('/');
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToAndAssertTitle('My Items');

      await dashboard.toggleDashboardType('Dashboard');
      await expect(dashboard.header.title).toHaveText('Dashboard');

      await dashboard.toggleDashboardType('My Items');
      await expect(dashboard.header.title).toHaveText('My Items');
    });

    test(`Ribbon correctly displayed for ${user.role}`, async ({ page }) => {
      await page.goto('/');
      const actionScenarios = new ActionScenarios(page);
      await actionScenarios.createActionFromRegister({
        title: `Action for ${user.friendlyName}`,
        description: `Action description for ${user.friendlyName}`,
        owners: [user.friendlyName],
        priority: 'Low',
        dateRaised: '2025-01-01',
        targetCloseDate: '2125-01-01',
      });
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToAndAssertTitle('My Items');

      await dashboard.filterDropdown.selectOptionsByValue('owner');

      const ribbonItem = dashboard.ribbon.getRibbonItem('My Actions');
      await expect(ribbonItem).toBeVisible();
      await expect(ribbonItem.locator('h1')).toHaveText('1');
    });
  });
});
