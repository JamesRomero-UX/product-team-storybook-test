import { type Page } from '@playwright/test';

import { CustomisableFieldForm } from '../forms/CustomisableFieldForm';
import { DeleteModal } from './DeleteModal';

export class CustomisableFieldModal {
  readonly customisableFieldForm: CustomisableFieldForm;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    this.deleteModal = new DeleteModal(page);
    this.customisableFieldForm = new CustomisableFieldForm(page);
  }
}
