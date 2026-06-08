import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

test(`Displays risk change request`, async ({ page, app }) => {
  await updateOrganisationFeatures(['approvers']);
  await page.goto('/');
  await app.requestsPage.navigateToAndAssertTitle();

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk description',
    owners: ['Standard1', 'StandardEnhanced1'],
  });

  await app.riskDetailsPage.approvalsTab.selectTab();
  await app.riskDetailsPage.approvalsTab.addButton.click();
  await app.riskDetailsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
    {
      workflow: 'Update Risk details',
      requireOwnerApprovalAtThisLevel: true,
    }
  );

  await app.riskDetailsPage.detailsTab.selectTab();
  await app.riskDetailsPage.detailsTab.riskForm.fillFormAndClickSave({
    riskName: 'Updated',
  });

  await app.riskDetailsPage.detailsTab.riskForm.actionRequiresApprovalModal.submitForApproval.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Change request confirmed'
  );

  await app.requestsPage.navigateToAndAssertTitle();
  await app.requestsPage.table.clearFiltersButton.click();
  await app.requestsPage.table.expectRowCount(1);
  await app.requestsPage.table.toggleAllColumnsToBeVisible();
  const row = await app.requestsPage.table.getRowAsObject(1);
  expect(row).toEqual(
    expect.objectContaining({
      ID: 'CR-1',
      'Parent ID': 'R-1',
      'Parent Name': 'Risk 1',
      'Parent Type': 'Risk',
      Approvers: ['Owner'],
      'Requested by': ['RiskManager1'],
      'Current approvers': ['Owner'],
      'Next approvers': '',
      'Requires Action': 'No',
      Status: 'Pending approval',
      Workflow: 'Update Risk details',
      'Date Last Actioned': '–',
      'Date Closed': '–',
      'Current Level': '1 of 1',
    })
  );
});

test(`Displays risk change request with an approver group`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['approvers']);
  await page.goto('/');

  // Ensure productlane widget is not visible
  await page.evaluate(() => {
    document.getElementById('ProductlaneWidget-MainWidget')?.remove();
    document
      .getElementsByClassName('ProductlaneWidget-MainWidget__Container')?.[0]
      ?.remove();
  });

  await app.groupScenarios.createGroupWithUsers(
    {
      name: 'User Group 1',
      description: 'User Group 1',
      ownerContributor: 'Yes',
    },
    ['RiskManager1']
  );
  await app.requestsPage.navigateToAndAssertTitle();

  await app.riskScenarios.createRisk({
    riskName: 'Risk 1',
    description: 'Risk description',
    owners: ['Standard1', 'StandardEnhanced1', 'User Group 1'],
  });

  await app.riskDetailsPage.approvalsTab.selectTab();
  await app.riskDetailsPage.approvalsTab.addButton.click();
  await app.riskDetailsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
    {
      workflow: 'Update Risk details',
      requireOwnerApprovalAtThisLevel: false,
      approvers: ['User Group 1'],
    }
  );

  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Approval added successfully'
  );

  await app.riskDetailsPage.detailsTab.selectTab();
  await app.riskDetailsPage.detailsTab.riskForm.fillFormAndClickSave({
    riskName: 'Updated',
  });

  await app.riskDetailsPage.detailsTab.riskForm.actionRequiresApprovalModal.submitForApproval.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Change request confirmed'
  );

  await app.requestsPage.navigateToAndAssertTitle();

  await app.requestsPage.table.expectRowCount(1);
  await app.requestsPage.table.toggleAllColumnsToBeVisible();
  await app.requestsPage.table.expectRowToContain(1, {
    ID: 'CR-1',
    'Parent ID': 'R-1',
    'Parent Name': 'Risk 1',
    'Parent Type': 'Risk',
    Approvers: ['User Group 1'],
    'Requested by': ['RiskManager1'],
    'Current approvers': ['User Group 1'],
    'Next approvers': '',
    'Requires Action': 'Yes',
    Status: 'Pending approval',
    Workflow: 'Update Risk details',
    'Date Last Actioned': '–',
    'Date Closed': '–',
    'Current Level': '1 of 1',
  });
});
