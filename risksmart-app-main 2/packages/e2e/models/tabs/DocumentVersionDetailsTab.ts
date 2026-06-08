import type { Page } from '@playwright/test';

import { DocumentVersionForm } from '../forms/DocumentVersionForm';
import { Tab } from './Tab';

export class DocumentVersionDetailsTab extends Tab {
  readonly form: DocumentVersionForm;
  constructor(page: Page) {
    super(page, 'details');
    this.form = new DocumentVersionForm(page);
  }
}
