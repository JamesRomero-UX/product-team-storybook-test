import type { Locator, Page } from '@playwright/test';

import { InternalAuditReportPage } from './InternalAuditReportPage';
import { DeleteModal } from './modals/DeleteModal';
import { AssessmentDetailsTab } from './tabs/AssessmentDetailsTab';
import { AssessmentFindingsTab } from './tabs/AssessmentFindingsTab';
import { InternalAuditReportActivitiesTab } from './tabs/InternalAuditReportActivitiesTab';

export class InternalAuditReportDetailsPage extends InternalAuditReportPage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly tabs: Locator;
  readonly detailsTab: AssessmentDetailsTab;
  readonly activitiesTab: InternalAuditReportActivitiesTab;
  readonly findingsTab: AssessmentFindingsTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
    this.detailsTab = new AssessmentDetailsTab(page);
    this.activitiesTab = new InternalAuditReportActivitiesTab(page);
    this.findingsTab = new AssessmentFindingsTab(page);
    this.tabs = page.locator(
      this.cloudScapeWrapper.findTabs().findTabLinks().toSelector()
    );
  }
}
