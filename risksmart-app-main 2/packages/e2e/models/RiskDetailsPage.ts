import type { Locator, Page } from '@playwright/test';

import { DeleteModal } from './modals/DeleteModal';
import { LinkToAnAssessmentModal } from './modals/LinkToAnAssessmentModal';
import { RiskPage } from './RiskPage';
import { ActionsTab } from './tabs/ActionsTab';
import { ApproversTab } from './tabs/ApproversTab';
import { ControlsTab } from './tabs/ControlsTab';
import { ImpactsTab } from './tabs/ImpactsTab';
import { IndicatorsTab } from './tabs/IndicatorsTab';
import { LinkedItemsTab } from './tabs/LinkedItemsTab';
import { RiskAcceptancesTab } from './tabs/RiskAcceptancesTab';
import { RiskAppetiteTab } from './tabs/RiskAppetiteTab';
import { RiskRatingsTab } from './tabs/RiskRatingsTab';

export class RiskDetailsPage extends RiskPage {
  readonly deleteButton: Locator;
  readonly startRCSAButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly ratingsTab: RiskRatingsTab;
  readonly riskAppetiteTab: RiskAppetiteTab;
  readonly riskAcceptancesTab: RiskAcceptancesTab;
  readonly actionsTab: ActionsTab;
  readonly indicatorsTab: IndicatorsTab;
  readonly controlsTab: ControlsTab;
  readonly impactsTab: ImpactsTab;
  readonly approvalsTab: ApproversTab;
  readonly linkedItemsTab: LinkedItemsTab;
  readonly linkToAnAssessmentModal: LinkToAnAssessmentModal;

  constructor(page: Page) {
    super(page);
    this.linkToAnAssessmentModal = new LinkToAnAssessmentModal(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.startRCSAButton = page.getByRole('button', { name: 'Start RCSA' });
    this.deleteModal = new DeleteModal(page);
    this.ratingsTab = new RiskRatingsTab(page);
    this.riskAppetiteTab = new RiskAppetiteTab(page);
    this.riskAcceptancesTab = new RiskAcceptancesTab(page);
    this.actionsTab = new ActionsTab(page);
    this.indicatorsTab = new IndicatorsTab(page);
    this.controlsTab = new ControlsTab(page);
    this.impactsTab = new ImpactsTab(page);
    this.approvalsTab = new ApproversTab(page);
    this.linkedItemsTab = new LinkedItemsTab(page);
  }
}
