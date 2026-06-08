import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { InputWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class AutosuggestInput extends CustomisableField {
  readonly input: Locator;
  readonly inputWrapper: InputWrapper;

  constructor(parent: Page | Locator, testId: string, parentSelector?: string) {
    super(parent, testId, parentSelector);

    this.inputWrapper = this.formFieldWrapper.findControl().findAutosuggest();
    this.input = parent.locator(
      this.inputWrapper.findNativeInput().toSelector()
    );
  }
  async isDisabled(): Promise<boolean> {
    return await this.page
      .locator(this.inputWrapper.findNativeInput().toSelector())
      .isDisabled();
  }

  async setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      throw new Error('AutosuggestInput does not support array values');
    }

    await this.input.fill(value);
    const page = 'page' in this.page ? this.page.page() : this.page;
    await page.keyboard.press('Enter');
  }

  getValue(): Promise<FormFieldValue> {
    return this.input.inputValue();
  }
}
