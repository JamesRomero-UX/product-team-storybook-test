import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
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
  buildAttestationCycle,
  buildDocumentFile,
  withDocument,
  withInitialValues,
  withRecords,
} from 'test/attestation-cycle-builder';
import { vi } from 'vitest';

import { defaultMocks } from '../../../testing/mock-data';
import { useGetRegisterTableProps } from './config';

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
    const TestHarness: FC<{ records: AttestationCyclePartsFragment[] }> = ({
      records,
    }) => {
      const tableProps = useGetRegisterTableProps(records);

      return <Table {...tableProps} />;
    };

    const attestation = buildAttestationCycle(
      withInitialValues({
        Status: 'concluded',
        CreatedAtTimestamp: '2025-09-09T14:56:05.237187+00:00',
      }),
      withDocument(
        buildDocumentFile({ Title: 'Terms and conditions', Version: '0.1' })
      ),
      withRecords([
        {
          AttestationStatus: 'attested',
          attestationRecordStatus: { Status: 'attested' },
          UserId: 'user-1',
        },
      ])
    );

    it('should display 5 columns by default', async () => {
      const { container } = render(<TestHarness records={[attestation]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(5);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Document',
        'Version',
        'Attestation progress',
        'Cycle start date',
        'Cycle status',
      ]);
    });

    it('should display the correct information for an attestation', async () => {
      const { container } = render(<TestHarness records={[attestation]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Document', 1)).toEqual(
        'Terms and conditions'
      );
      expect(getCellText(container, 'Version', 1)).toEqual('0.1');

      expect(getCellText(container, 'Cycle start date', 1)).toEqual(
        '9 Sept 2025'
      );
      expect(getCellText(container, 'Attestation progress', 1)).toEqual('100%');
      expect(getCellText(container, 'Cycle status', 1)).toEqual('Concluded');
    });
  });
});
