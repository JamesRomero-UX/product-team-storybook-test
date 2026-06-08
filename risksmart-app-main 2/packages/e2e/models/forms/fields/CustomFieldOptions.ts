import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import type { AltValueOption, FormFieldValue, StringOption } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class CustomFieldOptions extends CustomisableField {
  readonly addOptionButton: Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);

    this.addOptionButton = page.getByRole('button', { name: 'Add option' });
  }

  async addOption(
    index: number,
    option: StringOption | AltValueOption,
    clickAdd = true
  ) {
    if (clickAdd) {
      await this.addOptionButton.click();
    }

    const optionInput = this.page.getByRole('textbox', {
      name: `Option ${index}`,
      exact: true,
    });

    await optionInput.fill(option.value);

    if (option._tag === 'AltValueOption') {
      const altValueInput = this.page.getByRole('textbox', {
        name: `Option ${index} value`,
        exact: true,
      });
      await altValueInput.fill(option.altValue);
    }
  }

  async isDisabled(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async setValue(
    options: string[] | StringOption[] | AltValueOption[]
  ): Promise<void> {
    if (options === undefined || options.length === 0) {
      return;
    }

    const mapOption = (
      option: string | StringOption | AltValueOption
    ): StringOption | AltValueOption => {
      if (typeof option === 'string') {
        return { _tag: 'StringOption', value: option };
      }

      return option;
    };

    for (const [index, option] of options.entries()) {
      await this.addOption(index + 1, mapOption(option), index > 0);
    }
  }

  getValue(): Promise<FormFieldValue> {
    throw new Error('Not implemented.');
  }
}
