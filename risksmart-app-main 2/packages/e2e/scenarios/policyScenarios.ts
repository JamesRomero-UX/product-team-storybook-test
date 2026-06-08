import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { AddDocumentPage } from '../models/AddDocumentPage';
import { DocumentDetailsPage } from '../models/DocumentDetailsPage';
import { DocumentVersionPage } from '../models/DocumentVersionPage';
import type { DocumentFormValues } from '../models/forms/DocumentForm';
import type { ObligationRatingFormValues } from '../models/forms/ObligationRatingForm';
import { PolicyRegisterPage } from '../models/PolicyRegisterPage';

export class PolicyScenarios {
  readonly page: Page;
  readonly policyRegister: PolicyRegisterPage;
  readonly addDocumentPage: AddDocumentPage;
  readonly documentDetailsPage: DocumentDetailsPage;
  readonly documentVersionPage: DocumentVersionPage;

  constructor(page: Page) {
    this.page = page;
    this.policyRegister = new PolicyRegisterPage(page);
    this.addDocumentPage = new AddDocumentPage(page);
    this.documentDetailsPage = new DocumentDetailsPage(page);
    this.documentVersionPage = new DocumentVersionPage(page);
  }

  /**
   * Creates a document
   *
   * @param document
   */
  async createDocument(document: Partial<DocumentFormValues>) {
    await this.navigateToAddDocumentPage();

    await this.addDocumentPage.detailsTab.documentForm.fillFormAndClickSave(
      document
    );
    await this.addDocumentPage.notificationBanner.expectNotification(
      'Document added successfully'
    );
    await expect(this.documentDetailsPage.header.title).toHaveText(
      document?.title ?? ''
    );
  }

  /**
   * Creates a document rating
   *
   * @param rating Rating
   */
  async createDocumentRatingFromDocumentDetailPage(
    rating: ObligationRatingFormValues
  ) {
    await this.documentDetailsPage.ratingsTab.selectTab();
    const rowCount =
      await this.documentDetailsPage.ratingsTab.table.getRowCount();

    await this.documentDetailsPage.ratingsTab.addButton.click();
    const ratingForm =
      this.documentDetailsPage.ratingsTab.ratingModal.ratingForm;
    await ratingForm.fillFormAndClickSave(rating);

    await this.documentDetailsPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
    await this.documentDetailsPage.ratingsTab.table.expectRowCount(
      rowCount + 1
    );
  }

  async navigateToAddDocumentPage() {
    await this.policyRegister.navigateToAndAssertTitle();

    await this.policyRegister.addButton.click();
    await expect(this.addDocumentPage.header.title).toHaveText(`Add Document`);
  }

  async navigateToAddVersionFromDocumentDetails() {
    await this.documentDetailsPage.versionTab.selectTab();
    await expect(this.documentDetailsPage.versionTab.title).toHaveText(
      'Versions'
    );

    await this.documentDetailsPage.versionTab.addButton.click();
    await expect(this.documentVersionPage.header.title).toHaveText(
      'Create Document Version'
    );
  }
}
