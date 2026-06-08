import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';

import { issueTypeTaxonomy } from '../issues/variants';
import type { FormConfig } from '../types';

export const getIssueAssessmentFormConfig = (
  parentIssueType: ParentIssueType
) => {
  const taxonomyLookup = issueTypeTaxonomy[parentIssueType];
  const assessmentTaxonomy = taxonomyLookup.assessmentTaxonomy;
  const taxonomy = taxonomyLookup.taxonomy;

  return {
    IssueType: {
      fieldId: 'IssueType',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.IssueType`),
      columnHeader: i18n.t(`${taxonomy}.columns.type`),
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'issueTypes',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`fields.Status`), // From shared i18n
      columnHeader: i18n.t(`${taxonomy}.columns.status`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'rating',
        ratingKey: 'issue_assessment_status',
      },
    },
    Severity: {
      fieldId: 'Severity',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.Severity`),
      columnHeader: i18n.t(`${taxonomy}.columns.severity`),
      displayType: { displayType: 'rating', ratingKey: 'severity' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    TargetCloseDate: {
      fieldId: 'TargetCloseDate',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.TargetCloseDate`),
      columnHeader: i18n.t(`${taxonomy}.columns.target_close_date`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    ActualCloseDate: {
      fieldId: 'ActualCloseDate',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.ActualCloseDate`),
      columnHeader: i18n.t(`${taxonomy}.columns.actual_close_date`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    AssociatedControlIds: {
      fieldId: 'AssociatedControlIds',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.AssociatedControls`),
    },
    CertifiedIndividual: {
      fieldId: 'CertifiedIndividual',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.CertifiedIndividual`),
      columnHeader: i18n.t(`${taxonomy}.columns.certified_individual`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    RegulatoryBreach: {
      fieldId: 'RegulatoryBreach',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.RegulatoryBreach`),
      columnHeader: i18n.t(`${taxonomy}.columns.regulatory_breach`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
    },
    RegulationsBreached: {
      fieldId: 'RegulationsBreached',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.RegulationsBreached`),
      columnHeader: i18n.t(`${taxonomy}.columns.regulations_breached`),
      visibilityControlledByFieldId: 'RegulatoryBreach',
    },
    RegulationsBreachedIds: {
      fieldId: 'RegulationsBreachedIds',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.RegulationsBreached`),
      columnHeader: i18n.t(`${taxonomy}.columns.regulations_breached`),
      visibilityControlledByFieldId: 'RegulatoryBreach',
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`fields.Departments`), // From shared i18n
      columnHeader: i18n.t(`${taxonomy}.columns.assessment_departments`),
      displayType: {
        displayType: 'departments',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    PolicyBreach: {
      fieldId: 'PolicyBreach',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.PolicyBreach`),
      columnHeader: i18n.t(`${taxonomy}.columns.policy_breach`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
    },
    PoliciesBreached: {
      fieldId: 'PoliciesBreached',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.PoliciesBreached`),
      columnHeader: i18n.t(`${taxonomy}.columns.policies_breached`),
      visibilityControlledByFieldId: 'PolicyBreach',
    },
    PoliciesBreachedIds: {
      fieldId: 'PoliciesBreachedIds',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.PoliciesBreached`),
      columnHeader: i18n.t(`${taxonomy}.columns.policies_breached`),
      visibilityControlledByFieldId: 'PolicyBreach',
    },
    PolicyOwner: {
      fieldId: 'PolicyOwner',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.PolicyOwner`),
      columnHeader: i18n.t(`${taxonomy}.columns.policy_owner`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      visibilityControlledByFieldId: 'PolicyBreach',
    },
    PolicyOwnerCommentary: {
      fieldId: 'PolicyOwnerCommentary',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.PolicyOwnerCommentary`),
      columnHeader: i18n.t(`${taxonomy}.columns.policy_owner_commentary`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      visibilityControlledByFieldId: 'PolicyBreach',
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`fields.Tags`), // From shared i18n
      displayType: {
        displayType: 'tags',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    IssueCausedBySystemIssue: {
      fieldId: 'IssueCausedBySystemIssue',
      formLabel: i18n.t(
        `${assessmentTaxonomy}.fields.IssueCausedBySystemIssue`
      ),
      columnHeader: i18n.t(`${taxonomy}.columns.caused_by_system_issue`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
    },
    SystemResponsible: {
      fieldId: 'SystemResponsible',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.SystemResponsible`),
      columnHeader: i18n.t(`${taxonomy}.columns.system_responsible`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      visibilityControlledByFieldId: 'IssueCausedBySystemIssue',
    },
    Reportable: {
      fieldId: 'Reportable',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.Reportable`),
      columnHeader: i18n.t(`${taxonomy}.columns.reportable`),
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
      visibilityControlledByFieldId: 'RegulatoryBreach',
    },
    Rationale: {
      fieldId: 'Rationale',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.Rationale`),
      columnHeader: i18n.t(`${taxonomy}.columns.rationale`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      visibilityControlledByFieldId: 'RegulatoryBreach',
    },
    IssueCausedByThirdParty: {
      fieldId: 'IssueCausedByThirdParty',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.IssueCausedByThirdParty`),
      columnHeader: i18n.t(`${taxonomy}.columns.issue_caused_by_third_party`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
    },
    ThirdPartyResponsible: {
      fieldId: 'ThirdPartyResponsible',
      formLabel: i18n.t(`${assessmentTaxonomy}.fields.ThirdPartyResponsible`),
      columnHeader: i18n.t(`${taxonomy}.columns.third_party_responsible`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      visibilityControlledByFieldId: 'IssueCausedByThirdParty',
    },
  } as const satisfies FormConfig;
};
