import { expect, type Locator, type Page } from '@playwright/test';
import type {
  ElementWrapper,
  HeaderWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { DeleteModal } from '../modals/DeleteModal';

export class Tab {
  readonly page: Page;
  readonly title: Locator;
  readonly tabLink: Locator;
  readonly cloudScapeWrapper: ElementWrapper;
  readonly headerWrapper: HeaderWrapper;
  readonly header: Locator;
  readonly deleteModal: DeleteModal;
  readonly tabContent: Locator;

  constructor(page: Page, id: string) {
    this.page = page;
    this.deleteModal = new DeleteModal(page);
    this.title = page.getByTestId('tab-title');
    this.cloudScapeWrapper = createWrapper();
    const tabs = this.cloudScapeWrapper.findTabs();
    this.tabLink = page.locator(tabs.findTabLinkById(id).toSelector());
    this.tabContent = page.locator(tabs.findTabContent().toSelector());
    this.headerWrapper = this.cloudScapeWrapper.findHeader();
    this.header = this.page.locator(this.headerWrapper.toSelector());
  }

  async selectTab() {
    await this.tabLink.click();
  }

  /**
   * Selects tab and asserts title. Favour over simply using selectTab for more reliable tests
   * @param title
   */
  async selectTabAndAssertTitle(title: string) {
    await this.selectTab();
    await expect(this.title).toHaveText(title);
  }
}
