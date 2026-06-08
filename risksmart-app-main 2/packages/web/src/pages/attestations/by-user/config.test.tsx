import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
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
import {
  buildAttestation,
  buildUser,
  withInitialValues,
  withUser,
} from 'test/attestation-builder';
import { vi } from 'vitest';

import { defaultMocks } from '../../../testing/mock-data';
import type { AttestationFlatField } from '../types';
import { useGetRegisterTableProps } from './config';

describe('Attestation config', () => {
  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

  beforeEach(() => {
    window.localStorage.clear();
    vi.setSystemTime(mockDate);
  });

  const defaultAttestation = buildAttestation();

  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
    'i18n',
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

    it('should display 3 columns by default', async () => {
      const { container } = render(
        <TestHarness records={[defaultAttestation]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(3);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual(['User', 'Email', 'Attestations completed']);
    });

    it('should have the option to display 3 fields', async () => {
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
      expect(options?.length).toEqual(3);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'User',
        'Email',
        'Attestations completed',
      ]);
    });

    it('should display correct column data', async () => {
      const testUser = buildUser({
        FriendlyName: 'User 1 name',
        Email: 'test@testemail.com',
      });

      const { container } = render(
        <TestHarness
          records={[
            buildAttestation(
              withInitialValues({
                Active: true,
                AttestationStatus: Attestation_Record_Status_Enum.Pending,
                AttestedAt: '2023-01-17T18:41:58.03502+00:00',
                CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
                ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
              }),
              withUser(testUser)
            ),
            buildAttestation(
              withInitialValues({
                Active: true,
                AttestationStatus: Attestation_Record_Status_Enum.Attested,
                AttestedAt: '2023-01-17T18:41:58.03502+00:00',
                CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
                ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
              }),
              withUser(testUser)
            ),
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'User', 1)).toEqual('User 1 name');
      expect(getCellText(container, 'Email', 1)).toEqual('test@testemail.com');
      expect(getCellText(container, 'Attestations completed', 1)).toEqual(
        '50%'
      );
    });
  });

  it('should support export in correct format', async () => {
    const { result } = renderHook(
      () =>
        useGetRegisterTableProps([
          buildAttestation(
            withInitialValues({
              CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
              Active: true,
              AttestationStatus: Attestation_Record_Status_Enum.Pending,
              ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
            }),
            withUser(
              buildUser({
                FriendlyName: 'User 1 name',
                Email: 'test@testemail.com',
              })
            )
          ),
        ]),
      {
        wrapper: getWrapper(mocks, ...providers),
      }
    );
    await waitFor(() => expect(result.current.exportToCsvString).toBeDefined());
    const csv = result.current.exportToCsvString();
    expect(csv).toEqual(
      '"User","Email","Attestations completed"\r\n' +
        '"User 1 name","test@testemail.com","0%"'
    );
  });
});
