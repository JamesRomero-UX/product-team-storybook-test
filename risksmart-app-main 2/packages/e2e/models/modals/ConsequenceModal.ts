import { type Page } from '@playwright/test';

import { ConsequenceForm } from '../forms/ConsequenceForm';
import { BaseModal } from './BaseModal';

export class ConsequenceModal extends BaseModal {
  readonly consequenceForm: ConsequenceForm;

  constructor(page: Page) {
    super(page, 'consequenceModal');
    this.consequenceForm = new ConsequenceForm(page);
  }
}
