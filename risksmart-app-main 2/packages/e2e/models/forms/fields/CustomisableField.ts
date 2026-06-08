import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type {
  ElementWrapper,
  FormFieldWrapper,
  PopoverWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { getFormFieldTestId } from '../../formHelpers';
import type { FormFieldValue } from '../BaseForm';

export abstract class CustomisableField {
  readonly formFieldWrapper: FormFieldWrapper;
  readonly editFieldButton: Locator;
  readonly cloudScapeWrapper: ElementWrapper;
  readonly page: Page | Locator;
  readonly error: Locator;
  readonly formField: Locator;
  readonly showChangesButton: Locator;
  readonly changesPopover: Locator;
  readonly changesPopoverWrapper: PopoverWrapper;
  readonly changesPopoverContent: Locator;
  readonly changesPopoverOriginalValue: Locator;
  readonly changesPopoverNewValue: Locator;
  readonly guidanceButton: Locator;

  constructor(parent: Page | Locator, testId: string, parentSelector?: string) {
    this.page = parent;
    this.cloudScapeWrapper = createWrapper(parentSelector ?? '');
    this.formFieldWrapper = this.cloudScapeWrapper.findFormField(
      `[data-testid="${getFormFieldTestId(testId)}"]`
    );
    this.formField = parent.locator(this.formFieldWrapper.toSelector());
    this.editFieldButton = parent.locator(
      this.formFieldWrapper.findLabel().findButton().toSelector()
    );
    this.showChangesButton = parent.locator(
      this.formFieldWrapper
        .findSecondaryControl()
        .find(`[data-testid="show-changes-button"]`)
        .toSelector()
    );
    this.changesPopoverWrapper = this.formFieldWrapper
      .findSecondaryControl()
      .findPopover(`[data-testid="field-changes-popover"]`);
    this.error = parent.locator(this.formFieldWrapper.findError().toSelector());

    const page = 'page' in parent ? parent.page() : parent;
    this.changesPopoverContent = page.locator(
      this.changesPopoverWrapper
        .findContent({ renderWithPortal: true })
        .toSelector()
    );
    this.changesPopoverOriginalValue =
      this.changesPopoverContent.getByTestId('original-value');
    this.changesPopoverNewValue =
      this.changesPopoverContent.getByTestId('new-value');

    this.guidanceButton = this.formField.getByTestId('field-help-button');
  }

  abstract setValue(value: FormFieldValue): Promise<void>;

  abstract getValue(): Promise<FormFieldValue | undefined>;

  abstract isDisabled(): Promise<boolean>;

  /**
   * Retrieve the validation error message for the field
   * @returns
   */
  async getError(): Promise<string | null> {
    if (await this.error.isVisible()) {
      return await this.error.innerText();
    }

    return null;
  }

  /**
   * Retrieve the form label
   * @returns
   */
  async getLabel(): Promise<string> {
    return await this.page
      .locator(this.formFieldWrapper.findLabel().toSelector())
      .innerText();
  }

  /**
   * Is the form field visible?
   * @returns
   */
  async isVisible(): Promise<boolean> {
    return this.page.locator(this.formFieldWrapper.toSelector()).isVisible();
  }

  async expectIsVisible(isVisible: boolean) {
    await expect.poll(() => this.isVisible()).toEqual(isVisible);
  }

  async expectToBeDisabled(isDisabled: boolean) {
    await expect.poll(() => this.isDisabled()).toEqual(isDisabled);
  }
}
