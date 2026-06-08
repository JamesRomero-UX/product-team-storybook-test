import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type {
  PropertyFilterWrapper,
  SelectWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue, PropertyFilterCondition } from '../BaseForm';
import { CustomisableField } from './CustomisableField';
import { CloudscapeSelectWrapper } from './Select';

export class PropertyFilter extends CustomisableField {
  readonly propertyFilterWrapper: PropertyFilterWrapper;
  readonly input: Locator;
  readonly selectWrapper: SelectWrapper;
  readonly cloudscapeSelectWrapper: CloudscapeSelectWrapper;

  constructor(parent: Page | Locator, testId: string, parentSelector?: string) {
    super(parent, testId, parentSelector);

    this.propertyFilterWrapper = this.formFieldWrapper
      .findControl()
      .findPropertyFilter();

    this.selectWrapper = this.formFieldWrapper.findControl().findSelect();
    this.cloudscapeSelectWrapper = new CloudscapeSelectWrapper(
      parent,
      this.selectWrapper,
      true
    );
    this.input = this.page.locator(
      this.propertyFilterWrapper.findNativeInput().toSelector()
    );
  }
  async isDisabled(): Promise<boolean> {
    return this.input.isDisabled();
  }

  async setValue(condition: PropertyFilterCondition | string): Promise<void> {
    if (
      typeof condition == 'string' ||
      !condition.type ||
      condition.type == 'text'
    ) {
      const input =
        typeof condition === 'string'
          ? condition
          : `${condition.label}${condition.operator}${condition.value}`;

      await this.input.fill(input);
      await this.input.press('Enter');
    } else {
      await this.input.fill(`${condition.label}${condition.operator}`);
      await this.cloudscapeSelectWrapper.selectOptionByText(condition.value);
      await this.page.getByText('Apply').click();
    }
  }
  getValue(): Promise<FormFieldValue> {
    return this.input.inputValue();
  }
}
