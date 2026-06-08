import type { Locator } from '@playwright/test';

import { BaseForm } from './BaseForm';

export type FieldSelectionFormValues = {
  selectedFields: {
    defaultLabel: string;
    customLabel?: string;
  }[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class FieldSelectionForm extends BaseForm<{}> {
  constructor(parent: Locator) {
    super(parent);
  }

  private async getFieldRow(defaultLabel: string) {
    const fieldRows = await this.page
      .getByTestId('field-selection-field')
      .all();

    for (const row of fieldRows) {
      const label = await row
        .getByTestId('field-selection-field-label')
        .textContent();
      if (label === defaultLabel) {
        return row;
      }
    }
    throw new Error(`Field with label "${defaultLabel}" not found`);
  }

  async fillForm({ selectedFields }: FieldSelectionFormValues) {
    for (const label of selectedFields) {
      const row = await this.getFieldRow(label.defaultLabel);

      await row.getByRole('checkbox').click();
      if (label.customLabel) {
        await row.getByLabel('Edit field title').fill(label.customLabel);
      }
    }
  }
}
