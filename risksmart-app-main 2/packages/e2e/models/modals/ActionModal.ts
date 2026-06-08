import { type Page } from '@playwright/test';

import { ActionForm } from '../forms/ActionForm';
import { BaseModal } from './BaseModal';

export class ActionModal extends BaseModal {
  readonly actionForm: ActionForm;

  constructor(page: Page) {
    super(page, 'actionForm');
    this.actionForm = new ActionForm(page, "[data-testid='actionForm']");
  }
}
