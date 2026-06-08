import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Attestation_Record_Status_Enum,
  Document_File_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';

import { defaultMocks } from '../../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { DocumentFile } from './types';
import { getWrapper, Providers } from 'src/testing/wrapper';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { vi } from 'vitest';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

vi.mock('@/hooks/useIsFeatureFlagEnabled', () => ({
  useIsFeatureFlagEnabled: vi.fn(),
}));

describe('public policies config', () => {
  const defaultFile: DocumentFile = {
    CreatedAtTimestamp: '',
    CreatedByUser: '',
    Id: '123',
    ModifiedAtTimestamp: '',
    Summary: 'Doc summary',
    ModifiedByUser: '',
    ParentDocumentId: '',
    Status: 'archived',
    Version: '1.1',
    Type: Document_File_Type_Enum.Html,
    NextReviewDate: '2024-03-04T17:42:20.943159+00:00',
    ReviewDate: '2024-03-05T17:42:20.943159+00:00',
    attestations: [],
    parent: {
      departments: [],
      DocumentType: 'policy',
      Title: 'Anti-Discrimination',

      ownerGroups: [],
      owners: [
        {
          UserId: 'auth0|64415100c3a961d2784456ce',
          user: {
            FriendlyName: 'user1',
            Id: 'auth0|64415100c3a961d2784456ce',
            __typename: 'user',
          },
          __typename: 'owner',
        },
      ],
      __typename: 'document',
    },
  };

  const TestHarness: FC<{ records: DocumentFile[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('publicPolicyRegister'),
    mockedGetOrganisation(),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Document,
      Parent_Type_Enum.DocumentFile,
    ]),
  ];

  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 10 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(10);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Title',
        'Version',
        'Type',
        'Status',
        'Attestation status',
        'Summary',
        'Owners',
        'Last reviewed date',
        'Next review due',
        'Updated on',
      ]);
    });

    it('should have the option to display 12 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(12);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'Title',
        'Version',
        'Type',
        'Status',
        'Attestation status',
        'Summary',
        'Owners',
        'Last reviewed date',
        'Next review due',
        'Updated on',
        'Departments',
        'Last published date',
      ]);
    });

    it('show render correct columns', async () => {
      const { container } = render(<TestHarness records={[defaultFile]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);

      expect(getCellText(container, 'Title', 1)).toEqual('Anti-Discrimination');
      expect(getCellText(container, 'Version', 1)).toEqual('1.1');
      expect(getCellText(container, 'Type', 1)).toEqual('Policy');
      expect(getCellText(container, 'Status', 1)).toEqual('Archived');
      expect(getCellText(container, 'Attestation status', 1)).toEqual('-');
      expect(getCellText(container, 'Summary', 1)).toEqual('Doc summary');
      expect(getCellText(container, 'Owners', 1)).toEqual('user1');
      expect(getCellText(container, 'Last reviewed date', 1)).toEqual(
        '5 Mar 2024'
      );
      expect(getCellText(container, 'Next review due', 1)).toEqual(
        '4 Mar 2024'
      );
    });

    it.each([
      {
        AttestationStatus: Attestation_Record_Status_Enum.Attested,
        ExpiresAt: '2099-01-01',
        expectedColumnText: 'Attested',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.Expired,
        ExpiresAt: '2099-01-01',
        expectedColumnText: 'Expired',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.NotRequired,
        ExpiresAt: '2099-01-01',
        expectedColumnText: 'Not required',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.Pending,
        ExpiresAt: '2099-01-01',
        expectedColumnText: 'Pending',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.Pending,
        ExpiresAt: '2099-01-01',
        expectedColumnText: 'Pending',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.Pending,
        ExpiresAt: '2000-01-01',
        expectedColumnText: 'Expired',
      },
      {
        AttestationStatus: Attestation_Record_Status_Enum.Pending,
        ExpiresAt: '2000-01-01',
        expectedColumnText: 'Overdue',
        features: ['attestation_improvements'],
        viewStatus: 'overdue',
      },
    ])(
      'show render the attestation column text $expectedColumnText for status $AttestationStatus that expires on $ExpiresAt',
      async ({
        AttestationStatus,
        ExpiresAt,
        expectedColumnText,
        features,
        viewStatus,
      }) => {
        const mockUseIsFeatureFlagEnabled = vi.mocked(useIsFeatureFlagEnabled);

        mockUseIsFeatureFlagEnabled.mockImplementation((feature) => {
          return features?.includes(feature) ?? false;
        });

        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultFile,
                attestations: [
                  {
                    AttestationStatus: AttestationStatus,
                    attestationRecordStatus: viewStatus
                      ? { Status: viewStatus }
                      : undefined,
                    ExpiresAt: ExpiresAt,
                    Active: true,
                  },
                ],
              },
            ]}
          />,
          {
            wrapper: getWrapper(testMocks, ...providers),
          }
        );
        await waitForTableHeaders(container);

        expect(getCellText(container, 'Attestation status', 1)).toEqual(
          expectedColumnText
        );
      }
    );
  });
});
