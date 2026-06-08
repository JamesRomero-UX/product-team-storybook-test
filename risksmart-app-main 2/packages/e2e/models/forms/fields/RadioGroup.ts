import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';
import type { RadioGroupWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class RadioGroup<T extends string> extends CustomisableField {
  readonly page: Page | Locator;
  readonly radioGroupWrapper: RadioGroupWrapper;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);
    this.page = page;
    this.radioGroupWrapper = this.formFieldWrapper
      .findControl()
      .findRadioGroup();
  }

  async getValue(): Promise<FormFieldValue | undefined> {
    const buttons = await this.page
      .locator(this.radioGroupWrapper.findButtons().toSelector())
      .all();
    for (let i = 1; i <= buttons.length; i++) {
      const nativeInput = await this.page.locator(
        this.radioGroupWrapper
          .findButtons()
          .get(i)
          .findNativeInput()
          .toSelector()
      );
      if (await nativeInput.isChecked()) {
        const labelLocator = await this.page.locator(
          this.radioGroupWrapper.findButtons().get(i).findLabel().toSelector()
        );

        // textContent() returns string | null; a checked radio label always has text when rendered.
        return (await labelLocator.textContent()) as T;
      }
    }

    return undefined;
  }
  async isDisabled(): Promise<boolean> {
    return this.page.locator(this.radioGroupWrapper.toSelector()).isDisabled();
  }

  async check(labelValue: T) {
    await expect
      .poll(async () => {
        const buttons = await this.page
          .locator(this.radioGroupWrapper.findButtons().toSelector())
          .all();

        return buttons.length;
      })
      .toBeGreaterThan(0);
    const buttons = await this.page
      .locator(this.radioGroupWrapper.findButtons().toSelector())
      .all();

    for (let i = 1; i <= buttons.length; i++) {
      const labelElement = this.page.locator(
        this.radioGroupWrapper.findButtons().get(i).findLabel().toSelector()
      );
      const label = await labelElement.textContent();
      if (label === labelValue) {
        await labelElement.click();

        return;
      }
    }
    throw new Error(`Radio button with label "${labelValue}" not found`);
  }

  setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      throw new Error('RadioGroup does not support array values');
    }

    // TypeScript cannot assign string to T extends string — the specific subtype is enforced by the caller.
    return this.check(value as T);
  }
}
