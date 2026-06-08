import type { RelationsBuilder } from 'drizzle-orm';
import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

const buildRelations = (r: RelationsBuilder<typeof schema>) => ({
  organisation: {
    organisationusers: r.many.organisationuser(),
  },
  organisation_audit: {},
  organisationuser: {
    organisation: r.one.organisation({
      from: r.organisationuser.OrgKey,
      to: r.organisation.OrgKey,
    }),
    user: r.one.user({
      from: r.organisationuser.User_Id,
      to: r.user.Id,
    }),
  },
  organisationuser_audit: {},
  user: {
    organisationusers: r.many.organisationuser(),
    userGroupUsers: r.many.user_group_user(),
    userRoles: r.many.user_role(),
  },
  user_activity_audit: {},
  user_audit: {},
  user_status: {},
  user_role: {
    user: r.one.user({
      from: r.user_role.UserId,
      to: r.user.Id,
    }),
    role_type: r.one.role_type({
      from: r.user_role.RoleKey,
      to: r.role_type.RoleKey,
    }),
  },
  role_resource_type: {
    role_type_resource_type: r.many.role_type_resource_type(),
  },
  role_type: {
    resourceTypes: r.many.role_type_resource_type(),
    userRoles: r.many.user_role(),
  },
  role_type_resource_type: {
    roleType: r.one.role_type({
      from: r.role_type_resource_type.RoleKey,
      to: r.role_type.RoleKey,
    }),
    resourceType: r.one.role_resource_type({
      from: r.role_type_resource_type.ResourceType,
      to: r.role_resource_type.ResourceType,
    }),
  },
  env: {},
  acceptance: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    changeRequests: r.many.change_request(),
    files: r.many.relation_file(),
    parents: r.many.acceptance_parent(),
    permissions: r.many.permission_view(),
    approvedByUser: r.one.user_view_active({
      from: r.acceptance.ApprovedByUser,
      to: r.user_view_active.Id,
    }),
    approvedByUserGroup: r.one.user_group({
      from: r.acceptance.ApprovedByUserGroup,
      to: r.user_group.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.acceptance.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.acceptance.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.acceptance.OrgKey,
      to: r.organisation.OrgKey,
    }),
    requestedByUser: r.one.user_view_active({
      from: r.acceptance.RequestedByUser,
      to: r.user_view_active.Id,
    }),
    requestedByUserGroup: r.one.user_group({
      from: r.acceptance.RequestedByUserGroup,
      to: r.user_group.Id,
    }),
    status: r.one.acceptance_status({
      from: r.acceptance.Status,
      to: r.acceptance_status.Value,
    }),
  },
  acceptance_audit: {},
  acceptance_parent: {
    acceptance: r.one.acceptance({
      from: r.acceptance_parent.Id,
      to: r.acceptance.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.acceptance_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.acceptance_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.acceptance_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.acceptance_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.acceptance_parent.ParentId,
      to: r.risk.Id,
    }),
  },
  acceptance_parent_audit: {
    risk_audit: r.one.risk_audit({
      from: r.acceptance_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  acceptance_status: {},
  access_type: {},
  action: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    files: r.many.relation_file(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    parents: r.many.action_parent(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    updates: r.many.action_update(),
    actionUpdateSummary: r.one.action_update_summary_view({
      from: r.action.Id,
      to: r.action_update_summary_view.ActionId,
    }),
    createdByUser: r.one.user_view_active({
      from: r.action.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.action.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.action.OrgKey,
      to: r.organisation.OrgKey,
    }),
    status: r.one.action_status({
      from: r.action.Status,
      to: r.action_status.Value,
    }),
  },
  action_audit: {},
  action_parent: {
    action: r.one.action({
      from: r.action_parent.ActionId,
      to: r.action.Id,
    }),
    assessment: r.one.assessment({
      from: r.action_parent.ParentId,
      to: r.assessment.Id,
    }),
    complianceMonitoringAssessment: r.one.compliance_monitoring_assessment({
      from: r.action_parent.ParentId,
      to: r.compliance_monitoring_assessment.Id,
    }),
    control: r.one.control({
      from: r.action_parent.ParentId,
      to: r.control.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.action_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.action_parent.ParentId,
      to: r.document.Id,
    }),
    internalAuditEntity: r.one.internal_audit_entity({
      from: r.action_parent.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    internalAuditReport: r.one.internal_audit_report({
      from: r.action_parent.ParentId,
      to: r.internal_audit_report.Id,
    }),
    issue: r.one.issue({
      from: r.action_parent.ParentId,
      to: r.issue.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.action_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    obligation: r.one.obligation({
      from: r.action_parent.ParentId,
      to: r.obligation.Id,
    }),
    obligation_change: r.one.obligation_change({
      from: r.action_parent.ParentId,
      to: r.obligation_change.Id,
    }),
    organisation: r.one.organisation({
      from: r.action_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.action_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.action_parent.ParentId,
      to: r.risk.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.action_parent.ParentId,
      to: r.third_party.Id,
    }),
  },
  action_parent_audit: {
    control_audit: r.one.control_audit({
      from: r.action_parent_audit.ParentId,
      to: r.control_audit.Id,
    }),
    risk_audit: r.one.risk_audit({
      from: r.action_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  action_status: {},
  action_update: {
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    action: r.one.action({
      from: r.action_update.ParentActionId,
      to: r.action.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.action_update.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.action_update.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.action_update.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  action_update_audit: {},
  action_update_summary_view: {
    permissions: r.many.permission_view(),
  },
  aggregation_org: {
    organisation: r.one.organisation({
      from: r.aggregation_org.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  ancestor_contributor_view: {
    acceptance: r.one.acceptance({
      from: r.ancestor_contributor_view.Id,
      to: r.acceptance.Id,
    }),
    action: r.one.action({
      from: r.ancestor_contributor_view.Id,
      to: r.action.Id,
    }),
    appetite: r.one.appetite({
      from: r.ancestor_contributor_view.Id,
      to: r.appetite.Id,
    }),
    assessment: r.one.assessment({
      from: r.ancestor_contributor_view.Id,
      to: r.assessment.Id,
    }),
    change_request: r.one.change_request({
      from: r.ancestor_contributor_view.Id,
      to: r.change_request.Id,
    }),
    control: r.one.control({
      from: r.ancestor_contributor_view.Id,
      to: r.control.Id,
    }),
    control_group: r.one.control_group({
      from: r.ancestor_contributor_view.Id,
      to: r.control_group.Id,
    }),
    compliance_monitoring_assessment: r.one.compliance_monitoring_assessment({
      from: r.ancestor_contributor_view.Id,
      to: r.compliance_monitoring_assessment.Id,
    }),
    dashboard: r.one.dashboard({
      from: r.ancestor_contributor_view.UserGroupId,
      to: r.dashboard.Id,
    }),
    document: r.one.document({
      from: r.ancestor_contributor_view.Id,
      to: r.document.Id,
    }),
    document_assessment_result: r.one.document_assessment_result({
      from: r.ancestor_contributor_view.Id,
      to: r.document_assessment_result.Id,
    }),
    document_internal_audit_result: r.one.document_internal_audit_result({
      from: r.ancestor_contributor_view.Id,
      to: r.document_internal_audit_result.Id,
    }),
    document_second_line_result: r.one.document_second_line_result({
      from: r.ancestor_contributor_view.Id,
      to: r.document_second_line_result.Id,
    }),
    entity: r.one.entity({
      from: r.ancestor_contributor_view.Id,
      to: r.entity.Id,
    }),
    impact: r.one.impact({
      from: r.ancestor_contributor_view.Id,
      to: r.impact.Id,
    }),
    indicator: r.one.indicator({
      from: r.ancestor_contributor_view.Id,
      to: r.indicator.Id,
    }),
    internal_audit_entity: r.one.internal_audit_entity({
      from: r.ancestor_contributor_view.Id,
      to: r.internal_audit_entity.Id,
    }),
    internal_audit_report: r.one.internal_audit_report({
      from: r.ancestor_contributor_view.Id,
      to: r.internal_audit_report.Id,
    }),
    issue: r.one.issue({
      from: r.ancestor_contributor_view.Id,
      to: r.issue.Id,
    }),
    node: r.one.node({
      from: r.ancestor_contributor_view.Id,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.ancestor_contributor_view.Id,
      to: r.obligation.Id,
    }),
    obligationAssessmentResult: r.one.obligation_assessment_result({
      from: r.ancestor_contributor_view.Id,
      to: r.obligation_assessment_result.Id,
    }),
    risk: r.one.risk({
      from: r.ancestor_contributor_view.Id,
      to: r.risk.Id,
    }),
    risk_assessment_result: r.one.risk_assessment_result({
      from: r.ancestor_contributor_view.Id,
      to: r.risk_assessment_result.Id,
    }),
    third_party: r.one.third_party({
      from: r.ancestor_contributor_view.Id,
      to: r.third_party.Id,
    }),
    third_party_response: r.one.third_party_response({
      from: r.ancestor_contributor_view.Id,
      to: r.third_party_response.Id,
    }),
    user: r.one.user_view_active({
      from: r.ancestor_contributor_view.UserId,
      to: r.user_view_active.Id,
    }),
    user_group: r.one.user_group({
      from: r.ancestor_contributor_view.UserGroupId,
      to: r.user_group.Id,
    }),
    questionnaire_template: r.one.questionnaire_template({
      from: r.ancestor_contributor_view.UserGroupId,
      to: r.questionnaire_template.Id,
    }),
    uncontrolledRiskInternalAuditResult:
      r.one.risk_uncontrolled_internal_audit_result({
        from: r.ancestor_contributor_view.Id,
        to: r.risk_uncontrolled_internal_audit_result.Id,
      }),
    controlledRiskInternalAuditResult:
      r.one.risk_controlled_internal_audit_result({
        from: r.ancestor_contributor_view.Id,
        to: r.risk_controlled_internal_audit_result.Id,
      }),
    uncontrolledRiskSecondLineResult:
      r.one.risk_uncontrolled_second_line_result({
        from: r.ancestor_contributor_view.Id,
        to: r.risk_uncontrolled_second_line_result.Id,
      }),
    controlledRiskSecondLineResult: r.one.risk_controlled_second_line_result({
      from: r.ancestor_contributor_view.Id,
      to: r.risk_controlled_second_line_result.Id,
    }),
    obligationInternalAuditResult: r.one.obligation_internal_audit_result({
      from: r.ancestor_contributor_view.Id,
      to: r.obligation_internal_audit_result.Id,
    }),
    obligationSecondLineResult: r.one.obligation_second_line_result({
      from: r.ancestor_contributor_view.Id,
      to: r.obligation_second_line_result.Id,
    }),
  },
  appetite: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.appetite_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.appetite.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    impact: r.one.impact({
      from: r.appetite.ImpactId,
      to: r.impact.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.appetite.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.appetite.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  appetite_audit: {},
  appetite_model: {},
  appetite_parent: {
    appetite: r.one.appetite({
      from: r.appetite_parent.Id,
      to: r.appetite.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.appetite_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.appetite_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.appetite_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.appetite_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.appetite_parent.ParentId,
      to: r.risk.Id,
    }),
  },
  appetite_parent_audit: {
    risk_audit: r.one.risk_audit({
      from: r.appetite_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  appetite_status: {},
  appetite_type: {},
  approval: {
    levels: r.many.approval_level(),
    createdBy: r.one.user_view_active({
      from: r.approval.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.approval.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    org: r.one.organisation({
      from: r.approval.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.approval.ParentId,
      to: r.node.Id,
    }),
    document: r.one.document({
      from: r.approval.ParentId,
      to: r.document.Id,
    }),
  },
  approval_audit: {},
  approval_in_flight_edit_rule: {},
  approval_level: {
    approvers: r.many.approver(),
    approval: r.one.approval({
      from: r.approval_level.ApprovalId,
      to: r.approval.Id,
    }),
    ruleType: r.one.approval_rule_type({
      from: r.approval_level.ApprovalRuleType,
      to: r.approval_rule_type.Value,
    }),
  },
  approval_level_audit: {},
  approval_rule_type: {},
  approval_status: {},
  approver: {
    responses: r.many.approver_response(),
    createdBy: r.one.user_view_active({
      from: r.approver.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    group: r.one.user_group({
      from: r.approver.UserGroupId,
      to: r.user_group.Id,
    }),
    level: r.one.approval_level({
      from: r.approver.LevelId,
      to: r.approval_level.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.approver.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    org: r.one.organisation({
      from: r.approver.OrgKey,
      to: r.organisation.OrgKey,
    }),
    user: r.one.user_view_active({
      from: r.approver.UserId,
      to: r.user_view_active.Id,
    }),
  },
  approver_audit: {},
  approver_response: {
    approvedBy: r.one.user_view_active({
      from: r.approver_response.ApprovedByUser,
      to: r.user_view_active.Id,
    }),
    approver: r.one.approver({
      from: r.approver_response.ApproverId,
      to: r.approver.Id,
    }),
    changeRequest: r.one.change_request({
      from: r.approver_response.ChangeRequestId,
      to: r.change_request.Id,
    }),
  },
  approver_response_audit: {},
  assessment: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    assessmentActions: r.many.action_parent(),
    assessmentActivities: r.many.assessment_activity(),
    assessmentIssues: r.many.issue_parent(),
    assessmentResults: r.many.assessment_result_parent(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    insertPermissions: r.many.insert_permission_view(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    completedByUser: r.one.user_view_active({
      from: r.assessment.CompletedByUser,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.assessment.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.assessment.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.assessment.OrgKey,
      to: r.organisation.OrgKey,
    }),
    originatingItem: r.one.node({
      from: r.assessment.OriginatingItemId,
      to: r.node.Id,
    }),
  },
  assessment_activity: {
    files: r.many.relation_file(),
    insertPermissions: r.many.insert_permission_view(),
    permissions: r.many.permission_view(),
    assignedUser: r.one.user_view_active({
      from: r.assessment_activity.AssignedUser,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.assessment_activity.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.assessment_activity.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.assessment_activity.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentAssessment: r.one.assessment({
      from: r.assessment_activity.ParentId,
      to: r.assessment.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.assessment_activity.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.assessment_activity.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentRisk: r.one.risk({
      from: r.assessment_activity.RiskId,
      to: r.risk.Id,
    }),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
  },
  assessment_activity_audit: {},
  assessment_activity_status: {},
  assessment_activity_type: {},
  assessment_audit: {},
  assessment_result_parent: {
    assessment: r.one.assessment({
      from: r.assessment_result_parent.ParentId,
      to: r.assessment.Id,
    }),
    assessment_result: r.one.node({
      from: r.assessment_result_parent.Id,
      to: r.node.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.assessment_result_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.assessment_result_parent.ParentId,
      to: r.document.Id,
    }),
    documentAssessmentResult: r.one.document_assessment_result({
      from: r.assessment_result_parent.Id,
      to: r.document_assessment_result.Id,
    }),
    impactRating: r.one.impact_rating({
      from: r.assessment_result_parent.Id,
      to: r.impact_rating.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.assessment_result_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    node: r.one.node({
      from: r.assessment_result_parent.ParentId,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.assessment_result_parent.ParentId,
      to: r.obligation.Id,
    }),
    obligationAssessmentResult: r.one.obligation_assessment_result({
      from: r.assessment_result_parent.Id,
      to: r.obligation_assessment_result.Id,
    }),
    organisation: r.one.organisation({
      from: r.assessment_result_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.assessment_result_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.assessment_result_parent.ParentId,
      to: r.risk.Id,
    }),
    riskAssessmentResult: r.one.risk_assessment_result({
      from: r.assessment_result_parent.Id,
      to: r.risk_assessment_result.Id,
    }),
    testResult: r.one.test_result({
      from: r.assessment_result_parent.Id,
      to: r.test_result.Id,
    }),
  },
  second_line_result_parent: {
    second_line_result: r.one.node({
      from: r.second_line_result_parent.Id,
      to: r.node.Id,
    }),
    complianceMonitoringAssessment: r.one.compliance_monitoring_assessment({
      from: r.second_line_result_parent.ParentId,
      to: r.compliance_monitoring_assessment.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.second_line_result_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.second_line_result_parent.ParentId,
      to: r.document.Id,
    }),
    documentAssessmentResult: r.one.document_second_line_result({
      from: r.second_line_result_parent.Id,
      to: r.document_second_line_result.Id,
    }),
    impactRating: r.one.impact_second_line_rating({
      from: r.second_line_result_parent.Id,
      to: r.impact_second_line_rating.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.second_line_result_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    node: r.one.node({
      from: r.second_line_result_parent.ParentId,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.second_line_result_parent.ParentId,
      to: r.obligation.Id,
    }),
    obligationAssessmentResult: r.one.obligation_second_line_result({
      from: r.second_line_result_parent.Id,
      to: r.obligation_second_line_result.Id,
    }),
    organisation: r.one.organisation({
      from: r.second_line_result_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.second_line_result_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.second_line_result_parent.ParentId,
      to: r.risk.Id,
    }),
    controlledRiskAssessmentResult: r.one.risk_controlled_second_line_result({
      from: r.second_line_result_parent.Id,
      to: r.risk_controlled_second_line_result.Id,
    }),
    uncontrolledRiskAssessmentResult:
      r.one.risk_uncontrolled_second_line_result({
        from: r.second_line_result_parent.Id,
        to: r.risk_uncontrolled_second_line_result.Id,
      }),
    testResult: r.one.control_test_second_line_result({
      from: r.second_line_result_parent.Id,
      to: r.control_test_second_line_result.Id,
    }),
  },
  internal_audit_result_parent: {
    internal_audit_result: r.one.node({
      from: r.internal_audit_result_parent.Id,
      to: r.node.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.internal_audit_result_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.internal_audit_result_parent.ParentId,
      to: r.document.Id,
    }),
    documentAssessmentResult: r.one.document_internal_audit_result({
      from: r.internal_audit_result_parent.Id,
      to: r.document_internal_audit_result.Id,
    }),
    impactRating: r.one.impact_internal_audit_rating({
      from: r.internal_audit_result_parent.Id,
      to: r.impact_internal_audit_rating.Id,
    }),
    internalAuditReport: r.one.internal_audit_report({
      from: r.internal_audit_result_parent.ParentId,
      to: r.internal_audit_report.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.internal_audit_result_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    node: r.one.node({
      from: r.internal_audit_result_parent.ParentId,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.internal_audit_result_parent.ParentId,
      to: r.obligation.Id,
    }),
    obligationAssessmentResult: r.one.obligation_internal_audit_result({
      from: r.internal_audit_result_parent.Id,
      to: r.obligation_internal_audit_result.Id,
    }),
    organisation: r.one.organisation({
      from: r.internal_audit_result_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.internal_audit_result_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.internal_audit_result_parent.ParentId,
      to: r.risk.Id,
    }),
    controlledRiskAssessmentResult: r.one.risk_controlled_internal_audit_result(
      {
        from: r.internal_audit_result_parent.Id,
        to: r.risk_controlled_internal_audit_result.Id,
      }
    ),
    uncontrolledRiskAssessmentResult:
      r.one.risk_uncontrolled_internal_audit_result({
        from: r.internal_audit_result_parent.Id,
        to: r.risk_uncontrolled_internal_audit_result.Id,
      }),
    testResult: r.one.control_test_internal_audit_result({
      from: r.internal_audit_result_parent.Id,
      to: r.control_test_internal_audit_result.Id,
    }),
  },
  assessment_result_parent_audit: {
    risk_audit: r.one.risk_audit({
      from: r.assessment_result_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  assessment_status: {},
  attestation_config: {
    groups: r.many.attestation_group(),
    records: r.many.attestation_record(),
    createdByUser: r.one.user_view_active({
      from: r.attestation_config.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.attestation_config.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.attestation_config.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.attestation_config.ParentId,
      to: r.node.Id,
    }),
  },
  attestation_cycle: {
    createdByUser: r.one.user_view_active({
      from: r.attestation_cycle.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.attestation_cycle.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.attestation_cycle.OrgKey,
      to: r.organisation.OrgKey,
    }),
    document_file: r.one.document_file({
      from: r.attestation_cycle.ParentId,
      to: r.document_file.Id,
    }),
    attestation_record: r.many.attestation_record({
      from: r.attestation_cycle.Id,
      to: r.attestation_record.CycleId,
    }),
  },
  attestation_cycle_audit: {},
  attestation_group: {
    config: r.one.attestation_config({
      from: r.attestation_group.ConfigId,
      to: r.attestation_config.ParentId,
    }),
    createdByUser: r.one.user_view_active({
      from: r.attestation_group.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    group: r.one.user_group({
      from: r.attestation_group.GroupId,
      to: r.user_group.Id,
      optional: false,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.attestation_group.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.attestation_group.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  attestation_record: {
    config: r.one.attestation_config({
      from: r.attestation_record.ConfigId,
      to: r.attestation_config.ParentId,
    }),
    createdBy: r.one.user_view_active({
      from: r.attestation_record.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document_file: r.one.document_file({
      from: r.attestation_record.ModifiedByUser,
      to: r.document_file.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.attestation_record.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    node: r.one.node({
      from: r.attestation_record.NodeId,
      to: r.node.Id,
      optional: false,
    }),
    user: r.one.user({
      from: r.attestation_record.UserId,
      to: r.user.Id,
      optional: false,
    }),
    carriedForwardFromRecord: r.one.attestation_record({
      from: r.attestation_record.CarriedForwardFromRecordId,
      to: r.attestation_record.Id,
      optional: true,
    }),
  },
  attestation_record_status: {},
  audit_log_view: {
    PerformedByUser: r.one.user_view_active({
      from: r.audit_log_view.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  business_area: {
    internalAuditEntities: r.many.internal_audit_entity(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.business_area.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.business_area.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.business_area.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  cause: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.cause.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    issue: r.one.issue({
      from: r.cause.ParentIssueId,
      to: r.issue.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.cause.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.cause.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  cause_audit: {},
  change_request: {
    contributors: r.many.change_request_contributor(),
    parentOwnerAndContributors: r.many.ancestor_contributor_view(),
    responses: r.many.approver_response(),
    createdBy: r.one.user_view_active({
      from: r.change_request.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.change_request.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    overriddenBy: r.one.user_view_active({
      from: r.change_request.OverriddenByUser,
      to: r.user_view_active.Id,
    }),
    parent: r.one.node({
      from: r.change_request.ParentId,
      to: r.node.Id,
    }),
    acceptance: r.one.acceptance({
      from: r.change_request.ParentId,
      to: r.acceptance.Id,
    }),
    document_file: r.one.document_file({
      from: r.change_request.ParentId,
      to: r.document_file.Id,
    }),
    risk: r.one.risk({
      from: r.change_request.ParentId,
      to: r.risk.Id,
    }),
    control: r.one.control({
      from: r.change_request.ParentId,
      to: r.control.Id,
    }),
    action: r.one.action({
      from: r.change_request.ParentId,
      to: r.action.Id,
    }),
    issue_assessment: r.one.issue_assessment({
      from: r.change_request.ParentId,
      to: r.issue_assessment.Id,
    }),
    requestedFileChanges: r.many.relation_file({
      from: r.change_request.Id,
      to: r.relation_file.ParentId,
    }),
  },
  change_request_audit: {},
  change_request_contributor: {
    changeRequest: r.one.change_request({
      from: r.change_request_contributor.ChangeRequestId,
      to: r.change_request.Id,
    }),
    user: r.one.user_view_active({
      from: r.change_request_contributor.UserId,
      to: r.user_view_active.Id,
    }),
  },
  change_request_contributor_audit: {},
  comment: {
    conversation: r.one.conversation({
      from: r.comment.ConversationId,
      to: r.conversation.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.comment.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.comment.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.comment.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  comment_audit: {},
  compliance_monitoring_assessment: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    assessmentActions: r.many.action_parent(),
    assessmentActivities: r.many.assessment_activity(),
    assessmentIssues: r.many.issue_parent(),
    assessmentResults: r.many.second_line_result_parent(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    insertPermissions: r.many.insert_permission_view(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    completedByUser: r.one.user_view_active({
      from: r.compliance_monitoring_assessment.CompletedByUser,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.compliance_monitoring_assessment.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.compliance_monitoring_assessment.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.compliance_monitoring_assessment.OrgKey,
      to: r.organisation.OrgKey,
    }),
    originatingItem: r.one.node({
      from: r.compliance_monitoring_assessment.OriginatingItemId,
      to: r.node.Id,
    }),
  },
  consequence: {
    permissions: r.many.permission_view(),
    costType: r.one.cost_type({
      from: r.consequence.CostType,
      to: r.cost_type.Value,
    }),
    createdByUser: r.one.user_view_active({
      from: r.consequence.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    issue: r.one.issue({
      from: r.consequence.ParentIssueId,
      to: r.issue.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.consequence.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.consequence.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  consequence_audit: {},
  consequence_type: {},
  contributor: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.contributor.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.contributor.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.contributor.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentNode: r.one.node({
      from: r.contributor.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.contributor.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.contributor.ParentId,
      to: r.assessment.Id,
    }),
    parentInternalAuditEntity: r.one.internal_audit_entity({
      from: r.contributor.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.contributor.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.contributor.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.contributor.ParentId,
      to: r.control.Id,
    }),
    parentDashboard: r.one.dashboard({
      from: r.contributor.ParentId,
      to: r.dashboard.Id,
    }),
    parentDocument: r.one.document({
      from: r.contributor.ParentId,
      to: r.document.Id,
    }),
    parentEntity: r.one.entity({
      from: r.contributor.ParentId,
      to: r.entity.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.contributor.ParentId,
      to: r.indicator.Id,
    }),
    parentIssue: r.one.issue({
      from: r.contributor.ParentId,
      to: r.issue.Id,
    }),
    parentImpact: r.one.impact({
      from: r.contributor.ParentId,
      to: r.impact.Id,
    }),
    parentRisk: r.one.risk({
      from: r.contributor.ParentId,
      to: r.risk.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.contributor.ParentId,
      to: r.obligation.Id,
    }),
    parentObligationChange: r.one.obligation_change({
      from: r.contributor.ParentId,
      to: r.obligation_change.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.contributor.ParentId,
      to: r.third_party.Id,
    }),
    parentThirdPartyResponse: r.one.third_party_response({
      from: r.contributor.ParentId,
      to: r.third_party_response.Id,
    }),
    user: r.one.user_view_active({
      optional: false,
      from: r.contributor.UserId,
      to: r.user_view_active.Id,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.contributor.ParentId,
      to: r.questionnaire_template.Id,
    }),
  },
  contributor_audit: {
    parentControlAudit: r.one.control_audit({
      from: r.contributor_audit.ParentId,
      to: r.control_audit.Id,
    }),
    parentRiskAudit: r.one.risk_audit({
      from: r.contributor_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  contributor_group: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.contributor_group.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    group: r.one.user_group({
      from: r.contributor_group.UserGroupId,
      to: r.user_group.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.contributor_group.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.contributor_group.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentNode: r.one.node({
      from: r.contributor_group.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.contributor_group.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.contributor_group.ParentId,
      to: r.assessment.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.contributor_group.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.contributor_group.ParentId,
      to: r.control.Id,
    }),
    parentDashboard: r.one.dashboard({
      from: r.contributor_group.ParentId,
      to: r.dashboard.Id,
    }),
    parentDocument: r.one.document({
      from: r.contributor_group.ParentId,
      to: r.document.Id,
    }),
    parentEntity: r.one.entity({
      from: r.contributor_group.ParentId,
      to: r.entity.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.contributor_group.ParentId,
      to: r.indicator.Id,
    }),
    parentInternalAuditEntity: r.one.internal_audit_entity({
      from: r.contributor_group.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.contributor_group.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentIssue: r.one.issue({
      from: r.contributor_group.ParentId,
      to: r.issue.Id,
    }),
    parentImpact: r.one.impact({
      from: r.contributor_group.ParentId,
      to: r.impact.Id,
    }),
    parentRisk: r.one.risk({
      from: r.contributor_group.ParentId,
      to: r.risk.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.contributor_group.ParentId,
      to: r.obligation.Id,
    }),
    parentObligationChange: r.one.obligation_change({
      from: r.contributor_group.ParentId,
      to: r.obligation_change.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.contributor_group.ParentId,
      to: r.third_party.Id,
    }),
    parentThirdPartyResponse: r.one.third_party_response({
      from: r.contributor_group.ParentId,
      to: r.third_party_response.Id,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.contributor_group.ParentId,
      to: r.questionnaire_template.Id,
    }),
  },
  contributor_group_audit: {
    parentControlAudit: r.one.control_audit({
      from: r.contributor_group_audit.ParentId,
      to: r.control_audit.Id,
    }),
    parentRiskAudit: r.one.risk_audit({
      from: r.contributor_group_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  contributor_type: {},
  contributor_view: {},
  control: {
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    indicators: r.many.indicator_parent(),
    issues: r.many.issue_parent(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    parents: r.many.control_parent(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    testResults: r.many.test_result(),
    createdByUser: r.one.user_view_active({
      from: r.control.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.control.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.control.OrgKey,
      to: r.organisation.OrgKey,
    }),
    schedule: r.one.schedule({
      from: r.control.Id,
      to: r.schedule.Id,
    }),
    scheduleState: r.one.schedule_state({
      from: r.control.Id,
      to: r.schedule_state.Id,
    }),
  },
  control_action_audit: {},
  control_audit: {
    actionAudits: r.many.action_parent_audit(),
    contributorAudits: r.many.contributor_audit(),
    contributorGroupAudits: r.many.contributor_group_audit(),
    departmentAudits: r.many.department_audit(),
    indicatorAudits: r.many.indicator_parent_audit(),
    issueAudits: r.many.issue_parent_audit(),
    ownerAudits: r.many.owner_audit(),
    ownerGroupAudits: r.many.owner_group_audit(),
    tagAudits: r.many.tag_audit(),
    testResultAudits: r.many.test_result_audit(),
    risk_audit: r.one.risk_audit({
      from: r.control_audit.ParentRiskId,
      to: r.risk_audit.Id,
    }),
  },
  control_group: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    controls: r.many.control_parent(),
    createdByUser: r.one.user_view_active({
      from: r.control_group.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.control_group.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.control_group.OrgKey,
      to: r.organisation.OrgKey,
    }),
    owner: r.one.user_view_active({
      from: r.control_group.Owner,
      to: r.user_view_active.Id,
    }),
  },
  control_group_audit: {},
  control_parent: {
    control: r.one.control({
      from: r.control_parent.ControlId,
      to: r.control.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.control_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    group: r.one.control_group({
      from: r.control_parent.ParentId,
      to: r.control_group.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.control_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    obligation: r.one.obligation({
      from: r.control_parent.ParentId,
      to: r.obligation.Id,
    }),
    organisation: r.one.organisation({
      from: r.control_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.control_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.control_parent.ParentId,
      to: r.risk.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.control_parent.ParentId,
      to: r.third_party.Id,
    }),
  },
  control_parent_audit: {
    risk_audit: r.one.risk_audit({
      from: r.control_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  control_type: {},
  conversation: {
    comments: r.many.comment(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.conversation.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.conversation.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.conversation.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.conversation.ParentId,
      to: r.node.Id,
    }),
  },
  conversation_audit: {},
  cost_type: {},
  counter: {},
  custom_attribute_schema: {
    createdByUser: r.one.user_view_active({
      from: r.custom_attribute_schema.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    form: r.one.form_configuration({
      from: r.custom_attribute_schema.Id,
      to: r.form_configuration.CustomAttributeSchemaId,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.custom_attribute_schema.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  custom_attribute_schema_audit: {},
  custom_datasource: {
    createdByUser: r.one.user_view_active({
      from: r.custom_datasource.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.custom_datasource.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.custom_datasource.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  custom_ribbon: {
    createdByUser: r.one.user_view_active({
      from: r.custom_ribbon.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.custom_ribbon.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  custom_ribbon_audit: {},
  custom_role: {
    customRoleAssignments: r.many.custom_role_assignment(),
    customRoleUsers: r.many.custom_role_user(),
  },
  custom_role_assignment: {
    roleType: r.one.role_type({
      from: r.custom_role_assignment.RoleTypeKey,
      to: r.role_type.RoleKey,
    }),
    customRole: r.one.custom_role({
      from: r.custom_role_assignment.CustomRoleId,
      to: r.custom_role.Id,
    }),
  },
  custom_role_user: {
    user: r.one.user_view_active({
      from: r.custom_role_user.UserId,
      to: r.user_view_active.Id,
    }),
    customRole: r.one.custom_role({
      from: r.custom_role_user.CustomRoleId,
      to: r.custom_role.Id,
    }),
  },
  dashboard: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
  },
  dashboard_audit: {},
  dashboard_sharing_type: {},
  data_import: {
    files: r.many.relation_file(),
    createdByUser: r.one.user_view_active({
      from: r.data_import.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.data_import.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  data_import_audit: {},
  data_import_error: {},
  data_import_error_audit: {},
  data_import_status: {},
  department: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.department.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.department.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.department.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.department.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.department.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.department.ParentId,
      to: r.assessment.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.department.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.department.ParentId,
      to: r.control.Id,
    }),
    parentDocument: r.one.document({
      from: r.department.ParentId,
      to: r.document.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.department.ParentId,
      to: r.indicator.Id,
    }),
    parentIssue: r.one.issue({
      from: r.department.ParentId,
      to: r.issue.Id,
    }),
    parentIssueAssessment: r.one.issue_assessment({
      from: r.department.ParentId,
      to: r.issue_assessment.Id,
    }),
    internal_audit_entity: r.one.internal_audit_entity({
      from: r.department.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    internal_audit_report: r.one.internal_audit_report({
      from: r.department.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.department.ParentId,
      to: r.obligation.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.department.ParentId,
      to: r.third_party.Id,
    }),
    parentRisk: r.one.risk({
      from: r.department.ParentId,
      to: r.risk.Id,
    }),
    type: r.one.department_type({
      from: r.department.DepartmentTypeId,
      to: r.department_type.DepartmentTypeId,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.department.ParentId,
      to: r.questionnaire_template.Id,
    }),
  },
  department_audit: {
    control_audit: r.one.control_audit({
      from: r.department_audit.ParentId,
      to: r.control_audit.Id,
    }),
    risk_audit: r.one.risk_audit({
      from: r.department_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  department_type: {
    createdByUser: r.one.user_view_active({
      from: r.department_type.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    department_type_group: r.one.department_type_group({
      from: r.department_type.DepartmentTypeGroupId,
      to: r.department_type_group.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.department_type.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.department_type.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  department_type_audit: {},
  department_type_group: {
    department_types: r.many.department_type(),
  },
  department_type_group_audit: {},
  document: {
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    approvals: r.many.approval(),
    assessmentResults: r.many.assessment_result_parent(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    documentFiles: r.many.document_file(),
    insertPermissions: r.many.insert_permission_view(),
    issues: r.many.issue_parent(),
    childDocuments: r.many.document_linked_document({
      alias: 'childDocuments',
    }),
    parentDocuments: r.many.document_linked_document({
      alias: 'parentDocuments',
    }),
    linkedDocuments: r.many.document_linked_document(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    attestationConfig: r.one.attestation_config({
      from: r.document.Id,
      to: r.attestation_config.ParentId,
    }),
    createdByUser: r.one.user_view_active({
      from: r.document.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.document.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.document.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.document({
      from: r.document.ParentDocument,
      to: r.document.Id,
    }),
    schedule: r.one.schedule({
      from: r.document.Id,
      to: r.schedule.Id,
    }),
    scheduleState: r.one.schedule_state({
      from: r.document.Id,
      to: r.schedule_state.Id,
    }),
  },
  document_action_audit: {},
  document_assessment_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.assessment_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.document_assessment_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.document_assessment_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  document_internal_audit_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.internal_audit_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.document_internal_audit_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.document_internal_audit_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  document_second_line_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.second_line_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.document_second_line_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.document_second_line_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  document_assessment_result_audit: {},
  document_assessment_status: {},
  document_audit: {},
  document_file: {
    attestations: r.many.attestation_record(),
    changeRequests: r.many.change_request(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.document_file.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    file: r.one.file({
      from: r.document_file.FileId,
      to: r.file.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.document_file.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    parent: r.one.document({
      from: r.document_file.ParentDocumentId,
      to: r.document.Id,
      optional: false,
    }),
    reviewedBy: r.one.user_view_active({
      from: r.document_file.ReviewedBy,
      to: r.user_view_active.Id,
    }),
  },
  document_file_audit: {},
  document_file_type: {},
  document_issue_audit: {},
  document_linked_document: {
    child: r.one.document({
      from: r.document_linked_document.LinkedDocumentId,
      to: r.document.Id,
      alias: 'childDocuments',
    }),
    createdByUser: r.one.user_view_active({
      from: r.document_linked_document.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.document_linked_document.DocumentId,
      to: r.document.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.document_linked_document.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.document_linked_document.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.document({
      from: r.document_linked_document.DocumentId,
      to: r.document.Id,
      alias: 'parentDocuments',
    }),
  },
  document_linked_document_audit: {},
  enterprise_risk: {
    children: r.many.enterprise_risk(),
    instances: r.many.enterprise_risk_instance(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.enterprise_risk.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.enterprise_risk.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.enterprise_risk.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.enterprise_risk({
      from: r.enterprise_risk.ParentId,
      to: r.enterprise_risk.Id,
    }),
    parentNode: r.one.node({
      from: r.enterprise_risk.ParentId,
      to: r.node.Id,
    }),
    score: r.one.enterprise_risk_score({
      from: r.enterprise_risk.Id,
      to: r.enterprise_risk_score.EnterpriseRiskId,
    }),
    treatment: r.one.risk_treatment_type({
      from: r.enterprise_risk.Treatment,
      to: r.risk_treatment_type.Value,
    }),
  },
  enterprise_risk_instance: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.enterprise_risk_instance.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    enterpriseRisk: r.one.enterprise_risk({
      from: r.enterprise_risk_instance.EnterpriseRiskId,
      to: r.enterprise_risk.Id,
    }),
    entity: r.one.entity({
      from: r.enterprise_risk_instance.EntityId,
      to: r.entity.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.enterprise_risk_instance.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.enterprise_risk_instance.OrgKey,
      to: r.organisation.OrgKey,
    }),
    risk: r.one.risk({
      from: r.enterprise_risk_instance.RiskId,
      to: r.risk.Id,
    }),
  },
  enterprise_risk_score: {
    enterpriseRisk: r.one.enterprise_risk({
      from: r.enterprise_risk_score.EnterpriseRiskId,
      to: r.enterprise_risk.Id,
    }),
    organisation: r.one.organisation({
      from: r.enterprise_risk_score.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  entity_descendants: {
    rootEntity: r.one.entity({
      from: r.entity_descendants.RootId,
      to: r.entity.Id,
    }),
    descendantEntity: r.one.entity({
      from: r.entity_descendants.Id,
      to: r.entity.Id,
    }),
    descendants: r.many.entity_descendants({
      from: r.entity_descendants.Id,
      to: r.entity_descendants.RootId,
    }),
    createdByUser: r.one.user_view_active({
      from: r.entity_descendants.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.entity_descendants.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.entity_descendants.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  entity: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    children: r.many.entity(),
    descendants: r.many.entity_descendants({
      from: r.entity.Id,
      to: r.entity_descendants.RootId,
    }),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.entity.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.entity.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.entity.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.entity({
      from: r.entity.ParentId,
      to: r.entity.Id,
    }),
    parentNode: r.one.node({
      from: r.entity.ParentId,
      to: r.node.Id,
    }),
  },
  file: {
    relationFile: r.many.relation_file(),
    createdByUser: r.one.user_view_active({
      from: r.file.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    documentFile: r.one.document_file({
      from: r.file.Id,
      to: r.document_file.FileId,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.file.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.file.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  file_audit: {},
  form_configuration: {
    fields_config: r.many.form_field_configuration(),
    fields_ordering: r.many.form_field_ordering(),
    createdByUser: r.one.user_view_active({
      from: r.form_configuration.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    customAttributeSchema: r.one.custom_attribute_schema({
      from: r.form_configuration.CustomAttributeSchemaId,
      to: r.custom_attribute_schema.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.form_configuration.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    parentType: r.one.parent_type({
      from: r.form_configuration.ParentType,
      to: r.parent_type.Value,
    }),
  },
  form_configuration_audit: {},
  form_field_configuration: {
    createdByUser: r.one.user_view_active({
      from: r.form_field_configuration.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    form: r.one.form_configuration({
      from: r.form_field_configuration.FormConfigurationParentType,
      to: r.form_configuration.ParentType,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.form_field_configuration.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  form_field_configuration_audit: {},
  form_field_ordering: {
    createdByUser: r.one.user_view_active({
      from: r.form_field_ordering.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    form: r.one.form_configuration({
      from: r.form_field_ordering.FormConfigurationParentType,
      to: r.form_configuration.ParentType,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.form_field_ordering.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  form_field_ordering_audit: {},
  impact: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    appetites: r.many.appetite(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    parents: r.many.impact_parent(),
    ratings: r.many.impact_rating(),
    createdByUser: r.one.user_view_active({
      from: r.impact.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.impact.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.impact.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  impact_audit: {},
  impact_parent: {
    createdByUser: r.one.user_view_active({
      from: r.impact_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    impact: r.one.impact({
      from: r.impact_parent.ImpactId,
      to: r.impact.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.impact_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.impact_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.impact_parent.ParentId,
      to: r.node.Id,
    }),
  },
  impact_parent_audit: {},
  impact_rating: {
    assessmentParents: r.many.assessment_result_parent(),
    permissions: r.many.permission_view(),
    completedBy: r.one.user_view_active({
      from: r.impact_rating.CompletedBy,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.impact_rating.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    impact: r.one.impact({
      from: r.impact_rating.ImpactId,
      to: r.impact.Id,
      optional: false,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.impact_rating.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.impact_rating.OrgKey,
      to: r.organisation.OrgKey,
    }),
    ratedItem: r.one.node({
      from: r.impact_rating.RatedItemId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.impact_rating.RatedItemId,
      to: r.risk.Id,
    }),
  },
  impact_internal_audit_rating: {
    parents: r.many.internal_audit_result_parent(),
    permissions: r.many.permission_view(),
    completedBy: r.one.user_view_active({
      from: r.impact_internal_audit_rating.CompletedBy,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.impact_internal_audit_rating.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    impact: r.one.impact({
      from: r.impact_internal_audit_rating.ImpactId,
      to: r.impact.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.impact_internal_audit_rating.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.impact_internal_audit_rating.OrgKey,
      to: r.organisation.OrgKey,
    }),
    ratedItem: r.one.node({
      from: r.impact_internal_audit_rating.RatedItemId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.impact_internal_audit_rating.RatedItemId,
      to: r.risk.Id,
    }),
  },
  impact_second_line_rating: {
    parents: r.many.second_line_result_parent(),
    permissions: r.many.permission_view(),
    completedBy: r.one.user_view_active({
      from: r.impact_second_line_rating.CompletedBy,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.impact_second_line_rating.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    impact: r.one.impact({
      from: r.impact_second_line_rating.ImpactId,
      to: r.impact.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.impact_second_line_rating.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.impact_second_line_rating.OrgKey,
      to: r.organisation.OrgKey,
    }),
    ratedItem: r.one.node({
      from: r.impact_second_line_rating.RatedItemId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.impact_second_line_rating.RatedItemId,
      to: r.risk.Id,
    }),
  },
  impact_rating_audit: {
    risk_audit: r.one.risk_audit({
      from: r.impact_rating_audit.RatedItemId,
      to: r.risk_audit.Id,
    }),
  },
  indicator: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    files: r.many.relation_file(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    parents: r.many.indicator_parent(),
    permissions: r.many.permission_view(),
    results: r.many.indicator_result(),
    tags: r.many.tag(),
    createdBy: r.one.user_view_active({
      from: r.indicator.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    indicator_type: r.one.indicator_type({
      from: r.indicator.Type,
      to: r.indicator_type.Value,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.indicator.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    org: r.one.organisation({
      from: r.indicator.OrgKey,
      to: r.organisation.OrgKey,
    }),
    schedule: r.one.schedule({
      from: r.indicator.Id,
      to: r.schedule.Id,
    }),
    scheduleState: r.one.schedule_state({
      from: r.indicator.Id,
      to: r.schedule_state.Id,
    }),
  },
  indicator_audit: {},
  indicator_parent: {
    control: r.one.control({
      from: r.indicator_parent.ParentId,
      to: r.control.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.indicator_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    indicator: r.one.indicator({
      from: r.indicator_parent.IndicatorId,
      to: r.indicator.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.indicator_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.indicator_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.indicator_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.indicator_parent.ParentId,
      to: r.risk.Id,
    }),
  },
  indicator_parent_audit: {
    control_audit: r.one.control_audit({
      from: r.indicator_parent_audit.ParentId,
      to: r.control_audit.Id,
    }),
    risk_audit: r.one.risk_audit({
      from: r.indicator_parent_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  indicator_result: {
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    createdBy: r.one.user_view_active({
      from: r.indicator_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.indicator_result.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.indicator_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.indicator({
      from: r.indicator_result.IndicatorId,
      to: r.indicator.Id,
    }),
  },
  indicator_result_audit: {},
  indicator_type: {
    indicator_type: r.many.indicator(),
  },
  ingestion_config: {
    createdByUser: r.one.user_view_active({
      from: r.ingestion_config.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.ingestion_config.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.ingestion_config.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  ingestion_config_audit: {},
  insert_permission_view: {
    assessment: r.one.assessment({
      from: r.insert_permission_view.Id,
      to: r.assessment.Id,
    }),
    assessment_activity: r.one.assessment_activity({
      from: r.insert_permission_view.Id,
      to: r.assessment_activity.Id,
    }),
    compliance_monitoring_assessment: r.one.compliance_monitoring_assessment({
      from: r.insert_permission_view.Id,
      to: r.compliance_monitoring_assessment.Id,
    }),
    document: r.one.document({
      from: r.insert_permission_view.Id,
      to: r.document.Id,
    }),
    internal_audit_entity: r.one.internal_audit_entity({
      from: r.insert_permission_view.Id,
      to: r.internal_audit_entity.Id,
    }),
    internal_audit_report: r.one.internal_audit_report({
      from: r.insert_permission_view.Id,
      to: r.internal_audit_report.Id,
    }),
    node: r.one.node({
      from: r.insert_permission_view.Id,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.insert_permission_view.Id,
      to: r.obligation.Id,
    }),
    risk: r.one.risk({
      from: r.insert_permission_view.Id,
      to: r.risk.Id,
    }),
  },
  internal_audit_entity: {
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    insertPermissions: r.many.insert_permission_view(),
    internalAuditReports: r.many.internal_audit_report(),
    issues: r.many.issue_parent(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    businessArea: r.one.business_area({
      from: r.internal_audit_entity.BusinessAreaId,
      to: r.business_area.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.internal_audit_entity.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.internal_audit_entity.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.internal_audit_entity.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  internal_audit_report: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    assessmentActions: r.many.action_parent(),
    assessmentActivities: r.many.assessment_activity(),
    assessmentIssues: r.many.issue_parent(),
    assessmentResults: r.many.internal_audit_result_parent(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    insertPermissions: r.many.insert_permission_view(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    internal_audit_entity: r.one.internal_audit_entity({
      from: r.internal_audit_report.OriginatingItemId,
      to: r.internal_audit_entity.Id,
    }),
    completedByUser: r.one.user_view_active({
      from: r.internal_audit_report.CompletedByUser,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.internal_audit_report.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.internal_audit_report.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.internal_audit_report.OrgKey,
      to: r.organisation.OrgKey,
    }),
    originatingItem: r.one.node({
      from: r.internal_audit_report.OriginatingItemId,
      to: r.node.Id,
    }),
  },
  issue: {
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    causes: r.many.cause(),
    consequences: r.many.consequence(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    files: r.many.relation_file(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    parents: r.many.issue_parent(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    updates: r.many.issue_update(),
    assessment: r.one.issue_assessment({
      from: r.issue.Id,
      to: r.issue_assessment.ParentIssueId,
    }),
    createdByUser: r.one.user_view_active({
      from: r.issue.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.issue.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.issue.OrgKey,
      to: r.organisation.OrgKey,
    }),
    issueUpdateSummary: r.one.issue_update_summary({
      from: r.issue.Id,
      to: r.issue_update_summary.IssueId,
    }),
  },
  issue_action_audit: {},
  issue_assessment: {
    departments: r.many.department(),
    permissions: r.many.permission_view(),
    certifiedIndividual: r.one.user_view_active({
      from: r.issue_assessment.CertifiedIndividual,
      to: r.user_view_active.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.issue_assessment.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.issue_assessment.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.issue_assessment.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.issue({
      from: r.issue_assessment.ParentIssueId,
      to: r.issue.Id,
    }),
    policyOwner: r.one.user_view_active({
      from: r.issue_assessment.PolicyOwner,
      to: r.user_view_active.Id,
    }),
    status: r.one.issue_assessment_status({
      from: r.issue_assessment.Status,
      to: r.issue_assessment_status.Value,
    }),
  },
  issue_assessment_audit: {},
  issue_assessment_status: {},
  issue_audit: {},
  issue_parent: {
    assessment: r.one.assessment({
      from: r.issue_parent.ParentId,
      to: r.assessment.Id,
    }),
    complianceMonitoringAssessment: r.one.compliance_monitoring_assessment({
      from: r.issue_parent.ParentId,
      to: r.compliance_monitoring_assessment.Id,
    }),
    control: r.one.control({
      from: r.issue_parent.ParentId,
      to: r.control.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.issue_parent.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    document: r.one.document({
      from: r.issue_parent.ParentId,
      to: r.document.Id,
    }),
    internalAuditEntity: r.one.internal_audit_entity({
      from: r.issue_parent.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    internalAuditReport: r.one.internal_audit_report({
      from: r.issue_parent.ParentId,
      to: r.internal_audit_report.Id,
    }),
    issue: r.one.issue({
      from: r.issue_parent.IssueId,
      to: r.issue.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.issue_parent.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    obligation: r.one.obligation({
      from: r.issue_parent.ParentId,
      to: r.obligation.Id,
    }),
    organisation: r.one.organisation({
      from: r.issue_parent.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.issue_parent.ParentId,
      to: r.node.Id,
    }),
    risk: r.one.risk({
      from: r.issue_parent.ParentId,
      to: r.risk.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.issue_parent.ParentId,
      to: r.third_party.Id,
    }),
  },
  issue_parent_audit: {
    control_audit: r.one.control_audit({
      from: r.issue_parent_audit.ParentId,
      to: r.control_audit.Id,
    }),
  },
  issue_update: {
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.issue_update.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    issue: r.one.issue({
      from: r.issue_update.ParentIssueId,
      to: r.issue.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.issue_update.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.issue_update.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  issue_update_audit: {},
  linked_item: {
    //TODO: Currently, the casing needs to match Hasura. But when we remove Hasura we should make it consistent.
    source_permissions: r.many.permission_view({ alias: 'linkedItemSource' }),
    target_permissions: r.many.permission_view({ alias: 'linkedItemTarget' }),
    source_acceptance: r.one.acceptance({
      from: r.linked_item.Source,
      to: r.acceptance.Id,
    }),
    source_action: r.one.action({
      from: r.linked_item.Source,
      to: r.action.Id,
    }),
    source_appetite: r.one.appetite({
      from: r.linked_item.Source,
      to: r.appetite.Id,
    }),
    source_assessment: r.one.assessment({
      from: r.linked_item.Source,
      to: r.assessment.Id,
    }),
    source_assessment_activity: r.one.assessment_activity({
      from: r.linked_item.Source,
      to: r.assessment_activity.Id,
    }),
    source_cause: r.one.cause({
      from: r.linked_item.Source,
      to: r.cause.Id,
    }),
    source_consequence: r.one.consequence({
      from: r.linked_item.Source,
      to: r.consequence.Id,
    }),
    source_control: r.one.control({
      from: r.linked_item.Source,
      to: r.control.Id,
    }),
    source_control_group: r.one.control_group({
      from: r.linked_item.Source,
      to: r.control_group.Id,
    }),
    source_document: r.one.document({
      from: r.linked_item.Source,
      to: r.document.Id,
    }),
    source_impact: r.one.impact({
      from: r.linked_item.Source,
      to: r.impact.Id,
    }),
    source_indicator: r.one.indicator({
      from: r.linked_item.Source,
      to: r.indicator.Id,
    }),
    source_internal_audit_entity: r.one.internal_audit_entity({
      from: r.linked_item.Source,
      to: r.internal_audit_entity.Id,
    }),
    source_internal_audit_report: r.one.internal_audit_report({
      from: r.linked_item.Source,
      to: r.internal_audit_report.Id,
    }),
    source_issue: r.one.issue({
      from: r.linked_item.Source,
      to: r.issue.Id,
    }),
    source_node: r.one.node({
      from: r.linked_item.Source,
      to: r.node.Id,
      alias: 'sourceNode',
    }),
    source_obligation: r.one.obligation({
      from: r.linked_item.Source,
      to: r.obligation.Id,
    }),
    source_obligation_change: r.one.obligation_change({
      from: r.linked_item.Source,
      to: r.obligation_change.Id,
    }),
    source_risk: r.one.risk({
      from: r.linked_item.Source,
      to: r.risk.Id,
    }),
    source_third_party: r.one.third_party({
      from: r.linked_item.Source,
      to: r.third_party.Id,
    }),
    target_acceptance: r.one.acceptance({
      from: r.linked_item.Target,
      to: r.acceptance.Id,
    }),
    target_action: r.one.action({
      from: r.linked_item.Target,
      to: r.action.Id,
    }),
    target_action_update: r.one.action_update({
      from: r.linked_item.Target,
      to: r.action_update.Id,
    }),
    target_appetite: r.one.appetite({
      from: r.linked_item.Target,
      to: r.appetite.Id,
    }),
    target_assessment: r.one.assessment({
      from: r.linked_item.Target,
      to: r.assessment.Id,
    }),
    target_assessment_activity: r.one.assessment_activity({
      from: r.linked_item.Target,
      to: r.assessment_activity.Id,
    }),
    target_cause: r.one.cause({
      from: r.linked_item.Target,
      to: r.cause.Id,
    }),
    target_consequence: r.one.consequence({
      from: r.linked_item.Target,
      to: r.consequence.Id,
    }),
    target_control: r.one.control({
      from: r.linked_item.Target,
      to: r.control.Id,
    }),
    target_control_group: r.one.control_group({
      from: r.linked_item.Target,
      to: r.control_group.Id,
    }),
    target_document: r.one.document({
      from: r.linked_item.Target,
      to: r.document.Id,
    }),
    target_impact: r.one.impact({
      from: r.linked_item.Target,
      to: r.impact.Id,
    }),
    target_impact_rating: r.one.impact_rating({
      from: r.linked_item.Target,
      to: r.impact_rating.Id,
    }),
    target_indicator: r.one.indicator({
      from: r.linked_item.Target,
      to: r.indicator.Id,
    }),
    target_internal_audit_entity: r.one.internal_audit_entity({
      from: r.linked_item.Target,
      to: r.internal_audit_entity.Id,
    }),
    target_internal_audit_report: r.one.internal_audit_report({
      from: r.linked_item.Target,
      to: r.internal_audit_report.Id,
    }),
    target_issue: r.one.issue({
      from: r.linked_item.Target,
      to: r.issue.Id,
    }),
    target_issue_update: r.one.issue_update({
      from: r.linked_item.Target,
      to: r.issue_update.Id,
    }),
    target_node: r.one.node({
      from: r.linked_item.Target,
      to: r.node.Id,
      alias: 'targetNode',
    }),
    target_obligation: r.one.obligation({
      from: r.linked_item.Target,
      to: r.obligation.Id,
    }),
    target_obligation_impact: r.one.obligation_impact({
      from: r.linked_item.Target,
      to: r.obligation_impact.Id,
    }),
    target_obligation_change: r.one.obligation_change({
      from: r.linked_item.Target,
      to: r.obligation_change.Id,
    }),
    target_risk: r.one.risk({
      from: r.linked_item.Target,
      to: r.risk.Id,
    }),
    target_test_result: r.one.test_result({
      from: r.linked_item.Target,
      to: r.test_result.Id,
    }),
    target_third_party: r.one.third_party({
      from: r.linked_item.Target,
      to: r.third_party.Id,
    }),
  },
  linked_item_audit: {},
  node: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    anyContributorAccess: r.many.user_role_access(),
    insertPermissions: r.many.insert_permission_view(),
    permissions: r.many.permission_view(),
    acceptance: r.one.acceptance({
      from: r.node.Id,
      to: r.acceptance.Id,
    }),
    action: r.one.action({
      from: r.node.Id,
      to: r.action.Id,
    }),
    control: r.one.control({
      from: r.node.Id,
      to: r.control.Id,
    }),
    document: r.one.document({
      from: r.node.Id,
      to: r.document.Id,
    }),
    documentFile: r.one.document_file({
      from: r.node.Id,
      to: r.document_file.Id,
    }),
    indicator: r.one.indicator({
      from: r.node.Id,
      to: r.indicator.Id,
    }),
    issue: r.one.issue({
      from: r.node.Id,
      to: r.issue.Id,
    }),
    issue_assessment: r.one.issue_assessment({
      from: r.node.Id,
      to: r.issue_assessment.Id,
    }),
    obligation: r.one.obligation({
      from: r.node.Id,
      to: r.obligation.Id,
    }),
    risk: r.one.risk({
      from: r.node.Id,
      to: r.risk.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.node.Id,
      to: r.third_party.Id,
    }),
    owners: r.many.owner(),
    ownerGroups: r.many.owner_group(),
    contributors: r.many.contributor(),
    contributorGroups: r.many.contributor_group(),
    targetLinkedItems: r.many.linked_item({
      alias: 'targetNode',
    }),
    sourceLinkedItems: r.many.linked_item({
      alias: 'sourceNode',
    }),
  },
  node_ancestor: {},
  obligation: {
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    assessmentResults: r.many.assessment_result_parent(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    controls: r.many.control_parent(),
    departments: r.many.department(),
    impacts: r.many.obligation_impact(),
    insertPermissions: r.many.insert_permission_view(),
    issues: r.many.issue_parent(),
    obligationChanges: r.many.obligation_change(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    createdBy: r.one.user_view_active({
      from: r.obligation.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.obligation.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    obligation_type: r.one.obligation_type({
      from: r.obligation.Type,
      to: r.obligation_type.Value,
    }),
    org: r.one.organisation({
      from: r.obligation.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.obligation({
      from: r.obligation.ParentId,
      to: r.obligation.Id,
    }),
    parentNode: r.one.node({
      from: r.obligation.ParentId,
      to: r.node.Id,
    }),
    schedule: r.one.schedule({
      from: r.obligation.Id,
      to: r.schedule.Id,
    }),
    scheduleState: r.one.schedule_state({
      from: r.obligation.Id,
      to: r.schedule_state.Id,
    }),
  },
  obligation_action_audit: {},
  obligation_change: {
    obligation: r.one.obligation({
      from: r.obligation_change.ObligationId,
      to: r.obligation.Id,
    }),
    createdBy: r.one.user_view_active({
      from: r.obligation_change.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.obligation_change.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    owners: r.many.owner(),
    ownerGroups: r.many.owner_group(),
    contributors: r.many.contributor(),
    contributorGroups: r.many.contributor_group(),
    attestations: r.many.obligation_change_attestation(),
    actions: r.many.action_parent(),
    permissions: r.many.permission_view(),
    org: r.one.organisation({
      from: r.obligation_change.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  obligation_change_attestation: {
    obligationChange: r.one.obligation_change({
      from: r.obligation_change_attestation.ObligationChangeId,
      to: r.obligation_change.Id,
    }),
    user: r.one.user_view_active({
      from: r.obligation_change_attestation.UserId,
      to: r.user_view_active.Id,
    }),
    org: r.one.organisation({
      from: r.obligation_change_attestation.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  obligation_assessment_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.assessment_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.obligation_assessment_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.obligation_assessment_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  obligation_internal_audit_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.internal_audit_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.obligation_internal_audit_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.obligation_internal_audit_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  obligation_second_line_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.second_line_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.obligation_second_line_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.obligation_second_line_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  obligation_assessment_result_audit: {},
  obligation_assessment_status: {},
  obligation_audit: {},
  obligation_impact: {
    permissions: r.many.permission_view(),
    createdBy: r.one.user_view_active({
      from: r.obligation_impact.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedBy: r.one.user_view_active({
      from: r.obligation_impact.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.obligation_impact.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.obligation({
      from: r.obligation_impact.ParentObligationId,
      to: r.obligation.Id,
    }),
  },
  obligation_impact_audit: {},
  obligation_issue_audit: {},
  obligation_type: {
    obligations: r.many.obligation(),
  },
  owner: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.owner.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.owner.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.owner.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentNode: r.one.node({
      from: r.owner.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.owner.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.owner.ParentId,
      to: r.assessment.Id,
    }),
    parentAssessmentActivity: r.one.assessment_activity({
      from: r.owner.ParentId,
      to: r.assessment_activity.Id,
    }),
    parentDashboard: r.one.dashboard({
      from: r.owner.ParentId,
      to: r.dashboard.Id,
    }),
    parentInternalAuditEntity: r.one.internal_audit_entity({
      from: r.owner.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.owner.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.owner.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.owner.ParentId,
      to: r.control.Id,
    }),
    parentDocument: r.one.document({
      from: r.owner.ParentId,
      to: r.document.Id,
    }),
    parentEntity: r.one.entity({
      from: r.owner.ParentId,
      to: r.entity.Id,
    }),
    parentIssue: r.one.issue({
      from: r.owner.ParentId,
      to: r.issue.Id,
    }),
    parentImpact: r.one.impact({
      from: r.owner.ParentId,
      to: r.impact.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.owner.ParentId,
      to: r.indicator.Id,
    }),
    parentRisk: r.one.risk({
      from: r.owner.ParentId,
      to: r.risk.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.owner.ParentId,
      to: r.obligation.Id,
    }),
    parentObligationChange: r.one.obligation_change({
      from: r.owner.ParentId,
      to: r.obligation_change.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.owner.ParentId,
      to: r.third_party.Id,
    }),
    parentThirdPartyResponse: r.one.third_party_response({
      from: r.owner.ParentId,
      to: r.third_party_response.Id,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.owner.ParentId,
      to: r.questionnaire_template.Id,
    }),
    user: r.one.user_view_active({
      optional: false,
      from: r.owner.UserId,
      to: r.user_view_active.Id,
    }),
  },
  owner_audit: {
    parentControlAudit: r.one.control_audit({
      from: r.owner_audit.ParentId,
      to: r.control_audit.Id,
    }),
    parentRiskAudit: r.one.risk_audit({
      from: r.owner_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  owner_group: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.owner_group.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    group: r.one.user_group({
      from: r.owner_group.UserGroupId,
      to: r.user_group.Id,
      optional: false,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.owner_group.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.owner_group.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentNode: r.one.node({
      from: r.owner_group.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.owner_group.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.owner_group.ParentId,
      to: r.assessment.Id,
    }),
    parentAssessmentActivity: r.one.assessment_activity({
      from: r.owner_group.ParentId,
      to: r.assessment_activity.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.owner_group.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.owner_group.ParentId,
      to: r.control.Id,
    }),
    parentDashboard: r.one.dashboard({
      from: r.owner_group.ParentId,
      to: r.dashboard.Id,
    }),
    parentDocument: r.one.document({
      from: r.owner_group.ParentId,
      to: r.document.Id,
    }),
    parentEntity: r.one.entity({
      from: r.owner_group.ParentId,
      to: r.entity.Id,
    }),
    parentInternalAuditEntity: r.one.internal_audit_entity({
      from: r.owner_group.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.owner_group.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentImpact: r.one.impact({
      from: r.owner_group.ParentId,
      to: r.impact.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.owner_group.ParentId,
      to: r.indicator.Id,
    }),
    parentIssue: r.one.issue({
      from: r.owner_group.ParentId,
      to: r.issue.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.owner_group.ParentId,
      to: r.obligation.Id,
    }),
    parentObligationChange: r.one.obligation_change({
      from: r.owner_group.ParentId,
      to: r.obligation_change.Id,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.owner_group.ParentId,
      to: r.questionnaire_template.Id,
    }),
    parentRisk: r.one.risk({
      from: r.owner_group.ParentId,
      to: r.risk.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.owner_group.ParentId,
      to: r.third_party.Id,
    }),
    parentThirdPartyResponse: r.one.third_party_response({
      from: r.owner_group.ParentId,
      to: r.third_party_response.Id,
    }),
  },
  owner_group_audit: {
    parentControlAudit: r.one.control_audit({
      from: r.owner_group_audit.ParentId,
      to: r.control_audit.Id,
    }),
    parentRiskAudit: r.one.risk_audit({
      from: r.owner_group_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  parent_type: {},
  permission_view: {
    acceptance: r.one.acceptance({
      from: r.permission_view.Id,
      to: r.acceptance.Id,
    }),
    action: r.one.action({
      from: r.permission_view.Id,
      to: r.action.Id,
    }),
    action_update: r.one.action_update({
      from: r.permission_view.Id,
      to: r.action_update.Id,
    }),
    action_update_summary_view: r.one.action_update_summary_view({
      from: r.permission_view.Id,
      to: r.action_update_summary_view.ActionId,
    }),
    appetite: r.one.appetite({
      from: r.permission_view.Id,
      to: r.appetite.Id,
    }),
    assessment: r.one.assessment({
      from: r.permission_view.Id,
      to: r.assessment.Id,
    }),
    assessment_activity: r.one.assessment_activity({
      from: r.permission_view.Id,
      to: r.assessment_activity.Id,
    }),
    business_area: r.one.business_area({
      from: r.permission_view.Id,
      to: r.business_area.Id,
    }),
    cause: r.one.cause({
      from: r.permission_view.Id,
      to: r.cause.Id,
    }),
    compliance_monitoring_assessment: r.one.compliance_monitoring_assessment({
      from: r.permission_view.Id,
      to: r.compliance_monitoring_assessment.Id,
    }),
    consequence: r.one.consequence({
      from: r.permission_view.Id,
      to: r.consequence.Id,
    }),
    contributor: r.one.contributor({
      from: r.permission_view.Id,
      to: r.contributor.ParentId,
    }),
    contributor_group: r.one.contributor_group({
      from: r.permission_view.Id,
      to: r.contributor_group.ParentId,
    }),
    control: r.one.control({
      from: r.permission_view.Id,
      to: r.control.Id,
    }),
    conversation: r.one.conversation({
      from: r.permission_view.Id,
      to: r.conversation.Id,
    }),
    dashboard: r.one.dashboard({
      from: r.permission_view.Id,
      to: r.dashboard.Id,
    }),
    department: r.one.department({
      from: r.permission_view.Id,
      to: r.department.ParentId,
    }),
    document: r.one.document({
      from: r.permission_view.Id,
      to: r.document.Id,
    }),
    document_assessment_result: r.one.document_assessment_result({
      from: r.permission_view.Id,
      to: r.document_assessment_result.Id,
    }),
    document_internal_audit_result: r.one.document_internal_audit_result({
      from: r.permission_view.Id,
      to: r.document_internal_audit_result.Id,
    }),
    document_second_line_result: r.one.document_second_line_result({
      from: r.permission_view.Id,
      to: r.document_second_line_result.Id,
    }),
    document_file: r.one.document_file({
      from: r.permission_view.Id,
      to: r.document_file.Id,
    }),
    enterprise_risk: r.one.enterprise_risk({
      from: r.permission_view.Id,
      to: r.enterprise_risk.Id,
    }),
    enterprise_risk_instance: r.one.enterprise_risk_instance({
      from: r.permission_view.Id,
      to: r.enterprise_risk_instance.EnterpriseRiskId,
    }),
    entity: r.one.entity({
      from: r.permission_view.Id,
      to: r.entity.Id,
    }),
    impact_rating: r.one.impact_rating({
      from: r.permission_view.Id,
      to: r.impact_rating.Id,
    }),
    impact_internal_audit_rating: r.one.impact_internal_audit_rating({
      from: r.permission_view.Id,
      to: r.impact_internal_audit_rating.Id,
    }),
    impact_second_line_rating: r.one.impact_second_line_rating({
      from: r.permission_view.Id,
      to: r.impact_second_line_rating.Id,
    }),
    indicator: r.one.indicator({
      from: r.permission_view.Id,
      to: r.indicator.Id,
    }),
    indicator_result: r.one.indicator_result({
      from: r.permission_view.Id,
      to: r.indicator_result.Id,
    }),
    internal_audit_entity: r.one.internal_audit_entity({
      from: r.permission_view.Id,
      to: r.internal_audit_entity.Id,
    }),
    internal_audit_report: r.one.internal_audit_report({
      from: r.permission_view.Id,
      to: r.internal_audit_report.Id,
    }),
    issue: r.one.issue({
      from: r.permission_view.Id,
      to: r.issue.Id,
    }),
    issue_assessment: r.one.issue_assessment({
      from: r.permission_view.Id,
      to: r.issue_assessment.Id,
    }),
    issue_update: r.one.issue_update({
      from: r.permission_view.Id,
      to: r.issue_update.Id,
    }),
    linked_item_source: r.one.linked_item({
      from: r.permission_view.Id,
      to: r.linked_item.Source,
      alias: 'linkedItemSource',
    }),
    linked_item_target: r.one.linked_item({
      from: r.permission_view.Id,
      to: r.linked_item.Target,
      alias: 'linkedItemTarget',
    }),
    node: r.one.node({
      from: r.permission_view.Id,
      to: r.node.Id,
    }),
    obligation: r.one.obligation({
      from: r.permission_view.Id,
      to: r.obligation.Id,
    }),
    obligation_assessment_result: r.one.obligation_assessment_result({
      from: r.permission_view.Id,
      to: r.obligation_assessment_result.Id,
    }),
    obligationInternalAuditResult: r.one.obligation_internal_audit_result({
      from: r.permission_view.Id,
      to: r.obligation_internal_audit_result.Id,
    }),
    obligationSecondLineResult: r.one.obligation_second_line_result({
      from: r.permission_view.Id,
      to: r.obligation_second_line_result.Id,
    }),
    obligation_change: r.one.obligation_change({
      from: r.permission_view.Id,
      to: r.obligation_change.Id,
    }),
    obligation_change_attestation: r.one.obligation_change_attestation({
      from: r.permission_view.Id,
      to: r.obligation_change_attestation.Id,
    }),
    controlTestInternalAuditResult: r.one.control_test_internal_audit_result({
      from: r.permission_view.Id,
      to: r.control_test_internal_audit_result.Id,
    }),
    controlTestSecondLineResult: r.one.control_test_second_line_result({
      from: r.permission_view.Id,
      to: r.control_test_second_line_result.Id,
    }),
    obligation_impact: r.one.obligation_impact({
      from: r.permission_view.Id,
      to: r.obligation_impact.Id,
    }),
    owner: r.one.owner({
      from: r.permission_view.Id,
      to: r.owner.ParentId,
    }),
    owner_group: r.one.owner_group({
      from: r.permission_view.Id,
      to: r.owner_group.ParentId,
    }),
    questionnaire_template: r.one.questionnaire_template({
      from: r.permission_view.Id,
      to: r.questionnaire_template.Id,
    }),
    questionnaire_template_version: r.one.questionnaire_template_version({
      from: r.permission_view.Id,
      to: r.questionnaire_template_version.Id,
    }),
    relation_file: r.one.relation_file({
      from: r.permission_view.Id,
      to: r.relation_file.ParentId,
    }),
    risk: r.one.risk({
      from: r.permission_view.Id,
      to: r.risk.Id,
    }),
    risk_assessment_result: r.one.risk_assessment_result({
      from: r.permission_view.Id,
      to: r.risk_assessment_result.Id,
    }),
    uncontrolledRiskInternalAuditResult:
      r.one.risk_uncontrolled_internal_audit_result({
        from: r.permission_view.Id,
        to: r.risk_uncontrolled_internal_audit_result.Id,
      }),
    controlledRiskInternalAuditResult:
      r.one.risk_controlled_internal_audit_result({
        from: r.permission_view.Id,
        to: r.risk_controlled_internal_audit_result.Id,
      }),
    uncontrolledRiskSecondLineResult:
      r.one.risk_uncontrolled_second_line_result({
        from: r.permission_view.Id,
        to: r.risk_uncontrolled_second_line_result.Id,
      }),
    controlledRiskSecondLineResult: r.one.risk_controlled_second_line_result({
      from: r.permission_view.Id,
      to: r.risk_controlled_second_line_result.Id,
    }),
    risk_score: r.one.risk_score({
      from: r.permission_view.Id,
      to: r.risk_score.RiskId,
    }),
    tag: r.one.tag({
      from: r.permission_view.Id,
      to: r.tag.ParentId,
    }),
    test_result: r.one.test_result({
      from: r.permission_view.Id,
      to: r.test_result.Id,
    }),
    third_party: r.one.third_party({
      from: r.permission_view.Id,
      to: r.third_party.Id,
    }),
    third_party_response: r.one.third_party_response({
      from: r.permission_view.Id,
      to: r.third_party_response.Id,
    }),
  },
  questionnaire_invite: {
    createdByUser: r.one.user_view_active({
      from: r.questionnaire_invite.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.questionnaire_invite.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.questionnaire_invite.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.third_party_response({
      from: r.questionnaire_invite.ParentId,
      to: r.third_party_response.Id,
    }),
    questionnaireTemplateVersion: r.one.questionnaire_template_version({
      from: r.questionnaire_invite.QuestionnaireTemplateVersionId,
      to: r.questionnaire_template_version.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.questionnaire_invite.ThirdPartyId,
      to: r.third_party.Id,
    }),
    user: r.one.user({
      from: r.questionnaire_invite.UserId,
      to: r.user.Id,
    }),
  },
  questionnaire_invite_audit: {},
  questionnaire_template: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    versions: r.many.questionnaire_template_version(),
    createdByUser: r.one.user_view_active({
      from: r.questionnaire_template.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.questionnaire_template.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
  },
  questionnaire_template_audit: {},
  questionnaire_template_version: {
    invitations: r.many.questionnaire_invite(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.questionnaire_template_version.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.questionnaire_template_version.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    parent: r.one.questionnaire_template({
      from: r.questionnaire_template_version.ParentId,
      to: r.questionnaire_template.Id,
    }),
    questionnaire_template_version_status:
      r.one.questionnaire_template_version_status({
        from: r.questionnaire_template_version.Status,
        to: r.questionnaire_template_version_status.Value,
      }),
  },
  questionnaire_template_version_audit: {},
  questionnaire_template_version_status: {
    questionnaire_template_versions: r.many.questionnaire_template_version(),
  },
  relation_file: {
    permissions: r.many.permission_view(),
    acceptance: r.one.acceptance({
      from: r.relation_file.ParentId,
      to: r.acceptance.Id,
    }),
    action: r.one.action({
      from: r.relation_file.ParentId,
      to: r.action.Id,
    }),
    action_update: r.one.action_update({
      from: r.relation_file.ParentId,
      to: r.action_update.Id,
    }),
    appetite: r.one.appetite({
      from: r.relation_file.ParentId,
      to: r.appetite.Id,
    }),
    assessment_activity: r.one.assessment_activity({
      from: r.relation_file.ParentId,
      to: r.assessment_activity.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.relation_file.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    data_import: r.one.data_import({
      from: r.relation_file.ParentId,
      to: r.data_import.Id,
    }),
    document: r.one.document({
      from: r.relation_file.ParentId,
      to: r.document.Id,
    }),
    document_assessment_result: r.one.document_assessment_result({
      from: r.relation_file.ParentId,
      to: r.document_assessment_result.Id,
    }),
    document_internal_audit_result: r.one.document_internal_audit_result({
      from: r.relation_file.ParentId,
      to: r.document_internal_audit_result.Id,
    }),
    document_second_line_result: r.one.document_second_line_result({
      from: r.relation_file.ParentId,
      to: r.document_second_line_result.Id,
    }),
    file: r.one.file({
      from: r.relation_file.FileId,
      to: r.file.Id,
    }),
    indicator: r.one.indicator({
      from: r.relation_file.FileId,
      to: r.indicator.Id,
    }),
    indicator_result: r.one.indicator_result({
      from: r.relation_file.FileId,
      to: r.indicator_result.Id,
    }),
    issue: r.one.issue({
      from: r.relation_file.ParentId,
      to: r.issue.Id,
    }),
    issueUpdate: r.one.issue_update({
      from: r.relation_file.ParentId,
      to: r.issue_update.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.relation_file.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.relation_file.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parentType: r.one.parent_type({
      from: r.relation_file.ParentType,
      to: r.parent_type.Value,
    }),
    riskAssessmentResult: r.one.risk_assessment_result({
      from: r.relation_file.ParentId,
      to: r.risk_assessment_result.Id,
    }),
    uncontrolledRiskInternalAuditResult:
      r.one.risk_uncontrolled_internal_audit_result({
        from: r.relation_file.ParentId,
        to: r.risk_uncontrolled_internal_audit_result.Id,
      }),
    controlledRiskInternalAuditResult:
      r.one.risk_controlled_internal_audit_result({
        from: r.relation_file.ParentId,
        to: r.risk_controlled_internal_audit_result.Id,
      }),
    uncontrolledRiskSecondLineResult:
      r.one.risk_uncontrolled_second_line_result({
        from: r.relation_file.ParentId,
        to: r.risk_uncontrolled_second_line_result.Id,
      }),
    controlledRiskSecondLineResult: r.one.risk_controlled_second_line_result({
      from: r.relation_file.ParentId,
      to: r.risk_controlled_second_line_result.Id,
    }),
    obligationAssessmentResult: r.one.obligation_assessment_result({
      from: r.relation_file.ParentId,
      to: r.obligation_assessment_result.Id,
    }),
    obligationInternalAuditResult: r.one.obligation_internal_audit_result({
      from: r.relation_file.ParentId,
      to: r.obligation_internal_audit_result.Id,
    }),
    obligationSecondLineResult: r.one.obligation_second_line_result({
      from: r.relation_file.ParentId,
      to: r.obligation_second_line_result.Id,
    }),
    testResult: r.one.test_result({
      from: r.relation_file.ParentId,
      to: r.test_result.Id,
    }),
    controlTestInternalAuditResult: r.one.control_test_internal_audit_result({
      from: r.relation_file.ParentId,
      to: r.control_test_internal_audit_result.Id,
    }),
    controlTestSecondLineResult: r.one.control_test_second_line_result({
      from: r.relation_file.ParentId,
      to: r.control_test_second_line_result.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.relation_file.ParentId,
      to: r.third_party.Id,
    }),
    thirdPartyResponse: r.one.third_party_response({
      from: r.relation_file.ParentId,
      to: r.third_party_response.Id,
    }),
  },
  relation_file_audit: {},
  risk: {
    acceptances: r.many.acceptance_parent(),
    actions: r.many.action_parent(),
    ancestorContributors: r.many.ancestor_contributor_view(),
    appetites: r.many.appetite_parent(),
    assessmentResults: r.many.assessment_result_parent(),
    childRisks: r.many.risk(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    controls: r.many.control_parent(),
    departments: r.many.department(),
    impactRatings: r.many.impact_rating(),
    indicators: r.many.indicator_parent(),
    insertPermissions: r.many.insert_permission_view(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    createdByUser: r.one.user_view_active({
      from: r.risk.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    enterpriseRiskInstance: r.one.enterprise_risk_instance({
      from: r.risk.Id,
      to: r.enterprise_risk_instance.RiskId,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.risk.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.risk({
      from: r.risk.ParentRiskId,
      to: r.risk.Id,
    }),
    parentNode: r.one.node({
      from: r.risk.ParentRiskId,
      to: r.node.Id,
    }),
    riskScore: r.one.risk_score({
      from: r.risk.Id,
      to: r.risk_score.RiskId,
    }),
    schedule: r.one.schedule({
      from: r.risk.Id,
      to: r.schedule.Id,
    }),
    scheduleState: r.one.schedule_state({
      from: r.risk.Id,
      to: r.schedule_state.Id,
    }),
    treatment: r.one.risk_treatment_type({
      from: r.risk.Treatment,
      to: r.risk_treatment_type.Value,
    }),
  },
  risk_action_audit: {},
  risk_assessment_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.assessment_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.risk_assessment_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk_assessment_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  risk_controlled_internal_audit_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.internal_audit_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.risk_controlled_internal_audit_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk_controlled_internal_audit_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  risk_uncontrolled_internal_audit_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.internal_audit_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.risk_uncontrolled_internal_audit_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk_uncontrolled_internal_audit_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  risk_controlled_second_line_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.second_line_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.risk_controlled_second_line_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk_controlled_second_line_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  risk_uncontrolled_second_line_result: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    files: r.many.relation_file(),
    parents: r.many.second_line_result_parent(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.risk_uncontrolled_second_line_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.risk_uncontrolled_second_line_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  risk_assessment_result_audit: {},
  risk_assessment_result_control_type: {},
  risk_audit: {
    acceptanceAudits: r.many.acceptance_parent_audit(),
    actionAudits: r.many.action_parent_audit(),
    appetiteAudits: r.many.appetite_parent_audit(),
    assessmentResultAudits: r.many.assessment_result_parent_audit(),
    contributorAudits: r.many.contributor_audit(),
    contributorGroupAudits: r.many.contributor_group_audit(),
    controlAudits: r.many.control_parent_audit(),
    departmentAudits: r.many.department_audit(),
    impactRatingAudits: r.many.impact_rating_audit(),
    indicatorAudits: r.many.indicator_parent_audit(),
    ownerAudits: r.many.owner_audit(),
    ownerGroupAudits: r.many.owner_group_audit(),
    tagAudits: r.many.tag_audit(),
  },
  risk_score: {
    permissions: r.many.permission_view(),
    organisation: r.one.organisation({
      from: r.risk_score.OrgKey,
      to: r.organisation.OrgKey,
    }),
    risk: r.one.risk({
      from: r.risk_score.RiskId,
      to: r.risk.Id,
    }),
  },
  risk_scoring_model: {},
  risk_status_type: {},
  risk_treatment_type: {},
  role_access: {},
  schedule: {},
  schedule_audit: {},
  schedule_state: {
    parent: r.one.node({
      from: r.schedule_state.Id,
      to: r.node.Id,
    }),
    schedule: r.one.schedule({
      from: r.schedule_state.Id,
      to: r.schedule.Id,
    }),
  },
  schedule_state_audit: {},
  sso_configuration: {},
  sso_configuration_audit: {},
  tag: {
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.tag.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.tag.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.tag.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.node({
      from: r.tag.ParentId,
      to: r.node.Id,
    }),
    parentAction: r.one.action({
      from: r.tag.ParentId,
      to: r.action.Id,
    }),
    parentAssessment: r.one.assessment({
      from: r.tag.ParentId,
      to: r.assessment.Id,
    }),
    parentComplianceMonitoringAssessment:
      r.one.compliance_monitoring_assessment({
        from: r.tag.ParentId,
        to: r.compliance_monitoring_assessment.Id,
      }),
    parentControl: r.one.control({
      from: r.tag.ParentId,
      to: r.control.Id,
    }),
    parentDocument: r.one.document({
      from: r.tag.ParentId,
      to: r.document.Id,
    }),
    parentIssue: r.one.issue({
      from: r.tag.ParentId,
      to: r.issue.Id,
    }),
    parentIndicator: r.one.indicator({
      from: r.tag.ParentId,
      to: r.indicator.Id,
    }),
    parentInternalAuditEntity: r.one.internal_audit_entity({
      from: r.tag.ParentId,
      to: r.internal_audit_entity.Id,
    }),
    parentInternalAuditReport: r.one.internal_audit_report({
      from: r.tag.ParentId,
      to: r.internal_audit_report.Id,
    }),
    parentObligation: r.one.obligation({
      from: r.tag.ParentId,
      to: r.obligation.Id,
    }),
    parentRisk: r.one.risk({
      from: r.tag.ParentId,
      to: r.risk.Id,
    }),
    parentThirdParty: r.one.third_party({
      from: r.tag.ParentId,
      to: r.third_party.Id,
    }),
    type: r.one.tag_type({
      from: r.tag.TagTypeId,
      to: r.tag_type.TagTypeId,
    }),
    parentQuestionnaireTemplate: r.one.questionnaire_template({
      from: r.tag.ParentId,
      to: r.questionnaire_template.Id,
    }),
  },
  tag_audit: {
    control_audit: r.one.control_audit({
      from: r.tag_audit.ParentId,
      to: r.control_audit.Id,
    }),
    risk_audit: r.one.risk_audit({
      from: r.tag_audit.ParentId,
      to: r.risk_audit.Id,
    }),
  },
  tag_type: {
    createdByUser: r.one.user_view_active({
      from: r.tag_type.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.tag_type.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.tag_type.OrgKey,
      to: r.organisation.OrgKey,
    }),
    tag_type_group: r.one.tag_type_group({
      from: r.tag_type.TagTypeGroupId,
      to: r.tag_type_group.Id,
    }),
  },
  tag_type_audit: {},
  tag_type_group: {
    tag_types: r.many.tag_type(),
  },
  tag_type_group_audit: {},
  taxonomy: {
    organisations: r.many.taxonomy_org(),
  },
  taxonomy_audit: {
    organisations: r.many.taxonomy_org(),
  },
  taxonomy_org: {
    taxonomy: r.one.taxonomy({
      from: r.taxonomy_org.TaxonomyId,
      to: r.taxonomy.Id,
    }),
    taxonomy_audit: r.one.taxonomy_audit({
      from: r.taxonomy_org.TaxonomyId,
      to: r.taxonomy_audit.Id,
    }),
  },
  taxonomy_org_audit: {},
  test_frequency: {},
  test_result: {
    assessmentParents: r.many.assessment_result_parent(),
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.test_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.test_result.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.test_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.control({
      from: r.test_result.ParentControlId,
      to: r.control.Id,
    }),
    submitter: r.one.user_view_active({
      from: r.test_result.Submitter,
      to: r.user_view_active.Id,
    }),
  },
  control_test_internal_audit_result: {
    parents: r.many.internal_audit_result_parent(),
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.control_test_internal_audit_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.control_test_internal_audit_result.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.control_test_internal_audit_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.control({
      from: r.control_test_internal_audit_result.ParentControlId,
      to: r.control.Id,
    }),
    submitter: r.one.user_view_active({
      from: r.control_test_internal_audit_result.Submitter,
      to: r.user_view_active.Id,
    }),
  },
  control_test_second_line_result: {
    parents: r.many.second_line_result_parent(),
    files: r.many.relation_file(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.control_test_second_line_result.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.control_test_second_line_result.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.control_test_second_line_result.OrgKey,
      to: r.organisation.OrgKey,
    }),
    parent: r.one.control({
      from: r.control_test_second_line_result.ParentControlId,
      to: r.control.Id,
    }),
    submitter: r.one.user_view_active({
      from: r.control_test_second_line_result.Submitter,
      to: r.user_view_active.Id,
    }),
  },
  test_result_audit: {
    control_audit: r.one.control_audit({
      from: r.test_result_audit.ParentControlId,
      to: r.control_audit.Id,
    }),
  },
  third_party: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    departments: r.many.department(),
    files: r.many.relation_file(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    tags: r.many.tag(),
    status: r.one.third_party_status({
      from: r.third_party.Status,
      to: r.third_party_status.Value,
    }),
    type: r.one.third_party_type({
      from: r.third_party.Type,
      to: r.third_party_type.Value,
    }),
    createdByUser: r.one.user_view_active({
      from: r.third_party.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.third_party.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.third_party.OrgKey,
      to: r.organisation.OrgKey,
    }),
    contacts: r.many.third_party_contact(),
  },
  third_party_audit: {},
  third_party_contact: {
    third_party: r.one.third_party({
      from: r.third_party_contact.ThirdPartyId,
      to: r.third_party.Id,
    }),
    user: r.one.user({
      from: r.third_party_contact.UserId,
      to: r.user.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.third_party_contact.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.third_party_contact.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.third_party_contact.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  third_party_contact_audit: {},
  third_party_response: {
    ancestorContributors: r.many.ancestor_contributor_view(),
    contributorGroups: r.many.contributor_group(),
    contributors: r.many.contributor(),
    files: r.many.relation_file(),
    invitees: r.many.questionnaire_invite(),
    ownerGroups: r.many.owner_group(),
    owners: r.many.owner(),
    permissions: r.many.permission_view(),
    createdByUser: r.one.user_view_active({
      from: r.third_party_response.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.third_party_response.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.third_party_response.OrgKey,
      to: r.organisation.OrgKey,
    }),
    questionnaireTemplateVersion: r.one.questionnaire_template_version({
      from: r.third_party_response.QuestionnaireTemplateVersionId,
      to: r.questionnaire_template_version.Id,
    }),
    thirdParty: r.one.third_party({
      from: r.third_party_response.ParentId,
      to: r.third_party.Id,
    }),
  },
  third_party_response_audit: {},
  third_party_response_status: {},
  third_party_status: {
    third_parties: r.many.third_party(),
  },
  third_party_type: {
    third_parties: r.many.third_party(),
  },
  unit_of_time: {},
  user_group: {
    approvers: r.many.approver(),
    users: r.many.user_group_user(),
    createdByUser: r.one.user_view_active({
      from: r.user_group.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.user_group.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.user_group.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  user_group_audit: {},
  user_group_user: {
    authUsers: r.one.user({
      from: r.user_group_user.UserId,
      to: r.user.Id,
    }),
    createdByUser: r.one.user_view_active({
      from: r.user_group_user.CreatedByUser,
      to: r.user_view_active.Id,
      alias: 'createdByUser',
    }),
    user: r.one.user_view_active({
      from: r.user_group_user.UserId,
      to: r.user_view_active.Id,
    }),
    userGroups: r.one.user_group({
      from: r.user_group_user.UserGroupId,
      to: r.user_group.Id,
    }),
  },
  user_group_user_audit: {},
  user_role_access: {
    node: r.one.node({
      from: r.user_role_access.ObjectType,
      to: r.node.ObjectType,
    }),
  },
  user_search_preferences: {},
  user_search_preferences_audit: {},
  user_table_preferences: {},
  user_table_preferences_audit: {},
  user_view_active: {
    group_memberships: r.many.user_group_user(),
    createdByUsers: r.many.user_group_user({ alias: 'createdByUser' }),
    status: r.one.user_status({
      from: r.user_view_active.Status,
      to: r.user_status.Value,
    }),
  },
  issue_summary_view: {
    issue: r.one.issue({
      from: r.issue_update_summary.IssueId,
      to: r.issue.Id,
    }),
  },
  version_status: {},
  wizard: {
    parent: r.one.risk({
      from: r.wizard.RiskId,
      to: r.risk.Id,
    }),
  },
  wizard_audit: {},
  data_export_schedule: {
    createdByUser: r.one.user_view_active({
      from: r.data_export_schedule.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.data_export_schedule.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.data_export_schedule.OrgKey,
      to: r.organisation.OrgKey,
    }),
    dataExportScheduleExecutions: r.many.data_export_schedule_execution(),
  },
  data_export_schedule_audit: {},
  data_export_schedule_execution: {
    createdByUser: r.one.user_view_active({
      from: r.data_export_schedule_execution.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.data_export_schedule_execution.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.data_export_schedule_execution.OrgKey,
      to: r.organisation.OrgKey,
    }),
    dataExportSchedule: r.one.data_export_schedule({
      from: r.data_export_schedule_execution.ParentId,
      to: r.data_export_schedule.Id,
    }),
  },
  data_export_schedule_execution_audit: {},
  colour_palette: {
    createdByUser: r.one.user_view_active({
      from: r.colour_palette.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.colour_palette.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.colour_palette.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
  colour_palette_audit: {},
  organisation_module: {
    createdByUser: r.one.user_view_active({
      from: r.organisation_module.CreatedByUser,
      to: r.user_view_active.Id,
    }),
    modifiedByUser: r.one.user_view_active({
      from: r.organisation_module.ModifiedByUser,
      to: r.user_view_active.Id,
    }),
    organisation: r.one.organisation({
      from: r.organisation_module.OrgKey,
      to: r.organisation.OrgKey,
    }),
  },
});

export const relations = defineRelations(schema, buildRelations);
