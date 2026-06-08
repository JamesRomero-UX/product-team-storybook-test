import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type {
  ElementWrapper,
  ModalWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export abstract class BaseModal {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly modalWrapper: ModalWrapper;
  readonly modalLocator: Locator;
  readonly modalSelector: string;
  readonly modalContentWrapper: ElementWrapper;
  readonly modalContent: Locator;
  readonly header: Locator;

  constructor(
    page: Page | Locator,
    private testId: string
  ) {
    this.cloudScapeWrapper = createWrapper('');
    this.modalWrapper = this.cloudScapeWrapper.findModal(
      `[data-testid='${this.testId}']`
    );
    this.header = page.locator(this.modalWrapper.findHeader().toSelector());

    this.modalSelector = this.modalWrapper.toSelector();
    this.modalLocator = page.locator(this.modalSelector);

    this.modalContentWrapper = this.modalWrapper.findContent();
    this.modalContent = page.locator(this.modalContentWrapper.toSelector());
  }
}
