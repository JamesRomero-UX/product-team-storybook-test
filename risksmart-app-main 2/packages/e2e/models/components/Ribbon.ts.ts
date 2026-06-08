import type { Locator, Page } from '@playwright/test';
import type { ElementWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { RibbonModal } from '../modals/RibbonModal';

export class Ribbon {
  readonly page: Page;
  readonly container: Locator;
  readonly cloudScapeWrapper: ElementWrapper;
  readonly editButton: Locator;
  readonly ribbonModal: RibbonModal;

  constructor(page: Page, testId: string = 'customisable-ribbon') {
    this.page = page;
    this.container = this.page.getByTestId(testId);
    this.cloudScapeWrapper = createWrapper();
    this.editButton = this.page.getByRole('button', {
      name: 'Edit Filters',
    });
    this.ribbonModal = new RibbonModal(page);
  }

  async clickEditFilters() {
    await this.editButton.click();
  }

  getRibbonItem(title: string): Locator {
    return this.container.locator(
      `[data-testid="dashboard-item"]:has(h5:has-text("${title}"))`
    );
  }
}
