import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getIssues = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Issue,
    label: i18n.format(t('issue_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [
      ParentTypes.Issue,
      ParentTypes.IssueAssessment,
    ],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'issue',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'issue',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'issue',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'issue',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'issue',
          fieldId: 'Title',
        },
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'I-',
      },
      raised: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('issues.columns.raised'),
      },
      impactsCustomer: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue',
          fieldId: 'ImpactsCustomer',
        },
      },
      internalOrExternal: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'issues.isExternalIssue',
        formConfig: {
          formId: 'issue',
          fieldId: 'IsExternalIssue',
        },
      },
      dateOccurred: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'issue',
          fieldId: 'DateOccurred',
        },
      },
      dateIdentified: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'issue',
          fieldId: 'DateIdentified',
        },
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('issues.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Issue,
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'issue',
          fieldId: 'Details',
        },
      },
      severity: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'severity',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'Severity',
        },
      },
      issueType: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'issueTypes',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'IssueType',
        },
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'issue_assessment_status',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'Status',
        },
      },
      targetCloseDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'TargetCloseDate',
        },
      },
      actualCloseDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'ActualCloseDate',
        },
      },
      regulatoryBreach: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'RegulatoryBreach',
        },
      },
      issueCausedByThirdParty: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'IssueCausedByThirdParty',
        },
      },
      issueCausedBySystemIssue: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'IssueCausedBySystemIssue',
        },
      },
      systemResponsible: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'SystemResponsible',
        },
      },
      policyBreach: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'PolicyBreach',
        },
      },
      policyOwnerCommentary: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'PolicyOwnerCommentary',
        },
      },
      rationale: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'Rationale',
        },
      },
      reportable: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        formConfig: {
          formId: 'issue_assessment',
          fieldId: 'Reportable',
        },
      },
      type: {
        dataType: 'text',
        displayType: 'issueVariantName',
        defaultLabel: t('issues.columns.variant'),
      },
    },
  }) as const satisfies SharedDataset;
