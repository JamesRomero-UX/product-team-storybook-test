import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ControlTestFields } from './types';

describe('control tests config', () => {
  const defaultAssessment: ControlTestFields = {
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    Title: 'Business integrity check',
    Description: 'Test description',
    OverallEffectiveness: 123,
    ParentControlId: '234',
    Submitter: 'Submitted 1',
    TestDate: '2024-02-22T08:46:26.618161+00:00',
    TestType: 'test type',
    SequentialId: 1,
    files_aggregate: {
      aggregate: {
        count: 0,
      },
    },
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  const TestHarness: FC<{ records: ControlTestFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records, vi.fn());

    return <Table {...tableProps} />;
  };

  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.TestResult,
      Parent_Type_Enum.Control,
    ]),
    mockedGetUserTablePreferences('controlTestRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];
  describe('useGetCollectionTableProps', () => {
    const id = 'ID';
    const guid = 'Guid';

    it('should display 7 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'ID',
        'Title',
        'Control',
        'Test type',
        'Date',
        'Overall effectiveness',
        'Submitted by',
      ]);
    });

    it('should have the option to display 20 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
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
      expect(options?.length).toEqual(20);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Title',
        'Control',
        'Test type',
        'Date',
        'Design effectiveness',
        'Performance effectiveness',
        'Overall effectiveness',
        'Submitted by',
        'Created on',
        'Description',
        'Guid',
        'Control ID',
        'Control guid',
        'Updated on',
        'Created by ID',
        'Created by',
        'Associated files',
        'Tags (control)',
        'Departments (control)',
      ]);
    });

    it('should display Guid column', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAssessment }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, guid);

      expect(getCellText(container, guid, 1)).toEqual(defaultAssessment.Id);
    });

    it('should display ID column', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAssessment }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, id, 1)).toEqual('TR-1');
    });

    it('should support export in correct format', async () => {
      const { result } = renderHook(
        () => useGetCollectionTableProps([{ ...defaultAssessment }], vi.fn()),
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(result.current.exportToCsvString).toBeDefined()
      );
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"ID","Title","Control","Test type","Date","Overall effectiveness","Submitted by"\r\n' +
          '"TR-1","Business integrity check",,"-","22/02/2024 08:46","",'
      );
    });
  });
});
