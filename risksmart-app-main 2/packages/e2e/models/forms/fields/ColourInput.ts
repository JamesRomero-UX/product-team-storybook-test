import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class ColourInput extends CustomisableField {
  readonly inputs: Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);

    this.inputs = page.locator(`input[type="color"]`);
  }

  async isDisabled(): Promise<boolean> {
    // Colour input doesn't support disabled yet
    return Promise.resolve(false);
  }

  async setValue(value: string | string[]): Promise<void> {
    await this.inputs.first().waitFor();
    const inputs = await this.inputs.all();
    console.log(inputs);
    await inputs[0].waitFor();

    if (Array.isArray(value)) {
      for (const [index, input] of inputs.entries()) {
        if (value[index]) {
          await input.fill(value[index]);
        }
      }

      return;
    }

    return inputs[0].fill(value);
  }

  async getValue(): Promise<FormFieldValue> {
    await this.inputs.first().waitFor();
    const inputs = await this.inputs.all();
    console.log(inputs);
    await inputs[0].waitFor();

    return Promise.all(inputs.map(async (input) => input.inputValue()));
  }
}
