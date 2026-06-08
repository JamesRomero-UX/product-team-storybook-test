import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

export class TinyMCEKeyRequiredAlert {
  page: Page;
  container: Locator;
  closeAPIAlertButton: Locator;
  closeEditorAlertButton: Locator;
  constructor(parent: Page | Locator) {
    this.page = 'page' in parent ? parent.page() : parent;
    // Updated locators for TinyMCE 7.x notification structure
    this.closeAPIAlertButton = this.page
      .locator('.tox-notification')
      .filter({
        hasText: 'A valid API key is required to continue using TinyMCE',
      })
      .locator('button.tox-notification__dismiss');
    this.closeEditorAlertButton = this.page
      .locator('.tox-notification')
      .filter({
        hasText:
          'The editor is disabled because the API key could not be validated',
      })
      .locator('button.tox-notification__dismiss');
  }

  closeIfVisible = async () => {
    // Wait briefly for TinyMCE notifications to appear after editor loads
    await this.page.waitForTimeout(200);

    // Close all visible TinyMCE notifications - they may appear in sequence
    for (let i = 0; i < 3; i++) {
      const apiAlertButtons = await this.closeAPIAlertButton.all();
      for (const button of apiAlertButtons) {
        if (await button.isVisible()) {
          await button.click();
          await this.page.waitForTimeout(100);
        }
      }

      const editorAlertButtons = await this.closeEditorAlertButton.all();
      for (const button of editorAlertButtons) {
        if (await button.isVisible()) {
          await button.click();
          await this.page.waitForTimeout(100);
        }
      }
    }
  };
}
