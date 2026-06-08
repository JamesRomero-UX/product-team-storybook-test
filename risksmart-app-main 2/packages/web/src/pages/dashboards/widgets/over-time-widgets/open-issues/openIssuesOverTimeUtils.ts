import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export const calculateOpenIssues = (
  interval: 'day' | 'month',
  issues?: {
    Status?: null | string;
    ParentIssueId: string;
    ModifiedAtTimestamp: string;
    Action?: null | string;
  }[],
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (!issues) {
    return undefined;
  }
  // Get last entry for each issue before date x
  const issueStatus: {
    [issueId: string]: null | string | undefined;
  } = {};
  const results: { x: string; y: number }[] = [];
  const minDate = startDate
    ? dayjs(startDate)
    : dayjs().startOf(interval).subtract(6, 'month');
  let nextInterval = minDate;

  for (const issue of issues) {
    const lastModified = dayjs(issue.ModifiedAtTimestamp);
    while (lastModified.isAfter(dayjs(nextInterval), interval)) {
      results.push(countOpenIssues(nextInterval, issueStatus));
      nextInterval = nextInterval.add(1, interval);
    }
    if (issue.Action === 'DELETE') {
      delete issueStatus[issue.ParentIssueId];
    } else {
      issueStatus[issue.ParentIssueId] = issue.Status;
    }
  }
  results.push(countOpenIssues(nextInterval, issueStatus));
  nextInterval = nextInterval.add(1, interval);

  const end = endDate ? dayjs(endDate) : dayjs();
  while (end.isAfter(dayjs(nextInterval), interval)) {
    results.push(countOpenIssues(nextInterval, issueStatus));
    nextInterval = nextInterval.add(1, interval);
  }

  return results;
};

const countOpenIssues = (
  date: Dayjs,
  issueStatus: {
    [issueId: string]: null | string | undefined;
  }
) => {
  // save previous result
  let openIssueCount = 0;
  const issueIds = Object.keys(issueStatus);
  for (const currentIssueId of issueIds) {
    if (issueStatus[currentIssueId] === Issue_Assessment_Status_Enum.Open) {
      openIssueCount++;
    } else {
      delete issueStatus[currentIssueId];
    }
  }

  return {
    x: date.startOf('day').format('YYYY-MM-DD'),
    y: openIssueCount,
  };
};
