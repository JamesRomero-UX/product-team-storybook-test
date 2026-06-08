import dayjs from 'dayjs';

export const REVIEW_DUE_WINDOW_DAYS = 30;

const VERSION_STATUS_SORT_ORDER: Record<string, number> = {
  draft: 0,
  pending_approval: 1,
  published: 2,
  archived: 3,
};

/**
 * Returns a numeric sort key for a version status value.
 * Sort order: Draft (0) → Pending Approval (1) → Published (2) → Archived (3)
 */
export const getVersionStatusSortKey = (
  status: string | null | undefined
): number => {
  if (!status) {
    return -1;
  }

  return VERSION_STATUS_SORT_ORDER[status] ?? -1;
};

export type ReviewStatusValue = 'not_set' | 'not_due' | 'due' | 'overdue';

export type ReviewStatusResult = {
  value: ReviewStatusValue;
  sortKey: number;
};

/**
 * Computes the review status of a policy based on its next review date.
 *
 * Boundaries (day-granularity):
 * - Review date < today → overdue
 * - Review date = today → due
 * - Review date ≤ today + 30 days → due
 * - Review date > today + 30 days → not_due
 * - No date or archived → not_set
 */
export const getReviewStatus = (
  nextReviewDate: string | null | undefined,
  isArchived: boolean
): ReviewStatusResult => {
  if (isArchived || !nextReviewDate) {
    return { value: 'not_set', sortKey: 0 };
  }

  const today = dayjs().startOf('day');
  const reviewDate = dayjs(nextReviewDate).startOf('day');

  if (reviewDate.isBefore(today)) {
    return { value: 'overdue', sortKey: 3 };
  }

  const cutoff = today.add(REVIEW_DUE_WINDOW_DAYS, 'days');
  if (reviewDate.isAfter(cutoff)) {
    return { value: 'not_due', sortKey: 1 };
  }

  return { value: 'due', sortKey: 2 };
};
