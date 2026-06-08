import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { ColourInput } from './fields/ColourInput';

export type Status = 'Pending' | 'Closed' | 'Open';

export type ColoursFormFields = {
  colours: string[];
};

export class ColoursForm extends BaseForm<ColoursFormFields> {
  constructor(page: Page | Locator, parentSelector?: string) {
    super(page);

    this.fields = {
      colours: new ColourInput(page, 'colours', parentSelector),
    };
  }
}
