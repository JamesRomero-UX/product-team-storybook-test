import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useGetRegisterTableProps } from './config';
import type { AttestationFlatField } from './types';

describe('Attestation config', () => {
  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

  beforeEach(() => {
    window.localStorage.clear();
    // mock time date.
    vi.setSystemTime(mockDate);
  });

  const defaultAttestation: AttestationFlatField = {
    Active: false,
    CreatedAtTimestamp: '',
    AttestationStatus: 'attested',
    UserId: '',
    NodeId: '',
    user: {
      __typename: undefined,
      Id: '',
      FriendlyName: undefined,
      Email: undefined,
    },
    node: {
      __typename: undefined,
      documentFile: undefined,
    },
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];
  const mocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('attestationRegister'),
  ];

  describe('useGetRegisterTableProps', () => {
    const TestHarness: FC<{ records: AttestationFlatField[] }> = ({
      records,
    }) => {
      const tableProps = useGetRegisterTableProps(records);

      return <Table {...tableProps} />;
    };

    it('should display 7 columns by default', async () => {
      const { container } = render(
        <TestHarness records={[defaultAttestation]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'User',
        'Document',
        'Active',
        'Status',
        'Created on',
        'Attested at',
        'Expires at',
      ]);
    });

    it('should have the option to display 8 fields', async () => {
      const { container } = render(
        <TestHarness records={[defaultAttestation]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(8);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'User',
        'Document',
        'Active',
        'Status',
        'Created on',
        'Attested at',
        'Expires at',
        'Transferred from',
      ]);
    });

    it('should display correct column data', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultAttestation,
              user: {
                FriendlyName: 'User 1 name',
                Id: '123',
              },
              CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
              ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
              AttestationStatus: Attestation_Record_Status_Enum.Pending,
              Active: true,
              AttestedAt: '2023-01-17T18:41:58.03502+00:00',
              node: {
                documentFile: {
                  Id: '345',
                  Version: '2.2',
                  parent: {
                    Title: 'Document Name',
                    Id: '568',
                  },
                },
              },
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'User', 1)).toEqual('User 1 name');
      expect(getCellText(container, 'Document', 1)).toEqual(
        'Document Name (2.2)'
      );
      expect(getCellText(container, 'Active', 1)).toEqual('Yes');
      expect(getCellText(container, 'Status', 1)).toEqual('Pending');
      expect(getCellText(container, 'Created on', 1)).toEqual(
        '15 Jan 2023, 17:41'
      );
      expect(getCellText(container, 'Attested at', 1)).toEqual(
        '17 Jan 2023, 18:41'
      );
      expect(getCellText(container, 'Expires at', 1)).toEqual(
        '15 Jan 2023, 12:41'
      );
    });
  });

  it('should support export in correct format', async () => {
    const { result } = renderHook(
      () =>
        useGetRegisterTableProps([
          {
            ...defaultAttestation,
            user: {
              FriendlyName: 'User 1 name',
              Id: '123',
            },
            CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
            ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
            AttestationStatus: Attestation_Record_Status_Enum.Pending,
            Active: true,
            AttestedAt: '2023-01-17T18:41:58.03502+00:00',
            node: {
              documentFile: {
                Id: '345',
                Version: '2.2',
                parent: {
                  Title: 'Document Name',
                  Id: '568',
                },
              },
            },
          },
        ]),
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await waitFor(() => expect(result.current.exportToCsvString).toBeDefined());
    const csv = result.current.exportToCsvString();
    expect(csv).toEqual(
      '"User","Document","Active","Status","Created on","Attested at","Expires at"\r\n' +
        '"User 1 name","Document Name (2.2)","Yes","Pending","15/01/2023 17:41","17/01/2023 18:41","15/01/2023 12:41"'
    );
  });
});
