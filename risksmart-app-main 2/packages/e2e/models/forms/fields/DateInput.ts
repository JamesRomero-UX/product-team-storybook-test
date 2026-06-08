import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { InputWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class DateInput extends CustomisableField {
  readonly input: Locator;
  readonly inputWrapper: InputWrapper;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);

    this.inputWrapper = this.formFieldWrapper.findControl().findInput();
    this.input = page.locator(this.inputWrapper.findNativeInput().toSelector());
  }
  async isDisabled(): Promise<boolean> {
    return await this.input.isDisabled();
  }

  setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      throw new Error('DateInput does not support array values');
    }

    return this.input.fill(value);
  }

  getValue(): Promise<FormFieldValue> {
    return this.input.inputValue();
  }
}
