import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type {
  ButtonDropdownWrapper,
  ElementWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export class DropdownButton {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly parent: Page | Locator;
  readonly buttonDropdownWrapper: ButtonDropdownWrapper;

  constructor(page: Page | Locator, testId: string) {
    this.parent = page;
    this.cloudScapeWrapper = createWrapper('');

    this.buttonDropdownWrapper = this.cloudScapeWrapper.findButtonDropdown(
      `[data-testid='${testId}']`
    );
  }

  private async open() {
    await this.parent
      .locator(this.buttonDropdownWrapper.findNativeButton().toSelector())
      .click();
  }

  async openAndClickItem(label: string) {
    await this.open();
    await this.clickItem(label);
  }

  async clickItem(label: string) {
    const page = 'page' in this.parent ? this.parent.page() : this.parent;
    const items = await page
      .locator(this.buttonDropdownWrapper.findItems().toSelector())
      .all();

    if (items.length === 0) {
      throw new Error(`Item "${label}" not found`);
    }

    for (const item of items) {
      const text = await item.textContent();
      if (text?.trim() === label) {
        await item.click();

        return;
      }
    }
    throw new Error('Item not found');
  }
}
