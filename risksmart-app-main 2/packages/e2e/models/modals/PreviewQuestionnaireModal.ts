import { type Locator, type Page } from '@playwright/test';
import type { FormFieldWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { BaseForm } from '../forms/BaseForm';

export class PreviewQuestionnaireModal {
  readonly page: Page;
  readonly previewForm: PreviewForm;

  constructor(page: Page) {
    this.page = page;
    this.previewForm = new PreviewForm(page);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class PreviewForm extends BaseForm<{}> {
  readonly testValidationButton: Locator;

  constructor(page: Page) {
    super(page);
    this.testValidationButton = page.getByRole('button', {
      name: 'Test validation',
    });
  }

  /**
   *
   * @param index  0 based index
   */
  async getFormField(
    sectionIndex: number,
    fieldIndex: number
  ): Promise<FormFieldWrapper> {
    return await createWrapper(
      `[data-testid="preview-questionnaire-modal"] [data-testid="form-builder-field-${sectionIndex}"] [data-testid="form-builder-field-${fieldIndex}"]`
    ).findFormField();
  }
}
