import type { Page } from '@playwright/test';

import { SettingsPage } from '../models/SettingsPage';

export class TaxonomyScenarios {
  readonly page: Page;
  readonly settingsPage: SettingsPage;

  constructor(page: Page) {
    this.page = page;
    this.settingsPage = new SettingsPage(page);
  }
  /**
   * Create a new taxonomy entry
   * @param taxonomyObject
   */
  async addTaxonomy(taxonomyObject: object) {
    await this.settingsPage.navigateToAndAssertTitle();

    await this.settingsPage.taxonomyTab.selectTabAndAssertTitle('Translations');
    await this.settingsPage.taxonomyTab.addButton.click();
    await this.settingsPage.notificationBanner.expectNotification(
      'Translations added successfully'
    );
    await this.settingsPage.taxonomyTab.textArea.clear();
    await this.settingsPage.taxonomyTab.textArea.fill(
      JSON.stringify(taxonomyObject)
    );
    await this.settingsPage.taxonomyTab.saveButton.click();
    await this.settingsPage.notificationBanner.expectNotification(
      'Translations updated successfully'
    );
    // reload page to get new translations
    await this.page.reload();
  }
}
