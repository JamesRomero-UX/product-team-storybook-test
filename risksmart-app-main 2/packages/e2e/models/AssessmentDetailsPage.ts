import type { Locator, Page } from '@playwright/test';

import { AssessmentPage } from './AssessmentPage';
import { DropdownButton } from './forms/DropdownButton';
import { DeleteModal } from './modals/DeleteModal';
import { AssessmentActivitiesTab } from './tabs/AssessmentActivitiesTab';
import { AssessmentDetailsTab } from './tabs/AssessmentDetailsTab';
import { AssessmentFindingsTab } from './tabs/AssessmentFindingsTab';

export class AssessmentDetailsPage extends AssessmentPage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly tabs: Locator;
  readonly detailsTab: AssessmentDetailsTab;
  readonly activitiesTab: AssessmentActivitiesTab;
  readonly findingsTab: AssessmentFindingsTab;
  readonly actionsButton: DropdownButton;

  constructor(page: Page) {
    super(page);
    this.actionsButton = new DropdownButton(page, 'actionsMenu');
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.detailsTab = new AssessmentDetailsTab(page);
    this.activitiesTab = new AssessmentActivitiesTab(page);
    this.findingsTab = new AssessmentFindingsTab(page);
    this.deleteModal = new DeleteModal(page);
    this.tabs = page.locator(
      this.cloudScapeWrapper.findTabs().findTabLinks().toSelector()
    );
  }
}
