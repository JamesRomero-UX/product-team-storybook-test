import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useGetCollectionTableProps } from './config';
import type { ImpactRatingTableFields } from './types';

describe('impact ratings tab config', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const TestHarness: FC<{ records: ImpactRatingTableFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(
      records,
      undefined,
      vi.fn(),
      vi.fn()
    );

    return <Table {...tableProps} />;
  };

  describe('useGetCollectionTableProps', () => {
    const defaultMocks = [
      mockedUsersResponse(),
      mockedDepartmentsResponse,
      mockedRoleAccessResponse(),
      mockedTagsResponse,
      mockedUserGroupResponse(),
      mockedGetAggregationResponse(),
      mockedGetOrganisation(),
      mockedGetOrganisationModuleResponse(),
      mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating]),
    ];
    const providers: Providers[] = [
      'permission',
      'graphql',
      'router',
      'features',
      'trpc',
    ];

    it('should display 7 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(defaultMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Rated item',
        'Type',
        'Rating date',
        'Likelihood',
        'Status',
        'Rating score',
        'Performance score',
      ]);
    });

    it('should have the option to display 7 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(defaultMocks, ...providers),
      });
      await waitForTableHeaders(container);
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
      expect(options?.length).toEqual(7);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Rated item',
        'Type',
        'Rating date',
        'Likelihood',
        'Status',
        'Rating score',
        'Performance score',
      ]);
    });
  });
});
