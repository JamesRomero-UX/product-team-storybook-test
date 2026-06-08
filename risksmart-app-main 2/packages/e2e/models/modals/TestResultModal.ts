import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { TestResultForm } from '../forms/TestResultForm';
import { BaseModal } from './BaseModal';

export class TestResultModal extends BaseModal {
  readonly testResultForm: TestResultForm;

  constructor(page: Page | Locator) {
    super(page, 'testResultModal');
    this.testResultForm = new TestResultForm(this.modalLocator);
  }
}
