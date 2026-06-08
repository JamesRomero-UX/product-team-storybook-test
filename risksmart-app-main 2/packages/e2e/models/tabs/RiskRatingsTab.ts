import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { RatingModal } from '../modals/RatingModal';
import { Tab } from './Tab';

export class RiskRatingsTab extends Tab {
  readonly riskRatingTable: TableComponent;
  readonly complianceAssessmentRatingTable: TableComponent;
  readonly internalAuditRatingTable: TableComponent;
  readonly addButton: Locator;
  readonly ratingModal: RatingModal;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page, 'ratings');
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.riskRatingTable = new TableComponent(
      page,
      '[data-testid="risk-rating-table"]'
    );
    this.complianceAssessmentRatingTable = new TableComponent(
      page,
      '[data-testid="compliance-assessment-rating-table"]'
    );
    this.internalAuditRatingTable = new TableComponent(
      page,
      '[data-testid="internal-audit-rating-table"]'
    );
    this.addButton = this.header.getByRole('button', { name: 'Add rating' });
    this.ratingModal = new RatingModal(page);
  }
}
