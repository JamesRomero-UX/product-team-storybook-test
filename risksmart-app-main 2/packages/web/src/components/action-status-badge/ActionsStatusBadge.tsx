import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { type ActionTableFields } from 'src/pages/actions/types';

import { EMPTY_CELL } from '@/utils/collectionUtils';

import { isActionStatusOverdue } from './utils';

export type ActionsStatusBadgeProps = {
  item: Pick<ActionTableFields, 'DateDue' | 'Status'>;
};

const ActionsStatusBadge = ({ item }: ActionsStatusBadgeProps) => {
  const status = useRating('action_status');

  const overdueStatus = status.getByValue('overdue');

  const rating = isActionStatusOverdue({ item })
    ? overdueStatus
    : status.getByValue(item.Status);

  return rating ? <SimpleRatingBadge rating={rating} /> : EMPTY_CELL;
};

export default ActionsStatusBadge;
