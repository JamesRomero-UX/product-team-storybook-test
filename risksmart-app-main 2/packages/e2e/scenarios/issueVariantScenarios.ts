import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import _ from 'lodash';

import { IssueVariantRegisterPage } from '../models/IssueVariantRegisterPage';

export interface RequiredIssueFormValues {
  title: string;
  details?: string;
}

export class IssueVariantScenarios {
  readonly page: Page;
  readonly issueVariantRegisterPage: IssueVariantRegisterPage;
  readonly variantTaxonomy: {
    singular: string;
    plural: string;
  };

  constructor(
    page: Page,
    variantTaxonomy: {
      singular: string;
      plural: string;
    }
  ) {
    this.page = page;
    this.variantTaxonomy = variantTaxonomy;
    this.issueVariantRegisterPage = new IssueVariantRegisterPage(
      page,
      variantTaxonomy.singular
    );
  }

  /**
   * Creates an issue variant
   *
   * @param variant
   */
  async createIssueVariant(variant: RequiredIssueFormValues) {
    await this.issueVariantRegisterPage.navigateTo(this.variantTaxonomy.plural);
    await expect(this.issueVariantRegisterPage.header.title).toHaveText(
      `${_.startCase(this.variantTaxonomy.singular)} Register`
    );
    const rows = await this.issueVariantRegisterPage.table.getRowCount();
    await this.issueVariantRegisterPage.addButton.click();

    await this.issueVariantRegisterPage.issueModal.issueForm.fillFormAndClickSave(
      {
        title: variant.title,
        details: variant.details,
        dateIdentified: '2020-01-01',
        dateOccurred: '2020-01-01',
      }
    );

    await this.issueVariantRegisterPage.notificationBanner.expectNotification(
      `${this.variantTaxonomy.singular} added successfully`
    );
    await this.issueVariantRegisterPage.table.expectRowCount(rows + 1);
    await expect(
      await this.issueVariantRegisterPage.table.getBodyCell('Title', 1)
    ).toHaveText(variant.title);
  }
}
