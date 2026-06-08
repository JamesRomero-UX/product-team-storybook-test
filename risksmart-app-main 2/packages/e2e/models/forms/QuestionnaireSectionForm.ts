import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';

export type QuestionnaireSectionFormValues = {
  title: string;
};

export class QuestionnaireSectionForm extends BaseForm<QuestionnaireSectionFormValues> {
  constructor(page: Page | Locator) {
    super(page);
    this.fields = {
      title: new Input(page, '#/properties/sectionTitle'),
    };
  }
}
