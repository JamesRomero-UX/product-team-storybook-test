import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';
import type { MultiselectWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { DropdownContentWrapper } from '../../../node_modules/@risk-smart/themed-cloudscape-components/test-utils/selectors/internal/dropdown-host';
import OptionWrapper from '../../../node_modules/@risk-smart/themed-cloudscape-components/test-utils/selectors/internal/option';
import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

const ignoreLabels = ['Recents', 'Users', 'Groups'];
export class MultiSelect extends CustomisableField {
  readonly page: Page | Locator;
  readonly multiselectWrapper: MultiselectWrapper;
  readonly dropdownWrapper: DropdownContentWrapper;

  constructor(
    page: Page | Locator,
    testId: string,
    hasFormField = true,
    parentSelector?: string
  ) {
    super(page, testId, parentSelector);
    this.page = page;
    if (hasFormField) {
      this.multiselectWrapper = this.formFieldWrapper
        .findControl()
        .findMultiselect();
    } else {
      this.multiselectWrapper = this.cloudScapeWrapper.findMultiselect(
        `[data-testid="${testId}"]`
      );
    }
    this.dropdownWrapper = this.multiselectWrapper.findDropdown();
  }
  async getValue(): Promise<FormFieldValue> {
    await this.page
      .locator(this.multiselectWrapper.findTrigger().toSelector())
      .click();
    const options = this.multiselectWrapper
      .findDropdown()
      .findSelectedOptions();
    const selectedOptionElements = await this.page
      .locator(options.toSelector())
      .all();

    const result = await Promise.all(
      selectedOptionElements.map(async (option) => {
        // textContent() returns string | null; Playwright label elements always have text when rendered.
        return (await option
          .locator('[class*="awsui_label-content"]')
          .textContent()) as string;
      })
    );

    await this.closeDropdown();

    const filteredValues = result.filter((r) => !ignoreLabels.includes(r));

    return filteredValues;
  }

  async closeDropdown() {
    const page = 'page' in this.page ? this.page.page() : this.page;
    await page.keyboard.press('Escape');
  }

  async isDisabled(): Promise<boolean> {
    return this.page.locator(this.multiselectWrapper.toSelector()).isDisabled();
  }

  /**
   *
   * @param labels
   */
  async selectOptionsByText(...labels: string[]) {
    return await this.selectOptionByTextInternal(0, ...labels);
  }

  async selectOptionsByValue(...values: string[]) {
    return await this.selectOptionByValueInternal(0, ...values);
  }

  private async selectOptionByTextInternal(
    retryCount: number,
    ...labels: string[]
  ) {
    console.log('Selecting options. Retries', retryCount);
    await this.page
      .locator(this.multiselectWrapper.findTrigger().toSelector())
      .click();

    const selectedLabels = await this.getSelectedOptionLabels();
    console.log('Already selected=', selectedLabels.join(','));

    // select new items
    for (const label of labels) {
      // Don't selected labels that have already been selected
      if (selectedLabels.includes(label)) {
        continue;
      }
      console.log('Selecting', label);
      const option = await this.findOptionByLabel(label);
      if (!option) {
        console.log('Option not found for ', label);
        continue;
      }
      await option.click();
    }
    // Deselect existing items
    for (const selectedLabel of selectedLabels) {
      // Don't selected labels that have already been selected
      if (labels.includes(selectedLabel)) {
        continue;
      }
      console.log('Deselecting', selectedLabel);
      const option = await this.findOptionByLabel(selectedLabel);

      console.log(await option.textContent());
      await option.click();
    }

    const postSelectionLabels = await this.getSelectedOptionLabels();
    expect(postSelectionLabels.length).toEqual(labels.length);

    let hasMismatchOption = false;
    // Assert selection has worked
    for (const label of labels) {
      if (!postSelectionLabels.includes(label)) {
        console.log(
          `${label} has not been selected. Selected: ${postSelectionLabels.join(',')}`
        );
        hasMismatchOption = true;
      }
    }

    // Close drop down
    await this.page
      .locator(this.multiselectWrapper.findTrigger().toSelector())
      .click();
    if (!hasMismatchOption) {
      console.log('Selected options correctly');

      return;
    }
    if (hasMismatchOption && retryCount < 4) {
      console.log('Selected options incorrectly. Retrying');
      await this.selectOptionByTextInternal(retryCount++, ...labels);
    } else {
      throw new Error(
        `${labels.join(',')} have not been selected. Retries exceeded. Selected: ${postSelectionLabels.join(',')}`
      );
    }
  }

  private async getSelectedOptionLabels() {
    const selectedOptions = await this.page
      .locator(this.dropdownWrapper.findSelectedOptions().toSelector())
      .all();

    const selectedLabels: string[] = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      const selectedOption = await this.page
        .locator(
          new OptionWrapper(
            this.dropdownWrapper.findSelectedOptions().toSelector()
          )
            .findLabel()
            .toSelector()
        )
        .nth(i);
      const label = await selectedOption.textContent();

      if (label && !ignoreLabels.includes(label)) {
        selectedLabels.push(label);
      }
    }

    return selectedLabels;
  }

  private async findOptionByLabel(label: string) {
    const options = await this.page
      .locator(this.dropdownWrapper.findOptions().toSelector())
      .filter({ hasText: label })
      .all();
    if (options.length > 1) {
      throw new Error(`Too many options matching label ${label}`);
    }

    return options[0];
  }

  private async selectOptionByValueInternal(
    retryCount: number,
    ...values: string[]
  ) {
    console.log('Selecting options. Retries', retryCount);
    await this.page
      .locator(this.multiselectWrapper.findTrigger().toSelector())
      .click();

    const selectedValues = await this.getSelectedOptionValues();
    console.log('Already selected=', selectedValues.join(','));

    // select new items
    for (const value of values) {
      // Don't selected labels that have already been selected
      if (selectedValues.includes(value)) {
        continue;
      }
      console.log('Selecting', value);
      const option = await this.findOptionByValue(value);
      if (!option) {
        console.log('Option not found for value ', value);
        continue;
      }
      await option.click();
    }
    // Deselect existing items
    for (const selectedValue of selectedValues) {
      // Don't selected labels that have already been selected
      if (values.includes(selectedValue)) {
        continue;
      }
      console.log('Deselecting', selectedValue);
      const option = await this.findOptionByValue(selectedValue);
      await option.click();
    }

    const postSelectionValues = await this.getSelectedOptionValues();
    expect(postSelectionValues.length).toEqual(values.length);

    let hasMismatchOption = false;
    // Assert selection has worked
    for (const value of values) {
      if (!postSelectionValues.includes(value)) {
        console.log(
          `${value} has not been selected. Selected: ${postSelectionValues.join(',')}`
        );
        hasMismatchOption = true;
      }
    }

    // Close drop down
    await this.page
      .locator(this.multiselectWrapper.findTrigger().toSelector())
      .click();
    if (!hasMismatchOption) {
      console.log('Selected options correctly');

      return;
    }
    if (hasMismatchOption && retryCount < 4) {
      console.log('Selected options incorrectly. Retrying');
      await this.selectOptionByValueInternal(retryCount++, ...values);
    } else {
      throw new Error(
        `${values.join(',')} have not been selected. Retries exceeded. Selected: ${postSelectionValues.join(',')}`
      );
    }
  }

  private async getSelectedOptionValues() {
    const selectedOptions = await this.page
      .locator(this.dropdownWrapper.findSelectedOptions().toSelector())
      .all();

    const selectedValues: string[] = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      const selectedOption = await this.page
        .locator(
          new OptionWrapper(
            `${this.dropdownWrapper.findSelectedOptions().toSelector()} [data-value]`
          ).toSelector()
        )
        .nth(i);
      const value = await selectedOption.getAttribute('data-value');
      if (value) {
        selectedValues.push(value);
      }
    }

    return selectedValues;
  }

  private async findOptionByValue(value: string) {
    const options = await this.page
      .locator(
        `${this.dropdownWrapper.findOptions().toSelector()}[data-value="${value}"]`
      )
      .all();
    if (options.length > 1) {
      throw new Error(`Too many options matching value ${value}`);
    }

    return options[0];
  }

  setValue(value: string | string[]): Promise<void> {
    return this.selectOptionsByText(
      ...(Array.isArray(value) ? value : [value])
    );
  }
}
