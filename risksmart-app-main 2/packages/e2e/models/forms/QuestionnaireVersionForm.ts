import { type Locator, type Page } from '@playwright/test';

import { ConfirmModal } from '../modals/ConfirmModal';
import { QuestionnaireFieldModal } from '../modals/QuestionnaireFieldModal';
import { QuestionnaireSectionModal } from '../modals/QuestionnaireSectionModal';
import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';

export type QuestionnaireVersionFormValues = {
  version: string;
};

class QuestionnaireSection {
  readonly addFieldButton: Locator;
  readonly formFieldModal: QuestionnaireFieldModal;
  constructor(private locator: Locator) {
    this.addFieldButton = this.locator.getByText('Add field');
    this.formFieldModal = new QuestionnaireFieldModal(this.locator.page());
  }
}

export class QuestionnaireVersionForm extends BaseForm<QuestionnaireVersionFormValues> {
  readonly addSectionButton: Locator;
  readonly confirmModal: ConfirmModal;
  readonly sectionModal: QuestionnaireSectionModal;
  readonly fieldModal: QuestionnaireFieldModal;

  constructor(page: Page) {
    super(page);

    this.fields = {
      version: new Input(page, 'version'),
    };
    this.confirmModal = new ConfirmModal(page);
    this.addSectionButton = page.getByText('Add Section');
    this.sectionModal = new QuestionnaireSectionModal(page);
  }

  async getSections() {
    const containers = await this.page
      .getByTestId('form-builder-container')
      .all();

    return containers.map((container) => new QuestionnaireSection(container));
  }
}
