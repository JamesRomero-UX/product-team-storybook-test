import { type Page } from '@playwright/test';

import { LinkedToAnAssessmentForm } from '../forms/LinkedToAnAssessmentForm';
import { BaseModal } from './BaseModal';

export class LinkToAnAssessmentModal extends BaseModal {
  readonly linkedToAnAssessmentForm: LinkedToAnAssessmentForm;

  constructor(page: Page) {
    super(page, 'linkToAnAssessmentModal');
    this.linkedToAnAssessmentForm = new LinkedToAnAssessmentForm(
      this.modalLocator
    );
  }
}
