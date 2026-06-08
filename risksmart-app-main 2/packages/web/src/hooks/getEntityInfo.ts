import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ParseKeys } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  acceptanceDetailUrl,
  actionDetailsUrl,
  appetiteDetailsUrl,
  assessmentDetailsUrl,
  complianceMonitoringAssessmentDetailsUrl,
  controlDetailsUrl,
  controlGroupDetailsUrl,
  impactDetailsUrl,
  indicatorDetailsUrl,
  internalAuditDetailsUrl,
  internalAuditReportDetailsUrl,
  issueAssessmentDetailsUrl,
  issueBreachLogDetailsUrl,
  issueConsumerDutyDetailsUrl,
  issueCustomerTrustDetailsUrl,
  issueDetailsUrl,
  issueGDPRBreachLogDetailsUrl,
  issuePCIBreachLogDetailsUrl,
  issueRiskEventDetailsUrl,
  issueSARLogDetailsUrl,
  obligationChangeDetailsUrl,
  obligationDetailsUrl,
  policyDetailsUrl,
  riskDetailsUrl,
  thirdPartyDetailsUrl,
} from '@/utils/urls';

export type EntityInfo = {
  translationKey: ParseKeys<'taxonomy'>;
  singular: string;
  plural: string;
  url: (id: string) => string;
  /**
   * Ideally, we would have a title field on the node table, and restrict node table by permissions, however hiding complexity with this function for now.
   * @param item
   * @returns
   */
  getTitle?: (
    item: {
      risk?: { Title?: null | string } | null;
      control?: { Title?: null | string } | null;
      issue?: { Title?: null | string } | null;
      obligation?: { Title?: null | string } | null;
      thirdParty?: { Title?: null | string } | null;
      group?: { Title?: null | string } | null;
      document?: { Title?: null | string } | null;
      assessment?: { Title?: null | string } | null;
      internalAuditEntity?: { Title?: null | string } | null;
      internalAuditReport?: { Title?: null | string } | null;
      complianceMonitoringAssessment?: { Title?: null | string } | null;
      obligationChange?: { Title?: null | string } | null;
    } | null
  ) => string;
};

