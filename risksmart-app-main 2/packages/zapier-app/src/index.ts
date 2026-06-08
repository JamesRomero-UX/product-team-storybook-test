import type { Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core';
import { version as platformVersion } from 'zapier-platform-core';

import createIndicator from './actions/create_indicator.js';
import createRisk from './actions/create_risk.js';
import deleteIndicator from './actions/delete_indicator.js';
import deleteRisk from './actions/delete_risk.js';
import updateIndicator from './actions/update_indicator.js';
import updateRisk from './actions/update_risk.js';
import authentication from './authentication.js';
import { handleErrorResponse } from './middleware/after-response.js';
import findAction from './searches/find_action.js';
import findActionsByOwner from './searches/find_actions_by_owner.js';
import findAssessment from './searches/find_assessment.js';
import findControl from './searches/find_control.js';
import findEnterpriseRisk from './searches/find_enterprise_risk.js';
import findImpact from './searches/find_impact.js';
import findIndicator from './searches/find_indicator.js';
import findIssue from './searches/find_issue.js';
import findIssuesByOwner from './searches/find_issues_by_owner.js';
import findObligation from './searches/find_obligation.js';
import findPolicy from './searches/find_policy.js';
import findRisk from './searches/find_risk.js';
import findRisksByOwner from './searches/find_risks_by_owner.js';
import findThirdParty from './searches/find_third_party.js';
import findUser from './searches/find_user.js';
import getIssueAssessment from './searches/get_issue_assessment.js';
import getIssueDetails from './searches/get_issue_details.js';
import getRiskOverview from './searches/get_risk_overview.js';
import listActionLinkedItems from './searches/list_action_linked_items.js';
import listActions from './searches/list_actions.js';
import listAssessments from './searches/list_assessments.js';
import listControlLinkedItems from './searches/list_control_linked_items.js';
import listControls from './searches/list_controls.js';
import listEnterpriseRiskRisks from './searches/list_enterprise_risk_risks.js';
import listEnterpriseRisks from './searches/list_enterprise_risks.js';
import listImpacts from './searches/list_impacts.js';
import listIndicatorLinkedItems from './searches/list_indicator_linked_items.js';
import listIndicatorResults from './searches/list_indicator_results.js';
import listIndicators from './searches/list_indicators.js';
import listIssueActions from './searches/list_issue_actions.js';
import listIssueLinkedItems from './searches/list_issue_linked_items.js';
import listIssueUpdates from './searches/list_issue_updates.js';
import listIssues from './searches/list_issues.js';
import listObligationLinkedItems from './searches/list_obligation_linked_items.js';
import listObligations from './searches/list_obligations.js';
import listPolicies from './searches/list_policies.js';
import listPolicyLinkedItems from './searches/list_policy_linked_items.js';
import listRiskAcceptances from './searches/list_risk_acceptances.js';
import listRiskAppetites from './searches/list_risk_appetites.js';
import listRiskApprovals from './searches/list_risk_approvals.js';
import listRiskImpacts from './searches/list_risk_impacts.js';
import listRiskIndicators from './searches/list_risk_indicators.js';
import listRiskLinkedItems from './searches/list_risk_linked_items.js';
import listRisks from './searches/list_risks.js';
import listThirdParties from './searches/list_third_parties.js';
import listThirdPartyLinkedItems from './searches/list_third_party_linked_items.js';

const addBearerToken = (
  request: HttpRequestOptions,
  _z: ZObject,
  bundle: Bundle
) => {
  if (bundle.authData.sessionKey) {
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${bundle.authData.sessionKey}`,
    };
  }

  return request;
};

export default {
  version: '0.1.0',
  platformVersion,
  authentication,
  beforeRequest: [addBearerToken],
  afterResponse: [handleErrorResponse],
  flags: {
    cleanInputData: false,
  },
  triggers: {},
  creates: {
    [createRisk.key]: createRisk,
    [updateRisk.key]: updateRisk,
    [deleteRisk.key]: deleteRisk,
    [createIndicator.key]: createIndicator,
    [updateIndicator.key]: updateIndicator,
    [deleteIndicator.key]: deleteIndicator,
  },
  searches: {
    // Find by ID
    [findRisk.key]: findRisk,
    [findIndicator.key]: findIndicator,
    [findControl.key]: findControl,
    [findAction.key]: findAction,
    [findIssue.key]: findIssue,
    [findPolicy.key]: findPolicy,
    [findAssessment.key]: findAssessment,
    [findObligation.key]: findObligation,
    [findThirdParty.key]: findThirdParty,
    [findEnterpriseRisk.key]: findEnterpriseRisk,
    [findImpact.key]: findImpact,
    [findUser.key]: findUser,
    // List
    [listRisks.key]: listRisks,
    [listIndicators.key]: listIndicators,
    [listControls.key]: listControls,
    [listActions.key]: listActions,
    [listIssues.key]: listIssues,
    [listPolicies.key]: listPolicies,
    [listAssessments.key]: listAssessments,
    [listObligations.key]: listObligations,
    [listThirdParties.key]: listThirdParties,
    [listEnterpriseRisks.key]: listEnterpriseRisks,
    [listImpacts.key]: listImpacts,
    // Sub-resource lists
    [listRiskIndicators.key]: listRiskIndicators,
    [listRiskAppetites.key]: listRiskAppetites,
    [listRiskImpacts.key]: listRiskImpacts,
    [listRiskAcceptances.key]: listRiskAcceptances,
    [listRiskApprovals.key]: listRiskApprovals,
    [listRiskLinkedItems.key]: listRiskLinkedItems,
    [listActionLinkedItems.key]: listActionLinkedItems,
    [listControlLinkedItems.key]: listControlLinkedItems,
    [listIndicatorLinkedItems.key]: listIndicatorLinkedItems,
    [listIndicatorResults.key]: listIndicatorResults,
    [listIssueUpdates.key]: listIssueUpdates,
    [listIssueActions.key]: listIssueActions,
    [listIssueLinkedItems.key]: listIssueLinkedItems,
    [getIssueAssessment.key]: getIssueAssessment,
    [listPolicyLinkedItems.key]: listPolicyLinkedItems,
    [listThirdPartyLinkedItems.key]: listThirdPartyLinkedItems,
    [listObligationLinkedItems.key]: listObligationLinkedItems,
    [listEnterpriseRiskRisks.key]: listEnterpriseRiskRisks,
    // Super Zaps
    [findActionsByOwner.key]: findActionsByOwner,
    [findIssuesByOwner.key]: findIssuesByOwner,
    [findRisksByOwner.key]: findRisksByOwner,
    [getIssueDetails.key]: getIssueDetails,
    [getRiskOverview.key]: getRiskOverview,
  },
};
