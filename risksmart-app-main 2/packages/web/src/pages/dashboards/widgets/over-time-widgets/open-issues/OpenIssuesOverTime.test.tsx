import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { vitest } from 'vitest';

import { calculateOpenIssues } from './openIssuesOverTimeUtils';
describe('OpenIssuesOverTime', () => {
  vitest.useFakeTimers().setSystemTime(new Date('2023-07-01'));

  describe('calculateOpenIssues', () => {
    it('Returns number of open issues for last 6 months', () => {
      const result = calculateOpenIssues('month', [
        {
          ModifiedAtTimestamp: '2023-03-01T00:00:00.0000+00:00',
          Status: Issue_Assessment_Status_Enum.Open,
          ParentIssueId: '1',
          Action: 'UPDATE',
        },
        {
          ModifiedAtTimestamp: '2023-03-01T00:00:00.0000+00:00',
          Status: Issue_Assessment_Status_Enum.Open,
          ParentIssueId: '3',
          Action: 'UPDATE',
        },
      ]);
      expect(result).toEqual([
        {
          x: '2023-01-01',
          y: 0,
        },
        {
          x: '2023-02-01',
          y: 0,
        },
        {
          x: '2023-03-01',
          y: 2,
        },
        {
          x: '2023-04-01',
          y: 2,
        },
        {
          x: '2023-05-01',
          y: 2,
        },
        {
          x: '2023-06-01',
          y: 2,
        },
      ]);
    });
  });

  it('Takes into account issues that have status changes, showing open issues at end of month', () => {
    const result = calculateOpenIssues('month', [
      {
        ModifiedAtTimestamp: '2023-03-01T00:00:00.0000+00:00',
        Status: Issue_Assessment_Status_Enum.Open,
        ParentIssueId: '1',
        Action: 'UPDATE',
      },
      {
        ModifiedAtTimestamp: '2023-05-01T00:00:00.0000+00:00',
        Status: Issue_Assessment_Status_Enum.Closed,
        ParentIssueId: '1',
        Action: 'UPDATE',
      },
    ]);
    expect(result).toEqual([
      {
        x: '2023-01-01',
        y: 0,
      },
      {
        x: '2023-02-01',
        y: 0,
      },
      {
        x: '2023-03-01',
        y: 1,
      },
      {
        x: '2023-04-01',
        y: 1,
      },
      {
        x: '2023-05-01',
        y: 0,
      },
      {
        x: '2023-06-01',
        y: 0,
      },
    ]);
  });

  it(`Delete records don't count towards open issues`, () => {
    const result = calculateOpenIssues('month', [
      {
        ModifiedAtTimestamp: '2023-03-01T00:00:00.0000+00:00',
        Status: Issue_Assessment_Status_Enum.Open,
        ParentIssueId: '1',
        Action: 'UPDATE',
      },
      {
        ModifiedAtTimestamp: '2023-05-01T00:00:00.0000+00:00',
        Status: Issue_Assessment_Status_Enum.Open,
        ParentIssueId: '1',
        Action: 'DELETE',
      },
    ]);
    expect(result).toEqual([
      {
        x: '2023-01-01',
        y: 0,
      },
      {
        x: '2023-02-01',
        y: 0,
      },
      {
        x: '2023-03-01',
        y: 1,
      },
      {
        x: '2023-04-01',
        y: 1,
      },
      {
        x: '2023-05-01',
        y: 0,
      },
      {
        x: '2023-06-01',
        y: 0,
      },
    ]);
  });
});
