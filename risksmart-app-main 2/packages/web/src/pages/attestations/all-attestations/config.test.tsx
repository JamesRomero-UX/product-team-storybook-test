import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getHeadersText,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import {
  buildAttestation,
  buildDocumentFile,
  buildUser,
  withDocument,
  withInitialValues,
  withUser,
} from 'test/attestation-builder';
import { vi } from 'vitest';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { defaultMocks } from '../../../testing/mock-data';
import type { AttestationFlatField } from '../types';
import { useGetRegisterTableProps } from './config';
vi.mock('@/hooks/useIsFeatureFlagEnabled');

describe('Attestation config', () => {
  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
    'i18n',
  ];
  beforeEach(() => {
    window.localStorage.clear();
    vi.setSystemTime(mockDate);
  });

  const mocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('attestationRegister'),
  ];

  describe('useGetAllRegisterTableProps', () => {
    const TestHarness: FC<{ records: AttestationFlatField[] }> = ({
      records,
    }) => {
      const tableProps = useGetRegisterTableProps(records);

      return <Table {...tableProps} />;
    };

    it('should display 7 columns by default', async () => {
      const attestation = buildAttestation(
        withInitialValues({
          Active: true,
          AttestationStatus: 'pending',
          CreatedAtTimestamp: '2025-09-11T15:04:39.865338+00:00',
          ExpiresAt: '2025-12-15T14:56:05.246+00:00',
        }),
        withUser(buildUser({ FriendlyName: 'RiskManager1' })),
        withDocument(
          buildDocumentFile({ Title: 'Terms and conditions', Version: '0.1' })
        )
      );

      const { container } = render(<TestHarness records={[attestation]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Name',
        'Document',
        'Version',
        'Attestation status',
        'Cycle start date',
        'User due date',
        'User attested at',
      ]);
    });

    it('should display the correct information for an attestation', async () => {
      const attestation = buildAttestation(
        withInitialValues({
          Active: true,
          AttestationStatus: 'attested',
          CreatedAtTimestamp: '2025-09-09T15:04:39.865338+00:00',
          ExpiresAt: '2025-09-10T14:56:05.246+00:00',
          AttestedAt: '2025-09-09T14:56:05.246+00:00',
        }),
        withUser(buildUser({ FriendlyName: 'RiskManager1' })),
        withDocument(
          buildDocumentFile({ Title: 'Terms and conditions', Version: '0.1' })
        )
      );
      const { container } = render(<TestHarness records={[attestation]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Name', 1)).toEqual('RiskManager1');
      expect(getCellText(container, 'Document', 1)).toEqual(
        'Terms and conditions'
      );
      expect(getCellText(container, 'Version', 1)).toEqual('0.1');
      expect(getCellText(container, 'Attestation status', 1)).toEqual(
        'Attested'
      );
      expect(getCellText(container, 'Cycle start date', 1)).toEqual(
        '9 Sept 2025'
      );
      expect(getCellText(container, 'User due date', 1)).toEqual(
        '10 Sept 2025'
      );
      expect(getCellText(container, 'User attested at', 1)).toEqual(
        '9 Sept 2025'
      );
    });

    it.each([
      { expectedStatus: 'Expired', features: [], viewStatus: 'pending' },
      {
        expectedStatus: 'Overdue',
        features: ['attestation_improvements'],
        viewStatus: 'overdue',
      },
    ])(
      'should display the correct information for an attestation which has not been attested and is past the expiry date',
      async ({ expectedStatus, features, viewStatus }) => {
        const mockUseIsFeatureFlagEnabled = vi.mocked(useIsFeatureFlagEnabled);

        mockUseIsFeatureFlagEnabled.mockImplementation((feature) => {
          return features?.includes(feature) ?? false;
        });
        const attestation = buildAttestation(
          withInitialValues({
            Active: true,
            AttestationStatus: 'pending',
            attestationRecordStatus: {
              Status: viewStatus,
            },
            CreatedAtTimestamp: '2025-09-09T15:04:39.865338+00:00',
            ExpiresAt: '2000-09-10T14:56:05.246+00:00',
          }),
          withUser(buildUser({ FriendlyName: 'RiskManager1' })),
          withDocument(
            buildDocumentFile({ Title: 'Terms and conditions', Version: '0.1' })
          )
        );

        const { container } = render(<TestHarness records={[attestation]} />, {
          wrapper: getWrapper(mocks, ...providers),
        });
        await waitForTableHeaders(container);
        expect(getCellText(container, 'Name', 1)).toEqual('RiskManager1');
        expect(getCellText(container, 'Document', 1)).toEqual(
          'Terms and conditions'
        );
        expect(getCellText(container, 'Version', 1)).toEqual('0.1');
        expect(getCellText(container, 'Attestation status', 1)).toEqual(
          expectedStatus
        );
        expect(getCellText(container, 'Cycle start date', 1)).toEqual(
          '9 Sept 2025'
        );
        expect(getCellText(container, 'User due date', 1)).toEqual(
          '10 Sept 2000'
        );
        expect(getCellText(container, 'User attested at', 1)).toEqual('-');
      }
    );
  });
});
