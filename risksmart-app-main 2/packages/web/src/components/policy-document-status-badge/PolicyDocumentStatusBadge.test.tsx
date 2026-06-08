import i18n from '@risksmart-app/i18n/src/i18n';
import { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import PolicyDocumentStatusBadge from 'src/components/policy-document-status-badge/PolicyDocumentStatusBadge';

const wrapper = ({ children }: PropsWithChildren) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const getStatus = (key: string) => {
  const ratings = i18n.t('ratings:document_file_status', {
    returnObjects: true,
  });

  return (
    ratings.find(
      (rating: { label: string; value: string }) => rating.value === key
    )?.label ?? ''
  );
};

describe('PolicyDocumentStatusBadge', () => {
  it.each([
    {
      status: Version_Status_Enum.Draft,
      expectedStatus: getStatus('draft'),
    },
    {
      status: Version_Status_Enum.PendingApproval,
      expectedStatus: getStatus('pending_approval'),
    },
    {
      status: Version_Status_Enum.Published,
      expectedStatus: getStatus('published'),
    },
    {
      status: Version_Status_Enum.Archived,
      expectedStatus: getStatus('archived'),
    },
  ])(
    'Should render the correct status $expectedStatus for $status',
    async ({ status, expectedStatus }) => {
      const screen = render(
        <PolicyDocumentStatusBadge
          item={{
            Status: status,
          }}
          changeRequests={[]}
        />,
        {
          wrapper,
        }
      );
      const renderedStatus = await screen.findByText(expectedStatus);
      expect(renderedStatus).toBeInTheDocument();
    }
  );

  it('should show Published (not Review due) regardless of review date', async () => {
    const screen = render(
      <PolicyDocumentStatusBadge
        item={{
          Status: Version_Status_Enum.Published,
        }}
        changeRequests={[]}
      />,
      {
        wrapper,
      }
    );
    const renderedStatus = await screen.findByText(getStatus('published'));
    expect(renderedStatus).toBeInTheDocument();
  });
});
