import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type {
  ElementWrapper,
  RadioGroupWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export class RadioBar<T extends string> {
  readonly cloudScapeWrapper: ElementWrapper;
  readonly page: Page | Locator;
  readonly radioGroupWrapper: RadioGroupWrapper;

  constructor(page: Page | Locator, testId: string) {
    this.page = page;
    this.cloudScapeWrapper = createWrapper();

    this.radioGroupWrapper = this.cloudScapeWrapper.findRadioGroup(
      `[data-testid="${testId}"]`
    );
  }

  getInput(value: T) {
    return this.page.locator(
      this.radioGroupWrapper.findInputByValue(value).toSelector()
    );
  }
}
