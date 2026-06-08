import type { Page } from '@playwright/test';

import { ControlDetailsPage } from '../models/ControlDetailsPage';
import type { TestResultFormValues } from '../models/forms/TestResultForm';

export class TestResultScenarios {
  private readonly page: Page;

  private readonly controlDetailsPage: ControlDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.controlDetailsPage = new ControlDetailsPage(page);
  }

  /**
   * Creates a test result from the control details page
   *
   * @param testResult
   */
  async createTestResultFromControlDetails(
    testResult: Partial<TestResultFormValues>
  ) {
    await this.controlDetailsPage.performanceTab.selectTab();
    const rowCount =
      await this.controlDetailsPage.performanceTab.table.getRowCount();
    await this.controlDetailsPage.performanceTab.addButton.click();
    await this.controlDetailsPage.performanceTab.addTestResultModal.testResultForm.fillFormAndClickSave(
      testResult
    );
    await this.controlDetailsPage.notificationBanner.expectNotification(
      'Test Result added successfully'
    );
    await this.controlDetailsPage.performanceTab.table.expectRowCount(
      rowCount + 1
    );
  }
}
