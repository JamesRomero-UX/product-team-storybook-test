import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { type IssueRegisterFields } from 'src/pages/issues/types';

import { EMPTY_CELL } from '@/utils/collectionUtils';

import { isIssueStatusOverdue } from './utils';

export type IssuesStatusBadgeProps = {
  item: Pick<IssueRegisterFields, 'Status' | 'TargetCloseDate'>;
};

const IssuesStatusBadge = ({ item }: IssuesStatusBadgeProps) => {
  const status = useRating('issue_assessment_status');

  const overdueStatus = status.getByValue('overdue');

  const rating = isIssueStatusOverdue({ item })
    ? overdueStatus
    : status.getByValue(item.Status);

  return rating ? <SimpleRatingBadge rating={rating} /> : EMPTY_CELL;
};

export default IssuesStatusBadge;