export const useEntityInfo = () => {
  const { t } = useTranslation('taxonomy');
  const lookup: { [key in Parent_Type_Enum]?: EntityInfo } = useMemo(
    () => ({
      [Parent_Type_Enum.Action]: {
        translationKey: 'action',
        singular: t('action', { count: 1 }),
        plural: t('action', { count: 3 }),
        url: actionDetailsUrl,
      },
      [Parent_Type_Enum.Acceptance]: {
        translationKey: 'acceptance',
        singular: t('acceptance', { count: 1 }),
        plural: t('acceptance', { count: 3 }),
        url: acceptanceDetailUrl,
      },
      [Parent_Type_Enum.Appetite]: {
        translationKey: 'appetite',
        singular: t('appetite', { count: 1 }),
        plural: t('appetite', { count: 3 }),
        url: appetiteDetailsUrl,
      },
      [Parent_Type_Enum.Assessment]: {
        translationKey: 'assessment',
        singular: t('assessment', { count: 1 }),
        plural: t('assessment', { count: 3 }),
        url: assessmentDetailsUrl,
        getTitle: (item) => item?.assessment?.Title ?? '-',
      },
      [Parent_Type_Enum.Control]: {
        translationKey: 'control',
        singular: t('control', { count: 1 }),
        plural: t('control', { count: 3 }),
        url: controlDetailsUrl,
        getTitle: (item) => item?.control?.Title ?? '-',
      },
      [Parent_Type_Enum.TestResult]: {
        translationKey: 'control_test_result',
        singular: t('control_test_result', { count: 1 }),
        plural: t('control_test_result', { count: 3 }),
        url: controlDetailsUrl,
      },
      [Parent_Type_Enum.Document]: {
        translationKey: 'document',
        singular: t('document', { count: 1 }),
        plural: t('document', { count: 3 }),
        url: policyDetailsUrl,
        getTitle: (item) => item?.document?.Title ?? '-',
      },
      [Parent_Type_Enum.DocumentAssessmentResult]: {
        translationKey: 'document',
        singular: t('document', { count: 1 }),
        plural: t('document', { count: 3 }),
        url: policyDetailsUrl,
      },
      [Parent_Type_Enum.InternalAuditReport]: {
        translationKey: 'internal_audit_report',
        singular: t('internal_audit_report', { count: 1 }),
        plural: t('internal_audit_report', { count: 3 }),
        url: internalAuditReportDetailsUrl,
        getTitle: (item) => item?.internalAuditReport?.Title ?? '-',
      },
      [Parent_Type_Enum.InternalAuditEntity]: {
        translationKey: 'internal_audit',
        singular: t('internal_audit', { count: 1 }),
        plural: t('internal_audit', { count: 3 }),
        url: internalAuditDetailsUrl,
        getTitle: (item) => item?.internalAuditEntity?.Title ?? '-',
      },
      [Parent_Type_Enum.ComplianceMonitoringAssessment]: {
        translationKey: 'compliance_monitoring_assessment',
        singular: t('compliance_monitoring_assessment', { count: 1 }),
        plural: t('compliance_monitoring_assessment', { count: 3 }),
        url: complianceMonitoringAssessmentDetailsUrl,
        getTitle: (item) => item?.complianceMonitoringAssessment?.Title ?? '-',
      },
      [Parent_Type_Enum.Indicator]: {
        translationKey: 'indicator',
        singular: t('indicator', { count: 1 }),
        plural: t('indicator', { count: 3 }),
        url: indicatorDetailsUrl,
      },
      [Parent_Type_Enum.Impact]: {
        translationKey: 'impact',
        singular: t('impact', { count: 1 }),
        plural: t('impact', { count: 3 }),
        url: impactDetailsUrl,
      },
      [Parent_Type_Enum.ImpactRating]: {
        translationKey: 'impact_rating',
        singular: t('impact_rating', { count: 1 }),
        plural: t('impact_rating', { count: 3 }),
        url: () => '#',
      },
      [Parent_Type_Enum.ControlGroup]: {
        translationKey: 'control_group',
        singular: t('control_group', { count: 1 }),
        plural: t('control_group', { count: 3 }),
        url: controlGroupDetailsUrl,
        getTitle: (item) => item?.group?.Title ?? '-',
      },
      [Parent_Type_Enum.Risk]: {
        translationKey: 'risk',
        singular: t('risk', { count: 1 }),
        plural: t('risk', { count: 3 }),
        url: riskDetailsUrl,
        getTitle: (item) => item?.risk?.Title ?? '-',
      },
      [Parent_Type_Enum.RiskAssessmentResult]: {
        translationKey: 'risk',
        singular: t('risk', { count: 1 }),
        plural: t('risk', { count: 3 }),
        url: riskDetailsUrl,
      },
      [Parent_Type_Enum.Issue]: {
        translationKey: 'issue',
        singular: t('issue', { count: 1 }),
        plural: t('issue', { count: 3 }),
        url: issueDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueBreachLog]: {
        translationKey: 'issueBreachLog',
        singular: t('issueBreachLog', { count: 1 }),
        plural: t('issueBreachLog', { count: 3 }),
        url: issueBreachLogDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueConsumerDuty]: {
        translationKey: 'issueConsumerDuty',
        singular: t('issueConsumerDuty', { count: 1 }),
        plural: t('issueConsumerDuty', { count: 3 }),
        url: issueConsumerDutyDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueCustomerTrust]: {
        translationKey: 'issueCustomerTrust',
        singular: t('issueCustomerTrust', { count: 1 }),
        plural: t('issueCustomerTrust', { count: 3 }),
        url: issueCustomerTrustDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueGdprBreachLog]: {
        translationKey: 'issueGDPRBreachLog',
        singular: t('issueGDPRBreachLog', { count: 1 }),
        plural: t('issueGDPRBreachLog', { count: 3 }),
        url: issueGDPRBreachLogDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssuePciBreachLog]: {
        translationKey: 'issuePCIBreachLog',
        singular: t('issuePCIBreachLog', { count: 1 }),
        plural: t('issuePCIBreachLog', { count: 3 }),
        url: issuePCIBreachLogDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueRiskEvent]: {
        translationKey: 'issueRiskEvent',
        singular: t('issueRiskEvent', { count: 1 }),
        plural: t('issueRiskEvent', { count: 3 }),
        url: issueRiskEventDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueSarLog]: {
        translationKey: 'issueSARLog',
        singular: t('issueSARLog', { count: 1 }),
        plural: t('issueSARLog', { count: 3 }),
        url: issueSARLogDetailsUrl,
        getTitle: (item) => item?.issue?.Title ?? '-',
      },
      [Parent_Type_Enum.IssueAssessment]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentBreachLog]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentRiskEvent]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentConsumerDuty]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentCustomerTrust]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentGdprBreachLog]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentPciBreachLog]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.IssueAssessmentSarLog]: {
        translationKey: 'issue_assessment',
        singular: t('issue_assessment', { count: 1 }),
        plural: t('issue_assessment', { count: 3 }),
        url: issueAssessmentDetailsUrl,
      },
      [Parent_Type_Enum.Obligation]: {
        translationKey: 'obligation',
        singular: t('obligation', { count: 1 }),
        plural: t('obligation', { count: 3 }),
        url: obligationDetailsUrl,
        getTitle: (item) => item?.obligation?.Title ?? '-',
      },
      [Parent_Type_Enum.ObligationAssessmentResult]: {
        translationKey: 'obligation',
        singular: t('obligation', { count: 1 }),
        plural: t('obligation', { count: 3 }),
        url: obligationDetailsUrl,
      },
      [Parent_Type_Enum.ObligationChange]: {
        translationKey: 'obligation_change',
        singular: t('obligation_change', { count: 1 }),
        plural: t('obligation_change', { count: 3 }),
        url: obligationChangeDetailsUrl,
        getTitle: (item) => item?.obligationChange?.Title ?? '-',
      },
      [Parent_Type_Enum.ThirdParty]: {
        translationKey: 'third_party',
        singular: t('third_party', { count: 1 }),
        plural: t('third_party', { count: 3 }),
        url: thirdPartyDetailsUrl,
        getTitle: (item) => item?.thirdParty?.Title ?? '-',
      },
      [Parent_Type_Enum.CustomDatasource]: {
        translationKey: 'custom_datasource',
        singular: t('custom_datasource', { count: 1 }),
        plural: t('custom_datasource', { count: 3 }),
        url: () => '#',
      },
      [Parent_Type_Enum.ScimConfiguration]: {
        translationKey: 'scim_configuration',
        singular: t('scim_configuration', { count: 1 }),
        plural: t('scim_configuration', { count: 3 }),
        url: () => '#',
      },
      [Parent_Type_Enum.Settings]: {
        translationKey: 'setting',
        singular: t('setting', { count: 1 }),
        plural: t('setting', { count: 3 }),
        url: () => '#',
      },
    }),
    [t]
  );

  const getEntityInfo = useCallback(
    (type: Parent_Type_Enum) => {
      const result = lookup[type];
      if (!result) {
        throw new Error(`${type} not implemented`);
      }

      return result;
    },
    [lookup]
  );

  return getEntityInfo;
};

export default useEntityInfo;
