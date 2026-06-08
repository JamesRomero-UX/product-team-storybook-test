import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Acceptance_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ActionFields } from './types';

describe('action config', () => {
  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Action]),
    mockedGetUserTablePreferences('actionRegister'),
  ];

  const defaultAction: ActionFields = {
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    SequentialId: 1,
    Title: 'Action 1',
    Status: Acceptance_Status_Enum.Open,
    DateDue: '',
    DateRaised: '',
    Description: 'Description value',
    Priority: 0,
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    tags: [],
    departments: [],
    parents: [
      {
        parent: {
          ObjectType: Parent_Type_Enum.Risk,
          Id: '22fe4307-5c36-4c22-b935-46bda23dae4f',
        },
        risk: {
          Title: 'Parent risk title',
        },
      },
    ],
    actionUpdateSummary: {
      Count: 10,
      LatestDescription: 'Update description',
      LatestTitle: 'Update title',
      LatestCreatedAtTimestamp: '2023-09-15',
    },
  };

  const TestHarness: FC<{ records: ActionFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
  ];

  describe('useGetCollectionTableProps', () => {
    const idHeader = 'ID';
    const guidHeader = 'Guid';
    const updateCountHeader = 'Update count';

    const latestUpdateCreatedOn = 'Latest update created on';
    const latestUpdateDescription = 'Latest update description';
    const description = 'Description';
    const latestUpdateTitle = 'Latest update title';

    it('should display 8 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(9);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Action title',
        'Owners',
        'Associations',
        'Raised',
        'Due',
        'Closed date',
        'Status',
        'Priority',
        'Tags',
      ]);
    });

    it('should have the option to display 23 fields', async () => {
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
      expect(options?.length).toEqual(23);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Action title',
        'Owners',
        'Contributors',
        'Associations',
        'Raised',
        'Due',
        'Closed date',
        'Status',
        'Priority',
        'Tags',
        'Departments',
        'Guid',
        'Updated on',
        'Updated by ID',
        'Modified by',
        'Created on',
        'Raised by',

        updateCountHeader,
        latestUpdateCreatedOn,
        latestUpdateDescription,
        latestUpdateTitle,
        description,
      ]);
    });

    it.each([
      { column: idHeader, value: 'A-1', shouldToggle: true },
      { column: guidHeader, value: defaultAction.Id, shouldToggle: true },
      {
        column: updateCountHeader,
        value: '10',
        shouldToggle: true,
      },
      {
        column: latestUpdateCreatedOn,
        value: '15 Sept 2023',
        shouldToggle: true,
      },
      {
        column: latestUpdateTitle,
        value: 'Update title',
        shouldToggle: true,
      },
      {
        column: latestUpdateDescription,
        value: 'Update description',
        shouldToggle: true,
      },
      {
        column: description,
        value: 'Description value',
        shouldToggle: true,
      },
      {
        column: 'Associations',
        value: 'Parent risk title (risk)',
        shouldToggle: false,
      },
    ])(
      'should display the $column when toggled on in preferences',
      async ({ column, value, shouldToggle }) => {
        const { container } = render(
          <TestHarness records={[{ ...defaultAction }]} />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        if (shouldToggle) {
          toggleColumnVisibilityFromTable(container, column);
        }

        expect(getCellText(container, column, 1)).toEqual(value);
      }
    );

    it('should display "" there are no parents', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAction, parents: [] }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);

      expect(getCellText(container, 'Associations', 1)).toEqual('');
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getEmptyCollectionSlotText(container, 0)).toEqual('No Actions');
      expect(getEmptyCollectionSlotText(container, 1)).toEqual(
        'No actions to display.'
      );
    });
  });
});
