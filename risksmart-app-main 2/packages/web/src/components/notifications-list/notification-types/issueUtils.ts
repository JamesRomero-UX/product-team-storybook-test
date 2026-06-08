import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import {
  issueBreachLogDetailsUrl,
  issueConsumerDutyDetailsUrl,
  issueCustomerTrustDetailsUrl,
  issueDetailsUrl,
  issueGDPRBreachLogDetailsUrl,
  issuePCIBreachLogDetailsUrl,
  issueRiskEventDetailsUrl,
  issueSARLogDetailsUrl,
} from '@/utils/urls';

// Hack to get the issue URL based on the path fragment, could build url here but would miss urls.ts refactoring.
// Need to remove this with notifications v2
export const getIssueUrl = (
  issuePathFragment:
    | 'breach-log'
    | 'consumer-duty'
    | 'customer-trust'
    | 'gdpr-breach-log'
    | 'issues'
    | 'pci-breach-log'
    | 'risk-events'
    | 'sar-log',
  id: string
): string => {
  switch (issuePathFragment) {
    case 'issues':
      return issueDetailsUrl(id);
    case 'breach-log':
      return issueBreachLogDetailsUrl(id);
    case 'gdpr-breach-log':
      return issueGDPRBreachLogDetailsUrl(id);
    case 'pci-breach-log':
      return issuePCIBreachLogDetailsUrl(id);
    case 'sar-log':
      return issueSARLogDetailsUrl(id);
    case 'consumer-duty':
      return issueConsumerDutyDetailsUrl(id);
    case 'customer-trust':
      return issueCustomerTrustDetailsUrl(id);
    case 'risk-events':
      return issueRiskEventDetailsUrl(id);
    default:
      return issueDetailsUrl(id);
  }
};

export const getFriendlyIssueId = (
  issuePathFragment:
    | 'breach-log'
    | 'consumer-duty'
    | 'customer-trust'
    | 'gdpr-breach-log'
    | 'issues'
    | 'pci-breach-log'
    | 'risk-events'
    | 'sar-log',
  sequentialId: number
): string => {
  switch (issuePathFragment) {
    case 'issues':
      return getFriendlyId(Parent_Type_Enum.Issue, sequentialId);
    case 'breach-log':
      return getFriendlyId(Parent_Type_Enum.IssueBreachLog, sequentialId);
    case 'gdpr-breach-log':
      return getFriendlyId(Parent_Type_Enum.IssueGdprBreachLog, sequentialId);
    case 'pci-breach-log':
      return getFriendlyId(Parent_Type_Enum.IssuePciBreachLog, sequentialId);
    case 'sar-log':
      return getFriendlyId(Parent_Type_Enum.IssueSarLog, sequentialId);
    case 'consumer-duty':
      return getFriendlyId(Parent_Type_Enum.IssueConsumerDuty, sequentialId);
    case 'customer-trust':
      return getFriendlyId(Parent_Type_Enum.IssueCustomerTrust, sequentialId);
    case 'risk-events':
      return getFriendlyId(Parent_Type_Enum.IssueRiskEvent, sequentialId);
    default:
      return getFriendlyId(Parent_Type_Enum.Issue, sequentialId);
  }
};

export const getIssueMessage = (
  issuePathFragment:
    | 'breach-log'
    | 'consumer-duty'
    | 'customer-trust'
    | 'gdpr-breach-log'
    | 'issues'
    | 'pci-breach-log'
    | 'risk-events'
    | 'sar-log',
  op: 'Delete' | 'Due' | 'Insert' | 'Overdue' | 'Update',
  title: string
): null | string => {
  if (issuePathFragment === 'issues') {
    return i18n.t(`notifications.messages.issue${op}`, { title });
  } else {
    return i18n.t(`notifications.messages.issue_${issuePathFragment}_${op}`, {
      title,
    });
  }
};
