import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type ObligationImpactFormValues = {
  impactOfNonAdherence: string;
  impact: string;
};

export class ObligationImpactForm extends BaseForm<ObligationImpactFormValues> {
  constructor(page: Page | Locator) {
    super(page);

    this.fields = {
      impactOfNonAdherence: new TextArea(page, 'impactOfNonAdherence'),
      impact: new Select(page, 'impactRating'),
    };
  }
}
