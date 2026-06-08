import {
  GetIssueByIdDocument,
  GetIssueParentIdsDocument,
  ParentTypeEnum,
} from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { SendNotificationsOptions } from './utilities';
const logger = getLogger();

export const getIssueById = async ({
  parentIssueId: parentIssueId,
  tenant,
}: {
  parentIssueId: string;
  tenant: string;
}) => {
  logger.info('Requesting issue for', parentIssueId);
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetIssueByIdDocument,
    variables: {
      Id: parentIssueId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get issue');
  }

  if (!data.issue_by_pk) {
    throw new Error('Issue not found');
  }

  return data.issue_by_pk;
};

export const getIssueParentIds = async ({
  issueId,
  tenant,
}: {
  issueId: string;
  tenant: string;
}): Promise<string[]> => {
  logger.info('Requesting issue parent IDs', { issueId });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetIssueParentIdsDocument,
    variables: {
      IssueId: issueId,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get issue parent IDs');
  }

  return data.issue_parent.map((p) => p.ParentId);
};

export const isIssueBaseType = (type: string): boolean => {
  return (
    type === ParentTypeEnum.Issue ||
    type === ParentTypeEnum.IssueBreachLog ||
    type === ParentTypeEnum.IssueConsumerDuty ||
    type === ParentTypeEnum.IssueCustomerTrust ||
    type === ParentTypeEnum.IssueGdprBreachLog ||
    type === ParentTypeEnum.IssuePciBreachLog ||
    type === ParentTypeEnum.IssueRiskEvent ||
    type === ParentTypeEnum.IssueSarLog
  );
};

export const getSendNotificationsOptionsForIssueSubTypes = (
  type: string
): SendNotificationsOptions => {
  if (isIssueBaseType(type)) {
    return {
      extraData: {
        issuePath: getIssueBaseTypePathFragment(type),
        issueTypeText: getIssueBaseTypeText(type),
      },
    };
  }

  return {};
};

export const getIssueBaseTypePathFragment = (type: string): string => {
  switch (type) {
    case ParentTypeEnum.Issue:
      return 'issues';
    case ParentTypeEnum.IssueBreachLog:
      return 'breach-log';
    case ParentTypeEnum.IssueConsumerDuty:
      return 'consumer-duty';
    case ParentTypeEnum.IssueCustomerTrust:
      return 'customer-trust';
    case ParentTypeEnum.IssueGdprBreachLog:
      return 'gdpr-breach-log';
    case ParentTypeEnum.IssuePciBreachLog:
      return 'pci-breach-log';
    case ParentTypeEnum.IssueRiskEvent:
      return 'risk-events';
    case ParentTypeEnum.IssueSarLog:
      return 'sar-log';
    default:
      throw new Error(`Unsupported issue base type: ${type}`);
  }
};

export const getIssueBaseTypeText = (type: string): string => {
  switch (type) {
    case ParentTypeEnum.Issue:
      return 'Issue';
    case ParentTypeEnum.IssueBreachLog:
      return 'Breach Log';
    case ParentTypeEnum.IssueConsumerDuty:
      return 'Consumer Duty';
    case ParentTypeEnum.IssueCustomerTrust:
      return 'Customer Trust';
    case ParentTypeEnum.IssueGdprBreachLog:
      return 'GDPR Breach Log';
    case ParentTypeEnum.IssuePciBreachLog:
      return 'PCI Breach Log';
    case ParentTypeEnum.IssueRiskEvent:
      return 'Risk Event';
    case ParentTypeEnum.IssueSarLog:
      return 'SAR Log';
    default:
      throw new Error(`Unsupported issue base type: ${type}`);
  }
};
