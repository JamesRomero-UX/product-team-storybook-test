import type { Page } from '@playwright/test';

import { DocumentForm } from '../forms/DocumentForm';
import { Tab } from './Tab';

export class DocumentDetailsTab extends Tab {
  readonly documentForm: DocumentForm;

  constructor(page: Page) {
    super(page, 'details');
    this.documentForm = new DocumentForm(page);
  }
}
