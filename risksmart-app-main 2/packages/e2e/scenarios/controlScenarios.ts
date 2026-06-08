import type { Page } from '@playwright/test';

import { ControlRegisterPage } from '../models/ControlRegisterPage';
import type { ControlFormValues } from '../models/forms/ControlForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class ControlScenarios {
  private readonly page: Page;
  private readonly riskDetailsPage: RiskDetailsPage;
  private readonly controlRegisterPage: ControlRegisterPage;

  constructor(page: Page) {
    this.page = page;
    this.riskDetailsPage = new RiskDetailsPage(page);
    this.controlRegisterPage = new ControlRegisterPage(page);
  }

  /**
   * Give a register column name and value for that field, filters the register (expecting only 1 matching record), and navigates to that
   * control by clicking the control name link
   * @param columnName
   * @param columnValue
   */
  async navigateToControlDetailsByRegisterColumnName(
    columnName: string,
    columnValue: string,
    clearExistingRegisterFilters = false
  ) {
    await this.controlRegisterPage.navigateToAndAssertTitle();
    if (clearExistingRegisterFilters) {
      await this.controlRegisterPage.table.clearFiltersButton.click();
    }
    await this.controlRegisterPage.table.setFilterInput(
      `${columnName}=${columnValue}`
    );
    await this.controlRegisterPage.table.expectRowCount(1);
    await this.controlRegisterPage.table.expectRowToContain(1, {
      [columnName]: columnValue,
    });
    await this.controlRegisterPage.table.clickCellLink('Title', 1);
  }

  /**
   * Creates a control from the risk details page
   *
   * @param control
   */
  async createControlFromRiskDetails(control: Partial<ControlFormValues>) {
    await this.riskDetailsPage.controlsTab.selectTabAndAssertTitle('Controls');
    const rowCount = await this.riskDetailsPage.controlsTab.table.getRowCount();
    await this.riskDetailsPage.controlsTab.actionsMenuButton.click();
    await this.riskDetailsPage.controlsTab.addControlOption.click();
    await this.riskDetailsPage.controlsTab.addControlModal.controlForm.fillFormAndClickSave(
      control
    );
    await this.riskDetailsPage.notificationBanner.expectNotification(
      'Control added successfully'
    );
    await this.riskDetailsPage.controlsTab.table.expectRowCount(rowCount + 1);
  }
}
