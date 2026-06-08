import { expect } from '@playwright/test';

import { insertDepartmentTypes } from '../apiClient';
import { test } from '../base';
import { SmartWidget } from '../models/components/widgets/SmartWidget';
import { DashboardPage } from '../models/DashboardPage';
import { buildRiskFormValues } from '../testData/riskFormValuesBuilder';
import { users } from '../users';

[users.riskManager].forEach((user) => {
  test.describe(`Colour settings`, () => {
    test.use({ user });

    test('Save persists and cancel resets to default colours', async ({
      app,
      page,
    }) => {
      await page.goto('/');
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.coloursTab.selectTabAndAssertTitle(
        'Dashboard Colour Editor'
      );

      // Save a known colour so we can check it is reset
      let colours =
        await app.settingsPage.coloursTab.coloursForm.fields.colours.getValue();
      expect(colours).toHaveLength(16);

      await app.settingsPage.coloursTab.coloursForm.fillFormAndClickSave({
        colours: ['#ff0000'],
      });
      await app.settingsPage.notificationBanner.expectNotification(
        'Colours updated successfully'
      );

      // Reload the page to ensure the changes are persisted
      await page.reload();
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.coloursTab.selectTabAndAssertTitle(
        'Dashboard Colour Editor'
      );

      // Assert the saved colour is persisted
      colours =
        (await app.settingsPage.coloursTab.coloursForm.fields.colours.getValue()) as string[];
      expect(colours).toHaveLength(16);
      expect(colours[0]).toEqual('#ff0000');

      // Change the colour but click cancel and assert it is reset to the saved value
      await app.settingsPage.coloursTab.coloursForm.fields.colours.setValue([
        '#00ff00',
      ]);
      await app.settingsPage.coloursTab.coloursForm.cancelButton.click();
      colours =
        (await app.settingsPage.coloursTab.coloursForm.fields.colours.getValue()) as string[];
      expect(colours[0]).toEqual('#ff0000');
    });

    test('Highcharts uses saved colours', async ({ app, page }) => {
      await page.goto('/');
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.coloursTab.selectTabAndAssertTitle(
        'Dashboard Colour Editor'
      );

      // Save a known colour so we can check it is used in highcharts
      const colours =
        await app.settingsPage.coloursTab.coloursForm.fields.colours.getValue();
      expect(colours).toHaveLength(16);

      await app.settingsPage.coloursTab.coloursForm.fillFormAndClickSave({
        colours: ['#0000ff'],
      });
      await app.settingsPage.notificationBanner.expectNotification(
        'Colours updated successfully'
      );

      // Add a risk to ensure there is something to show in the chart
      await insertDepartmentTypes([
        { Name: 'Colour Test Department 1', Description: 'Description' },
      ]);
      await page.goto('/');

      const risk = buildRiskFormValues({
        departments: ['Colour Test Department 1'],
      });

      await app.riskScenarios.createRisk(risk);

      // Add a widget to the dashboard
      await page.goto('/');
      const dashboard = new DashboardPage(page);
      await dashboard.navigateToAndAssertTitle('Dashboard');
      await dashboard.menu.openAndClickItem('Clear');
      await expect(dashboard.emptyDashboardMessage).toBeVisible();
      await dashboard.addWidgetButton.click();

      await dashboard.dragWidgetOnToBoard('Smart Widget');
      await expect(dashboard.emptyDashboardMessage).not.toBeVisible();

      const smartWidget = new SmartWidget(page);
      await smartWidget.configureWidgetButton.click();
      await smartWidget.settingsForm.fillFormAndClickSave({
        dataSource: 'Risks',
        chartType: 'Pie Chart',
        category: 'Departments',
        filtering: 'Departments = Colour Test Department 1',
      });

      await dashboard.notificationBanner.expectNotification(
        'Widget added successfully'
      );

      // Check widget colour matches saved colour
      const chartSegment = page.locator(
        '.highcharts-series.highcharts-series-0'
      );
      const path = chartSegment.locator('path').first();
      await expect(path).toHaveAttribute('fill', /rgb\(0,0,255\)|#0000ff/);
    });
  });
});
