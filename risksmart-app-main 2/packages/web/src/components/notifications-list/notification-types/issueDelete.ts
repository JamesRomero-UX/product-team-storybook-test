import i18n from '@risksmart-app/i18n/src/i18n';

import { auditItemSearch } from '@/utils/urls';

import { getFriendlyIssueId, getIssueMessage } from './issueUtils';
import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const issueId = item.data?.objectId ?? item.data?.issueId;
  const issue = lookupData.issues?.[issueId];
  const issuePathFragment = item.data?.issuePath ?? 'issues';

  return {
    message: getIssueMessage(
      issuePathFragment,
      'Delete',
      issue?.SequentialId && issue?.Title
        ? `${issue?.Title}`
        : i18n.t('notifications.unknown')
    ),
    url: issue ? auditItemSearch(issue.Id) : null,
    id: `${getFriendlyIssueId(issuePathFragment, issue?.SequentialId ?? 0)}`,
  };
};
