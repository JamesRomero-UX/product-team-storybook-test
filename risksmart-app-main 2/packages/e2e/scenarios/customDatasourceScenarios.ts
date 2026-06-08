import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { CustomDatasourceDetailsPage } from '../models/CustomDatasourceDetailsPage';
import { CustomDatasourcesPage } from '../models/CustomDatasourcesPage';
import { CustomDatasourceUpdatePage } from '../models/CustomDatasourceUpdatePage';
import type { CustomDatasourceFormValues } from '../models/forms/CustomDatasourceForm';

export class CustomDatasourceScenarios {
  readonly page: Page;
  readonly customDatasourcesPage: CustomDatasourcesPage;
  readonly customDatasourceUpdatePage: CustomDatasourceUpdatePage;
  readonly customDatasourceDetailsPage: CustomDatasourceDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.customDatasourcesPage = new CustomDatasourcesPage(page);
    this.customDatasourceUpdatePage = new CustomDatasourceUpdatePage(page);
    this.customDatasourceDetailsPage = new CustomDatasourceDetailsPage(page);
  }

  /**
   * Creates custom data source
   *
   * @param custom datasource
   */
  async createCustomDatasource(customDatasource: CustomDatasourceFormValues) {
    await this.customDatasourcesPage.navigateToAndAssertTitle();
    const reportCount = await this.customDatasourcesPage.table.getRowCount();
    await this.customDatasourcesPage.addButton.click();
    await expect(this.customDatasourceUpdatePage.header.title).toHaveText(
      'Add Custom Datasource'
    );
    await this.customDatasourceUpdatePage.form.fillFormAndClickSave(
      customDatasource
    );

    await this.customDatasourceUpdatePage.notificationBanner.expectNotification(
      'Datasource added successfully'
    );
    await expect(this.customDatasourcesPage.header.title).toHaveText(
      'Custom Datasources'
    );
    await this.customDatasourcesPage.table.expectRowCount(reportCount + 1);
  }

  /**
   * Delete a custom data source by title
   * @param customDatasourceTitle
   */
  async deleteCustomDatasourceByTitle(customDatasourceTitle: string) {
    await this.customDatasourcesPage.navigateToAndAssertTitle();
    await this.customDatasourcesPage.table.setFilterInputByNameAndValue(
      'Title',
      customDatasourceTitle
    );
    await this.customDatasourcesPage.table.clickCellLink('Title', 1);
    await this.customDatasourceDetailsPage.editButton.click();
    await this.customDatasourceUpdatePage.deleteButton.click();
    await this.customDatasourceUpdatePage.deleteModal.confirmButton.click();
    await this.customDatasourceUpdatePage.notificationBanner.expectNotification(
      'Datasource deleted successfully'
    );
  }
}
