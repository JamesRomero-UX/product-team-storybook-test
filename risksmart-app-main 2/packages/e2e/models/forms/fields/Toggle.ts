import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';
import type { ToggleWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { CustomisableField } from './CustomisableField';

export class Toggle extends CustomisableField {
  readonly toggleWrapper: ToggleWrapper;
  readonly page: Page | Locator;
  readonly nativeInput: Locator;

  constructor(page: Page | Locator, selector?: string) {
    super(page, selector || 'toggle');
    this.toggleWrapper = this.cloudScapeWrapper.findToggle(selector);
    this.page = page;
    this.nativeInput = this.page.locator(
      this.toggleWrapper.findNativeInput().toSelector()
    );
  }

  async isChecked() {
    return await this.nativeInput.isChecked();
  }

  async setValue(value: boolean) {
    const isDisabled = await this.isDisabled();
    expect(isDisabled).toBeFalsy();
    if ((await this.isChecked()) !== value) {
      await this.nativeInput.click();
    }
  }

  async getValue(): Promise<boolean> {
    return await this.isChecked();
  }

  async isDisabled(): Promise<boolean> {
    return await this.nativeInput.isDisabled();
  }

  /**
   * Is the field visible? (toggles don't generally have form fields)
   * @returns
   */
  async isVisible(): Promise<boolean> {
    return this.nativeInput.isVisible();
  }
}
