import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';
import type { SelectWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { DropdownContentWrapper } from '../../../node_modules/@risk-smart/themed-cloudscape-components/test-utils/selectors/internal/dropdown-host';
import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class Select<T extends string = string> extends CustomisableField {
  readonly page: Page | Locator;
  readonly selectWrapper: SelectWrapper;
  readonly cloudscapeSelectWrapper: CloudscapeSelectWrapper;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);
    this.page = page;
    this.selectWrapper = this.formFieldWrapper.findControl().findSelect();
    this.cloudscapeSelectWrapper = new CloudscapeSelectWrapper(
      page,
      this.selectWrapper
    );
  }

  async isDisabled(): Promise<boolean> {
    return await this.page
      .locator(this.selectWrapper.toSelector())
      .isDisabled();
  }

  async selectOptionByText(label: T) {
    return this.cloudscapeSelectWrapper.selectOptionByText(label);
  }

  setValue(value: string | string[]): Promise<void> {
    if (Array.isArray(value)) {
      throw new Error('Select does not support array values');
    }

    // TypeScript cannot assign string to T extends string — the specific subtype is enforced by the caller.
    return this.selectOptionByText(value as T);
  }

  async getValue(): Promise<FormFieldValue | undefined> {
    const value = await this.cloudscapeSelectWrapper.getSelectedOption();

    return value;
  }
}

export class CloudscapeSelectWrapper<T extends string = string> {
  page: Page;
  dropdownContentWrapper: DropdownContentWrapper;
  constructor(
    private parent: Page | Locator,
    private selectWrapper: SelectWrapper,
    private expandToViewport = false
  ) {
    this.page = 'page' in this.parent ? this.parent.page() : this.parent;
    this.dropdownContentWrapper = this.selectWrapper.findDropdown({
      expandToViewport: this.expandToViewport,
    });
  }

  async closeDropdown() {
    await this.page.keyboard.press('Escape');
  }

  async selectOptionByText(label: T) {
    await this.parent
      .locator(this.selectWrapper.findTrigger().toSelector())
      .click();

    const statusIndicator = this.parent.locator(
      this.selectWrapper
        .findStatusIndicator({ expandToViewport: this.expandToViewport })
        .toSelector()
    );
    // Wait for any data to load before attempting to select an option
    await expect(statusIndicator).toBeHidden();
    const parent = this.expandToViewport ? this.page : this.page;
    const options = await parent
      .locator(this.dropdownContentWrapper.findOptions().toSelector())
      .all();

    for (let i = 1; i <= options.length; i++) {
      const labelLocator = await parent.locator(
        this.dropdownContentWrapper.findOption(i).findLabel().toSelector()
      );
      const labelText = await labelLocator.textContent();
      console.log('label', labelText);
      if (labelText === label) {
        await labelLocator.click();

        return;
      }
    }
    throw new Error(`Label ${label} not found`);
  }

  async getSelectedOption(): Promise<FormFieldValue | undefined> {
    await this.parent
      .locator(this.selectWrapper.findTrigger().toSelector())
      .click();
    const selectedOptions = await this.parent
      .locator(this.dropdownContentWrapper.findSelectedOptions().toSelector())
      .all();

    if (selectedOptions.length === 0) {
      return undefined;
    }

    // textContent() returns string | null; the selected option element always has text when rendered.
    const value = (await selectedOptions[0]
      .locator('[class*="awsui_label-content"]')
      .textContent()) as FormFieldValue;

    await this.closeDropdown();

    return value;
  }
}
