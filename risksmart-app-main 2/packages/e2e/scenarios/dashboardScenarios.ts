import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { SmartWidget } from '../models/components/widgets/SmartWidget';
import { DashboardPage } from '../models/DashboardPage';

export class DashboardScenarios {
  private readonly page: Page;
  private readonly dashboardPage: DashboardPage;
  private readonly smartWidget: SmartWidget;

  constructor(page: Page) {
    this.page = page;
    this.dashboardPage = new DashboardPage(page);
    this.smartWidget = new SmartWidget(page);
  }

  /*
   * Adds a smart widget to the dashboard with the given name, configures it with some default settings, and asserts that it was added successfully
   */
  async addSmartWidgetToDashboard({
    dataSource,
    chartType,
    category,
  }: {
    dataSource: string;
    chartType: string;
    category: string;
  }) {
    await this.page.goto('/');
    await this.dashboardPage.navigateToAndAssertTitle('Dashboard');
    await this.dashboardPage.menu.openAndClickItem('Clear');
    await expect(this.dashboardPage.emptyDashboardMessage).toBeVisible();
    await this.dashboardPage.addWidgetButton.click();

    await this.dashboardPage.dragWidgetOnToBoard('Smart Widget');
    await expect(this.dashboardPage.emptyDashboardMessage).not.toBeVisible();

    await this.smartWidget.configureWidgetButton.click();
    await this.smartWidget.settingsForm.fillFormAndClickSave({
      dataSource,
      chartType,
      category,
    });

    await this.dashboardPage.notificationBanner.expectNotification(
      'Widget added successfully'
    );
  }

  async downloadAllWidgets() {
    // Return to dash
    await this.page.goto('/');
    await this.dashboardPage.navigateToAndAssertTitle('Dashboard');

    // Trigger download
    const downloadPromise = this.page.waitForEvent('download');
    await this.dashboardPage.menu.openAndClickItem('Export all images (ZIP)');

    // Verify download via filename
    const download = await downloadPromise;
    await download.path();
    expect(download.suggestedFilename()).toBe('dashboard_images.zip');
  }

  async clickOnPieChartSegment(label: string) {
    const segments = this.smartWidget.pieChartWrapper
      .findSegments()
      .toSelector();

    await expect
      .poll(async () => {
        const segmentLocators = await this.page.locator(segments).all();

        return segmentLocators.length;
      })
      .toBeGreaterThan(0);

    const segmentLocators = await this.page.locator(segments).all();

    for (const segmentLocator of segmentLocators) {
      const title = await segmentLocator.getAttribute('aria-label');

      if (title?.startsWith(label)) {
        await segmentLocator.hover({ force: true });
        await segmentLocator.click();

        break;
      }
    }
  }
}
