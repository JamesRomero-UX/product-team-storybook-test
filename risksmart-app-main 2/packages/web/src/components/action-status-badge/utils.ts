import { Action_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';

import type { ActionsStatusBadgeProps } from '@/components/action-status-badge/ActionsStatusBadge';

export const isActionStatusOverdue = ({
  item,
}: ActionsStatusBadgeProps): boolean => {
  const deadline = dayjs().subtract(1, 'day');

  return (
    (item.Status === Action_Status_Enum.Open ||
      item.Status === Action_Status_Enum.Pending) &&
    dayjs(item.DateDue).isBefore(deadline)
  );
};
