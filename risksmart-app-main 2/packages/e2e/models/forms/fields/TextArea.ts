import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { TextareaWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class TextArea extends CustomisableField {
  readonly page: Page | Locator;
  readonly inputWrapper: TextareaWrapper;
  readonly input: Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);
    this.page = page;

    this.inputWrapper = this.formFieldWrapper.findControl().findTextarea();
    this.input = this.page.locator(
      this.inputWrapper.findNativeTextarea().toSelector()
    );
  }
  async isDisabled(): Promise<boolean> {
    return await this.page
      .locator(this.inputWrapper.findNativeTextarea().toSelector())
      .isDisabled();
  }

  setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      throw new Error('TextArea does not support array values');
    }

    return this.input.fill(value);
  }

  getValue(): Promise<FormFieldValue> {
    return this.input.inputValue();
  }
}
