import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../BasePage';
import { DeleteModal } from '../modals/DeleteModal';
import { CausesTab } from '../tabs/CausesTab';
import { ConsequencesTab } from '../tabs/ConsequencesTab';
import { IssueAssessmentTab } from '../tabs/IssueAssessmentTab';
import { IssueDetailsTab } from '../tabs/IssueDetailsTab';
import { IssueUpdateTab } from '../tabs/IssueUpdateTab';

export class IssueDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly issueAssessmentTab: IssueAssessmentTab;
  readonly issueUpdateTab: IssueUpdateTab;
  readonly causesTab: CausesTab;
  readonly consequencesTab: ConsequencesTab;
  readonly activeTab: Locator;
  readonly issueDetailsTab: IssueDetailsTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete Issue' });
    this.deleteModal = new DeleteModal(page);
    this.issueAssessmentTab = new IssueAssessmentTab(page);
    this.issueUpdateTab = new IssueUpdateTab(page);
    this.causesTab = new CausesTab(page);
    this.consequencesTab = new ConsequencesTab(page);
    this.issueDetailsTab = new IssueDetailsTab(page);
    this.activeTab = this.page.locator(
      this.cloudScapeWrapper.findTabs().findActiveTab().toSelector()
    );
  }
}
