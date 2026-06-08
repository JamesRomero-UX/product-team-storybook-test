import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { CheckboxWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class Checkbox extends CustomisableField {
  readonly inputWrapper: CheckboxWrapper;
  readonly input: Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);

    this.inputWrapper = this.cloudScapeWrapper.findCheckbox(
      `[data-testid="${testId}"]`
    );
    this.input = page.locator(this.inputWrapper.findNativeInput().toSelector());
  }

  async isDisabled(): Promise<boolean> {
    return await this.input.isDisabled();
  }

  async getValue(): Promise<FormFieldValue> {
    return await this.input.isChecked();
  }

  async setValue(value: boolean): Promise<void> {
    await this.input.setChecked(value);
  }
}
