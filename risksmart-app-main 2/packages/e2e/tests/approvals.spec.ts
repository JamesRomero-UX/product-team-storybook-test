import { expect } from '@playwright/test';

import {
  getChangeRequestByActionTitle,
  getIssueAssessmentChangeRequestByIssueTitle,
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { invokeLambda } from '../awsUtils';
import { test } from '../base';
import type { IssueAssessmentFormFields } from '../models/forms/IssueAssessmentForm';
import { getOrganisation } from '../organisationPool';
import { users } from '../users';

test.describe('Approvals', () => {
  test.describe('update-action-target-close-date', () => {
    test(`Approves action when action target close date has changed`, async ({
      page,
      app,
    }) => {
      await insertTagTypes([
        { Name: 'Tag 1', Description: 'Tag 1 description' },
        { Name: 'Tag 2', Description: 'Tag 2 description' },
      ]);
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Department 1 description' },
        { Name: 'Department 2', Description: 'Department 2 description' },
      ]);

      await updateOrganisationFeatures(['approvers']);
      await page.goto('/');

      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.approvalsTab.selectTab();
      await app.settingsPage.approvalsTab.addButton.click();
      await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
        {
          workflow: 'Update Action target close date',
          approvers: ['RiskManager1'],
        }
      );
      await app.settingsPage.notificationBanner.expectNotification(
        'Approval added successfully'
      );

      const newActionName = 'A Kinda Unique Action Name - Jugglypuff';

      await app.actionScenarios.createActionFromRegister({
        title: newActionName,
        description: 'Action description',
        owners: [users.riskManager.friendlyName],
        contributors: [users.standard.friendlyName],
        status: 'Open',
        priority: 'Medium',
        dateRaised: '2000-01-01',
        targetCloseDate: '2025-01-01',
        attachFiles: [__dirname + '/testFiles/testFile.txt'],
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1', 'Department 2'],
      });

      await app.actionsRegisterPage.navigateToAndAssertTitle();
      await app.actionsRegisterPage.table.expectRowCount(1);
      await app.actionsRegisterPage.table.clickCellLink('Action title', 1);

      await app.actionDetailsPage.detailsTab.actionForm.expectValues({
        title: newActionName,
        description: 'Action description',
        owners: ['RiskManager1'],
        contributors: ['Standard1'],
        status: 'Open',
        priority: 'Medium',
        dateRaised: '2000-01-01',
        targetCloseDate: '2025-01-01',
        attachFiles: ['testFile.txt'],
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1', 'Department 2'],
      });

      await app.actionDetailsPage.detailsTab.selectTab();
      await app.actionDetailsPage.detailsTab.actionForm.fillFormAndClickSave({
        targetCloseDate: '2125-01-01',
      });

      await app.actionDetailsPage.detailsTab.actionForm.actionRequiresApprovalModal.submitForApproval.click();
      await app.actionDetailsPage.notificationBanner.expectNotification(
        'Change request confirmed'
      );

      await app.actionDetailsPage.detailsTab.actionForm.changeRequestAlert.showPendingChangesButton.click();
      await expect(
        app.actionDetailsPage.detailsTab.actionForm.approvalPanel.component
      ).toBeVisible();

      await app.actionDetailsPage.detailsTab.actionForm.approvalPanel.approve();

      await app.actionDetailsPage.detailsTab.actionForm.approvalPanel.approveButton.waitFor(
        { state: 'detached' }
      );

      const changeRequest = await getChangeRequestByActionTitle(newActionName);

      await invokeLambda('event-updateCRStatus', {
        detail: {
          event: {
            session_variables: {
              'x-hasura-org-id': getOrganisation().orgKey,
              'x-hasura-user-id': users.riskManager.Id,
              'x-hasura-role': users.riskManager.role,
              'x-hasura-tenant-name': 'MultiTenant',
            },
            data: {
              new: {
                Id: changeRequest.parent?.Id,
                ChangeRequestId: changeRequest.Id,
              },
            },
          },
        },
      });

      await app.actionDetailsPage.detailsTab.actionForm.changeRequestAlert.waitToBeRemoved();

      await page.reload();

      await app.actionDetailsPage.detailsTab.actionForm.expectValues({
        title: newActionName,
        description: 'Action description',
        owners: ['RiskManager1'],
        contributors: ['Standard1'],
        status: 'Open',
        priority: 'Medium',
        dateRaised: '2000-01-01',
        targetCloseDate: '2125-01-01',
        attachFiles: ['testFile.txt'],
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1', 'Department 2'],
      });

      await app.requestsPage.navigateToAndAssertTitle();

      await app.requestsPage.table.toggleAllColumnsToBeVisible();
      await app.requestsPage.table.clearFiltersButton.click();
      await app.requestsPage.table.expectRowCount(1);
      await app.requestsPage.table.expectRowToContain(1, {
        ID: 'CR-1',
        'Parent ID': 'A-1',
        'Parent Name': newActionName,
        'Parent Type': 'Action',
        Approvers: ['RiskManager1'],
        'Requested by': ['RiskManager1'],
        'Current approvers': '',
        'Next approvers': '',
        'Requires Action': 'No',
        Status: 'Approved',
        Workflow: 'Update Action target close date',
        'Current Level': '-',
      });
    });
  });
  test.describe('requester-rationale', () => {
    test(`Submits rationale with change request and displays it in approval panel`, async ({
      page,
      app,
    }) => {
      await insertTagTypes([
        { Name: 'Tag 1', Description: 'Tag 1 description' },
        { Name: 'Tag 2', Description: 'Tag 2 description' },
      ]);
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Department 1 description' },
        { Name: 'Department 2', Description: 'Department 2 description' },
      ]);

      await updateOrganisationFeatures(['approvers']);
      await page.goto('/');

      // Set up approval workflow
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.approvalsTab.selectTab();
      await app.settingsPage.approvalsTab.addButton.click();
      await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
        {
          workflow: 'Update Action target close date',
          approvers: ['RiskManager1'],
        }
      );
      await app.settingsPage.notificationBanner.expectNotification(
        'Approval added successfully'
      );

      const newActionName = 'Rationale Test Action - Pikachu';

      await app.actionScenarios.createActionFromRegister({
        title: newActionName,
        description: 'Action description',
        owners: [users.riskManager.friendlyName],
        contributors: [users.standard.friendlyName],
        status: 'Open',
        priority: 'Medium',
        dateRaised: '2000-01-01',
        targetCloseDate: '2025-01-01',
        attachFiles: [__dirname + '/testFiles/testFile.txt'],
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1', 'Department 2'],
      });

      await app.actionsRegisterPage.navigateToAndAssertTitle();
      await app.actionsRegisterPage.table.expectRowCount(1);
      await app.actionsRegisterPage.table.clickCellLink('Action title', 1);

      // Edit target close date to trigger approval
      await app.actionDetailsPage.detailsTab.selectTab();
      await app.actionDetailsPage.detailsTab.actionForm.fillFormAndClickSave({
        targetCloseDate: '2125-01-01',
      });

      // Fill rationale and submit for approval
      const rationale = 'Extending deadline due to Q1 resource constraints';
      await app.actionDetailsPage.detailsTab.actionForm.actionRequiresApprovalModal.fillRationaleAndSubmit(
        rationale
      );
      await app.actionDetailsPage.notificationBanner.expectNotification(
        'Change request confirmed'
      );

      // Open approval panel and verify rationale is displayed
      await app.actionDetailsPage.detailsTab.actionForm.changeRequestAlert.showPendingChangesButton.click();
      await expect(
        app.actionDetailsPage.detailsTab.actionForm.approvalPanel.component
      ).toBeVisible();

      const rationaleAlert = page.getByTestId('requester-rationale-alert');
      await expect(rationaleAlert).toBeVisible();
      await expect(rationaleAlert).toContainText(rationale);
    });

    test(`Submits change request without rationale`, async ({ page, app }) => {
      await insertTagTypes([
        { Name: 'Tag 1', Description: 'Tag 1 description' },
        { Name: 'Tag 2', Description: 'Tag 2 description' },
      ]);
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Department 1 description' },
        { Name: 'Department 2', Description: 'Department 2 description' },
      ]);

      await updateOrganisationFeatures(['approvers']);
      await page.goto('/');

      // Set up approval workflow
      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.approvalsTab.selectTab();
      await app.settingsPage.approvalsTab.addButton.click();
      await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
        {
          workflow: 'Update Action target close date',
          approvers: ['RiskManager1'],
        }
      );
      await app.settingsPage.notificationBanner.expectNotification(
        'Approval added successfully'
      );

      const newActionName = 'No Rationale Test Action - Charmander';

      await app.actionScenarios.createActionFromRegister({
        title: newActionName,
        description: 'Action description',
        owners: [users.riskManager.friendlyName],
        contributors: [users.standard.friendlyName],
        status: 'Open',
        priority: 'Medium',
        dateRaised: '2000-01-01',
        targetCloseDate: '2025-01-01',
        attachFiles: [__dirname + '/testFiles/testFile.txt'],
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1', 'Department 2'],
      });

      await app.actionsRegisterPage.navigateToAndAssertTitle();
      await app.actionsRegisterPage.table.expectRowCount(1);
      await app.actionsRegisterPage.table.clickCellLink('Action title', 1);

      // Edit target close date to trigger approval
      await app.actionDetailsPage.detailsTab.selectTab();
      await app.actionDetailsPage.detailsTab.actionForm.fillFormAndClickSave({
        targetCloseDate: '2125-01-01',
      });

      // Submit without filling rationale
      await app.actionDetailsPage.detailsTab.actionForm.actionRequiresApprovalModal.submitForApproval.click();
      await app.actionDetailsPage.notificationBanner.expectNotification(
        'Change request confirmed'
      );

      // Open approval panel and verify no rationale alert is shown
      await app.actionDetailsPage.detailsTab.actionForm.changeRequestAlert.showPendingChangesButton.click();
      await expect(
        app.actionDetailsPage.detailsTab.actionForm.approvalPanel.component
      ).toBeVisible();

      const rationaleAlert = page.getByTestId('requester-rationale-alert');
      await expect(rationaleAlert).not.toBeVisible();
    });
  });

  test.describe('update-issue-assessment-target-close-date', () => {
    // This test is currently flaky - skipping until our events are reliable in e2e

    test.skip(`Approves issue assessment when target close date has changed`, async ({
      page,
      app,
    }) => {
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Department 1 description' },
        { Name: 'Department 2', Description: 'Department 2 description' },
      ]);
      await insertTagTypes([
        { Name: 'Tag 1', Description: 'Tag 1 description' },
        { Name: 'Tag 2', Description: 'Tag 2 description' },
      ]);

      await updateOrganisationFeatures(['approvers']);
      await page.goto('/');

      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.approvalsTab.selectTab();
      await app.settingsPage.approvalsTab.addButton.click();
      await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
        {
          workflow: 'Update Issue assessment target close date',
          approvers: ['RiskManager1'],
        }
      );
      await app.settingsPage.notificationBanner.expectNotification(
        'Approval added successfully'
      );

      const newIssueTitle = 'A Kinda Unique Issue Title - Pumpkaboo';

      await app.issueScenarios.createIssue({
        title: newIssueTitle,
        details: 'Issue description 1',
        dateIdentified: '2020-01-01',
        dateOccurred: '2020-01-01',
      });
      await app.issueRegisterPage.table.clickCellLink('Title', 1);

      await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
        'Assessment'
      );

      const issueAssessment: Partial<IssueAssessmentFormFields> = {
        issueType: 'Material Impact',
        severity: 'High',
        status: 'Pending',
        targetCloseDate: '2024-12-31',
        certifiedIndividual: 'RiskManager1',
        regulatoryBreach: 'Yes',
        regulationsBreached: 'Regulation 1, regulation 2',
        issueCausedByThirdParty: 'Yes',
        thirdPartyResponsible: 'Third Party 1',
        issueCausedBySystemIssue: 'Yes',
        systemResponsible: 'System 1',
        policyBreach: 'Yes',
        policiesBreached: 'Policy 1, Policy 2',
        policyOwner: 'RiskManager1',
        policyOwnerCommentary: 'Policy owner commentary',
        tags: ['Tag 1', 'Tag 2'],
        departments: ['Department 1'],
        reportable: 'Yes',
        rationale: 'Rationale for assessment',
      };

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
        issueAssessment
      );
      await app.issueDetailsPage.notificationBanner.expectNotification(
        'Assessment updated successfully'
      );

      await app.issueDetailsPage.issueAssessmentTab.selectTabAndAssertTitle(
        'Assessment'
      );

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.expectValues(
        issueAssessment
      );

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
        { targetCloseDate: '2125-01-01' }
      );

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.actionRequiresApprovalModal.submitForApproval.click();
      await app.issueDetailsPage.notificationBanner.expectNotification(
        'Change request confirmed'
      );

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.changeRequestAlert.showPendingChangesButton.click();
      await expect(
        app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm
          .approvalPanel.component
      ).toBeVisible();

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.approvalPanel.approve();

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.approvalPanel.approveButton.waitFor(
        { state: 'detached' }
      );

      const changeRequest =
        await getIssueAssessmentChangeRequestByIssueTitle(newIssueTitle);

      await invokeLambda('event-updateCRStatus', {
        detail: {
          event: {
            session_variables: {
              'x-hasura-org-id': getOrganisation().orgKey,
              'x-hasura-user-id': users.riskManager.Id,
              'x-hasura-role': users.riskManager.role,
              'x-hasura-tenant-name': 'MultiTenant',
            },
            data: {
              new: {
                Id: changeRequest?.parent?.Id,
                ChangeRequestId: changeRequest.Id,
              },
            },
          },
        },
      });

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.changeRequestAlert.waitToBeRemoved();

      await page.reload();

      await app.issueDetailsPage.issueAssessmentTab.issueAssessmentForm.expectValues(
        {
          ...issueAssessment,
          targetCloseDate: '2125-01-01',
        }
      );

      await app.requestsPage.navigateToAndAssertTitle();

      await app.requestsPage.table.toggleAllColumnsToBeVisible();
      await app.requestsPage.table.clearFiltersButton.click();
      await app.requestsPage.table.expectRowCount(1);
      await app.requestsPage.table.expectRowToContain(1, {
        ID: 'CR-1',
        'Parent Name': newIssueTitle,
        'Parent Type': 'Issue Assessment',
        Approvers: ['RiskManager1'],
        'Requested by': ['RiskManager1'],
        'Current approvers': '',
        'Next approvers': '',
        'Requires Action': 'No',
        Status: 'Approved',
        Workflow: 'Update Issue assessment target close date',
        'Current Level': '-',
      });
    });
  });
});
