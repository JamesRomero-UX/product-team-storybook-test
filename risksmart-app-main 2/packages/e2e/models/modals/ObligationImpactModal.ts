import { type Page } from '@playwright/test';

import { ObligationImpactForm } from '../forms/ObligationImpactForm';
import { BaseModal } from './BaseModal';

export class ObligationImpactModal extends BaseModal {
  readonly obligationImpactForm: ObligationImpactForm;

  constructor(page: Page) {
    super(page, 'obligationImpactModal');
    this.obligationImpactForm = new ObligationImpactForm(this.modalLocator);
  }
}
