import type { LocalStorageKeys } from '@risksmart-app/components/src/hooks/useLocalStorage';
import type { TableOptions } from '@risksmart-app/components/src/table/tableUtils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import type { FeatureFlag } from '@risksmart-app/modules/src/index';
import type {
  IssueAssessmentTaxonomyKeys,
  IssueTaxonomyKeys,
} from '@risksmart-app/shared/forms/issues/types';
import type { Parent_Type_Enum as ParentTypeEnum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { TCountOptions } from 'src/components/connected-count/ConnectedCount';

import {
  issueBreachLogDetailsUrl,
  issueBreachLogRegisterUrl,
  issueConsumerDutyDetailsUrl,
  issueConsumerDutyRegisterUrl,
  issueCustomerTrustDetailsUrl,
  issueCustomerTrustRegisterUrl,
  issueDetailsUrl,
  issueGDPRBreachLogDetailsUrl,
  issueGDPRBreachLogRegisterUrl,
  issuePCIBreachLogDetailsUrl,
  issuePCIBreachLogRegisterUrl,
  issueRegisterUrl,
  issueRiskEventDetailsUrl,
  issueRiskEventRegisterUrl,
  issueSARLogDetailsUrl,
  issueSARLogRegisterUrl,
  reportAnIssueBreachSuccessUrl,
  reportAnIssueConsumerDutySuccessUrl,
  reportAnIssueCustomerTrustSuccessUrl,
  reportAnIssueGDPRBreachSuccessUrl,
  reportAnIssuePCIBreachSuccessUrl,
  reportAnIssueRiskEventSuccessUrl,
  reportAnIssueSARSuccessUrl,
  reportAnIssueSuccessUrl,
} from '@/utils/urls';

import type { IssueRegisterFields } from '../pages/issues/types';

export type ParentIssueAssessmentTypes = Extract<
  ParentTypeEnum,
  | 'issue_assessment_breach_log'
  | 'issue_assessment_consumer_duty'
  | 'issue_assessment_customer_trust'
  | 'issue_assessment_gdpr_breach_log'
  | 'issue_assessment_pci_breach_log'
  | 'issue_assessment_risk_event'
  | 'issue_assessment_sar_log'
  | 'issue_assessment'
>;

type IssueTypeMapItem = {
  type: ParentIssueType;
  taxonomy: IssueTaxonomyKeys;
  assessmentTaxonomy: IssueAssessmentTaxonomyKeys;
  assessmentType: ParentIssueAssessmentTypes;
  issueRegisterStorageKey: LocalStorageKeys;
  uriPath: string;
  registerUrl: (
    options: TableOptions<IssueRegisterFields> | undefined
  ) => string;
  detailsUrl: (issueId: string) => string;
  count: TCountOptions;
  entityLabel:
    | 'issue_one'
    | 'issueBreachLog_one'
    | 'issueConsumerDuty_one'
    | 'issueCustomerTrust_one'
    | 'issueGDPRBreachLog_one'
    | 'issuePCIBreachLog_one'
    | 'issueRiskEvent_one'
    | 'issueSARLog_one';
  entityLabelOther:
    | 'issue_other'
    | 'issueBreachLog_other'
    | 'issueConsumerDuty_other'
    | 'issueCustomerTrust_other'
    | 'issueGDPRBreachLog_other'
    | 'issuePCIBreachLog_other'
    | 'issueRiskEvent_other'
    | 'issueSARLog_other';
  assessmentRatingType:
    | 'issue_breach_log_type'
    | 'issue_consumer_duty_type'
    | 'issue_customer_trust_type'
    | 'issue_gdpr_breach_log_type'
    | 'issue_pci_breach_log_type'
    | 'issue_risk_event_type'
    | 'issue_sar_log_type'
    | 'issue_type';
  assessmentRatingTypeTaxonomy:
    | 'issueBreachLogTypes'
    | 'issueConsumerDutyTypes'
    | 'issueCustomerTrustTypes'
    | 'issueGDPRBreachLogTypes'
    | 'issuePCIBreachLogTypes'
    | 'issueRiskEventTypes'
    | 'issueSARLogTypes'
    | 'issueTypes';
  featureFlag?: FeatureFlag;
  reportedSuccessfullyUrl: (sequentialId: string) => string;
};
export const IssueTypeMapping: {
  [key in ParentIssueType]: IssueTypeMapItem;
} = {
  [Parent_Type_Enum.Issue]: {
    type: Parent_Type_Enum.Issue,
    taxonomy: 'issues',
    assessmentTaxonomy: 'issueAssessment',
    entityLabel: 'issue_one',
    entityLabelOther: 'issue_other',
    assessmentType: Parent_Type_Enum.IssueAssessment,
    issueRegisterStorageKey: 'IssuesRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_type',
    assessmentRatingTypeTaxonomy: 'issueTypes',
    uriPath: 'issues',
    registerUrl: issueRegisterUrl,
    detailsUrl: issueDetailsUrl,
    featureFlag: undefined,
    count: 'issue',
    reportedSuccessfullyUrl: reportAnIssueSuccessUrl,
  },
  [Parent_Type_Enum.IssueRiskEvent]: {
    type: Parent_Type_Enum.IssueRiskEvent,
    taxonomy: 'issuesRiskEvents',
    assessmentTaxonomy: 'issueRiskEventAssessment',
    entityLabel: 'issueRiskEvent_one',
    entityLabelOther: 'issueRiskEvent_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentRiskEvent,
    issueRegisterStorageKey: 'IssueRiskEventsRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_risk_event_type',
    assessmentRatingTypeTaxonomy: 'issueRiskEventTypes',
    uriPath: 'risk-events',
    registerUrl: issueRiskEventRegisterUrl,
    detailsUrl: issueRiskEventDetailsUrl,
    featureFlag: 'issue-allica',
    count: 'issueRiskEvent',
    reportedSuccessfullyUrl: reportAnIssueRiskEventSuccessUrl,
  },
  [Parent_Type_Enum.IssueBreachLog]: {
    type: Parent_Type_Enum.IssueBreachLog,
    taxonomy: 'issuesBreachLog',
    assessmentTaxonomy: 'issueBreachLogAssessment',
    entityLabel: 'issueBreachLog_one',
    entityLabelOther: 'issueBreachLog_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentBreachLog,
    issueRegisterStorageKey: 'IssueBreachLogRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_breach_log_type',
    assessmentRatingTypeTaxonomy: 'issueBreachLogTypes',
    uriPath: 'breach-log',
    registerUrl: issueBreachLogRegisterUrl,
    detailsUrl: issueBreachLogDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issueBreachLog',
    reportedSuccessfullyUrl: reportAnIssueBreachSuccessUrl,
  },
  [Parent_Type_Enum.IssueConsumerDuty]: {
    type: Parent_Type_Enum.IssueConsumerDuty,
    taxonomy: 'issuesConsumerDuty',
    assessmentTaxonomy: 'issueConsumerDutyAssessment',
    entityLabel: 'issueConsumerDuty_one',
    entityLabelOther: 'issueConsumerDuty_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentConsumerDuty,
    issueRegisterStorageKey: 'IssueConsumerDutyRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_consumer_duty_type',
    assessmentRatingTypeTaxonomy: 'issueConsumerDutyTypes',
    uriPath: 'consumer-duty',
    registerUrl: issueConsumerDutyRegisterUrl,
    detailsUrl: issueConsumerDutyDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issueConsumerDuty',
    reportedSuccessfullyUrl: reportAnIssueConsumerDutySuccessUrl,
  },
  [Parent_Type_Enum.IssueCustomerTrust]: {
    type: Parent_Type_Enum.IssueCustomerTrust,
    taxonomy: 'issuesCustomerTrust',
    assessmentTaxonomy: 'issueCustomerTrustAssessment',
    entityLabel: 'issueCustomerTrust_one',
    entityLabelOther: 'issueCustomerTrust_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentCustomerTrust,
    issueRegisterStorageKey: 'IssueCustomerTrustRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_customer_trust_type',
    assessmentRatingTypeTaxonomy: 'issueCustomerTrustTypes',
    uriPath: 'customer-trust',
    registerUrl: issueCustomerTrustRegisterUrl,
    detailsUrl: issueCustomerTrustDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issueCustomerTrust',
    reportedSuccessfullyUrl: reportAnIssueCustomerTrustSuccessUrl,
  },
  [Parent_Type_Enum.IssueGdprBreachLog]: {
    type: Parent_Type_Enum.IssueGdprBreachLog,
    taxonomy: 'issuesGDPRBreachLog',
    assessmentTaxonomy: 'issueGDPRBreachLogAssessment',
    entityLabel: 'issueGDPRBreachLog_one',
    entityLabelOther: 'issueGDPRBreachLog_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentGdprBreachLog,
    issueRegisterStorageKey: 'IssueGDPRBreachLogRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_gdpr_breach_log_type',
    assessmentRatingTypeTaxonomy: 'issueGDPRBreachLogTypes',
    uriPath: 'gdpr-breach-log',
    registerUrl: issueGDPRBreachLogRegisterUrl,
    detailsUrl: issueGDPRBreachLogDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issueGDPRBreachLog',
    reportedSuccessfullyUrl: reportAnIssueGDPRBreachSuccessUrl,
  },
  [Parent_Type_Enum.IssuePciBreachLog]: {
    type: Parent_Type_Enum.IssuePciBreachLog,
    taxonomy: 'issuesPCIBreachLog',
    assessmentTaxonomy: 'issuePCIBreachLogAssessment',
    entityLabel: 'issuePCIBreachLog_one',
    entityLabelOther: 'issuePCIBreachLog_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentPciBreachLog,
    issueRegisterStorageKey: 'IssuePCIBreachLogRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_pci_breach_log_type',
    assessmentRatingTypeTaxonomy: 'issuePCIBreachLogTypes',
    uriPath: 'pci-breach-log',
    registerUrl: issuePCIBreachLogRegisterUrl,
    detailsUrl: issuePCIBreachLogDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issuePCIBreachLog',
    reportedSuccessfullyUrl: reportAnIssuePCIBreachSuccessUrl,
  },
  [Parent_Type_Enum.IssueSarLog]: {
    type: Parent_Type_Enum.IssueSarLog,
    taxonomy: 'issuesSARLog',
    assessmentTaxonomy: 'issueSARLogAssessment',
    entityLabel: 'issueSARLog_one',
    entityLabelOther: 'issueSARLog_other',
    assessmentType: Parent_Type_Enum.IssueAssessmentSarLog,
    issueRegisterStorageKey: 'IssueSARLogRegisterTable-PreferencesV1',
    assessmentRatingType: 'issue_sar_log_type',
    assessmentRatingTypeTaxonomy: 'issueSARLogTypes',
    uriPath: 'sar-log',
    registerUrl: issueSARLogRegisterUrl,
    detailsUrl: issueSARLogDetailsUrl,
    featureFlag: 'issue-gc',
    count: 'issueSARLog',
    reportedSuccessfullyUrl: reportAnIssueSARSuccessUrl,
  },
};
