import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionLazy } from 'src/rbac/useHasPermissionLazy';

import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabledLazy } from '@/hooks/useIsModuleEnabled';
import { useIssueVariantTabs } from '@/utils/useIssueVariantTabs';

import type { TabId } from './useTabPreferences';

const useTabVisibility = (
  parent?: ObjectWithContributors,
  parentType?: Parent_Type_Enum
): { [key in TabId]: boolean } => {
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();
  const isModEnabled = useIsModuleEnabledLazy();
  const hasPermission = useHasPermissionLazy();
  const modulesEnabled = isFeatureFlagEnabled('modules');
  const { hasPermission: canViewActions, loading: actionsLoading } =
    hasPermission('read:action', parent);
  const actionsEnabled = isModEnabled('action');

  const { hasPermission: canViewAcceptances, loading: acceptancesLoading } =
    hasPermission('read:acceptance', parent);
  const acceptancesEnabled = isModEnabled('risk.subModules.acceptance');

  const { hasPermission: canViewControls, loading: controlsLoading } =
    hasPermission('read:control', parent);
  const controlsEnabled = isModEnabled('control');

  const { hasPermission: canViewAppetites, loading: appetitesLoading } =
    hasPermission('read:appetite', parent);
  const appetitesEnabled = isModEnabled('risk.subModules.appetite');

  const { hasPermission: canViewAssessments, loading: assessmentsLoading } =
    hasPermission('read:assessment', parent);
  const assessmentsEnabled = isModEnabled('assessment');

  const { hasPermission: canViewIndicators, loading: indicatorsLoading } =
    hasPermission('read:indicator', parent);
  const indicatorsEnabled = isModEnabled('indicator');

  const { hasPermission: canViewImpactRatings, loading: impactsLoading } =
    hasPermission('read:impact_rating', parent);
  const impactsEnabled = isModEnabled('risk.subModules.impact');
  const trpcEnabled = isFeatureFlagEnabled('trpc');

  const { hasPermission: canViewLinkedItems, loading: linkedItemsLoading } =
    hasPermission('read:linked_item', parent);

  const approvalsEnabled = isModEnabled('approval');
  const thirdPartyEnabled = isModEnabled('third_party');
  const thirdPartyContactsEnabled =
    thirdPartyEnabled && isFeatureFlagEnabled('tpp_contacts');
  const {
    hasPermission: canViewQuestionnaires,
    loading: questionnairesLoading,
  } = hasPermission('update:third_party', parent);
  const { hasPermission: canViewTestResults, loading: testResultsLoading } =
    hasPermission('read:test_result', parent);
  const causesEnabled = isModEnabled('issue.subModules.cause');
  const consequenceEnabled = isModEnabled('issue.subModules.consequence');
  const { hasPermission: canViewCauses, loading: causesLoading } =
    hasPermission('read:cause', parent);
  const { hasPermission: canViewConsequences, loading: consequencesLoading } =
    hasPermission('read:consequence', parent);
  const {
    hasPermission: canViewIssueAssessments,
    loading: issueAssessmentsLoading,
  } = hasPermission('read:issue_assessment', parent);
  const {
    hasPermission: canViewDocumentAssessmentResult,
    loading: documentAssessmentResultLoading,
  } = hasPermission('read:document_assessment_result', parent);
  const { hasPermission: canViewAssessment, loading: assessmentLoading } =
    hasPermission('read:assessment', parent);
  const canViewDocumentAssessments =
    canViewDocumentAssessmentResult && canViewAssessment;
  const { hasPermission: canViewDocumentFiles, loading: documentFilesLoading } =
    hasPermission('read:document_file', parent);
  const attestationsEnabled = isModEnabled('document.subModules.attestation');
  const attestationImprovementsEnabled = isFeatureFlagEnabled(
    'attestation_improvements'
  );
  const { hasPermission: canViewAttestations, loading: attestationsLoading } =
    hasPermission('read:attestation_record');
  const {
    hasPermission: canViewDocumentAssessmentResults,
    loading: documentAssessmentResultsLoading,
  } = hasPermission('read:document_assessment_result', parent);
  const {
    hasPermission: canViewObligationAssessmentResults,
    loading: obligationAssessmentResultsLoading,
  } = hasPermission('read:obligation_assessment_result', parent);
  const {
    hasPermission: canViewAssessmentActivities,
    loading: assessmentActivitiesLoading,
  } = hasPermission('read:assessment_activity', parent);
  const {
    hasPermission: canViewRiskAssessmentResults,
    loading: riskAssessmentResultsLoading,
  } = hasPermission('read:risk_assessment_result', parent);
  const canViewAssessmentResults =
    canViewDocumentAssessmentResults ||
    canViewObligationAssessmentResults ||
    canViewRiskAssessmentResults;
  const enterpriseRiskEnabled = isModEnabled('enterprise_risk');
  const { hasPermission: canUpdateUsers, loading: usersLoading } =
    hasPermission('update:settings_users');
  const { hasPermission: canUpdateCustomRoles, loading: customRolesLoading } =
    hasPermission('update:custom_role');
  const { hasPermission: canUpdateUserGroups, loading: userGroupsLoading } =
    hasPermission('update:settings_user_groups');
  const { hasPermission: canUpdateTags, loading: tagsLoading } = hasPermission(
    'update:settings_tags'
  );
  const { hasPermission: canUpdateDepartments, loading: departmentsLoading } =
    hasPermission('update:settings_departments');
  const {
    hasPermission: canViewInternalAuditLog,
    loading: internalAuditLogLoading,
  } = hasPermission('read:settings_audit');
  const {
    hasPermission: canUpdateGlobalApprovals,
    loading: globalApprovalsLoading,
  } = hasPermission('update:settings_approvals');
  const authenticationEnabled = isFeatureFlagEnabled('authentication');
  const {
    hasPermission: canUpdateScimConfiguration,
    loading: scimConfigurationLoading,
  } = hasPermission('update:scim_configuration');
  const { hasPermission: canUpdateTaxonomy, loading: taxonomyLoading } =
    hasPermission('update:taxonomy');
  const { hasPermission: canUseDataImport, loading: dataImportLoading } =
    hasPermission('insert:data_import');
  const { hasPermission: canUseEntities, loading: entitiesLoading } =
    hasPermission('update:entity');
  const { hasPermission: canUseDataExport, loading: dataExportLoading } =
    hasPermission('read:data_export');
  const {
    hasPermission: canViewModuleSettings,
    loading: moduleSettingsLoading,
  } = hasPermission('update:settings_module');
  const { hasPermission: canUpdateExternalApi, loading: externalApiLoading } =
    hasPermission('update:external_api');
  const {
    hasPermission: canViewNotificationHistory,
    loading: notificationHistoryLoading,
  } = hasPermission('read:settings');
  const issuesEnabled = isModEnabled('issue');
  const notificationsEnabled = isModEnabled('notification');

  const {
    hasPermission: canViewColourSettings,
    loading: colourSettingsLoading,
  } = hasPermission('update:settings_module');
  const internalAuditReportsEnabled = isModEnabled(
    'internal_audit_entity.subModules.internal_audit_report'
  );

  const {
    hasPermission: canUseSsoConfiguration,
    loading: ssoConfigurationLoading,
  } = hasPermission('read:sso_configuration');

  // Already prefiltered and will only return the issue variants that the user has access to
  const issueVariants = _.mapValues(
    _.keyBy(useIssueVariantTabs('', true, parent), 'id'),
    () => true
  );

  const isLoading =
    actionsLoading ||
    acceptancesLoading ||
    controlsLoading ||
    appetitesLoading ||
    assessmentsLoading ||
    assessmentLoading ||
    indicatorsLoading ||
    impactsLoading ||
    linkedItemsLoading ||
    questionnairesLoading ||
    testResultsLoading ||
    causesLoading ||
    consequencesLoading ||
    issueAssessmentsLoading ||
    documentFilesLoading ||
    attestationsLoading ||
    documentAssessmentResultsLoading ||
    documentAssessmentResultLoading ||
    obligationAssessmentResultsLoading ||
    assessmentActivitiesLoading ||
    riskAssessmentResultsLoading ||
    usersLoading ||
    userGroupsLoading ||
    tagsLoading ||
    departmentsLoading ||
    internalAuditLogLoading ||
    globalApprovalsLoading ||
    scimConfigurationLoading ||
    taxonomyLoading ||
    dataImportLoading ||
    entitiesLoading ||
    dataExportLoading ||
    moduleSettingsLoading ||
    colourSettingsLoading ||
    customRolesLoading ||
    externalApiLoading ||
    ssoConfigurationLoading ||
    notificationHistoryLoading;

  return useMemo(() => {
    if (isLoading) {
      return {
        acceptances: false,
        actions: false,
        activities: false,
        appetites: false,
        approvals: false,
        assessments: false,
        attestations: false,
        audit: false,
        authentication: false,
        causes: false,
        colours: false,
        consequences: false,
        contacts: false,
        controls: false,
        customRoles: false,
        dataExport: false,
        dataImport: false,
        departments: false,
        details: true,
        entities: false,
        entityRisks: false,
        externalApi: false,
        findings: false,
        globalApprovals: false,
        impacts: false,
        indicators: false,
        internalAuditRisks: false,
        issues: false,
        issuesBreachLog: false,
        issuesConsumerDuty: false,
        issuesCustomerTrust: false,
        issuesGDPRBreachLog: false,
        issuesPCIBreachLog: false,
        issuesRiskEvents: false,
        issuesSARLog: false,
        linkedItems: false,
        modules: false,
        notificationHistory: false,
        notifications: false,
        questionnaires: false,
        reports: false,
        results: false,
        sso: false,
        tags: false,
        taxonomy: false,
        testResults: false,
        updates: false,
        userGroups: false,
        users: false,
        versions: false,
      };
    }

    const assessments: { [key in Parent_Type_Enum]?: boolean } = {
      [Parent_Type_Enum.Risk]: canViewAssessments && !impactsEnabled,
      [Parent_Type_Enum.Issue]: canViewIssueAssessments,
      [Parent_Type_Enum.Document]: canViewDocumentAssessments,
      [Parent_Type_Enum.Impact]: canViewImpactRatings,
      [Parent_Type_Enum.Obligation]: canViewObligationAssessmentResults,
    };

    // Current logic is to only should the attestation tab for document files when the
    // attestation improvements feature flag is off. Once the feature is fully rolled out,
    // we can remove the parentType check and always rely on permission.
    const canViewAttestationTab = attestationImprovementsEnabled
      ? canViewAttestations
      : canViewAttestations && parentType === Parent_Type_Enum.DocumentFile;

    return {
      acceptances: canViewAcceptances && acceptancesEnabled,
      actions: canViewActions && actionsEnabled,
      activities: canViewAssessmentActivities,
      appetites: canViewAppetites && appetitesEnabled,
      approvals:
        approvalsEnabled &&
        (parentType === Parent_Type_Enum.Settings
          ? canUpdateGlobalApprovals
          : true),
      assessments:
        // Issue assessments should still be visible even if the assessments module is disabled as it's required for issues
        (assessmentsEnabled || parentType === Parent_Type_Enum.Issue) &&
        ((parentType ? assessments[parentType] : canViewAssessments) ??
          canViewAssessments),
      attestations: attestationsEnabled && canViewAttestationTab,
      audit: canViewInternalAuditLog,
      authentication: authenticationEnabled && canUpdateScimConfiguration,
      causes: canViewCauses && causesEnabled,
      consequences: canViewConsequences && consequenceEnabled,
      colours: canViewColourSettings,
      contacts: thirdPartyContactsEnabled && canViewQuestionnaires,
      customRoles: canUpdateCustomRoles && trpcEnabled,
      controls: canViewControls && controlsEnabled,
      dataExport: canUseDataExport,
      dataImport: canUseDataImport,
      departments: canUpdateDepartments,
      details: true,
      entities: enterpriseRiskEnabled && canUseEntities,
      entityRisks: true,
      externalApi: canUpdateExternalApi,
      findings: canViewAssessmentResults,
      globalApprovals: true,
      impacts: impactsEnabled && canViewImpactRatings,
      indicators: canViewIndicators && indicatorsEnabled,
      results: canViewIndicators && indicatorsEnabled,
      internalAuditRisks: true,
      issues: issueVariants.issues && issuesEnabled,
      issuesBreachLog: issueVariants.issuesBreachLog,
      issuesConsumerDuty: issueVariants.issuesConsumerDuty,
      issuesCustomerTrust: issueVariants.issuesCustomerTrust,
      issuesGDPRBreachLog: issueVariants.issuesGDPRBreachLog,
      issuesPCIBreachLog: issueVariants.issuesPCIBreachLog,
      issuesRiskEvents: issueVariants.issuesRiskEvents,
      issuesSARLog: issueVariants.issuesSARLog,
      linkedItems: canViewLinkedItems,
      modules: canViewModuleSettings && modulesEnabled,
      notificationHistory: notificationsEnabled && trpcEnabled,
      notifications: canViewNotificationHistory,
      questionnaires: thirdPartyEnabled && canViewQuestionnaires,
      reports: internalAuditReportsEnabled,
      sso: canUseSsoConfiguration,
      tags: canUpdateTags,
      taxonomy: canUpdateTaxonomy,
      testResults: canViewTestResults,
      updates: true,
      userGroups: canUpdateUserGroups,
      users: canUpdateUsers,
      versions: canViewDocumentFiles,
    };
  }, [
    isLoading,
    canViewAssessments,
    impactsEnabled,
    canViewIssueAssessments,
    canViewDocumentAssessments,
    canViewImpactRatings,
    canViewObligationAssessmentResults,
    attestationImprovementsEnabled,
    canViewAttestations,
    parentType,
    canViewAcceptances,
    acceptancesEnabled,
    canViewActions,
    actionsEnabled,
    canViewAssessmentActivities,
    canViewAppetites,
    appetitesEnabled,
    approvalsEnabled,
    canUpdateGlobalApprovals,
    assessmentsEnabled,
    attestationsEnabled,
    canViewInternalAuditLog,
    authenticationEnabled,
    canUpdateScimConfiguration,
    canViewCauses,
    causesEnabled,
    canViewConsequences,
    consequenceEnabled,
    canViewColourSettings,
    thirdPartyContactsEnabled,
    canViewQuestionnaires,
    canUpdateCustomRoles,
    trpcEnabled,
    canViewControls,
    controlsEnabled,
    canUseDataExport,
    canUseDataImport,
    canUpdateDepartments,
    enterpriseRiskEnabled,
    canUseEntities,
    canUpdateExternalApi,
    canViewNotificationHistory,
    canViewAssessmentResults,
    canViewIndicators,
    indicatorsEnabled,
    issueVariants.issues,
    issueVariants.issuesBreachLog,
    issueVariants.issuesConsumerDuty,
    issueVariants.issuesCustomerTrust,
    issueVariants.issuesGDPRBreachLog,
    issueVariants.issuesPCIBreachLog,
    issueVariants.issuesRiskEvents,
    issueVariants.issuesSARLog,
    issuesEnabled,
    canViewLinkedItems,
    canViewModuleSettings,
    modulesEnabled,
    thirdPartyEnabled,
    internalAuditReportsEnabled,
    canUpdateTags,
    canUpdateTaxonomy,
    canViewTestResults,
    canUpdateUserGroups,
    canUpdateUsers,
    canViewDocumentFiles,
    canUseSsoConfiguration,
    notificationsEnabled,
  ]);
};

export default useTabVisibility;
