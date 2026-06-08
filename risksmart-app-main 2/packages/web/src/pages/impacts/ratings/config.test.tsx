import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
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

import { useGetCollectionTableProps } from './config';
import type { ImpactRating } from './types';

describe('impact ratings config', () => {
  const defaultImpact: ImpactRating = {
    CreatedAtTimestamp: '2024-08-13T08:26:53.118167+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    Id: '21ff4e66-1308-4595-9ef9-730bd2632f2e',
    ModifiedAtTimestamp: '2024-08-13T08:26:53.118167+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    SequentialId: 8,
    Rating: 3,
    RatedItemId: 'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    ImpactId: 'aaa8eb87-b197-40bd-8b88-778965b52865',
    TestDate: '2024-08-27T00:00:00+00:00',
    CompletedBy: 'auth0|66a9ff41a830680647dc6553',
    Likelihood: 3,
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    completedBy: {
      FriendlyName: 'InternalAudit1',
      __typename: 'user',
    },
    impact: {
      Id: 'aaa8eb87-b197-40bd-8b88-778965b52865',
      Name: 'Financial',
      __typename: 'impact',
    },
    ratedItem: {
      risk: {
        Title: 'Security Breach',
        __typename: 'risk',
      },
      ObjectType: 'risk',
      __typename: 'node',
    },
  };

  const TestHarness: FC<{ records: ImpactRating[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records, undefined, vi.fn());

    return <Table {...tableProps} />;
  };

  const defaultMocks = [
    mockedGetOrganisation(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedRoleAccessResponse(),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('impactRatingRegister'),
    mockedGetOrganisationModuleResponse(),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Impact,
      Parent_Type_Enum.ImpactRating,
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
    it('should display 7 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(defaultMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Name (impact)',
        'Rated item',
        'Rating date',
        'Status',
        'Rating score',
        'Performance score',
        'Completed by',
      ]);
    });

    it('should have the option to display 14 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(defaultMocks, ...providers),
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
      expect(options?.length).toEqual(14);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Name (impact)',
        'Rated item',
        'Rating date',
        'Status',
        'Rating score',
        'Performance score',
        'Created on',
        'Guid',
        'Updated on',
        'Created by ID',
        'Created by',
        'Completed by',
        'Likelihood',
      ]);
    });
  });

  it('should display likelihood', async () => {
    const { container } = render(<TestHarness records={[defaultImpact]} />, {
      wrapper: getWrapper(defaultMocks, ...providers),
    });
    await waitForTableHeaders(container);

    toggleColumnVisibilityFromTable(container, 'Likelihood');

    expect(getCellText(container, 'Likelihood', 1)).toEqual('Likely');
  });
});
