import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Select } from './fields/Select';
import { Toggle } from './fields/Toggle';

export type QuestionnaireFieldFormValues = {
  fieldTitle: string;
  placeholderText: string;
  guidance: string;
  fieldType: string;
  responseRequired: boolean;
  allowAttachments: boolean;
  options: string[];
};
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class QuestionnaireFieldFormForm extends BaseForm<{}> {
  readonly fieldTitle: Locator;
  readonly placeholderText: Locator;
  readonly guidance: Locator;
  readonly fieldType: Select;
  readonly responseRequired: Toggle;
  readonly allowAttachments: Toggle;
  readonly addOptionButton: Locator;

  constructor(page: Page | Locator) {
    super(page);

    this.fieldTitle = page.getByLabel('Field title');
    this.placeholderText = page.getByLabel('Placeholder text');
    this.guidance = page.getByLabel('Guidance');
    this.fieldType = new Select(page, '#/properties/fieldType');
    this.responseRequired = new Toggle(
      page,
      "[data-testid='#/properties/isPropertyRequired']"
    );
    this.allowAttachments = new Toggle(
      page,
      "[data-testid='#/properties/allowAttachments4']"
    );
    this.addOptionButton = page.getByText('Add option');
  }

  async getOptionInput(index: number) {
    const optionInputs = await this.page
      .locator('[data-testid="form-field-#/properties/selectOptions"]')
      .getByRole('textbox')
      .all();

    return optionInputs[index];
  }

  async fillForm({
    fieldTitle,
    placeholderText,
    guidance,
    fieldType,
    responseRequired,
    allowAttachments,
    options,
  }: Partial<QuestionnaireFieldFormValues>) {
    if (fieldTitle) {
      await this.fieldTitle.fill(fieldTitle);
    }
    if (placeholderText) {
      await this.placeholderText.fill(placeholderText);
    }
    if (guidance) {
      await this.guidance.fill(guidance);
    }
    if (fieldType) {
      await this.fieldType.setValue(fieldType);
    }
    if (responseRequired !== undefined) {
      await this.responseRequired.setValue(responseRequired);
    }
    if (allowAttachments !== undefined) {
      await this.allowAttachments.setValue(allowAttachments);
    }
    if (options) {
      for (let i = 0; i < options.length; i++) {
        await this.addOptionButton.click();
        const optionInput = await this.getOptionInput(i);
        await optionInput.fill(options[i]);
      }
    }
  }
}
