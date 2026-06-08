import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import type { TabId } from './useTabPreferences';

const useTabLabels = (
  parentType?: Parent_Type_Enum,
  issueSubType?: ParentIssueType
): { [key in TabId]: string } => {
  const { t } = useTranslation([]);

  const issueMapping = issueSubType
    ? IssueTypeMapping[issueSubType]
    : IssueTypeMapping['issue'];

  const updateLabels: { [key in Parent_Type_Enum]?: string } = {
    [Parent_Type_Enum.Issue]: t('issueUpdates.tab_title'),
    [Parent_Type_Enum.Action]: t('actionUpdates.tab_title'),
  };

  const assessmentLabels: { [key in Parent_Type_Enum]?: string } = {
    [Parent_Type_Enum.Risk]: t('ratings.tab_title'),
    [Parent_Type_Enum.Issue]: i18n.format(
      t(`${issueMapping?.taxonomy}.assessment`),
      'capitalizeAll'
    ),
    [Parent_Type_Enum.Document]: i18n.format(t('rating_other'), 'capitalize'),
    [Parent_Type_Enum.Impact]: i18n.format(t('rating_other'), 'capitalize'),
    [Parent_Type_Enum.Obligation]: i18n.format(t('rating_other'), 'capitalize'),
  };

  return {
    acceptances: t('acceptances.tab_title'),
    actions: t('actions.tab_title'),
    activities: t('assessmentActivities.tab_title'),
    appetites: t('appetites.tab_title'),
    approvals: t('approvals.tab_title'),
    assessments:
      (parentType ? assessmentLabels[parentType] : t('ratings.tab_title')) ??
      t('ratings.tab_title'),
    attestations: t('attestations.tab_title'),
    audit: t('auditLog.auditTableTitle'),
    authentication: t('authenticationSettings.authenticationTableTitle'),
    causes: i18n.format(t('cause_other'), 'capitalizeAll'),
    consequences: i18n.format(t('consequence_other'), 'capitalizeAll'),
    contacts: t('third_party.tabs.contacts'),
    controls:
      parentType === Parent_Type_Enum.ControlGroup
        ? t('linkControl.tab_title')
        : t('controls.tab_title'),
    dataExport: t('dataExport.tabTitle'),
    dataImport: t('dataImport.tabTitle'),
    departments: t('departments.departmentsTableTitle'),
    details: t('details'),
    entities: t('entity.entityTabTitle'),
    entityRisks: i18n.format(t('risk_other'), 'capitalize'),
    findings: t('assessmentResults.tab_title'),
    globalApprovals: t('approvals.tab_title'),
    impacts: t('impacts.tab_title'),
    indicators: t('indicators.tab_title'),
    internalAuditRisks: i18n.format(t('risk_other'), 'capitalize'),
    linkedItems: t('linkedItems.tab_title'),
    questionnaires: t('third_party.tabs.questionnaires'),
    reports: i18n.format(t('reports'), 'capitalize'),
    results: i18n.format(t('indicator_result_other'), 'capitalize'),
    sso: t('sso.tab_title'),
    tags: t('tags.tagsTableTitle'),
    taxonomy: t('taxonomy.taxonomyTableTitle'),
    testResults: i18n.format(t('performance'), 'capitalize'),
    updates:
      (parentType ? updateLabels[parentType] : t('issueUpdates.tab_title')) ??
      t('issueUpdates.tab_title'),
    userGroups: t('userGroups.groupsTableTitle'),
    users: t('userSettings.usersTableTitle'),
    versions: i18n.format(t('versions'), 'capitalize'),
    issues: t(`issues.tab_title`),
    issuesBreachLog: t(`issuesBreachLog.tab_title`),
    issuesConsumerDuty: t(`issuesConsumerDuty.tab_title`),
    issuesCustomerTrust: t(`issuesCustomerTrust.tab_title`),
    issuesGDPRBreachLog: t(`issuesGDPRBreachLog.tab_title`),
    issuesPCIBreachLog: t(`issuesPCIBreachLog.tab_title`),
    issuesRiskEvents: t(`issuesRiskEvents.tab_title`),
    issuesSARLog: t(`issuesSARLog.tab_title`),
    modules: t('modules.tab_title'),
    notificationHistory: t('notificationHistory.tab_title'),
    notifications: t('notificationHistory.tab_title'),
    colours: t('colours.tab_title'),
    customRoles: t('customRoles.tab_title'),
    externalApi: t('externalApi.tab_title'),
  };
};

export default useTabLabels;
