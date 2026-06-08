import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DeleteModal } from './modals/DeleteModal';
import { ThirdPartyDetailsTab } from './tabs/ThirdPartyDetailsTab';
import { ThirdPartyQuestionnairesTab } from './tabs/ThirdPartyQuestionnairesTab';

export class ThirdPartyDetailsPage extends BasePage {
  readonly detailsTab: ThirdPartyDetailsTab;
  readonly questionnairesTab: ThirdPartyQuestionnairesTab;
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page);

    this.detailsTab = new ThirdPartyDetailsTab(page, 'details');
    this.questionnairesTab = new ThirdPartyQuestionnairesTab(
      page,
      'questionnaires'
    );
    this.deleteButton = page.getByRole('button', {
      name: 'Delete Third Party',
    });
    this.deleteModal = new DeleteModal(page);
  }
}
