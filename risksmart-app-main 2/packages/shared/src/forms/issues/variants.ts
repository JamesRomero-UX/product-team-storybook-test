import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';

import type { IssueAssessmentTaxonomyKeys, IssueTaxonomyKeys } from './types';
interface IssueTypeTaxonomyItem {
  taxonomy: IssueTaxonomyKeys;
  assessmentTaxonomy: IssueAssessmentTaxonomyKeys;
}

export const issueTypeTaxonomy: {
  [key in ParentIssueType]: IssueTypeTaxonomyItem;
} = {
  [ParentTypes.Issue]: {
    taxonomy: 'issues',
    assessmentTaxonomy: 'issueAssessment',
  },
  [ParentTypes.IssueRiskEvent]: {
    taxonomy: 'issuesRiskEvents',
    assessmentTaxonomy: 'issueRiskEventAssessment',
  },
  [ParentTypes.IssueBreachLog]: {
    taxonomy: 'issuesBreachLog',
    assessmentTaxonomy: 'issueBreachLogAssessment',
  },
  [ParentTypes.IssueConsumerDuty]: {
    taxonomy: 'issuesConsumerDuty',
    assessmentTaxonomy: 'issueConsumerDutyAssessment',
  },
  [ParentTypes.IssueCustomerTrust]: {
    taxonomy: 'issuesCustomerTrust',
    assessmentTaxonomy: 'issueCustomerTrustAssessment',
  },
  [ParentTypes.IssueGdprBreachLog]: {
    taxonomy: 'issuesGDPRBreachLog',
    assessmentTaxonomy: 'issueGDPRBreachLogAssessment',
  },
  [ParentTypes.IssuePciBreachLog]: {
    taxonomy: 'issuesPCIBreachLog',
    assessmentTaxonomy: 'issuePCIBreachLogAssessment',
  },
  [ParentTypes.IssueSarLog]: {
    taxonomy: 'issuesSARLog',
    assessmentTaxonomy: 'issueSARLogAssessment',
  },
};
