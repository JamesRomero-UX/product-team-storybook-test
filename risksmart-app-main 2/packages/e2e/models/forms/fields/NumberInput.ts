import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { InputWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class NumberInput extends CustomisableField {
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

  setValue(value: number): Promise<void> {
    return this.input.fill(value.toString());
  }
  getValue(): Promise<FormFieldValue> {
    return this.input.inputValue();
  }
}
