import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';

import type { IssuesStatusBadgeProps } from '@/components/issues-status-badge/IssuesStatusBadge';

export const isIssueStatusOverdue = ({
  item,
}: IssuesStatusBadgeProps): boolean => {
  const deadline = dayjs().subtract(1, 'day');

  return (
    (item.Status === Issue_Assessment_Status_Enum.Open ||
      item.Status === Issue_Assessment_Status_Enum.Pending) &&
    dayjs(item.TargetCloseDate).isBefore(deadline)
  );
};
