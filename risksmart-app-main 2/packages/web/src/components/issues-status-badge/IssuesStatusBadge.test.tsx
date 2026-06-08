import i18n from '@risksmart-app/i18n/src/i18n';
import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import dayjs from 'dayjs';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import IssuesStatusBadge from '@/components/issues-status-badge/IssuesStatusBadge';

const wrapper = ({ children }: PropsWithChildren) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const getStatus = (key: string) => {
  const ratings = i18n.t('ratings:issue_assessment_status', {
    returnObjects: true,
  });

  return (
    ratings.find(
      (rating: { label: string; value: string }) => rating.value === key
    )?.label ?? ''
  );
};

describe('IssuesStatusBadge', () => {
  it.each([
    {
      status: Issue_Assessment_Status_Enum.Pending,
      targetCloseDate: dayjs().toISOString(),
      expectedStatus: getStatus('pending'),
    },
    {
      status: Issue_Assessment_Status_Enum.Open,
      targetCloseDate: dayjs().toISOString(),
      expectedStatus: getStatus('open'),
    },
    {
      status: Issue_Assessment_Status_Enum.Closed,
      targetCloseDate: dayjs().toISOString(),
      expectedStatus: getStatus('closed'),
    },
    {
      status: Issue_Assessment_Status_Enum.Open,
      targetCloseDate: dayjs().subtract(1, 'day').toISOString(),
      expectedStatus: 'Overdue',
    },
  ])(
    'Should render the correct status - $expectedStatus',
    async ({ status, targetCloseDate, expectedStatus }) => {
      const screen = render(
        <IssuesStatusBadge
          item={{
            Status: status,
            TargetCloseDate: targetCloseDate,
          }}
        />,
        {
          wrapper,
        }
      );

      const renderedStatus = await screen.findByText(expectedStatus);
      expect(renderedStatus).toBeInTheDocument();
    }
  );
});
