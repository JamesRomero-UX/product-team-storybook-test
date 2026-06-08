import type { Locator, Page } from '@playwright/test';

import { InternalAuditPage } from './InternalAuditPage';
import { DeleteModal } from './modals/DeleteModal';
import { InternalAuditActionsTab } from './tabs/InternalAuditActionsTab';
import { InternalAuditDetailsTab } from './tabs/InternalAuditDetailsTab';
import { InternalAuditIssuesTab } from './tabs/InternalAuditIssuesTab';
import { InternalAuditReportsTab } from './tabs/InternalAuditReportsTab';

export class InternalAuditDetailsPage extends InternalAuditPage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly tabs: Locator;
  readonly detailsTab: InternalAuditDetailsTab;
  readonly actionsTab: InternalAuditActionsTab;
  readonly reportsTab: InternalAuditReportsTab;
  readonly issuesTab: InternalAuditIssuesTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
    this.detailsTab = new InternalAuditDetailsTab(page);
    this.actionsTab = new InternalAuditActionsTab(page);
    this.reportsTab = new InternalAuditReportsTab(page);
    this.issuesTab = new InternalAuditIssuesTab(page);
    this.tabs = page.locator(
      this.cloudScapeWrapper.findTabs().findTabLinks().toSelector()
    );
  }
}
