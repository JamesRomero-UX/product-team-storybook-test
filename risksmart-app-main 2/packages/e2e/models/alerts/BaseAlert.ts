import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type {
  AlertWrapper,
  ElementWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export abstract class BaseAlert {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly alertWrapper: AlertWrapper;
  readonly page: Page | Locator;
  readonly alertLocator: Locator;

  constructor(
    page: Page | Locator,
    private testId: string
  ) {
    this.page = page;
    this.cloudScapeWrapper = createWrapper('');
    this.alertWrapper = this.cloudScapeWrapper.findAlert(
      `[data-testid='${this.testId}']`
    );
    this.alertLocator = page.locator(this.alertWrapper.toSelector());
  }

  /**
   * Wait for the alert to be removed from the DOM.
   * @returns A promise that resolves when the alert is removed.
   */
  waitToBeRemoved(): Promise<void> {
    return this.alertLocator.waitFor({ state: 'detached' });
  }
}
