import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { AddEnterpriseRiskPage } from '../models/AddEnterpriseRiskPage';
import { EnterpriseRiskDetailsPage } from '../models/EnterpriseRiskDetailsPage';
import { EnterpriseRiskRegisterPage } from '../models/EnterpriseRiskRegisterPage';
import type { RiskFormValues } from '../models/forms/RiskForm';
import { SettingsPage } from '../models/SettingsPage';

export class EnterpriseRiskScenarios {
  readonly page: Page;
  readonly enterpriseRiskRegistry: EnterpriseRiskRegisterPage;
  readonly addEnterpriseRiskPage: AddEnterpriseRiskPage;
  readonly enterpriseRiskDetailsPage: EnterpriseRiskDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.enterpriseRiskRegistry = new EnterpriseRiskRegisterPage(page);
    this.addEnterpriseRiskPage = new AddEnterpriseRiskPage(page);
    this.enterpriseRiskDetailsPage = new EnterpriseRiskDetailsPage(page);
  }

  async createEnterpriseRisk(risk: Partial<RiskFormValues>) {
    await this.enterpriseRiskRegistry.navigateToAndAssertTitle();
    await this.enterpriseRiskRegistry.addButton.click();
    await expect(this.addEnterpriseRiskPage.header.title).toHaveText(
      `Add Enterprise Risk`
    );

    await this.addEnterpriseRiskPage.detailsTab.riskForm.fillFormAndClickSave(
      risk
    );
    await this.addEnterpriseRiskPage.notificationBanner.expectNotification(
      'Enterprise risk added successfully'
    );
    await expect(this.enterpriseRiskDetailsPage.header.title).toHaveText(
      risk?.riskName ?? ''
    );
  }

  async createDefaultEnterpriseRisksEntitiesAndRisks() {
    await updateOrganisationFeatures(['enterprise_risk']);

    await this.page.goto('/');

    // Create entities
    const settingsPage = new SettingsPage(this.page);
    await settingsPage.navigateToAndAssertTitle();
    await settingsPage.entitiesTab.selectTabAndAssertTitle('Entities');
    await settingsPage.entitiesTab.createButton.click();
    await settingsPage.entitiesTab.detailModal.entityForm.fillFormAndClickSave({
      name: 'Asia Pacific',
      description: 'Real far away',
      weight: '2.0',
      owners: ['RiskManager1'],
    });

    await settingsPage.notificationBanner.expectNotification(
      'Object updated successfully'
    );

    await settingsPage.entitiesTab.createButton.click();
    await settingsPage.entitiesTab.detailModal.entityForm.fillFormAndClickSave({
      name: 'New Zealand',
      description: 'Where the kiwis live',
      parentName: 'Asia Pacific',
      weight: '1.5',
      owners: ['RiskManager1'],
    });
    await settingsPage.notificationBanner.expectNotification(
      'Object updated successfully'
    );

    await settingsPage.entitiesTab.createButton.click();
    await settingsPage.entitiesTab.detailModal.entityForm.fillFormAndClickSave({
      name: 'Australia',
      description: 'Where the kangaroos live',
      parentName: 'Asia Pacific',
      weight: '1.0',
      owners: ['RiskManager1'],
    });
    await settingsPage.notificationBanner.expectNotification(
      'Object updated successfully'
    );

    await this.createEnterpriseRisk({
      riskName: 'Risk 1',
      description: 'Risk 1 description',
    });

    await this.createEnterpriseRisk({
      riskName: 'Risk 2',
      tier: 'Tier 2',
      description: 'Risk 2 description',
      parentRiskTitle: 'Risk 1',
    });

    await this.createEnterpriseRisk({
      riskName: 'Risk 3 - 1',
      tier: 'Tier 3',
      description: 'Risk 3 - 1 description',
      parentRiskTitle: 'Risk 2',
    });

    await this.createEnterpriseRisk({
      riskName: 'Risk 3 - 2',
      tier: 'Tier 3',
      description: 'Risk 3 - 2 description',
      parentRiskTitle: 'Risk 2',
    });

    await this.enterpriseRiskRegistry.navigateToAndAssertTitle();
    await this.enterpriseRiskRegistry.table.setFilterInput('Title=Risk 3 - 1');
    await this.enterpriseRiskRegistry.table.checkRow(1);
    await this.enterpriseRiskRegistry.table.clearFiltersButton.click();
    await this.enterpriseRiskRegistry.table.setFilterInput('Title=Risk 3 - 2');
    await this.enterpriseRiskRegistry.table.checkRow(1);
    await this.enterpriseRiskRegistry.table.clearFiltersButton.click();

    await this.enterpriseRiskRegistry.addRiskToEntitiesButton.click();
    await this.enterpriseRiskRegistry.instantiateEnterpriseRiskModal.instantiateEnterpriseRiskForm.fillFormAndClickSave(
      {
        entities: [1],
      }
    );

    await this.enterpriseRiskRegistry.notificationBanner.expectNotification(
      'Enterprise risk updated successfully'
    );
  }
}
