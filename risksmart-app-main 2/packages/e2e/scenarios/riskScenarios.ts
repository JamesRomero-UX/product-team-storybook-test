import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { AddRiskPage } from '../models/AddRiskPage';
import type { CustomAttributeValue } from '../models/forms/BaseForm';
import type { RiskFormValues } from '../models/forms/RiskForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';
import { RiskRegisterPage } from '../models/RiskRegisterPage';

export class RiskScenarios {
  readonly page: Page;
  readonly riskRegister: RiskRegisterPage;
  readonly addRiskPage: AddRiskPage;
  readonly riskDetailsPage: RiskDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.riskRegister = new RiskRegisterPage(page);
    this.addRiskPage = new AddRiskPage(page);
    this.riskDetailsPage = new RiskDetailsPage(page);
  }

  /**
   * Give a register column name and value for that field, filters the register, and navigates to that
   * risk by clicking the risk name link. If row is not 1, a sorting column must be provided as well.
   * @param columnName
   * @param columnValue
   */
  async navigateToRiskDetailsByRegisterColumnName({
    columnName,
    columnValue,
    clearExistingRegisterFilters = false,
    row = 1,
    exact,
    sortingColumnName,
  }: {
    columnName: string;
    columnValue: string;
    clearExistingRegisterFilters?: boolean;
    row?: number;
    exact?: boolean;
    sortingColumnName?: string;
  }) {
    await this.riskRegister.navigateToAndAssertTitle(exact);
    if (clearExistingRegisterFilters) {
      await this.riskRegister.table.clearFiltersButton.click();
    }
    await this.riskRegister.table.setFilterInput(
      `${columnName}=${columnValue}`
    );
    if (row > 1 && !sortingColumnName) {
      throw new Error(
        'If row is greater than 1, a sorting column must be provided'
      );
    }
    if (sortingColumnName) {
      await this.riskRegister.table.sortColumn(sortingColumnName);
    }
    await this.riskRegister.table.expectRowToContain(row, {
      [columnName]: columnValue,
    });
    await this.riskRegister.table.clickCellLink('Risk name', row);
  }

  /**
   * Creates a risk
   *
   * @param risk
   */
  async createRisk(
    risk: Partial<RiskFormValues>,
    customAttributes?: CustomAttributeValue[]
  ) {
    await this.riskRegister.navigateToAndAssertTitle(true);
    await this.riskRegister.addButton.click();
    await expect(this.addRiskPage.header.title).toHaveText(`Add Risk`);

    await this.addRiskPage.detailsTab.riskForm.fillFormAndClickSave(
      risk,
      customAttributes
    );

    await this.addRiskPage.notificationBanner.expectNotification(
      'Risk added successfully'
    );
    await expect(this.riskDetailsPage.header.title).toHaveText(
      risk?.riskName ?? ''
    );
  }
}
