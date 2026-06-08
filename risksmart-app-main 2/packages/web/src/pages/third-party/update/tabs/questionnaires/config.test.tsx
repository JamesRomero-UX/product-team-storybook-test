import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Third_Party_Response_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import {
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { useGetCollectionTableProps } from './config';
import type { ThirdPartyResponseFields } from './types';

const mockRecords: ThirdPartyResponseFields[] = [
  {
    Id: '1',
    invitees: [
      {
        UserEmail: 'Email address',
      },
    ],
    ParentId: '1',
    Status: Third_Party_Response_Status_Enum.InProgress,
    CreatedAtTimestamp: '2024-10-17T15:12:56.852Z',
    ModifiedAtTimestamp: '2024-10-17T15:12:56.852Z',
    ResponseData: {},
    QuestionnaireTemplateVersionId: '1',
    questionnaireTemplateVersion: {
      Id: '1',
      parent: {
        Title: 'ok',
      },
      Version: '1',
    },
    createdByUser: {
      FriendlyName: 'ok',
    },
    modifiedByUser: {
      FriendlyName: 'bye',
    },
  },
];
const providers: Providers[] = [
  'permission',
  'graphql',
  'router',
  'features',
  'trpc',
];

describe('questionnaire invites config', () => {
  describe('useGetCollectionTableProps', () => {
    const TestHarness: FC<{
      records: ThirdPartyResponseFields[];
    }> = ({ records }) => {
      const tableProps = useGetCollectionTableProps(records);

      return <Table {...tableProps} />;
    };

    const testMocks = [...defaultMocks, mockedGetOrganisation()];

    it('should display 5 columns by default', async () => {
      const { container } = render(<TestHarness records={mockRecords} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });

      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );

      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Response',
        'Version',
        'Email address',
        'Status',
      ]);
    });

    it('should have the option to display 9 fields', async () => {
      const { container } = render(<TestHarness records={mockRecords} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });

      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );

      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(10);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Response',
        'Version',
        'Email address',
        'Start date',
        'Status',
        'Expire by',
        'Created on',
        'Updated on',
        'Created by',
        'Updated by',
      ]);
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(
        () => {
          expect(getEmptyCollectionSlotText(container, 0)).toEqual(
            'No Questionnaire Invitations'
          );
          expect(getEmptyCollectionSlotText(container, 1)).toEqual(
            'No questionnaire invitations to display.'
          );
        },
        { timeout: 5000 }
      );
    });
  });
});
