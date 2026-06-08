import { type Locator, type Page } from '@playwright/test';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export class HeaderComponent {
  readonly page: Page;
  readonly count: Locator;
  readonly title: Locator;
  readonly helpButton: Locator;
  readonly headerSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.count = page.getByTestId('heading-count');
    this.title = page.getByTestId('heading-text');
    this.helpButton = page.getByTestId('global-action-help');
    const cloudScapeWrapper = createWrapper();
    this.headerSection = this.page.locator(
      cloudScapeWrapper.findHeader().toSelector()
    );
  }
}
